import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============ NOTES ============
export type CloudNote = {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export const listNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as CloudNote[]) ?? [];
  });

export const upsertNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().max(300).default(""),
        content: z.string().max(50000).default(""),
        category: z.string().max(100).default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const payload = { ...data, user_id: userId };
    const { data: row, error } = await supabase
      .from("notes")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as CloudNote;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("notes").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ FAVORITE VERSES ============
export type CloudFavVerse = { id: string; book: string; chapter: number; verse: number; text: string };

export const listFavoriteVerses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("favorite_verses")
      .select("id,book,chapter,verse,text")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as CloudFavVerse[]) ?? [];
  });

export const toggleFavoriteVerse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        book: z.string().min(1).max(20),
        chapter: z.number().int().min(1),
        verse: z.number().int().min(1),
        text: z.string().max(2000),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("favorite_verses")
      .select("id")
      .eq("user_id", userId)
      .eq("book", data.book)
      .eq("chapter", data.chapter)
      .eq("verse", data.verse)
      .maybeSingle();
    if (existing) {
      await supabase.from("favorite_verses").delete().eq("id", existing.id);
      return { favorited: false };
    }
    const { error } = await supabase.from("favorite_verses").insert({ ...data, user_id: userId });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

// ============ FAVORITE HYMNS ============
export const listFavoriteHymns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("favorite_hymns")
      .select("hymn_id")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as { hymn_id: string }[]).map((r) => r.hymn_id);
  });

export const toggleFavoriteHymn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ hymn_id: z.string().min(1).max(20) }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("favorite_hymns")
      .select("id")
      .eq("user_id", userId)
      .eq("hymn_id", data.hymn_id)
      .maybeSingle();
    if (existing) {
      await supabase.from("favorite_hymns").delete().eq("id", existing.id);
      return { favorited: false };
    }
    const { error } = await supabase.from("favorite_hymns").insert({ user_id: userId, hymn_id: data.hymn_id });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

// ============ SERMONS ============
export type CloudSermon = {
  id: string;
  title: string;
  theme: string | null;
  subject: string | null;
  objective: string | null;
  duration_min: number | null;
  audience: string | null;
  content: any;
  personal_notes: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
};

export const listSermons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("sermons")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as CloudSermon[]) ?? [];
  });

export const getSermon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("sermons")
      .select("*")
      .eq("user_id", userId)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as CloudSermon | null;
  });

export const saveSermon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().min(1).max(300),
        theme: z.string().max(300).optional().default(""),
        subject: z.string().max(500).optional().default(""),
        objective: z.string().max(500).optional().default(""),
        duration_min: z.number().int().min(1).max(300).optional(),
        audience: z.string().max(300).optional().default(""),
        content: z.any(),
        personal_notes: z.string().max(20000).optional().default(""),
        favorite: z.boolean().optional().default(false),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const payload: any = { ...data, user_id: userId, content: data.content ?? {} };
    const { data: row, error } = await supabase
      .from("sermons")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as CloudSermon;
  });

export const deleteSermon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("sermons").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ PROFILE ============
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        display_name: z.string().max(120).optional(),
        theme: z.enum(["light", "dark", "system"]).optional(),
        bible_translation: z.enum(["arc", "nvi"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Upsert so the profile is created if it doesn't exist yet (e.g. OAuth signups).
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...data }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });