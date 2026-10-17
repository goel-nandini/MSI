'use client';

import React, { useState } from 'react';
import {
  X,
  Video,
  Plus,
  Play,
  Trash2,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  Radio,
} from 'lucide-react';
import {
  UdemyCourse,
  UdemyLecture,
  addLectureToCourseAction,
  deleteLectureFromCourseAction,
} from '@/lib/lmsStore';
import { getSavedRecordedLectures } from '@/lib/liveStreamPeer';
import { toBunnyEmbedUrl } from '@/lib/bunnyStream';

interface TeacherLectureModalProps {
  course: UdemyCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onLectureSaved: () => void;
  facultyName?: string;
}

export default function TeacherLectureModal({
  course,
  isOpen,
  onClose,
  onLectureSaved,
  facultyName = 'Faculty Mentor',
}: TeacherLectureModalProps) {
  if (!isOpen || !course) return null;

  // Flatten existing lectures in order
  const existingLectures: UdemyLecture[] = [];
  if (course.sections && course.sections.length > 0) {
    course.sections.forEach((sec) => {
      sec.lectures.forEach((l) => existingLectures.push(l));
    });
  }

  const nextLectureNumber = existingLectures.length + 1;

  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [lectureTitle, setLectureTitle] = useState(`Lecture ${nextLectureNumber}: `);
  const [duration, setDuration] = useState('45 mins');
  const [videoUrl, setVideoUrl] = useState(
    'https://player.mediadelivery.net/play/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc'
  );
  const [summary, setSummary] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [preview, setPreview] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Available recorded live stream sessions
  const recordedSessions = typeof window !== 'undefined' ? getSavedRecordedLectures() : [];

  const handleAddLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureTitle.trim()) {
      alert('Please specify the lecture title.');
      return;
    }

    setIsSubmitting(true);
    try {
      addLectureToCourseAction(course.id, {
        title: lectureTitle.trim(),
        duration: duration.trim() || '45 mins',
        videoUrl: videoUrl.trim(),
        summary: summary.trim() || 'Classroom recording with landmark case law briefs.',
        preview,
        resources: resourceTitle.trim()
          ? [
              {
                title: resourceTitle.trim(),
                type: 'pdf',
                size: '2.4 MB',
                downloadUrl: '#',
              },
            ]
          : undefined,
      });

      setSuccessToast(`Lecture added successfully! It is now live in student portals.`);
      onLectureSaved();

      // Reset form for next lecture
      const newNextNum = existingLectures.length + 2;
      setLectureTitle(`Lecture ${newNextNum}: `);
      setSummary('');
      setResourceTitle('');

      setTimeout(() => {
        setSuccessToast('');
      }, 3000);
    } catch (err) {
      console.error('Failed to add lecture:', err);
      alert('Error adding lecture.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLecture = (lectureId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    deleteLectureFromCourseAction(course.id, lectureId);
    onLectureSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#10233F]/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-[#E8DCCB] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#10233F] text-white px-6 py-4 flex items-center justify-between border-b border-[#EFC988]/30 flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#EFC988] animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-[#EFC988] uppercase font-bold">
                Faculty Lecture Studio • {facultyName}
              </span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide truncate mt-0.5">
              {course.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Banner */}
        <div className="px-6 pt-4 pb-2 bg-[#FFF9EF] border-b border-[#E8DCCB] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-[#89190E] text-white shadow-xs'
                  : 'bg-white border border-[#E8DCCB] text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Lecture {existingLectures.length + 1}</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#89190E] text-white shadow-xs'
                  : 'bg-white border border-[#E8DCCB] text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Current Lectures ({existingLectures.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-[#526174] font-medium">
            Category: <strong className="text-[#89190E]">{course.category}</strong>
          </span>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#FFF9EF]/30">
          {/* TAB 1: ADD NEW LECTURE */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddLecture} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FFF3DD] border border-[#EFC988] text-[#89190E] text-[11px] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#89190E] flex-shrink-0" />
                <span>
                  Adding a lecture here instantly updates student portals lecture-wise (Lecture 1, Lecture 2, etc.) for all registered students.
                </span>
              </div>

              {/* Lecture Title */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#10233F] mb-1">
                  Lecture Title & Number *
                </label>
                <input
                  type="text"
                  required
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g. Lecture 1: Foundational Principles & Ratio Decidendi"
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-white text-[#10233F] font-semibold focus:outline-none focus:border-[#89190E]"
                />
              </div>

              {/* Duration & Preview Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#10233F] mb-1">
                    Lecture Duration *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 45 mins"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8DCCB] bg-white text-[#10233F] font-semibold focus:outline-none focus:border-[#89190E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#10233F] mb-1">
                    Student Accessibility
                  </label>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-[#E8DCCB] bg-white text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preview}
                      onChange={(e) => setPreview(e.target.checked)}
                      className="rounded accent-[#89190E]"
                    />
                    <span className="font-semibold text-[#10233F]">
                      Include in Free Preview / All Enrolled Scholars
                    </span>
                  </label>
                </div>
              </div>

              {/* Video URL & Quick Pickers */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold uppercase tracking-wider text-[#10233F]">
                    Video Lecture Source / Stream URL *
                  </label>
                  <span className="text-[10px] text-[#526174]">
                    MP4 / Bunny Stream CDN / HLS / YouTube / VOD
                  </span>
                </div>
                <div className="relative">
                  <Video className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8DCCB] bg-white text-[#10233F] font-mono text-xs focus:outline-none focus:border-[#89190E]"
                  />
                </div>

                {/* Quick Source Presets */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-[#526174]">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setVideoUrl(
                        'https://player.mediadelivery.net/play/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#89190E] text-white text-[10px] font-bold shadow-xs hover:bg-[#65130D] flex items-center space-x-1"
                  >
                    <span>⭐ Bunny Stream HD (782652)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setVideoUrl(
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                      )
                    }
                    className="px-2 py-1 rounded-lg bg-white border border-[#E8DCCB] hover:border-[#89190E] text-[10px] font-semibold text-[#10233F]"
                  >
                    Demo 1080p MP4
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setVideoUrl(
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                      )
                    }
                    className="px-2 py-1 rounded-lg bg-white border border-[#E8DCCB] hover:border-[#89190E] text-[10px] font-semibold text-[#10233F]"
                  >
                    Jurisprudence Case Study (MP4)
                  </button>

                  {recordedSessions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl(recordedSessions[0].videoUrl)}
                      className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-[10px] font-bold flex items-center space-x-1"
                    >
                      <Radio className="w-3 h-3 text-rose-600" />
                      <span>Use Latest Live Stream VOD</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lecture Summary */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#10233F] mb-1">
                  Lecture Summary & Landmark Case References
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summary of statutory provisions covered, Bare Act sections, and ratio decidendi..."
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-white text-[#10233F] text-xs focus:outline-none focus:border-[#89190E]"
                />
              </div>

              {/* Study Material / PDF Notes */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#10233F] mb-1">
                  Downloadable Study Notes / Handout Title
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="e.g. Landmark Case Briefs & Bare Act Notes (PDF)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8DCCB] bg-white text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#E8DCCB] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-white text-xs font-bold text-[#526174] hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-[#89190E]/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Publishing...' : `Publish Lecture ${nextLectureNumber} Now`}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CURRENT LECTURES LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCB]">
                <h4 className="font-serif font-bold text-sm text-[#10233F]">
                  Sequential Lecture Delivery ({existingLectures.length} Lectures)
                </h4>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-3 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-[11px] font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Next Lecture</span>
                </button>
              </div>

              {existingLectures.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">
                  No lectures delivered yet for this course. Click "+ Add Lecture" to publish Lecture 1.
                </div>
              ) : (
                <div className="space-y-3">
                  {existingLectures.map((lec, idx) => (
                    <div
                      key={lec.id}
                      className="p-4 rounded-2xl bg-white border border-[#E8DCCB] hover:border-[#89190E]/40 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E] font-mono text-[10px] font-bold">
                            {/^lecture\s*\d+/i.test(lec.title)
                              ? lec.title.split(':')[0]
                              : `Lecture ${idx + 1}`}
                          </span>
                          <span className="text-xs font-bold text-[#10233F] truncate">
                            {lec.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#526174] line-clamp-1">
                          {lec.summary || 'Classroom recording with case briefs.'}
                        </p>
                        <div className="flex items-center space-x-3 text-[10px] text-gray-500 font-mono">
                          <span>⏱ {lec.duration}</span>
                          <span>•</span>
                          <span>📹 {lec.videoUrl ? 'Video Connected' : 'No video'}</span>
                          {lec.preview && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">Preview Free</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setPreviewVideoUrl(lec.videoUrl)}
                          className="px-3 py-1.5 rounded-xl bg-[#10233F] hover:bg-[#1c355e] text-white text-xs font-bold flex items-center space-x-1"
                          title="Preview video playback"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Test Play</span>
                        </button>

                        <button
                          onClick={() => handleDeleteLecture(lec.id, lec.title)}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition-colors"
                          title="Delete lecture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video Preview Player Box */}
          {previewVideoUrl && (
            <div className="p-4 rounded-2xl bg-black text-white space-y-2 mt-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EFC988] flex items-center space-x-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Video Preview Player</span>
                </span>
                <button
                  onClick={() => setPreviewVideoUrl(null)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Close Preview ✕
                </button>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-900">
                {previewVideoUrl.includes('mediadelivery.net') || previewVideoUrl.includes('.b-cdn.net') || previewVideoUrl.startsWith('bunny://') ? (
                  <iframe
                    src={toBunnyEmbedUrl(previewVideoUrl)}
                    title="Lecture Video Preview"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
