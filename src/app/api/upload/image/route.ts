import { put } from "@vercel/blob";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { requirePermissionForApi } from "@/lib/auth/authorization";
import { createPendingMediaAsset, finalizePendingMediaAssetUpload } from "@/lib/db/media-asset-service";
import { MAX_IMAGE_UPLOAD_BYTES, validateUploadFilePolicy } from "@/lib/media/upload-policy";
import { getPortfolioMediaBlobToken } from "../blob-token";

export const runtime = "nodejs";

const TARGET_MAX_BYTES = 200 * 1024;
const QUALITY_STEPS = [84, 80, 76, 72] as const;

async function compressImage(input: Buffer): Promise<Buffer> {
  const source = sharp(input, { failOn: "error", limitInputPixels: 40_000_000 }).rotate();
  const metadata = await source.metadata();
  const width = metadata.width && metadata.width > 2400 ? 2400 : metadata.width;
  let best: Buffer | null = null;

  for (const quality of QUALITY_STEPS) {
    const output = await source
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 4, smartSubsample: true })
      .toBuffer();
    best = output;
    if (output.byteLength <= TARGET_MAX_BYTES) break;
  }

  if (!best) throw new Error("Image compression failed.");
  return best;
}

export async function POST(request: Request): Promise<NextResponse> {
  const authorization = await requirePermissionForApi("media.upload");
  if (!authorization.ok) return authorization.response;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const policy = validateUploadFilePolicy({ kind: "image", contentType: file.type, size: file.size });
    if (!policy.ok || file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Selected image is not allowed." }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    const compressed = await compressImage(input);
    const asset = await createPendingMediaAsset({
      kind: "image",
      originalFilename: file.name,
      uploadedByAdminId: authorization.admin.id,
    });

    const blob = await put(asset.providerKey, compressed, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "image/webp",
      token: getPortfolioMediaBlobToken(),
    });

    try {
      await finalizePendingMediaAssetUpload({
        assetId: asset.id,
        expectedProviderKey: asset.providerKey,
        kind: "image",
        url: blob.url,
      });
    } catch (error) {
      // Keep the asset pending so the existing media cleanup lifecycle can safely reconcile it.
      throw error;
    }

    return NextResponse.json({
      assetId: asset.id,
      pathname: asset.providerKey,
      kind: "image",
      url: blob.url,
      originalBytes: file.size,
      storedBytes: compressed.byteLength,
      contentType: "image/webp",
    });
  } catch {
    return NextResponse.json({ error: "Image upload could not be processed." }, { status: 400 });
  }
}
