# Lucky Saroj Portfolio - Quick Reference Guide

## 🚀 Quick Start Commands

### Development
```bash
# Start the dev server (already running)
npm run dev

# Start dev server on different port
npm run dev -- -p 3001

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Database
```bash
# Regenerate migrations after schema changes
npx drizzle-kit generate

# Apply migrations to database
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Drizzle Studio (visual database editor)
npm run db:studio
```

---

## 🌐 URLs

| Purpose | URL | Status |
|---------|-----|--------|
| Public Website | http://localhost:3000 | ✅ Running |
| Portfolio Gallery | http://localhost:3000/portfolio | ✅ Running |
| About Page | http://localhost:3000/about | ✅ Running |
| Contact Form | http://localhost:3000/contact | ✅ Running |
| Admin Login | http://localhost:3000/admin/login | ✅ Running |
| Admin Dashboard | http://localhost:3000/admin | ✅ Protected |

---

## 👤 Default Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@luckysaroj.com` |
| Password | `LuckySaroj@2026` |
| Change Password | Via admin settings (admin/settings) |

---

## 📝 Common Tasks

### 1. Add a New Portfolio Project

1. Go to http://localhost:3000/admin/login
2. Login with admin credentials
3. Click "Projects" in sidebar
4. Click "Add Project"
5. Fill in:
   - Title
   - Slug (auto-generated from title)
   - Description
   - Client name
   - Year
   - Category (select or create)
   - Thumbnail image (upload or paste URL)
   - Video URL (optional)
   - Tools used (add multiple)
   - Challenge, Approach, Result (optional)
6. Click "Publish" or "Save as Draft"

### 2. Update Site Settings

1. Go to Admin → Settings
2. Edit any of these sections:
   - **General Info**: Site name, logo, contact details
   - **Homepage**: Hero text, stats, social links
   - **SEO**: Meta title, description, OG image
3. Click "Save Changes"

### 3. Add a Service

1. Go to Admin → Services
2. Click "Add Service"
3. Enter:
   - Service name
   - Description
   - Icon (choose from Lucide icons)
   - Mark as featured (checkbox)
4. Click "Save"

### 4. Add Work Experience

1. Go to Admin → Experience
2. Click "Add Experience"
3. Enter:
   - Job title/role
   - Company name
   - Start date
   - End date (leave blank if current)
   - Description
   - Location
4. Click "Save"

### 5. Add Client Testimonial

1. Go to Admin → Testimonials
2. Click "Add Testimonial"
3. Enter:
   - Client name
   - Designation/title
   - Company
   - Profile image (optional)
   - Testimonial text
   - Rating (1-5 stars)
4. Click "Publish" or "Save as Draft"

### 6. Add Skills

1. Go to Admin → About
2. Scroll to "Skills" section
3. Click "Add Skill"
4. Enter skill name (e.g., "Video Editing", "After Effects")
5. Click "Save"

### 7. Add Tools/Software

1. Go to Admin → About
2. Scroll to "Tools" section
3. Click "Add Tool"
4. Enter tool name (e.g., "Adobe Premiere Pro", "DaVinci Resolve")
5. Click "Save"

### 8. View Contact Messages

1. Go to Admin → Messages
2. See all contact form submissions
3. Click on message to view details
4. Mark as read/replied/archived
5. Delete when needed

---

## 🐛 Troubleshooting

### Issue: "Port 3000 already in use"
```bash
# Use a different port:
npm run dev -- -p 3001

# Or kill the process using port 3000
# (Windows) Find and terminate the process
```

### Issue: Admin login not working
```bash
# Re-seed the database:
npm run db:seed

# This will recreate the admin user:
# Email: admin@luckysaroj.com
# Password: LuckySaroj@2026
```

### Issue: Database table doesn't exist after changes
```bash
# 1. Generate new migrations:
npx drizzle-kit generate

# 2. Apply migrations:
npm run db:push

# 3. Reseed data:
npm run db:seed
```

### Issue: Changes not showing on website
```bash
# 1. Ensure you're in the project directory:
cd C:\Users\singl\Downloads\lucky-saroj-portfolio\lucky-saroj-portfolio

# 2. Dev server auto-reloads, but clear browser cache:
# Press Ctrl+Shift+Delete and clear cache

# 3. If needed, restart dev server:
# Ctrl+C in terminal, then: npm run dev
```

