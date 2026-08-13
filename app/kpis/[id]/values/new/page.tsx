"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/lib/useRole";
import { type Kpi } from "@/types/kpi";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

// งวดเริ่มต้น = เดือนปัจจุบันในรูปแบบ YYYY-MM
function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function NewKpiValuePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kpiId = params.id;

  const { role, canWrite } = useRole();
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [period, setPeriod] = useState(currentMonth());
  const [actual, setActual] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("kpis")
        .select("*")
        .eq("id", kpiId)
        .single();
      setKpi((data as Kpi) ?? null);
    }
    load();
  }, [kpiId]);

  if (role !== undefined && !canWrite) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-amber-800">
              ไม่มีสิทธิ์เข้าถึง
            </h1>
            <p className="mt-2 text-sm text-amber-700">
              เฉพาะผู้ดูแลระบบหรือผู้แก้ไขเท่านั้นที่บันทึกค่าจริงได้
            </p>
            <Link
              href={`/kpis/${kpiId}`}
              className="mt-4 inline-block rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              กลับไปหน้ารายละเอียด
            </Link>
          </div>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!period.trim()) {
      setError("กรุณาระบุงวด (Period) เช่น 2026-08");
      return;
    }
    const actualNum = Number(actual);
    if (actual === "" || Number.isNaN(actualNum)) {
      setError("กรุณากรอกค่าจริง (Actual) เป็นตัวเลข");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("kpi_values").insert({
        kpi_id: kpiId,
        period: period.trim(),
        actual: actualNum,
        note: note.trim() || null,
      });

      if (insertError) {
        // ชนกับ unique (kpi_id, period)
        if (insertError.code === "23505") {
          setError("มีข้อมูลของงวดนี้อยู่แล้ว กรุณาเลือกงวดอื่น");
        } else {
          setError("บันทึกค่าจริงไม่สำเร็จ: " + insertError.message);
        }
        return;
      }

      router.push(`/kpis/${kpiId}`);
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <Link
          href={`/kpis/${kpiId}`}
          className="text-sm text-blue-700 transition hover:underline"
        >
          ← กลับไปหน้ารายละเอียด
        </Link>

        <div className="mb-8 mt-3">
          <h1 className="text-2xl font-semibold text-blue-900">
            บันทึกค่าจริง
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {kpi ? kpi.name : "กำลังโหลด..."}
            {kpi && (
              <span className="text-slate-400">
                {" "}
                — เป้าหมาย {kpi.target}
                {kpi.unit ? ` ${kpi.unit}` : ""}
              </span>
            )}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="period" className={labelClass}>
              งวด (Period) <span className="text-amber-500">*</span>
            </label>
            <input
              id="period"
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="เช่น 2026-08 หรือ 2026-Q3"
              required
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400">
              รูปแบบแนะนำ: รายเดือน YYYY-MM, รายไตรมาส YYYY-Qn, รายปี YYYY
            </p>
          </div>

          <div>
            <label htmlFor="actual" className={labelClass}>
              ค่าจริง (Actual) <span className="text-amber-500">*</span>
            </label>
            <input
              id="actual"
              type="number"
              step="any"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="เช่น 85"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="note" className={labelClass}>
              หมายเหตุ
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="บันทึกเพิ่มเติม (ถ้ามี)"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <Link
              href={`/kpis/${kpiId}`}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกค่าจริง"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
