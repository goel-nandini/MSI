'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  MessageSquare,
  StickyNote,
  Info,
  Clock,
  Volume2,
  Maximize2,
  RotateCcw,
  Sparkles,
  Printer,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import BunnyPlayer from '@/components/stream/BunnyPlayer';
import { toBunnyEmbedUrl } from '@/lib/bunnyStream';
import {
  UdemyCourse,
  UdemyLecture,
  CourseEnrollment,
  toggleLectureCompletionAction,
  getStoredEnrollments,
} from '@/lib/lmsStore';

interface UdemyPlayerModalProps {
  course: UdemyCourse | null;
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  initialLectureIndex?: number;
}

interface PersonalNote {
  id: string;
  timestamp: string;
  seconds: number;
  text: string;
}

interface QuestionItem {
  id: string;
  author: string;
  avatar: string;
  question: string;
  upvotes: number;
  answersCount: number;
  timeAgo: string;
}

export default function UdemyPlayerModal({
  course,
  isOpen,
  onClose,
  studentId = 'msi-stu-001',
  studentName = 'MSI Student',
  initialLectureIndex = 0,
}: UdemyPlayerModalProps) {
  // Flatten lectures for easy navigation
  const allLectures: { lecture: UdemyLecture; sectionTitle: string }[] = [];
  if (course) {
    course.sections.forEach((s) => {
      s.lectures.forEach((l) => {
        allLectures.push({ lecture: l, sectionTitle: s.title });
      });
    });
  }

  const [currentLectureIndex, setCurrentLectureIndex] = useState(initialLectureIndex || 0);

  useEffect(() => {
    if (typeof initialLectureIndex === 'number' && initialLectureIndex >= 0) {
      setCurrentLectureIndex(initialLectureIndex);
    }
  }, [initialLectureIndex, course?.id]);

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa' | 'resources'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showCertificate, setShowCertificate] = useState(false);
  const [notes, setNotes] = useState<PersonalNote[]>([
    {
      id: '1',
      timestamp: '04:12',
      seconds: 252,
      text: 'Crucial distinction between Article 32 and Article 226 judicial review scope.',
    },
    {
      id: '2',
      timestamp: '18:45',
      seconds: 1125,
      text: 'Kesavananda Bharati: 13 judge constitutional bench ratio recap.',
    },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'sec-1': true,
    'sec-2': true,
    'sec-3': true,
    'sec-clat-1': true,
    'sec-bnss-1': true,
    'sec-cyber-1': true,
  });

  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q1',
      author: studentName,
      avatar: '/images/avatars/avatar-1.webp',
      question: 'In Section 11 CPC Explanation IV, does constructive res judicata apply equally to writ petitions under Article 226?',
      upvotes: 14,
      answersCount: 2,
      timeAgo: '2 days ago',
    },
    {
      id: 'q2',
      author: 'Meera Sen',
      avatar: '/images/avatars/avatar-2.webp',
      question: 'What is the mandatory period for trial court judgment delivery under Order XX Rule 1 after conclusion of arguments?',
      upvotes: 8,
      answersCount: 1,
      timeAgo: '4 days ago',
    },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Read latest enrollment info
  const enrollments = getStoredEnrollments();
  const currentEnrollment: CourseEnrollment | undefined = enrollments.find(
    (e) => e.studentId === studentId && e.courseId === course?.id
  );

  const completedLectureIds = currentEnrollment?.completedLectureIds || [];
  const progressPercent = currentEnrollment?.progressPercentage || 0;

  const currentItem = allLectures[currentLectureIndex] || allLectures[0];
  const currentLecture = currentItem?.lecture;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentLectureIndex]);

  if (!isOpen || !course || !currentLecture) return null;

  const isLectureCompleted = completedLectureIds.includes(currentLecture.id);

  const handleToggleComplete = (lecId: string) => {
    toggleLectureCompletionAction(studentId, course.id, lecId);
  };

  const handleNextLecture = () => {
    if (currentLectureIndex < allLectures.length - 1) {
      setCurrentLectureIndex(currentLectureIndex + 1);
    }
  };

  const handlePrevLecture = () => {
    if (currentLectureIndex > 0) {
      setCurrentLectureIndex(currentLectureIndex - 1);
    }
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const currentSecs = Math.floor(videoRef.current?.currentTime || 0);
    const mins = Math.floor(currentSecs / 60);
    const secs = currentSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    setNotes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        timestamp: formatted,
        seconds: currentSecs,
        text: newNoteText.trim(),
      },
    ]);
    setNewNoteText('');
  };

  const handleSeekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions((prev) => [
      {
        id: Date.now().toString(),
        author: studentName,
        avatar: '/images/avatars/avatar-1.webp',
        question: newQuestionText.trim(),
        upvotes: 1,
        answersCount: 0,
        timeAgo: 'Just now',
      },
      ...prev,
    ]);
    setNewQuestionText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0F172A] text-white overflow-hidden">
      
      {/* 1. Top Classroom Bar (Udemy Style) */}
      <header className="h-16 bg-[#10233F] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center space-x-1.5 text-xs font-semibold transition-all cursor-pointer flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Course</span>
          </button>

          <div className="h-5 w-px bg-white/20 hidden sm:block" />

          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase text-[#EFC988] font-bold block leading-none">
              MSI Online Academy • {course.category}
            </span>
            <h2 className="font-serif text-xs sm:text-sm font-bold text-white truncate max-w-md sm:max-w-xl mt-1">
              {course.title}
            </h2>
          </div>
        </div>

        {/* Right Progress & Certificate */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[11px] text-gray-300 font-mono block">
                Your Progress: <strong className="text-[#EFC988] font-bold">{progressPercent}%</strong>
              </span>
              <span className="text-[10px] text-gray-400 block">
                {completedLectureIds.length} of {allLectures.length} completed
              </span>
            </div>
            <div className="w-24 h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#EFC988] to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Certificate of Completion Button */}
          <button
            onClick={() => setShowCertificate(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#EFC988] to-[#d69f4b] hover:brightness-105 text-[#10233F] text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            title="View MSI Certificate of Completion"
          >
            <Award className="w-4 h-4 text-[#89190E]" />
            <span className="hidden sm:inline">Certificate</span>
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
              sidebarOpen
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-[#89190E] border-transparent text-white'
            }`}
          >
            <span>Course Content</span>
            <span className="text-[10px] ml-1 bg-white/20 px-1.5 py-0.2 rounded-full">
              {allLectures.length}
            </span>
          </button>
        </div>
      </header>

      {/* 2. Main Stage: Split into Video Player + Tabs (Left) and Curriculum Sidebar (Right) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left Video Area & Tabbed Notes/Q&A */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0A0F1D]">
          
          {/* Responsive Video Shell */}
          <div className="bg-black relative aspect-video max-h-[60vh] w-full flex items-center justify-center border-b border-white/10 group">
            {currentLecture.videoUrl.includes('mediadelivery.net') || currentLecture.videoUrl.includes('.b-cdn.net') || currentLecture.videoUrl.startsWith('bunny://') ? (
              <iframe
                src={toBunnyEmbedUrl(currentLecture.videoUrl)}
                title={currentLecture.title}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={currentLecture.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Video Bottom Action Bar */}
          <div className="p-4 sm:p-5 bg-[#10233F] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs text-[#EFC988] font-mono block">
                {currentItem.sectionTitle}
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-0.5 truncate">
                {currentLecture.title}
              </h3>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Playback speed selector */}
              <div className="flex items-center space-x-1 bg-white/10 rounded-xl p-1 text-xs">
                {[1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded-lg font-mono transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-[#89190E] text-white font-bold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <button
                onClick={handlePrevLecture}
                disabled={currentLectureIndex === 0}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-all cursor-pointer"
                title="Previous Lecture"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Mark Complete & Next */}
              <button
                onClick={() => {
                  handleToggleComplete(currentLecture.id);
                  if (!isLectureCompleted) {
                    handleNextLecture();
                  }
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer ${
                  isLectureCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#89190E] hover:bg-[#65130D] text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLectureCompleted ? 'Completed ✓' : 'Mark Complete & Next'}</span>
              </button>

              <button
                onClick={handleNextLecture}
                disabled={currentLectureIndex === allLectures.length - 1}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white transition-all cursor-pointer"
                title="Next Lecture"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Under-Video Tabs Navigation */}
          <div className="bg-[#0e182a] border-b border-white/10 px-4 sm:px-6 flex items-center space-x-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#EFC988] text-[#EFC988]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`py-3.5 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'qa'
                  ? 'border-[#EFC988] text-[#EFC988]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Q&A ({questions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3.5 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-[#EFC988] text-[#EFC988]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              <span>Notes ({notes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`py-3.5 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'resources'
                  ? 'border-[#EFC988] text-[#EFC988]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Resources ({currentLecture.resources?.length || 0})</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-4 sm:p-8 flex-1 text-gray-200 text-xs sm:text-sm">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h4 className="font-serif text-lg font-bold text-white mb-2">
                    About this lecture
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {currentLecture.summary ||
                      'In this session, senior faculty covers procedural doctrine, historical precedents, and high court answer writing strategy.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[11px] font-mono text-[#EFC988] uppercase font-bold block">
                    Lead Faculty
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white/10">
                      <Image
                        src={course.instructorAvatar}
                        alt={course.instructorName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="font-bold text-white">{course.instructorName}</h5>
                      <p className="text-xs text-gray-400">{course.instructorTitle}</p>
                    </div>
                  </div>
                </div>

                {currentEnrollment?.assignedBy !== 'self' && (
                  <div className="p-4 rounded-2xl bg-[#89190E]/20 border border-[#89190E]/40 text-[#EFC988]">
                    <span className="font-bold block mb-1">
                      Institutional Course Assignment Note:
                    </span>
                    <p className="text-xs text-gray-300">
                      {currentEnrollment?.assignedNote ||
                        'This course was assigned directly to your academic student profile by the Dean / Super Admin office.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Q&A Tab */}
            {activeTab === 'qa' && (
              <div className="max-w-3xl space-y-6">
                {/* Ask a question box */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Ask a question to faculty or peers
                  </h4>
                  <textarea
                    rows={2}
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Type your question or procedural query regarding this lecture..."
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-[#EFC988]"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddQuestion}
                      className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs cursor-pointer"
                    >
                      Post Question
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{q.author}</span>
                          <span>•</span>
                          <span>{q.timeAgo}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#EFC988]">
                          {q.answersCount} answers
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-200">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Tab (Timestamped Personal Notes) */}
            {activeTab === 'notes' && (
              <div className="max-w-3xl space-y-6">
                {/* Add Note at Current Time */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Create a new note</span>
                    <span className="font-mono text-[#EFC988]">
                      Timestamp: {Math.floor((videoRef.current?.currentTime || 0) / 60)}:
                      {String(Math.floor((videoRef.current?.currentTime || 0) % 60)).padStart(2, '0')}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Capture an important principle, statutory exception, or case citation at this exact moment..."
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-[#EFC988]"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs cursor-pointer"
                    >
                      Save Note at Timestamp
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3"
                    >
                      <button
                        onClick={() => handleSeekTo(n.seconds)}
                        className="px-2.5 py-1 rounded-lg bg-[#EFC988] text-[#10233F] font-mono text-xs font-bold hover:brightness-110 flex-shrink-0 cursor-pointer"
                        title="Jump to video timestamp"
                      >
                        {n.timestamp}
                      </button>
                      <p className="text-xs sm:text-sm text-gray-200 flex-1">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="max-w-3xl space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Downloadable Study Materials & Digests
                </h4>

                {currentLecture.resources && currentLecture.resources.length > 0 ? (
                  <div className="space-y-2">
                    {currentLecture.resources.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#89190E]/40 text-[#EFC988] flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-xs sm:text-sm">
                              {res.title}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">
                              {res.type.toUpperCase()} • {res.size}
                            </span>
                          </div>
                        </div>

                        <a
                          href={res.downloadUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading official MSI reference document: ${res.title}`);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-white/5 text-gray-400 text-xs">
                    No downloadable attachments for this specific video. Check Module 1 for the comprehensive Bare Act Compendium.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Collapsible Course Curriculum Sidebar (Udemy Style) */}
        {sidebarOpen && (
          <aside className="w-80 sm:w-96 bg-[#10233F] border-l border-white/10 flex flex-col flex-shrink-0 z-10 animate-fadeIn">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-white">Course content</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Close curriculum sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Sections List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/10">
              {course.sections.map((sec, sIdx) => {
                const isOpen = expandedSections[sec.id] ?? true;
                return (
                  <div key={sec.id}>
                    {/* Section Header Accordion */}
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({ ...prev, [sec.id]: !isOpen }))
                      }
                      className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-xs text-white block truncate">
                          {sec.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {sec.lectures.length} lectures • {sec.duration}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#EFC988] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {/* Lectures List */}
                    {isOpen && (
                      <div className="divide-y divide-white/5 bg-black/20">
                        {sec.lectures.map((lec) => {
                          const isActive = currentLecture.id === lec.id;
                          const isDone = completedLectureIds.includes(lec.id);
                          const lectureGlobalIdx = allLectures.findIndex(
                            (item) => item.lecture.id === lec.id
                          );

                          return (
                            <div
                              key={lec.id}
                              className={`p-3.5 flex items-start space-x-3 transition-colors ${
                                isActive
                                  ? 'bg-[#89190E]/30 border-l-4 border-[#EFC988]'
                                  : 'hover:bg-white/5'
                              }`}
                            >
                              {/* Complete Checkbox */}
                              <button
                                onClick={() => handleToggleComplete(lec.id)}
                                className="mt-0.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-500" />
                                )}
                              </button>

                              {/* Title click selects lecture */}
                              <button
                                onClick={() => setCurrentLectureIndex(lectureGlobalIdx)}
                                className="flex-1 text-left min-w-0 cursor-pointer"
                              >
                                <span
                                  className={`text-xs block leading-snug ${
                                    isActive
                                      ? 'text-[#EFC988] font-bold'
                                      : isDone
                                      ? 'text-gray-300'
                                      : 'text-white'
                                  }`}
                                >
                                  {lec.title}
                                </span>
                                <div className="flex items-center space-x-2 mt-1 text-[10px] text-gray-400 font-mono">
                                  <Play className="w-2.5 h-2.5 text-[#EFC988]" />
                                  <span>{lec.duration}</span>
                                  {lec.resources && (
                                    <span className="text-[#EFC988]">• {lec.resources.length} files</span>
                                  )}
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* 3. Certificate of Completion Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white text-[#10233F] rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-[#EFC988] my-8 animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Canvas Mockup */}
            <div className="border-2 border-double border-[#89190E] p-6 sm:p-8 rounded-2xl bg-[#FFF9EF] text-center relative overflow-hidden">
              <div className="flex justify-center mb-3">
                <div className="relative w-16 h-16">
                  <Image
                    src="/images/msi-crest.png"
                    alt="MSI Official Seal"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <span className="text-[11px] font-mono tracking-widest text-[#89190E] uppercase font-bold block mb-1">
                MSI Group of Institutes • Academy of Legal Studies
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F]">
                Certificate of Completion
              </h2>
              <p className="text-xs text-[#526174] mt-1">
                This is to officially certify that
              </p>

              <div className="my-5 border-b-2 border-[#E8DCCB] pb-2 max-w-md mx-auto">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#89190E]">
                  {studentName}
                </span>
                <span className="block text-xs font-mono text-[#526174] mt-1">
                  Roll No: 25-JUD-042 • Student ID: {studentId}
                </span>
              </div>

              <p className="text-xs text-[#526174] max-w-lg mx-auto leading-relaxed">
                has successfully completed all prescribed video curriculum modules, mock judicial drills, and legal research benchmarks for:
              </p>

              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#10233F] my-3">
                {course.title}
              </h3>

              <div className="mt-8 pt-4 border-t border-[#E8DCCB] grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <span className="font-mono text-[10px] text-[#526174] block">Certificate ID</span>
                  <span className="font-mono font-bold text-[#10233F]">MSI-CERT-2026-{course.id.toUpperCase().slice(0, 8)}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#526174] block">Verified Status</span>
                  <span className="font-bold text-emerald-700 flex items-center justify-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MSI Certified</span>
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#526174] block">Lead Dean Signature</span>
                  <span className="font-serif italic font-bold text-[#89190E]">Dr. Vikramaditya</span>
                </div>
              </div>
            </div>

            {/* Print & Download Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#526174]">
                Valid throughout all State Judicial Commission applications & bar councils.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#10233F] hover:bg-[#1a345c] text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => alert('Certificate downloaded as official high-resolution PDF.')}
                  className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
