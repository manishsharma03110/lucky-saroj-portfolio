import { Play } from "lucide-react";
import { ProjectVideoPlayer } from "@/components/ui/ProjectVideoPlayer";
import { getYouTubeVideoId, isDirectVideoUrl } from "@/lib/media/youtube";
import { DEFAULT_PROJECT_VIDEO_FRAME } from "@/lib/media/project-video-frame";
import type { schema } from "@/lib/db";
import type { ProjectMediaWithSeo } from "@/lib/db/queries";

type BaseProject = typeof schema.portfolioProjects.$inferSelect;
type Project = BaseProject & Readonly<{
  hostedVideoUrl?: string | null;
  videoEditorName?: string | null;
  videoEditorRole?: string | null;
  videoTagline?: string | null;
  videoBottomLabel?: string | null;
}>;

type MediaCopy = Readonly<{
  selectedProjectLabel?: string;
  mediaEyebrow?: string;
  mediaHeading?: string;
  previewAltSuffix?: string;
  mediaAltSuffix?: string;
}>;

function usableImage(url: string | null | undefined) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) && !(parsed.hostname === "drive.google.com" && parsed.pathname.startsWith("/file/"));
  } catch {
    return url.startsWith("/");
  }
}

function playableVideo(url: string | null | undefined) {
  return Boolean(getYouTubeVideoId(url) || isDirectVideoUrl(url));
}

function initials(title: string) {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function frameCopy(project: Project) {
  return {
    editorName: project.videoEditorName?.trim() || DEFAULT_PROJECT_VIDEO_FRAME.editorName,
    editorRole: project.videoEditorRole?.trim() || DEFAULT_PROJECT_VIDEO_FRAME.editorRole,
    tagline: project.videoTagline?.trim() || DEFAULT_PROJECT_VIDEO_FRAME.tagline,
    bottomLabel: project.videoBottomLabel?.trim() || DEFAULT_PROJECT_VIDEO_FRAME.bottomLabel,
  };
}

function ProjectSlate({
  project,
  categoryName,
  hasVideo,
  selectedProjectLabel = "Selected project",
}: {
  project: Project;
  categoryName?: string;
  hasVideo: boolean;
  selectedProjectLabel?: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_78%_24%,var(--accent-glow),transparent_34%),linear-gradient(145deg,var(--surface-elevated)_0%,var(--background-primary)_76%)]" aria-hidden>
      <span className="absolute right-5 top-0 select-none font-display text-[clamp(7rem,18vw,15rem)] leading-none text-white/[0.055]">{initials(project.title)}</span>
      <div className="absolute inset-x-6 bottom-6 max-w-3xl sm:inset-x-10 sm:bottom-10">
        <span className="block h-px w-16 bg-[var(--accent-primary)]" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)]">{categoryName ?? selectedProjectLabel}</p>
        <p className="mt-2 break-words font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-4xl">{project.title}</p>
      </div>
      {hasVideo && <span className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent-primary)]/60 bg-black/35 text-[var(--accent-hover)]"><Play size={15} fill="currentColor" /></span>}
    </div>
  );
}

function mediaState(project: Project, media: ProjectMediaWithSeo[]) {
  const galleryImages = media.filter((item) => item.type === "image" && usableImage(item.url));
  const primaryImage = usableImage(project.thumbnailUrl)
    ? project.thumbnailUrl
    : usableImage(project.posterUrl)
      ? project.posterUrl
      : galleryImages[0]?.url ?? null;
  const hostedVideo = isDirectVideoUrl(project.hostedVideoUrl) ? project.hostedVideoUrl?.trim() ?? null : null;
  const youtubeVideo = getYouTubeVideoId(project.videoUrl) ? project.videoUrl : null;
  return {
    primaryImage,
    hostedVideo,
    youtubeVideo,
    hasVideo: Boolean(hostedVideo || youtubeVideo),
    primaryGalleryId: primaryImage === galleryImages[0]?.url ? galleryImages[0]?.id : null,
  };
}

