'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut } from 'lucide-react';
import StudentHeader from '@/components/student/StudentHeader';
import StudentSidebar, { StudentModuleTab } from '@/components/student/StudentSidebar';
import StudentDashboardTab from '@/components/student/StudentDashboardTab';
import StudentProfileTab from '@/components/student/StudentProfileTab';
import StudentLearningTab from '@/components/student/StudentLearningTab';
import StudentAttendanceTab from '@/components/student/StudentAttendanceTab';
import StudentTestsTab from '@/components/student/StudentTestsTab';
import StudentFeesTab, { FeePaymentRequest } from '@/components/student/StudentFeesTab';
import TimedTestModal from '@/components/student/TimedTestModal';
import VideoPlayerModal from '@/components/student/VideoPlayerModal';
import FeeReceiptModal from '@/components/student/FeeReceiptModal';
import SubmitAssignmentModal from '@/components/student/SubmitAssignmentModal';
import UdemyPlayerModal from '@/components/student/UdemyPlayerModal';
import RazorpayCheckoutModal, { RazorpayPaymentSuccessInfo } from '@/components/payments/RazorpayCheckoutModal';
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
  FeeBreakdownItem,
  AssignmentItem,
} from '@/components/student/data/studentMockData';
import { UdemyCourse, syncEnrollmentsFromServer } from '@/lib/lmsStore';

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
  const [revocationModalOpen, setRevocationModalOpen] = useState(false);
  const [revocationCountdown, setRevocationCountdown] = useState(4);

  const triggerInstantRevocation = useCallback(() => {
    setRevocationModalOpen(true);
    try {
      localStorage.removeItem('msi_student_logged_in');
      localStorage.removeItem('msi_active_student_phone');
      localStorage.removeItem('msi_active_student_name');
      localStorage.removeItem('msi_active_student_email');
      localStorage.removeItem('msi_active_student_stream');
      localStorage.removeItem('msi_active_student_profile');
    } catch (_) {}
  }, []);

  // Real-time revocation listener via BroadcastChannel
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('msi_sync_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'STUDENT_DELETED') {
            const pPhone = (event.data.studentPhone || '').replace(/\D/g, '').slice(-10);
            const pId = (event.data.studentId || '').toLowerCase().trim();
            const storedPhone = (localStorage.getItem('msi_active_student_phone') || '').replace(/\D/g, '').slice(-10);
            const currPhone = (student.phone || '').replace(/\D/g, '').slice(-10);
            const currId = (student.id || '').toLowerCase().trim();

            if (
              (pPhone && (pPhone === storedPhone || pPhone === currPhone)) ||
              (pId && pId === currId)
            ) {
              triggerInstantRevocation();
            }
          }
        };
      }
    } catch (_) {}

    return () => {
      if (bc) bc.close();
    };
  }, [student, triggerInstantRevocation]);

  // Periodic heartbeat verification with server disk
  useEffect(() => {
    const checkActiveStatus = async () => {
      const storedPhone = (localStorage.getItem('msi_active_student_phone') || '').replace(/\D/g, '').slice(-10);
      if (!storedPhone) return;

      try {
        const res = await fetch(`/api/student/profile?phone=${storedPhone}`, { cache: 'no-store' });
        if (res.status === 403 || res.status === 404) {
          triggerInstantRevocation();
          return;
        }
        const data = await res.json();
        if (data.terminated || data.success === false) {
          triggerInstantRevocation();
        }
      } catch (_) {}
    };

    const interval = setInterval(checkActiveStatus, 3500);
    return () => clearInterval(interval);
  }, [triggerInstantRevocation]);

  // Countdown timer for automatic logout redirect
  useEffect(() => {
    if (!revocationModalOpen) return;
    if (revocationCountdown <= 0) {
      router.push('/login');
      return;
    }
    const timer = setTimeout(() => {
      setRevocationCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [revocationModalOpen, revocationCountdown, router]);

  // Sync active user details and permanent profile from localStorage & API on mount
  useEffect(() => {
    const loadStudentProfile = async () => {
      try {
        const isLoggedIn = localStorage.getItem('msi_student_logged_in') === 'true';
        const storedPhone = localStorage.getItem('msi_active_student_phone') || '';
        const cleanPhone = storedPhone.replace(/\D/g, '').slice(-10);

        if (!isLoggedIn && !cleanPhone) {
          router.push('/student/login');
          return;
        }

        try {
          await syncEnrollmentsFromServer();
        } catch (_) {}

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
            if (res.status === 403 || res.status === 404) {
              triggerInstantRevocation();
              return;
            }
            if (res.ok) {
              const data = await res.json();
              if (data.terminated) {
                triggerInstantRevocation();
                return;
              }
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
        // 4. Restore custom fee ledger if student previously paid dues online
        if (cleanPhone) {
          try {
            const cachedTxns = localStorage.getItem(`msi_fee_transactions_${cleanPhone}`);
            if (cachedTxns) setFeeTransactions(JSON.parse(cachedTxns));
            const cachedBreakdown = localStorage.getItem(`msi_fee_breakdown_${cleanPhone}`);
            if (cachedBreakdown) setFeeBreakdown(JSON.parse(cachedBreakdown));
          } catch (e) {
            console.warn('Could not read cached fee ledger:', e);
          }
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
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdownItem[]>(FEE_BREAKDOWN);
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(FEE_TRANSACTIONS);

  // Active Modals
  const [activeTimedTest, setActiveTimedTest] = useState<TestItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<RecordedVideo | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<FeeTransaction | null>(null);
  const [activeAssignmentSubmit, setActiveAssignmentSubmit] = useState<AssignmentItem | null>(null);
  const [activeUdemyCourse, setActiveUdemyCourse] = useState<UdemyCourse | null>(null);
  const [activeLectureIndex, setActiveLectureIndex] = useState<number>(0);
  const [activeRazorpayFeePayment, setActiveRazorpayFeePayment] = useState<FeePaymentRequest | null>(null);

  // Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('msi_student_logged_in');
      localStorage.removeItem('msi_active_student_phone');
      localStorage.removeItem('msi_active_student_name');
      localStorage.removeItem('msi_active_student_email');
      localStorage.removeItem('msi_active_student_stream');
      localStorage.removeItem('msi_active_student_profile');
    } catch (err) {
      console.error(err);
    }
    router.push('/login');
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

  // Online Fee Payment Completion via Razorpay (Same authentic gateway options as Order Time)
  const handleFeePaymentSuccess = (info: RazorpayPaymentSuccessInfo) => {
    const paymentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newTxn: FeeTransaction = {
      id: `TXN-MSI-${info.razorpayPaymentId.slice(-6).toUpperCase()}`,
      receiptNo: info.receiptNumber,
      date: paymentDate,
      amount: info.amount,
      mode: 'UPI',
      status: 'Successful',
      remarks: `${info.courseTitle} (Online Razorpay Clearance)`,
    };

    const updatedTxns = [newTxn, ...feeTransactions];
    setFeeTransactions(updatedTxns);

    // Update Fee Breakdown item matching payment
    const updatedBreakdown = feeBreakdown.map((item) => {
      const match =
        info.courseTitle.toLowerCase().includes(item.category.toLowerCase().slice(0, 15)) ||
        item.category.toLowerCase().includes(info.courseTitle.toLowerCase().slice(0, 15));
      if (match && item.status === 'Pending') {
        return {
          ...item,
          status: 'Paid' as const,
          dueDate: `Cleared on ${paymentDate}`,
        };
      }
      return item;
    });
    setFeeBreakdown(updatedBreakdown);

    // Persist to student's localStorage ledger
    try {
      const cleanPhone = (localStorage.getItem('msi_active_student_phone') || student.phone || '')
        .replace(/\D/g, '')
        .slice(-10);
      if (cleanPhone) {
        localStorage.setItem(`msi_fee_transactions_${cleanPhone}`, JSON.stringify(updatedTxns));
        localStorage.setItem(`msi_fee_breakdown_${cleanPhone}`, JSON.stringify(updatedBreakdown));
      }
    } catch (e) {
      console.warn('Could not cache fee transactions:', e);
    }

    // Close Razorpay Modal & open official institutional tax invoice / receipt
    setActiveRazorpayFeePayment(null);
    setActiveReceipt(newTxn);
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
              onOpenUdemyCourse={(course, lectureIndex = 0) => {
                setActiveUdemyCourse(course);
                setActiveLectureIndex(lectureIndex);
              }}
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
              studentId={student.id}
              studentPhone={student.phone}
              videos={RECORDED_VIDEOS}
              notes={NOTES_PDFS}
              pyqs={PYQS_LIST}
              assignments={assignments}
              onPlayVideo={(v) => setActiveVideo(v)}
              onSubmitAssignment={(a) => setActiveAssignmentSubmit(a)}
              onOpenUdemyCourse={(course, lectureIndex = 0) => {
                setActiveUdemyCourse(course);
                setActiveLectureIndex(lectureIndex);
              }}
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
              breakdown={feeBreakdown}
              transactions={feeTransactions}
              onViewReceipt={(tx) => setActiveReceipt(tx)}
              onPayFee={(req) => setActiveRazorpayFeePayment(req)}
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
          initialLectureIndex={activeLectureIndex}
        />
      )}

      {/* Razorpay Authentic Gateway Modal for Student Fee Settlements (Exact same gateway options as order time) */}
      {activeRazorpayFeePayment && (
        <RazorpayCheckoutModal
          isOpen={!!activeRazorpayFeePayment}
          onClose={() => setActiveRazorpayFeePayment(null)}
          course={{
            id: activeRazorpayFeePayment.id,
            title: activeRazorpayFeePayment.title,
            price: activeRazorpayFeePayment.amount,
            originalPrice:
              activeRazorpayFeePayment.originalPrice || activeRazorpayFeePayment.amount,
          }}
          studentName={student.name}
          studentPhone={student.phone}
          onPaymentSuccess={handleFeePaymentSuccess}
        />
      )}

      {/* Immediate Session Revocation Modal on Administration Account Deletion */}
      {revocationModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-red-500 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider rounded-full mb-3">
              Access Revoked by Administration
            </span>
            <h3 className="font-serif text-xl font-bold text-[#10233F] mb-2">
              We are sorry, unable to access portal
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Your student account access has been cancelled or deactivated by Administration. Active session has been terminated immediately.
            </p>
            <div className="bg-red-50 rounded-2xl p-3 border border-red-100 text-xs text-red-700 font-medium mb-5">
              Redirecting to Portal Login in <strong className="font-mono text-sm">{revocationCountdown}s</strong>...
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 rounded-xl bg-[#89190E] hover:bg-[#68130B] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Return to Login Gateway</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
