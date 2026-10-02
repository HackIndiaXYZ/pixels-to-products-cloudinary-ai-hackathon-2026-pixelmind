"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CampaignAsset,
  CampaignCopy,
  CampaignWorldType,
  ProductDNA,
  ProductLayoutArrangement,
  ProductShape,
} from "../types/productDNA";
import {
  createCloudinaryAssetUrl,
  getCloudinaryWorldFilter,
  getCloudinaryTransformString,
} from "../lib/cloudinary";
import CampaignWorldBackdrop from "./CampaignWorldBackdrop";
import AttentionHeatmapOverlay from "./AttentionHeatmapOverlay";
import CampaignScorecardModal from "./CampaignScorecardModal";
import CampaignMediaKitModal from "./CampaignMediaKitModal";
import ProductFrameStager from "./ProductFrameStager";

type UploadedProduct = {
  url: string;
  publicId: string;
};

type RemixStyle = "Minimal" | "Bold" | "Luxury" | "Sporty";
type PlatformTab =
  | "instagram-post"
  | "instagram-story"
  | "video-reel"
  | "website-banner"
  | "marketplace";

type GenerationPhase =
  | "idle"
  | "analyzing" // Analyzing product...
  | "analyzed" // ✓ Product DNA created
  | "writing_copy" // Writing campaign copy...
  | "copy_ready" // ✓ Campaign copy created
  | "building_dna" // Building campaign identity...
  | "dna_ready" // ✓ Campaign DNA created
  | "preparing_creatives" // Preparing platform creatives...
  | "completed"; // ✓ Campaign ready

// Helper: Map detected color name to Hex color
function getHexForColor(colorName: string): string {
  const c = (colorName || "").toLowerCase().trim();
  if (c.includes("blue") || c.includes("navy") || c.includes("azure")) return "#2563eb";
  if (c.includes("red") || c.includes("crimson") || c.includes("ruby")) return "#dc2626";
  if (c.includes("green") || c.includes("emerald") || c.includes("mint") || c.includes("olive")) return "#059669";
  if (c.includes("black") || c.includes("dark") || c.includes("charcoal")) return "#18181b";
  if (c.includes("white") || c.includes("cream") || c.includes("ivory") || c.includes("silver")) return "#94a3b8";
  if (c.includes("gold") || c.includes("yellow") || c.includes("amber")) return "#d97706";
  if (c.includes("orange") || c.includes("coral")) return "#ea580c";
  if (c.includes("purple") || c.includes("violet") || c.includes("plum")) return "#7c3aed";
  if (c.includes("pink") || c.includes("rose") || c.includes("magenta")) return "#db2777";
  if (c.includes("brown") || c.includes("tan") || c.includes("beige") || c.includes("coffee")) return "#78350f";
  if (c.includes("teal") || c.includes("cyan")) return "#0d9488";
  return "#8b5cf6"; // Modern electric violet default
}

// Helper: Complementary accent color
function getComplementaryColor(colorName: string): string {
  const c = (colorName || "").toLowerCase().trim();
  if (c.includes("blue")) return "#f59e0b";
  if (c.includes("red")) return "#22d3ee";
  if (c.includes("green")) return "#ec4899";
  if (c.includes("black")) return "#ec4899";
  if (c.includes("gold") || c.includes("yellow")) return "#6366f1";
  if (c.includes("purple")) return "#10b981";
  return "#f43f5e";
}

// Helper: Infer audience from category & style
function inferAudience(category: string, style: string): string {
  const cat = (category || "").toLowerCase();
  const st = (style || "").toLowerCase();
  if (cat.includes("shoe") || cat.includes("sneaker") || cat.includes("footwear")) {
    return "Urban trendsetters, style-conscious commuters & sneaker collectors aged 20–35.";
  }
  if (cat.includes("cloth") || cat.includes("apparel") || cat.includes("fashion") || cat.includes("wear")) {
    return "Contemporary fashion seekers who prioritize versatile everyday elegance.";
  }
  if (cat.includes("tech") || cat.includes("gadget") || cat.includes("electronic") || cat.includes("audio") || cat.includes("phone")) {
    return "Digital creators, power users, and early tech adopters seeking high performance.";
  }
  if (cat.includes("beauty") || cat.includes("skin") || cat.includes("cosmetic")) {
    return "Mindful wellness enthusiasts seeking clean, high-performance skincare rituals.";
  }
  if (cat.includes("watch") || cat.includes("jewelry") || st.includes("luxury")) {
    return "Affluent connoisseurs seeking bespoke craftsmanship and distinguished presence.";
  }
  if (cat.includes("sport") || cat.includes("fitness") || st.includes("sport")) {
    return "Athletes, runners, and fitness enthusiasts driven by peak performance.";
  }
  if (cat.includes("home") || cat.includes("furniture") || cat.includes("decor")) {
    return "Design-forward homeowners curating modern, warm living spaces.";
  }
  return "Discerning consumers seeking quality, modern design, and functional excellence.";
}

