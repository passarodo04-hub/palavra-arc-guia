import { useCallback, useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Universal campaign state — one localStorage key for every non-    */
/*  Bible-plan campaign. The Bible-plan campaign keeps its own key,   */
/*  but we surface its progress here for the dashboard/achievements.  */
/* ------------------------------------------------------------------ */

export type CampaignData = {
  active?: boolean;
  startedAt?: number;
  updatedAt?: number;
  // daily check-in style
  completedDates?: string[]; // ISO YYYY-MM-DD
  goalDays?: number;
  // counter style
  counter?: number;
  target?: number;
  // timer style
  totalMinutes?: number;
  sessions?: number;
  lastSessionAt?: number;
  preferredMinutes?: number;
  preferredTime?: string;
  // dated (fasting)
  variant?: string;
  startDate?: string;
  endDate?: string;
  purpose?: string;
  notes?: string;
  // quiz
  correct?: number;
  wrong?: number;
  currentStreak?: number;
  bestStreak?: number;
  difficulty?: string;
  // gratitude / journal
  entries?: { date: string; items: string[] }[];
  // sub-goals / topics
  subGoals?: Record<string, boolean>;
  // free-form
  meta?: Record<string, unknown>;
};

export type CampaignsState = Record<string, CampaignData>;

const KEY = "palavra-plus:campaigns";
const EVENT = "palavra-plus:campaigns-changed";

function read(): CampaignsState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CampaignsState) : {};
  } catch {
    return {};
  }
}

function write(state: CampaignsState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {}
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useAllCampaigns(): CampaignsState {
  const [state, setState] = useState<CampaignsState>({});
  useEffect(() => {
    setState(read());
    return subscribe(() => setState(read()));
  }, []);
  return state;
}

export function useCampaign(id: string) {
  const [data, setData] = useState<CampaignData>({});
  useEffect(() => {
    setData(read()[id] ?? {});
    return subscribe(() => setData(read()[id] ?? {}));
  }, [id]);

  const patch = useCallback(
    (partial: Partial<CampaignData> | ((prev: CampaignData) => Partial<CampaignData>)) => {
      const cur = read();
      const prev = cur[id] ?? {};
      const delta = typeof partial === "function" ? partial(prev) : partial;
      const next: CampaignData = { ...prev, ...delta, updatedAt: Date.now() };
      write({ ...cur, [id]: next });
    },
    [id],
  );

  const reset = useCallback(() => {
    const cur = read();
    const next = { ...cur };
    delete next[id];
    write(next);
  }, [id]);

  const start = useCallback(
    (initial?: Partial<CampaignData>) => {
      patch({ active: true, startedAt: Date.now(), ...(initial ?? {}) });
    },
    [patch],
  );

  return { data, patch, reset, start };
}

/* ------------------------ Date helpers ------------------------ */

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysBetween(a: string, b: string): number {
  const ta = new Date(a + "T00:00:00").getTime();
  const tb = new Date(b + "T00:00:00").getTime();
  return Math.max(0, Math.round((tb - ta) / 86_400_000));
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

/** Streak of consecutive days ending at today (or yesterday if today missing). */
export function computeDateStreak(dates: string[] | undefined): number {
  if (!dates || dates.length === 0) return 0;
  const set = new Set(dates);
  const today = todayISO();
  let streak = 0;
  let cursor = set.has(today) ? 0 : 1;
  for (;;) {
    const d = daysAgoISO(cursor);
    if (set.has(d)) {
      streak++;
      cursor++;
    } else {
      break;
    }
  }
  return streak;
}

export function countInMonth(dates: string[] | undefined, ref = new Date()): number {
  if (!dates) return 0;
  const y = ref.getFullYear();
  const m = ref.getMonth();
  return dates.filter((d) => {
    const dt = new Date(d + "T00:00:00");
    return dt.getFullYear() === y && dt.getMonth() === m;
  }).length;
}

export function countInYear(dates: string[] | undefined, ref = new Date()): number {
  if (!dates) return 0;
  const y = ref.getFullYear();
  return dates.filter((d) => new Date(d + "T00:00:00").getFullYear() === y).length;
}

/* ------------------------ Campaign registry ------------------------ */

export type CampaignMeta = {
  id: string;
  route: string;
  title: string;
  short?: string;
  category: string;
};

export const CAMPAIGNS: CampaignMeta[] = [
  { id: "leia-biblia", route: "/campanhas/leia-biblia", title: "Leia toda a Bíblia", category: "Leitura" },
  { id: "devocional-diario", route: "/campanhas/devocional-diario", title: "Devocional Diário", category: "Devocional" },
  { id: "oracao", route: "/campanhas/oracao", title: "Rotina de Oração", category: "Oração" },
  { id: "jejum", route: "/campanhas/jejum", title: "Jejum", category: "Jejum" },
  { id: "harpa-desafio", route: "/campanhas/harpa-desafio", title: "Desafio da Harpa", category: "Harpa" },
  { id: "conhecimento", route: "/campanhas/conhecimento", title: "Conhecimento Bíblico", category: "Conhecimento" },
  { id: "quiz", route: "/campanhas/quiz", title: "Quiz Bíblico", category: "Quiz" },
  { id: "gratidao", route: "/campanhas/gratidao", title: "Diário de Gratidão", category: "Gratidão" },
  { id: "crescimento", route: "/campanhas/crescimento", title: "Crescimento Espiritual", category: "Crescimento" },
  { id: "familia", route: "/campanhas/familia", title: "Família", category: "Família" },
  { id: "casais", route: "/campanhas/casais", title: "Casais", category: "Casais" },
  { id: "criancas", route: "/campanhas/criancas", title: "Crianças", category: "Crianças" },
];

export function campaignById(id: string): CampaignMeta | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

/* ------------------------ Bible-plan bridge ------------------------ */

type MinimalBiblePlan = {
  active?: boolean;
  startDate?: string;
  goalDays?: number;
  completedDays?: number[];
};

export function readBiblePlanRaw(): MinimalBiblePlan {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("palavra-plus:bible-plan") ?? "{}");
  } catch {
    return {};
  }
}

