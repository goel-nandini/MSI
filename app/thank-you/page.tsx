'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import EnquiryModal from '@/components/modals/EnquiryModal';
import {
  CheckCircle2,
  Clock,
  PhoneCall,
  Calendar,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Home,
  MessageCircle,
} from 'lucide-react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get('name') || '';
  const courseParam = searchParams.get('course') || '';
  const phoneParam = searchParams.get('phone') || '';

  const [refId, setRefId] = useState('MSI-2026-8429');
  const [submissionDate, setSubmissionDate] = useState('');

  useEffect(() => {
    // Generate a deterministic or random reference ID for display
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setRefId(`MSI-ENQ-${new Date().getFullYear()}-${randomSuffix}`);
    setSubmissionDate(
      new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, []);

  const studentName = nameParam ? decodeURIComponent(nameParam) : 'Future Achiever';
  const selectedCourse = courseParam
    ? decodeURIComponent(courseParam)
    : 'Professional Academic Program';
  const contactPhone = phoneParam ? decodeURIComponent(phoneParam) : 'Your Registered Mobile';

  const institutePhone = '+917986313013';
  const displayPhone = '+91 79863 13013';
  const whatsappUrl = `https://wa.me/919634299858?text=${encodeURIComponent(
    `Hello MSI Admissions Team, I just submitted an enquiry for ${selectedCourse} (Ref: ${refId}). Please share batch timings & fee details.`
  )}`;

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Celebration & Success Hero */}
      <div className="relative bg-white border border-[#E8DCCB] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-12 text-center">
        {/* Top Decorative Maroon Band */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#89190E]" />

        {/* Floating background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Success Badge */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 p-1.5 bg-[#89190E] text-[#EFC988] rounded-full shadow-md">
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        {/* Heading */}
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#89190E] bg-[#FFF3DD] border border-[#F7E5BF] px-3.5 py-1 rounded-full mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#89190E]" />
          Enquiry Successfully Submitted
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10233F] tracking-tight mb-3">
          Thank You, {studentName}!
        </h1>
        <p className="text-[#526174] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Your admission enquiry for{' '}
          <strong className="text-[#89190E] font-semibold">{selectedCourse}</strong> has been
          received by the MSI Admissions Directorate.
        </p>

        {/* Reference & Verification Card */}
        <div className="mt-8 p-5 sm:p-6 bg-[#FFF9EF] border border-[#E8DCCB] rounded-2xl max-w-lg mx-auto text-left shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-3 mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#526174] block">
                Official Reference ID
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-[#89190E]">
                {refId}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Assigned</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#526174] block">Course of Interest:</span>
              <span className="font-semibold text-[#10233F]">{selectedCourse}</span>
            </div>
            <div>
              <span className="text-[#526174] block">Registered Contact:</span>
              <span className="font-semibold text-[#10233F]">{contactPhone}</span>
            </div>
            <div>
              <span className="text-[#526174] block">Submission Timestamp:</span>
              <span className="font-semibold text-[#10233F]">
                {submissionDate || 'Just now'}
              </span>
            </div>
            <div>
              <span className="text-[#526174] block">Institute Location:</span>
              <span className="font-semibold text-[#10233F]">Kharar Institute, Mohali</span>
            </div>
          </div>
        </div>

        {/* Instant Action CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          {/* WhatsApp Direct Chat */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 h-12 px-6 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:bg-[#05463e] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <svg
              className="w-5 h-5 fill-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.031 2C6.498 2 2 6.497 2 12.032c0 1.996.586 3.864 1.6 5.438L2 22l4.673-1.562a10.007 10.007 0 0 0 5.358 1.564h.005c5.531 0 10.029-4.498 10.029-10.032 0-2.68-1.043-5.2-2.935-7.093A9.96 9.96 0 0 0 12.031 2Zm0 18.361h-.004a8.318 8.318 0 0 1-4.24-1.163l-.304-.18-3.155 1.054 1.073-3.076-.197-.315a8.324 8.324 0 0 1-1.278-4.45c0-4.606 3.748-8.354 8.356-8.354 2.232 0 4.33.87 5.908 2.45a8.293 8.293 0 0 1 2.446 5.904c0 4.608-3.748 8.356-8.36 8.356Zm4.582-6.257c-.251-.126-1.487-.734-1.718-.817-.23-.084-.397-.126-.565.126-.168.251-.649.817-.796.985-.147.168-.293.189-.544.063-.251-.126-1.06-.391-2.02-1.246-.746-.665-1.25-1.488-1.397-1.74-.146-.251-.016-.387.11-.512.113-.112.251-.293.376-.44.126-.147.168-.252.252-.42.083-.168.042-.314-.021-.44-.063-.125-.565-1.362-.774-1.865-.204-.49-.411-.423-.565-.431l-.481-.008c-.168 0-.44.063-.67.314-.23.252-.88.86-.88 2.096 0 1.237.901 2.431 1.026 2.599.126.168 1.773 2.707 4.296 3.796.6.26 1.068.415 1.433.531.602.191 1.15.164 1.583.1.482-.072 1.487-.608 1.696-1.194.21-.587.21-1.09.147-1.195-.063-.105-.23-.167-.481-.293Z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </a>

          {/* Direct Phone Call */}
          <a
            href={`tel:${institutePhone}`}
            className="w-full sm:w-auto flex-1 h-12 px-6 rounded-xl bg-[#89190E] hover:bg-[#65130D] active:bg-[#500e09] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Admissions</span>
          </a>
        </div>
      </div>

      {/* 3-Step What Happens Next Timeline */}
      <div className="mt-12">
        <h2 className="font-serif text-2xl font-bold text-[#10233F] text-center mb-8">
          What Happens Next?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FFF3DD] text-[#89190E] flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="font-serif font-bold text-[#10233F] text-lg mb-2">
              Profile Review
            </h3>
            <p className="text-xs text-[#526174] leading-relaxed">
              Our academic counselors review your target examination or career goals to match the most effective preparation track.
            </p>
          </div>

          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-t-2 border-t-[#89190E]">
            <div className="w-12 h-12 rounded-xl bg-[#89190E] text-white flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="font-serif font-bold text-[#10233F] text-lg mb-2">
              Counseling Call
            </h3>
            <p className="text-xs text-[#526174] leading-relaxed">
              Expect a direct telephone call on your registered phone within 2 hours. We will answer all your fee and scholarship questions.
            </p>
          </div>

          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FFF3DD] text-[#89190E] flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="font-serif font-bold text-[#10233F] text-lg mb-2">
              Demo Class & Visit
            </h3>
            <p className="text-xs text-[#526174] leading-relaxed">
              Receive free guest access to our live offline or online batch and book a guided institute tour at our Kharar institution.
            </p>
          </div>
        </div>
      </div>

      {/* Return & Explore Navigation */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-white border border-[#E8DCCB] text-[#10233F] hover:border-[#89190E] hover:text-[#89190E] transition-all flex items-center space-x-1.5"
        >
          <Home className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
        <Link
          href="/courses"
          className="px-5 py-2.5 rounded-xl bg-[#89190E] text-white hover:bg-[#65130D] transition-all flex items-center space-x-1.5"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore All Courses</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF9EF] text-[#10233F] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      <Navbar onOpenEnquiry={() => setIsEnquiryOpen(true)} />

      <main className="flex-grow flex items-center justify-center">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-[#89190E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-[#10233F]">Loading confirmation...</p>
            </div>
          }
        >
          <ThankYouContent />
        </Suspense>
      </main>

      <Footer />
      <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />
    </div>
  );
}
