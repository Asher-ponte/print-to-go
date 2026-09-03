import type { DeliveryZone, Order, PriceRule, Promo, QuoteLine } from "./types";
import { uid } from "./format";

function pageRate(color: string, qty: number, rules: PriceRule[]) {
  const kind = color === "Colored" ? "color" : "bw";
  const matches = rules
    .filter((rule) => rule.kind === "print" && rule.name.toLowerCase().includes(kind))
    .sort((a, b) => (b.minQty ?? 0) - (a.minQty ?? 0));
  const hit = matches.find((rule) => qty >= (rule.minQty ?? 1) && qty <= (rule.maxQty ?? 999999));
  return hit?.unitPrice ?? (kind === "color" ? 15 : 5);
}

export function suggestQuote(order: Order, rules: PriceRule[], zones: DeliveryZone[], promo?: Promo): QuoteLine[] {
  const lines: QuoteLine[] = [];

  for (const file of order.files) {
    const pages = file.spec.sides === "Double-sided" ? file.spec.quantity : file.spec.quantity;
    const sizeMult = file.spec.paperSize === "A3" ? 1.8 : 1;
    const paperMult =
      file.spec.paperType === "Photo Paper" || file.spec.paperType === "Glossy"
        ? 1.4
        : file.spec.paperType === "Cardstock" || file.spec.paperType === "Sticker Paper"
          ? 1.6
          : 1;
    const rate = pageRate(file.spec.color, pages, rules) * sizeMult * paperMult;
    lines.push({
      id: uid("ql"),
      description: `${file.name} · ${file.spec.quantity} ${file.spec.paperSize} ${file.spec.color}`,
      amount: Math.round(rate * pages),
    });

    for (const finish of file.spec.finishing) {
      const rule = rules.find((item) => item.kind === "finishing" && item.name === finish);
      const unit = rule?.unitPrice ?? 20;
      lines.push({
        id: uid("ql"),
        description: `${finish} · ${file.name}`,
        amount: Math.round(unit * Math.max(1, Math.ceil(file.spec.quantity / 10))),
      });
    }
  }

  if (order.fulfillment === "delivery") {
    const city = order.delivery?.pin.address ?? "";
    const zone = zones.find((item) => item.cities.some((c) => city.toLowerCase().includes(c.toLowerCase())));
    const fee = promo?.kind === "free_delivery" ? 0 : (zone?.fee ?? 80);
    lines.push({
      id: uid("ql"),
      description: zone ? `Delivery · ${zone.name}` : "Delivery",
      amount: fee,
    });
  }

  if (order.priority === "urgent") {
    const rush = rules.find((rule) => rule.kind === "rush");
    lines.push({
      id: uid("ql"),
      description: "Rush fee",
      amount: rush?.unitPrice ?? 150,
    });
  }

  return lines;
}

export function quoteTotal(lines: QuoteLine[], discount = 0) {
  return Math.max(0, lines.reduce((sum, line) => sum + line.amount, 0) - discount);
}

export function promoDiscount(code: string, subtotal: number, promos: Promo[]) {
  const promo = promos.find((item) => item.active && item.code.toUpperCase() === code.trim().toUpperCase());
  if (!promo) return { discount: 0, promo: undefined as Promo | undefined };
  if (promo.kind === "percent") return { discount: Math.round(subtotal * (promo.value / 100)), promo };
  if (promo.kind === "fixed") return { discount: promo.value, promo };
  return { discount: 0, promo };
}
