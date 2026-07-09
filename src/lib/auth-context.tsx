import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { migrateGuestDataToCloud, setGuestMode } from "@/lib/guest-mode";

type Ctx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      prevUserIdRef.current = data.session?.user?.id ?? null;
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      // Ignore noisy events that don't change identity (TOKEN_REFRESHED, INITIAL_SESSION, USER_UPDATED)
      setSession(s);
      setLoading(false);
      const nextId = s?.user?.id ?? null;
      const identityChanged =
        event === "SIGNED_IN" || event === "SIGNED_OUT"
          ? prevUserIdRef.current !== nextId
          : false;
      if (identityChanged) {
        prevUserIdRef.current = nextId;
        router.invalidate();
        qc.invalidateQueries();
        if (event === "SIGNED_IN" && nextId) {
          setGuestMode(false);
          void migrateGuestDataToCloud(nextId);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}