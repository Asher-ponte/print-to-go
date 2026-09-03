"use client";

import { LocationMap } from "@/components/location-map";
import { PaymentBadge, PriorityBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QC_ITEMS, STATUS_LABEL } from "@/lib/constants";
import { formatDateTime, orderAmount, peso, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { OrderStatus, PaymentStatus, Priority, QCChecklist, QuoteLine } from "@/lib/types";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Customer, Order } from "@/lib/types";

const emptyQc: QCChecklist = {
  correctFile: false,
  correctQuantity: false,
  correctPaper: false,
  correctColor: false,
  correctSize: false,
  correctFinishing: false,
  noDefects: false,
  properPackaging: false,
};

export default function AdminOrderPage() {
  const params = useParams<{ ticket: string }>();
  const store = useStore();
  const order = store.orderByTicket(decodeURIComponent(params.ticket));
  const customer = order ? store.customerById(order.customerId) : undefined;

  if (!store.ready) return null;
  if (!order || !customer) return <p>Ticket not found.</p>;
  return <OrderEditor key={order.id} order={order} customer={customer} />;
}

function OrderEditor({ order, customer }: { order: Order; customer: Customer }) {
  const store = useStore();
  const [lines, setLines] = useState<QuoteLine[]>(order.quotation?.lines ?? []);
  const [discount, setDiscount] = useState(order.quotation?.discount ?? 0);
  const [promo, setPromo] = useState(order.quotation?.promoCode ?? "");
  const [qc, setQc] = useState<QCChecklist>(order.qc ?? emptyQc);
  const [recipient, setRecipient] = useState("");
  const [remarks, setRemarks] = useState("");

  const total = Math.max(0, lines.reduce((sum, line) => sum + line.amount, 0) - discount);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Ticket</p>
          <h1 className="font-mono text-2xl font-semibold">{order.ticket}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={order.status} dark />
            <PaymentBadge status={order.paymentStatus} dark />
            <PriorityBadge priority={order.priority} dark />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={order.priority} onValueChange={(value) => store.setPriority(order.id, value as Priority)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={order.status} onValueChange={(value) => store.setStatus(order.id, value as OrderStatus)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-lg font-semibold">{customer.company || customer.name}</p>
            <p>{customer.name}</p>
            <p>📞 {customer.mobile}</p>
            <p>{customer.email}</p>
            {customer.vip ? <p>⭐ VIP · {customer.billing === "monthly" ? "Monthly account" : "Per order"}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order.fulfillment === "delivery" && order.delivery ? (
              <>
                <p>{order.delivery.pin.address}</p>
                <p className="text-muted-foreground">
                  {[order.delivery.pin.building, order.delivery.pin.floor && `Floor ${order.delivery.pin.floor}`, order.delivery.pin.office, order.delivery.pin.gate, order.delivery.pin.landmark].filter(Boolean).join(" · ")}
                </p>
                <p>{order.delivery.pin.instructions || order.specialInstructions}</p>
                <LocationMap pin={order.delivery.pin} className="h-56 w-full overflow-hidden rounded-lg border" />
              </>
            ) : (
              <p>🏪 Pickup {order.pickupNote ? `· ${order.pickupNote}` : ""}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Files</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {order.files.map((file) => (
            <div key={file.id} className="rounded-lg border border-white/10 p-3 text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-muted-foreground">
                {file.spec.service} · {file.spec.paperSize} · {file.spec.color} · {file.spec.paperType} · {file.spec.quantity} copies
                {file.spec.finishing.length ? ` · ${file.spec.finishing.join(", ")}` : ""}
              </p>
            </div>
          ))}
          {order.specialInstructions ? <p className="text-sm">Special instructions: {order.specialInstructions}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Quotation</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const quote = store.autoQuote(order.id);
              setLines(quote.lines);
              toast.message("Suggested pricing loaded");
            }}
          >
            Suggest prices
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.map((line) => (
            <div key={line.id} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
              <Input value={line.description} onChange={(e) => setLines((c) => c.map((l) => l.id === line.id ? { ...l, description: e.target.value } : l))} />
              <Input type="number" value={line.amount} onChange={(e) => setLines((c) => c.map((l) => l.id === line.id ? { ...l, amount: Number(e.target.value) } : l))} />
              <Button variant="ghost" onClick={() => setLines((c) => c.filter((l) => l.id !== line.id))}>Remove</Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={() => setLines((c) => [...c, { id: uid("ql"), description: "New line", amount: 0 }])}>
            Add line
          </Button>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Promo code</Label>
              <div className="flex gap-2">
                <Input value={promo} onChange={(e) => setPromo(e.target.value)} />
                <Button variant="outline" onClick={() => toast.message(store.applyPromo(order.id, promo))}>Apply</Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Discount</Label>
              <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Total</Label>
              <p className="pt-2 text-xl font-semibold">{peso(total)}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              store.sendQuotation(order.id, { lines, discount, promoCode: promo || undefined });
              toast.success("Quotation sent to customer");
            }}
          >
            Send quotation
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(["pending", "submitted", "verified", "paid", "partial", "cod", "monthly", "refunded"] as PaymentStatus[]).map((status) => (
              <Button key={status} size="sm" variant={order.paymentStatus === status ? "default" : "outline"} onClick={() => store.setPayment(order.id, status, status === "paid" || status === "cod" ? orderAmount(order) : order.amountPaid)}>
                {status}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quality check</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {QC_ITEMS.map((item) => (
              <label key={item.key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(qc[item.key])}
                  onCheckedChange={(value) => setQc((current) => ({ ...current, [item.key]: Boolean(value) }))}
                />
                {item.label}
              </label>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => store.saveQC(order.id, qc, false)}>Save QC</Button>
              <Button onClick={() => store.saveQC(order.id, { ...qc, inspector: "Shop QC" }, true)}>QC passed</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.fulfillment === "delivery" ? (
        <Card>
          <CardHeader><CardTitle>Proof of delivery</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Recipient name" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <Textarea placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            <Button
              onClick={() => {
                store.recordPOD(order.id, {
                  recipientName: recipient || customer.name,
                  deliveredAt: new Date().toISOString(),
                  confirmation: true,
                  signatureName: recipient,
                  remarks,
                });
                toast.success("Delivery completed");
              }}
            >
              Mark delivered
            </Button>
            {order.pod ? (
              <p className="text-sm text-muted-foreground">
                Received by {order.pod.recipientName} · {formatDateTime(order.pod.deliveredAt)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.timeline.map((event) => (
            <div key={event.id}>
              <p className="font-medium">{event.title}</p>
              <p className="text-muted-foreground">{formatDateTime(event.at)}{event.detail ? ` · ${event.detail}` : ""}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
