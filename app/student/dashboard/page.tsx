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

  // Active student state: lazy initializer prevents "Aarav Sharma" dummy flash when logged in as another student
  const [student, setStudent] = useState<StudentProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedPhone = localStorage.getItem('msi_active_student_phone') || '';
        const cleanPhone = storedPhone.replace(/\D/g, '').slice(-10);

        if (cleanPhone) {
          const cachedProfileStr = localStorage.getItem(`msi_student_profile_${cleanPhone}`);
          if (cachedProfileStr) {
            const cached = JSON.parse(cachedProfileStr);
            if (cached && (cached.name || cached.phone)) {
              return cached;
            }
          }

          const storedName = localStorage.getItem('msi_active_student_name');
          const storedStream = localStorage.getItem('msi_active_student_stream');
          const storedEmail = localStorage.getItem('msi_active_student_email');
          const currentYear = new Date().getFullYear();
          const nextYear = currentYear + 1;
          const last4 = cleanPhone.slice(-4);

          return {
            id: `msi-stu-${last4}`,
            name: storedName || `Student ${last4}`,
            email: storedEmail || `student.${last4}@msi-institutes.edu.in`,
            phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
            dob: '2003-01-15',
            age: 22,
            gender: 'Male',
            enrollmentNo: `MSI/${currentYear}/${last4}`,
            rollNo: `${currentYear.toString().slice(-2)}-MSI-${last4}`,
            batch: storedStream
              ? `${storedStream}, ${currentYear}–${nextYear}`
              : `PCS-J Punjab Judicial Services, ${currentYear}–${nextYear}`,
            courseTitle: storedStream || 'PCS-J Punjab Judicial Services',
            semester: `Academic Year ${currentYear}–${nextYear}`,
            avatarUrl: '/images/avatars/avatar-1.webp',
            bloodGroup: 'B+',
            address: 'Kharar, Mohali, Punjab',
            guardianName: 'Guardian',
            guardianContact: `+91 ${cleanPhone.slice(0, 5)} 00000`,
            admissionDate: `01 July ${currentYear}`,
            validUntil: `30 June ${nextYear + 1}`,
          };
        }
      } catch (err) {
        console.warn('[Dashboard] Initial student state error:', err);
      }
    }
    return INITIAL_STUDENT_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<StudentModuleTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync active user details and permanent profile from localStorage & API on mount
  useEffect(() => {
    const loadStudentProfile = async () => {
      try {
        const storedPhone = localStorage.getItem('msi_active_student_phone') || '';
        const cleanPhone = storedPhone.replace(/\D/g, '').slice(-10);

        // 1. Instant load from phone-keyed localStorage if available
        if (cleanPhone) {
          const cachedProfileStr = localStorage.getItem(`msi_student_profile_${cleanPhone}`);
          if (cachedProfileStr) {
            try {
              const cached = JSON.parse(cachedProfileStr);
              if (cached && (cached.name || cached.phone)) {
                setStudent((prev) => ({ ...prev, ...cached }));
              }
            } catch (parseErr) {
              console.warn('[Dashboard] Cache parse error:', parseErr);
            }
          }

          // 2. Fetch fresh permanently saved profile from backend storage
          try {
            const res = await fetch(`/api/student/profile?phone=${cleanPhone}`);
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.profile) {
                setStudent(data.profile);
                localStorage.setItem(
                  `msi_student_profile_${cleanPhone}`,
                  JSON.stringify(data.profile)
                );
                localStorage.setItem('msi_active_student_profile', JSON.stringify(data.profile));
                if (data.profile.name)
                  localStorage.setItem('msi_active_student_name', data.profile.name);
                if (data.profile.email)
                  localStorage.setItem('msi_active_student_email', data.profile.email);
                if (data.profile.courseTitle)
                  localStorage.setItem('msi_active_student_stream', data.profile.courseTitle);
                return;
              }
            }
          } catch (apiErr) {
            console.warn('[Dashboard] API fetch skipped, using cached profile:', apiErr);
          }
        }

        // 3. Fallback: personalise with active session keys if no full profile exists yet
        const storedName = localStorage.getItem('msi_active_student_name');
        const storedEmail = localStorage.getItem('msi_active_student_email');
        const storedStream = localStorage.getItem('msi_active_student_stream');

        if (storedName || storedPhone || storedEmail) {
          setStudent((prev) => ({
            ...prev,
            name: storedName || (cleanPhone ? `Student ${cleanPhone.slice(-4)}` : prev.name),
            phone: cleanPhone
              ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
              : storedPhone || prev.phone,
            email:
              storedEmail ||
              (cleanPhone
                ? `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`
                : prev.email),
            courseTitle: storedStream || prev.courseTitle,
            batch: storedStream
              ? `${storedStream}, ${new Date().getFullYear()}–${new Date().getFullYear() + 1}`
              : prev.batch,
            enrollmentNo: cleanPhone
              ? `MSI/${new Date().getFullYear()}/${cleanPhone.slice(-4)}`
              : prev.enrollmentNo,
            rollNo: cleanPhone
              ? `${new Date().getFullYear().toString().slice(-2)}-MSI-${cleanPhone.slice(-4)}`
              : prev.rollNo,
          }));
        }
      } catch (err) {
        console.error('[Dashboard] Error loading student profile:', err);
      }
    };

    loadStudentProfile();
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

  // Permanent profile update: updates React state, localStorage by phone, and server storage
  const handleUpdateProfile = async (updated: StudentProfile) => {
    // 1. Get current logged-in phone
    const currentActivePhone = (localStorage.getItem('msi_active_student_phone') || '')
      .replace(/\D/g, '')
      .slice(-10);

    // 2. Check if the user modified the phone number in the form
    const formPhoneDigits = updated.phone ? updated.phone.replace(/\D/g, '').slice(-10) : '';
    const targetCleanPhone =
      formPhoneDigits.length === 10 ? formPhoneDigits : currentActivePhone;

    // Format phone nicely
    const formattedPhone =
      targetCleanPhone.length === 10
        ? `+91 ${targetCleanPhone.slice(0, 5)} ${targetCleanPhone.slice(5)}`
        : updated.phone;

    const mergedUpdated: StudentProfile = {
      ...updated,
      phone: formattedPhone,
    };

    setStudent(mergedUpdated);

    try {
      if (targetCleanPhone) {
        localStorage.setItem(
          `msi_student_profile_${targetCleanPhone}`,
          JSON.stringify(mergedUpdated)
        );
        localStorage.setItem('msi_active_student_phone', targetCleanPhone);
      }
      localStorage.setItem('msi_active_student_profile', JSON.stringify(mergedUpdated));
      if (mergedUpdated.name) localStorage.setItem('msi_active_student_name', mergedUpdated.name);
      if (mergedUpdated.email) localStorage.setItem('msi_active_student_email', mergedUpdated.email);
      if (mergedUpdated.courseTitle)
        localStorage.setItem('msi_active_student_stream', mergedUpdated.courseTitle);

      // Save permanently to server backend
      if (targetCleanPhone) {
        const res = await fetch('/api/student/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: targetCleanPhone,
            previousPhone:
              currentActivePhone && currentActivePhone !== targetCleanPhone
                ? currentActivePhone
                : undefined,
            profile: mergedUpdated,
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.profile) {
            setStudent(resData.profile);
            localStorage.setItem(
              `msi_student_profile_${targetCleanPhone}`,
              JSON.stringify(resData.profile)
            );
            localStorage.setItem('msi_active_student_profile', JSON.stringify(resData.profile));
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync profile update:', err);
    }
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
        onOpenProfile={() => setActiveTab('profile')}
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
