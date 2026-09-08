import type { HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import type { FinalizePendingMediaAssetUploadInput } from "@/lib/db/media-asset-service";
import { uploadCompletionPayloadSchema } from "../contracts";
import { createStorageKey } from "@/lib/media/ownership";

type BlobUploadHandler = typeof import("@vercel/blob/client").handleUpload;
type CompletionDependencies = {
  handleBlobUpload: BlobUploadHandler;
  finalizePendingAsset: (input: FinalizePendingMediaAssetUploadInput) => Promise<unknown>;
};

export function createUploadCompletionHandler({ handleBlobUpload, finalizePendingAsset }: CompletionDependencies) {
  return async function uploadCompletionHandler(request: Request): Promise<NextResponse> {
    try {
      const body = (await request.json()) as HandleUploadBody;
      const response = await handleBlobUpload({
        body,
        request,
        onBeforeGenerateToken: async () => { throw new Error("Token generation is not accepted here."); },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          const identity = uploadCompletionPayloadSchema.parse(JSON.parse(tokenPayload ?? "null"));
          if (identity.providerKey !== createStorageKey(identity.assetId, identity.kind) || blob.pathname !== identity.providerKey) {
            throw new Error("Completion identity mismatch.");
          }
          await finalizePendingAsset({
            assetId: identity.assetId,
            expectedProviderKey: identity.providerKey,
            kind: identity.kind,
            url: blob.url,
          });
        },
      });
      return NextResponse.json(response);
    } catch {
      return NextResponse.json({ error: "Upload completion could not be verified." }, { status: 400 });
    }
  };
}