### Issue: Images not loading
- Use absolute URLs (http://... or https://...)
- Or upload to `/public/uploads/` folder
- Images can be added via admin forms

### Issue: Form validation errors
- Check browser console for error messages
- Ensure required fields are filled
- Verify email format for email fields
- Ensure dates are in valid format

---

## 🔐 Security Tips

1. **Change Default Password Immediately**:
   - Login to admin
   - Go to Settings
   - Create a new admin user
   - Delete the default one

2. **Database Backups**:
   - Backup `data/lucky-saroj.db` regularly
   - Keep copies in safe location
   - Before major updates, backup entire project

3. **Environment Variables**:
   - Never commit `.env` file to git
   - `.env` is in `.gitignore`
   - Keep `AUTH_SECRET` safe

4. **Access Control**:
   - Only share admin login with trusted people
   - Change passwords regularly
   - Monitor admin activity

---

## 📱 Responsive Testing

Test your website on different devices:

```bash
# Browser DevTools
# Press F12 → Click device toggle

# Test sizes:
# Mobile: 375px wide
# Tablet: 768px wide
# Desktop: 1024px+ wide

# Network throttling:
# Simulate slow connections to test performance
```

---

## ⚡ Performance Tips

1. **Image Optimization**:
   - Use WebP format where possible
   - Compress before uploading
   - Use appropriate dimensions

2. **Video Optimization**:
   - Use mp4 or webm format
   - Compress video files
   - Host on CDN (YouTube, Vimeo recommended)

3. **Database**:
   - Regularly clean old contact messages
   - Archive old drafts
   - Index frequently queried fields

---

## 📊 File Locations for Uploads

### Portfolio Project Media
- Upload images/videos in Admin → Projects → Add/Edit Project
- Files stored in database with URLs
- Can use external URLs (YouTube, Vimeo, etc.)

### Public Assets
- Static files: `/public/` folder
- Uploads folder: `/public/uploads/`
- Reference in database as full URLs

---

## 🔄 Workflow for Content Management

### Daily Content Updates
```
1. Login to Admin Dashboard
2. Check new messages
3. Update any published content
4. Save changes (auto-saves to database)
5. Changes appear on website immediately
```

### New Project Upload
```
1. Prepare images/videos
2. Login to Admin
3. Go to Projects → Add Project
4. Fill in all details
5. Upload/link media
6. Publish (or save as draft)
7. View on Portfolio page
```

### Weekly Maintenance
```
1. Backup database file
2. Review new contact messages
3. Check for any broken links
4. Update featured projects if needed
5. Monitor website performance
```

---

## 📚 File Structure Quick Reference

```
src/
├── app/                          # Routes and pages
│   ├── (site)/                  # Public pages
│   ├── admin/                   # Admin CMS
│   └── api/                     # API endpoints
├── components/                   # Reusable components
│   ├── admin/                   # Admin UI
│   ├── home/                    # Homepage sections
│   └── ...other sections...
├── lib/
│   ├── actions/                 # Server actions (mutations)
│   ├── auth/                    # Authentication
│   ├── db/                      # Database (schema, queries, seed)
│   ├── utils/                   # Helper functions
│   └── validations/             # Zod schemas
data/
└── lucky-saroj.db              # SQLite database file

Configuration Files:
├── .env                         # Environment variables
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
├── eslint.config.mjs           # ESLint config
├── drizzle.config.ts           # Database config
└── package.json                # Dependencies
```

---

## 💡 Tips & Tricks

### Multi-language Support (Future)
- Add language field to schema
- Create language switcher component
- Translate content in admin

### Advanced Features (Future)
- Add email notifications for contact forms
- Implement image gallery lightbox
- Add animation effects
- Setup analytics
- Create API documentation

### Optimization Ideas
- Implement image lazy loading
- Add service worker for offline support
- Create progressive web app (PWA)
- Add sitemap for SEO
- Setup XML feed for RSS

---

## 🚀 Deployment Preparation

### Before Going Live

1. **Update All Content**:
   - Add real projects
   - Update about information
   - Add social media links
   - Update contact details

2. **Test Everything**:
   - Test all forms
   - Check all links
   - Test on mobile
   - Test admin CMS fully

3. **Optimize**:
   - Compress images
   - Minify CSS/JS
   - Check performance
   - Fix any warnings

4. **Set Environment**:
   - Update `.env` for production
   - Set correct URLs
   - Enable analytics
   - Setup email (if needed)

5. **Choose Hosting**:
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS
   - Your own server

6. **Setup CI/CD**:
   - GitHub Actions
   - Automated deployments
   - Automated testing
   - Monitoring

---

## 📞 Support Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/
- **NextAuth**: https://next-auth.js.org/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **SQLite**: https://www.sqlite.org/docs.html

---

## ✅ Everything is Set!

Your portfolio website is:
- ✅ Fully set up
- ✅ Ready to use
- ✅ Connected (frontend + backend + database)
- ✅ All files correct
- ✅ Admin CMS functional
- ✅ Ready for customization

**Start adding your content now!** 🎉

---

Last Updated: 2026-08-13
Status: ✅ READY FOR USE
