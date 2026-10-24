'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  CalendarCheck,
  Award,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { StudentMonitoringRecord, TeacherCourse } from './data/teacherMockData';
import { UdemyCourse, CourseEnrollment, getStoredEnrollments, LMS_SYNC_EVENT } from '@/lib/lmsStore';

interface TeacherMonitoringTabProps {
  students: StudentMonitoringRecord[];
  courses: TeacherCourse[];
  lmsCourses?: UdemyCourse[];
  stream: 'Law' | 'JEE';
  registeredStudents?: { id: string; name: string; phone: string; stream: string }[];
  onOpenEnrollModal?: (course?: UdemyCourse) => void;
  activeTeacherName?: string;
  activeTeacherId?: string;
}

export default function TeacherMonitoringTab({
  students,
  courses,
  lmsCourses = [],
  stream,
  registeredStudents = [],
  onOpenEnrollModal,
  activeTeacherName = 'Dr. Ekta Gahlawat',
  activeTeacherId = 'fac-law-ekta',
}: TeacherMonitoringTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Safe' | 'Attention' | 'Critical'>('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentMonitoringRecord | null>(null);

  // Real-time enrollments for this faculty
  const [facultyEnrollments, setFacultyEnrollments] = useState<CourseEnrollment[]>([]);

  const loadFacultyEnrollments = () => {
    try {
      const all = getStoredEnrollments();
      const myCourseIds = lmsCourses.map((c) => c.id);
      const cleanTeacherName = activeTeacherName.toLowerCase().trim();
      const cleanTeacherId = activeTeacherId.toLowerCase().trim();

      const matched = all.filter((e) => {
        // Enrolled in one of this faculty's courses
        if (myCourseIds.includes(e.courseId)) return true;
        // Or explicitly assigned by this teacher
        if (e.assignedByTeacherId && e.assignedByTeacherId.toLowerCase().trim() === cleanTeacherId) return true;
        if (e.assignedByName && e.assignedByName.toLowerCase().includes(cleanTeacherName)) return true;
        return false;
      });
      setFacultyEnrollments(matched);
    } catch (_) {}
  };

  useEffect(() => {
    loadFacultyEnrollments();
    const handleSync = () => loadFacultyEnrollments();
    window.addEventListener(LMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('msi_courses_sync', handleSync);
    return () => {
      window.removeEventListener(LMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('msi_courses_sync', handleSync);
    };
  }, [lmsCourses, activeTeacherId, activeTeacherName]);

  const filteredStudents = students.filter((s) => {
    if (riskFilter !== 'All' && s.riskLevel !== riskFilter) return false;
    if (searchQuery.trim() && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const safeCount = students.filter((s) => s.riskLevel === 'Safe').length;
  const attentionCount = students.filter((s) => s.riskLevel === 'Attention').length;
  const criticalCount = students.filter((s) => s.riskLevel === 'Critical').length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-[#10233F] via-[#162d50] to-[#89190E] text-white shadow-xl hud-bracket relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#EFC988]" />
              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[#EFC988] uppercase font-bold">
                Student Progress & Faculty Batch Enrollment
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1.5">
              Academic Cohort Monitoring • {stream} Stream
            </h2>
            <p className="text-white/80 text-xs sm:text-sm mt-2 leading-relaxed">
              Enroll verified students into your courses, monitor classroom attendance, and track regulatory Bar Council compliance in real time.
            </p>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => onOpenEnrollModal?.()}
                className="px-5 py-2.5 rounded-xl bg-[#EFC988] hover:bg-[#ffe2aa] text-[#10233F] text-xs font-bold flex items-center space-x-2 shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#89190E]" />
                <span>+ Enroll Student in My Course</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-center min-w-[100px]">
              <span className="text-[10px] font-mono uppercase text-indigo-200 block">Enrolled</span>
              <span className="font-serif text-2xl font-bold text-white mt-0.5 block">{facultyEnrollments.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-center min-w-[100px]">
              <span className="text-[10px] font-mono uppercase text-emerald-200 block">Safe ({'>'}75%)</span>
              <span className="font-serif text-2xl font-bold text-white mt-0.5 block">{safeCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-center min-w-[100px]">
              <span className="text-[10px] font-mono uppercase text-amber-200 block">Borderline</span>
              <span className="font-serif text-2xl font-bold text-white mt-0.5 block">{attentionCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL ENROLLED STUDENTS TABLE (Assigned by Faculty / Super Admin) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DCCB]">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-[#89190E]" />
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
                Students Enrolled in My Courses ({facultyEnrollments.length})
              </h3>
              <p className="text-xs text-[#526174]">
                Students actively enrolled in your curriculum courses. They see your course on their student dashboard.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenEnrollModal?.()}
            className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 text-[#EFC988]" />
            <span>+ Enroll Student</span>
          </button>
        </div>

        {facultyEnrollments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#526174] bg-[#FFF9EF]/40 rounded-2xl border border-[#E8DCCB] mt-4">
            <UserCheck className="w-8 h-8 text-[#89190E]/60 mx-auto mb-2" />
            <p className="font-bold text-[#10233F]">No students enrolled yet in your courses.</p>
            <p className="mt-1">Click &quot;+ Enroll Student in My Course&quot; above to assign any registered student to your batch.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9EF] text-[#10233F] border-b border-[#E8DCCB]">
                <tr>
                  <th className="p-3 font-serif font-bold">Student Name</th>
                  <th className="p-3 font-serif font-bold">Mobile Number</th>
                  <th className="p-3 font-serif font-bold">Enrolled Course</th>
                  <th className="p-3 font-serif font-bold">Enrolled At</th>
                  <th className="p-3 font-serif font-bold">Assignment Source</th>
                  <th className="p-3 font-serif font-bold text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60">
                {facultyEnrollments.map((enr) => {
                  const courseObj = lmsCourses.find((c) => c.id === enr.courseId);
                  const isAssignedByMe =
                    (enr.assignedByTeacherId && enr.assignedByTeacherId.toLowerCase() === activeTeacherId.toLowerCase()) ||
                    (enr.assignedByName && enr.assignedByName.toLowerCase().includes(activeTeacherName.toLowerCase()));

                  return (
                    <tr key={`${enr.studentId}-${enr.courseId}`} className="hover:bg-[#FFF9EF]/30 transition-colors">
                      <td className="p-3 font-bold text-[#10233F]">
                        {enr.studentName || `Student ${enr.studentId.slice(-4)}`}
                      </td>
                      <td className="p-3 font-mono text-gray-600">
                        +91 {enr.studentPhone || '—'}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-[#89190E] block line-clamp-1">
                          {courseObj?.title || enr.courseTitle || enr.courseId}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          ID: {enr.courseId}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{enr.enrolledAt}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAssignedByMe
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : enr.assignedBy === 'super-admin'
                              ? 'bg-rose-50 text-[#89190E] border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>
                            {isAssignedByMe
                              ? `Assigned by You (${activeTeacherName})`
                              : enr.assignedBy === 'super-admin'
                              ? 'Super Admin Assignment'
                              : 'Self Enrolled'}
                          </span>
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#89190E]">
                        {enr.progressPercentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-5 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name or roll no..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#526174]">Filter Attendance Risk:</span>
          {(['All', 'Safe', 'Attention', 'Critical'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                riskFilter === r
                  ? 'bg-[#10233F] text-white shadow-xs'
                  : 'bg-[#FFF9EF] text-[#526174] hover:text-[#10233F]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Student Roster Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DCCB]">
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
            Batch Performance Ledger ({filteredStudents.length})
          </h3>
          <span className="text-xs text-[#526174]">
            Enforcing stream isolation: {stream} students only
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9EF] text-[#10233F] border-b border-[#E8DCCB]">
              <tr>
                <th className="p-3 font-serif font-bold">Student Name & Roll</th>
                <th className="p-3 font-serif font-bold">Batch Assignment</th>
                <th className="p-3 font-serif font-bold">Attendance %</th>
                <th className="p-3 font-serif font-bold">Diagnostic Average</th>
                <th className="p-3 font-serif font-bold">Assignments</th>
                <th className="p-3 font-serif font-bold text-right">Regulatory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60">
              {filteredStudents.map((stu) => (
                <tr
                  key={stu.id}
                  onClick={() => setSelectedStudent(stu)}
                  className="hover:bg-[#FFF9EF]/40 transition-colors cursor-pointer"
                >
                  <td className="p-3">
                    <span className="font-bold text-[#10233F] block">{stu.name}</span>
                    <span className="font-mono text-[10px] text-[#526174]">{stu.rollNo}</span>
                  </td>
                  <td className="p-3 text-[#526174]">{stu.batch}</td>
                  <td className="p-3">
                    <span
                      className={`font-mono font-bold ${
                        stu.attendancePercentage >= 75
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {stu.attendancePercentage}%
                    </span>
                  </td>
                  <td className="p-3 font-serif font-bold text-[#10233F]">
                    {stu.avgTestScore}%
                  </td>
                  <td className="p-3 text-[#526174]">
                    {stu.assignmentsCompleted} / {stu.totalAssignments} Submitted
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        stu.riskLevel === 'Safe'
                          ? 'bg-emerald-100 text-emerald-800'
                          : stu.riskLevel === 'Attention'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {stu.riskLevel === 'Safe' && <CheckCircle2 className="w-3 h-3" />}
                      {stu.riskLevel === 'Attention' && <AlertTriangle className="w-3 h-3" />}
                      {stu.riskLevel === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                      <span>{stu.riskLevel === 'Safe' ? 'Compliant' : stu.riskLevel === 'Attention' ? 'Near Shortage' : 'Shortage Alert'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Student History Drawer Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#10233F]/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-[#E8DCCB] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E8DCCB]">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#89190E]">
                  Detailed Student Academic History
                </span>
                <h3 className="font-serif text-xl font-bold text-[#10233F]">
                  {selectedStudent.name}
                </h3>
                <p className="text-xs text-[#526174]">
                  Roll: {selectedStudent.rollNo} • {selectedStudent.batch}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-[#526174] hover:text-[#10233F]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FFF9EF] border border-[#E8DCCB]">
                <span className="text-[#526174] block">Statutory Attendance</span>
                <span className="font-serif text-xl font-bold text-[#89190E]">
                  {selectedStudent.attendancePercentage}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFF9EF] border border-[#E8DCCB]">
                <span className="text-[#526174] block">Diagnostic Avg</span>
                <span className="font-serif text-xl font-bold text-[#10233F]">
                  {selectedStudent.avgTestScore}%
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF3DD] border border-[#EFC988] text-xs text-[#89190E]">
              <strong>Faculty Action Note:</strong> Student is flagged as <strong>{selectedStudent.riskLevel}</strong>. You may schedule a personalized 1-on-1 counsel session in the Communication tab.
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-[#10233F] text-white text-xs font-bold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
