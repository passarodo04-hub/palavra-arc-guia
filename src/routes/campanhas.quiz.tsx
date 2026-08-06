import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Brain, CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles, BookOpen, History, Target, Zap } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/campaigns/StatCard";
import { useAuth } from "@/lib/auth-context";
import { getQuiz, gradeQuiz, finishQuiz, getQuizStats, getQuizHistory } from "@/lib/quiz.functions";
import {
  AUDIENCES,
  DIFFICULTIES,
  categoriesFor,
  categoryMeta,
  difficultyEmoji,
  difficultyLabel,
  quizAchievements,
  quizOfTheDay,
  POINTS_PER_CORRECT,
  type ClientQuestion,
  type QuizAudience,
  type QuizDifficulty,
  type QuizResult,
} from "@/lib/quiz-shared";

export const Route = createFileRoute("/campanhas/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz Bíblico — Jornadas — Palavra+" },
      { name: "description", content: "Quiz bíblico diário para adultos e crianças: categorias, níveis de dificuldade, correção com explicações e XP." },
      { property: "og:title", content: "Quiz Bíblico — Palavra+" },
      { property: "og:description", content: "Perguntas renovadas todo dia, correção no servidor e XP na sua caminhada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuizPage,
});

type Phase = "setup" | "playing" | "result";

function QuizPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const loadQuiz = useServerFn(getQuiz);
  const grade = useServerFn(gradeQuiz);
  const finish = useServerFn(finishQuiz);

  const [audience, setAudience] = useState<QuizAudience>("adultos");
  const [category, setCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("facil");
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ id: string; chosen: number }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const daily = quizOfTheDay(audience);
  const cats = categoriesFor(audience);

  const statsQuery = useQuery({
    queryKey: ["quiz-stats", user?.id],
    queryFn: () => getQuizStats(),
    enabled: !!user,
  });
  const historyQuery = useQuery({
    queryKey: ["quiz-history", user?.id],
    queryFn: () => getQuizHistory(),
    enabled: !!user,
  });

  const startMutation = useMutation({
    mutationFn: (v: { audience: QuizAudience; category: string; difficulty: QuizDifficulty }) => loadQuiz({ data: v }),
    onSuccess: (data) => {
      setQuestions(data.questions);
      setIdx(0);
      setAnswers([]);
      setSelected(null);
      setResult(null);
      setPhase(data.questions.length ? "playing" : "setup");
    },
  });

  const finishMutation = useMutation({
    mutationFn: (payload: { audience: QuizAudience; category: string; difficulty: QuizDifficulty; answers: { id: string; chosen: number }[] }) =>
      user ? finish({ data: payload }) : grade({ data: payload }),
    onSuccess: (r) => {
      setResult(r);
      setPhase("result");
      if (user) {
        qc.invalidateQueries({ queryKey: ["quiz-stats", user.id] });
        qc.invalidateQueries({ queryKey: ["quiz-history", user.id] });
        qc.invalidateQueries({ queryKey: ["walk"] });
      }
    },
  });

  function start(cat: string, diff: QuizDifficulty) {
    setCategory(cat);
    setDifficulty(diff);
    startMutation.mutate({ audience, category: cat, difficulty: diff });
  }

  function choose(i: number) {
    if (selected !== null || !questions[idx]) return;
    setSelected(i);
    setAnswers((prev) => [...prev, { id: questions[idx]!.id, chosen: i }]);
  }

  function next() {
    const isLast = idx >= questions.length - 1;
    setSelected(null);
    if (!isLast) {
      setIdx((n) => n + 1);
      return;
    }
    finishMutation.mutate({ audience, category: category!, difficulty, answers });
  }

  const stats = statsQuery.data;
  const achievements = quizAchievements(
    stats ?? { attempts: 0, totalCorrect: 0, accuracy: 0, bestPercent: 0 },
  );
  const current = questions[idx];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Brain, label: "Jornada" }}
        title="Quiz Bíblico"
        description="Perguntas renovadas todos os dias, corrigidas no servidor, com explicação e referência bíblica."
        backTo="/campanhas"
        backLabel="Jornadas"
      />

      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {phase === "setup" && (
          <>
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Para quem é o quiz</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {AUDIENCES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setAudience(a.id);
                      setCategory(null);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      audience === a.id ? "border-gold bg-gold/10" : "border-border bg-secondary/40 hover:border-gold/40"
                    }`}
                  >
                    <div className="text-2xl">{a.emoji}</div>
                    <div className="mt-1 font-serif text-lg text-foreground">{a.label}</div>
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gold/40 bg-gold/5 p-6 shadow-elegant animate-fade-up">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
                <Sparkles className="size-3.5" /> Quiz do Dia
              </div>
              <h2 className="mt-2 font-serif text-xl text-foreground">
                {daily.category.emoji} {daily.category.label}
              </h2>
              <p className="text-sm text-muted-foreground">
                {difficultyEmoji(daily.difficulty)} {difficultyLabel(daily.difficulty)} · renovado a cada dia
              </p>
              <Button
                className="mt-4 rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-10 px-5"
                disabled={startMutation.isPending}
                onClick={() => start(daily.category.id, daily.difficulty)}
              >
                {startMutation.isPending ? "Preparando…" : "Jogar o Quiz do Dia"}
              </Button>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Dificuldade</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      difficulty === d.id ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    {d.emoji} {d.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold">Categorias</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {cats.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={startMutation.isPending}
                    onClick={() => start(c.id, difficulty)}
                    className="rounded-2xl border border-border bg-secondary/40 p-4 text-left transition-colors hover:border-gold/40 disabled:opacity-60"
                  >
                    <div className="text-xl">{c.emoji}</div>
                    <div className="mt-1 font-serif text-base text-foreground">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.description}</div>
                  </button>
                ))}
              </div>
              {startMutation.isError && (
                <p className="mt-4 text-sm text-destructive">Não foi possível carregar o quiz. Tente novamente.</p>
              )}
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up">
              <StatCard icon={Target} label="Quizzes" value={String(stats?.attempts ?? 0)} accent />
              <StatCard icon={CheckCircle2} label="Acertos" value={String(stats?.totalCorrect ?? 0)} />
              <StatCard icon={Trophy} label="Precisão" value={`${stats?.accuracy ?? 0}%`} />
              <StatCard icon={Zap} label="XP do Quiz" value={String(stats?.xpTotal ?? 0)} />
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Conquistas do Quiz</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-2xl border p-4 ${a.unlocked ? "border-gold/40 bg-gold/5" : "border-border bg-secondary/40 opacity-70"}`}
                  >
                    <div className="text-xl">{a.emoji}</div>
                    <div className="mt-1 font-serif text-base text-foreground">{a.label}</div>
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-gold">
                      {a.unlocked ? "Conquistado" : "Bloqueado"}
                    </div>
                  </div>
                ))}
              </div>
              {!user && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Entre na sua conta para salvar histórico, conquistas e ganhar XP na Minha Caminhada.
                </p>
              )}
            </section>

            {user && (historyQuery.data?.length ?? 0) > 0 && (
              <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
                  <History className="size-3.5" /> Histórico
                </div>
                <ul className="mt-3 space-y-2">
                  {historyQuery.data!.map((h) => (
                    <li key={h.id} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm">
                      <div>
                        <div className="text-foreground">
                          {categoryMeta(h.category)?.emoji ?? "📖"} {categoryMeta(h.category)?.label ?? h.category}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {difficultyLabel(h.difficulty as QuizDifficulty)} ·{" "}
                          {new Date(h.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-base text-foreground">
                          {h.correct}/{h.total}
                        </div>
                        <div className="text-xs text-muted-foreground">+{h.xpAwarded} XP</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {phase === "playing" && current && (
          <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-gold">
              <span>
                Pergunta {idx + 1} de {questions.length}
              </span>
              <span>
                {difficultyEmoji(difficulty)} {difficultyLabel(difficulty)}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${((idx + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>

            <h2 className="mt-4 font-serif text-xl text-card-foreground">{current.question}</h2>
            <div className="mt-4 grid gap-2">
              {current.options.map((opt, i) => {
                const state =
                  selected === null
                    ? "border-border bg-secondary/40 hover:border-gold/40"
                    : i === selected
                      ? "border-gold bg-gold/10"
                      : "border-border bg-secondary/40 opacity-60";
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={selected !== null}
                    onClick={() => choose(i)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${state}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">A correção é feita ao final, no servidor.</p>
                <Button
                  onClick={next}
                  disabled={finishMutation.isPending}
                  className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-10 px-5"
                >
                  {idx >= questions.length - 1 ? (finishMutation.isPending ? "Corrigindo…" : "Finalizar quiz") : "Próxima pergunta"}
                </Button>
              </div>
            )}
            {finishMutation.isError && (
              <p className="mt-4 text-sm text-destructive">Não foi possível corrigir o quiz. Tente novamente.</p>
            )}
          </section>
        )}

        {phase === "result" && result && (
          <>
            <section className="rounded-3xl border border-gold/40 bg-gold/5 p-6 shadow-elegant animate-fade-up text-center">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Resultado</div>
              <div className="mt-2 font-serif text-4xl text-foreground">{result.percent}%</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.correct} de {result.total} acertos · {result.points} pontos ({POINTS_PER_CORRECT} por acerto)
              </p>
              <p className="mt-2 text-sm text-foreground">
                {result.xpAwarded > 0
                  ? `+${result.xpAwarded} XP adicionados à sua caminhada.`
                  : user
                    ? "O XP deste quiz já foi recebido hoje — jogue à vontade, o aprendizado continua."
                    : "Entre na sua conta para ganhar XP e salvar o histórico."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button
                  className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-10 px-5"
                  onClick={() => start(category!, difficulty)}
                >
                  <RotateCcw className="size-4" /> Jogar de novo
                </Button>
                <Button variant="ghost" className="rounded-full h-10 px-5" onClick={() => setPhase("setup")}>
                  Escolher outra categoria
                </Button>
              </div>
            </section>

            <section className="space-y-3 animate-fade-up">
              {result.answers.map((a, i) => (
                <div key={a.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-base text-card-foreground">
                      {i + 1}. {a.question}
                    </h3>
                    {a.isCorrect ? (
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="size-5 shrink-0 text-rose-600" />
                    )}
                  </div>
                  <div className="mt-3 grid gap-2">
                    {a.options.map((opt, oi) => {
                      const state =
                        oi === a.answer
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : oi === a.chosen
                            ? "border-rose-500/50 bg-rose-500/10"
                            : "border-border bg-secondary/40 opacity-70";
                      return (
                        <div key={oi} className={`rounded-2xl border px-4 py-2 text-sm ${state}`}>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{a.explanation}</p>
                  {a.reference && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
                      <BookOpen className="size-3.5" /> {a.reference}
                    </div>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
