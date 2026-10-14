'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Clock,
  LogOut,
  Users,
  ChevronDown,
  Menu,
  Globe,
  Radio,
  UserCheck,
} from 'lucide-react';
import { ReceptionStaff } from './data/receptionMockData';

interface ReceptionHeaderProps {
  currentStaff: ReceptionStaff;
  allStaff: ReceptionStaff[];
  onSwitchStaff: (staffId: string) => void;
  activeVisitorCount: number;
  todayTotalCount: number;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export default function ReceptionHeader({
  currentStaff,
  allStaff,
  onSwitchStaff,
  activeVisitorCount,
  todayTotalCount,
  onLogout,
  onToggleSidebar,
}: ReceptionHeaderProps) {
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E8DCCB] px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Institute Brand */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[#10233F] hover:bg-[#FFF9EF] border border-[#E8DCCB]"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/reception/dashboard" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/images/msi-crest.png"
              alt="MSI Official Seal"
              fill
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-base sm:text-lg text-[#10233F] tracking-tight leading-none">
                MSI
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#89190E] text-white px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                VMS Portal
              </span>
            </div>
            <span className="text-[10px] tracking-wider text-[#89190E] font-bold uppercase hidden sm:block mt-0.5 truncate">
              Reception & Visitor Management
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Live Headcount & Terminal Indicator (Desktop) */}
      <div className="hidden md:flex items-center space-x-3 bg-[#FFF9EF] border border-[#E8DCCB] px-3.5 py-1.5 rounded-2xl shadow-inner">
        <div className="flex items-center space-x-2 pr-3 border-r border-[#E8DCCB]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-[#10233F]">
            Inside Institute:
          </span>
          <span className="font-mono text-xs font-bold text-[#89190E] bg-white px-2 py-0.5 rounded-md border border-[#E8DCCB]">
            {activeVisitorCount} Visitors
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-[#526174]">
          <Clock className="w-3.5 h-3.5 text-[#89190E]" />
          <span className="font-mono text-[11px] font-medium text-[#10233F] min-w-[75px]">
            {currentTime || '09:00:00 AM'}
          </span>
        </div>
      </div>

      {/* Right: Staff Profile Switcher & Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Active Receptionist Profile Badge */}
        <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#FFF9EF] border border-[#E8DCCB] text-left shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-[#89190E] text-[#FFF9EF] flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
            {currentStaff.name ? currentStaff.name.charAt(0) : 'H'}
          </div>
          <div className="hidden sm:block">
            <span className="block text-xs font-bold text-[#10233F] leading-tight">
              {currentStaff.name || 'Harshit'}
            </span>
            <span className="block text-[10px] text-[#89190E] font-medium leading-none mt-0.5">
              Reception Desk • Desk 01
            </span>
          </div>
        </div>

        {/* Website link */}
        <Link
          href="/"
          className="hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#526174] hover:text-[#89190E] hover:bg-[#FFF9EF] transition-all"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website</span>
        </Link>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-[#E8DCCB] hover:border-rose-200 text-xs font-semibold text-[#526174] hover:text-rose-700 transition-all shadow-xs cursor-pointer"
          title="Sign out of Reception desk"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
