'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  LogOut,
  Globe,
  ChevronDown,
  Menu,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { TeacherProfile } from './data/teacherMockData';

interface TeacherHeaderProps {
  teacher: TeacherProfile;
  allTeachers: TeacherProfile[];
  onSwitchTeacher: (teacherId: string) => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export default function TeacherHeader({
  teacher,
  allTeachers,
  onSwitchTeacher,
  onLogout,
  onToggleSidebar,
}: TeacherHeaderProps) {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E8DCCB] px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Left: Mobile trigger & Portal Brand */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[#10233F] hover:bg-[#FFF9EF] border border-[#E8DCCB]"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/teacher/dashboard" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/images/msi-crest.png"
              alt="MSI Official Seal"
              fill
              sizes="44px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-sm sm:text-lg text-[#10233F] tracking-tight leading-none truncate block">
                MSI Faculty Portal
              </span>
              <span
                className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex-shrink-0 ${
                  teacher.stream === 'Law'
                    ? 'bg-[#89190E]/10 text-[#89190E] border border-[#89190E]/20'
                    : 'bg-[#10233F]/10 text-[#10233F] border border-[#10233F]/20'
                }`}
              >
                {teacher.stream} Discipline
              </span>
            </div>
            <p className="text-[11px] text-[#526174] tracking-wide mt-0.5 font-medium hidden sm:block truncate">
              {teacher.department}
            </p>
          </div>
        </Link>
      </div>

      {/* Right: Stream Isolation Switcher, Student Portal, Notifications, User Menu */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Switch Faculty Demonstration Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#89190E]/40 bg-[#FFF9EF] hover:bg-[#FFF3DD] text-[11px] sm:text-xs font-bold text-[#89190E] transition-all shadow-xs"
            title="Demonstrate Faculty Stream Data Isolation Rule"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden md:inline">Switch Stream:</span>
            <span className="underline">{teacher.stream}</span>
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </button>

          {showSwitchMenu && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-sm bg-white border border-[#E8DCCB] rounded-2xl shadow-xl p-3 z-50 animate-fadeIn">
              <div className="px-2 py-1.5 text-[10px] font-mono uppercase font-bold text-[#89190E] border-b border-[#E8DCCB]">
                Role-Based Stream Isolation Test
              </div>
              <div className="space-y-1.5 mt-2">
                {allTeachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSwitchTeacher(t.id);
                      setShowSwitchMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-2.5 ${
                      t.id === teacher.id
                        ? 'bg-[#89190E] text-white'
                        : 'hover:bg-[#FFF9EF] text-[#10233F]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold block leading-tight">{t.name}</span>
                      <span
                        className={`text-[10px] block leading-tight mt-0.5 ${
                          t.id === teacher.id ? 'text-white/80' : 'text-[#526174]'
                        }`}
                      >
                        {t.stream} Stream • {t.assignedCourseCodes.join(', ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#526174] p-2 mt-1 italic border-t border-[#E8DCCB]">
                *Enforces: A JEE teacher cannot see CLAT students unless assigned.
              </p>
            </div>
          )}
        </div>

        {/* Link to Student Portal */}
        <Link
          href="/student/dashboard"
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#E8DCCB] hover:border-[#10233F] text-xs font-semibold text-[#10233F] bg-white transition-colors"
          title="Open Student View"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#EFC988]" />
          <span>Student View</span>
        </Link>

        {/* Return to Public Website */}
        <Link
          href="/"
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#E8DCCB] hover:border-[#89190E] text-xs font-semibold text-[#526174] hover:text-[#89190E] bg-white transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website</span>
        </Link>

        {/* Teacher Profile Pill */}
        <div className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]">
          <div className="w-8 h-8 rounded-lg bg-[#10233F] text-white font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
            {teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-[#10233F] block leading-tight">
              {teacher.name}
            </span>
            <span className="text-[10px] text-[#526174] block leading-tight">
              {teacher.cabin}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="p-1 text-rose-600 hover:text-rose-800 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
