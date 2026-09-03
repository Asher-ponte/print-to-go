"use client";

import { GoogleSetupHint, GoogleSignInButton } from "@/components/google-sign-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

function DemoSignIn({
  name,
  mobile,
  email,
  onName,
  onMobile,
  onEmail,
  onSubmit,
}: {
  name: string;
  mobile: string;
  email: string;
  onName: (value: string) => void;
  onMobile: (value: string) => void;
  onEmail: (value: string) => void;
  onSubmit: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button type="button" variant="ghost" className="w-full" onClick={() => setOpen(true)}>
        Use demo account instead
      </Button>
    );
  }
  return (
    <div className="space-y-3 border-t pt-3">
      <p className="text-xs text-muted-foreground">Demo company: ABC Manufacturing</p>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(event) => onName(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Mobile</Label>
        <Input value={mobile} inputMode="tel" onChange={(event) => onMobile(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={email} onChange={(event) => onEmail(event.target.value)} />
      </div>
      <Button className="w-full" variant="secondary" onClick={onSubmit}>
        View demo tickets
      </Button>
    </div>
  );
}

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
            Sign in with Google, then print in three steps. Demo login is still here if you need it.
          </p>
          <GoogleSignInButton next="/account" label="Continue with Google" />
          <GoogleSetupHint />
          <DemoSignIn
            name={name}
            mobile={mobile}
            email={email}
            onName={setName}
            onMobile={setMobile}
            onEmail={setEmail}
            onSubmit={() => {
              store.loginCustomer({ name, mobile, email });
              router.push("/account");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
