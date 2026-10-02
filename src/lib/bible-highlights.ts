import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { Translation } from "@/lib/bible-data";

export const HIGHLIGHT_COLORS = ["yellow", "green", "blue", "red", "purple"] as const;
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];
export const COLOR_LABELS: Record<HighlightColor, string> = {
  yellow: "Amarelo", green: "Verde", blue: "Azul", red: "Vermelho", purple: "Roxo",
};
export type HighlightLocation = { translation: Translation; book: string; chapter: number; verse: number | null };
export type BibleHighlight = HighlightLocation & { color: HighlightColor };

const KEY = "palavra-plus:bible-highlights";
const EVENT = "palavra-plus:bible-highlights-changed";
export function highlightKey(h: HighlightLocation) {
  return `${h.translation}:${h.book}:${h.chapter}:${h.verse ?? "chapter"}`;
}
function readGuest(): BibleHighlight[] {
  if (typeof window === "undefined") return [];
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(data) ? data.filter((h): h is BibleHighlight =>
      h && typeof h === "object" && typeof h.book === "string" &&
      typeof h.chapter === "number" && HIGHLIGHT_COLORS.includes(h.color)) : [];
  } catch { return []; }
}
function writeGuest(items: BibleHighlight[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function useBibleHighlights() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [guest, setGuest] = useState<BibleHighlight[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const migrating = useRef(false);
  useEffect(() => {
    const onChange = () => setGuest(readGuest());
    onChange();
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener("storage", onChange); };
  }, []);
  const queryKey = ["bible-highlights", user?.id];
  const cloud = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("bible_highlights")
        .select("translation,book,chapter,verse,color").eq("user_id", user?.id ?? "").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BibleHighlight[];
    },
  });
  // Move guest-only marks to the signed-in account once; upsert by location,
  // preserving existing account colors and keeping local data on failure.
  useEffect(() => {
    if (!user || !cloud.data || !guest.length || migrating.current) return;
    migrating.current = true;
    const existing = new Set(cloud.data.map(highlightKey));
    const missing = guest.filter((h) => !existing.has(highlightKey(h)));
    const migrate = async () => {
      if (missing.length) {
        const { error } = await supabase.from("bible_highlights")
          .insert(missing.map((h) => ({ ...h, user_id: user.id })));
        if (error) { migrating.current = false; setError("Não foi possível sincronizar as marcações deste aparelho."); return; }
      }
      writeGuest([]);
      await qc.invalidateQueries({ queryKey });
      migrating.current = false;
    };
    void migrate();
  }, [user, cloud.data, guest, qc]);

  const items = user ? (cloud.data ?? []) : guest;
  const setHighlight = async (location: HighlightLocation, color: HighlightColor | null) => {
    if (busy || authLoading || (user && (cloud.isPending || cloud.isError || guest.length > 0))) return;
    setError("");
    const key = highlightKey(location);
    if (!user) {
      writeGuest(color
        ? [...guest.filter((h) => highlightKey(h) !== key), { ...location, color }]
        : guest.filter((h) => highlightKey(h) !== key));
      return;
    }
    setBusy(true);
    try {
      const deletion = supabase.from("bible_highlights").delete().eq("user_id", user.id)
        .eq("translation", location.translation).eq("book", location.book).eq("chapter", location.chapter);
      const request = color
        ? supabase.from("bible_highlights").upsert({ ...location, color, user_id: user.id }, { onConflict: "user_id,translation,book,chapter,verse" })
        : location.verse === null ? deletion.is("verse", null) : deletion.eq("verse", location.verse);
      const { error } = await request;
      if (error) throw error;
      await qc.invalidateQueries({ queryKey });
    } catch { setError("Não foi possível salvar a marcação. Tente novamente."); }
    finally { setBusy(false); }
  };
  return { items, setHighlight, busy: busy || authLoading || (!!user && (cloud.isPending || guest.length > 0)), error: error || (cloud.isError ? "Não foi possível carregar as marcações." : "") };
}