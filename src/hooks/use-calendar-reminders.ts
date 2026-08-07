import { useCallback, useEffect, useRef, useState } from "react";
import { occursOn, todayIso } from "@/lib/calendar-shared";
import type { PersonalEvent } from "@/lib/calendar.functions";

type Permission = "default" | "granted" | "denied" | "unsupported";

/**
 * Fires local notifications for today's events at their reminder offset.
 * Degrades silently when the browser has no Notification support — the
 * calendar keeps working either way.
 */
export function useCalendarReminders(events: PersonalEvent[]) {
  const [permission, setPermission] = useState<Permission>("unsupported");
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as Permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as Permission);
    } catch {
      setPermission("denied");
    }
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;
    const tick = () => {
      const now = new Date();
      const day = todayIso();
      for (const e of events) {
        if (e.reminderMinutes == null || e.allDay || !e.eventTime) continue;
        if (!occursOn(e, day)) continue;
        const [h, m] = e.eventTime.split(":").map(Number);
        const at = new Date(now);
        at.setHours(h, m, 0, 0);
        const fireAt = at.getTime() - e.reminderMinutes * 60_000;
        const key = `${e.id}:${day}`;
        if (firedRef.current.has(key)) continue;
        if (now.getTime() >= fireAt && now.getTime() < fireAt + 60_000) {
          firedRef.current.add(key);
          try {
            new Notification("Palavra+ · lembrete", {
              body: `${e.title} — ${e.eventTime}`,
              tag: key,
            });
          } catch {}
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [events, permission]);

  return {
    permission,
    supported: permission !== "unsupported",
    requestPermission,
  };
}
