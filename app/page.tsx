import ProductUpload from "./components/ProductUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070812] text-[#F8FAFC] flex flex-col md:flex-row selection:bg-violet-600 selection:text-white">
      {/* ----------------------------------------------------
          2. LEFT SIDEBAR (DESKTOP APPLICATION SHELL)
      ---------------------------------------------------- */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col justify-between border-r border-white/[0.07] bg-[#0B0D18] p-5 h-screen sticky top-0 overflow-y-auto">
        <div className="space-y-6">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-600 shadow-lg shadow-violet-600/30">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">
                  Pixel<span className="text-violet-400">Mind</span>
                </span>
                <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-300 border border-violet-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                AI CAMPAIGN STUDIO
              </p>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="space-y-1 text-xs font-medium">
            <div className="pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
              Studio Workspace
            </div>

            <a
              href="#dashboard"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/20 border border-transparent transition-all group"
            >
              <svg className="h-4 w-4 text-violet-400 group-hover:text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </a>

            <a
              href="#campaign-studio"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/20 border border-transparent transition-all group"
            >
              <svg className="h-4 w-4 text-pink-400 group-hover:text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Campaign Studio</span>
              <span className="ml-auto rounded-full bg-violet-500/20 px-1.5 py-0.2 text-[9px] font-bold text-violet-300">
                Live
              </span>
            </a>

            <a
              href="#product-dna"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/20 border border-transparent transition-all group"
            >
              <svg className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Product DNA</span>
            </a>

            <a
              href="#campaign-dna"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/20 border border-transparent transition-all group"
            >
              <svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Campaign DNA</span>
            </a>

            {/* Separator */}
            <div className="py-2">
              <div className="border-t border-white/[0.07]" />
            </div>

            <div className="pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
              Delivery &amp; Sync
            </div>

            <a
              href="#campaign-copy"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/20 border border-transparent transition-all group"
            >
              <svg className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Campaign Copy</span>
            </a>

            <a
              href="#campaign-studio"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/20 border border-transparent transition-all group"
            >
              <svg className="h-4 w-4 text-amber-400 group-hover:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>Remix Style</span>
            </a>

            <a
              href="#consistency"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-violet-500/10 hover:text-white hover:border-violet-500/20 border border-transparent transition-all group"
            >
              <svg className="h-4 w-4 text-violet-400 group-hover:text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Brand Consistency</span>
            </a>

            {/* Separator */}
            <div className="py-2">
              <div className="border-t border-white/[0.07]" />
            </div>

            <div className="pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
              Information
            </div>

            <a
              href="#how-it-works"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-all"
            >
              <span>How It Works</span>
            </a>

            <a
              href="#about"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-all"
            >
              <span>About</span>
            </a>
          </nav>
        </div>

        {/* Sidebar Footer Indicator */}
        <div className="rounded-xl border border-white/[0.07] bg-[#111426] p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Cloud-powered</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ready
            </span>
          </div>
          <p className="text-[10px] font-medium text-slate-500">
            AI Creative Engine • Cloudinary
          </p>
        </div>
      </aside>

      {/* ----------------------------------------------------
          MAIN APPLICATION AREA
      ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070812]">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#070812]/80 backdrop-blur-xl px-4 sm:px-8 h-14 flex items-center justify-between">
          {/* Left Title / Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="flex md:hidden h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs">
              P
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-bold text-white">PixelMind</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 font-medium">AI Campaign Studio</span>
            </div>
          </div>

          {/* Right Header Status & Action */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#111426] border border-white/[0.08] px-3 py-1 text-[11px] font-semibold text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Studio Engine Online</span>
            </div>

            <a
              href="#dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>+ New Campaign</span>
            </a>
          </div>
        </header>

        {/* DASHBOARD HERO / WELCOME */}
        <section id="dashboard" className="pt-8 pb-4 px-4 sm:px-8 border-b border-white/[0.05] studio-grid-pattern relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-0.5 text-[11px] font-semibold text-violet-300 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
              Autonomous Creative Pipeline
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Turn One Product Into{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                An Entire Campaign.
              </span>
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Upload once. PixelMind builds the product intelligence, campaign strategy and platform-ready creatives.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Multimodal Product Intelligence
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                Cloudinary Optimized Transformation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Cross-Platform Brand Lock
              </span>
            </div>
          </div>
        </section>

        {/* WORKSPACE CANVAS */}
        <main className="flex-1 px-4 sm:px-8 py-8 space-y-12">
          <ProductUpload />

          {/* 4. WORKFLOW ENGINE (HOW IT WORKS) */}
          <section id="how-it-works" className="border-t border-white/[0.07] pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">
                Pipeline Architecture
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                How PixelMind Synthesizes Campaigns
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.08] bg-[#111426] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 font-bold text-sm mb-3 border border-violet-500/20">
                  01
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  Drop Product Photo
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Image uploaded directly to Cloudinary media delivery network with real-time format transformation.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111426] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-600/20 text-pink-400 font-bold text-sm mb-3 border border-pink-500/20">
                  02
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  AI Product Intelligence
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Computer vision dissects product colorway, geometry, category classification, and strategic positioning.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111426] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400 font-bold text-sm mb-3 border border-cyan-500/20">
                  03
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  Multi-Channel Synthesis
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Campaign DNA harmonizes copywriting and renders native creatives for Instagram, Stories, Web Banners, and Marketplaces.
                </p>
              </div>
            </div>
          </section>

          {/* 5. ABOUT PIXELMIND */}
          <section id="about" className="border-t border-white/[0.07] pt-12 pb-6">
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#111426] via-[#15182B] to-[#0D1021] p-6 sm:p-8">
              <span className="inline-block rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/20 mb-3">
                Brand Continuity
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Why PixelMind?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
                Marketing fragmentation kills conversion. When advertisements, social stories, website hero banners, and marketplace listings speak with mismatched aesthetics and disjointed copy, brand trust deteriorates. PixelMind establishes an immutable Campaign DNA anchored on your product photo, ensuring total visual and strategic alignment across every digital surface.
              </p>
            </div>
          </section>
        </main>

        {/* 17. FOOTER */}
        <footer className="border-t border-white/[0.07] bg-[#070812] px-4 sm:px-8 py-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PixelMind</span>
            <span>·</span>
            <span>One Product. Every Format.</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Cloudinary-powered asset pipeline • AI creative engine • Built with Next.js • Cloudinary • AI
          </div>
        </footer>
      </div>
    </div>
  );
}