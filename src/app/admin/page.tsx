"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderAmount, peso } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import Link from "next/link";

const cards: { key: string; label: string; match: (status: OrderStatus) => boolean }[] = [
  { key: "new", label: "New requests", match: (s) => s === "new" },
  { key: "quote", label: "For quotation", match: (s) => ["quotation", "awaiting_confirmation", "changes_requested"].includes(s) },
  { key: "print", label: "For printing", match: (s) => ["paid", "confirmed", "printing", "finishing"].includes(s) },
  { key: "ready", label: "Ready for delivery", match: (s) => s === "ready" },
  { key: "out", label: "Out for delivery", match: (s) => ["assigned", "out_for_delivery", "arrived"].includes(s) },
  { key: "done", label: "Completed", match: (s) => s === "completed" || s === "delivered" },
];

export default function AdminHomePage() {
  const { orders, ready } = useStore();
  if (!ready) return null;

  const sales = orders
    .filter((order) => !["cancelled"].includes(order.status) && order.quotation)
    .reduce((sum, order) => sum + orderAmount(order), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Today at a glance</h1>
        <p className="text-sm text-muted-foreground">Print requests, production, deliveries, and sales.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const count = orders.filter((order) => card.match(order.status)).length;
          return (
            <Link key={card.key} href={card.key === "print" ? "/admin/print" : "/admin/orders"}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-4xl font-semibold tabular-nums">{count}</CardContent>
              </Card>
            </Link>
          );
        })}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total sales</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{peso(sales)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
