diff --git a/supabase/migrations/20260302183000_inteligencia.sql b/supabase/migrations/20260302183000_inteligencia.sql
new file mode 100644
index 0000000000000000000000000000000000000000..8ae9a5d179f62cbfb2feeb18fa64bd8a6bdcb990
--- /dev/null
+++ b/supabase/migrations/20260302183000_inteligencia.sql
@@ -0,0 +1,41 @@
+-- Central de Inteligência: tabelas e ajustes complementares
+
+create table if not exists public.alertas_config (
+  id uuid primary key default gen_random_uuid(),
+  user_id uuid not null references auth.users(id) on delete cascade,
+  type text not null,
+  threshold_value numeric null,
+  notification_channel text not null default 'email',
+  contact_value text not null,
+  is_active boolean not null default true,
+  last_triggered_at timestamptz null,
+  created_at timestamptz not null default now()
+);
+
+alter table public.alertas_config enable row level security;
+
+do $$ begin
+  create policy "alertas_config_select_own" on public.alertas_config for select using (auth.uid() = user_id);
+exception when duplicate_object then null; end $$;
+do $$ begin
+  create policy "alertas_config_insert_own" on public.alertas_config for insert with check (auth.uid() = user_id);
+exception when duplicate_object then null; end $$;
+do $$ begin
+  create policy "alertas_config_update_own" on public.alertas_config for update using (auth.uid() = user_id);
+exception when duplicate_object then null; end $$;
+do $$ begin
+  create policy "alertas_config_delete_own" on public.alertas_config for delete using (auth.uid() = user_id);
+exception when duplicate_object then null; end $$;
+
+alter table public.market_news
+  add column if not exists title text,
+  add column if not exists summary text,
+  add column if not exists source_url text,
+  add column if not exists source_name text,
+  add column if not exists type text,
+  add column if not exists bonus_percentage numeric,
+  add column if not exists expires_at timestamptz,
+  add column if not exists published_at timestamptz,
+  add column if not exists is_active boolean not null default true;
+
+create unique index if not exists idx_market_news_source_url on public.market_news (source_url);
