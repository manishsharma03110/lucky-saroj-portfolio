import { db, schema } from "./index";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // ---- Admin user -----------------------------------------------------
  const existingAdmin = (await db.select().from(schema.adminUsers))[0];
  if (!existingAdmin) {
    const superAdminRole = (await db.select({ id: schema.roles.id }).from(schema.roles).where(eq(schema.roles.key, "SUPER_ADMIN")).limit(1))[0];
    if (!superAdminRole) throw new Error("RBAC migration must be applied before administrator bootstrap.");
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

    if (!bootstrapEmail || !bootstrapPassword) {
      throw new Error(
        "Admin bootstrap requires ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD when no administrator exists."
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bootstrapEmail)) {
      throw new Error("ADMIN_BOOTSTRAP_EMAIL must be a valid email address.");
    }
    if (bootstrapPassword.length < 12) {
      throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters long.");
    }

    const passwordHash = await bcrypt.hash(bootstrapPassword, 10);
    await db.insert(schema.adminUsers)
      .values({
        email: bootstrapEmail,
        name: "Lucky Saroj",
        passwordHash,
        roleId: superAdminRole.id,
      });
    console.log("Created bootstrap administrator.");
  }

  // ---- Site settings (singleton) --------------------------------------
  const existingSettings = (await db.select().from(schema.siteSettings))[0];
  if (!existingSettings) {
    db.insert(schema.siteSettings)
      .values({
        siteName: "Lucky Saroj",
        logoText: "LS",
        contactEmail: "hello@luckysaroj.com",
        contactPhone: "+91 12345 67890",
        location: "India",
        availability: "Freelance / Full-time / Remote",
        heroHeading: "LUCKY SAROJ",
        heroSubheading: "VIDEO EDITOR & VISUAL STORYTELLER",
        heroDescription:
          "I turn raw footage into powerful stories that engage, inspire, and leave a lasting impact.",
        statYears: "5+",
        statProjects: "100+",
        statClients: "50+",
        statViews: "10M+",
        footerDescription:
          "I transform ideas and raw footage into powerful visual stories that engage, inspire and leave a lasting impact.",
        instagramUrl: "https://instagram.com",
        youtubeUrl: "https://youtube.com",
        linkedinUrl: "https://linkedin.com",
        behanceUrl: "https://behance.net",
        vimeoUrl: "https://vimeo.com",
        seoTitle: "Lucky Saroj — Video Editor & Visual Storyteller",
        seoDescription:
          "Portfolio of Lucky Saroj, a freelance video editor specializing in YouTube documentaries, commercials, reels and motion graphics.",
      });
  }

  // ---- About profile (singleton) ---------------------------------------
  const existingAbout = (await db.select().from(schema.aboutProfile))[0];
  if (!existingAbout) {
    db.insert(schema.aboutProfile)
      .values({
        name: "Lucky Saroj",
        headline: "More than an editor, I'm a storyteller.",
        biography:
          "With 5+ years of experience, I've worked with creators, brands and businesses to craft videos that don't just look good — they feel right. Every cut, every frame and every transition is designed with purpose.",
        yearsExperience: 5,
        projectsCompleted: 100,
        clientCount: 50,
        viewsGenerated: "10M+",
      });

    const skills = ["Storytelling", "Pacing & Rhythm", "Sound Design", "Color Theory", "Motion Graphics", "Client Collaboration"];
    for (let i = 0; i < skills.length; i++) {
      await db.insert(schema.aboutSkills).values({ name: skills[i], displayOrder: i });
    }

    const tools = ["Premiere Pro", "After Effects", "DaVinci Resolve", "Photoshop", "Audition", "Cinema 4D"];
    for (let i = 0; i < tools.length; i++) {
      await db.insert(schema.aboutTools).values({ name: tools[i], displayOrder: i });
    }
  }

  // ---- Experience (matches "My Professional Journey" timeline) --------
  const existingExp = (await db.select().from(schema.experiences))[0];
  if (!existingExp) {
    const rows = [
      {
        role: "Freelance Video Editor",
        company: "Self-employed",
        startDate: "2023",
        endDate: null,
        isCurrent: true,
        description:
          "Working with international clients and brands on diverse projects including YouTube, Reels, Commercials and more.",
        location: "Remote",
        displayOrder: 0,
      },
      {
        role: "Video Editor",
        company: "Creative Agency",
        startDate: "2021",
        endDate: "2023",
        isCurrent: false,
        description:
          "Collaborated with agencies and content creators to produce engaging videos across multiple platforms.",
        location: "India",
        displayOrder: 1,
      },
      {
        role: "Junior Editor",
        company: "Post-Production Studio",
        startDate: "2019",
        endDate: "2021",
        isCurrent: false,
        description: "Assisted in editing, motion graphics and post-production for various projects.",
        location: "India",
        displayOrder: 2,
      },
      {
        role: "Learning & Intern",
        company: "Local Production House",
        startDate: "2018",
        endDate: "2019",
        isCurrent: false,
        description: "Focused on learning editing techniques, storytelling and industry-standard workflows.",
        location: "India",
        displayOrder: 3,
      },
    ];
    for (const row of rows) await db.insert(schema.experiences).values(row);
  }

  // ---- Services ---------------------------------------------------------
  const existingServices = (await db.select().from(schema.services))[0];
  if (!existingServices) {
    const rows = [
      { name: "Video Editing", description: "Cinematic edits that bring stories to life.", icon: "Film", isFeatured: true, displayOrder: 0 },
      { name: "Motion Graphics", description: "Stunning motion that adds life to ideas.", icon: "Sparkles", isFeatured: true, displayOrder: 1 },
      { name: "Color Grading", description: "Colors that create mood and emotion.", icon: "Palette", isFeatured: true, displayOrder: 2 },
      { name: "Sound Design", description: "Audio that elevates every frame.", icon: "AudioWaveform", isFeatured: true, displayOrder: 3 },
      { name: "YouTube Editing", description: "Retention-focused edits built for the algorithm and the audience.", icon: "MonitorPlay", isFeatured: false, displayOrder: 4 },
      { name: "Short Form Editing", description: "Fast, punchy cuts for Reels, Shorts and TikTok.", icon: "Clapperboard", isFeatured: false, displayOrder: 5 },
      { name: "Cinematic Editing", description: "Narrative-driven edits for documentaries and short films.", icon: "Camera", isFeatured: false, displayOrder: 6 },
    ];
    for (const row of rows) await db.insert(schema.services).values(row);
  }

  // ---- Categories ---------------------------------------------------------
  const existingCategories = (await db.select().from(schema.portfolioCategories))[0];
  const categoryNames = ["YouTube", "Reels", "Commercial", "Cinematic", "Motion Graphics", "Short Films"];
  const categoryIds: Record<string, string> = {};
  if (!existingCategories) {
    for (let i = 0; i < categoryNames.length; i++) {
      const name = categoryNames[i];
      const inserted = await db
        .insert(schema.portfolioCategories)
        .values({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), displayOrder: i })
        .returning();
      categoryIds[name] = inserted[0].id;
    }
  } else {
    const all = await db.select().from(schema.portfolioCategories);
    for (const c of all) categoryIds[c.name] = c.id;
  }

  // ---- Portfolio projects -------------------------------------------------
  const existingProjects = (await db.select().from(schema.portfolioProjects))[0];
  if (!existingProjects) {
    const projects = [
      {
        title: "The Hustle Story",
        slug: "the-hustle-story",
        clientName: "Self Project",
        year: 2024,
        category: "YouTube",
        description: "A YouTube documentary about dedication, struggle and success.",
        challenge: "Create an emotional documentary that connects with the audience and keeps them engaged.",
        approach: "Focused on storytelling, pacing, sound design and cinematic visuals.",
        result: "A powerful story that generated 1M+ views and strong audience engagement.",
        isFeatured: true,
        tools: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
      },
      {
        title: "Epic Mountain Adventure",
        slug: "epic-mountain-adventure",
        clientName: "Trailhead Films",
        year: 2024,
        category: "Cinematic",
        description: "Cinematic edit of a mountaineering expedition documentary.",
        challenge: "Turn hundreds of hours of raw drone and handheld footage into a tight cinematic narrative.",
        approach: "Built a three-act structure around the climb, layering natural sound with an original score.",
        result: "Featured on the client's channel and used across three film festival submissions.",
        isFeatured: true,
        tools: ["Premiere Pro", "DaVinci Resolve"],
      },
      {
        title: "Product Launch Commercial",
        slug: "product-launch-commercial",
        clientName: "Nova Tech",
        year: 2024,
        category: "Commercial",
        description: "30-second commercial for a consumer tech product launch.",
        challenge: "Communicate three product features in under 30 seconds without feeling rushed.",
        approach: "Used fast, rhythmic cuts synced to a custom beat with clean motion-graphic callouts.",
        result: "Used across paid social, driving a strong pre-order lift for the client.",
        isFeatured: true,
        tools: ["Premiere Pro", "After Effects"],
      },
      {
        title: "Urban Flow",
        slug: "urban-flow",
        clientName: "City Reels",
        year: 2024,
        category: "Reels",
        description: "Short-form reel series capturing city life in motion.",
        challenge: "Keep viewers watching through the first two seconds on a crowded feed.",
        approach: "Punchy jump cuts, bold captions and trending audio synced to visual beats.",
        result: "Consistently outperformed the client's average reel engagement rate.",
        isFeatured: true,
        tools: ["Premiere Pro", "CapCut"],
      },
      {
        title: "Motion Typography Reel",
        slug: "motion-typography-reel",
        clientName: "Studio Aperture",
        year: 2023,
        category: "Motion Graphics",
        description: "Kinetic typography piece for a design studio's showreel.",
        challenge: "Make text alone feel as dynamic as live-action footage.",
        approach: "Layered type animation with sound-design accents and a restrained color palette.",
        result: "Adopted as the studio's official 2024 showreel intro.",
        isFeatured: false,
        tools: ["After Effects", "Cinema 4D"],
      },
      {
        title: "Travel Vibes",
        slug: "travel-vibes",
        clientName: "Wanderlust Co.",
        year: 2023,
        category: "YouTube",
        description: "Travel vlog edit spanning a three-country trip.",
        challenge: "Condense two weeks of footage into a single 12-minute story.",
        approach: "Structured around a clear day-by-day arc with a warm, film-inspired color grade.",
        result: "Became one of the channel's top five most-watched uploads that year.",
        isFeatured: false,
        tools: ["Premiere Pro", "DaVinci Resolve"],
      },
      {
        title: "Fitness Motivation",
        slug: "fitness-motivation",
        clientName: "PulseFit",
        year: 2023,
        category: "Reels",
        description: "High-energy fitness reel series for social media.",
        challenge: "Sustain intensity across a rapid sequence of gym clips without feeling repetitive.",
        approach: "Varied shot pacing and impactful sound hits timed to each rep.",
        result: "Drove a noticeable increase in the client's follower growth rate.",
        isFeatured: false,
        tools: ["Premiere Pro"],
      },
      {
        title: "Gaming Highlights",
        slug: "gaming-highlights",
        clientName: "Streamline Gaming",
        year: 2023,
        category: "YouTube",
        description: "Weekly highlight reel edit for a gaming streamer.",
        challenge: "Turn hours of stream VOD into a fast, entertaining recap.",
        approach: "Fast cuts, reactive zooms and overlay graphics keyed to gameplay moments.",
        result: "Became a recurring weekly series with steady subscriber growth.",
        isFeatured: false,
        tools: ["Premiere Pro", "After Effects"],
      },
      {
        title: "Brand Film",
        slug: "brand-film",
        clientName: "Aurelia Goods",
        year: 2023,
        category: "Commercial",
        description: "Brand story film for a lifestyle products company.",
        challenge: "Communicate brand values without feeling like a traditional ad.",
        approach: "Documentary-style interviews interwoven with lifestyle b-roll and a soft grade.",
        result: "Used as the brand's homepage hero video for over a year.",
        isFeatured: false,
        tools: ["Premiere Pro", "DaVinci Resolve"],
      },
    ];

    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      const inserted = await db
        .insert(schema.portfolioProjects)
        .values({
          title: p.title,
          slug: p.slug,
          clientName: p.clientName,
          year: p.year,
          description: p.description,
          challenge: p.challenge,
          approach: p.approach,
          result: p.result,
          categoryId: categoryIds[p.category] ?? null,
          isFeatured: p.isFeatured,
          status: "published",
          displayOrder: i,
          seoTitle: `${p.title} — Lucky Saroj`,
          seoDescription: p.description,
        })
        .returning();
      const row = inserted[0];

      for (const tool of p.tools) {
        await db.insert(schema.projectTools).values({ projectId: row.id, name: tool });
      }
    }
  }

  // ---- Showreel -----------------------------------------------------------
  const existingShowreel = (await db.select().from(schema.showreels))[0];
  if (!existingShowreel) {
    db.insert(schema.showreels)
      .values({
        title: "Showreel 2026",
        duration: "1:32",
        isFeatured: true,
        status: "published",
      });
  }

  // ---- Testimonials ---------------------------------------------------------
  const existingTestimonials = (await db.select().from(schema.testimonials))[0];
  if (!existingTestimonials) {
    const rows = [
      {
        clientName: "Rahul Mehta",
        designation: "Content Creator",
        company: "Independent",
        testimonialText:
          "Lucky turned a folder of raw clips into a story I was genuinely proud to publish. The pacing and sound design took it to another level.",
        rating: 5,
        isFeatured: true,
      },
      {
        clientName: "Ananya Sharma",
        designation: "Marketing Lead",
        company: "Nova Tech",
        testimonialText:
          "Fast turnaround, clean communication and the final commercial exceeded what we briefed. Already booked for our next launch.",
        rating: 5,
        isFeatured: true,
      },
      {
        clientName: "Vikram Singh",
        designation: "Founder",
        company: "Studio Aperture",
        testimonialText:
          "A rare editor who understands both craft and business goals. Our showreel engagement noticeably improved after the edit.",
        rating: 5,
        isFeatured: true,
      },
      {
        clientName: "Neha Kapoor",
        designation: "Brand Manager",
        company: "Aurelia Goods",
        testimonialText:
          "Lucky brought a documentary sensibility to our brand film that felt honest rather than salesy. Exactly what we wanted.",
        rating: 5,
        isFeatured: false,
      },
    ];
    for (const row of rows) await db.insert(schema.testimonials).values(row);
  }

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
