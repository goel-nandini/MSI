'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
  Globe,
  AlertCircle,
  Smartphone,
  CheckCircle2,
  RotateCcw,
  Edit2,
  KeyRound,
  BookOpen,
} from 'lucide-react';
import { enrollStudentAction } from '@/lib/lmsStore';

type AuthMethod = 'mobile' | 'email';
type MobileStep = 'input' | 'otp';
type MobileMode = 'signin' | 'signup';

export default function StudentLoginPage() {
  const router = useRouter();

  // Top Auth Method: Mobile OTP (Default & Recommended) vs Email & Password
  const [authMethod, setAuthMethod] = useState<AuthMethod>('mobile');

  // Mobile OTP State
  const [mobileMode, setMobileMode] = useState<MobileMode>('signin');
  const [mobileStep, setMobileStep] = useState<MobileStep>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);

  // Mobile Sign Up extra details
  const [studentFullName, setStudentFullName] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('PCS-J Punjab Judicial Services');
  const [optionalEmail, setOptionalEmail] = useState('');

  // Email / Password Fallback Tab State
  const [emailTab, setEmailTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('aarav.sharma@msi-institutes.edu.in');
  const [password, setPassword] = useState('Judiciary@2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Input refs for 6-digit OTP boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check URL query parameters (e.g. ?tab=signup or ?mode=email)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'signup') {
        setMobileMode('signup');
        setEmailTab('signup');
      }
      if (params.get('method') === 'email') {
        setAuthMethod('email');
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
    // Keep only numbers and max 10 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setErrorMessage('');
  };

  // Helper: Persist session and redirect
  const completeAuthAndRedirect = (userData: {
    name?: string;
    phone?: string;
    email?: string;
    stream?: string;
  }) => {
    try {
      localStorage.setItem('msi_student_logged_in', 'true');
      if (userData.name) localStorage.setItem('msi_active_student_name', userData.name);
      if (userData.phone) localStorage.setItem('msi_active_student_phone', userData.phone);
      if (userData.email) localStorage.setItem('msi_active_student_email', userData.email);
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

  // Step 1: Send SMS OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phoneNumber || phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (mobileMode === 'signup' && !studentFullName.trim()) {
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
          purpose: mobileMode,
          name: studentFullName.trim() || undefined,
          email: optionalEmail.trim() || undefined,
          stream: selectedBatch,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to dispatch verification SMS.');
        if (data.devOtp) {
          setMobileStep('otp');
          setDevOtpNotification(data.devOtp);
          setResendCountdown(30);
        }
        setIsLoading(false);
        return;
      }

      // Success (Live SMS sent via ApiTxt)
      setMobileStep('otp');
      setResendCountdown(data.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);
      setDevOtpNotification(null);
      setSuccessMessage(data.message || 'SMS dispatched! Check your mobile messages.');

      // Focus first OTP digit box after state transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage('Network error while dispatching SMS. Please verify connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Submitted OTP
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
          email: optionalEmail.trim() || undefined,
          stream: selectedBatch,
          purpose: mobileMode,
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
        email: data.user?.email || optionalEmail,
        stream: data.user?.stream || selectedBatch,
      });
    } catch (err: any) {
      setErrorMessage('Network error during verification. Please try again.');
      setIsLoading(false);
    }
  };

  // OTP Digit Box Keyboard & Paste Handlers
  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1); // Only last numeric char
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setErrorMessage('');

    // Advance focus to next input if digit entered
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
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

  // Traditional Email/Password Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please provide both institutional email and password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      completeAuthAndRedirect({
        email,
        name: 'Aarav Sharma',
        phone: '+91 98765 43210',
      });
    }, 600);
  };

  // 1-Click Demo Profiles
  const handleQuickDemo = (demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setPassword('Demo@MSI2025');
    setIsLoading(true);
    setTimeout(() => {
      completeAuthAndRedirect({
        email: demoEmail,
        name: demoName,
        phone: '+91 98765 43210',
      });
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EF] flex flex-col justify-between selection:bg-[#EFC988] selection:text-[#89190E] relative overflow-hidden">
      {/* Background Decorative Grid & Glows */}
      <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#89190E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#EFC988]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
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
            <span>Back to Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-[#E8DCCB] rounded-3xl p-6 sm:p-9 shadow-2xl hud-bracket relative">
          
          {/* Card Header */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF3DD] border border-[#EFC988] text-[#89190E] flex items-center justify-center mx-auto mb-3 shadow-xs">
              {authMethod === 'mobile' ? (
                <Smartphone className="w-7 h-7 text-[#89190E]" />
              ) : (
                <Lock className="w-6 h-6 text-[#89190E]" />
              )}
            </div>

            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FFF9EF] border border-[#E8DCCB] mb-1.5">
              <Sparkles className="w-3 h-3 text-[#89190E]" />
              <span className="text-[10px] font-mono tracking-widest text-[#89190E] uppercase font-bold">
                Student Access Gateway
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F]">
              {authMethod === 'mobile'
                ? mobileStep === 'otp'
                  ? 'Verify Mobile OTP'
                  : mobileMode === 'signin'
                  ? 'Sign In with Mobile OTP'
                  : 'Register Student Account'
                : 'Email & Password Sign In'}
            </h1>

            <p className="text-xs text-[#526174] mt-1.5">
              {authMethod === 'mobile'
                ? mobileStep === 'otp'
                  ? 'Enter the 6-digit verification code delivered via SMS.'
                  : 'Fast & secure login without remembering passwords.'
                : 'Access student records with institutional credentials.'}
            </p>
          </div>

          {/* Method Selector: Mobile OTP vs Institutional Email */}
          <div className="mt-5 p-1 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('mobile');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                authMethod === 'mobile'
                  ? 'bg-[#89190E] text-white shadow-sm'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                  authMethod === 'mobile' ? 'bg-[#EFC988] text-[#89190E]' : 'bg-[#89190E]/10 text-[#89190E]'
                }`}
              >
                Fast
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                authMethod === 'email'
                  ? 'bg-[#89190E] text-white shadow-sm'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email / Password</span>
            </button>
          </div>

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
          {/* METHOD 1: MOBILE OTP AUTHENTICATION FLOW                   */}
          {/* ========================================================== */}
          {authMethod === 'mobile' && (
            <div className="mt-5">
              {/* STEP 1: Phone & Sign In / Sign Up Details Input */}
              {mobileStep === 'input' && (
                <>
                  {/* Mode Toggle: Sign In vs Sign Up */}
                  <div className="mb-4 flex border-b border-[#E8DCCB] text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMode('signin');
                        setErrorMessage('');
                      }}
                      className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                        mobileMode === 'signin'
                          ? 'border-[#89190E] text-[#89190E]'
                          : 'border-transparent text-[#526174] hover:text-[#10233F]'
                      }`}
                    >
                      Registered Student Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMode('signup');
                        setErrorMessage('');
                      }}
                      className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                        mobileMode === 'signup'
                          ? 'border-[#89190E] text-[#89190E]'
                          : 'border-transparent text-[#526174] hover:text-[#10233F]'
                      }`}
                    >
                      New Student Register
                    </button>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    {/* If Sign Up: Ask for Name and Stream */}
                    {mobileMode === 'signup' && (
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
                            Primary Law Course Stream
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

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                            Email Address <span className="text-[#526174] font-normal">(Optional)</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={optionalEmail}
                              onChange={(e) => setOptionalEmail(e.target.value)}
                              placeholder="name@gmail.com"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E]"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Mobile Number Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                        Mobile Number (India) <span className="text-[#89190E]">*</span>
                      </label>
                      <div className="flex rounded-xl border border-[#E8DCCB] focus-within:border-[#89190E] focus-within:ring-1 focus-within:ring-[#89190E] overflow-hidden bg-[#FFF9EF]/40 transition-all">
                        {/* Country Code Pill */}
                        <div className="flex items-center space-x-1 px-3 bg-[#FFF3DD] border-r border-[#E8DCCB] text-xs font-bold text-[#89190E] flex-shrink-0 select-none">
                          <span className="text-sm">🇮🇳</span>
                          <span>+91</span>
                        </div>
                        {/* 10-Digit Input */}
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
                        A 6-digit OTP will be dispatched to this mobile number via SMS.
                      </span>
                    </div>

                    {/* Send OTP CTA */}
                    <button
                      type="submit"
                      disabled={isLoading || phoneNumber.length !== 10}
                      className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <span>Sending SMS OTP...</span>
                      ) : (
                        <>
                          <span>Send Verification OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* STEP 2: 6-Digit OTP Verification Box */}
              {mobileStep === 'otp' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Phone confirmation & Edit button */}
                  <div className="p-3 bg-[#FFF9EF] rounded-2xl border border-[#E8DCCB] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#526174] block uppercase font-mono">
                        Sending SMS to:
                      </span>
                      <span className="text-sm font-bold font-mono text-[#10233F]">
                        +91 {phoneNumber.slice(0, 5)} {phoneNumber.slice(5)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileStep('input');
                        setErrorMessage('');
                        setSuccessMessage('');
                        setDevOtpNotification(null);
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-[#E8DCCB] text-[11px] font-semibold text-[#89190E] hover:bg-[#FFF3DD] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Dev Mode Simulated OTP Banner (When ApiTxt credentials are not added yet) */}
                  {devOtpNotification && (
                    <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl text-amber-900 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                          <span className="font-bold">APITXT_AUTH_KEY Pending in .env.local</span>
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
                        Real phone SMS requires your ApiTxt auth key. For local testing, your OTP is:{' '}
                        <span className="font-mono font-bold tracking-widest text-base text-amber-950">
                          {devOtpNotification}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* 6 Segmented OTP Digits */}
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

                  {/* Resend OTP & Countdown */}
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

                  {/* Verify CTA */}
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
                        <span>Verify & Enter Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* METHOD 2: TRADITIONAL EMAIL / PASSWORD & QUICK DEMO        */}
          {/* ========================================================== */}
          {authMethod === 'email' && (
            <div className="mt-5">
              {/* Quick 1-Click Demo Profiles */}
              <div className="mb-4 p-3 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#89190E] block mb-2 text-center">
                  Quick 1-Click Demo Profiles
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemo('aarav.sharma@msi-institutes.edu.in', 'Aarav Sharma')
                    }
                    className="p-2 rounded-xl bg-white hover:bg-[#89190E] text-[#10233F] hover:text-white border border-[#E8DCCB] text-left transition-all text-xs font-semibold group shadow-xs cursor-pointer"
                  >
                    <span className="block font-bold text-[11px] group-hover:text-white">
                      Aarav Sharma
                    </span>
                    <span className="text-[10px] text-[#526174] group-hover:text-white/80 block truncate">
                      PCS-J Judiciary
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('meera.sen@msi-institutes.edu.in', 'Meera Sen')}
                    className="p-2 rounded-xl bg-white hover:bg-[#89190E] text-[#10233F] hover:text-white border border-[#E8DCCB] text-left transition-all text-xs font-semibold group shadow-xs cursor-pointer"
                  >
                    <span className="block font-bold text-[11px] group-hover:text-white">
                      Meera Sen
                    </span>
                    <span className="text-[10px] text-[#526174] group-hover:text-white/80 block truncate">
                      CLAT Supreme
                    </span>
                  </button>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                    Institutional Email / Gmail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@msi-institutes.edu.in"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'Password reset link has been dispatched to your registered student Gmail ID.'
                        )
                      }
                      className="text-[11px] text-[#89190E] font-semibold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-[#526174] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#E8DCCB] text-[#89190E] focus:ring-[#89190E]"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[11px] text-[#526174]">256-Bit SSL</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-75 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Validating Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In to Student Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security & Regulatory Footnote */}
          <div className="mt-6 pt-5 border-t border-[#E8DCCB] flex items-center justify-center space-x-2 text-[11px] text-[#526174]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Official Maharaja Surajmal Institute Directory</span>
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
