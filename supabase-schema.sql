-- Run this in the Supabase SQL editor

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  swimming_meters float not null default 0,
  biking_km float not null default 0,
  running_km float not null default 0,
  score int not null default 0,
  session_date date not null default current_date,
  created_at timestamptz default now()
);

-- Enable Row Level Security (allow public read/write for name-based multi-user)
alter table users enable row level security;
alter table sessions enable row level security;

create policy "Public read users" on users for select using (true);
create policy "Public insert users" on users for insert with check (true);

create policy "Public read sessions" on sessions for select using (true);
create policy "Public insert sessions" on sessions for insert with check (true);

-- Index for fast profile lookups
create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists sessions_date_idx on sessions(session_date);
