import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client สำหรับใช้งานฝั่ง server (Server Components, Route Handlers)
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ถูกเรียกจาก Server Component — ข้ามได้ถ้ามี middleware จัดการ session แล้ว
          }
        },
      },
    }
  );
}
