'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReceptionHeader from '@/components/reception/ReceptionHeader';
import ReceptionSidebar, { ReceptionModuleTab } from '@/components/reception/ReceptionSidebar';
import NewVisitorTab from '@/components/reception/NewVisitorTab';
import ActiveVisitorsTab from '@/components/reception/ActiveVisitorsTab';
import VisitorHistoryTab from '@/components/reception/VisitorHistoryTab';
import LeadsRegisterTab from '@/components/reception/LeadsRegisterTab';
import {
  RECEPTION_STAFF_PROFILES,
  INITIAL_VISITORS,
  Visitor,
  ReceptionStaff,
} from '@/components/reception/data/receptionMockData';
import { AlertTriangle, LogOut } from 'lucide-react';

export default function ReceptionDashboardPage() {
  const router = useRouter();

  // Active staff state (defaults to Harshit)
  const [currentStaff, setCurrentStaff] = useState<ReceptionStaff>(RECEPTION_STAFF_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<ReceptionModuleTab>('new-visitor');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Visitors dynamic repository
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [isAccessRevoked, setIsAccessRevoked] = useState(false);
  const [revocationCountdown, setRevocationCountdown] = useState(4);

  const triggerInstantRevocation = () => {
    setIsAccessRevoked(true);
    try {
      localStorage.removeItem('msi_reception_logged_in');
      localStorage.removeItem('msi_active_staff_id');
      localStorage.removeItem('msi_active_staff_name');
      localStorage.removeItem('msi_active_staff_phone');
      localStorage.removeItem('msi_active_staff_email');
      localStorage.removeItem('msi_reception_user');
    } catch (_) {}
  };

  const checkRevocation = async (payload?: { id?: string; phone?: string; username?: string }) => {
    if (typeof window === 'undefined') return;
    try {
      const storedId = (localStorage.getItem('msi_active_staff_id') || '').toLowerCase().trim();
      const storedPhone = (localStorage.getItem('msi_active_staff_phone') || '').replace(/\D/g, '').slice(-10);
      const storedEmail = (localStorage.getItem('msi_active_staff_email') || '').toLowerCase().trim();

      if (payload) {
        const pId = (payload.id || '').toLowerCase().trim();
        const pPhone = (payload.phone || '').replace(/\D/g, '').slice(-10);
        const pUser = (payload.username || '').toLowerCase().trim();

        if (
          (pId && (pId === storedId || pId === currentStaff.id?.toLowerCase())) ||
          (pPhone && (pPhone === storedPhone || pPhone === (currentStaff.phone || '').replace(/\D/g, '').slice(-10))) ||
          (pUser && (pUser === storedEmail || pUser === (currentStaff.email || '').toLowerCase()))
        ) {
          triggerInstantRevocation();
          return;
        }
      }

      const res = await fetch('/api/admin/receptionists', { cache: 'no-store' });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          const exists = list.some((r: any) => {
            const rId = (r.id || '').toLowerCase().trim();
            const rPhone = (r.phone || '').replace(/\D/g, '').slice(-10);
            const rEmail = (r.email || r.username || '').toLowerCase().trim();
            return (
              (storedId && rId === storedId) ||
              (storedPhone && rPhone === storedPhone) ||
              (storedEmail && rEmail === storedEmail)
            );
          });
          if (!exists && (storedId || storedPhone || storedEmail)) {
            triggerInstantRevocation();
          }
        }
      }
    } catch (_) {}
  };

  // Check auth and load persisted visitor logs on mount
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem('msi_reception_logged_in') === 'true';
      if (!isLoggedIn) {
        router.push('/reception/login');
        return;
      }

      const savedStaffId = localStorage.getItem('msi_active_staff_id');
      const savedStaffName = localStorage.getItem('msi_active_staff_name');
      const savedStaffPhone = localStorage.getItem('msi_active_staff_phone');
      const savedStaffEmail = localStorage.getItem('msi_active_staff_email');

      if (savedStaffName) {
        setCurrentStaff({
          id: savedStaffId || 'rec-01',
          name: savedStaffName,
          role: 'Reception Desk',
          phone: savedStaffPhone || '+91 97923 03434',
          email: savedStaffEmail || 'reception@msi-institutes.edu.in',
          avatar: '/images/avatars/avatar-1.webp',
          location: 'Main Administrative Block (Reception Desk)',
          badgeId: 'MSI-REC-STAFF',
        });
      } else if (savedStaffId) {
        const found = RECEPTION_STAFF_PROFILES.find((s) => s.id === savedStaffId);
        if (found) setCurrentStaff(found);
      }

      const savedVisitors = localStorage.getItem('msi_visitors_data');
      if (savedVisitors) {
        const parsed = JSON.parse(savedVisitors);
        if (Array.isArray(parsed)) {
          setVisitors(parsed);
        }
      }

      checkRevocation();
    } catch (err) {
      console.warn('Could not read from localStorage:', err);
    }
  }, [router]);

  // Real-time broadcast channel & heartbeat sync for receptionist deletion
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('msi_sync_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'RECEPTIONIST_DELETED') {
            checkRevocation(event.data);
          }
        };
      }
    } catch (_) {}

    const interval = setInterval(() => {
      checkRevocation();
    }, 3000);

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [currentStaff]);

  // Automatic logout redirect countdown on revocation
  useEffect(() => {
    if (!isAccessRevoked) return;
    if (revocationCountdown <= 0) {
      router.push('/reception/login');
      return;
    }
    const timer = setTimeout(() => {
      setRevocationCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isAccessRevoked, revocationCountdown, router]);

  // Save visitors to localStorage on change
  const saveVisitors = (updated: Visitor[]) => {
    setVisitors(updated);
    try {
      localStorage.setItem('msi_visitors_data', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not write to localStorage:', err);
    }
  };

  // Switch staff terminal
  const handleSwitchStaff = (staffId: string) => {
    const found = RECEPTION_STAFF_PROFILES.find((s) => s.id === staffId);
    if (found) {
      setCurrentStaff(found);
      try {
        localStorage.setItem('msi_active_staff_id', found.id);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('msi_reception_logged_in');
      localStorage.removeItem('msi_active_staff_id');
      localStorage.removeItem('msi_active_staff_name');
      localStorage.removeItem('msi_active_staff_phone');
      localStorage.removeItem('msi_active_staff_email');
    } catch (err) {
      console.warn(err);
    }
    router.push('/reception/login');
  };

  // Register new visitor (Flow: Form -> Mobile Verify -> Webcam -> Save -> Pass)
  const handleRegisterVisitor = (newVisitor: Visitor) => {
    const updated = [newVisitor, ...visitors];
    saveVisitors(updated);
  };

  // Mark Exit handler (Exit Update)
  const handleMarkExit = (visitorId: string) => {
    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const updated = visitors.map((v) =>
      v.id === visitorId
        ? {
            ...v,
            status: 'Exited' as const,
            exitTime: nowTime,
          }
        : v
    );

    saveVisitors(updated);
  };

  // Calculated metrics
  const activeCount = visitors.filter((v) => v.status === 'Inside').length;
  const todayTotal = visitors.length;

  return (
    <div className="min-h-screen bg-[#FFF9EF] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      {/* 1. Header with live headcount & official receptionist badge */}
      <ReceptionHeader
        currentStaff={currentStaff}
        allStaff={RECEPTION_STAFF_PROFILES}
        onSwitchStaff={handleSwitchStaff}
        activeVisitorCount={activeCount}
        todayTotalCount={todayTotal}
        onLogout={handleLogout}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* 2. Main Portal Shell: Sidebar + Content Viewport */}
      <div className="flex-1 flex flex-row">
        <ReceptionSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          staff={currentStaff}
          activeCount={activeCount}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Tab Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'new-visitor' && (
            <NewVisitorTab
              onRegisterVisitor={handleRegisterVisitor}
              existingVisitors={visitors}
            />
          )}

          {activeTab === 'active-visitors' && (
            <ActiveVisitorsTab
              visitors={visitors}
              onMarkExit={handleMarkExit}
            />
          )}

          {activeTab === 'history' && (
            <VisitorHistoryTab visitors={visitors} />
          )}

          {activeTab === 'leads' && (
            <LeadsRegisterTab currentStaff={currentStaff} />
          )}
        </main>
      </div>

      {/* Immediate Session Revocation Modal on Receptionist Deletion */}
      {isAccessRevoked && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-red-500 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider rounded-full mb-3">
              Access Revoked by Administration
            </span>
            <h3 className="font-serif text-xl font-bold text-[#10233F] mb-2">
              Reception Staff Access Terminated
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Aapka reception staff account MSI Administration dwaara permanently remove / terminate kar diya gaya hai. Portal session band kar diya gaya hai.
            </p>
            <div className="bg-red-50 rounded-2xl p-3 border border-red-100 text-xs text-red-700 font-medium mb-5">
              Redirecting to Reception Login in <strong className="font-mono text-sm">{revocationCountdown}s</strong>...
            </div>
            <button
              onClick={() => router.push('/reception/login')}
              className="w-full py-3 rounded-xl bg-[#89190E] hover:bg-[#68130B] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Return to Reception Login</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
