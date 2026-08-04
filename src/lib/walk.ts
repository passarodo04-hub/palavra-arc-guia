import type { CampaignsState } from "@/lib/campaigns";
import {
  activityMap,
  computeDateStreak,
  computeXP,
  summarizeCampaigns,
  type XPInfo,
} from "@/lib/campaigns";
import { bookProgress, chapterKey, TOTAL_BIBLE_CHAPTERS } from "@/lib/bible-journey";
import { bibleBooks } from "@/lib/bible-data";

/* ------------------------------------------------------------------ *
 *  Minha Caminhada — a READ-ONLY layer over the systems that already  *
 *  exist (XP, streaks, campaigns, bible chapter reads, profile).      *
 *  It never computes a second XP curve and never writes progress:     *
 *  the only thing it persists is *what the user already earned*       *
 *  (unlocks) and *what really happened* (timeline events).            *
 * ------------------------------------------------------------------ */

export type WalkCategory =
  | "biblia"
  | "oracao"
  | "gratidao"
  | "jornada"
  | "conquista"
  | "mochila"
  | "sequencia"
  | "outros";

export const CATEGORY_META: Record<WalkCategory, { emoji: string; label: string }> = {
  biblia: { emoji: "📖", label: "Bíblia" },
  oracao: { emoji: "🙏", label: "Oração" },
  gratidao: { emoji: "❤️", label: "Gratidão" },
  jornada: { emoji: "🛤️", label: "Jornada" },
  conquista: { emoji: "🏆", label: "Conquista" },
  mochila: { emoji: "🎒", label: "Mochila" },
  sequencia: { emoji: "🔥", label: "Sequência" },
  outros: { emoji: "📅", label: "Outros" },
};

/* Reserved for modules that will ship later (Mapa Bíblico, Linha do Tempo,
 * Comunidade, Calendário, Quiz, Mentor IA, Família, Áudio, Modo Peregrino).
 * They only need to call `recordWalkEvent` with one of the categories above
 * and, when they exist, provide the counters below. Until then these stay 0. */
export type FutureCounters = {
  placesDiscovered: number;
  timelineEventsDiscovered: number;
};

export type WalkStats = XPInfo & {
  currentStreak: number;
  longestStreak: number;
  chaptersRead: number;
  totalChapters: number;
  biblePercent: number;
  booksCompleted: number;
  gospelsCompleted: number;
  prayersLogged: number;
  gratitudeLogged: number;
  journeysCompleted: number;
  activeDays: number;
  favoriteVerses: number;
  /** future modules — real data only, 0 until the module exists */
  placesDiscovered: number;
  timelineEventsDiscovered: number;
};

const GOSPELS = ["mt", "mc", "lc", "jo"];

export function computeWalkStats(input: {
  campaigns: CampaignsState;
  readSet: Set<string>;
  favoriteVerses: number;
  journeysCompleted: number;
  future?: Partial<FutureCounters>;
}): WalkStats {
  const { campaigns, readSet, favoriteVerses, journeysCompleted } = input;
  const xp = computeXP(campaigns);
  const summary = summarizeCampaigns(campaigns);

  const books = bibleBooks.map((b) => bookProgress(b.id, readSet));
  const chaptersRead = books.reduce((n, b) => n + b.read, 0);
  const booksCompleted = books.filter((b) => b.completed).length;
  const gospelsCompleted = books.filter((b) => GOSPELS.includes(b.id) && b.completed).length;

  const prayer = campaigns["oracao"];
  const grat = campaigns["gratidao"];
  const prayersLogged = Math.max(prayer?.sessions ?? 0, prayer?.completedDates?.length ?? 0);
  const gratitudeLogged = Math.max(
    grat?.completedDates?.length ?? 0,
    (grat?.entries ?? []).reduce((n, e) => n + (e.items?.length ?? 0), 0),
  );

  return {
    ...xp,
    currentStreak: summary.currentStreak,
    longestStreak: summary.longestStreak,
    chaptersRead,
    totalChapters: TOTAL_BIBLE_CHAPTERS,
    biblePercent: TOTAL_BIBLE_CHAPTERS ? Math.round((chaptersRead / TOTAL_BIBLE_CHAPTERS) * 100) : 0,
    booksCompleted,
    gospelsCompleted,
    prayersLogged,
    gratitudeLogged,
    journeysCompleted,
    activeDays: activityMap(campaigns).size,
    favoriteVerses,
    placesDiscovered: input.future?.placesDiscovered ?? 0,
    timelineEventsDiscovered: input.future?.timelineEventsDiscovered ?? 0,
  };
}

