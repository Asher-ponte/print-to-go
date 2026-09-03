"use client";

import { GoogleSessionBridge } from "@/components/google-session-bridge";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/lib/store";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>
        <GoogleSessionBridge />
        <TooltipProvider>
          {children}
          <Toaster position="top-center" />
        </TooltipProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
