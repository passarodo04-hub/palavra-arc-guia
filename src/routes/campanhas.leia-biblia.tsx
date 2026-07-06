import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Bell,
  RotateCcw,
  ArrowRight,
  Sparkles,
  BookMarked,
} from "lucide-react";
import {
  TOTAL_CHAPTERS,
  TOTAL_VERSES,
  TOTAL_READING_MINUTES,
  MINUTES_PER_CHAPTER,
  chaptersPerDay,
  readingForDay,
  summarizeReading,
  addDaysISO,
  daysBetween,
  todayISO,
  formatDatePt,
  useBiblePlan,
  computeBooksCompleted,
  computeStreak,
  dailyEncouragement,
} from "@/lib/bible-plan";

export const Route = createFileRoute("/campanhas/leia-biblia")({
  head: () => ({
    meta: [
      { title: "Leia toda a Bíblia — Campanhas — Palavra+" },
      {
        name: "description",
        content:
          "Escolha o seu ritmo e leia toda a Bíblia — plano personalizado, progresso salvo e leituras diárias para transformar a sua caminhada com Deus.",
      },
      { property: "og:title", content: "Leia toda a Bíblia — Palavra+" },
      {
        property: "og:description",
        content: "Plano personalizado para ler toda a Bíblia no seu ritmo, com progresso e leituras diárias.",
      },
    ],
  }),
  component: LeiaBibliaPage,
});