/* ------------------------------ Unlockables ------------------------------ */

export type Unlockable = {
  id: string;
  kind: "achievement" | "item";
  emoji: string;
  name: string;
  description: string;
  requirement: string;
  category: WalkCategory;
  /** false = depends on a module that does not exist yet; never unlockable */
  available: boolean;
  check: (s: WalkStats) => boolean;
};

export const ACHIEVEMENTS: Unlockable[] = [
  {
    id: "first-verse",
    kind: "achievement",
    emoji: "🌱",
    name: "Primeiro versículo",
    description: "O começo de tudo: um versículo guardado no coração.",
    requirement: "Favorite um versículo ou leia o seu primeiro capítulo.",
    category: "biblia",
    available: true,
    check: (s) => s.favoriteVerses >= 1 || s.chaptersRead >= 1,
  },
  {
    id: "first-chapter",
    kind: "achievement",
    emoji: "📖",
    name: "Primeiro capítulo",
    description: "Você marcou o seu primeiro capítulo como lido.",
    requirement: "Marcar 1 capítulo como lido.",
    category: "biblia",
    available: true,
    check: (s) => s.chaptersRead >= 1,
  },
  {
    id: "streak-7",
    kind: "achievement",
    emoji: "🔥",
    name: "7 dias seguidos",
    description: "Uma semana inteira de constância.",
    requirement: "Manter 7 dias consecutivos de caminhada.",
    category: "sequencia",
    available: true,
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: "streak-30",
    kind: "achievement",
    emoji: "🔥",
    name: "30 dias seguidos",
    description: "Um mês caminhando sem parar.",
    requirement: "Manter 30 dias consecutivos de caminhada.",
    category: "sequencia",
    available: true,
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: "streak-100",
    kind: "achievement",
    emoji: "🔥",
    name: "100 dias de caminhada",
    description: "Cem dias de fidelidade construída no silêncio da rotina.",
    requirement: "Manter 100 dias consecutivos de caminhada.",
    category: "sequencia",
    available: true,
    check: (s) => s.longestStreak >= 100,
  },
  {
    id: "prayer-1",
    kind: "achievement",
    emoji: "🙏",
    name: "Primeira oração registrada",
    description: "Você reservou um tempo para orar e registrou.",
    requirement: "Registrar 1 oração.",
    category: "oracao",
    available: true,
    check: (s) => s.prayersLogged >= 1,
  },
  {
    id: "prayer-10",
    kind: "achievement",
    emoji: "🙏",
    name: "10 orações registradas",
    description: "A oração está virando hábito.",
    requirement: "Registrar 10 orações.",
    category: "oracao",
    available: true,
    check: (s) => s.prayersLogged >= 10,
  },
  {
    id: "prayer-100",
    kind: "achievement",
    emoji: "🙏",
    name: "100 orações registradas",
    description: "Uma vida de oração se formando.",
    requirement: "Registrar 100 orações.",
    category: "oracao",
    available: true,
    check: (s) => s.prayersLogged >= 100,
  },
  {
    id: "gratitude-1",
    kind: "achievement",
    emoji: "❤️",
    name: "Primeira gratidão registrada",
    description: "Reconhecer o bem recebido também é adoração.",
    requirement: "Registrar 1 motivo de gratidão.",
    category: "gratidao",
    available: true,
    check: (s) => s.gratitudeLogged >= 1,
  },
  {
    id: "journey-1",
    kind: "achievement",
    emoji: "📚",
    name: "Primeira Jornada concluída",
    description: "Você levou uma Jornada até o fim.",
    requirement: "Concluir 1 Jornada.",
    category: "jornada",
    available: true,
    check: (s) => s.journeysCompleted >= 1,
  },
  {
    id: "book-1",
    kind: "achievement",
    emoji: "📕",
    name: "Primeiro livro bíblico concluído",
    description: "Um livro inteiro da Bíblia, do começo ao fim.",
    requirement: "Concluir 1 livro da Bíblia.",
    category: "biblia",
    available: true,
    check: (s) => s.booksCompleted >= 1,
  },
  {
    id: "gospel-1",
    kind: "achievement",
    emoji: "👑",
    name: "Primeiro Evangelho concluído",
    description: "Mateus, Marcos, Lucas ou João — lido por completo.",
    requirement: "Concluir 1 dos quatro Evangelhos.",
    category: "biblia",
    available: true,
    check: (s) => s.gospelsCompleted >= 1,
  },
  {
    id: "level-10",
    kind: "achievement",
    emoji: "⭐",
    name: "Nível 10",
    description: "Sua caminhada já tem história.",
    requirement: "Alcançar o nível 10.",
    category: "outros",
    available: true,
    check: (s) => s.level >= 10,
  },
  {
    id: "level-25",
    kind: "achievement",
    emoji: "⭐",
    name: "Nível 25",
    description: "Constância que se vê de longe.",
    requirement: "Alcançar o nível 25.",
    category: "outros",
    available: true,
    check: (s) => s.level >= 25,
  },
  {
    id: "level-50",
    kind: "achievement",
    emoji: "⭐",
    name: "Nível 50",
    description: "Uma caminhada longa e fiel.",
    requirement: "Alcançar o nível 50.",
    category: "outros",
    available: true,
    check: (s) => s.level >= 50,
  },
];

