-- Migración inicial de Ulular Sala de Ensayo (Fase 3)
-- Zona horaria de operación: America/Mexico_City

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

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  role staff_role not null default 'staff',
  created_at timestamptz not null default now()
);

create table if not exists settings (
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
  google_calendar_id text,
  updated_at timestamptz not null default now()
);

create table if not exists blackout_dates (
  id serial primary key,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  band_name text not null,
  contact_name text,
  phone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hours int generated always as (extract(epoch from ends_at - starts_at) / 3600) stored,
  total numeric not null,
  paid boolean not null default false,
  status booking_status not null default 'pending',
  notes text,
  admin_notes text,
  google_event_id text,
  source text not null default 'web' check (source in ('web', 'admin')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Anti-doble-reserva a nivel base de datos
  exclude using gist (tstzrange(starts_at, ends_at) with &&)
    where (status in ('pending', 'confirmed'))
);

create table if not exists push_subscriptions (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);
