import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { upsertNote, toggleFavoriteHymn } from "@/lib/cloud.functions";
import type { Note } from "@/lib/storage";

const GUEST_KEY = "palavra-plus:guest-mode";
const MIGRATED_KEY = "palavra-plus:guest-migrated";

export function setGuestMode(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(GUEST_KEY, "1");
    else window.localStorage.removeItem(GUEST_KEY);
    window.dispatchEvent(new CustomEvent("guest-mode-changed"));
  } catch {}
}

export function isGuestMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return false;
  }
}

export function useIsGuest() {
  const [guest, setGuest] = useState(false);
  useEffect(() => {
    setGuest(isGuestMode());
    const on = () => setGuest(isGuestMode());
    window.addEventListener("guest-mode-changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("guest-mode-changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return guest;
}

/** Push locally-stored progress (notes, favorite hymns) to the cloud
 *  the first time a guest user signs in. Best-effort — errors are logged
 *  but never break the auth flow. */
export async function migrateGuestDataToCloud(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const flagKey = `${MIGRATED_KEY}:${userId}`;
  try {
    if (window.localStorage.getItem(flagKey)) return;
  } catch {
    return;
  }

  // Notes
  try {
    const raw = window.localStorage.getItem("notes");
    const notes: Note[] = raw ? JSON.parse(raw) : [];
    for (const n of notes) {
      try {
        await upsertNote({
          data: {
            title: n.title ?? "",
            content: n.content ?? "",
            category: n.category ?? "",
          },
        });
      } catch (e) {
        console.warn("[guest-migrate] note skipped", e);
      }
    }
  } catch (e) {
    console.warn("[guest-migrate] notes failed", e);
  }

  // Favorite hymns
  try {
    const raw = window.localStorage.getItem("fav-hymns");
    const ids: number[] = raw ? JSON.parse(raw) : [];
    for (const id of ids) {
      try {
        await toggleFavoriteHymn({ data: { hymn_id: String(id) } });
      } catch (e) {
        console.warn("[guest-migrate] hymn skipped", e);
      }
    }
  } catch (e) {
    console.warn("[guest-migrate] hymns failed", e);
  }

  try {
    window.localStorage.setItem(flagKey, String(Date.now()));
    // Guest mode is no longer needed once signed in
    window.localStorage.removeItem(GUEST_KEY);
  } catch {}
}

// Kick off migration in response to an auth SIGNED_IN event.
// Registered once from AuthProvider.
export function initGuestMigrationListener() {
  if (typeof window === "undefined") return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user?.id) {
      // Fire-and-forget; do not block auth listeners
      void migrateGuestDataToCloud(session.user.id);
    }
  });
  return () => subscription.unsubscribe();
}