'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  UploadCloud,
  ExternalLink,
  Lock,
  Download,
  Play,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Sparkles,
  ShieldAlert,
  PlayCircle,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RecordedVideo,
  NotePDF,
  PYQItem,
  AssignmentItem,
} from './data/studentMockData';
import {
  UdemyCourse,
  CourseEnrollment,
  getStoredCourses,
  getStoredEnrollments,
  LMS_SYNC_EVENT,
} from '@/lib/lmsStore';

interface StudentLearningTabProps {
  videos: RecordedVideo[];
  notes: NotePDF[];
  pyqs: PYQItem[];
  assignments: AssignmentItem[];
  studentId?: string;
  studentPhone?: string;
  onPlayVideo: (video: RecordedVideo) => void;
  onSubmitAssignment: (assignment: AssignmentItem) => void;
  onOpenUdemyCourse?: (course: UdemyCourse, lectureIndex?: number) => void;
}

export default function StudentLearningTab({
  videos,
  notes,
  pyqs,
  assignments,
  studentId,
  studentPhone,
  onPlayVideo,
  onSubmitAssignment,
  onOpenUdemyCourse,
}: StudentLearningTabProps) {
  const [subSection, setSubSection] = useState<
    'all' | 'udemy' | 'videos' | 'notes' | 'pyqs' | 'assignments' | 'reference'
  >('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPyqYear, setSelectedPyqYear] = useState<number | 'all'>('all');

  // Enrolled Udemy Courses State
  const [enrolledUdemy, setEnrolledUdemy] = useState<{
    course: UdemyCourse;
    enrollment: CourseEnrollment;
  }[]>([]);

  const loadUdemy = () => {
    const allCourses = getStoredCourses();
    const allEnrollments = getStoredEnrollments();
    const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_phone') || '' : '';
    const cleanPhone = (studentPhone || storedPhone).replace(/\D/g, '').slice(-10);

    const myEnrollments = allEnrollments.filter((e) => {
      if (studentId && e.studentId === studentId) return true;
      if (cleanPhone && (e.studentPhone === cleanPhone || e.studentId.includes(cleanPhone) || e.studentId === `msi-stu-${cleanPhone.slice(-4)}`)) return true;
      if (!cleanPhone && (!studentId || studentId === 'msi-stu-001') && e.studentId === 'msi-stu-001') return true;
      return false;
    });

    const merged = myEnrollments
      .map((enr) => {
        const found = allCourses.find((c) => c.id === enr.courseId);
        if (!found) return null;
        return { course: found, enrollment: enr };
      })
      .filter(Boolean) as { course: UdemyCourse; enrollment: CourseEnrollment }[];

    // Ensure all registered students under Dr. Ekta Gahlawat / Ekta Gehlot or free MSI courses have access
    allCourses.forEach((crs) => {
      const alreadyIn = merged.some((m) => m.course.id === crs.id);
      const isEktaCourse =
        crs.instructorId === 'fac-law-ekta' ||
        crs.instructorName.toLowerCase().includes('ekta') ||
        crs.instructorName.toLowerCase().includes('gehlot') ||
        crs.instructorName.toLowerCase().includes('gahlawat');

      if (!alreadyIn && (isEktaCourse || crs.isFreeForMsiStudents)) {
        const autoEnrollment: CourseEnrollment = {
          studentId: studentId || (cleanPhone ? `msi-stu-${cleanPhone.slice(-4)}` : 'msi-stu-001'),
          studentPhone: cleanPhone,
          courseId: crs.id,
          enrolledAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          progressPercentage: 0,
          completedLectureIds: [],
          assignedBy: 'super-admin',
          assignedByName: crs.instructorName,
          assignedNote: `Assigned under ${crs.instructorName} curriculum.`,
          certificateIssued: false,
        };
        merged.push({ course: crs, enrollment: autoEnrollment });
      }
    });

    setEnrolledUdemy(merged);
  };

  useEffect(() => {
    loadUdemy();

    const handleSync = () => {
      loadUdemy();
    };

    window.addEventListener(LMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(LMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const subjects = [
    'All Subjects',
    'Code of Criminal Procedure',
    'Constitutional Law',
    'Law of Evidence',
    'Civil Procedure Code',
  ];

  // Filtered lists
  const filteredVideos = videos.filter((v) => {
    if (selectedSubject !== 'all' && v.subject !== selectedSubject) return false;
    return true;
  });

  const filteredNotes = notes.filter((n) => {
    if (selectedSubject !== 'all' && n.subject !== selectedSubject) return false;
    return true;
  });

  const filteredPyqs = pyqs.filter((p) => {
    if (selectedPyqYear !== 'all' && p.year !== selectedPyqYear) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Subject & Section Filters */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E8DCCB]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#89190E]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#10233F]">
                Academic Learning & Research Hub
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#526174] mt-1">
              Udemy-style modular video curriculum, annotated Bare Act digests, PYQs, and research assignments.
            </p>
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#89190E]" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF] text-xs font-semibold text-[#10233F] focus:outline-none focus:border-[#89190E]"
            >
              <option value="all">All Disciplines & Subjects</option>
              <option value="Code of Criminal Procedure">Code of Criminal Procedure (CrPC)</option>
              <option value="Constitutional Law">Constitutional Law</option>
              <option value="Law of Evidence">Law of Evidence</option>
              <option value="Civil Procedure Code">Civil Procedure Code (CPC)</option>
            </select>
          </div>
        </div>

        {/* Sub-section Pill Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {[
            { id: 'all', label: 'All Resources', count: enrolledUdemy.length + videos.length + notes.length },
            { id: 'udemy', label: 'Udemy Masterclasses', count: enrolledUdemy.length },
            { id: 'videos', label: 'Recorded Lectures', count: videos.length },
            { id: 'notes', label: 'Notes & PDFs', count: notes.length },
            { id: 'pyqs', label: 'PYQ Papers', count: pyqs.length },
            { id: 'assignments', label: 'Assignments', count: assignments.length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSubSection(item.id as typeof subSection)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                subSection === item.id
                  ? 'bg-[#89190E] text-white shadow-xs'
                  : 'bg-[#FFF9EF] text-[#526174] hover:text-[#10233F] hover:bg-[#E8DCCB]/60'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  subSection === item.id ? 'bg-white/20 text-white' : 'bg-[#E8DCCB] text-[#526174]'
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Course Entitlement Rule Reminder Banner */}
      <div className="p-4 rounded-2xl bg-[#FFF3DD] border border-[#EFC988] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#89190E]">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-[#89190E] flex-shrink-0" />
          <span>
            <strong>Enrolled Courses Active:</strong> You have {enrolledUdemy.length} enrolled video courses. Progress and notes synchronize automatically.
          </span>
        </div>
        <Link
          href="/courses"
          className="text-xs font-bold underline text-[#89190E] hover:text-[#65130D] whitespace-nowrap"
        >
          Enroll in More Courses →
        </Link>
      </div>

      {/* 1. ENROLLED UDEMY MASTERCLASSES ACCORDION */}
      {(subSection === 'all' || subSection === 'udemy') && enrolledUdemy.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PlayCircle className="w-5 h-5 text-[#89190E]" />
              <h3 className="font-serif text-lg font-bold text-[#10233F]">
                Enrolled Udemy Video Curriculum & Progress
              </h3>
            </div>
            <span className="text-xs text-[#526174] font-mono">
              {enrolledUdemy.length} Enrolled Courses
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {enrolledUdemy.map(({ course, enrollment }) => {
              const isAssigned = enrollment.assignedBy === 'super-admin';

              return (
                <div
                  key={course.id}
                  className="rounded-3xl border-2 border-[#E8DCCB] bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8DCCB]/60">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-20 h-14 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-black/10 flex-shrink-0">
                        <Image
                          src={course.thumbnail || '/images/courses/clat.jpg'}
                          alt={course.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (target && !target.src.includes('clat.jpg')) {
                              target.srcset = '';
                              target.src = '/images/courses/clat.jpg';
                            }
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-[#89190E] bg-[#FFF3DD] px-2 py-0.5 rounded-md">
                            {course.category}
                          </span>
                          {isAssigned && (
                            <span className="text-[10px] font-bold text-[#89190E] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              Assigned by Super Admin
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif font-bold text-base text-[#10233F]">
                          {course.title}
                        </h4>
                        <p className="text-xs text-[#526174]">
                          Lead Faculty: <strong>{course.instructorName}</strong> • {course.totalLectures} lectures • {course.totalDuration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0 self-end lg:self-center">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#89190E] block">
                          {enrollment.progressPercentage}% Completed
                        </span>
                        <span className="text-[11px] text-[#526174] block">
                          {enrollment.completedLectureIds.length} of {course.totalLectures} lectures
                        </span>
                      </div>

                      <button
                        onClick={() => onOpenUdemyCourse && onOpenUdemyCourse(course)}
                        className="px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Open Classroom Player</span>
                      </button>
                    </div>
                  </div>

                  {/* Sequential Lectures Roster */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-[#10233F] flex items-center space-x-1.5">
                        <Video className="w-3.5 h-3.5 text-[#89190E]" />
                        <span>Curriculum Lectures Sequence ({course.sections ? course.sections.flatMap((s) => s.lectures).length : 0} Lectures):</span>
                      </span>
                      <button
                        onClick={() => onOpenUdemyCourse && onOpenUdemyCourse(course, 0)}
                        className="text-[11px] font-bold text-[#89190E] hover:underline cursor-pointer"
                      >
                        Play All Sequential Lectures →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {(course.sections ? course.sections.flatMap((s) => s.lectures) : []).map((lec, idx) => {
                        const isDone = enrollment.completedLectureIds.includes(lec.id);
                        return (
                          <div
                            key={lec.id}
                            onClick={() => onOpenUdemyCourse && onOpenUdemyCourse(course, idx)}
                            className="p-3 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] hover:border-[#89190E] transition-all cursor-pointer group flex items-start justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5 mb-1">
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E]">
                                  {/^lecture\s*\d+/i.test(lec.title) ? lec.title.split(':')[0] : `Lecture ${idx + 1}`}
                                </span>
                                {isDone && (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                    Done
                                  </span>
                                )}
                              </div>
                              <h5 className="font-serif font-bold text-xs text-[#10233F] group-hover:text-[#89190E] transition-colors line-clamp-1">
                                {lec.title}
                              </h5>
                              <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                                ⏱ {lec.duration}
                              </span>
                            </div>

                            <button
                              className="p-1.5 rounded-xl bg-[#89190E]/10 group-hover:bg-[#89190E] group-hover:text-white text-[#89190E] transition-colors mt-0.5 shrink-0"
                              title="Play Video Lecture"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Recorded Videos Section */}
      {(subSection === 'all' || subSection === 'videos') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-[#89190E]" />
              <h3 className="font-serif text-lg font-bold text-[#10233F]">
                Recorded Video Lectures & High Court Case Discussions
              </h3>
            </div>
            <span className="text-xs text-[#526174]">
              {filteredVideos.length} Available Lectures
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className={`rounded-3xl border overflow-hidden transition-all bg-white flex flex-col justify-between shadow-xs ${
                  video.isLocked
                    ? 'border-neutral-200 opacity-75'
                    : 'border-[#E8DCCB] hover:border-[#89190E] hover:shadow-md'
                }`}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video w-full bg-neutral-900 group">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  {video.isLocked ? (
                    <div className="absolute inset-0 bg-neutral-950/70 flex flex-col items-center justify-center text-white p-4 text-center">
                      <Lock className="w-8 h-8 text-amber-400 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Unentitled Module
                      </span>
                      <span className="text-[10px] text-white/70 mt-1">
                        Requires Advanced Elective Tier
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onPlayVideo(video)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors cursor-pointer"
                      aria-label="Play video"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#89190E] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-5 h-5 text-[#EFC988] ml-0.5 fill-current" />
                      </div>
                    </button>
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px]">
                    {video.duration}
                  </span>
                </div>

                {/* Video Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#89190E]">
                      {video.subject}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#10233F] mt-1 leading-snug line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-xs text-[#526174] mt-1">Faculty: {video.faculty}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E8DCCB] flex items-center justify-between text-[11px] text-[#526174]">
                    <span>Uploaded: {video.uploadDate}</span>
                    {!video.isLocked && (
                      <button
                        onClick={() => onPlayVideo(video)}
                        className="text-[#89190E] font-bold hover:underline cursor-pointer"
                      >
                        Stream Now →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Notes & Compendiums Section */}
      {(subSection === 'all' || subSection === 'notes') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#89190E]" />
              <h3 className="font-serif text-lg font-bold text-[#10233F]">
                Annotated Bare Acts, Faculty Notes & Case Compendiums
              </h3>
            </div>
            <span className="text-xs text-[#526174]">{filteredNotes.length} Documents</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-3xl bg-white border border-[#E8DCCB] hover:border-[#89190E] transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E]">
                      {note.category}
                    </span>
                    <span className="text-xs font-mono text-[#526174]">{note.fileSize}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#10233F] mt-2 leading-snug">
                    {note.title}
                  </h4>
                  <p className="text-xs text-[#526174] mt-1">{note.subject}</p>
                  <span className="text-[11px] text-[#526174] block mt-1">
                    Compiled by: {note.faculty} • {note.pages} Pages
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DCCB] flex items-center justify-between">
                  <span className="text-[11px] text-[#526174]">{note.uploadDate}</span>
                  <a
                    href={note.downloadUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading official MSI PDF: ${note.title}`);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] text-[#89190E] hover:text-white border border-[#E8DCCB] text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Previous Year Exam Papers (PYQs) */}
      {(subSection === 'all' || subSection === 'pyqs') && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCB]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#10233F]">
                State Judicial Service & Law Entrance Previous Year Papers
              </h3>
              <p className="text-xs text-[#526174]">
                Official Prelims & Mains question banks with model answers.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#526174]">Filter Year:</span>
              <select
                value={selectedPyqYear}
                onChange={(e) =>
                  setSelectedPyqYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="p-1.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF] text-xs font-semibold text-[#10233F]"
              >
                <option value="all">All Years</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-[#E8DCCB]/60">
            {filteredPyqs.map((pyq) => (
              <div
                key={pyq.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#10233F] text-white">
                      {pyq.examName} • {pyq.year}
                    </span>
                    <span className="text-xs font-semibold text-[#89190E]">{pyq.paperType}</span>
                    {pyq.hasSolutions && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Official Solutions Included
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#10233F] mt-1">
                    {pyq.subject}
                  </h4>
                  <span className="text-xs text-[#526174]">
                    Total Questions: {pyq.totalQuestions} Questions with Answer Keys
                  </span>
                </div>

                <a
                  href={pyq.downloadUrl}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Downloading ${pyq.examName} ${pyq.year} Paper with answers.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] text-[#89190E] hover:text-white border border-[#E8DCCB] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all self-start sm:self-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Paper PDF</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Assignments Submission Bench */}
      {(subSection === 'all' || subSection === 'assignments') && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DCCB]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#10233F]">
                Judgment Writing & Plaint Drafting Assignments
              </h3>
              <p className="text-xs text-[#526174]">
                Submit drafts for evaluation by retired judicial officers.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#89190E]">
              {assignments.length} Total Assigned
            </span>
          </div>

          <div className="divide-y divide-[#E8DCCB]/60">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E]">
                      {asg.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        asg.status === 'Graded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : asg.status === 'Submitted'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      Status: {asg.status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#10233F]">
                    {asg.title}
                  </h4>
                  <div className="flex items-center space-x-3 text-xs text-[#526174]">
                    <span>Due: <strong>{asg.dueDate}</strong></span>
                    <span>•</span>
                    <span>Max Marks: {asg.maxMarks}</span>
                    {asg.scoredMarks !== undefined && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          Scored: {asg.scoredMarks} / {asg.maxMarks}
                        </span>
                      </>
                    )}
                  </div>
                  {asg.facultyRemarks && (
                    <p className="text-xs text-emerald-900 bg-emerald-50 p-2 rounded-xl mt-1 border border-emerald-100">
                      <strong>Remarks:</strong> {asg.facultyRemarks}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 self-start sm:self-center">
                  {asg.status === 'Pending' ? (
                    <button
                      onClick={() => onSubmitAssignment(asg)}
                      className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Draft PDF</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono font-bold text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      Draft Uploaded ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
