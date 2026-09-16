import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getPortfolioMediaBlobToken } from "@/app/api/upload/blob-token";

export const runtime = "nodejs";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "video/mp4"]);
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}
function rateLimited(key: string) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + WINDOW_MS }); return false; }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}
function signatureMatches(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.length >= 8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((v, i) => bytes[i] === v);
  if (type === "video/mp4") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  return false;
}

export async function POST(request: Request) {
  if (rateLimited(clientKey(request))) return NextResponse.json({ error: "Too many upload attempts. Please try again later." }, { status: 429 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Attachment is required." }, { status: 400 });
    if (!ALLOWED.has(file.type) || file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Only JPG, PNG or MP4 files up to 10 MB are allowed." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!signatureMatches(file.type, buffer)) return NextResponse.json({ error: "Attachment content does not match its declared file type." }, { status: 400 });
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "mp4";
    const pathname = `contact-attachments/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
    const blob = await put(pathname, buffer, { access: "public", contentType: file.type, addRandomSuffix: false, allowOverwrite: false, token: getPortfolioMediaBlobToken() });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname, expiresInDays: 60 }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Attachment upload could not be completed." }, { status: 400 });
  }
}
