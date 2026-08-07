import { bibleBooks } from "@/lib/bible-data";

/** Disclaimer shown permanently in the Mentor UI — never a one-off toast. */
export const MENTOR_DISCLAIMER =
  "Eu não sou a voz de Deus. Sou apenas um recurso de apoio para ajudar você a estudar e compreender conteúdos cristãos com base na Bíblia e em informações cristãs confiáveis.";

export const MENTOR_SUGGESTIONS = [
  { emoji: "📖", label: "Explique um versículo", prompt: "Explique o versículo João 3:16 no seu contexto bíblico." },
  { emoji: "📚", label: "Quero entender um capítulo", prompt: "Me ajude a entender o capítulo de Romanos 8." },
  { emoji: "🔎", label: "Me ajude a estudar a Bíblia", prompt: "Como posso começar um estudo bíblico consistente?" },
  { emoji: "🎤", label: "Quero preparar um sermão", prompt: "Me ajude a preparar um sermão sobre a graça de Deus." },
  { emoji: "❓", label: "Tenho uma dúvida bíblica", prompt: "Quem foram os profetas menores e por que são chamados assim?" },
] as const;

export type MentorRef = { ref: string; book: string; chapter: number; verse?: number };
export type MentorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  refs: MentorRef[];
  createdAt: string;
};
export type MentorConversation = { id: string; title: string; updatedAt: string };

/** Normalizes accents/case so "Sao Joao" and "1 João" both resolve. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const BOOK_ALIASES: Record<string, string> = {
  jo: "jo",
  joao: "jo",
  "1 joao": "1jo",
  "2 joao": "2jo",
  "3 joao": "3jo",
  atos: "atos",
  "atos dos apostolos": "atos",
  salmo: "sl",
  salmos: "sl",
  apocalipse: "ap",
  canticos: "ct",
  "cantico dos canticos": "ct",
  cantares: "ct",
  eclesiastes: "ec",
  "1 corintios": "1co",
  "2 corintios": "2co",
  filipenses: "fp",
  colossenses: "cl",
  filemom: "fm",
  tiago: "tg",
  judas: "jd",
  hebreus: "hb",
};

const BOOK_INDEX: Map<string, { id: string; chapters: number }> = (() => {
  const m = new Map<string, { id: string; chapters: number }>();
  for (const b of bibleBooks) {
    m.set(norm(b.name), { id: b.id, chapters: b.chapters });
    m.set(norm(b.abbr), { id: b.id, chapters: b.chapters });
    m.set(norm(b.id), { id: b.id, chapters: b.chapters });
  }
  for (const [alias, id] of Object.entries(BOOK_ALIASES)) {
    const book = bibleBooks.find((b) => b.id === id);
    if (book) m.set(alias, { id: book.id, chapters: book.chapters });
  }
  return m;
})();

/**
 * Extracts real Bible references from free text and validates them against the
 * book index, so a hallucinated "Hesitações 4:2" or "João 99:1" never turns
 * into a broken "Ver na Bíblia" link.
 */
export function extractRefs(text: string): MentorRef[] {
  const out: MentorRef[] = [];
  const seen = new Set<string>();
  const re = /((?:[1-3]\s?)?[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.]*(?:\s[A-Za-zÀ-ÿ]+)?)\s(\d{1,3})(?::(\d{1,3}))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const rawName = m[1].replace(/\./g, "").trim();
    const found = BOOK_INDEX.get(norm(rawName));
    if (!found) continue;
    const chapter = Number(m[2]);
    if (!Number.isFinite(chapter) || chapter < 1 || chapter > found.chapters) continue;
    const verse = m[3] ? Number(m[3]) : undefined;
    const key = `${found.id}:${chapter}:${verse ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const book = bibleBooks.find((b) => b.id === found.id)!;
    out.push({
      ref: `${book.name} ${chapter}${verse ? `:${verse}` : ""}`,
      book: found.id,
      chapter,
      ...(verse ? { verse } : {}),
    });
    if (out.length >= 8) break;
  }
  return out;
}
