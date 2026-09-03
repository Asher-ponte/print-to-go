"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { signOutAll } from "@/components/google-sign-in";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, ready, logout } = useStore();
  const { data, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!ready || isLogin) return;
    if (status === "loading") return;
    if (session.role === "admin" || data?.user?.role === "admin") return;
    router.replace("/admin/login");
  }, [ready, session.role, isLogin, router, status, data?.user?.role]);

  if (isLogin) return children;

  return (
    <div className="dark flex min-h-full bg-background text-foreground">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <AdminSidebar />
              </SheetContent>
            </Sheet>
            <p className="text-sm text-muted-foreground">
              Operations · Cabuyao shop
              {session.googleEmail ? ` · ${session.googleName || session.googleEmail}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Customer site</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void signOutAll(logout).then(() => router.push("/"));
              }}
            >
              Sign out
            </Button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
