"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function CatalogPage() {
  const { catalog, ready } = useStore();
  if (!ready) return null;
  const groups = [...new Set(catalog.map((item) => item.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Service catalog</h1>
        <p className="text-sm text-muted-foreground">Base services used when preparing quotations.</p>
      </div>
      {groups.map((group) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{group}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Base price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.filter((item) => item.category === group).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{peso(item.basePrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
