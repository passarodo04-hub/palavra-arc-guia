import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/lib/auth-context";
import { useTheme, type ThemeMode } from "@/lib/theme-context";
import { getMyProfile, updateMyProfile } from "@/lib/cloud.functions";
import { deleteMyAccount } from "@/lib/account.functions";
import { LogOut, Trash2, Sun, Moon, Monitor, Loader2 } from "lucide-react";

export const Route = createFileRoute("/conta")({ component: ContaPage });

/**
 * Converte erros técnicos em mensagens claras, sem expor chaves ou tokens.
 * Cada causa recebe uma mensagem distinta — nunca colapsamos tudo em
 * "servidor indisponível", que escondia sessão expirada, endpoint ausente
 * (deploy estático sem servidor) e erro de configuração.
 */
function friendlyError(e: unknown, fallback: string) {
  const raw = e instanceof Error ? e.message : String(e ?? "");
  if (/Unauthorized|Invalid token|authorization header|\b401\b/i.test(raw)) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }
  if (/Forbidden|\b403\b|row-level security|permission denied/i.test(raw)) {
    return "Você não tem permissão para esta ação.";
  }
  if (/Missing Supabase environment|Connect Supabase|LOVABLE_API_KEY|not configured/i.test(raw)) {
    return "O servidor do Palavra+ está com a configuração incompleta. Já registramos o erro — publique a versão mais recente ou tente novamente em instantes.";
  }
  // Host estático devolvendo HTML no lugar da resposta da server function.
  if (/Unexpected token '<'|<!DOCTYPE|not valid JSON|\b404\b|Not Found/i.test(raw)) {
    return "Esta versão publicada está sem o servidor do Palavra+ (a chamada não encontrou o endpoint). Publique novamente para atualizar a produção.";
  }
  if (/Failed to fetch|NetworkError|fetch failed|Load failed/i.test(raw)) {
    return "Sem conexão com a internet. Verifique sua rede e tente novamente.";
  }
  if (/\b5\d\d\b|Internal Server Error/i.test(raw)) {
    return "Ocorreu um erro interno no servidor do Palavra+. Tente novamente em instantes.";
  }
  return raw && raw.length < 160 ? raw : fallback;
}

function ContaPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const qc = useQueryClient();

  const getProfile = useServerFn(getMyProfile);
  const updateProfile = useServerFn(updateMyProfile);
  const removeAccount = useServerFn(deleteMyAccount);

  const { data: profile, error: profileError, isError: profileFailed } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getProfile(),
    enabled: !!user,
    retry: 1,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  // Sessão inválida (token expirado no celular, storage limpo): limpa e volta ao login
  // em vez de mostrar um erro de "servidor indisponível".
  useEffect(() => {
    if (!profileFailed) return;
    const raw = profileError instanceof Error ? profileError.message : String(profileError ?? "");
    if (/Unauthorized|Invalid token|authorization header|401/i.test(raw)) {
      void signOut().then(() => navigate({ to: "/login", replace: true }));
    }
  }, [profileFailed, profileError, signOut, navigate]);

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
    if (profile?.birth_date) setBirthDate(profile.birth_date);
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateProfile({ data: { display_name: displayName, birth_date: birthDate || null } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Perfil salvo com sucesso.");
    },
    onError: (e: unknown) => {
      toast.error(friendlyError(e, "Não foi possível salvar o perfil."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => removeAccount(),
    onSuccess: async () => {
      await signOut();
      navigate({ to: "/", replace: true });
    },
    onError: (e: unknown) => {
      toast.error(friendlyError(e, "Não foi possível excluir a conta."));
    },
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const saving = saveMutation.isPending;

  const handleSave = () => {
    if (saving) return;
    saveMutation.mutate();
  };

  const handleDelete = () => {
    if (confirm("Tem certeza? Esta ação é permanente e remove todos os seus dados.")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHero backTo="/" backLabel="Início" title="Minha conta" description={user.email} />

      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {profileFailed && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {friendlyError(profileError, "Não foi possível carregar seu perfil.")}
          </div>
        )}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
          <h2 className="font-serif text-lg">Perfil</h2>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nome</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como devemos te chamar?"
              className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Data de nascimento
            </span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Usada para a saudação de aniversário no Calendário Cristão.
            </span>
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-serif text-lg">Tema</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([
              { v: "light", label: "Claro", Icon: Sun },
              { v: "dark", label: "Escuro", Icon: Moon },
              { v: "system", label: "Sistema", Icon: Monitor },
            ] as const).map(({ v, label, Icon }) => (
              <button
                key={v}
                onClick={() => setTheme(v as ThemeMode)}
                className={`rounded-xl border py-3 text-xs font-medium flex flex-col items-center gap-1 ${theme === v ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground"}`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
          <button
            onClick={() => signOut().then(() => navigate({ to: "/" }))}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium"
          >
            <LogOut className="size-4" /> Sair
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-destructive/10 text-destructive py-3 text-sm font-medium hover:bg-destructive/20"
          >
            <Trash2 className="size-4" /> Excluir conta permanentemente
          </button>
        </section>

        <section className="text-center text-xs text-muted-foreground space-x-4 pt-2">
          <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
          <span>·</span>
          <Link to="/termos" className="hover:text-foreground">Termos</Link>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}