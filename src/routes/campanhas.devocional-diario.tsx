import { createFileRoute, Link } from "@tanstack/react-router";
import { HandHeart, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { DailyCheckin } from "@/components/campaigns/DailyCheckin";
import { VerseCard } from "@/components/campaigns/VerseCard";
import { useCampaign, verseForDay } from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/devocional-diario")({
  head: () => ({
    meta: [
      { title: "Devocional Diário — Campanhas — Palavra+" },
      { name: "description", content: "Fortaleça sua caminhada com um devocional todos os dias." },
    ],
  }),
  component: DevocionalCampaignPage,
});

function DevocionalCampaignPage() {
  const { reset } = useCampaign("devocional-diario");
  const v = verseForDay(1);
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: HandHeart, label: "Campanha" }}
        title="Devocional Diário"
        description="Reserve alguns minutos por dia para meditar na Palavra e fortalecer sua fé."
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Objetivo</div>
          <p className="mt-2 font-serif text-lg text-card-foreground">
            Concluir um devocional todos os dias e cultivar constância na sua caminhada.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-11 px-6">
              <Link to="/devocional">
                Abrir Devocional de hoje
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full h-11 px-5">
              <Link to="/devocional-salvos">Meus salvos</Link>
            </Button>
          </div>
        </section>

        <DailyCheckin campaignId="devocional-diario" goalDays={30} ctaLabel="Concluí o devocional de hoje" />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
            <Sparkles className="size-3.5" />
            Inspiração
          </div>
          <div className="mt-4">
            <VerseCard text={v.text} ref={v.ref} />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-secondary/40 p-6 animate-fade-up">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">Reiniciar contagem de dias?</div>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => confirm("Reiniciar campanha?") && reset()}>
              <RotateCcw className="size-4" /> Reiniciar
            </Button>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}