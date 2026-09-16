import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getPortfolioMediaBlobToken } from "@/app/api/upload/blob-token";

export const runtime = "nodejs";
const RETENTION_MS = 60 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  if (request.headers.get("user-agent") !== "vercel-cron/1.0") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const token = getPortfolioMediaBlobToken();
  const cutoff = Date.now() - RETENTION_MS;
  let cursor: string | undefined;
  let deleted = 0;
  do {
    const page = await list({ prefix: "contact-attachments/", cursor, limit: 1000, token });
    const expired = page.blobs.filter((blob) => new Date(blob.uploadedAt).getTime() < cutoff);
    if (expired.length) { await del(expired.map((blob) => blob.url), { token }); deleted += expired.length; }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return NextResponse.json({ deleted, retentionDays: 60 });
}
