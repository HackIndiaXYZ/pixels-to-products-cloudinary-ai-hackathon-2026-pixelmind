import type { CampaignWorldType } from "../types/productDNA";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface CloudinaryTransformOptions {
  crop?: "fill" | "pad" | "fit" | "limit" | "thumb";
  world?: CampaignWorldType;
  enhance?: boolean;
  sharpen?: boolean;
  backgroundRemoval?: boolean;
  customTransform?: string;
  shape?: "natural" | "circle" | "star" | "hexagon" | "diamond" | "badge" | "card";
  radius?: string;
}

// Generate world-specific Cloudinary image filter chain
export function getCloudinaryWorldFilter(world?: CampaignWorldType): string {
  switch (world) {
    case "URBAN":
      return "e_contrast:15,e_sharpen:90";
    case "PERFORMANCE":
      return "e_vibrance:25,e_sharpen:100";
    case "LIFESTYLE":
      return "e_improve,e_sharpen:70";
    case "NIGHT":
      return "e_auto_contrast,e_sharpen:80";
    default:
      return "e_improve,e_sharpen:75";
  }
}

// Main Cloudinary asset URL builder with full transformation suite
export function createCloudinaryAssetUrl(
  publicId: string,
  width: number,
  height: number,
  options?: CloudinaryTransformOptions
): string {
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is missing.");
  }

  // Base transformations
  const cropMode = options?.crop || "pad";
  const transforms: string[] = [];

  // Transparent auto-pad or crop fill
  if (cropMode === "pad") {
    transforms.push(`c_pad,w_${width},h_${height},b_transparent`);
  } else {
    transforms.push(`c_${cropMode},w_${width},h_${height}`);
  }

  // Auto quality and WebP/AVIF format optimization
  transforms.push("q_auto,f_auto");

  // Optional background removal
  if (options?.backgroundRemoval) {
    transforms.push("e_background_removal");
  }

  // World-specific visual grading
  if (options?.world) {
    transforms.push(getCloudinaryWorldFilter(options.world));
  } else if (options?.sharpen) {
    transforms.push("e_sharpen:80");
  }

  if (options?.enhance) {
    transforms.push("e_improve");
  }

  if (options?.customTransform) {
    transforms.push(options.customTransform);
  }

  // Radius / Circular mask transformation in Cloudinary
  if (options?.shape === "circle" || options?.radius === "max") {
    transforms.push("r_max");
  } else if (options?.radius) {
    transforms.push(`r_${options.radius}`);
  }

  const transformString = transforms.join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

// Helper to get raw transformation string for UI display and diagnostics
export function getCloudinaryTransformString(
  width: number,
  height: number,
  options?: CloudinaryTransformOptions
): string {
  const cropMode = options?.crop || "pad";
  const parts: string[] = [];
  if (cropMode === "pad") {
    parts.push(`c_pad,w_${width},h_${height},b_transparent`);
  } else {
    parts.push(`c_${cropMode},w_${width},h_${height}`);
  }
  parts.push("q_auto,f_auto");
  if (options?.backgroundRemoval) {
    parts.push("e_background_removal");
  }
  if (options?.world) {
    parts.push(getCloudinaryWorldFilter(options.world));
  } else if (options?.sharpen) {
    parts.push("e_sharpen:80");
  }
  if (options?.enhance) {
    parts.push("e_improve");
  }
  if (options?.customTransform) {
    parts.push(options.customTransform);
  }
  if (options?.shape === "circle" || options?.radius === "max") {
    parts.push("r_max");
  } else if (options?.radius) {
    parts.push(`r_${options.radius}`);
  }
  return parts.join(",");
}

// Dedicated platform CDN URLs with metadata
export function getCloudinaryPlatformAsset(
  publicId: string,
  platform: "instagram-post" | "instagram-story" | "website-banner" | "marketplace",
  world?: CampaignWorldType
): { url: string; transformString: string; dimensions: string; format: string } {
  let w = 1080;
  let h = 1080;
  let aspect = "1:1";

  if (platform === "instagram-story") {
    w = 1080;
    h = 1920;
    aspect = "9:16";
  } else if (platform === "website-banner") {
    w = 1600;
    h = 900;
    aspect = "16:9";
  } else if (platform === "marketplace") {
    w = 1200;
    h = 1200;
    aspect = "1:1";
  }

  const url = createCloudinaryAssetUrl(publicId, w, h, { crop: "pad", world, sharpen: true });
  const transformString = getCloudinaryTransformString(w, h, { crop: "pad", world, sharpen: true });

  return {
    url,
    transformString,
    dimensions: `${w} × ${h} (${aspect})`,
    format: "AVIF / WebP Auto",
  };
}