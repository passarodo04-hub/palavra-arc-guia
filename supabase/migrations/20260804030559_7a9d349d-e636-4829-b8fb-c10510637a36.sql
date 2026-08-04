CREATE TABLE public.walk_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('achievement','item')),
  unlock_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, unlock_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.walk_unlocks TO authenticated;
GRANT ALL ON public.walk_unlocks TO service_role;

ALTER TABLE public.walk_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own walk_unlocks" ON public.walk_unlocks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER walk_unlocks_updated_at
  BEFORE UPDATE ON public.walk_unlocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.walk_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('biblia','oracao','gratidao','jornada','conquista','mochila','sequencia','outros')),
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  event_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  dedupe_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dedupe_key)
);

CREATE INDEX walk_events_user_date_idx ON public.walk_events (user_id, event_date DESC, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.walk_events TO authenticated;
GRANT ALL ON public.walk_events TO service_role;

ALTER TABLE public.walk_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own walk_events" ON public.walk_events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER walk_events_updated_at
  BEFORE UPDATE ON public.walk_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();