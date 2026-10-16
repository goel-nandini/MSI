'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  Star,
  Clock,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  FileText,
  Award,
  Globe,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  UserCheck,
  Smartphone,
  Lock,
} from 'lucide-react';
import {
  UdemyCourse,
  enrollStudentAction,
  getStoredEnrollments,
} from '@/lib/lmsStore';
import RazorpayCheckoutModal, { RazorpayPaymentSuccessInfo } from '@/components/payments/RazorpayCheckoutModal';
import StudentEnrollLoginModal from '@/components/courses/StudentEnrollLoginModal';

interface UdemyCourseModalProps {
  course: UdemyCourse | null;
  isOpen: boolean;
  onClose: () => void;
  activeStudentId?: string;
  onEnrollSuccess?: (course: UdemyCourse) => void;
  onRequireLogin?: (course: UdemyCourse) => void;
}

export default function UdemyCourseModal({
  course,
  isOpen,
  onClose,
  activeStudentId = 'msi-stu-001',
  onEnrollSuccess,
  onRequireLogin,
}: UdemyCourseModalProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'sec-1': true,
    'sec-clat-1': true,
    'sec-bnss-1': true,
    'sec-cyber-1': true,
  });
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [enrolledNotice, setEnrolledNotice] = useState(false);
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!isOpen || !course) return null;

  // Check login status
  const isStudentLoggedIn = () => {
    if (typeof window === 'undefined') return false;
    const loggedIn = localStorage.getItem('msi_student_logged_in') === 'true';
    const phone = localStorage.getItem('msi_active_student_phone');
    return loggedIn && !!phone;
  };

  // Check if currently enrolled
  const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_phone') || '' : '';
  const cleanPhone = storedPhone.replace(/\D/g, '').slice(-10);
  const enrollments = getStoredEnrollments();
  const isEnrolled = enrollments.some((e) => {
    if (e.courseId !== course.id) return false;
    if (e.studentId === activeStudentId) return true;
    if (cleanPhone && (e.studentPhone === cleanPhone || e.studentId.includes(cleanPhone) || e.studentId === `msi-stu-${cleanPhone.slice(-4)}`)) return true;
    return false;
  });

  const toggleSection = (secId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const handleEnroll = () => {
    if (!isStudentLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    setShowRazorpayCheckout(true);
  };

  const handleLoginEnrollSuccess = (c: UdemyCourse, studentData: { name: string; phone: string }) => {
    setShowLoginModal(false);
    setShowRazorpayCheckout(true);
  };

  const handleRazorpaySuccess = (info: RazorpayPaymentSuccessInfo) => {
    const studentPhone = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_phone') || '' : '';
    const studentName = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_name') || 'Student' : 'Student';
    const cleanPh = studentPhone.replace(/\D/g, '').slice(-10);
    const stuId = cleanPh ? `msi-stu-${cleanPh.slice(-4)}` : activeStudentId;

    enrollStudentAction(stuId, course.id, 'self', studentName, 'Purchased via Razorpay', cleanPh, studentName);
    setEnrolledNotice(true);
    if (onEnrollSuccess) {
      onEnrollSuccess(course);
    }
  };

  const handleGoToCourse = () => {
    onClose();
    router.push('/student/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#10233F]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Shell */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-[#E8DCCB] my-8 max-h-[92vh] flex flex-col">
        
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* 1. Dark Top Banner (Udemy Style) */}
          <div className="bg-gradient-to-r from-[#10233F] via-[#1a345c] to-[#10233F] text-white p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#EFC988]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#EFC988] bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  {course.category}
                </span>
                {course.badge && (
                  <span className="text-xs font-bold uppercase tracking-wider text-[#10233F] bg-[#EFC988] px-3 py-1 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{course.badge}</span>
                  </span>
                )}
                <span className="text-xs text-white/70">
                  Updated {course.updatedDate}
                </span>
              </div>

              {/* Title & Headline */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3">
                {course.title}
              </h1>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed mb-4">
                {course.headline}
              </p>

              {/* Ratings & Metadata Strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-200">
                <div className="flex items-center space-x-1.5 text-[#EFC988] font-bold">
                  <span>{course.rating.toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(course.rating)
                            ? 'fill-[#EFC988] text-[#EFC988]'
                            : 'text-[#EFC988]/40'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/70 font-normal">
                    ({course.reviewCount.toLocaleString()} ratings)
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-white/90">
                  <UserCheck className="w-4 h-4 text-[#EFC988]" />
                  <span>Created by <strong className="underline text-white">{course.instructorName}</strong></span>
                </div>

                <div className="flex items-center space-x-1 text-white/80">
                  <Globe className="w-4 h-4 text-[#EFC988]" />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Main Content Grid (Left details, Right sticky enrollment card) */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Overview, What you learn, Curriculum */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Enrollment Success Notice */}
              {enrolledNotice && (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Successfully Enrolled in Course!</h4>
                      <p className="text-xs text-emerald-800">
                        This course is now in your active Student Portal & Learning Hub.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGoToCourse}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <span>Launch Learning Player</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* What You'll Learn (Udemy iconic 2-column box) */}
              <div className="p-6 rounded-3xl border-2 border-[#E8DCCB] bg-[#FFF9EF]/60">
                <h3 className="font-serif text-xl font-bold text-[#10233F] mb-4 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#89190E]" />
                  <span>What you&apos;ll learn</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs text-[#10233F] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Curriculum Breakdown */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8DCCB] mb-4 gap-2">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#10233F]">
                      Course content
                    </h3>
                    <p className="text-xs text-[#526174] mt-0.5">
                      {course.sections.length} sections • {course.totalLectures} lectures • {course.totalDuration}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const allOpen = Object.values(expandedSections).every(Boolean);
                      const updated: Record<string, boolean> = {};
                      course.sections.forEach((s) => {
                        updated[s.id] = !allOpen;
                      });
                      setExpandedSections(updated);
                    }}
                    className="text-xs font-bold text-[#89190E] hover:underline self-start sm:self-auto cursor-pointer"
                  >
                    Toggle all sections
                  </button>
                </div>

                {/* Sections Accordion */}
                <div className="space-y-3">
                  {course.sections.map((section, sIdx) => {
                    const isOpen = expandedSections[section.id] ?? false;
                    return (
                      <div
                        key={section.id}
                        className="rounded-2xl border border-[#E8DCCB] overflow-hidden bg-white shadow-2xs"
                      >
                        {/* Section Header */}
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="w-full px-5 py-4 bg-[#FFF9EF] hover:bg-[#FFF3DD]/60 flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-[#89190E]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#526174]" />
                            )}
                            <span className="font-bold text-xs sm:text-sm text-[#10233F]">
                              {section.title}
                            </span>
                          </div>
                          <span className="text-xs text-[#526174] font-mono">
                            {section.lectures.length} lectures • {section.duration}
                          </span>
                        </button>

                        {/* Lectures inside Section */}
                        {isOpen && (
                          <div className="divide-y divide-[#E8DCCB]/60 bg-white">
                            {section.lectures.map((lecture) => (
                              <div
                                key={lecture.id}
                                className="px-5 py-3.5 flex items-center justify-between hover:bg-[#FFF9EF]/40 transition-colors"
                              >
                                <div className="flex items-center space-x-3 min-w-0 pr-4">
                                  <PlayCircle className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-xs font-medium text-[#10233F] block truncate">
                                      {lecture.title}
                                    </span>
                                    {lecture.summary && (
                                      <span className="text-[11px] text-[#526174] block truncate">
                                        {lecture.summary}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 flex-shrink-0">
                                  {lecture.preview && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewVideoUrl(lecture.videoUrl)}
                                      className="text-[11px] font-bold text-[#89190E] bg-[#FFF3DD] hover:bg-[#89190E] hover:text-white px-2.5 py-1 rounded-md transition-all cursor-pointer"
                                    >
                                      Preview
                                    </button>
                                  )}
                                  <span className="text-xs font-mono text-[#526174]">
                                    {lecture.duration}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirements & Description */}
              <div className="space-y-4 pt-4 border-t border-[#E8DCCB]">
                <h3 className="font-serif text-lg font-bold text-[#10233F]">Requirements</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#526174]">
                  {course.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>

                <h3 className="font-serif text-lg font-bold text-[#10233F] pt-2">Description</h3>
                <p className="text-xs sm:text-sm text-[#526174] leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Instructor Bio */}
              <div className="p-6 rounded-3xl bg-[#FFF9EF] border border-[#E8DCCB] space-y-3">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#89190E] uppercase">
                  Lead Instructor
                </span>
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#E8DCCB] bg-white">
                    <Image
                      src={course.instructorAvatar}
                      alt={course.instructorName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#10233F]">
                      {course.instructorName}
                    </h4>
                    <p className="text-xs text-[#526174]">{course.instructorTitle}</p>
                    <div className="flex items-center space-x-3 text-xs mt-1">
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Faculty</span>
                      </span>
                      <span className="text-[#526174] font-mono">4.9 ★ Instructor Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Enrollment Box (Udemy Card) */}
            <div>
              <div className="bg-white rounded-3xl border-2 border-[#E8DCCB] shadow-xl p-6 sticky top-6 space-y-6">
                
                {/* Course Banner Thumbnail with Play overlay */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#E8DCCB] group">
                  <Image
                    src={course.thumbnail || '/images/courses/clat.jpg'}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target && !target.src.includes('clat.jpg')) {
                        target.srcset = '';
                        target.src = '/images/courses/clat.jpg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setPreviewVideoUrl(course.sections[0]?.lectures[0]?.videoUrl || null)}
                      className="w-14 h-14 rounded-full bg-white/90 text-[#89190E] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                    >
                      <PlayCircle className="w-8 h-8 fill-[#89190E] text-white" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/70 px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                    Watch Free Preview
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline space-x-3">
                    <span className="font-serif text-3xl font-extrabold text-[#10233F]">
                      ₹{course.price.toLocaleString()}
                    </span>
                    <span className="text-sm line-through text-[#526174]">
                      ₹{course.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% off
                    </span>
                  </div>

                  {course.isFreeForMsiStudents && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#FFF3DD] border border-[#EFC988] text-[11px] text-[#89190E] font-medium flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#89190E] flex-shrink-0" />
                      <span><strong>100% Free</strong> for enrolled MSI Students with Institutional ID.</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  {isEnrolled ? (
                    <button
                      type="button"
                      onClick={handleGoToCourse}
                      className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Already Enrolled • Launch Player</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnroll}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#89190E] hover:bg-[#6e140b] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/25 hover:shadow-xl hover:shadow-[#89190E]/35 active:scale-[0.98] cursor-pointer"
                    >
                      <span>Enroll Now (Instant Access)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <p className="text-[11px] text-center text-[#526174]">
                    30-Day Full Curriculum Guarantee • Lifetime Academic Access
                  </p>
                </div>

                {/* Course Includes List */}
                <div className="pt-4 border-t border-[#E8DCCB] space-y-2.5 text-xs text-[#10233F]">
                  <span className="font-bold block text-[#10233F] uppercase tracking-wider text-[11px]">
                    This course includes:
                  </span>
                  <div className="flex items-center space-x-2.5 text-[#526174]">
                    <Clock className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                    <span>{course.totalDuration} on-demand video</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-[#526174]">
                    <BookOpen className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                    <span>{course.totalLectures} comprehensive modules & bare act digests</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-[#526174]">
                    <Smartphone className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                    <span>Access on mobile, tablet & desktop</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-[#526174]">
                    <Award className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                    <span>Official MSI Certificate of Completion</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Video Preview Modal Popup */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full bg-black">
              <video
                src={previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-[#10233F] text-white flex items-center justify-between text-xs">
              <span className="font-semibold">Free Lecture Preview • {course.title}</span>
              <button
                onClick={() => {
                  setPreviewVideoUrl(null);
                  handleEnroll();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold"
              >
                Enroll to Unlock All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Login Required to Purchase Modal */}
      <StudentEnrollLoginModal
        isOpen={showLoginModal}
        course={course}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginEnrollSuccess}
      />

      {/* Razorpay Test Environment Sandbox Checkout Modal */}
      {showRazorpayCheckout && (
        <RazorpayCheckoutModal
          isOpen={showRazorpayCheckout}
          onClose={() => setShowRazorpayCheckout(false)}
          course={{
            id: course.id,
            title: course.title,
            price: course.price,
            originalPrice: course.originalPrice,
          }}
          studentName={
            typeof window !== 'undefined'
              ? localStorage.getItem('msi_active_student_name') || 'Student'
              : 'Student'
          }
          studentPhone={
            typeof window !== 'undefined'
              ? localStorage.getItem('msi_active_student_phone') || ''
              : ''
          }
          onPaymentSuccess={handleRazorpaySuccess}
        />
      )}
    </div>
  );
}

