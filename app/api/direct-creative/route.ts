import { NextResponse } from "next/server";
import type { CampaignWorldType, ProductDNA } from "../../types/productDNA";

const MODEL = "gemini-flash-lite-latest";

export interface CreativeDirectorResponse {
  headlineLine1: string;
  headlineLine2: string;
  scriptWord: string;
  subheadlineLines: string[];
  bullets: Array<{ icon: string; title: string; subtitle?: string }>;
  vibeQuote: string;
  callToAction: string;
  campaignWorld: CampaignWorldType;
  cloudinaryFilter: string;
  scriptAccentColor: string;
  directorCommentary: string;
  productShape?: "natural" | "circle" | "star" | "hexagon" | "diamond" | "badge" | "card";
  layoutArrangement?: "staged-plinth" | "hero-centered" | "editorial-split" | "diagonal-float";
  productRotation?: number;
  frameGlowColor?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const body = await request.json();
    const userPrompt = (body.userPrompt || "").trim();
    const productDNA = body.productDNA as ProductDNA;
    const currentWorld = (body.campaignWorld || "URBAN") as CampaignWorldType;
    const currentHeadline = body.currentHeadline || "BUILT FOR BIGGER Dreams";
    const currentCTA = body.currentCTA || "Shop Now";

    if (!userPrompt) {
      return NextResponse.json(
        { error: "User instruction prompt is required." },
        { status: 400 }
      );
    }

