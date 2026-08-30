import { handleUpload } from "@vercel/blob/client";
import { requireAdminForApi } from "@/lib/auth/admin";
import { createUploadHandler } from "./handler";

export const POST = createUploadHandler({
  authorizeAdmin: requireAdminForApi,
  handleBlobUpload: handleUpload,
});
