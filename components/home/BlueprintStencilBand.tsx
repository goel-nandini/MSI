'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  GraduationCap,
  BookOpen,
  Award,
  Landmark,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Check,
  ChevronRight,
} from 'lucide-react';

const STENCIL_WORDS_1 = [
  'PCS-J', '◆', 'CLAT', '◆', 'AILET', '◆', 'UGC-NET', '◆', 'JUDICIARY', '◆',
  'PCS-J', '◆', 'CLAT', '◆', 'AILET', '◆', 'UGC-NET', '◆', 'JUDICIARY', '◆',
];
const STENCIL_WORDS_2 = [
  'LEGAL', '◆', 'COACHING', '◆', 'KHARAR', '◆', 'EXCELLENCE', '◆', 'MOHALI', '◆',
  'LEGAL', '◆', 'COACHING', '◆', 'KHARAR', '◆', 'EXCELLENCE', '◆', 'MOHALI', '◆',
];

interface CoachingProgramme {
  id: string;
  num: string;
  categoryCode: string;
  icon: React.ElementType;
  title: string;
  level: string;
  badge: string;
  badgeVariant: 'crimson' | 'gold' | 'navy';
  desc: string;
  features: string[];
  duration: string;
  intake: string;
  metricLabel: string;
  metricValue: string;
  accent: string;
  popular?: boolean;
}

