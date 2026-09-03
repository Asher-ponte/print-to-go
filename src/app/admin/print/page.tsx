"use client";

import { PrinterPicker } from "@/components/print-actions";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orderSummary } from "@/lib/format";
import { printJobTicket } from "@/lib/print";
import { useStore } from "@/lib/store";
import type { ShopPrinter } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function PrintStationPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const printer = store.printers.find((item) => item.id === store.selectedPrinterId) ?? store.printers[0];

  const rows = useMemo(() => {
    return store.orders.filter((order) => {
      if (order.status === "cancelled" || order.status === "completed") return false;
      const customer = store.customers.find((item) => item.id === order.customerId);
      const hay = `${order.ticket} ${customer?.name} ${customer?.company} ${orderSummary(order)}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [store.orders, store.customers, q]);

  function updatePrinter(id: string, patch: Partial<ShopPrinter>) {
    store.savePrinters(store.printers.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  if (!store.ready) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Print Station</h1>
        <p className="text-sm text-muted-foreground">
          Download customer files and send jobs to the printers in this shop.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How staff print</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Open a ticket, choose the shop printer that matches the machine, then press <strong>Print job ticket</strong> or{" "}
            <strong>Print files</strong>. Windows, macOS, or Chrome will show the real printer list — pick that named
            printer and set copies to the quantity on the ticket.
          </p>
          <p>
            Web apps cannot silently bind to a USB or network printer. The Print button is the connection: it opens the
            OS print dialog already pointed at your shop printers.
          </p>
          <p>
            Files uploaded on this computer can be downloaded and printed as artwork. Demo tickets and files received by
            email or USB can be attached on the ticket, then printed.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Jobs ready to print</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PrinterPicker />
            <Input placeholder="Search ticket or customer" value={q} onChange={(event) => setQ(event.target.value)} />
            <div className="space-y-2">
              {rows.map((order) => {
                const customer = store.customers.find((item) => item.id === order.customerId);
                return (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
                    <div>
                      <p className="font-mono text-sm">{order.ticket}</p>
                      <p className="font-medium">{customer?.company || customer?.name}</p>
                      <p className="text-sm text-muted-foreground">{orderSummary(order)}</p>
                      <div className="mt-1 flex gap-2">
                        <StatusBadge status={order.status} dark />
                        <PriorityBadge priority={order.priority} dark />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!customer) return;
                          try {
                            printJobTicket(order, customer, printer);
                            store.recordPrint(order.id, 1, printer?.name ?? "Shop printer");
                            toast.success("Print dialog opened for the job ticket");
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Allow pop-ups to print");
                          }
                        }}
                      >
                        Print ticket
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/admin/print/${order.ticket}`}>Open printer</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
              {rows.length === 0 ? <p className="text-sm text-muted-foreground">No open tickets match.</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shop printers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Rename these to match the printer names your computer shows, so staff pick the right machine in the dialog.
            </p>
            {store.printers.map((item) => (
              <div key={item.id} className="space-y-2 rounded-lg border border-white/10 p-3">
                <div className="space-y-1">
                  <Label>Station name</Label>
                  <Input value={item.name} onChange={(event) => updatePrinter(item.id, { name: event.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Model</Label>
                  <Input value={item.model} onChange={(event) => updatePrinter(item.id, { model: event.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Location</Label>
                  <Input value={item.location} onChange={(event) => updatePrinter(item.id, { location: event.target.value })} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.color ? "Color" : "Black & white"} · {item.paper}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
