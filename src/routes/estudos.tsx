import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useLocalStorage } from "@/lib/storage";
import { analyzeSermon, type StudyResult } from "@/lib/estudos.functions";
import {
  Sparkles,
  Link2,
  Loader2,
  AlertTriangle,
  Trash2,
  Star,
  Search,
  ChevronRight,
  BookOpen,
  Clock,
  Quote,
} from "lucide-react";

export const Route = createFileRoute("/estudos")({ component: EstudosPage });

export type SavedStudy = StudyResult & {
  id: string;
  url?: string;
  createdAt: number;
  favorite?: boolean;
  category?: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function EstudosPage() {
  const [studies, setStudies] = useLocalStorage<SavedStudy[]>("estudos:list", []);
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fn = useServerFn(analyzeSermon);
  const mutation = useMutation({
    mutationFn: (data: { url?: string; transcript?: string; title?: string }) =>
      fn({ data }),
    onSuccess: (result: StudyResult) => {
      if (!result.ok) {
        setError(result.reason || "Não foi possível gerar o estudo.");
        return;
      }
      setError(null);
      const saved: SavedStudy = {
        ...result,
        id: uid(),
        url,
        createdAt: Date.now(),
        category: "Sermão",
      };
      setStudies([saved, ...studies]);
      setUrl("");
      setTranscript("");
      setTitle("");
    },
    onError: () => setError("Erro de conexão. Tente novamente."),
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return studies.filter((s) => {
      if (onlyFav && !s.favorite) return false;
      if (!q) return true;
      return (
        (s.title || "").toLowerCase().includes(q) ||
        (s.summary || "").toLowerCase().includes(q) ||
        (s.themes || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [studies, query, onlyFav]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url.trim() && !transcript.trim()) {
      setError("Cole um link ou a transcrição do sermão.");
      return;
    }
    mutation.mutate({ url: url.trim(), transcript: transcript.trim(), title: title.trim() });
  };

  const toggleFav = (id: string) =>
    setStudies(studies.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)));
  const remove = (id: string) => setStudies(studies.filter((s) => s.id !== id));

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <div className="flex items-center gap-2 text-gold">
          <Sparkles className="size-4" />
          <span className="text-xs font-medium uppercase tracking-[0.2em]">Estudos IA</span>
        </div>
        <h1 className="font-serif text-3xl mt-2">Assistente de Estudos</h1>
        <p className="text-sm text-primary-foreground/70 mt-1">
          Cole o link de um sermão (YouTube, Instagram, Facebook) ou a transcrição. A IA organiza temas, versículos e linha do tempo.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3"
        >
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Título (opcional)
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Fé que move montanhas"
              className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Link2 className="size-3" /> Link do sermão
            </span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtu.be/... ou https://instagram.com/..."
              className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Transcrição (opcional, recomendado para Instagram/Facebook)
            </span>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={5}
              placeholder="Cole aqui o texto do sermão para garantir o melhor estudo..."
              className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold font-sans"
            />
          </label>
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-destructive/10 text-destructive p-3 text-sm">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Analisando sermão…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Gerar estudo com IA
              </>
            )}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            Conteúdo impróprio é automaticamente bloqueado para manter o ambiente cristão.
          </p>
        </form>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-serif text-2xl">Meus estudos</h2>
            <button
              onClick={() => setOnlyFav((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${onlyFav ? "bg-gold/15 border-gold text-gold" : "border-border text-muted-foreground"}`}
            >
              <Star className="size-3.5" /> Favoritos
            </button>
          </div>
          <div className="mt-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, tema ou conteúdo…"
              className="w-full rounded-full bg-secondary pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {studies.length === 0
                ? "Você ainda não gerou nenhum estudo. Cole um link acima para começar."
                : "Nenhum estudo encontrado."}
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {filtered.map((s) => (
                <li
                  key={s.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to="/estudos/$id"
                      params={{ id: s.id }}
                      className="flex-1 min-w-0"
                    >
                      <div className="font-serif text-lg text-card-foreground truncate">
                        {s.title || "Estudo"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {s.summary}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(s.themes || []).slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </Link>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => toggleFav(s.id)}
                        className={`p-1.5 rounded-full hover:bg-secondary ${s.favorite ? "text-gold" : "text-muted-foreground"}`}
                        aria-label="Favoritar"
                      >
                        <Star className="size-4" fill={s.favorite ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => remove(s.id)}
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

        <section className="mt-8 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: BookOpen, label: "Temas" },
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

export { ChevronRight };