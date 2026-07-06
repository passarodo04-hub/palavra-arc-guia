import { useCallback, useEffect, useMemo, useState } from "react";
import { bibleBooks, getBook } from "@/lib/bible-data";

// Static reference numbers for the whole Protestant Bible (Almeida).
export const TOTAL_CHAPTERS = bibleBooks.reduce((n, b) => n + b.chapters, 0); // 1189
export const TOTAL_VERSES = 31102;
// ~72 hours of reading at moderate pace
export const TOTAL_READING_MINUTES = 72 * 60;
export const MINUTES_PER_CHAPTER = TOTAL_READING_MINUTES / TOTAL_CHAPTERS; // ~3.63

export type ChapterRef = { book: string; chapter: number };

// Full canonical sequence of every chapter (Genesis 1 → Apocalipse 22).
let _sequence: ChapterRef[] | null = null;
export function chapterSequence(): ChapterRef[] {
  if (_sequence) return _sequence;
  const out: ChapterRef[] = [];
  for (const b of bibleBooks) {
    for (let c = 1; c <= b.chapters; c++) out.push({ book: b.id, chapter: c });
  }
  _sequence = out;
  return out;
}

export function chaptersPerDay(days: number): number {
  return Math.max(1, Math.ceil(TOTAL_CHAPTERS / Math.max(1, days)));
}

export function readingForDay(dayIndex: number, days: number): ChapterRef[] {
  const seq = chapterSequence();
  const cpd = chaptersPerDay(days);
  const start = dayIndex * cpd;
  return seq.slice(start, start + cpd);
}

/** Human-friendly summary of a day's reading, grouping consecutive chapters per book. */
export function summarizeReading(refs: ChapterRef[]): string {
  if (refs.length === 0) return "—";
  const parts: string[] = [];
  let i = 0;
  while (i < refs.length) {
    const b = refs[i].book;
    let j = i;
    while (j + 1 < refs.length && refs[j + 1].book === b && refs[j + 1].chapter === refs[j].chapter + 1) j++;
    const name = getBook(b)?.name ?? b;
    parts.push(i === j ? `${name} ${refs[i].chapter}` : `${name} ${refs[i].chapter}–${refs[j].chapter}`);
    i = j + 1;
  }
  return parts.join(" · ");
}

export function daysBetween(startISO: string, endISO: string): number {
  const a = new Date(startISO + "T00:00:00").getTime();
  const b = new Date(endISO + "T00:00:00").getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return todayISOFromDate(d);
}

function todayISOFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDatePt(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/*  Persistence — localStorage only (schema-compatible with future    */
/*  cloud sync via reading_history / a future dedicated table)        */
/* ------------------------------------------------------------------ */

export type ReminderSettings = {
  enabled: boolean;
  time: string; // "HH:MM"
};

export type BiblePlanState = {
  active: boolean;
  startDate: string; // ISO YYYY-MM-DD
  goalDays: number;
  completedDays: number[]; // day indices (0-based) marked completed
  reminder: ReminderSettings;
};

const KEY = "palavra-plus:bible-plan";
const EVENT = "bible-plan-changed";

function defaults(): BiblePlanState {
  return {
    active: false,
    startDate: todayISO(),
    goalDays: 365,
    completedDays: [],
    reminder: { enabled: false, time: "07:00" },
  };
}

function read(): BiblePlanState {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<BiblePlanState>;
    return { ...defaults(), ...parsed, reminder: { ...defaults().reminder, ...(parsed.reminder ?? {}) } };
  } catch {
    return defaults();
  }
}

function write(state: BiblePlanState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {}
}

export function useBiblePlan() {
  const [state, setState] = useState<BiblePlanState>(defaults);
  useEffect(() => {
    setState(read());
    const on = () => setState(read());
    window.addEventListener(EVENT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVENT, on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const start = useCallback((goalDays: number, startDate?: string) => {
    const next: BiblePlanState = {
      ...read(),
      active: true,
      goalDays,
      startDate: startDate ?? todayISO(),
      completedDays: [],
    };
    write(next);
  }, []);

  const reset = useCallback(() => {
    write({ ...defaults(), reminder: read().reminder });
  }, []);

  const currentDayIndex = useMemo(() => {
    if (!state.active) return 0;
    const elapsed = Math.floor(
      (Date.now() - new Date(state.startDate + "T00:00:00").getTime()) / 86_400_000,
    );
    return Math.max(0, Math.min(state.goalDays - 1, elapsed));
  }, [state.active, state.startDate, state.goalDays]);

  const markDay = useCallback((dayIndex: number, done: boolean) => {
    const cur = read();
    const set = new Set(cur.completedDays);
    if (done) set.add(dayIndex);
    else set.delete(dayIndex);
    write({ ...cur, completedDays: [...set].sort((a, b) => a - b) });
  }, []);

  const setReminder = useCallback((reminder: ReminderSettings) => {
    write({ ...read(), reminder });
  }, []);

  const setGoal = useCallback((goalDays: number) => {
    write({ ...read(), goalDays });
  }, []);

  return { state, currentDayIndex, start, reset, markDay, setReminder, setGoal };
}

/** Books fully completed given a set of finished day-indices and the plan. */
export function computeBooksCompleted(completedDays: number[], goalDays: number): number {
  if (completedDays.length === 0) return 0;
  const cpd = chaptersPerDay(goalDays);
  const seq = chapterSequence();
  const done = new Set<string>();
  for (const d of completedDays) {
    const start = d * cpd;
    for (let i = start; i < Math.min(start + cpd, seq.length); i++) {
      done.add(`${seq[i].book}:${seq[i].chapter}`);
    }
  }
  let count = 0;
  for (const b of bibleBooks) {
    let all = true;
    for (let c = 1; c <= b.chapters; c++) {
      if (!done.has(`${b.id}:${c}`)) {
        all = false;
        break;
      }
    }
    if (all) count++;
  }
  return count;
}

/** Naive streak: count of consecutive completed days ending at (or just before) currentDayIndex. */
export function computeStreak(completedDays: number[], currentDayIndex: number): number {
  const set = new Set(completedDays);
  let streak = 0;
  for (let d = currentDayIndex; d >= 0; d--) {
    if (set.has(d)) streak++;
    else if (d === currentDayIndex) continue; // today not yet done: keep looking back
    else break;
  }
  return streak;
}

export const ENCOURAGING_VERSES: { text: string; ref: string }[] = [
  { text: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
  { text: "Bem-aventurados antes os que ouvem a palavra de Deus e a guardam.", ref: "Lucas 11:28" },
  { text: "O céu e a terra passarão, mas as minhas palavras não hão de passar.", ref: "Mateus 24:35" },
  { text: "Toda a Escritura é divinamente inspirada e proveitosa para ensinar.", ref: "2 Timóteo 3:16" },
  { text: "A tua palavra é a verdade.", ref: "João 17:17" },
  { text: "Não só de pão viverá o homem, mas de toda palavra que sai da boca de Deus.", ref: "Mateus 4:4" },
  { text: "Como são doces as tuas palavras ao meu paladar!", ref: "Salmos 119:103" },
];

export function dailyEncouragement(dayIndex: number) {
  return ENCOURAGING_VERSES[dayIndex % ENCOURAGING_VERSES.length];
}