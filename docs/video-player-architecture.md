# Project video architecture

The project detail and gallery video path is intentionally YouTube-only.

- `src/components/ui/VideoPlayer.tsx` owns the shared cinematic frame and inline YouTube playback.
- `src/components/portfolio/detail/ProjectMedia.tsx` decides whether a project/gallery URL is a supported YouTube video.
- `src/lib/media/youtube.ts` parses and normalizes YouTube URLs and builds the privacy-enhanced embed URL.
- The frame keeps a fixed 16:9 media viewport between the existing top and bottom bars.
- Do not add direct-file playback, masking overlays, crop/zoom transforms, or duplicated project-specific player components unless the product direction explicitly changes.
