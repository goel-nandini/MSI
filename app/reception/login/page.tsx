'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  Globe,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { RECEPTION_STAFF_PROFILES } from '@/components/reception/data/receptionMockData';

export default function ReceptionLoginPage() {
  const router = useRouter();

  // Fixed credentials per requirement: Mobile 9792303434 & Password Harshit@reception
  const [phoneOrId, setPhoneOrId] = useState('9792303434');
  const [password, setPassword] = useState('Harshit@reception');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phoneOrId.trim() || !password.trim()) {
      setErrorMessage('Please provide your official authorized reception mobile number and password.');
      return;
    }

    const cleanInput = phoneOrId.replace(/\D/g, '').slice(-10);
    const rawInput = phoneOrId.trim().toLowerCase();
    const cleanPassword = password.trim();

    setIsLoading(true);

    setTimeout(() => {
      // 1. Primary Fixed Credentials: Mobile 9792303434 & Password Harshit@reception
      const isHarshitNumber = cleanInput === '9792303434' || rawInput.includes('9792303434');
      const isHarshitPassword =
        cleanPassword === 'Harshit@reception' ||
        cleanPassword.toLowerCase() === 'harshit@reception';

      if (isHarshitNumber && isHarshitPassword) {
        try {
          localStorage.setItem('msi_reception_logged_in', 'true');
          localStorage.setItem('msi_active_staff_id', 'staff-harshit');
          localStorage.setItem('msi_active_staff_name', 'Harshit');
          localStorage.setItem('msi_active_staff_phone', '9792303434');
          localStorage.setItem('msi_active_staff_email', 'harshit.reception@msi-institutes.edu.in');
        } catch (err) {
          console.error(err);
        }

        setSuccessMessage('Welcome Harshit! Access granted to Reception & VMS Desk...');
        setTimeout(() => {
          setIsLoading(false);
          router.push('/reception/dashboard');
        }, 500);
        return;
      }

      // 2. Secondary check for other staff profiles in system
      const foundStaff = RECEPTION_STAFF_PROFILES.find(
        (s) =>
          s.id.toLowerCase() === rawInput ||
          s.email.toLowerCase() === rawInput ||
          (s.phone && s.phone.replace(/\D/g, '').slice(-10) === cleanInput)
      );

      if (
        foundStaff &&
        (cleanPassword === 'Reception@MSI2025' ||
          cleanPassword === 'Harshit@reception' ||
          cleanPassword.toLowerCase() === 'harshit@reception')
      ) {
        try {
          localStorage.setItem('msi_reception_logged_in', 'true');
          localStorage.setItem('msi_active_staff_id', foundStaff.id);
          localStorage.setItem('msi_active_staff_name', foundStaff.name);
          localStorage.setItem('msi_active_staff_email', foundStaff.email);
          if (foundStaff.phone) localStorage.setItem('msi_active_staff_phone', foundStaff.phone);
        } catch (err) {
          console.error(err);
        }

        setSuccessMessage(`Authenticated as ${foundStaff.name}. Entering Reception Desk...`);
        setTimeout(() => {
          setIsLoading(false);
          router.push('/reception/dashboard');
        }, 500);
        return;
      }

      // 3. Invalid credentials
      setIsLoading(false);
      setErrorMessage(
        'Invalid credentials. Authorized fixed login: Mobile 9792303434 and Password Harshit@reception'
      );
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EF] flex flex-col justify-between selection:bg-[#EFC988] selection:text-[#89190E] relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#89190E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#EFC988]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-12 h-12 transition-transform group-hover:scale-105">
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

        {/* Portal navigation quick-links */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            href="/student/login"
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-white border border-[#E8DCCB] hover:border-[#10233F] text-xs font-semibold text-[#10233F] transition-all shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#89190E]" />
            <span className="hidden sm:inline">Student</span> Login
          </Link>

          <Link
            href="/teacher/login"
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-white border border-[#E8DCCB] hover:border-[#10233F] text-xs font-semibold text-[#10233F] transition-all shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#89190E]" />
            <span className="hidden sm:inline">Faculty</span> Login
          </Link>

          <Link
            href="/"
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-white border border-[#E8DCCB] hover:border-[#89190E] text-xs font-semibold text-[#526174] hover:text-[#89190E] transition-all shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-[#89190E]" />
            <span>Website</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-[#E8DCCB] rounded-3xl p-7 sm:p-9 shadow-2xl hud-bracket relative">
          {/* Card Top Icon & Title */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF3DD] border border-[#EFC988] text-[#89190E] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-[#89190E] uppercase font-bold">
              Institute Security & VMS Desk
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F] mt-1">
              Reception Desk Login
            </h1>
            <p className="text-xs text-[#526174] mt-1.5">
              Sign in to manage visitor admissions, verify mobile OTPs, capture photos & issue visitor passes.
            </p>
          </div>



          {/* Fixed Credentials Info Pill */}
          <div className="mt-3.5 px-3 py-2 rounded-xl bg-[#EFC988]/20 border border-[#EFC988] text-[11px] flex items-center justify-between text-[#89190E]">
            <span className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Fixed Terminal Login:</span>
            </span>
            <span className="font-mono font-bold">9792303434</span>
          </div>

          {/* Error message alert */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success message alert */}
          {successMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Authorized Mobile Number / Staff ID
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phoneOrId}
                  onChange={(e) => setPhoneOrId(e.target.value)}
                  placeholder="9792303434"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F]">
                  Password
                </label>
                <span className="text-[11px] font-mono text-[#89190E] font-semibold">
                  Harshit@reception
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Harshit@reception"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox and Security Notice */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-[#526174] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E8DCCB] text-[#89190E] focus:ring-[#89190E]"
                />
                <span>Remember Terminal</span>
              </label>
              <span className="text-[11px] text-[#526174]">Gate Hardware Synced</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Terminal...</span>
              ) : (
                <>
                  <span>Sign In to Reception Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Regulatory Footnote */}
          <div className="mt-6 pt-5 border-t border-[#E8DCCB] flex items-center justify-center space-x-2 text-[11px] text-[#526174]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Official MSI Institute Physical Security & Surveillance Division</span>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#526174] border-t border-[#E8DCCB]/60">
        © {new Date().getFullYear()} MSI Group of Institutes. All rights reserved. • Kharar, Mohali, Punjab.
      </footer>
    </div>
  );
}
