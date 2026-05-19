export interface BibleBook {
  id: string;
  name: string;
  abbr: string;
  testament: "old" | "new";
  chapters: number;
}

export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

// Static book index (small, ~3KB) — embedded for instant access
export const bibleBooks: BibleBook[] = [
  { id: "gn", abbr: "gn", name: "Gênesis", testament: "old", chapters: 50 },
  { id: "ex", abbr: "ex", name: "Êxodo", testament: "old", chapters: 40 },
  { id: "lv", abbr: "lv", name: "Levítico", testament: "old", chapters: 27 },
  { id: "nm", abbr: "nm", name: "Números", testament: "old", chapters: 36 },
  { id: "dt", abbr: "dt", name: "Deuteronômio", testament: "old", chapters: 34 },
  { id: "js", abbr: "js", name: "Josué", testament: "old", chapters: 24 },
  { id: "jz", abbr: "jz", name: "Juízes", testament: "old", chapters: 21 },
  { id: "rt", abbr: "rt", name: "Rute", testament: "old", chapters: 4 },
  { id: "1sm", abbr: "1sm", name: "1 Samuel", testament: "old", chapters: 31 },
  { id: "2sm", abbr: "2sm", name: "2 Samuel", testament: "old", chapters: 24 },
  { id: "1rs", abbr: "1rs", name: "1 Reis", testament: "old", chapters: 22 },
  { id: "2rs", abbr: "2rs", name: "2 Reis", testament: "old", chapters: 25 },
  { id: "1cr", abbr: "1cr", name: "1 Crônicas", testament: "old", chapters: 29 },
  { id: "2cr", abbr: "2cr", name: "2 Crônicas", testament: "old", chapters: 36 },
  { id: "ed", abbr: "ed", name: "Esdras", testament: "old", chapters: 10 },
  { id: "ne", abbr: "ne", name: "Neemias", testament: "old", chapters: 13 },
  { id: "et", abbr: "et", name: "Ester", testament: "old", chapters: 10 },
  { id: "job", abbr: "jó", name: "Jó", testament: "old", chapters: 42 },
  { id: "sl", abbr: "sl", name: "Salmos", testament: "old", chapters: 150 },
  { id: "pv", abbr: "pv", name: "Provérbios", testament: "old", chapters: 31 },
  { id: "ec", abbr: "ec", name: "Eclesiastes", testament: "old", chapters: 12 },
  { id: "ct", abbr: "ct", name: "Cantares", testament: "old", chapters: 8 },
  { id: "is", abbr: "is", name: "Isaías", testament: "old", chapters: 66 },
  { id: "jr", abbr: "jr", name: "Jeremias", testament: "old", chapters: 52 },
  { id: "lm", abbr: "lm", name: "Lamentações", testament: "old", chapters: 5 },
  { id: "ez", abbr: "ez", name: "Ezequiel", testament: "old", chapters: 48 },
  { id: "dn", abbr: "dn", name: "Daniel", testament: "old", chapters: 12 },
  { id: "os", abbr: "os", name: "Oséias", testament: "old", chapters: 14 },
  { id: "jl", abbr: "jl", name: "Joel", testament: "old", chapters: 3 },
  { id: "am", abbr: "am", name: "Amós", testament: "old", chapters: 9 },
  { id: "ob", abbr: "ob", name: "Obadias", testament: "old", chapters: 1 },
  { id: "jn", abbr: "jn", name: "Jonas", testament: "old", chapters: 4 },
  { id: "mq", abbr: "mq", name: "Miquéias", testament: "old", chapters: 7 },
  { id: "na", abbr: "na", name: "Naum", testament: "old", chapters: 3 },
  { id: "hc", abbr: "hc", name: "Habacuque", testament: "old", chapters: 3 },
  { id: "sf", abbr: "sf", name: "Sofonias", testament: "old", chapters: 3 },
  { id: "ag", abbr: "ag", name: "Ageu", testament: "old", chapters: 2 },
  { id: "zc", abbr: "zc", name: "Zacarias", testament: "old", chapters: 14 },
  { id: "ml", abbr: "ml", name: "Malaquias", testament: "old", chapters: 4 },
  { id: "mt", abbr: "mt", name: "Mateus", testament: "new", chapters: 28 },
  { id: "mc", abbr: "mc", name: "Marcos", testament: "new", chapters: 16 },
  { id: "lc", abbr: "lc", name: "Lucas", testament: "new", chapters: 24 },
  { id: "jo", abbr: "jo", name: "João", testament: "new", chapters: 21 },
  { id: "atos", abbr: "atos", name: "Atos", testament: "new", chapters: 28 },
  { id: "rm", abbr: "rm", name: "Romanos", testament: "new", chapters: 16 },
  { id: "1co", abbr: "1co", name: "1 Coríntios", testament: "new", chapters: 16 },
  { id: "2co", abbr: "2co", name: "2 Coríntios", testament: "new", chapters: 13 },
  { id: "gl", abbr: "gl", name: "Gálatas", testament: "new", chapters: 6 },
  { id: "ef", abbr: "ef", name: "Efésios", testament: "new", chapters: 6 },
  { id: "fp", abbr: "fp", name: "Filipenses", testament: "new", chapters: 4 },
  { id: "cl", abbr: "cl", name: "Colossenses", testament: "new", chapters: 4 },
  { id: "1ts", abbr: "1ts", name: "1 Tessalonicenses", testament: "new", chapters: 5 },
  { id: "2ts", abbr: "2ts", name: "2 Tessalonicenses", testament: "new", chapters: 3 },
  { id: "1tm", abbr: "1tm", name: "1 Timóteo", testament: "new", chapters: 6 },
  { id: "2tm", abbr: "2tm", name: "2 Timóteo", testament: "new", chapters: 4 },
  { id: "tt", abbr: "tt", name: "Tito", testament: "new", chapters: 3 },
  { id: "fm", abbr: "fm", name: "Filemom", testament: "new", chapters: 1 },
  { id: "hb", abbr: "hb", name: "Hebreus", testament: "new", chapters: 13 },
  { id: "tg", abbr: "tg", name: "Tiago", testament: "new", chapters: 5 },
  { id: "1pe", abbr: "1pe", name: "1 Pedro", testament: "new", chapters: 5 },
  { id: "2pe", abbr: "2pe", name: "2 Pedro", testament: "new", chapters: 3 },
  { id: "1jo", abbr: "1jo", name: "1 João", testament: "new", chapters: 5 },
  { id: "2jo", abbr: "2jo", name: "2 João", testament: "new", chapters: 1 },
  { id: "3jo", abbr: "3jo", name: "3 João", testament: "new", chapters: 1 },
  { id: "jd", abbr: "jd", name: "Judas", testament: "new", chapters: 1 },
  { id: "ap", abbr: "ap", name: "Apocalipse", testament: "new", chapters: 22 },
];

