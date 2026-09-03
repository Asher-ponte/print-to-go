import type { Customer, Order, OrderFile, ShopPrinter } from "./types";
import { formatDateTime } from "./format";
import { loadUpload } from "./files";

function pageSize(file?: OrderFile) {
  const size = file?.spec.paperSize ?? "A4";
  if (size === "A3") return "A3";
  if (size === "Legal") return "legal";
  if (size === "Letter") return "letter";
  return "A4";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sheetHtml(order: Order, customer: Customer, printer?: ShopPrinter) {
  const files = order.files
    .map(
      (file) => `
      <tr>
        <td>${escapeHtml(file.name)}</td>
        <td>${escapeHtml(file.spec.service)}</td>
        <td>${escapeHtml(file.spec.paperSize)}${file.spec.customSize ? ` (${escapeHtml(file.spec.customSize)})` : ""}</td>
        <td>${escapeHtml(file.spec.paperType)}</td>
        <td>${escapeHtml(file.spec.color)}</td>
        <td>${escapeHtml(file.spec.sides)}</td>
        <td><strong>${file.spec.quantity}</strong></td>
        <td>${file.spec.finishing.length ? escapeHtml(file.spec.finishing.join(", ")) : "—"}</td>
      </tr>`,
    )
    .join("");

  return `
    <header class="bar">
      <div>
        <p class="brand">PRINT-TO-GO · JOB TICKET</p>
        <h1>${escapeHtml(order.ticket)}</h1>
      </div>
      <div class="right">
        <p><strong>Send to:</strong> ${escapeHtml(printer?.name ?? "Shop printer")}</p>
        <p>${escapeHtml(printer?.model ?? "Select in the print dialog")}</p>
        <p>${escapeHtml(printer?.location ?? "")}</p>
      </div>
    </header>
    <section class="grid">
      <div>
        <h2>Customer</h2>
        <p><strong>${escapeHtml(customer.company || customer.name)}</strong></p>
        <p>${escapeHtml(customer.name)}</p>
        <p>${escapeHtml(customer.mobile)} · ${escapeHtml(customer.email)}</p>
      </div>
      <div>
        <h2>Fulfillment</h2>
        <p>${order.fulfillment === "delivery" ? "Delivery" : "Pickup"}</p>
        <p>${escapeHtml(order.delivery?.pin.address ?? order.pickupNote ?? "Shop counter")}</p>
        <p>${escapeHtml(order.specialInstructions ?? "")}</p>
      </div>
      <div>
        <h2>Print settings</h2>
        <p>Copies are listed per file. In the printer dialog, set <strong>copies</strong> to match the quantity and pick the named shop printer.</p>
        <p>Requested ${escapeHtml(formatDateTime(order.createdAt))}</p>
      </div>
    </section>
    <h2>Files to print</h2>
    <table>
      <thead>
        <tr>
          <th>File</th><th>Service</th><th>Size</th><th>Paper</th><th>Color</th><th>Sides</th><th>Copies</th><th>Finishing</th>
        </tr>
      </thead>
      <tbody>${files}</tbody>
    </table>
    <p class="note">Operator: check paper tray, color mode, and copy count before sending. Keep this ticket with the finished prints.</p>
  `;
}

const PRINT_CSS = `
  @page { margin: 12mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 16px; }
  h1 { margin: 0; font-size: 28px; letter-spacing: 0.02em; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; margin: 16px 0 6px; }
  p { margin: 0 0 4px; font-size: 13px; }
  .brand { font-size: 11px; letter-spacing: 0.14em; color: #444; }
  .bar { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #111; padding-bottom: 12px; }
  .right { text-align: right; }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f3f3f3; }
  img, embed { max-width: 100%; }
  .note { margin-top: 16px; font-size: 12px; color: #333; }
  @media print { button { display: none; } }
`;

export function openPrintWindow(title: string, body: string, size = "A4") {
  const popup = window.open("", "_blank", "width=980,height=760");
  if (!popup) throw new Error("Allow pop-ups to send jobs to the printer.");
  popup.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title>
    <style>@page { size: ${size}; margin: 12mm; } ${PRINT_CSS}</style>
  </head><body>${body}
    <script>
      window.addEventListener("load", function () {
        setTimeout(function () { window.focus(); window.print(); }, 250);
      });
    </script>
  </body></html>`);
  popup.document.close();
}

export function printJobTicket(order: Order, customer: Customer, printer?: ShopPrinter) {
  const size = pageSize(order.files[0]);
  openPrintWindow(`${order.ticket} job ticket`, sheetHtml(order, customer, printer), size);
}

export async function printOrderFile(file: OrderFile, order: Order, customer: Customer, printer?: ShopPrinter) {
  const blob = await loadUpload(file.id);
  const src = blob ? URL.createObjectURL(blob) : file.dataUrl;
  const size = pageSize(file);
  const isImage =
    (file.type || "").startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name) ||
    Boolean(src?.startsWith("data:image/"));
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  let artwork = `<p>Original file is not stored on this computer. Print the job ticket, then open the file from the customer upload if you have it.</p>`;
  if (src && isImage) {
    artwork = `<img src="${src}" alt="${escapeHtml(file.name)}" />`;
  } else if (src && isPdf) {
    artwork = `<embed src="${src}" type="application/pdf" width="100%" height="900" />`;
  } else if (src) {
    artwork = `<p>Download <strong>${escapeHtml(file.name)}</strong> and print from its native app if the browser cannot render this format.</p>
      <p><a href="${src}" download="${escapeHtml(file.name)}">Download file</a></p>`;
  }

  const body = `
    ${sheetHtml(order, customer, printer)}
    <h2>Artwork · ${escapeHtml(file.name)} · ${file.spec.quantity} copies</h2>
    ${artwork}
  `;
  openPrintWindow(`${order.ticket} · ${file.name}`, body, size);
}

export async function printAllFiles(order: Order, customer: Customer, printer?: ShopPrinter) {
  if (!order.files.length) {
    printJobTicket(order, customer, printer);
    return;
  }
  const parts: string[] = [];
  for (const file of order.files) {
    const blob = await loadUpload(file.id);
    const src = blob ? URL.createObjectURL(blob) : file.dataUrl;
    const isImage =
      (file.type || "").startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name) ||
      Boolean(src?.startsWith("data:image/"));
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    let artwork = `<p>Original file is not stored on this computer. Print the job ticket, then attach the file on the Print Station if you have it on USB or email.</p>`;
    if (src && isImage) artwork = `<img src="${src}" alt="${escapeHtml(file.name)}" />`;
    else if (src && isPdf) artwork = `<embed src="${src}" type="application/pdf" width="100%" height="900" />`;
    else if (src) {
      artwork = `<p>Download <strong>${escapeHtml(file.name)}</strong> and print from its native app if the browser cannot render this format.</p>`;
    }
    parts.push(`<h2>Artwork · ${escapeHtml(file.name)} · ${file.spec.quantity} copies</h2>${artwork}`);
  }
  openPrintWindow(
    `${order.ticket} · all files`,
    `${sheetHtml(order, customer, printer)}${parts.join("")}`,
    pageSize(order.files[0]),
  );
}
