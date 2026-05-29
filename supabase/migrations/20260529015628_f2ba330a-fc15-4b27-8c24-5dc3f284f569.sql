
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  theme text not null default 'light' check (theme in ('light','dark','system')),
  bible_translation text not null default 'arc' check (bible_translation in ('arc','nvi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users delete own profile" on public.profiles for delete to authenticated using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Favorite verses
create table public.favorite_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book text not null,
  chapter int not null,
  verse int not null,
  text text not null,
  created_at timestamptz not null default now(),
  unique (user_id, book, chapter, verse)
);
grant select, insert, update, delete on public.favorite_verses to authenticated;
grant all on public.favorite_verses to service_role;
alter table public.favorite_verses enable row level security;
create policy "Users manage own favorite_verses" on public.favorite_verses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Favorite hymns
create table public.favorite_hymns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hymn_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, hymn_id)
);
grant select, insert, update, delete on public.favorite_hymns to authenticated;
grant all on public.favorite_hymns to service_role;
alter table public.favorite_hymns enable row level security;
create policy "Users manage own favorite_hymns" on public.favorite_hymns for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notes
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  category text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notes to authenticated;
grant all on public.notes to service_role;
alter table public.notes enable row level security;
create policy "Users manage own notes" on public.notes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger notes_updated_at before update on public.notes for each row execute function public.set_updated_at();

-- Sermons (AI-generated)
create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  theme text,
  subject text,
  objective text,
  duration_min int,
  audience text,
  content jsonb not null,
  personal_notes text not null default '',
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.sermons to authenticated;
grant all on public.sermons to service_role;
alter table public.sermons enable row level security;
create policy "Users manage own sermons" on public.sermons for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger sermons_updated_at before update on public.sermons for each row execute function public.set_updated_at();

-- Reading history
create table public.reading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book text not null,
  chapter int not null,
  opened_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reading_history to authenticated;
grant all on public.reading_history to service_role;
alter table public.reading_history enable row level security;
create policy "Users manage own reading_history" on public.reading_history for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index reading_history_user_opened on public.reading_history (user_id, opened_at desc);
