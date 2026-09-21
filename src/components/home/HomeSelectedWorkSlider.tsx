"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { WorkCard } from "@/components/home/WorkCard";
import type { PortfolioProjectWithVideo } from "@/lib/db/queries";

type Slide = {
  project: PortfolioProjectWithVideo;
  categoryName?: string;
};

const AUTO_ADVANCE_MS = 6500;

export function HomeSelectedWorkSlider({ slides }: { slides: Slide[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const trackSlides = useMemo(() => {
    if (slides.length > 1 && slides.length <= 3) return [...slides, ...slides];
    return slides;
  }, [slides]);

  const logicalCount = slides.length;
  const trackCount = trackSlides.length;

  useEffect(() => {
    if (!trackCount) return;
    const viewport = viewportRef.current;
    const target = viewport?.children.item(activeIndex) as HTMLElement | null;
    if (!viewport || !target) return;
    viewport.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }, [activeIndex, trackCount]);

  useEffect(() => {
    if (paused || trackCount <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % trackCount);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, trackCount]);

  if (!trackCount) return null;

  const previous = () => setActiveIndex((current) => (current - 1 + trackCount) % trackCount);
  const next = () => setActiveIndex((current) => (current + 1) % trackCount);
  const logicalIndex = activeIndex % logicalCount;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div
        ref={viewportRef}
        className="relative flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 sm:gap-8 lg:gap-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Selected work auto-playing slider"
      >
        {trackSlides.map(({ project, categoryName }, index) => (
          <div
            key={`${project.id}-${index}`}
            className="min-w-full snap-start md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1.666rem)]"
            aria-hidden={index >= logicalCount ? true : undefined}
          >
            <WorkCard
              project={project}
              categoryName={categoryName}
              previewActive={index === activeIndex}
            />
          </div>
        ))}
      </div>

      {trackCount > 1 ? (
        <div className="mt-6 flex items-center justify-between gap-5 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2" aria-label="Slider position">
            {slides.map((slide, index) => (
              <button
                key={slide.project.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${index === logicalIndex ? "w-8 bg-[var(--accent-primary)]" : "w-3 bg-white/20 hover:bg-white/40"}`}
                aria-label={`Show ${slide.project.title}`}
                aria-current={index === logicalIndex ? "true" : undefined}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={previous}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]/60 hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
              aria-label="Previous project"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]/60 hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
              aria-label="Next project"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
