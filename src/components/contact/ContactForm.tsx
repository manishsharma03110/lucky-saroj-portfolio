"use client";

import { useActionState } from "react";
import { Label, Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { submitContactForm, type ContactFormState } from "@/lib/actions/contact";
import { CheckCircle2 } from "lucide-react";

const initialState: ContactFormState = { status: "idle" };

const BUDGET_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 500);

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-white p-10 text-center">
        <CheckCircle2 className="text-[var(--color-accent)]" size={32} />
        <p className="font-display text-lg font-semibold text-[var(--color-ink)]">
          Message sent!
        </p>
        <p className="text-sm text-[var(--color-muted)]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-[var(--color-line)] bg-white p-8">
      <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Send Me a Message</h2>

      <div>
        <Label htmlFor="name">Your Name</Label>
        <Input id="name" name="name" placeholder="Enter your name" required maxLength={120} />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="Enter your email" required />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" required maxLength={20} />
        {state.fieldErrors?.phone && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="projectType">Project Type</Label>
          <Select id="projectType" name="projectType" defaultValue="">
            <option value="" disabled>
              Select project type
            </option>
            <option value="youtube">YouTube Video</option>
            <option value="commercial">Commercial</option>
            <option value="reels">Reels / Short Form</option>
            <option value="cinematic">Cinematic / Documentary</option>
            <option value="motion-graphics">Motion Graphics</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="budgetRange">Budget Range</Label>
          <Select id="budgetRange" name="budgetRange" defaultValue="">
            <option value="" disabled>
              Select your budget
            </option>
            {BUDGET_OPTIONS.map((v) => (
              <option key={v} value={String(v)}>
                ₹{v.toLocaleString("en-IN")}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell me about your project..."
          required
          maxLength={4000}
        />
        {state.fieldErrors?.message && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.message}</p>
        )}
      </div>

      {state.status === "error" && state.message && !state.fieldErrors && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}