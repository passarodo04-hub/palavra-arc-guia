import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PersonalEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  eventTime: string | null;
  allDay: boolean;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  reminderMinutes: number | null;
  notes: string;
};

const EventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(160),
  description: z.string().max(2000).default(""),
  category: z.string().max(40).default("outro"),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().default(null),
  allDay: z.boolean().default(false),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).default("none"),
  reminderMinutes: z.number().int().min(0).max(10080).nullable().default(null),
  notes: z.string().max(2000).default(""),
});

export const listCalendarEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PersonalEvent[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("event_date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      category: r.category ?? "outro",
      eventDate: r.event_date,
      eventTime: r.event_time ? String(r.event_time).slice(0, 5) : null,
      allDay: r.all_day,
      recurrence: r.recurrence as PersonalEvent["recurrence"],
      reminderMinutes: r.reminder_minutes,
      notes: r.notes ?? "",
    }));
  });

export const upsertCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EventSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const payload = {
      ...(data.id ? { id: data.id } : {}),
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      event_date: data.eventDate,
      event_time: data.allDay ? null : data.eventTime,
      all_day: data.allDay,
      recurrence: data.recurrence,
      reminder_minutes: data.reminderMinutes,
      notes: data.notes,
    };
    const { data: row, error } = await supabase
      .from("calendar_events")
      .upsert(payload, { onConflict: "id" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Marks one occurrence of an event as done and mirrors it on Minha Caminhada.
 *  No XP is granted here — the existing XP system stays the single source. */
export const completeCalendarOccurrence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        eventId: z.string().uuid(),
        occurrenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        title: z.string().min(1).max(160),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("calendar_event_completions").upsert(
      { user_id: userId, event_id: data.eventId, occurrence_date: data.occurrenceDate },
      { onConflict: "user_id,event_id,occurrence_date", ignoreDuplicates: true },
    );
    if (error) throw new Error(error.message);

    const { error: walkError } = await supabase.from("walk_events").upsert(
      {
        user_id: userId,
        category: "outros",
        title: `Compromisso concluído: ${data.title}.`,
        detail: "Agenda do Calendário",
        icon: "🗓️",
        dedupe_key: `calendar:${data.eventId}:${data.occurrenceDate}`,
        event_date: data.occurrenceDate,
      },
      { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
    );
    if (walkError) console.error("[calendar] timeline event failed", walkError.message);
    return { ok: true };
  });

export const listCalendarCompletions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("calendar_event_completions")
      .select("event_id,occurrence_date")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => `${r.event_id}:${r.occurrence_date}`);
  });
