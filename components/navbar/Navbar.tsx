'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  UserPlus,
  LogIn,
  User,
  LogOut,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';

interface NavbarProps {
  onOpenEnquiry?: () => void;
}

export default function Navbar({ onOpenEnquiry }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileLoginRef = useRef<HTMLDivElement>(null);

  // Logged in user detection
  const [currentUser, setCurrentUser] = useState<{
    role: 'teacher' | 'student';
    name: string;
    dashboardUrl: string;
  } | null>(null);

  const checkUserAuth = () => {
    if (typeof window === 'undefined') return;
    try {
      const isTeacher = localStorage.getItem('msi_teacher_logged_in') === 'true';
      const isStudent = localStorage.getItem('msi_student_logged_in') === 'true';
      if (isTeacher) {
        const tName = localStorage.getItem('msi_active_teacher_name') || 'Dr. Ekta Gahlawat';
        setCurrentUser({
          role: 'teacher',
          name: tName,
          dashboardUrl: '/teacher/dashboard',
        });
      } else if (isStudent) {
        const sName = localStorage.getItem('msi_active_student_name') || 'Student';
        setCurrentUser({
          role: 'student',
          name: sName,
          dashboardUrl: '/student/dashboard',
        });
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkUserAuth();
    window.addEventListener('storage', checkUserAuth);
    return () => window.removeEventListener('storage', checkUserAuth);
  }, [pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('msi_teacher_logged_in');
      localStorage.removeItem('msi_student_logged_in');
    } catch {}
    setCurrentUser(null);
    setLoginDropdownOpen(false);
    setMobileLoginOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener for login dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLoginDropdownOpen(false);
      }
      if (mobileLoginRef.current && !mobileLoginRef.current.contains(e.target as Node)) {
        setMobileLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if link is active
  const isLinkActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Top Admissions Notification Ticker (visible when at the very top) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-[#89190E] text-[#FFF9EF] text-[11px] sm:text-xs py-1.5 px-4 font-medium transition-all duration-300 flex items-center justify-center overflow-hidden select-none ${
          scrolled ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex items-center space-x-2 animate-fadeIn max-w-full px-2 truncate">
          <span className="w-2 h-2 rounded-full bg-[#EFC988] animate-pulse-beacon flex-shrink-0" />
          <span className="font-semibold tracking-wide truncate text-[11px] sm:text-xs">
            New Batch Starting Soon — 2025
          </span>
          <span className="hidden md:inline text-[#EFC988]">•</span>
          <span className="hidden md:inline text-white/90">
            PCS J, CLAT, AILET, UGC NET (Law) Coaching | Kharar, Mohali
          </span>
          <button
            onClick={onOpenEnquiry}
            className="ml-1 sm:ml-2 underline font-bold hover:text-[#EFC988] transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
          >
            Enquire Now →
          </button>
        </div>
      </div>

      {/* Main Floating Capsule Header */}
      <header
        className={`fixed left-0 right-0 z-40 flex justify-center pointer-events-none transition-all duration-400 ease-out ${
          scrolled ? 'top-2 sm:top-3' : 'top-7 sm:top-9'
        }`}
      >
        <div
          className={`pointer-events-auto flex items-center justify-between transition-all duration-400 ease-out mx-auto ${
            scrolled
              ? 'w-[96%] sm:w-[90%] lg:w-[86%] max-w-[1340px] h-[60px] sm:h-[64px] rounded-[22px] sm:rounded-[24px] px-3.5 sm:px-6 glass-navbar-scrolled'
              : 'w-[98%] sm:w-[95%] lg:w-[92%] max-w-[1400px] h-[72px] sm:h-[88px] rounded-[24px] sm:rounded-[36px] px-4 sm:px-8 glass-navbar'
          }`}
        >
          {/* MSI Crest Logo */}
          <Link
            href="/"
            className="relative flex items-center flex-shrink-0 transition-transform duration-300 hover:scale-105 group"
            aria-label="MSI Homepage"
          >
            <div
              className={`relative transition-all duration-400 ease-out ${
                scrolled ? 'w-[40px] h-[40px] sm:w-[44px] sm:h-[44px]' : 'w-[50px] h-[50px] sm:w-[66px] sm:h-[66px]'
              }`}
            >
              <Image
                src="/images/msi-crest.png"
                alt="MSI Official Seal"
                fill
                priority
                className="object-contain drop-shadow-sm group-hover:brightness-105"
              />
            </div>
            <div className="ml-2 sm:ml-2.5 hidden sm:block">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#10233F] block leading-none">
                MSI
              </span>
              <span className="text-[10px] tracking-wider text-[#89190E] font-semibold uppercase block mt-0.5">
                Group of Institutes
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative px-3 py-2 text-[14px] lg:text-[14.5px] font-semibold tracking-normal rounded-xl transition-all duration-200 group ${
                    active
                      ? 'text-[#89190E] bg-[#89190E]/5'
                      : 'text-[#10233F] hover:text-[#89190E] hover:bg-[#FFF9EF]/80'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-[#89190E] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons: Login (dropdown with Sign In & Sign Up) + Enquire CTA */}
          <div className="hidden xl:flex items-center space-x-2.5 flex-shrink-0">
            {/* If logged in: User Profile Capsule. If not: Login Dropdown */}
            {currentUser ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className={`font-semibold bg-[#FFF9EF] hover:bg-[#FFF3DD] border border-[#E8DCCB] hover:border-[#89190E] rounded-xl transition-all duration-200 shadow-xs flex items-center space-x-2 cursor-pointer ${
                    scrolled ? 'h-[38px] px-3 text-xs' : 'h-[44px] px-3.5 text-xs'
                  }`}
                  aria-expanded={loginDropdownOpen}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                      currentUser.role === 'teacher' ? 'bg-[#89190E]' : 'bg-[#10233F]'
                    }`}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-[#10233F] leading-tight">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[9.5px] font-mono font-bold uppercase tracking-wider block leading-tight ${
                        currentUser.role === 'teacher' ? 'text-[#89190E]' : 'text-emerald-700'
                      }`}
                    >
                      {currentUser.role === 'teacher' ? 'Faculty' : 'Student'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#526174] transition-transform duration-200 ${
                      loginDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {loginDropdownOpen && (
                  <div className="absolute right-0 top-full pt-2 w-56 z-50 animate-fadeIn">
                    <div className="bg-white border-2 border-[#E8DCCB] rounded-2xl shadow-2xl p-2.5 space-y-1">
                      <div className="px-3 py-1.5 bg-[#FFF9EF] rounded-xl border border-[#E8DCCB] mb-1">
                        <span className="text-[10px] text-[#526174] block">Logged In As</span>
                        <span className="text-xs font-bold text-[#10233F] block truncate">
                          {currentUser.name}
                        </span>
                      </div>

                      <Link
                        href={currentUser.dashboardUrl}
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF9EF] text-xs font-bold text-[#10233F] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#89190E]" />
                        <span>Go to Dashboard</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login Dropdown (when not logged in) */
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setLoginDropdownOpen(true)}
                onMouseLeave={() => setLoginDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className={`font-semibold text-[#10233F] hover:text-[#89190E] bg-white hover:bg-[#FFF9EF] border border-[#E8DCCB] hover:border-[#89190E] rounded-xl transition-all duration-200 shadow-xs flex items-center space-x-1.5 cursor-pointer ${
                    scrolled ? 'h-[38px] px-3.5 text-xs' : 'h-[44px] px-4 text-xs'
                  }`}
                  aria-expanded={loginDropdownOpen}
                  aria-label="Login options"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#89190E]" />
                  <span>Login</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#89190E] transition-transform duration-200 ${
                      loginDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Container */}
                <div
                  className={`absolute right-0 top-full pt-2 w-64 z-50 transition-all duration-200 ${
                    loginDropdownOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="bg-white border-2 border-[#E8DCCB] rounded-2xl shadow-2xl p-2.5 space-y-1.5">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#89190E] font-bold border-b border-[#E8DCCB]">
                      Choose Option
                    </div>

                    <Link
                      href="/student/login"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-[#FFF9EF] text-xs font-semibold text-[#10233F] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#89190E]/10 flex items-center justify-center text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors flex-shrink-0">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block font-bold text-xs sm:text-[13px] text-[#10233F] group-hover:text-[#89190E] transition-colors">
                          Sign In
                        </span>
                        <span className="text-[10.5px] text-[#526174] truncate block">
                          Access existing account
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#526174] group-hover:text-[#89190E] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>

                    <Link
                      href="/student/login?tab=signup"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-[#FFF9EF]/80 hover:bg-[#FFF3DD] text-xs font-semibold text-[#10233F] transition-all group border border-[#EFC988]/50 hover:border-[#EFC988]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#89190E] flex items-center justify-center text-[#EFC988] group-hover:scale-105 transition-transform flex-shrink-0">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="block font-bold text-xs sm:text-[13px] text-[#89190E]">
                            Sign Up
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#89190E] text-[#FFF9EF] rounded-full uppercase tracking-wider">
                            New
                          </span>
                        </div>
                        <span className="text-[10.5px] text-[#526174] truncate block">
                          Create student account
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#89190E] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Enquire CTA Button */}
            <button
              onClick={onOpenEnquiry}
              className={`group font-semibold text-white bg-[#89190E] hover:bg-[#65130D] rounded-xl flex items-center space-x-1.5 transition-all duration-200 btn-hover-lift active:scale-98 shadow-md shadow-[#89190E]/20 cursor-pointer ${
                scrolled ? 'h-[38px] px-3.5 text-xs' : 'h-[44px] px-4 text-xs'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EFC988] transition-transform duration-300 group-hover:rotate-12" />
              <span>Enquire</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Mobile / Tablet Menu Trigger */}
          <div className="flex xl:hidden items-center space-x-2">
            {/* Mobile Login Dropdown */}
            {/* Mobile: If logged in show user link, else login button */}
            {currentUser ? (
              <Link
                href={currentUser.dashboardUrl}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#10233F] bg-[#FFF9EF] border border-[#E8DCCB] px-2.5 py-1.5 rounded-xl shadow-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentUser.role === 'teacher' ? 'bg-[#89190E]' : 'bg-emerald-600'
                  }`}
                />
                <span className="truncate max-w-[85px]">{currentUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <div ref={mobileLoginRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMobileLoginOpen(!mobileLoginOpen)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#10233F] bg-white border border-[#E8DCCB] px-2.5 py-1.5 rounded-xl shadow-xs cursor-pointer"
                  aria-expanded={mobileLoginOpen}
                >
                  <LogIn className="w-3.5 h-3.5 text-[#89190E]" />
                  <span>Login</span>
                  <ChevronDown
                    className={`w-3 h-3 text-[#89190E] transition-transform duration-200 ${
                      mobileLoginOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileLoginOpen && (
                  <div className="absolute right-0 top-full pt-2 w-52 z-50">
                    <div className="bg-white border-2 border-[#E8DCCB] rounded-2xl shadow-2xl p-2 space-y-1">
                      <Link
                        href="/student/login"
                        onClick={() => setMobileLoginOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-[#FFF9EF] text-xs font-bold text-[#10233F]"
                      >
                        <LogIn className="w-4 h-4 text-[#89190E]" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/student/login?tab=signup"
                        onClick={() => setMobileLoginOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#FFF9EF] text-xs font-bold text-[#89190E]"
                      >
                        <UserPlus className="w-4 h-4 text-[#89190E]" />
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onOpenEnquiry}
              className="inline-flex text-xs font-bold text-white bg-[#89190E] px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
            >
              Enquire
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#10233F] hover:text-[#89190E] hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-4 top-[85px] sm:top-[98px] pointer-events-auto xl:hidden bg-white/95 backdrop-blur-2xl border border-[#E8DCCB] rounded-3xl p-6 shadow-2xl transition-all animate-fadeIn z-50">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-1 border-b border-[#E8DCCB]/60 pb-3">
                {NAV_ITEMS.map((item) => {
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3.5 py-2.5 text-base font-semibold rounded-xl transition-colors flex items-center justify-between ${
                        active
                          ? 'text-[#89190E] bg-[#FFF3DD]'
                          : 'text-[#10233F] hover:text-[#89190E] hover:bg-[#FFF9EF]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {active && <span className="w-2 h-2 rounded-full bg-[#89190E]" />}
                    </Link>
                  );
                })}
              </div>

              {/* Login and Sign Up Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/student/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-11 flex items-center justify-center space-x-1.5 font-bold text-xs sm:text-sm text-[#10233F] bg-white border border-[#E8DCCB] rounded-xl hover:bg-[#FFF9EF] transition-all"
                >
                  <LogIn className="w-4 h-4 text-[#89190E]" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/student/login?tab=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-11 flex items-center justify-center space-x-1.5 font-bold text-xs sm:text-sm text-white bg-[#89190E] hover:bg-[#65130D] rounded-xl shadow-md transition-all"
                >
                  <UserPlus className="w-4 h-4 text-[#EFC988]" />
                  <span>Sign Up</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
