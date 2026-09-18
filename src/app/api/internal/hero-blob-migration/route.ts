import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requirePermissionForApi } from "@/lib/auth/authorization";
import { createPendingMediaAsset, finalizePendingMediaAssetUpload } from "@/lib/db/media-asset-service";
import { compressCmsImage, IMAGE_TARGET_MAX_BYTES } from "@/lib/media/image-compression";
import { getPortfolioMediaBlobToken } from "../../upload/blob-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLD_HERO_URL = "https://5ifwuyvmenhxqphx.public.blob.vercel-storage.com/cms-media/6b1506cc-cedb-4792-b2a7-0a0d1e4bd254/image";

export async function GET(request: Request) {
  const authorization = await requirePermissionForApi("media.upload");
  if (!authorization.ok) return authorization.response;
  const action = new URL(request.url).searchParams.get("action");
  const token = getPortfolioMediaBlobToken();

  if (action === "upload") {
    const response = await fetch(OLD_HERO_URL, { cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Old hero blob could not be fetched.", status: response.status }, { status: 502 });
    const original = Buffer.from(await response.arrayBuffer());
    const compressed = await compressCmsImage(original);
    if (compressed.byteLength > IMAGE_TARGET_MAX_BYTES) return NextResponse.json({ error: "Compressed hero exceeded 200 KB." }, { status: 500 });
    const asset = await createPendingMediaAsset({ kind: "image", originalFilename: "homepage-hero.webp", uploadedByAdminId: authorization.admin.id });
    const blob = await put(asset.providerKey, compressed, { access: "public", addRandomSuffix: false, allowOverwrite: false, contentType: "image/webp", token });
    await finalizePendingMediaAssetUpload({ assetId: asset.id, expectedProviderKey: asset.providerKey, kind: "image", url: blob.url });
    return NextResponse.json({ assetId: asset.id, pathname: asset.providerKey, url: blob.url, originalBytes: original.byteLength, storedBytes: compressed.byteLength, under200KB: compressed.byteLength <= IMAGE_TARGET_MAX_BYTES });
  }

  if (action === "delete-old") {
    await del(OLD_HERO_URL, { token });
    return NextResponse.json({ deleted: true, url: OLD_HERO_URL });
  }

  return NextResponse.json({ error: "Use action=upload or action=delete-old." }, { status: 400 });
}