// Helper to parse headline into bold lines and cursive accent word (matching high-end reference layout)
function parseHeadline(headline?: string): { line1: string; line2: string; scriptWord: string } {
  if (!headline) {
    return { line1: "BUILT FOR", line2: "BIGGER", scriptWord: "Dreams" };
  }
  const clean = headline.replace(/["!.]/g, "").trim();
  const words = clean.split(/\s+/);
  if (words.length <= 1) {
    return { line1: "BUILT FOR", line2: words[0]?.toUpperCase() || "NEXT", scriptWord: "Dreams" };
  }
  if (words.length === 2) {
    return {
      line1: words[0].toUpperCase(),
      line2: "NEXT",
      scriptWord: words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase(),
    };
  }
  if (words.length === 3) {
    return {
      line1: words[0].toUpperCase(),
      line2: words[1].toUpperCase(),
      scriptWord: words[2].charAt(0).toUpperCase() + words[2].slice(1).toLowerCase(),
    };
  }
  // 4 or more words
  const scriptWord = words[words.length - 1].charAt(0).toUpperCase() + words[words.length - 1].slice(1).toLowerCase();
  const line2 = words[words.length - 2].toUpperCase();
  const line1 = words.slice(0, words.length - 2).join(" ").toUpperCase();
  return { line1, line2, scriptWord };
}

// Brand name extractor from product name
function extractBrandName(productName?: string): string {
  if (!productName) return "NEXA";
  const first = productName.trim().split(/\s+/)[0];
  return first && first.length >= 2 ? first.toUpperCase() : "NEXA";
}

export interface WorldEnvironmentConfig {
  name: string;
  subtitle: string;
  wallGradient: string;
  sunBeamGradient: string;
  sunlightGlow: string;
  foliageStyle: string;
  ledgeGradient: string;
  bevelHighlight: string;
  grainOpacity: string;
  contactShadow: string;
  textColor: string;
  headlineNavy: string;
  scriptAccentColor: string;
  badgeRingColor: string;
  badgeLabelColor: string;
  badgeBg: string;
  ctaBg: string;
  ctaHoverBg: string;
  ctaTextColor: string;
  vibeQuote: string;
  cloudinaryFilter: string;
}

export const WORLD_CONFIGS: Record<CampaignWorldType, WorldEnvironmentConfig> = {
  LIFESTYLE: {
    name: "Architectural Daylight",
    subtitle: "Warm natural sun, lush garden bokeh, and honed concrete ledge (Original Studio Aesthetic)",
    wallGradient: "from-[#F7F5F0] via-[#EFEBE3] to-[#DDD6CB]",
    sunBeamGradient: "from-white/60 via-transparent to-[#0A1A2E]/[0.08]",
    sunlightGlow: "rgba(255,255,255,0.75)",
    foliageStyle: "bg-gradient-to-tr from-emerald-900/35 via-emerald-700/20 to-transparent",
    ledgeGradient: "from-[#8E95A5] via-[#6D7484] to-[#4F5564]",
    bevelHighlight: "from-[#DDE1EB] via-[#CAD1DE] to-[#B2B8C6]",
    grainOpacity: "opacity-25",
    contactShadow: "bg-[#071526]/55",
    textColor: "#0A2540",
    headlineNavy: "text-[#0A2540]",
    scriptAccentColor: "text-[#0D3360]",
    badgeRingColor: "border-[#0A2540]/70",
    badgeLabelColor: "text-[#0A2540]",
    badgeBg: "bg-white/50",
    ctaBg: "bg-[#0A2B54]",
    ctaHoverBg: "hover:bg-[#071F3D]",
    ctaTextColor: "text-white",
    vibeQuote: "More than just shoes, it's a vibe.",
    cloudinaryFilter: "e_improve,e_sharpen:70",
  },
  URBAN: {
    name: "Brutalist Urban Concrete",
    subtitle: "Industrial cast concrete, sharp afternoon sunlight, and street pavement contrast",
    wallGradient: "from-[#E4E7ED] via-[#D3D8E2] to-[#B5BDCB]",
    sunBeamGradient: "from-white/70 via-transparent to-[#111827]/[0.15]",
    sunlightGlow: "rgba(255,255,255,0.85)",
    foliageStyle: "bg-gradient-to-tr from-slate-900/40 via-blue-950/20 to-transparent",
    ledgeGradient: "from-[#5A6375] via-[#3F4654] to-[#252B36]",
    bevelHighlight: "from-[#F1F5F9] via-[#CBD5E1] to-[#94A3B8]",
    grainOpacity: "opacity-35",
    contactShadow: "bg-[#020617]/70",
    textColor: "#0F172A",
    headlineNavy: "text-[#0F172A]",
    scriptAccentColor: "text-[#1E3A8A]",
    badgeRingColor: "border-[#0F172A]/75",
    badgeLabelColor: "text-[#0F172A]",
    badgeBg: "bg-white/60",
    ctaBg: "bg-[#1E3A8A]",
    ctaHoverBg: "hover:bg-[#172554]",
    ctaTextColor: "text-white",
    vibeQuote: "Born for the pavement, made for the city.",
    cloudinaryFilter: "e_contrast:15,e_sharpen:90",
  },
  PERFORMANCE: {
    name: "Kinetic Track & Pavilion",
    subtitle: "Aerodynamic pavilion wall, crisp morning sun ray, and honed athletic plinth",
    wallGradient: "from-[#EDF5FD] via-[#DCEDFC] to-[#C2DEF5]",
    sunBeamGradient: "from-cyan-100/70 via-transparent to-[#0369A1]/[0.10]",
    sunlightGlow: "rgba(224,242,254,0.9)",
    foliageStyle: "bg-gradient-to-tr from-teal-900/30 via-cyan-900/20 to-transparent",
    ledgeGradient: "from-[#647C96] via-[#485D75] to-[#2C3B4E]",
    bevelHighlight: "from-[#BAE6FD] via-[#7DD3FC] to-[#38BDF8]",
    grainOpacity: "opacity-20",
    contactShadow: "bg-[#082F49]/60",
    textColor: "#034375",
    headlineNavy: "text-[#034375]",
    scriptAccentColor: "text-[#0284C7]",
    badgeRingColor: "border-[#034375]/75",
    badgeLabelColor: "text-[#034375]",
    badgeBg: "bg-white/60",
    ctaBg: "bg-[#0284C7]",
    ctaHoverBg: "hover:bg-[#0369A1]",
    ctaTextColor: "text-white",
    vibeQuote: "Engineered for speed, built for the podium.",
    cloudinaryFilter: "e_vibrance:25,e_sharpen:100",
  },
  NIGHT: {
    name: "Obsidian Spotlight Gallery",
    subtitle: "Dramatic museum spotlight, midnight black terrazzo plinth, and gold specular accents",
    wallGradient: "from-[#2A2E3D] via-[#1B1E28] to-[#0E1017]",
    sunBeamGradient: "from-white/40 via-transparent to-black/[0.4]",
    sunlightGlow: "rgba(255,255,255,0.45)",
    foliageStyle: "bg-gradient-to-tr from-amber-600/15 via-violet-900/20 to-transparent",
    ledgeGradient: "from-[#333847] via-[#1F222C] to-[#12141A]",
    bevelHighlight: "from-[#FDE68A] via-[#E2E8F0] to-[#94A3B8]",
    grainOpacity: "opacity-40",
    contactShadow: "bg-black/85",
    textColor: "#F8FAFC",
    headlineNavy: "text-[#F8FAFC]",
    scriptAccentColor: "text-[#F59E0B]",
    badgeRingColor: "border-white/50",
    badgeLabelColor: "text-white",
    badgeBg: "bg-black/50 backdrop-blur-sm",
    ctaBg: "bg-[#D97706]",
    ctaHoverBg: "hover:bg-[#B45309]",
    ctaTextColor: "text-slate-950 font-black",
    vibeQuote: "When the sun sets, the icon shines.",
    cloudinaryFilter: "e_auto_contrast,e_sharpen:80",
  },
};

export default function ProductUpload() {
  const [product, setProduct] = useState<UploadedProduct | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productDNA, setProductDNA] = useState<ProductDNA | null>(null);

  const [campaignCopy, setCampaignCopy] = useState<CampaignCopy | null>(null);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [campaignAssets, setCampaignAssets] = useState<CampaignAsset[]>([]);

  const [error, setError] = useState<string | null>(null);

  // Studio UI states
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>("idle");
  const [activeTab, setActiveTab] = useState<PlatformTab>("instagram-post");
  const [remixStyle, setRemixStyle] = useState<RemixStyle>("Bold");
  const [campaignWorld, setCampaignWorld] = useState<CampaignWorldType>("URBAN");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Platform-Specific Interactive States
  const [carouselSlide, setCarouselSlide] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [storyVote, setStoryVote] = useState<"A" | "B" | null>(null);
  const [marketplaceQty, setMarketplaceQty] = useState(1);
  const [marketplaceThumb, setMarketplaceThumb] = useState(0);
  const [cartToast, setCartToast] = useState(false);
  const [isRegeneratingPlatform, setIsRegeneratingPlatform] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // AI Creative Director States (user natural language prompt & directing)
  const [aiDirectorPrompt, setAiDirectorPrompt] = useState("");
  const [isDirectingAI, setIsDirectingAI] = useState(false);
  const [directorCommentary, setDirectorCommentary] = useState<string | null>(null);
  const [customHeadline, setCustomHeadline] = useState<{ line1: string; line2: string; scriptWord: string } | null>(null);
  const [customSubheadline, setCustomSubheadline] = useState<string[] | null>(null);
  const [customBadges, setCustomBadges] = useState<Array<{ icon: string; title: string }> | null>(null);
  const [customVibeQuote, setCustomVibeQuote] = useState<string | null>(null);
  const [customCTA, setCustomCTA] = useState<string | null>(null);
  const [customCloudinaryFilter, setCustomCloudinaryFilter] = useState<string | null>(null);

  // Dynamic Shape & Layout States directed by AI or manual control
  const [productShape, setProductShape] = useState<ProductShape>("natural");
  const [layoutArrangement, setLayoutArrangement] = useState<ProductLayoutArrangement>("staged-plinth");
  const [productRotation, setProductRotation] = useState<number>(-16);
  const [frameGlowColor, setFrameGlowColor] = useState<string>("#38BDF8");

  // Cloudinary Studio interactive engine states
  const [cldBgRemoval, setCldBgRemoval] = useState(false);
  const [cldEnhance, setCldEnhance] = useState(false);
  const [cldSharpen, setCldSharpen] = useState(true);

  // Neuromarketing Attention Heatmap & Conversion Intelligence
  const [showAttentionHeatmap, setShowAttentionHeatmap] = useState(false);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [showMediaKitModal, setShowMediaKitModal] = useState(false);

  // Platform 5: Kinetic Video Reel States
  const [isPlayingReel, setIsPlayingReel] = useState(true);
  const [reelTime, setReelTime] = useState(0);
  const [reelAudioActive, setReelAudioActive] = useState(true);
  const [reelCameraMode, setReelCameraMode] = useState<"cinematic" | "pulse" | "glitch">("cinematic");

  // Smooth Kinetic Reel Ticker
  useEffect(() => {
    if (!isPlayingReel || activeTab !== "video-reel") return;
    const timer = setInterval(() => {
      setReelTime((prev) => (prev >= 6.0 ? 0 : Number((prev + 0.1).toFixed(1))));
    }, 100);
    return () => clearInterval(timer);
  }, [isPlayingReel, activeTab]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // EXACT PRESERVED CLOUDINARY UPLOAD LOGIC
  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary environment variables are missing.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Upload failed. Please try again.");
    }

    const data = await res.json();

    return {
      url: data.secure_url as string,
      publicId: data.public_id as string,
    };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const processUploadedFile = async (file: File) => {
    setError(null);
    setProductDNA(null);
    setCampaignCopy(null);
    setCampaignAssets([]);
    setGenerationPhase("idle");
    setCarouselSlide(0);
    setStoryVote(null);
    setIsUploading(true);

    try {
      const result = await uploadToCloudinary(file);
      setProduct(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // FULL PIPELINE GENERATION WITH PLATFORM-NATIVE SUITE
  const handleGenerateCompleteCampaign = async () => {
    if (!product) return;

    setError(null);
    setGenerationPhase("analyzing");
    setIsAnalyzing(true);

    try {
      // Step 1: Product DNA via Multimodal Vision AI
      const analyzeResponse = await fetch("/api/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: product.url }),
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(analyzeData.error || "Unable to analyze the product.");
      }

      const dna = analyzeData.productDNA as ProductDNA;
      setProductDNA(dna);
      setIsAnalyzing(false);
      setGenerationPhase("analyzed");

      // Step 2: Campaign Copy with Platform-Native Suite
      setGenerationPhase("writing_copy");
      setIsGeneratingCampaign(true);

      const copyResponse = await fetch("/api/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDNA: dna,
          campaignWorld,
        }),
      });

      const copyData = await copyResponse.json();

      if (!copyResponse.ok) {
        throw new Error(copyData.error || "Unable to generate campaign copy.");
      }

      const copy = copyData.campaignCopy as CampaignCopy;
      setCampaignCopy(copy);
      setIsGeneratingCampaign(false);
      setGenerationPhase("copy_ready");

      // Step 3: Deriving Campaign DNA
      setGenerationPhase("building_dna");
      await new Promise((resolve) => setTimeout(resolve, 400));
      setGenerationPhase("dna_ready");

      // Step 4: Generating Cloudinary Visual Assets
      setGenerationPhase("preparing_creatives");
      const assets = buildAssetsList(product.publicId);
      setCampaignAssets(assets);
      setGenerationPhase("completed");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the campaign."
      );
      setGenerationPhase("idle");
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingCampaign(false);
    }
  };

  // PER-PLATFORM REGENERATE FUNCTION
  const handleRegeneratePlatform = async (platformKey: PlatformTab) => {
    if (!productDNA) return;

    const platformApiMap: Record<PlatformTab, string> = {
      "instagram-post": "instagram",
      "instagram-story": "story",
      "video-reel": "story",
      "website-banner": "website",
      marketplace: "marketplace",
    };

    const targetPlatform = platformApiMap[platformKey];
    setIsRegeneratingPlatform(platformKey);

    try {
      const response = await fetch("/api/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDNA,
          campaignWorld,
          platform: targetPlatform,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to regenerate platform creative.");
      }

      const newCopy = data.campaignCopy as CampaignCopy;

      setCampaignCopy((prev) => {
        if (!prev) return newCopy;
        return {
          ...prev,
          headline: newCopy.headline || prev.headline,
          instagram: newCopy.instagram || prev.instagram,
          story: newCopy.story || prev.story,
          website: newCopy.website || prev.website,
          marketplace: newCopy.marketplace || prev.marketplace,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate creative.");
    } finally {
      setIsRegeneratingPlatform(null);
    }
  };

  // EXPORT PREVIEW DOWNLOADER
  const handleExportCreative = (platformName: string, title: string) => {
    if (!product) return;

    setExportNotice(`Exporting ${platformName} creative...`);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = platformName === "story" ? 1920 : platformName === "website" ? 608 : 1080;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        window.open(getActiveAssetUrl(), "_blank");
        setExportNotice(null);
        return;
      }

      // Render architectural daylight background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, "#F7F5F0");
      bgGradient.addColorStop(0.5, "#EFEBE3");
      bgGradient.addColorStop(1, "#DDD6CB");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Angled concrete plinth at bottom
      ctx.fillStyle = "#6D7484";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.72);
      ctx.lineTo(canvas.width, canvas.height * 0.64);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Top bevel highlight of concrete ledge
      ctx.strokeStyle = "#DDE1EB";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.72);
      ctx.lineTo(canvas.width, canvas.height * 0.64);
      ctx.stroke();

      // Header branding
      ctx.fillStyle = "#0A2540";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`▲ ${extractBrandName(productDNA?.productName)}   ·   STEP HIGHER`, 60, 80);

      ctx.font = "bold 16px sans-serif";
      ctx.fillText("COMFORT  /  STYLE  /  EVERYDAY", canvas.width - 340, 80);

      // Main Headline
      const parts = parseHeadline(title || productDNA?.productName || "BUILT FOR BIGGER DREAMS");
      ctx.fillStyle = "#0A2540";
      ctx.font = "900 52px sans-serif";
      ctx.fillText(parts.line1, 60, 150);
      ctx.fillText(parts.line2, 60, 205);

      // Script accent
      ctx.fillStyle = "#0D3360";
      ctx.font = "italic bold 64px cursive";
      ctx.fillText(parts.scriptWord, 60, 275);

      // Subtitle
      ctx.fillStyle = "#1E3A5F";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("Lightweight. Stylish.", 60, 320);
      ctx.fillText("Made for your every move.", 60, 348);

      // Draw actual product image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = product.url;

      img.onload = () => {
        // Draw soft contact shadow
        ctx.fillStyle = "rgba(7, 21, 38, 0.45)";
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.58, canvas.height * 0.73, 260, 40, 0.2, 0, 2 * Math.PI);
        ctx.fill();

        const imgSize = canvas.width * 0.62;
        const imgX = canvas.width * 0.32;
        const imgY = canvas.height * 0.38;
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);

        // Handwritten quote on concrete ledge
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "italic bold 32px cursive";
        ctx.fillText(`More than just ${productCategory}, it's a vibe.`, 60, canvas.height - 110);

        // Footer tagline
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`▲ ${extractBrandName(productDNA?.productName)}   |   PERFORMANCE MEETS STYLE   |   www.${extractBrandName(productDNA?.productName).toLowerCase()}.com`, 60, canvas.height - 40);

        try {
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `pixelmind-${platformName}-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          setExportNotice("Export complete! Download started.");
          setTimeout(() => setExportNotice(null), 3000);
        } catch {
          window.open(getActiveAssetUrl(), "_blank");
          setExportNotice("Opened high-res Cloudinary asset in new tab.");
          setTimeout(() => setExportNotice(null), 3000);
        }
      };

      img.onerror = () => {
        window.open(getActiveAssetUrl(), "_blank");
        setExportNotice("Opened high-res Cloudinary asset in new tab.");
        setTimeout(() => setExportNotice(null), 3000);
      };
    } catch {
      window.open(getActiveAssetUrl(), "_blank");
      setExportNotice(null);
    }
  };

  const buildAssetsList = (
    publicId: string,
    world: CampaignWorldType = campaignWorld,
    customFilter?: string
  ): CampaignAsset[] => {
    const opts = {
      crop: "pad" as const,
      world,
      backgroundRemoval: cldBgRemoval,
      enhance: cldEnhance,
      sharpen: cldSharpen,
      customTransform: customFilter || customCloudinaryFilter || undefined,
    };
    return [
      {
        name: "Instagram Post",
        format: "1:1",
        width: 1080,
        height: 1080,
        url: createCloudinaryAssetUrl(publicId, 1080, 1080, opts),
      },
      {
        name: "Instagram Story",
        format: "9:16",
        width: 1080,
        height: 1920,
        url: createCloudinaryAssetUrl(publicId, 1080, 1920, opts),
      },
      {
        name: "Website Banner",
        format: "16:9",
        width: 1600,
        height: 900,
        url: createCloudinaryAssetUrl(publicId, 1600, 900, opts),
      },
      {
        name: "Marketplace Image",
        format: "1:1",
        width: 1200,
        height: 1200,
        url: createCloudinaryAssetUrl(publicId, 1200, 1200, opts),
      },
    ];
  };

  // AI CREATIVE DIRECTOR INTERACTIVE HANDLER
  const handleDirectCreative = async (promptInput?: string) => {
    const query = (promptInput || aiDirectorPrompt).trim();
    if (!query || !product) return;

    setIsDirectingAI(true);
    setError(null);

    try {
      const res = await fetch("/api/direct-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: query,
          productDNA,
          campaignWorld,
          currentHeadline: customHeadline ? `${customHeadline.line1} ${customHeadline.line2} ${customHeadline.scriptWord}` : (campaignCopy?.headline || "BUILT FOR BIGGER Dreams"),
          currentCTA: customCTA || campaignCopy?.callToAction || "Shop Now",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to apply creative direction.");
      }

      const dir = data.directorResponse;
      if (dir) {
        if (dir.headlineLine1 && dir.headlineLine2) {
          setCustomHeadline({
            line1: dir.headlineLine1,
            line2: dir.headlineLine2,
            scriptWord: dir.scriptWord || "Dreams",
          });
        }
        if (dir.subheadlineLines) {
          setCustomSubheadline(dir.subheadlineLines);
        }
        if (dir.bullets) {
          setCustomBadges(dir.bullets);
        }
        if (dir.vibeQuote) {
          setCustomVibeQuote(dir.vibeQuote);
        }
        if (dir.callToAction) {
          setCustomCTA(dir.callToAction);
        }
        if (dir.campaignWorld && dir.campaignWorld !== campaignWorld) {
          setCampaignWorld(dir.campaignWorld);
        }
        if (dir.cloudinaryFilter) {
          setCustomCloudinaryFilter(dir.cloudinaryFilter);
        }
        if (dir.directorCommentary) {
          setDirectorCommentary(dir.directorCommentary);
        }
        if (dir.productShape) {
          setProductShape(dir.productShape);
        }
        if (dir.layoutArrangement) {
          setLayoutArrangement(dir.layoutArrangement);
        }
        if (typeof dir.productRotation === "number") {
          setProductRotation(dir.productRotation);
        }
        if (dir.frameGlowColor) {
          setFrameGlowColor(dir.frameGlowColor);
        }

        // Sync Cloudinary assets with the updated world/filter
        const updatedAssets = buildAssetsList(
          product.publicId,
          dir.campaignWorld || campaignWorld,
          dir.cloudinaryFilter
        );
        setCampaignAssets(updatedAssets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to direct creative.");
    } finally {
      setIsDirectingAI(false);
    }
  };

  // SWITCH CAMPAIGN WORLD & REGENERATE ASSETS / COPY
  const handleSelectCampaignWorld = async (newWorld: CampaignWorldType, autoRegenerateCopy = false) => {
    setCampaignWorld(newWorld);
    setCustomCloudinaryFilter(null);

    if (product) {
      const updatedAssets = buildAssetsList(product.publicId, newWorld);
      setCampaignAssets(updatedAssets);
    }

    if (autoRegenerateCopy && productDNA) {
      setIsGeneratingCampaign(true);
      try {
        const copyResponse = await fetch("/api/generate-campaign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productDNA,
            campaignWorld: newWorld,
          }),
        });
        const copyData = await copyResponse.json();
        if (copyResponse.ok && copyData.campaignCopy) {
          setCampaignCopy(copyData.campaignCopy as CampaignCopy);
        }
      } catch (err) {
        console.error("Failed to regenerate copy for new world", err);
      } finally {
        setIsGeneratingCampaign(false);
      }
    }
  };

  // PRESERVED RESET FUNCTIONALITY
  const handleUploadAnother = () => {
    setProduct(null);
    setProductDNA(null);
    setCampaignCopy(null);
    setCampaignAssets([]);
    setGenerationPhase("idle");
    setCarouselSlide(0);
    setStoryVote(null);
    setError(null);

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  // Quick Copy Helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Derive frontend Campaign DNA
  const derivedVisualDirection = (() => {
    if (remixStyle === "Minimal") return "Architectural • Pure • Understated";
    if (remixStyle === "Bold") return "High-Impact • Vibrant • Unapologetic";
    if (remixStyle === "Luxury") return "Haute Couture • Opulent • Timeless";
    if (remixStyle === "Sporty") return "Dynamic • High-Performance • Technical";
    return "Bold • Energetic • Premium";
  })();

  const derivedTone = (() => {
    if (remixStyle === "Minimal") return "Refined • Essential • Direct";
    if (remixStyle === "Bold") return "Electrifying • Punchy • Assertive";
    if (remixStyle === "Luxury") return "Sophisticated • Aspirational • Exclusive";
    if (remixStyle === "Sporty") return "Kinetic • Tenacious • Motivational";
    return "Confident • Modern • Motivational";
  })();

  const primaryHex = productDNA ? getHexForColor(productDNA.primaryColor) : "#8b5cf6";
  const complementaryHex = productDNA ? getComplementaryColor(productDNA.primaryColor) : "#ec4899";
  const audience = productDNA
    ? inferAudience(productDNA.productCategory, productDNA.style)
    : "Modern lifestyle consumers seeking quality & distinction.";

  // Get active asset URL for "Open Full Size"
  const getActiveAssetUrl = (): string => {
    if (!product) return "#";
    if (activeTab === "instagram-post") {
      return (
        campaignAssets.find((a) => a.name === "Instagram Post")?.url ||
        createCloudinaryAssetUrl(product.publicId, 1080, 1080)
      );
    }
    if (activeTab === "instagram-story") {
      return (
        campaignAssets.find((a) => a.name === "Instagram Story")?.url ||
        createCloudinaryAssetUrl(product.publicId, 1080, 1920)
      );
    }
    if (activeTab === "website-banner") {
      return (
        campaignAssets.find((a) => a.name === "Website Banner")?.url ||
        createCloudinaryAssetUrl(product.publicId, 1600, 900)
      );
    }
    return (
      campaignAssets.find((a) => a.name === "Marketplace Image")?.url ||
      createCloudinaryAssetUrl(product.publicId, 1200, 1200)
    );
  };

  // Active platform payload shortcuts with defaults
  const igContent = campaignCopy?.instagram || {
    hook: campaignCopy?.headline || "Own The Streets.",
    caption: `${campaignCopy?.headline || "Designed for daily distinction"}. Engineered for everyday comfort and modern style. Every detail crafted to stand out.`,
    hashtags: ["#Streetwear", "#Style", "#Drop01", "#PixelMindCampaign"],
    slides: [
      { title: campaignCopy?.headline || "Own The Streets", subtitle: "Designed for movement. Built for everyday style.", tag: "DROP 01 // HERO" },
      { title: "Engineered For Comfort", subtitle: "Adaptive cushioning and breathable mesh architecture.", tag: "INNOVATION" },
      { title: "Born For The City", subtitle: "Every silhouette tuned for daily utility and modern edge.", tag: "LIFESTYLE" },
      { title: "Claim Yours Today", subtitle: "Strictly limited allocations available online now.", tag: "FINAL CALL", cta: campaignCopy?.callToAction || "Shop Now" },
    ],
    cta: campaignCopy?.callToAction || "Shop Now",
  };

  const storyContent = campaignCopy?.story || {
    headline: "BUILT FOR SPEED. MADE FOR STYLE.",
    supportingText: "The next evolution in daily performance and street aesthetic.",
    stickerText: "WOULD YOU WEAR THIS?",
    interaction: {
      question: "Rate the fit:",
      optionA: "🔥 100% Fire",
      optionB: "⚡ Must Cop",
    },
    cta: "Swipe Up to Shop",
  };

  const webContent = campaignCopy?.website || {
    headline: "Architected For The Modern Street.",
    subheadline: "Experience unmatched versatility, precision engineering, and timeless aesthetic.",
    primaryCTA: "Explore Collection",
    secondaryCTA: "View Lookbook",
    benefits: [
      "Lightweight ergonomic construction",
      "High-traction reinforced outsole",
      "All-day adaptive cushioning support",
    ],
    announcement: "NEW ARRIVAL // LIMITED QUANTITIES AVAILABLE",
  };

  const marketContent = campaignCopy?.marketplace || {
    productTitle: `${productDNA?.productName || "Apex Collection"} - Official Edition`,
    description: "Engineered for everyday durability and modern distinction. Featuring premium materials and signature accents.",
    features: [
      "Lightweight breathable construction",
      "Enhanced shock-absorbing heel",
      "Flexible durable grip tread",
      "Signature modern aesthetic",
    ],
    price: "$129.00",
    rating: "4.9",
    reviewsCount: "1,480",
    cta: "Add to Cart",
  };

  const brandName = extractBrandName(productDNA?.productName);
  const defaultHeadlineParts = parseHeadline(campaignCopy?.headline || igContent.hook);
  const headlineParts = customHeadline || defaultHeadlineParts;
  const storyHeadlineParts = customHeadline || parseHeadline(storyContent.headline);
  const webHeadlineParts = customHeadline || parseHeadline(webContent.headline);
  const productCategory = productDNA?.productCategory || "shoes";
  const currentWorldConfig = WORLD_CONFIGS[campaignWorld] || WORLD_CONFIGS.URBAN;

  const activeSubheadlineLines = customSubheadline || [
    "PREMIUM COMFORT.",
    "URBAN STYLE.",
    "ALL DAY.",
  ];

  const activeBadges = customBadges || [
    { icon: "feather", title: "ULTRA LIGHTWEIGHT" },
    { icon: "mesh", title: "BREATHABLE MESH" },
    { icon: "shield", title: "DURABLE SOLE" },
    { icon: "comfort", title: "ALL-DAY COMFORT" },
  ];

  const activeVibeQuote = customVibeQuote || currentWorldConfig.vibeQuote;
  const activeCTA = customCTA || campaignCopy?.callToAction || "SHOP NOW";

  const activeCloudinaryProductUrl = product
    ? createCloudinaryAssetUrl(product.publicId, 1080, 1080, {
        crop: "pad",
        world: campaignWorld,
        backgroundRemoval: cldBgRemoval,
        enhance: cldEnhance,
        sharpen: cldSharpen,
        customTransform: customCloudinaryFilter || undefined,
        shape: productShape === "circle" ? "circle" : undefined,
      })
    : "";
  const activeCloudinaryThumbUrl = product
    ? createCloudinaryAssetUrl(product.publicId, 480, 480, {
        crop: "pad",
        world: campaignWorld,
        backgroundRemoval: cldBgRemoval,
        enhance: cldEnhance,
        sharpen: cldSharpen,
        customTransform: customCloudinaryFilter || undefined,
        shape: productShape === "circle" ? "circle" : undefined,
      })
    : "";
  const activeCloudinaryTransformChain = product
    ? getCloudinaryTransformString(1080, 1080, {
        crop: "pad",
        world: campaignWorld,
        backgroundRemoval: cldBgRemoval,
        enhance: cldEnhance,
        sharpen: cldSharpen,
        customTransform: customCloudinaryFilter || undefined,
        shape: productShape === "circle" ? "circle" : undefined,
      })
    : "";

  return (
    <div className="w-full space-y-10">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ----------------------------------------------------
          HERO / DASHBOARD UPLOAD (WHEN NO PRODUCT UPLOADED)
      ---------------------------------------------------- */}
      {!product && (
        <div className="mx-auto max-w-3xl">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center transition-all ${
              isDragging
                ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                : "border-white/[0.12] bg-[#111426]/70 hover:border-violet-500/60 hover:bg-[#15182B]/90 shadow-2xl hover:shadow-violet-600/10"
            }`}
          >
            {/* Ambient Radial Spotlight */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-violet-600/10 blur-3xl group-hover:scale-125 transition-transform duration-500" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-pink-600/10 blur-3xl group-hover:scale-125 transition-transform duration-500" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-md group-hover:shadow-violet-600/30 group-hover:scale-105">
              {isUploading ? (
                <svg
                  className="h-8 w-8 animate-spin text-violet-400 group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              )}
            </div>

            <h3 className="mt-5 text-lg sm:text-2xl font-bold text-white tracking-tight">
              {isUploading ? "Uploading to Cloudinary..." : "Drop your product image"}
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
              or <span className="font-semibold text-violet-400 underline decoration-violet-400/50 underline-offset-4">upload from your device</span>
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="rounded-md bg-white/[0.04] border border-white/[0.08] px-2.5 py-1">
                PNG, JPG or WEBP · Max 10MB
              </span>
              <span className="rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2.5 py-1">
                Powered by Cloudinary · Optimized Delivery
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          UPLOADED PRODUCT STAGE & HUD PROGRESS TRACKER
      ---------------------------------------------------- */}
      {product && (
        <div className="space-y-10">
          {/* PRODUCT FIDELITY STATEMENT BANNER */}
          <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#111426] to-[#0B0D18] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/30 font-bold">
                ★
              </span>
              <div>
                <p className="font-bold text-white">
                  Your product stays the same. Your campaign adapts to every platform.
                </p>
                <p className="text-slate-400 text-[11px]">
                  The uploaded photo is the immutable product source of truth. AI generates the visual world, storytelling, and multi-channel creative architecture around it.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-md bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 text-[10px] font-mono text-violet-300">
              Zero Synthetic Replacement
            </div>
          </div>

          {/* STAGED PRODUCT CARD */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111426] p-6 sm:p-7 shadow-xl relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Product Thumbnail */}
              <div className="relative h-40 w-40 sm:h-44 sm:w-44 shrink-0 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0B0D18] p-2 shadow-inner group">
                <img
                  src={product.url}
                  alt="Uploaded product"
                  className="h-full w-full object-contain transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 rounded bg-black/80 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono font-bold text-violet-300 border border-white/[0.08]">
                  Cloudinary Source
                </div>
              </div>

              {/* Action Details */}
              <div className="flex-1 text-center md:text-left space-y-2.5">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Product Staged &amp; Ready
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Staged for Commercial Campaign Synthesis
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  Hosted on Cloudinary media delivery network. Launch the AI pipeline to analyze product intelligence and construct cross-platform marketing creatives.
                </p>

                {/* Primary Pipeline Action */}
                <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  {!productDNA && (
                    <button
                      type="button"
                      onClick={handleGenerateCompleteCampaign}
                      disabled={isAnalyzing || isGeneratingCampaign}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
                    >
                      {isAnalyzing || isGeneratingCampaign ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Synthesizing Studio...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Generate Full Campaign Studio</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleUploadAnother}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                  >
                    Replace Image
                  </button>
                </div>
              </div>
            </div>

            {/* HUD LOADING TRACKER */}
            {generationPhase !== "idle" && (
              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Step 1 */}
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition-all ${
                      generationPhase === "analyzing"
                        ? "border-violet-500/50 bg-violet-500/10 text-violet-200 shadow-sm"
                        : productDNA
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                    }`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold">
                      {productDNA ? (
                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                      ) : generationPhase === "analyzing" ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                      ) : (
                        "1"
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {productDNA ? "Product DNA created" : "AI Vision Analysis..."}
                      </p>
                      <p className="text-[10px] text-slate-400">Multimodal Intelligence</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition-all ${
                      generationPhase === "writing_copy"
                        ? "border-violet-500/50 bg-violet-500/10 text-violet-200 shadow-sm"
                        : campaignCopy
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                    }`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold">
                      {campaignCopy ? (
                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                      ) : generationPhase === "writing_copy" ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                      ) : (
                        "2"
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {campaignCopy ? "Campaign copy created" : "Platform copy..."}
                      </p>
                      <p className="text-[10px] text-slate-400">Conversion Copywriter</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition-all ${
                      generationPhase === "building_dna"
                        ? "border-violet-500/50 bg-violet-500/10 text-violet-200 shadow-sm"
                        : campaignAssets.length > 0 || generationPhase === "dna_ready" || generationPhase === "completed"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                    }`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold">
                      {campaignAssets.length > 0 || generationPhase === "dna_ready" || generationPhase === "completed" ? (
                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                      ) : generationPhase === "building_dna" ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                      ) : (
                        "3"
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {campaignAssets.length > 0 || generationPhase === "dna_ready" || generationPhase === "completed"
                          ? "Campaign DNA created"
                          : "Campaign World sync..."}
                      </p>
                      <p className="text-[10px] text-slate-400">Cross-Platform Sync</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition-all ${
                      generationPhase === "preparing_creatives"
                        ? "border-violet-500/50 bg-violet-500/10 text-violet-200 shadow-sm"
                        : campaignAssets.length > 0
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                    }`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold">
                      {campaignAssets.length > 0 ? (
                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                      ) : generationPhase === "preparing_creatives" ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                      ) : (
                        "4"
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {campaignAssets.length > 0 ? "Campaign ready" : "Cloudinary delivery..."}
                      </p>
                      <p className="text-[10px] text-slate-400">Dynamic Transformation</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------
              PRODUCT INTELLIGENCE (PRODUCT DNA)
          ---------------------------------------------------- */}
          {productDNA && (
            <div id="product-dna" className="rounded-2xl border border-white/[0.08] bg-[#111426] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-5 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 mb-1 block">
                    PRODUCT INTELLIGENCE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Product DNA
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PixelMind&apos;s understanding of your product
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>● AI Analysis Complete</span>
                </div>
              </div>

              {/* Compact Information Chips / Cards */}
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Product Name */}
                <div className="rounded-xl border border-white/[0.06] bg-[#15182B] p-4 transition-all hover:border-violet-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Product Name
                  </span>
                  <p className="mt-1 text-sm font-bold text-white truncate">
                    {productDNA.productName}
                  </p>
                </div>

                {/* Category */}
                <div className="rounded-xl border border-white/[0.06] bg-[#15182B] p-4 transition-all hover:border-violet-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Category
                  </span>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-bold text-violet-300 border border-violet-500/20">
                      {productDNA.productCategory}
                    </span>
                  </div>
                </div>

                {/* Primary Color */}
                <div className="rounded-xl border border-white/[0.06] bg-[#15182B] p-4 transition-all hover:border-violet-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Primary Color
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: primaryHex }}
                    />
                    <span className="text-xs font-bold text-white capitalize font-mono">
                      {productDNA.primaryColor}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({primaryHex})
                    </span>
                  </div>
                </div>

                {/* Aesthetic Style */}
                <div className="rounded-xl border border-white/[0.06] bg-[#15182B] p-4 transition-all hover:border-violet-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Aesthetic Style
                  </span>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-md bg-pink-500/10 px-2 py-0.5 text-xs font-bold text-pink-300 border border-pink-500/20 capitalize">
                      {productDNA.style}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="mt-3.5 rounded-xl border border-white/[0.06] bg-[#15182B] p-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Product Description &amp; Positioning
                </span>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{productDNA.shortDescription}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              CAMPAIGN DNA & CAMPAIGN WORLD BLUEPRINT
          ---------------------------------------------------- */}
          {productDNA && (
            <div
              id="campaign-dna"
              className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#111426] via-[#15182B] to-[#0D1021] p-6 sm:p-8 text-white shadow-2xl"
            >
              {/* Subtle Ambient Radial Highlight */}
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
                style={{ backgroundColor: primaryHex }}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 mb-1 block">
                      CAMPAIGN BLUEPRINT
                    </span>
                    <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Campaign DNA
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      One campaign identity. Every platform.
                    </p>
                  </div>

                  <div className="rounded-lg border border-violet-500/20 bg-violet-950/40 px-3 py-1.5 text-right backdrop-blur-sm">
                    <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-violet-300">
                      Sync Status
                    </p>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      100% Brand Lock
                    </p>
                  </div>
                </div>

                {/* 7. CAMPAIGN WORLD ENVIRONMENT SELECTOR */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0B0D18]/90 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400">
                        CAMPAIGN WORLD ENVIRONMENT
                      </span>
                      <p className="text-xs text-slate-400">
                        Dynamically changes the set architecture, lighting, plinth, and Cloudinary color grade.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Product identity locked
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "LIFESTYLE", label: "LIFESTYLE", icon: "🌿", desc: "Daylight · Architectural Studio" },
                      { id: "URBAN", label: "URBAN", icon: "🏙️", desc: "Brutalist · Concrete & Contrast" },
                      { id: "PERFORMANCE", label: "PERFORMANCE", icon: "⚡", desc: "Kinetic · Athletic Pavilion" },
                      { id: "NIGHT", label: "NIGHT", icon: "🌙", desc: "Obsidian · Luxury Spotlight" },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleSelectCampaignWorld(w.id as CampaignWorldType)}
                        className={`rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                          campaignWorld === w.id
                            ? "border-violet-500 bg-violet-600/20 text-white shadow-md shadow-violet-600/20 ring-1 ring-violet-500"
                            : "border-white/[0.05] bg-white/[0.02] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span>{w.icon}</span>
                          <span>{w.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {w.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Active World Environment & Cloudinary Filter Status Bar */}
                  <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-slate-300">
                        Active Set: <strong className="text-white">{currentWorldConfig.name}</strong>
                      </span>
                      <span className="hidden sm:inline text-slate-500">·</span>
                      <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                        Cloudinary Filter: {currentWorldConfig.cloudinaryFilter}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectCampaignWorld(campaignWorld, true)}
                      disabled={isGeneratingCampaign}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 px-3 py-1.5 font-bold text-violet-200 transition-all cursor-pointer text-xs disabled:opacity-50"
                    >
                      <span>{isGeneratingCampaign ? "⚡ Tailoring Copy..." : `✨ Sync AI Copy with ${currentWorldConfig.name}`}</span>
                    </button>
                  </div>
                </div>

                {/* 4 Visual Modules */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Visual Direction */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0B0D18]/70 p-4 backdrop-blur-sm">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Visual Direction
                    </span>
                    <p className="mt-1.5 text-sm font-bold text-white tracking-wide">
                      {derivedVisualDirection}
                    </p>
                  </div>

                  {/* Brand Tone */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0B0D18]/70 p-4 backdrop-blur-sm">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Brand Tone
                    </span>
                    <p className="mt-1.5 text-sm font-bold text-white tracking-wide">
                      {derivedTone}
                    </p>
                  </div>

                  {/* Color System */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0B0D18]/70 p-4 backdrop-blur-sm">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Color System
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="h-5 w-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: primaryHex }}
                        title="Primary Color"
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: complementaryHex }}
                        title="Complementary Glow"
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-white/20 shadow-sm bg-[#070812]"
                        title="Obsidian Dark"
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-white/20 shadow-sm bg-slate-200"
                        title="Surface Neutral"
                      />
                      <span className="text-[11px] font-mono text-slate-400 ml-1">
                        {primaryHex}
                      </span>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0B0D18]/70 p-4 backdrop-blur-sm">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Target Audience
                    </span>
                    <p className="mt-1.5 text-xs text-slate-300 line-clamp-2">
                      {audience}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              7. AI CAMPAIGN COPY
          ---------------------------------------------------- */}
          {campaignCopy && (
            <div id="campaign-copy" className="rounded-2xl border border-white/[0.08] bg-[#111426] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-5 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 mb-1 block">
                    EDITORIAL INTELLIGENCE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Campaign Copy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conversion-ready messaging generated from your Campaign DNA.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      `${campaignCopy.headline}\n\n${campaignCopy.description}\n\nCTA: ${campaignCopy.callToAction}`,
                      "all"
                    )
                  }
                  className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === "all" ? (
                    <span className="text-emerald-400 font-bold">✓ Campaign Copied</span>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy Campaign</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Headline */}
                <div className="rounded-xl border border-white/[0.06] bg-[#15182B] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        HEADLINE
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(campaignCopy.headline, "headline")}
                        className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                      >
                        {copiedKey === "headline" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-base font-extrabold text-white leading-snug">
                      {campaignCopy.headline}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-xl border border-white/[0.06] bg-[#15182B] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        BODY
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(campaignCopy.description, "desc")}
                        className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                      >
                        {copiedKey === "desc" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {campaignCopy.description}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="rounded-xl border border-white/[0.06] bg-[#15182B] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        CALL TO ACTION
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(campaignCopy.callToAction, "cta")}
                        className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                      >
                        {copiedKey === "cta" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm">
                        {campaignCopy.callToAction} →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              CAMPAIGN STUDIO: THE HERO CREATIVE WORKSPACE
          ---------------------------------------------------- */}
          {campaignCopy && (
            <div id="campaign-studio" className="rounded-2xl border border-white/[0.08] bg-[#111426] p-6 sm:p-8 shadow-2xl">
              {/* Studio Header & Top Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/[0.06] pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 block">
                      CAMPAIGN STUDIO
                    </span>
                    <span className="rounded bg-violet-500/10 px-1.5 py-0.2 text-[9px] font-mono text-violet-300 border border-violet-500/20">
                      Cloudinary Product Media Pipeline
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                    One campaign. Every format.
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Platform-native commercial creatives architected around your exact uploaded product.
                  </p>
                </div>

                {/* Remix Controls */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0B0D18] p-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2 flex items-center justify-between">
                    <span>✨ REMIX STYLE</span>
                    <span className="text-[9px] text-violet-400">{campaignWorld}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(["Minimal", "Bold", "Luxury", "Sporty"] as RemixStyle[]).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setRemixStyle(style)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                          remixStyle === style
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 scale-[1.02]"
                            : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.07] border border-white/[0.05]"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------
                  AI CREATIVE DIRECTOR / INTERACTIVE PROMPT CONSOLE
                  Users can type natural language instructions to direct AI
              ---------------------------------------------------- */}
              <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-r from-[#170E32] via-[#111426] to-[#0A1628] p-5 shadow-2xl relative overflow-hidden mb-6">
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-600/20 blur-3xl" />

                <div className="relative z-10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 text-white font-black text-sm shadow-md">
                        ✦
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                          AI Creative Director
                          <span className="rounded bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-[9px] font-mono text-violet-300">
                            Natural Language Prompt Engine
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Direct your campaign like you&apos;re directing a human designer: rewrite headlines, change lighting, switch environments, and adjust Cloudinary filters in real-time.
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 self-start sm:self-center">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Co-Pilot Ready
                    </span>
                  </div>

                  {/* Prompt Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleDirectCreative();
                    }}
                    className="flex flex-col sm:flex-row items-stretch gap-2"
                  >
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={aiDirectorPrompt}
                        onChange={(e) => setAiDirectorPrompt(e.target.value)}
                        placeholder="Direct the AI: e.g. 'Make it sunset golden hour with wet pavement reflections and change headline to Born to Run'..."
                        disabled={isDirectingAI}
                        className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 font-medium"
                      />
                      {aiDirectorPrompt && (
                        <button
                          type="button"
                          onClick={() => setAiDirectorPrompt("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isDirectingAI || !aiDirectorPrompt.trim()}
                      className="rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      {isDirectingAI ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Directing Creative...</span>
                        </>
                      ) : (
                        <span>Direct Creative ⚡</span>
                      )}
                    </button>
                  </form>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
                      Prompt Ideas:
                    </span>
                    {[
                      "⭕ Change image to circle with cyan neon portal",
                      "⭐ Frame product in a starburst badge with gold glow",
                      "⬡ Change image to cyber hexagon",
                      "🎯 Center product with 0 tilt",
                      "🌇 Golden Hour Skyscraper Sunset with wet pavement reflections",
                      "⚡ Change headline to 'BORN TO RUN' with cyan neon accent",
                      "💎 Put product in diamond prism",
                    ].map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiDirectorPrompt(idea);
                          handleDirectCreative(idea);
                        }}
                        disabled={isDirectingAI}
                        className="rounded-lg bg-white/[0.04] hover:bg-violet-600/20 border border-white/[0.08] hover:border-violet-500/40 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer truncate max-w-xs"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>

                  {/* AI Director Live Commentary */}
                  {directorCommentary && (
                    <div className="mt-2 rounded-xl bg-violet-950/60 border border-violet-500/40 p-3 text-xs text-violet-200 flex items-start gap-2.5 animate-fade-in shadow-inner">
                      <span className="text-base leading-none">✨</span>
                      <div className="flex-1">
                        <p className="font-bold text-white text-[11px] uppercase tracking-wider">
                          AI Director Feedback
                        </p>
                        <p className="text-slate-300 mt-0.5">{directorCommentary}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDirectorCommentary(null)}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ----------------------------------------------------
                  CLOUDINARY AI MEDIA ENGINE CONTROL HUB
                  Centerpiece of PixelMind: Transformations, CDN delivery & diagnostics
              ---------------------------------------------------- */}
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#071324] via-[#0B172E] to-[#0A1021] p-5 shadow-2xl mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-300">
                        CLOUDINARY CORE MEDIA ENGINE
                      </span>
                      <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-300">
                        Cloud: ou321bmu
                      </span>
                      <span className="rounded bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-violet-300">
                        Public ID: {product.publicId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Product image is dynamically processed, transparently padded, and color-graded by Cloudinary for <strong className="text-white font-mono">{activeTab.replace("-", " ").toUpperCase()}</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="rounded-lg bg-black/60 border border-white/10 px-3 py-1.5 font-mono text-[11px] text-slate-300 flex items-center gap-2 max-w-xs sm:max-w-md truncate">
                      <span className="text-cyan-400 font-bold">CDN:</span>
                      <span className="truncate">{activeCloudinaryProductUrl}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyText(activeCloudinaryProductUrl, "cloudinary-url")}
                      className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-3 py-1.5 font-mono text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1 shadow-md hover:scale-[1.02]"
                    >
                      <span>{copiedKey === "cloudinary-url" ? "✓ Copied!" : "📋 Copy CDN URL"}</span>
                    </button>

                    <a
                      href={activeCloudinaryProductUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 font-mono text-xs font-semibold text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Inspect ↗</span>
                    </a>
                  </div>
                </div>

                {/* Cloudinary Live Transformation Badges & Interactive Feature Toggles */}
                <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] font-mono">
                  <div className="flex flex-wrap items-center gap-2 text-slate-300">
                    <span className="text-slate-200 font-bold">Pipeline Options:</span>
                    <button
                      type="button"
                      onClick={() => setCldBgRemoval(!cldBgRemoval)}
                      className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                        cldBgRemoval
                          ? "bg-violet-600 text-white border-violet-400 font-bold"
                          : "bg-white/[0.05] border-white/15 text-slate-400 hover:text-white"
                      }`}
                    >
                      AI BG Removal: {cldBgRemoval ? "ON" : "OFF"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCldEnhance(!cldEnhance)}
                      className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                        cldEnhance
                          ? "bg-emerald-600 text-white border-emerald-400 font-bold"
                          : "bg-white/[0.05] border-white/15 text-slate-400 hover:text-white"
                      }`}
                    >
                      Auto Enhance: {cldEnhance ? "ON" : "OFF"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCldSharpen(!cldSharpen)}
                      className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                        cldSharpen
                          ? "bg-cyan-600 text-white border-cyan-400 font-bold"
                          : "bg-white/[0.05] border-white/15 text-slate-400 hover:text-white"
                      }`}
                    >
                      Sharpen: {cldSharpen ? "ON" : "OFF"}
                    </button>

                    <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-amber-300">
                      {customCloudinaryFilter || currentWorldConfig.cloudinaryFilter} ({campaignWorld})
                    </span>
                  </div>

                  <div className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>84% CDN Compression · Global Edge Cached</span>
                  </div>
                </div>

                {/* Product Shape & Layout Directive Selector Bar */}
                <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
                  <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
                    <span className="text-slate-200 font-bold mr-1">Image Shape / Framing:</span>
                    {[
                      { id: "natural", label: "⬚ Natural Cutout" },
                      { id: "circle", label: "⭕ Circle Portal" },
                      { id: "star", label: "⭐ Starburst" },
                      { id: "hexagon", label: "⬡ Cyber Hex" },
                      { id: "diamond", label: "💎 Diamond" },
                      { id: "badge", label: "🏷️ Emblem Badge" },
                      { id: "card", label: "🪟 Glass Card" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setProductShape(s.id as ProductShape)}
                        className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          productShape === s.id
                            ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-cyan-400 font-bold shadow-md shadow-violet-600/30 scale-105"
                            : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-200 font-bold">Layout:</span>
                    {[
                      { id: "staged-plinth", label: "🏛️ Plinth" },
                      { id: "hero-centered", label: "🎯 Centered" },
                      { id: "editorial-split", label: "📐 Split" },
                      { id: "diagonal-float", label: "✨ Float" },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setLayoutArrangement(l.id as ProductLayoutArrangement);
                          if (l.id === "hero-centered") setProductRotation(0);
                          else if (l.id === "staged-plinth") setProductRotation(-16);
                        }}
                        className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          layoutArrangement === l.id
                            ? "bg-cyan-600/40 text-cyan-200 border-cyan-400 font-bold"
                            : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Navigation Tabs & Omnichannel Powerhouse Tools */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-6">
                <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
                  {[
                    { id: "instagram-post", label: "Instagram Post", aspect: "1:1", icon: "📷" },
                    { id: "instagram-story", label: "Instagram Story", aspect: "9:16", icon: "📱" },
                    { id: "video-reel", label: "Kinetic Video Reel", aspect: "60fps Reel", icon: "🎬" },
                    { id: "website-banner", label: "Website Hero", aspect: "16:9", icon: "🖥️" },
                    { id: "marketplace", label: "Marketplace Listing", aspect: "Ecom", icon: "🛍️" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as PlatformTab)}
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-white/[0.1] text-white border border-violet-500/40 shadow-sm"
                          : "bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${
                          activeTab === tab.id
                            ? "bg-violet-600/40 text-violet-200 font-bold"
                            : "bg-white/[0.05] text-slate-500"
                        }`}
                      >
                        {tab.aspect}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Powerhouse Suite Actions: Heatmap, Scorecard, Media Kit & Export */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                  {/* Neuromarketing Attention Heatmap Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAttentionHeatmap(!showAttentionHeatmap)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      showAttentionHeatmap
                        ? "bg-red-500/20 border-red-500/60 text-red-200 shadow-md shadow-red-500/20"
                        : "border-white/[0.1] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                    title="Toggle AI Neuromarketing Attention Heatmap overlay"
                  >
                    <span>🔥</span>
                    <span>Heatmap: {showAttentionHeatmap ? "ON" : "OFF"}</span>
                  </button>

                  {/* AI Conversion Scorecard Audit */}
                  <button
                    type="button"
                    onClick={() => setShowScorecardModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all cursor-pointer shadow-sm"
                    title="Open Full AI Conversion & Saliency Audit"
                  >
                    <span>📊</span>
                    <span>Audit: 95/100</span>
                  </button>

                  {/* 1-Click Omnichannel Campaign Media Kit */}
                  <button
                    type="button"
                    onClick={() => setShowMediaKitModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-all cursor-pointer shadow-sm"
                    title="Export Full Omnichannel Campaign Media Kit (CDN URLs, Copy & Manifest)"
                  >
                    <span>📦</span>
                    <span>Media Kit</span>
                  </button>

                  {/* Per-Platform Regenerate */}
                  <button
                    type="button"
                    onClick={() => handleRegeneratePlatform(activeTab)}
                    disabled={isRegeneratingPlatform === activeTab}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                    title="Regenerate this creative"
                  >
                    <svg
                      className={`h-3.5 w-3.5 text-violet-400 ${
                        isRegeneratingPlatform === activeTab ? "animate-spin" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>↻</span>
                  </button>

                  {/* Export Preview */}
                  <button
                    type="button"
                    onClick={() => handleExportCreative(activeTab, igContent.hook)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {exportNotice && (
                <div className="mb-4 rounded-lg bg-violet-600/20 border border-violet-500/30 p-2.5 text-xs text-violet-200 text-center animate-fade-in font-mono">
                  {exportNotice}
                </div>
              )}

              {/* ----------------------------------------------------
                  PLATFORM 1: HIGH-END INSTAGRAM POST + CAROUSEL PREVIEW
              ---------------------------------------------------- */}
              {activeTab === "instagram-post" && (
                <div className="space-y-4">
                  {/* Slide Selector Pills at Top */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCarouselSlide(0)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        carouselSlide === 0
                          ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                          : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.1] hover:text-white"
                      }`}
                    >
                      ★ Editorial Master Drop
                    </button>
                    <button
                      type="button"
                      onClick={() => setCarouselSlide(1)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        carouselSlide === 1
                          ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                          : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.1] hover:text-white"
                      }`}
                    >
                      Slide 2 · Technical Breakdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setCarouselSlide(2)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        carouselSlide === 2
                          ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                          : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.1] hover:text-white"
                      }`}
                    >
                      Slide 3 · Campaign World
                    </button>
                    <button
                      type="button"
                      onClick={() => setCarouselSlide(3)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        carouselSlide === 3
                          ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                          : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.1] hover:text-white"
                      }`}
                    >
                      Slide 4 · Official Release
                    </button>
                  </div>

                  {/* Instagram Post Outer Shell */}
                  <div className="mx-auto max-w-[520px] rounded-2xl border border-white/[0.1] bg-[#0A0D18] shadow-2xl overflow-hidden">
                    {/* IG Top App Bar */}
                    <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-[#0B0F1F]">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full border border-violet-500/40 p-0.5 bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600">
                          <div className="h-full w-full rounded-full bg-[#0B0D18] flex items-center justify-center text-[10px] font-bold text-white">
                            P
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                            pixelmind.official
                            <svg className="h-3 w-3 text-cyan-400 fill-current" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </p>
                          <p className="text-[10px] text-slate-400">Sponsored · Commercial Drop</p>
                        </div>
                      </div>
                      <span className="text-slate-400 font-mono text-sm cursor-pointer">···</span>
                    </div>

                    {/* ACTUAL HIGH-END 1:1 CREATIVE CANVAS */}
                    <div className="relative aspect-square w-full overflow-hidden select-none bg-[#090D1A] text-white">
                      {/* Atmospheric Photorealistic Campaign World Backdrop */}
                      <CampaignWorldBackdrop world={campaignWorld} aspect="square" />

                      {/* Neuromarketing Attention Heatmap Overlay */}
                      {showAttentionHeatmap && (
                        <AttentionHeatmapOverlay
                          onOpenScorecard={() => setShowScorecardModal(true)}
                          aspect="square"
                        />
                      )}

                      {/* Top Branding Row */}
                      <div className="relative z-20 flex items-center justify-between p-4 sm:p-6 pb-0">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M12 2L2 22h20L12 2zm0 6l5.5 11h-11L12 8z" />
                          </svg>
                          <div>
                            <h5 className="font-display font-black text-sm sm:text-base tracking-[0.25em] text-white uppercase leading-none drop-shadow-md">
                              {brandName}
                            </h5>
                            <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.35em] text-white/80 uppercase mt-0.5">
                              STEP HIGHER
                            </p>
                          </div>
                        </div>

                        <div className="text-[8.5px] sm:text-[10px] font-bold tracking-[0.22em] text-white/90 uppercase font-mono drop-shadow-xs">
                          COMFORT / STYLE / PERFORMANCE
                        </div>
                      </div>

                      {/* SLIDE 0: EDITORIAL MASTER DROP (MATCHING REFERENCE IMAGE 100%) */}
                      {carouselSlide === 0 && (
                        <>
                          {/* Left Column: Bold Headline + Overlapping Cursive Accent + Subtitle */}
                          <div className="relative z-20 px-4 sm:px-6 mt-3 sm:mt-5 max-w-[58%]">
                            <h3 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase leading-[0.88] drop-shadow-md">
                              {headlineParts.line1}
                              <br />
                              {headlineParts.line2}
                            </h3>
                            <div className="relative inline-block mt-[-6px]">
                              <div className="font-handwriting text-5xl sm:text-6xl text-[#38BDF8] font-normal leading-none -ml-1 transform -rotate-2 select-none filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]">
                                {headlineParts.scriptWord}
                              </div>
                              <svg className="w-28 sm:w-36 h-3 text-[#38BDF8] -mt-1 filter drop-shadow" viewBox="0 0 140 12" fill="none">
                                <path d="M4 8 Q 70 14, 136 3" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                              </svg>
                            </div>

                            <div className="mt-2.5 space-y-0.5 text-xs sm:text-[13px] font-bold text-white/95 leading-tight tracking-wider uppercase drop-shadow-xs">
                              {activeSubheadlineLines.map((line, idx) => (
                                <p key={idx}>{line}</p>
                              ))}
                            </div>
                          </div>

                          {/* Right Column: 4 Circular Feature Badges (Matching Reference Image) */}
                          <div className="absolute right-3 sm:right-5 top-12 sm:top-16 z-20 flex flex-col gap-2 sm:gap-3 items-center">
                            {activeBadges.map((b, idx) => (
                              <div key={idx} className="flex flex-col items-center">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-white/60 flex items-center justify-center bg-black/50 backdrop-blur-xs shadow-md">
                                  {b.icon === "feather" || idx === 0 ? (
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z M16 8L2 22 M17.5 15H9" />
                                    </svg>
                                  ) : b.icon === "mesh" || idx === 1 ? (
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v10M8 7l-2 2M8 7l2 2M12 4v16M12 4l-2 2M12 4l2 2M16 7v10M16 7l-2 2M16 7l2 2" />
                                    </svg>
                                  ) : b.icon === "shield" || idx === 2 ? (
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3s7 3 7 9c0 5-4.5 8-7 9-2.5-1-7-4-7-9 0-6 7-9 7-9z M9 12l2 2 4-4" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16c2-4 5-5 8-5 3 0 5 3 10 3v3H3v-1z M6 11c1-2 2.5-3 5-3s4 1 5 3" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-[6.5px] sm:text-[7.5px] font-extrabold tracking-wider text-white uppercase text-center mt-0.5 max-w-[58px] leading-tight drop-shadow-xs">
                                  {b.title}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* FOREGROUND HERO PRODUCT WITH DYNAMIC AI SHAPE MASKING & FRAMING */}
                          <ProductFrameStager
                            productUrl={activeCloudinaryProductUrl || product.url}
                            shape={productShape}
                            layout={layoutArrangement}
                            rotation={productRotation}
                            glowColor={frameGlowColor}
                            aspect="square"
                            showDepthShoe={true}
                          />

                          {/* Handwritten Vibe Stamp (Bottom Right on wet concrete face) */}
                          <div className="absolute right-3 sm:right-6 bottom-11 z-25 transform -rotate-6 select-none text-right">
                            <p className="font-handwriting text-base sm:text-xl text-white font-bold leading-tight drop-shadow-md">
                              {activeVibeQuote}
                            </p>
                            <svg className="w-28 sm:w-36 h-3 mt-0.5 text-white/90 filter drop-shadow ml-auto" viewBox="0 0 140 12" fill="none">
                              <path d="M4 8 Q 70 14, 136 3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
                            </svg>
                          </div>

                          {/* Bottom Left CTA Button (on wet concrete face) */}
                          <div className="absolute left-4 sm:left-6 bottom-10 z-25">
                            <button
                              type="button"
                              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#0F3E7D] hover:bg-[#0A2B54] text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xl flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-sky-400/30"
                            >
                              <span>{activeCTA}</span>
                              <span>→</span>
                            </button>
                          </div>
                        </>
                      )}

                      {/* SLIDE 1: TECHNICAL BREAKDOWN */}
                      {carouselSlide === 1 && (
                        <div className="relative z-20 flex-1 flex flex-col justify-between p-4 sm:p-6">
                          <div className="text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0A2540]/10 border border-[#0A2540]/20 text-[9px] font-mono font-bold uppercase tracking-widest text-[#0A2540]">
                              TECHNICAL ARCHITECTURE
                            </span>
                            <h4 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white mt-1 drop-shadow-md">
                              {igContent.slides[1]?.title || "ENGINEERED FOR MOTION"}
                            </h4>
                          </div>

                          {/* Shoe with Feature Callout Callers */}
                          <div className="relative h-48 w-full flex items-center justify-center my-auto">
                            <img
                              src={activeCloudinaryProductUrl || product.url}
                              alt="Technical Breakdown"
                              className="max-h-40 max-w-full object-contain filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.85)] scale-110"
                            />
                            <div className="absolute top-4 left-2 rounded-lg bg-black/70 text-white px-2.5 py-1 text-[9px] font-mono font-bold shadow-lg border border-sky-400/40 backdrop-blur-xs">
                              ◉ Adaptive Cushioning Sole
                            </div>
                            <div className="absolute bottom-4 right-2 rounded-lg bg-black/70 text-white px-2.5 py-1 text-[9px] font-mono font-bold shadow-lg border border-sky-400/40 backdrop-blur-xs">
                              ◉ Breathable Aero Mesh
                            </div>
                          </div>

                          <p className="text-xs text-center text-slate-200 max-w-xs mx-auto font-medium drop-shadow-xs">
                            {igContent.slides[1]?.subtitle || "Every silhouette tuned for daily utility and modern edge."}
                          </p>
                        </div>
                      )}

                      {/* SLIDE 2: CAMPAIGN WORLD */}
                      {carouselSlide === 2 && (
                        <div className="relative z-20 flex-1 flex flex-col justify-between p-4 sm:p-6 text-center">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-300">
                              LIFESTYLE &amp; VISION
                            </span>
                            <h4 className="font-display font-black text-2xl uppercase text-white mt-2 drop-shadow-md">
                              &ldquo;{igContent.slides[2]?.title || "BORN FOR THE CITY"}&rdquo;
                            </h4>
                          </div>

                          <div className="relative h-44 w-full flex items-center justify-center my-auto">
                            <img
                              src={activeCloudinaryProductUrl || product.url}
                              alt="Campaign World"
                              className="max-h-36 max-w-full object-contain filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.85)] -rotate-6"
                            />
                          </div>

                          <p className="text-xs text-slate-200 max-w-sm mx-auto font-medium drop-shadow-xs">
                            {igContent.slides[2]?.subtitle || "Architected for fluid motion across every street."}
                          </p>
                        </div>
                      )}

                      {/* SLIDE 3: OFFICIAL RELEASE */}
                      {carouselSlide === 3 && (
                        <div className="relative z-20 flex-1 flex flex-col justify-between p-4 sm:p-6 text-center">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[9px] font-mono font-bold uppercase tracking-widest text-amber-300">
                              LIMITED ALLOCATION
                            </span>
                            <h4 className="font-display font-black text-2xl uppercase text-white mt-1 drop-shadow-md">
                              {igContent.slides[3]?.title || "CLAIM YOURS TODAY"}
                            </h4>
                          </div>

                          <div className="relative h-40 w-full flex items-center justify-center my-auto">
                            <img
                              src={activeCloudinaryProductUrl || product.url}
                              alt="Official Release"
                              className="max-h-36 max-w-full object-contain filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.85)]"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="inline-block rounded-full bg-[#0F3E7D] hover:bg-[#0A2B54] px-6 py-2.5 text-xs font-black uppercase text-white shadow-xl border border-sky-400/30">
                              {igContent.slides[3]?.cta || igContent.cta} →
                            </div>
                            <p className="text-[10px] text-slate-300 font-mono">
                              Free Worldwide Shipping · Limited Release
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer Bar: NEXA | PERFORMANCE MEETS STYLE | www.nexa.com */}
                      <div className="absolute inset-x-0 bottom-0 z-25 flex items-center justify-between border-t border-white/20 px-3 sm:px-5 py-1.5 bg-black/25 backdrop-blur-xs text-[8.5px] sm:text-[9.5px] text-white/95 font-medium">
                        <div className="flex items-center gap-1 font-bold tracking-widest uppercase">
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2L2 22h20L12 2z" />
                          </svg>
                          <span>{brandName}</span>
                        </div>
                        <div className="hidden sm:block text-white/80 tracking-widest uppercase text-[8.5px]">
                          PERFORMANCE MEETS STYLE
                        </div>
                        <div className="flex items-center gap-1 text-white/90 font-mono text-[8.5px]">
                          <span>🌐</span>
                          <span>www.{brandName.toLowerCase()}.com</span>
                        </div>
                      </div>
                    </div>

                    {/* Instagram Social Post Actions */}
                    <div className="p-4 space-y-2.5 bg-[#0B0F1F]">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setIsLiked(!isLiked)}
                            className="cursor-pointer transition-transform active:scale-125"
                          >
                            <span className={isLiked ? "text-pink-500" : "text-white"}>
                              {isLiked ? "❤️" : "🤍"}
                            </span>
                          </button>
                          <span className="cursor-pointer">💬</span>
                          <span className="cursor-pointer">✈️</span>
                        </div>
                        <span className="cursor-pointer">🔖</span>
                      </div>

                      <p className="text-xs font-bold text-white">
                        {isLiked ? "3,421 likes" : "3,420 likes"}
                      </p>

                      {/* Caption & Hashtags */}
                      <div className="text-xs text-slate-300 space-y-1">
                        <p>
                          <span className="font-bold text-white mr-1.5">pixelmind.official</span>
                          {igContent.caption}
                        </p>
                        <div className="flex flex-wrap gap-1 text-violet-400 font-mono text-[11px] pt-1">
                          {igContent.hashtags.map((h, i) => (
                            <span key={i} className="hover:underline cursor-pointer">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 font-mono pt-1">
                        VIEW ALL 84 COMMENTS · 2 HOURS AGO
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                  PLATFORM 2: 9:16 INSTAGRAM STORY (VERTICAL MOBILE)
              ---------------------------------------------------- */}
              {activeTab === "instagram-story" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="inline-block rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-0.5 text-[10px] font-mono text-slate-400">
                      Platform-Native 9:16 Vertical Mobile Story with Interactive Poll
                    </span>
                  </div>

                  <div className="mx-auto max-w-[340px] aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl p-4 sm:p-5 relative flex flex-col justify-between border-8 border-slate-900 bg-[#090D1A] select-none text-white">
                    {/* Atmospheric Photorealistic Story Backdrop */}
                    <CampaignWorldBackdrop world={campaignWorld} aspect="story" />

                    {/* Neuromarketing Attention Heatmap Overlay */}
                    {showAttentionHeatmap && (
                      <AttentionHeatmapOverlay
                        onOpenScorecard={() => setShowScorecardModal(true)}
                        aspect="story"
                      />
                    )}

                    {/* Top Story Progress Bars */}
                    <div className="relative z-20 space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <div className="h-0.5 rounded-full bg-white" />
                        <div className="h-0.5 rounded-full bg-white/40" />
                        <div className="h-0.5 rounded-full bg-white/40" />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600 flex items-center justify-center font-bold text-[9px] text-white">
                            P
                          </div>
                          <span className="font-bold text-[11px] text-white">pixelmind.store</span>
                          <span className="text-[9px] text-slate-300">2h</span>
                        </div>
                        <span className="text-white text-xs font-bold cursor-pointer">✕</span>
                      </div>
                    </div>

                    {/* Story Content & Branding */}
                    <div className="relative z-20 my-auto text-center space-y-2">
                      <div className="flex items-center justify-center gap-1 text-[9px] font-mono font-bold tracking-widest text-sky-400 uppercase drop-shadow-xs">
                        <span>▲ {brandName}</span>
                        <span>·</span>
                        <span>STEP HIGHER</span>
                      </div>

                      {/* Reference Style Staged Story Headline */}
                      <div>
                        <p className="text-xs font-black tracking-widest text-white/60 uppercase">
                          SAME YOU.
                        </p>
                        <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-none drop-shadow-md">
                          HIGHER
                          <br />
                          STANDARDS.
                        </h3>
                        <div className="h-1 w-12 bg-sky-400 rounded-full mx-auto mt-1.5 shadow-sm shadow-sky-400/50" />
                        <div className="font-handwriting text-3xl sm:text-4xl text-white font-normal leading-none mt-1 transform -rotate-3 select-none drop-shadow-md">
                          Step Higher
                        </div>
                      </div>

                      {/* 3 Circular Feature Badges (Stacked on Right Edge) */}
                      <div className="absolute -right-2 top-8 z-20 flex flex-col gap-2 items-center">
                        <div className="h-8 w-8 rounded-full border border-white/60 flex items-center justify-center bg-black/60 backdrop-blur-xs shadow-md" title="Ultra Lightweight">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z M16 8L2 22 M17.5 15H9" />
                          </svg>
                        </div>
                        <div className="h-8 w-8 rounded-full border border-white/60 flex items-center justify-center bg-black/60 backdrop-blur-xs shadow-md" title="Breathable Mesh">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v10M8 7l-2 2M8 7l2 2M12 4v16M12 4l-2 2M12 4l2 2M16 7v10M16 7l-2 2M16 7l2 2" />
                          </svg>
                        </div>
                        <div className="h-8 w-8 rounded-full border border-white/60 flex items-center justify-center bg-black/60 backdrop-blur-xs shadow-md" title="All-Day Comfort">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16c2-4 5-5 8-5 3 0 5 3 10 3v3H3v-1z M6 11c1-2 2.5-3 5-3s4 1 5 3" />
                          </svg>
                        </div>
                      </div>

                      {/* Staged Foreground Product with Dynamic Shape & Layout */}
                      <ProductFrameStager
                        productUrl={activeCloudinaryProductUrl || product.url}
                        shape={productShape}
                        layout={layoutArrangement}
                        rotation={productRotation}
                        glowColor={frameGlowColor}
                        aspect="story"
                        showDepthShoe={true}
                      />

                      {/* Handwritten Vibe Stamp on Concrete Ledge */}
                      <div className="relative z-20 text-left pl-1 transform -rotate-6 select-none">
                        <p className="font-handwriting text-base text-white font-bold leading-tight drop-shadow-md">
                          {activeVibeQuote}
                        </p>
                        <svg className="w-24 h-2.5 text-white filter drop-shadow" viewBox="0 0 140 12" fill="none">
                          <path d="M4 8 Q 70 14, 136 3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Interactive Poll Sticker */}
                      <div className="mx-auto max-w-[220px] rounded-xl bg-black/60 backdrop-blur-md border border-white/20 p-2 space-y-1 shadow-lg relative z-25">
                        <p className="text-[9.5px] font-bold text-white uppercase tracking-wider">
                          {storyContent.interaction?.question || "Rate this drop:"}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setStoryVote("A")}
                            className={`rounded-lg py-1 px-1.5 transition-all cursor-pointer ${
                              storyVote === "A"
                                ? "bg-sky-400 text-slate-950 font-black"
                                : "bg-white/20 text-white hover:bg-white/30"
                            }`}
                          >
                            {storyVote ? "87% 🔥" : storyContent.interaction?.optionA || "🔥 Fire"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStoryVote("B")}
                            className={`rounded-lg py-1 px-1.5 transition-all cursor-pointer ${
                              storyVote === "B"
                                ? "bg-sky-400 text-slate-950 font-black"
                                : "bg-white/20 text-white hover:bg-white/30"
                            }`}
                          >
                            {storyVote ? "13% ⚡" : storyContent.interaction?.optionB || "⚡ Cop"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Swipe Up CTA Button */}
                    <div className="relative z-25 text-center space-y-1 pt-1">
                      <div className="inline-flex animate-bounce flex-col items-center">
                        <svg className="h-3.5 w-3.5 text-white filter drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </div>
                      <div className="w-full rounded-full py-2.5 text-xs font-bold tracking-wider uppercase bg-[#0F3E7D] hover:bg-[#0A2B54] text-white shadow-xl cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 border border-sky-400/30">
                        <span>{activeCTA || "SWIPE UP TO SHOP"}</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                  PLATFORM 3: KINETIC VIDEO REEL & MOTION AD (9:16)
                  60fps dynamic motion ad with live scrubber, audio visualizer,
                  timed typography reveals, and cinematic parallax.
              ---------------------------------------------------- */}
              {activeTab === "video-reel" && (
                <div className="space-y-4">
                  <div className="text-center flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-block rounded-full bg-violet-600/20 border border-violet-500/40 px-3 py-0.5 text-[10px] font-mono font-bold text-violet-300">
                      ⚡ 60fps Kinetic Motion Ad Engine · Full 9:16 Vertical Video Reel
                    </span>
                    <span className="inline-block rounded-full bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 text-[10px] font-mono text-slate-400">
                      Auto-synced to 128 BPM Audio
                    </span>
                  </div>

                  {/* Smartphone Frame Outer Shell */}
                  <div className="mx-auto max-w-[390px] rounded-[44px] border-[5px] border-slate-700/80 bg-[#060814] p-3 shadow-2xl shadow-violet-950/50 ring-1 ring-white/10 relative">
                    {/* Top Phone Speaker / Dynamic Island */}
                    <div className="absolute top-4 inset-x-0 mx-auto w-24 h-4 bg-black rounded-full z-40 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#181818] border border-white/10" />
                    </div>

                    {/* Phone Screen Canvas (9:16) */}
                    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[34px] bg-[#090D1A] text-white select-none">
                      {/* Atmospheric Photorealistic Campaign World Backdrop */}
                      <CampaignWorldBackdrop world={campaignWorld} aspect="story" />

                      {/* Neuromarketing Attention Heatmap Overlay (if enabled) */}
                      {showAttentionHeatmap && (
                        <AttentionHeatmapOverlay
                          onOpenScorecard={() => setShowScorecardModal(true)}
                          aspect="story"
                        />
                      )}

                      {/* Video Story Top Bar & Segmented Progress Bar */}
                      <div className="relative z-30 p-4 pt-6 pb-2 space-y-2.5">
                        {/* 3-segment progress bars */}
                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="h-1 rounded-full bg-white/25 overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                              style={{ width: `${Math.min(100, (reelTime / 2) * 100)}%` }}
                            />
                          </div>
                          <div className="h-1 rounded-full bg-white/25 overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                              style={{ width: `${Math.max(0, Math.min(100, ((reelTime - 2) / 2) * 100))}%` }}
                            />
                          </div>
                          <div className="h-1 rounded-full bg-white/25 overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                              style={{ width: `${Math.max(0, Math.min(100, ((reelTime - 4) / 2) * 100))}%` }}
                            />
                          </div>
                        </div>

                        {/* User Account / Audio Header */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full border border-violet-400 p-0.5 bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600">
                              <div className="h-full w-full rounded-full bg-[#0B0D18] flex items-center justify-center text-[10px] font-bold text-white">
                                P
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white flex items-center gap-1 leading-tight">
                                {brandName.toLowerCase()}.official
                                <span className="text-[9px] text-cyan-300 font-mono">✓</span>
                              </p>
                              <p className="text-[9px] text-white/70 flex items-center gap-1">
                                <span>♫ Original Beat (128 BPM)</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-red-600/90 text-white font-mono font-bold text-[9px] px-2 py-0.5 animate-pulse">
                              LIVE AD
                            </span>
                            <span className="text-white/80 font-bold text-xs">···</span>
                          </div>
                        </div>
                      </div>

                      {/* MAIN KINETIC MOTION STAGE */}
                      <div className="relative z-20 flex flex-col justify-between h-[calc(100%-80px)] p-5 pt-1">
                        {/* Upper Section: Timed Animated Headline Hook */}
                        <div className="space-y-1">
                          {/* Brand Lockup */}
                          <div className="flex items-center gap-2">
                            <span className="inline-block rounded-md bg-white/10 backdrop-blur-xs border border-white/20 px-2 py-0.5 text-[9px] font-mono font-bold text-white uppercase tracking-widest">
                              ▲ {brandName} · STEP HIGHER
                            </span>
                          </div>

                          {/* SCENE 1: Headline Reveal (0.0s - 2.5s) */}
                          <div className="transition-all duration-500 transform pt-1">
                            <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-[0.88] drop-shadow-lg">
                              {storyHeadlineParts.line1}
                              <br />
                              {storyHeadlineParts.line2}
                            </h3>
                          </div>

                          {/* SCENE 2: Cursive Accent Glow Sweep (2.0s - 6.0s) */}
                          <div
                            className={`transition-all duration-700 transform ${
                              reelTime >= 1.5 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
                            }`}
                          >
                            <div className="font-handwriting text-5xl sm:text-6xl text-[#38BDF8] font-normal leading-none -ml-1 transform -rotate-2 select-none filter drop-shadow-[0_2px_12px_rgba(56,189,248,0.6)]">
                              {storyHeadlineParts.scriptWord}
                            </div>
                            <svg className="w-28 sm:w-36 h-3 text-[#38BDF8] -mt-1 filter drop-shadow" viewBox="0 0 140 12" fill="none">
                              <path d="M4 8 Q 70 14, 136 3" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Middle Section: Floating Product with Cinematic Parallax & Light Sweep */}
                        <div className="relative flex items-center justify-center my-auto py-2">
                          {/* Ambient Diagonal Lighting Sweep Beam */}
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="w-32 h-96 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md transform -rotate-45 animate-sweep-beam" />
                          </div>

                          {/* Staged Foreground Cloudinary Product with Dynamic Shape & Floating Bob */}
                          <div className="relative z-20 w-4/5 flex items-center justify-center animate-float-slow">
                            <ProductFrameStager
                              productUrl={activeCloudinaryProductUrl || product.url}
                              shape={productShape}
                              layout={layoutArrangement === "hero-centered" ? "hero-centered" : "staged-plinth"}
                              rotation={productRotation}
                              glowColor={frameGlowColor}
                              aspect="story"
                              showDepthShoe={false}
                            />
                          </div>
                        </div>

                        {/* Lower Section: Cascading Badges & Pulsing CTA */}
                        <div className="space-y-3 pb-2">
                          {/* SCENE 3: Feature Pills Cascade (3.5s - 6.0s) */}
                          <div
                            className={`flex flex-wrap justify-center gap-1.5 transition-all duration-500 ${
                              reelTime >= 3.2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                            }`}
                          >
                            {activeBadges.slice(0, 3).map((b, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-black/60 backdrop-blur-xs border border-white/25 px-2.5 py-1 text-[8.5px] font-mono font-bold text-white uppercase tracking-wider shadow-md"
                              >
                                ★ {b.title}
                              </span>
                            ))}
                          </div>

                          {/* Live Equalizer Bars & Audio Sync */}
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-cyan-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                              <span>BASS SYNC ACTIVE</span>
                            </div>

                            {/* Dancing Equalizer Waveform Bars */}
                            <div className="flex items-end gap-1 h-4">
                              <div className="w-1 bg-cyan-400 rounded-full animate-eq-1" />
                              <div className="w-1 bg-violet-400 rounded-full animate-eq-2" />
                              <div className="w-1 bg-pink-400 rounded-full animate-eq-3" />
                              <div className="w-1 bg-amber-400 rounded-full animate-eq-4" />
                            </div>
                          </div>

                          {/* Bottom Swipe Up CTA Button */}
                          <div className="text-center space-y-1">
                            <div className="inline-flex animate-bounce flex-col items-center">
                              <svg className="h-3.5 w-3.5 text-white filter drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                              </svg>
                            </div>
                            <div className="w-full rounded-full py-2.5 text-xs font-bold tracking-wider uppercase bg-[#0F3E7D] hover:bg-[#0A2B54] text-white shadow-xl cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 border border-sky-400/40 shadow-sky-500/20">
                              <span>{activeCTA || "SWIPE UP TO SHOP"}</span>
                              <span>→</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VIDEO PLAYER CONTROLLER CONSOLE */}
                    <div className="mt-4 rounded-2xl bg-[#0B0E1E] border border-white/[0.08] p-3 space-y-2.5">
                      {/* Timeline Scrubber */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${isPlayingReel ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                            <span>0:0{Math.floor(reelTime)} / 0:06</span>
                          </span>
                          <span className="text-slate-400 uppercase text-[10px]">1080p 60fps WebGL</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="6"
                          step="0.1"
                          value={reelTime}
                          onChange={(e) => setReelTime(parseFloat(e.target.value))}
                          className="w-full accent-violet-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>

                      {/* Interactive Video Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsPlayingReel(!isPlayingReel)}
                            className="rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-bold text-white shadow cursor-pointer transition-all"
                          >
                            {isPlayingReel ? "⏸ Pause" : "▶ Play"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReelTime(0);
                              setIsPlayingReel(true);
                            }}
                            className="rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-all"
                            title="Restart Video Reel"
                          >
                            ↻
                          </button>

                          <button
                            type="button"
                            onClick={() => setReelAudioActive(!reelAudioActive)}
                            className="rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-all"
                          >
                            {reelAudioActive ? "🔊 Beat" : "🔇 Mute"}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleExportCreative("kinetic-reel", "Motion Ad 9:16")}
                          className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow cursor-pointer transition-all flex items-center gap-1"
                        >
                          <span>📥 Export MP4</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "website-banner" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="inline-block rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-0.5 text-[10px] font-mono text-slate-400">
                      Full Ecommerce Website Hero &amp; Navigation Shell · Architectural Series
                    </span>
                  </div>

                  {/* Browser Mockup Window */}
                  <div className="rounded-2xl border border-white/[0.1] bg-[#0A0D18] shadow-2xl overflow-hidden">
                    {/* Browser Address Bar */}
                    <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-2.5 bg-[#0B0F1F] text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="flex-1 max-w-sm rounded bg-black/50 px-3 py-1 text-[11px] font-mono text-slate-400 truncate">
                        https://pixelmind.store/collection/{brandName.toLowerCase()}
                      </div>
                    </div>

                    {/* Announcement Bar */}
                    <div className="bg-[#0A2540] py-1.5 text-center text-[10px] font-mono font-bold text-white tracking-widest uppercase">
                      {webContent.announcement || "ARCHITECTURAL DAYLIGHT COLLECTION // LIMITED RUN LAUNCH"}
                    </div>

                    {/* Website Navigation Header */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3 bg-[#0B0D18]/90 backdrop-blur-md text-xs">
                      <div className="flex items-center gap-6">
                        <span className="font-black text-sm text-white tracking-wider flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-violet-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2L2 22h20L12 2z" />
                          </svg>
                          <span>{brandName}</span>
                        </span>
                        <nav className="hidden md:flex items-center gap-4 text-slate-300 font-medium text-[11px]">
                          <span className="text-white font-bold cursor-pointer">SHOP</span>
                          <span className="hover:text-white cursor-pointer">COLLECTION</span>
                          <span className="hover:text-white cursor-pointer">LOOKBOOK</span>
                          <span className="hover:text-white cursor-pointer">ABOUT</span>
                        </nav>
                      </div>

                      <div className="flex items-center gap-4 text-slate-300 text-xs">
                        <span className="hidden sm:inline">Search 🔍</span>
                        <span className="cursor-pointer">Account</span>
                        <span className="rounded-full bg-violet-600/30 px-2 py-0.5 text-violet-300 font-bold border border-violet-500/30">
                          Cart (2)
                        </span>
                      </div>
                    </div>

                    {/* Architectural Hero Split Section with Dynamic Campaign World Backdrop */}
                    <div className="p-6 sm:p-12 relative flex items-center overflow-hidden min-h-[460px]">
                      {/* Atmospheric Photorealistic Campaign World Backdrop (Wide 16:9 Banner) */}
                      <CampaignWorldBackdrop world={campaignWorld} aspect="banner" />

                      {/* Neuromarketing Attention Heatmap Overlay */}
                      {showAttentionHeatmap && (
                        <AttentionHeatmapOverlay
                          onOpenScorecard={() => setShowScorecardModal(true)}
                          aspect="banner"
                        />
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full relative z-20">
                        {/* Left Copy & Value Proposition */}
                        <div className="lg:col-span-7 space-y-4 text-left">
                          <div className="flex items-center gap-2">
                            <span className="inline-block rounded-md bg-white/10 backdrop-blur-xs border border-white/20 px-2.5 py-1 text-[10px] font-mono font-bold text-white uppercase tracking-widest shadow-xs">
                              ▲ {brandName} · STEP HIGHER
                            </span>
                            <span className="text-[10px] font-mono text-white/80 uppercase tracking-wider hidden sm:inline drop-shadow-xs">
                              COMFORT / STYLE / EVERYDAY
                            </span>
                          </div>

                          {/* Bold Headline with Cursive Accent */}
                          <div>
                            <h3 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase leading-[0.88] drop-shadow-lg">
                              {webHeadlineParts.line1}
                              <br />
                              {webHeadlineParts.line2}
                            </h3>
                            <div className="relative inline-block mt-[-6px]">
                              <div className="font-handwriting text-5xl sm:text-7xl text-[#38BDF8] font-normal leading-none -ml-1 transform -rotate-2 select-none filter drop-shadow-[0_2px_10px_rgba(56,189,248,0.5)]">
                                {webHeadlineParts.scriptWord}
                              </div>
                              <svg className="w-28 sm:w-36 h-3 text-[#38BDF8] -mt-1 filter drop-shadow" viewBox="0 0 140 12" fill="none">
                                <path d="M4 8 Q 70 14, 136 3" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                              </svg>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg font-medium drop-shadow-xs">
                            {webContent.subheadline || "Lightweight. Stylish. Made for your every move. Every detail crafted for everyday comfort and modern style."}
                          </p>

                          {/* 4 Circular Feature Badges in a Horizontal Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-lg">
                            {activeBadges.map((b, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-xs border border-white/20 shadow-sm">
                                <div className="h-7 w-7 rounded-full border border-white/70 flex items-center justify-center bg-white/10 shrink-0">
                                  {b.icon === "feather" || idx === 0 ? (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z M16 8L2 22 M17.5 15H9" />
                                    </svg>
                                  ) : b.icon === "mesh" || idx === 1 ? (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v10M8 7l-2 2M8 7l2 2M12 4v16M12 4l-2 2M12 4l2 2M16 7v10M16 7l-2 2M16 7l2 2" />
                                    </svg>
                                  ) : b.icon === "shield" || idx === 2 ? (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3s7 3 7 9c0 5-4.5 8-7 9-2.5-1-7-4-7-9 0-6 7-9 7-9z M9 12l2 2 4-4" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16c2-4 5-5 8-5 3 0 5 3 10 3v3H3v-1z M6 11c1-2 2.5-3 5-3s4 1 5 3" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-[8.5px] font-extrabold text-white uppercase tracking-wider truncate">
                                  {b.title}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Handwritten Vibe Stamp */}
                          <div className="pt-1 select-none">
                            <p className="font-handwriting text-base sm:text-xl text-white font-bold leading-tight drop-shadow-md">
                              {activeVibeQuote || `More than just ${productCategory.toLowerCase() || "shoes"}, it's a vibe.`}
                            </p>
                            <svg className="w-28 sm:w-36 h-2 text-white/80 filter drop-shadow" viewBox="0 0 140 12" fill="none">
                              <path d="M4 8 Q 70 14, 136 3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                            </svg>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                              type="button"
                              className="rounded-full bg-[#0F3E7D] hover:bg-[#0A2B54] border border-sky-400/40 px-6 py-3 text-xs font-bold text-white shadow-xl hover:scale-[1.02] cursor-pointer transition-all flex items-center gap-2"
                            >
                              <span>{activeCTA || webContent.primaryCTA || "SHOP NOW"}</span>
                              <span>→</span>
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-white/30 bg-black/40 hover:bg-black/60 px-5 py-3 text-xs font-semibold text-white transition-colors cursor-pointer"
                            >
                              {webContent.secondaryCTA || "EXPLORE LOOKBOOK"}
                            </button>
                          </div>
                        </div>

                        {/* Right Hero Product Spotlight Staged with Dynamic Shape */}
                        <div className="lg:col-span-5 relative flex justify-center items-center h-72 sm:h-96">
                          <ProductFrameStager
                            productUrl={activeCloudinaryProductUrl || product.url}
                            shape={productShape}
                            layout={layoutArrangement}
                            rotation={productRotation}
                            glowColor={frameGlowColor}
                            aspect="banner"
                            showDepthShoe={true}
                          />

                          {/* Vertical Styles Typography (Matching Reference Layout) */}
                          <div className="absolute -right-4 top-2 bottom-2 hidden xl:flex flex-col justify-between items-center text-[9px] font-mono font-bold tracking-[0.3em] text-white/40 uppercase select-none [writing-mode:vertical-rl]">
                            <span>URBAN</span>
                            <span>•</span>
                            <span>LUXURY</span>
                            <span>•</span>
                            <span>BOLD</span>
                            <span>•</span>
                            <span>SPORTY</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                  PLATFORM 4: MARKETPLACE / ECOMMERCE PRODUCT LISTING
              ---------------------------------------------------- */}
              {activeTab === "marketplace" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="inline-block rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-0.5 text-[10px] font-mono text-slate-400">
                      High-Converting Ecommerce Marketplace Product Listing Card · Architectural Series
                    </span>
                  </div>

                  <div className="mx-auto max-w-4xl rounded-2xl border border-white/[0.1] bg-[#0A0D18] shadow-2xl p-6 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Left: Product Gallery with Dynamic Architectural Staging */}
                      <div className="md:col-span-5 space-y-3">
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/[0.1] bg-[#090D1A] flex items-center justify-center select-none text-white">
                          {/* Atmospheric Photorealistic Campaign World Backdrop */}
                          <CampaignWorldBackdrop world={campaignWorld} aspect="square" />

                          {/* Neuromarketing Attention Heatmap Overlay */}
                          {showAttentionHeatmap && (
                            <AttentionHeatmapOverlay
                              onOpenScorecard={() => setShowScorecardModal(true)}
                              aspect="square"
                            />
                          )}

                          {/* Staged Foreground Product with Dynamic Shape & Layout */}
                          <ProductFrameStager
                            productUrl={activeCloudinaryProductUrl || product.url}
                            shape={productShape}
                            layout={layoutArrangement}
                            rotation={productRotation}
                            glowColor={frameGlowColor}
                            aspect="square"
                            showDepthShoe={true}
                          />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 z-25 rounded bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 shadow-md">
                            PRIME VERIFIED
                          </div>

                          <div className="absolute bottom-3 right-3 z-25 rounded bg-black/75 px-2 py-0.5 text-[9px] font-mono text-slate-300 border border-white/10 backdrop-blur-xs">
                            🔍 Hover to zoom
                          </div>
                        </div>

                        {/* Thumbnail Gallery Strip */}
                        <div className="grid grid-cols-4 gap-2">
                          {[0, 1, 2, 3].map((idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setMarketplaceThumb(idx)}
                              className={`aspect-square rounded-lg border bg-[#0F1426] p-1 flex items-center justify-center cursor-pointer transition-all ${
                                marketplaceThumb === idx
                                  ? "border-violet-500 ring-1 ring-violet-500"
                                  : "border-white/[0.08] opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={activeCloudinaryThumbUrl || product.url}
                                alt="Product thumbnail"
                                className="h-full w-full object-contain"
                              />
                            </button>
                          ))}
                        </div>

                        {/* 4 Circular Feature Badges under Gallery */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                          {activeBadges.map((b, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <div className="h-8 w-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
                                {b.icon === "feather" || idx === 0 ? (
                                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z M16 8L2 22 M17.5 15H9" />
                                  </svg>
                                ) : b.icon === "mesh" || idx === 1 ? (
                                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v10M8 7l-2 2M8 7l2 2M12 4v16M12 4l-2 2M12 4l2 2M16 7v10M16 7l-2 2M16 7l2 2" />
                                  </svg>
                                ) : b.icon === "shield" || idx === 2 ? (
                                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3s7 3 7 9c0 5-4.5 8-7 9-2.5-1-7-4-7-9 0-6 7-9 7-9z M9 12l2 2 4-4" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16c2-4 5-5 8-5 3 0 5 3 10 3v3H3v-1z M6 11c1-2 2.5-3 5-3s4 1 5 3" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-[7.5px] font-mono text-slate-400 uppercase mt-0.5 truncate max-w-[55px]">
                                {b.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Product Details & Purchase Actions */}
                      <div className="md:col-span-7 space-y-4 text-left">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-violet-400 font-bold uppercase">
                              ▲ {brandName} STOREFRONT · IN STOCK
                            </span>
                            <span className="rounded bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[9px] font-mono text-slate-400">
                              Official Edition
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-1">
                            {marketContent.productTitle}
                          </h3>

                          {/* Edition Tagline with Handwriting Accent */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="font-mono text-[10px] text-slate-400 uppercase">Series:</span>
                            <span className="font-display font-black text-xs uppercase text-slate-200 tracking-wider">
                              {headlineParts.line1} {headlineParts.line2}
                            </span>
                            <span className="font-handwriting text-xl text-violet-300 leading-none -mt-1">
                              {headlineParts.scriptWord}
                            </span>
                          </div>
                        </div>

                        {/* Ratings & Price */}
                        <div className="flex items-center gap-3 text-xs border-y border-white/[0.06] py-2">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <span>★★★★★</span>
                            <span className="text-white font-mono">{marketContent.rating}</span>
                          </div>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-400 font-mono">
                            {marketContent.reviewsCount} verified customer reviews
                          </span>
                        </div>

                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-black text-white font-mono">
                            {marketContent.price}
                          </span>
                          <span className="text-xs text-slate-500 line-through font-mono">
                            $180.00
                          </span>
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            SAVE 28%
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {marketContent.description}
                        </p>

                        {/* Key Feature Bullets */}
                        <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                          {marketContent.features?.map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold text-xs">✓</span>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* Handwritten Brand Guarantee */}
                        <div className="pt-1 select-none">
                          <p className="font-handwriting text-base text-slate-300 font-bold leading-tight">
                            More than just {productCategory.toLowerCase() || "shoes"}, it&apos;s a vibe.
                          </p>
                          <svg className="w-24 h-2 text-violet-400/80" viewBox="0 0 140 12" fill="none">
                            <path d="M4 8 Q 70 14, 136 3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                          </svg>
                        </div>

                        {/* Shipping & Return guarantees */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                          <span>🚚 Free Next-Day Delivery</span>
                          <span>🔄 30-Day Free Returns</span>
                        </div>

                        {/* Quantity & Buy Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-3">
                          <div className="flex items-center border border-white/[0.15] rounded-xl bg-black/40 text-xs font-mono text-white">
                            <button
                              type="button"
                              onClick={() => setMarketplaceQty((q) => Math.max(1, q - 1))}
                              className="px-2.5 py-2 hover:bg-white/10 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-3 py-2 font-bold">{marketplaceQty}</span>
                            <button
                              type="button"
                              onClick={() => setMarketplaceQty((q) => q + 1)}
                              className="px-2.5 py-2 hover:bg-white/10 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setCartToast(true);
                              setTimeout(() => setCartToast(false), 2500);
                            }}
                            className="flex-1 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md cursor-pointer transition-colors"
                          >
                            {cartToast ? "✓ Added to Cart!" : "Add to Cart"}
                          </button>

                          <button
                            type="button"
                            className="flex-1 rounded-xl bg-[#0A2B54] hover:bg-[#071F3D] px-4 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Toolbar below Preview */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Active Pipeline:</span>
                  <span className="capitalize text-violet-400 font-mono">{activeTab.replace("-", " ")}</span>
                  <span>·</span>
                  <span className="text-slate-400">Cloudinary Responsive Asset</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getActiveAssetUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-600/20 px-3.5 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-600/30 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Open Full Size</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              CAMPAIGN CONSISTENCY (QUALITY CONTROL SYSTEM)
          ---------------------------------------------------- */}
          {campaignCopy && (
            <div id="consistency" className="rounded-2xl border border-white/[0.08] bg-[#111426] p-6 sm:p-7 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    Campaign Consistency
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PixelMind keeps the campaign identity synchronized across every format.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  <span>✓ 100% Brand Lock</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs font-medium">
                <div className="flex items-center gap-2 rounded-lg bg-[#15182B] p-3 text-slate-300 border border-white/[0.05]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Product identity consistent</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#15182B] p-3 text-slate-300 border border-white/[0.05]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Visual identity consistent</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#15182B] p-3 text-slate-300 border border-white/[0.05]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Campaign message consistent</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#15182B] p-3 text-slate-300 border border-white/[0.05]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>CTA consistent</span>
                </div>
              </div>

              <p className="mt-3 text-center sm:text-left text-[11px] text-slate-400 font-mono">
                &ldquo;Your product stays the same. Your campaign adapts to every platform.&rdquo;
              </p>
            </div>
          )}

          {/* ----------------------------------------------------
              FINAL ACTION: START NEW CAMPAIGN
          ---------------------------------------------------- */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#111426] via-[#15182B] to-[#0B0D18] p-6 sm:p-8 text-center text-white shadow-xl">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ready for another product?
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm text-slate-400">
              Upload your next product shot to synthesize another tailored multi-channel campaign instantly.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleUploadAnother}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Start New Campaign</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Display */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs sm:text-sm text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-bold text-red-400 underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Conversion & Neuromarketing Scorecard Modal */}
      <CampaignScorecardModal
        isOpen={showScorecardModal}
        onClose={() => setShowScorecardModal(false)}
        brandName={brandName}
        productName={productDNA?.productName || "Apex Collection"}
        campaignWorld={campaignWorld}
      />

      {/* 1-Click Omnichannel Campaign Media Kit Modal */}
      <CampaignMediaKitModal
        isOpen={showMediaKitModal}
        onClose={() => setShowMediaKitModal(false)}
        brandName={brandName}
        productDNA={productDNA}
        campaignCopy={campaignCopy}
        campaignWorld={campaignWorld}
        activeCloudinaryProductUrl={activeCloudinaryProductUrl}
        activeCloudinaryThumbUrl={activeCloudinaryThumbUrl}
      />
    </div>
  );
}