export const BACKPACK_ITEMS: Unlockable[] = [
  {
    id: "seed-faith",
    kind: "item",
    emoji: "🌱",
    name: "Semente da Fé",
    description: "Representa o início: toda caminhada começa com um primeiro passo.",
    requirement: "Ler o primeiro capítulo da Bíblia no app.",
    category: "biblia",
    available: true,
    check: (s) => s.chaptersRead >= 1,
  },
  {
    id: "peace-branch",
    kind: "item",
    emoji: "🕊️",
    name: "Ramo da Paz",
    description: "Representa o descanso que nasce de entregar o dia em oração.",
    requirement: "Registrar a primeira oração.",
    category: "oracao",
    available: true,
    check: (s) => s.prayersLogged >= 1,
  },
  {
    id: "love-heart",
    kind: "item",
    emoji: "❤️",
    name: "Coração do Amor",
    description: "Representa o coração grato que reconhece o cuidado de Deus.",
    requirement: "Registrar o primeiro motivo de gratidão.",
    category: "gratidao",
    available: true,
    check: (s) => s.gratitudeLogged >= 1,
  },
  {
    id: "wisdom-scroll",
    kind: "item",
    emoji: "📜",
    name: "Pergaminho da Sabedoria",
    description: "Representa o entendimento que vem de percorrer as Escrituras inteiras.",
    requirement: "Concluir um livro completo da Bíblia.",
    category: "biblia",
    available: true,
    check: (s) => s.booksCompleted >= 1,
  },
  {
    id: "perseverance-shield",
    kind: "item",
    emoji: "🛡️",
    name: "Escudo da Perseverança",
    description: "Representa a constância de continuar caminhando mesmo nos dias difíceis.",
    requirement: "Completar 7 dias consecutivos de caminhada.",
    category: "sequencia",
    available: true,
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: "perseverance-crown",
    kind: "item",
    emoji: "👑",
    name: "Coroa da Perseverança",
    description: "Representa a fidelidade sustentada por um mês inteiro de caminhada.",
    requirement: "Completar 30 dias consecutivos de caminhada.",
    category: "sequencia",
    available: true,
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: "spirit-sword",
    kind: "item",
    emoji: "⚔️",
    name: "Espada do Espírito",
    description: "Representa a Palavra viva conhecida por inteiro em um dos Evangelhos.",
    requirement: "Concluir um dos quatro Evangelhos.",
    category: "biblia",
    available: true,
    check: (s) => s.gospelsCompleted >= 1,
  },
];

export const ALL_UNLOCKABLES = [...ACHIEVEMENTS, ...BACKPACK_ITEMS];

