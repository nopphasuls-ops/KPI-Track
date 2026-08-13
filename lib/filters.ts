import { type KpiFilters, type KpiWithLatest } from "@/types/kpi";
import { kpiStatus } from "@/lib/kpi";

// กรองรายการ KPI ตามหมวดหมู่ / ผู้รับผิดชอบ / สถานะ
export function filterKpis(
  kpis: KpiWithLatest[],
  f: KpiFilters
): KpiWithLatest[] {
  return kpis.filter((kpi) => {
    if (f.category && (kpi.category ?? "") !== f.category) return false;
    if (f.owner && (kpi.owner ?? "") !== f.owner) return false;
    if (f.status && kpiStatus(kpi) !== f.status) return false;
    return true;
  });
}

// รายชื่อหมวดหมู่ที่ไม่ซ้ำ (สำหรับ dropdown)
export function categoryOptions(kpis: KpiWithLatest[]): string[] {
  const set = new Set<string>();
  for (const kpi of kpis) {
    if (kpi.category) set.add(kpi.category);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "th"));
}

// รายชื่อผู้รับผิดชอบที่ไม่ซ้ำ (สำหรับ dropdown)
export function ownerOptions(kpis: KpiWithLatest[]): string[] {
  const set = new Set<string>();
  for (const kpi of kpis) {
    if (kpi.owner) set.add(kpi.owner);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "th"));
}

// มีการกรองอยู่หรือไม่ (ใช้ตัดสินใจแสดงปุ่มล้างตัวกรอง)
export function hasActiveFilters(f: KpiFilters): boolean {
  return Boolean(f.category || f.owner || f.status);
}
