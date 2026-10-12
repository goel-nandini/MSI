'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentHeader from '@/components/student/StudentHeader';
import StudentSidebar, { StudentModuleTab } from '@/components/student/StudentSidebar';
import StudentDashboardTab from '@/components/student/StudentDashboardTab';
import StudentProfileTab from '@/components/student/StudentProfileTab';
import StudentLearningTab from '@/components/student/StudentLearningTab';
import StudentAttendanceTab from '@/components/student/StudentAttendanceTab';
import StudentTestsTab from '@/components/student/StudentTestsTab';
import StudentFeesTab from '@/components/student/StudentFeesTab';
import TimedTestModal from '@/components/student/TimedTestModal';
import VideoPlayerModal from '@/components/student/VideoPlayerModal';
import FeeReceiptModal from '@/components/student/FeeReceiptModal';
import SubmitAssignmentModal from '@/components/student/SubmitAssignmentModal';
import UdemyPlayerModal from '@/components/student/UdemyPlayerModal';
import {
  INITIAL_STUDENT_PROFILE,
  ACTIVE_COURSES,
  UPCOMING_CLASSES,
  STUDENT_NOTIFICATIONS,
  RECORDED_VIDEOS,
  NOTES_PDFS,
  PYQS_LIST,
  ASSIGNMENTS_LIST,
  ATTENDANCE_SUBJECTS,
  ATTENDANCE_LOGS,
  TESTS_LIST,
  FEE_BREAKDOWN,
  FEE_TRANSACTIONS,
  StudentProfile,
  TestItem,
  RecordedVideo,
  FeeTransaction,
  AssignmentItem,
} from '@/components/student/data/studentMockData';
import { UdemyCourse } from '@/lib/lmsStore';

export default function StudentDashboardPage() {
  const router = useRouter();

  // Active student state
  const [student, setStudent] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [activeTab, setActiveTab] = useState<StudentModuleTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync active user details from localStorage on mount
  useEffect(() => {
    try {
      const storedName = localStorage.getItem('msi_active_student_name');
      const storedPhone = localStorage.getItem('msi_active_student_phone');
      const storedEmail = localStorage.getItem('msi_active_student_email');
      const storedStream = localStorage.getItem('msi_active_student_stream');

      if (storedName || storedPhone || storedEmail) {
        setStudent((prev) => ({
          ...prev,
          name: storedName || prev.name,
          phone: storedPhone || prev.phone,
          email: storedEmail || prev.email,
          courseTitle: storedStream || prev.courseTitle,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Dynamic state for modules
  const [notifications, setNotifications] = useState(STUDENT_NOTIFICATIONS);
  const [assignments, setAssignments] = useState(ASSIGNMENTS_LIST);
  const [tests, setTests] = useState(TESTS_LIST);

  // Active Modals
  const [activeTimedTest, setActiveTimedTest] = useState<TestItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<RecordedVideo | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<FeeTransaction | null>(null);
  const [activeAssignmentSubmit, setActiveAssignmentSubmit] = useState<AssignmentItem | null>(null);
  const [activeUdemyCourse, setActiveUdemyCourse] = useState<UdemyCourse | null>(null);

  // Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('msi_student_logged_in');
    } catch (err) {
      console.error(err);
    }
    router.push('/student/login');
  };

  // Profile update
  const handleUpdateProfile = (updated: StudentProfile) => {
    setStudent(updated);
  };

  // Test completion handler
  const handleTestComplete = (score: number, total: number) => {
    if (activeTimedTest) {
      setTests((prev) =>
        prev.map((t) =>
          t.id === activeTimedTest.id
            ? {
                ...t,
                status: 'Completed',
                scoredMarks: score,
                percentile: 97.5,
                rank: '1st in Current Speed Drill',
              }
            : t
        )
      );
    }
  };

  // Assignment submission handler
  const handleAssignmentSubmitted = (asgId: string, filename: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === asgId
          ? {
              ...a,
              status: 'Submitted',
              submittedFile: filename,
              facultyRemarks: 'Draft successfully submitted. Awaiting faculty evaluation.',
            }
          : a
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF9EF] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      {/* 1. Top Navbar Header */}
      <StudentHeader
        student={student}
        notifications={notifications}
        onLogout={handleLogout}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* 2. Main Portal Shell: Sidebar + Content Area */}
      <div className="flex-1 flex flex-row min-w-0">
        {/* Sidebar Navigation */}
        <StudentSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          student={student}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Tab View Content Viewport */}
        <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <StudentDashboardTab
              student={student}
              courses={ACTIVE_COURSES}
              upcomingClasses={UPCOMING_CLASSES}
              notifications={notifications}
              tests={tests}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onStartTest={(test) => setActiveTimedTest(test)}
              onOpenUdemyCourse={(course) => setActiveUdemyCourse(course)}
            />
          )}

          {activeTab === 'profile' && (
            <StudentProfileTab
              student={student}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {activeTab === 'learning' && (
            <StudentLearningTab
              videos={RECORDED_VIDEOS}
              notes={NOTES_PDFS}
              pyqs={PYQS_LIST}
              assignments={assignments}
              onPlayVideo={(v) => setActiveVideo(v)}
              onSubmitAssignment={(a) => setActiveAssignmentSubmit(a)}
              onOpenUdemyCourse={(course) => setActiveUdemyCourse(course)}
            />
          )}

          {activeTab === 'attendance' && (
            <StudentAttendanceTab
              student={student}
              subjects={ATTENDANCE_SUBJECTS}
              logs={ATTENDANCE_LOGS}
            />
          )}

          {activeTab === 'tests' && (
            <StudentTestsTab
              tests={tests}
              onStartTest={(test) => setActiveTimedTest(test)}
            />
          )}

          {activeTab === 'fees' && (
            <StudentFeesTab
              student={student}
              breakdown={FEE_BREAKDOWN}
              transactions={FEE_TRANSACTIONS}
              onViewReceipt={(tx) => setActiveReceipt(tx)}
            />
          )}
        </main>
      </div>

      {/* 3. Interactive Modals */}
      {/* Timed Test Simulator */}
      {activeTimedTest && (
        <TimedTestModal
          test={activeTimedTest}
          onClose={() => setActiveTimedTest(null)}
          onComplete={handleTestComplete}
        />
      )}

      {/* Video Lecture Player */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Official Fee Receipt Modal */}
      {activeReceipt && (
        <FeeReceiptModal
          transaction={activeReceipt}
          student={student}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Assignment Submit Modal */}
      {activeAssignmentSubmit && (
        <SubmitAssignmentModal
          assignment={activeAssignmentSubmit}
          onClose={() => setActiveAssignmentSubmit(null)}
          onSubmitSuccess={handleAssignmentSubmitted}
        />
      )}

      {/* Udemy Full Course Classroom Player */}
      {activeUdemyCourse && (
        <UdemyPlayerModal
          course={activeUdemyCourse}
          isOpen={!!activeUdemyCourse}
          onClose={() => setActiveUdemyCourse(null)}
          studentId={student.id}
          studentName={student.name}
        />
      )}
    </div>
  );
}