/* ------------------------ Achievements ------------------------ */

export type Badge = {
  id: string;
  emoji: string;
  label: string;
  description: string;
};

export const BADGES: Badge[] = [
  { id: "first-book", emoji: "📖", label: "Primeiro Livro", description: "Complete um livro inteiro da Bíblia." },
  { id: "7-prayer", emoji: "🙏", label: "7 Dias de Oração", description: "Ore por 7 dias consecutivos." },
  { id: "first-fast", emoji: "🍞", label: "Primeiro Jejum", description: "Conclua o seu primeiro jejum." },
  { id: "50-hymns", emoji: "🎵", label: "50 Hinos", description: "Alcance 50 hinos no desafio da Harpa." },
  { id: "bible-scholar", emoji: "🧠", label: "Estudioso da Bíblia", description: "Acerte 50 respostas no Quiz." },
  { id: "gratitude-week", emoji: "❤️", label: "Semana de Gratidão", description: "Registre gratidão por 7 dias." },
  { id: "streak-30", emoji: "🔥", label: "Sequência de 30 dias", description: "Mantenha 30 dias seguidos de devocional." },
  { id: "family-warrior", emoji: "👨‍👩‍👧", label: "Guerreiro da Família", description: "10 momentos em família registrados." },
];

export type EarnedBadge = Badge & { earned: boolean };

export function evaluateBadges(state: CampaignsState): EarnedBadge[] {
  const dev = state["devocional-diario"];
  const prayer = state["oracao"];
  const fast = state["jejum"];
  const harpa = state["harpa-desafio"];
  const quiz = state["quiz"];
  const grat = state["gratidao"];
  const fam = state["familia"];
  const plan = readBiblePlanRaw();

  const devStreak = computeDateStreak(dev?.completedDates);
  const prayerStreak = computeDateStreak(prayer?.completedDates);
  const gratStreak = computeDateStreak(grat?.completedDates);
  const famDays = fam?.completedDates?.length ?? 0;

  const conditions: Record<string, boolean> = {
    "first-book": (plan.completedDays?.length ?? 0) > 0 && !!plan.active
      ? (plan.completedDays!.length * Math.ceil(1189 / (plan.goalDays ?? 365))) >= 50
      : false,
    "7-prayer": prayerStreak >= 7 || (prayer?.sessions ?? 0) >= 7,
    "first-fast": !!fast?.endDate && new Date(fast.endDate + "T00:00:00").getTime() < Date.now(),
    "50-hymns": (harpa?.counter ?? 0) >= 50,
    "bible-scholar": (quiz?.correct ?? 0) >= 50,
    "gratitude-week": gratStreak >= 7,
    "streak-30": devStreak >= 30,
    "family-warrior": famDays >= 10,
  };
  return BADGES.map((b) => ({ ...b, earned: !!conditions[b.id] }));
}

