"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderAmount, peso } from "@/lib/format";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function CustomersPage() {
  const { customers, orders, ready } = useStore();
  if (!ready) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground">Spending, outstanding balances, and VIP accounts.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Spending</TableHead>
                <TableHead>Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const theirs = orders.filter((order) => order.customerId === customer.id && order.status !== "cancelled");
                const spend = theirs.reduce((sum, order) => sum + (order.quotation ? orderAmount(order) : 0), 0);
                const outstanding = theirs
                  .filter((order) => !["paid", "cod", "monthly", "refunded"].includes(order.paymentStatus) && order.quotation)
                  .reduce((sum, order) => sum + orderAmount(order) - order.amountPaid, 0);
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <p className="font-medium">{customer.company || customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.company ? customer.name : customer.email}</p>
                    </TableCell>
                    <TableCell>
                      {customer.mobile}
                      <div className="text-xs text-muted-foreground">{customer.email}</div>
                    </TableCell>
                    <TableCell>
                      {customer.vip ? <Badge>⭐ VIP</Badge> : customer.type}
                      <div className="text-xs text-muted-foreground">{customer.billing === "monthly" ? "Monthly billing" : "Per order"}</div>
                    </TableCell>
                    <TableCell>
                      <Link className="underline-offset-4 hover:underline" href="/admin/orders">
                        {theirs.length}
                      </Link>
                    </TableCell>
                    <TableCell>{peso(spend)}</TableCell>
                    <TableCell>{peso(outstanding)}</TableCell>
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
