"use client";

import React, { useState } from "react";
import type { CampaignCopy, CampaignWorldType, ProductDNA } from "../types/productDNA";

interface CampaignMediaKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  productDNA: ProductDNA | null;
  campaignCopy: CampaignCopy | null;
  campaignWorld: CampaignWorldType;
  activeCloudinaryProductUrl: string;
  activeCloudinaryThumbUrl: string;
}

export default function CampaignMediaKitModal({
  isOpen,
  onClose,
  brandName,
  productDNA,
  campaignCopy,
  campaignWorld,
  activeCloudinaryProductUrl,
  activeCloudinaryThumbUrl,
}: CampaignMediaKitModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownloadJSONManifest = () => {
    const manifest = {
      project: "PixelMind AI Campaign Studio",
      generatedAt: new Date().toISOString(),
      brand: brandName,
      campaignWorld,
      productDNA,
      campaignCopy,
      cloudinaryAssets: {
        productMasterUrl: activeCloudinaryProductUrl,
        thumbnailUrl: activeCloudinaryThumbUrl,
        formats: [
          { platform: "Instagram Post", aspect: "1:1", dimensions: "1080x1080" },
          { platform: "Instagram Story", aspect: "9:16", dimensions: "1080x1920" },
          { platform: "Kinetic Video Reel", aspect: "9:16", dimensions: "1080x1920 (Motion)" },
          { platform: "Website Hero Banner", aspect: "16:9", dimensions: "1920x1080" },
          { platform: "Marketplace Listing", aspect: "Square", dimensions: "1200x1200" },
        ],
      },
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pixelmind-${brandName.toLowerCase()}-campaign-kit.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fullSocialCopyKit = `--- PIXELMIND CAMPAIGN MEDIA BRIEF ---
BRAND: ${brandName}
PRODUCT: ${productDNA?.productName || "Apex Collection"}
CAMPAIGN WORLD: ${campaignWorld}

[INSTAGRAM POST (1:1)]
Hook: ${campaignCopy?.instagram?.hook || campaignCopy?.headline || "BUILT FOR BIGGER DREAMS"}
Caption:
${campaignCopy?.instagram?.caption || "Elevate your daily rhythm."}

Hashtags:
${(campaignCopy?.instagram?.hashtags || ["#PixelMind", "#Style", "#Streetwear"]).join(" ")}

[INSTAGRAM STORY (9:16)]
Headline: ${campaignCopy?.story?.headline || "SAME YOU. HIGHER STANDARDS."}
Supporting: ${campaignCopy?.story?.supportingText || "Engineered for everyday performance."}
CTA: ${campaignCopy?.story?.cta || "Swipe Up to Shop"}

[WEBSITE HERO BANNER (16:9)]
Headline: ${campaignCopy?.website?.headline || "Architected For The Modern Street."}
Subheadline: ${campaignCopy?.website?.subheadline || "Experience unmatched versatility and timeless aesthetic."}
Primary CTA: ${campaignCopy?.website?.primaryCTA || "Shop Collection"}

[MARKETPLACE LISTING]
Title: ${campaignCopy?.marketplace?.productTitle || productDNA?.productName}
Price: ${campaignCopy?.marketplace?.price || "$129.00"}
Key Benefits:
${(campaignCopy?.marketplace?.features || ["Lightweight", "Breathable", "Durable"]).map((f) => `• ${f}`).join("\n")}

[CLOUDINARY CDN ASSET DELIVERY URL]
${activeCloudinaryProductUrl}
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-violet-500/30 bg-[#0A0D18] p-6 sm:p-8 shadow-2xl text-left overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-violet-600/20 border border-violet-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-violet-300 uppercase">
                Omnichannel Media Launchpad
              </span>
              <span className="rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-slate-400">
                Cloudinary Asset Package
              </span>
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-black text-white tracking-tight">
              1-Click Campaign Production Package
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Export high-resolution Cloudinary delivery links, copy strings, and campaign metadata.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-4 my-4 pr-1 text-xs">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadJSONManifest}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-3 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer flex flex-col items-center justify-center text-center gap-1"
            >
              <span className="text-base">📥</span>
              <span>Download JSON Manifest</span>
              <span className="text-[10px] opacity-75 font-normal">Complete SDK specs</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyText(fullSocialCopyKit, "fullCopy")}
              className="rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] p-3 text-white font-semibold transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1"
            >
              <span className="text-base">{copiedSection === "fullCopy" ? "✓" : "📋"}</span>
              <span>{copiedSection === "fullCopy" ? "Copied All Copy!" : "Copy Full Copy Kit"}</span>
              <span className="text-[10px] text-slate-400 font-normal">All 5 formats + tags</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyText(activeCloudinaryProductUrl, "cldUrl")}
              className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 p-3 text-cyan-200 font-semibold transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1"
            >
              <span className="text-base">{copiedSection === "cldUrl" ? "✓" : "⚡"}</span>
              <span>{copiedSection === "cldUrl" ? "Copied CDN URL!" : "Copy Cloudinary CDN"}</span>
              <span className="text-[10px] text-cyan-400/80 font-normal">Edge auto-format (f_auto)</span>
            </button>
          </div>

          {/* Formats Overview Table */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="p-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">
                Generated Omnichannel Matrix (5 Formats)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">● 100% Production Ready</span>
            </div>
            <div className="divide-y divide-white/[0.04] text-[11px]">
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-200 font-medium">📷 Instagram In-Feed Post</span>
                <span className="font-mono text-slate-400">1080 × 1080 (1:1) · Editorial Drop</span>
                <span className="text-violet-400 font-mono">f_auto,q_auto</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-200 font-medium">📱 Instagram Story Ad</span>
                <span className="font-mono text-slate-400">1080 × 1920 (9:16) · Vertical Staged</span>
                <span className="text-violet-400 font-mono">f_auto,q_auto</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-200 font-medium">🎬 Kinetic Video Reel Motion Ad</span>
                <span className="font-mono text-slate-400">1080 × 1920 (9:16) · 60fps Motion</span>
                <span className="text-violet-400 font-mono">Interactive Reel</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-200 font-medium">🖥️ Website Hero Banner</span>
                <span className="font-mono text-slate-400">1920 × 1080 (16:9) · Panoramic Landscape</span>
                <span className="text-violet-400 font-mono">f_auto,q_auto</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="text-slate-200 font-medium">🛍️ Marketplace Product Listing</span>
                <span className="font-mono text-slate-400">1200 × 1200 · High-Converting Ecom</span>
                <span className="text-violet-400 font-mono">f_auto,q_auto</span>
              </div>
            </div>
          </div>

          {/* Raw Cloudinary CDN Delivery Box */}
          <div className="rounded-xl border border-white/[0.08] bg-[#070914] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Active Cloudinary Edge CDN Endpoint
              </span>
              <a
                href={activeCloudinaryProductUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:text-white underline"
              >
                Open in new tab ↗
              </a>
            </div>
            <pre className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-[10px] text-slate-300 break-all select-all">
              {activeCloudinaryProductUrl}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/[0.08] pt-3 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Immutable Product ID: <strong className="text-slate-200">{productDNA?.productName || "Verified"}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
