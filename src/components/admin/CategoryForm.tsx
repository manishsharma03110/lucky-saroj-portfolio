"use client";

import { useActionState, useState } from "react";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldError } from "@/components/admin/FormParts";
import { createCategory } from "@/lib/actions/categories";
import type { ActionState } from "@/lib/actions/portfolio";

const initialState: ActionState = { status: "idle" };

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <FormCard title="Add Category">
      <form
        action={(fd) => {
          formAction(fd);
          setName("");
          setSlug("");
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            name="name"
            placeholder="e.g. Podcast"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(slugify(e.target.value));
            }}
            required
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="cat-slug">Slug</Label>
          <Input id="cat-slug" name="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required />
        </div>
        {state.status === "error" && state.message && <p className="text-sm text-red-600">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Adding..." : "Add Category"}
        </Button>
      </form>
    </FormCard>
  );
}
