'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Lock,
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
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { enrollStudentAction } from '@/lib/lmsStore';

type AuthMode = 'signin' | 'signup' | 'forgot_otp';
type AuthStep = 'input' | 'otp';

export default function StudentLoginPage() {
  const router = useRouter();

  // Authentication Mode
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [authStep, setAuthStep] = useState<AuthStep>('input');

  // Sign In inputs (Mobile + Password direct login)
  const [signinPhone, setSigninPhone] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);

  // Sign Up inputs (New Registration with Password creation)
  const [signupPhone, setSignupPhone] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('PCS-J Punjab Judicial Services');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // OTP State (Used only for first-time registration or forgot-password fallback)
  const [activeOtpPhone, setActiveOtpPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAlreadyRegisteredError, setIsAlreadyRegisteredError] = useState(false);

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

  // Clean phone input to standard 10 digits
  const cleanPhoneInput = (val: string) => val.replace(/\D/g, '').slice(0, 10);

  // Helper: Persist session and redirect to student dashboard
  const completeAuthAndRedirect = (userData: {
    name?: string;
    phone?: string;
    stream?: string;
    email?: string;
  }) => {
    try {
      localStorage.setItem('msi_student_logged_in', 'true');
      if (userData.name) localStorage.setItem('msi_active_student_name', userData.name);
      if (userData.phone) localStorage.setItem('msi_active_student_phone', userData.phone);
      if (userData.stream) localStorage.setItem('msi_active_student_stream', userData.stream);
      if (userData.email) localStorage.setItem('msi_active_student_email', userData.email);

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

    setSuccessMessage('Authenticated successfully! Entering student portal...');
    setTimeout(() => {
      router.push('/student/dashboard');
    }, 700);
  };

  // =========================================================================
  // ACTION 1: DIRECT SIGN IN WITH MOBILE & PASSWORD (NO OTP = ZERO COST)
  // =========================================================================
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsAlreadyRegisteredError(false);

    if (!signinPhone || signinPhone.length !== 10) {
      setErrorMessage('Please enter your registered 10-digit mobile number.');
      return;
    }

    if (!signinPassword.trim()) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: signinPhone,
          password: signinPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Invalid mobile number or password.');
        setIsLoading(false);
        return;
      }

      completeAuthAndRedirect(data.user);
    } catch (err: any) {
      setErrorMessage('Network connection error. Please verify your internet and try again.');
      setIsLoading(false);
    }
  };

  // =========================================================================
  // ACTION 2: NEW REGISTRATION (VALIDATE & REQUEST FIRST-TIME OTP)
  // =========================================================================
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsAlreadyRegisteredError(false);

    if (!signupFullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    if (!signupPhone || signupPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type your password carefully.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: signupPhone,
          purpose: 'signup',
          name: signupFullName.trim(),
          stream: selectedBatch,
          password: signupPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // If already registered, block registration cleanly and direct to Sign In
        if (data.isAlreadyRegistered) {
          setIsAlreadyRegisteredError(true);
          setErrorMessage(data.message || 'This mobile number is already registered.');
          setIsLoading(false);
          return;
        }

        setErrorMessage(data.message || 'Failed to dispatch verification OTP.');
        if (data.devOtp) {
          setActiveOtpPhone(signupPhone);
          setAuthStep('otp');
          setDevOtpNotification(data.devOtp);
          setResendCountdown(30);
        }
        setIsLoading(false);
        return;
      }

      // Success: OTP dispatched
      setActiveOtpPhone(signupPhone);
      setAuthStep('otp');
      setResendCountdown(data.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);
      setDevOtpNotification(null);
      setSuccessMessage('OTP dispatched to your mobile number via SMS!');

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage('Network error while dispatching SMS. Please verify connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // ACTION 3: FORGOT PASSWORD / LOGIN WITH OTP FALLBACK
  // =========================================================================
  const handleForgotOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signinPhone || signinPhone.length !== 10) {
      setErrorMessage('Please enter your 10-digit mobile number to receive OTP.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: signinPhone,
          purpose: 'login',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to dispatch verification OTP.');
        if (data.devOtp) {
          setActiveOtpPhone(signinPhone);
          setAuthStep('otp');
          setDevOtpNotification(data.devOtp);
          setResendCountdown(30);
        }
        setIsLoading(false);
        return;
      }

      setActiveOtpPhone(signinPhone);
      setAuthStep('otp');
      setResendCountdown(data.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);
      setDevOtpNotification(null);
      setSuccessMessage('Verification OTP sent to your mobile!');

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage('Network error while requesting OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // ACTION 4: VERIFY OTP (FOR REGISTRATION OR RECOVERY)
  // =========================================================================
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
          phone: activeOtpPhone,
          otp: fullOtp,
          name: signupFullName.trim() || undefined,
          stream: selectedBatch,
          password: signupPassword || undefined,
          purpose: authMode === 'signup' ? 'signup' : 'login',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Invalid or expired OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      completeAuthAndRedirect({
        name: data.user?.name || signupFullName || 'MSI Student',
        phone: data.user?.phone || `+91 ${activeOtpPhone}`,
        stream: data.user?.stream || selectedBatch,
        email: data.user?.email,
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

  // Quick switch from duplicate registration error to Sign In
  const switchToSignInWithPhone = () => {
    setSigninPhone(signupPhone);
    setAuthMode('signin');
    setAuthStep('input');
    setErrorMessage('');
    setIsAlreadyRegisteredError(false);
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
              {authMode === 'signup' ? (
                <UserPlus className="w-7 h-7 text-[#89190E]" />
              ) : authStep === 'otp' ? (
                <Smartphone className="w-7 h-7 text-[#89190E]" />
              ) : (
                <Lock className="w-7 h-7 text-[#89190E]" />
              )}
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
                : authMode === 'forgot_otp'
                ? 'Login via Mobile OTP'
                : 'New Student Registration'}
            </h1>

            <p className="text-xs text-[#526174] mt-1.5">
              {authStep === 'otp'
                ? `Enter the 6-digit code dispatched to +91 ${activeOtpPhone}`
                : authMode === 'signin'
                ? 'Sign in directly with your registered mobile number & password.'
                : authMode === 'forgot_otp'
                ? 'We will send a one-time OTP to your registered mobile number.'
                : 'Create your student account with your legal name and password.'}
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
                  setIsAlreadyRegisteredError(false);
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  authMode === 'signin' || authMode === 'forgot_otp'
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
                  setIsAlreadyRegisteredError(false);
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
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col space-y-2 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
              {/* If user attempted to register an already-registered number */}
              {isAlreadyRegisteredError && (
                <button
                  type="button"
                  onClick={switchToSignInWithPhone}
                  className="self-start px-3 py-1.5 rounded-lg bg-[#89190E] text-white text-[11px] font-bold hover:bg-[#65130D] transition-colors cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Click here to Sign In with Password</span>
                </button>
              )}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 1: DIRECT SIGN IN (MOBILE + PASSWORD = NO OTP)         */}
          {/* ========================================================== */}
          {authStep === 'input' && authMode === 'signin' && (
            <form onSubmit={handlePasswordSignIn} className="mt-5 space-y-4">
              {/* Mobile Number */}
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
                    value={signinPhone}
                    onChange={(e) => {
                      setSigninPhone(cleanPhoneInput(e.target.value));
                      setErrorMessage('');
                    }}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full px-3 py-3 text-sm text-[#10233F] font-mono tracking-wider focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F]">
                    Password <span className="text-[#89190E]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_otp');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-[#89190E] font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password / Login with OTP?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSigninPassword ? 'text' : 'password'}
                    required
                    value={signinPassword}
                    onChange={(e) => {
                      setSigninPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSigninPassword(!showSigninPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F] cursor-pointer"
                  >
                    {showSigninPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Direct Sign In Button (Zero OTP cost) */}
              <button
                type="submit"
                disabled={isLoading || signinPhone.length !== 10 || !signinPassword.trim()}
                className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Bottom Quick Switch */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage('');
                    setIsAlreadyRegisteredError(false);
                  }}
                  className="text-xs text-[#526174] hover:text-[#89190E]"
                >
                  Don&apos;t have an account?{' '}
                  <span className="text-[#89190E] font-bold underline">
                    Register as New Student
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* TAB 2: NEW REGISTRATION (WITH PASSWORD CREATION & OTP)     */}
          {/* ========================================================== */}
          {authStep === 'input' && authMode === 'signup' && (
            <form onSubmit={handleRegistrationSubmit} className="mt-5 space-y-3.5">
              {/* Full Legal Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                  Full Legal Name <span className="text-[#89190E]">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="e.g. Priyanshu Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              {/* Course Stream */}
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

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                  Mobile Number <span className="text-[#89190E]">*</span>
                </label>
                <div className="flex rounded-xl border border-[#E8DCCB] focus-within:border-[#89190E] overflow-hidden bg-[#FFF9EF]/40 transition-all">
                  <div className="flex items-center space-x-1 px-3 bg-[#FFF3DD] border-r border-[#E8DCCB] text-xs font-bold text-[#89190E] flex-shrink-0 select-none">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={signupPhone}
                    onChange={(e) => {
                      setSignupPhone(cleanPhoneInput(e.target.value));
                      setErrorMessage('');
                      setIsAlreadyRegisteredError(false);
                    }}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full px-3 py-2.5 text-sm text-[#10233F] font-mono tracking-wider focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Create Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                  Create Password <span className="text-[#89190E]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F] cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                  Confirm Password <span className="text-[#89190E]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupConfirmPassword ? 'text' : 'password'}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F] cursor-pointer"
                  >
                    {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Register & Verify via OTP CTA */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !signupFullName.trim() ||
                  signupPhone.length !== 10 ||
                  signupPassword.length < 6 ||
                  !signupConfirmPassword
                }
                className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Checking & Dispatching OTP...</span>
                ) : (
                  <>
                    <span>Verify Mobile & Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Bottom Quick Switch */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage('');
                    setIsAlreadyRegisteredError(false);
                  }}
                  className="text-xs text-[#526174] hover:text-[#89190E]"
                >
                  Already registered?{' '}
                  <span className="text-[#89190E] font-bold underline">
                    Sign In with Password
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* FALLBACK: FORGOT PASSWORD REQUEST OTP FORM                 */}
          {/* ========================================================== */}
          {authStep === 'input' && authMode === 'forgot_otp' && (
            <form onSubmit={handleForgotOtpRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="flex rounded-xl border border-[#E8DCCB] focus-within:border-[#89190E] overflow-hidden bg-[#FFF9EF]/40 transition-all">
                  <div className="flex items-center space-x-1 px-3 bg-[#FFF3DD] border-r border-[#E8DCCB] text-xs font-bold text-[#89190E] flex-shrink-0 select-none">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={signinPhone}
                    onChange={(e) => setSigninPhone(cleanPhoneInput(e.target.value))}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full px-3 py-3 text-sm text-[#10233F] font-mono tracking-wider focus:outline-none bg-transparent"
                  />
                </div>
                <span className="text-[11px] text-[#526174] block mt-1">
                  A 6-digit OTP will be dispatched to verify your identity.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || signinPhone.length !== 10}
                className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Sending Recovery OTP...</span>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage('');
                  }}
                  className="text-xs text-[#526174] hover:text-[#89190E]"
                >
                  Remember password?{' '}
                  <span className="text-[#89190E] font-bold underline">
                    Back to Direct Password Login
                  </span>
                </button>
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
                    Verifying Mobile:
                  </span>
                  <span className="text-sm font-bold font-mono text-[#10233F]">
                    +91 {activeOtpPhone.slice(0, 5)} {activeOtpPhone.slice(5)}
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
                    onClick={(e) => {
                      if (authMode === 'signup') handleRegistrationSubmit(e);
                      else handleForgotOtpRequest(e);
                    }}
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
