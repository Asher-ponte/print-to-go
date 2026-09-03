"use client";

import { LocationMap } from "@/components/location-map";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { orderAmount, peso } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function DeliveryPage() {
  const store = useStore();
  const [driver, setDriver] = useState("John Ramos");
  const [selected, setSelected] = useState<string[]>([]);

  const active = useMemo(
    () =>
      store.orders.filter(
        (order) =>
          order.fulfillment === "delivery" &&
          order.delivery &&
          !["completed", "cancelled", "delivered"].includes(order.status),
      ),
    [store.orders],
  );

  const markers = active.map((order) => ({
    id: order.id,
    lat: order.delivery!.pin.lat,
    lng: order.delivery!.pin.lng,
    label: `<strong>${order.ticket}</strong><br/>${store.customerById(order.customerId)?.company || store.customerById(order.customerId)?.name}<br/>${order.quotation ? peso(orderAmount(order)) : ""} · ${order.status}`,
  }));

  if (!store.ready) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Delivery map</h1>
        <p className="text-sm text-muted-foreground">Active pins, dispatch, and run status.</p>
      </div>
      <LocationMap markers={markers} className="h-[420px] w-full overflow-hidden rounded-xl border" />
      <Card>
        <CardHeader><CardTitle>Dispatch a run</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Driver name" />
          <div className="space-y-2">
            {active.map((order) => {
              const customer = store.customerById(order.customerId);
              return (
                <label key={order.id} className="flex items-start gap-3 rounded-lg border border-white/10 p-3 text-sm">
                  <Checkbox
                    checked={selected.includes(order.id)}
                    onCheckedChange={(value) =>
                      setSelected((current) => (value ? [...current, order.id] : current.filter((id) => id !== order.id)))
                    }
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono">{order.ticket}</span>
                      <PriorityBadge priority={order.priority} dark />
                      <StatusBadge status={order.status} dark />
                    </div>
                    <p>{customer?.company || customer?.name} · {order.quotation ? peso(orderAmount(order)) : "—"}</p>
                    <p className="text-muted-foreground">{order.delivery?.pin.address}</p>
                  </div>
                </label>
              );
            })}
          </div>
          <Button
            onClick={() => {
              if (!selected.length) return toast.error("Select at least one order");
              const run = store.createRun(driver, selected);
              setSelected([]);
              toast.success(`${run.name} assigned to ${driver}`);
            }}
          >
            Create delivery run
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {store.runs.map((run) => (
          <Card key={run.id}>
            <CardHeader>
              <CardTitle className="text-base">{run.name} · {run.driver}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {run.orderIds.map((id, index) => {
                const order = store.orders.find((item) => item.id === id);
                return (
                  <p key={id}>
                    {index + 1}. {order?.ticket} — {store.customerById(order?.customerId ?? "")?.company || store.customerById(order?.customerId ?? "")?.name}
                  </p>
                );
              })}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => run.orderIds.forEach((id) => store.setStatus(id, "out_for_delivery"))}>
                  Out for delivery
                </Button>
                <Button size="sm" variant="outline" onClick={() => run.orderIds.forEach((id) => store.setStatus(id, "arrived"))}>
                  Arrived
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
