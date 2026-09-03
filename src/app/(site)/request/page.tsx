"use client";

import { LocationMap } from "@/components/location-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  SERVICES,
  SIDES,
} from "@/lib/constants";
import { saveUpload } from "@/lib/files";
import { fileSize, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type {
  ColorMode,
  FinishingOption,
  Fulfillment,
  OrderFile,
  PaperSize,
  PaperType,
  Priority,
  ServiceCategory,
  Sides,
} from "@/lib/types";
import { FileUp, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

const steps = ["Customer", "Files", "Specifications", "Delivery", "Review"];

function defaultSpec(service: ServiceCategory) {
  return {
    service,
    paperSize: "A4" as PaperSize,
    paperType: "Bond Paper" as PaperType,
    color: "Colored" as ColorMode,
    sides: "Single-sided" as Sides,
    quantity: 1,
    finishing: [] as FinishingOption[],
  };
}

function RequestWizard() {
  const search = useSearchParams();
  const initialService = (search.get("service") as ServiceCategory) || "Document Printing";
  const store = useStore();
  const router = useRouter();
  const existing = store.session.customerId ? store.customerById(store.session.customerId) : undefined;

  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing?.name ?? "");
  const [mobile, setMobile] = useState(existing?.mobile ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [company, setCompany] = useState(existing?.company ?? "");
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [contactName, setContactName] = useState(existing?.name ?? "");
  const [contactMobile, setContactMobile] = useState(existing?.mobile ?? "");
  const [address, setAddress] = useState("Cabuyao, Laguna");
  const [landmark, setLandmark] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [office, setOffice] = useState("");
  const [gate, setGate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pin, setPin] = useState(CABUYAO);
  const [priority, setPriority] = useState<Priority>("normal");
  const [special, setSpecial] = useState("");
  const [pickupNote, setPickupNote] = useState("");

  const canNext = useMemo(() => {
    if (step === 0) return name && mobile && email;
    if (step === 1) return files.length > 0;
    if (step === 2) return files.every((file) => file.spec.quantity > 0);
    if (step === 3) return fulfillment === "pickup" || (address && contactName && contactMobile);
    return true;
  }, [step, name, mobile, email, files, fulfillment, address, contactName, contactMobile]);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming: OrderFile[] = [];
    for (const file of Array.from(list)) {
      const id = uid("file");
      try {
        await saveUpload(id, file);
      } catch {
        toast.error(`Could not keep ${file.name} on this device for staff printing`);
      }
      incoming.push({
        id,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        spec: defaultSpec(initialService),
      });
    }
    setFiles((current) => [...current, ...incoming]);
  }

  function updateFile(id: string, patch: Partial<OrderFile["spec"]>) {
    setFiles((current) =>
      current.map((file) => (file.id === id ? { ...file, spec: { ...file.spec, ...patch } } : file)),
    );
  }

  function submit() {
    const customer = store.loginCustomer({ name, mobile, email, company: company || undefined });
    const order = store.createOrder({
      customerId: customer.id,
      files,
      fulfillment,
      delivery:
        fulfillment === "delivery"
          ? {
              contactName,
              mobile: contactMobile,
              pin: {
                ...pin,
                address,
                landmark,
                building,
                floor,
                office,
                gate,
                instructions,
              },
            }
          : undefined,
      pickupNote: fulfillment === "pickup" ? pickupNote : undefined,
      specialInstructions: special || undefined,
      priority,
    });
    toast.success(`Ticket ${order.ticket} created`);
    router.push(`/ticket/${order.ticket}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <p className="text-sm font-medium text-muted-foreground">Create print request</p>
      <h1 className="mt-1 text-3xl font-semibold">Upload. Specify. Pin. Submit.</h1>
      <div className="mt-6 mb-8 flex gap-2 overflow-auto">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => index < step && setStep(index)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              index === step
                ? "bg-primary text-primary-foreground"
                : index < step
                  ? "bg-secondary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Customer information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer name" value={name} onChange={setName} required />
            <Field label="Mobile number" value={mobile} onChange={setMobile} required />
            <Field label="Email" value={email} onChange={setEmail} required />
            <Field label="Company / organization" value={company} onChange={setCompany} />
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
              <FileUp className="mb-2 size-6 text-muted-foreground" />
              <p className="font-medium">Drop PDF, Word, images, or other print files</p>
              <p className="text-sm text-muted-foreground">
                Multiple files can ride on one ticket. Files stay on this computer so staff can download and print them.
              </p>
              <input
                type="file"
                multiple
                accept={ACCEPTED_FILES}
                className="sr-only"
                onChange={(event) => addFiles(event.target.files)}
              />
            </label>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-muted-foreground">{fileSize(file.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFiles((c) => c.filter((f) => f.id !== file.id))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          {files.map((file) => (
            <Card key={file.id}>
              <CardHeader>
                <CardTitle className="text-base">{file.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Service"
                  value={file.spec.service}
                  options={SERVICES.map((s) => s.key)}
                  onChange={(value) => updateFile(file.id, { service: value as ServiceCategory })}
                />
                <SelectField
                  label="Paper size"
                  value={file.spec.paperSize}
                  options={PAPER_SIZES}
                  onChange={(value) => updateFile(file.id, { paperSize: value as PaperSize })}
                />
                {file.spec.paperSize === "Custom" ? (
                  <Field
                    label="Custom size"
                    value={file.spec.customSize ?? ""}
                    onChange={(value) => updateFile(file.id, { customSize: value })}
                  />
                ) : null}
                <SelectField
                  label="Paper type"
                  value={file.spec.paperType}
                  options={PAPER_TYPES}
                  onChange={(value) => updateFile(file.id, { paperType: value as PaperType })}
                />
                <SelectField
                  label="Color"
                  value={file.spec.color}
                  options={COLOR_MODES}
                  onChange={(value) => updateFile(file.id, { color: value as ColorMode })}
                />
                <SelectField
                  label="Printing"
                  value={file.spec.sides}
                  options={SIDES}
                  onChange={(value) => updateFile(file.id, { sides: value as Sides })}
                />
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={file.spec.quantity}
                    onChange={(event) => updateFile(file.id, { quantity: Number(event.target.value) })}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Finishing</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {FINISHING.map((option) => {
                      const checked = file.spec.finishing.includes(option);
                      return (
                        <label key={option} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              updateFile(file.id, {
                                finishing: value
                                  ? [...file.spec.finishing, option]
                                  : file.spec.finishing.filter((item) => item !== option),
                              })
                            }
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle>Delivery or pickup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RadioGroup value={fulfillment} onValueChange={(value) => setFulfillment(value as Fulfillment)} className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border p-4">
                <RadioGroupItem value="delivery" />
                <span>🚚 Delivery to a pinned location</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border p-4">
                <RadioGroupItem value="pickup" />
                <span>🏪 Pickup at the shop</span>
              </label>
            </RadioGroup>
            {fulfillment === "delivery" ? (
              <div className="grid gap-4">
                <LocationMap pin={pin} onPin={(lat, lng) => setPin({ lat, lng })} />
                <p className="text-sm text-muted-foreground">
                  Click the map to drop your pin. Default view is Cabuyao, Laguna.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact person" value={contactName} onChange={setContactName} />
                  <Field label="Mobile number" value={contactMobile} onChange={setContactMobile} />
                  <Field label="Delivery address" value={address} onChange={setAddress} />
                  <Field label="Landmark" value={landmark} onChange={setLandmark} />
                  <Field label="Building" value={building} onChange={setBuilding} />
                  <Field label="Floor" value={floor} onChange={setFloor} />
                  <Field label="Office number" value={office} onChange={setOffice} />
                  <Field label="Gate" value={gate} onChange={setGate} />
                </div>
                <div className="space-y-2">
                  <Label>Delivery instructions</Label>
                  <Textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} />
                </div>
              </div>
            ) : (
              <Field label="Pickup note" value={pickupNote} onChange={setPickupNote} />
            )}
            <SelectField
              label="Priority"
              value={priority}
              options={["normal", "high", "urgent", "low"]}
              onChange={(value) => setPriority(value as Priority)}
            />
            <div className="space-y-2">
              <Label>Special instructions</Label>
              <Textarea value={special} onChange={(event) => setSpecial(event.target.value)} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card>
          <CardHeader>
            <CardTitle>Review request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>{name}</strong> · {mobile} · {email}
              {company ? ` · ${company}` : ""}
            </p>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id} className="rounded-lg border p-3">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-muted-foreground">
                    {file.spec.paperSize} · {file.spec.color} · {file.spec.paperType} · {file.spec.quantity} copies
                    {file.spec.finishing.length ? ` · ${file.spec.finishing.join(", ")}` : ""}
                  </p>
                </li>
              ))}
            </ul>
            <p>
              {fulfillment === "delivery"
                ? `Delivery to ${address}${landmark ? ` · ${landmark}` : ""}`
                : `Pickup${pickupNote ? ` · ${pickupNote}` : ""}`}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button onClick={submit}>Submit print request</Button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} required={required} />
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
    <Suspense>
      <RequestWizard />
    </Suspense>
  );
}