const PROGRAMMES: CoachingProgramme[] = [
  {
    id: 'pcs-j',
    num: '01',
    categoryCode: 'JUDICIAL SERVICES',
    icon: Scale,
    title: 'PCS J — Punjab & Haryana Judiciary',
    level: 'Civil Judge (Junior Division) / JMFC',
    badge: 'Admissions 2025–26 Open',
    badgeVariant: 'crimson',
    desc: 'Flagship judicial coaching with daily Bare Act deconstructions, procedural codes, and intensive evaluated Mains judgment drafting.',
    features: [
      'Comprehensive CPC, CrPC, BNSS 2023 & Evidence Mastery',
      'Daily High Court Judgment Drafting & Answer Checking',
      'Mock Interview Panels with Senior Advocates & Ex-Judges',
    ],
    duration: '1-Year Regular / Weekend Batch',
    intake: 'LL.B Graduates & Final-Year Students',
    metricLabel: 'Judicial Selections',
    metricValue: '85+ Candidates',
    accent: '#89190E',
    popular: true,
  },
  {
    id: 'clat-ug',
    num: '02',
    categoryCode: 'LAW ENTRANCE',
    icon: GraduationCap,
    title: 'CLAT & AILET — 5-Year Integrated Law',
    level: 'Class 11, 12 & Droppers Cohort',
    badge: 'All 24 NLUs Focus',
    badgeVariant: 'navy',
    desc: 'Targeted preparation for all 24 National Law Universities with rigorous passage-based analytics, critical reasoning, and speed strategy.',
    features: [
      'Passage-First Speed Mapping & Logical Reasoning Drills',
      'Weekly Legal GK, Constitutional Updates & Current Affairs',
      '100+ Proctored All-India Simulated Mock Tests with AIR',
    ],
    duration: '1-Year / 2-Year / Crash Course',
    intake: 'Class 10, 11, 12 & 12th-Pass',
    metricLabel: 'NLU Admissions',
    metricValue: 'AIR Top 100 Ranks',
    accent: '#10233F',
  },
  {
    id: 'pu-law',
    num: '03',
    categoryCode: 'STATE ENTRANCE',
    icon: BookOpen,
    title: 'PU Law Entrance — 3-Yr & 5-Yr LL.B',
    level: 'Panjab University & Regional Wings',
    badge: 'PU Dept of Laws Specialized',
    badgeVariant: 'gold',
    desc: 'Specialized syllabus training for Department of Laws, Panjab University Chandigarh, UILS, and regional university centers.',
    features: [
      '15-Year Solved Sectional Previous Year Question Deconstructions',
      'Legal Aptitude, Indian Polity & Current Affairs Focus',
      'OMR Exam-Hall Simulation with High-Accuracy Elimination',
    ],
    duration: '3-Month Intensive & Crash Course',
    intake: 'Graduates (3-Yr) | 10+2 (5-Yr)',
    metricLabel: 'State Rank',
    metricValue: 'Rank 12 PU State Top Ranker',
    accent: '#89190E',
  },
  {
    id: 'hps-j',
    num: '04',
    categoryCode: 'JUDICIARY SERVICES',
    icon: Award,
    title: 'HPS J — Himachal Judicial Services',
    level: 'Civil Judge Examination (HPPSC)',
    badge: 'State-Specific Modules',
    badgeVariant: 'navy',
    desc: 'State-specific civil judge preparation incorporating Himachal Pradesh Local Acts, customary laws, and Shimla High Court judgments.',
    features: [
      'HP Urban Rent Control Act & Local Customary Laws',
      'Civil & Criminal Law Substantive Papers Intensive',
      'Weekly Evaluated Language & Judgment Writing Tests',
    ],
    duration: '6 Months / 1-Year Comprehensive',
    intake: 'Law Graduates & Practicing Advocates',
    metricLabel: 'Evaluation',
    metricValue: '1-on-1 Copy Checking',
    accent: '#10233F',
  },
  {
    id: 'ugc-net',
    num: '05',
    categoryCode: 'ACADEMIC MASTERY',
    icon: Landmark,
    title: 'UGC NET & JRF — Law Division',
    level: 'Assistant Professor & JRF Fellowship',
    badge: 'JRF Clearance Track',
    badgeVariant: 'crimson',
    desc: 'Rigorous coaching for NTA UGC NET Law covering Paper 1 Teaching/Research Aptitude and Paper 2 Core Jurisprudence in equal depth.',
    features: [
      'Constitutional Law, Jurisprudence & Public International Law',
      'High-Yield Paper 1 Mathematical & Logical Drills',
      '10-Year Subject-Wise Question Bank with Comprehensive Keys',
    ],
    duration: '6-Month Cohort & Weekend Batches',
    intake: 'LL.M Students & Law Faculty',
    metricLabel: 'JRF Qualifiers',
    metricValue: '40+ Fellowships',
    accent: '#89190E',
  },
  {
    id: 'aibe',
    num: '06',
    categoryCode: 'BAR LICENSURE',
    icon: ShieldCheck,
    title: 'AIBE & Judicial Foundation',
    level: 'Bar Council Licensure & Court Practice',
    badge: '100% Pass System',
    badgeVariant: 'navy',
    desc: 'Accelerated coaching for the All India Bar Examination (AIBE) paired with foundational courtroom trial advocacy and procedural drafting.',
    features: [
      'Complete Indexing of 19 Statutory Bare Act Codes',
      'Speed Tagging & Open-Book Exam Navigation Shortcuts',
      'Pleadings, Conveyancing & Trial Court Procedure Essentials',
    ],
    duration: 'Weekend & Accelerated Fast-Track',
    intake: 'Enrolled Advocates & Law Graduates',
    metricLabel: 'Success Rate',
    metricValue: '100% Passing Track Record',
    accent: '#10233F',
  },
];

interface ProgrammeCardProps {
  prog: CoachingProgramme;
  index: number;
  onOpenEnquiry?: () => void;
}

