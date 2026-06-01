import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";
import { generateSermon } from "@/lib/sermon.functions";
import { listSermons, saveSermon, deleteSermon } from "@/lib/cloud.functions";
import { Sparkles, Loader2, AlertTriangle, Trash2, Star, BookOpen, Clock, Quote } from "lucide-react";

export const Route = createFileRoute("/estudos/")({ component: EstudosPage });

function EstudosPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [subject, setSubject] = useState("");
  const [objective, setObjective] = useState("");
  const [duration, setDuration] = useState(30);
  const [audience, setAudience] = useState("");
  const [error, setError] = useState<string | null>(null);

  const genFn = useServerFn(generateSermon);
  const saveFn = useServerFn(saveSermon);
  const listFn = useServerFn(listSermons);
  const delFn = useServerFn(deleteSermon);

  const { data: sermons = [] } = useQuery({
    queryKey: ["sermons"],
    queryFn: () => listFn(),
    enabled: !!user,
  });

  const generate = useMutation({
    mutationFn: async () => {
      const res = await genFn({
        data: { title, theme, subject, objective, duration, audience },
      });
      if (!res.ok) throw new Error(res.reason);
      const saved = await saveFn({
        data: { title, theme, subject, objective, duration_min: duration, audience, content: res.content },
      });
      return saved;
    },
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["sermons"] });
      setTitle(""); setTheme(""); setSubject(""); setObjective(""); setAudience("");
      navigate({ to: "/estudos/$id", params: { id: s.id } });
    },
    onError: (e: Error) => setError(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sermons"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!title.trim() || !theme.trim() || !subject.trim() || !objective.trim()) {
      setError("Preencha título, tema, assunto e objetivo.");
      return;
    }
    generate.mutate();
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <div className="flex items-center gap-2 text-gold">
          <Sparkles className="size-4" />
          <span className="text-xs font-medium uppercase tracking-[0.2em]">Estudos IA</span>
        </div>
        <h1 className="font-serif text-3xl mt-2">Assistente de Sermões</h1>
        <p className="text-sm text-primary-foreground/70 mt-1">
          Gere um esboço completo de pregação com introdução, pontos, versículos, hinos e oração — em segundos.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        {!user && !authLoading && (
          <div className="mb-4 rounded-2xl border border-border bg-card p-4 text-sm flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Entre para salvar seus sermões na nuvem.</span>
            <Link to="/login" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold">
              Entrar
            </Link>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3"
        >
          <Field label="Título da pregação" value={title} onChange={setTitle} placeholder="Ex: A fé que move montanhas" />
          <Field label="Tema" value={theme} onChange={setTheme} placeholder="Ex: Fé, perseverança, esperança" />
          <Field label="Assunto principal" value={subject} onChange={setSubject} placeholder="Texto-base, contexto ou ideia central" />
          <Field label="Objetivo da mensagem" value={objective} onChange={setObjective} placeholder="O que a igreja deve aprender / decidir?" />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Duração (min)</span>
              <input
                type="number"
                min={5}
                max={180}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
              />
            </label>
            <Field label="Público (opcional)" value={audience} onChange={setAudience} placeholder="Jovens, culto da família…" />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-destructive/10 text-destructive p-3 text-sm">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={generate.isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-60"
          >
            {generate.isPending ? (
              <><Loader2 className="size-4 animate-spin" /> Gerando esboço…</>
            ) : (
              <><Sparkles className="size-4" /> Gerar pregação com IA</>
            )}
          </button>
        </form>

        {user && (
          <section className="mt-8">
            <h2 className="font-serif text-2xl">Meus sermões</h2>
            {sermons.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Você ainda não gerou nenhum sermão. Preencha o formulário acima para começar.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {sermons.map((s) => (
                  <li key={s.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <Link to="/estudos/$id" params={{ id: s.id }} className="flex-1 min-w-0">
                        <div className="font-serif text-lg text-card-foreground truncate">{s.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.theme}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {s.duration_min ? `${s.duration_min} min` : ""} {s.audience ? `· ${s.audience}` : ""}
                        </div>
                      </Link>
                      <div className="flex flex-col gap-1 shrink-0">
                        {s.favorite && <Star className="size-4 text-gold" fill="currentColor" />}
                        <button
                          onClick={() => removeMutation.mutate(s.id)}
                          className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground"
                          aria-label="Remover"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="mt-8 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: BookOpen, label: "Pontos" },
            { icon: Clock, label: "Timeline" },
            { icon: Quote, label: "Versículos" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3">
              <Icon className="size-4 text-gold mx-auto" />
              <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}