function LeiaBibliaPage() {
  const { state, currentDayIndex, start, reset, markDay, setReminder, setGoal } = useBiblePlan();

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: BookOpen, label: "Campanha" }}
        title={<>Leia toda a Bíblia</>}
        description="Da criação ao Apocalipse. Um plano no seu ritmo, para ouvir a voz de Deus todos os dias."
        backTo="/campanhas"
        backLabel="Campanhas"
      />

      <main className="mx-auto max-w-3xl px-4 pt-6">
        {!state.active ? (
          <SetupWizard onStart={start} />
        ) : (
          <ActivePlan
            goalDays={state.goalDays}
            startDate={state.startDate}
            completedDays={state.completedDays}
            currentDayIndex={currentDayIndex}
            reminder={state.reminder}
            onMark={markDay}
            onReset={reset}
            onReminderChange={setReminder}
            onGoalChange={setGoal}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}

/* -------------------- Setup -------------------- */

const PRESETS = [
  { days: 90, label: "3 meses", note: "Intenso" },
  { days: 180, label: "6 meses", note: "Equilibrado" },
  { days: 365, label: "1 ano", note: "Clássico" },
] as const;

function SetupWizard({ onStart }: { onStart: (days: number, startDate?: string) => void }) {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [days, setDays] = useState<number>(365);
  const [customEnd, setCustomEnd] = useState<string>(addDaysISO(todayISO(), 365));

  const goalDays = mode === "custom" ? daysBetween(todayISO(), customEnd) : days;
  const cpd = chaptersPerDay(goalDays);
  const vpd = Math.ceil(TOTAL_VERSES / goalDays);
  const dailyMinutes = Math.max(1, Math.round(cpd * MINUTES_PER_CHAPTER));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
        <div className="text-xs font-semibold uppercase tracking-widest text-gold">
          Passo 1 · Escolha o seu ritmo
        </div>
        <p className="mt-2 font-serif text-lg text-card-foreground">
          "Toda a Escritura é divinamente inspirada e proveitosa" (2 Tm 3:16). Defina uma meta que caiba
          na sua rotina — o importante é ser fiel todos os dias.
        </p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
          {PRESETS.map((p) => {
            const active = mode === "preset" && days === p.days;
            return (
              <button
                key={p.days}
                type="button"
                onClick={() => {
                  setMode("preset");
                  setDays(p.days);
                }}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  active
                    ? "border-gold bg-gold/10 shadow-soft"
                    : "border-border bg-secondary/40 hover:border-gold/40"
                }`}
              >
                <div className="font-serif text-lg text-foreground">{p.label}</div>
                <div className="text-[11px] text-muted-foreground">{p.days} dias · {p.note}</div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-2xl border p-3 text-left transition-all ${
              mode === "custom"
                ? "border-gold bg-gold/10 shadow-soft"
                : "border-border bg-secondary/40 hover:border-gold/40"
            }`}
          >
            <div className="font-serif text-lg text-foreground">Personalizada</div>
            <div className="text-[11px] text-muted-foreground">Escolha a data</div>
          </button>
        </div>

        {mode === "custom" && (
          <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
            <Label htmlFor="end-date" className="text-xs uppercase tracking-widest text-muted-foreground">
              Terminar em
            </Label>
            <Input
              id="end-date"
              type="date"
              value={customEnd}
              min={addDaysISO(todayISO(), 7)}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="mt-2"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {goalDays} dias · concluir em {formatDatePt(customEnd)}
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-fade-up">
        <StatCard icon={BookOpen} label="Capítulos totais" value={TOTAL_CHAPTERS.toLocaleString("pt-BR")} />
        <StatCard icon={BookMarked} label="Versículos totais" value={TOTAL_VERSES.toLocaleString("pt-BR")} />
        <StatCard
          icon={Clock}
          label="Leitura completa"
          value={`~${Math.round(TOTAL_READING_MINUTES / 60)}h`}
        />
        <StatCard icon={CalendarDays} label="Capítulos por dia" value={String(cpd)} accent />
        <StatCard icon={BookMarked} label="Versículos por dia" value={String(vpd)} accent />
        <StatCard icon={Clock} label="Leitura diária" value={`~${dailyMinutes} min`} accent />
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Pronto para começar</div>
            <div className="mt-1 font-serif text-lg text-card-foreground">
              Conclusão prevista: <span className="text-gold">{formatDatePt(addDaysISO(todayISO(), goalDays))}</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => onStart(goalDays)}
            className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90 h-11 px-6 font-semibold shadow-soft"
          >
            Começar hoje
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

/* -------------------- Active plan -------------------- */

function ActivePlan({
  goalDays,
  startDate,
  completedDays,
  currentDayIndex,
  reminder,
  onMark,
  onReset,
  onReminderChange,
  onGoalChange,
}: {
  goalDays: number;
  startDate: string;
  completedDays: number[];
  currentDayIndex: number;
  reminder: { enabled: boolean; time: string };
  onMark: (day: number, done: boolean) => void;
  onReset: () => void;
  onReminderChange: (r: { enabled: boolean; time: string }) => void;
  onGoalChange: (days: number) => void;
}) {
  const cpd = chaptersPerDay(goalDays);
  const doneCount = completedDays.length;
  const chaptersDone = useMemo(
    () => Math.min(TOTAL_CHAPTERS, doneCount * cpd),
    [doneCount, cpd],
  );
  const versesDone = Math.min(
    TOTAL_VERSES,
    Math.round((chaptersDone / TOTAL_CHAPTERS) * TOTAL_VERSES),
  );
  const percent = Math.min(100, Math.round((chaptersDone / TOTAL_CHAPTERS) * 100));
  const booksDone = useMemo(
    () => computeBooksCompleted(completedDays, goalDays),
    [completedDays, goalDays],
  );
  const streak = useMemo(
    () => computeStreak(completedDays, currentDayIndex),
    [completedDays, currentDayIndex],
  );
  const daysRemaining = Math.max(0, goalDays - doneCount);
  const finishDate = formatDatePt(addDaysISO(startDate, goalDays));

  const todayRefs = readingForDay(currentDayIndex, goalDays);
  const todayDone = completedDays.includes(currentDayIndex);
  const encouragement = dailyEncouragement(currentDayIndex);

  const upcoming = useMemo(() => {
    const out: { dayIndex: number; label: string; text: string; done: boolean }[] = [];
    for (let d = 0; d < Math.min(goalDays, currentDayIndex + 7); d++) {
      out.push({
        dayIndex: d,
        label:
          d === currentDayIndex
            ? "Hoje"
            : d === currentDayIndex + 1
              ? "Amanhã"
              : formatDatePt(addDaysISO(startDate, d)),
        text: summarizeReading(readingForDay(d, goalDays)),
        done: completedDays.includes(d),
      });
    }
    return out.slice(Math.max(0, currentDayIndex - 1));
  }, [currentDayIndex, goalDays, startDate, completedDays]);

  return (
    <div className="space-y-6">
      {/* Progress hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 shadow-elegant animate-fade-up">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle at 90% 10%, hsl(var(--primary)), transparent 55%)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <CircularProgress percent={percent} />
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Progresso</div>
            <h2 className="mt-1 font-serif text-2xl md:text-3xl text-card-foreground">
              {percent}% da Palavra concluída
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Conclusão prevista em <span className="text-foreground font-medium">{finishDate}</span>
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width] duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Today's reading */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Leitura de hoje</div>
            <div className="mt-1 font-serif text-2xl text-card-foreground">
              {summarizeReading(todayRefs)}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              ~{Math.max(1, Math.round(todayRefs.length * MINUTES_PER_CHAPTER))} min · {todayRefs.length} capítulos
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            Dia {currentDayIndex + 1} de {goalDays}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {todayRefs[0] && (
            <Button asChild className="rounded-full h-10 px-5">
              <Link
                to="/biblia/$book/$chapter"
                params={{ book: todayRefs[0].book, chapter: String(todayRefs[0].chapter) }}
              >
                Abrir leitura
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant={todayDone ? "secondary" : "default"}
            onClick={() => onMark(currentDayIndex, !todayDone)}
            className={`rounded-full h-10 px-5 ${
              todayDone ? "" : "bg-gold text-gold-foreground hover:bg-gold/90"
            }`}
          >
            {todayDone ? (
              <>
                <CheckCircle2 className="size-4" />
                Concluído — desfazer
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Marcar como concluído
              </>
            )}
          </Button>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gold">
            <Sparkles className="size-3.5" />
            Palavra para hoje
          </div>
          <blockquote className="mt-2 font-serif text-base text-foreground">
            "{encouragement.text}"
          </blockquote>
          <div className="mt-1 text-xs text-muted-foreground">— {encouragement.ref}</div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up">
        <StatCard icon={CalendarDays} label="Dias concluídos" value={String(doneCount)} accent />
        <StatCard icon={CalendarDays} label="Dias restantes" value={String(daysRemaining)} />
        <StatCard icon={BookOpen} label="Livros completos" value={`${booksDone}/66`} />
        <StatCard icon={BookMarked} label="Capítulos lidos" value={`${chaptersDone}/${TOTAL_CHAPTERS}`} />
        <StatCard icon={BookMarked} label="Versículos lidos" value={versesDone.toLocaleString("pt-BR")} />
        <StatCard icon={Flame} label="Sequência atual" value={`${streak} ${streak === 1 ? "dia" : "dias"}`} accent />
        <StatCard icon={CalendarDays} label="Início" value={formatDatePt(startDate)} />
        <StatCard icon={CalendarDays} label="Conclusão" value={finishDate} />
      </section>

      {/* Schedule */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Plano personalizado</div>
            <h3 className="mt-1 font-serif text-xl text-card-foreground">Próximos dias</h3>
          </div>
          <div className="text-xs text-muted-foreground">{cpd} cap./dia</div>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {upcoming.map((d) => (
            <li key={d.dayIndex} className="flex items-center gap-3 py-3">
              <button
                type="button"
                onClick={() => onMark(d.dayIndex, !d.done)}
                className="shrink-0 text-gold"
                aria-label={d.done ? "Desmarcar" : "Marcar como concluído"}
              >
                {d.done ? <CheckCircle2 className="size-5" /> : <Circle className="size-5 text-muted-foreground" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-xs ${d.dayIndex === currentDayIndex ? "text-gold font-semibold" : "text-muted-foreground"}`}>
                  {d.label}
                </div>
                <div className={`font-serif text-sm md:text-base truncate ${d.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {d.text}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Reminder */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-gold">
            <Bell className="size-5" />
          </span>
          <div className="flex-1">
            <div className="font-serif text-lg text-card-foreground">Lembrete diário</div>
            <p className="text-xs text-muted-foreground">
              Prepare a arquitetura para receber lembretes. Você receberá notificações assim que ativarmos essa etapa.
            </p>
          </div>
          <Switch
            checked={reminder.enabled}
            onCheckedChange={(v) => onReminderChange({ ...reminder, enabled: v })}
            aria-label="Ativar lembrete diário"
          />
        </div>
        {reminder.enabled && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rem-time" className="text-xs uppercase tracking-widest text-muted-foreground">
                Horário do lembrete
              </Label>
              <Input
                id="rem-time"
                type="time"
                value={reminder.time}
                onChange={(e) => onReminderChange({ ...reminder, time: e.target.value })}
                className="mt-2"
              />
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">Prévia</div>
              <div className="mt-1">
                "Palavra+ · {reminder.time} — Está na hora da sua leitura. Hoje: {summarizeReading(todayRefs)}."
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Manage */}
      <section className="rounded-3xl border border-border bg-secondary/40 p-6 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ajustar meta
            </div>
            <p className="mt-1 text-sm text-foreground">
              Meta atual: <span className="font-semibold">{goalDays} dias</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.days}
                type="button"
                variant={p.days === goalDays ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => onGoalChange(p.days)}
              >
                {p.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
              onClick={() => {
                if (confirm("Reiniciar a campanha? Seu progresso será apagado.")) onReset();
              }}
            >
              <RotateCcw className="size-4" />
              Reiniciar
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------- Small building blocks -------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-soft ${
        accent ? "border-gold/40 bg-gold/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5 text-gold" />
        {label}
      </div>
      <div className="mt-2 font-serif text-xl text-foreground">{value}</div>
    </div>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-secondary" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-gold transition-[stroke-dashoffset] duration-700"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-foreground">
        {percent}%
      </div>
    </div>
  );
}