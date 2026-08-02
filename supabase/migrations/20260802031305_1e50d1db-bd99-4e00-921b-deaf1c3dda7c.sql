CREATE TABLE public.bible_chapter_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book text NOT NULL,
  chapter integer NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book, chapter)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_chapter_reads TO authenticated;
GRANT ALL ON public.bible_chapter_reads TO service_role;

ALTER TABLE public.bible_chapter_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bible_chapter_reads"
ON public.bible_chapter_reads FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX bible_chapter_reads_user_idx ON public.bible_chapter_reads (user_id);