import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { ChevronLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/conta", replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/conta",
        data: { display_name: name },
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setInfo("Conta criada! Verifique seu e-mail para confirmar.");
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/conta",
    });
    if (result.error) setError("Falha ao entrar com Google.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <ChevronLeft className="size-4" /> Voltar
        </Link>
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold mb-2">Palavra+</div>
        <h1 className="font-serif text-3xl">Criar conta</h1>
        <p className="text-sm text-muted-foreground mt-1">Comece sua jornada espiritual personalizada.</p>

        <button
          onClick={handleGoogle}
          className="mt-6 w-full rounded-full border border-border bg-card py-3 text-sm font-medium hover:bg-secondary"
        >
          Continuar com Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou e-mail <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha (mín. 6 caracteres)"
            className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          {error && <div className="text-sm text-destructive">{error}</div>}
          {info && <div className="text-sm text-gold">{info}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />} Criar conta
          </button>
        </form>

        <div className="mt-5 text-xs text-center">
          Já tem conta?{" "}
          <Link to="/login" className="text-gold font-medium">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}