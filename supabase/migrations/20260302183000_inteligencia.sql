create extension if not exists "uuid-ossp";

create table if not exists public.market_prices (
  id uuid primary key default uuid_generate_v4(),
  programa text not null,
  valor numeric(10,4) not null,
  plataforma text,
  prazo_recebimento text,
  tendencia text default 'STABLE',
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.market_news (
  id uuid primary key default uuid_generate_v4(),
  title text,
  summary text,
  source_url text unique,
  source_name text,
  type text,
  bonus_percentage numeric(10,2),
  expires_at timestamptz,
  published_at timestamptz default now(),
  is_active boolean default true,
  created_at timestamptz not null default now(),
  -- legacy fields
  titulo text,
  link text,
  categoria text,
  data_publicacao timestamptz,
  importancia_score integer,
  resumo_ai text,
  ativa boolean
);

create table if not exists public.alertas_config (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  threshold_value numeric(10,2),
  notification_channel text default 'email',
  contact_value text,
  is_active boolean default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.market_prices enable row level security;
alter table public.market_news enable row level security;
alter table public.alertas_config enable row level security;

create policy "market_prices_read_all" on public.market_prices for select using (true);
create policy "market_news_read_all" on public.market_news for select using (true);

create policy "alertas_config_select_own" on public.alertas_config for select using (auth.uid() = user_id);
create policy "alertas_config_insert_own" on public.alertas_config for insert with check (auth.uid() = user_id);
create policy "alertas_config_update_own" on public.alertas_config for update using (auth.uid() = user_id);
create policy "alertas_config_delete_own" on public.alertas_config for delete using (auth.uid() = user_id);
