'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
  SwitchCamera,
  Timer,
  Zap,
} from 'lucide-react';

interface WebcamCaptureModalProps {
  onCapture: (photoUrl: string) => void;
  onClose: () => void;
  visitorName?: string;
}

export default function WebcamCaptureModal({
  onCapture,
  onClose,
  visitorName,
}: WebcamCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraState, setCameraState] = useState<'initializing' | 'active' | 'error'>('initializing');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [useTimer, setUseTimer] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Stop camera stream tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Track stop error:', e);
        }
      });
      streamRef.current = null;
    }
  }, []);

  // Connect stream to video element safely
  const bindStreamToVideo = useCallback((videoElement: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!videoElement || !stream) return;
    try {
      videoElement.srcObject = stream;
      videoElement.onloadedmetadata = () => {
        videoElement.play().catch((err) => {
          console.warn('Autoplay error:', err);
        });
      };
    } catch (err) {
      console.warn('bindStreamToVideo error:', err);
    }
  }, []);

  // Callback ref for video element ensures srcObject is bound whenever the element mounts
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      bindStreamToVideo(element, streamRef.current);
    }
  }, [bindStreamToVideo]);

  // Start webcam
  const startCamera = useCallback(async (deviceIdToUse?: string) => {
    setErrorMessage(null);
    setCapturedImage(null);
    setCameraState('initializing');

    try {
      stopCamera();

      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        setCameraState('error');
        setErrorMessage('Webcam access is not supported by your browser. Please use the Upload Photo option below.');
        return;
      }

      // Constraints with graceful fallback
      let stream: MediaStream | null = null;

      try {
        const videoConstraints: MediaTrackConstraints = deviceIdToUse
          ? { deviceId: { exact: deviceIdToUse } }
          : {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            };

        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
      } catch (constraintErr) {
        console.warn('FacingMode / HD constraint failed, trying basic video:', constraintErr);
        // Fallback to basic video constraint without facingMode (fixes many Windows USB cameras)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        bindStreamToVideo(videoRef.current, stream);
      }

      setCameraState('active');

      // Enumerate camera devices for device switcher
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoDevices);
        if (!deviceIdToUse && videoDevices.length > 0) {
          const currentTrack = stream.getVideoTracks()[0];
          const settings = currentTrack?.getSettings?.();
          if (settings?.deviceId) {
            setSelectedDeviceId(settings.deviceId);
          }
        }
      } catch (enumErr) {
        console.warn('Could not enumerate devices:', enumErr);
      }
    } catch (err: unknown) {
      console.error('Webcam access error:', err);
      setCameraState('error');
      setErrorMessage(
        'Unable to access webcam. Please verify camera permissions in your browser or click "Upload Photo" below.'
      );
    }
  }, [stopCamera, bindStreamToVideo]);

  // Initial mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Switch camera device
  const handleSwitchDevice = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    startCamera(newDeviceId);
  };

  // Execute snapshot from active video stream
  const executeCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    const squareSize = 500;
    canvas.width = squareSize;
    canvas.height = squareSize;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Center-crop to clean square for ID badge
      const minDim = Math.min(width, height);
      const startX = (width - minDim) / 2;
      const startY = (height - minDim) / 2;

      ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, squareSize, squareSize);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  // Snap trigger (instant vs 3s countdown)
  const handleSnapClick = () => {
    if (!useTimer) {
      executeCapture();
      return;
    }

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          executeCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 700);
  };

  // Upload file fallback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setCapturedImage(result);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8DCCB] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FFF9EF] border-b border-[#E8DCCB] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#89190E] text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#10233F]">
                Visitor Badge Photo Capture
              </h3>
              <p className="text-[11px] text-[#526174]">
                {visitorName ? `Official entry pass photo for ${visitorName}` : 'Position visitor face within the alignment guide'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-[#526174] hover:text-[#10233F] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-5 sm:p-6 flex flex-col items-center justify-center bg-[#10233F]/5">
          {/* Main Camera Frame */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#89190E]/30 bg-black flex items-center justify-center shadow-lg">
            {capturedImage ? (
              // Captured Preview
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capturedImage}
                alt="Captured visitor"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                {/* Persistent Video Element */}
                <video
                  ref={setVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraState === 'active' ? 'block' : 'hidden'}`}
                />

                {/* Initializing / Loading Indicator */}
                {cameraState === 'initializing' && (
                  <div className="flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-[#EFC988] animate-spin" />
                    <span className="text-xs font-semibold">Initializing Camera Stream...</span>
                    <span className="text-[10px] text-white/60">Please allow browser webcam permission</span>
                  </div>
                )}

                {/* Error / No Camera Fallback */}
                {cameraState === 'error' && (
                  <div className="p-6 text-center text-white/90 flex flex-col items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                    <p className="text-xs font-bold text-white">Camera Offline or Blocked</p>
                    <p className="text-[11px] text-white/70 mt-1 max-w-[220px]">
                      {errorMessage || 'Webcam permission was denied or no camera found.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo Instead</span>
                    </button>
                  </div>
                )}

                {/* Alignment Silhouette Overlay when camera is active */}
                {cameraState === 'active' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-60 border-2 border-emerald-400/80 rounded-full border-dashed animate-pulse flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      <span className="text-[10px] font-bold text-white bg-black/60 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider backdrop-blur-xs">
                        Align Face Here
                      </span>
                    </div>
                  </div>
                )}

                {/* Live Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                    <span className="text-7xl font-bold text-white font-mono animate-bounce drop-shadow-lg">
                      {countdown}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls Bar under camera */}
          {!capturedImage && cameraState === 'active' && (
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              {/* Instant vs Timer Toggle */}
              <button
                type="button"
                onClick={() => setUseTimer(!useTimer)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                  useTimer
                    ? 'bg-[#89190E] text-white border-[#89190E]'
                    : 'bg-white text-[#526174] border-[#E8DCCB] hover:text-[#10233F]'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{useTimer ? '3-Sec Timer ON' : 'Instant Snap'}</span>
              </button>

              {/* Multiple Camera Switcher */}
              {availableDevices.length > 1 && (
                <div className="flex items-center space-x-1.5 bg-white border border-[#E8DCCB] rounded-xl px-2.5 py-1">
                  <SwitchCamera className="w-3.5 h-3.5 text-[#89190E]" />
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleSwitchDevice(e.target.value)}
                    className="text-xs bg-transparent text-[#10233F] font-medium focus:outline-none cursor-pointer"
                  >
                    {availableDevices.map((dev, idx) => (
                      <option key={dev.deviceId || idx} value={dev.deviceId}>
                        {dev.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Upload fallback button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF9EF] border border-[#E8DCCB] text-xs font-semibold text-[#526174] hover:text-[#10233F] flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#89190E]" />
                <span>Upload File</span>
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-white border-t border-[#E8DCCB] flex items-center justify-between">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setCapturedImage(null);
                  startCamera(selectedDeviceId);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#E8DCCB] hover:border-[#10233F] text-xs font-bold text-[#10233F] flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-[#89190E]/20 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Use This Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#526174] hover:bg-black/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {cameraState === 'active' ? (
                <button
                  type="button"
                  onClick={handleSnapClick}
                  disabled={countdown !== null}
                  className="px-6 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-[#EFC988]" />
                  <span>{useTimer ? 'Start Timer & Snap' : 'Snap Photo Now'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-[#10233F] hover:bg-[#1C3A66] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#EFC988]" />
                  <span>Select Image File</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