export function unlockableById(kind: "achievement" | "item", id: string): Unlockable | undefined {
  return ALL_UNLOCKABLES.find((u) => u.kind === kind && u.id === id);
}

export type UnlockRecord = { kind: "achievement" | "item"; unlockId: string; unlockedAt: string };

export type ResolvedUnlockable = Unlockable & { unlocked: boolean; unlockedAt?: string };

export function resolveUnlockables(
  list: Unlockable[],
  stats: WalkStats,
  records: Map<string, string>,
): ResolvedUnlockable[] {
  return list.map((u) => {
    const key = `${u.kind}:${u.id}`;
    const at = records.get(key);
    const unlocked = !!at || (u.available && u.check(stats));
    return { ...u, unlocked, unlockedAt: at };
  });
}

/** Everything the user has really earned but that is not persisted yet. */
export function pendingUnlocks(stats: WalkStats, records: Map<string, string>): Unlockable[] {
  return ALL_UNLOCKABLES.filter(
    (u) => u.available && u.check(stats) && !records.has(`${u.kind}:${u.id}`),
  );
}

/* ------------------------------ Timeline ------------------------------ */

export type WalkTimelineEvent = {
  id: string;
  date: string; // ISO YYYY-MM-DD
  category: WalkCategory;
  icon: string;
  title: string;
  detail?: string;
};

function isoFrom(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts.slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function buildTimeline(input: {
  reads: { book: string; chapter: number; readAt: string }[];
  campaigns: CampaignsState;
  storedEvents: { id: string; category: WalkCategory; title: string; detail: string; icon: string; eventDate: string }[];
  bookName: (id: string) => string;
}): { date: string; events: WalkTimelineEvent[] }[] {
  const events: WalkTimelineEvent[] = [];

  for (const r of input.reads) {
    events.push({
      id: `read:${r.book}:${r.chapter}`,
      date: isoFrom(r.readAt),
      category: "biblia",
      icon: "📖",
      title: `Li ${input.bookName(r.book)} ${r.chapter}.`,
    });
  }

  const push = (dates: string[] | undefined, category: WalkCategory, icon: string, title: string) => {
    for (const d of dates ?? []) events.push({ id: `${category}:${d}`, date: d, category, icon, title });
  };
  push(input.campaigns["oracao"]?.completedDates, "oracao", "🙏", "Fiz minha oração.");
  push(input.campaigns["gratidao"]?.completedDates, "gratidao", "❤️", "Registrei um motivo de gratidão.");
  push(input.campaigns["devocional-diario"]?.completedDates, "outros", "📅", "Concluí o devocional do dia.");

  for (const e of input.storedEvents) {
    events.push({
      id: `stored:${e.id}`,
      date: e.eventDate,
      category: e.category,
      icon: e.icon || CATEGORY_META[e.category].emoji,
      title: e.title,
      detail: e.detail || undefined,
    });
  }

  const byDate = new Map<string, WalkTimelineEvent[]>();
  for (const e of events) {
    const arr = byDate.get(e.date) ?? [];
    arr.push(e);
    byDate.set(e.date, arr);
  }
  return Array.from(byDate.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, evs]) => ({ date, events: evs }));
}

export function formatDayPt(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function walkStreakOf(campaigns: CampaignsState): number {
  return Math.max(
    computeDateStreak(campaigns["devocional-diario"]?.completedDates),
    computeDateStreak(campaigns["oracao"]?.completedDates),
    computeDateStreak(campaigns["gratidao"]?.completedDates),
  );
}

export function chapterKeyOf(book: string, chapter: number): string {
  return chapterKey(book, chapter);
}

export const WALK_MOTIVATIONS: string[] = [
  "Cada passo dado com Deus permanece para sempre.",
  "A sua caminhada é feita de dias comuns vividos com fé.",
  "Um pouco a cada dia constrói uma vida inteira.",
  "Deus caminha com você — inclusive hoje.",
  "O que você planta na rotina, colhe na história.",
];

export function walkMotivation(): string {
  return WALK_MOTIVATIONS[Math.floor(Date.now() / 86_400_000) % WALK_MOTIVATIONS.length];
}