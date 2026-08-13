"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/lib/useRole";
import {
  type KpiDirection,
  type KpiFrequency,
  KPI_CATEGORY_OPTIONS,
  KPI_DIRECTION_META,
  KPI_FREQUENCY_META,
} from "@/types/kpi";

function NoPermission() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-amber-800">
            ไม่มีสิทธิ์เข้าถึง
          </h1>
          <p className="mt-2 text-sm text-amber-700">
            เฉพาะผู้ดูแลระบบหรือผู้แก้ไขเท่านั้นที่สร้าง/แก้ไขตัวชี้วัดได้
          </p>
          <Link
            href="/kpis"
            className="mt-4 inline-block rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            กลับไปรายการตัวชี้วัด
          </Link>
        </div>
      </div>
    </main>
  );
}

interface FormState {
  name: string;
  description: string;
  category: string;
  unit: string;
  target: string;
  direction: KpiDirection;
  owner: string;
  frequency: KpiFrequency;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  category: KPI_CATEGORY_OPTIONS[0],
  unit: "%",
  target: "",
  direction: "higher_better",
  owner: "",
  frequency: "monthly",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export default function NewKpiPage() {
  const router = useRouter();
  const { role, canWrite } = useRole();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // role === undefined = กำลังโหลดสิทธิ์
  if (role !== undefined && !canWrite) {
    return <NoPermission />;
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อตัวชี้วัด (KPI)");
      return;
    }
    const target = Number(form.target);
    if (form.target === "" || Number.isNaN(target)) {
      setError("กรุณากรอกค่าเป้าหมาย (Target) เป็นตัวเลข");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("kpis").insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category || null,
        unit: form.unit.trim() || null,
        target,
        direction: form.direction,
        owner: form.owner.trim() || null,
        frequency: form.frequency,
      });

      if (insertError) {
        setError("บันทึกตัวชี้วัดไม่สำเร็จ: " + insertError.message);
        return;
      }

      router.push("/kpis");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-blue-900">
            เพิ่มตัวชี้วัดใหม่
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            กำหนดนิยาม เป้าหมาย และผู้รับผิดชอบของ KPI
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

          {/* ชื่อ */}
          <div>
            <label htmlFor="name" className={labelClass}>
              ชื่อตัวชี้วัด <span className="text-amber-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="เช่น อัตราความพึงพอใจของลูกค้า"
              required
              className={inputClass}
            />
          </div>

          {/* รายละเอียด */}
          <div>
            <label htmlFor="description" className={labelClass}>
              รายละเอียด
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="อธิบายวิธีวัดหรือที่มาของข้อมูล (ถ้ามี)"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* หมวดหมู่ */}
            <div>
              <label htmlFor="category" className={labelClass}>
                หมวดหมู่
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={inputClass}
              >
                {KPI_CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* ผู้รับผิดชอบ */}
            <div>
              <label htmlFor="owner" className={labelClass}>
                ผู้รับผิดชอบ
              </label>
              <input
                id="owner"
                type="text"
                value={form.owner}
                onChange={(e) => updateField("owner", e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                className={inputClass}
              />
            </div>

            {/* เป้าหมาย */}
            <div>
              <label htmlFor="target" className={labelClass}>
                ค่าเป้าหมาย (Target) <span className="text-amber-500">*</span>
              </label>
              <input
                id="target"
                type="number"
                step="any"
                value={form.target}
                onChange={(e) => updateField("target", e.target.value)}
                placeholder="เช่น 90"
                required
                className={inputClass}
              />
            </div>

            {/* หน่วย */}
            <div>
              <label htmlFor="unit" className={labelClass}>
                หน่วย
              </label>
              <input
                id="unit"
                type="text"
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
                placeholder="เช่น %, บาท, ครั้ง"
                className={inputClass}
              />
            </div>

            {/* ทิศทาง */}
            <div>
              <label htmlFor="direction" className={labelClass}>
                ทิศทางที่ดี
              </label>
              <select
                id="direction"
                value={form.direction}
                onChange={(e) =>
                  updateField("direction", e.target.value as KpiDirection)
                }
                className={inputClass}
              >
                {(
                  Object.keys(KPI_DIRECTION_META) as KpiDirection[]
                ).map((d) => (
                  <option key={d} value={d}>
                    {KPI_DIRECTION_META[d].label}
                  </option>
                ))}
              </select>
            </div>

            {/* ความถี่ */}
            <div>
              <label htmlFor="frequency" className={labelClass}>
                ความถี่ในการเก็บค่า
              </label>
              <select
                id="frequency"
                value={form.frequency}
                onChange={(e) =>
                  updateField("frequency", e.target.value as KpiFrequency)
                }
                className={inputClass}
              >
                {(
                  Object.keys(KPI_FREQUENCY_META) as KpiFrequency[]
                ).map((f) => (
                  <option key={f} value={f}>
                    {KPI_FREQUENCY_META[f].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              ล้างข้อมูล
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : "สร้างตัวชี้วัด"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
