import { NextResponse } from "next/server";
import type { ApiAuthorization } from "@/lib/auth/admin-api";
import type { PersistedMediaAsset, PendingMediaAssetInput } from "@/lib/db/media-asset-service";
import { validateUploadFilePolicy } from "@/lib/media/upload-policy";
import { uploadInitiationSchema } from "../contracts";

type InitiationDependencies = {
  authorizeAdmin: () => Promise<ApiAuthorization>;
  createPendingAsset: (input: PendingMediaAssetInput) => Promise<PersistedMediaAsset>;
};

export function createUploadInitiationHandler({ authorizeAdmin, createPendingAsset }: InitiationDependencies) {
  return async function uploadInitiationHandler(request: Request): Promise<NextResponse> {
    const authorization = await authorizeAdmin();
    if (!authorization.ok) return authorization.response;
    try {
      const input = uploadInitiationSchema.parse(await request.json());
      const policy = validateUploadFilePolicy({ kind: input.kind, contentType: input.contentType, size: input.size });
      if (!policy.ok) {
        return NextResponse.json({ error: "Selected file is not allowed." }, { status: 400 });
      }
      const asset = await createPendingAsset({
        kind: input.kind,
        originalFilename: input.originalFilename,
        uploadedByAdminId: authorization.admin.id,
      });
      return NextResponse.json({ assetId: asset.id, pathname: asset.providerKey, kind: asset.kind });
    } catch {
      return NextResponse.json({ error: "Upload could not be started." }, { status: 400 });
    }
  };
}
