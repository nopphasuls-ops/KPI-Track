// ===== ชนิดข้อมูลหลักของ KPI Tracking Board =====

// ทิศทางที่ถือว่า "ดี" ของตัวชี้วัด
export type KpiDirection = "higher_better" | "lower_better";

// ความถี่ในการเก็บค่า
export type KpiFrequency = "monthly" | "quarterly" | "yearly";

// สถานะเทียบเป้า (คำนวณจาก % ความสำเร็จ)
export type KpiStatus = "on_track" | "at_risk" | "off_track" | "no_data";

// ตัวชี้วัด (นิยาม + เป้าหมาย)
export interface Kpi {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string | null; // เช่น "%", "บาท", "ครั้ง"
  target: number;
  direction: KpiDirection;
  owner: string | null;
  frequency: KpiFrequency;
  created_at: string;
}

// ค่าจริงของตัวชี้วัดในแต่ละงวด
export interface KpiValue {
  id: string;
  kpi_id: string;
  period: string; // เช่น "2026-08" (รายเดือน) หรือ "2026-Q3" (รายไตรมาส)
  actual: number;
  note: string | null;
  recorded_at: string;
}

// KPI พร้อมค่าจริงงวดล่าสุด (ใช้แสดงบนบอร์ด/แดชบอร์ด)
export interface KpiWithLatest extends Kpi {
  latest: KpiValue | null;
}

// ===== ตัวกรองที่ใช้ร่วมกัน =====
export interface KpiFilters {
  category: string; // "" = ทั้งหมด
  owner: string; // "" = ทั้งหมด
  status: KpiStatus | ""; // "" = ทั้งหมด
}

export const EMPTY_FILTERS: KpiFilters = {
  category: "",
  owner: "",
  status: "",
};

// ===== ค่าคงที่และ metadata สำหรับแสดงผล =====
export const KPI_CATEGORY_OPTIONS = [
  "การเงิน",
  "ลูกค้า",
  "กระบวนการภายใน",
  "การเรียนรู้และพัฒนา",
] as const;

export const KPI_DIRECTION_META: Record<KpiDirection, { label: string }> = {
  higher_better: { label: "ยิ่งมากยิ่งดี" },
  lower_better: { label: "ยิ่งน้อยยิ่งดี" },
};

export const KPI_FREQUENCY_META: Record<KpiFrequency, { label: string }> = {
  monthly: { label: "รายเดือน" },
  quarterly: { label: "รายไตรมาส" },
  yearly: { label: "รายปี" },
};

export const KPI_STATUS_META: Record<
  KpiStatus,
  { label: string; badgeClassName: string; color: string }
> = {
  on_track: {
    label: "บรรลุเป้า",
    badgeClassName: "bg-emerald-100 text-emerald-700",
    color: "#059669",
  },
  at_risk: {
    label: "เสี่ยง",
    badgeClassName: "bg-amber-100 text-amber-700",
    color: "#d97706",
  },
  off_track: {
    label: "ต่ำกว่าเป้า",
    badgeClassName: "bg-red-100 text-red-700",
    color: "#dc2626",
  },
  no_data: {
    label: "ยังไม่มีข้อมูล",
    badgeClassName: "bg-slate-100 text-slate-500",
    color: "#94a3b8",
  },
};
