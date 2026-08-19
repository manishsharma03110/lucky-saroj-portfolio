import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await auth();
        if (!session?.user) {
          throw new Error("Unauthorized");
        }

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
}