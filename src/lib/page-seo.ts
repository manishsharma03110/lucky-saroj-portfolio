export const SEO_PAGE_KEYS = ["home", "about", "portfolio", "services", "experience", "contact"] as const;
export type SeoPageKey = (typeof SEO_PAGE_KEYS)[number];

export const SEO_PAGE_DEFAULTS: Record<SeoPageKey, { label: string; title: string; description: string; path: string }> = {
  home: {
    label: "Home",
    title: "Lucky Saroj — Video Editor & Visual Storyteller",
    description: "Portfolio of Lucky Saroj, a freelance video editor specializing in YouTube documentaries, commercials, reels and motion graphics.",
    path: "/",
  },
  about: {
    label: "About",
    title: "About",
    description: "Meet Lucky Saroj, a video editor and visual storyteller focused on documentaries, commercials, social content and motion-led post-production.",
    path: "/about",
  },
  portfolio: {
    label: "Portfolio",
    title: "Portfolio",
    description: "Explore selected video editing work by Lucky Saroj across documentaries, commercials, social reels and visual storytelling projects.",
    path: "/portfolio",
  },
  services: {
    label: "Services",
    title: "Services",
    description: "Video editing and post-production services for YouTube documentaries, commercials, social reels and story-driven digital content.",
    path: "/services",
  },
  experience: {
    label: "Experience",
    title: "Experience",
    description: "Explore Lucky Saroj's video editing experience, creative capabilities and professional journey across story-driven post-production work.",
    path: "/experience",
  },
  contact: {
    label: "Contact",
    title: "Contact",
    description: "Contact Lucky Saroj to discuss video editing, post-production, documentary, commercial or social content projects.",
    path: "/contact",
  },
};
