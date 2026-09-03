import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND, PRINT_PRESETS, SERVICES } from "@/lib/constants";
import { MapPin, Ticket, Upload } from "lucide-react";
import Link from "next/link";

const flow = [
  { title: "Upload", detail: "Add the file. We apply a print preset.", icon: Upload },
  { title: "Where", detail: "Deliver to a pin or pick up at the shop.", icon: MapPin },
  { title: "Send", detail: "Get a ticket and approve the quotation.", icon: Ticket },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.88_0.06_70),transparent_45%),radial-gradient(circle_at_bottom_left,oklch(0.9_0.03_250),transparent_40%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{BRAND.city}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Print now. We’ll deliver it.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Three short steps. No long form. Upload a file, pick a preset, send the ticket.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/request">Print now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/track">Track a ticket</Link>
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {PRINT_PRESETS.map((preset) => (
              <Link
                key={preset.id}
                href={`/request?service=${encodeURIComponent(preset.spec.service)}`}
                className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary/40"
              >
                {preset.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          {flow.map((step, index) => (
            <div key={step.title} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h2 className="font-semibold">{step.title}</h2>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="mb-5 text-2xl font-semibold">What we print</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link key={service.key} href={`/request?service=${encodeURIComponent(service.key)}`}>
              <Card className="h-full transition hover:border-primary/40 hover:shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span aria-hidden>{service.emoji}</span>
                    {service.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{service.blurb}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
