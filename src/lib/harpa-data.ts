export interface HymnIndexEntry {
  id: number;
  title: string;
}

export interface Hymn {
  id: number;
  title: string;
  chorus: string | null;
  stanzas: string[];
}

let _indexPromise: Promise<HymnIndexEntry[]> | null = null;
export function loadHymnIndex(): Promise<HymnIndexEntry[]> {
  if (!_indexPromise) {
    _indexPromise = fetch("/data/harpa/index.json").then((r) => r.json());
  }
  return _indexPromise;
}

let _allPromise: Promise<Record<string, Hymn>> | null = null;
export function loadAllHymns(): Promise<Record<string, Hymn>> {
  if (!_allPromise) {
    _allPromise = fetch("/data/harpa/all.json").then((r) => r.json());
  }
  return _allPromise;
}

export async function loadHymn(id: number): Promise<Hymn | null> {
  const all = await loadAllHymns();
  return all[String(id)] ?? null;
}

export async function searchHymns(query: string, limit = 30): Promise<Hymn[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  // Try index-only match first (number or title) — fast & cheap
  const index = await loadHymnIndex();
  const idxHits = index.filter(
    (h) => h.title.toLowerCase().includes(q) || String(h.id).includes(q),
  );
  if (idxHits.length > 0 && !/[a-zà-ú]{4,}/i.test(q)) {
    // numeric / short title query — return from index without loading full payload
    const all = await loadAllHymns();
    return idxHits.slice(0, limit).map((h) => all[String(h.id)]).filter(Boolean);
  }
  // Full-text lyrics search
  const all = await loadAllHymns();
  const out: Hymn[] = [];
  for (const id of Object.keys(all)) {
    const h = all[id];
    const hay =
      h.title.toLowerCase() +
      " " +
      (h.chorus ?? "").toLowerCase() +
      " " +
      h.stanzas.join(" ").toLowerCase();
    if (hay.includes(q)) {
      out.push(h);
      if (out.length >= limit) break;
    }
  }
  return out;
}
