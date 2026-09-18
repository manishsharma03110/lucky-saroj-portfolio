import { createHash, randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { compressCmsImage, IMAGE_TARGET_MAX_BYTES } from "@/lib/media/image-compression";
import { getPortfolioMediaBlobToken } from "../../upload/blob-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLD_HERO_URL = "https://5ifwuyvmenhxqphx.public.blob.vercel-storage.com/cms-media/6b1506cc-cedb-4792-b2a7-0a0d1e4bd254/image";
const ONE_TIME_KEY_HASH = "cd661054c56fc934a24cb48d97836a6f6e36fa562bd3da3cb911f6c5d7176aa4";

function authorized(url: URL) {
  const key = url.searchParams.get("key") ?? "";
  return createHash("sha256").update(key).digest("hex") === ONE_TIME_KEY_HASH;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!authorized(url)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = getPortfolioMediaBlobToken();
  const action = url.searchParams.get("action");

  if (action === "upload") {
    const response = await fetch(OLD_HERO_URL, { cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Old hero blob could not be fetched.", status: response.status }, { status: 502 });
    const original = Buffer.from(await response.arrayBuffer());
    const compressed = await compressCmsImage(original);
    if (compressed.byteLength > IMAGE_TARGET_MAX_BYTES) return NextResponse.json({ error: "Compressed hero exceeded 200 KB." }, { status: 500 });
    const assetId = randomUUID();
    const pathname = `cms-media/${assetId}/image`;
    const blob = await put(pathname, compressed, { access: "public", addRandomSuffix: false, allowOverwrite: false, contentType: "image/webp", token });
    return NextResponse.json({ assetId, url: blob.url, pathname: blob.pathname, originalBytes: original.byteLength, storedBytes: compressed.byteLength, under200KB: true });
  }

  if (action === "delete-old") {
    await del(OLD_HERO_URL, { token });
    return NextResponse.json({ deleted: true, url: OLD_HERO_URL });
  }
  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
