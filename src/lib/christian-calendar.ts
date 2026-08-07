export type ChristianEvent = {
  id: string;
  name: string;
  description: string;
  /** ISO yyyy-mm-dd for the given year */
  date: string;
  category: "celebracao" | "memoria" | "biblia";
  verse?: { ref: string; book: string; chapter: number; verse?: number };
};

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Anonymous Gregorian computus — Easter Sunday for a given year. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/** Every Christian date for a year, with movable feasts derived from Easter. */
export function christianEvents(year: number): ChristianEvent[] {
  const easter = easterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const holyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const ascension = addDays(easter, 39);
  const pentecost = addDays(easter, 49);

  const list: ChristianEvent[] = [
    {
      id: "quarta-cinzas",
      name: "Quarta-feira de Cinzas",
      description: "Início do período de quaresma, marcado por reflexão e arrependimento em diversas tradições cristãs.",
      date: toIso(ashWednesday),
      category: "memoria",
      verse: { ref: "Joel 2:12", book: "jl", chapter: 2, verse: 12 },
    },
    {
      id: "domingo-ramos",
      name: "Domingo de Ramos",
      description: "Memória da entrada de Jesus em Jerusalém, recebido pela multidão com ramos de palmeira.",
      date: toIso(palmSunday),
      category: "memoria",
      verse: { ref: "João 12:13", book: "jo", chapter: 12, verse: 13 },
    },
    {
      id: "quinta-santa",
      name: "Quinta-feira Santa",
      description: "Memória da última ceia de Jesus com os discípulos.",
      date: toIso(holyThursday),
      category: "memoria",
      verse: { ref: "Lucas 22:19", book: "lc", chapter: 22, verse: 19 },
    },
    {
      id: "sexta-paixao",
      name: "Sexta-feira da Paixão",
      description: "Memória da crucificação e morte de Jesus Cristo.",
      date: toIso(goodFriday),
      category: "memoria",
      verse: { ref: "Isaías 53:5", book: "is", chapter: 53, verse: 5 },
    },
    {
      id: "pascoa",
      name: "Páscoa — Ressurreição",
      description: "Celebração da ressurreição de Jesus Cristo, centro da fé cristã.",
      date: toIso(easter),
      category: "celebracao",
      verse: { ref: "Mateus 28:6", book: "mt", chapter: 28, verse: 6 },
    },
    {
      id: "ascensao",
      name: "Ascensão do Senhor",
      description: "Memória da subida de Jesus ao céu, quarenta dias após a ressurreição.",
      date: toIso(ascension),
      category: "memoria",
      verse: { ref: "Atos 1:9", book: "atos", chapter: 1, verse: 9 },
    },
    {
      id: "pentecostes",
      name: "Pentecostes",
      description: "Memória do derramamento do Espírito Santo sobre os discípulos em Jerusalém.",
      date: toIso(pentecost),
      category: "celebracao",
      verse: { ref: "Atos 2:4", book: "atos", chapter: 2, verse: 4 },
    },
    {
      id: "natal",
      name: "Natal",
      description: "Celebração do nascimento de Jesus Cristo.",
      date: iso(year, 12, 25),
      category: "celebracao",
      verse: { ref: "Lucas 2:11", book: "lc", chapter: 2, verse: 11 },
    },
    {
      id: "dia-biblia",
      name: "Dia da Bíblia",
      description: "Data dedicada à leitura e valorização das Escrituras (celebrada no Brasil no 2º domingo de dezembro).",
      date: toIso(secondSundayOfDecember(year)),
      category: "biblia",
      verse: { ref: "Salmos 119:105", book: "sl", chapter: 119, verse: 105 },
    },
    {
      id: "reforma",
      name: "Dia da Reforma Protestante",
      description: "Memória histórica da Reforma Protestante, iniciada em 31 de outubro de 1517.",
      date: iso(year, 10, 31),
      category: "memoria",
      verse: { ref: "Romanos 1:17", book: "rm", chapter: 1, verse: 17 },
    },
    {
      id: "dia-evangelico",
      name: "Dia Nacional do Evangélico",
      description: "Data comemorativa do povo evangélico em muitos estados brasileiros.",
      date: iso(year, 11, 30),
      category: "celebracao",
      verse: { ref: "Marcos 16:15", book: "mc", chapter: 16, verse: 15 },
    },
  ];

  return list.sort((a, b) => a.date.localeCompare(b.date));
}

function secondSundayOfDecember(year: number): Date {
  const d = new Date(Date.UTC(year, 11, 1));
  const firstSundayOffset = (7 - d.getUTCDay()) % 7;
  return new Date(Date.UTC(year, 11, 1 + firstSundayOffset + 7));
}

export const BIRTHDAY_VERSES = [
  { ref: "Salmos 139:14", book: "sl", chapter: 139, verse: 14 },
  { ref: "Lamentações 3:22-23", book: "lm", chapter: 3, verse: 22 },
  { ref: "Números 6:24", book: "nm", chapter: 6, verse: 24 },
  { ref: "Salmos 90:12", book: "sl", chapter: 90, verse: 12 },
] as const;

export function birthdayVerse(seed: number) {
  return BIRTHDAY_VERSES[Math.abs(seed) % BIRTHDAY_VERSES.length];
}
