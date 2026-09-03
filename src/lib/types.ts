export type Fulfillment = "delivery" | "pickup";

export type Priority = "urgent" | "high" | "normal" | "low";

export type CustomerType = "individual" | "company" | "vip";

export type BillingType = "per_order" | "monthly";

export type PaperSize = "A4" | "A3" | "Letter" | "Legal" | "Custom";

export type PaperType =
  | "Bond Paper"
  | "Matte"
  | "Glossy"
  | "Photo Paper"
  | "Cardstock"
  | "Sticker Paper"
  | "Other";

export type ColorMode = "Black & White" | "Colored";

export type Sides = "Single-sided" | "Double-sided";

export type OrderStatus =
  | "new"
  | "quotation"
  | "awaiting_confirmation"
  | "changes_requested"
  | "confirmed"
  | "paid"
  | "printing"
  | "finishing"
  | "quality_check"
  | "ready"
  | "assigned"
  | "out_for_delivery"
  | "arrived"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "submitted"
  | "verified"
  | "paid"
  | "partial"
  | "cod"
  | "monthly"
  | "refunded";

export type FinishingOption =
  | "Stapling"
  | "Binding"
  | "Spiral Binding"
  | "Lamination"
  | "Cutting"
  | "Folding"
  | "Packaging"
  | "Mounting"
  | "Other";

export type ServiceCategory =
  | "Document Printing"
  | "Photo Printing"
  | "Flyers"
  | "ID / Cards"
  | "Booklets"
  | "Forms"
  | "Stickers"
  | "Posters"
  | "Other";

export interface GeoPin {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
  building?: string;
  floor?: string;
  office?: string;
  gate?: string;
  instructions?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  company?: string;
  type: CustomerType;
  billing: BillingType;
  address?: string;
  authorizedUsers?: string[];
  vip: boolean;
}

export interface PrintSpec {
  service: ServiceCategory;
  paperSize: PaperSize;
  customSize?: string;
  paperType: PaperType;
  color: ColorMode;
  sides: Sides;
  quantity: number;
  finishing: FinishingOption[];
}

export interface OrderFile {
  id: string;
  name: string;
  type: string;
  size: number;
  spec: PrintSpec;
}

export interface QuoteLine {
  id: string;
  description: string;
  amount: number;
}

export interface Quotation {
  lines: QuoteLine[];
  discount: number;
  promoCode?: string;
  note?: string;
  sentAt?: string;
}

export interface QCChecklist {
  correctFile: boolean;
  correctQuantity: boolean;
  correctPaper: boolean;
  correctColor: boolean;
  correctSize: boolean;
  correctFinishing: boolean;
  noDefects: boolean;
  properPackaging: boolean;
  passedAt?: string;
  inspector?: string;
}

export interface ProofOfDelivery {
  recipientName: string;
  deliveredAt: string;
  confirmation: boolean;
  signatureName?: string;
  photoNote?: string;
  remarks?: string;
}

export interface TimelineEvent {
  id: string;
  at: string;
  title: string;
  detail?: string;
}

export interface DeliveryInfo {
  contactName: string;
  mobile: string;
  pin: GeoPin;
}

export interface Order {
  id: string;
  ticket: string;
  createdAt: string;
  customerId: string;
  files: OrderFile[];
  fulfillment: Fulfillment;
  delivery?: DeliveryInfo;
  pickupNote?: string;
  specialInstructions?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  priority: Priority;
  quotation?: Quotation;
  amountPaid: number;
  qc?: QCChecklist;
  pod?: ProofOfDelivery;
  runId?: string;
  driver?: string;
  timeline: TimelineEvent[];
  changeRequest?: string;
}

export interface DeliveryRun {
  id: string;
  name: string;
  driver: string;
  createdAt: string;
  orderIds: string[];
  status: "planned" | "out" | "done";
}

export interface CatalogItem {
  id: string;
  category: ServiceCategory | "Finishing" | "Business Printing";
  name: string;
  description: string;
  unit: string;
  basePrice: number;
}

export interface PriceRule {
  id: string;
  name: string;
  kind: "print" | "finishing" | "delivery" | "rush" | "discount";
  unitPrice: number;
  minQty?: number;
  maxQty?: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  cities: string[];
}

export interface Promo {
  id: string;
  code: string;
  description: string;
  kind: "percent" | "fixed" | "free_delivery";
  value: number;
  active: boolean;
}

export interface Session {
  role: "guest" | "customer" | "admin";
  customerId?: string;
}

export interface AppState {
  session: Session;
  customers: Customer[];
  orders: Order[];
  runs: DeliveryRun[];
  catalog: CatalogItem[];
  priceRules: PriceRule[];
  zones: DeliveryZone[];
  promos: Promo[];
}
