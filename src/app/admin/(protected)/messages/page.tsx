import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MessageListItem } from "@/components/admin/MessageListItem";
import { requirePermission } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization-core";
import contentStyles from "@/components/admin/AdminContent.module.css";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  await requirePermission("messages.read").catch((error) => {
    if (error instanceof AuthorizationError) notFound();
    throw error;
  });

  const messages = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Communication"
        title="Messages"
        description={`${messages.length} message${messages.length === 1 ? "" : "s"} from your contact form`}
      />

      <div className={contentStyles.listStack}>
        {messages.map((message) => (
          <MessageListItem key={message.id} message={message} />
        ))}
        {messages.length === 0 && (
          <div className={contentStyles.emptyState}>No messages yet. New contact enquiries will appear here.</div>
        )}
      </div>
    </div>
  );
}
