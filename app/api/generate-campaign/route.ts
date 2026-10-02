import { NextResponse } from "next/server";
import type {
  CampaignCopy,
  CampaignWorldType,
  ProductDNA,
} from "../../types/productDNA";

const MODEL = "gemini-flash-lite-latest";

function buildFullPrompt(product: ProductDNA, world: CampaignWorldType = "URBAN") {
  return `You are an elite creative director and commercial marketing copywriter.
Create a comprehensive, platform-native marketing campaign for this product:

Product Name: ${product.productName}
Category: ${product.productCategory}
Primary Color: ${product.primaryColor}
Style: ${product.style}
Description: ${product.shortDescription}
Campaign World Theme: ${world}

Return ONLY a JSON object with this exact structure:
{
  "headline": "catchy punchy master headline (max 7 words)",
  "description": "2-sentence high-impact marketing narrative",
  "callToAction": "Shop Now",
  "instagram": {
    "hook": "scroll-stopping one-liner hook",
    "caption": "engaging Instagram caption highlighting aesthetics, craft, and urban lifestyle with bullet points",
    "hashtags": ["#${product.productCategory.replace(/[^a-zA-Z0-9]/g, '')}", "#${product.style.replace(/[^a-zA-Z0-9]/g, '')}", "#Streetwear", "#PixelMindCampaign"],
    "slides": [
      { "title": "Own Your Movement", "subtitle": "Designed for the pace of the city.", "tag": "DROP 01 // HERO" },
      { "title": "Engineered For Comfort", "subtitle": "Lightweight construction with adaptive cushioning.", "tag": "INNOVATION" },
      { "title": "Born For The Streets", "subtitle": "Every detail tuned for daily utility and modern edge.", "tag": "LIFESTYLE" },
      { "title": "Claim Yours Today", "subtitle": "Available now in strictly limited allocations.", "tag": "FINAL CALL", "cta": "Shop Now" }
    ],
    "cta": "Shop Now"
  },
  "story": {
    "headline": "BUILT FOR SPEED. MADE FOR STYLE.",
    "supportingText": "The next evolution in daily performance.",
    "stickerText": "WOULD YOU WEAR THIS?",
    "interaction": {
      "question": "Rate the drop:",
      "optionA": "🔥 100% Fire",
      "optionB": "⚡ Must Cop"
    },
    "cta": "Swipe Up to Shop"
  },
  "website": {
    "headline": "Architected For The Modern Street.",
    "subheadline": "Experience unmatched versatility, precision engineering, and timeless aesthetic.",
    "primaryCTA": "Explore Collection",
    "secondaryCTA": "View Lookbook",
    "benefits": [
      "Lightweight ergonomic construction",
      "High-traction reinforced outsole",
      "All-day adaptive cushioning support"
    ],
    "announcement": "NEW ARRIVAL // LIMITED QUANTITIES AVAILABLE"
  },
  "marketplace": {
    "productTitle": "${product.productName} - Official Edition",
    "description": "Engineered for everyday durability and modern distinction. Featuring premium materials and signature ${product.primaryColor} accents.",
    "features": [
      "Lightweight and breathable upper",
      "Enhanced shock-absorbing heel",
      "Flexible durable grip tread",
      "Signature ${product.style} aesthetic"
    ],
    "price": "$129.00",
    "rating": "4.9",
    "reviewsCount": "1,480",
    "cta": "Add to Cart"
  },
  "campaignWorld": {
    "name": "${world}",
    "visualTone": "Bold, dramatic lighting, high contrast cinematic depth",
    "environmentDescription": "Atmospheric ${world.toLowerCase()} environment highlighting product geometry"
  }
}

Do not include markdown, backticks, or any text outside the JSON.`;
}

