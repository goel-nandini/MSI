'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeacherHeader from '@/components/teacher/TeacherHeader';
import TeacherSidebar, { TeacherModuleTab } from '@/components/teacher/TeacherSidebar';
import TeacherDashboardTab from '@/components/teacher/TeacherDashboardTab';
import TeacherContentTab from '@/components/teacher/TeacherContentTab';
import TeacherAssessmentTab from '@/components/teacher/TeacherAssessmentTab';
import TeacherMonitoringTab from '@/components/teacher/TeacherMonitoringTab';
import TeacherClassesTab from '@/components/teacher/TeacherClassesTab';
import TeacherCommunicationTab from '@/components/teacher/TeacherCommunicationTab';
import CreateTestModal from '@/components/teacher/CreateTestModal';
import ScheduleClassModal from '@/components/teacher/ScheduleClassModal';
import MarkAttendanceModal from '@/components/teacher/MarkAttendanceModal';
import ScheduleOneToOneModal from '@/components/teacher/ScheduleOneToOneModal';
import TeacherLectureModal from '@/components/teacher/TeacherLectureModal';
import EnrollStudentModal from '@/components/teacher/EnrollStudentModal';
import { AlertTriangle, LogOut } from 'lucide-react';
import {
  getStoredCourses,
  getStoredTeachers,
  syncTeachersFromServer,
  syncCoursesFromServer,
  buildTeacherProfileFromRecord,
  UdemyCourse,
  LMS_SYNC_EVENT,
  enrollStudentAction,
} from '@/lib/lmsStore';
import {
  TEACHER_PROFILES,
  ALL_TEACHER_COURSES,
  ALL_TEACHER_CONTENT,
  ALL_ASSESSMENTS,
  ALL_STUDENT_MONITORING,
  ALL_TEACHER_SCHEDULES,
  ALL_COMMUNICATIONS,
  ALL_ONE_TO_ONE_SESSIONS,
  TeacherProfile,
  TeacherCourse,
  TeacherContentItem,
  AssessmentItem,
  StudentMonitoringRecord,
  TeacherClassSchedule,
  CommunicationPost,
  OneToOneSession,
} from '@/components/teacher/data/teacherMockData';

