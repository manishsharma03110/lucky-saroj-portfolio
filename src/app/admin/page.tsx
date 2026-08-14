import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminIndexPage() {
  const session = await auth();
  redirect(session?.user ? "/admin/dashboard" : "/admin/login");
}
