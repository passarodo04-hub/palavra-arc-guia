/* ------------------------------------------------------------------ *
 *  Atlas Bíblico — tipos compartilhados por Mapa, Reis e Juízes.      *
 *  Camada 100% de conteúdo estático (sem tabelas novas, sem XP novo). *
 *  A descoberta de locais é derivada das leituras reais do usuário    *
 *  (mesmo readSet da Jornada Bíblica).                                *
 * ------------------------------------------------------------------ */

export type BibleRef = {
  /** id do livro no leitor existente (ex.: "gn", "1sm", "jo") */
  book: string;
  chapter: number;
  /** rótulo humano, ex.: "1 Samuel 17" */
  label: string;
};

export type AtlasEntityKind = "lugar" | "rei" | "juiz";

export type AtlasSearchItem = {
  id: string;
  kind: AtlasEntityKind;
  name: string;
  subtitle: string;
  keywords: string[];
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function matches(query: string, item: AtlasSearchItem): boolean {
  const q = normalize(query);
  if (!q) return false;
  return (
    normalize(item.name).includes(q) ||
    normalize(item.subtitle).includes(q) ||
    item.keywords.some((k) => normalize(k).includes(q))
  );
}

/** Paleta artística determinística — mesma arte para o mesmo id. */
export function artSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}