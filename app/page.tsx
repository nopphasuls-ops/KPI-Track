import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm sm:p-14">
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            KPI Tracking Board
          </span>
          <h1 className="mt-5 text-3xl font-bold text-blue-900 sm:text-4xl">
            ติดตามตัวชี้วัดผลงาน
            <br />
            เทียบเป้าหมายและแนวโน้มได้ในที่เดียว
          </h1>
          <p className="mt-4 max-w-xl text-sm text-slate-500 sm:text-base">
            บันทึกค่าจริงของแต่ละ KPI ตามช่วงเวลา ระบบคำนวณ % ความสำเร็จ
            และสถานะให้อัตโนมัติ พร้อมกราฟสรุปภาพรวมทั้งองค์กร
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
            >
              ดูแดชบอร์ด
            </Link>
            <Link
              href="/kpis"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              รายการตัวชี้วัด
            </Link>
            <Link
              href="/kpis/new"
              className="rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              + เพิ่ม KPI ใหม่
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              title: "กำหนดเป้าหมาย",
              desc: "สร้าง KPI พร้อม target, หน่วย และทิศทางที่ถือว่าดี",
            },
            {
              title: "บันทึกค่าจริงรายงวด",
              desc: "อัปเดตค่าจริงแต่ละเดือน/ไตรมาส เพื่อดูแนวโน้ม",
            },
            {
              title: "เห็นภาพรวมทันที",
              desc: "% ความสำเร็จ สถานะสี และกราฟสรุปแบบเรียลไทม์",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-blue-900">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
