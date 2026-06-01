import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({ component: ResetPage });

function ResetPage() {
  const [isRecovery, setIsRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("type=recovery")) setIsRecovery(true);
  }, []);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setMsg("Verifique seu e-mail para redefinir a senha.");
  };

  const updatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setErr(error.message);
    else setMsg("Senha atualizada com sucesso. Você já está conectado.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <ChevronLeft className="size-4" /> Voltar
        </Link>
        <h1 className="font-serif text-3xl">{isRecovery ? "Nova senha" : "Recuperar senha"}</h1>

        {isRecovery ? (
          <form onSubmit={updatePass} className="mt-6 space-y-3">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
            {err && <div className="text-sm text-destructive">{err}</div>}
            {msg && <div className="text-sm text-gold">{msg}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />} Salvar nova senha
            </button>
          </form>
        ) : (
          <form onSubmit={sendLink} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
            {err && <div className="text-sm text-destructive">{err}</div>}
            {msg && <div className="text-sm text-gold">{msg}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />} Enviar link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}