function ProgrammeCard({ prog, index, onOpenEnquiry }: ProgrammeCardProps) {
  const Icon = prog.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpenEnquiry}
      className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-500 overflow-hidden cursor-pointer select-none ${
        prog.popular
          ? 'bg-gradient-to-b from-white via-[#FCF8F2] to-[#FFF9EF] border-2 border-[#EFC988] shadow-lg shadow-[#89190E]/5'
          : 'bg-white/95 backdrop-blur-md border border-[#E8DCCB] hover:border-[#89190E]/60 shadow-sm'
      } hover:-translate-y-2.5 hover:shadow-2xl hover:shadow-[#10233F]/12 blueprint-card`}
    >
      {/* Blueprint Dot Grid overlay on hover */}
      <div
        className="absolute inset-0 blueprint-dot-grid opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none rounded-3xl"
      />

      {/* Subtle giant watermark icon in background */}
      <Icon
        className="absolute -right-6 -bottom-6 w-36 h-36 opacity-[0.03] group-hover:opacity-[0.09] transition-all duration-500 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-6"
        style={{ color: prog.accent }}
        aria-hidden="true"
      />

      {/* Popular Aura Glow */}
      {prog.popular && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#EFC988]/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
      )}

      {/* Top Header Row: Program Code & Icon Emblem */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* HUD Index Pill */}
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-125"
              style={{
                background: prog.accent,
                boxShadow: hovered ? `0 0 10px ${prog.accent}` : 'none',
              }}
            />
            <span className="mono-accent font-mono text-[11px] font-bold tracking-widest text-[#10233F]/80 uppercase">
              {prog.num} // {prog.categoryCode}
            </span>
          </div>

          {/* Icon Badge Emblem with Dual Layer */}
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]"
            style={{
              background: hovered ? prog.accent : `${prog.accent}12`,
              color: hovered ? '#ffffff' : prog.accent,
              boxShadow: hovered ? `0 8px 20px -4px ${prog.accent}50` : 'none',
              border: `1px solid ${hovered ? prog.accent : `${prog.accent}25`}`,
            }}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300" />
          </div>
        </div>

        {/* Badge Ribbon Pill */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
              prog.badgeVariant === 'crimson'
                ? 'bg-[#89190E]/10 text-[#89190E] border border-[#89190E]/25 group-hover:bg-[#89190E] group-hover:text-white'
                : prog.badgeVariant === 'gold'
                ? 'bg-[#EFC988]/25 text-[#7A5A18] border border-[#EFC988] group-hover:bg-[#EFC988] group-hover:text-[#10233F]'
                : 'bg-[#10233F]/10 text-[#10233F] border border-[#10233F]/20 group-hover:bg-[#10233F] group-hover:text-white'
            }`}
          >
            {prog.popular && <Sparkles className="w-3 h-3 animate-spin-slow" />}
            {prog.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl sm:text-[23px] font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors duration-300 leading-snug mb-1.5">
          {prog.title}
        </h3>

        {/* Target Level */}
        <p className="text-[12px] font-bold text-[#89190E] tracking-wide mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EFC988] inline-block" />
          <span>{prog.level}</span>
        </p>

        {/* Description */}
        <p className="text-xs sm:text-[13px] text-[#526174] leading-relaxed mb-5">
          {prog.desc}
        </p>

        {/* 3 Key Deliverables Bullet Points */}
        <div className="space-y-2.5 pt-4 pb-5 border-t border-[#E8DCCB]/60">
          {prog.features.map((feat, fIdx) => (
            <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#10233F] font-medium leading-tight">
              <span
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${prog.accent}15`,
                  color: prog.accent,
                }}
              >
                ✓
              </span>
              <span className="group-hover:text-black transition-colors">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer: Metadata & Action CTA Button */}
      <div className="pt-4 border-t border-[#E8DCCB]/60 flex items-center justify-between gap-3 mt-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[#526174] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#89190E]" />
            {prog.duration}
          </span>
          <span className="text-xs font-bold text-[#10233F] mt-0.5">
            {prog.metricValue}
          </span>
        </div>

        {/* Interactive Explore Button */}
        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#89190E] group-hover:bg-[#10233F] transition-all duration-300 shadow-sm group-hover:shadow-md flex-shrink-0">
          <span>Enquire Batch</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Animated Bottom Scan Gradient Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, ${prog.accent}, #EFC988, #10233F)`,
        }}
      />
    </div>
  );
}

interface BlueprintStencilBandProps {
  onOpenEnquiry?: () => void;
}

