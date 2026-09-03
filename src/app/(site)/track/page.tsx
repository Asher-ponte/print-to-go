"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const DEMOS = ["PTG-20260903-001", "PTG-20260903-003"];

export default function TrackPage() {
  const { orderByTicket } = useStore();
  const router = useRouter();
  const [ticket, setTicket] = useState("");

  function open(value = ticket) {
    const order = orderByTicket(value);
    if (!order) {
      toast.error("No ticket matches that number");
      return;
    }
    router.push(`/ticket/${order.ticket}`);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Track a ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              open();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="ticket">Paste your ticket number</Label>
              <Input
                id="ticket"
                value={ticket}
                autoFocus
                autoCapitalize="characters"
                placeholder="PTG-20260903-001"
                onChange={(event) => setTicket(event.target.value)}
              />
            </div>
            <Button className="w-full" type="submit">
              View progress
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {DEMOS.map((demo) => (
              <button
                key={demo}
                type="button"
                onClick={() => open(demo)}
                className="rounded-full bg-muted px-3 py-1.5 font-mono text-xs hover:bg-secondary"
              >
                {demo}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
