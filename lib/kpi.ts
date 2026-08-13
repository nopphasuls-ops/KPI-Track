import {
  type Kpi,
  type KpiStatus,
  type KpiValue,
  type KpiWithLatest,
} from "@/types/kpi";

// คำนวณ % ความสำเร็จเทียบเป้า โดยปรับตามทิศทางของตัวชี้วัด
// - higher_better: actual / target
// - lower_better: target / actual (ยิ่งค่าจริงน้อยยิ่งดี)
export function achievementPct(
  kpi: Pick<Kpi, "target" | "direction">,
  actual: number | null | undefined
): number | null {
  if (actual === null || actual === undefined) return null;

  if (kpi.direction === "higher_better") {
    if (kpi.target === 0) return null;
    return (actual / kpi.target) * 100;
  }

  // lower_better
  if (actual === 0) return 200; // ทำได้ดีเยี่ยม (เลี่ยงหารด้วยศูนย์)
  return (kpi.target / actual) * 100;
}

// แปลง % ความสำเร็จเป็นสถานะสี
export function statusFromPct(pct: number | null): KpiStatus {
  if (pct === null) return "no_data";
  if (pct >= 100) return "on_track";
  if (pct >= 80) return "at_risk";
  return "off_track";
}

// สถานะของ KPI จากค่าจริงงวดล่าสุด
export function kpiStatus(kpi: KpiWithLatest): KpiStatus {
  return statusFromPct(achievementPct(kpi, kpi.latest?.actual ?? null));
}

// จับคู่ KPI กับค่าจริงงวดล่าสุด (จากรายการ kpi_values ทั้งหมด)
export function attachLatest(kpis: Kpi[], values: KpiValue[]): KpiWithLatest[] {
  const latestByKpi = new Map<string, KpiValue>();
  for (const v of values) {
    const current = latestByKpi.get(v.kpi_id);
    // period เป็น text เรียงตามลำดับตัวอักษรได้ (YYYY-MM / YYYY-Qn)
    if (!current || v.period > current.period) {
      latestByKpi.set(v.kpi_id, v);
    }
  }
  return kpis.map((kpi) => ({
    ...kpi,
    latest: latestByKpi.get(kpi.id) ?? null,
  }));
}

// จัดรูปแบบตัวเลขพร้อมหน่วย (เช่น "85 %", "1,200 บาท")
export function formatValue(
  value: number | null | undefined,
  unit: string | null
): string {
  if (value === null || value === undefined) return "–";
  const num = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(value);
  return unit ? `${num} ${unit}` : num;
}

// จัดรูปแบบ % ความสำเร็จ (ปัดเป็นจำนวนเต็ม)
export function formatPct(pct: number | null): string {
  if (pct === null) return "–";
  return `${Math.round(pct)}%`;
}
