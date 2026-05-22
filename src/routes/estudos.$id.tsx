import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useLocalStorage } from "@/lib/storage";
import type { SavedStudy } from "./estudos";
import { ChevronLeft, Clock, BookOpen, Quote, Sparkles, Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/estudos/$id")({ component: EstudoDetail });

function EstudoDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [studies, setStudies] = useLocalStorage<SavedStudy[]>("estudos:list", []);
  const s = studies.find((x) => x.id === id);

  if (!s) {
    return (
      <div className="min-h-screen bg-background p-8 text-center pb-24">
        <p className="font-serif text-muted-foreground">Estudo não encontrado.</p>
        <Link to="/estudos" className="text-primary text-sm mt-4 inline-block">
          ← Voltar aos estudos
        </Link>
        <BottomNav />
      </div>
    );
  }

  const toggleFav = () =>
    setStudies(studies.map((x) => (x.id === id ? { ...x, favorite: !x.favorite } : x)));
  const remove = () => {
    setStudies(studies.filter((x) => x.id !== id));
    router.navigate({ to: "/estudos" });
  };

  return (
    <div className="min-h-screen bg-background pb-28 animate-fade-up">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-7">
        <Link
          to="/estudos"
          className="inline-flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground"
        >
          <ChevronLeft className="size-4" /> Estudos
        </Link>
        <div className="flex items-start justify-between gap-3 mt-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-gold">
              <Sparkles className="size-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                Gerado por IA
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl mt-1">{s.title}</h1>
            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary-foreground/70 underline break-all"
              >
                {s.url}
              </a>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={toggleFav} className="p-1.5 rounded-full bg-white/10">
              <Star className="size-4" fill={s.favorite ? "currentColor" : "none"} />
            </button>
            <button onClick={remove} className="p-1.5 rounded-full bg-white/10">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {s.summary && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Resumo</div>
            <p className="mt-2 font-serif text-base leading-relaxed text-card-foreground whitespace-pre-line">
              {s.summary}
            </p>
          </section>
        )}

        {!!s.themes?.length && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <BookOpen className="size-3.5" /> Temas principais
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.themes.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-secondary text-sm text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {!!s.teachings?.length && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">
              Ensinamentos
            </div>
            <ul className="mt-3 space-y-2 text-sm text-card-foreground">
              {s.teachings.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!!s.verses?.length && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <Quote className="size-3.5" /> Versículos citados
            </div>
            <ul className="mt-3 space-y-2">
              {s.verses.map((v, i) => (
                <li key={i} className="rounded-xl bg-secondary/60 p-3">
                  <div className="font-serif text-base text-card-foreground">{v.ref}</div>
                  {v.note && <div className="text-xs text-muted-foreground mt-0.5">{v.note}</div>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {!!s.timeline?.length && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <Clock className="size-3.5" /> Linha do tempo
            </div>
            <ol className="mt-3 space-y-2">
              {s.timeline.map((t, i) => (
                <li key={i} className="flex gap-3 items-baseline">
                  <span className="font-mono text-xs tabular-nums text-gold w-12 shrink-0">
                    {t.time}
                  </span>
                  <span className="text-sm text-card-foreground">{t.topic}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {!!s.highlights?.length && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">
              Destaques
            </div>
            <ul className="mt-3 space-y-2 text-sm text-card-foreground">
              {s.highlights.map((h, i) => (
                <li key={i} className="border-l-2 border-gold pl-3 italic">
                  "{h}"
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}