'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MapPin, Phone } from 'lucide-react';

const CYCLING_WORDS = ['CLAT UG', 'PCS J', 'AILET', 'PU LAW', 'ADJ', 'UGC NET', 'AIBE'];

interface TypewriterHeroBandProps {
  onOpenEnquiry?: () => void;
}

export default function TypewriterHeroBand({ onOpenEnquiry }: TypewriterHeroBandProps) {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for entry animation
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Typewriter engine
  useEffect(() => {
    const word = CYCLING_WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed === word) {
      // Pause before deleting
      timeout = setTimeout(() => setIsDeleting(true), 1600);
    } else if (isDeleting && displayed === '') {
      // Move to next word
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % CYCLING_WORDS.length);
    } else {
      const speed = isDeleting ? 55 : 90;
      timeout = setTimeout(() => {
        setDisplayed(
          isDeleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIdx]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#10233F] py-20 sm:py-28 select-none scan-line-effect"
      aria-label="MSI Typewriter Coaching Band"
    >
      {/* ── Blueprint grid overlay ───────────────────────────── */}
      <div className="absolute inset-0 blueprint-grid-gold opacity-100 pointer-events-none" />

      {/* ── Radial gradient ambient blobs ───────────────────── */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#89190E]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#EFC988]/8 rounded-full blur-3xl pointer-events-none" />

      {/* ── Gold top border ──────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#EFC988] to-transparent" />

      {/* ── HUD corner bracket dots ──────────────────────────── */}
      <span className="hud-dot-tl" style={{ top: 16, left: 16, background: '#89190E' }} />
      <span className="hud-dot-tr" style={{ top: 16, right: 16 }} />
      <span className="hud-dot-bl" style={{ bottom: 16, left: 16 }} />
      <span className="hud-dot-br" style={{ bottom: 16, right: 16, background: '#89190E' }} />

      {/* ── Large background watermark text ─────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="text-[140px] sm:text-[200px] lg:text-[280px] font-black uppercase leading-none select-none"
          style={{
            fontFamily: '"Playfair Display", serif',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(239,201,136,0.07)',
            letterSpacing: '0.04em',
          }}
        >
          MSI
        </span>
      </div>

      <div className="relative z-10 max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Main typewriter content ─────────────────── */}
          <div
            className={`transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            {/* HUD label pill — like ChainGPT's ■ bullet labels */}
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#89190E]" />
              <span className="mono-accent text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#EFC988] uppercase">
                Expert Legal Coaching — Kharar, Mohali
              </span>
            </div>

            {/* Typewriter headline */}
            <div className="mb-2">
              <p className="text-white/50 mono-accent text-xs sm:text-sm font-medium tracking-widest uppercase mb-2">
                Coaching For
              </p>
              <h2
                className="font-serif text-[36px] xs:text-[46px] sm:text-[68px] lg:text-[80px] font-black text-white leading-[0.95] tracking-tight"
              >
                {displayed}
                <span className="cursor-blink" />
              </h2>
              <h2
                className="font-serif text-[36px] xs:text-[46px] sm:text-[68px] lg:text-[80px] font-black text-[#EFC988] leading-[0.95] tracking-tight mt-1"
              >
                Excellence
              </h2>
            </div>

            {/* HUD tick description */}
            <div className="hud-tick-left mt-6 sm:mt-8 mb-6 sm:mb-8">
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md">
                MSI Group of Institutes is committed to shaping India's finest legal
                minds with expert faculty, small batches, weekly mock tests — built for maximum selections.
              </p>
            </div>

            {/* CTA Buttons — chamfered style inspired by ChainGPT */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={onOpenEnquiry}
                className="btn-chamfered h-12 sm:h-14 px-7 sm:px-8 bg-[#89190E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-[#89190E]/25 w-full sm:w-auto"
              >
                <span>Enquire Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenEnquiry}
                className="btn-chamfered h-12 sm:h-14 px-7 sm:px-8 bg-transparent text-[#EFC988] font-bold text-sm sm:text-base border border-[#EFC988]/40 hover:border-[#EFC988] flex items-center justify-center gap-2.5 transition-colors duration-200 w-full sm:w-auto"
              >
                <span>View Courses</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT: HUD data panel — like ChainGPT's bento grid ── */}
          <div
            className={`transition-all duration-800 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            {/* Main info card with blueprint bracket */}
            <div className="hud-bracket p-6 sm:p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl mb-4">
              {/* Top label */}
              <div className="flex items-center justify-between mb-6">
                <span className="mono-accent text-[10px] text-[#EFC988] tracking-widest font-bold uppercase">
                  Institute Profile
                </span>
                <span className="mono-accent text-[10px] text-white/30 tracking-widest">
                  SYS.ACTIVE
                </span>
              </div>

              {/* Data rows — mimics ChainGPT's clean data display */}
              <div className="space-y-4">
                {[
                  { label: 'Location', value: 'Kharar, Mohali, Punjab' },
                  { label: 'Courses', value: 'CLAT UG, PCS J, AILET, PU Law, ADJ, UGC NET, AIBE' },
                  { label: 'Faculty', value: '50+ Expert Tutors' },
                  { label: 'Selections', value: '300+ & Growing' },
                  { label: 'Format', value: 'Classroom & Online' },
                ].map((row, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 pb-4 border-b border-white/8">
                    <span className="mono-accent text-[10px] sm:text-[11px] text-white/40 uppercase tracking-wider flex-shrink-0">
                      {row.label}
                    </span>
                    <span className="text-xs sm:text-sm text-white font-semibold text-right leading-tight">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact mini-cards — 2 col bento */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+917986313013"
                className="hud-bracket p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors block cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#EFC988] mb-2" />
                <p className="mono-accent text-[9px] text-white/40 uppercase tracking-widest mb-1">Helpline</p>
                <p className="text-xs text-white font-bold leading-tight">
                  +91 79863 13013
                </p>
              </a>
              <a
                href="https://maps.google.com/?q=Monga+City+Centre+Kharar+Landran+Road+Sector+115+Sahibzada+Ajit+Singh+Nagar+Punjab+140307"
                target="_blank"
                rel="noopener noreferrer"
                className="hud-bracket p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors block cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#EFC988] mb-2" />
                <p className="mono-accent text-[9px] text-white/40 uppercase tracking-widest mb-1">Institute</p>
                <p className="text-xs text-white font-bold leading-tight truncate">
                  Monga City Centre, Sec 115
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gold bottom border ────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#89190E] to-transparent" />
    </section>
  );
}
