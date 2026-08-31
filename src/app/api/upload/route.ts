import { handleUpload } from "@vercel/blob/client";
import { requirePermissionForApi } from "@/lib/auth/authorization";
import { createUploadHandler } from "./handler";

export const POST = createUploadHandler({
  authorizeAdmin: () => requirePermissionForApi("media.upload"),
  handleBlobUpload: handleUpload,
});
