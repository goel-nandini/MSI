'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck, Scale, Award } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export default function SplashScreen({
  onComplete,
  minDurationMs = 2600,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [statusMessage, setStatusMessage] = useState('INITIALIZING LEGAL ARCHIVES...');

  useEffect(() => {
    // Check if user already saw the splash screen in this session
    const hasSeen = typeof window !== 'undefined' && sessionStorage.getItem('msi_splash_viewed');
    
    // Balanced duration: 2.6s on first load, or 1.8s on return so animations are appreciated
    const targetDuration = hasSeen ? 1800 : minDurationMs;
    const startTime = performance.now();
    let animationFrameId: number;

    const milestones = [
      { at: 20, text: 'INDEXING CONSTITUTIONAL PRECEDENTS...' },
      { at: 45, text: 'CALIBRATING PCS J & CLAT MODULES...' },
      { at: 75, text: 'LOADING PANJAB UNIVERSITY LAW ARCHIVES...' },
      { at: 90, text: 'CRAFTING LEGAL BRILLIANCE...' },
      { at: 100, text: 'WELCOME TO MSI INSTITUTES' },
    ];

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const raw = Math.min((elapsed / targetDuration) * 100, 100);
      const currentInt = Math.floor(raw);

      setProgress(currentInt);

      const found = milestones.find((m) => currentInt <= m.at) || milestones[milestones.length - 1];
      setStatusMessage(found.text);

      if (raw < 100) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('msi_splash_viewed', 'true');
        }
        // Brief hold on 100% for satisfaction before curtain exit
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setShouldRender(false);
            if (onComplete) onComplete();
          }, 800);
        }, 260);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [minDurationMs, onComplete]);

  // Fast skip trigger
  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('msi_splash_viewed', 'true');
    }
    setProgress(100);
    setStatusMessage('WELCOME TO MSI INSTITUTES');
    setIsExiting(true);
    setTimeout(() => {
      setShouldRender(false);
      if (onComplete) onComplete();
    }, 400);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[99999999] select-none flex flex-col items-center justify-between bg-[#060D18] text-white overflow-hidden transition-all duration-800 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isExiting ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
      aria-label="MSI Group of Institutes Splash Screen"
      role="dialog"
      aria-modal="true"
    >
      {/* ── Background Blueprint Grid ──────────────────────── */}
      <div className="absolute inset-0 blueprint-grid opacity-15 pointer-events-none" />

      {/* ── Ambient Radial Flares ──────────────────────────── */}
      {/* Crimson Royal Flare (Top Left) */}
      <div className="absolute -top-28 -left-28 w-[550px] h-[550px] bg-[#89190E]/35 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />

      {/* Champagne Gold Flare (Bottom Right) */}
      <div className="absolute -bottom-28 -right-28 w-[550px] h-[550px] bg-[#EFC988]/25 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />

      {/* Center Golden Core Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#EFC988]/15 rounded-full blur-[120px] pointer-events-none animate-aura-pulse" />

      {/* ── HUD Corner Registration Ticks ──────────────────── */}
      <span className="hud-dot-tl" style={{ top: 24, left: 24 }} />
      <span className="hud-dot-tr" style={{ top: 24, right: 24 }} />
      <span className="hud-dot-bl" style={{ bottom: 24, left: 24 }} />
      <span className="hud-dot-br" style={{ bottom: 24, right: 24 }} />

      {/* Top Gold Horizon Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#EFC988] to-transparent opacity-90" />

      {/* ══════════════════════════════════════════════════════ */}
      {/* 1. TOP HEADER HUD                                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <header className="relative z-20 w-full max-w-[1400px] px-6 sm:px-12 pt-8 sm:pt-10 flex items-center justify-between text-xs font-mono tracking-widest text-[#EFC988]">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#89190E] animate-ping" />
          <span className="text-[#FFF9EF]/90 uppercase font-bold text-[11px] sm:text-xs tracking-wider">
            MSI // JUDICIAL & LEGAL ARCHIVES
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="group flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-[#89190E] text-[#FFF9EF] border border-[#E8DCCB]/30 hover:border-[#89190E] transition-all duration-300 text-[11px] font-bold tracking-wider cursor-pointer"
        >
          <span>SKIP INTRO</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </header>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 2. CENTER SPLASH HERO: OFFICIAL LOGO + ANIMATION     */}
      {/* ══════════════════════════════════════════════════════ */}
      <main className="relative z-20 flex flex-col items-center justify-center text-center my-auto px-6 max-w-3xl">
        {/* Animated Concentric Astrolabe Orbits & Official MSI Logo */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 flex items-center justify-center mb-6">
          
          {/* Concentric Pulsing Shockwave Ring */}
          <div
            className="absolute inset-0 rounded-full border border-[#EFC988]/30 animate-aura-pulse pointer-events-none"
          />

          {/* Outer Dashed Celestial Astrolabe Ring (Rotating Clockwise) */}
          <div
            className="absolute -inset-2.5 sm:-inset-3.5 rounded-full border-2 border-dashed border-[#EFC988]/50 animate-astrolabe pointer-events-none"
          />

          {/* Fine Crimson Inner Orbit (Counter-Rotating) */}
          <div
            className="absolute inset-1.5 rounded-full border border-[#89190E]/80 animate-astrolabe-reverse pointer-events-none"
          />

          {/* Cardinal Diamond Jewel Points (12, 3, 6, 9 o'clock) */}
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#EFC988] shadow-[0_0_12px_#EFC988]" />
          <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#EFC988] shadow-[0_0_12px_#EFC988]" />
          <span className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#89190E] shadow-[0_0_12px_#89190E]" />
          <span className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#89190E] shadow-[0_0_12px_#89190E]" />

          {/* Orbiting Golden Satellite Star */}
          <div
            className="absolute -inset-3.5 rounded-full animate-spin pointer-events-none"
            style={{ animationDuration: '7s' }}
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-[#EFC988] shadow-[0_0_16px_#EFC988] animate-pulse" />
            </div>
          </div>

          {/* Central Logo Container with Floating Levitation & Specular Sheen */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full p-1.5 bg-gradient-to-br from-[#EFC988] via-[#89190E] to-[#10233F] shadow-[0_0_55px_rgba(239,201,136,0.45),0_20px_45px_rgba(0,0,0,0.85)] animate-logo-float transition-transform duration-500 hover:scale-105 group">
            
            {/* Inner Golden Bezel & Mask */}
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0A1322] border-2 border-[#EFC988]/90">
              
              {/* Official MSI Group of Institutes Seal Image */}
              <Image
                src="/images/msi-official-logo.png"
                alt="MSI Group of Institutes Official Logo"
                fill
                priority
                className="object-contain p-1 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
                sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 224px"
              />

              {/* Specular Diagonal Light Sweep (Simulating luxury gold metallic reflection) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-25 animate-sheen-sweep" />
              </div>
            </div>
          </div>
        </div>

        {/* Location Eyebrow Badge */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#EFC988]/15 border border-[#EFC988]/40 mb-3 backdrop-blur-md shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#EFC988]" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#EFC988] uppercase">
            KHARAR, MOHALI
          </span>
        </div>

        {/* Grand Typography Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EFC988] via-[#FFF9EF] to-[#EFC988] tracking-tight leading-none mb-2 drop-shadow-[0_4px_24px_rgba(239,201,136,0.3)]">
          MSI GROUP OF INSTITUTES
        </h1>

        {/* Subtitle Legal Motto */}
        <p className="font-serif text-sm sm:text-base text-[#F7E5BF] font-medium tracking-wider mb-6">
          Crafting Legal Brilliance, Creating a Better Nation
        </p>

        {/* ── Dynamic Percentage Counter & Progress Track ───── */}
        <div className="w-full max-w-[320px] sm:max-w-[420px]">
          {/* Large Serif Percentage Number */}
          <div className="flex items-baseline justify-center space-x-1 mb-2">
            <span className="font-serif text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(239,201,136,0.4)] tabular-nums">
              {String(progress).padStart(2, '0')}
            </span>
            <span className="font-serif text-2xl sm:text-3xl text-[#EFC988] font-bold">
              %
            </span>
          </div>

          {/* Cycling Status Label */}
          <div className="h-5 flex items-center justify-center mb-3">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-[#EFC988] uppercase transition-all duration-300">
              {statusMessage}
            </span>
          </div>

          {/* Progress Bar with Flare */}
          <div className="relative h-[3.5px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#FFFFFF] rounded-full transition-all duration-100 ease-out shadow-[0_0_14px_#EFC988]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Bottom HUD Metadata Indicators */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/50 mt-2.5 tracking-wider">
            <span>PCS J · CLAT · PU LAW</span>
            <span>300+ SELECTIONS</span>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 3. FOOTER HINT & BOTTOM BEAM                          */}
      {/* ══════════════════════════════════════════════════════ */}
      <footer className="relative z-20 w-full max-w-[1400px] px-6 sm:px-12 pb-8 sm:pb-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-[11px] text-white/50 tracking-wider">
          Premier Legal Coaching Destination in Kharar, Mohali, Punjab
        </p>

        <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center space-x-1.5 hover:text-[#EFC988] transition-colors cursor-pointer">
          <span>Click anywhere or press Esc to enter</span>
          <span className="text-[#EFC988]">→</span>
        </div>
      </footer>

      {/* Bottom Glowing Accent Beam */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#89190E] opacity-90" />
    </div>
  );
}
