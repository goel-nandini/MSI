'use client';

import React, { useState } from 'react';
import { X, Check, UserPlus, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { UdemyCourse } from '@/lib/lmsStore';

interface RegisteredStudentSummary {
  id: string;
  name: string;
  phone: string;
  stream: string;
}

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: UdemyCourse[];
  students: RegisteredStudentSummary[];
  onEnroll: (studentPhone: string, courseId: string, note: string) => Promise<void>;
  preselectedCourseId?: string;
  facultyName: string;
}

export default function EnrollStudentModal({
  isOpen,
  onClose,
  courses,
  students,
  onEnroll,
  preselectedCourseId,
  facultyName,
}: EnrollStudentModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    preselectedCourseId || courses[0]?.id || ''
  );
  const [selectedStudentPhone, setSelectedStudentPhone] = useState<string>(
    students[0]?.phone || ''
  );
  const [enrollNote, setEnrollNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCourseId) {
      setErrorMsg('Please select a course to enroll the student into.');
      return;
    }
    if (!selectedStudentPhone) {
      setErrorMsg('Please select a registered student.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onEnroll(
        selectedStudentPhone,
        selectedCourseId,
        enrollNote.trim() || `Admitted to ${facultyName}'s batch cohort`
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to enroll student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudentObj = students.find(
    (s) => s.phone.replace(/\D/g, '').slice(-10) === selectedStudentPhone.replace(/\D/g, '').slice(-10)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#10233F]">
              Enroll Student into Your Course
            </h3>
            <p className="text-xs text-gray-500">
              The assigned course will immediately appear in the student&apos;s active portal with your faculty attribution.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
              Select Registered Student *
            </label>
            {students.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                No students registered yet in the system. Add students in Super Admin first.
              </p>
            ) : (
              <select
                required
                value={selectedStudentPhone}
                onChange={(e) => setSelectedStudentPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
              >
                <option value="">-- Choose student from verified roster --</option>
                {students.map((stu) => (
                  <option key={stu.id || stu.phone} value={stu.phone}>
                    {stu.name} (+91 {stu.phone}) — {stu.stream}
                  </option>
                ))}
              </select>
            )}
            {selectedStudentObj && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#FFF9EF] border border-[#E8DCCB] text-[11px] text-[#526174]">
                <span>Candidate: <strong className="text-[#10233F]">{selectedStudentObj.name}</strong></span> •{' '}
                <span>Batch: <strong className="text-[#89190E]">{selectedStudentObj.stream}</strong></span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
              Select Your Course Program *
            </label>
            {courses.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                No courses currently assigned to you. Courses assigned by Super Admin will appear here.
              </p>
            ) : (
              <select
                required
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
              >
                <option value="">-- Choose from your assigned courses --</option>
                {courses.map((crs) => (
                  <option key={crs.id} value={crs.id}>
                    {crs.title} ({crs.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
              Faculty Admission Directive / Note
            </label>
            <input
              type="text"
              value={enrollNote}
              onChange={(e) => setEnrollNote(e.target.value)}
              placeholder={`e.g. Admitted to ${facultyName}'s special mentorship batch`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || courses.length === 0 || students.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Complete Enrollment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
