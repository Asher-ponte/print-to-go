import type {
  ColorMode,
  FinishingOption,
  OrderStatus,
  PaperSize,
  PaperType,
  PaymentStatus,
  Priority,
  ServiceCategory,
  Sides,
} from "./types";

export const BRAND = {
  name: "Print-to-Go",
  tagline: "Your Printing. Your Location. Our Delivery.",
  promise: "Upload. Print. Deliver.",
  city: "Cabuyao, Laguna",
};

export const ADMIN_PIN = "printogo";

export const SERVICES: {
  key: ServiceCategory;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { key: "Document Printing", label: "Document Printing", emoji: "\ud83d\udcc4", blurb: "Handbooks, reports, and office copies" },
  { key: "Photo Printing", label: "Photo Printing", emoji: "\ud83d\uddbc\ufe0f", blurb: "2R to 8R photo prints" },
  { key: "Flyers", label: "Flyers", emoji: "\ud83d\udcd1", blurb: "Promos, events, and handouts" },
  { key: "ID / Cards", label: "ID / Cards", emoji: "\ud83e\udeaa", blurb: "IDs and business cards" },
  { key: "Booklets", label: "Booklets", emoji: "\ud83d\udcda", blurb: "Bound multi-page sets" },
  { key: "Forms", label: "Forms", emoji: "\ud83d\udccb", blurb: "NCR and office forms" },
  { key: "Stickers", label: "Stickers", emoji: "\ud83c\udff7\ufe0f", blurb: "Labels and die-cut stickers" },
  { key: "Posters", label: "Posters", emoji: "\ud83c\udfa8", blurb: "A3 posters and signage" },
  { key: "Other", label: "Other Printing", emoji: "\ud83d\udda8\ufe0f", blurb: "Tell us what you need" },
];

export const PAPER_SIZES: PaperSize[] = ["A4", "A3", "Letter", "Legal", "Custom"];
export const PAPER_TYPES: PaperType[] = [
  "Bond Paper",
  "Matte",
  "Glossy",
  "Photo Paper",
  "Cardstock",
  "Sticker Paper",
  "Other",
];
export const COLOR_MODES: ColorMode[] = ["Black & White", "Colored"];
export const SIDES: Sides[] = ["Single-sided", "Double-sided"];
export const FINISHING: FinishingOption[] = [
  "Stapling",
  "Binding",
  "Spiral Binding",
  "Lamination",
  "Cutting",
  "Folding",
  "Packaging",
  "Mounting",
  "Other",
];

export const ACCEPTED_FILES =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.tif,.tiff,.ai,.psd,.zip";

export const CABUYAO = { lat: 14.2786, lng: 121.1236 };

export const STATUS_FLOW: OrderStatus[] = [
  "new",
  "quotation",
  "awaiting_confirmation",
  "confirmed",
  "paid",
  "printing",
  "finishing",
  "quality_check",
  "ready",
  "assigned",
  "out_for_delivery",
  "arrived",
  "delivered",
  "completed",
];

export const CUSTOMER_TRACKER: { status: OrderStatus; label: string }[] = [
  { status: "new", label: "Request Submitted" },
  { status: "quotation", label: "Quotation Prepared" },
  { status: "confirmed", label: "Customer Confirmed" },
  { status: "paid", label: "Payment Confirmed" },
  { status: "printing", label: "Printing" },
  { status: "quality_check", label: "Quality Check" },
  { status: "ready", label: "Ready for Delivery" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
  { status: "completed", label: "Completed" },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  quotation: "Quotation",
  awaiting_confirmation: "Awaiting Confirmation",
  changes_requested: "Changes Requested",
  confirmed: "Confirmed",
  paid: "Paid",
  printing: "Printing",
  finishing: "Finishing",
  quality_check: "Quality Check",
  ready: "Ready",
  assigned: "Assigned",
  out_for_delivery: "Out for Delivery",
  arrived: "Arrived",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  submitted: "Payment Submitted",
  verified: "Payment Verified",
  paid: "Paid",
  partial: "Partial Payment",
  cod: "COD",
  monthly: "Monthly Account",
  refunded: "Refunded",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

export const FILTER_STATUSES: OrderStatus[] = [
  "new",
  "quotation",
  "awaiting_confirmation",
  "confirmed",
  "paid",
  "printing",
  "quality_check",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
];

export const QC_ITEMS: { key: keyof import("./types").QCChecklist; label: string }[] = [
  { key: "correctFile", label: "Correct file" },
  { key: "correctQuantity", label: "Correct quantity" },
  { key: "correctPaper", label: "Correct paper" },
  { key: "correctColor", label: "Correct color" },
  { key: "correctSize", label: "Correct size" },
  { key: "correctFinishing", label: "Correct finishing" },
  { key: "noDefects", label: "No printing defects" },
  { key: "properPackaging", label: "Proper packaging" },
];
