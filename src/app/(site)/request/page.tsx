"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ACCEPTED_FILES,
  CABUYAO,
  COLOR_MODES,
  FINISHING,
  PAPER_SIZES,
  PAPER_TYPES,
  PRINT_PRESETS,
  QTY_CHIPS,
  SERVICES,
  SIDES,
  presetForService,
} from "@/lib/constants";
import { saveUpload } from "@/lib/files";
import { fileSize, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type {
  ColorMode,
  Fulfillment,
  OrderFile,
  PaperSize,
  PaperType,
  PrintSpec,
  ServiceCategory,
  Sides,
} from "@/lib/types";
import { FileUp, Minus, Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

const LocationMap = dynamic(
  () => import("@/components/location-map").then((module) => module.LocationMap),
  { ssr: false, loading: () => <div className="h-56 animate-pulse rounded-xl bg-muted" /> },
);

const STEPS = ["Files", "Delivery", "Send"] as const;

function RequestWizard() {
  const search = useSearchParams();
  const initialService = (search.get("service") as ServiceCategory) || "Document Printing";
  const store = useStore();
  const router = useRouter();
  const existing = store.session.customerId ? store.customerById(store.session.customerId) : undefined;
  const lastDelivery = existing
    ? store.orders.find((order) => order.customerId === existing.id && order.delivery)?.delivery
    : undefined;

  const [step, setStep] = useState(0);
  const [presetId, setPresetId] = useState(presetForService(initialService).id);
  const [name, setName] = useState(existing?.name ?? "");
  const [mobile, setMobile] = useState(existing?.mobile ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [company, setCompany] = useState(existing?.company ?? "");
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const contactName = lastDelivery?.contactName ?? existing?.name ?? "";
  const contactMobile = lastDelivery?.mobile ?? existing?.mobile ?? "";
  const [address, setAddress] = useState(lastDelivery?.pin.address ?? "Cabuyao, Laguna");
  const [landmark, setLandmark] = useState(lastDelivery?.pin.landmark ?? "");
  const [morePlace, setMorePlace] = useState(false);
  const [building, setBuilding] = useState(lastDelivery?.pin.building ?? "");
  const [floor, setFloor] = useState(lastDelivery?.pin.floor ?? "");
  const [office, setOffice] = useState(lastDelivery?.pin.office ?? "");
  const [gate, setGate] = useState(lastDelivery?.pin.gate ?? "");
  const [instructions, setInstructions] = useState(lastDelivery?.pin.instructions ?? "");
  const [pin, setPin] = useState(lastDelivery?.pin ?? CABUYAO);
  const [pickupNote, setPickupNote] = useState("");

  const signedIn = Boolean(existing);
  const activePreset = PRINT_PRESETS.find((item) => item.id === presetId) ?? PRINT_PRESETS[0];

  const canNext = useMemo(() => {
    if (step === 0) return files.length > 0 && files.every((file) => file.spec.quantity > 0);
    if (step === 1) return fulfillment === "pickup" || Boolean(address);
    return signedIn || Boolean(name && (mobile || email));
  }, [step, files, fulfillment, address, signedIn, name, mobile, email]);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming: OrderFile[] = [];
    for (const file of Array.from(list)) {
      const id = uid("file");
      try {
        await saveUpload(id, file);
      } catch {
        toast.error(`Could not keep ${file.name} on this device`);
      }
      incoming.push({
        id,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        spec: { ...activePreset.spec },
      });
    }
    setFiles((current) => [...current, ...incoming]);
  }

  function applyPreset(id: string) {
    const preset = PRINT_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setFiles((current) => current.map((file) => ({ ...file, spec: { ...preset.spec } })));
  }

  function updateFile(id: string, patch: Partial<PrintSpec>) {
    setFiles((current) =>
      current.map((file) => (file.id === id ? { ...file, spec: { ...file.spec, ...patch } } : file)),
    );
  }

  function submit() {
    const customer = store.loginCustomer({
      name: name || existing?.name || "Walk-in customer",
      mobile: mobile || existing?.mobile || contactMobile || "",
      email: email || existing?.email || `${(mobile || "guest").replace(/\s/g, "")}@printogo.local`,
      company: company || existing?.company,
    });
    const order = store.createOrder({
      customerId: customer.id,
      files,
      fulfillment,
      delivery:
        fulfillment === "delivery"
          ? {
              contactName: contactName || customer.name,
              mobile: contactMobile || customer.mobile,
              pin: { ...pin, address, landmark, building, floor, office, gate, instructions },
            }
          : undefined,
      pickupNote: fulfillment === "pickup" ? pickupNote : undefined,
      priority: "normal",
    });
    toast.success(`Ticket ${order.ticket} sent`);
    router.push(`/ticket/${order.ticket}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="text-sm font-medium text-accent-foreground/80">Print request · about 1 minute</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Upload, choose a preset, send.</h1>
      {signedIn ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {existing?.name}. We skipped your details and reused your last drop-off when we have one.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No account needed to start. We’ll ask for a name only at the end.</p>
      )}

      <ol className="mt-6 mb-6 grid grid-cols-3 gap-2">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              className={`flex h-10 w-full items-center justify-center rounded-full text-sm font-medium ${
                index === step
                  ? "bg-primary text-primary-foreground"
                  : index < step
                    ? "bg-secondary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRINT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`rounded-full border px-3 py-2 text-left text-sm ${
                  presetId === preset.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40"
                }`}
              >
                <span className="font-medium">{preset.label}</span>
                <span className={`ml-2 ${presetId === preset.id ? "opacity-80" : "text-muted-foreground"}`}>{preset.hint}</span>
              </button>
            ))}
          </div>

          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-8 text-center">
            <FileUp className="mb-2 size-6 text-muted-foreground" />
            <p className="font-medium">Tap to add files</p>
            <p className="text-sm text-muted-foreground">PDF, Word, photos. We apply {activePreset.label} to every file.</p>
            <input type="file" multiple accept={ACCEPTED_FILES} className="sr-only" onChange={(event) => addFiles(event.target.files)} />
          </label>

          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="rounded-xl border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.spec.color} · {file.spec.paperSize}
                      {file.spec.customSize ? ` ${file.spec.customSize}` : ""} · {fileSize(file.size)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Copies</span>
                  <Button size="icon-xs" variant="outline" onClick={() => updateFile(file.id, { quantity: Math.max(1, file.spec.quantity - 1) })}>
                    <Minus />
                  </Button>
                  <span className="min-w-8 text-center font-semibold">{file.spec.quantity}</span>
                  <Button size="icon-xs" variant="outline" onClick={() => updateFile(file.id, { quantity: file.spec.quantity + 1 })}>
                    <Plus />
                  </Button>
                  {QTY_CHIPS.map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => updateFile(file.id, { quantity: qty })}
                      className={`rounded-full px-2.5 py-1 text-xs ${file.spec.quantity === qty ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {qty}
                    </button>
                  ))}
                  <button type="button" className="ml-auto text-xs underline-offset-4 hover:underline" onClick={() => setOpenFile(openFile === file.id ? null : file.id)}>
                    {openFile === file.id ? "Hide options" : "More options"}
                  </button>
                </div>
                {openFile === file.id ? <FileOptions file={file} onChange={(patch) => updateFile(file.id, patch)} /> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Where should we send it?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setFulfillment("delivery")}
                className={`rounded-xl border p-4 text-left ${fulfillment === "delivery" ? "border-primary bg-secondary" : ""}`}
              >
                <p className="font-medium">Deliver</p>
                <p className="text-sm text-muted-foreground">Pin the gate or office</p>
              </button>
              <button
                type="button"
                onClick={() => setFulfillment("pickup")}
                className={`rounded-xl border p-4 text-left ${fulfillment === "pickup" ? "border-primary bg-secondary" : ""}`}
              >
                <p className="font-medium">Pickup</p>
                <p className="text-sm text-muted-foreground">Cabuyao shop counter</p>
              </button>
            </div>
            {fulfillment === "delivery" ? (
              <div className="space-y-4">
                <LocationMap pin={pin} onPin={(lat, lng) => setPin({ lat, lng })} />
                <Field label="Address" value={address} onChange={setAddress} required />
                <Field label="Landmark" value={landmark} onChange={setLandmark} placeholder="Blue gate, near 7-Eleven" />
                <button type="button" className="text-sm underline-offset-4 hover:underline" onClick={() => setMorePlace((value) => !value)}>
                  {morePlace ? "Hide building details" : "Add building, floor, or gate"}
                </button>
                {morePlace ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Building" value={building} onChange={setBuilding} />
                    <Field label="Floor" value={floor} onChange={setFloor} />
                    <Field label="Office" value={office} onChange={setOffice} />
                    <Field label="Gate" value={gate} onChange={setGate} />
                    <div className="sm:col-span-2 space-y-2">
                      <Label>Driver note</Label>
                      <Textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Call on arrival" />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Field label="Pickup note" value={pickupNote} onChange={setPickupNote} placeholder="After 5 PM" />
            )}
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Send this request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {signedIn ? null : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Your name" value={name} onChange={setName} required />
                <Field label="Mobile" value={mobile} onChange={setMobile} inputMode="tel" />
                <Field label="Email" value={email} onChange={setEmail} />
                <Field label="Company" value={company} onChange={setCompany} />
              </div>
            )}
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="font-medium">{signedIn ? existing?.name : name || "Your request"}</p>
              <p className="text-muted-foreground">
                {fulfillment === "delivery" ? `Deliver to ${address}` : `Pickup${pickupNote ? ` · ${pickupNote}` : ""}`}
              </p>
            </div>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id} className="flex justify-between gap-3 rounded-lg border p-3">
                  <span>
                    <span className="font-medium">{file.name}</span>
                    <span className="block text-muted-foreground">
                      {file.spec.quantity} × {file.spec.paperSize} {file.spec.color}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground">The shop will send a quotation on this ticket. No payment yet.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button disabled={!canNext} onClick={() => setStep((value) => value + 1)}>
            Continue
          </Button>
        ) : (
          <Button disabled={!canNext} onClick={submit}>
            Send print request
          </Button>
        )}
      </div>
    </div>
  );
}

