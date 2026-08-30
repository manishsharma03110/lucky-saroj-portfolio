import { Play } from "lucide-react";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import type { schema } from "@/lib/db";

type Project = typeof schema.portfolioProjects.$inferSelect;
type Media = typeof schema.projectMedia.$inferSelect;

function usableImage(url: string | null | undefined) {
  if (!url) return false;
  try { const parsed = new URL(url); return ["http:", "https:"].includes(parsed.protocol) && !(parsed.hostname === "drive.google.com" && parsed.pathname.startsWith("/file/")); } catch { return url.startsWith("/"); }
}

function playableVideo(url: string | null | undefined) {
  if (!url) return false;
  if (/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}/.test(url) || /vimeo\.com\/\d+/.test(url)) return true;
  try { const parsed = new URL(url); return parsed.hostname.endsWith("blob.vercel-storage.com") || /\.(mp4|webm|mov)(?:$|\?)/i.test(parsed.pathname + parsed.search); } catch { return /^\/.+\.(mp4|webm|mov)(?:$|\?)/i.test(url); }
}

function initials(title: string) { return title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase(); }

function ProjectSlate({ project, categoryName, hasVideo }: { project: Project; categoryName?: string; hasVideo: boolean }) {
  return <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_78%_24%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(145deg,var(--surface-elevated)_0%,var(--background-primary)_76%)]" aria-hidden><div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" /><span className="absolute right-5 top-0 select-none font-display text-[clamp(7rem,18vw,15rem)] leading-none text-white/[0.055]">{initials(project.title)}</span><div className="absolute inset-x-6 bottom-6 max-w-3xl sm:inset-x-10 sm:bottom-10"><span className="block h-px w-16 bg-[var(--accent-primary)]" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)]">{categoryName ?? "Selected project"}</p><p className="mt-2 break-words font-display text-2xl font-semibold tracking-[-0.035em] text-[var(--text-primary)] sm:text-4xl">{project.title}</p></div>{hasVideo && <span className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent-primary)]/60 bg-black/35 text-[var(--accent-hover)]"><Play size={15} fill="currentColor" /></span>}<span className="absolute left-5 top-5 h-8 w-8 border-l border-t border-[var(--accent-primary)]/55" /><span className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-[var(--accent-primary)]/55" /></div>;
}

function mediaState(project: Project, media: Media[]) {
  const galleryImages = media.filter((item) => item.type === "image" && usableImage(item.url));
  const primaryImage = usableImage(project.thumbnailUrl) ? project.thumbnailUrl : usableImage(project.posterUrl) ? project.posterUrl : galleryImages[0]?.url ?? null;
  const video = playableVideo(project.videoUrl) ? project.videoUrl : null;
  return { primaryImage, video, primaryGalleryId: primaryImage === galleryImages[0]?.url ? galleryImages[0]?.id : null };
}

export function ProjectMedia({ project, categoryName, media }: { project: Project; categoryName?: string; media: Media[] }) {
  const { primaryImage, video } = mediaState(project, media);
  return <section className="bg-[var(--background-primary)] py-10 sm:py-12 lg:py-16"><div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12"><div className="relative aspect-[16/10] overflow-hidden rounded-[8px] border border-white/10 bg-[var(--surface-primary)] sm:aspect-video"><ProjectSlate project={project} categoryName={categoryName} hasVideo={Boolean(video)} />{video ? <div className="absolute inset-0"><VideoPlayer videoUrl={video} posterUrl={primaryImage} title={project.title} className="h-full w-full" /></div> : primaryImage ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${primaryImage}')` }} role="img" aria-label={`${project.title} project preview`} /> : null}</div></div></section>;
}

export function ProjectGallery({ project, media }: { project: Project; media: Media[] }) {
  const { primaryGalleryId } = mediaState(project, media);
  const items = media.filter((item) => item.id !== primaryGalleryId && (item.type === "image" ? usableImage(item.url) : playableVideo(item.url)));
  if (items.length === 0) return null;
  return <section className="border-t border-white/10 bg-[var(--background-primary)] py-12 sm:py-16 lg:py-20"><div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Additional media</p><h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">More from the project.</h2><div className="mt-8 grid gap-6 md:grid-cols-2">{items.map((item, index) => <div key={item.id} className={`relative aspect-video overflow-hidden rounded-[6px] border border-white/10 bg-[var(--surface-primary)] ${index % 3 === 0 ? "md:col-span-2" : ""}`}>{item.type === "video" ? <VideoPlayer videoUrl={item.url} title={`${project.title} project media`} className="h-full w-full" /> : <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${item.url}')` }} role="img" aria-label={`${project.title} project media`} />}</div>)}</div></div></section>;
}
