"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { LoadingBlock } from "@/components/Loading";
import { useRole } from "@/lib/useRole";
import {
  achievementPct,
  formatPct,
  formatValue,
  statusFromPct,
} from "@/lib/kpi";
import {
  type Kpi,
  type KpiValue,
  KPI_DIRECTION_META,
  KPI_FREQUENCY_META,
  KPI_STATUS_META,
} from "@/types/kpi";

export default function KpiDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kpiId = params.id;

  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [values, setValues] = useState<KpiValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { canWrite } = useRole();

  const load = useCallback(async () => {
    const supabase = createClient();
    const [kpiRes, valuesRes] = await Promise.all([
      supabase.from("kpis").select("*").eq("id", kpiId).single(),
      supabase
        .from("kpi_values")
        .select("*")
        .eq("kpi_id", kpiId)
        .order("period", { ascending: true }),
    ]);

    if (kpiRes.error) {
      setError("โหลดข้อมูลไม่สำเร็จ: " + kpiRes.error.message);
    } else {
      setKpi(kpiRes.data as Kpi);
      setValues((valuesRes.data as KpiValue[]) ?? []);
    }
    setLoading(false);
  }, [kpiId]);

  useEffect(() => {
    load();
  }, [load]);

  // ค่าจริงงวดล่าสุด (values เรียง period น้อย→มาก)
  const latest = values.length > 0 ? values[values.length - 1] : null;
  const pct = kpi ? achievementPct(kpi, latest?.actual ?? null) : null;
  const status = statusFromPct(pct);
  const meta = KPI_STATUS_META[status];

  // ข้อมูลสำหรับ line chart: ค่าจริง เทียบเส้นเป้าหมาย
  const chartData = useMemo(
    () =>
      values.map((v) => ({
        period: v.period,
        actual: v.actual,
        target: kpi?.target ?? 0,
      })),
    [values, kpi]
  );

  async function handleDelete() {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("kpis")
      .delete()
      .eq("id", kpiId);
    if (deleteError) {
      setError("ลบตัวชี้วัดไม่สำเร็จ: " + deleteError.message);
      setConfirmDelete(false);
      return;
    }
    router.push("/kpis");
    router.refresh();
  }

  async function handleDeleteValue(valueId: string) {
    const previous = values;
    setValues((prev) => prev.filter((v) => v.id !== valueId));
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("kpi_values")
      .delete()
      .eq("id", valueId);
    if (deleteError) {
      setValues(previous);
      setError("ลบค่าจริงไม่สำเร็จ: " + deleteError.message);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white py-20">
            <LoadingBlock />
          </div>
        </div>
      </main>
    );
  }

  if (!kpi) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error ?? "ไม่พบตัวชี้วัดนี้"}
          </div>
          <Link
            href="/kpis"
            className="mt-4 inline-block text-sm text-blue-700 hover:underline"
          >
            ← กลับไปรายการตัวชี้วัด
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/kpis"
          className="text-sm text-blue-700 transition hover:underline"
        >
          ← กลับไปรายการตัวชี้วัด
        </Link>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ส่วนหัว */}
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-blue-900">
                {kpi.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.badgeClassName}`}
              >
                {meta.label}
              </span>
            </div>
            {kpi.description && (
              <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                {kpi.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {kpi.category && <span>{kpi.category}</span>}
              {kpi.owner && (
                <>
                  <span>•</span>
                  <span>ผู้รับผิดชอบ: {kpi.owner}</span>
                </>
              )}
              <span>•</span>
              <span>{KPI_FREQUENCY_META[kpi.frequency].label}</span>
              <span>•</span>
              <span>{KPI_DIRECTION_META[kpi.direction].label}</span>
            </div>
          </div>

          {canWrite && (
            <div className="flex items-center gap-2">
              <Link
                href={`/kpis/${kpiId}/values/new`}
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-900"
              >
                + บันทึกค่าจริง
              </Link>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                ลบ KPI
              </button>
            </div>
          )}
        </div>

        {/* การ์ดสรุป */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">% ความสำเร็จ (ล่าสุด)</p>
            <p
              className="mt-2 text-3xl font-bold"
              style={{ color: meta.color }}
            >
              {formatPct(pct)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">ค่าจริงล่าสุด</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {formatValue(latest?.actual, kpi.unit)}
            </p>
            {latest && (
              <p className="mt-1 text-xs text-slate-400">งวด {latest.period}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">เป้าหมาย</p>
            <p className="mt-2 text-3xl font-bold text-blue-900">
              {formatValue(kpi.target, kpi.unit)}
            </p>
          </div>
        </div>

        {/* กราฟแนวโน้ม */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-800">
              แนวโน้มค่าจริงเทียบเป้าหมาย
            </h2>
            <p className="text-xs text-slate-400">Actual vs Target</p>
          </div>

          {chartData.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-slate-400">
              <span>ยังไม่มีข้อมูลค่าจริง</span>
              {canWrite && (
                <Link
                  href={`/kpis/${kpiId}/values/new`}
                  className="rounded-lg bg-blue-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-900"
                >
                  + บันทึกค่าจริงงวดแรก
                </Link>
              )}
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatValue(Number(value), kpi.unit),
                      name === "actual" ? "ค่าจริง" : "เป้าหมาย",
                    ]}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "actual" ? "ค่าจริง" : "เป้าหมาย"
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#d4af37"
                    strokeDasharray="6 4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ตารางประวัติค่า */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            ประวัติค่าจริงรายงวด
          </h2>
          {values.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              ยังไม่มีข้อมูล
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                    <th className="pb-2 pr-4 font-medium">งวด</th>
                    <th className="pb-2 pr-4 font-medium">ค่าจริง</th>
                    <th className="pb-2 pr-4 font-medium">% สำเร็จ</th>
                    <th className="pb-2 pr-4 font-medium">หมายเหตุ</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* แสดงจากงวดใหม่ล่าสุดลงไป */}
                  {[...values].reverse().map((v) => {
                    const vpct = achievementPct(kpi, v.actual);
                    const vstatus = statusFromPct(vpct);
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-2.5 pr-4 font-medium text-slate-700">
                          {v.period}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-700">
                          {formatValue(v.actual, kpi.unit)}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className="font-semibold"
                            style={{ color: KPI_STATUS_META[vstatus].color }}
                          >
                            {formatPct(vpct)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500">
                          {v.note ?? "–"}
                        </td>
                        <td className="py-2.5 text-right">
                          {canWrite && (
                            <button
                              type="button"
                              onClick={() => handleDeleteValue(v.id)}
                              className="rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title="ลบค่างวดนี้"
                              aria-label="ลบค่างวดนี้"
                            >
                              🗑
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ยืนยันการลบ KPI */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onMouseDown={() => setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-800">
              ลบตัวชี้วัดนี้?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              การลบ “{kpi.name}” จะลบค่าจริงทุกงวดด้วย และไม่สามารถย้อนกลับได้
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                ลบ KPI
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
