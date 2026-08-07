import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Pencil, BookOpen,
  Bell, BellOff, Check, X, Cake,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/lib/auth-context";
import { getMyProfile } from "@/lib/cloud.functions";
import { christianEvents, birthdayVerse } from "@/lib/christian-calendar";
import {
  EVENT_CATEGORIES, MONTH_NAMES, RECURRENCE_LABELS, REMINDER_OPTIONS, WEEKDAY_SHORT,
  categoryMeta, eventsForDay, formatDayLong, isoOf, monthMatrix, newLocalId,
  readLocalEvents, todayIso, writeLocalEvents,
} from "@/lib/calendar-shared";
import {
  completeCalendarOccurrence, deleteCalendarEvent, listCalendarCompletions,
  listCalendarEvents, upsertCalendarEvent, type PersonalEvent,
} from "@/lib/calendar.functions";
import { useCalendarReminders } from "@/hooks/use-calendar-reminders";

export const Route = createFileRoute("/calendario")({
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Calendário Cristão e agenda pessoal | Palavra+" },
      {
        name: "description",
        content:
          "Datas cristãs calculadas corretamente, seu aniversário e sua agenda pessoal de cultos, orações e estudos — tudo em um só calendário.",
      },
      { property: "og:title", content: "Calendário Cristão — Palavra+" },
      { property: "og:description", content: "Páscoa, Pentecostes, Natal e sua agenda pessoal em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Draft = Omit<PersonalEvent, "id"> & { id?: string };

function emptyDraft(dayIso: string): Draft {
  return {
    title: "",
    description: "",
    category: "culto",
    eventDate: dayIso,
    eventTime: "19:00",
    allDay: false,
    recurrence: "none",
    reminderMinutes: null,
    notes: "",
  };
}

function CalendarPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = todayIso();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState(today);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [localEvents, setLocalEvents] = useState<PersonalEvent[]>([]);

  const fetchEvents = useServerFn(listCalendarEvents);
  const saveEvent = useServerFn(upsertCalendarEvent);
  const removeEvent = useServerFn(deleteCalendarEvent);
  const completeOccurrence = useServerFn(completeCalendarOccurrence);
  const fetchCompletions = useServerFn(listCalendarCompletions);
  const fetchProfile = useServerFn(getMyProfile);

  useEffect(() => setLocalEvents(readLocalEvents()), []);

  const cloudEvents = useQuery({
    queryKey: ["calendar-events", user?.id ?? "anon"],
    queryFn: () => fetchEvents(),
    enabled: !!user,
    staleTime: 30_000,
  });
  const completions = useQuery({
    queryKey: ["calendar-completions", user?.id ?? "anon"],
    queryFn: () => fetchCompletions(),
    enabled: !!user,
    staleTime: 30_000,
  });
  const profile = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  const events = user ? (cloudEvents.data ?? []) : localEvents;
  const { permission, supported, requestPermission } = useCalendarReminders(events);

  const christian = useMemo(() => christianEvents(cursor.year), [cursor.year]);
  const christianByDay = useMemo(() => {
    const m = new Map<string, typeof christian>();
    for (const e of christian) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  }, [christian]);

  const birthDate: string | null = (profile.data as { birth_date?: string | null } | null)?.birth_date ?? null;
  const birthdayThisYear = birthDate ? `${cursor.year}-${birthDate.slice(5)}` : null;
  const isBirthdayToday = !!birthDate && today.slice(5) === birthDate.slice(5);

  const matrix = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor]);
  const dayEvents = eventsForDay(events, selected);
  const dayChristian = christianByDay.get(selected) ?? [];
  const selectedIsBirthday = !!birthDate && selected.slice(5) === birthDate.slice(5);

  const saveMutation = useMutation({
    mutationFn: async (d: Draft) => {
      if (!user) {
        const next = d.id
          ? localEvents.map((e) => (e.id === d.id ? ({ ...d, id: d.id } as PersonalEvent) : e))
          : [...localEvents, { ...d, id: newLocalId() } as PersonalEvent];
        writeLocalEvents(next);
        setLocalEvents(next);
        return;
      }
      await saveEvent({ data: { ...d, ...(d.id ? { id: d.id } : {}) } });
    },
    onSuccess: () => {
      toast.success("Evento salvo.");
      setDraft(null);
      if (user) void qc.invalidateQueries({ queryKey: ["calendar-events", user.id] });
    },
    onError: () => toast.error("Não foi possível salvar o evento."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        const next = localEvents.filter((e) => e.id !== id);
        writeLocalEvents(next);
        setLocalEvents(next);
        return;
      }
      await removeEvent({ data: { id } });
    },
    onSuccess: () => {
      toast.success("Evento excluído.");
      if (user) void qc.invalidateQueries({ queryKey: ["calendar-events", user.id] });
    },
    onError: () => toast.error("Não foi possível excluir o evento."),
  });

  const completeMutation = useMutation({
    mutationFn: (e: PersonalEvent) =>
      completeOccurrence({ data: { eventId: e.id, occurrenceDate: selected, title: e.title } }),
    onSuccess: () => {
      toast.success("Compromisso concluído.");
      void qc.invalidateQueries({ queryKey: ["calendar-completions", user?.id] });
      void qc.invalidateQueries({ queryKey: ["walk"] });
    },
    onError: () => toast.error("Não foi possível registrar a conclusão."),
  });

  const doneSet = new Set(completions.data ?? []);
  const shift = (delta: number) => {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHero
        eyebrow={{ icon: CalendarDays, label: "Calendário" }}
        title="Datas cristãs e sua agenda"
        description="Páscoa, Pentecostes, Natal e seus compromissos pessoais reunidos em um só lugar."
      />

      <div className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        {isBirthdayToday && (
          <section className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
              <Cake className="size-5 text-gold" aria-hidden /> 🎉 Feliz aniversário!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Que este novo ciclo seja cheio de graça, paz, sabedoria e momentos especiais.
            </p>
            {(() => {
              const v = birthdayVerse(new Date(today).getUTCDate());
              return (
                <Link
                  to="/biblia/$book/$chapter"
                  params={{ book: v.book, chapter: String(v.chapter) }}
                  search={{ v: v.verse }}
                  className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-gold/60"
                >
                  <BookOpen className="size-3.5 text-gold" aria-hidden /> {v.ref}
                </Link>
              );
            })()}
          </section>
        )}

        {/* month grid */}
        <section aria-label="Calendário mensal" className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <button
              type="button" onClick={() => shift(-1)} aria-label="Mês anterior"
              className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <h2 className="font-serif text-lg text-foreground">
              {MONTH_NAMES[cursor.month]} {cursor.year}
            </h2>
            <button
              type="button" onClick={() => shift(1)} aria-label="Próximo mês"
              className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {WEEKDAY_SHORT.map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {matrix.flat().map((day, i) => {
              if (day === null) return <span key={`e-${i}`} className="aspect-square" />;
              const iso = isoOf(cursor.year, cursor.month, day);
              const hasPersonal = eventsForDay(events, iso).length > 0;
              const hasChristian = christianByDay.has(iso);
              const isBirthday = birthdayThisYear === iso;
              const isSelected = selected === iso;
              const isToday = today === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelected(iso)}
                  aria-label={`${day} de ${MONTH_NAMES[cursor.month]}`}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  className={[
                    "relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-xl text-sm transition-colors",
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : isToday
                        ? "bg-muted font-semibold text-foreground"
                        : "text-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  {day}
                  <span className="absolute bottom-1 flex gap-0.5">
                    {hasChristian && <span className="size-1 rounded-full bg-gold" aria-hidden />}
                    {hasPersonal && (
                      <span
                        className={`size-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-foreground/60"}`}
                        aria-hidden
                      />
                    )}
                    {isBirthday && <span className="size-1 rounded-full bg-pink-500" aria-hidden />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* reminders */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              {permission === "granted" ? (
                <Bell className="size-4 text-gold" aria-hidden />
              ) : (
                <BellOff className="size-4 text-muted-foreground" aria-hidden />
              )}
              <span>Lembretes por notificação</span>
            </div>
            {!supported ? (
              <p className="text-xs text-muted-foreground">
                Seu navegador não suporta notificações. O calendário continua funcionando normalmente.
              </p>
            ) : permission === "granted" ? (
              <span className="text-xs text-muted-foreground">Ativados neste dispositivo.</span>
            ) : (
              <button
                type="button"
                onClick={() => void requestPermission()}
                className="min-h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Ativar lembretes
              </button>
            )}
          </div>
        </section>

        {/* selected day */}
        <section aria-label="Eventos do dia" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg capitalize text-foreground">{formatDayLong(selected)}</h2>
            <button
              type="button"
              onClick={() => setDraft(emptyDraft(selected))}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              <Plus className="size-4" aria-hidden /> Novo
            </button>
          </div>

          {selectedIsBirthday && (
            <article className="rounded-2xl border border-pink-500/40 bg-pink-500/10 p-4">
              <h3 className="text-sm font-semibold text-foreground">🎂 Seu aniversário</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicionado automaticamente a partir da data de nascimento do seu perfil.
              </p>
            </article>
          )}

          {dayChristian.map((e) => (
            <article key={e.id} className="rounded-2xl border border-gold/40 bg-gold/5 p-4">
              <h3 className="text-sm font-semibold text-foreground">✝️ {e.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
              {e.verse && (
                <Link
                  to="/biblia/$book/$chapter"
                  params={{ book: e.verse.book, chapter: String(e.verse.chapter) }}
                  search={{ v: e.verse.verse }}
                  className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-gold/60"
                >
                  <BookOpen className="size-3.5 text-gold" aria-hidden /> {e.verse.ref}
                </Link>
              )}
            </article>
          ))}

          {dayEvents.map((e) => {
            const meta = categoryMeta(e.category);
            const done = doneSet.has(`${e.id}:${selected}`);
            return (
              <article key={e.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      <span aria-hidden>{meta.emoji}</span> {e.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {e.allDay ? "Dia inteiro" : (e.eventTime ?? "—")} · {meta.label}
                      {e.recurrence !== "none" && ` · ${RECURRENCE_LABELS[e.recurrence]}`}
                      {e.reminderMinutes != null &&
                        ` · ${REMINDER_OPTIONS.find((r) => r.value === e.reminderMinutes)?.label ?? "lembrete"}`}
                    </p>
                    {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
                    {e.notes && <p className="mt-1 text-xs italic text-muted-foreground">{e.notes}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button" aria-label={`Editar ${e.title}`}
                      onClick={() => setDraft({ ...e })}
                      className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button" aria-label={`Excluir ${e.title}`}
                      onClick={() => deleteMutation.mutate(e.id)}
                      className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                {user && (
                  <button
                    type="button"
                    disabled={done || completeMutation.isPending}
                    onClick={() => completeMutation.mutate(e)}
                    className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground disabled:opacity-60"
                  >
                    <Check className="size-3.5" aria-hidden /> {done ? "Concluído" : "Marcar como concluído"}
                  </button>
                )}
              </article>
            );
          })}

          {dayEvents.length === 0 && dayChristian.length === 0 && !selectedIsBirthday && (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum compromisso neste dia.
            </p>
          )}
          {!user && (
            <p className="text-xs text-muted-foreground">
              Como visitante, seus eventos ficam salvos apenas neste dispositivo.{" "}
              <Link to="/login" className="font-medium text-gold hover:underline">Entre na sua conta</Link> para sincronizar.
            </p>
          )}
        </section>

        <section aria-label="Datas cristãs do ano" className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-serif text-lg text-foreground">Datas cristãs de {cursor.year}</h2>
          <ul className="mt-3 space-y-2">
            {christian.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => {
                    const [y, m] = e.date.split("-").map(Number);
                    setCursor({ year: y, month: m - 1 });
                    setSelected(e.date);
                  }}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-muted"
                >
                  <span className="text-sm text-foreground">{e.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {e.date.slice(8)}/{e.date.slice(5, 7)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {draft && (
        <EventDialog
          draft={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={() => saveMutation.mutate(draft)}
          saving={saveMutation.isPending}
        />
      )}

      <BottomNav />
    </div>
  );
}

function EventDialog({
  draft, onChange, onClose, onSave, saving,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="event-dialog-title" className="font-serif text-xl text-foreground">
            {draft.id ? "Editar evento" : "Novo evento"}
          </h2>
          <button
            type="button" onClick={onClose} aria-label="Fechar"
            className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <Field label="Título" htmlFor="ev-title">
            <input
              id="ev-title" required maxLength={160} value={draft.title}
              onChange={(e) => onChange({ ...draft, title: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
            />
          </Field>

          <Field label="Categoria" htmlFor="ev-cat">
            <select
              id="ev-cat" value={draft.category}
              onChange={(e) => onChange({ ...draft, category: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data" htmlFor="ev-date">
              <input
                id="ev-date" type="date" required value={draft.eventDate}
                onChange={(e) => onChange({ ...draft, eventDate: e.target.value })}
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
              />
            </Field>
            <Field label="Horário" htmlFor="ev-time">
              <input
                id="ev-time" type="time" disabled={draft.allDay} value={draft.eventTime ?? ""}
                onChange={(e) => onChange({ ...draft, eventTime: e.target.value || null })}
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold disabled:opacity-50"
              />
            </Field>
          </div>

          <label className="flex min-h-11 items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox" checked={draft.allDay}
              onChange={(e) => onChange({ ...draft, allDay: e.target.checked })}
              className="size-5 rounded border-border accent-[hsl(var(--primary))]"
            />
            Evento de dia inteiro
          </label>

          <Field label="Repetição" htmlFor="ev-rec">
            <select
              id="ev-rec" value={draft.recurrence}
              onChange={(e) => onChange({ ...draft, recurrence: e.target.value as PersonalEvent["recurrence"] })}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
            >
              {Object.entries(RECURRENCE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>

          <Field label="Lembrete" htmlFor="ev-rem">
            <select
              id="ev-rem" value={draft.reminderMinutes ?? ""}
              onChange={(e) =>
                onChange({ ...draft, reminderMinutes: e.target.value === "" ? null : Number(e.target.value) })
              }
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold"
            >
              {REMINDER_OPTIONS.map((r) => (
                <option key={r.label} value={r.value ?? ""}>{r.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Descrição" htmlFor="ev-desc">
            <textarea
              id="ev-desc" rows={2} maxLength={2000} value={draft.description}
              onChange={(e) => onChange({ ...draft, description: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </Field>

          <Field label="Observação" htmlFor="ev-notes">
            <textarea
              id="ev-notes" rows={2} maxLength={2000} value={draft.notes}
              onChange={(e) => onChange({ ...draft, notes: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="min-h-11 flex-1 rounded-xl border border-border text-sm font-medium text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={saving || draft.title.trim().length === 0}
              className="min-h-11 flex-1 rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
