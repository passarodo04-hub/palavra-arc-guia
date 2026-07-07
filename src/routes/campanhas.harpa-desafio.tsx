import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Music, ArrowRight, Plus, Minus, RotateCcw, CheckCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/campaigns/StatCard";
import { CircularProgress } from "@/components/campaigns/CircularProgress";
import { VerseCard } from "@/components/campaigns/VerseCard";
import { useCampaign, verseForDay } from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/harpa-desafio")({
  head: () => ({
    meta: [
      { title: "Desafio da Harpa — Campanhas — Palavra+" },
      { name: "description", content: "Aprenda hinos da Harpa Cristã e acompanhe seu progresso." },
    ],
  }),
  component: HarpaDesafioPage,
});

const TARGETS = [30, 50, 100, 640];

function HarpaDesafioPage() {
  const { data, patch, start, reset } = useCampaign("harpa-desafio");
  const [target, setTarget] = useState<number>(data.target ?? 50);
  const counter = data.counter ?? 0;
  const percent = target ? Math.min(100, Math.round((counter / target) * 100)) : 0;
  const v = verseForDay(4);

  function begin(t: number) {
    setTarget(t);
    start({ target: t, counter: 0 });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Music, label: "Campanha" }}
        title="Desafio da Harpa"
        description="Escolha uma meta e conte cada hino que você aprender ou cantar como louvor a Deus."
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {!data.active ? (
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Escolha o desafio</div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {TARGETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => begin(t)}
                  className="rounded-2xl border border-border bg-secondary/40 p-4 text-left hover:border-gold/40 transition-colors"
                >
                  <div className="font-serif text-2xl text-foreground">{t}</div>
                  <div className="text-xs text-muted-foreground">{t === 640 ? "Toda a Harpa" : "hinos"}</div>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <CircularProgress percent={percent} />
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold">Progresso</div>
                  <h2 className="mt-1 font-serif text-2xl text-card-foreground">
                    {counter} de {data.target} hinos
                  </h2>
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => patch({ counter: Math.max(0, counter - 1) })}>
                      <Minus className="size-4" />
                    </Button>
                    <Button size="sm" className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90" onClick={() => patch({ counter: counter + 1 })}>
                      <Plus className="size-4" /> Marcar hino
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="rounded-full">
                      <Link to="/harpa">Abrir Harpa <ArrowRight className="size-4" /></Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-fade-up">
              <StatCard icon={Music} label="Meta" value={String(data.target)} />
              <StatCard icon={CheckCircle} label="Concluídos" value={String(counter)} accent />
              <StatCard icon={CheckCircle} label="Restantes" value={String(Math.max(0, (data.target ?? 0) - counter))} />
            </section>

            <VerseCard text={v.text} ref={v.ref} />

            <section className="rounded-3xl border border-border bg-secondary/40 p-6 flex items-center justify-between animate-fade-up">
              <div className="text-xs text-muted-foreground">Reiniciar contagem?</div>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => confirm("Reiniciar desafio?") && reset()}>
                <RotateCcw className="size-4" /> Reiniciar
              </Button>
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}