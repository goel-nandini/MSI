'use client';

import React from 'react';
import CurvedUnderline from '@/components/ui/CurvedUnderline';
import TrustIndicator from './TrustIndicator';
import { Play, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface HeroContentProps {
  onOpenVideo?: () => void;
  onExplorePrograms?: () => void;
}

export default function HeroContent({
  onOpenVideo,
  onExplorePrograms,
}: HeroContentProps) {
  return (
    <div className="relative z-20 flex flex-col justify-center max-w-[660px] pt-24 sm:pt-28 pb-12 lg:py-16 text-left select-none animate-fadeIn">
      {/* Floating Admissions Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DCCB] shadow-xs mb-4 w-max max-w-full">
        <span className="w-2.5 h-2.5 rounded-full bg-[#89190E] animate-pulse-beacon flex-shrink-0" />
        <span className="text-[11px] sm:text-xs font-bold text-[#89190E] uppercase tracking-wider">
          Admissions Open — New Batch 2025
        </span>
      </div>

      {/* Eyebrow Label with Gold Horizontal Rule */}
      <div className="flex items-center space-x-3.5 mb-2 sm:mb-3">
        <span className="text-[13px] sm:text-[15px] font-bold tracking-[0.25em] text-[#10233F] uppercase">
          Shaping Legal Brilliance
        </span>
        <span className="h-[2px] w-12 sm:w-16 bg-[#EFC988] rounded-full inline-block" />
      </div>

      {/* Main Serif Headline */}
      <h1 className="font-serif text-[34px] xs:text-[42px] sm:text-[62px] lg:text-[72px] leading-[1.02] sm:leading-[1.0] font-bold text-[#10233F] tracking-tight mb-2">
        <span className="block">Legal Brilliance</span>
        <span className="block">Today, A Better</span>
        <span className="relative inline-block text-[#89190E] mt-1">
          Nation Tomorrow
          {/* Hand-drawn curved gold underline */}
          <div className="absolute -bottom-3 sm:-bottom-4 left-0 right-0 w-[102%] -ml-[1%]">
            <CurvedUnderline />
          </div>
        </span>
      </h1>

      {/* Supporting Description */}
      <p className="mt-5 sm:mt-8 text-[#10233F] text-[15px] sm:text-[19px] leading-relaxed max-w-[500px] font-normal">
        MSI Group of Institutes — premier destination for PCS J (Judiciary), CLAT, AILET, UGC NET and Law Entrance coaching in Kharar, Mohali.
      </p>

      {/* Hero Dual CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-5 mt-7 sm:mt-8 w-full sm:w-auto">
        {/* Button 1: Explore Our Programs */}
        <button
          onClick={onExplorePrograms}
          className="group h-[50px] sm:h-[56px] px-7 sm:px-8 bg-[#89190E] hover:bg-[#65130D] text-white font-semibold text-[15px] sm:text-[16px] rounded-[14px] flex items-center justify-center space-x-2.5 shadow-xl shadow-[#89190E]/25 btn-hover-lift active:scale-98 w-full sm:w-auto"
        >
          <span>Explore Courses</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        {/* Button 2: Watch Video */}
        <button
          onClick={onOpenVideo}
          className="group h-[50px] sm:h-[56px] px-6 sm:px-7 bg-[#FFF9EF]/95 hover:bg-white text-[#89190E] font-semibold text-[15px] sm:text-[16px] rounded-[14px] border-2 border-[#89190E]/40 hover:border-[#89190E] flex items-center justify-center space-x-2.5 transition-all duration-200 shadow-sm hover:shadow active:scale-98 w-full sm:w-auto"
        >
          <span className="w-7 h-7 rounded-full bg-[#89190E] flex items-center justify-center text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
            <Play className="w-3.5 h-3.5 fill-white ml-0.5 text-white" />
          </span>
          <span>Watch Institute Tour</span>
        </button>
      </div>

      {/* Student Trust Indicator */}
      <div className="mt-8 sm:mt-9">
        <TrustIndicator />
      </div>
    </div>
  );
}
