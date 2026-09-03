"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";

export default function PromotionsPage() {
  const { promos, savePromos, resetDemo, ready } = useStore();
  if (!ready) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Promotions</h1>
          <p className="text-sm text-muted-foreground">Promo codes, first-order deals, and free delivery.</p>
        </div>
        <Button variant="outline" onClick={resetDemo}>Reset demo data</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <Badge variant="outline">{promo.code}</Badge>
                  </TableCell>
                  <TableCell>{promo.description}</TableCell>
                  <TableCell>
                    {promo.kind === "percent"
                      ? `${promo.value}%`
                      : promo.kind === "fixed"
                        ? `₱${promo.value}`
                        : "Free delivery"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={promo.active}
                      onCheckedChange={(checked) =>
                        savePromos(promos.map((item) => (item.id === promo.id ? { ...item, active: checked } : item)))
                      }
                    />
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
