import type { HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import type { ApiAuthorization } from "@/lib/auth/admin-api";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

type UploadHandlerDependencies = {
  authorizeAdmin: () => Promise<ApiAuthorization>;
  handleBlobUpload: typeof import("@vercel/blob/client").handleUpload;
};

export function createUploadHandler({ authorizeAdmin, handleBlobUpload }: UploadHandlerDependencies) {
  return async function uploadHandler(request: Request): Promise<NextResponse> {
    const authorization = await authorizeAdmin();
    if (!authorization.ok) return authorization.response;

    const body = (await request.json()) as HandleUploadBody;

    try {
      const jsonResponse = await handleBlobUpload({
        body,
        request,
        onBeforeGenerateToken: async (_pathname, clientPayload) => {
          const kind = clientPayload === "video" ? "video" : "image";

          return {
            allowedContentTypes: kind === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES,
            addRandomSuffix: true,
            maximumSizeInBytes: kind === "video" ? 200 * 1024 * 1024 : 10 * 1024 * 1024,
            tokenPayload: JSON.stringify({ kind }),
          };
        },
        onUploadCompleted: async () => {},
      });

      return NextResponse.json(jsonResponse);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Upload failed" },
        { status: 400 }
      );
    }
  };
}
