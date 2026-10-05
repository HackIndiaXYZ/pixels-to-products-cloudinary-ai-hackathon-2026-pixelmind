# PixelMind — AI-Powered Marketing Creative Studio
## 🚀 Live Demo

[PixelMind Live Demo](https://pixelmind-beta.vercel.app/)

> **HackIndia 2026 · Cloudinary AI Track Submission**

PixelMind transforms a single product photo into a complete, platform-native, professional marketing campaign — in seconds. Upload a product, and PixelMind generates polished, ready-to-use creatives for Instagram, Instagram Story, Kinetic Video Reel, Website Hero Banner, and Marketplace listings, all driven by AI-generated campaign copy and Cloudinary as the product media engine.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution](#2-solution)
3. [Architecture](#3-architecture)
4. [Cloudinary Usage](#4-cloudinary-usage)
5. [AI (Gemini) Usage](#5-ai-gemini-usage)
6. [Key Features](#6-key-features)
7. [Tech Stack](#7-tech-stack)
8. [Project Structure](#8-project-structure)
9. [Environment Variables](#9-environment-variables)
10. [Setup & Installation](#10-setup--installation)
11. [Running & Testing](#11-running--testing)
12. [Hackathon Track](#12-hackathon-track)

---

## 1. Problem Statement

Creating professional marketing creatives is expensive, slow, and requires specialist skills:

- A brand team needs separate designers for Instagram posts, Stories, ecommerce listings, and website heroes.
- Each platform has different dimensions, design conventions, and copy requirements.
- Generic AI image generators hallucinate or replace the product entirely — destroying brand fidelity.
- Brands waste hours writing platform-specific copy for each format.

Small and mid-size brands cannot afford this workflow. PixelMind solves it.

---

## 2. Solution

PixelMind follows a strict three-engine architecture:

| Engine | Responsibility |
|---|---|
| **Cloudinary** | Product media — upload, crop, optimize, resize, visual filter grading, CDN delivery |
| **AI (Gemini)** | Marketing brain — Product DNA, campaign copy, creative direction, shape/layout directives |
| **React / Next.js / CSS** | Creative renderer — platform-native HTML/CSS canvases for every output format |

**The uploaded product image is the immutable source of truth.** AI never generates a replacement product. Instead, AI creates the marketing world, copy, and visual direction around the real product from Cloudinary.

---

## 3. Architecture

```
User uploads product image
        │
        ▼
Cloudinary Upload Widget
(secure unsigned upload → CDN public URL)
        │
        ▼
/api/analyze-product
Gemini Vision → Product DNA
{ productName, productCategory, primaryColor, style, shortDescription }
        │
        ▼
/api/generate-campaign
Gemini Text → Platform-Native Campaign Copy
{ headline, description, instagram, story, website, marketplace, campaignWorld }
        │
        ▼
Creative Renderer (React/CSS)
• Instagram Post (1:1)           → CampaignWorldBackdrop + ProductFrameStager + Copy
• Instagram Story (9:16)         → CampaignWorldBackdrop + ProductFrameStager + Copy
• Kinetic Video Reel (9:16)      → Animated story canvas
• Website Hero Banner (16:9)     → Full nav + hero + product + benefits
• Marketplace Listing (1:1)      → Product page with title, price, rating, CTA
        │
        ▼
AI Creative Director (/api/direct-creative)
Natural-language live editing of running creatives
```

---

## 4. Cloudinary Usage

Cloudinary is the **core product media engine** throughout the entire pipeline.

### 4.1 Product Upload

The user uploads their product via the **Cloudinary Upload Widget** (unsigned upload preset). The resulting CDN URL is used as the canonical product source for every downstream step.

```
https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
```

### 4.2 Platform-Specific CDN Transformations

Every platform creative fetches the product via a programmatically-built Cloudinary transformation URL. The helper lives in [`app/lib/cloudinary.ts`](app/lib/cloudinary.ts).

| Platform | Cloudinary Dimensions | Crop Mode |
|---|---|---|
| Instagram Post | 1080 × 1080 | `c_pad,b_transparent` |
| Instagram Story | 1080 × 1920 | `c_pad,b_transparent` |
| Website Hero Banner | 1600 × 900 | `c_pad,b_transparent` |
| Marketplace Listing | 1200 × 1200 | `c_pad,b_transparent` |

### 4.3 Visual Grading Filters per Campaign World

When the user selects a Campaign World, Cloudinary applies world-specific image enhancement parameters directly in the CDN URL:

| Campaign World | Cloudinary Filter |
|---|---|
| URBAN | `e_contrast:15,e_sharpen:90` |
| PERFORMANCE | `e_vibrance:25,e_sharpen:100` |
| LIFESTYLE | `e_improve,e_sharpen:70` |
| NIGHT | `e_auto_contrast,e_sharpen:80` |
| AI-Directed Custom | e.g. `e_contrast:20,e_sharpen:90,e_vibrance:15` |

### 4.4 Geometric Shape Masking

When the user selects or AI-directs a circular product frame, Cloudinary applies `r_max` directly in the transformation URL — ensuring the circular mask is served from the CDN, not rendered client-side:

```
.../image/upload/c_pad,w_1080,h_1080,b_transparent,q_auto,f_auto,r_max/{public_id}
```

### 4.5 Auto Quality and Format Optimization

Every Cloudinary transformation includes `q_auto,f_auto`, which automatically:
- Selects AVIF or WebP based on browser support
- Optimizes quality for the target file size
- Reduces bandwidth and improves LCP performance

### 4.6 Cloudinary URL Security

The `/api/analyze-product` route validates that every incoming `imageUrl` is a legitimate Cloudinary CDN URL from the configured cloud account before passing it to the AI model — preventing prompt injection via external image URLs.

```typescript
url.protocol === "https:" &&
url.hostname === "res.cloudinary.com" &&
url.pathname.startsWith(`/${cloudName}/`)
```

### 4.7 Campaign Media Kit Export

The **Media Kit** modal generates a complete JSON manifest containing all Cloudinary CDN asset URLs for every platform format, ready to hand off to a media buyer or development team.

---

## 5. AI (Gemini) Usage

PixelMind uses **Google Gemini Flash Lite** (`gemini-flash-lite-latest`) for all AI tasks. Three dedicated API routes handle different responsibilities.

### 5.1 Product Analysis — `/api/analyze-product`

Sends the Cloudinary image (fetched server-side, converted to base64) to Gemini's vision model:

**Output → Product DNA:**
```json
{
  "productName": "Urban Runner X1",
  "productCategory": "Footwear",
  "primaryColor": "Electric Blue",
  "style": "Athletic / Urban",
  "shortDescription": "A lightweight streetwear sneaker built for everyday movement and modern edge."
}
```

### 5.2 Campaign Copy Generation — `/api/generate-campaign`

Takes the Product DNA and Campaign World and generates fully structured, platform-native marketing copy.

**Output → Campaign Copy:**
```json
{
  "headline": "Own The Streets.",
  "description": "...",
  "instagram": {
    "hook": "...",
    "caption": "...",
    "hashtags": ["#Footwear", "#Athletic", "#Streetwear", "#PixelMindCampaign"],
    "slides": [{ "title": "...", "subtitle": "...", "tag": "..." }],
    "cta": "Shop Now"
  },
  "story": { "headline": "...", "supportingText": "...", "stickerText": "...", "cta": "..." },
  "website": { "headline": "...", "subheadline": "...", "primaryCTA": "...", "benefits": ["..."] },
  "marketplace": { "productTitle": "...", "description": "...", "features": ["..."], "price": "...", "rating": "...", "reviewsCount": "..." }
}
```

Supports per-platform regeneration — any single platform (e.g. just the Instagram Story) can be regenerated independently.

### 5.3 AI Creative Director — `/api/direct-creative`

A live natural-language creative direction system. The user types a plain-English instruction and Gemini interprets it, returning a full `CreativeDirectorResponse`:

**Example instructions:**
- *"Make it night mode with neon glow"*
- *"Change headline to Bold Moves"*
- *"Change image to circle with cyan glow"*
- *"Transform the product into a starburst with gold lighting"*
- *"Make it athletic with speed streaks"*

**Output → Creative Director Response:**
```json
{
  "headlineLine1": "BUILT FOR",
  "headlineLine2": "BIGGER",
  "scriptWord": "Dreams",
  "bullets": [{ "icon": "feather", "title": "ULTRA LIGHTWEIGHT" }],
  "vibeQuote": "More than just shoes, it's a vibe.",
  "callToAction": "SHOP NOW",
  "campaignWorld": "NIGHT",
  "cloudinaryFilter": "e_auto_contrast,e_sharpen:90,e_contrast:25",
  "scriptAccentColor": "#F59E0B",
  "productShape": "circle",
  "layoutArrangement": "hero-centered",
  "productRotation": 0,
  "frameGlowColor": "#38BDF8",
  "directorCommentary": "Switched to NIGHT world, applied neon grading, and transformed product to Circle Portal."
}
```

Includes a robust keyword-heuristic fallback parser that works even without an API key — for demo resilience.

---

## 6. Key Features

### Platform-Native Creative Canvases

| Platform | Format | What It Generates |
|---|---|---|
| Instagram Post | 1:1 square | Hero creative with campaign world backdrop, animated product staging, headline, subheadline, feature badges, CTA |
| Instagram Post Carousel | 1:1 × 4 slides | 4-slide campaign: Hook → Benefit → Lifestyle → CTA with clickable navigation |
| Instagram Story | 9:16 vertical | Mobile story canvas with progress bars, product hero, sticker, interaction options, CTA |
| Kinetic Video Reel | 9:16 animated | Animated sequenced reel with real-time progress timer |
| Website Hero Banner | 16:9 | Full website nav + hero section + product + benefit pills |
| Marketplace Listing | Square | Premium ecommerce product page with gallery, price, rating, feature bullets, Add to Cart |

### Campaign World Environments

Four fully rendered CSS/SVG world backdrops, each with a unique visual identity:

| World | Visual Environment |
|---|---|
| URBAN | Cinematic glass skyscrapers, golden-hour sunburst, wet concrete plinth with specular reflections |
| PERFORMANCE | Stadium floodlight cones, cyan speed streaks, carbon-fibre athletic track |
| LIFESTYLE | Warm architectural daylight, natural foliage bokeh, honed travertine plinth |
| NIGHT | Obsidian midnight metropolis, neon purple/amber glow, glittering city wireframes |

### Product Frame Shaping System

Users can reshape how the product appears on any creative canvas:

| Shape | Effect |
|---|---|
| Natural | High-fidelity borderless hero cutout |
| Circle Portal | Concentric neon rings, `r_max` on Cloudinary CDN URL |
| Starburst | 10-point SVG clip-path with radiant halo |
| Cyber Hexagon | Futuristic SVG clip-path with corner accents |
| Diamond Prism | 45° luxury gemstone clip-path |
| Emblem Badge | Architectural arch badge clip-path |
| Glass Card | Frosted border with edge reflections |

Shape and layout can be triggered via:
1. Natural language in the AI Creative Director bar
2. One-click shape/layout control pills in the Cloudinary AI Media Hub

### Layout Staging Arrangements

| Layout | Description |
|---|---|
| Staged Plinth | Grounded on the world plinth with volumetric shadow |
| Hero Centered | Dead-center spotlight framing |
| Editorial Split | High-fashion asymmetric split-screen |
| Diagonal Float | Dynamic floating angle with depth perspective |

### AI Neuromarketing Heatmap

Toggle `🔥 Heatmap: ON` to overlay a visual saliency simulation on any creative:
- **Hotspot ①** (red, 64%) — Primary product focal attention
- **Hotspot ②** (amber, 24%) — Headline semantic hook
- **Hotspot ③** (emerald, 12%) — CTA conversion trigger
- **Gaze scanpath** — Eye-movement trajectory connecting all hotspots

### AI Conversion Scorecard

A `📊 Audit: 95/100` panel reports:
- Visual Saliency & Focal Weight
- Typography & Headline Punch
- Source Product Fidelity (always 100% — Cloudinary guarantees no hallucination)
- Platform-Native Compliance
- Predicted CTR vs industry average
- AI ad-spend allocation recommendation

### 1-Click Campaign Media Kit

Export a complete JSON manifest containing:
- All Cloudinary CDN asset URLs per platform
- Full campaign copy (headlines, captions, hashtags, CTAs)
- Product DNA data
- Campaign world configuration

### Remix Styles

Four campaign style presets that retheme the creative palette:

| Remix | Visual Identity |
|---|---|
| Minimal | Clean white, precision geometry |
| Bold | High-contrast, electrified neons |
| Luxury | Gold gradients, champagne tones |
| Sporty | Electric cyan, performance speed |

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.3.4 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Media Engine** | Cloudinary (`cloudinary` SDK v2, `next-cloudinary` v6) |
| **AI Model** | Google Gemini Flash Lite (`gemini-flash-lite-latest`) via REST |
| **Runtime** | React 19, Node.js (Edge-compatible API routes) |
| **Rendering** | HTML/CSS/SVG canvases — no external canvas or image-generation library |

---

## 8. Project Structure

```
pixelmind/
├── app/
│   ├── api/
│   │   ├── analyze-product/route.ts    # Gemini Vision → Product DNA
│   │   ├── generate-campaign/route.ts  # Gemini Text → Platform Campaign Copy
│   │   └── direct-creative/route.ts   # Gemini Text → AI Creative Director
│   ├── components/
│   │   ├── ProductUpload.tsx           # Main studio orchestrator (upload, state, all canvases)
│   │   ├── CampaignWorldBackdrop.tsx   # 4 campaign world CSS/SVG environments
│   │   ├── ProductFrameStager.tsx      # Shape clipping, layout, glow, rotation engine
│   │   ├── AttentionHeatmapOverlay.tsx # AI neuromarketing heatmap overlay
│   │   ├── CampaignScorecardModal.tsx  # Conversion & saliency audit modal
│   │   └── CampaignMediaKitModal.tsx   # 1-click media kit export modal
│   ├── lib/
│   │   └── cloudinary.ts              # Cloudinary URL builder, filters, platform assets
│   ├── types/
│   │   └── productDNA.ts              # TypeScript types: ProductDNA, CampaignCopy, shapes
│   ├── layout.tsx
│   └── page.tsx
├── .env.local                          # API keys (not committed)
├── next.config.ts
├── package.json
└── README.md
```

---

## 9. Environment Variables

Create a `.env.local` file in the project root:

```env
# Cloudinary — from https://cloudinary.com/console
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset

# Google Gemini AI — from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key
```

### Setting up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier is sufficient).
2. Copy your **Cloud Name** from the dashboard.
3. Go to **Settings → Upload → Upload Presets** and create an **unsigned** upload preset.
4. Copy the preset name as `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

### Setting up Gemini API Key

1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Create a new API key.
3. Copy it as `GEMINI_API_KEY`.

> The app includes a keyword-heuristic fallback parser for the AI Creative Director. Core product analysis and campaign copy generation require a valid Gemini API key.

---

## 10. Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/pixelmind.git
cd pixelmind

# 2. Install dependencies
npm install

# 3. Create environment variables
cp .env.example .env.local
# Then edit .env.local with your actual keys (see section 9)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 11. Running & Testing

### Full End-to-End Flow

1. **Upload a product** — Click the upload area or drag-and-drop any product image. The file is uploaded to Cloudinary immediately.
2. **Enter brand name** — Type your brand name (e.g. `StreetWave`).
3. **Select Campaign World** — Choose URBAN, PERFORMANCE, LIFESTYLE, or NIGHT.
4. **Click "Generate Campaign"** — Watch the 5-phase generation pipeline:
   - Analyzing product with AI vision
   - Building Product DNA
   - Writing platform-native copy
   - Building campaign identity
   - Preparing all platform creatives
5. **Browse platform tabs** — Switch between Instagram Post, Instagram Story, Kinetic Reel, Website Banner, and Marketplace.
6. **Use the Carousel** — In the Instagram Post tab, navigate the 4-slide carousel with ← → controls.
7. **Try AI Creative Director** — Type a directive in the prompt bar at the bottom:
   - *"Make it night mode"*
   - *"Change image to circle with cyan glow"*
   - *"Transform to starburst with gold frame"*
   - *"Change headline to Bold Moves Forward"*
8. **Toggle Heatmap** — Click `🔥 Heatmap: ON` to see the neuromarketing saliency overlay.
9. **Open Scorecard** — Click `📊 Audit: 95/100` for the conversion intelligence report.
10. **Export Media Kit** — Click `📦 Media Kit` to download the JSON manifest with all Cloudinary URLs and copy.

### Production Build Verification

```bash
npm run build
```

Expected output:
```
▲ Next.js 16.3.4 (Turbopack)
✓ Compiled successfully
✓ TypeScript passed
✓ 7 routes generated (3 dynamic API, 4 static)
```

### TypeScript Check

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

## 12. Hackathon Track

**Track:** Cloudinary AI Hackathon — HackIndia 2026

**Cloudinary features demonstrated:**
- Unsigned upload widget for instant product CDN delivery
- Programmatic transformation URLs for 5 platform formats (1:1, 9:16, 16:9, 1200×1200)
- World-specific visual grading via Cloudinary enhancement parameters (`e_contrast`, `e_sharpen`, `e_vibrance`, `e_improve`, `e_auto_contrast`)
- Geometric masking via `r_max` (circular product frames served from CDN)
- `q_auto,f_auto` for automatic AVIF/WebP delivery and quality optimization
- `c_pad,b_transparent` for clean product isolation across all aspect ratios
- Server-side URL validation ensuring only authenticated Cloudinary assets reach the AI model
- Full asset URL manifest export via the Campaign Media Kit

**AI features demonstrated:**
- Multimodal vision analysis (product image → structured Product DNA)
- Platform-specific marketing copywriting (5 platforms, distinct copy per format)
- Natural-language creative direction with live canvas updates
- Shape, layout, rotation, and color directive parsing
- Neuromarketing heatmap simulation and conversion scorecard

**Unique differentiators:**
- 100% product fidelity — the real uploaded product is always used, never replaced by AI
- Complete CSS/SVG campaign world environments (no stock backgrounds)
- Natural language commands transform product geometry and staging in real time
- Professional-grade outputs that look like real brand creatives, not AI dashboard cards

---

## License

MIT — free to use, modify, and distribute.

---

*Built with ❤️ for HackIndia 2026 · Cloudinary AI Track*
