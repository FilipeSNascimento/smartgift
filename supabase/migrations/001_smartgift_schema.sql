-- =============================================================================
-- SmartGift — Schema PostgreSQL + Row-Level Security (RLS) "100% Sem Spoiler"
-- Seguindo Supabase & Postgres Best Practices
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. Perfis de Usuários
create table if not exists public.smartgift_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null unique,
  avatar text not null default '🎁',
  birthday_label text not null default '',
  level integer not null default 1,
  xp integer not null default 100,
  personal_theme text not null default 'violet',
  created_at timestamptz not null default now()
);

alter table public.smartgift_profiles enable row level security;

create policy "Perfis visiveis para usuarios autenticados"
  on public.smartgift_profiles for select
  to authenticated
  using ( true );

create policy "Usuario atualiza apenas o proprio perfil"
  on public.smartgift_profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- 2. Clãs (Famílias, Grupos de Amigos, Casamentos)
create table if not exists public.smartgift_clans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  crest_icon text not null default '🛡️',
  motto text not null default '',
  level integer not null default 1,
  xp_progress integer not null default 20,
  theme_id text not null default 'violet',
  secret_santa_budget numeric(10,2) not null default 150.00,
  secret_santa_drawn boolean not null default false,
  owner_id uuid not null references public.smartgift_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_smartgift_clans_invite_code on public.smartgift_clans(invite_code);
alter table public.smartgift_clans enable row level security;

create policy "Clas visiveis para usuarios autenticados"
  on public.smartgift_clans for select
  to authenticated
  using ( true );

create policy "Usuarios autenticados criam clas"
  on public.smartgift_clans for insert
  to authenticated
  with check ( (select auth.uid()) = owner_id );

-- 3. Cartas de Desejos (Wish Items)
create table if not exists public.smartgift_wish_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.smartgift_profiles(id) on delete cascade,
  title text not null,
  category text not null default 'Presentes',
  image_url text not null,
  original_url text not null,
  priority text not null default 'alta' check (priority in ('alta', 'media', 'sonho')),
  notes_from_owner text not null default '',
  lowest_price numeric(10,2) not null,
  highest_price numeric(10,2) not null,
  savings_amount numeric(10,2) not null default 0,
  savings_percent integer not null default 0,
  offers_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_smartgift_wish_items_owner_id on public.smartgift_wish_items(owner_id);
alter table public.smartgift_wish_items enable row level security;

create policy "Qualquer usuario autenticado ve os desejos"
  on public.smartgift_wish_items for select
  to authenticated
  using ( true );

create policy "Dono gerencia seus proprios desejos"
  on public.smartgift_wish_items for all
  to authenticated
  using ( (select auth.uid()) = owner_id )
  with check ( (select auth.uid()) = owner_id );

-- 4. Coordenação Secreta (Reservas, Vaquinha e Comentários — INVISÍVEL PARA O DONO!)
create table if not exists public.smartgift_secret_coordination (
  wish_item_id uuid primary key references public.smartgift_wish_items(id) on delete cascade,
  wish_owner_id uuid not null references public.smartgift_profiles(id) on delete cascade,
  secret_status text not null default 'disponivel' check (secret_status in ('disponivel', 'reservado', 'vaquinha_ativa', 'comprado')),
  reserved_by_user_id uuid references public.smartgift_profiles(id) on delete set null,
  reserved_by_name text,
  pool_target_amount numeric(10,2) not null default 0,
  pool_collected_amount numeric(10,2) not null default 0,
  contributions_json jsonb not null default '[]'::jsonb,
  comments_json jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_smartgift_secret_owner on public.smartgift_secret_coordination(wish_owner_id);
alter table public.smartgift_secret_coordination enable row level security;

-- REGRA DE OURO RLS SEM SPOILER: O dono do presente NUNCA pode dar SELECT nesta tabela!
create policy "Sem Spoiler: apenas amigos (nao-donos) enxergam reservas e vaquinhas"
  on public.smartgift_secret_coordination for select
  to authenticated
  using ( (select auth.uid()) <> wish_owner_id );

create policy "Amigos atualizam reservas e vaquinhas sem o dono saber"
  on public.smartgift_secret_coordination for all
  to authenticated
  using ( (select auth.uid()) <> wish_owner_id )
  with check ( (select auth.uid()) <> wish_owner_id );