import { requirePermissionForApi } from "@/lib/auth/authorization";
import { createPendingMediaAsset } from "@/lib/db/media-asset-service";
import { createUploadInitiationHandler } from "./handler";

export const POST = createUploadInitiationHandler({
  authorizeAdmin: () => requirePermissionForApi("media.upload"),
  createPendingAsset: createPendingMediaAsset,
});