import { CUSTOMER_TRACKER } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const rank: Record<string, number> = Object.fromEntries(
  CUSTOMER_TRACKER.map((step, index) => [step.status, index]),
);

function currentIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  if (status === "changes_requested") return rank.quotation;
  if (status === "awaiting_confirmation") return rank.quotation;
  if (status === "finishing") return rank.printing;
  if (status === "assigned" || status === "arrived") return rank.out_for_delivery;
  return rank[status] ?? 0;
}

export function ProgressTracker({ status }: { status: OrderStatus }) {
  const current = currentIndex(status);
  return (
    <ol className="space-y-0">
      {CUSTOMER_TRACKER.map((step, index) => {
        const done = current > index || status === "completed";
        const active = current === index && status !== "completed";
        return (
          <li key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                  done && "border-emerald-600 bg-emerald-600 text-white",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : index + 1}
              </div>
              {index < CUSTOMER_TRACKER.length - 1 ? (
                <div className={cn("my-1 w-px flex-1 min-h-5", done ? "bg-emerald-600" : "bg-border")} />
              ) : null}
            </div>
            <div className={cn("pb-4 text-sm", active && "font-semibold text-foreground", done && "text-foreground", !done && !active && "text-muted-foreground")}>
              {step.label}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
