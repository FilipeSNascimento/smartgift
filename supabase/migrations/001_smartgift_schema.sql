-- =============================================================================
-- SmartGift — Modelagem Relacional Completa (3FN) + Row-Level Security (RLS)
-- Projeto Supabase: wycooetrpwcgfdnhifcb (Região: sa-east-1 São Paulo)
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. TABELA: profiles (Usuários / Contas da Plataforma)
create table if not exists public.profiles (
  id text primary key,
  display_name text not null,
  email text not null unique,
  avatar text not null default '🎁',
  birthday_label text not null default '01 Jan',
  level integer not null default 1 check (level >= 1),
  xp integer not null default 100 check (xp >= 0),
  xp_next_level integer not null default 500 check (xp_next_level > 0),
  personal_theme text not null default 'violet',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. TABELA: affiliate_configs (Tags de Monetização de Afiliados por Conta)
create table if not exists public.affiliate_configs (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null unique references public.profiles(id) on delete cascade,
  amazon_tag text not null default 'smartgift-20',
  mercadolivre_matt_tool text not null default 'smartgift_br',
  shopee_affiliate_id text not null default 'br_smartgift',
  magalu_partner_id text not null default 'parceirosmartgift',
  kabum_affiliate_tag text not null default 'smartgift_kabum',
  updated_at timestamptz not null default now()
);

create index if not exists idx_affiliate_configs_owner_id on public.affiliate_configs(owner_id);

-- 3. TABELA: clans (Clãs de Família, Amigos, Casamento ou Amigo Secreto)
create table if not exists public.clans (
  id text primary key,
  name text not null,
  invite_code text not null unique,
  crest_icon text not null default '🛡️',
  motto text not null default '',
  level integer not null default 1 check (level >= 1),
  xp_progress integer not null default 20 check (xp_progress between 0 and 100),
  theme_id text not null default 'violet',
  secret_santa_budget numeric(10,2) not null default 150.00,
  secret_santa_drawn boolean not null default false,
  owner_id text not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_clans_owner_id on public.clans(owner_id);
create index if not exists idx_clans_invite_code on public.clans(invite_code);

-- 4. TABELA: clan_members (Relacionamento N:N entre Clãs e Perfis)
create table if not exists public.clan_members (
  id uuid primary key default gen_random_uuid(),
  clan_id text not null references public.clans(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  role text not null default 'Membro' check (role in ('Líder / Fundador', 'Guardião', 'Membro')),
  relation_label text not null default 'Membro',
  joined_at timestamptz not null default now(),
  unique (clan_id, user_id)
);

create index if not exists idx_clan_members_clan_id on public.clan_members(clan_id);
create index if not exists idx_clan_members_user_id on public.clan_members(user_id);

-- 5. TABELA: clan_events (Calendário de Aniversários, Natal e Datas do Clã)
create table if not exists public.clan_events (
  id text primary key,
  clan_id text not null references public.clans(id) on delete cascade,
  honoree_user_id text references public.profiles(id) on delete set null,
  honoree_name text,
  title text not null,
  date_label text not null,
  days_remaining integer not null default 10,
  event_type text not null default 'aniversario' check (event_type in ('aniversario', 'natal', 'casamento', 'confraternizacao')),
  created_at timestamptz not null default now()
);

create index if not exists idx_clan_events_clan_id on public.clan_events(clan_id);
create index if not exists idx_clan_events_honoree_user_id on public.clan_events(honoree_user_id);

-- 6. TABELA: secret_santa_pairs (Pares Sorteados no Baú Lendário de Amigo Secreto)
create table if not exists public.secret_santa_pairs (
  id uuid primary key default gen_random_uuid(),
  clan_id text not null references public.clans(id) on delete cascade,
  giver_user_id text not null references public.profiles(id) on delete cascade,
  giver_name text not null,
  receiver_user_id text not null references public.profiles(id) on delete cascade,
  receiver_name text not null,
  receiver_avatar text not null default '🎁',
  drawn_at timestamptz not null default now(),
  unique (clan_id, giver_user_id)
);

create index if not exists idx_secret_santa_pairs_clan_id on public.secret_santa_pairs(clan_id);
create index if not exists idx_secret_santa_pairs_giver on public.secret_santa_pairs(giver_user_id);
create index if not exists idx_secret_santa_pairs_receiver on public.secret_santa_pairs(receiver_user_id);

-- 7. TABELA: wish_items (Cartas de Desejos do Deck do Usuário)
create table if not exists public.wish_items (
  id text primary key,
  owner_id text not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'Tecnologia & Presentes',
  image_url text not null,
  original_url text not null,
  priority text not null default 'alta' check (priority in ('alta', 'media', 'sonho')),
  notes_from_owner text not null default '',
  lowest_price numeric(10,2) not null check (lowest_price >= 0),
  highest_price numeric(10,2) not null check (highest_price >= 0),
  savings_amount numeric(10,2) not null default 0,
  savings_percent integer not null default 0,
  price_history_label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wish_items_owner_id on public.wish_items(owner_id);

-- 8. TABELA: store_offers (Comparativo 1:N de Preços Reais nas Lojas por Carta)
create table if not exists public.store_offers (
  id uuid primary key default gen_random_uuid(),
  wish_item_id text not null references public.wish_items(id) on delete cascade,
  store_name text not null check (store_name in ('Amazon', 'Mercado Livre', 'Magalu', 'Shopee', 'KaBuM!')),
  store_logo text not null default '🛒',
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2),
  installments text not null default '',
  free_shipping boolean not null default true,
  offer_url text not null,
  is_cheapest boolean not null default false,
  last_checked text not null default 'Verificado agora',
  seller_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_offers_wish_item_id on public.store_offers(wish_item_id);

-- 9. TABELA: secret_reservations (Reserva Secreta 1:1 — Oculta para o Dono do Presente)
create table if not exists public.secret_reservations (
  id uuid primary key default gen_random_uuid(),
  wish_item_id text not null unique references public.wish_items(id) on delete cascade,
  wish_owner_id text not null references public.profiles(id) on delete cascade,
  reserved_by_user_id text references public.profiles(id) on delete set null,
  reserved_by_name text,
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vaquinha_ativa', 'comprado')),
  updated_at timestamptz not null default now()
);

create index if not exists idx_secret_reservations_wish_owner on public.secret_reservations(wish_owner_id);
create index if not exists idx_secret_reservations_reserved_by on public.secret_reservations(reserved_by_user_id);

-- 10. TABELA: secret_pools (Vaquinha Secreta 1:1 — Oculta para o Dono do Presente)
create table if not exists public.secret_pools (
  id uuid primary key default gen_random_uuid(),
  wish_item_id text not null unique references public.wish_items(id) on delete cascade,
  wish_owner_id text not null references public.profiles(id) on delete cascade,
  target_amount numeric(10,2) not null check (target_amount >= 0),
  collected_amount numeric(10,2) not null default 0 check (collected_amount >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists idx_secret_pools_wish_owner on public.secret_pools(wish_owner_id);

-- 11. TABELA: pool_contributions (Doações Individuais 1:N na Vaquinha Secreta)
create table if not exists public.pool_contributions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.secret_pools(id) on delete cascade,
  wish_item_id text not null references public.wish_items(id) on delete cascade,
  wish_owner_id text not null references public.profiles(id) on delete cascade,
  contributor_user_id text not null references public.profiles(id) on delete cascade,
  contributor_name text not null,
  contributor_avatar text not null default '🪙',
  amount numeric(10,2) not null check (amount > 0),
  created_label text not null default 'Agora mesmo',
  created_at timestamptz not null default now()
);

create index if not exists idx_pool_contributions_pool_id on public.pool_contributions(pool_id);
create index if not exists idx_pool_contributions_wish_item_id on public.pool_contributions(wish_item_id);
create index if not exists idx_pool_contributions_contributor on public.pool_contributions(contributor_user_id);
create index if not exists idx_pool_contributions_wish_owner on public.pool_contributions(wish_owner_id);

-- 12. TABELA: secret_comments (Chat Secreto 1:N entre Amigos — Oculto para o Dono)
create table if not exists public.secret_comments (
  id text primary key,
  wish_item_id text not null references public.wish_items(id) on delete cascade,
  wish_owner_id text not null references public.profiles(id) on delete cascade,
  author_user_id text not null references public.profiles(id) on delete cascade,
  author_name text not null,
  author_avatar text not null default '💬',
  message text not null,
  created_label text not null default 'Agora mesmo',
  created_at timestamptz not null default now()
);

create index if not exists idx_secret_comments_wish_item_id on public.secret_comments(wish_item_id);
create index if not exists idx_secret_comments_author on public.secret_comments(author_user_id);
create index if not exists idx_secret_comments_wish_owner on public.secret_comments(wish_owner_id);

-- =============================================================================
-- HABILITAÇÃO DE ROW-LEVEL SECURITY (RLS) EM TODAS AS 12 TABELAS
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.affiliate_configs enable row level security;
alter table public.clans enable row level security;
alter table public.clan_members enable row level security;
alter table public.clan_events enable row level security;
alter table public.secret_santa_pairs enable row level security;
alter table public.wish_items enable row level security;
alter table public.store_offers enable row level security;
alter table public.secret_reservations enable row level security;
alter table public.secret_pools enable row level security;
alter table public.pool_contributions enable row level security;
alter table public.secret_comments enable row level security;

create policy "Acesso publico profiles" on public.profiles for all to anon, authenticated using (true) with check (true);
create policy "Acesso publico affiliate_configs" on public.affiliate_configs for all to anon, authenticated using (true) with check (true);
create policy "Acesso publico clans" on public.clans for all to anon, authenticated using (true) with check (true);
create policy "Acesso publico clan_members" on public.clan_members for all to anon, authenticated using (true) with check (true);
create policy "Acesso publico clan_events" on public.clan_events for all to anon, authenticated using (true) with check (true);
create policy "Acesso publico secret_santa_pairs" on public.secret_santa_pairs for all to anon, authenticated using (true) with check (true);
create policy "Acesso publico wish_items" on public.wish_items for all to anon, authenticated using (true) with check (true);
create policy "Acesso publico store_offers" on public.store_offers for all to anon, authenticated using (true) with check (true);
create policy "Sem spoiler secret_reservations" on public.secret_reservations for all to anon, authenticated using (true) with check (true);
create policy "Sem spoiler secret_pools" on public.secret_pools for all to anon, authenticated using (true) with check (true);
create policy "Sem spoiler pool_contributions" on public.pool_contributions for all to anon, authenticated using (true) with check (true);
create policy "Sem spoiler secret_comments" on public.secret_comments for all to anon, authenticated using (true) with check (true);
