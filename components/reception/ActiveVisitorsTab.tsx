'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Clock,
  Building2,
  LogOut,
  Printer,
  ShieldAlert,
  Phone,
  Car,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Visitor, MSI_DEPARTMENTS } from './data/receptionMockData';
import VisitorPassModal from './VisitorPassModal';

interface ActiveVisitorsTabProps {
  visitors: Visitor[];
  onMarkExit: (visitorId: string) => void;
}

export default function ActiveVisitorsTab({
  visitors,
  onMarkExit,
}: ActiveVisitorsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewingPassVisitor, setViewingPassVisitor] = useState<Visitor | null>(null);
  const [exitSuccessMsg, setExitSuccessMsg] = useState<string | null>(null);

  // Active visitors only
  const activeList = visitors.filter((v) => v.status === 'Inside');

  // Filtered by search & department
  const filtered = activeList.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.mobile.includes(searchTerm) ||
      v.hostPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || v.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleTriggerExit = (id: string, name: string) => {
    onMarkExit(id);
    setExitSuccessMsg(`Exit recorded for ${name}. Visitor departure logged successfully.`);
    setTimeout(() => {
      setExitSuccessMsg(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">
              Active In Institute
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="font-serif text-3xl font-bold text-[#10233F]">
              {activeList.length}
            </span>
            <span className="text-xs text-[#526174]">authorized visitors</span>
          </div>
          <span className="text-[11px] text-emerald-700 block mt-1 font-medium">
            🟢 Physical security clearance active
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">
              Average Institute Dwell
            </span>
            <Clock className="w-4 h-4 text-[#89190E]" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="font-serif text-3xl font-bold text-[#89190E]">
              48m
            </span>
            <span className="text-xs text-[#526174]">per visit session</span>
          </div>
          <span className="text-[11px] text-[#526174] block mt-1">
            Normal operational window: 15m - 2h
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">
              Overstay Watch (&gt; 3h)
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="font-serif text-3xl font-bold text-amber-700">
              0
            </span>
            <span className="text-xs text-[#526174]">flagged passes</span>
          </div>
          <span className="text-[11px] text-emerald-600 block mt-1 font-medium">
            ✓ All passes within standard validity
          </span>
        </div>
      </div>

      {/* Exit Success Notification */}
      {exitSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{exitSuccessMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700">VMS Exit Timestamp Logged</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8DCCB] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search visitor name, ID, mobile, host..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#526174]" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E] font-medium"
          >
            <option value="ALL">All MSI Departments</option>
            {MSI_DEPARTMENTS.map((d) => (
              <option key={d.department} value={d.department}>
                {d.department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Visitors Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DCCB]">
          <Users className="w-12 h-12 text-[#E8DCCB] mx-auto mb-3" />
          <h3 className="font-serif font-bold text-base text-[#10233F]">
            No Active Visitors Found
          </h3>
          <p className="text-xs text-[#526174] mt-1">
            {searchTerm || selectedDept !== 'ALL'
              ? 'Try changing your search keywords or department filter.'
              : 'No visitors currently inside the premises. Use New Registration to register incoming visitors.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((visitor) => (
            <div
              key={visitor.id}
              className="bg-white rounded-3xl border border-[#E8DCCB] p-5 shadow-xs hover:border-[#89190E]/50 transition-all flex flex-col justify-between"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-14 h-16 rounded-xl overflow-hidden border border-[#10233F] bg-stone-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={visitor.photoUrl}
                        alt={visitor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold text-[#89190E] bg-[#89190E]/10 px-2 py-0.5 rounded">
                          {visitor.id}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF3DD] text-[#89190E] border border-[#EFC988]">
                          {visitor.visitorType}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#10233F] mt-1 leading-tight">
                        {visitor.name}
                      </h4>
                      <span className="text-xs text-[#526174] font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#89190E]" />
                        +91 {visitor.mobile}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Inside</span>
                  </span>
                </div>

                {/* Details Grid */}
                <div className="p-3 rounded-2xl bg-[#FFF9EF]/60 border border-[#E8DCCB] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#526174]">Destination:</span>
                    <span className="font-semibold text-[#10233F] text-right truncate max-w-[200px]">
                      {visitor.department}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#526174]">Host Person:</span>
                    <span className="font-semibold text-[#89190E] text-right">
                      {visitor.hostPerson}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#526174]">Purpose:</span>
                    <span className="font-medium text-[#10233F] text-right truncate max-w-[220px]">
                      {visitor.purpose}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E8DCCB]/60 font-mono text-[11px]">
                    <span className="text-[#526174] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#89190E]" />
                      Entry: {visitor.entryTime}
                    </span>
                    <span className="text-[#526174]">
                      Gate: {visitor.gateNumber.split(' ')[0]}
                    </span>
                  </div>

                  {visitor.vehicleNo && (
                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#526174]">
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-[#89190E]" />
                        Vehicle:
                      </span>
                      <span className="font-bold text-[#10233F]">
                        {visitor.vehicleNo}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#E8DCCB] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewingPassVisitor(visitor)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF9EF] border border-[#E8DCCB] text-[#10233F] text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#89190E]" />
                  <span>View Pass</span>
                </button>

                {/* Exit Update button */}
                <button
                  type="button"
                  onClick={() => handleTriggerExit(visitor.id, visitor.name)}
                  className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-[#89190E]/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Update</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visitor Pass Modal view */}
      {viewingPassVisitor && (
        <VisitorPassModal
          visitor={viewingPassVisitor}
          onClose={() => setViewingPassVisitor(null)}
          onMarkExit={(id) => {
            handleTriggerExit(id, viewingPassVisitor.name);
          }}
        />
      )}
    </div>
  );
}
