-- ============================================================
-- KPI Tracking Board — ระบบสิทธิ์ (Authentication + Roles)
-- รันใน Supabase SQL Editor (หลัง schema.sql)
-- ============================================================

-- 1) ตารางโปรไฟล์ผู้ใช้ + บทบาท ผูกกับ auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  role text not null default 'viewer'
    check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 2) ฟังก์ชันช่วยเช็คสิทธิ์ (SECURITY DEFINER = อ่าน profiles โดยข้าม RLS เพื่อเลี่ยง recursion)
create or replace function public.current_user_role()
  returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
  returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
$$;

create or replace function public.can_write()
  returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  )
$$;

-- 3) สร้างโปรไฟล์อัตโนมัติเมื่อมีผู้ใช้ใหม่ (ค่าเริ่มต้น role = viewer)
create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) RLS ของ profiles
drop policy if exists "profiles read"         on public.profiles;
drop policy if exists "profiles admin update" on public.profiles;
drop policy if exists "profiles admin insert" on public.profiles;

create policy "profiles read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles admin update" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
create policy "profiles admin insert" on public.profiles
  for insert with check (public.is_admin());

-- 5) แทนที่ RLS แบบเปิดโล่งเดิมของ kpis / kpi_values ด้วยแบบอิงสิทธิ์
--    - อ่าน: ผู้ที่ล็อกอินแล้วทุกคน
--    - เขียน (insert/update/delete): เฉพาะ admin / editor
drop policy if exists "kpis read"   on public.kpis;
drop policy if exists "kpis insert" on public.kpis;
drop policy if exists "kpis update" on public.kpis;
drop policy if exists "kpis delete" on public.kpis;

create policy "kpis read" on public.kpis
  for select using (auth.role() = 'authenticated');
create policy "kpis write" on public.kpis
  for all using (public.can_write()) with check (public.can_write());

drop policy if exists "kpi_values read"   on public.kpi_values;
drop policy if exists "kpi_values insert" on public.kpi_values;
drop policy if exists "kpi_values update" on public.kpi_values;
drop policy if exists "kpi_values delete" on public.kpi_values;

create policy "kpi_values read" on public.kpi_values
  for select using (auth.role() = 'authenticated');
create policy "kpi_values write" on public.kpi_values
  for all using (public.can_write()) with check (public.can_write());

-- ============================================================
-- หลังสร้างผู้ใช้คนแรกใน Dashboard (Authentication > Users > Add user)
-- ให้ตั้งเป็น admin ด้วยคำสั่ง (แก้อีเมลให้ตรง):
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
-- ============================================================
