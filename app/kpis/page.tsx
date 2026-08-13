"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FilterBar from "@/components/FilterBar";
import { KpiCardSkeleton } from "@/components/Loading";
import { useRole } from "@/lib/useRole";
import {
  categoryOptions,
  filterKpis,
  ownerOptions,
} from "@/lib/filters";
import {
  achievementPct,
  attachLatest,
  formatPct,
  formatValue,
  kpiStatus,
} from "@/lib/kpi";
import {
  type Kpi,
  type KpiFilters,
  type KpiValue,
  type KpiWithLatest,
  EMPTY_FILTERS,
  KPI_STATUS_META,
} from "@/types/kpi";

export default function KpisPage() {
  const [kpis, setKpis] = useState<KpiWithLatest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KpiFilters>(EMPTY_FILTERS);
  const { canWrite } = useRole();

  const categories = useMemo(() => categoryOptions(kpis), [kpis]);
  const owners = useMemo(() => ownerOptions(kpis), [kpis]);
  const visibleKpis = useMemo(
    () => filterKpis(kpis, filters),
    [kpis, filters]
  );

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [kpiRes, valueRes] = await Promise.all([
        supabase.from("kpis").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("kpi_values").select("*"),
      ]);

      if (kpiRes.error) {
        setError("โหลดข้อมูลไม่สำเร็จ: " + kpiRes.error.message);
      } else {
        setKpis(
          attachLatest(
            (kpiRes.data as Kpi[]) ?? [],
            (valueRes.data as KpiValue[]) ?? []
          )
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-blue-900">ตัวชี้วัด</h1>
            <p className="mt-1 text-sm text-slate-500">
              รายการ KPI ทั้งหมดพร้อม % ความสำเร็จเทียบเป้า
            </p>
          </div>
          {canWrite && (
            <Link
              href="/kpis/new"
              className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              + เพิ่ม KPI
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <FilterBar
          filters={filters}
          categories={categories}
          owners={owners}
          onChange={setFilters}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleKpis.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-sm text-slate-400">
            <span>ยังไม่มีตัวชี้วัดที่ตรงเงื่อนไข</span>
            {canWrite && (
              <Link
                href="/kpis/new"
                className="rounded-lg bg-blue-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-900"
              >
                + สร้าง KPI แรก
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visibleKpis.map((kpi) => {
              const pct = achievementPct(kpi, kpi.latest?.actual ?? null);
              const status = kpiStatus(kpi);
              const meta = KPI_STATUS_META[status];
              const barPct =
                pct === null ? 0 : Math.max(0, Math.min(100, pct));

              return (
                <Link
                  key={kpi.id}
                  href={`/kpis/${kpi.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-800">
                        {kpi.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        {kpi.category && <span>{kpi.category}</span>}
                        {kpi.owner && (
                          <>
                            <span>•</span>
                            <span>{kpi.owner}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${meta.badgeClassName}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* แถบความคืบหน้า */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-end justify-between">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: meta.color }}
                      >
                        {formatPct(pct)}
                      </span>
                      <span className="text-xs text-slate-500">
                        ค่าจริง {formatValue(kpi.latest?.actual, kpi.unit)} /
                        เป้า {formatValue(kpi.target, kpi.unit)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${barPct}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
