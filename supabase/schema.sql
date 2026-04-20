create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  avatar text,
  password_hash text,
  provider text default 'credentials',
  api_key_openrouter text,
  api_key_groq text,
  plan text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text default 'New Chat',
  model text default 'claude-fan-made-4.6',
  system_prompt text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  thinking text,
  created_at timestamptz default now()
);

create table if not exists user_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  session_id uuid references chat_sessions(id) on delete set null,
  name text not null,
  type text,
  size bigint,
  content text,
  created_at timestamptz default now()
);

alter table users enable row level security;
alter table chat_sessions enable row level security;
alter table messages enable row level security;
alter table user_files enable row level security;

create policy "users own data" on users for all using (id = auth.uid());
create policy "users own sessions" on chat_sessions for all using (user_id = auth.uid());
create policy "users own messages" on messages for all using (
  session_id in (select id from chat_sessions where user_id = auth.uid())
);
create policy "users own files" on user_files for all using (user_id = auth.uid());

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at before update on users
  for each row execute function update_updated_at();
create trigger update_sessions_updated_at before update on chat_sessions
  for each row execute function update_updated_at();
