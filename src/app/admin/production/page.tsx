"use client";

import { PriorityBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderSummary, peso, orderAmount } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import Link from "next/link";

const columns: { title: string; emoji: string; statuses: OrderStatus[] }[] = [
  { title: "New", emoji: "\ud83c\udd95", statuses: ["new", "quotation", "awaiting_confirmation", "changes_requested", "confirmed"] },
  { title: "Printing", emoji: "\ud83d\udda8\ufe0f", statuses: ["paid", "printing"] },
  { title: "Finishing", emoji: "\u2702\ufe0f", statuses: ["finishing"] },
  { title: "Quality check", emoji: "\ud83d\udd0d", statuses: ["quality_check"] },
  { title: "Ready", emoji: "\ud83d\udce6", statuses: ["ready"] },
];

export default function ProductionPage() {
  const { orders, customers, setStatus, ready } = useStore();
  if (!ready) return null;

  function next(order: Order) {
    const flow: Record<string, OrderStatus> = {
      new: "quotation",
      confirmed: "paid",
      paid: "printing",
      printing: "finishing",
      finishing: "quality_check",
      quality_check: "ready",
    };
    const nxt = flow[order.status];
    if (nxt) setStatus(order.id, nxt);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Production board</h1>
        <p className="text-sm text-muted-foreground">Visual workload from new jobs through ready.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => {
          const items = orders.filter((order) => column.statuses.includes(order.status));
          return (
            <Card key={column.title} className="min-h-72">
              <CardHeader>
                <CardTitle className="text-sm">
                  {column.emoji} {column.title} \u00b7 {items.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((order) => {
                  const customer = customers.find((item) => item.id === order.customerId);
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onDoubleClick={() => next(order)}
                      className="w-full rounded-lg border border-white/10 bg-card p-3 text-left text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/admin/orders/${order.ticket}`} className="font-mono text-xs">
                          {order.ticket}
                        </Link>
                        <Link href={`/admin/print/${order.ticket}`} className="text-xs underline-offset-4 hover:underline">
                          Print
                        </Link>
                      </div>
                      <p className="font-medium">{customer?.company || customer?.name}</p>
                      <p className="text-muted-foreground">{orderSummary(order)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <PriorityBadge priority={order.priority} dark />
                        <span>{order.quotation ? peso(orderAmount(order)) : "\u2014"}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Double-click a card to advance it to the next production stage.</p>
    </div>
  );
}
