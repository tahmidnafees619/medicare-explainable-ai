# MediCare AI — Branding Guide

## Project Identity

**App Name:** MediCare AI  
**Tagline:** AI-Driven Medical Symptom Analysis & Health Assistant  
**Version:** 0.1.0  
**Website Title:** "MediCare AI – AI-Powered Symptom Analysis & Health Assistant"

---

## Branding Elements

### Logo & Icon
- **Icon:** Stethoscope (`Stethoscope` from lucide-react)
- **Brand Color:** Primary Blue (`hsl(222 87% 72%)`)
- **Font:** Nunito (headings), DM Sans (body)

### Typography
- **Headings:** Nunito, 400–800 weight
- **Body:** DM Sans, 400–500 weight

### Colors
| Role | CSS Variable | Value |
|------|---|---|
| Primary | `--primary` | `hsl(222 87% 72%)` |
| Secondary | `--secondary` | `hsl(155 38% 75%)` |
| Accent | `--accent` | `hsl(340 82% 81%)` |
| Background | `--background` | `hsl(226 100% 97%)` |
| Foreground | `--foreground` | `hsl(221 32% 26%)` |

---

## Branding Updates Made

### ✅ Completed Changes

#### 1. **HTML Metadata** (`index.html`)
- ✅ Page title: "MediCare AI – AI-Powered Symptom Analysis & Health Assistant"
- ✅ Author: "MediCare AI"
- ✅ Open Graph title & description updated for social sharing
- ✅ Twitter card metadata configured
- ✅ Favicon ready for `/og-image.png`

#### 2. **Landing Page** ([LandingScreen.tsx](src/components/LandingScreen.tsx))
- ✅ Hero tagline: "🏥 AI-Driven Health Insights"
- ✅ Main heading: "Intelligent Symptom Analysis 🩺"
- ✅ Hero description: Updated to highlight "MediCare AI" and feature set
- ✅ CTA button: "Start Health Check →"
- ✅ Footer: "© [Year] MediCare AI. All rights reserved."
- ✅ Logo/Header: Stethoscope icon + "MediCare AI" text (branding throughout)

#### 3. **Authentication Screen** ([AuthScreen.tsx](src/components/AuthScreen.tsx))
- ✅ Branded header: "MediCare AI" with Stethoscope icon
- ✅ Consistent color scheme applied

#### 4. **Navigation/Dashboard** ([Index.tsx](src/pages/Index.tsx))
- ✅ Navbar: "MediCare AI" with Stethoscope icon
- ✅ Clickable logo returns to chat screen
- ✅ Consistent branding across all authenticated screens

#### 5. **Removed Lovable Branding**
- ✅ Removed `lovable-tagger` dependency
- ✅ Removed Lovable component plugin
- ✅ Removed all Lovable metadata from HTML
- ✅ Updated package name to `medicare-ai-chat`
- ✅ Added project description

#### 6. **CSS Classes**
- Already branded: `card-medicare`, `input-medicare`
- Gradient utilities aligned with brand colors

---

## Brand Messaging

### Key Features (From Landing Page)
1. **Describe Your Symptoms** - Type how you feel in plain language. No medical knowledge needed.
2. **AI Follow-Up Questions** - NLP engine extracts symptoms and asks smart follow-up questions.
3. **ML Disease Prediction** - Random Forest model analyzes symptoms and predicts conditions.
4. **AI Explanation** - AI generates plain-English explanations and recommends next steps.

### Trust/Security Messages
- 🔒 Your data is private and encrypted
- ⚡ ML-powered predictions
- 🩺 Natural language processing
- ⚠️ Always consult a real doctor

### Disclaimer
"⚠️ MediCare AI is not a substitute for professional medical advice."

---

## Asset Checklist

### Required Assets (`public/`)
- [ ] **og-image.png** - Social media preview (1200x630)
  - Should include: MediCare AI logo, tagline, main value prop
- [ ] **favicon.ico** - Browser tab icon
  - Suggestion: Stethoscope icon in primary blue
- [ ] **logo.svg** - Full logo (optional)
  - Stethoscope + "MediCare AI" text

### Optional Assets
- [ ] **favicon-16x16.png** / **favicon-32x32.png** - Apple touch icons
- [ ] **manifest.json** - PWA manifest (if deploying as app)

---

## Platform Branding

### Email
- `noreply@medicare-ai.com` (future)
- Subject line prefix: `[MediCare AI] ...`

### Domain
- Primary: `medicare-ai.com` (recommended)
- Alternative: `medicarechat.com`, `symptom-ai.app`

### Social Media Handles
- Twitter/X: `@MediCareAI`
- GitHub: `rahmannafees619-tech/medicare-ai-chat`

---

## Implementation Checklist

### UI/UX
- [x] Global branding applied to all screens
- [x] Consistent color scheme throughout
- [x] Logo/icon visible in navbar and headers
- [x] Brand messaging in hero and footer
- [x] CSS class names branded (`card-medicare`, `input-medicare`)

### Metadata
- [x] Page title updated
- [x] Meta description updated
- [x] Open Graph tags configured
- [x] Twitter card metadata set
- [x] Author meta tag updated

### Dependencies
- [x] Removed Lovable branding package
- [x] Updated package.json with new name and description
- [x] Removed Lovable Vite plugin

### Documentation
- [x] Removed old Lovable README
- [x] Created branding guide (this file)
- [x] Set up environment configuration

---

## Next Steps

### High Priority
1. **Create social media assets** 
   - Design `og-image.png` for social sharing
   - Create favicon (stethoscope icon in brand colors)

2. **Add legal pages** (when deploying)
   - Privacy Policy
   - Terms of Service
   - Medical Disclaimer

3. **Set up domain & email**
   - Register domain
   - Configure email forwarding/SMTP

### Medium Priority
4. **Brand the 404 error page**
5. **Add loading screen with branded spinner**
6. **Create branded email templates** (for future notifications)

### Future Enhancements
7. **Dark mode branding** (if implementing)
8. **Multi-language support** with brand consistency
9. **Mobile app branding** (iOS/Android if expanding)

---

## Brand Guidelines

### Voice & Tone
- **Professional yet approachable** - Medical credibility meets accessibility
- **Empowering** - Help users take control of their health
- **Transparent** - Clear about AI limitations and disclaimer
- **Clear** - Avoid medical jargon; use plain language

### Visual Style
- **Modern & clean** - Minimalist design with purpose
- **Blue-based** - Blue conveys trust, healthcare, and reliability
- **Accessible** - High contrast, readable fonts
- **Interactive** - Smooth animations and user feedback

### Consistency Rules
- Always use "MediCare AI" (not "Medicare AI" or "Medicare AI")
- Pair branding with stethoscope icon when possible
- Use primary blue (`#[222 87% 72%]`) for CTAs and key elements
- Maintain 1:1 aspect ratio for logo in headers

---

## Resources

- **Component Library:** Shadcn UI
- **Typography:** Google Fonts (Nunito, DM Sans)
- **Icons:** Lucide React
- **Styling:** Tailwind CSS

---

**Last Updated:** April 12, 2026  
**Maintained By:** MediCare AI Team
