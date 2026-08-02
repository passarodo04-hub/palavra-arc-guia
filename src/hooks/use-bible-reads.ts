import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { chapterKey } from "@/lib/bible-journey";
import {
  listChapterReads,
  setChapterRead,
  importChapterReads,
  type ChapterRead,
} from "@/lib/bible-reads.functions";

/* Local mirror: keeps the journey working offline and for guests, and acts as
 * an optimistic cache for authenticated users. The cloud is the source of
 * truth whenever the user is signed in. */

const KEY = "palavra-plus:bible-reads";
const EVENT = "palavra-plus:bible-reads-changed";

export function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLocal(keys: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...new Set(keys)]));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {}
}

function parseKey(k: string): ChapterRead | null {
  const [book, ch] = k.split(":");
  const chapter = Number(ch);
  if (!book || !Number.isFinite(chapter)) return null;
  return { book, chapter };
}

export function useBibleReads() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [local, setLocal] = useState<string[]>([]);
  const mergedRef = useRef(false);

  useEffect(() => {
    setLocal(readLocal());
    const on = () => setLocal(readLocal());
    window.addEventListener(EVENT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVENT, on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const cloud = useQuery({
    queryKey: ["bible-reads", user?.id ?? "anon"],
    queryFn: () => listChapterReads(),
    enabled: !!user,
    staleTime: 60_000,
  });

  // First time a signed-in user arrives with local-only progress, push it up.
  useEffect(() => {
    if (!user || mergedRef.current || cloud.isLoading || !cloud.data) return;
    const cloudKeys = new Set(cloud.data.map((r) => chapterKey(r.book, r.chapter)));
    const missing = readLocal().filter((k) => !cloudKeys.has(k));
    mergedRef.current = true;
    if (missing.length === 0) return;
    const items = missing.map(parseKey).filter(Boolean) as ChapterRead[];
    importChapterReads({ data: { items } })
      .then(() => qc.invalidateQueries({ queryKey: ["bible-reads", user.id] }))
      .catch(() => {});
  }, [user, cloud.data, cloud.isLoading, qc]);

  const readSet = useMemo(() => {
    const s = new Set<string>(local);
    for (const r of cloud.data ?? []) s.add(chapterKey(r.book, r.chapter));
    return s;
  }, [local, cloud.data]);

  const toggle = useCallback(
    async (book: string, chapter: number, read: boolean) => {
      const k = chapterKey(book, chapter);
      const next = read ? [...readLocal(), k] : readLocal().filter((x) => x !== k);
      writeLocal(next);
      if (!user) return;
      try {
        await setChapterRead({ data: { book, chapter, read } });
      } finally {
        qc.invalidateQueries({ queryKey: ["bible-reads", user.id] });
      }
    },
    [user, qc],
  );

  const isRead = useCallback((book: string, chapter: number) => readSet.has(chapterKey(book, chapter)), [readSet]);

  return {
    readSet,
    isRead,
    toggle,
    loading: authLoading || (!!user && cloud.isLoading),
    synced: !!user,
  };
}
