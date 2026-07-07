import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "./CircularProgress";
import {
  computeDateStreak,
  countInMonth,
  countInYear,
  todayISO,
  useCampaign,
} from "@/lib/campaigns";
import { StatCard } from "./StatCard";
import { Flame, CalendarDays, CheckCircle } from "lucide-react";

type Props = {
  campaignId: string;
  goalDays?: number;
  ctaLabel?: string;
  ctaDoneLabel?: string;
};

/**
 * Generic daily check-in UI used by devocional, familia, casais, crianças, etc.
 * Persists to the universal campaigns store.
 */
export function DailyCheckin({
  campaignId,
  goalDays = 30,
  ctaLabel = "Marcar hoje como concluído",
  ctaDoneLabel = "Concluído hoje — desfazer",
}: Props) {
  const { data, patch, start } = useCampaign(campaignId);
  const completed = data.completedDates ?? [];
  const today = todayISO();
  const doneToday = completed.includes(today);
  const streak = computeDateStreak(completed);
  const percent = Math.min(100, Math.round((completed.length / goalDays) * 100));

  const toggleToday = () => {
    if (!data.active) start({ goalDays });
    const next = doneToday
      ? completed.filter((d) => d !== today)
      : [...completed, today];
    patch({ completedDates: [...new Set(next)].sort(), goalDays });
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <CircularProgress percent={percent} />
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Consistência</div>
          <h2 className="mt-1 font-serif text-2xl text-card-foreground">
            {completed.length} de {goalDays} dias
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Marque cada dia que você concluir esta prática para acompanhar seu progresso.
          </p>
          <Button
            type="button"
            onClick={toggleToday}
            variant={doneToday ? "secondary" : "default"}
            className={`mt-5 rounded-full h-11 px-6 ${
              doneToday ? "" : "bg-gold text-gold-foreground hover:bg-gold/90"
            }`}
          >
            <CheckCircle2 className="size-4" />
            {doneToday ? ctaDoneLabel : ctaLabel}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Flame} label="Sequência" value={`${streak} ${streak === 1 ? "dia" : "dias"}`} accent />
        <StatCard icon={CheckCircle} label="Total" value={String(completed.length)} />
        <StatCard icon={CalendarDays} label="Este mês" value={String(countInMonth(completed))} />
        <StatCard icon={CalendarDays} label="Este ano" value={String(countInYear(completed))} />
      </div>
    </section>
  );
}