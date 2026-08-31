import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MessageListItem } from "@/components/admin/MessageListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  await requirePermission("messages.read").catch((error) => { if (error instanceof AuthorizationError) notFound(); throw error; });
  const messages = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt));

  return (
    <div>
      <AdminPageHeader title="Messages" description={`${messages.length} message${messages.length === 1 ? "" : "s"} from your contact form`} />

      <div className="space-y-3">
        {messages.map((m) => (
          <MessageListItem key={m.id} message={m} />
        ))}
        {messages.length === 0 && (
          <p className="rounded-2xl border border-[var(--color-line)] bg-white px-5 py-8 text-center text-sm text-[var(--color-muted)]">
            No messages yet.
          </p>
        )}
      </div>
    </div>
  );
}
