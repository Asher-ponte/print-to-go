"use client";

import { useStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function GoogleSessionBridge() {
  const { data, status } = useSession();
  const { loginWithGoogle } = useStore();

  useEffect(() => {
    if (status !== "authenticated" || !data.user?.email) return;
    loginWithGoogle({
      name: data.user.name ?? data.user.email,
      email: data.user.email,
      image: data.user.image ?? undefined,
      role: data.user.role === "admin" ? "admin" : "customer",
    });
  }, [status, data?.user?.email, data?.user?.name, data?.user?.image, data?.user?.role, loginWithGoogle]);

  return null;
}
