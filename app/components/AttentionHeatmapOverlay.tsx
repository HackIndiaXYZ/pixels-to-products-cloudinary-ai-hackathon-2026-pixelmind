"use client";

import React from "react";

interface AttentionHeatmapOverlayProps {
  onOpenScorecard: () => void;
  aspect?: "square" | "story" | "banner";
}

export default function AttentionHeatmapOverlay({
  onOpenScorecard,
  aspect = "square",
}: AttentionHeatmapOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none select-none overflow-hidden animate-fade-in">
      {/* Dimming Backdrop for Saliency Focus */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] transition-opacity duration-300" />

      {/* ----------------------------------------------------
          HOTSPOT 1: PRIMARY PRODUCT FOCAL POINT (64% ATTENTION)
          Red hot core, radiating through amber and cyan.
      ---------------------------------------------------- */}
      <div
        className={`absolute rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.85)_0%,rgba(245,158,11,0.6)_35%,rgba(6,182,212,0.3)_60%,transparent_75%)] blur-xl animate-pulse-glow ${
          aspect === "banner"
            ? "right-[20%] top-[45%] w-80 h-56 -translate-y-1/2"
            : aspect === "story"
            ? "right-[18%] top-[50%] w-72 h-72 -translate-y-1/2"
            : "right-[20%] bottom-[24%] w-64 h-64 -translate-y-1/2"
        }`}
      />

      <div
        className={`absolute pointer-events-auto flex items-center justify-center ${
          aspect === "banner"
            ? "right-[22%] top-[46%]"
            : aspect === "story"
            ? "right-[22%] top-[50%]"
            : "right-[24%] bottom-[28%]"
        }`}
      >
        <div className="rounded-full bg-red-600/90 backdrop-blur-xs text-white font-mono font-black text-[9px] sm:text-[10px] px-2.5 py-1 shadow-xl border border-white/40 flex items-center gap-1.5 animate-bounce">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          <span>① 64% PRODUCT DWELL (1.4s)</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          HOTSPOT 2: HEADLINE & BRAND HOOK (24% ATTENTION)
          Amber core radiating through cyan halo.
      ---------------------------------------------------- */}
      <div
        className={`absolute rounded-full bg-[radial-gradient(ellipse,rgba(245,158,11,0.8)_0%,rgba(6,182,212,0.35)_45%,transparent_70%)] blur-lg ${
          aspect === "banner"
            ? "left-[18%] top-[35%] w-72 h-44"
            : aspect === "story"
            ? "left-[24%] top-[24%] w-64 h-48"
            : "left-[22%] top-[24%] w-56 h-40"
        }`}
      />

      <div
        className={`absolute pointer-events-auto flex items-center justify-center ${
          aspect === "banner"
            ? "left-[18%] top-[34%]"
            : aspect === "story"
            ? "left-[24%] top-[23%]"
            : "left-[22%] top-[22%]"
        }`}
      >
        <div className="rounded-full bg-amber-500/90 backdrop-blur-xs text-slate-950 font-mono font-black text-[8.5px] sm:text-[9.5px] px-2 py-0.5 shadow-lg border border-white/50 flex items-center gap-1">
          <span>② 24% SEMANTIC HOOK (0.6s)</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          HOTSPOT 3: ACTION TRIGGER & CTA (12% ATTENTION)
          Emerald green / cyan activation burst.
      ---------------------------------------------------- */}
      <div
        className={`absolute rounded-full bg-[radial-gradient(ellipse,rgba(16,185,129,0.8)_0%,rgba(6,182,212,0.4)_45%,transparent_70%)] blur-md ${
          aspect === "banner"
            ? "left-[16%] bottom-[18%] w-48 h-28"
            : aspect === "story"
            ? "left-[30%] bottom-[12%] w-44 h-24"
            : "left-[16%] bottom-[12%] w-44 h-28"
        }`}
      />

      <div
        className={`absolute pointer-events-auto flex items-center justify-center ${
          aspect === "banner"
            ? "left-[16%] bottom-[18%]"
            : aspect === "story"
            ? "left-[32%] bottom-[12%]"
            : "left-[16%] bottom-[12%]"
        }`}
      >
        <div className="rounded-full bg-emerald-500/90 backdrop-blur-xs text-slate-950 font-mono font-black text-[8.5px] sm:text-[9.5px] px-2 py-0.5 shadow-lg border border-white/50 flex items-center gap-1">
          <span>③ 12% CONVERSION ACTION (0.3s)</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          GAZE SCANPATH TRAJECTORY SACCADES (① -> ② -> ③)
      ---------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="scanlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <path
          d={
            aspect === "banner"
              ? "M 24 35 Q 50 25, 75 45 T 22 80"
              : aspect === "story"
              ? "M 30 25 Q 60 38, 70 52 T 40 88"
              : "M 28 24 Q 48 34, 68 50 T 24 86"
          }
          fill="none"
          stroke="url(#scanlineGrad)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
      </svg>

      {/* ----------------------------------------------------
          LIVE NEUROMARKETING HUD OVERLAY BAR
      ---------------------------------------------------- */}
      <div className="absolute bottom-2 sm:bottom-3 inset-x-2 sm:inset-x-3 pointer-events-auto rounded-xl bg-[#070914]/90 backdrop-blur-md border border-red-500/40 p-2 sm:p-2.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-white shadow-2xl z-40">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-bold text-red-400">AI Neuromarketing Scan:</span>
          <span className="text-slate-300 hidden sm:inline">
            Saliency: <strong className="text-white">94.8%</strong> · Predicted CTR:{" "}
            <strong className="text-emerald-400">+38%</strong> · Recall:{" "}
            <strong className="text-cyan-300">91%</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenScorecard}
          className="rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/60 px-2.5 py-1 text-red-200 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>Audit Scorecard ↗</span>
        </button>
      </div>
    </div>
  );
}
