# PageSpeed mobile + desktop optimization

Implemented against the Sep 18 Lighthouse findings.

1. LCP: hero content is immediately paintable; no blur/filter entrance gate.
2. Images: Vercel Blob host detection keeps hero assets on Next/Image AVIF/WebP responsive optimization; hero uses high fetch priority and quality 72.
3. Render path: removed hero scroll effect/effect hook and reduced above-fold visual work.
4. JavaScript: hero no longer ships React effect/ref parallax logic; initial content requires no animation JS.
5. Animation: removed filter animation from reveal/hero content; retained compositor-friendly transform/opacity motion.
6. DOM: no extra wrappers introduced; existing semantic structure preserved.
7. Accessibility: increased hero description, scroll cue and outline contrast; content remains semantic and labelled.
8. Release gate: CI/build + merge + Vercel deployment required before completion.

Preserved: CMS data, live-sync system, public content, responsive modes, SEO, project data, cinematic design direction.
