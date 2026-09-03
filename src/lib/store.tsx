"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { ADMIN_PIN } from "./constants";
import { nextTicket, uid } from "./format";
import { promoDiscount, suggestQuote } from "./pricing";
import { createSeed } from "./seed";
import type {
  AppState,
  CatalogItem,
  Customer,
  DeliveryRun,
  DeliveryZone,
  Order,
  OrderStatus,
  PaymentStatus,
  Priority,
  Promo,
  QCChecklist,
  Quotation,
  ShopPrinter,
} from "./types";

const STORAGE_KEY = "ptg-store-v1";
const seed = createSeed();
const listeners = new Set<() => void>();
let memory = seed;

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.orders && parsed.customers) {
        memory = {
          ...seed,
          ...parsed,
          session: parsed.session ?? { role: "guest" },
          printers: parsed.printers?.length ? parsed.printers : seed.printers,
          selectedPrinterId: parsed.selectedPrinterId ?? seed.selectedPrinterId,
        };
      }
    }
  } catch {
    memory = seed;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(updater: (current: AppState) => AppState) {
  memory = updater(memory);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  }
  emit();
}

function notify(title: string, detail?: string) {
  return { id: uid("ev"), at: new Date().toISOString(), title, detail };
}

type Store = AppState & {
  ready: boolean;
  loginCustomer: (input: { name: string; mobile: string; email: string; company?: string }) => Customer;
  loginExisting: (customerId: string) => void;
  loginAdmin: (pin: string) => boolean;
  logout: () => void;
  createOrder: (input: Omit<Order, "id" | "ticket" | "createdAt" | "timeline" | "amountPaid" | "status" | "paymentStatus"> & {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
  }) => Order;
  updateOrder: (id: string, patch: Partial<Order>, event?: { title: string; detail?: string }) => void;
  sendQuotation: (orderId: string, quotation: Quotation) => void;
  autoQuote: (orderId: string) => Quotation;
  customerQuoteAction: (orderId: string, action: "accept" | "decline" | "changes", note?: string) => void;
  setPayment: (orderId: string, status: PaymentStatus, amount?: number) => void;
  setStatus: (orderId: string, status: OrderStatus, detail?: string) => void;
  setPriority: (orderId: string, priority: Priority) => void;
  saveQC: (orderId: string, qc: QCChecklist, pass: boolean) => void;
  createRun: (driver: string, orderIds: string[]) => DeliveryRun;
  recordPOD: (orderId: string, pod: Order["pod"]) => void;
  applyPromo: (orderId: string, code: string) => string;
  upsertCustomer: (customer: Customer) => void;
  saveCatalog: (items: CatalogItem[]) => void;
  saveZones: (zones: DeliveryZone[]) => void;
  savePromos: (promos: Promo[]) => void;
  savePrinters: (printers: ShopPrinter[]) => void;
  selectPrinter: (id: string) => void;
  recordPrint: (orderId: string, copies: number, printerName: string) => void;
  resetDemo: () => void;
  customerById: (id: string) => Customer | undefined;
  orderByTicket: (ticket: string) => Order | undefined;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, () => memory, () => seed);

  const api = useMemo<Store>(() => {
    const patchOrder = (id: string, recipe: (order: Order) => Order) =>
      persist((current) => ({
        ...current,
        orders: current.orders.map((order) => (order.id === id ? recipe(order) : order)),
      }));

    return {
      ...state,
      ready: true,
      loginCustomer: (input) => {
        let customer =
          memory.customers.find(
            (item) => item.mobile === input.mobile || item.email.toLowerCase() === input.email.toLowerCase(),
          ) ?? null;
        if (!customer) {
          customer = {
            id: uid("cus"),
            name: input.name,
            mobile: input.mobile,
            email: input.email,
            company: input.company,
            type: input.company ? "company" : "individual",
            billing: "per_order",
            vip: false,
          };
          persist((current) => ({
            ...current,
            customers: [customer!, ...current.customers],
            session: { role: "customer", customerId: customer!.id },
          }));
        } else {
          persist((current) => ({
            ...current,
            session: { role: "customer", customerId: customer!.id },
          }));
        }
        return customer;
      },
      loginExisting: (customerId) =>
        persist((current) => ({ ...current, session: { role: "customer", customerId } })),
      loginAdmin: (pin) => {
        if (pin.trim() !== ADMIN_PIN) return false;
        persist((current) => ({ ...current, session: { role: "admin" } }));
        return true;
      },
      logout: () => persist((current) => ({ ...current, session: { role: "guest" } })),
      createOrder: (input) => {
        const order: Order = {
          ...input,
          id: uid("ord"),
          ticket: nextTicket(memory.orders.map((item) => item.ticket)),
          createdAt: new Date().toISOString(),
          status: input.status ?? "new",
          paymentStatus: input.paymentStatus ?? "pending",
          amountPaid: 0,
          printCount: 0,
          timeline: [notify("Request submitted", "Print ticket created")],
        };
        persist((current) => ({ ...current, orders: [order, ...current.orders] }));
        return order;
      },
      updateOrder: (id, patch, event) =>
        patchOrder(id, (order) => ({
          ...order,
          ...patch,
          timeline: event ? [notify(event.title, event.detail), ...order.timeline] : order.timeline,
        })),
      sendQuotation: (orderId, quotation) =>
        patchOrder(orderId, (order) => {
          const next = { ...order, quotation: { ...quotation, sentAt: new Date().toISOString() }, status: "awaiting_confirmation" as const };
          const total = (quotation.lines ?? []).reduce((sum, line) => sum + line.amount, 0) - (quotation.discount ?? 0);
          return {
            ...next,
            timeline: [notify("Quotation sent", `Total ₱${Math.max(0, total).toLocaleString("en-PH")}`), ...order.timeline],
          };
        }),
      autoQuote: (orderId) => {
        const order = memory.orders.find((item) => item.id === orderId);
        if (!order) return { lines: [], discount: 0 };
        return { lines: suggestQuote(order, memory.priceRules, memory.zones), discount: 0 };
      },
      customerQuoteAction: (orderId, action, note) =>
        patchOrder(orderId, (order) => {
          if (action === "accept") {
            const monthly = memory.customers.find((c) => c.id === order.customerId)?.billing === "monthly";
            return {
              ...order,
              status: monthly ? "paid" : "confirmed",
              paymentStatus: monthly ? "monthly" : order.paymentStatus,
              timeline: [notify("Customer accepted quotation"), ...order.timeline],
            };
          }
          if (action === "decline") {
            return {
              ...order,
              status: "cancelled",
              timeline: [notify("Customer declined quotation", note), ...order.timeline],
            };
          }
          return {
            ...order,
            status: "changes_requested",
            changeRequest: note,
            timeline: [notify("Customer requested changes", note), ...order.timeline],
          };
        }),
      setPayment: (orderId, status, amount) =>
        patchOrder(orderId, (order) => ({
          ...order,
          paymentStatus: status,
          amountPaid: amount ?? order.amountPaid,
          status:
            status === "paid" || status === "verified" || status === "monthly" || status === "cod"
              ? order.status === "confirmed" || order.status === "awaiting_confirmation"
                ? "paid"
                : order.status
              : order.status,
          timeline: [notify("Payment updated", status), ...order.timeline],
        })),
      setStatus: (orderId, status, detail) =>
        patchOrder(orderId, (order) => ({
          ...order,
          status,
          timeline: [notify(`Status: ${status.replaceAll("_", " ")}`, detail), ...order.timeline],
        })),
      setPriority: (orderId, priority) => patchOrder(orderId, (order) => ({ ...order, priority })),
      saveQC: (orderId, qc, pass) =>
        patchOrder(orderId, (order) => ({
          ...order,
          qc: pass ? { ...qc, passedAt: new Date().toISOString() } : qc,
          status: pass ? "ready" : "quality_check",
          timeline: [notify(pass ? "QC passed" : "QC saved", pass ? "Ready for delivery or pickup" : undefined), ...order.timeline],
        })),
      createRun: (driver, orderIds) => {
        const run: DeliveryRun = {
          id: uid("run"),
          name: `Delivery Run #${String(memory.runs.length + 1).padStart(3, "0")}`,
          driver,
          createdAt: new Date().toISOString(),
          orderIds,
          status: "planned",
        };
        persist((current) => ({
          ...current,
          runs: [run, ...current.runs],
          orders: current.orders.map((order) =>
            orderIds.includes(order.id)
              ? {
                  ...order,
                  runId: run.id,
                  driver,
                  status: "assigned" as OrderStatus,
                  timeline: [notify("Assigned to delivery run", `${run.name} · ${driver}`), ...order.timeline],
                }
              : order,
          ),
        }));
        return run;
      },
      recordPOD: (orderId, pod) =>
        patchOrder(orderId, (order) => ({
          ...order,
          pod,
          status: "delivered",
          timeline: [notify("Delivered", pod ? `Received by ${pod.recipientName}` : undefined), ...order.timeline],
        })),
      applyPromo: (orderId, code) => {
        const order = memory.orders.find((item) => item.id === orderId);
        if (!order?.quotation) return "No quotation yet";
        const subtotal = order.quotation.lines.reduce((sum, line) => sum + line.amount, 0);
        const { discount, promo } = promoDiscount(code, subtotal, memory.promos);
        if (!promo) return "Promo code not found";
        patchOrder(orderId, (current) => ({
          ...current,
          quotation: { ...current.quotation!, discount, promoCode: promo.code },
        }));
        return `Applied ${promo.code}`;
      },
      upsertCustomer: (customer) =>
        persist((current) => ({
          ...current,
          customers: current.customers.some((item) => item.id === customer.id)
            ? current.customers.map((item) => (item.id === customer.id ? customer : item))
            : [customer, ...current.customers],
        })),
      saveCatalog: (catalog) => persist((current) => ({ ...current, catalog })),
      saveZones: (zones) => persist((current) => ({ ...current, zones })),
      savePromos: (promos) => persist((current) => ({ ...current, promos })),
      savePrinters: (printers) => persist((current) => ({ ...current, printers })),
      selectPrinter: (id) => persist((current) => ({ ...current, selectedPrinterId: id })),
      recordPrint: (orderId, copies, printerName) =>
        patchOrder(orderId, (order) => ({
          ...order,
          printCount: (order.printCount ?? 0) + copies,
          lastPrintedAt: new Date().toISOString(),
          lastPrinter: printerName,
          status:
            order.status === "paid" || order.status === "confirmed" || order.status === "new"
              ? "printing"
              : order.status,
          timeline: [
            notify("Sent to printer", `${copies} cop${copies === 1 ? "y" : "ies"} · ${printerName}`),
            ...order.timeline,
          ],
        })),
      resetDemo: () => persist(() => createSeed()),
      customerById: (id) => state.customers.find((item) => item.id === id),
      orderByTicket: (ticket) =>
        state.orders.find((item) => item.ticket.toLowerCase() === ticket.trim().toLowerCase()),
    };
  }, [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
