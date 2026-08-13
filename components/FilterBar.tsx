"use client";

import {
  type KpiFilters,
  type KpiStatus,
  EMPTY_FILTERS,
  KPI_STATUS_META,
} from "@/types/kpi";
import { hasActiveFilters } from "@/lib/filters";

interface FilterBarProps {
  filters: KpiFilters;
  categories: string[];
  owners: string[];
  onChange: (filters: KpiFilters) => void;
}

const STATUS_OPTIONS: KpiStatus[] = [
  "on_track",
  "at_risk",
  "off_track",
  "no_data",
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

export default function FilterBar({
  filters,
  categories,
  owners,
  onChange,
}: FilterBarProps) {
  function update<K extends keyof KpiFilters>(key: K, value: KpiFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* หมวดหมู่ */}
        <div>
          <label className={labelClass}>หมวดหมู่ (Category)</label>
          <select
            value={filters.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          >
            <option value="">ทั้งหมด</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* ผู้รับผิดชอบ */}
        <div>
          <label className={labelClass}>ผู้รับผิดชอบ (Owner)</label>
          <select
            value={filters.owner}
            onChange={(e) => update("owner", e.target.value)}
            className={inputClass}
          >
            <option value="">ทั้งหมด</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* สถานะ */}
        <div>
          <label className={labelClass}>สถานะ (Status)</label>
          <select
            value={filters.status}
            onChange={(e) => update("status", e.target.value as KpiStatus | "")}
            className={inputClass}
          >
            <option value="">ทั้งหมด</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {KPI_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters(filters) && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
}
