// ชุด component สำหรับแสดงสถานะกำลังโหลด (spinner + skeleton)

// วงกลมหมุนบอกว่ากำลังทำงาน
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? "h-5 w-5"}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// แถบ placeholder แบบเต้น (pulse)
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200 ${className ?? ""}`} />
  );
}

// ข้อความ "กำลังโหลด" พร้อม spinner (จัดกึ่งกลาง)
export function LoadingBlock({
  label = "กำลังโหลดข้อมูล...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-sm text-slate-400 ${
        className ?? "h-56"
      }`}
    >
      <Spinner className="h-7 w-7 text-blue-600" />
      <span>{label}</span>
    </div>
  );
}

// การ์ด KPI แบบโครงร่าง (ใช้ตอนโหลดหน้ารายการ)
export function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="mt-2 h-2 w-full rounded-full" />
    </div>
  );
}
