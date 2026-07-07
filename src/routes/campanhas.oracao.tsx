import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HandHeart, Play, Pause, RotateCcw, Clock, ArrowRight, Flame, CheckCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/campaigns/StatCard";
import { VerseCard } from "@/components/campaigns/VerseCard";
import {
  computeDateStreak,
  todayISO,
  useCampaign,
  verseForDay,
} from "@/lib/campaigns";

export const Route = createFileRoute("/campanhas/oracao")({
  head: () => ({
    meta: [
      { title: "Rotina de Oração — Campanhas — Palavra+" },
      { name: "description", content: "Crie sua rotina de oração com temporizador e leituras recomendadas." },
    ],
  }),
  component: OracaoCampaignPage,
});

const DURATIONS = [5, 10, 15, 30, 45, 60];
const PERIODS = ["Manhã", "Tarde", "Noite", "Personalizado"] as const;

function OracaoCampaignPage() {
  const { data, patch, start } = useCampaign("oracao");
  const [minutes, setMinutes] = useState<number>(data.preferredMinutes ?? 10);
  const [custom, setCustom] = useState<string>("");
  const [period, setPeriod] = useState<string>(data.preferredTime ?? "Manhã");
  const [customTime, setCustomTime] = useState<string>("07:00");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setMinutes(data.preferredMinutes ?? 10), [data.preferredMinutes]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const target = minutes * 60;
  const percent = Math.min(100, Math.round((elapsed / target) * 100));
  const remaining = Math.max(0, target - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  useEffect(() => {
    if (running && elapsed >= target) {
      setRunning(false);
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, target, running]);

  const streak = useMemo(() => computeDateStreak(data.completedDates), [data.completedDates]);

  function begin() {
    if (!data.active) start({ preferredMinutes: minutes, preferredTime: period });
    setElapsed(0);
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function resetTimer() {
    setRunning(false);
    setElapsed(0);
  }
  function finish() {
    const today = todayISO();
    const done = new Set(data.completedDates ?? []);
    done.add(today);
    patch({
      completedDates: [...done].sort(),
      totalMinutes: (data.totalMinutes ?? 0) + Math.round(elapsed / 60),
      sessions: (data.sessions ?? 0) + 1,
      lastSessionAt: Date.now(),
      preferredMinutes: minutes,
      preferredTime: period,
    });
  }

  const v = verseForDay(2);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: HandHeart, label: "Campanha" }}
        title="Rotina de Oração"
        description="Escolha o seu tempo, crie o hábito e receba recomendações para aprofundar sua comunhão."
        backTo="/campanhas"
        backLabel="Campanhas"
      />
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {/* Setup */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Passo 1 · Duração</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMinutes(m);
                  setCustom("");
                }}
                className={`rounded-full border px-4 py-2 text-sm ${
                  minutes === m && !custom ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                {m} min
              </button>
            ))}
            <div className="inline-flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={240}
                placeholder="Custom"
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value);
                  const n = Number(e.target.value);
                  if (n > 0) setMinutes(n);
                }}
                className="h-9 w-24"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
          <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold">Passo 2 · Horário</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  period === p ? "border-gold bg-gold/10 text-foreground" : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
            {period === "Personalizado" && (
              <Input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className="h-9 w-32" />
            )}
          </div>
        </section>

        {/* Prayer screen */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-10 shadow-elegant animate-fade-up text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(circle at 50% 0%, hsl(var(--primary)), transparent 60%)" }}
          />
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Tempo de oração</div>
            <div className="mt-6 font-serif text-6xl md:text-7xl text-foreground tabular-nums">
              {mm}:{ss}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {percent}% de {minutes} min
            </div>
            <div className="mx-auto mt-4 h-1.5 max-w-md rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width]" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              {!running ? (
                <Button onClick={begin} className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-11 px-6">
                  <Play className="size-4" /> {elapsed === 0 ? "Começar" : "Continuar"}
                </Button>
              ) : (
                <Button onClick={pause} variant="secondary" className="rounded-full h-11 px-6">
                  <Pause className="size-4" /> Pausar
                </Button>
              )}
              <Button onClick={resetTimer} variant="ghost" className="rounded-full h-11 px-4">
                <RotateCcw className="size-4" /> Reiniciar
              </Button>
              {elapsed > 0 && !running && (
                <Button onClick={finish} variant="outline" className="rounded-full h-11 px-5">
                  Registrar oração
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up">
          <StatCard icon={Flame} label="Sequência" value={`${streak} ${streak === 1 ? "dia" : "dias"}`} accent />
          <StatCard icon={CheckCircle} label="Sessões" value={String(data.sessions ?? 0)} />
          <StatCard icon={Clock} label="Minutos totais" value={String(data.totalMinutes ?? 0)} />
          <StatCard icon={CheckCircle} label="Dias com oração" value={String(data.completedDates?.length ?? 0)} />
        </section>

        <VerseCard text={v.text} ref={v.ref} />

        {/* Recommendations */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Recomendações</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Link
              to="/biblia/$book/$chapter"
              params={{ book: "sl", chapter: "23" }}
              className="group rounded-2xl border border-border bg-secondary/40 p-4 hover:border-gold/40 transition-colors"
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Leitura sugerida</div>
              <div className="mt-1 font-serif text-lg text-foreground">Salmo 23</div>
              <div className="mt-2 inline-flex items-center text-xs text-gold">Abrir <ArrowRight className="ml-1 size-3.5" /></div>
            </Link>
            <Link
              to="/harpa"
              className="group rounded-2xl border border-border bg-secondary/40 p-4 hover:border-gold/40 transition-colors"
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Hinos de adoração</div>
              <div className="mt-1 font-serif text-lg text-foreground">Harpa Cristã</div>
              <div className="mt-2 inline-flex items-center text-xs text-gold">Explorar <ArrowRight className="ml-1 size-3.5" /></div>
            </Link>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}