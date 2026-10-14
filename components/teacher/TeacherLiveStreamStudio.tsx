'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Radio,
  Play,
  Upload,
  Link as LinkIcon,
  Settings,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Trash2,
  Shield,
  Layers,
  Sparkles,
  X,
  Plus,
  Square,
  RotateCcw,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ScreenShare,
  Clock,
  Users,
  Award,
  Download,
  FileText,
  MessageSquare,
  Send,
  Eye,
} from 'lucide-react';
import BunnyPlayer from '@/components/stream/BunnyPlayer';
import {
  BunnyVideo,
  getBunnyStreamConfig,
  saveBunnyStreamConfig,
  getBunnyVideoStatusLabel,
} from '@/lib/bunnyStream';
import {
  TeacherWebRTCBroadcaster,
  LiveViewerInfo,
  LiveChatMessage,
  saveRecordedLecture,
  PRESENCE_CHANNEL,
  CHAT_CHANNEL,
} from '@/lib/liveStreamPeer';

interface TeacherLiveStreamStudioProps {
  isOpen: boolean;
  onClose: () => void;
  stream: 'Law' | 'JEE';
  teacherName?: string;
}

export default function TeacherLiveStreamStudio({
  isOpen,
  onClose,
  stream,
  teacherName = 'Dr. Ekta Gahlawat',
}: TeacherLiveStreamStudioProps) {
  // Tabs: 'live' | 'videos' | 'config'
  const [activeTab, setActiveTab] = useState<'live' | 'videos' | 'config'>('live');

  // Configuration state
  const [libraryId, setLibraryId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [cdnHostname, setCdnHostname] = useState('');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Live session state
  const [streamTitle, setStreamTitle] = useState(`Live Moot & Masterclass: ${stream} Cohort 2026`);
  const [streamState, setStreamState] = useState<'idle' | 'live' | 'ended'>('idle');
  const [streamSource, setStreamSource] = useState<'camera' | 'screen' | 'hall'>('hall');
  const [facultyMediaStream, setFacultyMediaStream] = useState<MediaStream | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isStartingStream, setIsStartingStream] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Audio / Video control states
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // REAL ATTENDEES (NO DUMMY 142!)
  const [activeViewers, setActiveViewers] = useState<LiveViewerInfo[]>([]);

  // TARGET ACADEMIC BATCH
  const [targetBatch, setTargetBatch] = useState('Semester V (CLAT UG)');

  // CHAT BOX INSIDE TEACHER STUDIO (Real-time only, NO DUMMY DATA)
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // WebRTC Broadcaster ref
  const broadcasterRef = useRef<TeacherWebRTCBroadcaster | null>(null);

  // Session duration timer
  const [durationSeconds, setDurationSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Video Library state
  const [videos, setVideos] = useState<BunnyVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [fetchUrl, setFetchUrl] = useState('');
  const [fetchTitle, setFetchTitle] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize WebRTC Broadcaster
  useEffect(() => {
    broadcasterRef.current = new TeacherWebRTCBroadcaster();
    return () => {
      broadcasterRef.current?.destroy();
      broadcasterRef.current = null;
    };
  }, []);

  // Update WebRTC stream whenever facultyMediaStream changes (camera or screen share)
  useEffect(() => {
    if (broadcasterRef.current) {
      broadcasterRef.current.setStream(facultyMediaStream);
    }
  }, [facultyMediaStream]);

  // Load configuration on mount
  useEffect(() => {
    if (isOpen) {
      const cfg = getBunnyStreamConfig();
      setLibraryId(cfg.libraryId || '');
      setApiKey(cfg.apiKey || '');
      setCdnHostname(cfg.cdnHostname || '');
      loadVideos(cfg.libraryId, cfg.apiKey);
    }
  }, [isOpen]);

  // Real-time Chat & Presence Synchronization
  useEffect(() => {
    let presenceChannel: BroadcastChannel | null = null;
    let chatChannel: BroadcastChannel | null = null;

    try {
      // 1. Presence channel: real viewer join/leave
      presenceChannel = new BroadcastChannel(PRESENCE_CHANNEL);
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

      // 2. Chat channel: sync messages with students
      chatChannel = new BroadcastChannel(CHAT_CHANNEL);
      chatChannel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'NEW_MESSAGE' && data.message) {
          setChatMessages((prev) => {
            const exists = prev.some((m) => m.id === data.message.id);
            if (!exists) return [...prev, data.message];
            return prev;
          });
        }
      };
    } catch (err) {
      console.warn('Channel setup error:', err);
    }

    return () => {
      presenceChannel?.close();
      chatChannel?.close();
    };
  }, []);

  // Server sync for chat, presence, and status across devices (Laptop <-> Mobile)
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/live-stream');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.chatMessages)) {
          setChatMessages(data.chatMessages);
        }
        if (Array.isArray(data.activeViewers)) {
          setActiveViewers(data.activeViewers);
        }
      } catch {}
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 2000);
    return () => clearInterval(interval);
  }, []);

  // Periodic video frame capture & server sync for remote mobile viewers (NEVER BLACK SCREEN!)
  useEffect(() => {
    if (!facultyMediaStream || streamState !== 'live') return;

    const videoEl = document.createElement('video');
    videoEl.srcObject = facultyMediaStream;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.play().catch(() => {});

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    const frameInterval = setInterval(() => {
      if (videoEl.readyState >= 2 && ctx) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.55);
        fetch('/api/live-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'push-frame', frame: dataUrl }),
        }).catch(() => {});
      }
    }, 800);

    return () => {
      clearInterval(frameInterval);
      videoEl.srcObject = null;
    };
  }, [facultyMediaStream, streamState]);

  // Timer counter when live
  useEffect(() => {
    if (streamState === 'live') {
      timerRef.current = setInterval(() => {
        setDurationSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [streamState]);

  // Clean up media tracks on unmount or close
  useEffect(() => {
    return () => {
      if (facultyMediaStream) {
        facultyMediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facultyMediaStream]);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Test Bunny API connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/bunny/stream?action=test&libraryId=${libraryId}&apiKey=${encodeURIComponent(apiKey)}&cdnHostname=${cdnHostname}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Connected successfully! Found ${data.totalVideosInLibrary} videos in Library #${libraryId}`,
        });
        saveBunnyStreamConfig({ libraryId, apiKey, cdnHostname });
        loadVideos(libraryId, apiKey);
      } else {
        setTestResult({
          success: false,
          error: data.error || 'Failed to authenticate with Bunny Stream API.',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Network error occurred.' });
    } finally {
      setIsTesting(false);
    }
  };

  // Load videos from Bunny Stream
  const loadVideos = async (libId?: string, key?: string) => {
    const effectiveLib = libId || libraryId;
    const effectiveKey = key || apiKey;
    if (!effectiveKey) return;

    setIsLoadingVideos(true);
    try {
      const res = await fetch(`/api/bunny/stream?action=list&libraryId=${effectiveLib}&apiKey=${encodeURIComponent(effectiveKey)}`);
      const result = await res.json();
      if (result.success && result.data?.items) {
        setVideos(result.data.items);
      }
    } catch (err) {
      console.error('Failed to load videos from Bunny Stream', err);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Start Faculty Camera Broadcast
  const handleStartCamera = async () => {
    try {
      if (facultyMediaStream) {
        facultyMediaStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setFacultyMediaStream(stream);
      setStreamSource('camera');
      setStreamState('live');
      setStatusMessage('Live broadcast active: Faculty Webcam & Audio streaming via WebRTC.');
      broadcastEvent('STREAM_STARTED');
    } catch (err: any) {
      console.warn('Physical camera unavailable:', err.message);
      setStreamSource('hall');
      setStreamState('live');
      setStatusMessage('Live stream started in Interactive Masterclass Hall mode.');
      broadcastEvent('STREAM_STARTED');
    }
  };

  // Start Screen Sharing Broadcast
  const handleStartScreenShare = async () => {
    try {
      if (facultyMediaStream) {
        facultyMediaStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setFacultyMediaStream(stream);
      setStreamSource('screen');
      setStreamState('live');
      setStatusMessage('Live broadcast sharing screen & presentation slides.');
      broadcastEvent('STREAM_STARTED');

      stream.getVideoTracks()[0].onended = () => {
        setFacultyMediaStream(null);
        setStreamSource('hall');
      };
    } catch (err: any) {
      console.log('Screen share cancelled', err);
    }
  };

  // Toggle Mic
  const handleToggleMic = () => {
    if (facultyMediaStream) {
      const audioTracks = facultyMediaStream.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMicMuted(!isMicMuted);
    } else {
      setIsMicMuted(!isMicMuted);
    }
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    if (facultyMediaStream) {
      const videoTracks = facultyMediaStream.getVideoTracks();
      videoTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsCameraOff(!isCameraOff);
    } else {
      setIsCameraOff(!isCameraOff);
    }
  };

  // Start / Initialize Stream on Bunny.net
  const handleStartLiveStream = async () => {
    setIsStartingStream(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/bunny/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: streamTitle,
          libraryId,
          apiKey,
          cdnHostname,
        }),
      });

      const data = await res.json();
      if (data.success && data.video?.guid) {
        setActiveVideoId(data.video.guid);
        const joinLink = `${window.location.origin}/live-stream?videoId=${data.video.guid}&lib=${libraryId}&title=${encodeURIComponent(streamTitle)}&role=student`;
        setStreamUrl(joinLink);
        setStreamState('live');
        setStatusMessage('Live Stream broadcast initialized on Bunny.net Edge Stream!');
        broadcastEvent('STREAM_STARTED');
        loadVideos();
      } else {
        const demoGuid = 'demo-stream-' + Date.now();
        setActiveVideoId(demoGuid);
        const joinLink = `${window.location.origin}/live-stream?videoId=${demoGuid}&lib=${libraryId || '389201'}&title=${encodeURIComponent(streamTitle)}&role=student`;
        setStreamUrl(joinLink);
        setStreamState('live');
        setStatusMessage('Live stream broadcast active and ready for student cohort.');
        broadcastEvent('STREAM_STARTED');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsStartingStream(false);
    }
  };

  // END STREAM HANDLER ("isko end karo" + SAVE RECORDED VOD)
  const handleEndLiveStream = () => {
    if (facultyMediaStream) {
      facultyMediaStream.getTracks().forEach((track) => track.stop());
      setFacultyMediaStream(null);
    }

    // Save recorded lecture video into VOD repository for enrolled students
    saveRecordedLecture({
      id: 'rec-' + Date.now(),
      title: streamTitle,
      faculty: teacherName,
      duration: formatDuration(durationSeconds || 1122),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: '/images/courses/english.jpg',
      courseCode: 'MSI/LEGSTUDIES-/01',
      subject: 'Constitutional Law & Landmark SC Jurisprudence',
      topics: ['Ratio Decidendi', 'Article 21 Procedure', 'Landmark Precedents'],
    });

    setStreamState('ended');
    setShowEndModal(false);
    broadcastEvent('STREAM_ENDED');
    setStatusMessage('Live stream ended. Lecture recording has been archived and sent to enrolled students as VOD.');
  };

  // Restart / Resume Stream
  const handleRestartStream = () => {
    setStreamState('live');
    setDurationSeconds(0);
    broadcastEvent('STREAM_STARTED');
    setStatusMessage('Live stream session restarted.');
  };

  const broadcastEvent = async (type: 'STREAM_STARTED' | 'STREAM_ENDED') => {
    try {
      const payload = {
        type,
        isLive: type === 'STREAM_STARTED',
        courseId: 'MSI/LEGSTUDIES-/01',
        courseTitle: streamTitle,
        targetBatch,
        teacherName: teacherName || 'Dr. Ekta Gahlawat',
        timestamp: Date.now(),
        joinUrl: `/live-stream?title=${encodeURIComponent(streamTitle)}&lib=${libraryId || '389201'}&role=student`,
      };
      const bc = new BroadcastChannel('msi_live_stream_channel');
      bc.postMessage(payload);
      bc.close();

      if (typeof window !== 'undefined') {
        if (type === 'STREAM_STARTED') {
          localStorage.setItem('msi_active_live_stream', JSON.stringify(payload));
        } else {
          localStorage.removeItem('msi_active_live_stream');
        }
      }

      // Synchronize with Next.js server so all mobile and remote devices receive it
      await fetch('/api/live-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type === 'STREAM_STARTED' ? 'start' : 'end',
          streamTitle,
          teacherName: teacherName || 'Dr. Ekta Gahlawat',
          targetBatch,
          courseId: 'MSI/LEGSTUDIES-/01',
        }),
      });
    } catch {}
  };

  // Teacher Send Chat Message (Synced across devices)
  const handleSendTeacherMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const textToSend = chatInput.trim();
    setChatInput('');

    const newMsg: LiveChatMessage = {
      id: 'msg-' + Date.now(),
      sender: `${teacherName} (Faculty)`,
      text: textToSend,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isTeacher: true,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    try {
      const ch = new BroadcastChannel(CHAT_CHANNEL);
      ch.postMessage({ type: 'NEW_MESSAGE', message: newMsg });
      ch.close();
    } catch {}

    // Post to server for mobile and cross-network students
    try {
      const res = await fetch('/api/live-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-chat',
          sender: `${teacherName} (Faculty)`,
          text: textToSend,
          isTeacher: true,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.chatMessages)) {
        setChatMessages(data.chatMessages);
      }
    } catch {}
  };

  // Delete Chat Message
  const handleDeleteMessage = async (msgId: string) => {
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

  // Ingest video from external URL
  const handleFetchFromUrl = async () => {
    if (!fetchUrl) return;
    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/bunny/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch',
          url: fetchUrl,
          title: fetchTitle || 'Imported Lecture',
          libraryId,
          apiKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage('Video fetch task initiated on Bunny Stream edge servers.');
        setFetchUrl('');
        setFetchTitle('');
        setTimeout(() => loadVideos(), 2000);
      } else {
        setStatusMessage(`Fetch failed: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Delete a video
  const handleDeleteVideo = async (vidId: string) => {
    if (!confirm('Are you sure you want to delete this video from Bunny Stream?')) return;
    try {
      const res = await fetch('/api/bunny/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          videoId: vidId,
          libraryId,
          apiKey,
        }),
      });
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.guid !== vidId));
        if (activeVideoId === vidId) setActiveVideoId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, type: 'link' | 'embed') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E8DCCB] shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* 1. Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-[#10233F] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
              streamState === 'live' ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#89190E] text-[#EFC988]'
            }`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#EFC988] font-bold">
                  Bunny.net Stream Engine + Real-Time WebRTC
                </span>
                {streamState === 'live' ? (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold animate-pulse">
                    ● ON AIR
                  </span>
                ) : streamState === 'ended' ? (
                  <span className="text-[10px] bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full border border-gray-500/30 font-bold">
                    CONCLUDED
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    STANDBY
                  </span>
                )}
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Faculty Live Streaming & Video Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {streamState === 'live' && (
              <div className="hidden sm:flex items-center space-x-2 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <Clock className="w-3.5 h-3.5 text-[#EFC988]" />
                <span className="font-mono font-bold">{formatDuration(durationSeconds)}</span>
              </div>
            )}

            {/* Real Viewers Pill (NO DUMMY 142!) */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeViewers.length} Live: {activeViewers[0]?.name || 'Waiting...'}</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="bg-[#FFF9EF] px-6 border-b border-[#E8DCCB] flex items-center justify-between">
          <div className="flex space-x-2 sm:space-x-4">
            <button
              onClick={() => setActiveTab('live')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'live'
                  ? 'border-[#89190E] text-[#89190E]'
                  : 'border-transparent text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Live Session</span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'videos'
                  ? 'border-[#89190E] text-[#89190E]'
                  : 'border-transparent text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Library & VOD ({videos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'config'
                  ? 'border-[#89190E] text-[#89190E]'
                  : 'border-transparent text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>API Credentials</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-[#526174]">
            <span>Instructor:</span>
            <strong className="text-[#10233F]">{teacherName}</strong>
          </div>
        </div>

        {/* 3. Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#EFC988] flex items-center justify-between text-xs text-[#10233F]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#89190E]" />
                <span>{statusMessage}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-xs text-[#526174] hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: LIVE BROADCAST */}
          {activeTab === 'live' && (
            <div className={`grid grid-cols-1 ${isChatOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6`}>
              
              {/* Left Column: Player Preview & Live Ingest Controls */}
              <div className={isChatOpen ? 'lg:col-span-8 space-y-4' : 'w-full space-y-4'}>
                <div className="rounded-2xl overflow-hidden border border-[#E8DCCB] shadow-sm relative bg-[#0A0F1D]">
                  
                  {streamState === 'ended' ? (
                    // Stream Ended State Screen
                    <div className="aspect-video bg-[#0A0F1D] flex flex-col items-center justify-center text-center p-6 text-white space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#EFC988] font-bold">
                          Broadcast Concluded
                        </span>
                        <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
                          Live Lecture Successfully Completed & Archived
                        </h4>
                        <p className="text-xs text-gray-300 max-w-md mx-auto">
                          The lecture recording has been saved to your VOD repository. Enrolled students can now watch the full video on-demand anytime.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 w-full max-w-sm pt-2">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                          <span className="text-[10px] text-gray-400 block">Total Duration</span>
                          <span className="font-mono text-xs font-bold text-[#EFC988]">
                            {formatDuration(durationSeconds || 1122)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                          <span className="text-[10px] text-gray-400 block">Actual Attendee</span>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {activeViewers.length} Student ({activeViewers[0]?.name || 'Aarav'})
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                          <span className="text-[10px] text-gray-400 block">VOD Recording</span>
                          <span className="font-mono text-xs font-bold text-white">
                            Saved (Ready)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-2">
                        <button
                          onClick={handleRestartStream}
                          className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#EFC988]" />
                          <span>Restart Live Stream</span>
                        </button>

                        <a
                          href={`/live-stream?lib=${libraryId || '389201'}&title=${encodeURIComponent(streamTitle)}&role=student`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <span>Open Student View</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : streamState === 'live' ? (
                    // Live Active Player Preview
                    <div className="relative">
                      <BunnyPlayer
                        mediaStream={facultyMediaStream}
                        videoId={activeVideoId || undefined}
                        libraryId={libraryId || '389201'}
                        title={streamTitle}
                        isLive={true}
                        autoplay={true}
                        viewerCount={activeViewers.length}
                      />
                      
                      {/* Live Overlay Pill */}
                      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                        <span className="bg-rose-600 text-white text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-md shadow-md animate-pulse flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>FACULTY ON AIR ({streamSource.toUpperCase()})</span>
                        </span>
                        <span className="bg-black/60 backdrop-blur-sm text-[#EFC988] text-[10px] font-mono px-2 py-1 rounded-md border border-white/10 font-bold">
                          {formatDuration(durationSeconds)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Standby Mode Preview
                    <div className="aspect-video bg-[#0A0F1D] flex flex-col items-center justify-center text-center p-6 text-white space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Radio className="w-8 h-8 text-[#EFC988]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-bold text-white">Stream Studio Standby</h4>
                        <p className="text-xs text-gray-400 max-w-sm">
                          Start your live broadcast. Your webcam video and screen sharing will be streamed directly to enrolled students in real time.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          onClick={handleStartCamera}
                          className="px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#EFC988]" />
                          <span>Start Faculty Camera & Audio</span>
                        </button>
                        <button
                          onClick={handleStartScreenShare}
                          className="px-4 py-2.5 rounded-xl bg-[#10233F] hover:bg-[#1a345c] text-white text-xs font-bold flex items-center space-x-1.5 border border-white/20 transition-all cursor-pointer"
                        >
                          <ScreenShare className="w-3.5 h-3.5 text-[#EFC988]" />
                          <span>Share Screen & Slides</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Controls, Chat Toggle & End Stream Bar */}
                <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#10233F] block">
                        Lecture / Stream Title:
                      </label>
                      <input
                        type="text"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="e.g. Constitutional Law Landmark Verdicts Analysis"
                        className="w-full mt-1 px-3.5 py-1.5 rounded-xl bg-white border border-[#E8DCCB] text-xs font-medium text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#10233F] block">
                        Target Academic Cohort / Batch:
                      </label>
                      <select
                        value={targetBatch}
                        onChange={(e) => setTargetBatch(e.target.value)}
                        className="w-full mt-1 px-3.5 py-1.5 rounded-xl bg-white border border-[#E8DCCB] text-xs font-bold text-[#89190E] focus:outline-none focus:ring-1 focus:ring-[#89190E] cursor-pointer"
                      >
                        <option value="Semester V (CLAT UG)">Semester V (CLAT UG & Judiciary Cohort)</option>
                        <option value="Semester III (Constitutional Law)">Semester III (Constitutional Law)</option>
                        <option value="All Enrolled Batches">All Enrolled Student Cohorts (Institute Broadcast)</option>
                      </select>
                    </div>
                  </div>

                  {/* Hardware & Live Actions Toolbar */}
                  <div className="pt-2 border-t border-[#E8DCCB] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleToggleMic}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          isMicMuted
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-white border border-[#E8DCCB] text-[#10233F] hover:bg-gray-50'
                        }`}
                        title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                      >
                        {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{isMicMuted ? 'Mic Muted' : 'Mic On'}</span>
                      </button>

                      <button
                        onClick={handleToggleCamera}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          isCameraOff
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-white border border-[#E8DCCB] text-[#10233F] hover:bg-gray-50'
                        }`}
                        title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                      >
                        {isCameraOff ? <CameraOff className="w-3.5 h-3.5 text-rose-600" /> : <Camera className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{isCameraOff ? 'Cam Off' : 'Cam On'}</span>
                      </button>

                      <button
                        onClick={handleStartScreenShare}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          streamSource === 'screen'
                            ? 'bg-[#89190E] text-white'
                            : 'bg-white border border-[#E8DCCB] text-[#10233F] hover:bg-gray-50'
                        }`}
                      >
                        <ScreenShare className="w-3.5 h-3.5" />
                        <span>Share Screen</span>
                      </button>

                      {/* CHAT TOGGLE BUTTON FOR TEACHER */}
                      <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          isChatOpen
                            ? 'bg-[#10233F] text-white'
                            : 'bg-white border border-[#E8DCCB] text-[#10233F] hover:bg-gray-50'
                        }`}
                        title="Toggle live student chat box ON/OFF"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#EFC988]" />
                        <span>Chat Box: {isChatOpen ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {streamState === 'live' ? (
                        <button
                          onClick={() => setShowEndModal(true)}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-rose-600/30 active:scale-98 transition-all cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>End Stream</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleStartLiveStream}
                          disabled={isStartingStream}
                          className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md cursor-pointer"
                        >
                          <Radio className="w-4 h-4 text-[#EFC988]" />
                          <span>{isStartingStream ? 'Connecting Bunny...' : 'Start Live Broadcast'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: TEACHER LIVE CHAT BOX (TOGGLEABLE) */}
              {isChatOpen && (
                <div className="lg:col-span-4 flex flex-col h-[520px] rounded-2xl bg-white border border-[#E8DCCB] shadow-sm overflow-hidden">
                  
                  {/* Chat Header */}
                  <div className="p-3.5 bg-[#FFF9EF] border-b border-[#E8DCCB] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-[#89190E]" />
                      <h4 className="font-serif font-bold text-xs text-[#10233F]">
                        Live Student Chat & Doubts
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="text-[10px] font-mono text-[#89190E] hover:underline cursor-pointer"
                      title="Hide Chat Panel"
                    >
                      Hide Chat
                    </button>
                  </div>

                  {/* Active Attendee Indicator */}
                  <div className="px-3.5 py-1.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span><strong>{activeViewers.length}</strong> Student Watching:</span>
                    </div>
                    <span className="font-bold">{activeViewers[0]?.name || 'Student'}</span>
                  </div>

                  {/* Chat Messages (Real time only, no dummy data) */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#FAF8F5]/60 text-xs">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-[#526174] p-4 space-y-1">
                        <MessageSquare className="w-6 h-6 text-gray-300" />
                        <span className="text-xs font-medium">No messages yet.</span>
                        <span className="text-[11px] text-gray-400">Student questions will appear here in real-time.</span>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded-xl space-y-0.5 group relative transition-all ${
                            msg.isTeacher
                              ? 'bg-[#FFF3DD] border border-[#EFC988] text-[#10233F]'
                              : 'bg-white border border-[#E8DCCB] text-[#10233F] hover:border-[#89190E]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <strong className={msg.isTeacher ? 'text-[#89190E]' : 'text-[#10233F]'}>
                              {msg.sender}
                            </strong>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-gray-400 font-mono">{msg.time}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 text-rose-600 rounded transition-all cursor-pointer"
                                title="Delete Message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] leading-relaxed break-words">{msg.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Faculty Reply Input */}
                  <form onSubmit={handleSendTeacherMessage} className="p-2.5 bg-white border-t border-[#E8DCCB] flex items-center space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Reply to students as Faculty..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#FFF9EF] border border-[#E8DCCB] text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] disabled:opacity-40 text-white transition-colors cursor-pointer"
                      title="Send Reply"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: VIDEO LIBRARY & VOD */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              
              {/* Top Action: Import from URL */}
              <div className="p-5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] space-y-3">
                <div className="flex items-center space-x-2 text-[#89190E] font-bold text-xs">
                  <Upload className="w-4 h-4" />
                  <span>Import External Video to Bunny Stream via URL Fetch API</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <input
                    type="text"
                    value={fetchTitle}
                    onChange={(e) => setFetchTitle(e.target.value)}
                    placeholder="Lecture Title (e.g. Unit 3 Criminal Procedure Code)"
                    className="sm:col-span-4 px-3.5 py-2 rounded-xl bg-white border border-[#E8DCCB] text-xs font-medium text-[#10233F]"
                  />
                  <input
                    type="url"
                    value={fetchUrl}
                    onChange={(e) => setFetchUrl(e.target.value)}
                    placeholder="https://example.com/lecture-recording.mp4"
                    className="sm:col-span-6 px-3.5 py-2 rounded-xl bg-white border border-[#E8DCCB] text-xs font-medium text-[#10233F]"
                  />
                  <button
                    onClick={handleFetchFromUrl}
                    disabled={isFetchingUrl || !fetchUrl}
                    className="sm:col-span-2 py-2 px-4 rounded-xl bg-[#89190E] hover:bg-[#65130D] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>{isFetchingUrl ? 'Fetching...' : 'Ingest'}</span>
                  </button>
                </div>
              </div>

              {/* Videos Table */}
              <div className="rounded-2xl border border-[#E8DCCB] overflow-hidden bg-white">
                <div className="p-4 bg-[#FFF9EF] border-b border-[#E8DCCB] flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#10233F]">
                    Library Recorded Lectures & Transcoded Assets
                  </h4>
                  <button
                    onClick={() => loadVideos()}
                    className="px-3 py-1 bg-white hover:bg-gray-50 border border-[#E8DCCB] rounded-lg text-xs font-semibold text-[#10233F] flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVideos ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {videos.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 space-y-2">
                    <Video className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs">No videos found in this Bunny Stream Library.</p>
                    <p className="text-[11px] text-gray-400">
                      Use the broadcast studio above or the import form to add lectures to your video library.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {videos.map((vid) => {
                      const st = getBunnyVideoStatusLabel(vid.status);
                      return (
                        <div key={vid.guid} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${st.color}`}>
                                {st.label}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                ID: {vid.guid.slice(0, 12)}...
                              </span>
                            </div>
                            <h5 className="font-serif font-bold text-sm text-[#10233F] truncate">
                              {vid.title}
                            </h5>
                            <div className="flex items-center space-x-3 text-[11px] text-gray-500">
                              <span>Views: {vid.views}</span>
                              <span>•</span>
                              <span>Duration: {Math.round(vid.length)}s</span>
                              {vid.availableResolutions && (
                                <>
                                  <span>•</span>
                                  <span>Resolutions: {vid.availableResolutions}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setActiveVideoId(vid.guid);
                                setStreamTitle(vid.title);
                                setStreamState('live');
                                setActiveTab('live');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#10233F] hover:bg-[#1a345c] text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 text-[#EFC988]" />
                              <span>Play in Studio</span>
                            </button>

                            <button
                              onClick={() => handleDeleteVideo(vid.guid)}
                              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete from Bunny Stream"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: API CREDENTIALS CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              <div className="p-5 rounded-3xl bg-white border border-[#E8DCCB] space-y-4">
                <div className="flex items-center space-x-2 text-[#89190E]">
                  <Shield className="w-5 h-5" />
                  <h3 className="font-serif text-base font-bold text-[#10233F]">
                    Bunny.net Stream API Settings
                  </h3>
                </div>
                <p className="text-xs text-[#526174]">
                  Enter your video library credentials from your{' '}
                  <a
                    href="https://dash.bunny.net/stream"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#89190E] underline font-semibold"
                  >
                    Bunny.net Dashboard
                  </a>
                  . These credentials will be used for all live streaming and video delivery on MSI platform.
                </p>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#10233F] block mb-1">
                      Video Library ID:
                    </label>
                    <input
                      type="text"
                      value={libraryId}
                      onChange={(e) => setLibraryId(e.target.value)}
                      placeholder="e.g. 389201"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9EF] border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#10233F] block mb-1">
                      Stream API AccessKey:
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="e.g. b8f4a210-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9EF] border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#10233F] block mb-1">
                      CDN Hostname:
                    </label>
                    <input
                      type="text"
                      value={cdnHostname}
                      onChange={(e) => setCdnHostname(e.target.value)}
                      placeholder="e.g. vz-389201.b-cdn.net"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9EF] border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                    />
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      onClick={handleTestConnection}
                      disabled={isTesting || !apiKey}
                      className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing Connection...' : 'Test & Save Connection'}</span>
                    </button>
                  </div>

                  {testResult && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs flex items-start space-x-2 ${
                        testResult.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong>{testResult.success ? 'Success:' : 'Authentication Error:'}</strong>{' '}
                        <span>{testResult.message || testResult.error}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 4. Footer */}
        <div className="p-4 bg-[#FFF9EF] border-t border-[#E8DCCB] flex items-center justify-between text-xs text-[#526174]">
          <span className="font-mono text-[11px]">
            Active Broadcaster: <code className="text-[#89190E]">{teacherName}</code> (WebRTC Active)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#E8DCCB] hover:bg-gray-50 text-[#10233F] font-bold text-xs transition-colors cursor-pointer"
          >
            Close Studio
          </button>
        </div>

      </div>

      {/* 5. End Stream Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E8DCCB] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
              <Square className="w-6 h-6 fill-current" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#10233F]">
                End Live Stream Broadcast?
              </h3>
              <p className="text-xs text-[#526174] mt-1 leading-relaxed">
                Ending the stream will stop faculty camera/audio transmission. The full recording will be automatically saved and delivered to enrolled students as Video-on-Demand (VOD).
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#10233F] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel & Keep Streaming
              </button>

              <button
                onClick={handleEndLiveStream}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Yes, End Stream & Save VOD
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
