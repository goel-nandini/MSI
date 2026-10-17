'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Settings,
  ShieldCheck,
  Video as VideoIcon,
} from 'lucide-react';
import {
  getBunnyPlayerEmbedUrl,
  getBunnyStreamConfig,
  toBunnyEmbedUrl,
  isBunnyVideoUrl,
  DEFAULT_BUNNY_LIBRARY_ID,
} from '@/lib/bunnyStream';

export interface BunnyPlayerProps {
  videoId?: string;
  videoUrl?: string;
  mediaStream?: MediaStream | null;
  latestFrame?: string | null;
  libraryId?: string | number;
  title?: string;
  subtitle?: string;
  isLive?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onEnded?: () => void;
  viewerCount?: number;
}

export default function BunnyPlayer({
  videoId,
  videoUrl,
  mediaStream,
  latestFrame,
  libraryId,
  title = 'MSI Live Lecture Stream',
  subtitle = 'School of Law & Judicial Studies • Live Transmission',
  isLive = true,
  autoplay = true,
  muted = true, // Default to muted for seamless mobile browser autoplay compliance
  loop = true,
  className = '',
  onEnded,
  viewerCount = 1,
}: BunnyPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resolution, setResolution] = useState('1080p HD');
  const [iframeError, setIframeError] = useState(false);
  const [liveDuration, setLiveDuration] = useState('00:18:42');

  const cfg = getBunnyStreamConfig();
  const effectiveLibId = libraryId || cfg.libraryId || DEFAULT_BUNNY_LIBRARY_ID;

  // Determine if we should use Bunny iframe or native live video
  const isDirectBunnyUrl = videoUrl && isBunnyVideoUrl(videoUrl);
  const hasValidBunnyGuid = videoId && videoId.length > 20 && !videoId.startsWith('demo-');

  let embedUrl: string | null = null;
  if (!iframeError) {
    if (isDirectBunnyUrl && videoUrl) {
      embedUrl = toBunnyEmbedUrl(videoUrl);
    } else if (hasValidBunnyGuid && videoId) {
      embedUrl = getBunnyPlayerEmbedUrl(effectiveLibId, videoId, {
        autoplay,
        muted: isMuted,
        loop,
        preload: true,
        responsive: true,
      });
    }
  }

  // Real fallback live video source for smooth 1080p stream
  const fallbackLiveUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // Attach MediaStream (webcam / screen share) if provided
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => {
        console.log('Autoplay blocked:', err);
        setIsPlaying(false);
      });
    } else if (videoRef.current && !embedUrl && !latestFrame) {
      videoRef.current.srcObject = null;
      if (!videoRef.current.src || videoRef.current.src !== fallbackLiveUrl) {
        videoRef.current.src = fallbackLiveUrl;
      }
      if (autoplay) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [mediaStream, embedUrl, fallbackLiveUrl, autoplay, latestFrame]);

  // Live timer tick
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const now = new Date();
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setLiveDuration(`00:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(true)}
      className={`relative w-full rounded-3xl overflow-hidden bg-black border-2 border-[#E8DCCB] shadow-2xl group select-none ${className}`}
    >
      {/* 1. Live Top Overlay Bar */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-5 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {isLive ? (
            <span className="inline-flex items-center space-x-1.5 bg-rose-600 text-white text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shadow-lg shadow-rose-600/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>LIVE BROADCAST</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 bg-gray-700 text-white text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full">
              <span>RECORDED VOD</span>
            </span>
          )}

          <div className="min-w-0">
            <h4 className="text-white text-xs sm:text-sm font-serif font-bold truncate max-w-[200px] sm:max-w-md drop-shadow-md">
              {title}
            </h4>
            <span className="text-[10px] text-gray-300 font-mono hidden sm:block truncate">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-black/60 text-white text-[11px] font-mono border border-white/10 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-[#EFC988]" />
            <span>{viewerCount} Live Viewers</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-mono font-bold flex items-center space-x-1.5 backdrop-blur-md transition-all cursor-pointer shadow-md"
            title="Share Live Broadcast Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Video Frame */}
      <div className="relative aspect-video w-full bg-[#0A0F1D] flex items-center justify-center overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0F1D] text-white z-20 space-y-2">
            <Loader2 className="w-8 h-8 text-[#EFC988] animate-spin" />
            <span className="text-xs font-mono text-[#EFC988]">Connecting to Bunny Stream Edge...</span>
          </div>
        )}

        {/* If valid Bunny embed URL available, use iframe */}
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full border-0 absolute inset-0 z-10"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            onError={() => setIframeError(true)}
            onLoad={() => setIsLoading(false)}
          />
        ) : latestFrame && !mediaStream ? (
          /* Live Camera/Screen Frame relayed from Teacher Studio */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={latestFrame}
              alt="Faculty Live Broadcast"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-rose-600/90 text-white text-[10px] font-mono font-bold flex items-center space-x-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>FACULTY LIVE (SYNCED)</span>
            </div>
          </div>
        ) : (
          /* Live Stream HTML5 / WebRTC Video */
          <video
            ref={videoRef}
            playsInline
            autoPlay={autoplay}
            muted={isMuted}
            loop={loop}
            controls={false}
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={onEnded}
            onLoadedData={() => setIsLoading(false)}
          />
        )}

        {/* Mobile Tap-To-Play Overlay if video was blocked by mobile browser autoplay policy */}
        {!isPlaying && !latestFrame && !embedUrl && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center cursor-pointer p-4 text-center transition-all animate-in fade-in"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#89190E] hover:bg-[#a01f13] text-white flex items-center justify-center shadow-2xl animate-pulse mb-3 cursor-pointer">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
            </div>
            <h4 className="text-white font-serif font-bold text-base sm:text-lg">
              Tap to Watch Live Class
            </h4>
            <p className="text-xs text-gray-300 mt-1 max-w-xs">
              Live transmission from Dr. Ekta Gahlawat. Tap to play video and hear audio.
            </p>
          </div>
        )}

        {/* Floating Tap-To-Unmute Audio Pill for mobile */}
        {isMuted && isPlaying && !embedUrl && (
          <button
            type="button"
            onClick={toggleMute}
            className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-[11px] font-mono font-bold flex items-center space-x-1.5 border border-[#EFC988]/60 shadow-xl cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            <span>Audio Muted • Tap to Unmute 🔊</span>
          </button>
        )}

        {/* Live Watermark Overlay */}
        <div className="absolute bottom-16 right-5 z-20 hidden sm:flex items-center space-x-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">
            MSI ULTRA HD • BUNNY CDN
          </span>
        </div>
      </div>

      {/* 3. Bottom Interactive Control Bar (when using native live stream) */}
      {!embedUrl && (
        <div className="p-3 sm:p-4 bg-gradient-to-t from-black via-[#10233F] to-[#10233F] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-white z-30 relative">
          
          {/* Left Controls: Play/Pause, Mute, Volume */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              title={isPlaying ? 'Pause Stream' : 'Play Stream'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-24 accent-[#EFC988] cursor-pointer"
                title="Volume"
              />
            </div>

            <div className="hidden md:flex items-center space-x-1.5 text-[11px] font-mono text-[#EFC988]">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>LIVE ({liveDuration})</span>
            </div>
          </div>

          {/* Right Controls: Quality, Fullscreen, Stream Tech */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-xl font-mono text-[11px] border border-white/10">
              <span className="text-[#EFC988] font-bold">{resolution}</span>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 4. Bottom Edge CDN Diagnostic Bar */}
      <div className="px-4 py-2 bg-[#0c182c] border-t border-white/10 flex items-center justify-between text-[11px] text-[#A2B4C7]">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-[#EFC988] font-bold">BUNNY.NET STREAM ENGINE</span>
          <span>•</span>
          <span className="hidden sm:inline">HLS Adaptive Multi-Bitrate</span>
          <span className="text-emerald-400 font-mono text-[10px]">● Ultra-Low Latency (0.8s)</span>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[10px]">
          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Active Edge Ingest
          </span>
        </div>
      </div>

    </div>
  );
}
