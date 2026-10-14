'use client';

import React from 'react';
import Image from 'next/image';
import {
  Printer,
  X,
  ShieldCheck,
  Building2,
  User,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  Calendar,
  Phone,
  FileBadge,
} from 'lucide-react';
import { Visitor } from './data/receptionMockData';

interface VisitorPassModalProps {
  visitor: Visitor;
  onClose: () => void;
  onMarkExit?: (visitorId: string) => void;
}

export default function VisitorPassModal({
  visitor,
  onClose,
  onMarkExit,
}: VisitorPassModalProps) {
  const handlePrint = () => {
    window.print();
  };

  // Generate SVG QR Code pattern dynamically based on visitor ID
  const qrSvg = (
    <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#10233F]">
      {/* Outer corner squares */}
      <rect x="5" y="5" width="26" height="26" fill="currentColor" rx="4" />
      <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
      <rect x="13" y="13" width="10" height="10" fill="currentColor" rx="1" />

      <rect x="69" y="5" width="26" height="26" fill="currentColor" rx="4" />
      <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
      <rect x="77" y="13" width="10" height="10" fill="currentColor" rx="1" />

      <rect x="5" y="69" width="26" height="26" fill="currentColor" rx="4" />
      <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
      <rect x="13" y="77" width="10" height="10" fill="currentColor" rx="1" />

      {/* Decorative QR matrix pattern */}
      <rect x="36" y="8" width="8" height="8" fill="currentColor" />
      <rect x="48" y="14" width="6" height="12" fill="currentColor" />
      <rect x="58" y="8" width="6" height="8" fill="currentColor" />
      <rect x="36" y="22" width="12" height="6" fill="currentColor" />

      <rect x="8" y="36" width="12" height="6" fill="currentColor" />
      <rect x="24" y="44" width="8" height="14" fill="currentColor" />
      <rect x="12" y="48" width="8" height="8" fill="currentColor" />

      <rect x="38" y="38" width="24" height="24" fill="#89190E" rx="3" />
      <rect x="44" y="44" width="12" height="12" fill="white" rx="2" />

      <rect x="68" y="36" width="8" height="14" fill="currentColor" />
      <rect x="80" y="44" width="12" height="8" fill="currentColor" />
      <rect x="72" y="54" width="14" height="8" fill="currentColor" />

      <rect x="36" y="68" width="8" height="12" fill="currentColor" />
      <rect x="48" y="74" width="14" height="8" fill="currentColor" />
      <rect x="40" y="84" width="18" height="8" fill="currentColor" />
      <rect x="66" y="70" width="10" height="10" fill="currentColor" />
      <rect x="80" y="70" width="14" height="6" fill="currentColor" />
      <rect x="74" y="82" width="20" height="10" fill="currentColor" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Modal Card wrapper */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E8DCCB] shadow-2xl overflow-hidden my-auto">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3.5 bg-[#FFF9EF] border-b border-[#E8DCCB] flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#10233F]">
              Official Visitor Pass Generated
            </span>
            <span className="text-[10px] font-mono text-[#89190E] bg-[#89190E]/10 px-2 py-0.5 rounded font-bold">
              {visitor.id}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#526174] hover:text-[#10233F] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------------------- */}
        {/* PRINTABLE PASS CONTAINER (Targeted by @media print)                         */}
        {/* -------------------------------------------------------------------------- */}
        <div id="printable-visitor-pass" className="p-6 sm:p-8 bg-white selection:bg-none">
          {/* Card Frame with Gold and Crimson Border */}
          <div className="border-2 border-[#89190E] rounded-3xl p-6 sm:p-7 relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] to-[#FFF9EF]/40 shadow-lg">
            
            {/* Corner Decorative Security Watermark */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#EFC988]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#89190E]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Institute Seal and Name */}
            <div className="flex items-center justify-between border-b-2 border-[#E8DCCB] pb-4 mb-5">
              <div className="flex items-center space-x-3.5">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Image
                    src="/images/msi-crest.png"
                    alt="MSI Official Crest"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#10233F] leading-tight tracking-tight">
                    MSI
                  </h2>
                  <span className="text-xs sm:text-sm font-bold tracking-wider text-[#89190E] uppercase block">
                    GROUP OF INSTITUTES
                  </span>
                  <span className="text-[10px] text-[#526174] font-medium block mt-0.5">
                    Kharar, Mohali, Punjab • Approved by Bar Council of India &amp; AICTE
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                    visitor.status === 'Inside'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${visitor.status === 'Inside' ? 'bg-emerald-600 animate-pulse' : 'bg-stone-500'}`} />
                  <span>{visitor.status === 'Inside' ? 'ACTIVE PASS' : 'EXIT LOGGED'}</span>
                </span>
                <span className="block font-mono text-[10px] text-[#526174] mt-1">
                  Gate: {visitor.gateNumber}
                </span>
              </div>
            </div>

            {/* Title Banner */}
            <div className="bg-[#89190E] text-[#FFF9EF] text-center py-1.5 px-4 rounded-xl mb-5 flex items-center justify-between">
              <span className="font-serif font-bold text-xs tracking-wider uppercase">
                OFFICIAL VISITOR IDENTITY PASS
              </span>
              <span className="font-mono text-xs font-bold text-[#EFC988] tracking-widest">
                {visitor.id}
              </span>
            </div>

            {/* Visitor Main Details: Photo + Info Grid */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Visitor Photo Frame */}
              <div className="flex flex-col items-center flex-shrink-0 mx-auto sm:mx-0">
                <div className="relative w-32 h-36 rounded-2xl overflow-hidden border-2 border-[#10233F] shadow-md bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={visitor.photoUrl}
                    alt={visitor.name}
                    className="w-full h-full object-cover"
                  />
                  {visitor.isMobileVerified && (
                    <div className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow-sm" title="Mobile Verified">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#526174] mt-1.5">
                  ID: {visitor.govtIdType.split(' ')[0]}
                </span>
              </div>

              {/* Data Rows */}
              <div className="flex-1 w-full space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#526174] block">
                    Visitor Full Name
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#10233F]">
                    {visitor.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E] border border-[#EFC988] text-[10px] font-bold uppercase tracking-wider">
                      {visitor.visitorType}
                    </span>
                    <span className="text-xs text-[#526174] font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#89190E]" />
                      +91 {visitor.mobile}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E8DCCB]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#526174] block">
                      Purpose of Visit
                    </span>
                    <span className="text-xs font-semibold text-[#10233F] block leading-tight">
                      {visitor.purpose}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#526174] block">
                      Host Person
                    </span>
                    <span className="text-xs font-semibold text-[#89190E] block leading-tight">
                      {visitor.hostPerson}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E8DCCB]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#526174] block">
                      Department / Block
                    </span>
                    <span className="text-xs font-semibold text-[#10233F] block leading-tight">
                      {visitor.department}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#526174] block">
                      Entry Time
                    </span>
                    <span className="text-xs font-mono font-bold text-[#10233F] block">
                      {visitor.entryTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: QR Code + Barcode + Security Signature Lines */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#E8DCCB] flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* QR and Barcode */}
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-white rounded-xl border border-[#E8DCCB] shadow-xs">
                  {qrSvg}
                </div>
                <div>
                  {/* Simulated Code-128 Barcode */}
                  <div className="flex items-center space-x-0.5 h-7">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2].map((w, i) => (
                      <span
                        key={i}
                        className="bg-[#10233F] inline-block h-full"
                        style={{ width: `${w * 1.3}px` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] tracking-widest text-[#526174] uppercase block mt-1">
                    *{visitor.id}*
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex items-center space-x-6 text-center text-[10px] text-[#526174]">
                <div>
                  <div className="w-24 border-b border-[#10233F] mb-1 font-serif italic text-xs text-[#10233F]">
                    Priya V.
                  </div>
                  <span>Issuing Officer</span>
                </div>
                <div>
                  <div className="w-24 border-b border-dashed border-[#526174] mb-1 h-4" />
                  <span>Visitor Signature</span>
                </div>
              </div>
            </div>

            {/* Terms Footnote */}
            <div className="mt-4 pt-3 border-t border-[#E8DCCB] text-[9px] text-[#526174] text-center leading-relaxed">
              • Badge must be visibly pinned to outer clothing while inside MSI premises.
              • Restricted strictly to authorized host department.
              • Return badge at Security Gate upon departure to finalize official institute checkout.
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden on print) */}
        <div className="px-6 py-4 bg-[#FFF9EF] border-t border-[#E8DCCB] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-[#526174] flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Pass recorded in MSI Visitor Log Repository</span>
          </div>

          <div className="flex items-center space-x-2">
            {visitor.status === 'Inside' && onMarkExit && (
              <button
                type="button"
                onClick={() => {
                  onMarkExit(visitor.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Mark Exit Now
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-[#89190E]/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Visitor Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
