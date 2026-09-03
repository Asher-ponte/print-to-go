import { Badge } from "@/components/ui/badge";
import { PAYMENT_LABEL, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/constants";
import type { OrderStatus, PaymentStatus, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusClass: Partial<Record<OrderStatus, string>> = {
  new: "bg-sky-100 text-sky-800 border-sky-200",
  quotation: "bg-violet-100 text-violet-800 border-violet-200",
  awaiting_confirmation: "bg-indigo-100 text-indigo-800 border-indigo-200",
  changes_requested: "bg-amber-100 text-amber-900 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  printing: "bg-orange-100 text-orange-800 border-orange-200",
  finishing: "bg-orange-100 text-orange-900 border-orange-200",
  quality_check: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  ready: "bg-teal-100 text-teal-800 border-teal-200",
  assigned: "bg-cyan-100 text-cyan-800 border-cyan-200",
  out_for_delivery: "bg-cyan-100 text-cyan-900 border-cyan-200",
  arrived: "bg-cyan-100 text-cyan-900 border-cyan-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-stone-100 text-stone-700 border-stone-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

const darkStatus: Partial<Record<OrderStatus, string>> = {
  new: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  quotation: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  awaiting_confirmation: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  changes_requested: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  confirmed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  printing: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  finishing: "bg-orange-500/15 text-orange-200 border-orange-500/30",
  quality_check: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  ready: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  assigned: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  out_for_delivery: "bg-cyan-500/15 text-cyan-200 border-cyan-500/30",
  arrived: "bg-cyan-500/15 text-cyan-200 border-cyan-500/30",
  delivered: "bg-green-500/15 text-green-300 border-green-500/30",
  completed: "bg-white/10 text-zinc-300 border-white/10",
  cancelled: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function StatusBadge({ status, dark }: { status: OrderStatus; dark?: boolean }) {
  return (
    <Badge variant="outline" className={cn("font-medium", dark ? darkStatus[status] : statusClass[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function PaymentBadge({ status, dark }: { status: PaymentStatus; dark?: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        dark ? "border-white/15 text-zinc-200" : "border-border text-foreground",
      )}
    >
      {PAYMENT_LABEL[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority, dark }: { priority: Priority; dark?: boolean }) {
  const map = {
    urgent: dark ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-red-100 text-red-800 border-red-200",
    high: dark ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : "bg-orange-100 text-orange-800 border-orange-200",
    normal: dark ? "bg-amber-500/15 text-amber-200 border-amber-500/30" : "bg-amber-50 text-amber-800 border-amber-200",
    low: dark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  const icon = { urgent: "\ud83d\udd34", high: "\ud83d\udfe0", normal: "\ud83d\udfe1", low: "\ud83d\udfe2" };
  return (
    <Badge variant="outline" className={cn("font-medium", map[priority])}>
      {icon[priority]} {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
