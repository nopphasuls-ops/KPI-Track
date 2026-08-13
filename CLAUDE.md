# CLAUDE.md

ไฟล์นี้ให้แนวทางแก่ Claude Code (claude.ai/code) ในการทำงานกับโค้ดในโปรเจกต์นี้

## ภาพรวมโปรเจกต์ (Project Overview)

**KPI Tracking Board** — ระบบติดตามตัวชี้วัดผลงาน (KPI) โดยเทียบ **ค่าจริง (actual)** กับ **เป้าหมาย (target)** ตามช่วงเวลา เพื่อดู % ความสำเร็จ, สถานะ และแนวโน้ม

- UI ทั้งหมดเป็น **ภาษาไทย**
- โทนสีหลัก: **น้ำเงิน–ขาว–ทอง**
- ฟอนต์: **Noto Sans Thai** ใช้ทั้งโปรเจกต์

### แนวคิดหลัก (โมเดลข้อมูล)

- **KPI** = นิยามตัวชี้วัด 1 ตัว มี target, unit, direction (ยิ่งมากดี/ยิ่งน้อยดี), category, owner
- **KPI Value** = ค่าจริงของตัวชี้วัดในแต่ละงวด (period) — KPI 1 ตัวมีได้หลายงวด เพื่อดูแนวโน้ม
- **% ความสำเร็จ** คำนวณต่างกันตาม direction แล้วแปลงเป็นสถานะสี:
  - `on_track` (≥100%) 🟢 บรรลุเป้า
  - `at_risk` (80–99%) 🟡 เสี่ยง
  - `off_track` (<80%) 🔴 ต่ำกว่าเป้า
  - `no_data` ยังไม่มีค่าจริง

## Tech Stack

- **Next.js** (App Router) — เฟรมเวิร์กหลัก
- **Tailwind CSS** — จัดการสไตล์และ design tokens
- **Supabase** — ฐานข้อมูล (PostgreSQL), Auth และ Realtime
- **Recharts** — กราฟ (line / bar / donut / gauge)
- **TypeScript** — ใช้กับทั้งโปรเจกต์ (strict)

## คำสั่งที่ใช้บ่อย (Common Commands)

```bash
npm run dev      # รัน development server (http://localhost:3000)
npm run build    # build สำหรับ production
npm run start    # รัน production build
npm run lint     # ตรวจสอบ ESLint
```

## โครงสร้างโปรเจกต์

```
app/
  layout.tsx                    # ฟอนต์ Noto Sans Thai + header/nav
  page.tsx                      # หน้าแรก (ภาพรวม + ทางลัด)
  dashboard/page.tsx            # การ์ดสรุป + donut + bar chart
  kpis/page.tsx                 # รายการ KPI + % ความสำเร็จ + สถานะ + filter
  kpis/new/page.tsx             # ฟอร์มสร้าง KPI
  kpis/[id]/page.tsx            # รายละเอียด KPI + line chart แนวโน้ม + ประวัติค่า
  kpis/[id]/values/new/page.tsx # ฟอร์มบันทึกค่าจริงรายงวด
components/
  FilterBar.tsx                 # ตัวกรอง (หมวดหมู่ / ผู้รับผิดชอบ / สถานะ)
lib/
  supabase/{client,server}.ts   # Supabase client (browser / server)
  kpi.ts                        # คำนวณ % ความสำเร็จ, สถานะ, จัดรูปแบบตัวเลข
  filters.ts                    # กรอง KPI + ตัวเลือก dropdown
types/kpi.ts                    # ชนิดข้อมูล + metadata (สถานะ/ทิศทาง/หมวดหมู่)
supabase/schema.sql             # ตาราง kpis + kpi_values + RLS
supabase/seed.sql               # ข้อมูลตัวอย่าง
```

## แนวทางการออกแบบ (Design Guidelines)

### โทนสี (Color Palette)

| บทบาท | สี | ตัวอย่างค่า |
|-------|-----|-------------|
| Primary (น้ำเงิน) | Navy / Royal Blue | `#1E3A8A` / `#2563EB` |
| Background (ขาว) | ขาว / ขาวนวล | `#FFFFFF` / `#F8FAFC` |
| Accent (ทอง) | ทอง | `#D4AF37` / `#EAB308` |
| Text | น้ำเงินเข้ม / เทาเข้ม | `#1E293B` |

- สถานะ KPI ใช้สีสื่อความหมาย: เขียว (บรรลุ), เหลือง/ทอง (เสี่ยง), แดง (ต่ำกว่าเป้า)

### ฟอนต์ (Typography)

- ใช้ **Noto Sans Thai** ทั้งโปรเจกต์ โหลดผ่าน `next/font/google` (CSS variable `--font-noto-sans-thai`)
- ผูกเข้ากับ `fontFamily.sans` ใน `tailwind.config` และตั้งเป็น default ของ `<body>`

### แนวทาง UI

- ข้อความ, label, ปุ่ม, ข้อความแจ้งเตือน **ทั้งหมดเป็นภาษาไทย** สุภาพ กระชับ
- รูปแบบตัวเลขใช้ `Intl.NumberFormat("th-TH")`; วันที่แบบไทย
- ออกแบบให้ responsive รองรับทั้ง desktop และ mobile

## Supabase

- แยก client สำหรับ **browser** และ **server** ตามแนวทาง Next.js App Router
- เก็บ key ใน `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server เท่านั้น — ห้าม expose ไป client)
- ใช้ **Row Level Security (RLS)** กับทุกตาราง
- **ห้าม** commit ไฟล์ `.env.local` หรือ secret ใด ๆ เข้า git
- รัน `supabase/schema.sql` (และ `seed.sql` ถ้าต้องการข้อมูลตัวอย่าง) ใน SQL Editor

## แนวปฏิบัติในการเขียนโค้ด (Conventions)

- TypeScript strict, หลีกเลี่ยง `any`
- Component เป็น PascalCase, ฟังก์ชัน/ตัวแปรเป็น camelCase
- ใช้ Server Components เป็นค่าเริ่มต้น, ใช้ `"use client"` เฉพาะเมื่อจำเป็น
- จัดสไตล์ด้วย Tailwind utility classes; ใช้ design tokens แทน hardcode สี
- ตรรกะการคำนวณ KPI รวมไว้ที่ `lib/kpi.ts` (ไม่กระจายในหน้า)
- รัน `npm run lint` ให้ผ่านก่อน commit
