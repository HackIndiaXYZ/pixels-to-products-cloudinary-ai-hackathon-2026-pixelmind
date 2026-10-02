"use client";

import React from "react";

interface CampaignScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  productName: string;
  campaignWorld: string;
}

export default function CampaignScorecardModal({
  isOpen,
  onClose,
  brandName,
  productName,
  campaignWorld,
}: CampaignScorecardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-violet-500/30 bg-[#0A0D18] p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
        {/* Glow Accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                AI Conversion Intelligence
              </span>
              <span className="rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-slate-400">
                Neuromarketing Audit v2.4
              </span>
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-black text-white tracking-tight">
              Campaign Conversion & Saliency Audit
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audited for <strong className="text-white">{brandName}</strong> ·{" "}
              {productName} ({campaignWorld} World)
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

        {/* Overall Score Banner */}
        <div className="mt-5 rounded-xl bg-gradient-to-r from-violet-950/80 via-indigo-950/60 to-slate-900 border border-violet-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 flex items-center justify-center shrink-0 shadow-lg">
              <div className="h-full w-full rounded-[14px] bg-[#0B0D1A] flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white leading-none">95</span>
                <span className="text-[9px] font-mono text-cyan-300 font-bold">/100</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">Grade A+ · Elite Performance</h4>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.2">
                  Top 4% Global
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Optimal dwell time, high brand salience, and low cognitive friction.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.08]">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Predicted Meta CTR</p>
            <p className="text-xl font-black text-emerald-400">+38% vs Industry</p>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">Visual Saliency & Focal Weight</span>
              <span className="font-mono font-bold text-cyan-400">97%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: "97%" }} />
            </div>
            <p className="text-[11px] text-slate-400">
              Wet plinth specular gleam focuses gaze directly on the Cloudinary shoe within 120ms.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">Typography & Headline Punch</span>
              <span className="font-mono font-bold text-violet-400">94%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-violet-400 rounded-full" style={{ width: "94%" }} />
            </div>
            <p className="text-[11px] text-slate-400">
              Electric blue cursive script breaks horizontal gaze patterns, boosting cognitive recall.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">Source Product Fidelity</span>
              <span className="font-mono font-bold text-emerald-400">100%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
            </div>
            <p className="text-[11px] text-slate-400">
              Immutable Cloudinary delivery ensures zero AI hallucination or counterfeit product drift.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">Platform-Native Compliance</span>
              <span className="font-mono font-bold text-amber-400">96%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: "96%" }} />
            </div>
            <p className="text-[11px] text-slate-400">
              Strictly adheres to Meta 20% text density limits, safe zones, and aspect ratios.
            </p>
          </div>
        </div>

        {/* AI Creative Recommendations */}
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0E1324] p-3.5 text-xs text-slate-300">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span>💡</span>
            <span>AI Executive Recommendation:</span>
          </p>
          <p className="mt-1 text-slate-300 leading-relaxed text-[11.5px]">
            Creative is ready for immediate ad spend. Allocate <strong>55% to Kinetic Reel / Story Ads</strong> for high viral hook rate, <strong>35% to Instagram 1:1 In-Feed</strong> for brand retention, and <strong>10% to Marketplace Retargeting</strong>.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
