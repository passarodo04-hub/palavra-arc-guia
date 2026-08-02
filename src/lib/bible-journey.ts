import { bibleBooks, getBook } from "@/lib/bible-data";

/* ------------------------------------------------------------------ *
 *  Jornada Bíblica — presentation/domain layer on top of the user's   *
 *  real chapter reads. Purely derived: no new progress system.        *
 *                                                                     *
 *  Architecture note (future): every stage may later carry `map`,     *
 *  `timeline`, `characters`, `places`, `events` and `badgeId` fields  *
 *  — they are declared optional here so Mapa Bíblico, Linha do Tempo, *
 *  Mochila Espiritual and medals can be added without refactoring.    *
 * ------------------------------------------------------------------ */

export type BibleStage = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  books: string[];
  keyVerse: { text: string; ref: string };
  curiosity?: string;
  /** Reserved for future features — not used yet. */
  badgeId?: string;
  characters?: string[];
  places?: string[];
  events?: { year: string; label: string }[];
};

export const BIBLE_STAGES: BibleStage[] = [
  {
    id: "pentateuco",
    emoji: "📖",
    title: "Pentateuco",
    description:
      "Os primeiros cinco livros da Bíblia: a criação, os patriarcas, a libertação do Egito e a Lei — o fundamento da história do povo de Israel.",
    books: ["gn", "ex", "lv", "nm", "dt"],
    keyVerse: { text: "No princípio criou Deus os céus e a terra.", ref: "Gênesis 1:1" },
    curiosity: "Também chamados de Torá, foram tradicionalmente atribuídos a Moisés.",
  },
  {
    id: "historicos",
    emoji: "👑",
    title: "Históricos",
    description:
      "A conquista da terra, os juízes, a monarquia de Saul, Davi e Salomão, o exílio e o retorno a Jerusalém.",
    books: ["js", "jz", "rt", "1sm", "2sm", "1rs", "2rs", "1cr", "2cr", "ed", "ne", "et"],
    keyVerse: { text: "Eu e a minha casa serviremos ao Senhor.", ref: "Josué 24:15" },
    curiosity: "Cobrem cerca de mil anos de história de Israel.",
  },
  {
    id: "poeticos",
    emoji: "🙏",
    title: "Salmos e Sabedoria",
    description:
      "Poesia, louvor, lamento e sabedoria prática para a vida diária — o coração orante das Escrituras.",
    books: ["job", "sl", "pv", "ec", "ct"],
    keyVerse: { text: "Lâmpada para os meus pés é a tua palavra.", ref: "Salmos 119:105" },
    curiosity: "Salmos é o livro mais longo da Bíblia, com 150 capítulos.",
  },
  {
    id: "profetas-maiores",
    emoji: "🔥",
    title: "Profetas Maiores",
    description:
      "Mensagens de juízo, arrependimento e esperança messiânica proclamadas em tempos de crise nacional.",
    books: ["is", "jr", "lm", "ez", "dn"],
    keyVerse: { text: "Eis-me aqui, envia-me a mim.", ref: "Isaías 6:8" },
    curiosity: "São chamados 'maiores' pela extensão dos livros, não pela importância.",
  },
  {
    id: "profetas-menores",
    emoji: "📯",
    title: "Profetas Menores",
    description:
      "Doze vozes breves e intensas chamando o povo de volta à aliança, à justiça e à misericórdia.",
    books: ["os", "jl", "am", "ob", "jn", "mq", "na", "hc", "sf", "ag", "zc", "ml"],
    keyVerse: { text: "Que é o que o Senhor pede de ti, senão que pratiques a justiça.", ref: "Miquéias 6:8" },
    curiosity: "No cânone hebraico, os doze formam um único livro: 'Os Doze'.",
  },
  {
    id: "evangelhos",
    emoji: "✝️",
    title: "Evangelhos",
    description:
      "A vida, os ensinos, a morte e a ressurreição de Jesus Cristo, contados por quatro testemunhos complementares.",
    books: ["mt", "mc", "lc", "jo"],
    keyVerse: { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.", ref: "João 3:16" },
    curiosity: "Mateus, Marcos e Lucas são chamados sinóticos por 'verem juntos' a mesma narrativa.",
  },
  {
    id: "atos",
    emoji: "🕊️",
    title: "Atos e Igreja Primitiva",
    description:
      "O derramamento do Espírito Santo e a expansão do Evangelho de Jerusalém até os confins da terra.",
    books: ["atos"],
    keyVerse: { text: "Recebereis a virtude do Espírito Santo... e sereis minhas testemunhas.", ref: "Atos 1:8" },
    curiosity: "Lucas escreveu tanto o terceiro Evangelho quanto Atos, formando uma obra em duas partes.",
  },
  {
    id: "cartas-paulinas",
    emoji: "📜",
    title: "Cartas de Paulo",
    description:
      "Doutrina, correção e encorajamento escritos às primeiras igrejas e a companheiros de ministério.",
    books: ["rm", "1co", "2co", "gl", "ef", "fp", "cl", "1ts", "2ts", "1tm", "2tm", "tt", "fm"],
    keyVerse: { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
    curiosity: "Várias delas foram escritas na prisão — as chamadas epístolas da prisão.",
  },
  {
    id: "cartas-gerais",
    emoji: "✉️",
    title: "Cartas Gerais",
    description:
      "Escritos dirigidos à igreja em geral, tratando de fé perseverante, boas obras, amor e verdade.",
    books: ["hb", "tg", "1pe", "2pe", "1jo", "2jo", "3jo", "jd"],
    keyVerse: { text: "A fé sem obras é morta.", ref: "Tiago 2:26" },
    curiosity: "Também conhecidas como epístolas universais ou católicas (no sentido de 'universais').",
  },
  {
    id: "apocalipse",
    emoji: "👑",
    title: "Apocalipse",
    description:
      "A revelação de Jesus Cristo, a esperança final e a promessa de novos céus e nova terra.",
    books: ["ap"],
    keyVerse: { text: "Eis que faço novas todas as coisas.", ref: "Apocalipse 21:5" },
    curiosity: "Foi escrito na ilha de Patmos, onde João estava exilado.",
  },
];

export function stageById(id: string): BibleStage | undefined {
  return BIBLE_STAGES.find((s) => s.id === id);
}

export function stageForBook(bookId: string): BibleStage | undefined {
  return BIBLE_STAGES.find((s) => s.books.includes(bookId));
}

export function chapterKey(book: string, chapter: number): string {
  return `${book}:${chapter}`;
}

export const TOTAL_BIBLE_CHAPTERS = bibleBooks.reduce((n, b) => n + b.chapters, 0);

/* ------------------------- Derived progress ------------------------- */

export type BookProgress = {
  id: string;
  name: string;
  chapters: number;
  read: number;
  percent: number;
  completed: boolean;
  /** first chapter not yet read (for "continuar leitura") */
  nextChapter: number;
};

export type StageProgress = {
  stage: BibleStage;
  index: number;
  totalChapters: number;
  readChapters: number;
  remainingChapters: number;
  percent: number;
  completed: boolean;
  /** unlocked = first stage, or previous stage completed, or already started */
  unlocked: boolean;
  booksCompleted: number;
  books: BookProgress[];
  next?: { book: string; chapter: number };
};

export function bookProgress(bookId: string, read: Set<string>): BookProgress {
  const b = getBook(bookId);
  const chapters = b?.chapters ?? 0;
  let count = 0;
  let nextChapter = 0;
  for (let c = 1; c <= chapters; c++) {
    if (read.has(chapterKey(bookId, c))) count++;
    else if (!nextChapter) nextChapter = c;
  }
  return {
    id: bookId,
    name: b?.name ?? bookId,
    chapters,
    read: count,
    percent: chapters ? Math.round((count / chapters) * 100) : 0,
    completed: chapters > 0 && count >= chapters,
    nextChapter: nextChapter || 1,
  };
}

export function stageProgress(stage: BibleStage, index: number, read: Set<string>): Omit<StageProgress, "unlocked"> {
  const books = stage.books.map((id) => bookProgress(id, read));
  const totalChapters = books.reduce((n, b) => n + b.chapters, 0);
  const readChapters = books.reduce((n, b) => n + b.read, 0);
  const percent = totalChapters ? Math.round((readChapters / totalChapters) * 100) : 0;
  const pending = books.find((b) => !b.completed);
  return {
    stage,
    index,
    totalChapters,
    readChapters,
    remainingChapters: Math.max(0, totalChapters - readChapters),
    percent,
    completed: totalChapters > 0 && readChapters >= totalChapters,
    booksCompleted: books.filter((b) => b.completed).length,
    books,
    next: pending ? { book: pending.id, chapter: pending.nextChapter } : undefined,
  };
}

export type BibleJourneyProgress = {
  stages: StageProgress[];
  readChapters: number;
  totalChapters: number;
  percent: number;
  booksCompleted: number;
  /** xp granted by reading, same rate used by the existing XP system (5 xp/chapter) */
  xp: number;
  current?: StageProgress;
  nextStage?: StageProgress;
};

export const XP_PER_CHAPTER = 5;

export function computeBibleJourney(read: Set<string>): BibleJourneyProgress {
  const raw = BIBLE_STAGES.map((s, i) => stageProgress(s, i, read));
  const stages: StageProgress[] = raw.map((s, i) => ({
    ...s,
    unlocked: i === 0 || raw[i - 1].completed || s.readChapters > 0,
  }));
  const readChapters = stages.reduce((n, s) => n + s.readChapters, 0);
  const totalChapters = stages.reduce((n, s) => n + s.totalChapters, 0);
  const booksCompleted = stages.reduce((n, s) => n + s.booksCompleted, 0);
  const current = stages.find((s) => !s.completed) ?? stages[stages.length - 1];
  const nextStage = current ? stages[current.index + 1] : undefined;
  return {
    stages,
    readChapters,
    totalChapters,
    percent: totalChapters ? Math.round((readChapters / totalChapters) * 100) : 0,
    booksCompleted,
    xp: readChapters * XP_PER_CHAPTER,
    current,
    nextStage,
  };
}
