import { requireAuthenticatedAdmin } from "@/lib/auth/admin";
import { PasswordForm } from "@/components/admin/AccountForms";
export default async function AccountPage() {
  const admin = await requireAuthenticatedAdmin();
  return <div className="space-y-6"><h1 className="text-3xl font-semibold">My account</h1><p>{admin.email}</p><PasswordForm/></div>;
}
