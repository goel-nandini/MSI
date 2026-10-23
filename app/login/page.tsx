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
  UserPlus,
  Globe,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Eye,
  EyeOff,
  KeyRound,
  GraduationCap,
  Users,
} from 'lucide-react';

type LoginTab = 'password' | 'register' | 'otp';
type OtpStep = 'request' | 'verify' | 'create_password';

export default function UnifiedLoginPage() {
  const router = useRouter();

  // Active top-level mode: Direct Password Login vs Student Registration vs OTP Access
  const [activeTab, setActiveTab] = useState<LoginTab>('password');

  // Direct Password Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Direct Student Registration State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStream, setRegStream] = useState('PCS-J Punjab Judicial Services');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Student OTP & Password Creation State
  const [otpStep, setOtpStep] = useState<OtpStep>('request');
  const [otpPhone, setOtpPhone] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('PCS-J Punjab Judicial Services');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [devOtpBadge, setDevOtpBadge] = useState<string | null>(null);

  // Step 3: Create Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 6-digit OTP input refs for keyboard navigation
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check URL query parameters (e.g. ?tab=signup or ?tab=otp)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'signup' || params.get('tab') === 'register') {
        setActiveTab('register');
      } else if (params.get('tab') === 'otp') {
        setActiveTab('otp');
      }
    }
  }, []);

  // OTP resend timer countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Clean phone input to standard 10 digits
  const cleanPhoneInput = (val: string) => val.replace(/\D/g, '').slice(0, 10);

  // ── Helper: Save Session and Route based on Role ──────────────────────────────
  const handleAuthSuccess = (resData: any) => {
    const role = resData.role || 'student';
    const user = resData.user || {};
    const cleanPhone = (user.cleanPhone || user.phone || identifier).replace(/\D/g, '').slice(-10);

    try {
      if (role === 'super-admin') {
        localStorage.setItem('msi_super_admin_authenticated', 'true');
        localStorage.setItem('msi_super_admin_phone', cleanPhone || '9792303434');
        setSuccessMessage('Welcome Administrator! Opening Super Admin Dashboard...');
        setTimeout(() => router.push(resData.redirectTo || '/super-admin'), 500);
        return;
      }

      if (role === 'reception') {
        localStorage.setItem('msi_reception_logged_in', 'true');
        localStorage.setItem('msi_active_staff_id', user.id || 'staff-harshit');
        localStorage.setItem('msi_active_staff_name', user.name || 'Harshit');
        localStorage.setItem('msi_active_staff_phone', cleanPhone || '9792303434');
        localStorage.setItem('msi_active_staff_email', user.email || 'harshit.reception@msi-institutes.edu.in');
        setSuccessMessage('Welcome Harshit! Opening Reception Desk...');
        setTimeout(() => router.push(resData.redirectTo || '/reception/dashboard'), 500);
        return;
      }

      if (role === 'teacher') {
        localStorage.setItem('msi_teacher_logged_in', 'true');
        localStorage.setItem('msi_active_teacher_id', user.id || '');
        localStorage.setItem('msi_active_teacher_name', user.name || '');
        localStorage.setItem('msi_active_teacher_email', user.email || '');
        localStorage.setItem('msi_active_teacher_phone', user.phone || '');
        localStorage.setItem('msi_active_teacher_stream', user.stream || 'Law');
        setSuccessMessage(`Welcome Prof. ${user.name || 'Faculty'}! Access granted to Faculty Dashboard.`);
        setTimeout(() => router.push(resData.redirectTo || '/teacher/dashboard'), 500);
        return;
      }

      // Default: Student
      localStorage.setItem('msi_student_logged_in', 'true');
      if (cleanPhone) {
        localStorage.setItem('msi_active_student_phone', cleanPhone);
      }
      if (user.name) localStorage.setItem('msi_active_student_name', user.name);
      if (user.stream) localStorage.setItem('msi_active_student_stream', user.stream);
      if (user.email) localStorage.setItem('msi_active_student_email', user.email);

      if (user.profile) {
        localStorage.setItem('msi_active_student_profile', JSON.stringify(user.profile));
        if (cleanPhone) {
          localStorage.setItem(`msi_student_profile_${cleanPhone}`, JSON.stringify(user.profile));
        }
      }

      setSuccessMessage(`Welcome back, ${user.name || 'Student'}! Opening Student Portal...`);
      setTimeout(() => router.push(resData.redirectTo || '/student/dashboard'), 500);
    } catch (err) {
      console.error('Session persistence error:', err);
      router.push(resData.redirectTo || '/student/dashboard');
    }
  };

  // ── 1. Unified Password Login Handler ─────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number or official email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneOrEmail: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        handleAuthSuccess(data);
      } else {
        setErrorMessage(data.message || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err: any) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 2. Direct Student Registration Handler (Instant Sign-Up) ─────────────────
  const handleDirectStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const clean = cleanPhoneInput(regPhone);
    if (clean.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!regPassword || regPassword.trim().length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and re-type.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: clean,
          stream: regStream,
          email: regEmail.trim() || undefined,
          password: regPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Welcome, ${data.student?.name || regName}! Registration successful.`);

        // Instantly notify Super Admin & other open tabs via BroadcastChannel & storage
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'STUDENT_REGISTERED', student: data.student });
            bc.close();
          }
        } catch (_) {}

        handleAuthSuccess(data);
      } else {
        setErrorMessage(data.message || 'Could not complete registration. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Network error while registering. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 3. Request OTP Handler ───────────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const clean = cleanPhoneInput(otpPhone);
    if (clean.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          name: studentFullName.trim() || undefined,
          stream: selectedBatch,
          purpose: 'student-portal-auth',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOtpStep('verify');
        setResendCountdown(30);
        if (data.devOtp) {
          setDevOtpBadge(data.devOtp);
        }
        setSuccessMessage(`Verification code sent to +91 ${clean.slice(0, 5)} ${clean.slice(5)}`);

        // Notify Super Admin that a student has registered / initiated onboarding
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'STUDENT_REGISTERED', phone: clean });
            bc.close();
          }
        } catch (_) {}
      } else {
        setErrorMessage(data.message || 'Failed to send OTP code. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Network error while sending OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 4. Verify OTP Code Handler ────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    const clean = cleanPhoneInput(otpPhone);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          otp: code,
          name: studentFullName.trim() || undefined,
          stream: selectedBatch,
          purpose: 'login',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOtpStep('create_password');
        setSuccessMessage('Mobile number verified! Now please create your password.');
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'STUDENT_REGISTERED', phone: clean });
            bc.close();
          }
        } catch (_) {}
      } else {
        setErrorMessage(data.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setErrorMessage('Network error while verifying OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 5. Create Password & Complete Registration ────────────────────────────────
  const handleSaveCreatedPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMessage('Please enter a password with at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type carefully.');
      return;
    }

    const clean = cleanPhoneInput(otpPhone);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          password: newPassword.trim(),
          name: studentFullName.trim() || undefined,
          stream: selectedBatch,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Password successfully saved! You can now log in anytime with your phone and password.');
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'STUDENT_REGISTERED', student: data.user });
            bc.close();
          }
        } catch (_) {}
        handleAuthSuccess(data);
      } else {
        setErrorMessage(data.message || 'Failed to save password.');
      }
    } catch (err) {
      setErrorMessage('Network error while saving password.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input keyboard navigator
  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9EF] flex flex-col justify-between selection:bg-[#EFC988] selection:text-[#89190E] relative overflow-hidden">
      {/* Blueprint ambient backdrop */}
      <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#89190E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#10233F]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-[#E8DCCB]/80 bg-white/70 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#89190E] to-[#10233F] p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <span className="font-serif font-black text-sm text-[#89190E]">MSI</span>
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-base text-[#10233F] tracking-tight block">
              MSI Group of Institutes
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#89190E] font-bold block">
              Institutional Academic Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/"
            className="text-[#526174] hover:text-[#89190E] font-semibold transition-colors hidden sm:inline-block"
          >
            ← Back to Main Website
          </Link>
          <span className="px-2.5 py-1 rounded-full bg-[#10233F]/5 text-[#10233F] font-mono font-bold text-[11px] border border-[#10233F]/10">
            SSL 256-Bit Encrypted
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl bg-white rounded-3xl border-2 border-[#E8DCCB] shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          {/* Top Decorative Strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#10233F]" />

          {/* Heading */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89190E]/10 text-[#89190E] text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-[#89190E]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Unified Institutional Authentication</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F] tracking-tight">
              Sign In to MSI Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#526174] mt-1.5 max-w-md mx-auto">
              Single gateway for Faculty Members, Enrolled Scholars, and Master Administration.
            </p>
          </div>

          {/* Top Switcher: Password Login vs Student Registration vs OTP Access */}
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] mb-6 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('password');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-2 sm:px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-[#10233F] text-white shadow-md'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-2 sm:px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#89190E] text-white shadow-md'
                  : 'text-[#526174] hover:text-[#89190E]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0 text-[#EFC988]" />
              <span className="truncate font-bold">New Student Register</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('otp');
                setOtpStep('request');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-2 sm:px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'otp'
                  ? 'bg-[#10233F] text-white shadow-md'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">OTP Access</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: DIRECT PASSWORD LOGIN (UNIVERSAL ROLE AUTO-DETECTION)          */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                  Mobile Number or Official Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9792303434 or official email"
                    className="w-full h-11 px-4 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                    required
                  />
                </div>
                <p className="text-[10px] text-[#526174] mt-1">
                  Students: enter your 10-digit registered number. Faculty: use your registered phone or Gmail.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#10233F] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('otp');
                      setOtpStep('request');
                    }}
                    className="text-[11px] text-[#89190E] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#89190E] to-[#65130D] hover:from-[#65130D] hover:to-[#89190E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#89190E]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Log In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-[#E8DCCB]/60 text-center">
                <p className="text-xs text-[#526174]">
                  New student?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="font-bold text-[#89190E] hover:underline cursor-pointer"
                  >
                    Register New Account (Instant Sign-Up) →
                  </button>
                </p>
              </div>

              {/* Faculty Provisioning Note */}
              <div className="mt-4 p-3 rounded-xl bg-[#10233F]/5 border border-[#10233F]/10 text-[11px] text-[#526174] leading-relaxed">
                <span className="font-bold text-[#10233F] block mb-0.5">Note for Faculty Members:</span>
                Faculty profiles are provisioned directly by the Super Admin Directorate. Enter your assigned mobile number or Gmail ID and password to access the Faculty Dashboard.
              </div>
            </form>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: DIRECT STUDENT REGISTRATION (INSTANT SIGN UP)                 */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'register' && (
            <form onSubmit={handleDirectStudentRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Harshit Verma"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                  Mobile Number (10 Digits) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-[#526174]">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(cleanPhoneInput(e.target.value))}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full h-11 pl-13 pr-4 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                  Target Programme / Course Stream *
                </label>
                <select
                  value={regStream}
                  onChange={(e) => setRegStream(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                >
                  <option value="PCS-J Punjab Judicial Services">PCS-J Punjab Judicial Services</option>
                  <option value="CLAT UG Foundation Batch">CLAT UG Foundation & Target Batch</option>
                  <option value="AILET & All-India Law Entrances">AILET & Law Entrances</option>
                  <option value="PU Law Entrance (3-Yr & 5-Yr)">PU Law Entrance (3-Yr & 5-Yr)</option>
                  <option value="Judicial Services Foundation">Judicial Services Foundation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. scholar@gmail.com"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F] cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F] cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#89190E] to-[#65130D] hover:from-[#65130D] hover:to-[#89190E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#89190E]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Registering Scholar Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-[#EFC988]" />
                    <span>Complete Registration & Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#E8DCCB]/60 text-center">
                <p className="text-xs text-[#526174]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('password');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="font-bold text-[#89190E] hover:underline cursor-pointer"
                  >
                    Sign In with Password →
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: STUDENT OTP & CREATE PASSWORD WIZARD                           */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'otp' && (
            <div>
              {/* Step 1: Phone & Basic Registration Info */}
              {otpStep === 'request' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                      Student Mobile Number (10 Digits)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-[#526174]">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(cleanPhoneInput(e.target.value))}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="w-full h-11 pl-13 pr-4 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                      Full Name (Optional for existing students)
                    </label>
                    <input
                      type="text"
                      value={studentFullName}
                      onChange={(e) => setStudentFullName(e.target.value)}
                      placeholder="e.g. Meera Sen"
                      className="w-full h-11 px-4 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                      Target Programme / Course Stream
                    </label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                    >
                      <option value="PCS-J Punjab Judicial Services">PCS-J Punjab Judicial Services</option>
                      <option value="CLAT UG Foundation Batch">CLAT UG Foundation & Target Batch</option>
                      <option value="AILET & All-India Law Entrances">AILET & Law Entrances</option>
                      <option value="PU Law Entrance (3-Yr & 5-Yr)">PU Law Entrance (3-Yr & 5-Yr)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#89190E] to-[#65130D] hover:from-[#65130D] hover:to-[#89190E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#89190E]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP Code */}
              {otpStep === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center">
                    <p className="text-xs text-[#526174]">
                      Enter the 6-digit verification code sent to:
                    </p>
                    <p className="font-mono font-bold text-sm text-[#10233F] mt-0.5">
                      +91 {otpPhone.slice(0, 5)} {otpPhone.slice(5)}
                    </p>
                  </div>

                  {/* Dev Test OTP helper badge */}
                  {devOtpBadge && (
                    <div className="p-3 rounded-xl bg-[#FFF3DD] border border-[#EFC988] text-center">
                      <span className="text-[10px] uppercase font-mono font-bold text-[#89190E] block">
                        Development Preview OTP Code:
                      </span>
                      <span className="font-mono text-xl font-black text-[#10233F] tracking-widest block mt-0.5">
                        {devOtpBadge}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = devOtpBadge.split('').slice(0, 6);
                          setOtpDigits(digits);
                        }}
                        className="text-[11px] text-[#89190E] underline font-bold mt-1 inline-block cursor-pointer"
                      >
                        Auto-Fill Code
                      </button>
                    </div>
                  )}

                  {/* 6-Digit Pin Input */}
                  <div className="flex justify-center gap-2 sm:gap-3">
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
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold rounded-xl border-2 border-[#E8DCCB] focus:border-[#89190E] focus:outline-none bg-[#FFF9EF]/40 focus:bg-white text-[#10233F] transition-all"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#526174]">
                    <button
                      type="button"
                      onClick={() => setOtpStep('request')}
                      className="hover:underline cursor-pointer"
                    >
                      ← Change Mobile Number
                    </button>

                    <button
                      type="button"
                      disabled={resendCountdown > 0}
                      onClick={handleRequestOtp}
                      className="font-bold text-[#89190E] hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend OTP Code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#89190E] to-[#65130D] hover:from-[#65130D] hover:to-[#89190E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#89190E]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 3: Create Permanent Password */}
              {otpStep === 'create_password' && (
                <form onSubmit={handleSaveCreatedPassword} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                    <h4 className="font-serif font-bold text-sm text-emerald-950">
                      Mobile Number Verified Successfully!
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Now create your password so you can log in directly next time without waiting for an OTP.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                      Create New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Choose a password (min 4 characters)"
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#10233F] mb-1.5 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter chosen password"
                        className="w-full h-11 px-4 pr-11 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-[#10233F] text-xs font-medium placeholder:text-[#526174]/50 focus:border-[#89190E] focus:outline-none focus:bg-white transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#10233F] to-[#162d50] hover:from-[#162d50] hover:to-[#10233F] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#10233F]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Saving Account Password...</span>
                    ) : (
                      <>
                        <span>Set Password & Enter Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-[#526174] border-t border-[#E8DCCB]/80 bg-white/50 backdrop-blur-xs">
        <p>© {new Date().getFullYear()} MSI Group of Institutes. All Rights Reserved. ISO 9001:2015 Accredited Law Academy.</p>
      </footer>
    </div>
  );
}
