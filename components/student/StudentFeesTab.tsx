'use client';

import React from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  FeeBreakdownItem,
  FeeTransaction,
  StudentProfile,
  FEE_SUMMARY,
} from './data/studentMockData';

interface StudentFeesTabProps {
  student: StudentProfile;
  breakdown: FeeBreakdownItem[];
  transactions: FeeTransaction[];
  onViewReceipt: (tx: FeeTransaction) => void;
}

export default function StudentFeesTab({
  student,
  breakdown,
  transactions,
  onViewReceipt,
}: StudentFeesTabProps) {
  const hasFee = FEE_SUMMARY.totalFee > 0;
  const paidRatio = hasFee ? Math.round((FEE_SUMMARY.paidFee / FEE_SUMMARY.totalFee) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Fee Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-[#10233F] via-[#162d50] to-[#89190E] text-white shadow-xl hud-bracket relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-15 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#EFC988]" />
              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[#EFC988] uppercase font-bold">
                Official Bursar & Accounts Ledger • MSI Academic Session 2026-27
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1.5">
              Fee Ledger, Institutional Receipts & Validity
            </h2>
            <p className="text-white/80 text-xs sm:text-sm mt-2 leading-relaxed">
              {hasFee
                ? `Your active enrollment is in good financial standing. You have cleared ${paidRatio}% of your academic dues.`
                : 'Your student account is in good standing with zero outstanding institutional dues.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                Course Validity: {student.validUntil || 'Active'}
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-white/90">
                Status: Verified Student Record
              </span>
            </div>
          </div>

          {/* Fee Balance Metric */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[200px] flex-shrink-0">
            <span className="text-[10px] font-mono tracking-wider uppercase text-white/70 block">
              Pending Dues
            </span>
            <span className="font-serif text-3xl font-bold text-[#EFC988] mt-1 block">
              ₹{FEE_SUMMARY.pendingFee.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-300 block mt-1 font-semibold">
              {FEE_SUMMARY.pendingFee === 0 ? '✓ All Cleared' : `Due Date: ${FEE_SUMMARY.nextDueDate}`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Paid vs Pending Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#526174] block">
            Total Program Fee
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F] mt-2">
            ₹{FEE_SUMMARY.totalFee.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#526174] mt-1">Official enrolled curriculum ledger</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
              Total Fee Cleared
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {paidRatio}% Cleared
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 mt-2">
            ₹{FEE_SUMMARY.paidFee.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-800 mt-1">
            {transactions.length > 0 ? `${transactions.length} Verified E-Receipt(s)` : 'No dues pending'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
              Outstanding Balance
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {FEE_SUMMARY.pendingFee === 0 ? 'Nil' : 'Active'}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#89190E] mt-2">
            ₹{FEE_SUMMARY.pendingFee.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#526174] mt-1">
            {FEE_SUMMARY.pendingFee === 0 ? 'Zero outstanding balance' : 'Payment due'}
          </p>
        </div>
      </div>

      {/* 3. Fee Breakdown Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DCCB]">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#89190E]" />
            <h3 className="font-serif text-lg font-bold text-[#10233F]">
              Fee Component Breakdown
            </h3>
          </div>
          <span className="text-xs text-[#526174]">Annual Syllabus Structure</span>
        </div>

        {breakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#526174]">
            No fee components currently billed. Your financial account is in good standing.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9EF] text-[#10233F] border-b border-[#E8DCCB]">
                <tr>
                  <th className="p-3 font-serif font-bold">Category</th>
                  <th className="p-3 font-serif font-bold">Amount (INR)</th>
                  <th className="p-3 font-serif font-bold">Status</th>
                  <th className="p-3 font-serif font-bold text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60">
                {breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FFF9EF]/40 transition-colors">
                    <td className="p-3 font-semibold text-[#10233F]">{item.category}</td>
                    <td className="p-3 font-mono font-bold text-[#10233F]">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'Paid' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="p-3 text-right text-[#526174]">
                      {item.dueDate ? `Due on ${item.dueDate}` : 'Receipt Generated'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Payment History & Official E-Receipts */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DCCB]">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#89190E]" />
            <h3 className="font-serif text-lg font-bold text-[#10233F]">
              Payment History Ledger & Verified Official Receipts
            </h3>
          </div>
          <span className="text-xs text-[#526174]">Instant PDF Download</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#526174]">
            No payment transactions on record yet. Any payments made online via Razorpay will generate verifiable e-receipts here.
          </div>
        ) : (
          <div className="space-y-3.5 mt-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-5 rounded-2xl border border-[#E8DCCB] hover:border-[#89190E] transition-all bg-[#FFF9EF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-[#89190E] bg-[#FFF3DD] px-2.5 py-0.5 rounded-md border border-[#EFC988]">
                      {tx.receiptNo}
                    </span>
                    <span className="text-[11px] text-[#526174]">Paid on {tx.date}</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ● {tx.status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#10233F]">
                    {tx.remarks}
                  </h4>
                  <p className="text-xs text-[#526174]">
                    Mode: <strong>{tx.mode}</strong> • System Ref: {tx.id}
                  </p>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-[#526174] uppercase block">Amount Paid</span>
                    <span className="font-serif text-lg font-bold text-[#10233F]">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewReceipt(tx)}
                    className="px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#EFC988]" />
                    <span>View Official Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
