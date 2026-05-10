
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  carbon_score numeric not null default 0,
  ride_streak int not null default 0,
  breeze_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Favorites
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  icon text not null default 'MapPin',
  address text not null,
  lat numeric,
  lng numeric,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.favorites enable row level security;
create policy "own favs all" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trip history
create table public.trip_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  route_line text,
  fare_cents int not null default 250,
  duration_minutes int,
  carbon_saved_kg numeric not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
alter table public.trip_history enable row level security;
create policy "own trips all" on public.trip_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Routines (learned patterns)
create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  day_of_week int,
  hour_of_day int,
  count int not null default 1,
  last_seen timestamptz not null default now()
);
alter table public.routines enable row level security;
create policy "own routines all" on public.routines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
