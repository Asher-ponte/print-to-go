"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ClipboardCheck,
  Factory,
  LayoutDashboard,
  MapPinned,
  Package,
  Printer,
  Receipt,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Print Requests", icon: Package },
  { href: "/admin/print", label: "Print Station", icon: Printer },
  { href: "/admin/production", label: "Production", icon: Factory },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/catalog", label: "Catalog", icon: ClipboardCheck },
  { href: "/admin/pricing", label: "Pricing & Zones", icon: Receipt },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-full w-64 shrink-0 border-r border-white/10 bg-sidebar p-4">
      <Link href="/admin" className="mb-6 flex items-center gap-2 px-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-md bg-white text-zinc-950">
          <Printer className="size-4" />
        </span>
        Print-to-Go
      </Link>
      <nav className="grid gap-1">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent",
                active && "bg-sidebar-accent text-sidebar-foreground",
              )}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Separator className="my-4 bg-white/10" />
      <Button variant="secondary" size="sm" className="w-full" asChild>
        <Link href="/">
          <MapPinned className="size-4" />
          Customer site
        </Link>
      </Button>
    </aside>
  );
}
