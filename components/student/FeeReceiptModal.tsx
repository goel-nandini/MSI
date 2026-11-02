'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Printer, Edit3, Check, RotateCcw, Plus, Trash2, Calculator } from 'lucide-react';
import { StudentProfile } from './data/studentMockData';

// --------------------------------------------------------------------------
// Number to Words Converter in Indian Currency Format
// --------------------------------------------------------------------------
export function numberToWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'RS- ZERO ONLY';

  const a = [
    '', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ',
    'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ',
    'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN ',
  ];
  const b = ['', '', 'TWENTY ', 'THIRTY ', 'FORTY ', 'FIFTY ', 'SIXTY ', 'SEVENTY ', 'EIGHTY ', 'NINETY '];

  function inWords(n: number): string {
    if (n === 0) return '';
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + 'CRORE ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + 'LAKH ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + 'THOUSAND ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + 'HUNDRED ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)];
        if (n % 10 > 0) str += a[n % 10];
      }
    }
    return str;
  }

  const parts = num.toFixed(2).split('.');
  const whole = parseInt(parts[0], 10) || 0;
  const decimal = parseInt(parts[1], 10) || 0;

  let words = inWords(whole).trim();
  if (!words) words = 'ZERO';

  if (decimal > 0) {
    words += ' AND ' + inWords(decimal).trim() + 'PAISE';
  }
  return 'RS- ' + words.trim() + ' ONLY';
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsn: string;
  qty: string;
  mrp: string;
  ntRate: string;
  txRate: string;
  disc: string;
  gstRate: string;
  amount: string;
}

export interface GSTInvoiceData {
  gstin: string;
  pan: string;
  instituteName: string;
  instituteAddress: string;
  contact: string;
  invoiceNo: string;
  invoiceDate: string;
  placeOfSupply: string;
  modeOfSupply: string;
  soldToName: string;
  addressLine1: string;
  addressLine2: string;
  buyerGst: string;
  buyerPhone: string;
  grMarka: string;
  poNo: string;
  poDate: string;
  remarks: string;
  items: InvoiceItem[];
  totalTaxable: string;
  totalPcs: string;
  totalAmount: string;
  taxGstRate: string;
  taxTaxable: string;
  taxSgst: string;
  taxCgst: string;
  taxIgst: string;
  taxCess: string;
  tcs: string;
  labour: string;
  freight: string;
  rndOff: string;
  discount: string;
  inWords: string;
  netAmount: string;
  terms: string[];
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
}

export interface FeeReceiptModalProps {
  transaction: any;
  student?: Partial<StudentProfile> | any;
  onClose: () => void;
}

