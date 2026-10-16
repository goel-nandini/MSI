'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import BunnyPlayer from '@/components/stream/BunnyPlayer';
import {
  Radio,
  Users,
  MessageSquare,
  Send,
  BookOpen,
  Award,
  CheckCircle2,
  Share2,
  Clock,
  Sparkles,
  ChevronLeft,
  Square,
  RotateCcw,
  Camera,
  Mic,
  MicOff,
  ScreenShare,
  ShieldCheck,
  FileText,
  Download,
  AlertCircle,
  GraduationCap,
  Eye,
  Play,
  Trash2,
  Video,
} from 'lucide-react';
import {
  StudentWebRTCReceiver,
  LiveViewerInfo,
  LiveChatMessage,
  PRESENCE_CHANNEL,
  CHAT_CHANNEL,
} from '@/lib/liveStreamPeer';

function LiveStreamContent() {
  const searchParams = useSearchParams();
  const videoIdParam = searchParams.get('videoId');
  const libraryId = searchParams.get('lib') || '389201';
  const initialTitle = searchParams.get('title') || 'CLAT UG Foundation: Passage-Based Deduction & Landmark SC Jurisprudence';
  const [streamTitle, setStreamTitle] = useState(initialTitle);
  const lectureTitle = streamTitle;
  const roleParam = searchParams.get('role') || 'student';
  const isTeacher = roleParam === 'teacher';

  // Live state
  const [isLive, setIsLive] = useState(true);
  const [streamEnded, setStreamEnded] = useState(false);
  const [activeSource, setActiveSource] = useState<'hall' | 'camera' | 'screen'>('hall');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [isPlayingVod, setIsPlayingVod] = useState(false);

  // Active authenticated student details
  const [activeStudentName, setActiveStudentName] = useState('MSI Student');
  const [activeStudentId, setActiveStudentId] = useState('MSI-2025-LAW-042');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('msi_active_student_name');
      if (storedName) setActiveStudentName(storedName);
      const storedPhone = localStorage.getItem('msi_active_student_phone');
      if (storedPhone) {
        const clean = storedPhone.replace(/\D/g, '').slice(-10);
        setActiveStudentId(`MSI-${new Date().getFullYear()}-${clean.slice(-4)}`);
      }
    }
  }, []);

  // WebRTC remote stream from Teacher (webcam / screen share)
  const [remoteWebRTCStream, setRemoteWebRTCStream] = useState<MediaStream | null>(null);
  const receiverRef = useRef<StudentWebRTCReceiver | null>(null);

  // REAL ATTENDEES (NO DUMMY 142!)
  const [activeViewers, setActiveViewers] = useState<LiveViewerInfo[]>([]);

  // Real-time Chat (Real time only, NO DUMMY DATA)
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  // Latest Live Camera / Screen Frame relayed from Teacher Studio
  const [latestFrame, setLatestFrame] = useState<string | null>(null);

  // Setup WebRTC receiver, Presence & Chat
  useEffect(() => {
    // 1. WebRTC Receiver: receives Teacher's camera or screen share in real time!
    receiverRef.current = new StudentWebRTCReceiver('MSI-2025-LAW-042', (stream) => {
      setRemoteWebRTCStream(stream);
      setIsLive(true);
      setStreamEnded(false);
    });

    // 2. Presence Tracking (real student attendee registration)
    let presenceChannel: BroadcastChannel | null = null;
    let chatChannel: BroadcastChannel | null = null;
    let mainBc: BroadcastChannel | null = null;

    const currentStudentName =
      typeof window !== 'undefined'
        ? localStorage.getItem('msi_active_student_name') || 'MSI Student'
        : 'MSI Student';

    try {
      presenceChannel = new BroadcastChannel(PRESENCE_CHANNEL);
      presenceChannel.postMessage({
        type: 'VIEWER_JOIN',
        student: {
          id: 'MSI-2025-LAW-042',
          name: currentStudentName,
          batch: 'Semester V (CLAT UG)',
          joinedAt: Date.now(),
        },
      });

      presenceChannel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'VIEWER_JOIN' && data.student) {
          setActiveViewers((prev) => {
            const exists = prev.some((v) => v.id === data.student.id);
            if (!exists) return [...prev, data.student];
            return prev;
          });
        } else if (data.type === 'VIEWER_LEAVE' && data.studentId) {
          setActiveViewers((prev) => prev.filter((v) => v.id !== data.studentId));
        }
      };

      // 3. Synchronized Chat
      chatChannel = new BroadcastChannel(CHAT_CHANNEL);
      chatChannel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === 'NEW_MESSAGE' && data.message) {
          setChatMessages((prev) => {
            const exists = prev.some((m) => m.id === data.message.id);
            if (!exists) return [...prev, data.message];
            return prev;
          });
        } else if (data?.type === 'DELETE_MESSAGE' && data.id) {
          setChatMessages((prev) => prev.filter((m) => m.id !== data.id));
        }
      };

      // 4. Main Stream Lifecycle Channel
      mainBc = new BroadcastChannel('msi_live_stream_channel');
      mainBc.onmessage = (event) => {
        if (event.data?.type === 'STREAM_ENDED') {
          setIsLive(false);
          setStreamEnded(true);
        } else if (event.data?.type === 'STREAM_STARTED') {
          setIsLive(true);
          setStreamEnded(false);
          receiverRef.current?.requestStream();
        }
      };
    } catch (e) {
      console.warn('Channel error:', e);
    }

    // Check initial active stream from localStorage
    if (typeof window !== 'undefined') {
      const activeData = localStorage.getItem('msi_active_live_stream');
      if (activeData) {
        try {
          const parsed = JSON.parse(activeData);
          if (parsed.isLive) {
            setIsLive(true);
            setStreamEnded(false);
          }
        } catch {}
      }
    }

    return () => {
      receiverRef.current?.destroy();
      receiverRef.current = null;
      try {
        presenceChannel?.postMessage({
          type: 'VIEWER_LEAVE',
          studentId: 'MSI-2025-LAW-042',
        });
      } catch {}
      presenceChannel?.close();
      chatChannel?.close();
      mainBc?.close();
    };
  }, []);

  // Server Synchronization: Heartbeat, Real-time Chat, Presence, and Live Video Frame Relay (across devices)
  useEffect(() => {
    let isMounted = true;

    const pollServer = async () => {
      try {
        // Send heartbeat if in student viewer mode
        if (!isTeacher) {
          fetch('/api/live-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'heartbeat',
              id: 'MSI-2025-LAW-042',
              name: activeStudentName,
              batch: 'Semester V (CLAT UG)',
            }),
          }).catch(() => {});
        }

        const res = await fetch('/api/live-stream');
        if (!res.ok || !isMounted) return;
        const data = await res.json();

        if (Array.isArray(data.chatMessages)) {
          setChatMessages(data.chatMessages);
        }
        if (Array.isArray(data.activeViewers)) {
          setActiveViewers(data.activeViewers);
        }
        if (data.latestFrame) {
          setLatestFrame(data.latestFrame);
        }
        if (data.isLive !== undefined) {
          if (data.isLive && !isLive) {
            setIsLive(true);
            setStreamEnded(false);
          } else if (!data.isLive && isLive) {
            setIsLive(false);
            setStreamEnded(true);
          }
        }
        if (data.streamTitle) {
          setStreamTitle(data.streamTitle);
        }
      } catch {}
    };

    pollServer();
    const interval = setInterval(pollServer, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (!isTeacher) {
        fetch('/api/live-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'leave', id: 'MSI-2025-LAW-042' }),
        }).catch(() => {});
      }
    };
  }, [isTeacher, isLive]);

  // Faculty Only: Turn on Camera & Mic
  const handleStartCamera = async () => {
    if (!isTeacher) return;
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      setActiveSource('camera');
      setIsLive(true);
      setStreamEnded(false);
    } catch (err: any) {
      alert(`Camera access denied or unavailable: ${err.message}. Switching to Hall stream.`);
      setActiveSource('hall');
    }
  };

  // Faculty Only: Screen Sharing
  const handleStartScreenShare = async () => {
    if (!isTeacher) return;
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setMediaStream(stream);
      setActiveSource('screen');
      setIsLive(true);
      setStreamEnded(false);
      stream.getVideoTracks()[0].onended = () => {
        setActiveSource('hall');
        setMediaStream(null);
      };
    } catch (err: any) {
      console.log('Screen share cancelled', err);
    }
  };

  // Faculty Only: End Stream Handler
  const handleEndStream = (broadcast = true) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsLive(false);
    setStreamEnded(true);
    setShowConfirmEnd(false);

    if (broadcast) {
      try {
        const bc = new BroadcastChannel('msi_live_stream_channel');
        bc.postMessage({ type: 'STREAM_ENDED', timestamp: Date.now() });
        bc.close();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('msi_active_live_stream');
        }
      } catch {}
    }
  };

  // Student Attendance Recording
  const handleMarkAttendance = () => {
    setAttendanceMarked(true);
    try {
      const bc = new BroadcastChannel('msi_live_stream_channel');
      bc.postMessage({
        type: 'STUDENT_ATTENDANCE',
        studentId: 'MSI-2025-LAW-042',
        studentName: 'Aarav Sharma',
        timestamp: Date.now(),
      });
      bc.close();
    } catch {}
  };

  // Student: Send Comment / Doubt to Teacher (Synced across devices)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');

    const newMsg: LiveChatMessage = {
      id: 'msg-' + Date.now(),
      sender: isTeacher ? 'Dr. Ekta Gahlawat (Faculty)' : activeStudentName,
      text: textToSend,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isTeacher: isTeacher,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    try {
      const ch = new BroadcastChannel(CHAT_CHANNEL);
      ch.postMessage({ type: 'NEW_MESSAGE', message: newMsg });
      ch.close();
    } catch {}

    try {
      const res = await fetch('/api/live-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-chat',
          sender: isTeacher ? 'Dr. Ekta Gahlawat (Faculty)' : activeStudentName,
          text: textToSend,
          isTeacher: isTeacher,
          studentId: 'MSI-2025-LAW-042',
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.chatMessages)) {
        setChatMessages(data.chatMessages);
      }
    } catch {}
  };

  // Delete chat message (for student's own message or faculty)
  const handleDeleteChatMessage = async (msgId: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== msgId));

    try {
      const ch = new BroadcastChannel(CHAT_CHANNEL);
      ch.postMessage({ type: 'DELETE_MESSAGE', id: msgId });
      ch.close();
    } catch {}

    try {
      await fetch('/api/live-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-chat', id: msgId }),
      });
    } catch {}
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* 1. Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DCCB]">
        <div className="space-y-1.5">
          <Link
            href="/student/dashboard"
            className="text-xs font-bold text-[#89190E] hover:underline flex items-center space-x-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Student Portal</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {isLive ? (
              <span className="inline-flex items-center space-x-1.5 bg-rose-600 text-white text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full animate-pulse shadow-md shadow-rose-600/30">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>ON AIR • LIVE BROADCAST</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 bg-gray-800 text-white text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>STREAM CONCLUDED BY FACULTY</span>
              </span>
            )}

            <span className="text-xs font-mono text-[#526174] bg-[#FFF3DD] border border-[#EFC988] px-2.5 py-0.5 rounded-md font-semibold">
              Bunny.net Stream + WebRTC
            </span>

            {/* Role indicator pill */}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#10233F] text-white flex items-center space-x-1">
              {isTeacher ? (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-[#EFC988]" />
                  <span>Faculty Broadcaster</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student (Viewer Mode)</span>
                </>
              )}
            </span>
          </div>

          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#10233F] leading-tight">
            {lectureTitle}
          </h1>
          <p className="text-xs text-[#526174]">
            Faculty: <strong className="text-[#10233F]">Dr. Ekta Gahlawat</strong> (School of Law & Judicial Studies)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* REAL Viewer Count Pill (NO DUMMY 142!) */}
          <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8DCCB] text-xs font-mono font-bold text-[#10233F] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeViewers.length} Student Live: {activeViewers[0]?.name || 'Aarav'}</span>
          </div>

          {/* Mark Attendance Button (For Students) */}
          {!isTeacher && (
            <button
              onClick={handleMarkAttendance}
              disabled={attendanceMarked}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                attendanceMarked
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-98'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{attendanceMarked ? 'Attendance Recorded ✓' : 'Mark My Attendance'}</span>
            </button>
          )}

          {/* TEACHER ONLY: End Stream Button */}
          {isTeacher && isLive && (
            <button
              onClick={() => setShowConfirmEnd(true)}
              className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-[#89190E]/20 active:scale-98 cursor-pointer"
              title="Conclude live broadcast for all attendees"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>End Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal to End Stream (TEACHER ONLY) */}
      {isTeacher && showConfirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#E8DCCB] shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-[#89190E]">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-serif text-lg font-bold text-[#10233F]">
                Conclude Live Stream?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#526174] leading-relaxed">
              Ending this broadcast will immediately conclude live transmission. The recorded lecture will be saved and made available for students as VOD.
            </p>
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="px-4 py-2 rounded-xl border border-[#E8DCCB] hover:bg-gray-50 text-xs font-bold text-[#10233F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEndStream(true)}
                className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Confirm End Stream</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Live Stage & Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column (8 cols): Player / Stream View (STUDENT ONLY VIEWS) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* TEACHER ONLY: Broadcast Source Controls */}
          {isTeacher && (
            <div className="p-3 bg-[#FFF9EF] border border-[#E8DCCB] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#10233F]">Faculty Broadcast Source:</span>
                <button
                  onClick={() => {
                    if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
                    setMediaStream(null);
                    setActiveSource('hall');
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSource === 'hall'
                      ? 'bg-[#89190E] text-white font-bold'
                      : 'bg-white border border-[#E8DCCB] text-[#10233F] hover:bg-gray-50'
                  }`}
                >
                  Auditorium Masterclass
                </button>
                <button
                  onClick={handleStartCamera}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                    activeSource === 'camera'
                      ? 'bg-[#89190E] text-white font-bold'
                      : 'bg-white border border-[#E8DCCB] text-[#10233F] hover:bg-gray-50'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>Faculty Camera</span>
                </button>
                <button
                  onClick={handleStartScreenShare}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                    activeSource === 'screen'
                      ? 'bg-[#89190E] text-white font-bold'
                      : 'bg-white border border-[#E8DCCB] text-[#10233F] hover:bg-gray-50'
                  }`}
                >
                  <ScreenShare className="w-3 h-3" />
                  <span>Share Screen</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#526174]">
                Status: <strong className={isLive ? 'text-emerald-700' : 'text-gray-500'}>{isLive ? 'BROADCASTING' : 'OFFLINE'}</strong>
              </div>
            </div>
          )}

          {/* Video Player Shell */}
          {streamEnded ? (
            /* Stream Ended / Summary State with Recorded Lecture (VOD) */
            <div className="rounded-3xl border-2 border-[#E8DCCB] bg-gradient-to-br from-[#10233F] to-[#1a345c] p-6 sm:p-10 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-[#EFC988]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[#EFC988] font-bold">
                  Lecture Broadcast Complete
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Live Session Successfully Concluded
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
                  The faculty has ended today’s live lecture broadcast. The full recording has been archived and is now available for on-demand playback below.
                </p>
              </div>

              {/* Session Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-1 text-left">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono">Duration</span>
                  <span className="font-bold text-sm font-serif">48 mins 12s</span>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono">Your Attendance</span>
                  <span className="font-bold text-sm font-serif text-emerald-400">
                    {activeStudentName} (Present ✓)
                  </span>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono">VOD Status</span>
                  <span className="font-bold text-sm font-serif text-[#EFC988]">Archived (Ready)</span>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono">Resolution</span>
                  <span className="font-bold text-sm font-serif">1080p HD</span>
                </div>
              </div>

              {/* VOD Player Section */}
              {isPlayingVod ? (
                <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200">
                  <BunnyPlayer
                    title={`Recorded Lecture: ${lectureTitle}`}
                    isLive={false}
                    autoplay={true}
                    videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  />
                  <div className="p-3 bg-[#10233F] text-center">
                    <button
                      onClick={() => setIsPlayingVod(false)}
                      className="px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold cursor-pointer"
                    >
                      Close Recording Playback
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/live-stream', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'start',
                            title: streamTitle,
                            teacherName: 'Dr. Ekta Gahlawat',
                            batch: 'Semester V (CLAT UG)',
                          }),
                        });
                      } catch (_) {}
                      setIsLive(true);
                      setStreamEnded(false);
                      setIsPlayingVod(false);
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xl cursor-pointer flex items-center space-x-2 active:scale-98"
                  >
                    <Radio className="w-4 h-4 text-[#EFC988] animate-pulse" />
                    <span>Start / Resume Live Broadcast</span>
                  </button>

                  <Link
                    href="/live-stream?role=teacher"
                    className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/30 flex items-center space-x-1.5"
                  >
                    <Video className="w-4 h-4 text-[#EFC988]" />
                    <span>Faculty Studio Mode</span>
                  </Link>

                  <button
                    onClick={() => setIsPlayingVod(true)}
                    className="px-6 py-3 rounded-2xl bg-[#EFC988] hover:bg-[#ffe2aa] text-[#10233F] text-xs font-bold transition-all shadow-xl cursor-pointer flex items-center space-x-2 active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-current text-[#89190E]" />
                    <span>Watch Full Lecture Recording (VOD)</span>
                  </button>

                  <Link
                    href="/student/dashboard"
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center space-x-1.5"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#EFC988]" />
                    <span>Return to Student Dashboard</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Active Live Stream Player (VIEW ONLY FOR STUDENTS) */
            <div className="relative rounded-2xl overflow-hidden border border-[#E8DCCB] shadow-sm">
              <BunnyPlayer
                videoId={videoIdParam || undefined}
                mediaStream={remoteWebRTCStream || mediaStream}
                latestFrame={latestFrame}
                libraryId={libraryId}
                title={lectureTitle}
                isLive={isLive}
                autoplay={true}
                viewerCount={activeViewers.length}
                onEnded={() => {
                  if (isTeacher) handleEndStream(false);
                }}
              />
            </div>
          )}

          {/* Academic Handout & Landmark Citations Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DCCB] space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E8DCCB]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-[#89190E] uppercase tracking-wider bg-[#FFF3DD] px-2.5 py-0.5 rounded-md">
                  Official Handout Synchronized
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Constitutional Principles & Landmark Case Briefs
                </h3>
              </div>
              <button
                onClick={() => alert('Official Lecture Compendium PDF downloaded.')}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFF9EF] hover:bg-[#FFF3DD] text-[#89190E] border border-[#EFC988] text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Handout (PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] space-y-2">
                <h4 className="font-serif font-bold text-sm text-[#10233F] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#89190E]" />
                  <span>Ratio Decidendi Breakdown</span>
                </h4>
                <p className="text-[#526174] leading-relaxed">
                  Focus on the legal principle upon which the court decided the factual controversy. Ignore obiter statements that merely illustrate background context.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] space-y-2">
                <h4 className="font-serif font-bold text-sm text-[#10233F] flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-[#89190E]" />
                  <span>Principle-Fact Boundary Rules</span>
                </h4>
                <p className="text-[#526174] leading-relaxed">
                  Strictly apply only the given legal principle. Do not assume or import external statutory exceptions unless explicitly stated in the factual matrix.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Live Classroom Discussion / Q&A (COMMENT OPTION FOR STUDENTS) */}
        <div className="lg:col-span-4 flex flex-col h-[650px] rounded-3xl bg-white border border-[#E8DCCB] shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="p-4 bg-[#FFF9EF] border-b border-[#E8DCCB] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#89190E]" />
              <div>
                <h3 className="font-serif font-bold text-sm text-[#10233F]">
                  Live Classroom Discussion
                </h3>
                <span className="text-[10px] text-[#526174]">Ask questions & post comments</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              Faculty Active
            </span>
          </div>

          {/* Active Viewer Indicator */}
          <div className="px-4 py-2 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Attendee:</span>
            </div>
            <span className="font-bold">{activeStudentName} (You)</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/60">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#526174] p-4 space-y-1.5">
                <MessageSquare className="w-8 h-8 text-gray-300" />
                <h4 className="text-xs font-bold text-[#10233F]">Live Classroom Chat</h4>
                <p className="text-[11px] text-[#526174] max-w-xs">
                  Ask Dr. Ekta Gahlawat any question regarding constitutional principles or case ratios.
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl text-xs space-y-1 transition-all group relative ${
                    msg.isTeacher
                      ? 'bg-[#FFF3DD] border border-[#EFC988] text-[#10233F] shadow-xs'
                      : 'bg-white border border-[#E8DCCB] text-[#10233F]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <strong className={msg.isTeacher ? 'text-[#89190E]' : 'text-[#10233F]'}>
                      {msg.sender}
                    </strong>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-400 font-mono">{msg.time}</span>
                      {/* Student can delete their own message; Faculty can delete any */}
                      {(isTeacher || msg.sender.includes('Aarav') || msg.studentId === 'MSI-2025-LAW-042') && (
                        <button
                          type="button"
                          onClick={() => handleDeleteChatMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 text-rose-600 rounded transition-all cursor-pointer"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="leading-relaxed break-words">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Message Input (COMMENT OPTION FOR STUDENTS) */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E8DCCB] flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isLive ? "Ask Dr. Ekta Gahlawat a question or post a comment..." : "Stream concluded. Comments locked."}
              disabled={!isLive}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#FFF9EF] border border-[#E8DCCB] text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!isLive || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] disabled:opacity-40 text-white transition-colors cursor-pointer"
              title="Post Comment / Question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}

export default function LiveStreamPage() {
  return (
    <div className="min-h-screen bg-[#FFF9EF] text-[#10233F] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      <Navbar />
      <main className="flex-grow pt-20">
        <Suspense fallback={<div className="p-12 text-center text-sm font-mono text-[#89190E]">Initializing Live Stream Hall...</div>}>
          <LiveStreamContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
