import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Flame, CalendarDays, CheckCircle, Save } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/campaigns/StatCard";
import { VerseCard } from "@/components/campaigns/VerseCard";
import {
  computeDateStreak,
  countInMonth,
  formatDatePt,
  todayISO,
  useCampaign,
  verseForDay,
} from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/gratidao")({
  head: () => ({
    meta: [
      { title: "Diário de Gratidão — Campanhas — Palavra+" },
      { name: "description", content: "Escreva três motivos de gratidão a Deus todos os dias." },
    ],
  }),
  component: GratidaoPage,
});

function GratidaoPage() {
  const { data, patch } = useCampaign("gratidao");
  const today = todayISO();
  const entries = data.entries ?? [];
  const todayEntry = entries.find((e) => e.date === today);
  const [items, setItems] = useState<string[]>(todayEntry?.items ?? ["", "", ""]);
  const streak = computeDateStreak(data.completedDates);
  const v = verseForDay(7);

  function save() {
    const cleaned = items.map((s) => s.trim());
    if (cleaned.filter(Boolean).length < 3) return;
    const next = entries.filter((e) => e.date !== today);
    next.unshift({ date: today, items: cleaned });
    const dates = new Set(data.completedDates ?? []);
    dates.add(today);
    patch({ active: true, entries: next.slice(0, 365), completedDates: [...dates].sort() });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Heart, label: "Campanha" }}
        title="Diário de Gratidão"
        description="Todo dia, três motivos para agradecer a Deus. Cultive um coração agradecido."
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Hoje · {formatDatePt(today)}</div>
          <h2 className="mt-2 font-serif text-xl text-card-foreground">Três motivos para agradecer</h2>
          <div className="mt-4 space-y-3">
            {items.map((val, i) => (
              <Input
                key={i}
                value={val}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  setItems(next);
                }}
                placeholder={`Motivo ${i + 1}`}
                className="h-11"
              />
            ))}
          </div>
          <div className="mt-4">
            <Button
              onClick={save}
              disabled={items.filter((s) => s.trim()).length < 3}
              className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-10 px-5"
            >
              <Save className="size-4" /> Salvar gratidão de hoje
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up">
          <StatCard icon={Flame} label="Sequência" value={`${streak} ${streak === 1 ? "dia" : "dias"}`} accent />
          <StatCard icon={CheckCircle} label="Total de dias" value={String(data.completedDates?.length ?? 0)} />
          <StatCard icon={CalendarDays} label="Este mês" value={String(countInMonth(data.completedDates))} />
          <StatCard icon={CheckCircle} label="Entradas" value={String(entries.length)} />
        </section>

        <VerseCard text={v.text} ref={v.ref} />

        {entries.length > 0 && (
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Histórico</div>
            <ul className="mt-3 divide-y divide-border">
              {entries.slice(0, 10).map((e) => (
                <li key={e.date} className="py-3">
                  <div className="text-xs text-muted-foreground">{formatDatePt(e.date)}</div>
                  <ul className="mt-1 list-disc pl-5 text-sm text-foreground">
                    {e.items.filter(Boolean).map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
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