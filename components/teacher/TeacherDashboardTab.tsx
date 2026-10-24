import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  Clock,
  Video,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  TeacherProfile,
  TeacherCourse,
  TeacherClassSchedule,
  AssessmentItem,
} from './data/teacherMockData';
import { TeacherModuleTab } from './TeacherSidebar';
import { getStoredTeachers, LMS_SYNC_EVENT, UdemyCourse } from '@/lib/lmsStore';
import { Plus, Play, UserPlus } from 'lucide-react';

interface TeacherDashboardTabProps {
  teacher: TeacherProfile;
  courses: TeacherCourse[];
  lmsCourses?: UdemyCourse[];
  schedules: TeacherClassSchedule[];
  assessments: AssessmentItem[];
  totalStudents: number;
  onNavigateTab: (tab: TeacherModuleTab) => void;
  onLaunchAttendance: (session: TeacherClassSchedule) => void;
  onOpenLectureModal?: (course: UdemyCourse) => void;
  onOpenEnrollModal?: (course?: UdemyCourse) => void;
}

export default function TeacherDashboardTab({
  teacher,
  courses,
  lmsCourses = [],
  schedules,
  assessments,
  totalStudents,
  onNavigateTab,
  onLaunchAttendance,
  onOpenLectureModal,
  onOpenEnrollModal,
}: TeacherDashboardTabProps) {
  const upcomingClasses = schedules.filter((s) => s.day === 'Today');

  // Super Admin approval check
  const [approvalStatus, setApprovalStatus] = useState<
    'approved' | 'pending' | 'rejected' | 'suspended'
  >('approved');

  const checkStatus = () => {
    const stored = getStoredTeachers();
    const found = stored.find((t) => t.id === teacher.id || t.email === teacher.email);
    if (found) {
      setApprovalStatus(found.status);
    } else {
      setApprovalStatus('approved');
    }
  };

  useEffect(() => {
    checkStatus();
    const handleSync = () => checkStatus();
    window.addEventListener(LMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(LMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [teacher.id]);

  return (
    <div className="space-y-7">
      {/* Super Admin Status Banner */}
      {approvalStatus === 'approved' ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Super Admin Status: Verified & Approved</strong> • Authorized to teach, publish courses, and evaluate judicial answer scripts.
            </span>
          </div>
          <Link
            href="/super-admin"
            className="text-xs font-bold text-emerald-900 underline hover:text-emerald-950 whitespace-nowrap self-start sm:self-auto"
          >
            Super Admin Hub →
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#FFF3DD] border-2 border-[#EFC988] text-[#89190E] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-[#89190E] flex-shrink-0" />
            <div>
              <span className="font-bold text-sm block">Status: Pending Super Admin Approval</span>
              <span className="text-[11px] text-[#526174]">
                Your faculty application and demo lectures are currently being verified by the Super Admin Director.
              </span>
            </div>
          </div>
          <Link
            href="/super-admin"
            className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-sm whitespace-nowrap self-start sm:self-auto"
          >
            Review / Approve in Super Admin →
          </Link>
        </div>
      )}
      {/* 1. Faculty Welcome Banner */}
      <div className="p-5 sm:p-8 rounded-3xl bg-linear-to-r from-[#10233F] via-[#1c355e] to-[#89190E] text-white shadow-xl hud-bracket relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EFC988]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl min-w-0">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EFC988] animate-pulse-beacon flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-mono tracking-wider text-[#EFC988] uppercase font-bold break-words">
                {teacher.department} • {teacher.stream} Discipline
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 tracking-tight">
              Good day, {teacher.name}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-2 leading-relaxed">
              You have <strong className="text-[#EFC988]">{courses.length} active courses assigned</strong>, overseeing{' '}
              <strong>{totalStudents} enrolled students</strong>. You have {upcomingClasses.length} lectures scheduled for today.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5 w-full sm:w-auto">
              <button
                onClick={() => onNavigateTab('classes')}
                className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md shadow-[#89190E]/30 btn-chamfered active:scale-98 transition-all"
              >
                <Calendar className="w-4 h-4 text-[#EFC988]" />
                <span>Manage Today's Classes</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('assessment')}
                className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 flex items-center space-x-2 transition-all"
              >
                <Award className="w-4 h-4 text-[#EFC988]" />
                <span>Create Assessment</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Tile */}
          <div className="grid grid-cols-2 md:flex md:flex-col gap-2.5 sm:gap-3 w-full md:w-auto flex-shrink-0">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-0">
              <span className="text-[10px] font-mono tracking-wider uppercase text-white/70 block">
                Total Enrolled
              </span>
              <span className="font-serif text-xl sm:text-3xl font-bold text-[#EFC988] mt-0.5 block">
                {totalStudents}
              </span>
              <span className="text-[9px] text-emerald-300 font-semibold block truncate">{teacher.stream} Students</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-0">
              <span className="text-[10px] font-mono tracking-wider uppercase text-white/70 block">
                Average Score
              </span>
              <span className="font-serif text-xl sm:text-3xl font-bold text-white mt-0.5 block">
                81.2%
              </span>
              <span className="text-[9px] text-[#EFC988] font-semibold block truncate">Term Diagnostics</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards: Assigned Courses, Subjects, Students, Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Courses */}
        <div
          onClick={() => onNavigateTab('content')}
          className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#89190E] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-[#89190E]/10 text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-[#89190E]">{courses.length} Active</span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#10233F] mt-3">
            Assigned Courses
          </h3>
          <p className="text-xs text-[#526174] mt-0.5">
            {courses.map((c) => c.code).join(', ')}
          </p>
        </div>

        {/* Card 2: Assigned Subjects */}
        <div
          onClick={() => onNavigateTab('content')}
          className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#10233F] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-[#10233F]/10 text-[#10233F] group-hover:bg-[#10233F] group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {teacher.assignedSubjects.length} Subjects
            </span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#10233F] mt-3">
            Teaching Papers
          </h3>
          <p className="text-xs text-[#526174] mt-0.5 truncate">
            {teacher.assignedSubjects[0]}
          </p>
        </div>

        {/* Card 3: Enrolled Students */}
        <div
          onClick={() => onNavigateTab('monitoring')}
          className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#EFC988] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-[#FFF3DD] text-[#89190E] group-hover:bg-[#EFC988] transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">
              {totalStudents} Total
            </span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#10233F] mt-3">
            Enrolled Students
          </h3>
          <p className="text-xs text-[#526174] mt-0.5">
            Role-isolated: {teacher.stream} only
          </p>
        </div>

        {/* Card 4: Upcoming Classes */}
        <div
          onClick={() => onNavigateTab('classes')}
          className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#89190E] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-800 group-hover:bg-amber-100 transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-[#89190E]">
              {upcomingClasses.length} Scheduled Today
            </span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#10233F] mt-3">
            Upcoming Classes
          </h3>
          <p className="text-xs text-[#526174] mt-0.5">
            Next: {upcomingClasses[0]?.time || 'Completed'}
          </p>
        </div>
      </div>

      {/* 3. Main Dashboard 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left Column (2 spans): Assigned Courses & Upcoming Schedule */}
        <div className="lg:col-span-2 space-y-7">
          
          {/* Assigned Courses Subsection */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E8DCCB]">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#89190E] flex-shrink-0" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
                  Assigned Courses & Curriculum Progress
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('content')}
                className="text-xs font-bold text-[#89190E] hover:underline flex items-center space-x-1 self-start sm:self-center"
              >
                <span>Manage Course Content</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#E8DCCB]/60 mt-2 space-y-6">
              {lmsCourses.length > 0 ? (
                lmsCourses.map((course) => {
                  const allLectures = course.sections ? course.sections.flatMap((s) => s.lectures) : [];
                  const progressPct = Math.min(
                    100,
                    Math.round((allLectures.length / Math.max(1, course.totalLectures || 10)) * 100)
                  );

                  return (
                    <div key={course.id} className="pt-5 first:pt-2 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E] uppercase">
                              {course.category}
                            </span>
                            {course.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                {course.badge}
                              </span>
                            )}
                            <span className="text-[11px] text-[#526174]">
                              Faculty: <strong>{course.instructorName}</strong>
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-[#10233F] leading-snug">
                            {course.title}
                          </h4>
                          <p className="text-xs text-[#526174] line-clamp-1">
                            {course.headline}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
                          <button
                            onClick={() => onOpenEnrollModal?.(course)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                            title="Enroll registered student into this course"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Enroll Students</span>
                          </button>

                          <button
                            onClick={() => onOpenLectureModal?.(course)}
                            className="px-3 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Lecture {allLectures.length + 1}</span>
                          </button>

                          <button
                            onClick={() => onOpenLectureModal?.(course)}
                            className="px-3 py-1.5 rounded-xl border border-[#E8DCCB] hover:border-[#10233F] bg-white text-xs font-bold text-[#10233F] transition-all cursor-pointer"
                          >
                            <span>Manage ({allLectures.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* Lectures Delivered Roster (Lecture-wise display) */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#10233F] flex items-center space-x-1.5">
                            <Video className="w-3.5 h-3.5 text-[#89190E]" />
                            <span>Lecture Sequence ({allLectures.length} Delivered):</span>
                          </span>
                          <span className="text-[11px] text-[#526174] font-mono">
                            Total: {course.totalDuration}
                          </span>
                        </div>

                        {allLectures.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {allLectures.map((lec, idx) => (
                              <div
                                key={lec.id}
                                onClick={() => onOpenLectureModal?.(course)}
                                className="p-3 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] hover:border-[#89190E] transition-all cursor-pointer flex items-start justify-between gap-2 group"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-1.5 mb-0.5">
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E]">
                                      {/^lecture\s*\d+/i.test(lec.title)
                                        ? lec.title.split(':')[0]
                                        : `Lecture ${idx + 1}`}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono">
                                      ⏱ {lec.duration}
                                    </span>
                                  </div>
                                  <h5 className="font-serif font-bold text-xs text-[#10233F] group-hover:text-[#89190E] transition-colors truncate">
                                    {lec.title}
                                  </h5>
                                  <p className="text-[10px] text-[#526174] truncate mt-0.5">
                                    {lec.summary || 'Classroom recording with case law briefs.'}
                                  </p>
                                </div>

                                <div className="p-1 rounded-lg bg-[#89190E]/10 group-hover:bg-[#89190E] group-hover:text-white text-[#89190E] transition-colors mt-0.5 shrink-0">
                                  <Play className="w-3 h-3 fill-current" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span>No lectures uploaded yet for this course. Click below to add Lecture 1!</span>
                            <button
                              onClick={() => onOpenLectureModal?.(course)}
                              className="px-3 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-[11px] font-bold self-start sm:self-auto"
                            >
                              + Add Lecture 1
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Syllabus Progress Bar */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-xs text-[#526174] mb-1">
                          <span>
                            Lectures Delivered: <strong>{allLectures.length} of {course.totalLectures || 20} Target</strong>
                          </span>
                          <span className="font-bold text-[#89190E]">{progressPct}% Complete</span>
                        </div>
                        <div className="w-full h-2 bg-[#FFF3DD] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#89190E] rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="pt-4 first:pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E]">
                            {course.code}
                          </span>
                          <span className="text-xs font-semibold text-[#526174]">
                            {course.batch}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#10233F] mt-1">
                          {course.title}
                        </h4>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-[#10233F]">
                          {course.totalStudents} Students Enrolled
                        </span>
                        <p className="text-[11px] text-[#526174]">
                          Next lecture: {course.nextLectureTime}
                        </p>
                      </div>
                    </div>

                    {/* Syllabus Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-[#526174] mb-1">
                        <span>
                          Lectures Delivered: <strong>{course.lecturesCompleted} / {course.totalLectures}</strong>
                        </span>
                        <span className="font-bold text-[#89190E]">{course.progress}% Completed</span>
                      </div>
                      <div className="w-full h-2 bg-[#FFF3DD] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#89190E] rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Classes & Electronic Register Launcher */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#E8DCCB]">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#89190E] flex-shrink-0" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
                  Today's Teaching Schedule
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('classes')}
                className="text-xs font-bold text-[#89190E] hover:underline self-start sm:self-center"
              >
                Full Weekly Timetable →
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {schedules.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    session.isLiveNow
                      ? 'bg-[#FFF9EF] border-[#89190E] ring-1 ring-[#89190E]/20'
                      : 'bg-white border-[#E8DCCB]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#10233F] text-white">
                        {session.time}
                      </span>
                      <span className="text-xs font-semibold text-[#89190E]">{session.type}</span>
                      {session.isLiveNow && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                          ● Happening Now
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#10233F]">
                      {session.subject}
                    </h4>
                    <p className="text-xs text-[#526174]">
                      Batch: {session.batch} • Venue: {session.venue}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => onLaunchAttendance(session)}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white border border-[#89190E] text-[#89190E] hover:bg-[#FFF9EF] text-xs font-bold transition-colors text-center"
                    >
                      Mark Attendance
                    </button>
                    {session.meetLink && (
                      <a
                        href={session.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5 text-[#EFC988]" />
                        <span>Enter Live Session</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 span): Recent Results & Diagnostic Analytics */}
        <div className="space-y-7">
          
          {/* Recent Results Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCCB]">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#89190E]" />
                <h3 className="font-serif text-base font-bold text-[#10233F]">
                  Recent Examination Results
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#526174]">Diagnostic Cell</span>
            </div>

            <div className="divide-y divide-[#E8DCCB]/60 mt-2 space-y-3">
              {assessments.map((asmt) => (
                <div key={asmt.id} className="pt-3 first:pt-1">
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-bold text-[#10233F] leading-snug">
                      {asmt.title}
                    </h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {asmt.submissionsCount} Submissions
                    </span>
                  </div>
                  <p className="text-[11px] text-[#526174] mt-1">
                    Course: {asmt.courseCode} • Max: {asmt.marks} Marks
                  </p>
                  {asmt.averageScore && (
                    <div className="mt-2 p-2 rounded-xl bg-[#FFF9EF] border border-[#E8DCCB] flex items-center justify-between text-xs">
                      <span className="text-[#526174]">Batch Average:</span>
                      <span className="font-serif font-bold text-[#89190E]">
                        {asmt.averageScore}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('assessment')}
              className="mt-4 w-full py-2 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] text-[#89190E] hover:text-white border border-[#E8DCCB] text-xs font-bold transition-all"
            >
              View Detailed Scorecards →
            </button>
          </div>

          {/* Quick Mentorship & Stream Notice */}
          <div className="p-6 rounded-3xl bg-linear-to-br from-[#10233F] to-[#1c355e] text-white shadow-lg relative overflow-hidden">
            <div className="relative">
              <span className="text-[10px] font-mono tracking-widest text-[#EFC988] uppercase font-bold block">
                Academic Integrity & Bar Council Audit
              </span>
              <h4 className="font-serif text-lg font-bold text-white mt-1">
                Remedial Mentorship Active
              </h4>
              <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
                2 students in your assigned batches are currently below the statutory 75% attendance threshold. You can schedule 1-on-1 counsel sessions in Communication.
              </p>

              <button
                onClick={() => onNavigateTab('communication')}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <span>Open Mentorship Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