    // If Gemini API Key is available, use multimodal AI director
    if (apiKey) {
      const prompt = `You are the lead AI Creative Director for PixelMind, an elite commercial marketing studio.
The user is directly commanding you to customize and transform their commercial marketing creative.

User Instruction: "${userPrompt}"

Product Context:
- Name: ${productDNA?.productName || "Sneaker"}
- Category: ${productDNA?.productCategory || "Footwear"}
- Primary Color: ${productDNA?.primaryColor || "Blue"}
- Style: ${productDNA?.style || "Athletic / Urban"}
- Current Headline: ${currentHeadline}
- Current World: ${currentWorld}
- Current CTA: ${currentCTA}

Analyze the user's intent carefully:
1. If they request a specific headline or words, break it down: line1 (1-2 uppercase words), line2 (1 big punchy uppercase word), scriptWord (1 stylish handwritten cursive accent word like "Dreams", "Speed", "Limits", "Higher", etc.).
2. If they request lighting, time of day, environment, or mood (e.g. golden hour, sunset, night, cyber, morning, outdoor, track), map it to the best campaignWorld ("URBAN", "PERFORMANCE", "LIFESTYLE", or "NIGHT") and suggest the best Cloudinary visual filter (e.g. "e_contrast:20,e_sharpen:90,e_vibrance:15" or "e_auto_contrast,e_sharpen:85").
3. Suggest 4 platform badges tailored to the product & user direction (e.g., Ultra Lightweight, Breathable Mesh, Durable Sole, All-Day Comfort).
4. Provide a punchy handwritten vibe quote for the plinth (e.g., "More than just shoes, it's a vibe." or "Born for the golden hour pavement.").
5. SHAPE & LAYOUT TRANSFORMATION (CRITICAL): If the user asks to change the image layout, shape, or framing (e.g. "change image to circle", "star", "starburst", "hexagon", "diamond", "badge", "card", "center it", "no tilt", "tilt 45"):
   - productShape: choose "circle", "star", "hexagon", "diamond", "badge", "card", or "natural".
   - layoutArrangement: choose "staged-plinth", "hero-centered", "editorial-split", or "diagonal-float".
   - productRotation: integer degrees (e.g. 0 for centered/upright, -16 for athletic tilt, 15, 45).
   - frameGlowColor: accent hex color for the perimeter glow (e.g. #38BDF8, #F59E0B, #EC4899, #10B981, #8B5CF6).
6. Provide a short, enthusiastic 1-2 sentence directorCommentary explaining exactly what you adjusted.

Return ONLY a valid JSON object with this exact structure:
{
  "headlineLine1": "BUILT FOR",
  "headlineLine2": "BIGGER",
  "scriptWord": "Dreams",
  "subheadlineLines": [
    "PREMIUM COMFORT.",
    "URBAN STYLE.",
    "ALL DAY."
  ],
  "bullets": [
    { "icon": "feather", "title": "ULTRA LIGHTWEIGHT" },
    { "icon": "mesh", "title": "BREATHABLE MESH" },
    { "icon": "shield", "title": "DURABLE SOLE" },
    { "icon": "comfort", "title": "ALL-DAY COMFORT" }
  ],
  "vibeQuote": "More than just shoes, it's a vibe.",
  "callToAction": "SHOP NOW",
  "campaignWorld": "URBAN",
  "cloudinaryFilter": "e_contrast:20,e_sharpen:90",
  "scriptAccentColor": "#38BDF8",
  "productShape": "natural",
  "layoutArrangement": "staged-plinth",
  "productRotation": -16,
  "frameGlowColor": "#38BDF8",
  "directorCommentary": "Transformed campaign layout and visual style according to your exact direction."
}

Do not include any markdown, backticks, or text outside the JSON.`;

      const aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
          return NextResponse.json({
            directorResponse: parsed as CreativeDirectorResponse,
          });
        }
      }
    }

    // Robust Fallback Rule-Based Parser if API key is busy or rate limited
    const lower = userPrompt.toLowerCase();
    let detectedWorld: CampaignWorldType = currentWorld;
    let detectedFilter = "e_contrast:20,e_sharpen:90";
    let accentColor = "#38BDF8";

    if (lower.includes("night") || lower.includes("dark") || lower.includes("midnight") || lower.includes("neon")) {
      detectedWorld = "NIGHT";
      detectedFilter = "e_auto_contrast,e_sharpen:90,e_contrast:25";
      accentColor = "#F59E0B";
    } else if (lower.includes("speed") || lower.includes("performance") || lower.includes("track") || lower.includes("fast") || lower.includes("athletic")) {
      detectedWorld = "PERFORMANCE";
      detectedFilter = "e_vibrance:30,e_sharpen:100";
      accentColor = "#06B6D4";
    } else if (lower.includes("life") || lower.includes("warm") || lower.includes("garden") || lower.includes("nature") || lower.includes("minimal")) {
      detectedWorld = "LIFESTYLE";
      detectedFilter = "e_improve,e_sharpen:75";
      accentColor = "#F97316";
    } else {
      detectedWorld = "URBAN";
      detectedFilter = "e_contrast:20,e_sharpen:90,e_vibrance:15";
      accentColor = "#38BDF8";
    }

    // Extract shape & layout intent
    let detectedShape: "natural" | "circle" | "star" | "hexagon" | "diamond" | "badge" | "card" = "natural";
    let detectedLayout: "staged-plinth" | "hero-centered" | "editorial-split" | "diagonal-float" = "staged-plinth";
    let detectedRotation = -16;
    let detectedGlowColor = accentColor;

    if (lower.includes("circle") || lower.includes("round") || lower.includes("circular") || lower.includes("portal") || lower.includes("ring")) {
      detectedShape = "circle";
      detectedGlowColor = "#38BDF8";
    } else if (lower.includes("star") || lower.includes("starburst") || lower.includes("burst")) {
      detectedShape = "star";
      detectedGlowColor = "#F59E0B";
    } else if (lower.includes("hex") || lower.includes("hexagon") || lower.includes("cyber")) {
      detectedShape = "hexagon";
      detectedGlowColor = "#06B6D4";
    } else if (lower.includes("diamond") || lower.includes("prism") || lower.includes("rhombus")) {
      detectedShape = "diamond";
      detectedGlowColor = "#EC4899";
    } else if (lower.includes("badge") || lower.includes("sticker") || lower.includes("pill") || lower.includes("tag")) {
      detectedShape = "badge";
      detectedGlowColor = "#8B5CF6";
    } else if (lower.includes("card") || lower.includes("glass") || lower.includes("box")) {
      detectedShape = "card";
      detectedGlowColor = "#FFFFFF";
    }

    if (lower.includes("center") || lower.includes("middle")) {
      detectedLayout = "hero-centered";
      detectedRotation = 0;
    } else if (lower.includes("split") || lower.includes("side by side")) {
      detectedLayout = "editorial-split";
    } else if (lower.includes("float") || lower.includes("flying") || lower.includes("air")) {
      detectedLayout = "diagonal-float";
      detectedRotation = -8;
    }

    // Extract potential custom headline
    let line1 = "BUILT FOR";
    let line2 = "BIGGER";
    let script = "Dreams";

    if (lower.includes("headline") || lower.includes("title") || lower.includes("say") || lower.includes("call it")) {
      const match = userPrompt.match(/(?:headline|title|say|called)\s*["':]?\s*([^"'.!?\n]+)/i);
      if (match && match[1]) {
        const words = match[1].trim().split(/\s+/);
        if (words.length === 1) {
          line2 = words[0].toUpperCase();
          script = "Now";
        } else if (words.length === 2) {
          line1 = words[0].toUpperCase();
          line2 = "NEXT";
          script = words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase();
        } else {
          script = words[words.length - 1].charAt(0).toUpperCase() + words[words.length - 1].slice(1).toLowerCase();
          line2 = words[words.length - 2].toUpperCase();
          line1 = words.slice(0, words.length - 2).join(" ").toUpperCase();
        }
      }
    }

    let commentary = `Applied your creative direction: Switched environment to ${detectedWorld}, tuned Cloudinary grading (${detectedFilter}), and formatted headline to "${line1} ${line2} ${script}".`;
    if (detectedShape !== "natural") {
      commentary += ` Transformed product framing to custom ${detectedShape.toUpperCase()} layout.`;
    }

    const fallbackResponse: CreativeDirectorResponse = {
      headlineLine1: line1,
      headlineLine2: line2,
      scriptWord: script,
      subheadlineLines: [
        "PREMIUM COMFORT.",
        "URBAN STYLE.",
        "ALL DAY.",
      ],
      bullets: [
        { icon: "feather", title: "ULTRA LIGHTWEIGHT" },
        { icon: "mesh", title: "BREATHABLE MESH" },
        { icon: "shield", title: "DURABLE SOLE" },
        { icon: "comfort", title: "ALL-DAY COMFORT" },
      ],
      vibeQuote: `More than just ${productDNA?.productCategory?.toLowerCase() || "shoes"}, it's a vibe.`,
      callToAction: "SHOP NOW",
      campaignWorld: detectedWorld,
      cloudinaryFilter: detectedFilter,
      scriptAccentColor: accentColor,
      productShape: detectedShape,
      layoutArrangement: detectedLayout,
      productRotation: detectedRotation,
      frameGlowColor: detectedGlowColor,
      directorCommentary: commentary,
    };

    return NextResponse.json({
      directorResponse: fallbackResponse,
    });
  } catch (error) {
    console.error("direct-creative failed:", error);
    return NextResponse.json(
      { error: "Failed to process creative direction." },
      { status: 500 }
    );
  }
}
