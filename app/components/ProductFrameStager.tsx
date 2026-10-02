"use client";

import React from "react";
import type { ProductLayoutArrangement, ProductShape } from "../types/productDNA";

interface ProductFrameStagerProps {
  productUrl: string;
  shape?: ProductShape;
  layout?: ProductLayoutArrangement;
  rotation?: number;
  glowColor?: string;
  aspect?: "square" | "story" | "banner";
  className?: string;
  showDepthShoe?: boolean;
}

export default function ProductFrameStager({
  productUrl,
  shape = "natural",
  layout = "staged-plinth",
  rotation = -16,
  glowColor = "#38BDF8",
  aspect = "square",
  className = "",
  showDepthShoe = true,
}: ProductFrameStagerProps) {
  // Shape Clip Paths & Frame Geometries
  const getClipPath = () => {
    switch (shape) {
      case "circle":
        return "circle(48% at 50% 50%)";
      case "star":
        return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
      case "hexagon":
        return "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
      case "diamond":
        return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
      case "badge":
        return "polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)";
      default:
        return "none";
    }
  };

  // Layout Positioning Styles
  const getLayoutClasses = () => {
    if (layout === "hero-centered") {
      return "inset-0 m-auto w-[72%] sm:w-[76%] z-20 flex items-center justify-center";
    }
    if (layout === "editorial-split") {
      return aspect === "banner"
        ? "right-6 sm:right-12 top-1/2 -translate-y-1/2 z-20 w-[55%] flex items-center justify-center"
        : "right-4 sm:right-6 top-[45%] -translate-y-1/2 z-20 w-[60%] flex items-center justify-center";
    }
    if (layout === "diagonal-float") {
      return "right-6 sm:right-10 top-[38%] -translate-y-1/2 z-20 w-[64%] flex items-center justify-center animate-float-slow";
    }
    // Default: Staged Plinth
    if (aspect === "banner") {
      return "right-8 sm:right-12 bottom-[14%] z-20 w-4/5 flex items-center justify-center";
    }
    if (aspect === "story") {
      return "inset-x-0 mx-auto bottom-[24%] z-20 w-[78%] flex items-center justify-center";
    }
    return "right-4 sm:right-7 bottom-[20%] sm:bottom-[21%] z-20 w-[64%] sm:w-[66%] flex items-center justify-center";
  };

  const clipPathStyle = getClipPath();
  const hasShapeMask = shape !== "natural";

  return (
    <div className={`relative ${className}`}>
      {/* ----------------------------------------------------
          SECONDARY BACKGROUND PRODUCT (OPTICAL DEPTH OF FIELD)
      ---------------------------------------------------- */}
      {showDepthShoe && shape === "natural" && layout === "staged-plinth" && (
        <div
          className={`absolute pointer-events-none transform -rotate-6 opacity-70 filter blur-[2px] z-15 ${
            aspect === "banner"
              ? "left-0 bottom-[16%] w-32"
              : aspect === "story"
              ? "left-3 bottom-[26%] w-28"
              : "left-2 sm:left-4 bottom-[20%] sm:bottom-[22%] w-28 sm:w-34"
          }`}
        >
          <img
            src={productUrl}
            alt="Depth of field background shoe"
            className="w-full object-contain filter drop-shadow-[0_12px_15px_rgba(0,0,0,0.5)]"
          />
        </div>
      )}

      {/* ----------------------------------------------------
          GROUND CONTACT SHADOW ON CONCRETE PLINTH
      ---------------------------------------------------- */}
      {layout === "staged-plinth" && (
        <>
          <div
            className={`absolute z-10 rounded-full bg-gradient-to-r from-amber-400/25 via-sky-400/20 to-transparent blur-md pointer-events-none ${
              aspect === "banner"
                ? "right-10 bottom-[14%] w-48 h-8 -rotate-6"
                : aspect === "story"
                ? "right-8 bottom-[20%] w-48 h-7 -rotate-3"
                : "right-10 bottom-[18%] w-48 h-8 -rotate-6"
            }`}
          />
          <div
            className={`absolute z-10 rounded-full bg-black/80 blur-md pointer-events-none ${
              aspect === "banner"
                ? "right-8 bottom-[13%] w-48 h-8 rotate-12"
                : aspect === "story"
                ? "right-6 bottom-[19%] w-44 h-7 rotate-6"
                : "right-12 bottom-[17%] w-44 h-7 rotate-12"
            }`}
          />
        </>
      )}

      {/* ----------------------------------------------------
          PRIMARY PRODUCT FRAMING & MASKING STAGE
      ---------------------------------------------------- */}
      <div
        className={`absolute transition-all duration-500 ease-out hover:scale-105 ${getLayoutClasses()}`}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* SHAPE MASK CONTAINER (WHEN SHAPE IS CIRCLE / STAR / HEXAGON / DIAMOND / BADGE / CARD) */}
        {hasShapeMask ? (
          <div className="relative p-2 flex items-center justify-center">
            {/* Ambient Outer Glow Ring */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse-glow"
              style={{
                backgroundColor: glowColor,
                clipPath: clipPathStyle !== "none" ? clipPathStyle : undefined,
              }}
            />

            {/* Glowing SVG Frame Perimeter Ring */}
            <div
              className="relative p-3 flex items-center justify-center shadow-2xl overflow-hidden"
              style={{
                clipPath: clipPathStyle !== "none" ? clipPathStyle : undefined,
                background:
                  shape === "card"
                    ? "rgba(255, 255, 255, 0.08)"
                    : `radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.5) 75%)`,
                backdropFilter: "blur(12px)",
                border: shape === "card" ? "1.5px solid rgba(255,255,255,0.3)" : undefined,
              }}
            >
              {/* Product inside the framed shape */}
              <img
                src={productUrl}
                alt="Product in custom AI framing"
                className="max-h-60 sm:max-h-72 w-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.85)] transform transition-transform duration-300 hover:scale-110"
              />

              {/* Specular Diagonal Light Sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
            </div>

            {/* Glowing Perimeter Ring Border Overlay for Circle */}
            {shape === "circle" && (
              <div
                className="absolute inset-2 rounded-full pointer-events-none border-2 shadow-lg"
                style={{
                  borderColor: glowColor,
                  boxShadow: `0 0 20px ${glowColor}66`,
                }}
              />
            )}

            {/* Glowing Perimeter Ring Border Overlay for Star / Hexagon / Diamond */}
            {shape !== "circle" && shape !== "card" && (
              <div
                className="absolute inset-1 pointer-events-none border border-white/40 shadow-lg"
                style={{
                  clipPath: clipPathStyle,
                  borderColor: glowColor,
                }}
              />
            )}
          </div>
        ) : (
          /* NATURAL PRODUCT CUTOUT STAGING */
          <img
            src={productUrl}
            alt="Actual uploaded product staged on concrete plinth"
            className="w-full object-contain filter drop-shadow-[0_30px_35px_rgba(0,0,0,0.85)]"
          />
        )}
      </div>
    </div>
  );
}
