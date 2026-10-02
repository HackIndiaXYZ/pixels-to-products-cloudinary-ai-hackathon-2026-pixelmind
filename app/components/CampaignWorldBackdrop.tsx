"use client";

import React from "react";
import type { CampaignWorldType } from "../types/productDNA";

interface CampaignWorldBackdropProps {
  world: CampaignWorldType;
  aspect: "square" | "story" | "banner";
  className?: string;
  showWetPlinth?: boolean;
}

export default function CampaignWorldBackdrop({
  world,
  aspect,
  className = "",
  showWetPlinth = true,
}: CampaignWorldBackdropProps) {
  // ----------------------------------------------------
  // 1. URBAN (DEFAULT MATCHING REFERENCE IMAGE 1:1)
  // Dramatic glass skyscrapers, golden hour sun flare between towers,
  // wet asphalt/concrete plinth with specular water reflections.
  // ----------------------------------------------------
  if (world === "URBAN") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
        {/* Base Moody Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090D1A] via-[#10172A] to-[#1E293B]" />

        {/* Golden Hour Sunburst & Atmospheric Flare streaming between skyscrapers */}
        <div className="absolute top-[12%] right-[22%] w-[70%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.55)_0%,rgba(245,158,11,0.25)_30%,rgba(180,83,9,0.1)_55%,transparent_75%)] blur-2xl transform -rotate-12" />
        <div className="absolute top-0 right-1/4 w-[140%] h-[120%] bg-gradient-to-br from-amber-200/35 via-orange-400/15 to-transparent blur-3xl transform rotate-12" />

        {/* Vector Skyscraper Silhouettes with Illuminated Glass Windows */}
        <svg
          className="absolute inset-0 w-full h-full object-cover opacity-85"
          viewBox="0 0 1080 1080"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="towerGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0F172A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="towerGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#1E293B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="sunBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Skyscraper 1 (Far Left) */}
          <rect x="20" y="80" width="160" height="700" fill="url(#towerGrad1)" />
          {/* Windows Grid */}
          <g opacity="0.25" stroke="#94A3B8" strokeWidth="1">
            <line x1="40" y1="120" x2="40" y2="700" />
            <line x1="70" y1="120" x2="70" y2="700" />
            <line x1="100" y1="120" x2="100" y2="700" />
            <line x1="130" y1="120" x2="130" y2="700" />
            <line x1="160" y1="120" x2="160" y2="700" />
          </g>

          {/* Background Skyscraper 2 (Left-Center, Towering Glass Facade) */}
          <rect x="200" y="20" width="220" height="760" fill="url(#towerGrad2)" />
          <polygon points="200,20 420,80 420,780 200,780" fill="url(#glassReflection)" />
          {/* Vertical Glass Mullions */}
          <g opacity="0.35" stroke="#E2E8F0" strokeWidth="1.5">
            <line x1="230" y1="30" x2="230" y2="780" />
            <line x1="260" y1="40" x2="260" y2="780" />
            <line x1="290" y1="50" x2="290" y2="780" />
            <line x1="320" y1="60" x2="320" y2="780" />
            <line x1="350" y1="70" x2="350" y2="780" />
            <line x1="380" y1="80" x2="380" y2="780" />
          </g>

          {/* Background Skyscraper 3 (Far Center-Right, Majestic Tower where Sun Radiates) */}
          <rect x="490" y="40" width="240" height="740" fill="url(#towerGrad1)" />
          {/* Glass Specular Rim Highlight where Sun hits */}
          <line x1="490" y1="40" x2="490" y2="780" stroke="#FDE68A" strokeWidth="3" opacity="0.8" />
          <g opacity="0.25" stroke="#FDE68A" strokeWidth="1">
            <line x1="520" y1="60" x2="520" y2="780" />
            <line x1="560" y1="80" x2="560" y2="780" />
            <line x1="600" y1="100" x2="600" y2="780" />
            <line x1="640" y1="120" x2="640" y2="780" />
          </g>

          {/* Background Skyscraper 4 (Far Right Glass Megastructure) */}
          <rect x="760" y="10" width="300" height="770" fill="url(#towerGrad2)" />
          <polygon points="760,10 1060,90 1060,780 760,780" fill="url(#glassReflection)" />
          <line x1="760" y1="10" x2="760" y2="780" stroke="#FDE68A" strokeWidth="3" opacity="0.7" />
          <g opacity="0.3" stroke="#CBD5E1" strokeWidth="1.5">
            <line x1="790" y1="20" x2="790" y2="780" />
            <line x1="830" y1="30" x2="830" y2="780" />
            <line x1="870" y1="40" x2="870" y2="780" />
            <line x1="910" y1="50" x2="910" y2="780" />
            <line x1="950" y1="60" x2="950" y2="780" />
            <line x1="990" y1="70" x2="990" y2="780" />
          </g>

          {/* Golden Sun Flare Light Shaft streaming diagonally */}
          <polygon points="450,0 720,0 950,750 300,750" fill="url(#sunBeam)" />
        </svg>

        {/* Ambient Fog / City Haze Layer */}
        <div className="absolute inset-x-0 bottom-[35%] h-36 bg-gradient-to-t from-[#0F172A] via-[#1E293B]/60 to-transparent" />

        {/* ----------------------------------------------------
            WET CONCRETE / STONE PLINTH (MATCHING REFERENCE IMAGE)
            With water sheen, puddle reflections, and sharp bevel edge.
        ---------------------------------------------------- */}
        {showWetPlinth && (
          <div className="absolute inset-x-0 bottom-0 h-[40%] z-10 overflow-hidden">
            {/* Dark Wet Granite / Concrete Slab angled across bottom */}
            <div
              className="w-full h-full bg-gradient-to-b from-[#2B3444] via-[#18202F] to-[#0A0E17] relative"
              style={{ clipPath: aspect === "banner" ? "polygon(0 14%, 100% 0%, 100% 100%, 0 100%)" : "polygon(0 20%, 100% 4%, 100% 100%, 0 100%)" }}
            >
              {/* Top Beveled Edge with Golden Specular Catchlight */}
              <div
                className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#94A3B8] via-[#FDE68A] to-[#64748B] opacity-90 shadow-md"
                style={{ clipPath: aspect === "banner" ? "polygon(0 14%, 100% 0%, 100% 100%, 0 100%)" : "polygon(0 20%, 100% 4%, 100% 100%, 0 100%)" }}
              />

              {/* Wet Stone Puddle Specular Gleam */}
              <div className="absolute top-4 right-1/4 w-3/5 h-16 rounded-full bg-gradient-to-r from-amber-400/20 via-sky-400/15 to-transparent blur-md transform -rotate-3" />
              <div className="absolute top-8 right-1/3 w-2/5 h-10 rounded-full bg-amber-200/25 blur-sm" />

              {/* Rough Stone Granular Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:12px_12px] opacity-15" />

              {/* Vertical Wet Water Drips / Plinth Shading */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. LIFESTYLE (ARCHITECTURAL DAYLIGHT STUDIO)
  // Warm natural sunbeams, clean architectural plaster, and lush green garden bokeh.
  // ----------------------------------------------------
  if (world === "LIFESTYLE") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
        {/* Soft Warm Daylight Wall */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8F5] via-[#F2EDE4] to-[#DDD6CA]" />

        {/* Morning Sunbeam Cast from Upper Right */}
        <div className="absolute -top-1/4 -right-1/4 w-[160%] h-[160%] bg-gradient-to-br from-white/70 via-transparent to-[#0A1A2E]/[0.06] transform rotate-12" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(255,255,255,0.85)_0%,transparent_60%)]" />

        {/* Natural Lush Greenery Foliage Bokeh on Left */}
        <div className="absolute -left-12 top-[22%] w-40 h-60 rounded-full bg-gradient-to-tr from-emerald-900/40 via-emerald-700/25 to-transparent blur-md -rotate-12" />
        <div className="absolute -left-6 top-[32%] w-28 h-36 rounded-full bg-emerald-800/35 blur-sm" />

        {/* Honed Natural Concrete / Travertine Plinth */}
        {showWetPlinth && (
          <div className="absolute inset-x-0 bottom-0 h-[38%] z-10 overflow-hidden">
            <div
              className="w-full h-full bg-gradient-to-b from-[#8E95A5] via-[#6D7484] to-[#4F5564] relative"
              style={{ clipPath: "polygon(0 18%, 100% 0%, 100% 100%, 0 100%)" }}
            >
              <div
                className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DDE1EB] via-[#CAD1DE] to-[#B2B8C6] opacity-90 shadow-xs"
                style={{ clipPath: "polygon(0 18%, 100% 0%, 100% 100%, 0 100%)" }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(#3c4250_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. PERFORMANCE (KINETIC STADIUM ARENA)
  // Dynamic cyan floodlights, dark composite track, and aerodynamic speed geometry.
  // ----------------------------------------------------
  if (world === "PERFORMANCE") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
        {/* Kinetic Indigo & Deep Navy Ground */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#061426] via-[#0A1F38] to-[#040C17]" />

        {/* Stadium Floodlight Cones */}
        <div className="absolute -top-20 left-1/3 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.35)_0%,rgba(14,165,233,0.15)_35%,transparent_70%)] blur-2xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />

        {/* Dynamic Vector Speed Streaks */}
        <svg
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          viewBox="0 0 1080 1080"
          preserveAspectRatio="none"
          fill="none"
        >
          <line x1="-100" y1="200" x2="1200" y2="600" stroke="#22D3EE" strokeWidth="2" strokeDasharray="16 16" />
          <line x1="-100" y1="280" x2="1200" y2="680" stroke="#38BDF8" strokeWidth="1" strokeDasharray="8 8" />
          <line x1="-100" y1="360" x2="1200" y2="760" stroke="#0284C7" strokeWidth="3" />
        </svg>

        {/* Carbon-Fiber Athletic Track Plinth */}
        {showWetPlinth && (
          <div className="absolute inset-x-0 bottom-0 h-[38%] z-10 overflow-hidden">
            <div
              className="w-full h-full bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] relative"
              style={{ clipPath: "polygon(0 16%, 100% 2%, 100% 100%, 0 100%)" }}
            >
              {/* Electric Cyan Edge Highlight */}
              <div
                className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 opacity-90 shadow-md shadow-cyan-500/50"
                style={{ clipPath: "polygon(0 16%, 100% 2%, 100% 100%, 0 100%)" }}
              />
              {/* Carbon Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px] opacity-15" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // 4. NIGHT (OBSIDIAN MIDNIGHT METROPOLIS)
  // Midnight obsidian skyscrapers, neon purple/magenta specular highlights, and gold script accents.
  // ----------------------------------------------------
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* Deep Obsidian Midnight Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070E] via-[#0B0F1C] to-[#121626]" />

      {/* Cyber Neon Glow Rays */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-purple-600/25 blur-3xl" />
      <div className="absolute top-1/3 left-10 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl" />

      {/* Midnight City Tower Wireframes */}
      <svg
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        viewBox="0 0 1080 1080"
        preserveAspectRatio="none"
        fill="none"
      >
        <rect x="80" y="100" width="160" height="700" fill="#0B0F1E" stroke="#312E81" strokeWidth="1" />
        <rect x="280" y="40" width="220" height="760" fill="#0E1326" stroke="#4C1D95" strokeWidth="1" />
        <rect x="540" y="80" width="200" height="720" fill="#0B0F1E" stroke="#312E81" strokeWidth="1" />
        <rect x="780" y="20" width="240" height="780" fill="#0E1326" stroke="#4C1D95" strokeWidth="1" />
        {/* Neon City Spotlights */}
        <line x1="800" y1="20" x2="800" y2="800" stroke="#F59E0B" strokeWidth="2" opacity="0.6" />
      </svg>

      {/* Dark Terrazzo / Wet Obsidian Plinth */}
      {showWetPlinth && (
        <div className="absolute inset-x-0 bottom-0 h-[40%] z-10 overflow-hidden">
          <div
            className="w-full h-full bg-gradient-to-b from-[#181C28] via-[#0F121C] to-[#07090F] relative"
            style={{ clipPath: "polygon(0 18%, 100% 4%, 100% 100%, 0 100%)" }}
          >
            {/* Gold Specular Edge */}
            <div
              className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 opacity-90 shadow-md shadow-amber-500/40"
              style={{ clipPath: "polygon(0 18%, 100% 4%, 100% 100%, 0 100%)" }}
            />
            {/* Specular Neon Puddle Sheen */}
            <div className="absolute top-6 right-1/4 w-1/2 h-12 rounded-full bg-purple-500/20 blur-md" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:12px_12px] opacity-20" />
          </div>
        </div>
      )}
    </div>
  );
}
