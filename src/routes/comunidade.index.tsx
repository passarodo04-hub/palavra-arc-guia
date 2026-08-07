import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Plus, LogIn, Crown, X, ArrowRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/lib/auth-context";
import { useWalk } from "@/hooks/use-walk";
import { getMyProfile } from "@/lib/cloud.functions";
import {
  createCommunity, joinCommunity, listMyCommunities, previewInvite, syncMyCommunityProgress,
} from "@/lib/community.functions";

export const Route = createFileRoute("/comunidade/")({
  component: CommunityHome,
  head: () => ({
    meta: [
      { title: "Comunidade — grupos de oração e crescimento | Palavra+" },
      {
        name: "description",
        content:
          "Crie ou entre em grupos com convite, acompanhe o progresso dos irmãos e participe de correntes de oração e leituras em conjunto.",
      },
      { property: "og:title", content: "Comunidade — Palavra+" },
      { property: "og:description", content: "Grupos de oração, leitura e crescimento espiritual em conjunto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CommunityHome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { stats, unlockedAchievements } = useWalk();
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchList = useServerFn(listMyCommunities);
  const fetchProfile = useServerFn(getMyProfile);
  const doPreview = useServerFn(previewInvite);
  const doJoin = useServerFn(joinCommunity);
  const doCreate = useServerFn(createCommunity);
  const doSync = useServerFn(syncMyCommunityProgress);

  const communities = useQuery({
    queryKey: ["communities", user?.id ?? "anon"],
    queryFn: () => fetchList(),
    enabled: !!user,
  });
  const profile = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });
  const displayName = (profile.data as { display_name?: string | null } | null)?.display_name ?? "";

  // Publish the member's own snapshot so the group ranking reflects real progress.
  useEffect(() => {
    if (!user || (communities.data ?? []).length === 0) return;
    void doSync({
      data: {
        displayName: displayName || "Membro",
        level: stats.level,
        xp: stats.xp,
        streak: stats.currentStreak,
        journeysCompleted: stats.journeysCompleted,
        badges: unlockedAchievements,
      },
    }).catch(() => {});
  }, [user, communities.data, displayName, stats, unlockedAchievements, doSync]);

  const preview = useQuery({
    queryKey: ["invite-preview", code.toUpperCase()],
    queryFn: () => doPreview({ data: { code: code.toUpperCase() } }),
    enabled: !!user && mode === "join" && code.trim().length >= 4,
  });

  const joinMutation = useMutation({
    mutationFn: () => doJoin({ data: { code: code.toUpperCase(), displayName: displayName || "Membro" } }),
    onSuccess: (res) => {
      toast.success("Bem-vindo à comunidade!");
      setMode(null);
      setCode("");
      void qc.invalidateQueries({ queryKey: ["communities", user?.id] });
      void navigate({ to: "/comunidade/$id", params: { id: res.id } });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível entrar."),
  });

  const createMutation = useMutation({
    mutationFn: () => doCreate({ data: { name: name.trim(), description: description.trim(), imageUrl: null } }),
    onSuccess: (res) => {
      toast.success(`Comunidade criada! Convite: ${res.inviteCode}`);
      setMode(null);
      setName("");
      setDescription("");
      void qc.invalidateQueries({ queryKey: ["communities", user?.id] });
      void navigate({ to: "/comunidade/$id", params: { id: res.id } });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível criar a comunidade."),
  });

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHero
        eyebrow={{ icon: Users, label: "Comunidade" }}
        title="Caminhem juntos"
        description="Grupos privados por convite para orar, ler e crescer com sua família, célula ou igreja."
      />

      <div className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {!loading && !user && (
          <section className="rounded-2xl border border-border bg-card p-6 text-center">
            <h2 className="font-serif text-xl text-foreground">Entre para participar</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A Comunidade exige uma conta para identificar os membros e sincronizar o progresso do grupo.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              Entrar na minha conta
            </Link>
          </section>
        )}

        {user && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("create")}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground"
              >
                <Plus className="size-4" aria-hidden /> Criar grupo
              </button>
              <button
                type="button"
                onClick={() => setMode("join")}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-foreground"
              >
                <LogIn className="size-4" aria-hidden /> Entrar com código
              </button>
            </div>

            <section aria-label="Minhas comunidades" className="space-y-3">
              <h2 className="font-serif text-lg text-foreground">Minhas comunidades</h2>
              {communities.isLoading && (
                <p className="text-sm text-muted-foreground">Carregando…</p>
              )}
              {communities.data?.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Você ainda não participa de nenhum grupo. Crie o seu ou use um código de convite.
                </p>
              )}
              {(communities.data ?? []).map((c) => (
                <Link
                  key={c.id}
                  to="/comunidade/$id"
                  params={{ id: c.id }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-gold/60"
                >
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                      {c.name}
                      {c.isAdmin && <Crown className="size-3.5 shrink-0 text-gold" aria-label="Administrador" />}
                    </h3>
                    {c.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.memberCount} {c.memberCount === 1 ? "membro" : "membros"}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              ))}
            </section>
          </>
        )}
      </div>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-dialog-title"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="community-dialog-title" className="font-serif text-xl text-foreground">
                {mode === "create" ? "Criar comunidade" : "Entrar com convite"}
              </h2>
              <button
                type="button" onClick={() => setMode(null)} aria-label="Fechar"
                className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            {mode === "create" ? (
              <form
                className="mt-4 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate();
                }}
              >
                <div>
                  <label htmlFor="c-name" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Nome do grupo
                  </label>
                  <input
                    id="c-name" required minLength={2} maxLength={80} value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Célula Vida Nova"
                    className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label htmlFor="c-desc" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Descrição
                  </label>
                  <textarea
                    id="c-desc" rows={3} maxLength={500} value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit" disabled={createMutation.isPending || name.trim().length < 2}
                  className="min-h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  Criar comunidade
                </button>
              </form>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="c-code" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Código de convite
                  </label>
                  <input
                    id="c-code" value={code} maxLength={16} autoCapitalize="characters"
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABC12XYZ"
                    className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-center text-lg font-semibold tracking-widest text-foreground outline-none focus:border-gold"
                  />
                </div>

                {code.trim().length >= 4 && preview.isLoading && (
                  <p className="text-sm text-muted-foreground">Procurando comunidade…</p>
                )}
                {code.trim().length >= 4 && !preview.isLoading && !preview.data && (
                  <p className="text-sm text-destructive">Convite inválido ou encerrado.</p>
                )}
                {preview.data && (
                  <div className="rounded-2xl border border-border bg-muted/40 p-4">
                    <h3 className="text-sm font-semibold text-foreground">{preview.data.name}</h3>
                    {preview.data.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{preview.data.description}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {preview.data.memberCount} {preview.data.memberCount === 1 ? "membro" : "membros"}
                      {preview.data.alreadyMember && " · você já participa"}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!preview.data || joinMutation.isPending}
                  onClick={() => joinMutation.mutate()}
                  className="min-h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {preview.data?.alreadyMember ? "Abrir comunidade" : "Entrar na comunidade"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
