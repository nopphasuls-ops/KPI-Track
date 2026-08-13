import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { type Role } from "@/lib/useRole";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KPI Tracking Board",
  description: "ระบบติดตามตัวชี้วัดผลงาน (KPI) เทียบเป้าหมายและแนวโน้ม",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: Role | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = (data?.role as Role) ?? null;
  }

  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className="font-sans antialiased">
        <Header userEmail={user?.email ?? null} role={role} />
        {children}
      </body>
    </html>
  );
}
