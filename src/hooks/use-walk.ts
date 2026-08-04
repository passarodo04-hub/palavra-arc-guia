import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useAllCampaigns } from "@/lib/campaigns";
import { allJourneyProgress } from "@/lib/journeys";
import { useBibleReads } from "@/hooks/use-bible-reads";
import { getBook } from "@/lib/bible-data";
import {
  ACHIEVEMENTS,
  BACKPACK_ITEMS,
  buildTimeline,
  computeWalkStats,
  pendingUnlocks,
  resolveUnlockables,
  type Unlockable,
} from "@/lib/walk";
import { getWalkData, recordUnlocks } from "@/lib/walk.functions";

/* Local mirror so guests keep their unlocks; the cloud is the source of truth
 * for signed-in users and local records are pushed up on first sign-in. */
const KEY = "palavra-plus:walk-unlocks";
const EVENT = "palavra-plus:walk-unlocks-changed";

type LocalRecords = Record<string, string>; // "kind:id" -> ISO timestamp

function readLocal(): LocalRecords {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const obj = raw ? (JSON.parse(raw) as LocalRecords) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function writeLocal(next: LocalRecords) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {}
}

function readFavVerses(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("fav-verses");
    const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export function useWalk() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const campaigns = useAllCampaigns();
  const { readSet } = useBibleReads();
  const [local, setLocal] = useState<LocalRecords>({});
  const [favVerses, setFavVerses] = useState(0);
  const [celebration, setCelebration] = useState<Unlockable[] | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const firstEvalRef = useRef(true);

  useEffect(() => {
    setLocal(readLocal());
    setFavVerses(readFavVerses());
    const on = () => {
      setLocal(readLocal());
      setFavVerses(readFavVerses());
    };
    window.addEventListener(EVENT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVENT, on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const cloud = useQuery({
    queryKey: ["walk", user?.id ?? "anon"],
    queryFn: () => getWalkData(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const journeysCompleted = useMemo(
    () => allJourneyProgress(campaigns).filter((j) => j.percent >= 100).length,
    [campaigns],
  );

  const stats = useMemo(
    () => computeWalkStats({ campaigns, readSet, favoriteVerses: favVerses, journeysCompleted }),
    [campaigns, readSet, favVerses, journeysCompleted],
  );

  const records = useMemo(() => {
    const m = new Map<string, string>(Object.entries(local));
    for (const u of cloud.data?.unlocks ?? []) m.set(`${u.kind}:${u.unlockId}`, u.unlockedAt);
    return m;
  }, [local, cloud.data]);

  // Persist everything the user really earned. Never grants anything by itself:
  // each unlock still has to pass its own check against real data.
  useEffect(() => {
    if (authLoading) return;
    if (user && cloud.isLoading) return;
    const pending = pendingUnlocks(stats, records);
    if (pending.length === 0) {
      firstEvalRef.current = false;
      return;
    }

    const now = new Date().toISOString();
    const next = { ...readLocal() };
    for (const p of pending) next[`${p.kind}:${p.id}`] = next[`${p.kind}:${p.id}`] ?? now;
    writeLocal(next);

    const fresh = pending.filter((p) => !seenRef.current.has(`${p.kind}:${p.id}`));
    for (const p of pending) seenRef.current.add(`${p.kind}:${p.id}`);
    if (!firstEvalRef.current && fresh.length > 0) setCelebration(fresh);
    firstEvalRef.current = false;

    if (!user) return;
    void recordUnlocks({
      data: {
        items: pending.map((p) => ({
          kind: p.kind,
          unlockId: p.id,
          title: p.name,
          icon: p.emoji,
          detail: p.requirement,
        })),
      },
    })
      .then(() => qc.invalidateQueries({ queryKey: ["walk", user.id] }))
      .catch(() => {});
  }, [stats, records, user, authLoading, cloud.isLoading, qc]);

  const achievements = useMemo(() => resolveUnlockables(ACHIEVEMENTS, stats, records), [stats, records]);
  const items = useMemo(() => resolveUnlockables(BACKPACK_ITEMS, stats, records), [stats, records]);

  const timeline = useMemo(
    () =>
      buildTimeline({
        reads: cloud.data?.reads ?? [],
        campaigns,
        storedEvents: cloud.data?.events ?? [],
        bookName: (id) => getBook(id)?.name ?? id,
      }),
    [cloud.data, campaigns],
  );

  const timelineCount = useMemo(() => timeline.reduce((n, d) => n + d.events.length, 0), [timeline]);

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  return {
    stats,
    achievements,
    items,
    timeline,
    timelineCount,
    unlockedAchievements: achievements.filter((a) => a.unlocked).length,
    unlockedItems: items.filter((i) => i.unlocked).length,
    celebration,
    dismissCelebration,
    loading: authLoading || (!!user && cloud.isLoading),
    synced: !!user,
  };
}