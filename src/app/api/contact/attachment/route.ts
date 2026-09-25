import { consumePublicRequest } from "@/lib/auth/public-request-rate-limit";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getPortfolioMediaBlobToken } from "@/app/api/upload/blob-token";

export const runtime = "nodejs";
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "video/mp4"]);
function signatureMatches(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.length >= 8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((v, i) => bytes[i] === v);
  if (type === "video/mp4") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  return false;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES + 65536) return NextResponse.json({ error: "Attachment must be 4 MB or smaller." }, { status: 413 });
  try {
    if (!await consumePublicRequest(request.headers, "attachment")) return NextResponse.json({ error: "Too many upload attempts. Please try again later." }, { status: 429 });
  } catch { return NextResponse.json({ error: "Upload temporarily unavailable." }, { status: 503 }); }
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Attachment is required." }, { status: 400 });
    if (!ALLOWED.has(file.type) || file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Only JPG, PNG or MP4 files up to 4 MB are allowed." }, { status: 400 });
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

