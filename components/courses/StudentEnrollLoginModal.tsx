'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { UdemyCourse } from '@/lib/lmsStore';

interface StudentEnrollLoginModalProps {
  isOpen: boolean;
  course: UdemyCourse | null;
  onClose: () => void;
  onLoginSuccess: (course: UdemyCourse, student: { name: string; phone: string }) => void;
}

export default function StudentEnrollLoginModal({
  isOpen,
  course,
  onClose,
  onLoginSuccess,
}: StudentEnrollLoginModalProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In state
  const [signinPhone, setSigninPhone] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);

  // Sign Up state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupStream, setSignupStream] = useState('PCS-J Punjab Judicial Services');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !course) return null;

  // 1. Handle Existing Student Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanPhone = signinPhone.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!signinPassword.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password: signinPassword.trim() }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const studentName = data.user.name || 'Enrolled Student';
        const studentPhone = data.user.cleanPhone || cleanPhone;

        localStorage.setItem('msi_student_logged_in', 'true');
        localStorage.setItem('msi_active_student_phone', studentPhone);
        localStorage.setItem('msi_active_student_name', studentName);
        if (data.user.stream) localStorage.setItem('msi_active_student_stream', data.user.stream);
        if (data.user.email) localStorage.setItem('msi_active_student_email', data.user.email);

        setIsLoading(false);
        onLoginSuccess(course, { name: studentName, phone: studentPhone });
      } else {
        setErrorMessage(data.message || 'Invalid mobile number or password.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage('Network error while verifying credentials. Please try again.');
      setIsLoading(false);
    }
  };

  // 2. Handle New Student Registration
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanPhone = signupPhone.replace(/\D/g, '').slice(-10);

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!signupPassword.trim() || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          phone: cleanPhone,
          password: signupPassword.trim(),
          stream: signupStream,
        }),
      });
      const data = await res.json();

      if (data.success && data.student) {
        localStorage.setItem('msi_student_logged_in', 'true');
        localStorage.setItem('msi_active_student_phone', cleanPhone);
        localStorage.setItem('msi_active_student_name', signupName.trim());
        localStorage.setItem('msi_active_student_stream', signupStream);

        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'STUDENT_REGISTERED', student: data.student });
            bc.close();
          }
        } catch (_) {}

        setIsLoading(false);
        onLoginSuccess(course, { name: signupName.trim(), phone: cleanPhone });
      } else {
        setErrorMessage(data.message || 'Could not register student account.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage('Network error while registering account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#10233F]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-[#E8DCCB] my-8 animate-fadeIn flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#10233F] via-[#1a345c] to-[#89190E] p-5 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-[#EFC988]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EFC988] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#EFC988] font-bold">
                  Authentication Required
                </span>
              </div>
              <h2 className="font-serif text-lg font-bold text-white leading-tight">
                Login / Register to Enroll
              </h2>
            </div>
          </div>
        </div>

        {/* Course Capsule Preview */}
        <div className="px-5 py-3 bg-[#FFF9EF] border-b border-[#E8DCCB] flex items-center justify-between text-xs">
          <div className="min-w-0 pr-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Enrolling in
            </span>
            <h4 className="font-serif font-bold text-[#10233F] truncate">
              {course.title}
            </h4>
          </div>
          <div className="text-right shrink-0">
            <span className="font-serif font-extrabold text-sm text-[#89190E]">
              ₹{course.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Login / Register Tabs */}
        <div className="p-5 pb-2">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-[#10233F] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign In (Existing)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-[#10233F] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              New Registration
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 pt-2 space-y-4">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {authMode === 'signin'
              ? 'Enter your registered mobile number & password to proceed to payment.'
              : 'Create a permanent student account so your lectures, live classes, and tax invoice are linked directly to your portal.'}
          </p>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={signinPhone}
                    onChange={(e) => setSigninPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSigninPassword ? 'text' : 'password'}
                    required
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    placeholder="Enter your student password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSigninPassword(!showSigninPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showSigninPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#89190E]/20 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In & Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">
                  Full Student Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Vikramaditya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">
                  Create Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10233F] mb-1">
                  Target Academic Stream
                </label>
                <select
                  value={signupStream}
                  onChange={(e) => setSignupStream(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                >
                  <option value="PCS-J Punjab Judicial Services">PCS-J Punjab Judicial Services</option>
                  <option value="CLAT UG – 5 Year Integrated Law">CLAT UG – 5 Year Integrated Law</option>
                  <option value="Higher Judicial Services (ADJ)">Higher Judicial Services (ADJ)</option>
                  <option value="Judiciary Comprehensive Foundation">Judiciary Comprehensive Foundation</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#89190E]/20 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Register & Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-gray-500 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Session • Automatic LMS Course Linkage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
