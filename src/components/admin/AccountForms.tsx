"use client";
import { useActionState } from "react";
import { manageAdmin, changeOwnPassword, type AccountState } from "@/lib/actions/admin-accounts";
import { ROLE_KEYS } from "@/lib/auth/permissions";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const idle: AccountState = { status: "idle" };
function Feedback({ state }: { state: AccountState }) {
  return state.message ? <p role={state.status === "error" ? "alert" : "status"} className="text-sm">{state.message}</p> : null;
}
export function PasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, idle);
  return <form action={action} className="grid max-w-xl gap-4">
    <div><Label htmlFor="currentPassword">Current password</Label><Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required /></div>
    <div><Label htmlFor="newPassword">New password</Label><Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={72} required /></div>
    <div><Label htmlFor="confirmPassword">Confirm new password</Label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={72} required /></div>
    <p className="text-sm">Changing your password signs out all existing sessions, including this one.</p>
    <Feedback state={state}/><Button type="submit" disabled={pending}>{pending ? "Saving…" : "Change password"}</Button>
  </form>;
}
export function CreateAdminForm() {
  const [state, action, pending] = useActionState(manageAdmin, idle);
  return <form action={action} className="grid max-w-xl gap-4">
    <input type="hidden" name="operation" value="create"/>
    <div><Label htmlFor="adminName">Name</Label><Input id="adminName" name="name" maxLength={120} required/></div>
    <div><Label htmlFor="adminEmail">Email</Label><Input id="adminEmail" name="email" type="email" autoComplete="off" required/></div>
    <div><Label htmlFor="adminPassword">Initial password</Label><Input id="adminPassword" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required/></div>
    <div><Label htmlFor="adminRole">Role</Label><select id="adminRole" name="role" defaultValue="EDITOR" className="w-full rounded-md border border-white/20 bg-[var(--surface-primary)] p-3">{ROLE_KEYS.map(role=><option key={role}>{role}</option>)}</select></div>
    <Feedback state={state}/><Button type="submit" disabled={pending}>{pending ? "Creating…" : "Add administrator"}</Button>
  </form>;
}
export function AdminControls({ id, role, active, self }: { id: string; role: string; active: boolean; self: boolean }) {
  const [state, action, pending] = useActionState(manageAdmin, idle);
  return <form action={action} className="flex flex-wrap items-center gap-3">
    <input type="hidden" name="targetAdminId" value={id}/>
    <select name="role" aria-label="Assign role" defaultValue={role} disabled={pending || self} className="rounded border border-white/20 bg-[var(--surface-primary)] p-2">{ROLE_KEYS.map(key=><option key={key}>{key}</option>)}</select>
    <Button type="submit" name="operation" value="role" disabled={pending || self}>Save role</Button>
    <input type="hidden" name="active" value={String(!active)}/>
    <Button type="submit" name="operation" value="active" disabled={pending || self}>{active ? "Disable" : "Enable"}</Button>
    <label className="text-sm"><input type="checkbox" name="confirmDelete" value="yes" disabled={pending || self}/> Confirm deletion</label>
    <Button type="submit" name="operation" value="delete" disabled={pending || self}>Delete account</Button>
    <Feedback state={state}/>
  </form>;
}