function buildPlatformPrompt(product: ProductDNA, platform: string, world: CampaignWorldType = "URBAN") {
  return `You are an elite creative director and commercial copywriter.
Generate marketing creative content specifically for ${platform.toUpperCase()} for this product:

Product Name: ${product.productName}
Category: ${product.productCategory}
Primary Color: ${product.primaryColor}
Style: ${product.style}
Description: ${product.shortDescription}
Campaign World Theme: ${world}

Return ONLY a JSON object with this exact structure:
${
  platform === "instagram"
    ? `{
  "headline": "catchy punchy master headline (max 7 words)",
  "description": "2-sentence high-impact marketing narrative",
  "callToAction": "Shop Now",
  "instagram": {
    "hook": "scroll-stopping one-liner hook",
    "caption": "engaging Instagram caption highlighting aesthetics, craft, and urban lifestyle with bullet points",
    "hashtags": ["#${product.productCategory.replace(/[^a-zA-Z0-9]/g, '')}", "#${product.style.replace(/[^a-zA-Z0-9]/g, '')}", "#Streetwear", "#PixelMindCampaign"],
    "slides": [
      { "title": "Own Your Movement", "subtitle": "Designed for the pace of the city.", "tag": "DROP 01 // HERO" },
      { "title": "Engineered For Comfort", "subtitle": "Lightweight construction with adaptive cushioning.", "tag": "INNOVATION" },
      { "title": "Born For The Streets", "subtitle": "Every detail tuned for daily utility and modern edge.", "tag": "LIFESTYLE" },
      { "title": "Claim Yours Today", "subtitle": "Available now in strictly limited allocations.", "tag": "FINAL CALL", "cta": "Shop Now" }
    ],
    "cta": "Shop Now"
  }
}`
    : platform === "story"
    ? `{
  "headline": "BUILT FOR SPEED. MADE FOR STYLE.",
  "description": "The next evolution in daily performance.",
  "callToAction": "Swipe Up to Shop",
  "story": {
    "headline": "BUILT FOR SPEED. MADE FOR STYLE.",
    "supportingText": "The next evolution in daily performance.",
    "stickerText": "WOULD YOU WEAR THIS?",
    "interaction": {
      "question": "Rate the drop:",
      "optionA": "🔥 100% Fire",
      "optionB": "⚡ Must Cop"
    },
    "cta": "Swipe Up to Shop"
  }
}`
    : platform === "website"
    ? `{
  "headline": "Architected For The Modern Street.",
  "description": "Experience unmatched versatility, precision engineering, and timeless aesthetic.",
  "callToAction": "Explore Collection",
  "website": {
    "headline": "Architected For The Modern Street.",
    "subheadline": "Experience unmatched versatility, precision engineering, and timeless aesthetic.",
    "primaryCTA": "Explore Collection",
    "secondaryCTA": "View Lookbook",
    "benefits": [
      "Lightweight ergonomic construction",
      "High-traction reinforced outsole",
      "All-day adaptive cushioning support"
    ],
    "announcement": "NEW ARRIVAL // LIMITED QUANTITIES AVAILABLE"
  }
}`
    : `{
  "headline": "${product.productName}",
  "description": "Engineered for everyday durability and modern distinction.",
  "callToAction": "Add to Cart",
  "marketplace": {
    "productTitle": "${product.productName} - Official Edition",
    "description": "Engineered for everyday durability and modern distinction. Featuring premium materials and signature ${product.primaryColor} accents.",
    "features": [
      "Lightweight and breathable upper",
      "Enhanced shock-absorbing heel",
      "Flexible durable grip tread",
      "Signature ${product.style} aesthetic"
    ],
    "price": "$129.00",
    "rating": "4.9",
    "reviewsCount": "1,480",
    "cta": "Add to Cart"
  }
}`
}

Do not include markdown, backticks, or any text outside the JSON.`;
}

function parseJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON found.");
  }

  return JSON.parse(text.slice(start, end + 1));
}

function sanitizeCampaignCopy(data: unknown, product: ProductDNA): CampaignCopy {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid campaign data structure.");
  }
  const d = data as Record<string, unknown>;
  const headline =
    typeof d.headline === "string" && d.headline.trim()
      ? d.headline
      : `Step Into ${product.productName}`;
  const description =
    typeof d.description === "string" && d.description.trim()
      ? d.description
      : product.shortDescription;
  const callToAction =
    typeof d.callToAction === "string" && d.callToAction.trim()
      ? d.callToAction
      : "Shop Now";

  return {
    headline,
    description,
    callToAction,
    instagram: (d.instagram as CampaignCopy["instagram"]) || undefined,
    story: (d.story as CampaignCopy["story"]) || undefined,
    website: (d.website as CampaignCopy["website"]) || undefined,
    marketplace: (d.marketplace as CampaignCopy["marketplace"]) || undefined,
    campaignWorld: (d.campaignWorld as CampaignCopy["campaignWorld"]) || undefined,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const productDNA = body.productDNA as ProductDNA;
    const campaignWorld = (body.campaignWorld || "URBAN") as CampaignWorldType;
    const platform = body.platform as string | undefined;

    if (!productDNA) {
      return NextResponse.json(
        { error: "Product DNA is required." },
        { status: 400 }
      );
    }

    const promptText = platform
      ? buildPlatformPrompt(productDNA, platform, campaignWorld)
      : buildFullPrompt(productDNA, campaignWorld);

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
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const details = await aiResponse.text();
      return NextResponse.json(
        {
          error: `AI generation error (${aiResponse.status}): ${details}`,
        },
        { status: 502 }
      );
    }

    const data = await aiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = parseJson(text);
    const sanitized = sanitizeCampaignCopy(parsed, productDNA);

    return NextResponse.json({
      campaignCopy: sanitized,
    });
  } catch (error) {
    console.error("generate-campaign failed:", error);

    return NextResponse.json(
      { error: "Something went wrong while generating the campaign." },
      { status: 500 }
    );
  }
}