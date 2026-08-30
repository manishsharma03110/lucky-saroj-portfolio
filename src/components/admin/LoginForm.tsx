"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSafeAdminCallbackUrl } from "@/lib/auth/safe-callback-url";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }

      const callbackUrl = getSafeAdminCallbackUrl(searchParams.get("callbackUrl"));
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="email">Email or Username</Label>
        <Input id="email" name="email" type="text" placeholder="Enter your email or username" required />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input id="password" name="password" type="password" placeholder="Enter your password" required />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Login"}
      </Button>
    </form>
  );
}
