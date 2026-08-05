CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_key text NOT NULL,
  audience text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL,
  total integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  percent integer NOT NULL DEFAULT 0,
  xp_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quiz_attempts" ON public.quiz_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER quiz_attempts_updated_at BEFORE UPDATE ON public.quiz_attempts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX quiz_attempts_user_created_idx ON public.quiz_attempts (user_id, created_at DESC);

CREATE TABLE public.quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id uuid REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  audience text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL,
  chosen integer NOT NULL,
  correct_index integer NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_answers TO authenticated;
GRANT ALL ON public.quiz_answers TO service_role;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quiz_answers" ON public.quiz_answers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX quiz_answers_user_question_idx ON public.quiz_answers (user_id, question_id, answered_at DESC);

CREATE TABLE public.quiz_daily_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_key text NOT NULL,
  claim_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc')::date),
  xp integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, claim_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_daily_claims TO authenticated;
GRANT ALL ON public.quiz_daily_claims TO service_role;
ALTER TABLE public.quiz_daily_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quiz_daily_claims" ON public.quiz_daily_claims FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);