'use client';

import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatItem {
  icon: LucideIcon;
  target: number;
  suffix: string;
  label: string;
  sub: string;
  color: string;
  decimals?: number;
}
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import Reveal from '@/components/ui/Reveal';
import {
  GraduationCap,
  Users,
  TrendingUp,
  Building2,
  BookOpen,
  Award,
} from 'lucide-react';

const stats: StatItem[] = [
  {
    icon: GraduationCap,
    target: 300,
    suffix: '+',
    label: 'Successful Students',
    sub: 'Selections across PCS J, CLAT & more',
    color: '#89190E',
  },
  {
    icon: BookOpen,
    target: 30,
    suffix: '+',
    label: 'Courses Offered',
    sub: 'Judiciary, CLAT, UPSC & more',
    color: '#10233F',
  },
  {
    icon: TrendingUp,
    target: 50,
    suffix: '+',
    label: 'Certified Courses',
    sub: 'Across law & competitive exams',
    color: '#89190E',
  },
  {
    icon: Building2,
    target: 26,
    suffix: '+',
    label: 'Certified Professors',
    sub: 'Experienced legal professionals',
    color: '#10233F',
  },
  {
    icon: Users,
    target: 50,
    suffix: '+',
    label: 'Expert Tutors',
    sub: 'Dedicated exam specialists',
    color: '#89190E',
  },
  {
    icon: Award,
    target: 98,
    suffix: '%',
    label: 'Student Satisfaction',
    sub: 'Proven success rate in law exams',
    color: '#10233F',
  },
];

export default function StatsSection() {
  return (
    <section
      className="relative py-20 sm:py-24 overflow-hidden"
      aria-label="MSI Key Statistics"
    >
      {/* Warm cream background with subtle pattern */}
      <div className="absolute inset-0 bg-[#10233F]" />
      {/* Decorative subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Gold top border */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#EFC988] to-transparent" />
      {/* Gold bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#EFC988] to-transparent" />

      <div className="relative z-10 max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Heading */}
        <Reveal direction="up" className="text-center mb-14">
          <div className="inline-flex items-center space-x-3 mb-3">
            <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#EFC988] uppercase">
              Excellence in Numbers
            </span>
            <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            30 Years of Legal Coaching Excellence
          </h2>
          <p className="mt-4 text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            Numbers that reflect our commitment to shaping India's finest legal minds.
          </p>
        </Reveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Reveal key={idx} direction="up" delay={idx * 80} className="flex">
                <div className="group flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#EFC988]/40 rounded-3xl p-5 sm:p-6 text-center flex flex-col items-center justify-center transition-all duration-400 hover:-translate-y-1">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/8 flex items-center justify-center mb-4 group-hover:bg-[#EFC988]/15 transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#EFC988]" />
                  </div>

                  {/* Animated Number */}
                  <div className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1 leading-none">
                    <AnimatedCounter
                      target={stat.target}
                      suffix={stat.suffix}
                      duration={1600}
                      decimals={stat.decimals ?? 0}
                    />
                  </div>

                  {/* Label */}
                  <div className="text-[11px] sm:text-xs font-bold text-white/80 uppercase tracking-wider leading-tight mb-1">
                    {stat.label}
                  </div>

                  {/* Sublabel */}
                  <div className="text-[10px] sm:text-[11px] text-white/40 leading-tight">
                    {stat.sub}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
