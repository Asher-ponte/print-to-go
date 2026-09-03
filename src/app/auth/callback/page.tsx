"use client";

import { useStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CallbackInner() {
  const { data, status } = useSession();
  const store = useStore();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(next.startsWith("/admin") ? "/admin/login" : "/login");
      return;
    }
    if (!data?.user?.email) return;
    const role = data.user.role === "admin" ? "admin" : "customer";
    store.loginWithGoogle({
      name: data.user.name ?? data.user.email,
      email: data.user.email,
      image: data.user.image ?? undefined,
      role,
    });
    if (next.startsWith("/admin") && role !== "admin") {
      router.replace("/account");
      return;
    }
    router.replace(next);
  }, [status, data?.user?.email, data?.user?.name, data?.user?.image, data?.user?.role, next, router, store]);

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <p className="text-sm text-muted-foreground">Signing you in with Google…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Signing you in with Google…</p>}>
      <CallbackInner />
    </Suspense>
  );
}
