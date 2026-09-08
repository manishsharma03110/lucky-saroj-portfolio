import { handleUpload } from "@vercel/blob/client";
import { requirePermissionForApi } from "@/lib/auth/authorization";
import { createUploadHandler } from "./handler";
import { authorizePendingMediaAssetUpload } from "@/lib/db/media-asset-service";

export const POST = createUploadHandler({
  authorizeAdmin: () => requirePermissionForApi("media.upload"),
  handleBlobUpload: handleUpload,
  authorizePendingUpload: authorizePendingMediaAssetUpload,
});
