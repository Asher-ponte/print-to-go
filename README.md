# Print-to-Go

**Your Printing. Your Location. Our Delivery.**

Print-to-Go is a print-request and delivery desk for shops serving Cabuyao and nearby Laguna. Customers upload files, choose specifications, pin a drop-off, and follow one ticket from quotation through proof of delivery. Staff run the same tickets from a production and dispatch dashboard.

## Customer journey

1. Open the homepage and start a print request.
2. Enter contact details and upload one or more files.
3. Set paper, color, quantity, and finishing for each file.
4. Choose pickup or delivery, then pin the exact location on the map.
5. Receive a print ticket such as `PTG-20260903-001`.
6. Track quotation, payment, printing, quality check, and delivery.
7. Accept or request changes on the quotation.
8. Reorder from account history.

## Staff dashboard

- Today-at-a-glance cards for new, quotation, printing, ready, out for delivery, completed, and sales
- Ticket queue with status and priority filters
- Order detail: files, map pin, quotation builder, payment, QC checklist, proof of delivery
- Production board
- Delivery map and dispatch runs
- Customers, catalog, pricing, zones, promotions, and analytics

## Demo access

- Staff PIN: `printogo`
- Sample tickets: `PTG-20260903-001`, `PTG-20260903-003`
- Sample company login: `purchasing@abc-mfg.ph` / `09171234567`

Orders and settings live in the browser so the demo works without a database. Use **Reset demo data** on the Promotions page to restore the sample shop.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, and OpenStreetMap for location pins.
