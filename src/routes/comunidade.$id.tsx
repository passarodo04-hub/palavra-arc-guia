import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users, Copy, Crown, Flame, Trophy, Plus, Trash2, Check, LogOut, X, HandHeart, BookOpen, Quote,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/lib/auth-context";
import { getMyProfile } from "@/lib/cloud.functions";
import { todayIso, formatDayLong } from "@/lib/calendar-shared";
import {
  createActivity, createPost, deleteActivity, deletePost, getCommunity,
  leaveCommunity, removeMember, setActivityParticipation,
} from "@/lib/community.functions";

export const Route = createFileRoute("/comunidade/$id")({
  component: CommunityDetail,
  head: () => ({
    meta: [
      { title: "Grupo da comunidade | Palavra+" },
      {
        name: "description",
        content:
          "Acompanhe o progresso dos membros, participe de correntes de oração e leituras em conjunto e compartilhe versículos com o seu grupo.",
      },
      { property: "og:title", content: "Grupo da comunidade — Palavra+" },
      { property: "og:description", content: "Progresso, atividades e mural do seu grupo no Palavra+." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const ACTIVITY_KINDS = [
  { id: "oracao", emoji: "🙏", label: "Corrente de oração" },
  { id: "leitura", emoji: "📖", label: "Leitura em conjunto" },
  { id: "jejum", emoji: "🕊️", label: "Jejum" },
  { id: "culto", emoji: "⛪", label: "Culto / encontro" },
] as const;

function kindMeta(id: string) {
  return ACTIVITY_KINDS.find((k) => k.id === id) ?? { id, emoji: "✨", label: "Atividade" };
}

type Tab = "membros" | "atividades" | "mural";

function CommunityDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("membros");
  const [showActivity, setShowActivity] = useState(false);
  const [showPost, setShowPost] = useState(false);

  const fetchCommunity = useServerFn(getCommunity);
  const fetchProfile = useServerFn(getMyProfile);
  const doLeave = useServerFn(leaveCommunity);
  const doRemove = useServerFn(removeMember);
  const doCreateActivity = useServerFn(createActivity);
  const doDeleteActivity = useServerFn(deleteActivity);
  const doParticipate = useServerFn(setActivityParticipation);
  const doCreatePost = useServerFn(createPost);
  const doDeletePost = useServerFn(deletePost);

  const q = useQuery({
    queryKey: ["community", id],
    queryFn: () => fetchCommunity({ data: { id } }),
    enabled: !!user,
  });
  const profile = useQuery({ queryKey: ["my-profile"], queryFn: () => fetchProfile(), enabled: !!user });
  const displayName = (profile.data as { display_name?: string | null } | null)?.display_name ?? "Membro";

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["community", id] });

  const leaveMutation = useMutation({
    mutationFn: () => doLeave({ data: { id } }),
    onSuccess: () => {
      toast.success("Você saiu da comunidade.");
      void qc.invalidateQueries({ queryKey: ["communities", user?.id] });
      void navigate({ to: "/comunidade" });
    },
    onError: () => toast.error("Não foi possível sair do grupo."),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => doRemove({ data: { communityId: id, userId: memberId } }),
    onSuccess: () => {
      toast.success("Membro removido.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível remover o membro."),
  });

  const participateMutation = useMutation({
    mutationFn: (v: { activityId: string; status: "started" | "completed"; title: string }) =>
      doParticipate({ data: { activityId: v.activityId, communityId: id, status: v.status, title: v.title } }),
    onSuccess: (_r, v) => {
      toast.success(v.status === "completed" ? "Participação concluída!" : "Você entrou na atividade.");
      invalidate();
      void qc.invalidateQueries({ queryKey: ["walk"] });
    },
    onError: () => toast.error("Não foi possível registrar sua participação."),
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (activityId: string) => doDeleteActivity({ data: { id: activityId } }),
    onSuccess: () => {
      toast.success("Atividade removida.");
      invalidate();
    },
    onError: () => toast.error("Não foi possível remover a atividade."),
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => doDeletePost({ data: { id: postId } }),
    onSuccess: () => {
      toast.success("Publicação removida.");
      invalidate();
    },
    onError: () => toast.error("Não foi possível remover a publicação."),
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <PageHero eyebrow={{ icon: Users, label: "Comunidade" }} title="Entre para ver o grupo" backTo="/comunidade" />
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Entrar na minha conta
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const data = q.data;

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHero
        eyebrow={{ icon: Users, label: "Comunidade" }}
        title={data?.community.name ?? "Grupo"}
        description={data?.community.description || "Progresso, atividades e mural do grupo."}
        backTo="/comunidade"
        backLabel="Comunidade"
      />

      <div className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {q.isLoading && <p className="text-sm text-muted-foreground">Carregando grupo…</p>}
        {!q.isLoading && !data && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Grupo não encontrado ou você não faz parte dele.
          </p>
        )}

        {data && (
          <>
            <section className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">Código de convite</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded-xl bg-muted px-3 py-2 text-center text-lg font-semibold tracking-widest text-foreground">
                  {data.community.inviteCode}
                </code>
                <button
                  type="button"
                  aria-label="Copiar código de convite"
                  onClick={() => {
                    void navigator.clipboard
                      ?.writeText(data.community.inviteCode)
                      .then(() => toast.success("Código copiado!"))
                      .catch(() => toast.error("Não foi possível copiar."));
                  }}
                  className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-foreground hover:border-gold/60"
                >
                  <Copy className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {data.community.memberCount} {data.community.memberCount === 1 ? "membro" : "membros"}
              </p>
            </section>

            <div role="tablist" aria-label="Seções do grupo" className="flex gap-2">
              {(["membros", "atividades", "mural"] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`min-h-10 flex-1 rounded-xl text-sm font-medium capitalize transition-colors ${
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "membros" && (
              <section aria-label="Membros" className="space-y-3">
                {data.members.map((m, i) => (
                  <article key={m.userId} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                          <span className="text-muted-foreground">{i + 1}.</span> {m.displayName}
                          {m.role === "admin" && <Crown className="size-3.5 shrink-0 text-gold" aria-label="Admin" />}
                        </h3>
                        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Nível {m.level}</span>
                          <span>{m.xp} XP</span>
                          <span className="inline-flex items-center gap-1">
                            <Flame className="size-3" aria-hidden /> {m.streak} dias
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Trophy className="size-3" aria-hidden /> {m.badges}
                          </span>
                          <span>{m.journeysCompleted} jornadas</span>
                        </p>
                      </div>
                      {data.community.isAdmin && m.userId !== user.id && (
                        <button
                          type="button"
                          aria-label={`Remover ${m.displayName}`}
                          onClick={() => removeMutation.mutate(m.userId)}
                          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}

                {!data.isOwner && (
                  <button
                    type="button"
                    onClick={() => leaveMutation.mutate()}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="size-4" aria-hidden /> Sair da comunidade
                  </button>
                )}
              </section>
            )}

            {tab === "atividades" && (
              <section aria-label="Atividades" className="space-y-3">
                {data.community.isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowActivity(true)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground"
                  >
                    <Plus className="size-4" aria-hidden /> Nova atividade
                  </button>
                )}
                {data.activities.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Nenhuma atividade criada ainda.
                  </p>
                )}
                {data.activities.map((a) => {
                  const meta = kindMeta(a.kind);
                  const mine = a.participants.find((p) => p.userId === user.id);
                  return (
                    <article key={a.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            <span aria-hidden>{meta.emoji}</span> {a.title}
                          </h3>
                          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                            {formatDayLong(a.scheduledDate)}
                            {a.scheduledTime && ` · ${a.scheduledTime}`} · {meta.label}
                          </p>
                          {a.description && <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {a.participants.length} participando ·{" "}
                            {a.participants.filter((p) => p.status === "completed").length} concluíram
                          </p>
                        </div>
                        {data.community.isAdmin && (
                          <button
                            type="button"
                            aria-label={`Remover ${a.title}`}
                            onClick={() => deleteActivityMutation.mutate(a.id)}
                            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!!mine || participateMutation.isPending}
                          onClick={() =>
                            participateMutation.mutate({ activityId: a.id, status: "started", title: a.title })
                          }
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground disabled:opacity-60"
                        >
                          <HandHeart className="size-3.5" aria-hidden /> {mine ? "Participando" : "Participar"}
                        </button>
                        <button
                          type="button"
                          disabled={mine?.status === "completed" || participateMutation.isPending}
                          onClick={() =>
                            participateMutation.mutate({ activityId: a.id, status: "completed", title: a.title })
                          }
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground disabled:opacity-60"
                        >
                          <Check className="size-3.5" aria-hidden />{" "}
                          {mine?.status === "completed" ? "Concluído" : "Marcar como concluído"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            {tab === "mural" && (
              <section aria-label="Mural" className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowPost(true)}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground"
                >
                  <Plus className="size-4" aria-hidden /> Compartilhar versículo ou palavra
                </button>
                {data.posts.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Nenhuma publicação ainda. Seja o primeiro a edificar o grupo.
                  </p>
                )}
                {data.posts.map((p) => (
                  <article key={p.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">
                          {p.kind === "versiculo" ? (
                            <BookOpen className="mr-1 inline size-3.5 text-gold" aria-hidden />
                          ) : (
                            <Quote className="mr-1 inline size-3.5 text-gold" aria-hidden />
                          )}
                          {p.authorName}
                        </h3>
                        {p.reference && <p className="mt-0.5 text-xs text-gold">{p.reference}</p>}
                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{p.content}</p>
                      </div>
                      {(p.userId === user.id || data.community.isAdmin) && (
                        <button
                          type="button"
                          aria-label="Remover publicação"
                          onClick={() => deletePostMutation.mutate(p.id)}
                          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {showActivity && (
        <ActivityDialog
          onClose={() => setShowActivity(false)}
          onSubmit={async (v) => {
            try {
              await doCreateActivity({ data: { communityId: id, ...v } });
              toast.success("Atividade criada.");
              setShowActivity(false);
              invalidate();
            } catch {
              toast.error("Não foi possível criar a atividade.");
            }
          }}
        />
      )}

      {showPost && (
        <PostDialog
          onClose={() => setShowPost(false)}
          onSubmit={async (v) => {
            try {
              await doCreatePost({ data: { communityId: id, ...v, authorName: displayName } });
              toast.success("Publicado no mural.");
              setShowPost(false);
              invalidate();
            } catch {
              toast.error("Não foi possível publicar.");
            }
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}

function Sheet({
  title, onClose, children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-foreground">{title}</h2>
          <button
            type="button" onClick={onClose} aria-label="Fechar"
            className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ActivityDialog({
  onClose, onSubmit,
}: {
  onClose: () => void;
  onSubmit: (v: {
    kind: string;
    title: string;
    description: string;
    scheduledDate: string;
    scheduledTime: string | null;
  }) => Promise<void>;
}) {
  const [kind, setKind] = useState<string>("oracao");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("19:00");
  const [saving, setSaving] = useState(false);

  return (
    <Sheet title="Nova atividade" onClose={onClose}>
      <form
        className="mt-4 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSubmit({
            kind,
            title: title.trim(),
            description: description.trim(),
            scheduledDate: date,
            scheduledTime: time || null,
          });
          setSaving(false);
        }}
      >
        <div>
          <label htmlFor="a-kind" className="mb-1.5 block text-xs font-medium text-muted-foreground">Tipo</label>
          <select
            id="a-kind" value={kind} onChange={(e) => setKind(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
          >
            {ACTIVITY_KINDS.map((k) => (
              <option key={k.id} value={k.id}>{k.emoji} {k.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="a-title" className="mb-1.5 block text-xs font-medium text-muted-foreground">Título</label>
          <input
            id="a-title" required minLength={2} maxLength={120} value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="a-date" className="mb-1.5 block text-xs font-medium text-muted-foreground">Data</label>
            <input
              id="a-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="a-time" className="mb-1.5 block text-xs font-medium text-muted-foreground">Horário</label>
            <input
              id="a-time" type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>
        </div>
        <div>
          <label htmlFor="a-desc" className="mb-1.5 block text-xs font-medium text-muted-foreground">Descrição</label>
          <textarea
            id="a-desc" rows={3} maxLength={600} value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit" disabled={saving || title.trim().length < 2}
          className="min-h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Criar atividade
        </button>
      </form>
    </Sheet>
  );
}

function PostDialog({
  onClose, onSubmit,
}: {
  onClose: () => void;
  onSubmit: (v: { kind: "versiculo" | "palavra"; reference: string; content: string }) => Promise<void>;
}) {
  const [kind, setKind] = useState<"versiculo" | "palavra">("versiculo");
  const [reference, setReference] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <Sheet title="Compartilhar" onClose={onClose}>
      <form
        className="mt-4 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSubmit({ kind, reference: reference.trim(), content: content.trim() });
          setSaving(false);
        }}
      >
        <div className="flex gap-2">
          {(["versiculo", "palavra"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={`min-h-10 flex-1 rounded-xl text-sm font-medium transition-colors ${
                kind === k
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {k === "versiculo" ? "Versículo" : "Palavra"}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="p-ref" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Referência (opcional)
          </label>
          <input
            id="p-ref" maxLength={80} value={reference} onChange={(e) => setReference(e.target.value)}
            placeholder="João 3:16"
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
        <div>
          <label htmlFor="p-content" className="mb-1.5 block text-xs font-medium text-muted-foreground">Mensagem</label>
          <textarea
            id="p-content" rows={5} required minLength={2} maxLength={1000} value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit" disabled={saving || content.trim().length < 2}
          className="min-h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Publicar
        </button>
      </form>
    </Sheet>
  );
}
