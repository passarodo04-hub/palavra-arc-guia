import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { extractRefs, type MentorMessage, type MentorRef } from "@/lib/mentor-shared";
import { MENTOR_SYSTEM_PROMPT, MENTOR_DAILY_LIMIT, mentorGuard } from "@/lib/mentor.server";

export type MentorAnswer =
  | { ok: true; content: string; refs: MentorRef[]; conversationId: string | null }
  | { ok: false; reason: string };

/** Answers a question. Works for guests (nothing persisted) and signed-in users
 *  (conversation + messages saved under their own user_id, RLS enforced). */
export const askMentor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        question: z.string().min(2).max(2000),
        conversationId: z.string().uuid().nullable().default(null),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) }))
          .max(20)
          .default([]),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<MentorAnswer> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, reason: "Serviço de IA indisponível no momento." };

    const blocked = mentorGuard(data.question);
    if (blocked) return { ok: false, reason: blocked };

    // Signed-in users get cloud history + a daily usage cap; guests are stateless.
    let supabase: any = null;
    let userId: string | null = null;
    try {
      const { getRequestHeader } = await import("@tanstack/react-start/server");
      const auth = getRequestHeader("authorization");
      if (auth?.startsWith("Bearer ")) {
        const { createClient } = await import("@supabase/supabase-js");
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
        if (url && key) {
          const client = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { headers: { Authorization: auth } },
          });
          const { data: userData } = await client.auth.getUser();
          if (userData?.user) {
            supabase = client;
            userId = userData.user.id;
          }
        }
      }
    } catch {
      supabase = null;
      userId = null;
    }

    if (supabase && userId) {
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
    }

    let content = "";
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [
            { role: "system", content: MENTOR_SYSTEM_PROMPT },
            ...data.history,
            { role: "user", content: data.question },
          ],
        }),
      });
      if (res.status === 429) return { ok: false, reason: "Muitas solicitações agora. Tente novamente em instantes." };
      if (res.status === 402) return { ok: false, reason: "Créditos de IA esgotados." };
      if (!res.ok) return { ok: false, reason: "Não foi possível obter uma resposta agora." };
      const json = await res.json();
      content = json?.choices?.[0]?.message?.content ?? "";
    } catch (e) {
      console.error(e);
      return { ok: false, reason: "Erro inesperado ao consultar o Mentor." };
    }

    if (!content.trim()) {
      return { ok: false, reason: "Não recebi uma resposta válida. Tente reformular a pergunta." };
    }

    const refs = extractRefs(content);
    let conversationId = data.conversationId;

    if (supabase && userId) {
      try {
        if (!conversationId) {
          const title = data.question.slice(0, 60);
          const { data: conv, error } = await supabase
            .from("mentor_conversations")
            .insert({ user_id: userId, title })
            .select("id")
            .single();
          if (error) throw new Error(error.message);
          conversationId = conv.id as string;
        } else {
          await supabase
            .from("mentor_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId)
            .eq("user_id", userId);
        }
        const { error: msgError } = await supabase.from("mentor_messages").insert([
          { conversation_id: conversationId, user_id: userId, role: "user", content: data.question, refs: [] },
          { conversation_id: conversationId, user_id: userId, role: "assistant", content, refs },
        ]);
        if (msgError) console.error("[mentor] save failed", msgError.message);
      } catch (e) {
        console.error("[mentor] persistence failed", e);
      }
    }

    return { ok: true, content, refs, conversationId };
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
