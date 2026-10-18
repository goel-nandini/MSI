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

export default function ReceptionDashboardPage() {
  const router = useRouter();

  // Active staff state (defaults to Harshit)
  const [currentStaff, setCurrentStaff] = useState<ReceptionStaff>(RECEPTION_STAFF_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<ReceptionModuleTab>('new-visitor');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Visitors dynamic repository
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);

  // Check auth and load persisted visitor logs on mount
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem('msi_reception_logged_in') === 'true';
      if (!isLoggedIn) {
        router.push('/reception/login');
        return;
      }

      const savedStaffId = localStorage.getItem('msi_active_staff_id');
      if (savedStaffId) {
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
    } catch (err) {
      console.warn('Could not read from localStorage:', err);
    }
  }, [router]);

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
    </div>
  );
}
