import type { HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import type { ApiAuthorization } from "@/lib/auth/admin-api";
import type { AuthorizePendingMediaAssetUploadInput } from "@/lib/db/media-asset-service";
import { createStorageKey } from "@/lib/media/ownership";
import { getAllowedUploadContentTypes, getMaximumUploadSize } from "@/lib/media/upload-policy";
import { uploadClientPayloadSchema, uploadCompletionPayloadSchema } from "./contracts";
import { getPortfolioMediaBlobToken } from "./blob-token";

type UploadHandlerDependencies = {
  authorizeAdmin: () => Promise<ApiAuthorization>;
  authorizePendingUpload: (input: AuthorizePendingMediaAssetUploadInput) => Promise<unknown>;
  handleBlobUpload: typeof import("@vercel/blob/client").handleUpload;
};

export function createUploadHandler({ authorizeAdmin, authorizePendingUpload, handleBlobUpload }: UploadHandlerDependencies) {
  return async function uploadHandler(request: Request): Promise<NextResponse> {
    const authorization = await authorizeAdmin();
    if (!authorization.ok) return authorization.response;
    try {
      const body = (await request.json()) as HandleUploadBody;
      const jsonResponse = await handleBlobUpload({
        token: getPortfolioMediaBlobToken(),
        body,
        request,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const intent = uploadClientPayloadSchema.parse(JSON.parse(clientPayload ?? "null"));
          const providerKey = createStorageKey(intent.assetId, intent.kind);
          if (pathname !== providerKey) throw new Error("Upload pathname mismatch.");
          await authorizePendingUpload({ assetId: intent.assetId, expectedProviderKey: providerKey, kind: intent.kind, uploaderAdminId: authorization.admin.id });
          const tokenPayload = uploadCompletionPayloadSchema.parse({ assetId: intent.assetId, providerKey, kind: intent.kind });
          return {
            allowedContentTypes: [...getAllowedUploadContentTypes(intent.kind)],
            addRandomSuffix: false,
            allowOverwrite: false,
            maximumSizeInBytes: getMaximumUploadSize(intent.kind),
            tokenPayload: JSON.stringify(tokenPayload),
            callbackUrl: new URL("/api/upload/complete", request.url).toString(),
          };
        },
        onUploadCompleted: async () => { throw new Error("Completion must use the dedicated callback."); },
      });
      return NextResponse.json(jsonResponse);
    } catch {
      return NextResponse.json({ error: "Upload request could not be completed." }, { status: 400 });
    }
  };
}
