-- ============================================================
-- ข้อมูลตัวอย่างสำหรับทดลองใช้งาน (รันหลัง schema.sql)
-- ============================================================

with new_kpis as (
  insert into public.kpis (name, description, category, unit, target, direction, owner, frequency)
  values
    ('อัตราความพึงพอใจของลูกค้า', 'คะแนนความพึงพอใจเฉลี่ยจากแบบสอบถาม', 'ลูกค้า', '%', 90, 'higher_better', 'สมชาย ใจดี', 'monthly'),
    ('รายได้รวมต่อเดือน', 'ยอดขายรวมทุกช่องทาง', 'การเงิน', 'บาท', 500000, 'higher_better', 'สมหญิง รักงาน', 'monthly'),
    ('เวลาเฉลี่ยในการปิดงาน', 'ระยะเวลาเฉลี่ยตั้งแต่รับงานจนปิด (วัน)', 'กระบวนการภายใน', 'วัน', 3, 'lower_better', 'อารีย์ ขยัน', 'monthly'),
    ('จำนวนพนักงานที่ผ่านการอบรม', 'จำนวนพนักงานที่ผ่านหลักสูตรพัฒนาทักษะ', 'การเรียนรู้และพัฒนา', 'คน', 20, 'higher_better', 'สมชาย ใจดี', 'quarterly')
  returning id, name
)
insert into public.kpi_values (kpi_id, period, actual, note)
select id, period, actual, note from new_kpis
cross join lateral (
  values
    (case
       when new_kpis.name = 'อัตราความพึงพอใจของลูกค้า' then '2026-06'
       when new_kpis.name = 'รายได้รวมต่อเดือน' then '2026-06'
       when new_kpis.name = 'เวลาเฉลี่ยในการปิดงาน' then '2026-06'
       else '2026-Q2' end,
     case
       when new_kpis.name = 'อัตราความพึงพอใจของลูกค้า' then 82
       when new_kpis.name = 'รายได้รวมต่อเดือน' then 430000
       when new_kpis.name = 'เวลาเฉลี่ยในการปิดงาน' then 4.5
       else 12 end,
     'งวดก่อนหน้า')
) as v(period, actual, note);

-- เพิ่มค่างวดล่าสุดของแต่ละ KPI
insert into public.kpi_values (kpi_id, period, actual, note)
select id,
  case when frequency = 'quarterly' then '2026-Q3' else '2026-07' end,
  case
    when name = 'อัตราความพึงพอใจของลูกค้า' then 91
    when name = 'รายได้รวมต่อเดือน' then 520000
    when name = 'เวลาเฉลี่ยในการปิดงาน' then 3.2
    else 18 end,
  'งวดล่าสุด'
from public.kpis;
