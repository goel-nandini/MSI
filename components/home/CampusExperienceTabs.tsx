'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Scale,
  Dumbbell,
  Landmark,
  Play,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Award,
  ExternalLink,
} from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  icon: any;
  title: string;
  subtitle: string;
  image: string;
  videoUrl?: string;
  youtubeUrl?: string;
  description: string;
  features: string[];
  statLabel: string;
  statValue: string;
}

interface CampusExperienceTabsProps {
  onOpenVideo?: () => void;
  onOpenEnquiry?: () => void;
}

export default function CampusExperienceTabs({
  onOpenVideo,
  onOpenEnquiry,
}: CampusExperienceTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('institute-tour');

  const facilities: Facility[] = [
    {
      id: 'institute-tour',
      name: 'Institute Tour & Entrance',
      icon: Landmark,
      title: 'MSI Institute Entrance & Academic Chambers',
      subtitle: 'Monga City Centre, Kharar – Mohali',
      image: '/images/tour/tour-frame-1.webp',
      videoUrl: '/videos/msi-tour-loop.mp4',
      youtubeUrl: 'https://youtu.be/6qZ2zcsjidQ',
      description:
        'Step inside the state-of-the-art MSI Institute headquarters located across the 1st, 2nd, and 3rd floors of Monga City Centre in Kharar, Mohali. Featuring executive consultation chambers, modern smart classrooms, and dedicated discussion pods.',
      features: [
        'Grand reception, executive consultation suites & smart lecture halls',
        'Centrally air-conditioned judicial study chambers & quiet zones',
        'Conveniently connected on the Chandigarh-Kharar Highway',
      ],
      statLabel: 'Aspirants Trained',
      statValue: '15,000+',
    },
    {
      id: 'judicial-cell',
      name: 'Judicial Examination Cell',
      icon: Award,
      title: 'Judicial Exam & Speed-Testing Arena',
      subtitle: 'Rigorous Simulation for PCS J & High Court Aspirants',
      image: '/images/tour/tour-frame-2.webp',
      description:
        'Equipped with dedicated timed test terminals, daily judgment writing workstations, Bare Act concordances, and automated OMR evaluation systems tailored for PCS J, CLAT and PU Law.',
      features: [
        'Simulated judicial exam environments with negative marking',
        'Dedicated judgment drafting & answer writing booths',
        'Weekly mock ranking & comparative performance feedback',
      ],
      statLabel: 'Judicial & Law Selections',
      statValue: '300+',
    },
    {
      id: 'library',
      name: 'Central Law Library',
      icon: BookOpen,
      title: 'Scholarly Sanctuary with Legal Reference Volumes',
      subtitle: 'The Heart of Legal Research & Precedents',
      image: '/images/hero-3.webp',
      description:
        'A comprehensive legal library featuring Bare Acts, SCC Online, AIR archives, constitutional digests, and quiet reading zones for uninterrupted examination preparation.',
      features: [
        'Complete repository of Supreme Court & High Court judgments',
        'Quiet collaborative discussion rooms with digital legal databases',
        'Subject-wise reference notes and past 15-year question banks',
      ],
      statLabel: 'Legal Volumes & Journals',
      statValue: '10,000+',
    },
    {
      id: 'mootcourt',
      name: 'Moot Court Hall',
      icon: Scale,
      title: 'National Standard Simulated High Court',
      subtitle: 'Nurturing India’s Next Generation of Jurists',
      image: '/images/tour/tour-frame-4.webp',
      description:
        'Designed to mirror the Supreme Court of India, giving law students real-world advocacy experience, national moot competition hosting, and clinical legal aid sessions.',
      features: [
        'Live streaming & court transcription technology',
        'Judges bench accommodating 5-member judicial panels',
        'Host to the annual MSI National Moot Court Competition',
      ],
      statLabel: 'National Trophies Won',
      statValue: '28+',
    },
    {
      id: 'sports',
      name: 'Sports & Athletic Arena',
      icon: Dumbbell,
      title: 'Olympic-Standard Indoor & Outdoor Sports Arena',
      subtitle: 'Fostering Grit, Fitness, and Team Spirit',
      image: '/images/hero-3.webp',
      description:
        'Comprehensive athletic facilities including basketball courts, badminton arena, cricket pavilion, fully equipped gymnasium, and certified trainers.',
      features: [
        'Multi-sport indoor stadium with synthetic flooring',
        'Professional athletic coaching & inter-university tournaments',
        'Physiotherapy & wellness center at the institute',
      ],
      statLabel: 'Annual Sports Medals',
      statValue: '60+',
    },
  ];

  const currentFacility = facilities.find((f) => f.id === activeTab) || facilities[0];

  return (
    <section className="py-24 px-6 sm:px-10 lg:px-16 max-w-[1380px] mx-auto select-none">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-3 mb-3">
          <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
          <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#89190E] uppercase">
            Institute Ecosystem & Life
          </span>
          <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10233F] tracking-tight">
          Spaces Crafted for Boundless Ambition
        </h2>
        <p className="mt-4 text-[#526174] text-base sm:text-lg">
          Take a deep dive into our specialized laboratories, majestic libraries, and academic spaces designed to stimulate minds and build holistic leaders.
        </p>
      </div>

      {/* Tab Navigation Buttons */}
      <div className="flex items-center justify-start lg:justify-center space-x-2 sm:space-x-3 overflow-x-auto pb-4 mb-10 scrollbar-none">
        {facilities.map((facility) => {
          const Icon = facility.icon;
          const isActive = facility.id === activeTab;
          return (
            <button
              key={facility.id}
              onClick={() => setActiveTab(facility.id)}
              className={`flex items-center space-x-2.5 px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 flex-shrink-0 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#89190E] text-white shadow-lg shadow-[#89190E]/25 -translate-y-0.5'
                  : 'bg-white text-[#10233F] hover:bg-[#FFF3DD] border border-[#E8DCCB] hover:border-[#89190E]/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#EFC988]' : 'text-[#89190E]'}`} />
              <span>{facility.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Card */}
      <div className="bg-white rounded-3xl border border-[#E8DCCB] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-500">
        {/* Left Visual Media Showcase (7 cols) */}
        <div className="relative lg:col-span-7 h-[360px] sm:h-[460px] lg:h-[520px] overflow-hidden group bg-black">
          {currentFacility.videoUrl ? (
            <div
              className="relative w-full h-full cursor-pointer group"
              onClick={() => window.open(currentFacility.youtubeUrl || 'https://youtu.be/6qZ2zcsjidQ', '_blank')}
              title="Click to watch full video on YouTube"
            >
              <video
                key={currentFacility.id}
                src={currentFacility.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10233F]/85 via-transparent to-black/30 pointer-events-none" />

              {/* Direct YouTube Link Badge in Top Right */}
              <a
                href={currentFacility.youtubeUrl || 'https://youtu.be/6qZ2zcsjidQ'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-6 right-6 z-20 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Center Play Button Overlay on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl border-2 border-white/60 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Image
                key={currentFacility.id}
                src={currentFacility.image}
                alt={currentFacility.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 animate-fadeIn"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10233F]/80 via-transparent to-transparent pointer-events-none" />

              {/* Floating Facility Badge */}
              <div className="absolute top-6 left-6 z-20 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white text-xs font-bold text-[#10233F]">
                <Sparkles className="w-3.5 h-3.5 text-[#89190E]" />
                <span>{currentFacility.name}</span>
              </div>
            </>
          )}

          {/* Virtual Tour Play Button */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center space-x-2">
            <button
              onClick={() => window.open(currentFacility.youtubeUrl || 'https://youtu.be/6qZ2zcsjidQ', '_blank')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch on YouTube</span>
            </button>
            <button
              onClick={onOpenVideo}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/95 hover:bg-white text-[#10233F] text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Virtual Tour Modal</span>
            </button>
          </div>

          {/* Floating Metric Pill */}
          <div className="absolute bottom-6 right-6 z-20 bg-[#10233F]/90 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-white text-right hidden sm:block">
            <div className="font-serif text-2xl font-bold text-[#EFC988]">
              {currentFacility.statValue}
            </div>
            <div className="text-[11px] text-gray-300">{currentFacility.statLabel}</div>
          </div>
        </div>

        {/* Right Details Description (5 cols) */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-[#FFF9EF]/40">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#89190E] bg-[#FFF3DD] border border-[#F7E5BF] px-3 py-1 rounded-full inline-block mb-3">
              {currentFacility.subtitle}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F] leading-tight mb-4">
              {currentFacility.title}
            </h3>
            <p className="text-[#526174] text-sm sm:text-base leading-relaxed mb-6">
              {currentFacility.description}
            </p>

            {/* Key Bullet Highlights */}
            <div className="space-y-3 mb-8">
              {currentFacility.features.map((feat, fIdx) => (
                <div key={fIdx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#89190E] flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#10233F] font-medium leading-normal">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Actions */}
          <div className="pt-6 border-t border-[#E8DCCB] flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenEnquiry}
              className="h-11 px-6 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs sm:text-sm font-semibold transition-all btn-hover-lift flex items-center space-x-2 cursor-pointer"
            >
              <span>Schedule Institute Visit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://youtu.be/6qZ2zcsjidQ"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-xl bg-white hover:bg-[#FFF3DD] text-[#89190E] border border-[#89190E]/40 text-xs sm:text-sm font-semibold transition-all inline-flex items-center space-x-1.5"
            >
              <span>Open Video Tour</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
