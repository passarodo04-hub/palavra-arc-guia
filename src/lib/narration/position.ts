import type { Translation } from "@/lib/bible-data";

export interface NarrationPosition {
  translation: Translation;
  book: string;
  chapter: number;
  verse: number;
  positionSeconds: number;
  updatedAt: number;
}

const STORAGE_KEY = "narration-positions";

/** Positions never mix between translations — the key includes it. */
function keyOf(translation: Translation, book: string, chapter: number) {
  return `${translation}:${book}:${chapter}`;
}

function readAll(): Record<string, NarrationPosition> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, NarrationPosition>) : {};
  } catch {
    return {};
  }
}

export function getNarrationPosition(
  translation: Translation,
  book: string,
  chapter: number,
): NarrationPosition | null {
  return readAll()[keyOf(translation, book, chapter)] ?? null;
}

export function saveNarrationPosition(pos: Omit<NarrationPosition, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    all[keyOf(pos.translation, pos.book, pos.chapter)] = { ...pos, updatedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable — narration still works, just without resume */
  }
}

export function clearNarrationPosition(
  translation: Translation,
  book: string,
  chapter: number,
) {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    delete all[keyOf(translation, book, chapter)];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}
