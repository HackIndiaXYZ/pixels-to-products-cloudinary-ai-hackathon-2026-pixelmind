import { NextResponse } from "next/server";
import type { ProductDNA } from "../../types/productDNA";

const MODEL = "gemini-flash-lite-latest";

const PROMPT = `Analyze the product in this image and return ONLY a JSON object.

Use exactly these keys:
{
  "productName": "short, clear product name",
  "productCategory": "broad product category",
  "primaryColor": "single dominant color",
  "style": "one or two words describing the style",
  "shortDescription": "one sentence, maximum 25 words, describing the product for marketing"
}

Do not include markdown, explanations, or any text outside the JSON.`;

function isAllowedImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      !!cloudName &&
      url.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

function parseJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON found in Gemini response.");
  }

  return JSON.parse(text.slice(start, end + 1));
}

function isValidProductDNA(data: unknown): data is ProductDNA {
  if (typeof data !== "object" || data === null) return false;

  const d = data as Record<string, unknown>;

  return [
    "productName",
    "productCategory",
    "primaryColor",
    "style",
    "shortDescription",
  ].every(
    (key) =>
      typeof d[key] === "string" &&
      (d[key] as string).trim().length > 0
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  let imageUrl: unknown;

  try {
    const body = await request.json();
    imageUrl = body.imageUrl;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!isAllowedImageUrl(imageUrl)) {
    return NextResponse.json(
      {
        error:
          "imageUrl must be an image from your Cloudinary account.",
      },
      { status: 400 }
    );
  }

  try {
   const imageResponse = await fetch(imageUrl);

if (!imageResponse.ok) {
  throw new Error("Could not download the Cloudinary image.");
}

const imageBuffer = await imageResponse.arrayBuffer();
const base64Image = Buffer.from(imageBuffer).toString("base64");

const mimeType =
  imageResponse.headers.get("content-type") || "image/jpeg";

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
              text: PROMPT,
            },
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
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
          error: `Gemini error (${aiResponse.status}): ${details}`,
        },
        { status: 502 }
      );
    }

    const data = await aiResponse.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const parsed = parseJson(text);

    if (!isValidProductDNA(parsed)) {
      return NextResponse.json(
        {
          error:
            "Gemini returned an unexpected format. Please try again.",
        },
        { status: 502 }
      );
    }

    const productDNA: ProductDNA = {
      productName: parsed.productName,
      productCategory: parsed.productCategory,
      primaryColor: parsed.primaryColor,
      style: parsed.style,
      shortDescription: parsed.shortDescription,
    };

    return NextResponse.json({ productDNA });
  } catch (error) {
    console.error("analyze-product failed:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while analyzing the product.",
      },
      { status: 500 }
    );
  }
}