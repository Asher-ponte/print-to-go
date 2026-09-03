"use client";

import { signOutAll } from "@/components/google-sign-in";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { Printer } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  const { session, logout, customerById } = useStore();
  const customer = session.customerId ? customerById(session.customerId) : undefined;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Printer className="size-4" />
          </span>
          <span>
            {BRAND.name}
            <span className="ml-2 hidden text-xs font-normal text-muted-foreground sm:inline">
              {BRAND.city}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/track">Track</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">Orders</Link>
          </Button>
          {session.role === "admin" ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Dashboard</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/login">Staff</Link>
            </Button>
          )}
          {customer ? (
            <Button variant="ghost" size="sm" onClick={() => void signOutAll(logout)}>
              {customer.name.split(" ")[0]}
            </Button>
          ) : session.role === "admin" ? (
            <Button variant="ghost" size="sm" onClick={() => void signOutAll(logout)}>
              Sign out
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href="/request">Start a Print Request</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
