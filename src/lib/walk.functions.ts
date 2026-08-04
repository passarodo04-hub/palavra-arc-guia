import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CATEGORIES = [
  "biblia",
  "oracao",
  "gratidao",
  "jornada",
  "conquista",
  "mochila",
  "sequencia",
  "outros",
] as const;

export type WalkUnlockRow = { kind: "achievement" | "item"; unlockId: string; unlockedAt: string };
export type WalkEventRow = {
  id: string;
  category: (typeof CATEGORIES)[number];
  title: string;
  detail: string;
  icon: string;
  eventDate: string;
};
export type WalkReadRow = { book: string; chapter: number; readAt: string };

export const getWalkData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [unlocks, events, reads] = await Promise.all([
      supabase.from("walk_unlocks").select("kind,unlock_id,unlocked_at").eq("user_id", userId),
      supabase
        .from("walk_events")
        .select("id,category,title,detail,icon,event_date")
        .eq("user_id", userId)
        .order("event_date", { ascending: false })
        .limit(500),
      supabase
        .from("bible_chapter_reads")
        .select("book,chapter,read_at")
        .eq("user_id", userId)
        .order("read_at", { ascending: false })
        .limit(1500),
    ]);

    if (unlocks.error) throw new Error(unlocks.error.message);
    if (events.error) throw new Error(events.error.message);
    if (reads.error) throw new Error(reads.error.message);

    return {
      unlocks: (unlocks.data ?? []).map((u) => ({
        kind: u.kind as "achievement" | "item",
        unlockId: u.unlock_id,
        unlockedAt: u.unlocked_at,
      })) satisfies WalkUnlockRow[],
      events: (events.data ?? []).map((e) => ({
        id: e.id,
        category: e.category as WalkEventRow["category"],
        title: e.title,
        detail: e.detail ?? "",
        icon: e.icon ?? "",
        eventDate: e.event_date,
      })) satisfies WalkEventRow[],
      reads: (reads.data ?? []).map((r) => ({
        book: r.book,
        chapter: r.chapter,
        readAt: r.read_at,
      })) satisfies WalkReadRow[],
    };
  });

/** Persists unlocks the user really earned, plus one timeline event each. */
export const recordUnlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        items: z
          .array(
            z.object({
              kind: z.enum(["achievement", "item"]),
              unlockId: z.string().min(1).max(64),
              title: z.string().min(1).max(120),
              icon: z.string().max(8).default(""),
              detail: z.string().max(240).default(""),
            }),
          )
          .min(1)
          .max(60),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { error: unlockError } = await supabase.from("walk_unlocks").upsert(
      data.items.map((i) => ({ user_id: userId, kind: i.kind, unlock_id: i.unlockId })),
      { onConflict: "user_id,kind,unlock_id", ignoreDuplicates: true },
    );
    if (unlockError) throw new Error(unlockError.message);

    const { error: eventError } = await supabase.from("walk_events").upsert(
      data.items.map((i) => ({
        user_id: userId,
        category: i.kind === "item" ? "mochila" : "conquista",
        title: i.kind === "item" ? `Desbloqueei ${i.title}.` : `Conquista: ${i.title}.`,
        detail: i.detail,
        icon: i.icon,
        dedupe_key: `unlock:${i.kind}:${i.unlockId}`,
      })),
      { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
    );
    if (eventError) throw new Error(eventError.message);

    return { recorded: data.items.length };
  });

/** Generic entry point so future modules can push real events to the timeline. */
export const recordWalkEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        category: z.enum(CATEGORIES),
        title: z.string().min(1).max(160),
        detail: z.string().max(240).default(""),
        icon: z.string().max(8).default(""),
        dedupeKey: z.string().min(1).max(120),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("walk_events").upsert(
      {
        user_id: userId,
        category: data.category,
        title: data.title,
        detail: data.detail,
        icon: data.icon,
        dedupe_key: data.dedupeKey,
        ...(data.eventDate ? { event_date: data.eventDate } : {}),
      },
      { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });