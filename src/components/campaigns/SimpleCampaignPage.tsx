import type { LucideIcon } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { DailyCheckin } from "./DailyCheckin";
import { VerseCard } from "./VerseCard";
import { verseForDay } from "@/lib/campaigns";

type Section = { title: string; body: string };

export function SimpleCampaignPage({
  campaignId,
  icon,
  title,
  description,
  objective,
  goalDays = 30,
  ctaLabel,
  sections = [],
  verseSeed = 0,
}: {
  campaignId: string;
  icon: LucideIcon;
  title: string;
  description: string;
  objective: string;
  goalDays?: number;
  ctaLabel?: string;
  sections?: Section[];
  verseSeed?: number;
}) {
  const v = verseForDay(verseSeed);
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon, label: "Campanha" }}
        title={title}
        description={description}
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Objetivo</div>
          <p className="mt-2 font-serif text-lg text-card-foreground">{objective}</p>
        </section>

        <DailyCheckin campaignId={campaignId} goalDays={goalDays} ctaLabel={ctaLabel} />

        {sections.map((s) => (
          <section key={s.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">{s.title}</div>
            <p className="mt-2 text-sm text-foreground whitespace-pre-line">{s.body}</p>
          </section>
        ))}

        <VerseCard text={v.text} ref={v.ref} />
      </main>
      <BottomNav />
    </div>
  );
}