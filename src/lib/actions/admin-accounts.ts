"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin";
import { requirePermission } from "@/lib/auth/authorization";
import { adminRoleService } from "@/lib/auth/admin-role-service";
import { adminTargetSchema, changePasswordSchema, createAdminSchema } from "@/lib/auth/account-validation";
import { isRoleKey } from "@/lib/auth/permissions";

export type AccountState = { status: "idle" | "success" | "error"; message?: string };
async function actorSession() {
  const admin = await requireAuthenticatedAdmin();
  const session = await auth();
  const version = session?.user?.sessionVersion;
  if (session?.user?.id !== admin.id || !Number.isSafeInteger(version) || !version) throw new Error("Unauthorized");
  return { actorId: admin.id, actorSessionVersion: version };
}
export async function manageAdmin(_previous: AccountState, form: FormData): Promise<AccountState> {
  try {
    await requirePermission("admin_users.manage");
    const actor = await actorSession();
    const operation = form.get("operation");
    if (operation === "create") {
      const parsed = createAdminSchema.safeParse(Object.fromEntries(form));
      if (!parsed.success) return { status: "error", message: "Enter a name, valid email, role and a password of 12–72 UTF-8 bytes." };
      await adminRoleService.createAdmin({ ...actor, ...parsed.data });
    } else {
      const id = adminTargetSchema.parse(form.get("targetAdminId"));
      if (operation === "role") {
        const role = form.get("role");
        if (!isRoleKey(role)) throw new Error("Invalid role");
        await adminRoleService.assignRole({ ...actor, targetAdminId: id, role });
      } else if (operation === "active") {
        const active = form.get("active");
        if (active !== "true" && active !== "false") throw new Error("Invalid state");
        await adminRoleService.setActive({ ...actor, targetAdminId: id, active: active === "true" });
      } else if (operation === "delete") {
        if (form.get("confirmDelete") !== "yes") return { status: "error", message: "Confirm account deletion first." };
        await adminRoleService.deleteAdmin({ ...actor, targetAdminId: id });
      } else throw new Error("Invalid operation");
    }
  } catch {
    return { status: "error", message: "Change rejected. Check permissions, duplicate email, and self/last-super-admin restrictions." };
  }
  revalidatePath("/admin/users"); revalidatePath("/admin/activity"); revalidatePath("/admin/security");
  return { status: "success", message: "Account updated." };
}
export async function changeOwnPassword(_previous: AccountState, form: FormData): Promise<AccountState> {
  try {
    const actor = await actorSession();
    const parsed = changePasswordSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", message: "Use matching passwords of 12–72 UTF-8 bytes." };
    await adminRoleService.changeOwnPassword({ ...actor, ...parsed.data });
  } catch {
    return { status: "error", message: "Password change rejected. Check your current password and sign-in session." };
  }
  redirect("/admin/login?passwordChanged=1");
}