/* ------------------------ Dashboard summary ------------------------ */

export type CampaignsSummary = {
  activeCount: number;
  completedCount: number;
  longestStreak: number;
  currentStreak: number;
  readingMinutes: number;
  prayerMinutes: number;
  devocionaisCompletos: number;
  quizAcertos: number;
  hinosCompletos: number;
};

export function summarizeCampaigns(state: CampaignsState): CampaignsSummary {
  const dev = state["devocional-diario"];
  const prayer = state["oracao"];
  const quiz = state["quiz"];
  const harpa = state["harpa-desafio"];
  const plan = readBiblePlanRaw();

  const devStreak = computeDateStreak(dev?.completedDates);
  const prayerStreak = computeDateStreak(prayer?.completedDates);
  const gratStreak = computeDateStreak(state["gratidao"]?.completedDates);
  const streaks = [devStreak, prayerStreak, gratStreak];
  const currentStreak = Math.max(0, ...streaks);

  // longest = size of largest run in any date list we know about
  const longestStreak = Math.max(
    currentStreak,
    longestRun(dev?.completedDates),
    longestRun(prayer?.completedDates),
    longestRun(state["gratidao"]?.completedDates),
    longestRun(state["familia"]?.completedDates),
  );

  const activeCount =
    Object.values(state).filter((c) => c?.active).length + (plan.active ? 1 : 0);

  // A campaign is "completed" if it has an endDate in the past, or reached target/goalDays.
  let completedCount = 0;
  for (const [, c] of Object.entries(state)) {
    if (!c) continue;
    if (c.endDate && new Date(c.endDate + "T00:00:00").getTime() < Date.now()) completedCount++;
    else if (c.target && (c.counter ?? 0) >= c.target) completedCount++;
    else if (c.goalDays && (c.completedDates?.length ?? 0) >= c.goalDays) completedCount++;
  }

  // Reading minutes: derived from bible-plan progress (~3.63 min/chapter)
  const cpd = plan.goalDays ? Math.max(1, Math.ceil(1189 / plan.goalDays)) : 0;
  const chaptersDone = Math.min(1189, (plan.completedDays?.length ?? 0) * cpd);
  const readingMinutes = Math.round(chaptersDone * 3.63);

  return {
    activeCount,
    completedCount,
    longestStreak,
    currentStreak,
    readingMinutes,
    prayerMinutes: prayer?.totalMinutes ?? 0,
    devocionaisCompletos: dev?.completedDates?.length ?? 0,
    quizAcertos: quiz?.correct ?? 0,
    hinosCompletos: harpa?.counter ?? 0,
  };
}

function longestRun(dates: string[] | undefined): number {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00").getTime();
    const cur = new Date(sorted[i] + "T00:00:00").getTime();
    if (Math.round((cur - prev) / 86_400_000) === 1) run++;
    else run = 1;
    if (run > best) best = run;
  }
  return best;
}

/* ------------------------ Encouraging verses ------------------------ */

export const CAMPAIGN_VERSES: { text: string; ref: string }[] = [
  { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { text: "O Senhor é o meu pastor; nada me faltará.", ref: "Salmos 23:1" },
  { text: "Confia no Senhor de todo o teu coração.", ref: "Provérbios 3:5" },
  { text: "Buscai primeiro o Reino de Deus e a sua justiça.", ref: "Mateus 6:33" },
  { text: "Sede fortes e corajosos; não temais.", ref: "Deuteronômio 31:6" },
  { text: "Bem-aventurado o homem que tem no Senhor a sua confiança.", ref: "Salmos 40:4" },
  { text: "Deleita-te também no Senhor, e Ele te concederá o que deseja o teu coração.", ref: "Salmos 37:4" },
  { text: "Regozijai-vos sempre. Orai sem cessar. Em tudo dai graças.", ref: "1 Ts 5:16-18" },
];

export function verseForDay(seed = 0) {
  const idx = (Math.floor(Date.now() / 86_400_000) + seed) % CAMPAIGN_VERSES.length;
  return CAMPAIGN_VERSES[idx];
}