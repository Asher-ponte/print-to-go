"use client";

import { GoogleSetupHint, GoogleSignInButton } from "@/components/google-sign-in";
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
            Sign in with Google. YCH accounts open the operations desk. Shop PIN remains for the demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleSignInButton next="/admin" label="Sign in with Google" />
          <GoogleSetupHint />
          <div className="relative py-2 text-center text-xs text-zinc-500">
            <span className="bg-zinc-900 px-2">or shop PIN</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">Staff PIN</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className="bg-zinc-950"
              placeholder={ADMIN_PIN}
            />
          </div>
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              if (!loginAdmin(pin)) {
                toast.error("Incorrect PIN");
                return;
              }
              toast.success("Welcome back");
              router.push("/admin");
            }}
          >
            Open with PIN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
