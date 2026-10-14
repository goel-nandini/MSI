'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import EnquiryModal from '@/components/modals/EnquiryModal';

export default function FloatingActionDock() {
  const pathname = usePathname();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  // Do not show on internal dashboard / portal routes
  const isPortal =
    pathname?.startsWith('/reception') ||
    pathname?.startsWith('/student') ||
    pathname?.startsWith('/teacher');

  if (isPortal) return null;

  const institutePhone = '+919634299858';
  const displayPhone = '+91 96342 99858';
  const whatsappUrl = `https://wa.me/919634299858?text=${encodeURIComponent(
    'Hello MSI Admissions Team, I want to enquire about courses, eligibility and admissions.'
  )}`;

  return (
    <>
      <aside
        aria-label="Quick Contact & Enquiry"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-auto select-none"
      >
        {/* 1. ENQUIRE NOW Vertical Tab — Matches Navbar Crimson #89190E & Gold #EFC988 */}
        <button
          type="button"
          onClick={() => setIsEnquiryOpen(true)}
          className="group relative flex items-center justify-center bg-[#89190E] hover:bg-[#65130D] active:bg-[#520f0a] text-[#FFF9EF] px-2 sm:px-2.5 py-4 sm:py-5 rounded-l-xl border-l-2 border-y border-[#EFC988]/70 shadow-[-4px_4px_16px_rgba(137,25,14,0.38)] transition-all duration-300 hover:pr-3.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#89190E]/60"
          style={{ writingMode: 'vertical-rl' }}
          aria-label="Enquire Now - Admissions"
          title="Click to Open Enquiry Form"
        >
          <span className="font-sans font-extrabold text-[11px] sm:text-xs tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-sm transition-transform duration-200 group-hover:scale-105">
            ENQUIRE NOW
          </span>
        </button>

        {/* 2. WhatsApp Circular Button — Authentic Dark Green #128C7E / #075E54 */}
        <div className="relative group mr-1 sm:mr-1.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white flex items-center justify-center border-2 border-white/80 hover:border-white shadow-[-2px_4px_14px_rgba(18,140,126,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#25D366]/60"
            aria-label="Chat with MSI on WhatsApp"
          >
            {/* Official WhatsApp SVG Icon */}
            <svg
              className="w-6 h-6 fill-white transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.031 2C6.498 2 2 6.497 2 12.032c0 1.996.586 3.864 1.6 5.438L2 22l4.673-1.562a10.007 10.007 0 0 0 5.358 1.564h.005c5.531 0 10.029-4.498 10.029-10.032 0-2.68-1.043-5.2-2.935-7.093A9.96 9.96 0 0 0 12.031 2Zm0 18.361h-.004a8.318 8.318 0 0 1-4.24-1.163l-.304-.18-3.155 1.054 1.073-3.076-.197-.315a8.324 8.324 0 0 1-1.278-4.45c0-4.606 3.748-8.354 8.356-8.354 2.232 0 4.33.87 5.908 2.45a8.293 8.293 0 0 1 2.446 5.904c0 4.608-3.748 8.356-8.36 8.356Zm4.582-6.257c-.251-.126-1.487-.734-1.718-.817-.23-.084-.397-.126-.565.126-.168.251-.649.817-.796.985-.147.168-.293.189-.544.063-.251-.126-1.06-.391-2.02-1.246-.746-.665-1.25-1.488-1.397-1.74-.146-.251-.016-.387.11-.512.113-.112.251-.293.376-.44.126-.147.168-.252.252-.42.083-.168.042-.314-.021-.44-.063-.125-.565-1.362-.774-1.865-.204-.49-.411-.423-.565-.431l-.481-.008c-.168 0-.44.063-.67.314-.23.252-.88.86-.88 2.096 0 1.237.901 2.431 1.026 2.599.126.168 1.773 2.707 4.296 3.796.6.26 1.068.415 1.433.531.602.191 1.15.164 1.583.1.482-.072 1.487-.608 1.696-1.194.21-.587.21-1.09.147-1.195-.063-.105-.23-.167-.481-.293Z" />
            </svg>
          </a>
          {/* Tooltip on Desktop hover */}
          <div className="hidden group-hover:block absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-[#075E54] text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-white/20 animate-fadeIn">
            WhatsApp Admissions
            <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-[#075E54]" />
          </div>
        </div>

        {/* 3. Call Circular Button — Matching Dark Green #128C7E / #075E54 */}
        <div className="relative group mr-1 sm:mr-1.5">
          <a
            href={`tel:${institutePhone}`}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white flex items-center justify-center border-2 border-white/80 hover:border-white shadow-[-2px_4px_14px_rgba(18,140,126,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#25D366]/60"
            aria-label="Call MSI Admissions Helpline"
          >
            <Phone className="w-5 h-5 fill-white text-white rotate-[-15deg] transition-transform group-hover:rotate-0" />
          </a>
          {/* Tooltip on Desktop hover */}
          <div className="hidden group-hover:block absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-[#075E54] text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-white/20 animate-fadeIn">
            Call: {displayPhone}
            <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-[#075E54]" />
          </div>
        </div>
      </aside>

      {/* Floating Action Dock's Integrated Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </>
  );
}