export default function TeacherDashboardPage() {
  const router = useRouter();

  // Active Teacher Profile (Defaults to Law Faculty Dr. Ekta Gahlawat)
  const [activeTeacher, setActiveTeacher] = useState<TeacherProfile>(TEACHER_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<TeacherModuleTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Real LMS dynamic courses assigned by Super Admin
  const [lmsCourses, setLmsCourses] = useState<UdemyCourse[]>([]);
  const [selectedCourseForLectures, setSelectedCourseForLectures] = useState<UdemyCourse | null>(null);

  // Dynamic state repositories
  const [contentList, setContentList] = useState<TeacherContentItem[]>(ALL_TEACHER_CONTENT);
  const [assessmentsList, setAssessmentsList] = useState<AssessmentItem[]>(ALL_ASSESSMENTS);
  const [schedulesList, setSchedulesList] = useState<TeacherClassSchedule[]>(ALL_TEACHER_SCHEDULES);
  const [postsList, setPostsList] = useState<CommunicationPost[]>(ALL_COMMUNICATIONS);
  const [oneToOneList, setOneToOneList] = useState<OneToOneSession[]>(ALL_ONE_TO_ONE_SESSIONS);

  // Active Modals
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [isScheduleClassOpen, setIsScheduleClassOpen] = useState(false);
  const [activeAttendanceSession, setActiveAttendanceSession] = useState<TeacherClassSchedule | null>(null);
  const [isScheduleOneToOneOpen, setIsScheduleOneToOneOpen] = useState(false);
  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<UdemyCourse | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<{ id: string; name: string; phone: string; stream: string }[]>([]);
  const [isAccessRevoked, setIsAccessRevoked] = useState(false);

  // Synchronize LMS Courses assigned to this teacher from central store
  // Trigger instant session revocation and purge credentials
  const triggerInstantRevocation = () => {
    setIsAccessRevoked(true);
    try {
      localStorage.removeItem('msi_teacher_user');
      localStorage.removeItem('msi_teacher_logged_in');
      localStorage.removeItem('msi_active_teacher_id');
      localStorage.removeItem('msi_active_teacher_name');
      localStorage.removeItem('msi_active_teacher_email');
      localStorage.removeItem('msi_active_teacher_phone');
    } catch (_) {}
  };

  // Check if current faculty was deleted by administration
  const checkRevocation = async (forceDeletedPayload?: {
    teacherId?: string;
    teacherEmail?: string;
    teacherPhone?: string;
  }) => {
    if (typeof window === 'undefined') return;
    try {
      const storedId = (localStorage.getItem('msi_active_teacher_id') || '').toLowerCase().trim();
      const storedEmail = (localStorage.getItem('msi_active_teacher_email') || '').toLowerCase().trim();
      const storedPhone = (localStorage.getItem('msi_active_teacher_phone') || '').replace(/\D/g, '').slice(-10);

      // Fast check directly from broadcast event
      if (forceDeletedPayload) {
        const pId = (forceDeletedPayload.teacherId || '').toLowerCase().trim();
        const pEmail = (forceDeletedPayload.teacherEmail || '').toLowerCase().trim();
        const pPhone = (forceDeletedPayload.teacherPhone || '').replace(/\D/g, '').slice(-10);

        const currentId = activeTeacher.id?.toLowerCase().trim();
        const currentEmail = activeTeacher.email?.toLowerCase().trim();
        const currentPhone = (activeTeacher.phone || '').replace(/\D/g, '').slice(-10);

        if (
          (pId && (pId === currentId || pId === storedId)) ||
          (pEmail && (pEmail === currentEmail || pEmail === storedEmail)) ||
          (pPhone.length >= 10 && (pPhone === currentPhone || pPhone === storedPhone))
        ) {
          triggerInstantRevocation();
          return;
        }
      }

      if (!storedId && !storedEmail && !storedPhone) return;

      const teachers = await syncTeachersFromServer();
      const stillExists = teachers.some((t) => {
        const tId = (t.id || '').toLowerCase().trim();
        const tEmail = (t.email || '').toLowerCase().trim();
        const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);
        return (
          (storedId && tId === storedId) ||
          (storedEmail && tEmail === storedEmail) ||
          (storedPhone.length >= 10 && tPhone === storedPhone)
        );
      });

      if (!stillExists) {
        triggerInstantRevocation();
      }
    } catch (err) {
      console.warn('Revocation check error:', err);
    }
  };

  // Synchronize LMS Courses assigned to this teacher from central store
  const loadLmsCourses = async (overrideTeacher?: TeacherProfile) => {
    try {
      await syncCoursesFromServer();
      await syncTeachersFromServer();
    } catch (_) {}
    const tProfile = overrideTeacher || activeTeacher;
    const all = getStoredCourses();
    const storedTeachers = getStoredTeachers();

    const storedTeacherId = (typeof window !== 'undefined' ? localStorage.getItem('msi_active_teacher_id') || '' : '').toLowerCase().trim();
    const storedTeacherEmail = (typeof window !== 'undefined' ? localStorage.getItem('msi_active_teacher_email') || '' : '').toLowerCase().trim();

    const teacherRec = storedTeachers.find(
      (t) =>
        (t.id && (t.id === tProfile.id || (storedTeacherId && t.id.toLowerCase() === storedTeacherId))) ||
        (t.email && (
          (tProfile.email && t.email.toLowerCase() === tProfile.email.toLowerCase()) ||
          (storedTeacherEmail && t.email.toLowerCase() === storedTeacherEmail)
        )) ||
        (t.name && tProfile.name && (
          t.name.toLowerCase().includes(tProfile.name.toLowerCase()) ||
          tProfile.name.toLowerCase().includes(t.name.toLowerCase())
        ))
    );
    const assignedIds = teacherRec?.assignedCourseIds || [];

    const assigned = all.filter((c) => {
      // 1. Course ID is in faculty's assignedCourseIds list
      if (assignedIds.includes(c.id)) return true;
      // 2. Course instructorId matches faculty ID
      if (c.instructorId && (c.instructorId === tProfile.id || (storedTeacherId && c.instructorId.toLowerCase() === storedTeacherId))) return true;
      // 3. Course instructorName matches
      if (tProfile.name && c.instructorName && (
        c.instructorName.toLowerCase().includes(tProfile.name.toLowerCase()) ||
        tProfile.name.toLowerCase().includes(c.instructorName.toLowerCase())
      )) return true;
      return false;
    });

    setLmsCourses(assigned);
  };

  // Synchronize active teacher from localStorage & server store on mount
  useEffect(() => {
    const initTeacher = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedIn = localStorage.getItem('msi_teacher_logged_in') === 'true';
        const storedEmail = (localStorage.getItem('msi_active_teacher_email') || '').toLowerCase().trim();
        const storedName = (localStorage.getItem('msi_active_teacher_name') || '').trim();
        const storedPhone = (localStorage.getItem('msi_active_teacher_phone') || '').replace(/\D/g, '');
        const storedId = localStorage.getItem('msi_active_teacher_id') || '';

        // If not logged in and no teacher credentials, redirect to login
        if (!storedLoggedIn && !storedEmail && !storedName && !storedId) {
          router.push('/teacher/login');
          return;
        }

        try {
          await syncTeachersFromServer();
        } catch (_) {}

        // Load all registered students for faculty course enrollment
        try {
          const res = await fetch('/api/admin/students');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setRegisteredStudents(
                data.map((s: any) => ({
                  id: s.id || s.rollNo || s.phone,
                  name: s.name,
                  phone: s.phone,
                  stream: s.stream || 'Law',
                }))
              );
            }
          }
        } catch (_) {}

        // First check stored teachers (includes newly created faculty from Super Admin / disk)
        const storedRecs = getStoredTeachers();
        const recMatched = storedRecs.find((r) => {
          if (storedId && r.id === storedId) return true;
          if (storedEmail && r.email.toLowerCase().trim() === storedEmail) return true;
          if (storedName && r.name.toLowerCase().trim() === storedName.toLowerCase()) return true;
          if (storedPhone && r.phone && r.phone.replace(/\D/g, '').includes(storedPhone.slice(-10))) return true;
          return false;
        });

        if (recMatched) {
          const profile = buildTeacherProfileFromRecord(recMatched);
          setActiveTeacher(profile);
          loadLmsCourses(profile);
          return;
        }

        // Second check static mock profiles
        const matched = TEACHER_PROFILES.find((t) => {
          if (storedEmail && t.email.toLowerCase() === storedEmail) return true;
          if (storedName && t.name.toLowerCase().includes(storedName.toLowerCase())) return true;
          if (storedPhone && t.phone.replace(/\D/g, '').includes(storedPhone.slice(-10))) return true;
          return false;
        });

        if (matched) {
          setActiveTeacher(matched);
          loadLmsCourses(matched);
        } else if (storedName || storedEmail || storedId) {
          // Record was deleted by administration: trigger revocation notice
          triggerInstantRevocation();
        }
      }
    };

    initTeacher();
  }, []);

  // Watch for activeTeacher changes, BroadcastChannel events, and background heartbeat
  useEffect(() => {
    loadLmsCourses();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('msi_sync_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'FACULTY_DELETED') {
            checkRevocation(event.data);
          } else if (
            event.data?.type === 'COURSE_ASSIGNED' ||
            event.data?.type === 'COURSE_PUBLISHED' ||
            event.data?.type === 'COURSE_CREATED' ||
            event.data?.type === 'COURSE_DELETED'
          ) {
            loadLmsCourses();
          }
        };
      }
    } catch (_) {}

    const handleSync = () => {
      checkRevocation();
      loadLmsCourses();
    };

    window.addEventListener(LMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('msi_courses_sync', handleSync);

    // Periodic heartbeat sync so changes in admin reflect within 3 seconds
    const interval = setInterval(() => {
      checkRevocation();
      loadLmsCourses();
    }, 3000);

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
      window.removeEventListener(LMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('msi_courses_sync', handleSync);
    };
  }, [activeTeacher.id, activeTeacher.name, activeTeacher.email]);

  // Automatic logout redirect after revocation
  useEffect(() => {
    if (isAccessRevoked) {
      const timer = setTimeout(() => {
        router.push('/teacher/login');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isAccessRevoked, router]);

  // --------------------------------------------------------------------------
  // ROLE-BASED DATA ISOLATION ENFORCEMENT:
  // "Teacher data must always be filtered through course/subject/student assignments.
  // A JEE teacher must not see CLAT students unless explicitly assigned."
  // --------------------------------------------------------------------------
  const filteredCourses = ALL_TEACHER_COURSES.filter(
    (c) => c.stream === activeTeacher.stream && activeTeacher.assignedCourseCodes.includes(c.code)
  );

  const filteredContent = contentList.filter((c) => c.stream === activeTeacher.stream);

  const filteredAssessments = assessmentsList.filter((a) => a.stream === activeTeacher.stream);

  const filteredStudents = ALL_STUDENT_MONITORING.filter(
    (s) => s.stream === activeTeacher.stream
  );

  const filteredSchedules = schedulesList.filter((s) => s.stream === activeTeacher.stream);

  const filteredPosts = postsList.filter((p) => p.stream === activeTeacher.stream);

  const filteredOneToOne = oneToOneList.filter((o) => o.stream === activeTeacher.stream);

  // Switch Faculty handler (Demonstrating Role-Based Data Isolation)
  const handleSwitchTeacher = (teacherId: string) => {
    const found = TEACHER_PROFILES.find((t) => t.id === teacherId);
    if (found) {
      setActiveTeacher(found);
    }
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('msi_teacher_logged_in');
      localStorage.removeItem('msi_active_teacher_id');
      localStorage.removeItem('msi_active_teacher_name');
      localStorage.removeItem('msi_active_teacher_email');
      localStorage.removeItem('msi_active_teacher_phone');
      localStorage.removeItem('msi_active_teacher_stream');
    } catch (err) {
      console.error(err);
    }
    router.push('/login');
  };

  // Content Publish / Unpublish Toggle
  const handleTogglePublish = (contentId: string) => {
    setContentList((prev) =>
      prev.map((item) =>
        item.id === contentId ? { ...item, isPublished: !item.isPublished } : item
      )
    );
  };

  // Add Assessment
  const handleCreateAssessment = (newAsmt: AssessmentItem) => {
    setAssessmentsList((prev) => [newAsmt, ...prev]);
  };

  // Add Schedule
  const handleScheduleClass = (newClass: TeacherClassSchedule) => {
    setSchedulesList((prev) => [newClass, ...prev]);
  };

  // Save Attendance Sheet
  const handleSaveAttendance = (
    sessionId: string,
    attendanceMap: Record<string, 'Present' | 'Absent' | 'Late'>
  ) => {
    alert('Attendance successfully recorded and synced with Bar Council statutory records!');
  };

  // Add Communication Post
  const handleAddPost = (post: CommunicationPost) => {
    setPostsList((prev) => [post, ...prev]);
  };

  // Add 1-on-1 Session
  const handleScheduleOneToOne = (session: OneToOneSession) => {
    setOneToOneList((prev) => [session, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EF] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      {/* 1. Header Bar with Stream Switcher */}
      <TeacherHeader
        teacher={activeTeacher}
        allTeachers={TEACHER_PROFILES}
        onSwitchTeacher={handleSwitchTeacher}
        onLogout={handleLogout}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* 2. Main Portal Shell: Sidebar + Content Viewport */}
      <div className="flex-1 flex flex-row">
        <TeacherSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          teacher={activeTeacher}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <TeacherDashboardTab
              teacher={activeTeacher}
              courses={filteredCourses}
              lmsCourses={lmsCourses}
              schedules={filteredSchedules}
              assessments={filteredAssessments}
              totalStudents={filteredStudents.length}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onLaunchAttendance={(session) => setActiveAttendanceSession(session)}
              onOpenLectureModal={(crs) => setSelectedCourseForLectures(crs)}
              onOpenEnrollModal={(crs) => {
                setSelectedCourseForEnroll(crs || null);
                setIsEnrollStudentOpen(true);
              }}
            />
          )}

          {activeTab === 'content' && (
            <TeacherContentTab
              content={filteredContent}
              courses={filteredCourses}
              lmsCourses={lmsCourses}
              stream={activeTeacher.stream}
              onTogglePublish={handleTogglePublish}
              onOpenLectureModal={(crs) => setSelectedCourseForLectures(crs)}
            />
          )}

          {activeTab === 'assessment' && (
            <TeacherAssessmentTab
              assessments={filteredAssessments}
              courses={filteredCourses}
              stream={activeTeacher.stream}
              onOpenCreateTest={() => setIsCreateTestOpen(true)}
            />
          )}

          {activeTab === 'monitoring' && (
            <TeacherMonitoringTab
              students={filteredStudents}
              courses={filteredCourses}
              lmsCourses={lmsCourses}
              stream={activeTeacher.stream}
              registeredStudents={registeredStudents}
              onOpenEnrollModal={(crs) => {
                setSelectedCourseForEnroll(crs || null);
                setIsEnrollStudentOpen(true);
              }}
              activeTeacherName={activeTeacher.name}
              activeTeacherId={activeTeacher.id}
            />
          )}

          {activeTab === 'classes' && (
            <TeacherClassesTab
              schedules={filteredSchedules}
              courses={filteredCourses}
              students={filteredStudents}
              stream={activeTeacher.stream}
              onOpenScheduleClass={() => setIsScheduleClassOpen(true)}
              onLaunchAttendance={(session) => setActiveAttendanceSession(session)}
            />
          )}

          {activeTab === 'communication' && (
            <TeacherCommunicationTab
              posts={filteredPosts}
              oneToOneSessions={filteredOneToOne}
              courses={filteredCourses}
              students={filteredStudents}
              stream={activeTeacher.stream}
              onAddPost={handleAddPost}
              onOpenScheduleOneToOne={() => setIsScheduleOneToOneOpen(true)}
            />
          )}
        </main>
      </div>

      {/* 3. Interactive Modals */}
      {/* Teacher Lecture Studio Modal (Lecture 1, Lecture 2, etc.) */}
      {selectedCourseForLectures && (
        <TeacherLectureModal
          course={selectedCourseForLectures}
          isOpen={!!selectedCourseForLectures}
          onClose={() => setSelectedCourseForLectures(null)}
          onLectureSaved={() => {
            loadLmsCourses();
            const refreshed = getStoredCourses().find((c) => c.id === selectedCourseForLectures.id);
            if (refreshed) setSelectedCourseForLectures(refreshed);
          }}
          facultyName={activeTeacher.name}
        />
      )}

      {/* Create Test Modal */}
      {isCreateTestOpen && (
        <CreateTestModal
          courses={filteredCourses}
          stream={activeTeacher.stream}
          onClose={() => setIsCreateTestOpen(false)}
          onCreate={handleCreateAssessment}
        />
      )}

      {/* Schedule Class Modal */}
      {isScheduleClassOpen && (
        <ScheduleClassModal
          courses={filteredCourses}
          stream={activeTeacher.stream}
          onClose={() => setIsScheduleClassOpen(false)}
          onSchedule={handleScheduleClass}
        />
      )}

      {/* Mark Attendance Modal */}
      {activeAttendanceSession && (
        <MarkAttendanceModal
          session={activeAttendanceSession}
          students={filteredStudents}
          onClose={() => setActiveAttendanceSession(null)}
          onSave={handleSaveAttendance}
        />
      )}

      {/* Schedule 1-on-1 Modal */}
      {isScheduleOneToOneOpen && (
        <ScheduleOneToOneModal
          students={filteredStudents}
          stream={activeTeacher.stream}
          onClose={() => setIsScheduleOneToOneOpen(false)}
          onSchedule={handleScheduleOneToOne}
        />
      )}

      {/* Enroll Student into Faculty Course Modal */}
      {isEnrollStudentOpen && (
        <EnrollStudentModal
          isOpen={isEnrollStudentOpen}
          onClose={() => setIsEnrollStudentOpen(false)}
          courses={lmsCourses}
          preselectedCourseId={selectedCourseForEnroll?.id}
          students={registeredStudents}
          facultyName={activeTeacher.name}
          onEnroll={async (studentPhone, courseId, note) => {
            const crs = lmsCourses.find((c) => c.id === courseId) || getStoredCourses().find((c) => c.id === courseId);
            const matchedStudent = registeredStudents.find((s) => s.phone === studentPhone);
            await enrollStudentAction({
              studentPhone,
              studentName: matchedStudent?.name || '',
              courseId,
              courseTitle: crs?.title || '',
              assignedBy: 'teacher',
              assignedByName: activeTeacher.name,
              assignedByTeacherId: activeTeacher.id,
              progressPercentage: 0,
              completedLectureIds: [],
            });
            try {
              if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const bc = new BroadcastChannel('msi_sync_channel');
                bc.postMessage({
                  type: 'STUDENT_ENROLLED',
                  studentPhone,
                  courseId,
                  assignedBy: 'teacher',
                  assignedByName: activeTeacher.name,
                });
                bc.close();
              }
            } catch (_) {}
            alert(`Student successfully enrolled into "${crs?.title || 'Course'}"!`);
            setIsEnrollStudentOpen(false);
            loadLmsCourses();
          }}
        />
      )}

      {/* Critical Modal: Faculty Access Revoked by Administration */}
      {isAccessRevoked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-7 text-center shadow-2xl border-2 border-red-300">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Notice from MSI Governance Directorate
            </span>
            <h3 className="font-serif text-xl font-bold text-gray-900 mt-3 mb-2">
              Faculty Access Revoked
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Aapka faculty account MSI Group of Institutes administration dwaara permanently remove / terminate kar diya gaya hai. Portal session band kar diya gaya hai.
            </p>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 mb-6">
              In case of discrepancy, kindly contact the Super Admin Directorate at <strong className="text-gray-800">admin@msi-institutes.edu.in</strong>.
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('msi_teacher_user');
                  localStorage.removeItem('msi_teacher_logged_in');
                  localStorage.removeItem('msi_active_teacher_id');
                } catch (_) {}
                router.push('/login');
              }}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