export function ProjectMedia({
  project,
  categoryName,
  media,
  copy = {},
}: {
  project: Project;
  categoryName?: string;
  media: ProjectMediaWithSeo[];
  copy?: MediaCopy;
}) {
  const { primaryImage, hostedVideo, youtubeVideo, hasVideo } = mediaState(project, media);
  const previewAlt = project.thumbnailAlt?.trim() || `${project.title} ${copy.previewAltSuffix || "project preview"}`;
  const frame = frameCopy(project);

  return (
    <section className="bg-[var(--background-primary)] py-8 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className={`relative overflow-hidden rounded-[12px] bg-[var(--surface-primary)] shadow-[0_30px_100px_rgba(0,0,0,0.34)] ${hasVideo ? "" : "aspect-video border border-white/10"}`}>
          <ProjectSlate project={project} categoryName={categoryName} hasVideo={hasVideo} selectedProjectLabel={copy.selectedProjectLabel} />
          {hasVideo ? (
            <ProjectVideoPlayer
              hostedVideoUrl={hostedVideo}
              youtubeVideoUrl={youtubeVideo}
              posterUrl={primaryImage}
              title={project.title}
              editorName={frame.editorName}
              editorRole={frame.editorRole}
              tagline={frame.tagline}
              bottomLabel={frame.bottomLabel}
              className="relative w-full"
            />
          ) : primaryImage ? (
            <div
              className="absolute inset-0 bg-contain bg-center bg-no-repeat lg:bg-cover"
              style={{ backgroundImage: `url('${primaryImage}')` }}
              role="img"
              aria-label={previewAlt}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ProjectGallery({
  project,
  media,
  copy = {},
}: {
  project: Project;
  media: ProjectMediaWithSeo[];
  copy?: MediaCopy;
}) {
  const { primaryGalleryId } = mediaState(project, media);
  const items = media.filter((item) => item.id !== primaryGalleryId && (item.type === "image" ? usableImage(item.url) : playableVideo(item.url)));
  if (!items.length) return null;
  const fallbackAlt = `${project.title} ${copy.mediaAltSuffix || "project media"}`;
  const frame = frameCopy(project);

  return (
    <section className="border-t border-white/10 bg-[var(--background-primary)] py-12 sm:py-16 lg:py-20 2xl:py-24">
      <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12 2xl:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">{copy.mediaEyebrow || "Additional media"}</p>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl lg:text-5xl">{copy.mediaHeading || "More from the project."}</h2>
        <div className="mt-8 grid gap-5 sm:gap-6 md:grid-cols-2 lg:mt-10 lg:gap-8">
          {items.map((item, index) => {
            const label = item.altText?.trim() || item.title?.trim() || fallbackAlt;
            const hostedVideo = item.type === "video" && isDirectVideoUrl(item.url) ? item.url : null;
            const youtubeVideo = item.type === "video" && getYouTubeVideoId(item.url) ? item.url : null;
            return (
              <figure
                key={item.id}
                className={`relative overflow-hidden rounded-[10px] border border-white/10 bg-[var(--surface-primary)] ${item.type === "image" ? "aspect-video" : ""} ${index % 3 === 0 ? "md:col-span-2" : ""}`}
                title={item.title ?? undefined}
              >
                {item.type === "video" ? (
                  <ProjectVideoPlayer
                    hostedVideoUrl={hostedVideo}
                    youtubeVideoUrl={youtubeVideo}
                    title={item.title?.trim() || fallbackAlt}
                    editorName={frame.editorName}
                    editorRole={frame.editorRole}
                    tagline={frame.tagline}
                    bottomLabel={frame.bottomLabel}
                    className="w-full"
                  />
                ) : (
                  <div className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('${item.url}')` }} role="img" aria-label={label} />
                )}
                {item.description?.trim() ? <figcaption className="sr-only">{item.description}</figcaption> : null}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
