"use client";

import { ProgressTracker } from "@/components/progress-tracker";
import { PaymentBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, orderAmount, peso } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function TicketPage() {
  const params = useParams<{ ticket: string }>();
  const store = useStore();
  const order = store.orderByTicket(decodeURIComponent(params.ticket));
  const customer = order ? store.customerById(order.customerId) : undefined;
  const [note, setNote] = useState("");

  if (!store.ready) return <div className="p-10 text-sm text-muted-foreground">Loading ticket…</div>;
  if (!order || !customer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-2xl font-semibold">Ticket not found</h1>
        <p className="mt-2 text-muted-foreground">Check the number on your print ticket and try again.</p>
      </div>
    );
  }

  const awaiting = order.status === "awaiting_confirmation" || order.status === "quotation";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Print ticket</p>
          <h1 className="font-mono text-3xl font-semibold">{order.ticket}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>

        {awaiting && order.quotation ? (
          <Card className="border-primary/30 bg-secondary/60">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Quotation ready</p>
                <p className="text-2xl font-semibold">{peso(orderAmount(order))}</p>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  store.customerQuoteAction(order.id, "accept");
                  toast.success("Accepted. The shop can start printing.");
                }}
              >
                Accept & continue
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Ticket details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Customer" value={customer.company || customer.name} />
            <Row label="Contact" value={customer.mobile} />
            <Row label="Request date" value={formatDateTime(order.createdAt)} />
            <Row label="Delivery" value={order.fulfillment === "delivery" ? "Yes" : "Pickup"} />
            <Row label="Location" value={order.delivery?.pin.address ?? "Shop pickup"} />
            <Row label="Payment" value={order.paymentStatus} />
            <Row label="Amount" value={order.quotation ? peso(orderAmount(order)) : "Pending quotation"} />
            <Row label="Status" value={order.status.replaceAll("_", " ")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files & specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.files.map((file) => (
              <div key={file.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{file.name}</p>
                <p className="text-muted-foreground">
                  {file.spec.paperSize} · {file.spec.color} · {file.spec.paperType} · {file.spec.quantity} copies
                  {file.spec.finishing.length ? ` · ${file.spec.finishing.join(", ")}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {order.quotation ? (
          <Card>
            <CardHeader>
              <CardTitle>Quotation {order.ticket}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {order.quotation.lines.map((line) => (
                <div key={line.id} className="flex justify-between gap-4">
                  <span>{line.description}</span>
                  <span className="font-medium">{peso(line.amount)}</span>
                </div>
              ))}
              {order.quotation.discount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {order.quotation.promoCode}</span>
                  <span>-{peso(order.quotation.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{peso(orderAmount(order))}</span>
              </div>
              {awaiting ? (
                <div className="space-y-3 pt-2">
                  <Textarea
                    placeholder="Optional note if you need changes"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        store.customerQuoteAction(order.id, "accept");
                        toast.success("Quotation accepted. The shop will start production after payment.");
                      }}
                    >
                      Accept quotation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        store.customerQuoteAction(order.id, "changes", note);
                        toast.message("Change request sent");
                      }}
                    >
                      Request changes
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        store.customerQuoteAction(order.id, "decline", note);
                        toast.message("Quotation declined");
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              The shop is reviewing your files and will send a quotation to this ticket.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order status</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTracker status={order.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order.timeline.map((event) => (
              <div key={event.id}>
                <p className="font-medium">{event.title}</p>
                <p className="text-muted-foreground">
                  {formatDateTime(event.at)}
                  {event.detail ? ` · ${event.detail}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}