const _bookMap = new Map(bibleBooks.map((b) => [b.id, b]));
export function getBook(id: string): BibleBook | undefined {
  return _bookMap.get(id);
}

// === Lazy loading with in-memory cache ===
const _bookCache = new Map<string, Promise<string[][]>>();
export function loadBook(id: string): Promise<string[][]> {
  let p = _bookCache.get(id);
  if (!p) {
    p = fetch(`/data/bible/${id}.json`).then((r) => {
      if (!r.ok) throw new Error("Livro não encontrado");
      return r.json();
    });
    _bookCache.set(id, p);
  }
  return p;
}

export async function loadChapter(id: string, chapter: number): Promise<Chapter | null> {
  const book = await loadBook(id);
  const arr = book[chapter - 1];
  if (!arr) return null;
  return {
    book: id,
    chapter,
    verses: arr.map((text, i) => ({ verse: i + 1, text })),
  };
}

// === Full bible (for search) — fetched once, cached ===
let _allBiblePromise: Promise<Record<string, string[][]>> | null = null;
export async function loadFullBible(): Promise<Record<string, string[][]>> {
  if (!_allBiblePromise) {
    _allBiblePromise = (async () => {
      const out: Record<string, string[][]> = {};
      // Parallel fetch all 66 books (cached individually too)
      await Promise.all(
        bibleBooks.map(async (b) => {
          out[b.id] = await loadBook(b.id);
        })
      );
      return out;
    })();
  }
  return _allBiblePromise;
}

export interface VerseSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export async function searchVerses(query: string, limit = 50): Promise<VerseSearchResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const all = await loadFullBible();
  const results: VerseSearchResult[] = [];
  for (const bookId of Object.keys(all)) {
    const chapters = all[bookId];
    for (let c = 0; c < chapters.length; c++) {
      const verses = chapters[c];
      for (let v = 0; v < verses.length; v++) {
        if (verses[v].toLowerCase().includes(q)) {
          results.push({ book: bookId, chapter: c + 1, verse: v + 1, text: verses[v] });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  return results;
}
