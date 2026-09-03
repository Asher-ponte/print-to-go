"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderAmount, peso } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AnalyticsPage() {
  const { orders, ready } = useStore();
  if (!ready) return null;

  const priced = orders.filter((order) => order.quotation && order.status !== "cancelled");
  const sales = priced.reduce((sum, order) => sum + orderAmount(order), 0);
  const completed = orders.filter((order) => order.status === "completed" || order.status === "delivered").length;
  const cancelled = orders.filter((order) => order.status === "cancelled").length;
  const pending = orders.filter((order) => !["completed", "delivered", "cancelled"].includes(order.status)).length;
  const deliveries = orders.filter((order) => order.fulfillment === "delivery");
  const delivered = deliveries.filter((order) => order.pod || order.status === "delivered" || order.status === "completed");
  const failed = deliveries.filter((order) => order.status === "cancelled");
  const deliveryCost = priced
    .filter((order) => order.fulfillment === "delivery")
    .reduce((sum, order) => sum + (order.quotation?.lines.filter((line) => line.description.toLowerCase().includes("delivery")).reduce((s, l) => s + l.amount, 0) ?? 0), 0);

  const services = new Map<string, number>();
  for (const order of orders) {
    for (const file of order.files) {
      services.set(file.spec.service, (services.get(file.spec.service) ?? 0) + file.spec.quantity);
    }
  }
  const top = [...services.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const month = (iso: string) => iso.slice(0, 7);
  const monthly = new Map<string, number>();
  for (const order of priced) {
    monthly.set(month(order.createdAt), (monthly.get(month(order.createdAt)) ?? 0) + orderAmount(order));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Business analytics</h1>
        <p className="text-sm text-muted-foreground">Sales, orders, top services, and delivery performance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Total sales" value={peso(sales)} />
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Completed" value={String(completed)} />
        <Stat label="Pending" value={String(pending)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Sales by month</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[...monthly.entries()].map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}</span>
                <span className="font-medium">{peso(value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top services</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {top.map(([name, qty], index) => (
              <div key={name} className="flex justify-between">
                <span>{index + 1}. {name}</span>
                <span>{qty} units</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Delivery analytics</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <p>Deliveries: {deliveries.length}</p>
          <p>Success: {delivered.length} ({deliveries.length ? Math.round((delivered.length / deliveries.length) * 100) : 0}%)</p>
          <p>Cancelled / failed: {failed.length}</p>
          <p>Delivery fees booked: {peso(deliveryCost)}</p>
          <p>Cancelled orders: {cancelled}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  );
}