export default function BlueprintStencilBand({ onOpenEnquiry }: BlueprintStencilBandProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#FFF9EF] select-none"
      aria-label="MSI Coaching Highlights"
    >
      {/* Blueprint grid background */}
      <div className="absolute inset-0 blueprint-grid opacity-60 pointer-events-none" />

      {/* HUD corner accent dots */}
      <span className="hud-dot-tl" style={{ top: 12, left: 12 }} />
      <span className="hud-dot-tr" style={{ top: 12, right: 12 }} />
      <span className="hud-dot-bl" style={{ bottom: 12, left: 12 }} />
      <span className="hud-dot-br" style={{ bottom: 12, right: 12 }} />

      {/* Gold gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#EFC988] to-transparent" />

      {/* ── STENCIL MARQUEE ROW 1 ───────────────────────── */}
      <div className="relative overflow-hidden pt-12 pb-3">
        <div className="stencil-track flex items-center gap-0" style={{ willChange: 'transform' }}>
          {[...STENCIL_WORDS_1, ...STENCIL_WORDS_1].map((word, i) => (
            <span
              key={i}
              className="text-[52px] sm:text-[76px] lg:text-[100px] font-black uppercase leading-none tracking-[0.02em] flex-shrink-0 px-6 sm:px-10"
              style={{
                fontFamily: '"Playfair Display", serif',
                color: word === '◆' ? '#EFC988' : 'transparent',
                WebkitTextStroke: word === '◆' ? 'none' : '1.5px rgba(16,35,63,0.18)',
                letterSpacing: word === '◆' ? '0.02em' : '0.04em',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* ── STENCIL MARQUEE ROW 2 (Reverse) ───────────────── */}
      <div className="relative overflow-hidden pb-4">
        <div className="stencil-track-reverse flex items-center gap-0">
          {[...STENCIL_WORDS_2, ...STENCIL_WORDS_2].map((word, i) => (
            <span
              key={i}
              className="text-[52px] sm:text-[76px] lg:text-[100px] font-black uppercase leading-none flex-shrink-0 px-6 sm:px-10"
              style={{
                fontFamily: '"Playfair Display", serif',
                color: word === '◆' ? '#89190E' : 'transparent',
                WebkitTextStroke: word === '◆' ? 'none' : '1.5px rgba(137,25,14,0.16)',
                letterSpacing: word === '◆' ? '0.02em' : '0.04em',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* ── FLAGSHIP PROGRAMMES SECTION ─────────────────────── */}
      <div className="relative z-10 max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-20">
        {/* Section Header */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-3 h-3 rounded-sm bg-[#89190E] flex-shrink-0" />
              <span className="mono-accent text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#89190E]">
                Our Coaching Programmes
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10233F] tracking-tight">
              Architecting Legal Brilliance Across Every Examination
            </h2>
            <p className="mt-3 text-[#526174] text-sm sm:text-base max-w-2xl leading-relaxed">
              Comprehensive curricula, daily judgment writing drills, and passage-based analytics mentored by veteran advocates and judicial scholars in Kharar, Mohali.
            </p>
          </div>

          {/* Right side HUD badge */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-[#E8DCCB] text-[11px] mono-accent font-bold text-[#10233F] shadow-xs flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#89190E] animate-ping" />
            <span>MSI INSTITUTE • 300+ SELECTIONS</span>
          </div>
        </div>

        {/* 6 High-Impact Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {PROGRAMMES.map((prog, idx) => (
            <div
              key={prog.id}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 90}ms` }}
            >
              <ProgrammeCard
                prog={prog}
                index={idx}
                onOpenEnquiry={onOpenEnquiry}
              />
            </div>
          ))}
        </div>

        {/* Bottom HUD Metrics Strip */}
        <div
          className={`mt-12 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-px bg-[#E8DCCB] rounded-2xl overflow-hidden border border-[#E8DCCB] transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[
            { val: '300+', lab: 'Selections' },
            { val: '5k+', lab: 'Mentored' },
            { val: '50+', lab: 'Tutors' },
            { val: '30+', lab: 'Courses' },
            { val: '26+', lab: 'Years Exp.' },
            { val: '100%', lab: 'Commitment' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white px-2.5 sm:px-4 py-3 sm:py-4 text-center group hover:bg-[#10233F] transition-colors duration-300"
            >
              <div className="font-serif text-lg sm:text-2xl font-extrabold text-[#89190E] group-hover:text-[#EFC988] transition-colors leading-none mb-0.5">
                {stat.val}
              </div>
              <div className="mono-accent text-[9px] sm:text-[10px] text-[#526174] group-hover:text-white/60 uppercase tracking-widest transition-colors">
                {stat.lab}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gold gradient bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#EFC988] to-transparent" />
    </section>
  );
}
