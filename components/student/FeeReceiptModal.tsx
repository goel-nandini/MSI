'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FeeTransaction, StudentProfile } from './data/studentMockData';

interface FeeReceiptModalProps {
  transaction: FeeTransaction | null;
  student: StudentProfile;
  onClose: () => void;
}

export default function FeeReceiptModal({ transaction, student, onClose }: FeeReceiptModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#10233F]/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-[#E8DCCB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Hidden during window.print) */}
        <div className="print:hidden bg-[#10233F] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#EFC988]/30">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-[#EFC988] font-bold uppercase tracking-wider">
              Official Institutional E-Receipt • Verified
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-white/20"
            >
              <Printer className="w-3.5 h-3.5 text-[#EFC988]" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-[#10233F] space-y-6">
          
          {/* Header with Seal & Institute Details */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-[#89190E]">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <Image
                  src="/images/msi-crest.png"
                  alt="MSI Official Seal"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#89190E] tracking-tight">
                  MSI GROUP OF INSTITUTES
                </h2>
                <p className="text-xs text-[#526174] font-medium">
                  Faculty of Judicial Studies, Law &amp; Allied Sciences
                </p>
                <p className="text-[11px] text-[#526174]">
                  Kharar-Mohali Expressway, Punjab - 140301 • Affiliated &amp; Approved
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 text-right">
              <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
                Payment Completed
              </span>
              <p className="text-xs font-mono font-bold text-[#10233F] mt-1.5">
                Receipt: {transaction.receiptNo}
              </p>
              <p className="text-xs text-[#526174]">
                Dated: {transaction.date}
              </p>
            </div>
          </div>

          {/* Student & Payment Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] text-xs">
            <div>
              <span className="text-[#526174] font-medium block">Student Name</span>
              <span className="font-bold text-sm text-[#10233F]">{student.name}</span>
            </div>
            <div>
              <span className="text-[#526174] font-medium block">Enrollment No.</span>
              <span className="font-mono font-bold text-[#89190E]">{student.enrollmentNo}</span>
            </div>
            <div>
              <span className="text-[#526174] font-medium block">Roll Number</span>
              <span className="font-mono font-bold text-[#10233F]">{student.rollNo}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#526174] font-medium block">Course Enrolled</span>
              <span className="font-semibold text-[#10233F]">{student.batch}</span>
            </div>
            <div>
              <span className="text-[#526174] font-medium block">Payment Method</span>
              <span className="font-bold text-[#10233F]">{transaction.mode}</span>
            </div>
          </div>

          {/* Itemized Fee Breakdown Table */}
          <div className="border border-[#E8DCCB] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#10233F] text-[#FFF9EF]">
                <tr>
                  <th className="p-3 font-serif font-bold">#</th>
                  <th className="p-3 font-serif font-bold">Fee Description</th>
                  <th className="p-3 font-serif font-bold text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB] bg-white">
                <tr>
                  <td className="p-3 font-mono text-[#526174]">01</td>
                  <td className="p-3 font-medium text-[#10233F]">{transaction.remarks}</td>
                  <td className="p-3 font-mono font-bold text-right">
                    ₹{(transaction.amount * 0.82).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-[#526174]">02</td>
                  <td className="p-3 font-medium text-[#10233F]">Digital Judicial Library & Case Law Repository Service</td>
                  <td className="p-3 font-mono font-bold text-right">
                    ₹{(transaction.amount * 0.18).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-[#FFF9EF] font-bold border-t-2 border-[#89190E]">
                <tr>
                  <td colSpan={2} className="p-3 text-right uppercase tracking-wider text-[#89190E]">
                    Total Amount Received
                  </td>
                  <td className="p-3 text-right font-mono text-base text-[#89190E]">
                    ₹{transaction.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Transaction Metadata & Bank Details */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#526174] pt-2">
            <div>
              <p>
                <strong>System Transaction Reference:</strong> {transaction.id}
              </p>
              <p>
                <strong>Course Validity Associated:</strong> {student.validUntil}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 text-center sm:text-right">
              <div className="inline-block border-b border-dashed border-[#89190E] pb-1 px-4 text-[#89190E] font-serif font-bold italic">
                Dean of Accounts & Admissions
              </div>
              <p className="text-[10px] text-[#526174] mt-1">
                MSI Group of Institutes Finance Cell
              </p>
            </div>
          </div>

          {/* Digital Verification Footer */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Cryptographically signed institutional receipt. No physical signature required.</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700 font-semibold">
              HASH-SHA256: 8F7E...2B91
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
