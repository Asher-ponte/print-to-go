"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { peso } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function PricingPage() {
  const { priceRules, zones, saveZones, ready } = useStore();
  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pricing & delivery zones</h1>
        <p className="text-sm text-muted-foreground">Base print prices, bulk breaks, finishing, and zone fees.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Price list</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.name}</TableCell>
                  <TableCell className="capitalize">{rule.kind}</TableCell>
                  <TableCell>
                    {rule.minQty ?? 1}
                    {rule.maxQty ? `–${rule.maxQty}` : "+"}
                  </TableCell>
                  <TableCell>{peso(rule.unitPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Delivery zones</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {zones.map((zone) => (
            <div key={zone.id} className="grid items-center gap-2 sm:grid-cols-[140px_1fr_120px]">
              <p className="font-medium">{zone.name}</p>
              <p className="text-sm text-muted-foreground">{zone.cities.join(", ")}</p>
              <Input
                type="number"
                value={zone.fee}
                onChange={(event) =>
                  saveZones(zones.map((item) => (item.id === zone.id ? { ...item, fee: Number(event.target.value) } : item)))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
