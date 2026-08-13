"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Role = "admin" | "editor" | "viewer";

// อ่านบทบาทของผู้ใช้ปัจจุบันจากตาราง profiles (ฝั่ง client)
// - undefined = กำลังโหลด, null = ยังไม่ล็อกอิน/ไม่มีโปรไฟล์
export function useRole(): {
  role: Role | null | undefined;
  canWrite: boolean;
  isAdmin: boolean;
} {
  const [role, setRole] = useState<Role | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setRole(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (active) setRole((data?.role as Role) ?? null);
    })();

    return () => {
      active = false;
    };
  }, []);

  return {
    role,
    canWrite: role === "admin" || role === "editor",
    isAdmin: role === "admin",
  };
}
