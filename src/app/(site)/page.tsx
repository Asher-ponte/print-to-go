import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND, SERVICES } from "@/lib/constants";
import { CheckCircle2, MapPin, Ticket, Truck, Upload } from "lucide-react";
import Link from "next/link";

const steps = [
  { title: "Upload files", detail: "PDF, Word, photos, and print-ready artwork.", icon: Upload },
  { title: "Choose specs", detail: "Size, paper, color, copies, and finishing.", icon: CheckCircle2 },
  { title: "Pin your location", detail: "Drop a pin so delivery finds the exact gate.", icon: MapPin },
  { title: "Get a print ticket", detail: "Track quotation, printing, and delivery.", icon: Ticket },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.88_0.06_70),transparent_45%),radial-gradient(circle_at_bottom_left,oklch(0.9_0.03_250),transparent_40%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {BRAND.promise}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Your printing. Your location. Our delivery.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
              Print-to-Go is the print-order and delivery desk for offices and households
              in {BRAND.city}. Upload, specify, pin the drop-off, and follow one ticket
              from quotation to proof of delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/request">Start a Print Request</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/track">Track a ticket</Link>
              </Button>
            </div>
          </div>
          <Card className="self-center shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">How an order moves</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Print request",
                "Quotation",
                "Confirmation",
                "Printing",
                "Quality check",
                "Delivery or pickup",
                "Completed",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-semibold">What we print</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link key={service.key} href={`/request?service=${encodeURIComponent(service.key)}`}>
              <Card className="h-full transition hover:border-primary/40 hover:shadow-sm">
                <CardHeader>
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

      <section className="border-y bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-14 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="space-y-2">
              <step.icon className="size-5 text-primary" />
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <Card className="overflow-hidden">
          <CardContent className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Companies print with one account</h2>
              <p className="text-muted-foreground">
                Purchasing, HR, Safety, and Marketing can submit under the same company
                and settle on a monthly statement instead of paying every ticket.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/request">
                <Truck className="size-4" />
                Send a request
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
