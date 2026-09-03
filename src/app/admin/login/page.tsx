"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_PIN } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { loginAdmin } = useStore();
  const router = useRouter();
  const [pin, setPin] = useState("");

  return (
    <div className="flex min-h-full items-center justify-center bg-zinc-950 px-4 py-16 text-zinc-50">
      <Card className="w-full max-w-md border-white/10 bg-zinc-900 text-zinc-50">
        <CardHeader>
          <CardTitle>Staff dashboard</CardTitle>
          <CardDescription className="text-zinc-400">
            Demo access PIN: <span className="font-mono text-zinc-200">{ADMIN_PIN}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Staff PIN</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className="bg-zinc-950"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!loginAdmin(pin)) {
                toast.error("Incorrect PIN");
                return;
              }
              toast.success("Welcome back");
              router.push("/admin");
            }}
          >
            Open dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
