"use client";

import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FILTER_STATUSES, STATUS_LABEL } from "@/lib/constants";
import { formatDate, orderAmount, orderSummary, peso } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function OrdersPage() {
  const { orders, customers, ready } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return orders.filter((order) => {
      const customer = customers.find((item) => item.id === order.customerId);
      const hay = `${order.ticket} ${customer?.name} ${customer?.company} ${orderSummary(order)}`.toLowerCase();
      const textOk = hay.includes(q.toLowerCase());
      const statusOk = filter === "all" || order.status === filter;
      return textOk && statusOk;
    });
  }, [orders, customers, filter, q]);

  if (!ready) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Print requests</h1>
        <p className="text-sm text-muted-foreground">Every ticket in one queue.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All
        </Button>
        {FILTER_STATUSES.map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {STATUS_LABEL[status]}
          </Button>
        ))}
      </div>
      <Input placeholder="Search ticket, customer, or job" value={q} onChange={(e) => setQ(e.target.value)} />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((order) => {
                const customer = customers.find((item) => item.id === order.customerId);
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link className="font-mono text-sm underline-offset-4 hover:underline" href={`/admin/orders/${order.ticket}`}>
                        {order.ticket}
                      </Link>
                      <div className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</div>
                    </TableCell>
                    <TableCell>{customer?.company || customer?.name}</TableCell>
                    <TableCell>{orderSummary(order)}</TableCell>
                    <TableCell>{order.quotation ? peso(orderAmount(order)) : "—"}</TableCell>
                    <TableCell>{order.fulfillment === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={order.priority} dark />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} dark />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
