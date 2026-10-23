'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: string;
}

export default function EnquiryModal({ isOpen, onClose, initialCourse }: EnquiryModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'PCS J — Punjab Civil Judge Coaching',
    message: '',
  });

  useEffect(() => {
    if (initialCourse) {
      setFormData((prev) => ({ ...prev, course: initialCourse }));
    }
  }, [initialCourse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.phone,
          targetCourse: formData.course,
          source: 'Website Enquiry Modal',
          location: 'Website Lead',
          notes: formData.message || `Submitted online admission enquiry for ${formData.course}`,
        }),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('msi_leads_sync'));
      }
    } catch (err) {
      console.warn('Could not save enquiry lead:', err);
    }
    onClose();
    router.push(
      `/thank-you?name=${encodeURIComponent(formData.name)}&course=${encodeURIComponent(
        formData.course
      )}&phone=${encodeURIComponent(formData.phone)}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10233F]/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#FFF9EF] border border-[#E8DCCB] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
      >
        {/* Top Decorative Maroon Band */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#89190E]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#526174] hover:text-[#89190E] hover:bg-[#FFF3DD] rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 relative flex-shrink-0">
            <Image
              src="/images/msi-crest.png"
              alt="MSI Crest"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h3 id="enquiry-title" className="font-serif text-2xl font-bold text-[#10233F]">
              Admissions Enquiry
            </h3>
            <p className="text-xs text-[#526174]">
              MSI Group of Institutes — Shape Your Tomorrow
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#10233F] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-[#E8DCCB] rounded-xl text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#10233F] uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E8DCCB] rounded-xl text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#10233F] uppercase tracking-wider mb-1">
                Mobile Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E8DCCB] rounded-xl text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10233F] uppercase tracking-wider mb-1">
              Program of Interest *
            </label>
            <select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-[#E8DCCB] rounded-xl text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E] transition-all"
            >
              <option value="PCS J — Punjab Civil Judge Coaching">PCS J — Punjab Civil Judge Coaching</option>
              <option value="CLAT & AILET — Law Entrance Coaching">CLAT & AILET — Law Entrance Coaching</option>
              <option value="PU Law Entrance Exam Coaching">PU Law Entrance Exam Coaching</option>
              <option value="UGC NET — Law (Paper 1 & Paper 2)">UGC NET — Law (Paper 1 & Paper 2)</option>
              <option value="HPS J — Himachal Pradesh Judicial Services">HPS J — Himachal Pradesh Judicial Services</option>
              <option value="LLM Entrance Coaching (NLU & State Universities)">LLM Entrance Coaching (NLU & State Universities)</option>
              <option value="CLAT — 5 Year Integrated Law (NLUs)">CLAT — 5 Year Integrated Law (NLUs)</option>
              <option value="AIBE & Judicial Foundation">AIBE & Judicial Foundation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10233F] uppercase tracking-wider mb-1">
              Queries or Career Goals
            </label>
            <textarea
              rows={2}
              placeholder="Tell us about your educational background..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-[#E8DCCB] rounded-xl text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-[#89190E] hover:bg-[#65130D] text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Submit Now</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
