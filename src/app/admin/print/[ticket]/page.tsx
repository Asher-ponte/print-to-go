"use client";

import { PrintActions } from "@/components/print-actions";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PrintTicketPage() {
  const params = useParams<{ ticket: string }>();
  const store = useStore();
  const order = store.orderByTicket(decodeURIComponent(params.ticket));
  const customer = order ? store.customerById(order.customerId) : undefined;

  if (!store.ready) return null;
  if (!order || !customer) return <p>Ticket not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Print Station</p>
          <h1 className="font-mono text-2xl font-semibold">{order.ticket}</h1>
          <p className="mt-1 font-medium">{customer.company || customer.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={order.status} dark />
            <PriorityBadge priority={order.priority} dark />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/print">All print jobs</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/admin/orders/${order.ticket}`}>Full ticket</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send to printer</CardTitle>
        </CardHeader>
        <CardContent>
          <PrintActions order={order} customer={customer} />
        </CardContent>
      </Card>

      {order.specialInstructions ? (
        <Card>
          <CardHeader>
            <CardTitle>Special instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{order.specialInstructions}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
