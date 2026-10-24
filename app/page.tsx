'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import HeroSlider from '@/components/home/HeroSlider';
import FeatureStrip from '@/components/home/FeatureStrip';
import StatsSection from '@/components/home/StatsSection';
import WhyMSISection from '@/components/home/WhyMSISection';
import RecruiterMarquee from '@/components/home/RecruiterMarquee';
import CampusExperienceTabs from '@/components/home/CampusExperienceTabs';
import FacultySpotlight from '@/components/home/FacultySpotlight';
import AchieversTestimonials from '@/components/home/AchieversTestimonials';
import BlogPreview from '@/components/home/BlogPreview';
import AdmissionsCountdownCTA from '@/components/home/AdmissionsCountdownCTA';
import BlueprintStencilBand from '@/components/home/BlueprintStencilBand';
import TypewriterHeroBand from '@/components/home/TypewriterHeroBand';
import Footer from '@/components/footer/Footer';
import EnquiryModal from '@/components/modals/EnquiryModal';
import VideoModal from '@/components/modals/VideoModal';
import TiltCard from '@/components/ui/TiltCard';
import Reveal from '@/components/ui/Reveal';
import Image from 'next/image';
import Link from 'next/link';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Shield,
  Sparkles,
  Layers,
  Cpu,
  Scale,
  Send,
  Phone,
  Clock,
} from 'lucide-react';
import { UdemyCourse, getStoredCourses, LMS_SYNC_EVENT } from '@/lib/lmsStore';

const DEFAULT_HOME_COURSES = [
  {
    id: 'pcs-j',
    num: '01',
    title: 'PCS J — Punjab & Haryana Judiciary',
    level: 'Civil Judge (Junior Division) / JMFC',
    badge: '#1 BESTSELLER',
    badgeVariant: 'crimson' as const,
    icon: Scale,
    accent: '#89190E',
    duration: '1-Year Regular / Weekend',
    stat: '100+ Selections',
    desc: 'Flagship judicial coaching with daily Bare Act deconstructions, procedural codes, and intensive evaluated Mains judgment drafting.',
    features: [
      'Comprehensive CPC, CrPC, BNSS 2023 & Evidence Mastery',
      'Daily High Court Judgment Drafting & Answer Checking',
      'Mock Interview Panels with Senior Advocates & Ex-Judges',
    ],
  },
  {
    id: 'clat-ailet',
    num: '02',
    title: 'CLAT & AILET — 5-Year Integrated Law',
    level: 'Class 11, 12 & Droppers Cohort',
    badge: 'TOP ENROLLED',
    badgeVariant: 'gold' as const,
    icon: GraduationCap,
    accent: '#10233F',
    duration: '1-Year / 2-Year / Crash',
    stat: 'AIR Top 100 Ranks',
    desc: 'Targeted preparation for all 24 National Law Universities with rigorous passage-based analytics, critical reasoning, and speed strategy.',
    features: [
      'Passage-First Speed Mapping & Logical Reasoning Drills',
      'Weekly Legal GK, Constitutional Updates & Current Affairs',
      '100+ Proctored All-India Simulated Mock Tests with AIR',
    ],
  },
  {
    id: 'pu-law',
    num: '03',
    title: 'PU Law Entrance — 3-Yr & 5-Yr LL.B',
    level: 'Panjab University & Regional Wings',
    badge: 'STATE RANKER CHOICE',
    badgeVariant: 'navy' as const,
    icon: Award,
    accent: '#89190E',
    duration: '3-Month Intensive & Crash',
    stat: 'Rank 12 PU State Top Ranker',
    desc: 'Specialized syllabus training for Department of Laws, Panjab University Chandigarh, UILS, and regional university centers.',
    features: [
      '15-Year Solved Sectional Previous Year Question Deconstructions',
      'Legal Aptitude, Indian Polity & Current Affairs Focus',
      'OMR Exam-Hall Simulation with High-Accuracy Elimination',
    ],
  },
];

