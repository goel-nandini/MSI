'use client';

import React, { useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import {
  FlaskConical,
  Scale,
  Trophy,
  Globe,
  HeartHandshake,
  Microscope,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

interface ReasonItem {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  accent: string;
  tag: string;
}

const reasons: ReasonItem[] = [
  {
    id: 1,
    icon: Trophy,
    title: 'Proven Track Record of Excellence',
    desc: 'Dedicated law coaching experience, producing hundreds of successful judicial officers and law students.',
    accent: '#89190E',
    tag: 'Proven Legacy',
  },
  {
    id: 2,
    icon: FlaskConical,
    title: 'Expert Faculty Team',
    desc: '50+ certified professors and experienced legal professionals providing expert guidance for all competitive law exams.',
    accent: '#10233F',
    tag: '50+ Senior Jurists',
  },
  {
    id: 3,
    icon: Globe,
    title: 'PCS J & Judiciary Coaching',
    desc: 'Specialized coaching for PCS J (Civil Judge), ADJ and other Punjab & Haryana judicial services examinations.',
    accent: '#89190E',
    tag: 'Judiciary Focused',
  },
  {
    id: 4,
    icon: Landmark,
    title: 'CLAT & AILET Preparation',
    desc: 'Structured law entrance coaching for CLAT, AILET, SLAT, LSAT India and all national law university entrance exams.',
    accent: '#10233F',
    tag: 'Top NLU Success',
  },
  {
    id: 5,
    icon: Scale,
    title: 'UGC NET Law Coaching',
    desc: 'Comprehensive UGC NET Law (Paper 1 & Paper 2) coaching with regular practice tests and detailed subject analysis.',
    accent: '#89190E',
    tag: 'JRF & Lectureship',
  },
  {
    id: 6,
    icon: HeartHandshake,
    title: 'Small Batch Approach',
    desc: 'Limited seats per batch ensuring individual attention and personalized mentorship for every enrolled student.',
    accent: '#10233F',
    tag: '1:1 Mentorship',
  },
  {
    id: 7,
    icon: Microscope,
    title: 'Regular Mock Tests',
    desc: 'Rigorous schedule of weekly mock tests, previous year papers and detailed performance evaluation with faculty feedback.',
    accent: '#89190E',
    tag: 'Weekly Assessments',
  },
  {
    id: 8,
    icon: ShieldCheck,
    title: '300+ Successful Selections',
    desc: 'Proven track record of over 300 selections in PCS J, CLAT, NLUs and other prestigious legal examinations.',
    accent: '#10233F',
    tag: 'Verified Results',
  },
];

// Row 1 items (reasons 0-3 repeated for continuous left-to-right loop)
const row1 = [...reasons.slice(0, 4), ...reasons.slice(0, 4), ...reasons.slice(0, 4)];
// Row 2 items (reasons 4-7 repeated for continuous left-to-right loop)
const row2 = [...reasons.slice(4, 8), ...reasons.slice(4, 8), ...reasons.slice(4, 8)];

export default function WhyMSISection() {
  const [activeCardId, setActiveCardId] = useState<number | null>(null);

  return (
    <section className="py-24 sm:py-28 bg-[#FFF9EF] overflow-hidden" aria-label="Why Choose MSI">
      <div className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 mb-12 sm:mb-14">
        {/* Section Heading */}
        <Reveal direction="up" className="text-center">
          <SectionHeading
            eyebrow="The MSI Difference"
            title="Why Students Choose MSI"
            subtitle="Every facet of MSI is designed to give you not just a degree, but a decisive competitive advantage in your chosen career."
          />
        </Reveal>
      </div>

      {/* Infinite Horizontal Looping Marquee Area (Moving from Left to Right) */}
      <div className="relative w-full overflow-hidden space-y-6">
        {/* Left & Right Edge Gradient Fade Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-[#FFF9EF] via-[#FFF9EF]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-[#FFF9EF] via-[#FFF9EF]/80 to-transparent z-20 pointer-events-none" />

        {/* Row 1: Flowing Left to Right */}
        <div className="marquee-container group">
          <div
            className="marquee-track-reverse space-x-5 py-2 px-3"
            style={{
              animationDuration: '34s',
            }}
          >
            {row1.map((reason, index) => {
              const Icon = reason.icon;
              const isHovered = activeCardId === reason.id;

              return (
                <div
                  key={`r1-${reason.id}-${index}`}
                  onMouseEnter={() => setActiveCardId(reason.id)}
                  onMouseLeave={() => setActiveCardId(null)}
                  className={`w-[340px] sm:w-[410px] flex-shrink-0 relative bg-white/95 backdrop-blur-md rounded-3xl border-2 transition-all duration-300 p-6 sm:p-7 flex items-start gap-4 select-none cursor-pointer ${
                    isHovered
                      ? 'border-[#EFC988] shadow-2xl scale-102 -translate-y-1 bg-white'
                      : 'border-[#E8DCCB] shadow-sm hover:border-[#EFC988] hover:shadow-xl'
                  }`}
                >
                  {/* Left Accent indicator */}
                  <div
                    className="absolute left-0 top-5 bottom-5 w-[3.5px] rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: reason.accent,
                      opacity: isHovered ? 1 : 0.4,
                      transform: isHovered ? 'scaleY(1)' : 'scaleY(0.6)',
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-xs"
                    style={{
                      backgroundColor: isHovered ? reason.accent : '#FFF3DD',
                      color: isHovered ? '#fff' : reason.accent,
                      transform: isHovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
                    }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89190E] bg-[#FFF3DD] border border-[#EFC988]/50 px-2 py-0.5 rounded-full">
                        {reason.tag}
                      </span>
                    </div>

                    <h3
                      className="font-serif text-base sm:text-lg font-bold leading-tight transition-colors duration-200 mb-1"
                      style={{ color: isHovered ? reason.accent : '#10233F' }}
                    >
                      {reason.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#526174] leading-relaxed line-clamp-3">
                      {reason.desc}
                    </p>

                    {/* Expanding gold underline */}
                    <div
                      className="mt-3 h-[2px] bg-[#EFC988] rounded-full transition-all duration-500 ease-out"
                      style={{ width: isHovered ? '80%' : '28px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Flowing Left to Right (Slightly Staggered Speed & Items) */}
        <div className="marquee-container group">
          <div
            className="marquee-track-reverse space-x-5 py-2 px-3"
            style={{
              animationDuration: '40s',
            }}
          >
            {row2.map((reason, index) => {
              const Icon = reason.icon;
              const isHovered = activeCardId === reason.id;

              return (
                <div
                  key={`r2-${reason.id}-${index}`}
                  onMouseEnter={() => setActiveCardId(reason.id)}
                  onMouseLeave={() => setActiveCardId(null)}
                  className={`w-[340px] sm:w-[410px] flex-shrink-0 relative bg-white/95 backdrop-blur-md rounded-3xl border-2 transition-all duration-300 p-6 sm:p-7 flex items-start gap-4 select-none cursor-pointer ${
                    isHovered
                      ? 'border-[#EFC988] shadow-2xl scale-102 -translate-y-1 bg-white'
                      : 'border-[#E8DCCB] shadow-sm hover:border-[#EFC988] hover:shadow-xl'
                  }`}
                >
                  {/* Left Accent indicator */}
                  <div
                    className="absolute left-0 top-5 bottom-5 w-[3.5px] rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: reason.accent,
                      opacity: isHovered ? 1 : 0.4,
                      transform: isHovered ? 'scaleY(1)' : 'scaleY(0.6)',
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-xs"
                    style={{
                      backgroundColor: isHovered ? reason.accent : '#FFF3DD',
                      color: isHovered ? '#fff' : reason.accent,
                      transform: isHovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
                    }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89190E] bg-[#FFF3DD] border border-[#EFC988]/50 px-2 py-0.5 rounded-full">
                        {reason.tag}
                      </span>
                    </div>

                    <h3
                      className="font-serif text-base sm:text-lg font-bold leading-tight transition-colors duration-200 mb-1"
                      style={{ color: isHovered ? reason.accent : '#10233F' }}
                    >
                      {reason.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#526174] leading-relaxed line-clamp-3">
                      {reason.desc}
                    </p>

                    {/* Expanding gold underline */}
                    <div
                      className="mt-3 h-[2px] bg-[#EFC988] rounded-full transition-all duration-500 ease-out"
                      style={{ width: isHovered ? '80%' : '28px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
