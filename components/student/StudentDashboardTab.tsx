'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  CreditCard,
  Video,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Lock,
  PlayCircle,
  PlusCircle,
  GraduationCap,
  Radio,
  Package,
  Truck,
  Download,
  FileText,
  X,
  UserCheck,
  Play,
} from 'lucide-react';
import {
  StudentProfile,
  ActiveCourse,
  TimetableClass,
  StudentNotification,
  TestItem,
} from './data/studentMockData';
import { StudentModuleTab } from './StudentSidebar';
import {
  UdemyCourse,
  CourseEnrollment,
  getStoredCourses,
  getStoredEnrollments,
  syncCoursesFromServer,
  syncEnrollmentsFromServer,
  LMS_SYNC_EVENT,
} from '@/lib/lmsStore';
import StudentActivityHeatmap from './StudentActivityHeatmap';
import { getSavedRecordedLectures, RecordedLectureItem } from '@/lib/liveStreamPeer';

interface StudentDashboardTabProps {
  student: StudentProfile;
  courses: ActiveCourse[];
  upcomingClasses: TimetableClass[];
  notifications: StudentNotification[];
  tests: TestItem[];
  onNavigateTab: (tab: StudentModuleTab) => void;
  onStartTest: (test: TestItem) => void;
  onOpenUdemyCourse?: (course: UdemyCourse) => void;
}

