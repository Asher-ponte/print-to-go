"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadOrderFile, hasUpload, saveUpload } from "@/lib/files";
import { fileSize, formatDateTime } from "@/lib/format";
import { printAllFiles, printJobTicket, printOrderFile } from "@/lib/print";
import { useStore } from "@/lib/store";
import type { Customer, Order, OrderFile } from "@/lib/types";
import { Download, Paperclip, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function copiesOn(order: Order) {
  return order.files.reduce((sum, file) => sum + (file.spec.quantity || 0), 0) || 1;
}

export function PrinterPicker({ className }: { className?: string }) {
  const store = useStore();
  const selected = store.selectedPrinterId ?? store.printers[0]?.id;
  return (
    <div className={className}>
      <Label className="mb-1 block text-xs text-muted-foreground">Send to shop printer</Label>
      <Select value={selected} onValueChange={store.selectPrinter}>
        <SelectTrigger className="w-full min-w-56">
          <SelectValue placeholder="Choose printer" />
        </SelectTrigger>
        <SelectContent>
          {store.printers.map((printer) => (
            <SelectItem key={printer.id} value={printer.id}>
              {printer.name} · {printer.model} · {printer.location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PrintActions({
  order,
  customer,
  showFiles = true,
}: {
  order: Order;
  customer: Customer;
  showFiles?: boolean;
}) {
  const store = useStore();
  const printer = store.printers.find((item) => item.id === store.selectedPrinterId) ?? store.printers[0];
  const [ready, setReady] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    Promise.all(order.files.map(async (file) => [file.id, await hasUpload(file)] as const)).then((rows) => {
      if (!alive) return;
      setReady(Object.fromEntries(rows));
    });
    return () => {
      alive = false;
    };
  }, [order.files]);

  function send(copies: number, task: () => void | Promise<void>) {
    return async () => {
      try {
        await task();
        store.recordPrint(order.id, copies, printer?.name ?? "Shop printer");
        toast.success(`Print dialog opened · pick ${printer?.name ?? "the shop printer"}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not open print dialog");
      }
    };
  }

  async function attach(file: OrderFile, incoming: FileList | null) {
    const next = incoming?.[0];
    if (!next) return;
    await saveUpload(file.id, next);
    setReady((current) => ({ ...current, [file.id]: true }));
    toast.success(`${next.name} attached and ready to print`);
  }

  async function download(file: OrderFile) {
    const ok = await downloadOrderFile(file);
    if (ok) toast.success(`Downloading ${file.name}`);
    else toast.message("Original file is not on this computer. Attach it below, then download or print.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <PrinterPicker className="min-w-64 flex-1" />
        <Button onClick={send(1, () => printJobTicket(order, customer, printer))}>
          <Printer />
          Print job ticket
        </Button>
        <Button variant="secondary" onClick={send(copiesOn(order), () => printAllFiles(order, customer, printer))}>
          <Printer />
          Print files
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        The app opens your computer&apos;s print dialog so staff can pick the matching shop printer
        ({printer?.model}) and set copies. Browsers cannot silently lock onto a USB printer.
      </p>
      {order.lastPrintedAt ? (
        <p className="text-xs text-muted-foreground">
          Last printed {formatDateTime(order.lastPrintedAt)}
          {order.lastPrinter ? ` · ${order.lastPrinter}` : ""} · {order.printCount ?? 0} copies sent
        </p>
      ) : null}

      {showFiles
        ? order.files.map((file) => (
            <div key={file.id} className="rounded-lg border border-white/10 p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-muted-foreground">
                    {file.spec.service} · {file.spec.paperSize}
                    {file.spec.customSize ? ` (${file.spec.customSize})` : ""} · {file.spec.color} · {file.spec.paperType} ·{" "}
                    {file.spec.quantity} copies
                    {file.spec.finishing.length ? ` · ${file.spec.finishing.join(", ")}` : ""}
                    {file.size ? ` · ${fileSize(file.size)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ready[file.id]
                      ? "Original file is on this computer and can be downloaded or printed."
                      : "Job ticket can print now. Attach the original file from USB or email to print the artwork."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => download(file)}>
                    <Download />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={send(file.spec.quantity, () => printOrderFile(file, order, customer, printer))}
                  >
                    <Printer />
                    Print
                  </Button>
                  <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 text-[0.8rem] hover:bg-muted">
                    <Paperclip className="size-3.5" />
                    Attach
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(event) => {
                        void attach(file, event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))
        : null}
    </div>
  );
}
