# CMS image upload compression

Admin image uploads use a dedicated authenticated server-side lane at `POST /api/upload/image`.

- Existing `media.upload` authorization remains mandatory.
- Existing `media_assets` pending/finalized ownership lifecycle is reused unchanged.
- Input policy remains the CMS image whitelist and 10 MB maximum.
- Sharp auto-orients images, limits source pixels, resizes only when wider than 2400 px, and converts to WebP.
- Encoding starts at quality 84 and steps down through 80, 76 and 72 until the output is at or below the 200 KB target when feasible.
- The final WebP is stored under the existing canonical owned Blob key with overwrite disabled.
- Video uploads remain on the existing direct-to-Blob client lane, so their progress/speed behavior is unchanged.

The image lane adds one server hop and may therefore be slightly slower than direct-to-Blob upload, but it reduces stored source-image weight while preserving the existing ownership and cleanup model.