export default function HomePage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('PCS J — Punjab Civil Judge Coaching');
  const [dynamicCourses, setDynamicCourses] = useState<UdemyCourse[]>(() => getStoredCourses());

  // Synchronize courses dynamically from local store & server disk
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const stored = getStoredCourses();
        if (stored) {
          setDynamicCourses(stored);
        }
        const res = await fetch('/api/courses', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.courses)) {
            setDynamicCourses(data.courses);
          }
        }
      } catch (err) {
        console.warn('HomePage course sync skipped:', err);
      }
    };

    loadCourses();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('msi_sync_channel');
        bc.onmessage = (event) => {
          if (
            event.data?.type === 'COURSE_CREATED' ||
            event.data?.type === 'COURSE_PUBLISHED' ||
            event.data?.type === 'COURSE_DELETED' ||
            event.data?.type === 'COURSE_ASSIGNED'
          ) {
            loadCourses();
          }
        };
      }
    } catch (_) {}

    const handleSync = () => loadCourses();
    window.addEventListener(LMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('msi_courses_sync', handleSync);

    const interval = setInterval(() => {
      loadCourses();
    }, 3500);

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
      window.removeEventListener(LMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('msi_courses_sync', handleSync);
    };
  }, []);

  // Format courses for home screen cards
  const displayCourses = React.useMemo(() => {
    if (!dynamicCourses || dynamicCourses.length === 0) {
      return DEFAULT_HOME_COURSES;
    }

    return dynamicCourses.map((c, idx) => {
      const badgeVariant: 'crimson' | 'gold' | 'navy' =
        idx % 3 === 0 ? 'crimson' : idx % 3 === 1 ? 'gold' : 'navy';
      const icon = idx % 2 === 0 ? Scale : GraduationCap;
      const accent = idx % 2 === 0 ? '#89190E' : '#10233F';
      const features =
        c.whatYouWillLearn && c.whatYouWillLearn.length > 0
          ? c.whatYouWillLearn.slice(0, 3)
          : [
              'Bare Act deconstruction & landmark ratio decidendi',
              'Evaluated Mains answer drafting & problem solving',
              'All-India simulated mock tests with rank analysis',
            ];

      return {
        id: c.id,
        num: String(idx + 1).padStart(2, '0'),
        title: c.title,
        level: `${c.level || 'All Levels'} • ${c.instructorName || 'MSI Faculty'}`,
        badge: c.badge ? c.badge.toUpperCase() : idx === 0 ? '#1 BESTSELLER' : 'HOT & NEW',
        badgeVariant,
        icon,
        accent,
        duration: c.totalDuration || 'Comprehensive',
        stat: `${c.totalLectures || 40}+ Lectures`,
        desc: c.headline || c.description,
        features,
        slug: c.slug,
      };
    });
  }, [dynamicCourses]);

  return (
    <div className="relative min-h-screen bg-[#FFF9EF] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      {/* Floating Glassmorphism Navbar with Active State & Admissions Ticker */}
      <Navbar onOpenEnquiry={() => setIsEnquiryOpen(true)} />

      {/* Main Content Flow */}
      <main className="flex-grow">
        {/* Full-Width Auto-Slide Hero Carousel */}
        <HeroSlider
          onOpenVideo={() => setIsVideoOpen(true)}
          onOpenEnquiry={() => setIsEnquiryOpen(true)}
        />

        {/* Floating Feature Strip */}
        <FeatureStrip />

        {/* Animated Stats Counters on Navy Background */}
        <StatsSection />

        {/* ✦ ChainGPT-Inspired: Giant Stencil Scroll + HUD Grid Cards */}
        <BlueprintStencilBand onOpenEnquiry={() => setIsEnquiryOpen(true)} />

        {/* Why Choose MSI — 8-Card Feature Grid */}
        <WhyMSISection />

        {/* ✦ ChainGPT-Inspired: Typewriter + Blueprint Grid + Chamfered CTAs */}
        <TypewriterHeroBand onOpenEnquiry={() => setIsEnquiryOpen(true)} />

        {/* Corporate Alliances & Infinite Recruiter Marquee */}
        <RecruiterMarquee />

        {/* Best Selling Courses Section */}
        <section className="py-24 px-6 sm:px-10 lg:px-16 max-w-[1380px] mx-auto select-none">
          <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-3 mb-3">
              <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#89190E] uppercase">
                Top Enrolled Programmes
              </span>
              <span className="h-[2px] w-8 bg-[#EFC988] rounded-full" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10233F] tracking-tight">
              Best Selling Courses
            </h2>
            <p className="mt-4 text-[#526174] text-base sm:text-lg">
              Our most enrolled, result-proven judicial and law entrance programmes designed to get you selected.
            </p>
          </Reveal>

          {/* Dynamic Best Selling Courses Grid (Synchronized with Super Admin additions) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-10">
            {displayCourses.slice(0, 6).map((course, idx) => {
              const Icon = course.icon;
              return (
                <Reveal key={course.id} direction="up" delay={idx * 100} className="h-full">
                  <div className="blueprint-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between h-full bg-white shadow-sm hover:shadow-xl hover:border-[#89190E]/60 transition-all duration-300 relative overflow-hidden group">
                    {/* Top Accent Strip */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{
                        background:
                          course.badgeVariant === 'crimson'
                            ? 'linear-gradient(90deg, #89190E, #EFC988)'
                            : course.badgeVariant === 'gold'
                            ? 'linear-gradient(90deg, #EFC988, #10233F)'
                            : 'linear-gradient(90deg, #10233F, #89190E)',
                      }}
                    />

                    {/* Blueprint dot grid overlay */}
                    <div className="absolute inset-0 blueprint-dot-grid opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none rounded-3xl" />

                    <div>
                      {/* Header Row: Badge + Number */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                            course.badgeVariant === 'crimson'
                              ? 'bg-[#89190E]/10 text-[#89190E] border border-[#89190E]/20'
                              : course.badgeVariant === 'gold'
                              ? 'bg-[#EFC988]/25 text-[#7A5A18] border border-[#EFC988]'
                              : 'bg-[#10233F]/10 text-[#10233F] border border-[#10233F]/20'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{course.badge}</span>
                        </span>

                        <span className="font-mono text-xs font-bold text-[#10233F]/40 tracking-wider">
                          {course.num} // BESTSELLER
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-center gap-3.5 mb-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{
                            backgroundColor: `${course.accent}12`,
                            color: course.accent,
                            border: `1px solid ${course.accent}25`,
                          }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors leading-tight">
                            {course.title}
                          </h3>
                        </div>
                      </div>

                      {/* Level subhead */}
                      <p className="text-xs font-bold text-[#89190E] mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EFC988]" />
                        <span>{course.level}</span>
                      </p>

                      <p className="text-xs sm:text-sm text-[#526174] leading-relaxed mb-5">
                        {course.desc}
                      </p>

                      {/* Bullet Highlights */}
                      <div className="space-y-2.5 pt-4 pb-5 border-t border-[#E8DCCB]/60">
                        {course.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#10233F] font-medium leading-snug">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer: Metric & Action Buttons */}
                    <div className="pt-4 border-t border-[#E8DCCB]/60 mt-auto">
                      <div className="flex items-center justify-between text-xs mb-4">
                        <span className="text-[#526174] font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#89190E]" />
                          <span>{course.duration}</span>
                        </span>
                        <span className="font-bold text-[#89190E] bg-[#FFF3DD] px-2.5 py-0.5 rounded-md border border-[#EFC988]/50">
                          {course.stat}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCourse(course.title);
                            setIsEnquiryOpen(true);
                          }}
                          className="h-10 px-3 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enquire Batch</span>
                        </button>

                        <a
                          href={`https://wa.me/919634299858?text=${encodeURIComponent(
                            `Hello MSI Admissions Team, I want to enquire about ${course.title} batch details.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 px-3 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:bg-[#05463e] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* View All Programmes CTA */}
          <div className="flex justify-center mb-12">
            <Link
              href="/courses"
              className="inline-flex items-center space-x-2.5 px-7 py-3.5 rounded-2xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-sm shadow-lg shadow-[#89190E]/20 transition-all hover:scale-102 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#EFC988]" />
              <span>Explore All Academic & Judicial Programmes</span>
              <ArrowRight className="w-4 h-4 text-[#EFC988]" />
            </Link>
          </div>

          {/* Under Courses Banner (Admissions Consultation) */}
          <Reveal direction="up" className="mt-4">
            <div className="rounded-3xl bg-gradient-to-r from-[#10233F] via-[#162f55] to-[#10233F] p-6 sm:p-8 text-white border border-[#EFC988]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#EFC988] block mb-1">
                  Admissions Consultation
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold">
                  Targeting PCS J, CLAT or UGC NET 2026?
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-lg">
                  Speak directly with our academic mentors to choose the ideal batch and test series.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse('Admissions General Enquiry');
                    setIsEnquiryOpen(true);
                  }}
                  className="h-11 px-5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enquire Now</span>
                </button>

                <a
                  href="https://wa.me/919634299858?text=Hello%20MSI%20Admissions%20Team%2C%20I%20want%20to%20enquire%20about%20your%20coaching%20programs."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-5 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:bg-[#05463e] text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="tel:+917986313013"
                  className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center space-x-1.5 border border-white/20 transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call: +91 79863 13013</span>
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Institute Life & Facilities Interactive Tabs */}
        <CampusExperienceTabs
          onOpenVideo={() => setIsVideoOpen(true)}
          onOpenEnquiry={() => setIsEnquiryOpen(true)}
        />

        {/* Faculty Spotlight — 3 Department Heads */}
        <FacultySpotlight />

        {/* Achievers Hall of Fame & Testimonials */}
        <AchieversTestimonials />

        {/* MSI Gazette — Blog Article Previews */}
        <BlogPreview />

        {/* Admissions Fast-Track Countdown CTA Banner */}
        <AdmissionsCountdownCTA
          onOpenEnquiry={() => setIsEnquiryOpen(true)}
        />
      </main>

      {/* Global Institutional Footer */}
      <Footer />

      {/* Interactive Modals */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        initialCourse={selectedCourse}
      />
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </div>
  );
}
