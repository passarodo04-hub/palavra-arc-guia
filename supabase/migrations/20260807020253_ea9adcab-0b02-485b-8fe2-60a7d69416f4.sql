-- ============ PROFILE: birth date ============
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date date;

-- ============ MENTOR ============
CREATE TABLE public.mentor_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Nova conversa',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_conversations TO authenticated;
GRANT ALL ON public.mentor_conversations TO service_role;
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mentor_conversations" ON public.mentor_conversations
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX mentor_conversations_user_idx ON public.mentor_conversations(user_id, updated_at DESC);
CREATE TRIGGER mentor_conversations_updated_at BEFORE UPDATE ON public.mentor_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mentor_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.mentor_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL DEFAULT '',
  refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_messages TO authenticated;
GRANT ALL ON public.mentor_messages TO service_role;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mentor_messages" ON public.mentor_messages
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX mentor_messages_conv_idx ON public.mentor_messages(conversation_id, created_at);

-- ============ CALENDAR ============
CREATE TABLE public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'outro',
  event_date date NOT NULL,
  event_time time,
  all_day boolean NOT NULL DEFAULT false,
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none','daily','weekly','monthly','yearly')),
  reminder_minutes integer,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calendar_events" ON public.calendar_events
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX calendar_events_user_date_idx ON public.calendar_events(user_id, event_date);
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.calendar_event_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  occurrence_date date NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id, occurrence_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_event_completions TO authenticated;
GRANT ALL ON public.calendar_event_completions TO service_role;
ALTER TABLE public.calendar_event_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calendar_event_completions" ON public.calendar_event_completions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ COMMUNITY ============
CREATE TABLE public.communities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  invite_code text NOT NULL UNIQUE,
  invite_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communities TO authenticated;
GRANT ALL ON public.communities TO service_role;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER communities_updated_at BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.community_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  display_name text NOT NULL DEFAULT '',
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  journeys_completed integer NOT NULL DEFAULT 0,
  badges integer NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO service_role;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX community_members_user_idx ON public.community_members(user_id);
CREATE TRIGGER community_members_updated_at BEFORE UPDATE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Security-definer helpers to avoid recursive RLS between the two tables.
CREATE OR REPLACE FUNCTION public.is_community_member(_community_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_members m
                 WHERE m.community_id = _community_id AND m.user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_community_admin(_community_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.communities c
                 WHERE c.id = _community_id AND c.owner_id = _user_id)
      OR EXISTS (SELECT 1 FROM public.community_members m
                 WHERE m.community_id = _community_id AND m.user_id = _user_id AND m.role = 'admin')
$$;

REVOKE ALL ON FUNCTION public.is_community_member(uuid, uuid) FROM public;
REVOKE ALL ON FUNCTION public.is_community_admin(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_community_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_community_admin(uuid, uuid) TO authenticated, service_role;

CREATE POLICY "Members view their communities" ON public.communities
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_community_member(id, auth.uid()));
CREATE POLICY "Users create communities" ON public.communities
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins update communities" ON public.communities
  FOR UPDATE TO authenticated USING (public.is_community_admin(id, auth.uid()))
  WITH CHECK (public.is_community_admin(id, auth.uid()));
CREATE POLICY "Owner deletes community" ON public.communities
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Members view members" ON public.community_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_community_member(community_id, auth.uid()));
CREATE POLICY "Users join as themselves" ON public.community_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own membership" ON public.community_members
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Leave or be removed by admin" ON public.community_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_community_admin(community_id, auth.uid()));

CREATE TABLE public.community_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'oracao',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  scheduled_date date NOT NULL,
  scheduled_time time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_activities TO authenticated;
GRANT ALL ON public.community_activities TO service_role;
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER community_activities_updated_at BEFORE UPDATE ON public.community_activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Members view activities" ON public.community_activities
  FOR SELECT TO authenticated USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY "Members create activities" ON public.community_activities
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.is_community_member(community_id, auth.uid()));
CREATE POLICY "Author or admin updates activities" ON public.community_activities
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_community_admin(community_id, auth.uid()))
  WITH CHECK (created_by = auth.uid() OR public.is_community_admin(community_id, auth.uid()));
CREATE POLICY "Author or admin deletes activities" ON public.community_activities
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.is_community_admin(community_id, auth.uid()));

CREATE TABLE public.community_activity_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid NOT NULL REFERENCES public.community_activities(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'started' CHECK (status IN ('started','completed')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_activity_participants TO authenticated;
GRANT ALL ON public.community_activity_participants TO service_role;
ALTER TABLE public.community_activity_participants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER community_activity_participants_updated_at BEFORE UPDATE ON public.community_activity_participants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Members view participation" ON public.community_activity_participants
  FOR SELECT TO authenticated USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY "Users record own participation" ON public.community_activity_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_community_member(community_id, auth.uid()));
CREATE POLICY "Users update own participation" ON public.community_activity_participants
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own participation" ON public.community_activity_participants
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.community_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'palavra' CHECK (kind IN ('versiculo','palavra')),
  reference text NOT NULL DEFAULT '',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX community_posts_community_idx ON public.community_posts(community_id, created_at DESC);
CREATE POLICY "Members view posts" ON public.community_posts
  FOR SELECT TO authenticated USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY "Members create own posts" ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_community_member(community_id, auth.uid()));
CREATE POLICY "Author or admin deletes posts" ON public.community_posts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_community_admin(community_id, auth.uid()));