function FileOptions({ file, onChange }: { file: OrderFile; onChange: (patch: Partial<PrintSpec>) => void }) {
  return (
    <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2">
      <SelectField label="Service" value={file.spec.service} options={SERVICES.map((item) => item.key)} onChange={(value) => onChange({ service: value as ServiceCategory })} />
      <SelectField label="Size" value={file.spec.paperSize} options={PAPER_SIZES} onChange={(value) => onChange({ paperSize: value as PaperSize })} />
      {file.spec.paperSize === "Custom" ? <Field label="Custom size" value={file.spec.customSize ?? ""} onChange={(value) => onChange({ customSize: value })} /> : null}
      <SelectField label="Paper" value={file.spec.paperType} options={PAPER_TYPES} onChange={(value) => onChange({ paperType: value as PaperType })} />
      <SelectField label="Color" value={file.spec.color} options={COLOR_MODES} onChange={(value) => onChange({ color: value as ColorMode })} />
      <SelectField label="Sides" value={file.spec.sides} options={SIDES} onChange={(value) => onChange({ sides: value as Sides })} />
      <div className="sm:col-span-2 grid gap-2 sm:grid-cols-3">
        {FINISHING.map((option) => {
          const checked = file.spec.finishing.includes(option);
          return (
            <label key={option} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={checked}
                onCheckedChange={(value) =>
                  onChange({
                    finishing: value ? [...file.spec.finishing, option] : file.spec.finishing.filter((item) => item !== option),
                  })
                }
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  inputMode?: "tel" | "email" | "text";
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} inputMode={inputMode} />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Opening request…</p>}>
      <RequestWizard />
    </Suspense>
  );
}
