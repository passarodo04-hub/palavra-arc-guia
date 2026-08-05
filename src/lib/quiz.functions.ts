import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  POINTS_PER_CORRECT,
  QUESTIONS_PER_QUIZ,
  type ClientQuestion,
  type GradedAnswer,
  type QuizResult,
} from "@/lib/quiz-shared";

/* Grading happens here, never in the browser: the client only ever receives
 * the question text and the options. */

const audienceSchema = z.enum(["adultos", "kids"]);
const difficultySchema = z.enum(["facil", "medio", "dificil"]);

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const getQuiz = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        audience: audienceSchema,
        category: z.string().min(1).max(48),
        difficulty: difficultySchema,
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ quizKey: string; questions: ClientQuestion[] }> => {
    const { questionsFor } = await import("@/lib/quiz-bank.server");
    const pool = questionsFor(data.audience, data.category, data.difficulty);
    const quizKey = `${data.audience}:${data.category}:${data.difficulty}`;

    // Daily renewal: the same seed all day, a new order (and new questions when
    // the pool is larger than one quiz) at every date change.
    const seed = hash(`${quizKey}:${todayKey()}`);
    const ordered = pool
      .map((q, i) => ({ q, k: hash(`${q.id}:${seed}:${i}`) }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.q)
      .slice(0, QUESTIONS_PER_QUIZ);

    return {
      quizKey,
      questions: ordered.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
        reference: q.reference,
        book: q.book,
        chapter: q.chapter,
      })),
    };
  });

const submissionSchema = z.object({
  audience: audienceSchema,
  category: z.string().min(1).max(48),
  difficulty: difficultySchema,
  answers: z
    .array(z.object({ id: z.string().min(1).max(64), chosen: z.number().int().min(-1).max(3) }))
    .min(1)
    .max(50),
});

async function grade(data: z.infer<typeof submissionSchema>) {
  const { questionById } = await import("@/lib/quiz-bank.server");
  const graded: GradedAnswer[] = [];
  for (const a of data.answers) {
    const q = questionById(a.id);
    if (!q || q.audience !== data.audience) continue;
    graded.push({
      id: q.id,
      question: q.question,
      options: q.options,
      chosen: a.chosen,
      answer: q.answer,
      isCorrect: a.chosen === q.answer,
      explanation: q.explanation,
      reference: q.reference,
      book: q.book,
      chapter: q.chapter,
    });
  }
  const total = graded.length;
  const correct = graded.filter((g) => g.isCorrect).length;
  return {
    graded,
    total,
    correct,
    percent: total ? Math.round((correct / total) * 100) : 0,
    points: correct * POINTS_PER_CORRECT,
  };
}

/** Guests (and the first grading pass) — corrects without persisting anything. */
export const gradeQuiz = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submissionSchema.parse(input))
  .handler(async ({ data }): Promise<QuizResult> => {
    const g = await grade(data);
    return {
      quizKey: `${data.audience}:${data.category}:${data.difficulty}`,
      total: g.total,
      correct: g.correct,
      percent: g.percent,
      points: g.points,
      xpEligible: false,
      xpAwarded: 0,
      answers: g.graded,
    };
  });

/** Signed-in users: grades, persists the attempt and claims the daily XP once. */
export const finishQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => submissionSchema.parse(input))
  .handler(async ({ data, context }): Promise<QuizResult> => {
    const { supabase, userId } = context;
    const g = await grade(data);
    const quizKey = `${data.audience}:${data.category}:${data.difficulty}`;
    const claimDate = todayKey();

    // One XP claim per quiz per day — replays stay fun but never farm XP.
    const claimXp = g.correct * 3;
    const { data: claim, error: claimError } = await supabase
      .from("quiz_daily_claims")
      .insert({ user_id: userId, claim_key: quizKey, claim_date: claimDate, xp: claimXp })
      .select("id")
      .maybeSingle();
    const xpEligible = !claimError && !!claim;

    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: userId,
        quiz_key: quizKey,
        audience: data.audience,
        category: data.category,
        difficulty: data.difficulty,
        total: g.total,
        correct: g.correct,
        points: g.points,
        percent: g.percent,
        xp_awarded: xpEligible ? claimXp : 0,
      })
      .select("id")
      .maybeSingle();
    if (attemptError) throw new Error(attemptError.message);

    if (g.graded.length > 0) {
      await supabase.from("quiz_answers").insert(
        g.graded.map((a) => ({
          user_id: userId,
          attempt_id: attempt?.id ?? null,
          question_id: a.id,
          audience: data.audience,
          category: data.category,
          difficulty: data.difficulty,
          chosen: a.chosen,
          correct_index: a.answer,
          is_correct: a.isCorrect,
        })),
      );
    }

    // Timeline entry in "Minha Caminhada" (one per quiz per day).
    await supabase.from("walk_events").upsert(
      {
        user_id: userId,
        category: "conhecimento",
        title: `Quiz concluído: ${g.correct} de ${g.total} acertos.`,
        detail: `${g.percent}% de aproveitamento`,
        icon: "🧠",
        dedupe_key: `quiz:${quizKey}:${claimDate}`,
      },
      { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
    );

    return {
      quizKey,
      total: g.total,
      correct: g.correct,
      percent: g.percent,
      points: g.points,
      xpEligible,
      xpAwarded: xpEligible ? claimXp : 0,
      answers: g.graded,
    };
  });

export type QuizStats = {
  attempts: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  bestPercent: number;
  xpTotal: number;
};

export const getQuizStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<QuizStats> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("total,correct,percent,xp_awarded")
      .eq("user_id", userId)
      .limit(1000);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const totalCorrect = rows.reduce((s, r) => s + (r.correct ?? 0), 0);
    const totalQuestions = rows.reduce((s, r) => s + (r.total ?? 0), 0);
    return {
      attempts: rows.length,
      totalCorrect,
      totalQuestions,
      accuracy: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      bestPercent: rows.reduce((m, r) => Math.max(m, r.percent ?? 0), 0),
      xpTotal: rows.reduce((s, r) => s + (r.xp_awarded ?? 0), 0),
    };
  });