"use client";

import { GoogleSetupHint, GoogleSignInButton } from "@/components/google-sign-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomerLoginPage() {
  const store = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("purchasing@abc-mfg.ph");
  const [mobile, setMobile] = useState("09171234567");
  const [name, setName] = useState("Liza Mercado");

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use your Google account to view tickets and place print requests. Demo company login is still available.
          </p>
          <GoogleSignInButton next="/account" label="Continue with Google" />
          <GoogleSetupHint />
          <div className="relative py-1 text-center text-xs text-muted-foreground">or demo account</div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Mobile</Label>
            <Input value={mobile} onChange={(event) => setMobile(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              store.loginCustomer({ name, mobile, email });
              router.push("/account");
            }}
          >
            View demo tickets
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
