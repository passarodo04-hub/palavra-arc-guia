import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ChapterRead = { book: string; chapter: number };

export const listChapterReads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("bible_chapter_reads")
      .select("book,chapter")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data as ChapterRead[]) ?? [];
  });

export const setChapterRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        book: z.string().min(1).max(20),
        chapter: z.number().int().min(1).max(200),
        read: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (!data.read) {
      const { error } = await supabase
        .from("bible_chapter_reads")
        .delete()
        .eq("user_id", userId)
        .eq("book", data.book)
        .eq("chapter", data.chapter);
      if (error) throw new Error(error.message);
      return { read: false };
    }
    const { error } = await supabase
      .from("bible_chapter_reads")
      .upsert(
        { user_id: userId, book: data.book, chapter: data.chapter },
        { onConflict: "user_id,book,chapter" },
      );
    if (error) throw new Error(error.message);
    return { read: true };
  });

/** Bulk import used when a guest signs in (local progress → cloud). */
export const importChapterReads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        items: z
          .array(z.object({ book: z.string().min(1).max(20), chapter: z.number().int().min(1).max(200) }))
          .max(1500),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (data.items.length === 0) return { imported: 0 };
    const rows = data.items.map((i) => ({ user_id: userId, book: i.book, chapter: i.chapter }));
    const { error } = await supabase
      .from("bible_chapter_reads")
      .upsert(rows, { onConflict: "user_id,book,chapter", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { imported: rows.length };
  });
