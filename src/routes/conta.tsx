import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";
import { useTheme, type ThemeMode } from "@/lib/theme-context";
import { getMyProfile, updateMyProfile } from "@/lib/cloud.functions";
import { deleteMyAccount } from "@/lib/account.functions";
import { LogOut, Trash2, Sun, Moon, Monitor, ChevronLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/conta")({ component: ContaPage });

function ContaPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  const getProfile = useServerFn(getMyProfile);
  const updateProfile = useServerFn(updateMyProfile);
  const removeAccount = useServerFn(deleteMyAccount);

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getProfile(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () => updateProfile({ data: { display_name: displayName } }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => removeAccount(),
    onSuccess: async () => {
      await signOut();
      navigate({ to: "/", replace: true });
    },
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await saveMutation.mutateAsync();
    setSaving(false);
  };

  const handleDelete = () => {
    if (confirm("Tem certeza? Esta ação é permanente e remove todos os seus dados.")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-primary-foreground/70 mb-3">
          <ChevronLeft className="size-4" /> Início
        </Link>
        <h1 className="font-serif text-3xl">Minha conta</h1>
        <p className="text-sm text-primary-foreground/70 mt-1">{user.email}</p>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
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