export default function StudentDashboardTab({
  student,
  courses,
  upcomingClasses,
  notifications,
  tests,
  onNavigateTab,
  onStartTest,
  onOpenUdemyCourse,
}: StudentDashboardTabProps) {
  const activeEnrolledCourses = courses.filter((c) => c.isEnrolled);
  const avgProgress = Math.round(
    activeEnrolledCourses.reduce((acc, c) => acc + c.progress, 0) /
      (activeEnrolledCourses.length || 1)
  );

  const availableTest = tests.find((t) => t.status === 'Available');

  // Dynamic Udemy LMS Enrollments for this student
  const [enrolledUdemyData, setEnrolledUdemyData] = useState<{
    course: UdemyCourse;
    enrollment: CourseEnrollment;
  }[]>([]);

  // Purchased Study Material & Book Kits
  const [purchasedKits, setPurchasedKits] = useState<{
    id: string;
    itemId: string;
    title: string;
    price: number;
    orderDate: string;
    receiptNumber?: string;
    status: string;
    trackingNumber: string;
  }[]>([]);

  const loadPurchasedKits = () => {
    try {
      const localKits = JSON.parse(localStorage.getItem('msi_student_purchased_kits') || '[]');
      const profileKits = (student.profile as any)?.purchasedKits || [];
      const combined = [...localKits];
      profileKits.forEach((pk: any) => {
        if (!combined.some((k) => k.id === pk.id || (k.itemId && k.itemId === pk.itemId))) {
          combined.push(pk);
        }
      });
      setPurchasedKits(combined);
    } catch (_) {}
  };

  const loadEnrolledUdemy = async () => {
    try {
      await syncCoursesFromServer();
      await syncEnrollmentsFromServer();
    } catch (_) {}

    const allCourses = getStoredCourses();
    const allEnrollments = getStoredEnrollments();
    const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_phone') || '' : '';
    const cleanPhone = (student.phone || storedPhone).replace(/\D/g, '').slice(-10);

    const studentEnrollments = allEnrollments.filter((e) => {
      const ePhone = (e.studentPhone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone && ePhone === cleanPhone) return true;
      if (student.id && e.studentId === student.id) return true;
      if (cleanPhone && (e.studentId.includes(cleanPhone) || e.studentId.endsWith(cleanPhone.slice(-4)))) return true;
      if (!cleanPhone && (e.studentId === 'msi-stu-001' || student.id === 'msi-stu-001')) return true;
      return false;
    });

    const merged = studentEnrollments
      .map((enr) => {
        const found = allCourses.find((c) => c.id === enr.courseId);
        if (!found) return null;
        return { course: found, enrollment: enr };
      })
      .filter(Boolean) as { course: UdemyCourse; enrollment: CourseEnrollment }[];

    // If no explicit enrollment but student has stream/courseTitle, auto-match their enrolled program
    if (merged.length === 0 && student.stream) {
      const streamLower = student.stream.toLowerCase();
      const matchedCourse = allCourses.find((c) => {
        const cTitleLower = c.title.toLowerCase();
        if (streamLower.includes('pcs-j') && cTitleLower.includes('pcs')) return true;
        if (streamLower.includes('clat') && cTitleLower.includes('clat')) return true;
        if (streamLower.includes('judiciary') && cTitleLower.includes('judic')) return true;
        return false;
      });
      if (matchedCourse) {
        merged.push({
          course: matchedCourse,
          enrollment: {
            studentId: student.id,
            courseId: matchedCourse.id,
            enrolledAt: 'Immediate Academic Clearance',
            progressPercentage: 15,
            completedLectureIds: [],
            assignedBy: 'super-admin',
            assignedByName: 'MSI Academic Directorate',
            assignedNote: `Admitted under ${student.stream}`,
            certificateIssued: false,
          },
        });
      }
    }

    setEnrolledUdemyData(merged);
  };

  useEffect(() => {
    loadEnrolledUdemy();
    loadPurchasedKits();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('msi_sync_channel');
        bc.onmessage = (event) => {
          if (
            event.data?.type === 'COURSE_CREATED' ||
            event.data?.type === 'COURSE_DELETED' ||
            event.data?.type === 'STUDENT_ENROLLED'
          ) {
            loadEnrolledUdemy();
          }
        };
      }
    } catch (_) {}

    const handleSync = () => {
      loadEnrolledUdemy();
      loadPurchasedKits();
    };

    window.addEventListener(LMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('msi_kits_sync', handleSync);
    return () => {
      if (bc) bc.close();
      window.removeEventListener(LMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('msi_kits_sync', handleSync);
    };
  }, [student.id, student.phone, student.stream]);

  // Live Broadcast Listener for Enrolled Courses
  const [activeLiveStream, setActiveLiveStream] = useState<{
    isLive: boolean;
    courseId?: string;
    courseTitle?: string;
    teacherName?: string;
    timestamp?: number;
  } | null>(null);
  const [dismissedLive, setDismissedLive] = useState(false);

  // Saved VOD Recordings
  const [recordedLectures, setRecordedLectures] = useState<RecordedLectureItem[]>([]);

  const loadRecordings = () => {
    setRecordedLectures(getSavedRecordedLectures());
  };

  useEffect(() => {
    loadRecordings();
    const handleStorageRecordings = () => loadRecordings();
    window.addEventListener('storage', handleStorageRecordings);
    window.addEventListener('msi_recorded_lectures_updated', handleStorageRecordings);
    return () => {
      window.removeEventListener('storage', handleStorageRecordings);
      window.removeEventListener('msi_recorded_lectures_updated', handleStorageRecordings);
    };
  }, []);

  useEffect(() => {
    const checkLiveStatus = () => {
      if (typeof window !== 'undefined') {
        const activeData = localStorage.getItem('msi_active_live_stream');
        if (activeData) {
          try {
            const parsed = JSON.parse(activeData);
            if (parsed.isLive) {
              setActiveLiveStream(parsed);
              return;
            }
          } catch {}
        }
        setActiveLiveStream(null);
      }
    };

    checkLiveStatus();

    // Cross-device Server Live Status Polling (connects Mobile <-> Laptop)
    const checkServerLiveStatus = async () => {
      try {
        const res = await fetch('/api/live-stream');
        if (!res.ok) return;
        const data = await res.json();
        if (data.isLive) {
          // Check if batch matches student's enrollment
          const isTargetCohort =
            !data.targetBatch ||
            data.targetBatch === 'All Enrolled Batches' ||
            data.targetBatch.includes('Semester V') ||
            student.batch.includes('Semester V');

          if (isTargetCohort) {
            setActiveLiveStream({
              isLive: true,
              courseId: data.courseId || 'MSI/LEGSTUDIES-/01',
              courseTitle: data.streamTitle,
              teacherName: data.teacherName,
              timestamp: data.startedAt,
            });
            setDismissedLive(false);
          }
        } else {
          setActiveLiveStream(null);
        }
      } catch {}
    };

    checkServerLiveStatus();
    const serverInterval = setInterval(checkServerLiveStatus, 2500);

    // Listen to real-time events across browser tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('msi_live_stream_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'STREAM_STARTED') {
          setActiveLiveStream(event.data);
          setDismissedLive(false);
        } else if (event.data?.type === 'STREAM_ENDED') {
          setActiveLiveStream(null);
          loadRecordings();
        }
      };
    } catch {}

    window.addEventListener('storage', checkLiveStatus);

    return () => {
      bc?.close();
      clearInterval(serverInterval);
      window.removeEventListener('storage', checkLiveStatus);
    };
  }, [student.batch]);

  return (
    <div className="space-y-7">
      {/* Real-time Enrolled Live Class Alert Banner */}
      {activeLiveStream?.isLive && !dismissedLive && (
        <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#89190E] via-[#65130D] to-[#10233F] text-white overflow-hidden shadow-2xl border-2 border-[#EFC988] animate-in slide-in-from-top duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#EFC988]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-[#EFC988] shadow-inner flex-shrink-0 mt-0.5 sm:mt-0">
                <Radio className="w-6 h-6 animate-pulse text-white" />
              </div>
              
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-rose-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full animate-pulse flex items-center space-x-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>LIVE CLASS STARTED • ENROLLED COHORT</span>
                  </span>
                  <span className="text-xs font-semibold text-[#EFC988]">
                    Faculty: {activeLiveStream.teacherName || 'Dr. Ekta Gahlawat'}
                  </span>
                </div>
                
                <h3 className="font-serif text-base sm:text-xl font-bold text-white leading-snug">
                  {activeLiveStream.courseTitle || 'Live Moot & Masterclass: Constitutional Law Jurisprudence'}
                </h3>
                <p className="text-xs text-white/80">
                  Your instructor is broadcasting live on Bunny.net HD Stream. Click to join the live hall now.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 flex-shrink-0 pt-2 sm:pt-0">
              <Link
                href={`/live-stream?title=${encodeURIComponent(activeLiveStream.courseTitle || 'Live Lecture')}&role=student`}
                className="px-5 py-3 rounded-2xl bg-[#EFC988] hover:bg-[#ffe2aa] text-[#10233F] text-xs font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-98 cursor-pointer"
              >
                <Video className="w-4 h-4 text-[#89190E]" />
                <span>Join Live Class Now →</span>
              </Link>

              <button
                onClick={() => setDismissedLive(true)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Dismiss Notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Welcome & High-Yield Banner */}
      <div className="relative p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-[#10233F] via-[#162d50] to-[#89190E] text-white overflow-hidden shadow-xl hud-bracket">
        <div className="absolute inset-0 blueprint-grid opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EFC988]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl min-w-0">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EFC988] animate-pulse-beacon flex-shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-[#EFC988] uppercase font-bold break-words">
                MSI Group of Institutes • Academic Semester V
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white mt-2 tracking-tight">
              Welcome back, {student.name.split(' ')[0]}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-2 leading-relaxed">
              You have <strong className="text-[#EFC988]">{enrolledUdemyData.length} online video courses</strong> in your active learning portal. Continue where you left off or explore newly assigned judicial masterclasses.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5 w-full sm:w-auto">
              {enrolledUdemyData.length > 0 && onOpenUdemyCourse ? (
                <button
                  onClick={() => onOpenUdemyCourse(enrolledUdemyData[0].course)}
                  className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md shadow-[#89190E]/30 btn-chamfered active:scale-98 transition-all cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-[#EFC988]" />
                  <span>Resume Latest Masterclass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('learning')}
                  className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md shadow-[#89190E]/30 btn-chamfered active:scale-98 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#EFC988]" />
                  <span>Resume Learning Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <Link
                href="/courses"
                className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/30 flex items-center space-x-2 backdrop-blur-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#EFC988]" />
                <span>Explore More Courses</span>
              </Link>

              <button
                type="button"
                onClick={() => onNavigateTab('profile')}
                className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#EFC988] hover:bg-[#ffe2aa] text-[#10233F] text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#89190E]" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 md:flex md:flex-col gap-2.5 sm:gap-4 w-full md:w-auto flex-shrink-0">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-0">
              <span className="text-[10px] font-mono tracking-wider uppercase text-white/70 block">
                Enrolled Courses
              </span>
              <span className="font-serif text-lg sm:text-2xl font-bold text-[#EFC988] mt-0.5 block">
                {enrolledUdemyData.length}
              </span>
              <span className="text-[9px] text-emerald-300 font-semibold block truncate">Video Curriculum</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-0">
              <span className="text-[10px] font-mono tracking-wider uppercase text-white/70 block">
                Batch Rank
              </span>
              <span className="font-serif text-lg sm:text-2xl font-bold text-white mt-0.5 block">
                {tests.some((t) => t.status === 'Completed') ? 'Ranked' : 'N/A'}
              </span>
              <span className="text-[9px] text-[#EFC988] font-semibold block truncate">
                {tests.some((t) => t.status === 'Completed') ? 'Evaluation Active' : 'Attempt mock test'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UDEMY ENROLLED MASTERCLASSES SECTION (NEW!) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E8DCCB]">
          <div className="flex items-center space-x-2">
            <PlayCircle className="w-5 h-5 text-[#89190E]" />
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
                My Enrolled Courses & Assigned Masterclasses (Udemy LMS)
              </h3>
              <p className="text-xs text-[#526174]">
                Click on any course to open the interactive Udemy classroom with video player, lecture notes, and certificate generator.
              </p>
            </div>
          </div>

          <Link
            href="/courses"
            className="text-xs font-bold text-[#89190E] hover:underline flex items-center space-x-1 self-start sm:self-center"
          >
            <span>Browse More Courses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Enrolled Courses Grid */}
        {enrolledUdemyData.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-[#89190E] mx-auto opacity-70" />
            <h4 className="font-serif text-lg font-bold text-[#10233F]">No Enrolled Courses Yet</h4>
            <p className="text-xs text-[#526174] max-w-md mx-auto">
              You have no active course enrollments yet. Explore our premier judicial & law entrance programmes to get started.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#89190E] text-white text-xs font-bold shadow-md hover:bg-[#65130D] transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#EFC988]" />
              <span>Explore All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledUdemyData.map(({ course, enrollment }) => {
            const isAssignedByAdmin = enrollment.assignedBy === 'super-admin';

            return (
              <div
                key={course.id}
                className="p-4 rounded-2xl border-2 border-[#E8DCCB] hover:border-[#89190E] transition-all bg-[#FFF9EF]/40 flex flex-col justify-between space-y-3 group shadow-xs"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89190E] bg-[#FFF3DD] border border-[#EFC988] px-2.5 py-0.5 rounded-full">
                      {course.category}
                    </span>

                    {enrollment.assignedBy === 'teacher' ? (
                      <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <UserCheck className="w-3 h-3 text-indigo-600" />
                        <span>Assigned by Faculty: {enrollment.assignedByName || course.instructorName}</span>
                      </span>
                    ) : isAssignedByAdmin ? (
                      <span className="text-[10px] font-mono font-bold uppercase text-[#89190E] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-[#89190E]" />
                        <span>Assigned by Super Admin Directorate</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Self Enrolled</span>
                      </span>
                    )}
                  </div>

                  {/* Course Title & Instructor */}
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#10233F] group-hover:text-[#89190E] transition-colors leading-snug line-clamp-2">
                    {course.title}
                  </h4>
                  <p className="text-xs text-[#526174] mt-1">
                    Instructor: <strong>{course.instructorName}</strong>
                  </p>

                  {/* Super Admin Directive Note if available */}
                  {enrollment.assignedNote && (
                    <div className="mt-2 p-2 rounded-xl bg-white border border-[#E8DCCB] text-[11px] text-[#89190E]">
                      <strong>Dean Directive:</strong> {enrollment.assignedNote}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#526174] font-medium">
                        Progress: {enrollment.completedLectureIds.length} lectures completed
                      </span>
                      <span className="font-bold font-mono text-[#89190E]">
                        {enrollment.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white border border-[#E8DCCB] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#89190E] to-[#EFC988] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(enrollment.progressPercentage, 4)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-2 flex items-center justify-between border-t border-[#E8DCCB]/60">
                  <span className="text-[11px] text-[#526174]">
                    Enrolled {enrollment.enrolledAt}
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenUdemyCourse && onOpenUdemyCourse(course)}
                    className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-[#EFC988]" />
                    <span>Open Udemy Player</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* 2b. Ordered Books & Aspirant Kits Section (AUDIO 4 SPECIFIC) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DCCB] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E8DCCB]/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF3DD] text-[#89190E] flex items-center justify-center border border-[#EFC988] shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89190E]">
                  Publications & Doorstep Dispatch
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {purchasedKits.length} Consignments
                </span>
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
                My Purchased Study Material & Book Kits
              </h3>
            </div>
          </div>

          <Link
            href="/courses#master-books-kits"
            className="text-xs font-bold text-[#89190E] hover:underline flex items-center space-x-1 self-start sm:self-center"
          >
            <span>+ Order More Books & Kits</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {purchasedKits.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] text-center space-y-2.5">
            <Package className="w-9 h-9 text-[#89190E] mx-auto opacity-70" />
            <h4 className="font-serif text-base font-bold text-[#10233F]">No Books or Aspirant Kits Ordered Yet</h4>
            <p className="text-xs text-[#526174] max-w-md mx-auto leading-relaxed">
              Enhance your legal preparation with the official 6-Book Master Series, CLAT/Judiciary Aspirant Kits, and printed OMR test booklets.
            </p>
            <div className="pt-1">
              <Link
                href="/courses#master-books-kits"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#89190E] text-white text-xs font-bold shadow-xs hover:bg-[#65130D] transition-all cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-[#EFC988]" />
                <span>Browse 6-Book Master Series & Kits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchasedKits.map((kit) => (
              <div
                key={kit.id}
                className="p-4 rounded-2xl border-2 border-[#E8DCCB] hover:border-[#89190E] transition-all bg-[#FFF9EF]/40 flex flex-col justify-between space-y-3 group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89190E] bg-[#FFF3DD] border border-[#EFC988] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#89190E]" />
                      <span>{kit.status || 'Dispatched from MSI Campus'}</span>
                    </span>
                    <span className="font-bold text-xs text-[#10233F]">
                      ₹{kit.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#10233F] group-hover:text-[#89190E] transition-colors leading-snug">
                    {kit.title}
                  </h4>

                  <div className="mt-3 p-2.5 rounded-xl bg-white border border-[#E8DCCB]/80 text-[11px] text-[#526174] space-y-1">
                    <div className="flex justify-between">
                      <span>Tracking ID:</span>
                      <strong className="font-mono text-[#10233F]">{kit.trackingNumber || 'MSI-EXP-772910'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span className="font-mono text-[#10233F]">{kit.orderDate}</span>
                    </div>
                    {kit.receiptNumber && (
                      <div className="flex justify-between">
                        <span>Receipt:</span>
                        <span className="font-mono text-[#89190E] font-bold">{kit.receiptNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DCCB]/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified Purchase</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Tracking Consignment: ${kit.trackingNumber || 'MSI-EXP-772910'}\nCourier Partner: MSI Express Logistics\nOrigin: MSI Campus, Sector 15 Chandigarh\nCurrent Status: Out for delivery to your registered address.`)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[11px] font-bold text-[#10233F] transition-all cursor-pointer"
                  >
                    Track Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Key Metrics Row: Progress, Classes, Tests, Fee Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Courses & Progress */}
        <div
          onClick={() => onNavigateTab('learning')}
          className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#89190E] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-[#89190E]/10 text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-[#89190E]">{activeEnrolledCourses.length} Active</span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#10233F] mt-3">
            Classroom Batches
          </h3>
          <p className="text-xs text-[#526174] mt-0.5">
            Syllabus avg completion: {avgProgress}%
          </p>
          <div className="w-full h-2 bg-[#FFF3DD] rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-[#89190E] rounded-full transition-all"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>

        {/* Card 2: Upcoming Classes Today */}
        <div
          onClick={() => onNavigateTab('dashboard')}
          className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#10233F] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-[#10233F]/10 text-[#10233F] group-hover:bg-[#10233F] group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Today
            </span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#10233F] mt-3">
            Upcoming Classes
          </h3>
          <p className="text-xs text-[#526174] mt-0.5">
            {upcomingClasses.filter((c) => c.day === 'Today').length} Lectures remaining
          </p>
          <div className="mt-3 text-[11px] font-semibold text-[#89190E] flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Next: 09:30 AM (CrPC)</span>
          </div>
        </div>

        {/* Card 3: Tests & Mock Exams */}
        <div
          onClick={() => onNavigateTab('tests')}
          className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#EFC988] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-[#FFF3DD] text-[#89190E] group-hover:bg-[#EFC988] transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold bg-[#89190E] text-white px-2 py-0.5 rounded-md">
              1 Open
            </span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#10233F] mt-3">
            Tests & Evaluations
          </h3>
          <p className="text-xs text-[#526174] mt-0.5">
            5-Question Timed Mock #12
          </p>
          <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Last Test: 86/100 (94.2%)</span>
          </div>
        </div>

        {/* Card 4: Fee Status */}
        <div
          onClick={() => onNavigateTab('fees')}
          className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#89190E] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-800 group-hover:bg-amber-100 transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">
              ₹85,000 Paid
            </span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#10233F] mt-3">
            Fee Status
          </h3>
          <p className="text-xs text-[#526174] mt-0.5">
            Due: ₹40,000 (15 Oct)
          </p>
          <div className="mt-3 text-[11px] font-semibold text-[#89190E] flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Valid till 31 Jul 2026</span>
          </div>
        </div>
      </div>

      {/* 3.5. LEETCODE-STYLE 30-DAY STUDY ACTIVITY HEATMAP */}
      <StudentActivityHeatmap
        studentName={student.name}
        onNavigateTab={onNavigateTab}
      />

      {/* 4. Main Dashboard 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        
        {/* Left Column (2 spans): Active Courses + Today's Timetable */}
        <div className="lg:col-span-2 space-y-7">
          
          {/* Active Courses Subsection */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E8DCCB]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#89190E] flex-shrink-0" />
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
                    Classroom Batches & Syllabus
                  </h3>
                </div>
                <p className="text-xs text-[#526174] mt-0.5 break-words">
                  Linked to active student enrollment ID #{student.enrollmentNo}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('learning')}
                className="text-xs font-bold text-[#89190E] hover:underline flex items-center space-x-1 self-start sm:self-center"
              >
                <span>View All Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Courses List */}
            <div className="divide-y divide-[#E8DCCB]/60 mt-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E]">
                        {course.code}
                      </span>
                      <span className="text-xs text-[#526174]">{course.category}</span>
                      {!course.isEnrolled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-300 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Entitlement Locked</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#10233F] mt-1 group-hover:text-[#89190E] transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-xs text-[#526174] mt-0.5">{course.faculty}</p>

                    {/* Progress Bar */}
                    {course.isEnrolled ? (
                      <div className="mt-3 max-w-md">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-[#526174]">
                            Lectures: {course.attendedLectures} / {course.totalLectures}
                          </span>
                          <span className="font-bold text-[#89190E]">{course.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#FFF3DD] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#89190E] rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-500 mt-2 italic">
                        Course entitlement rule: Contact administrator to unlock syllabus modules.
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {course.isEnrolled ? (
                      <button
                        onClick={() => onNavigateTab('learning')}
                        className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] text-[#89190E] hover:text-white border border-[#E8DCCB] text-xs font-bold transition-all text-center block cursor-pointer"
                      >
                        Enter Course
                      </button>
                    ) : (
                      <span className="text-xs text-neutral-400 font-semibold px-3 py-1.5 border border-dashed border-neutral-300 rounded-xl text-center block">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today & Upcoming Classes Timetable */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E8DCCB]">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#89190E] flex-shrink-0" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
                  Academic Timetable & Live Lectures
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#89190E] bg-[#FFF3DD] px-2.5 py-1 rounded-lg self-start sm:self-center">
                Today: {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="space-y-3.5 mt-4">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    cls.isLiveNow
                      ? 'bg-[#FFF9EF] border-[#89190E] ring-1 ring-[#89190E]/30'
                      : 'bg-white border-[#E8DCCB] hover:border-[#10233F]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#10233F] text-white">
                        {cls.time}
                      </span>
                      <span className="text-xs font-semibold text-[#89190E]">{cls.type}</span>
                      {cls.isLiveNow && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          <span>Happening Now</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#10233F]">
                      {cls.subject}
                    </h4>
                    <p className="text-xs text-[#526174]">
                      Faculty: <strong>{cls.faculty}</strong> • Venue: {cls.room}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto">
                    {cls.joinLink ? (
                      <Link
                        href={`/live-stream?title=${encodeURIComponent(cls.subject)}&role=student`}
                        className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5 text-[#EFC988]" />
                        <span>Join Live Hall (Bunny Stream)</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => onNavigateTab('learning')}
                        className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-[#FFF9EF] hover:bg-white text-[#10233F] border border-[#E8DCCB] text-xs font-semibold transition-colors"
                      >
                        View Syllabus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recorded Live Masterclasses (VOD Archive) */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E8DCCB]">
              <div className="flex items-center space-x-2">
                <PlayCircle className="w-5 h-5 text-[#89190E] flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
                    Recorded Live Masterclasses (VOD Library)
                  </h3>
                  <p className="text-[11px] text-[#526174]">
                    Instant access to recorded faculty lectures after live streaming concludes
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#89190E] bg-[#FFF3DD] px-2.5 py-1 rounded-lg self-start sm:self-center">
                {recordedLectures.length} Recorded Sessions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {recordedLectures.length > 0 ? (
                recordedLectures.map((lec) => (
                  <div
                    key={lec.id}
                    className="p-4 rounded-2xl border border-[#E8DCCB] hover:border-[#89190E] bg-[#FFF9EF]/40 hover:bg-[#FFF9EF] transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#526174] mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#10233F] text-white font-bold">
                          VOD RECORDING
                        </span>
                        <span>{lec.duration || 'Full Session'}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#10233F] group-hover:text-[#89190E] transition-colors line-clamp-2">
                        {lec.title}
                      </h4>
                      <p className="text-xs text-[#526174] mt-1">
                        Faculty: <strong className="text-[#10233F]">{lec.faculty}</strong>
                      </p>
                      <p className="text-[11px] text-[#526174]/80 mt-0.5">
                        Streamed on {lec.date}
                      </p>
                    </div>

                    <Link
                      href={`/live-stream?title=${encodeURIComponent(lec.title)}&role=student`}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-white group-hover:bg-[#89190E] border border-[#89190E] text-[#89190E] group-hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Watch Recording Now</span>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-[#526174]">
                  No recorded lectures archived yet. When faculty finishes a live class, the video recording will appear here automatically.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1 span): Notifications, Live Tests Card, Fee Status Alert */}
        <div className="space-y-7">
          
          {/* Notifications & Circulars Tile */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCCB]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#89190E]" />
                <h3 className="font-serif text-base font-bold text-[#10233F]">
                  Official Notices
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#526174]">Live Broadcast</span>
            </div>

            <div className="divide-y divide-[#E8DCCB]/60 mt-2 space-y-2">
              {activeLiveStream?.isLive && (
                <div className="pt-2.5 pb-2 border-b border-[#E8DCCB] bg-rose-50/80 p-2.5 rounded-xl border border-rose-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>LIVE NOW</span>
                    </span>
                    <span className="text-[10px] text-rose-700 font-bold">Ongoing</span>
                  </div>
                  <h5 className="text-xs font-bold text-[#89190E] mt-1.5 leading-snug">
                    Live Broadcast Started: {activeLiveStream.teacherName || 'Dr. Ekta Gahlawat'}
                  </h5>
                  <p className="text-[11px] text-[#10233F] mt-0.5 leading-normal">
                    {activeLiveStream.courseTitle || 'Faculty is live streaming for your enrolled cohort.'}
                  </p>
                  <Link
                    href={`/live-stream?title=${encodeURIComponent(activeLiveStream.courseTitle || 'Live Lecture')}&role=student`}
                    className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-[#89190E] hover:underline"
                  >
                    <span>Click here to join class →</span>
                  </Link>
                </div>
              )}
              {notifications.map((n) => (
                <div key={n.id} className="pt-2.5 pb-1">
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-bold text-[#10233F] leading-snug">{n.title}</h5>
                  </div>
                  <p className="text-[11px] text-[#526174] mt-1 leading-normal">{n.message}</p>
                  <span className="text-[10px] text-[#89190E] font-medium block mt-1">{n.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timed Test Diagnostic Callout */}
          {availableTest && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#89190E] to-[#65130D] text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#EFC988]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <span className="text-[10px] font-mono tracking-widest text-[#EFC988] uppercase font-bold block">
                  Diagnostic Assessment Ready
                </span>
                <h4 className="font-serif text-lg font-bold text-white mt-1">
                  {availableTest.title}
                </h4>
                <p className="text-xs text-white/80 mt-1">
                  Duration: {availableTest.durationMinutes} mins • {availableTest.totalQuestions} Questions • Real-time scoring
                </p>

                <button
                  onClick={() => onStartTest(availableTest)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-white text-[#89190E] hover:bg-[#FFF9EF] text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#89190E]" />
                  <span>Start Timed Test Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Fee Status Summary Card */}
          <div className="p-6 rounded-3xl bg-[#FFF9EF] border border-[#E8DCCB]">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#89190E]" />
              <h4 className="font-serif text-base font-bold text-[#10233F]">
                Institutional Fee Summary
              </h4>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCB]">
                <span className="text-[#526174]">Total Course Fee:</span>
                <span className="font-mono font-bold text-[#10233F]">₹1,25,000</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCB]">
                <span className="text-[#526174]">Total Paid (Receipted):</span>
                <span className="font-mono font-bold text-emerald-700">₹85,000</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCB]">
                <span className="text-[#526174]">Pending Balance:</span>
                <span className="font-mono font-bold text-[#89190E]">₹40,000</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#526174]">Next Installment Due:</span>
                <span className="font-bold text-[#10233F]">15 Oct 2025</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('fees')}
              className="mt-4 w-full py-2 rounded-xl bg-white border border-[#89190E] text-[#89190E] hover:bg-[#FFF3DD] text-xs font-bold transition-colors cursor-pointer"
            >
              View Payment Ledger & Receipts →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
