"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Role } from "@/lib/useRole";

interface HeaderProps {
  userEmail: string | null;
  role: Role | null;
}

const ROLE_META: Record<Role, { label: string; className: string }> = {
  admin: { label: "ผู้ดูแลระบบ", className: "bg-amber-100 text-amber-700" },
  editor: { label: "ผู้แก้ไข", className: "bg-blue-100 text-blue-700" },
  viewer: { label: "ผู้ดู", className: "bg-slate-100 text-slate-600" },
};

export default function Header({ userEmail, role }: HeaderProps) {
  const router = useRouter();
  const canWrite = role === "admin" || role === "editor";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-blue-900">
          KPI Tracking Board
        </Link>

        {userEmail ? (
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              แดชบอร์ด
            </Link>
            <Link
              href="/kpis"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              ตัวชี้วัด
            </Link>
            {canWrite && (
              <Link
                href="/kpis/new"
                className="rounded-lg bg-blue-800 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-900"
              >
                + เพิ่ม KPI
              </Link>
            )}

            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-[160px] truncate text-xs font-medium text-slate-700">
                  {userEmail}
                </p>
                {role && (
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${ROLE_META[role].className}`}
                  >
                    {ROLE_META[role].label}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                ออกจากระบบ
              </button>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
