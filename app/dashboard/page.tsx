"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import FilterBar from "@/components/FilterBar";
import { LoadingBlock, Skeleton } from "@/components/Loading";
import { categoryOptions, filterKpis, ownerOptions } from "@/lib/filters";
import { achievementPct, attachLatest, kpiStatus } from "@/lib/kpi";
import {
  type Kpi,
  type KpiFilters,
  type KpiStatus,
  type KpiValue,
  type KpiWithLatest,
  EMPTY_FILTERS,
  KPI_STATUS_META,
} from "@/types/kpi";

const STATUS_ORDER: KpiStatus[] = [
  "on_track",
  "at_risk",
  "off_track",
  "no_data",
];

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiWithLatest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KpiFilters>(EMPTY_FILTERS);

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
        supabase.from("kpis").select("*"),
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

  const stats = useMemo(() => {
    const byStatus: Record<KpiStatus, number> = {
      on_track: 0,
      at_risk: 0,
      off_track: 0,
      no_data: 0,
    };
    for (const kpi of visibleKpis) {
      byStatus[kpiStatus(kpi)]++;
    }
    return { total: visibleKpis.length, byStatus };
  }, [visibleKpis]);

  const cards = [
    {
      key: "total",
      label: "ตัวชี้วัดทั้งหมด",
      sublabel: "Total KPIs",
      value: stats.total,
      valueClass: "text-blue-900",
      iconWrap: "bg-blue-100 text-blue-700",
      icon: "📊",
    },
    {
      key: "on_track",
      label: "บรรลุเป้า",
      sublabel: "On Track",
      value: stats.byStatus.on_track,
      valueClass: "text-emerald-700",
      iconWrap: "bg-emerald-100 text-emerald-700",
      icon: "✓",
    },
    {
      key: "at_risk",
      label: "เสี่ยง",
      sublabel: "At Risk",
      value: stats.byStatus.at_risk,
      valueClass: "text-amber-600",
      iconWrap: "bg-amber-100 text-amber-600",
      icon: "⚠",
    },
    {
      key: "off_track",
      label: "ต่ำกว่าเป้า",
      sublabel: "Off Track",
      value: stats.byStatus.off_track,
      valueClass: "text-red-600",
      iconWrap: "bg-red-100 text-red-600",
      icon: "▼",
    },
  ];

  // Donut: สัดส่วนสถานะ
  const pieData = STATUS_ORDER.map((status) => ({
    status,
    name: KPI_STATUS_META[status].label,
    value: stats.byStatus[status],
    color: KPI_STATUS_META[status].color,
  })).filter((d) => d.value > 0);

  // Bar: % ความสำเร็จของแต่ละ KPI (เรียงมาก→น้อย)
  const barData = useMemo(
    () =>
      visibleKpis
        .map((kpi) => {
          const pct = achievementPct(kpi, kpi.latest?.actual ?? null);
          return {
            name: kpi.name,
            value: pct === null ? 0 : Math.round(pct),
            color: KPI_STATUS_META[kpiStatus(kpi)].color,
          };
        })
        .sort((a, b) => b.value - a.value),
    [visibleKpis]
  );

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-blue-900">แดชบอร์ด</h1>
            <p className="mt-1 text-sm text-slate-500">
              ภาพรวมสถานะและ % ความสำเร็จของตัวชี้วัดทั้งหมด
            </p>
          </div>
          <Link
            href="/kpis"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            ดูรายการตัวชี้วัด
          </Link>
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

        {/* การ์ดสรุป */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {card.label}
                  </p>
                  <p className="text-xs text-slate-400">{card.sublabel}</p>
                </div>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${card.iconWrap}`}
                >
                  {card.icon}
                </span>
              </div>
              {loading ? (
                <Skeleton className="mt-4 h-9 w-16" />
              ) : (
                <p className={`mt-4 text-3xl font-bold ${card.valueClass}`}>
                  {card.value}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Donut: สัดส่วนสถานะ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-800">
                สัดส่วนตามสถานะ
              </h2>
              <p className="text-xs text-slate-400">KPIs by Status</p>
            </div>

            {loading ? (
              <LoadingBlock className="h-64" />
            ) : stats.total === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                ยังไม่มีข้อมูล
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      paddingAngle={2}
                      label={({ value }) => `${value}`}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} ตัวชี้วัด`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar: % ความสำเร็จต่อ KPI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-800">
                % ความสำเร็จของแต่ละตัวชี้วัด
              </h2>
              <p className="text-xs text-slate-400">Achievement by KPI</p>
            </div>

            {loading ? (
              <LoadingBlock className="h-64" />
            ) : barData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                ยังไม่มีข้อมูล
              </div>
            ) : (
              <div
                className="w-full"
                style={{ height: Math.max(256, barData.length * 44 + 24) }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ top: 0, right: 32, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      type="number"
                      unit="%"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      stroke="#cbd5e1"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      tick={{ fontSize: 11, fill: "#334155" }}
                      stroke="#cbd5e1"
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      formatter={(value) => [`${value}%`, "ความสำเร็จ"]}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                      {barData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
