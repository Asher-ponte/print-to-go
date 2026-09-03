import type { Order, OrderFile } from "./types";

export function peso(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ymd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function orderAmount(order: Order) {
  if (!order.quotation) return 0;
  const subtotal = order.quotation.lines.reduce((sum, line) => sum + line.amount, 0);
  return Math.max(0, subtotal - order.quotation.discount);
}

export function fileSummary(file: OrderFile) {
  return `${file.spec.quantity} × ${file.spec.paperSize} ${file.spec.color}`;
}

export function orderSummary(order: Order) {
  const first = order.files[0];
  if (!first) return "No files";
  if (order.files.length === 1) return fileSummary(first);
  const qty = order.files.reduce((sum, file) => sum + file.spec.quantity, 0);
  return `${qty} items · ${order.files.length} files`;
}

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function nextTicket(existing: string[], date = new Date()) {
  const prefix = `PTG-${ymd(date)}-`;
  const seq =
    existing
      .filter((ticket) => ticket.startsWith(prefix))
      .map((ticket) => Number(ticket.slice(prefix.length)))
      .reduce((max, n) => (Number.isFinite(n) ? Math.max(max, n) : max), 0) + 1;
  return `${prefix}${String(seq).padStart(3, "0")}`;
}
