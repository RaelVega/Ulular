-- Migración 0002: Actualización de roles de staff
-- Roles: developer (Rael), superadmin (Dueño Ulular), admin (Staff de cabina)

do $$
begin
  -- Si el tipo staff_role existe con los valores antiguos, lo actualizamos
  if exists (select 1 from pg_type where typname = 'staff_role') then
    -- Renombrar tipo anterior
    alter type staff_role rename to staff_role_old;

    -- Crear nuevo enum con los 3 roles
    create type staff_role as enum ('developer', 'superadmin', 'admin');

    -- Actualizar columna en profiles
    alter table profiles
      alter column role drop default,
      alter column role type staff_role using (
        case role::text
          when 'owner' then 'superadmin'::staff_role
          when 'staff' then 'admin'::staff_role
          else 'admin'::staff_role
        end
      ),
      alter column role set default 'admin';

    -- Eliminar tipo anterior
    drop type staff_role_old;
  else
    create type staff_role as enum ('developer', 'superadmin', 'admin');
  end if;
end $$;

-- Asegurar políticas RLS para los nuevos roles
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('developer', 'superadmin', 'admin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('developer', 'superadmin')
  );
$$;
