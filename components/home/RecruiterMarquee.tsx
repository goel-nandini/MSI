'use client';

import React from 'react';
import { Trophy, TrendingUp, Users, Building2, Briefcase, Award } from 'lucide-react';

export default function RecruiterMarquee() {
  const row1Companies = [
    { name: 'Punjab & Haryana High Court', domain: 'PCS J Civil Judge Selections', badge: 'Judiciary' },
    { name: 'National Law University Delhi', domain: 'CLAT Top Selections', badge: 'NLU' },
    { name: 'Punjab Public Service Commission', domain: 'Judicial Services', badge: 'PPSC' },
    { name: 'NLU Jodhpur', domain: 'AILET Top Selections', badge: 'NLU' },
    { name: 'Himachal Pradesh Judiciary', domain: 'HPS J Selections', badge: 'Judiciary' },
    { name: 'UGC — University Grants Commission', domain: 'NET Law JRF Qualifiers', badge: 'UGC NET' },
    { name: 'District Courts — Punjab', domain: 'Civil & Sessions Courts', badge: 'Civil Courts' },
    { name: 'NLU Kolkata', domain: 'CLAT Selections', badge: 'NLU' },
    { name: 'Haryana Judiciary', domain: 'HCS J Selections', badge: 'Judiciary' },
  ];

  const row2Companies = [
    { name: 'NLU Lucknow', domain: 'CLAT Admissions', badge: 'NLU' },
    { name: 'Chandigarh Bar Association', domain: 'Advocate Selections', badge: 'Bar' },
    { name: 'Delhi High Court', domain: 'Judicial Postings', badge: 'HC' },
    { name: 'Punjab Vidhan Sabha', domain: 'Legal Officer Posts', badge: 'Govt.' },
    { name: 'NLU Bhopal', domain: 'Law Entrance Selections', badge: 'NLU' },
    { name: 'Haryana Staff Selection Commission', domain: 'Legal Advisor Posts', badge: 'HSSC' },
    { name: 'NLU Patiala', domain: 'CLAT Admissions', badge: 'NLU' },
    { name: 'HPNLU Shimla', domain: 'CLAT/AILET Selections', badge: 'NLU' },
    { name: 'UGC NET — Assistant Professor', domain: 'Law Teaching Positions', badge: 'Teaching' },
  ];

  const placementStats = [
    { value: '300+', label: 'Successful Selections', icon: TrendingUp, desc: 'PCS J, CLAT & other law exams' },
    { value: '50+', label: 'Expert Tutors', icon: Trophy, desc: 'Certified legal coaching faculty' },
    { value: '30+', label: 'Courses Offered', icon: Award, desc: 'Judiciary, CLAT, AILET, UGC NET' },
    { value: '5,000+', label: 'Students Mentored', icon: Building2, desc: 'Across law entrances and judicial prep' },
  ];


  return (
    <section className="py-20 bg-gradient-to-b from-[#FFF9EF] via-white to-[#FFF9EF] border-y border-[#E8DCCB]/60 select-none overflow-hidden">
      <div className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 mb-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-3 mb-3">
              <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#89190E] uppercase">
                Career Pathways & Corporate Alliances
              </span>
              <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10233F] tracking-tight">
              Where MSI Students Get Selected
            </h2>
          </div>
          <p className="text-[#526174] text-sm sm:text-base max-w-md">
            Our students are regularly selected by high courts, district courts, NLUs and UGC NET across Punjab, Haryana, Himachal Pradesh and beyond.
          </p>
        </div>

        {/* 4 Metrics Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-10">
          {placementStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-[#E8DCCB] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF3DD] text-[#89190E] flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#89190E] bg-[#FFF9EF] px-2.5 py-0.5 rounded-full border border-[#E8DCCB]">
                    Verified
                  </span>
                </div>
                <div className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#10233F] tracking-tight group-hover:text-[#89190E] transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-[#10233F] mt-1">{stat.label}</div>
                <div className="text-xs text-[#526174] mt-0.5">{stat.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Infinite Marquee Track 1 (Leftward) */}
      <div className="marquee-container mb-4">
        <div className="marquee-track flex items-center space-x-4">
          {[...row1Companies, ...row1Companies].map((company, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center space-x-3.5 px-6 py-4 rounded-2xl bg-white border border-[#E8DCCB] shadow-xs hover:shadow-md hover:border-[#89190E]/40 transition-all duration-300 group cursor-default"
            >
              <div className="w-9 h-9 rounded-xl bg-[#10233F] text-white flex items-center justify-center font-serif font-bold text-sm group-hover:bg-[#89190E] transition-colors">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-sm sm:text-base text-[#10233F] group-hover:text-[#89190E] transition-colors">
                    {company.name}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-[#89190E] bg-[#FFF3DD] px-2 py-0.5 rounded-md">
                    {company.badge}
                  </span>
                </div>
                <span className="text-xs text-[#526174] block mt-0.5">
                  {company.domain}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite Marquee Track 2 (Rightward) */}
      <div className="marquee-container">
        <div className="marquee-track-reverse flex items-center space-x-4">
          {[...row2Companies, ...row2Companies].map((company, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center space-x-3.5 px-6 py-4 rounded-2xl bg-white border border-[#E8DCCB] shadow-xs hover:shadow-md hover:border-[#89190E]/40 transition-all duration-300 group cursor-default"
            >
              <div className="w-9 h-9 rounded-xl bg-[#89190E] text-white flex items-center justify-center font-serif font-bold text-sm group-hover:bg-[#10233F] transition-colors">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-sm sm:text-base text-[#10233F] group-hover:text-[#89190E] transition-colors">
                    {company.name}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-[#10233F] bg-[#EFC988]/30 px-2 py-0.5 rounded-md">
                    {company.badge}
                  </span>
                </div>
                <span className="text-xs text-[#526174] block mt-0.5">
                  {company.domain}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
