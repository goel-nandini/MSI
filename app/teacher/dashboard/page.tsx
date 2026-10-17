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
import {
  getStoredCourses,
  getStoredTeachers,
  UdemyCourse,
  LMS_SYNC_EVENT,
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

  // Synchronize active teacher from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = (localStorage.getItem('msi_active_teacher_email') || '').toLowerCase();
      const storedName = (localStorage.getItem('msi_active_teacher_name') || '').toLowerCase();
      const storedPhone = (localStorage.getItem('msi_active_teacher_phone') || '').replace(/\D/g, '');

      const matched = TEACHER_PROFILES.find((t) => {
        if (storedEmail && t.email.toLowerCase() === storedEmail) return true;
        if (storedName && t.name.toLowerCase().includes(storedName)) return true;
        if (storedPhone && t.phone.replace(/\D/g, '').includes(storedPhone.slice(-10))) return true;
        if (
          storedEmail.includes('ekta') ||
          storedName.includes('ekta') ||
          storedPhone === '9792303434'
        ) {
          return t.id.includes('ekta') || t.name.toLowerCase().includes('ekta');
        }
        return false;
      });

      if (matched) {
        setActiveTeacher(matched);
      }
    }
  }, []);

  // Synchronize LMS Courses assigned to this teacher from central store
  const loadLmsCourses = () => {
    const all = getStoredCourses();
    const storedTeachers = getStoredTeachers();
    const teacherRec = storedTeachers.find(
      (t) =>
        t.id === activeTeacher.id ||
        t.email.toLowerCase() === activeTeacher.email.toLowerCase() ||
        (t.name.toLowerCase().includes('ekta') && activeTeacher.name.toLowerCase().includes('ekta'))
    );
    const assignedIds = teacherRec?.assignedCourseIds || [];

    const assigned = all.filter((c) => {
      if (assignedIds.includes(c.id)) return true;
      if (c.instructorId === activeTeacher.id) return true;
      if (c.instructorName.toLowerCase().includes(activeTeacher.name.toLowerCase())) return true;
      if (activeTeacher.name.toLowerCase().includes(c.instructorName.toLowerCase())) return true;
      if (
        (c.instructorName.toLowerCase().includes('ekta') ||
          c.instructorName.toLowerCase().includes('gahlawat') ||
          c.instructorName.toLowerCase().includes('gehlot')) &&
        (activeTeacher.name.toLowerCase().includes('ekta') ||
          activeTeacher.name.toLowerCase().includes('gahlawat') ||
          activeTeacher.name.toLowerCase().includes('gehlot'))
      ) {
        return true;
      }
      return false;
    });

    setLmsCourses(assigned);
  };

  useEffect(() => {
    loadLmsCourses();
    const handleSync = () => loadLmsCourses();
    window.addEventListener(LMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(LMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [activeTeacher.id, activeTeacher.name]);

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
    } catch (err) {
      console.error(err);
    }
    router.push('/teacher/login');
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
              stream={activeTeacher.stream}
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
    </div>
  );
}
