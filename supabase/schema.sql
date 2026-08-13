-- ============================================================
-- KPI Tracking Board — โครงสร้างฐานข้อมูล (รันใน Supabase SQL Editor)
-- ============================================================

create extension if not exists "pgcrypto";

-- ตารางตัวชี้วัด (นิยาม + เป้าหมาย)
create table if not exists public.kpis (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  unit text,
  target numeric not null default 0,
  direction text not null default 'higher_better'
    check (direction in ('higher_better', 'lower_better')),
  owner text,
  frequency text not null default 'monthly'
    check (frequency in ('monthly', 'quarterly', 'yearly')),
  created_at timestamptz not null default now()
);

-- ตารางค่าจริงรายงวด (KPI 1 ตัว มีได้หลายงวด)
create table if not exists public.kpi_values (
  id uuid primary key default gen_random_uuid(),
  kpi_id uuid not null references public.kpis(id) on delete cascade,
  period text not null, -- "2026-08" (รายเดือน) หรือ "2026-Q3" (รายไตรมาส)
  actual numeric not null,
  note text,
  recorded_at timestamptz not null default now(),
  unique (kpi_id, period)
);

create index if not exists kpi_values_kpi_id_idx on public.kpi_values (kpi_id);

-- ============================================================
-- Row Level Security
-- (เปิดกว้างสำหรับเดโม — ปรับให้ผูกกับ auth เมื่อมีระบบผู้ใช้)
-- ============================================================
alter table public.kpis enable row level security;
alter table public.kpi_values enable row level security;

create policy "kpis read"   on public.kpis for select using (true);
create policy "kpis insert" on public.kpis for insert with check (true);
create policy "kpis update" on public.kpis for update using (true);
create policy "kpis delete" on public.kpis for delete using (true);

create policy "kpi_values read"   on public.kpi_values for select using (true);
create policy "kpi_values insert" on public.kpi_values for insert with check (true);
create policy "kpi_values update" on public.kpi_values for update using (true);
create policy "kpi_values delete" on public.kpi_values for delete using (true);
