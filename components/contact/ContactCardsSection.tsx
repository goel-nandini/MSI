'use client';

import React, { useState } from 'react';
import TiltCard from '@/components/ui/TiltCard';
import Reveal from '@/components/ui/Reveal';
import {
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
} from 'lucide-react';

interface ContactCardsSectionProps {
  onOpenEnquiry?: () => void;
}

export default function ContactCardsSection({ onOpenEnquiry }: ContactCardsSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const phoneDisplay = '+91 79863 13013';
  const emailDisplay = 'info@msiinstitutes.com';
  const addressDisplay =
    '1st, 2nd and 3rd floor, Monga City Centre, Sco 12-13, Kharar - Landran Rd, Sector 115, Sahibzada Ajit Singh Nagar, Punjab 140307, India';
  const mapsUrl =
    'https://maps.google.com/?q=Monga+City+Centre+Kharar+Landran+Road+Sector+115+Sahibzada+Ajit+Singh+Nagar+Punjab+140307';
  const whatsappUrl = `https://wa.me/917986313013?text=${encodeURIComponent(
    'Hello MSI Admissions Team, I want to enquire about your coaching programs, batch timings and admissions.'
  )}`;

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    }
  };

  return (
    <section className="relative w-full mb-20 sm:mb-24">
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-80 bg-gradient-to-r from-[#89190E]/8 via-[#EFC988]/15 to-[#10233F]/8 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Section Header */}
      <Reveal direction="up" className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF3DD] border border-[#EFC988] text-[#89190E] text-xs font-mono font-bold tracking-widest uppercase mb-3 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#89190E] animate-pulse" />
          <span>Contact Us</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10233F] tracking-tight">
          We&apos;re here to help!
        </h2>
        <p className="text-sm sm:text-base text-[#526174] mt-2.5 max-w-xl mx-auto leading-relaxed">
          Reach our central admissions cell, academic governance directorate, or plan a walkthrough at our institute.
        </p>
      </Reveal>

      {/* 3 Unified High-End Cards (All with matching white luxury styling & rich micro-animations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">

        {/* ── CARD 1: Customer Support ───────────────────────────────── */}
        <Reveal direction="up" delay={0} className="h-full">
          <TiltCard intensity={6} glare shine className="h-full rounded-3xl">
            <div className="bg-white/95 backdrop-blur-md border border-[#E8DCCB] rounded-3xl p-7 sm:p-8 lg:p-9 shadow-[0_10px_35px_rgba(16,35,63,0.06)] hover:shadow-[0_25px_60px_rgba(137,25,14,0.12)] hover:border-[#89190E] transition-all duration-400 h-full flex flex-col justify-between relative overflow-hidden group">
              
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#10233F]" />

              {/* Decorative Background Watermark Icon */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 text-[#89190E]/5 pointer-events-none group-hover:scale-125 group-hover:text-[#89190E]/10 transition-all duration-700 select-none">
                <Phone className="w-full h-full stroke-[1.2]" />
              </div>

              <div>
                {/* Header row: Icon + Live Status */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-[#FFF3DD] text-[#89190E] border border-[#EFC988]/60 flex items-center justify-center flex-shrink-0 group-hover:bg-[#89190E] group-hover:text-white group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-xs">
                    <Phone className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Helpline Live</span>
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-serif text-2xl font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors leading-tight mb-3">
                  Customer Support
                </h3>

                {/* Phone Display with Quick Copy & Call Action */}
                <div className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] group-hover:border-[#EFC988] transition-colors flex items-center justify-between gap-2 mb-4">
                  <a
                    href="tel:+917986313013"
                    className="font-serif text-lg sm:text-xl font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors tracking-wide flex items-center gap-2 hover:underline"
                    title="Click to Call"
                  >
                    <span>{phoneDisplay}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(phoneDisplay, 'phone')}
                    className="p-2 rounded-xl bg-white hover:bg-[#89190E] hover:text-white text-[#526174] border border-[#E8DCCB] transition-all cursor-pointer shadow-2xs relative"
                    title="Copy phone number"
                    aria-label="Copy phone number"
                  >
                    {copiedKey === 'phone' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedKey === 'phone' && (
                      <span className="absolute -top-8 right-0 bg-[#10233F] text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap animate-fadeIn shadow-md">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-[13px] text-[#526174] leading-relaxed mb-6">
                  Direct line for admissions, batch schedules, syllabus walk-throughs, fee consultations, and 1-on-1 counselor guidance.
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-5 border-t border-[#E8DCCB]/70 flex flex-col sm:flex-row items-center gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 h-11 px-4 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:bg-[#05463e] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 fill-white flex-shrink-0"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.031 2C6.498 2 2 6.497 2 12.032c0 1.996.586 3.864 1.6 5.438L2 22l4.673-1.562a10.007 10.007 0 0 0 5.358 1.564h.005c5.531 0 10.029-4.498 10.029-10.032 0-2.68-1.043-5.2-2.935-7.093A9.96 9.96 0 0 0 12.031 2Zm0 18.361h-.004a8.318 8.318 0 0 1-4.24-1.163l-.304-.18-3.155 1.054 1.073-3.076-.197-.315a8.324 8.324 0 0 1-1.278-4.45c0-4.606 3.748-8.354 8.356-8.354 2.232 0 4.33.87 5.908 2.45a8.293 8.293 0 0 1 2.446 5.904c0 4.608-3.748 8.356-8.36 8.356Zm4.582-6.257c-.251-.126-1.487-.734-1.718-.817-.23-.084-.397-.126-.565.126-.168.251-.649.817-.796.985-.147.168-.293.189-.544.063-.251-.126-1.06-.391-2.02-1.246-.746-.665-1.25-1.488-1.397-1.74-.146-.251-.016-.387.11-.512.113-.112.251-.293.376-.44.126-.147.168-.252.252-.42.083-.168.042-.314-.021-.44-.063-.125-.565-1.362-.774-1.865-.204-.49-.411-.423-.565-.431l-.481-.008c-.168 0-.44.063-.67.314-.23.252-.88.86-.88 2.096 0 1.237.901 2.431 1.026 2.599.126.168 1.773 2.707 4.296 3.796.6.26 1.068.415 1.433.531.602.191 1.15.164 1.583.1.482-.072 1.487-.608 1.696-1.194.21-.587.21-1.09.147-1.195-.063-.105-.23-.167-.481-.293Z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href="tel:+917986313013"
                  className="w-full sm:w-auto h-11 px-4 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] hover:text-white text-[#10233F] border border-[#E8DCCB] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Direct Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>

            </div>
          </TiltCard>
        </Reveal>

        {/* ── CARD 2: Contact Mail ───────────────────────────────────── */}
        <Reveal direction="up" delay={100} className="h-full">
          <TiltCard intensity={6} glare shine className="h-full rounded-3xl">
            <div className="bg-white/95 backdrop-blur-md border border-[#E8DCCB] rounded-3xl p-7 sm:p-8 lg:p-9 shadow-[0_10px_35px_rgba(16,35,63,0.06)] hover:shadow-[0_25px_60px_rgba(137,25,14,0.12)] hover:border-[#89190E] transition-all duration-400 h-full flex flex-col justify-between relative overflow-hidden group">
              
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#10233F]" />

              {/* Decorative Background Watermark Icon */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 text-[#89190E]/5 pointer-events-none group-hover:scale-125 group-hover:text-[#89190E]/10 transition-all duration-700 select-none">
                <Mail className="w-full h-full stroke-[1.2]" />
              </div>

              <div>
                {/* Header row: Icon + Status */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-[#FFF3DD] text-[#89190E] border border-[#EFC988]/60 flex items-center justify-center flex-shrink-0 group-hover:bg-[#89190E] group-hover:text-white group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-xs">
                    <Mail className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Monitored Inbox</span>
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-serif text-2xl font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors leading-tight mb-3">
                  Contact Mail
                </h3>

                {/* Email Display with Quick Copy & Email Action */}
                <div className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] group-hover:border-[#EFC988] transition-colors flex items-center justify-between gap-2 mb-4">
                  <a
                    href="mailto:info@msiinstitutes.com"
                    className="font-serif text-sm sm:text-base font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors truncate hover:underline"
                    title="Click to Compose Email"
                  >
                    <span>{emailDisplay}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(emailDisplay, 'email')}
                    className="p-2 rounded-xl bg-white hover:bg-[#89190E] hover:text-white text-[#526174] border border-[#E8DCCB] transition-all cursor-pointer shadow-2xs relative flex-shrink-0"
                    title="Copy email address"
                    aria-label="Copy email address"
                  >
                    {copiedKey === 'email' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedKey === 'email' && (
                      <span className="absolute -top-8 right-0 bg-[#10233F] text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap animate-fadeIn shadow-md">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-[13px] text-[#526174] leading-relaxed mb-6">
                  Official correspondence for corporate affiliations, judicial scholarship records, faculty recruitment, and institutional verification.
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-5 border-t border-[#E8DCCB]/70 flex flex-col sm:flex-row items-center gap-2.5">
                <a
                  href="mailto:info@msiinstitutes.com"
                  className="w-full sm:flex-1 h-11 px-4 rounded-xl bg-[#89190E] hover:bg-[#65130D] active:bg-[#500e09] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </a>

                {onOpenEnquiry ? (
                  <button
                    type="button"
                    onClick={onOpenEnquiry}
                    className="w-full sm:w-auto h-11 px-4 rounded-xl bg-[#FFF9EF] hover:bg-[#10233F] hover:text-white text-[#10233F] border border-[#E8DCCB] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Quick Form</span>
                  </button>
                ) : (
                  <a
                    href="#contact-form"
                    className="w-full sm:w-auto h-11 px-4 rounded-xl bg-[#FFF9EF] hover:bg-[#10233F] hover:text-white text-[#10233F] border border-[#E8DCCB] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Quick Form</span>
                  </a>
                )}
              </div>

            </div>
          </TiltCard>
        </Reveal>

        {/* ── CARD 3: Main Office Address ────────────────────────────── */}
        <Reveal direction="up" delay={200} className="h-full">
          <TiltCard intensity={6} glare shine className="h-full rounded-3xl">
            <div className="bg-white/95 backdrop-blur-md border border-[#E8DCCB] rounded-3xl p-7 sm:p-8 lg:p-9 shadow-[0_10px_35px_rgba(16,35,63,0.06)] hover:shadow-[0_25px_60px_rgba(137,25,14,0.12)] hover:border-[#89190E] transition-all duration-400 h-full flex flex-col justify-between relative overflow-hidden group">
              
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#10233F]" />

              {/* Decorative Background Watermark Icon */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 text-[#89190E]/5 pointer-events-none group-hover:scale-125 group-hover:text-[#89190E]/10 transition-all duration-700 select-none">
                <MapPin className="w-full h-full stroke-[1.2]" />
              </div>

              <div>
                {/* Header row: Icon + Status */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-[#FFF3DD] text-[#89190E] border border-[#EFC988]/60 flex items-center justify-center flex-shrink-0 group-hover:bg-[#89190E] group-hover:text-white group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-xs">
                    <MapPin className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                    <Compass className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>Open Mon – Sat</span>
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-serif text-2xl font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors leading-tight mb-3">
                  Main Office Address
                </h3>

                {/* Address Display Box with Copy Button */}
                <div className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] group-hover:border-[#EFC988] transition-colors flex items-start justify-between gap-2.5 mb-4">
                  <p className="text-xs sm:text-[13px] text-[#10233F] font-semibold leading-relaxed">
                    1st, 2nd and 3rd floor, Monga City Centre, Sco 12-13, Kharar - Landran Rd, Sector 115, Sahibzada Ajit Singh Nagar, Punjab 140307, India
                  </p>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(addressDisplay, 'address')}
                    className="p-2 rounded-xl bg-white hover:bg-[#89190E] hover:text-white text-[#526174] border border-[#E8DCCB] transition-all cursor-pointer shadow-2xs relative flex-shrink-0 mt-0.5"
                    title="Copy full address"
                    aria-label="Copy full address"
                  >
                    {copiedKey === 'address' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedKey === 'address' && (
                      <span className="absolute -top-8 right-0 bg-[#10233F] text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap animate-fadeIn shadow-md">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-[13px] text-[#526174] leading-relaxed mb-6">
                  Spanning 3 executive floors featuring advanced moot courtrooms, legal research archives, digital testing labs, and seminar theaters.
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-5 border-t border-[#E8DCCB]/70 flex flex-col sm:flex-row items-center gap-2.5">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 h-11 px-4 rounded-xl bg-[#10233F] hover:bg-[#89190E] active:bg-[#65130D] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#EFC988]" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => copyToClipboard(addressDisplay, 'address')}
                  className="w-full sm:w-auto h-11 px-4 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] hover:text-white text-[#10233F] border border-[#E8DCCB] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Address</span>
                </button>
              </div>

            </div>
          </TiltCard>
        </Reveal>

      </div>
    </section>
  );
}
