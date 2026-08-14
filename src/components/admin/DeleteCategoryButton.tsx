"use client";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCategory } from "@/lib/actions/categories";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteButton confirmText={`Delete category "${name}"? Projects using it will be unassigned.`} onDelete={() => deleteCategory(id)} />
  );
}