export default function FeeReceiptModal({ transaction, student, onClose }: FeeReceiptModalProps) {
  if (!transaction) return null;

  // Format Date DD/MM/YYYY
  const getFormattedDate = () => {
    if (transaction.date && typeof transaction.date === 'string' && transaction.date.includes('/')) {
      return transaction.date;
    }
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateDefaults = (): GSTInvoiceData => {
    const rawAmt = Number(transaction.amount) || 20000;
    // Reverse calculation for 18% inclusive GST
    const taxableNum = Number((rawAmt / 1.18).toFixed(2));
    const gstTotal = Number((rawAmt - taxableNum).toFixed(2));
    const halfGst = Number((gstTotal / 2).toFixed(2));

    const invoiceNumber =
      transaction.receiptNo ||
      transaction.receiptNumber ||
      (transaction.id ? `MSI-${transaction.id.replace(/\D/g, '').slice(-4) || '65'}` : '65');

    // Build Buyer Full Line
    let buyer = '';
    if (student?.name) {
      buyer = student.name.toUpperCase();
      if (student.guardianName) {
        const relation = student.gender === 'Female' ? 'D/O' : 'S/O';
        buyer += ` ${relation} ${student.guardianName.toUpperCase()}`;
      }
      if (student.batch || student.courseTitle) {
        buyer += ` ${student.batch || student.courseTitle}`;
      }
    } else if (transaction.studentName) {
      buyer = transaction.studentName.toUpperCase();
      if (transaction.courseTitle) {
        buyer += ` ${transaction.courseTitle.toUpperCase()}`;
      }
    } else {
      buyer = 'SUKHMAN D/O GURPREET SINGH CLAT';
    }

    const itemDesc =
      transaction.courseTitle ||
      transaction.remarks ||
      student?.courseTitle ||
      student?.batch ||
      'CLAT (LLB)';

    return {
      gstin: '03AEQPE9376K2ZY',
      pan: 'AEQPE9376K',
      instituteName: 'MSI GROUP OF INSTITUTE',
      instituteAddress: 'MONGA CITY CENTRE, KHARAR LANDRAN ROAD, SEC-115, MOHALI, PUNJAB, 140301',
      contact: '7508420013,',
      invoiceNo: invoiceNumber,
      invoiceDate: getFormattedDate(),
      placeOfSupply: '03-PUNJAB',
      modeOfSupply: transaction.mode || transaction.paymentMethod || 'ONLINE / UPI',
      soldToName: buyer,
      addressLine1: student?.address || '#3007 GTB NAGAR',
      addressLine2: 'Khrar , PUNJAB- 140301',
      buyerGst: '',
      buyerPhone: student?.phone || transaction.studentPhone || '9463113195',
      grMarka: '',
      poNo: transaction.orderId || transaction.razorpayOrderId || '',
      poDate: '',
      remarks: transaction.remarks || '',
      items: [
        {
          id: '1',
          description: itemDesc,
          hsn: '999293',
          qty: '1PCS',
          mrp: '0.00',
          ntRate: rawAmt.toFixed(2),
          txRate: taxableNum.toFixed(2),
          disc: '',
          gstRate: '18%',
          amount: taxableNum.toFixed(2),
        },
      ],
      totalTaxable: taxableNum.toFixed(2),
      totalPcs: '1',
      totalAmount: taxableNum.toFixed(2),
      taxGstRate: '18',
      taxTaxable: taxableNum.toFixed(2),
      taxSgst: halfGst.toFixed(2),
      taxCgst: halfGst.toFixed(2),
      taxIgst: '0',
      taxCess: '0',
      tcs: '0.00',
      labour: '0.00',
      freight: '0.00',
      rndOff: '0.00',
      discount: '0.00',
      inWords: numberToWords(rawAmt),
      netAmount: rawAmt.toFixed(2),
      terms: [
        'ALL DISPUTES ARE SUBJECT TO CHANDIGARH JURISDICTION ONLY',
        'GOODS ONCE SOLD ARE NOT RETURNABLE .',
        'OUR RESPONSIBILTY CEASES THE MOMENT GOODS LEAVES OUR PREMISES.',
        '18% P.A. INTEREST WILL BE CHARGED IF BILL IS NOT PAID WITHIN 15 DAYS/DUE DATE.',
      ],
      bankName: 'AXIS BANK',
      bankAccount: '925020020559054',
      bankIfsc: 'UTIB00004866',
    };
  };

  const [invoice, setInvoice] = useState<GSTInvoiceData>(calculateDefaults());
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    setInvoice(calculateDefaults());
  }, [transaction, student]);

  // Recalculate GST & totals based on Net Amount
  const handleAutoCalculateFromNet = (customNetAmount?: number) => {
    const net = customNetAmount !== undefined ? customNetAmount : Number(invoice.netAmount) || 0;
    const taxableNum = Number((net / 1.18).toFixed(2));
    const gstTotal = Number((net - taxableNum).toFixed(2));
    const halfGst = Number((gstTotal / 2).toFixed(2));

    const updatedItems = invoice.items.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          ntRate: net.toFixed(2),
          txRate: taxableNum.toFixed(2),
          amount: taxableNum.toFixed(2),
        };
      }
      return item;
    });

    setInvoice((prev) => ({
      ...prev,
      items: updatedItems,
      totalTaxable: taxableNum.toFixed(2),
      totalAmount: taxableNum.toFixed(2),
      taxTaxable: taxableNum.toFixed(2),
      taxSgst: halfGst.toFixed(2),
      taxCgst: halfGst.toFixed(2),
      inWords: numberToWords(net),
      netAmount: net.toFixed(2),
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const updated = [...invoice.items];
    updated[index] = { ...updated[index], [field]: value };
    setInvoice((prev) => ({ ...prev, items: updated }));
  };

  const addItemRow = () => {
    const newItem: InvoiceItem = {
      id: String(invoice.items.length + 1),
      description: 'ADDITIONAL STUDY MATERIAL / LAB ACCESS',
      hsn: '999293',
      qty: '1PCS',
      mrp: '0.00',
      ntRate: '0.00',
      txRate: '0.00',
      disc: '',
      gstRate: '18%',
      amount: '0.00',
    };
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      totalPcs: String(prev.items.length + 1),
    }));
  };

  const removeItemRow = (index: number) => {
    if (invoice.items.length <= 1) return;
    const filtered = invoice.items.filter((_, idx) => idx !== index);
    setInvoice((prev) => ({
      ...prev,
      items: filtered,
      totalPcs: String(filtered.length),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-300">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-[#10233F] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#EFC988]/30">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-[#EFC988] font-bold uppercase tracking-wider">
              MSI Official GST Tax Invoice • Fee Receipt
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                isEditMode
                  ? 'bg-amber-400 text-gray-900 border-amber-300 font-bold shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Toggle editable fields"
            >
              {isEditMode ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-[#EFC988]" />}
              <span>{isEditMode ? 'Done Editing' : 'Edit Values'}</span>
            </button>

            {isEditMode && (
              <>
                <button
                  type="button"
                  onClick={() => handleAutoCalculateFromNet()}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Auto recalculate 18% GST (SGST 9% + CGST 9%) & in-words from Net Amount"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Auto Calc GST</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoice(calculateDefaults())}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Reset all values to original"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-300" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-[#89190E] hover:bg-[#68130B] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#EFC988]" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Edit Mode Notice Banner */}
        {isEditMode && (
          <div className="print:hidden bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
            <span>
              ✍️ <strong>Edit Mode Active:</strong> You can edit any value, student name, address, dates, amounts, or terms. Click <strong>&quot;Auto Calc GST&quot;</strong> anytime to recompute tax breakdown.
            </span>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="text-xs text-amber-800 underline font-semibold ml-2 cursor-pointer"
            >
              Preview Clean Print
            </button>
          </div>
        )}

        {/* Printable Invoice Container (Exact match to sample PDF) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white text-black font-sans">
          <div
            id="gst-fee-invoice-print-area"
            className="w-full mx-auto bg-white text-black border-2 border-black text-[12px] leading-tight select-text"
            style={{ maxWidth: '820px' }}
          >
            
            {/* ROW 1: TOP BAR WITH GST NO, GST INVOICE ORIGINAL, PAN NO */}
            <div className="grid grid-cols-3 items-center border-b border-black px-2 py-1 font-bold text-[11px] sm:text-[12px]">
              <div>
                GST NO:
                {isEditMode ? (
                  <input
                    type="text"
                    value={invoice.gstin}
                    onChange={(e) => setInvoice({ ...invoice, gstin: e.target.value })}
                    className="ml-1 border border-dashed border-gray-400 px-1 py-0.5 font-bold uppercase rounded text-[11px] w-36"
                  />
                ) : (
                  <span className="ml-1 font-mono">{invoice.gstin}</span>
                )}
              </div>
              <div className="text-center font-bold tracking-wider">
                GST INVOICE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ORIGINAL
              </div>
              <div className="text-right">
                PAN NO:
                {isEditMode ? (
                  <input
                    type="text"
                    value={invoice.pan}
                    onChange={(e) => setInvoice({ ...invoice, pan: e.target.value })}
                    className="ml-1 border border-dashed border-gray-400 px-1 py-0.5 font-bold uppercase rounded text-[11px] w-28 text-right"
                  />
                ) : (
                  <span className="ml-1 font-mono">{invoice.pan}</span>
                )}
              </div>
            </div>

            {/* ROW 2: INSTITUTE BRANDING HEADER WITH CREST */}
            <div className="flex items-center px-3 py-2 border-b border-black gap-3 sm:gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                <Image
                  src="/images/msi-crest.png"
                  alt="MSI Official Seal"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex-1 text-center pr-12 sm:pr-16">
                {isEditMode ? (
                  <input
                    type="text"
                    value={invoice.instituteName}
                    onChange={(e) => setInvoice({ ...invoice, instituteName: e.target.value })}
                    className="w-full text-center font-serif font-black text-xl sm:text-2xl text-[#89190E] tracking-wide border border-dashed border-gray-400 px-1"
                  />
                ) : (
                  <h1 className="font-serif font-black text-xl sm:text-2xl text-[#89190E] tracking-wide uppercase">
                    {invoice.instituteName}
                  </h1>
                )}

                {isEditMode ? (
                  <input
                    type="text"
                    value={invoice.instituteAddress}
                    onChange={(e) => setInvoice({ ...invoice, instituteAddress: e.target.value })}
                    className="w-full text-center text-[10px] sm:text-[11px] font-bold text-gray-800 border border-dashed border-gray-400 px-1 mt-0.5"
                  />
                ) : (
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-800 uppercase mt-0.5">
                    {invoice.instituteAddress}
                  </p>
                )}

                <div className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-0.5">
                  CONTACT:
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.contact}
                      onChange={(e) => setInvoice({ ...invoice, contact: e.target.value })}
                      className="ml-1 border border-dashed border-gray-400 px-1 text-[10px] font-bold w-40"
                    />
                  ) : (
                    <span className="ml-1">{invoice.contact}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 3: SOLD TO (LEFT) & INVOICE DETAILS (RIGHT) */}
            <div className="grid grid-cols-12 border-b border-black">
              {/* Left Column: SOLD TO & SHIPPED TO */}
              <div className="col-span-7 p-2 flex flex-col justify-between border-r border-black">
                <div>
                  <div className="font-bold text-[11px] sm:text-[12px] uppercase tracking-wide pb-1">
                    SOLD TO &amp; SHIPPED TO M/S:
                  </div>

                  {isEditMode ? (
                    <div className="space-y-1 mt-1">
                      <input
                        type="text"
                        placeholder="Student Name / Guardian / Batch"
                        value={invoice.soldToName}
                        onChange={(e) => setInvoice({ ...invoice, soldToName: e.target.value })}
                        className="w-full font-bold uppercase text-[12px] border border-dashed border-gray-400 px-1 py-0.5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={invoice.addressLine1}
                        onChange={(e) => setInvoice({ ...invoice, addressLine1: e.target.value })}
                        className="w-full text-[11px] border border-dashed border-gray-400 px-1 py-0.5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 / City / State"
                        value={invoice.addressLine2}
                        onChange={(e) => setInvoice({ ...invoice, addressLine2: e.target.value })}
                        className="w-full text-[11px] border border-dashed border-gray-400 px-1 py-0.5 rounded"
                      />
                    </div>
                  ) : (
                    <div className="font-bold text-[11px] sm:text-[12px] uppercase space-y-0.5 pt-0.5">
                      <div>{invoice.soldToName}</div>
                      <div>{invoice.addressLine1}</div>
                      <div>{invoice.addressLine2}</div>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-between items-center text-[11px] font-bold">
                  <div>
                    GST:
                    {isEditMode ? (
                      <input
                        type="text"
                        value={invoice.buyerGst}
                        onChange={(e) => setInvoice({ ...invoice, buyerGst: e.target.value })}
                        className="ml-1 border border-dashed border-gray-400 px-1 w-28 text-[11px]"
                      />
                    ) : (
                      <span className="ml-1">{invoice.buyerGst || ''}</span>
                    )}
                  </div>
                  <div>
                    PHONE:
                    {isEditMode ? (
                      <input
                        type="text"
                        value={invoice.buyerPhone}
                        onChange={(e) => setInvoice({ ...invoice, buyerPhone: e.target.value })}
                        className="ml-1 border border-dashed border-gray-400 px-1 w-28 text-[11px]"
                      />
                    ) : (
                      <span className="ml-1 font-mono">{invoice.buyerPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: INVOICE METADATA */}
              <div className="col-span-5 p-2 font-bold text-[11px] sm:text-[12px] space-y-1">
                <div className="flex">
                  <span className="w-36 shrink-0">INVOICE NO:</span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.invoiceNo}
                      onChange={(e) => setInvoice({ ...invoice, invoiceNo: e.target.value })}
                      className="border border-dashed border-gray-400 px-1 py-0.5 font-mono text-[11px] w-full"
                    />
                  ) : (
                    <span className="font-mono">{invoice.invoiceNo}</span>
                  )}
                </div>

                <div className="flex">
                  <span className="w-36 shrink-0">INVOICE DT:</span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.invoiceDate}
                      onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
                      className="border border-dashed border-gray-400 px-1 py-0.5 font-mono text-[11px] w-full"
                    />
                  ) : (
                    <span className="font-mono">{invoice.invoiceDate}</span>
                  )}
                </div>

                <div className="flex">
                  <span className="w-36 shrink-0">PLACE OF SUPPLY:</span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.placeOfSupply}
                      onChange={(e) => setInvoice({ ...invoice, placeOfSupply: e.target.value })}
                      className="border border-dashed border-gray-400 px-1 py-0.5 text-[11px] w-full"
                    />
                  ) : (
                    <span>{invoice.placeOfSupply}</span>
                  )}
                </div>

                <div className="flex">
                  <span className="w-36 shrink-0">MODE OF SUPPLY:</span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.modeOfSupply}
                      onChange={(e) => setInvoice({ ...invoice, modeOfSupply: e.target.value })}
                      className="border border-dashed border-gray-400 px-1 py-0.5 text-[11px] w-full"
                    />
                  ) : (
                    <span>{invoice.modeOfSupply}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 4: GR/MARKA, PO NO, PO DT, REMARKS */}
            <div className="border-b border-black px-2 py-1 text-[11px] font-bold">
              <div className="grid grid-cols-12 gap-2 pb-0.5">
                <div className="col-span-4 flex items-center">
                  <span>GR/MARKA:</span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.grMarka}
                      onChange={(e) => setInvoice({ ...invoice, grMarka: e.target.value })}
                      className="ml-1 border border-dashed border-gray-400 px-1 w-full text-[10px]"
                    />
                  ) : (
                    <span className="ml-1 font-mono">{invoice.grMarka}</span>
                  )}
                </div>
                <div className="col-span-4 flex items-center">
                  <span>PO NO:</span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.poNo}
                      onChange={(e) => setInvoice({ ...invoice, poNo: e.target.value })}
                      className="ml-1 border border-dashed border-gray-400 px-1 w-full text-[10px]"
                    />
                  ) : (
                    <span className="ml-1 font-mono">{invoice.poNo}</span>
                  )}
                </div>
                <div className="col-span-4 flex items-center">
                  <span>PO DT:</span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.poDate}
                      onChange={(e) => setInvoice({ ...invoice, poDate: e.target.value })}
                      className="ml-1 border border-dashed border-gray-400 px-1 w-full text-[10px]"
                    />
                  ) : (
                    <span className="ml-1 font-mono">{invoice.poDate}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center pt-0.5">
                <span>REMARKS:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={invoice.remarks}
                    onChange={(e) => setInvoice({ ...invoice, remarks: e.target.value })}
                    className="ml-1 border border-dashed border-gray-400 px-1 w-full text-[10px]"
                  />
                ) : (
                  <span className="ml-1 font-normal uppercase">{invoice.remarks}</span>
                )}
              </div>
            </div>

            {/* ROW 5: MAIN ITEMS TABLE */}
            <div className="border-b border-black">
              <table className="w-full border-collapse text-left text-[11px] sm:text-[12px]">
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[10px] sm:text-[11px] text-center">
                    <th className="border-r border-black py-1 px-1 w-8">SN</th>
                    <th className="border-r border-black py-1 px-2 text-left">ITEM WITH DESCRIPTION</th>
                    <th className="border-r border-black py-1 px-1 w-16">HSN</th>
                    <th className="border-r border-black py-1 px-1 w-12">QTY</th>
                    <th className="border-r border-black py-1 px-1 w-14">MRP</th>
                    <th className="border-r border-black py-1 px-1 w-20">NT_RATE</th>
                    <th className="border-r border-black py-1 px-1 w-20">TX_RATE</th>
                    <th className="border-r border-black py-1 px-1 w-12">DISC</th>
                    <th className="border-r border-black py-1 px-1 w-10">GST</th>
                    <th className="py-1 px-2 w-20 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="font-bold text-[11px] align-top">
                      <td className="border-r border-black py-1.5 px-1 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="border-r border-black py-1.5 px-2">
                        {isEditMode ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              className="w-full border border-dashed border-gray-400 px-1 py-0.5 uppercase text-[11px]"
                            />
                            {invoice.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(idx)}
                                className="text-red-500 hover:text-red-700 p-0.5"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="uppercase">{item.description}</span>
                        )}
                      </td>
                      <td className="border-r border-black py-1.5 px-1 text-center font-mono">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                            className="w-full text-center border border-dashed border-gray-400 px-0.5 text-[10px]"
                          />
                        ) : (
                          item.hsn
                        )}
                      </td>
                      <td className="border-r border-black py-1.5 px-1 text-center uppercase font-mono">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            className="w-full text-center border border-dashed border-gray-400 px-0.5 text-[10px]"
                          />
                        ) : (
                          item.qty
                        )}
                      </td>
                      <td className="border-r border-black py-1.5 px-1 text-right font-mono">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.mrp}
                            onChange={(e) => handleItemChange(idx, 'mrp', e.target.value)}
                            className="w-full text-right border border-dashed border-gray-400 px-0.5 text-[10px]"
                          />
                        ) : (
                          item.mrp
                        )}
                      </td>
                      <td className="border-r border-black py-1.5 px-1 text-right font-mono">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.ntRate}
                            onChange={(e) => handleItemChange(idx, 'ntRate', e.target.value)}
                            className="w-full text-right border border-dashed border-gray-400 px-0.5 text-[10px]"
                          />
                        ) : (
                          item.ntRate
                        )}
                      </td>
                      <td className="border-r border-black py-1.5 px-1 text-right font-mono">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.txRate}
                            onChange={(e) => handleItemChange(idx, 'txRate', e.target.value)}
                            className="w-full text-right border border-dashed border-gray-400 px-0.5 text-[10px]"
                          />
                        ) : (
                          item.txRate
                        )}
                      </td>
                      <td className="border-r border-black py-1.5 px-1 text-center font-mono">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.disc}
                            onChange={(e) => handleItemChange(idx, 'disc', e.target.value)}
                            className="w-full text-center border border-dashed border-gray-400 px-0.5 text-[10px]"
                          />
                        ) : (
                          item.disc
                        )}
                      </td>
                      <td className="border-r border-black py-1.5 px-1 text-center font-mono">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.gstRate}
                            onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                            className="w-full text-center border border-dashed border-gray-400 px-0.5 text-[10px]"
                          />
                        ) : (
                          item.gstRate
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.amount}
                            onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                            className="w-full text-right border border-dashed border-gray-400 px-0.5 text-[10px]"
                          />
                        ) : (
                          item.amount
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Empty Spacer Rows to match original invoice height */}
                  <tr style={{ height: '70px' }}>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>
                </tbody>

                {/* Sub-Total Row */}
                <tfoot>
                  <tr className="border-t border-black font-bold text-[11px]">
                    <td colSpan={3} className="border-r border-black py-1 px-2 text-center uppercase tracking-wider">
                      TOTAL
                    </td>
                    <td className="border-r border-black py-1 px-1 text-center font-mono uppercase">
                      PCS:{invoice.totalPcs}
                    </td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black py-1 px-1 text-right font-mono">
                      {invoice.totalTaxable}
                    </td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="py-1 px-2 text-right font-mono">
                      {invoice.totalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {isEditMode && (
                <div className="print:hidden p-1.5 bg-gray-50 border-t border-dashed border-gray-300 text-center">
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item / Service Row</span>
                  </button>
                </div>
              )}
            </div>

            {/* ROW 6: TAX BREAKDOWN TABLE (LEFT) & OTHER CHARGES (RIGHT) */}
            <div className="grid grid-cols-12 border-b border-black">
              {/* Left Side: Tax Breakdown */}
              <div className="col-span-6 border-r border-black">
                <table className="w-full border-collapse text-center text-[10px] sm:text-[11px] font-bold">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="border-r border-black py-1 px-1">GST</th>
                      <th className="border-r border-black py-1 px-1">TAXABLE</th>
                      <th className="border-r border-black py-1 px-1">SGST</th>
                      <th className="border-r border-black py-1 px-1">CGST</th>
                      <th className="border-r border-black py-1 px-1">IGST</th>
                      <th className="py-1 px-1">CESS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-mono">
                      <td className="border-r border-black py-1 px-1">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={invoice.taxGstRate}
                            onChange={(e) => setInvoice({ ...invoice, taxGstRate: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[10px]"
                          />
                        ) : (
                          invoice.taxGstRate
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={invoice.taxTaxable}
                            onChange={(e) => setInvoice({ ...invoice, taxTaxable: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[10px]"
                          />
                        ) : (
                          invoice.taxTaxable
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={invoice.taxSgst}
                            onChange={(e) => setInvoice({ ...invoice, taxSgst: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[10px]"
                          />
                        ) : (
                          invoice.taxSgst
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={invoice.taxCgst}
                            onChange={(e) => setInvoice({ ...invoice, taxCgst: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[10px]"
                          />
                        ) : (
                          invoice.taxCgst
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={invoice.taxIgst}
                            onChange={(e) => setInvoice({ ...invoice, taxIgst: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[10px]"
                          />
                        ) : (
                          invoice.taxIgst
                        )}
                      </td>
                      <td className="py-1 px-1">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={invoice.taxCess}
                            onChange={(e) => setInvoice({ ...invoice, taxCess: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[10px]"
                          />
                        ) : (
                          invoice.taxCess
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Side: Additional Charges & Tax Sums */}
              <div className="col-span-6 p-1 text-[11px] font-bold">
                <div className="grid grid-cols-2 gap-x-2">
                  <div className="flex justify-between">
                    <span>TCS</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={invoice.tcs}
                        onChange={(e) => setInvoice({ ...invoice, tcs: e.target.value })}
                        className="w-16 text-right border border-dashed border-gray-400 text-[10px]"
                      />
                    ) : (
                      <span className="font-mono">{invoice.tcs}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>DISCOUNT</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={invoice.discount}
                        onChange={(e) => setInvoice({ ...invoice, discount: e.target.value })}
                        className="w-16 text-right border border-dashed border-gray-400 text-[10px]"
                      />
                    ) : (
                      <span className="font-mono">{invoice.discount}</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span>LABOUR</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={invoice.labour}
                        onChange={(e) => setInvoice({ ...invoice, labour: e.target.value })}
                        className="w-16 text-right border border-dashed border-gray-400 text-[10px]"
                      />
                    ) : (
                      <span className="font-mono">{invoice.labour}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>SGST</span>
                    <span className="font-mono">{invoice.taxSgst}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>FRIEIGHT</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={invoice.freight}
                        onChange={(e) => setInvoice({ ...invoice, freight: e.target.value })}
                        className="w-16 text-right border border-dashed border-gray-400 text-[10px]"
                      />
                    ) : (
                      <span className="font-mono">{invoice.freight}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>CGST</span>
                    <span className="font-mono">{invoice.taxCgst}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>RND OFF</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={invoice.rndOff}
                        onChange={(e) => setInvoice({ ...invoice, rndOff: e.target.value })}
                        className="w-16 text-right border border-dashed border-gray-400 text-[10px]"
                      />
                    ) : (
                      <span className="font-mono">{invoice.rndOff}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>IGST</span>
                    <span className="font-mono">{invoice.taxIgst}</span>
                  </div>

                  <div className="col-start-2 flex justify-between">
                    <span>CESS</span>
                    <span className="font-mono">{invoice.taxCess}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 7: IN WORDS & NET AMOUNT */}
            <div className="grid grid-cols-12 items-center border-b border-black px-2 py-1.5 font-bold">
              <div className="col-span-8 text-[11px] sm:text-[12px] uppercase">
                IN WORDS:
                {isEditMode ? (
                  <input
                    type="text"
                    value={invoice.inWords}
                    onChange={(e) => setInvoice({ ...invoice, inWords: e.target.value })}
                    className="ml-1 border border-dashed border-gray-400 px-1 py-0.5 text-[11px] w-4/5 uppercase font-bold"
                  />
                ) : (
                  <span className="ml-1 font-bold">{invoice.inWords}</span>
                )}
              </div>
              <div className="col-span-4 text-right flex justify-end items-center gap-2">
                <span className="text-[12px] sm:text-[13px] uppercase tracking-wider">NET-AMOUNT</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={invoice.netAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInvoice({ ...invoice, netAmount: val });
                      const num = parseFloat(val);
                      if (!isNaN(num) && num > 0) {
                        handleAutoCalculateFromNet(num);
                      }
                    }}
                    className="border border-dashed border-gray-400 px-1 py-0.5 font-mono text-[14px] font-black w-28 text-right"
                  />
                ) : (
                  <span className="font-mono font-black text-sm sm:text-base">{invoice.netAmount}</span>
                )}
              </div>
            </div>

            {/* ROW 8: BOTTOM THREE BOXES (TERMS, BANK, SIGNATURE) */}
            <div className="grid grid-cols-12 min-h-[110px]">
              {/* Left Box: Terms & Conditions */}
              <div className="col-span-6 p-2 border-r border-black flex flex-col justify-between">
                <div>
                  <div className="font-bold text-[11px] uppercase pb-1">
                    TERMS &amp; CONDITIONS:
                  </div>
                  <ul className="text-[9px] sm:text-[10px] space-y-0.5 font-semibold text-gray-900 leading-tight">
                    {invoice.terms.map((term, idx) => (
                      <li key={idx}>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={term}
                            onChange={(e) => {
                              const updated = [...invoice.terms];
                              updated[idx] = e.target.value;
                              setInvoice({ ...invoice, terms: updated });
                            }}
                            className="w-full border border-dashed border-gray-300 px-0.5 text-[9px]"
                          />
                        ) : (
                          term
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Middle Box: Bank Details */}
              <div className="col-span-3 p-2 border-r border-black text-[10px] sm:text-[11px] font-bold space-y-1">
                <div>BANK DETAILS :</div>
                <div>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.bankName}
                      onChange={(e) => setInvoice({ ...invoice, bankName: e.target.value })}
                      className="border border-dashed border-gray-300 px-1 text-[10px] w-full"
                    />
                  ) : (
                    <span>{invoice.bankName}</span>
                  )}
                </div>
                <div>
                  A/C:
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.bankAccount}
                      onChange={(e) => setInvoice({ ...invoice, bankAccount: e.target.value })}
                      className="border border-dashed border-gray-300 px-1 text-[10px] font-mono w-full"
                    />
                  ) : (
                    <span className="font-mono">{invoice.bankAccount}</span>
                  )}
                </div>
                <div>
                  IFSC:
                  {isEditMode ? (
                    <input
                      type="text"
                      value={invoice.bankIfsc}
                      onChange={(e) => setInvoice({ ...invoice, bankIfsc: e.target.value })}
                      className="border border-dashed border-gray-300 px-1 text-[10px] font-mono w-full"
                    />
                  ) : (
                    <span className="font-mono">{invoice.bankIfsc}</span>
                  )}
                </div>
              </div>

              {/* Right Box: Authorised Signatory */}
              <div className="col-span-3 p-2 flex flex-col justify-between text-right">
                <div className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wide">
                  FOR {invoice.instituteName}
                </div>
                <div className="pt-8 font-bold text-[11px] text-right">
                  Authorised.Signatory
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Embedded Print Styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #gst-fee-invoice-print-area,
          #gst-fee-invoice-print-area * {
            visibility: visible !important;
          }
          #gst-fee-invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}
