import { BRAND } from "@/lib/constants";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{BRAND.name}</p>
          <p className="text-sm text-muted-foreground">{BRAND.tagline}</p>
        </div>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <Link href="/request">Print request</Link>
          <Link href="/track">Track ticket</Link>
          <Link href="/admin/login">Staff dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
