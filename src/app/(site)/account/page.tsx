"use client";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, orderAmount, peso } from "@/lib/format";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountPage() {
  const store = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("purchasing@abc-mfg.ph");
  const [mobile, setMobile] = useState("09171234567");
  const [name, setName] = useState("Liza Mercado");
  const customer = store.session.customerId ? store.customerById(store.session.customerId) : undefined;
  const orders = customer ? store.orders.filter((order) => order.customerId === customer.id) : [];

  if (!customer) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Order history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in with the mobile or email used on your print request. Demo company: ABC Manufacturing.
            </p>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input value={mobile} onChange={(event) => setMobile(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Button
              className="w-full"
              onClick={() => store.loginCustomer({ name, mobile, email })}
            >
              View my tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{customer.company || customer.name}</h1>
          <p className="text-muted-foreground">
            {customer.email} · {customer.vip ? "VIP customer" : customer.type}
            {customer.billing === "monthly" ? " · Monthly account" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/request">Order again</Link>
        </Button>
      </div>
      {customer.authorizedUsers?.length ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Authorized users: {customer.authorizedUsers.join(", ")}
        </p>
      ) : null}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.ticket}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.quotation ? peso(orderAmount(order)) : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/ticket/${order.ticket}`}>Open</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/request")}
                    >
                      Order again
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
