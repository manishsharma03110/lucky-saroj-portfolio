import { handleUpload } from "@vercel/blob/client";
import { finalizePendingMediaAssetUpload } from "@/lib/db/media-asset-service";
import { createUploadCompletionHandler } from "./handler";

export const POST = createUploadCompletionHandler({
  handleBlobUpload: handleUpload,
  finalizePendingAsset: finalizePendingMediaAssetUpload,
});