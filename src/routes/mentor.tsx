import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Bot, Send, Info, Loader2, Plus, History, Trash2, BookOpen, ShieldAlert } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/lib/auth-context";
import { MENTOR_DISCLAIMER, MENTOR_SUGGESTIONS, type MentorMessage } from "@/lib/mentor-shared";
import {
  askMentor,
  askMentorGuest,
  deleteMentorConversation,
  getMentorConversation,
  listMentorConversations,
} from "@/lib/mentor.functions";

export const Route = createFileRoute("/mentor")({
  component: MentorPage,
  head: () => ({
    meta: [
      { title: "Mentor Cristão — apoio ao estudo bíblico | Palavra+" },
      {
        name: "description",
        content:
          "Tire dúvidas bíblicas, entenda capítulos e prepare estudos com o Mentor Cristão do Palavra+, um recurso de apoio ao estudo — nunca a voz de Deus.",
      },
      { property: "og:title", content: "Mentor Cristão — Palavra+" },
      {
        property: "og:description",
        content: "Um recurso de apoio para estudar a Bíblia com contexto, referências e reflexão cristã.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function localId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function MentorPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const ask = useServerFn(askMentor);
  const askGuest = useServerFn(askMentorGuest);
  const loadConversation = useServerFn(getMentorConversation);
  const removeConversation = useServerFn(deleteMentorConversation);

  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const conversations = useQuery({
    queryKey: ["mentor-conversations", user?.id ?? "anon"],
    queryFn: () => listMentorConversations(),
    enabled: !!user,
    staleTime: 30_000,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  const send = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || sending) return;
      setInput("");
      setSending(true);
      const userMsg: MentorMessage = {
        id: localId(),
        role: "user",
        content: text,
        refs: [],
        createdAt: new Date().toISOString(),
      };
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, userMsg]);

      try {
        const payload = { data: { question: text, conversationId, history } };
        const res = user ? await ask(payload) : await askGuest(payload);
        if (!res.ok) {
          toast.error(res.reason);
          setMessages((prev) => [
            ...prev,
            {
              id: localId(),
              role: "assistant",
              content: res.reason,
              refs: [],
              createdAt: new Date().toISOString(),
            },
          ]);
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: localId(),
            role: "assistant",
            content: res.content,
            refs: res.refs,
            createdAt: new Date().toISOString(),
          },
        ]);
        if (res.conversationId && res.conversationId !== conversationId) {
          setConversationId(res.conversationId);
        }
        if (user) void qc.invalidateQueries({ queryKey: ["mentor-conversations", user.id] });
      } catch {
        toast.error("Não foi possível falar com o Mentor agora.");
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [ask, askGuest, conversationId, messages, qc, sending, user],
  );

  const openConversation = async (id: string) => {
    try {
      const msgs = await loadConversation({ data: { id } });
      setMessages(msgs);
      setConversationId(id);
      setShowHistory(false);
    } catch {
      toast.error("Não foi possível abrir esta conversa.");
    }
  };

  const startNew = () => {
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHero
        eyebrow={{ icon: Bot, label: "Mentor Cristão" }}
        title="Como posso ajudar você hoje?"
        description="Um recurso de apoio ao seu estudo e à sua reflexão cristã, com base na Bíblia."
        right={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startNew}
              aria-label="Nova conversa"
              className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-hero-foreground backdrop-blur hover:bg-white/20"
            >
              <Plus className="size-4" />
            </button>
            {user && (
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                aria-label="Conversas recentes"
                aria-expanded={showHistory}
                className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-hero-foreground backdrop-blur hover:bg-white/20"
              >
                <History className="size-4" />
              </button>
            )}
          </div>
        }
      />

      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div
          role="note"
          className="flex gap-3 rounded-2xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
          <p>{MENTOR_DISCLAIMER}</p>
        </div>

        {showHistory && user && (
          <section aria-label="Conversas recentes" className="mt-4 rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Conversas recentes</h2>
            {conversations.data && conversations.data.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {conversations.data.map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void openConversation(c.id)}
                      className="min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      {c.title}
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir conversa ${c.title}`}
                      onClick={async () => {
                        await removeConversation({ data: { id: c.id } });
                        if (conversationId === c.id) startNew();
                        void qc.invalidateQueries({ queryKey: ["mentor-conversations", user.id] });
                      }}
                      className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma conversa salva ainda.</p>
            )}
          </section>
        )}

        {!user && (
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              Você está como visitante: as conversas não são salvas.{" "}
              <Link to="/login" className="font-medium text-gold underline-offset-2 hover:underline">
                Entre na sua conta
              </Link>{" "}
              para guardar seu histórico.
            </span>
          </p>
        )}

        {messages.length === 0 && (
          <section aria-label="Sugestões" className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">Por onde começar</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {MENTOR_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => void send(s.prompt)}
                  className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-gold/60 hover:bg-muted"
                >
                  <span aria-hidden className="text-lg">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section aria-label="Conversa" aria-live="polite" className="mt-6 space-y-5">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {m.content}
                </p>
              </div>
            ) : (
              <article key={m.id} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Bot className="size-3.5 text-gold" aria-hidden />
                  Mentor Cristão
                </div>
                <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-gold dark:prose-invert">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.refs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.refs.map((r) => (
                      <Link
                        key={`${m.id}-${r.ref}`}
                        to="/biblia/$book/$chapter"
                        params={{ book: r.book, chapter: String(r.chapter) }}
                        search={{ v: r.verse }}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-gold/60 hover:bg-muted"
                      >
                        <BookOpen className="size-3.5 text-gold" aria-hidden />
                        Ver na Bíblia · {r.ref}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ),
          )}
          {sending && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              O Mentor está preparando uma resposta…
            </p>
          )}
          <div ref={endRef} />
        </section>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="fixed inset-x-0 bottom-[64px] z-30 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3">
          <label htmlFor="mentor-input" className="sr-only">
            Escreva sua pergunta para o Mentor Cristão
          </label>
          <textarea
            id="mentor-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Escreva sua dúvida bíblica…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold"
          />
          <button
            type="submit"
            disabled={sending || input.trim().length < 2}
            aria-label="Enviar pergunta"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-40"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}
