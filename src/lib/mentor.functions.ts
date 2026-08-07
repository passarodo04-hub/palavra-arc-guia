import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { extractRefs, type MentorMessage, type MentorRef } from "@/lib/mentor-shared";

export type MentorAnswer =
  | { ok: true; content: string; refs: MentorRef[]; conversationId: string | null }
  | { ok: false; reason: string };

const AskSchema = z.object({
  question: z.string().min(2).max(2000),
  conversationId: z.string().uuid().nullable().default(null),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) }))
    .max(20)
    .default([]),
});

/** Guest path: answers without touching the database. Nothing is persisted. */
export const askMentorGuest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AskSchema.parse(input))
  .handler(async ({ data }): Promise<MentorAnswer> => {
    const { runMentor } = await import("@/lib/mentor.server");
    return runMentor(data.question, data.history);
  });

/** Signed-in path: same answer, plus per-user history and a daily usage cap. */
export const askMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskSchema.parse(input))
  .handler(async ({ data, context }): Promise<MentorAnswer> => {
    const { supabase, userId } = context;
    const { runMentor, MENTOR_DAILY_LIMIT } = await import("@/lib/mentor.server");

    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("mentor_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "user")
      .gte("created_at", since.toISOString());
    if ((count ?? 0) >= MENTOR_DAILY_LIMIT) {
      return {
        ok: false,
        reason: `Você atingiu o limite de ${MENTOR_DAILY_LIMIT} perguntas por dia. Volte amanhã para continuar estudando.`,
      };
    }

    const answer = await runMentor(data.question, data.history);
    if (!answer.ok) return answer;

    let conversationId = data.conversationId;
    try {
      if (!conversationId) {
        const { data: conv, error } = await supabase
          .from("mentor_conversations")
          .insert({ user_id: userId, title: data.question.slice(0, 60) })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        conversationId = conv.id;
      } else {
        const { error } = await supabase
          .from("mentor_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId)
          .eq("user_id", userId);
        if (error) throw new Error(error.message);
      }
      const { error: msgError } = await supabase.from("mentor_messages").insert([
        { conversation_id: conversationId, user_id: userId, role: "user", content: data.question, refs: [] },
        {
          conversation_id: conversationId,
          user_id: userId,
          role: "assistant",
          content: answer.content,
          refs: answer.refs as unknown as never,
        },
      ]);
      if (msgError) throw new Error(msgError.message);
    } catch (e) {
      // The answer is still worth showing; only the history failed.
      console.error("[mentor] persistence failed", e);
    }

    return { ...answer, conversationId };
  });

export const listMentorConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("mentor_conversations")
      .select("id,title,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []).map((c) => ({ id: c.id, title: c.title, updatedAt: c.updated_at }));
  });

export const getMentorConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }): Promise<MentorMessage[]> => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("mentor_messages")
      .select("id,role,content,refs,created_at")
      .eq("user_id", userId)
      .eq("conversation_id", data.id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant",
      content: r.content,
      refs: Array.isArray(r.refs) ? (r.refs as unknown as MentorRef[]) : [],
      createdAt: r.created_at,
    }));
  });

export const deleteMentorConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("mentor_conversations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
