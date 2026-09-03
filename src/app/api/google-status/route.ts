import { isGoogleAuthConfigured } from "@/lib/staff";

export function GET() {
  return Response.json({ google: isGoogleAuthConfigured() });
}
