'use client';

import React, { useState } from 'react';
import {
  FolderOpen,
  Video,
  FileText,
  HelpCircle,
  UploadCloud,
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  Plus,
  Trash2,
  Download,
} from 'lucide-react';
import { TeacherContentItem, TeacherCourse } from './data/teacherMockData';
import { UdemyCourse } from '@/lib/lmsStore';

interface TeacherContentTabProps {
  content: TeacherContentItem[];
  courses: TeacherCourse[];
  lmsCourses?: UdemyCourse[];
  stream: 'Law' | 'JEE';
  onTogglePublish: (contentId: string) => void;
  onOpenLectureModal?: (course: UdemyCourse) => void;
}

export default function TeacherContentTab({
  content,
  courses,
  lmsCourses = [],
  stream,
  onTogglePublish,
  onOpenLectureModal,
}: TeacherContentTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | 'Video' | 'Notes' | 'PYQ' | 'Assignment' | 'Reference'
  >('All');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('All');

  // Also convert LMS lectures to content items
  const dynamicLmsLectures: TeacherContentItem[] = lmsCourses.flatMap((crs) => {
    const lecs = crs.sections ? crs.sections.flatMap((s) => s.lectures) : [];
    return lecs.map((l) => ({
      id: l.id,
      title: l.title,
      courseCode: crs.title.split(':')[0].trim().slice(0, 18),
      category: 'Video' as const,
      uploadDate: crs.updatedDate || 'Session 2026',
      sizeOrDuration: l.duration,
      downloadCount: 38,
      isPublished: true,
      stream: 'Law' as const,
    }));
  });

  const allCombinedContent = [...dynamicLmsLectures, ...content];

  const filteredContent = allCombinedContent.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedCourseFilter !== 'All' && item.courseCode !== selectedCourseFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Publish/Unpublish Explanation */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E8DCCB]">
          <div>
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-[#89190E]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#10233F]">
                Course Content & Resource Management
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#526174] mt-1">
              Upload, annotate, and manage student accessibility for Videos, Lecture Notes, PYQs, and Assignments.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (lmsCourses.length > 0 && onOpenLectureModal) {
                  onOpenLectureModal(lmsCourses[0]);
                } else {
                  alert('Please select an assigned course to upload lecture materials.');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#89190E]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Video Lecture / Material</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Video', 'Notes', 'PYQ', 'Assignment', 'Reference'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#10233F] text-white shadow-xs'
                    : 'bg-[#FFF9EF] text-[#526174] hover:text-[#10233F]'
                }`}
              >
                {cat === 'All'
                  ? 'All Content'
                  : cat === 'Video'
                  ? 'Videos'
                  : cat === 'Notes'
                  ? 'Notes / PDFs'
                  : cat === 'PYQ'
                  ? 'PYQs'
                  : cat === 'Assignment'
                  ? 'Assignments'
                  : 'Reference'}
              </button>
            ))}
          </div>

          {/* Course Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-[#526174]" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="p-1.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF] text-xs font-semibold text-[#10233F] focus:outline-none"
            >
              <option value="All">All Assigned Courses</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Content Table with Publish / Unpublish Interactive Switcher */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DCCB]">
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#10233F]">
            Curriculum Asset Roster ({filteredContent.length})
          </h3>
          <span className="text-xs text-[#526174]">
            Role Stream: <strong>{stream}</strong>
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9EF] text-[#10233F] border-b border-[#E8DCCB]">
              <tr>
                <th className="p-3 font-serif font-bold">Asset Title & Type</th>
                <th className="p-3 font-serif font-bold">Course Code</th>
                <th className="p-3 font-serif font-bold">Size / Duration</th>
                <th className="p-3 font-serif font-bold">Student Downloads</th>
                <th className="p-3 font-serif font-bold text-right">Publication Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-[#FFF9EF]/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-[#FFF3DD] text-[#89190E] flex-shrink-0">
                        {item.category === 'Video' && <Video className="w-4 h-4" />}
                        {item.category === 'Notes' && <FileText className="w-4 h-4" />}
                        {item.category === 'PYQ' && <HelpCircle className="w-4 h-4" />}
                        {item.category === 'Assignment' && <UploadCloud className="w-4 h-4" />}
                        {item.category === 'Reference' && <FolderOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-[#89190E] block">
                          {item.category}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#10233F] mt-0.5">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-[#526174]">
                          Uploaded {item.uploadDate}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-mono font-bold text-[#10233F]">
                    {item.courseCode}
                  </td>

                  <td className="p-3 text-[#526174] font-medium">
                    {item.sizeOrDuration}
                  </td>

                  <td className="p-3 font-mono text-[#526174]">
                    {item.downloadCount} Hits
                  </td>

                  {/* Publish / Unpublish Toggle Action */}
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onTogglePublish(item.id)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        item.isPublished
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      }`}
                      title="Click to toggle publish or unpublish state"
                    >
                      {item.isPublished ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Hidden (Draft)</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
