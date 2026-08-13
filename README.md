# KPI Tracking Board

ระบบติดตามตัวชี้วัดผลงาน (KPI) — เทียบ **ค่าจริง** กับ **เป้าหมาย** ตามช่วงเวลา
พร้อมคำนวณ % ความสำเร็จ สถานะสี และกราฟแนวโน้มอัตโนมัติ

> UI ภาษาไทยทั้งหมด · ธีมน้ำเงิน–ขาว–ทอง · ฟอนต์ Noto Sans Thai

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** — PostgreSQL, Auth, Row Level Security
- **Recharts** — กราฟ (line / bar / donut)

## ฟีเจอร์หลัก

- แดชบอร์ด: การ์ดสรุป + Donut สัดส่วนสถานะ + Bar % ความสำเร็จรายตัวชี้วัด
- รายการ KPI พร้อม progress bar และสถานะสี (🟢 บรรลุ / 🟡 เสี่ยง / 🔴 ต่ำกว่าเป้า)
- สร้าง/แก้ไข/ลบ KPI และบันทึกค่าจริงรายงวด + กราฟแนวโน้ม actual เทียบ target
- ตัวกรอง: หมวดหมู่ / ผู้รับผิดชอบ / สถานะ
- ระบบล็อกอิน (email + password) + สิทธิ์ 3 ระดับ **admin / editor / viewer** ผ่าน Supabase RLS

## เริ่มต้นใช้งาน (Local)

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) ตั้งค่า Environment Variables

คัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ค่าจาก Supabase project ของคุณ
(Dashboard → Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

### 3) ตั้งค่าฐานข้อมูล (Supabase SQL Editor)

รันตามลำดับ:

1. `supabase/schema.sql` — สร้างตาราง `kpis` และ `kpi_values` + RLS
2. `supabase/auth.sql` — ตาราง `profiles` + บทบาท + trigger + RLS อิงสิทธิ์
3. `supabase/seed.sql` — *(ไม่บังคับ)* ข้อมูลตัวอย่าง

### 4) สร้างผู้ใช้แอดมินคนแรก

- Supabase → **Authentication → Users → Add user** (ติ๊ก **Auto Confirm User**)
- แล้วตั้งเป็น admin:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

### 5) รัน dev server

```bash
npm run dev      # http://localhost:3000
```

## คำสั่งที่ใช้บ่อย

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # รัน production build
npm run lint     # ตรวจ ESLint
```

## Deploy บน Vercel

1. Import repo เข้า Vercel — ตั้ง **Framework Preset = Next.js** (ห้ามตั้งเป็น Other)
2. เพิ่ม **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. หลัง deploy ได้โดเมนแล้ว ไปที่ Supabase → **Authentication → URL Configuration**
   เพิ่มโดเมนนั้นใน **Site URL** และ **Redirect URLs**

> **ห้าม** commit ไฟล์ `.env.local` หรือ secret ใด ๆ เข้า git (มีใน `.gitignore` แล้ว)

## โครงสร้างโปรเจกต์

```
app/            # หน้า (dashboard, kpis, login) + layout
components/     # Header, FilterBar, Loading
lib/            # supabase client/server/middleware, kpi calc, filters, useRole
types/kpi.ts    # ชนิดข้อมูล + metadata
supabase/       # schema.sql, auth.sql, seed.sql
middleware.ts   # ป้องกัน route + refresh session
```
