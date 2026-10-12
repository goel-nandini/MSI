'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Globe,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Edit2,
  BookOpen,
  LogIn,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import { enrollStudentAction } from '@/lib/lmsStore';

type AuthMode = 'signin' | 'signup';
type AuthStep = 'input' | 'otp';

export default function StudentLoginPage() {
  const router = useRouter();

  // Authentication Mode: Sign In (Returning) vs Sign Up (New Registration)
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [authStep, setAuthStep] = useState<AuthStep>('input');

  // Input fields (Mobile-only authentication)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('PCS-J Punjab Judicial Services');

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 6-digit OTP input refs for keyboard navigation
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check URL query parameters (e.g. ?tab=signup)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'signup') {
        setAuthMode('signup');
      }
    }
  }, []);

  // Timer countdown handler for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Clean phone input to accept standard 10 digits
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setErrorMessage('');
  };

  // Helper: Persist session and redirect to student dashboard
  const completeAuthAndRedirect = (userData: {
    name?: string;
    phone?: string;
    stream?: string;
  }) => {
    try {
      localStorage.setItem('msi_student_logged_in', 'true');
      if (userData.name) localStorage.setItem('msi_active_student_name', userData.name);
      if (userData.phone) localStorage.setItem('msi_active_student_phone', userData.phone);
      if (userData.stream) localStorage.setItem('msi_active_student_stream', userData.stream);

      // Handle course auto-enrollment if coming from a course CTA
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const enrollCourseId = params.get('enrollCourseId');
        if (enrollCourseId) {
          enrollStudentAction('msi-stu-001', enrollCourseId, 'self');
        }
      }
    } catch (err) {
      console.error('Failed to save auth state:', err);
    }

    setSuccessMessage('Verified successfully! Redirecting to student portal...');
    setTimeout(() => {
      router.push('/student/dashboard');
    }, 800);
  };

  // Step 1: Request SMS OTP via ApiTxt Gateway
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phoneNumber || phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (authMode === 'signup' && !studentFullName.trim()) {
      setErrorMessage('Please enter your full legal name to register.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          purpose: authMode,
          name: studentFullName.trim() || undefined,
          stream: selectedBatch,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to dispatch verification SMS.');
        if (data.devOtp) {
          setAuthStep('otp');
          setDevOtpNotification(data.devOtp);
          setResendCountdown(30);
        }
        setIsLoading(false);
        return;
      }

      // Live SMS dispatched via ApiTxt
      setAuthStep('otp');
      setResendCountdown(data.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);
      setDevOtpNotification(null);
      setSuccessMessage(data.message || 'OTP dispatched to your mobile number via SMS!');

      // Auto-focus first digit box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage('Network error while dispatching SMS. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Submitted 6-Digit OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: fullOtp,
          name: studentFullName.trim() || undefined,
          stream: selectedBatch,
          purpose: authMode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Invalid or expired OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      completeAuthAndRedirect({
        name: data.user?.name || studentFullName || 'MSI Student',
        phone: data.user?.phone || `+91 ${phoneNumber}`,
        stream: data.user?.stream || selectedBatch,
      });
    } catch (err: any) {
      setErrorMessage('Network error during verification. Please try again.');
      setIsLoading(false);
    }
  };

  // OTP Digit Box Keyboard & Paste Handlers
  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setErrorMessage('');

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedText) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedText[i] || '';
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pastedText.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleAutoFillDevOtp = () => {
    if (!devOtpNotification || devOtpNotification.length !== 6) return;
    const digits = devOtpNotification.split('');
    setOtpDigits(digits);
    otpInputRefs.current[5]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#FFF9EF] flex flex-col justify-between selection:bg-[#EFC988] selection:text-[#89190E] relative overflow-hidden">
      {/* Background Decorative Grid & Ambient Glows */}
      <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#89190E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#EFC988]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="relative z-10 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-[#E8DCCB]/60 bg-white/70 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-11 h-11 transition-transform group-hover:scale-105">
            <Image
              src="/images/msi-crest.png"
              alt="MSI Official Seal"
              fill
              priority
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-[#10233F] tracking-tight block leading-none">
              MSI
            </span>
            <span className="text-[10px] tracking-wider text-[#89190E] font-bold uppercase block mt-0.5">
              Group of Institutes
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-[#E8DCCB] hover:border-[#89190E] text-xs font-semibold text-[#526174] hover:text-[#89190E] transition-all shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-[#89190E]" />
            <span>Public Website</span>
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-[#E8DCCB] rounded-3xl p-6 sm:p-9 shadow-2xl hud-bracket relative">
          
          {/* Card Top Icon & Badge */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF3DD] border border-[#EFC988] text-[#89190E] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Smartphone className="w-7 h-7 text-[#89190E]" />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FFF9EF] border border-[#E8DCCB] mb-1.5">
              <Sparkles className="w-3 h-3 text-[#89190E]" />
              <span className="text-[10px] font-mono tracking-widest text-[#89190E] uppercase font-bold">
                Student Access Gateway
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F]">
              {authStep === 'otp'
                ? 'Verify Mobile OTP'
                : authMode === 'signin'
                ? 'Student Sign In'
                : 'Student Registration'}
            </h1>

            <p className="text-xs text-[#526174] mt-1.5">
              {authStep === 'otp'
                ? 'Enter the 6-digit verification code delivered to your mobile.'
                : authMode === 'signin'
                ? 'Enter your mobile number to receive an instant verification OTP.'
                : 'Create your student profile and verify via mobile OTP.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In vs New Registration) */}
          {authStep === 'input' && (
            <div className="mt-5 p-1 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] grid grid-cols-2 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  authMode === 'signin'
                    ? 'bg-[#89190E] text-white shadow-sm'
                    : 'text-[#526174] hover:text-[#10233F]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  authMode === 'signup'
                    ? 'bg-[#89190E] text-white shadow-sm'
                    : 'text-[#526174] hover:text-[#10233F]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Registration</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================== */}
          {/* STEP 1: MOBILE NUMBER & REGISTRATION DETAILS INPUT        */}
          {/* ========================================================== */}
          {authStep === 'input' && (
            <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
              {/* If New Registration: Ask for Legal Name & Course Stream */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                      Full Legal Name <span className="text-[#89190E]">*</span>
                    </label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={studentFullName}
                        onChange={(e) => setStudentFullName(e.target.value)}
                        placeholder="e.g. Priyanshu Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                      Primary Course Stream
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs font-semibold text-[#10233F] focus:outline-none focus:border-[#89190E]"
                      >
                        <option value="PCS-J Punjab Judicial Services">PCS-J Punjab Judicial Services</option>
                        <option value="CLAT & AILET Supreme Batch">CLAT & AILET Supreme Batch</option>
                        <option value="Criminal Law BNSS Masterclass">Criminal Law BNSS Masterclass</option>
                        <option value="Cyber Law & Digital Evidence">Cyber Law & Digital Evidence</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Mobile Number Input (+91 India) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                  Mobile Number <span className="text-[#89190E]">*</span>
                </label>
                <div className="flex rounded-xl border border-[#E8DCCB] focus-within:border-[#89190E] focus-within:ring-1 focus-within:ring-[#89190E] overflow-hidden bg-[#FFF9EF]/40 transition-all">
                  <div className="flex items-center space-x-1 px-3 bg-[#FFF3DD] border-r border-[#E8DCCB] text-xs font-bold text-[#89190E] flex-shrink-0 select-none">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full px-3 py-3 text-sm text-[#10233F] font-mono tracking-wider focus:outline-none bg-transparent"
                  />
                </div>
                <span className="text-[11px] text-[#526174] block mt-1">
                  A 6-digit OTP will be dispatched to this number via SMS.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 10}
                className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Sending SMS OTP...</span>
                ) : (
                  <>
                    <span>{authMode === 'signup' ? 'Register & Send OTP' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Bottom Quick Switch */}
              <div className="text-center pt-2">
                {authMode === 'signin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#526174] hover:text-[#89190E]"
                  >
                    Don&apos;t have an account?{' '}
                    <span className="text-[#89190E] font-bold underline">
                      Register as New Student
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#526174] hover:text-[#89190E]"
                  >
                    Already registered?{' '}
                    <span className="text-[#89190E] font-bold underline">
                      Sign In with Mobile OTP
                    </span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* STEP 2: 6-DIGIT OTP VERIFICATION BOX                      */}
          {/* ========================================================== */}
          {authStep === 'otp' && (
            <div className="mt-5 space-y-4 animate-fadeIn">
              {/* Phone Confirmation Strip with Edit Option */}
              <div className="p-3 bg-[#FFF9EF] rounded-2xl border border-[#E8DCCB] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#526174] block uppercase font-mono">
                    Sending OTP to:
                  </span>
                  <span className="text-sm font-bold font-mono text-[#10233F]">
                    +91 {phoneNumber.slice(0, 5)} {phoneNumber.slice(5)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('input');
                    setErrorMessage('');
                    setSuccessMessage('');
                    setDevOtpNotification(null);
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-[#E8DCCB] text-[11px] font-semibold text-[#89190E] hover:bg-[#FFF3DD] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Number</span>
                </button>
              </div>

              {/* Dev Mode notification helper if test fallback was triggered */}
              {devOtpNotification && (
                <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl text-amber-900 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-bold">Test OTP Generated</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillDevOtp}
                      className="px-2 py-0.5 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-800 leading-tight">
                    For local testing, your verification code is:{' '}
                    <span className="font-mono font-bold tracking-widest text-base text-amber-950">
                      {devOtpNotification}
                    </span>
                  </p>
                </div>
              )}

              {/* 6-Digit Segmented Input Grid */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] text-center mb-2">
                  Enter 6-Digit Code
                </label>

                <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-full aspect-square text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border-2 transition-all focus:outline-none ${
                        digit
                          ? 'border-[#89190E] bg-white text-[#89190E] shadow-xs'
                          : 'border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] focus:border-[#89190E]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend Countdown */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#526174]">Didn&apos;t receive SMS?</span>

                {resendCountdown > 0 ? (
                  <span className="font-mono text-xs font-semibold text-[#89190E]">
                    Resend in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    className="flex items-center space-x-1 text-xs font-bold text-[#89190E] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* Verify & Enter Portal Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Enter Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security & Regulatory Footnote */}
          <div className="mt-6 pt-5 border-t border-[#E8DCCB] flex items-center justify-center space-x-2 text-[11px] text-[#526174]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Maharaja Surajmal Institute Official Student Portal</span>
          </div>

        </div>
      </main>

      {/* Footer Strip */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#526174] border-t border-[#E8DCCB]/60">
        © {new Date().getFullYear()} Maharaja Surajmal Institute. All rights reserved. • Kharar, Mohali, Punjab.
      </footer>
    </div>
  );
}
