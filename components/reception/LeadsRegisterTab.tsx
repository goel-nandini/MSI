'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  PhoneCall,
  UserPlus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Shield,
  MessageSquare,
  AlertCircle,
  Inbox,
  Eye,
  RotateCcw,
  History,
  Building,
  UserCheck,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  Lead,
  LeadStatus,
  LeadSource,
  CallOutcome,
  INITIAL_LEADS,
  COURSES_LIST,
  SOURCES_LIST,
  COUNSELORS_LIST,
  RemarkEntry,
} from './data/leadsMockData';
import { ReceptionStaff } from './data/receptionMockData';

interface LeadsRegisterTabProps {
  currentStaff?: ReceptionStaff;
}

export default function LeadsRegisterTab({ currentStaff }: LeadsRegisterTabProps) {
  // Leads state persisted in localStorage
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [showImportNotice, setShowImportNotice] = useState(true);

  // Filter States
  const [activeTabFilter, setActiveTabFilter] = useState<
    'all' | 'new' | 'followup' | 'due-today' | 'overdue' | 'converted' | 'dead'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [counselorFilter, setCounselorFilter] = useState('All Counselors');
  const [layoutCompact, setLayoutCompact] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Modal 1: Log Remark & Schedule Modal
  const [selectedLeadForRemark, setSelectedLeadForRemark] = useState<Lead | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome>('Connected — Interested');
  const [remarkText, setRemarkText] = useState('');
  const [modalStatus, setModalStatus] = useState<LeadStatus>('Follow-up');
  const [nextDate, setNextDate] = useState('2026-10-25');
  const [nextTime, setNextTime] = useState('11:30 AM');

  // Modal 2: Add New Lead Modal
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadMobile, setNewLeadMobile] = useState('');
  const [newLeadLocation, setNewLeadLocation] = useState('');
  const [newLeadCourse, setNewLeadCourse] = useState(COURSES_LIST[1] || 'CLAT 2027 (2-Yr Class)');
  const [newLeadSource, setNewLeadSource] = useState<LeadSource>('Walk-in Desk');
  const [newLeadNotes, setNewLeadNotes] = useState('');
  const [addLeadError, setAddLeadError] = useState('');

  // Modal 3: View Audit Trail Modal
  const [auditLead, setAuditLead] = useState<Lead | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Fetch leads from backend disk API + fallback to localStorage
  const fetchBackendLeads = async () => {
    try {
      const res = await fetch('/api/admin/leads');
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
        try {
          localStorage.setItem('msi_reception_leads_data', JSON.stringify(data.leads));
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Backend leads fetch failed, using local:', err);
    }
  };

  // Load leads on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('msi_reception_leads_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setLeads(parsed);
        }
      }
    } catch (err) {
      console.warn('Could not read leads from localStorage:', err);
    }
    fetchBackendLeads();

    // Auto-poll every 6 seconds to keep telecalling desk fresh
    const pollTimer = setInterval(() => {
      fetchBackendLeads();
    }, 6000);

    const handleSync = () => fetchBackendLeads();
    window.addEventListener('focus', handleSync);
    window.addEventListener('msi_leads_sync', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('msi_leads_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Save leads helper
  const persistLeads = (updated: Lead[]) => {
    setLeads(updated);
    try {
      localStorage.setItem('msi_reception_leads_data', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not write leads to localStorage:', err);
    }
    try {
      window.dispatchEvent(new Event('msi_leads_sync'));
    } catch (_) {}
  };

  // Metric Ribbon Calculations
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === 'New').length;
    const unassignedCount = leads.filter((l) => l.agent === 'System' || l.agent === 'Super Admin').length;
    const followupCount = leads.filter((l) => l.status === 'Follow-up').length;
    const convertedCount = leads.filter((l) => l.status === 'Converted').length;
    const deadCount = leads.filter((l) => l.status === 'Dead').length;
    const overdueCount = leads.filter((l) => l.isOverdue).length;
    const dueTodayCount = leads.filter(
      (l) => l.status === 'Follow-up' && (l.dueText?.includes('Due') || l.nextFollowupTime?.includes('Today'))
    ).length;

    return {
      total,
      newCount,
      unassignedCount,
      followupCount,
      convertedCount,
      deadCount,
      overdueCount,
      dueTodayCount: dueTodayCount + overdueCount,
    };
  }, [leads]);

  // Filtering Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Tab filter
      if (activeTabFilter === 'new' && lead.status !== 'New') return false;
      if (activeTabFilter === 'followup' && lead.status !== 'Follow-up') return false;
      if (activeTabFilter === 'converted' && lead.status !== 'Converted') return false;
      if (activeTabFilter === 'dead' && lead.status !== 'Dead') return false;
      if (activeTabFilter === 'overdue' && !lead.isOverdue) return false;
      if (activeTabFilter === 'due-today') {
        const isDue = lead.dueText?.includes('Due') || lead.nextFollowupTime?.includes('Today') || lead.isOverdue;
        if (!isDue) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesId = lead.id.toLowerCase().includes(q);
        const matchesMobile = lead.mobile.includes(q);
        const matchesRemark = lead.latestRemark?.toLowerCase().includes(q) || false;
        const matchesCourse = lead.targetCourse.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesMobile && !matchesRemark && !matchesCourse) {
          return false;
        }
      }

      // Source Dropdown
      if (sourceFilter !== 'All Sources') {
        if (!lead.source.includes(sourceFilter) && sourceFilter !== lead.source) {
          return false;
        }
      }

      // Course Dropdown
      if (courseFilter !== 'All Courses') {
        if (lead.targetCourse !== courseFilter) return false;
      }

      // Counselor Dropdown
      if (counselorFilter !== 'All Counselors') {
        if (counselorFilter === 'My Leads (Harshit)') {
          if (!lead.agent.toLowerCase().includes('harshit') && !lead.agent.toLowerCase().includes('priya')) {
            return false;
          }
        } else if (counselorFilter === 'Super Admin') {
          if (!lead.agent.toLowerCase().includes('admin')) return false;
        } else if (counselorFilter === 'System / Unassigned') {
          if (lead.agent !== 'System') return false;
        }
      }

      return true;
    });
  }, [leads, activeTabFilter, searchQuery, sourceFilter, courseFilter, counselorFilter]);

  // Paginated leads
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage]);

  // Open Log Remark Modal
  const handleOpenRemarkModal = (lead: Lead) => {
    setSelectedLeadForRemark(lead);
    setModalStatus(lead.status === 'New' ? 'Follow-up' : lead.status);
    setSelectedOutcome('Connected — Interested');
    setRemarkText(lead.fullRemark || lead.latestRemark || '');
    setNextDate(lead.nextFollowupDate || new Date().toISOString().split('T')[0]);
    setNextTime('11:30 AM');
  };

  // Save Remark Handler
  const handleSaveRemark = (scheduleFollowup: boolean) => {
    if (!selectedLeadForRemark) return;

    const authorName = currentStaff?.name || 'Harshit';
    const nowTimestamp = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRemarkRecord: RemarkEntry = {
      id: `rem-${Date.now()}`,
      outcome: selectedOutcome,
      text: remarkText.trim() || `Outcome: ${selectedOutcome}`,
      timestamp: nowTimestamp,
      author: authorName,
      leadStatus: modalStatus,
      nextFollowupDate: scheduleFollowup ? nextDate : undefined,
      nextFollowupTime: scheduleFollowup ? nextTime : undefined,
    };

    const updated = leads.map((l) => {
      if (l.id === selectedLeadForRemark.id) {
        return {
          ...l,
          status: modalStatus,
          latestRemark: remarkText.trim() || `Outcome: ${selectedOutcome}`,
          fullRemark: remarkText.trim() || `Outcome: ${selectedOutcome}`,
          nextFollowupDate: scheduleFollowup ? nextDate : undefined,
          nextFollowupTime: scheduleFollowup ? `${nextDate ? 'On Date ' : ''}${nextTime}` : l.nextFollowupTime,
          isOverdue: false,
          overdueText: undefined,
          dueText: scheduleFollowup ? `Scheduled for ${nextDate}` : undefined,
          remarksHistory: [newRemarkRecord, ...(l.remarksHistory || [])],
        };
      }
      return l;
    });

    persistLeads(updated);
    setSelectedLeadForRemark(null);
    showToast(
      scheduleFollowup
        ? `Remark saved and follow-up scheduled for ${selectedLeadForRemark.name}!`
        : `Telecall remark logged successfully for ${selectedLeadForRemark.name}!`
    );
  };

  // Add New Lead Submit
  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) {
      setAddLeadError('Please enter the prospect full name');
      return;
    }
    const cleanMobile = newLeadMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setAddLeadError('Please enter a valid 10-digit mobile number');
      return;
    }

    const newId = `#MSI-LD-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowFormatted = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newLeadRecord: Lead = {
      id: newId,
      name: newLeadName.trim(),
      mobile: `+91 ${cleanMobile.slice(-10)}`,
      location: newLeadLocation.trim() || 'Front Desk Walk-in',
      targetCourse: newLeadCourse,
      source: newLeadSource,
      receivedDate: nowFormatted,
      status: 'New',
      latestRemark: newLeadNotes.trim() || 'Direct inquiry registered at reception counter.',
      fullRemark: newLeadNotes.trim() || 'Direct inquiry registered at reception counter.',
      agent: currentStaff?.name ? `${currentStaff.name} (Reception)` : 'Harshit (Reception)',
      isOverdue: false,
      remarksHistory: [
        {
          id: `rem-${Date.now()}`,
          outcome: 'Connected — Interested',
          text: newLeadNotes.trim() || 'Initial registration at front desk counter.',
          timestamp: nowFormatted,
          author: currentStaff?.name || 'Harshit',
          leadStatus: 'New',
        },
      ],
    };

    const updated = [newLeadRecord, ...leads];
    persistLeads(updated);

    // Reset Form & Close
    setNewLeadName('');
    setNewLeadMobile('');
    setNewLeadLocation('');
    setNewLeadNotes('');
    setAddLeadError('');
    setShowAddLeadModal(false);
    showToast(`Lead registered successfully! Assigned Lead ID: ${newId}`);
  };

  // Helper for source badge styling
  const renderSourceBadge = (source: string) => {
    if (source.includes('Super Admin')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-900 px-2 py-0.5 text-[11px] font-medium">
          <Shield className="w-3 h-3 text-purple-700" />
          <span>{source}</span>
        </span>
      );
    }
    if (source.includes('Website')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-900 px-2 py-0.5 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>{source}</span>
        </span>
      );
    }
    if (source.includes('Walk-in')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-medium">
          <Building className="w-3 h-3 text-amber-700" />
          <span>{source}</span>
        </span>
      );
    }
    if (source.includes('Ads')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-900 px-2 py-0.5 text-[11px] font-medium">
          <Sparkles className="w-3 h-3 text-rose-700" />
          <span>{source}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-800 px-2 py-0.5 text-[11px] font-medium">
        <Phone className="w-3 h-3 text-slate-600" />
        <span>{source}</span>
      </span>
    );
  };

  // Helper for status badge styling
  const renderStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700 text-white px-3 py-1 text-xs font-bold shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span>New</span>
          </span>
        );
      case 'Follow-up':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 text-yellow-950 border border-yellow-600 px-3 py-1 text-xs font-extrabold shadow-xs">
            <span className="h-2 w-2 rounded-full bg-yellow-900 animate-pulse" />
            <span>Follow-up</span>
          </span>
        );
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Converted</span>
          </span>
        );
      case 'Dead':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 text-white px-3 py-1 text-xs font-bold shadow-xs">
            <span className="h-2 w-2 rounded-full bg-white" />
            <span>Dead</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#10233F] text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-[#EFC988]/40 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Incoming Import Notice Banner */}
      {showImportNotice && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FFF3DD] border border-[#EFC988] px-4 py-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fed795] text-[#795c26] shrink-0">
              <Inbox className="w-4 h-4 font-bold" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2 text-xs sm:text-sm text-[#10233F]">
              <span className="font-bold text-[#89190E]">New Import Batch:</span>
              <span>
                14 Leads imported from Super Admin{' '}
                <code className="rounded bg-white/80 border border-[#EFC988] px-1.5 py-0.5 font-mono text-xs font-bold text-[#89190E]">
                  #MSI-IMP-2410
                </code>
              </span>
              <span className="text-[#526174] text-xs">• 25 minutes ago</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSourceFilter('Super Admin');
                setActiveTabFilter('all');
                showToast('Filtered batch: Showing leads imported from Super Admin (#2410)');
              }}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-[#89190E] bg-white/70 hover:bg-white border border-[#89190E]/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Filter This Batch</span>
            </button>
            <button
              type="button"
              onClick={() => setShowImportNotice(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[#526174] hover:bg-black/5 hover:text-[#10233F] transition-colors"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Screen Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#526174]">
            <span>Telecalling &amp; Leads</span>
            <span>/</span>
            <span className="text-[#89190E] font-bold">Lead Register</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#10233F] tracking-tight">
            Lead Register
          </h1>
          <p className="text-xs sm:text-sm text-[#526174]">
            Manage enquiries, call prospects, record remarks and schedule follow-ups in one place.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setLayoutCompact(!layoutCompact)}
            className="flex items-center gap-1.5 rounded-xl bg-white border border-[#E5E9F0] px-3.5 py-2 text-xs font-semibold text-[#10233F] shadow-xs hover:bg-[#F8F9FA] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#765a24]" />
            <span>{layoutCompact ? 'Compact View' : 'Standard View'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#89190E] hover:bg-[#660100] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#fed795]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* 3. Compact Metric Quick-Filter Ribbon (6 Sleek Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Active */}
        <button
          type="button"
          onClick={() => {
            setActiveTabFilter('all');
            setSourceFilter('All Sources');
            setCourseFilter('All Courses');
          }}
          className={`group flex flex-col items-start rounded-2xl bg-white p-3.5 text-left shadow-xs border transition-all hover:border-[#89190E]/40 hover:shadow-sm ${
            activeTabFilter === 'all' ? 'border-[#89190E] ring-1 ring-[#89190E]' : 'border-[#E5E9F0]'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#526174] group-hover:text-[#89190E]">
            Total Leads
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#10233F]">{metrics.total}</span>
            <span className="text-[11px] text-[#765a24] font-bold">Active Pool</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-full bg-[#765a24]"></div>
          </div>
        </button>

        {/* New / Uncalled */}
        <button
          type="button"
          onClick={() => setActiveTabFilter('new')}
          className={`group flex flex-col items-start rounded-2xl bg-white p-3.5 text-left shadow-xs border transition-all hover:border-slate-400 hover:shadow-sm ${
            activeTabFilter === 'new' ? 'border-slate-600 ring-1 ring-slate-600' : 'border-[#E5E9F0]'
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526174] group-hover:text-slate-800">
              New / Uncalled
            </span>
            <span className="h-2 w-2 rounded-full bg-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-slate-800">{metrics.newCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">Unassigned ({metrics.unassignedCount})</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-slate-500 rounded-full"
              style={{ width: `${Math.min(100, (metrics.newCount / (metrics.total || 1)) * 100)}%` }}
            ></div>
          </div>
        </button>

        {/* Follow-up */}
        <button
          type="button"
          onClick={() => setActiveTabFilter('followup')}
          className={`group flex flex-col items-start rounded-2xl bg-white p-3.5 text-left shadow-xs border transition-all hover:border-amber-400 hover:shadow-sm ${
            activeTabFilter === 'followup' ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/20' : 'border-[#E5E9F0]'
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526174] group-hover:text-amber-800">
              Follow-up
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-amber-900">{metrics.followupCount}</span>
            <span className="text-[11px] text-amber-700 font-medium">In Pipeline</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-amber-100 overflow-hidden">
            <div
              className="h-full bg-amber-600 rounded-full"
              style={{ width: `${Math.min(100, (metrics.followupCount / (metrics.total || 1)) * 100)}%` }}
            ></div>
          </div>
        </button>

        {/* Converted */}
        <button
          type="button"
          onClick={() => setActiveTabFilter('converted')}
          className={`group flex flex-col items-start rounded-2xl bg-white p-3.5 text-left shadow-xs border transition-all hover:border-emerald-400 hover:shadow-sm ${
            activeTabFilter === 'converted' ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20' : 'border-[#E5E9F0]'
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526174] group-hover:text-emerald-800">
              Converted
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-emerald-900">{metrics.convertedCount}</span>
            <span className="text-[11px] text-emerald-700 font-medium">Admitted</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${Math.min(100, (metrics.convertedCount / (metrics.total || 1)) * 100)}%` }}
            ></div>
          </div>
        </button>

        {/* Dead / Inactive */}
        <button
          type="button"
          onClick={() => setActiveTabFilter('dead')}
          className={`group flex flex-col items-start rounded-2xl bg-white p-3.5 text-left shadow-xs border transition-all hover:border-rose-400 hover:shadow-sm ${
            activeTabFilter === 'dead' ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20' : 'border-[#E5E9F0]'
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526174] group-hover:text-rose-800">
              Dead / Inactive
            </span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-rose-900">{metrics.deadCount}</span>
            <span className="text-[11px] text-rose-700 font-medium">Closed</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-rose-100 overflow-hidden">
            <div
              className="h-full bg-rose-600 rounded-full"
              style={{ width: `${Math.min(100, (metrics.deadCount / (metrics.total || 1)) * 100)}%` }}
            ></div>
          </div>
        </button>

        {/* Action Required / Overdue */}
        <button
          type="button"
          onClick={() => setActiveTabFilter('due-today')}
          className={`group flex flex-col items-start rounded-2xl p-3.5 text-left shadow-xs border transition-all ${
            activeTabFilter === 'due-today' || activeTabFilter === 'overdue'
              ? 'bg-[#FFDAD6] border-[#BA1A1A] ring-1 ring-[#BA1A1A]'
              : 'bg-[#FFDAD6]/60 border-[#FFB4A8] hover:bg-[#FFDAD6]'
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#BA1A1A]">Action Required</span>
            <AlertCircle className="w-3.5 h-3.5 text-[#BA1A1A] animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#93000A]">{metrics.dueTodayCount} Due</span>
            <span className="text-[11px] font-bold text-[#BA1A1A]">{metrics.overdueCount} Overdue</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#93000A]">
            <span>Requires call action</span>
          </div>
        </button>
      </div>

      {/* 4. Primary Workspace Card */}
      <div className="flex flex-col rounded-2xl bg-white border border-[#E5E9F0] shadow-xs overflow-hidden">
        {/* View Tabs Ribbon */}
        <div className="flex items-center justify-between overflow-x-auto bg-[#F8F9FB] px-4 pt-2 border-b border-[#E5E9F0]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTabFilter('all');
                setCurrentPage(1);
              }}
              className={`border-b-2 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTabFilter === 'all'
                  ? 'border-[#89190E] text-[#89190E] bg-white shadow-2xs'
                  : 'border-transparent text-[#526174] hover:text-[#10233F] hover:bg-slate-200/50'
              }`}
            >
              <span>All Leads</span>
              <span className="rounded-full bg-slate-200 text-[#10233F] px-1.5 py-0.2 text-[10px] font-mono">
                {metrics.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTabFilter('new');
                setCurrentPage(1);
              }}
              className={`border-b-2 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTabFilter === 'new'
                  ? 'border-[#89190E] text-[#89190E] bg-white shadow-2xs'
                  : 'border-transparent text-[#526174] hover:text-[#10233F] hover:bg-slate-200/50'
              }`}
            >
              <span>New</span>
              <span className="rounded-full bg-slate-200 text-[#10233F] px-1.5 py-0.2 text-[10px] font-mono">
                {metrics.newCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTabFilter('followup');
                setCurrentPage(1);
              }}
              className={`border-b-2 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTabFilter === 'followup'
                  ? 'border-[#89190E] text-[#89190E] bg-white shadow-2xs'
                  : 'border-transparent text-[#526174] hover:text-[#10233F] hover:bg-slate-200/50'
              }`}
            >
              <span>Follow-up</span>
              <span className="rounded-full bg-amber-100 text-amber-900 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {metrics.followupCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTabFilter('due-today');
                setCurrentPage(1);
              }}
              className={`border-b-2 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTabFilter === 'due-today'
                  ? 'border-[#89190E] text-[#89190E] bg-white shadow-2xs'
                  : 'border-transparent text-amber-900 bg-amber-50/50 hover:bg-amber-100/50'
              }`}
            >
              <span>Due Today</span>
              <span className="rounded-full bg-amber-200 text-amber-950 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {metrics.dueTodayCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTabFilter('overdue');
                setCurrentPage(1);
              }}
              className={`border-b-2 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTabFilter === 'overdue'
                  ? 'border-[#BA1A1A] text-[#BA1A1A] bg-white shadow-2xs'
                  : 'border-transparent text-[#BA1A1A] bg-rose-50/50 hover:bg-rose-100/50'
              }`}
            >
              <span>Overdue</span>
              <span className="rounded-full bg-[#BA1A1A] text-white px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {metrics.overdueCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTabFilter('converted');
                setCurrentPage(1);
              }}
              className={`border-b-2 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTabFilter === 'converted'
                  ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
                  : 'border-transparent text-[#526174] hover:text-[#10233F] hover:bg-slate-200/50'
              }`}
            >
              <span>Converted</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-mono">
                {metrics.convertedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTabFilter('dead');
                setCurrentPage(1);
              }}
              className={`border-b-2 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTabFilter === 'dead'
                  ? 'border-slate-600 text-slate-800 bg-white shadow-2xs'
                  : 'border-transparent text-[#526174] hover:text-[#10233F] hover:bg-slate-200/50'
              }`}
            >
              <span>Dead</span>
              <span className="rounded-full bg-slate-200 text-[#10233F] px-1.5 py-0.2 text-[10px] font-mono">
                {metrics.deadCount}
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 pb-2">
            <span className="text-[11px] font-semibold text-[#526174]">Showing:</span>
            <span className="text-xs font-mono font-bold text-[#10233F]">
              {filteredLeads.length} leads
            </span>
          </div>
        </div>

        {/* Filter & Tool Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-white border-b border-[#E5E9F0]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-[#526174] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, mobile (+91), Lead ID or remark..."
              className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] placeholder-[#526174]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#89190E]/30 focus:border-[#89190E]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Source */}
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E] cursor-pointer"
            >
              {SOURCES_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Course */}
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E] cursor-pointer max-w-[170px] truncate"
            >
              {COURSES_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Counselor */}
            <select
              value={counselorFilter}
              onChange={(e) => {
                setCounselorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E] cursor-pointer"
            >
              {COUNSELORS_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Reset */}
            {(searchQuery || sourceFilter !== 'All Sources' || courseFilter !== 'All Courses' || counselorFilter !== 'All Counselors') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSourceFilter('All Sources');
                  setCourseFilter('All Courses');
                  setCounselorFilter('All Counselors');
                  setActiveTabFilter('all');
                }}
                className="flex items-center gap-1 h-9 px-2.5 rounded-xl text-xs font-bold text-[#89190E] hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. Spreadsheet-Style Lead Register Table */}
        <div className="relative w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FB] text-[11px] uppercase tracking-wider text-[#526174] font-bold border-b border-[#E5E9F0] select-none">
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-3 py-3">Lead ID</th>
                <th className="px-3 py-3 min-w-[200px]">Prospect Name</th>
                <th className="px-3 py-3 min-w-[160px]">Contact Info</th>
                <th className="px-3 py-3 min-w-[170px]">Course Target</th>
                <th className="px-3 py-3 min-w-[140px]">Source</th>
                <th className="px-3 py-3 min-w-[110px]">Received</th>
                <th className="px-3 py-3 min-w-[120px]">Status</th>
                <th className="px-3 py-3 min-w-[240px]">Latest Remark</th>
                <th className="px-3 py-3 min-w-[160px]">Next Follow-up</th>
                <th className="px-3 py-3 min-w-[110px]">Agent</th>
                <th className="px-4 py-3 text-right min-w-[130px] sticky right-0 bg-[#F8F9FB] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9F0] text-[#10233F]">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-[#526174]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-sm">No leads match your active filters.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSourceFilter('All Sources');
                          setCourseFilter('All Courses');
                          setActiveTabFilter('all');
                        }}
                        className="text-xs text-[#89190E] font-bold underline cursor-pointer"
                      >
                        Clear filters to see all leads
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, index) => {
                  const initials = lead.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  const isUrgent = lead.isOverdue;

                  // Full row color styling: light yellow for Follow-up, light green for Converted, light red for Dead
                  const rowClass =
                    lead.status === 'Dead'
                      ? 'border-l-4 border-l-red-500 bg-[#FEE2E2]/60 hover:bg-[#FEE2E2]/90 border-b border-red-200/80 text-[#10233F]'
                      : lead.status === 'Converted'
                      ? 'border-l-4 border-l-emerald-500 bg-[#DCFCE7]/60 hover:bg-[#DCFCE7]/90 border-b border-emerald-200/80 text-[#10233F]'
                      : lead.status === 'Follow-up'
                      ? 'border-l-4 border-l-amber-500 bg-[#FEF9C3]/65 hover:bg-[#FEF9C3]/90 border-b border-amber-200/80 text-[#10233F]'
                      : 'border-l-4 border-l-slate-300 bg-white hover:bg-slate-50 border-b border-[#E5E9F0] text-[#10233F]';

                  const stickyActionBg =
                    lead.status === 'Dead'
                      ? 'bg-[#FEE2E2] group-hover:bg-[#FECACA]'
                      : lead.status === 'Converted'
                      ? 'bg-[#DCFCE7] group-hover:bg-[#BBF7D0]'
                      : lead.status === 'Follow-up'
                      ? 'bg-[#FEF9C3] group-hover:bg-[#FEF08A]'
                      : 'bg-white group-hover:bg-slate-50';

                  return (
                    <tr key={lead.id} className={`group transition-colors ${rowClass}`}>
                      {/* # */}
                      <td className="px-3 py-2.5 text-center font-mono text-[#334155] font-semibold text-[11px]">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      {/* Lead ID */}
                      <td className="px-3 py-2.5 font-mono font-bold text-[#89190E]">
                        <span className="rounded-md bg-white/90 border border-slate-300/80 px-1.5 py-0.5 shadow-2xs">
                          {lead.id}
                        </span>
                      </td>

                      {/* Prospect Name */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 shadow-2xs ${
                              lead.status === 'Converted'
                                ? 'bg-emerald-600 text-white'
                                : lead.status === 'Dead'
                                ? 'bg-red-600 text-white'
                                : lead.status === 'Follow-up'
                                ? 'bg-amber-500 text-white font-bold'
                                : 'bg-slate-700 text-white'
                            }`}
                          >
                            {initials}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs truncate text-[#10233F]">
                              {lead.name}
                            </span>
                            <span className="text-[11px] text-[#334155] font-medium truncate flex items-center gap-1">
                              {lead.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (with 1-click Softphone Call Link) */}
                      <td className="px-3 py-2.5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#10233F]">{lead.mobile}</span>
                          <a
                            href={`tel:${lead.mobile.replace(/\s+/g, '')}`}
                            title="1-Click Call Softphone"
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[#765a24] bg-white/90 hover:bg-white border border-slate-200 shadow-2xs transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Course Target */}
                      <td className="px-3 py-2.5">
                        <span className="inline-block rounded-md bg-white/90 border border-slate-300/80 px-2 py-0.5 text-[11px] font-bold text-[#89190E] shadow-2xs">
                          {lead.targetCourse}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-3 py-2.5">{renderSourceBadge(lead.source)}</td>

                      {/* Received Date */}
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[#334155] font-medium">
                        {lead.receivedDate}
                      </td>

                      {/* Status Column */}
                      <td className="px-3 py-2.5">
                        {renderStatusBadge(lead.status)}
                      </td>

                      {/* Latest Remark with Hover Popover */}
                      <td className="px-3 py-2.5">
                        <div className="relative group/tip">
                          <p className="max-w-[220px] truncate text-xs text-[#1E293B] font-medium">
                            {lead.latestRemark}
                          </p>
                          {lead.fullRemark && lead.fullRemark !== lead.latestRemark && (
                            <div className="pointer-events-none absolute bottom-full left-0 z-30 hidden w-64 rounded-xl bg-[#10233F] p-2.5 text-xs text-white shadow-xl group-hover/tip:block mb-1">
                              {lead.fullRemark}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Next Follow-up */}
                      <td className="px-3 py-2.5 font-mono">
                        {lead.isOverdue ? (
                          <div>
                            <div className="flex items-center gap-1 text-[#BA1A1A] font-bold text-xs">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>{lead.nextFollowupTime || 'Overdue'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#BA1A1A] uppercase tracking-wider block">
                              {lead.overdueText || 'Overdue'}
                            </span>
                          </div>
                        ) : lead.dueText ? (
                          <div>
                            <div className="flex items-center gap-1 text-amber-950 font-bold text-xs">
                              <Calendar className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                              <span>{lead.nextFollowupTime || 'Today'}</span>
                            </div>
                            <span className="text-[10px] text-amber-900 font-bold block">
                              {lead.dueText}
                            </span>
                          </div>
                        ) : lead.status === 'Converted' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-900 font-bold text-xs">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium text-xs">
                            {lead.nextFollowupTime || '--'}
                          </span>
                        )}
                      </td>

                      {/* Agent */}
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[#334155] font-semibold truncate">
                        {lead.agent}
                      </td>

                      {/* Actions (Sticky Right Column) */}
                      <td
                        className={`px-4 py-2.5 text-right sticky right-0 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] transition-colors ${stickyActionBg}`}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenRemarkModal(lead)}
                            title="Log Telecall Remark"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#89190E] text-white hover:bg-[#660100] transition-colors shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenRemarkModal(lead);
                            }}
                            title="Schedule Follow-up"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[#10233F] hover:bg-slate-200 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuditLead(lead)}
                            title="View History & Audit Trail"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[#10233F] hover:bg-slate-200 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination & Audit Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-[#F8F9FB] border-t border-[#E5E9F0]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[#526174]">
              Showing <span className="font-bold text-[#10233F]">{paginatedLeads.length}</span> of{' '}
              <span className="font-bold text-[#10233F]">{filteredLeads.length}</span> leads
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </span>
            <span className="text-[11px] text-[#526174]/80">
              Terminal Counter 01 • Reception Desk ({currentStaff?.name || 'Harshit'})
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 self-start sm:self-auto">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-8 items-center gap-1 rounded-lg bg-white border border-[#E5E9F0] px-2.5 text-xs text-[#10233F] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`h-8 w-8 rounded-lg text-xs font-mono font-bold transition-colors ${
                    currentPage === pg
                      ? 'bg-[#89190E] text-white shadow-2xs'
                      : 'bg-white border border-[#E5E9F0] text-[#10233F] hover:bg-slate-50'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 items-center gap-1 rounded-lg bg-white border border-[#E5E9F0] px-2.5 text-xs text-[#10233F] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Interactive Log Telecall Remark & Schedule Follow-up Dialog     */}
      {/* ========================================================================= */}
      {selectedLeadForRemark && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedLeadForRemark(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#EFC988] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Academic Gold Accent Strip */}
            <div className="h-1.5 w-full bg-linear-to-r from-[#765a24] via-[#EFC988] to-[#765a24]"></div>

            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 bg-[#F8F9FB] border-b border-[#E5E9F0]">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#FFF3DD] border border-[#EFC988] px-2 py-0.5 font-mono text-xs font-bold text-[#89190E]">
                    {selectedLeadForRemark.id}
                  </span>
                  <span className="rounded-full bg-blue-100 text-blue-900 px-2.5 py-0.5 text-xs font-semibold">
                    {selectedLeadForRemark.source}
                  </span>
                  <span className="rounded-md bg-[#fed795]/60 text-[#795c26] px-2 py-0.5 text-xs font-semibold">
                    {selectedLeadForRemark.targetCourse}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#10233F]">
                  Log Telecall Remark • {selectedLeadForRemark.name}
                </h2>
                <div className="text-xs text-[#526174] flex items-center gap-2 font-mono">
                  <span>Contact: {selectedLeadForRemark.mobile}</span>
                  <span>•</span>
                  {selectedLeadForRemark.isOverdue ? (
                    <span className="text-[#BA1A1A] font-bold">
                      {selectedLeadForRemark.overdueText || 'Overdue Follow-up'}
                    </span>
                  ) : (
                    <span>Slot: {selectedLeadForRemark.nextFollowupTime || 'Open'}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForRemark(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-[#10233F] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="flex flex-col gap-4 p-5 overflow-y-auto">
              {/* Call Outcome Pills */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#526174]">
                  Call Outcome
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      'Connected — Interested',
                      'Needs More Info',
                      'Callback Requested',
                      'No Answer / Switched Off',
                      'Number Busy',
                      'Wrong Number',
                      'Not Interested',
                    ] as CallOutcome[]
                  ).map((outcome) => {
                    const isSelected = selectedOutcome === outcome;
                    return (
                      <button
                        key={outcome}
                        type="button"
                        onClick={() => setSelectedOutcome(outcome)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#89190E] text-white shadow-xs'
                            : 'bg-[#F8F9FB] border border-[#E5E9F0] text-[#526174] hover:bg-slate-100 hover:text-[#10233F]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{outcome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Call Remarks Textarea */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526174]">
                    Call Remarks &amp; Student Conversation Summary
                  </label>
                  <span className="text-[11px] text-[#765a24] font-medium">Recorded under Harshit (Reception)</span>
                </div>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="Type conversation points, candidate queries, parent feedback..."
                  rows={4}
                  className="w-full rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] p-3 text-xs sm:text-sm text-[#10233F] placeholder-[#526174]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#89190E]/30 focus:border-[#89190E]"
                />
              </div>

              {/* Status & Next Follow-up Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Update Lead Status Radio Group */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526174]">
                    Update Lead Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`flex items-center gap-2 rounded-xl p-2.5 cursor-pointer border transition-colors ${
                        modalStatus === 'New'
                          ? 'bg-slate-100 border-slate-400 font-bold text-slate-900'
                          : 'bg-[#F8F9FB] border-[#E5E9F0] text-[#526174] hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modal_lead_status"
                        checked={modalStatus === 'New'}
                        onChange={() => setModalStatus('New')}
                        className="accent-slate-700"
                      />
                      <span className="text-xs">New / Open</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 rounded-xl p-2.5 cursor-pointer border transition-colors ${
                        modalStatus === 'Follow-up'
                          ? 'bg-amber-100/70 border-amber-400 font-bold text-amber-950'
                          : 'bg-[#F8F9FB] border-[#E5E9F0] text-[#526174] hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modal_lead_status"
                        checked={modalStatus === 'Follow-up'}
                        onChange={() => setModalStatus('Follow-up')}
                        className="accent-amber-600"
                      />
                      <span className="text-xs">Follow-up</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 rounded-xl p-2.5 cursor-pointer border transition-colors ${
                        modalStatus === 'Converted'
                          ? 'bg-emerald-100/70 border-emerald-400 font-bold text-emerald-950'
                          : 'bg-[#F8F9FB] border-[#E5E9F0] text-[#526174] hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modal_lead_status"
                        checked={modalStatus === 'Converted'}
                        onChange={() => setModalStatus('Converted')}
                        className="accent-emerald-600"
                      />
                      <span className="text-xs">Converted</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 rounded-xl p-2.5 cursor-pointer border transition-colors ${
                        modalStatus === 'Dead'
                          ? 'bg-rose-100/70 border-rose-400 font-bold text-rose-950'
                          : 'bg-[#F8F9FB] border-[#E5E9F0] text-[#526174] hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modal_lead_status"
                        checked={modalStatus === 'Dead'}
                        onChange={() => setModalStatus('Dead')}
                        className="accent-rose-600"
                      />
                      <span className="text-xs">Dead / Drop</span>
                    </label>
                  </div>
                </div>

                {/* Schedule Next Follow-up Slot */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526174]">
                    Next Follow-up Date &amp; Slot
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      className="w-full h-9.5 px-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                    />
                    <input
                      type="text"
                      value={nextTime}
                      onChange={(e) => setNextTime(e.target.value)}
                      placeholder="11:30 AM"
                      className="w-full h-9.5 px-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#765a24] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Auto-reminder notification triggers at Reception Desk</span>
                  </div>
                </div>
              </div>

              {/* Security & Ledger Notice */}
              <div className="flex items-start gap-2.5 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] p-3 text-xs text-[#526174]">
                <Shield className="w-4 h-4 text-[#765a24] shrink-0 mt-0.5" />
                <span>
                  Remarks are recorded into the MSI intake ledger with receptionist credentials and
                  timestamp. Once committed, remarks are preserved for audit trail.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-4 bg-[#F8F9FB] border-t border-[#E5E9F0]">
              <button
                type="button"
                onClick={() => setSelectedLeadForRemark(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-[#526174] hover:bg-slate-200 transition-colors"
              >
                Discard &amp; Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveRemark(false)}
                  className="rounded-xl bg-white border border-[#E5E9F0] px-3.5 py-2 text-xs font-bold text-[#10233F] shadow-xs hover:bg-slate-50 transition-colors"
                >
                  Save Remark Only
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveRemark(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#89190E] hover:bg-[#660100] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save &amp; Schedule Follow-up</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Interactive + Add New Lead Front Desk Modal                      */}
      {/* ========================================================================= */}
      {showAddLeadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowAddLeadModal(false)}
        >
          <div
            className="relative flex flex-col w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#EFC988] max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Academic Gold Accent Strip */}
            <div className="h-1.5 w-full bg-linear-to-r from-[#765a24] via-[#EFC988] to-[#765a24]"></div>

            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 bg-[#F8F9FB] border-b border-[#E5E9F0]">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#89190E]">
                  <span>Front Desk Intake</span>
                  <span>•</span>
                  <span>Reception Station</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-[#10233F] mt-0.5">
                  Capture New Lead Enquiry
                </h2>
                <p className="text-xs text-[#526174]">
                  Register candidate contact, target law course, and initial enquiry notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-[#10233F] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddLeadSubmit} className="flex flex-col gap-4 p-5 overflow-y-auto">
              {addLeadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addLeadError}</span>
                </div>
              )}

              {/* Prospect Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10233F]">
                  Candidate Full Name <span className="text-[#89190E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="h-10 px-3.5 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#89190E]/30 focus:border-[#89190E]"
                />
              </div>

              {/* Mobile & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10233F]">
                    Mobile Number <span className="text-[#89190E]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#526174]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={newLeadMobile}
                      onChange={(e) => setNewLeadMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full h-10 pl-11 pr-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs font-mono text-[#10233F] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#89190E]/30 focus:border-[#89190E]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10233F]">City / Sector / Area</label>
                  <input
                    type="text"
                    value={newLeadLocation}
                    onChange={(e) => setNewLeadLocation(e.target.value)}
                    placeholder="e.g. Sector 15, Chandigarh"
                    className="h-10 px-3.5 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#89190E]/30 focus:border-[#89190E]"
                  />
                </div>
              </div>

              {/* Course & Source Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10233F]">Target Course</label>
                  <select
                    value={newLeadCourse}
                    onChange={(e) => setNewLeadCourse(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                  >
                    {COURSES_LIST.filter((c) => c !== 'All Courses').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#10233F]">Enquiry Source</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value as LeadSource)}
                    className="h-10 px-3 rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] text-xs text-[#10233F] focus:outline-none focus:ring-1 focus:ring-[#89190E]"
                  >
                    <option value="Walk-in Desk">Walk-in Desk</option>
                    <option value="Phone Enquiry">Phone Enquiry</option>
                    <option value="Website Enquiry">Website Enquiry</option>
                    <option value="Alumni Referral">Alumni Referral</option>
                    <option value="Super Admin (#2410)">Super Admin (#2410)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#10233F]">
                  Initial Inquiry Remarks / Student Interest
                </label>
                <textarea
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  placeholder="e.g. Walked in for 2-year classroom course. Parents requested demo lecture schedule."
                  rows={3}
                  className="w-full rounded-xl bg-[#F8F9FB] border border-[#E5E9F0] p-3 text-xs text-[#10233F] placeholder-[#526174]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#89190E]/30 focus:border-[#89190E]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E9F0]">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#526174] hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[#89190E] hover:bg-[#660100] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Audit Trail & Historical Telecall Logs                          */}
      {/* ========================================================================= */}
      {auditLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setAuditLead(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#EFC988] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 bg-[#F8F9FB] border-b border-[#E5E9F0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#89190E] bg-[#FFF3DD] border border-[#EFC988] px-2 py-0.5 rounded-md">
                    {auditLead.id}
                  </span>
                  <span className="text-xs text-[#526174]">• Intake Audit Trail</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#10233F] mt-1">
                  Telecall History: {auditLead.name}
                </h3>
                <span className="text-xs font-mono text-[#526174]">{auditLead.mobile}</span>
              </div>
              <button
                type="button"
                onClick={() => setAuditLead(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-[#10233F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* History Timeline */}
            <div className="p-5 overflow-y-auto space-y-4">
              {auditLead.remarksHistory && auditLead.remarksHistory.length > 0 ? (
                auditLead.remarksHistory.map((rem, i) => (
                  <div key={rem.id || i} className="flex items-start gap-3 relative pb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF3DD] border border-[#EFC988] text-[#89190E] text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 bg-[#F8F9FB] border border-[#E5E9F0] rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#10233F]">{rem.outcome}</span>
                        <span className="text-[10px] text-[#526174] font-mono">{rem.timestamp}</span>
                      </div>
                      <p className="text-[#526174]">{rem.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#765a24] pt-1">
                        <span>Staff: {rem.author}</span>
                        {rem.nextFollowupTime && (
                          <span className="font-mono">Next: {rem.nextFollowupTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#526174] text-xs">
                  <p>No previous call history logged yet for this lead.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#F8F9FB] border-t border-[#E5E9F0] flex justify-end">
              <button
                type="button"
                onClick={() => setAuditLead(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-[#10233F] bg-white border border-[#E5E9F0] hover:bg-slate-50 transition-colors"
              >
                Close Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
