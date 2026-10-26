-- 0001_init.sql
-- Esquema base para Ulular Sala de Ensayo (Querétaro, MX)

create extension if not exists btree_gist;

create type booking_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'late_cancel',
  'expired',
  'no_show',
  'completed'
);

create type staff_role as enum ('owner', 'staff');

-- Usuarios autorizados del panel (allowlist + rol)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  role staff_role not null default 'staff',
  created_at timestamptz not null default now()
);

-- Configuración única de la sala (editable solo por owner)
create table settings (
  id int primary key default 1 check (id = 1),
  open_hours jsonb not null default '{
    "mon": [],
    "tue": [["17:00", "23:00"]],
    "wed": [["17:00", "23:00"]],
    "thu": [["17:00", "23:00"]],
    "fri": [["17:00", "23:00"]],
    "sat": [["11:00", "23:00"]],
    "sun": [["11:00", "20:00"]]
  }'::jsonb,
  price_per_hour numeric not null default 150,
  min_hours int not null default 1,
  max_days_ahead int not null default 60,
  pending_ttl_hours int not null default 24,
  cancel_notice_hours int not null default 24,
  whatsapp_number text not null default '524424067325',
  whatsapp_channel_url text not null default 'https://chat.whatsapp.com/LUIiBmdEUHS29vQSUsjmR5',
  social_links jsonb not null default '{
    "instagram": "https://www.instagram.com/ulularsala/",
    "facebook": "https://www.facebook.com/ulularsaladeensayo/",
    "youtube": "https://www.youtube.com/@ulularsala",
    "tiktok": "",
    "spotify": "",
    "maps": "https://share.google/Xj1vuGksqvnVJeEqL",
    "pizzaInstagram": "https://www.instagram.com/ulularnapulepizza",
    "pizzaFacebook": "https://www.facebook.com/share/19iX74tHFa/"
  }'::jsonb,
  google_calendar_id text,
  updated_at timestamptz not null default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- Eventos de Ulular / Ulular Napule Pizza (próximos y pasados según starts_at)
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  time_label text not null,
  venue text not null default 'Ulular Napule Pizza',
  tag text not null default 'Tocada',
  flyer_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_starts_at_idx on events (starts_at desc);

-- Fechas/rangos bloqueados manualmente desde el panel
create table blackout_dates (
  id serial primary key,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- Reservas de la sala
create table bookings (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  band_name text not null,
  contact_name text,
  phone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hours int generated always as (extract(epoch from (ends_at - starts_at)) / 3600) stored,
  total numeric not null,
  paid boolean not null default false,
  status booking_status not null default 'pending',
  notes text,
  admin_notes text,
  google_event_id text,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Anti-doble-reserva a nivel base de datos
  exclude using gist (tstzrange(starts_at, ends_at) with &&)
    where (status in ('pending', 'confirmed'))
);

create index bookings_starts_at_idx on bookings (starts_at);
create index bookings_status_idx on bookings (status);

-- Suscripciones Web Push para el panel admin (PWA)
create table push_subscriptions (
  id serial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table settings enable row level security;
alter table events enable row level security;
alter table blackout_dates enable row level security;
alter table bookings enable row level security;
alter table push_subscriptions enable row level security;

-- Funciones auxiliares para RLS
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;

-- Políticas: público solo puede leer settings básicos; reservas pasan por route handlers (service role)
create policy "Settings visibles para lectura pública"
  on settings for select
  using (true);

create policy "Solo owner actualiza settings"
  on settings for update
  using (public.is_owner());

create policy "Staff lee perfiles"
  on profiles for select
  using (public.is_staff());

create policy "Solo owner administra perfiles"
  on profiles for all
  using (public.is_owner());

create policy "Staff lee y gestiona reservas"
  on bookings for all
  using (public.is_staff());

create policy "Staff lee y gestiona fechas bloqueadas"
  on blackout_dates for all
  using (public.is_staff());

create policy "Eventos visibles para lectura pública"
  on events for select
  using (true);

create policy "Owner y staff gestionan eventos"
  on events for all
  using (public.is_staff());

create policy "Usuario gestiona sus suscripciones push"
  on push_subscriptions for all
  using (auth.uid() = user_id);
