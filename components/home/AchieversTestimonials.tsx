'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Quote, Award, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';
import { STUDENT_AVATARS } from '@/lib/constants';

interface Achiever {
  id: number;
  name: string;
  course: string;
  year: string;
  category: 'judiciary' | 'clat' | 'ugc-net';
  company: string;
  packageText: string;
  role: string;
  quote: string;
  avatar: string;
  badge: string;
}

export default function AchieversTestimonials() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'judiciary' | 'clat' | 'ugc-net'>('all');

  const achievers: Achiever[] = [
    {
      id: 1,
      name: 'Harpreet Kaur',
      course: 'PCS J (Judiciary) Coaching',
      year: 'Batch of 2024',
      category: 'judiciary',
      company: 'Punjab & Haryana High Court',
      packageText: 'Civil Judge (JD) Selected',
      role: 'Civil Judge / Judicial Magistrate',
      quote:
        'MSI\'s structured PCS J coaching, judgment writing sessions and regular mock tests gave me the edge I needed. The faculty here truly understands what the Punjab Public Service Commission expects.',
      avatar: '/images/avatars/avatar-1.webp',
      badge: 'PCS J Selected',
    },
    {
      id: 2,
      name: 'Rahul Sharma',
      course: 'CLAT / Law Entrance Coaching',
      year: 'Batch of 2024',
      category: 'clat',
      company: 'National Law University Delhi',
      packageText: 'CLAT AIR 142',
      role: 'B.A. LL.B. — NLU Delhi',
      quote:
        'I joined MSI just 6 months before CLAT and the focused approach here was unlike any other coaching centre. The study material, reasoning classes and test series made the difference.',
      avatar: '/images/avatars/avatar-2.webp',
      badge: 'NLU Delhi Admit',
    },
    {
      id: 3,
      name: 'Simran Bhatia',
      course: 'UGC NET (Law) Coaching',
      year: 'Batch of 2023',
      category: 'ugc-net',
      company: 'UGC NET — Law',
      packageText: 'JRF Qualified',
      role: 'UGC NET JRF — Law',
      quote:
        'The UGC NET coaching at MSI is comprehensive and well-structured. Faculty covered both Paper 1 and Paper 2 with equal depth. I cleared JRF in my first attempt thanks to the rigorous practice here.',
      avatar: '/images/avatars/avatar-3.webp',
      badge: 'JRF Qualified',
    },
    {
      id: 4,
      name: 'Amanjot Singh',
      course: 'Judicial Services (ADJ) Coaching',
      year: 'Batch of 2024',
      category: 'judiciary',
      company: 'District & Sessions Court, Mohali',
      packageText: 'ADJ Selected',
      role: 'Additional District Judge',
      quote:
        'MSI\'s ADJ preparation covers criminal law, civil law, evidence and procedure in a very systematic manner. The interview guidance and personality development sessions were exceptional.',
      avatar: '/images/avatars/avatar-4.webp',
      badge: 'ADJ Selected',
    },
    {
      id: 5,
      name: 'Priya Mehta',
      course: 'AILET / LSAT India Coaching',
      year: 'Batch of 2024',
      category: 'clat',
      company: 'NLU Jodhpur',
      packageText: 'AILET Rank 78',
      role: 'B.A. LL.B. — NLU Jodhpur',
      quote:
        'I had been struggling with logical reasoning and reading comprehension before I joined MSI. Within 3 months, my score improved dramatically and I secured a national law university seat.',
      avatar: '/images/avatars/avatar-5.webp',
      badge: 'NLU Admit — AILET',
    },
    {
      id: 6,
      name: 'Navneet Brar',
      course: 'PCS J (Judiciary) Coaching',
      year: 'Batch of 2023',
      category: 'judiciary',
      company: 'Punjab Civil Courts',
      packageText: 'Civil Judge Selected',
      role: 'Civil Judge / JMFC',
      quote:
        'The dedication of MSI faculty is unmatched. They guided me through each subject personally, reviewed my answers individually, and pushed me to be better every single day. Very grateful.',
      avatar: '/images/avatars/avatar-2.webp',
      badge: 'Judiciary Selection',
    },
  ];

  const filteredAchievers =
    selectedFilter === 'all'
      ? achievers
      : achievers.filter((a) => a.category === selectedFilter);

  return (
    <section className="py-24 bg-[#FFF9EF] border-b border-[#E8DCCB]/60 select-none">
      <div className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center space-x-3 mb-3">
              <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#89190E] uppercase">
                Hall of Fame & Alumni Voices
              </span>
              <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10233F] tracking-tight">
              Real Students, Real Judicial Selections
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 bg-white/80 p-1.5 rounded-2xl border border-[#E8DCCB] shadow-xs overflow-x-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-[#89190E] text-white shadow-sm'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setSelectedFilter('judiciary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'judiciary'
                  ? 'bg-[#89190E] text-white shadow-sm'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              PCS J / Judiciary
            </button>
            <button
              onClick={() => setSelectedFilter('clat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'clat'
                  ? 'bg-[#89190E] text-white shadow-sm'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              CLAT / AILET
            </button>
            <button
              onClick={() => setSelectedFilter('ugc-net')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'ugc-net'
                  ? 'bg-[#89190E] text-white shadow-sm'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              UGC NET / LLM
            </button>
          </div>
        </div>

        {/* 3-Column Achievers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAchievers.map((achiever) => (
            <div
              key={achiever.id}
              className="bg-white rounded-3xl p-7 border border-[#E8DCCB] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge & Rating */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#89190E] bg-[#FFF3DD] border border-[#F7E5BF] px-3 py-1 rounded-full flex items-center space-x-1">
                    <Award className="w-3 h-3 text-[#89190E]" />
                    <span>{achiever.badge}</span>
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Quote Text */}
                <div className="relative mb-6">
                  <Quote className="w-7 h-7 text-[#E8DCCB] absolute -top-3 -left-1 opacity-70" />
                  <p className="text-[#10233F] text-sm leading-relaxed pl-5 font-normal italic">
                    "{achiever.quote}"
                  </p>
                </div>
              </div>

              {/* Placement Details Card */}
              <div className="pt-5 border-t border-[#E8DCCB]/80">
                <div className="flex items-center space-x-3.5 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-[#EFC988] flex-shrink-0 shadow-sm">
                    <Image
                      src={achiever.avatar}
                      alt={achiever.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#10233F] group-hover:text-[#89190E] transition-colors flex items-center">
                      <span>{achiever.name}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 ml-1.5 inline" />
                    </h4>
                    <span className="text-xs text-[#526174] block">
                      {achiever.course} • {achiever.year}
                    </span>
                  </div>
                </div>

                {/* Company & Package Tag */}
                <div className="bg-[#FFF9EF] rounded-2xl p-3 border border-[#E8DCCB] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#526174] font-medium block">
                      Placed At
                    </span>
                    <span className="text-xs font-bold text-[#10233F]">
                      {achiever.company}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#526174] font-medium block">
                      Package
                    </span>
                    <span className="text-xs font-extrabold text-[#89190E]">
                      {achiever.packageText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
