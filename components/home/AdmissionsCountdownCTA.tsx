'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ArrowRight, Download, Users, ShieldCheck } from 'lucide-react';

interface AdmissionsCountdownCTAProps {
  onOpenEnquiry?: () => void;
}

export default function AdmissionsCountdownCTA({
  onOpenEnquiry,
}: AdmissionsCountdownCTAProps) {
  // Countdown Timer to 14 days from now
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 px-6 sm:px-10 lg:px-16 max-w-[1380px] mx-auto select-none">
      <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden bg-gradient-to-r from-[#10233F] via-[#162d50] to-[#10233F] border border-[#E8DCCB]/30 shadow-2xl p-8 sm:p-14 lg:p-16 text-white">
        {/* Ambient Decorative Light Orbs */}
        <div className="absolute top-0 right-10 w-80 h-80 bg-[#89190E]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#EFC988]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading & Live Application Info */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EFC988] animate-pulse-gold" />
              <span className="text-xs font-bold text-[#EFC988] uppercase tracking-wider">
                New Batch 2025 — Enrollments Open
              </span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              PCS J, CLAT, UGC NET Batch Seats Filling Fast
            </h3>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Secure your seat at MSI's expert-led coaching programme. Limited batch sizes ensure personal attention for PCS J (Judiciary), CLAT, AILET, UGC NET Law and HPS J preparation.
            </p>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#EFC988]" />
                <span>Trusted Premier Law Coaching</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#EFC988]" />
                <span>300+ Successful Selections So Far</span>
              </div>
            </div>
          </div>

          {/* Right Column: Countdown Clocks & Dual CTA Buttons */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col justify-center">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-[#EFC988] font-bold block mb-1">
                Round 1 Deadline Countdown
              </span>
              <span className="text-xs text-gray-400">Time remaining to apply for early scholarship</span>
            </div>

            {/* 4 Clock Boxes */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8 text-center">
              <div className="bg-black/30 rounded-2xl p-2.5 sm:p-3 border border-white/10">
                <div className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mt-1">Days</div>
              </div>
              <div className="bg-black/30 rounded-2xl p-2.5 sm:p-3 border border-white/10">
                <div className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mt-1">Hours</div>
              </div>
              <div className="bg-black/30 rounded-2xl p-2.5 sm:p-3 border border-white/10">
                <div className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mt-1">Mins</div>
              </div>
              <div className="bg-black/30 rounded-2xl p-2.5 sm:p-3 border border-white/10">
                <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#EFC988]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mt-1">Secs</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onOpenEnquiry}
                className="w-full h-12 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all btn-hover-lift shadow-lg shadow-[#89190E]/40"
              >
                <span>Apply for Admission Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenEnquiry}
                className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4 text-[#EFC988]" />
                <span>Download Official Prospectus 2026</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
