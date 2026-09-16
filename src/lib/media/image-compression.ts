import "server-only";
import sharp from "sharp";

export const IMAGE_TARGET_MAX_BYTES = 200 * 1024;
const MAX_IMAGE_WIDTH = 2400;
const QUALITY_STEPS = [84, 80, 76, 72] as const;

export async function compressCmsImage(input: Buffer): Promise<Buffer> {
  const source = sharp(input, { failOn: "error", limitInputPixels: 40_000_000 }).rotate();
  const metadata = await source.metadata();
  const width = metadata.width && metadata.width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH : metadata.width;
  let best: Buffer | null = null;

  for (const quality of QUALITY_STEPS) {
    const output = await source
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 4, smartSubsample: true })
      .toBuffer();
    best = output;
    if (output.byteLength <= IMAGE_TARGET_MAX_BYTES) break;
  }

  if (!best) throw new Error("Image compression failed.");
  return best;
}
