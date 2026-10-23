'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import EnquiryModal from '@/components/modals/EnquiryModal';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import ContactCardsSection from '@/components/contact/ContactCardsSection';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Train,
  Car,
  ArrowRight,
  Navigation,
} from 'lucide-react';

const officeHours = [
  { day: 'Monday – Friday', hours: '9:00 AM – 6:00 PM', note: 'All Departments' },
  { day: 'Saturday', hours: '9:00 AM – 2:00 PM', note: 'Admissions only' },
  { day: 'Sunday', hours: 'Closed', note: 'Helpline: +91 96342 99858' },
];


export default function ContactPage() {
  const router = useRouter();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: 'PCS J — Punjab Civil Judge Coaching',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.phone,
          targetCourse: formData.program,
          source: 'Contact Page Inquiry',
          location: 'Website Contact',
          notes: formData.message || `Contact page query: ${formData.email}`,
        }),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('msi_leads_sync'));
      }
    } catch (err) {
      console.warn('Could not save contact lead:', err);
    }
    router.push(
      `/thank-you?name=${encodeURIComponent(formData.name)}&course=${encodeURIComponent(
        formData.program
      )}&phone=${encodeURIComponent(formData.phone)}`
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF9EF] text-[#10233F] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      <Navbar onOpenEnquiry={() => setIsEnquiryOpen(true)} />

      <main className="flex-grow">
        {/* Page Hero */}
        <PageHero
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Admissions & Contact Desk' },
          ]}
          eyebrow="Get in Touch"
          title="Contact & Admissions Portal"
          subtitle="Have questions regarding program eligibility, scholarships, or institute facilities? Our admissions counselors are available Monday through Saturday."
          bgImage="/images/hero-1.webp"
          className="pt-24 sm:pt-28"
        >
          <button
            onClick={() => setIsEnquiryOpen(true)}
            className="h-12 px-6 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-sm flex items-center space-x-2 transition-all shadow-md"
          >
            <span>Quick Enquiry Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </PageHero>

        <div className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20">

          {/* Unified High-End Contact Cards Section (Matching Colors, 3D Tilt & Micro-animations) */}
          <ContactCardsSection onOpenEnquiry={() => setIsEnquiryOpen(true)} />

          {/* Form + Sidebar */}
          <Reveal direction="up" className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Contact Form */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DCCB] shadow-lg">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#89190E] block mb-1">Direct Inquiry</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F]">Send Us a Message</h2>
                  <p className="text-xs sm:text-sm text-[#526174] mt-1">
                    Fill in your details below and our program counselor will reach out directly.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Aryan Sharma"
                        className="w-full h-11 px-4 bg-[#FFF9EF] border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="aryan@gmail.com"
                        className="w-full h-11 px-4 bg-[#FFF9EF] border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                        Mobile Number (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full h-11 px-4 bg-[#FFF9EF] border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                        Program of Interest *
                      </label>
                      <select
                        value={formData.program}
                        onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                        className="w-full h-11 px-4 bg-[#FFF9EF] border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E]/20 transition-all"
                      >
                        <option value="PCS J — Punjab Civil Judge Coaching">PCS J — Punjab Civil Judge Coaching</option>
                        <option value="CLAT & AILET — Law Entrance Coaching">CLAT & AILET — Law Entrance Coaching</option>
                        <option value="PU Law Entrance Exam Coaching">PU Law Entrance Exam Coaching</option>
                        <option value="CLAT — 5 Year Integrated Law (NLUs)">CLAT — 5 Year Integrated Law (NLUs)</option>
                        <option value="UGC NET — Law (Paper 1 & Paper 2)">UGC NET — Law (Paper 1 & Paper 2)</option>
                        <option value="AIBE & Judicial Foundation">AIBE & Judicial Foundation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#10233F] uppercase tracking-wider mb-1.5">
                      Your Query or Career Goals
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your educational background and questions regarding admissions..."
                      className="w-full p-4 bg-[#FFF9EF] border border-[#E8DCCB] rounded-xl text-sm focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E]/20 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-sm rounded-xl transition-all btn-hover-lift flex items-center justify-center space-x-2 cursor-pointer shadow-md hover:shadow-lg"
                  >
                    <span>Submit Now</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                {/* Office Hours */}
                <div className="bg-white rounded-3xl p-8 border border-[#E8DCCB] shadow-md">
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF3DD] flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#89190E]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#89190E] block">Operating Hours</span>
                      <h3 className="font-serif text-lg font-bold text-[#10233F]">Office Timings</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {officeHours.map((h, i) => (
                      <div key={i} className={`flex justify-between items-start text-xs rounded-2xl px-4 py-3 ${i === 2 ? 'bg-[#FFF9EF] border border-[#E8DCCB]' : 'bg-[#FFF3DD]/60'}`}>
                        <div>
                          <span className="font-bold text-[#10233F] block">{h.day}</span>
                          <span className="text-[#526174]">{h.note}</span>
                        </div>
                        <span className={`font-bold flex-shrink-0 ml-3 ${i === 2 ? 'text-[#526174]' : 'text-[#89190E]'}`}>{h.hours}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEnquiryOpen(true)}
                    className="w-full mt-5 h-11 bg-[#FFF3DD] hover:bg-[#89190E] hover:text-white text-[#89190E] rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Schedule Institute Walkthrough</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Map Section */}
          <Reveal direction="up">
            <div className="rounded-3xl overflow-hidden border border-[#E8DCCB] shadow-xl">
              {/* Map placeholder styled consistently */}
              <div className="bg-gradient-to-br from-[#10233F] to-[#1c355e] h-[320px] sm:h-[400px] relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />
                <div className="relative z-10 text-center text-white">
                  <div className="w-16 h-16 rounded-2xl bg-[#89190E] flex items-center justify-center mx-auto mb-4 animate-pulse-beacon">
                    <Navigation className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2">Find Us at MSI Institute</h3>
                  <p className="text-white/80 text-sm mb-6 max-w-xl mx-auto leading-relaxed">
                    1st, 2nd & 3rd Floor, Monga City Centre, SCO 12-13, Kharar - Landran Rd, Sector 115, Sahibzada Ajit Singh Nagar, Punjab 140307
                  </p>
                  <a
                    href="https://maps.google.com/?q=Monga+City+Centre+Kharar+Landran+Road+Sector+115+Sahibzada+Ajit+Singh+Nagar+Punjab+140307"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 h-11 px-6 bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-sm rounded-xl transition-all shadow-md"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Bottom info strip */}
              <div className="bg-white border-t border-[#E8DCCB] px-6 sm:px-10 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center space-x-2.5 text-[#526174]">
                  <Car className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                  <span><span className="font-bold text-[#10233F]">By Road:</span> Kharar - Landran Road (Sector 115)</span>
                </div>
                <div className="flex items-center space-x-2.5 text-[#526174]">
                  <MapPin className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                  <span><span className="font-bold text-[#10233F]">Landmark:</span> Monga City Centre, SCO 12-13</span>
                </div>
                <div className="flex items-center space-x-2.5 text-[#526174]">
                  <Phone className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                  <span><span className="font-bold text-[#10233F]">Direct Desk:</span> +91 79863 13013 / info@msiinstitutes.com</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
      <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />
    </div>
  );
}
