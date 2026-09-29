CREATE TABLE public.bible_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  translation text NOT NULL CHECK (translation IN ('arc','nvi','kja','nvt','naa','ara','ntlh')),
  book text NOT NULL,
  chapter integer NOT NULL CHECK (chapter > 0),
  verse integer CHECK (verse > 0),
  color text NOT NULL CHECK (color IN ('yellow','green','blue','red','purple')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_highlights TO authenticated;
GRANT ALL ON public.bible_highlights TO service_role;
ALTER TABLE public.bible_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage bible highlights" ON public.bible_highlights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE UNIQUE INDEX bible_highlights_unique_location ON public.bible_highlights (user_id, translation, book, chapter, verse) NULLS NOT DISTINCT;
CREATE INDEX bible_highlights_user_created_idx ON public.bible_highlights (user_id, created_at DESC);
CREATE TRIGGER bible_highlights_updated_at BEFORE UPDATE ON public.bible_highlights FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();