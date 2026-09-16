import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requirePermissionForApi } from "@/lib/auth/authorization";
import { createPendingMediaAsset, finalizePendingMediaAssetUpload } from "@/lib/db/media-asset-service";
import { compressCmsImage } from "@/lib/media/image-compression";
import { MAX_IMAGE_UPLOAD_BYTES, validateUploadFilePolicy } from "@/lib/media/upload-policy";
import { getPortfolioMediaBlobToken } from "../blob-token";

export const runtime = "nodejs";

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

    const compressed = await compressCmsImage(Buffer.from(await file.arrayBuffer()));
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

    await finalizePendingMediaAssetUpload({
      assetId: asset.id,
      expectedProviderKey: asset.providerKey,
      kind: "image",
      url: blob.url,
    });

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
