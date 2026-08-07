import { BIBLE_PLACES } from "@/lib/bible-places";
import { BIBLE_JUDGES } from "@/lib/bible-judges";
import { BIBLE_KINGS, REALM_META } from "@/lib/bible-kings";
import { matches, type AtlasSearchItem } from "@/lib/atlas-shared";

export const ATLAS_INDEX: AtlasSearchItem[] = [
  ...BIBLE_PLACES.map((p) => ({
    id: p.id,
    kind: "lugar" as const,
    name: p.name,
    subtitle: `📍 Lugar · ${p.region}`,
    keywords: [...p.people, ...p.events, p.modern, ...p.refs.map((r) => r.label)],
  })),
  ...BIBLE_KINGS.map((k) => ({
    id: k.id,
    kind: "rei" as const,
    name: k.name,
    subtitle: `👑 Rei · ${REALM_META[k.realm].label}`,
    keywords: [...k.people, ...k.places, ...k.refs.map((r) => r.label)],
  })),
  ...BIBLE_JUDGES.map((j) => ({
    id: j.id,
    kind: "juiz" as const,
    name: j.name,
    subtitle: `⚔️ Juiz · ${j.tribe}`,
    keywords: [...j.people, ...j.places, ...j.refs.map((r) => r.label)],
  })),
];

export function searchAtlas(query: string, limit = 20): AtlasSearchItem[] {
  if (!query.trim()) return [];
  return ATLAS_INDEX.filter((i) => matches(query, i)).slice(0, limit);
}

export function atlasHref(item: AtlasSearchItem): string {
  if (item.kind === "lugar") return `/mapa/${item.id}`;
  if (item.kind === "rei") return `/reis/${item.id}`;
  return `/juizes/${item.id}`;
}