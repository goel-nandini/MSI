'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface ScreenLoaderProps {
  onLoadingComplete?: () => void;
  minDurationMs?: number;
}

export default function ScreenLoader({
  onLoadingComplete,
  minDurationMs = 1800,
}: ScreenLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [statusText, setStatusText] = useState('INITIALIZING LEGAL ARCHIVES...');

  // Track session load state
  useEffect(() => {
    // If user has already seen the loader in this tab session, we can make it super-fast or allow normal viewing
    const startTime = performance.now();
    let animationFrameId: number;

    const phrases = [
      { at: 15, text: 'INDEXING BARE ACTS & CASE LAWS...' },
      { at: 45, text: 'PREPARING JUDICIAL SERVICE MODULES...' },
      { at: 75, text: 'CALIBRATING CLAT & HIGH COURT SYLLABI...' },
      { at: 92, text: 'CRAFTING LEGAL BRILLIANCE...' },
      { at: 100, text: 'WELCOME TO MSI INSTITUTES' },
    ];

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min((elapsed / minDurationMs) * 100, 100);

      // Non-linear easing (starts smooth, steady through mid, quick finish)
      const easeProgress = Math.floor(rawProgress);
      setProgress(easeProgress);

      // Update cycling status text
      const currentPhrase = phrases.find((p) => easeProgress <= p.at) || phrases[phrases.length - 1];
      setStatusText(currentPhrase.text);

      if (rawProgress < 100) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        // Hold on 100% briefly before curtain lift
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(() => {
            setShouldRender(false);
            if (onLoadingComplete) onLoadingComplete();
          }, 850); // Curtain exit duration
        }, 250);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrameId);
  }, [minDurationMs, onLoadingComplete]);

  // Fast skip on click or Esc
  const handleSkip = () => {
    setProgress(100);
    setStatusText('WELCOME TO MSI INSTITUTES');
    setIsFinished(true);
    setTimeout(() => {
      setShouldRender(false);
      if (onLoadingComplete) onLoadingComplete();
    }, 450);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999999] select-none flex flex-col items-center justify-between bg-[#0B1526] text-white overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
        isFinished ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
      aria-label="Loading MSI Group of Institutes"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* ── Blueprint Grid & Ambient Lights ────────────────────── */}
      <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />

      {/* Crimson Ambient Glow (Top Left) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#89190E]/25 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Gold Ambient Glow (Bottom Right) */}
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#EFC988]/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Center Golden Light Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#EFC988]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* ── HUD Corner Accents ─────────────────────────────────── */}
      <span className="hud-dot-tl" style={{ top: 20, left: 20 }} />
      <span className="hud-dot-tr" style={{ top: 20, right: 20 }} />
      <span className="hud-dot-bl" style={{ bottom: 20, left: 20 }} />
      <span className="hud-dot-br" style={{ bottom: 20, right: 20 }} />

      {/* Top Gold Border Rule */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#EFC988] to-transparent opacity-80" />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TOP HUD STATUS BAR                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <header className="relative z-10 w-full max-w-[1400px] px-6 sm:px-12 pt-8 sm:pt-10 flex items-center justify-between text-[11px] sm:text-xs mono-accent font-semibold tracking-widest text-[#EFC988]">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#89190E] animate-ping" />
          <span className="text-[#FFF9EF]/90 uppercase font-mono">MSI // LEGAL ACADEMIC ARCHIVES</span>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-white/60">
          <span>KHARAR • MOHALI</span>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CENTRAL VISUAL: ROTATING RINGS + MSI CREST + COUNTER       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-6">
        {/* Animated Concentric Golden Orbital Rings & Official MSI Logo */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mb-8">
          {/* Outer Dashed Rotating Ring */}
          <div
            className="absolute -inset-2.5 rounded-full border-2 border-dashed border-[#EFC988]/50 animate-astrolabe pointer-events-none"
          />

          {/* Middle Fine Ring with Compass Ticks */}
          <div
            className="absolute inset-1 rounded-full border border-[#89190E]/80 animate-astrolabe-reverse pointer-events-none"
          />

          {/* Inner Glowing Ring */}
          <div className="absolute inset-4 rounded-full border border-[#EFC988]/60 animate-aura-pulse pointer-events-none" />

          {/* Cardinal Diamond Jewel Points */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#EFC988] shadow-[0_0_10px_#EFC988]" />
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#EFC988] shadow-[0_0_10px_#EFC988]" />
          <span className="absolute top-1/2 -left-3 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#89190E] shadow-[0_0_10px_#89190E]" />
          <span className="absolute top-1/2 -right-3 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#89190E] shadow-[0_0_10px_#89190E]" />

          {/* Central Official MSI Logo */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-br from-[#EFC988] via-[#89190E] to-[#10233F] shadow-[0_0_40px_rgba(239,201,136,0.4)] animate-logo-float">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0A1322] border-2 border-[#EFC988]">
              <Image
                src="/images/msi-official-logo.png"
                alt="MSI Group of Institutes Official Logo"
                fill
                priority
                className="object-contain p-0.5 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                sizes="(max-width: 640px) 144px, 176px"
              />
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-25 animate-sheen-sweep" />
              </div>
            </div>
          </div>

          {/* Orbiting Satellite Dot */}
          <div
            className="absolute -inset-2.5 rounded-full animate-spin pointer-events-none"
            style={{ animationDuration: '6s' }}
          >
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#EFC988] shadow-[0_0_12px_#EFC988] animate-pulse" />
          </div>
        </div>

        {/* Serif Percentage Counter */}
        <div className="flex items-baseline justify-center space-x-1 mb-2">
          <span className="font-serif text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#EFC988] via-[#FFF9EF] to-[#EFC988] drop-shadow-[0_4px_20px_rgba(239,201,136,0.25)] tabular-nums">
            {String(progress).padStart(2, '0')}
          </span>
          <span className="font-serif text-3xl sm:text-4xl text-[#EFC988] font-bold">
            %
          </span>
        </div>

        {/* Dynamic Rotating Status Tagline */}
        <div className="h-6 flex items-center justify-center">
          <span className="text-xs sm:text-sm mono-accent font-mono font-bold tracking-[0.25em] text-[#EFC988] uppercase transition-all duration-300">
            {statusText}
          </span>
        </div>

        {/* ── Progress Bar & Flare ─────────────────────────────── */}
        <div className="w-full max-w-[340px] sm:max-w-[420px] mt-6">
          <div className="relative h-[3px] bg-white/10 rounded-full overflow-hidden">
            {/* Active Gradient Bar */}
            <div
              className="h-full bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#FFF9EF] rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_#EFC988]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Micro HUD Progress Labels */}
          <div className="flex items-center justify-between text-[10px] mono-accent text-white/50 mt-2 font-mono tracking-wider">
            <span>MSI // CORE.SYS</span>
            <span>{progress}/100</span>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* BOTTOM FOOTER WITH MOTTO & SKIP HINT                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 w-full max-w-[1400px] px-6 sm:px-12 pb-8 sm:pb-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="font-serif text-sm sm:text-base text-white/90 font-medium tracking-wide">
            Crafting Legal Brilliance, Creating a Better Nation
          </p>
          <p className="text-[11px] text-white/50 tracking-wider font-sans mt-0.5">
            Premier Coaching for PCS J (Judiciary), CLAT (UG & PG), PU Law & UGC NET
          </p>
        </div>

        <div className="text-[10px] mono-accent text-white/40 tracking-widest uppercase hover:text-[#EFC988] transition-colors cursor-pointer flex items-center gap-1.5">
          <span>Click anywhere to enter</span>
          <span className="text-[#EFC988]">→</span>
        </div>
      </footer>

      {/* Bottom Gold Accent Beam */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#89190E] opacity-90" />
    </div>
  );
}
