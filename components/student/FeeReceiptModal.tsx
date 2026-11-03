'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Printer, Edit3, Check, RotateCcw, Plus, Trash2, Calculator, Download } from 'lucide-react';
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
    words += ' AND ' + inWords(decimal).trim() + ' PAISE';
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
  allowEdit?: boolean;
  onClose: () => void;
}

export default function FeeReceiptModal({
  transaction,
  student,
  allowEdit = false,
  onClose,
}: FeeReceiptModalProps) {
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
  const printAreaRef = useRef<HTMLDivElement>(null);
  const canEdit = false;

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

  /**
   * Guaranteed 1-Page Print / PDF Engine
   * Opens an isolated iframe with exact A4 portrait dimensions and no app clutter.
   * Fits 100% on a single sheet.
   */
  const handlePrintSingleSheet = () => {
    // Logo absolute URL so it renders in print iframe
    const logoUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/images/msi-crest.png`
        : '/images/msi-crest.png';

    const itemsHtml = invoice.items
      .map(
        (item, idx) => `
      <tr style="font-size:10px; font-weight:bold; vertical-align:top;">
        <td style="border-right:1px solid #000; padding:3px 2px; text-align:center;">${idx + 1}</td>
        <td style="border-right:1px solid #000; padding:3px 4px; text-align:left; text-transform:uppercase;">${item.description}</td>
        <td style="border-right:1px solid #000; padding:3px 2px; text-align:center;">${item.hsn}</td>
        <td style="border-right:1px solid #000; padding:3px 2px; text-align:center;">${item.qty}</td>
        <td style="border-right:1px solid #000; padding:3px 2px; text-align:right;">${item.mrp}</td>
        <td style="border-right:1px solid #000; padding:3px 2px; text-align:right;">${item.ntRate}</td>
        <td style="border-right:1px solid #000; padding:3px 2px; text-align:right;">${item.txRate}</td>
        <td style="border-right:1px solid #000; padding:3px 2px; text-align:center;">${item.disc || ''}</td>
        <td style="border-right:1px solid #000; padding:3px 2px; text-align:center;">${item.gstRate}</td>
        <td style="padding:3px 4px; text-align:right;">${item.amount}</td>
      </tr>`
      )
      .join('');

    const termsHtml = invoice.terms
      .map((t) => `<li style="margin-bottom:1px;">${t}</li>`)
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>GST_Fee_Invoice_${invoice.invoiceNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 4mm 6mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      line-height: 1.2;
    }
    .invoice-card {
      width: 100%;
      max-width: 195mm;
      margin: 0 auto;
      border: 1.5px solid #000;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .b-b { border-bottom: 1px solid #000; }
    .b-r { border-right: 1px solid #000; }
    .b-t { border-top: 1px solid #000; }
    .row { display: flex; width: 100%; }
    .col { flex: 1; }
  </style>
</head>
<body>
  <div class="invoice-card">
    
    <!-- TOP BAR -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; font-weight:bold; font-size:10px; border-bottom:1px solid #000;">
      <div>GST NO: <span style="font-family:monospace;">${invoice.gstin}</span></div>
      <div style="text-align:center; letter-spacing:1px;">GST INVOICE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ORIGINAL</div>
      <div style="text-align:right;">PAN NO: <span style="font-family:monospace;">${invoice.pan}</span></div>
    </div>

    <!-- INSTITUTE HEADER WITH LOGO -->
    <div style="display:flex; align-items:center; padding:4px 8px; border-bottom:1px solid #000;">
      <div style="width:62px; height:62px; flex-shrink:0; margin-right:10px;">
        <img src="${logoUrl}" alt="MSI Seal" style="width:100%; height:100%; object-fit:contain;" />
      </div>
      <div style="flex:1; text-align:center; padding-right:50px;">
        <div style="font-family:Georgia, serif; font-size:20px; font-weight:900; color:#89190E; letter-spacing:0.5px; text-transform:uppercase;">
          ${invoice.instituteName}
        </div>
        <div style="font-size:9.5px; font-weight:bold; color:#1a1a1a; margin-top:1px; text-transform:uppercase;">
          ${invoice.instituteAddress}
        </div>
        <div style="font-size:9.5px; font-weight:bold; color:#1a1a1a; margin-top:1px;">
          CONTACT: ${invoice.contact}
        </div>
      </div>
    </div>

    <!-- SOLD TO & INVOICE DETAILS -->
    <div style="display:flex; border-bottom:1px solid #000;">
      <div style="flex:6.5; padding:4px 6px; border-right:1px solid #000; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-weight:bold; font-size:10.5px; text-transform:uppercase; margin-bottom:2px;">
            SOLD TO &amp; SHIPPED TO M/S:
          </div>
          <div style="font-weight:bold; font-size:10.5px; text-transform:uppercase; line-height:1.25;">
            <div>${invoice.soldToName}</div>
            <div>${invoice.addressLine1}</div>
            <div>${invoice.addressLine2}</div>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:9.5px; margin-top:4px;">
          <div>GST: <span>${invoice.buyerGst || ''}</span></div>
          <div>PHONE: <span style="font-family:monospace;">${invoice.buyerPhone}</span></div>
        </div>
      </div>

      <div style="flex:4.5; padding:4px 6px; font-weight:bold; font-size:10px; line-height:1.45;">
        <div style="display:flex; justify-content:space-between;">
          <span>INVOICE NO:</span>
          <span style="font-family:monospace;">${invoice.invoiceNo}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>INVOICE DT:</span>
          <span style="font-family:monospace;">${invoice.invoiceDate}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>PLACE OF SUPPLY:</span>
          <span>${invoice.placeOfSupply}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>MODE OF SUPPLY:</span>
          <span>${invoice.modeOfSupply}</span>
        </div>
      </div>
    </div>

    <!-- GR/MARKA & REMARKS -->
    <div style="padding:2px 6px; border-bottom:1px solid #000; font-size:9.5px; font-weight:bold;">
      <div style="display:flex; justify-content:space-between; margin-bottom:1px;">
        <div style="flex:1;">GR/MARKA: <span style="font-family:monospace;">${invoice.grMarka || ''}</span></div>
        <div style="flex:1;">PO NO: <span style="font-family:monospace;">${invoice.poNo || ''}</span></div>
        <div style="flex:1;">PO DT: <span style="font-family:monospace;">${invoice.poDate || ''}</span></div>
      </div>
      <div>
        REMARKS: <span style="font-weight:normal; text-transform:uppercase;">${invoice.remarks || ''}</span>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <div style="border-bottom:1px solid #000;">
      <table>
        <thead>
          <tr style="border-bottom:1px solid #000; font-size:9.5px; font-weight:bold; text-transform:uppercase; text-align:center; background:#fafafa;">
            <th style="border-right:1px solid #000; padding:2.5px 2px; width:26px;">SN</th>
            <th style="border-right:1px solid #000; padding:2.5px 4px; text-align:left;">ITEM WITH DESCRIPTION</th>
            <th style="border-right:1px solid #000; padding:2.5px 2px; width:52px;">HSN</th>
            <th style="border-right:1px solid #000; padding:2.5px 2px; width:36px;">QTY</th>
            <th style="border-right:1px solid #000; padding:2.5px 2px; width:44px; text-align:right;">MRP</th>
            <th style="border-right:1px solid #000; padding:2.5px 2px; width:58px; text-align:right;">NT_RATE</th>
            <th style="border-right:1px solid #000; padding:2.5px 2px; width:58px; text-align:right;">TX_RATE</th>
            <th style="border-right:1px solid #000; padding:2.5px 2px; width:34px;">DISC</th>
            <th style="border-right:1px solid #000; padding:2.5px 2px; width:34px;">GST</th>
            <th style="padding:2.5px 4px; width:65px; text-align:right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <!-- Spacer row to maintain official layout height without overflowing -->
          <tr style="height:36px;">
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="border-top:1px solid #000; font-size:10px; font-weight:bold;">
            <td colspan="3" style="border-right:1px solid #000; padding:2.5px 4px; text-align:center; text-transform:uppercase;">TOTAL</td>
            <td style="border-right:1px solid #000; padding:2.5px 2px; text-align:center; font-family:monospace;">PCS:${invoice.totalPcs}</td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000; padding:2.5px 2px; text-align:right; font-family:monospace;">${invoice.totalTaxable}</td>
            <td style="border-right:1px solid #000;"></td>
            <td style="border-right:1px solid #000;"></td>
            <td style="padding:2.5px 4px; text-align:right; font-family:monospace;">${invoice.totalAmount}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- TAX BREAKDOWN & CHARGES -->
    <div style="display:flex; border-bottom:1px solid #000;">
      <!-- Tax Left Subtable -->
      <div style="flex:1; border-right:1px solid #000;">
        <table>
          <thead>
            <tr style="border-bottom:1px solid #000; font-size:9.5px; font-weight:bold; text-align:center; background:#fafafa;">
              <th style="border-right:1px solid #000; padding:2px;">GST</th>
              <th style="border-right:1px solid #000; padding:2px;">TAXABLE</th>
              <th style="border-right:1px solid #000; padding:2px;">SGST</th>
              <th style="border-right:1px solid #000; padding:2px;">CGST</th>
              <th style="border-right:1px solid #000; padding:2px;">IGST</th>
              <th style="padding:2px;">CESS</th>
            </tr>
          </thead>
          <tbody>
            <tr style="font-size:9.5px; font-weight:bold; font-family:monospace; text-align:center;">
              <td style="border-right:1px solid #000; padding:3px 1px;">${invoice.taxGstRate}</td>
              <td style="border-right:1px solid #000; padding:3px 1px;">${invoice.taxTaxable}</td>
              <td style="border-right:1px solid #000; padding:3px 1px;">${invoice.taxSgst}</td>
              <td style="border-right:1px solid #000; padding:3px 1px;">${invoice.taxCgst}</td>
              <td style="border-right:1px solid #000; padding:3px 1px;">${invoice.taxIgst}</td>
              <td style="padding:3px 1px;">${invoice.taxCess}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Charges Right Summary -->
      <div style="flex:1; padding:2px 6px; font-size:9.5px; font-weight:bold;">
        <table style="width:100%;">
          <tr>
            <td style="width:30%;">TCS</td>
            <td style="width:20%; text-align:right; font-family:monospace;">${invoice.tcs}</td>
            <td style="width:30%; padding-left:10px;">DISCOUNT</td>
            <td style="width:20%; text-align:right; font-family:monospace;">${invoice.discount}</td>
          </tr>
          <tr>
            <td>LABOUR</td>
            <td style="text-align:right; font-family:monospace;">${invoice.labour}</td>
            <td style="padding-left:10px;">SGST</td>
            <td style="text-align:right; font-family:monospace;">${invoice.taxSgst}</td>
          </tr>
          <tr>
            <td>FRIEIGHT</td>
            <td style="text-align:right; font-family:monospace;">${invoice.freight}</td>
            <td style="padding-left:10px;">CGST</td>
            <td style="text-align:right; font-family:monospace;">${invoice.taxCgst}</td>
          </tr>
          <tr>
            <td>RND OFF</td>
            <td style="text-align:right; font-family:monospace;">${invoice.rndOff}</td>
            <td style="padding-left:10px;">IGST</td>
            <td style="text-align:right; font-family:monospace;">${invoice.taxIgst}</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td style="padding-left:10px;">CESS</td>
            <td style="text-align:right; font-family:monospace;">${invoice.taxCess}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- IN WORDS & NET AMOUNT -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-bottom:1px solid #000; font-size:10px; font-weight:bold;">
      <div style="text-transform:uppercase; flex:1;">
        IN WORDS: <span>${invoice.inWords}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:10.5px; text-transform:uppercase; letter-spacing:0.5px;">NET-AMOUNT</span>
        <span style="font-family:monospace; font-size:13px; font-weight:900;">${invoice.netAmount}</span>
      </div>
    </div>

    <!-- FOOTER: TERMS, BANK, SIGNATURE -->
    <div style="display:flex; min-height:80px;">
      <!-- Terms -->
      <div style="flex:5.5; padding:3px 6px; border-right:1px solid #000; font-size:8.5px; line-height:1.2;">
        <div style="font-weight:bold; text-transform:uppercase; margin-bottom:1px;">TERMS &amp; CONDITIONS:</div>
        <ul style="margin:0; padding-left:14px; font-weight:bold;">
          ${termsHtml}
        </ul>
      </div>

      <!-- Bank -->
      <div style="flex:3; padding:3px 6px; border-right:1px solid #000; font-size:9px; font-weight:bold; line-height:1.3;">
        <div>BANK DETAILS :</div>
        <div style="margin-top:1px;">${invoice.bankName}</div>
        <div>A/C:<span style="font-family:monospace;">${invoice.bankAccount}</span></div>
        <div>IFSC:<span style="font-family:monospace;">${invoice.bankIfsc}</span></div>
      </div>

      <!-- Signatory -->
      <div style="flex:3.5; padding:3px 6px; display:flex; flex-direction:column; justify-content:space-between; text-align:right;">
        <div style="font-weight:bold; font-size:9.5px; text-transform:uppercase;">
          FOR ${invoice.instituteName}
        </div>
        <div style="font-weight:bold; font-size:9.5px; margin-top:28px;">
          Authorised.Signatory
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const img = doc.querySelector('img');
    const trigger = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (_) {
        window.print();
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (_) {}
      }, 3000);
    };

    if (img && !img.complete) {
      img.onload = trigger;
      img.onerror = trigger;
    } else {
      setTimeout(trigger, 250);
    }
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
              Official Institutional E-Receipt • Verified Authenticity
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrintSingleSheet}
              className="px-3.5 py-1.5 rounded-lg bg-[#89190E] hover:bg-[#68130B] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
              title="Print or Save PDF on a single A4 sheet"
            >
              <Printer className="w-3.5 h-3.5 text-[#EFC988]" />
              <span>Print / Download Single Sheet</span>
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

        {/* Live Invoice Preview (Exact visual match to sample PDF) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-100 text-black font-sans flex justify-center">
          <div
            id="gst-fee-invoice-print-area"
            ref={printAreaRef}
            className="w-full bg-white text-black border-2 border-black text-[11px] leading-tight select-text shadow-sm"
            style={{ maxWidth: '780px' }}
          >
            
            {/* ROW 1: TOP BAR WITH GST NO, GST INVOICE ORIGINAL, PAN NO */}
            <div className="grid grid-cols-3 items-center border-b border-black px-2 py-1 font-bold text-[10px] sm:text-[11px]">
              <div>
                GST NO:
                {canEdit ? (
                  <input
                    type="text"
                    value={invoice.gstin}
                    onChange={(e) => setInvoice({ ...invoice, gstin: e.target.value })}
                    className="ml-1 border border-dashed border-gray-400 px-1 py-0.5 font-bold uppercase rounded text-[10px] w-32"
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
                {canEdit ? (
                  <input
                    type="text"
                    value={invoice.pan}
                    onChange={(e) => setInvoice({ ...invoice, pan: e.target.value })}
                    className="ml-1 border border-dashed border-gray-400 px-1 py-0.5 font-bold uppercase rounded text-[10px] w-28 text-right"
                  />
                ) : (
                  <span className="ml-1 font-mono">{invoice.pan}</span>
                )}
              </div>
            </div>

            {/* ROW 2: INSTITUTE BRANDING HEADER WITH CREST */}
            <div className="flex items-center px-3 py-1.5 border-b border-black gap-3 sm:gap-4">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                <Image
                  src="/images/msi-crest.png"
                  alt="MSI Official Seal"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex-1 text-center pr-10 sm:pr-14">
                {canEdit ? (
                  <input
                    type="text"
                    value={invoice.instituteName}
                    onChange={(e) => setInvoice({ ...invoice, instituteName: e.target.value })}
                    className="w-full text-center font-serif font-black text-lg sm:text-xl text-[#89190E] tracking-wide border border-dashed border-gray-400 px-1"
                  />
                ) : (
                  <h1 className="font-serif font-black text-lg sm:text-xl text-[#89190E] tracking-wide uppercase">
                    {invoice.instituteName}
                  </h1>
                )}

                {canEdit ? (
                  <input
                    type="text"
                    value={invoice.instituteAddress}
                    onChange={(e) => setInvoice({ ...invoice, instituteAddress: e.target.value })}
                    className="w-full text-center text-[9.5px] sm:text-[10px] font-bold text-gray-800 border border-dashed border-gray-400 px-1 mt-0.5"
                  />
                ) : (
                  <p className="text-[9.5px] sm:text-[10px] font-bold text-gray-800 uppercase mt-0.5">
                    {invoice.instituteAddress}
                  </p>
                )}

                <div className="text-[9.5px] sm:text-[10px] font-bold text-gray-800 mt-0.5">
                  CONTACT:
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.contact}
                      onChange={(e) => setInvoice({ ...invoice, contact: e.target.value })}
                      className="ml-1 border border-dashed border-gray-400 px-1 text-[9.5px] font-bold w-36"
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
                  <div className="font-bold text-[10.5px] sm:text-[11px] uppercase tracking-wide pb-0.5">
                    SOLD TO &amp; SHIPPED TO M/S:
                  </div>

                  {canEdit ? (
                    <div className="space-y-1 mt-0.5">
                      <input
                        type="text"
                        placeholder="Student Name / Guardian / Batch"
                        value={invoice.soldToName}
                        onChange={(e) => setInvoice({ ...invoice, soldToName: e.target.value })}
                        className="w-full font-bold uppercase text-[11px] border border-dashed border-gray-400 px-1 py-0.5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={invoice.addressLine1}
                        onChange={(e) => setInvoice({ ...invoice, addressLine1: e.target.value })}
                        className="w-full text-[10px] border border-dashed border-gray-400 px-1 py-0.5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 / City / State"
                        value={invoice.addressLine2}
                        onChange={(e) => setInvoice({ ...invoice, addressLine2: e.target.value })}
                        className="w-full text-[10px] border border-dashed border-gray-400 px-1 py-0.5 rounded"
                      />
                    </div>
                  ) : (
                    <div className="font-bold text-[10.5px] sm:text-[11px] uppercase space-y-0.5 pt-0.5">
                      <div>{invoice.soldToName}</div>
                      <div>{invoice.addressLine1}</div>
                      <div>{invoice.addressLine2}</div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] font-bold">
                  <div>
                    GST:
                    {canEdit ? (
                      <input
                        type="text"
                        value={invoice.buyerGst}
                        onChange={(e) => setInvoice({ ...invoice, buyerGst: e.target.value })}
                        className="ml-1 border border-dashed border-gray-400 px-1 w-24 text-[10px]"
                      />
                    ) : (
                      <span className="ml-1">{invoice.buyerGst || ''}</span>
                    )}
                  </div>
                  <div>
                    PHONE:
                    {canEdit ? (
                      <input
                        type="text"
                        value={invoice.buyerPhone}
                        onChange={(e) => setInvoice({ ...invoice, buyerPhone: e.target.value })}
                        className="ml-1 border border-dashed border-gray-400 px-1 w-24 text-[10px]"
                      />
                    ) : (
                      <span className="ml-1 font-mono">{invoice.buyerPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: INVOICE METADATA */}
              <div className="col-span-5 p-2 font-bold text-[10.5px] sm:text-[11px] space-y-0.5">
                <div className="flex">
                  <span className="w-32 shrink-0">INVOICE NO:</span>
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.invoiceNo}
                      onChange={(e) => setInvoice({ ...invoice, invoiceNo: e.target.value })}
                      className="border border-dashed border-gray-400 px-1 font-mono text-[10px] w-full"
                    />
                  ) : (
                    <span className="font-mono">{invoice.invoiceNo}</span>
                  )}
                </div>

                <div className="flex">
                  <span className="w-32 shrink-0">INVOICE DT:</span>
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.invoiceDate}
                      onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
                      className="border border-dashed border-gray-400 px-1 font-mono text-[10px] w-full"
                    />
                  ) : (
                    <span className="font-mono">{invoice.invoiceDate}</span>
                  )}
                </div>

                <div className="flex">
                  <span className="w-32 shrink-0">PLACE OF SUPPLY:</span>
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.placeOfSupply}
                      onChange={(e) => setInvoice({ ...invoice, placeOfSupply: e.target.value })}
                      className="border border-dashed border-gray-400 px-1 text-[10px] w-full"
                    />
                  ) : (
                    <span>{invoice.placeOfSupply}</span>
                  )}
                </div>

                <div className="flex">
                  <span className="w-32 shrink-0">MODE OF SUPPLY:</span>
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.modeOfSupply}
                      onChange={(e) => setInvoice({ ...invoice, modeOfSupply: e.target.value })}
                      className="border border-dashed border-gray-400 px-1 text-[10px] w-full"
                    />
                  ) : (
                    <span>{invoice.modeOfSupply}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 4: GR/MARKA, PO NO, PO DT, REMARKS */}
            <div className="border-b border-black px-2 py-0.5 text-[10px] font-bold">
              <div className="grid grid-cols-12 gap-2 pb-0.5">
                <div className="col-span-4 flex items-center">
                  <span>GR/MARKA:</span>
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.grMarka}
                      onChange={(e) => setInvoice({ ...invoice, grMarka: e.target.value })}
                      className="ml-1 border border-dashed border-gray-400 px-1 w-full text-[9.5px]"
                    />
                  ) : (
                    <span className="ml-1 font-mono">{invoice.grMarka}</span>
                  )}
                </div>
                <div className="col-span-4 flex items-center">
                  <span>PO NO:</span>
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.poNo}
                      onChange={(e) => setInvoice({ ...invoice, poNo: e.target.value })}
                      className="ml-1 border border-dashed border-gray-400 px-1 w-full text-[9.5px]"
                    />
                  ) : (
                    <span className="ml-1 font-mono">{invoice.poNo}</span>
                  )}
                </div>
                <div className="col-span-4 flex items-center">
                  <span>PO DT:</span>
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.poDate}
                      onChange={(e) => setInvoice({ ...invoice, poDate: e.target.value })}
                      className="ml-1 border border-dashed border-gray-400 px-1 w-full text-[9.5px]"
                    />
                  ) : (
                    <span className="ml-1 font-mono">{invoice.poDate}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center pt-0.5">
                <span>REMARKS:</span>
                {canEdit ? (
                  <input
                    type="text"
                    value={invoice.remarks}
                    onChange={(e) => setInvoice({ ...invoice, remarks: e.target.value })}
                    className="ml-1 border border-dashed border-gray-400 px-1 w-full text-[9.5px]"
                  />
                ) : (
                  <span className="ml-1 font-normal uppercase">{invoice.remarks}</span>
                )}
              </div>
            </div>

            {/* ROW 5: MAIN ITEMS TABLE */}
            <div className="border-b border-black">
              <table className="w-full border-collapse text-left text-[10px] sm:text-[11px]">
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[9.5px] sm:text-[10px] text-center bg-gray-50">
                    <th className="border-r border-black py-1 px-1 w-8">SN</th>
                    <th className="border-r border-black py-1 px-2 text-left">ITEM WITH DESCRIPTION</th>
                    <th className="border-r border-black py-1 px-1 w-14">HSN</th>
                    <th className="border-r border-black py-1 px-1 w-10">QTY</th>
                    <th className="border-r border-black py-1 px-1 w-12">MRP</th>
                    <th className="border-r border-black py-1 px-1 w-16">NT_RATE</th>
                    <th className="border-r border-black py-1 px-1 w-16">TX_RATE</th>
                    <th className="border-r border-black py-1 px-1 w-10">DISC</th>
                    <th className="border-r border-black py-1 px-1 w-10">GST</th>
                    <th className="py-1 px-2 w-16 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="font-bold text-[10px] sm:text-[10.5px] align-top">
                      <td className="border-r border-black py-1 px-1 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="border-r border-black py-1 px-2">
                        {canEdit ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              className="w-full border border-dashed border-gray-400 px-1 py-0.5 uppercase text-[10px]"
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
                      <td className="border-r border-black py-1 px-1 text-center font-mono">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                            className="w-full text-center border border-dashed border-gray-400 px-0.5 text-[9.5px]"
                          />
                        ) : (
                          item.hsn
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1 text-center uppercase font-mono">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            className="w-full text-center border border-dashed border-gray-400 px-0.5 text-[9.5px]"
                          />
                        ) : (
                          item.qty
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1 text-right font-mono">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.mrp}
                            onChange={(e) => handleItemChange(idx, 'mrp', e.target.value)}
                            className="w-full text-right border border-dashed border-gray-400 px-0.5 text-[9.5px]"
                          />
                        ) : (
                          item.mrp
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1 text-right font-mono">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.ntRate}
                            onChange={(e) => handleItemChange(idx, 'ntRate', e.target.value)}
                            className="w-full text-right border border-dashed border-gray-400 px-0.5 text-[9.5px]"
                          />
                        ) : (
                          item.ntRate
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1 text-right font-mono">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.txRate}
                            onChange={(e) => handleItemChange(idx, 'txRate', e.target.value)}
                            className="w-full text-right border border-dashed border-gray-400 px-0.5 text-[9.5px]"
                          />
                        ) : (
                          item.txRate
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1 text-center font-mono">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.disc}
                            onChange={(e) => handleItemChange(idx, 'disc', e.target.value)}
                            className="w-full text-center border border-dashed border-gray-400 px-0.5 text-[9.5px]"
                          />
                        ) : (
                          item.disc
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1 text-center font-mono">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.gstRate}
                            onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                            className="w-full text-center border border-dashed border-gray-400 px-0.5 text-[9.5px]"
                          />
                        ) : (
                          item.gstRate
                        )}
                      </td>
                      <td className="py-1 px-2 text-right font-mono">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.amount}
                            onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                            className="w-full text-right border border-dashed border-gray-400 px-0.5 text-[9.5px]"
                          />
                        ) : (
                          item.amount
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Controlled Spacer Row: 35px height so full sheet fits perfectly on 1 A4 page */}
                  <tr style={{ height: '36px' }}>
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
                  <tr className="border-t border-black font-bold text-[10px]">
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

              {canEdit && (
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
                <table className="w-full border-collapse text-center text-[9.5px] sm:text-[10px] font-bold">
                  <thead>
                    <tr className="border-b border-black bg-gray-50">
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
                        {canEdit ? (
                          <input
                            type="text"
                            value={invoice.taxGstRate}
                            onChange={(e) => setInvoice({ ...invoice, taxGstRate: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[9.5px]"
                          />
                        ) : (
                          invoice.taxGstRate
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1">
                        {canEdit ? (
                          <input
                            type="text"
                            value={invoice.taxTaxable}
                            onChange={(e) => setInvoice({ ...invoice, taxTaxable: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[9.5px]"
                          />
                        ) : (
                          invoice.taxTaxable
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1">
                        {canEdit ? (
                          <input
                            type="text"
                            value={invoice.taxSgst}
                            onChange={(e) => setInvoice({ ...invoice, taxSgst: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[9.5px]"
                          />
                        ) : (
                          invoice.taxSgst
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1">
                        {canEdit ? (
                          <input
                            type="text"
                            value={invoice.taxCgst}
                            onChange={(e) => setInvoice({ ...invoice, taxCgst: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[9.5px]"
                          />
                        ) : (
                          invoice.taxCgst
                        )}
                      </td>
                      <td className="border-r border-black py-1 px-1">
                        {canEdit ? (
                          <input
                            type="text"
                            value={invoice.taxIgst}
                            onChange={(e) => setInvoice({ ...invoice, taxIgst: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[9.5px]"
                          />
                        ) : (
                          invoice.taxIgst
                        )}
                      </td>
                      <td className="py-1 px-1">
                        {canEdit ? (
                          <input
                            type="text"
                            value={invoice.taxCess}
                            onChange={(e) => setInvoice({ ...invoice, taxCess: e.target.value })}
                            className="w-full text-center border border-dashed border-gray-400 text-[9.5px]"
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
              <div className="col-span-6 p-1 text-[10px] font-bold">
                <div className="grid grid-cols-2 gap-x-2">
                  <div className="flex justify-between">
                    <span>TCS</span>
                    {canEdit ? (
                      <input
                        type="text"
                        value={invoice.tcs}
                        onChange={(e) => setInvoice({ ...invoice, tcs: e.target.value })}
                        className="w-14 text-right border border-dashed border-gray-400 text-[9.5px]"
                      />
                    ) : (
                      <span className="font-mono">{invoice.tcs}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>DISCOUNT</span>
                    {canEdit ? (
                      <input
                        type="text"
                        value={invoice.discount}
                        onChange={(e) => setInvoice({ ...invoice, discount: e.target.value })}
                        className="w-14 text-right border border-dashed border-gray-400 text-[9.5px]"
                      />
                    ) : (
                      <span className="font-mono">{invoice.discount}</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span>LABOUR</span>
                    {canEdit ? (
                      <input
                        type="text"
                        value={invoice.labour}
                        onChange={(e) => setInvoice({ ...invoice, labour: e.target.value })}
                        className="w-14 text-right border border-dashed border-gray-400 text-[9.5px]"
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
                    {canEdit ? (
                      <input
                        type="text"
                        value={invoice.freight}
                        onChange={(e) => setInvoice({ ...invoice, freight: e.target.value })}
                        className="w-14 text-right border border-dashed border-gray-400 text-[9.5px]"
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
                    {canEdit ? (
                      <input
                        type="text"
                        value={invoice.rndOff}
                        onChange={(e) => setInvoice({ ...invoice, rndOff: e.target.value })}
                        className="w-14 text-right border border-dashed border-gray-400 text-[9.5px]"
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
            <div className="grid grid-cols-12 items-center border-b border-black px-2 py-1 font-bold">
              <div className="col-span-8 text-[10px] sm:text-[10.5px] uppercase">
                IN WORDS:
                {canEdit ? (
                  <input
                    type="text"
                    value={invoice.inWords}
                    onChange={(e) => setInvoice({ ...invoice, inWords: e.target.value })}
                    className="ml-1 border border-dashed border-gray-400 px-1 py-0.5 text-[10px] w-4/5 uppercase font-bold"
                  />
                ) : (
                  <span className="ml-1 font-bold">{invoice.inWords}</span>
                )}
              </div>
              <div className="col-span-4 text-right flex justify-end items-center gap-2">
                <span className="text-[11px] sm:text-[11.5px] uppercase tracking-wider">NET-AMOUNT</span>
                {canEdit ? (
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
                    className="border border-dashed border-gray-400 px-1 py-0.5 font-mono text-[13px] font-black w-24 text-right"
                  />
                ) : (
                  <span className="font-mono font-black text-sm sm:text-base">{invoice.netAmount}</span>
                )}
              </div>
            </div>

            {/* ROW 8: BOTTOM THREE BOXES (TERMS, BANK, SIGNATURE) */}
            <div className="grid grid-cols-12 min-h-[90px]">
              {/* Left Box: Terms & Conditions */}
              <div className="col-span-6 p-2 border-r border-black flex flex-col justify-between">
                <div>
                  <div className="font-bold text-[10px] uppercase pb-0.5">
                    TERMS &amp; CONDITIONS:
                  </div>
                  <ul className="text-[8.5px] sm:text-[9px] space-y-0.5 font-semibold text-gray-900 leading-tight">
                    {invoice.terms.map((term, idx) => (
                      <li key={idx}>
                        {canEdit ? (
                          <input
                            type="text"
                            value={term}
                            onChange={(e) => {
                              const updated = [...invoice.terms];
                              updated[idx] = e.target.value;
                              setInvoice({ ...invoice, terms: updated });
                            }}
                            className="w-full border border-dashed border-gray-300 px-0.5 text-[8.5px]"
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
              <div className="col-span-3 p-2 border-r border-black text-[9.5px] sm:text-[10px] font-bold space-y-0.5">
                <div>BANK DETAILS :</div>
                <div>
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.bankName}
                      onChange={(e) => setInvoice({ ...invoice, bankName: e.target.value })}
                      className="border border-dashed border-gray-300 px-1 text-[9px] w-full"
                    />
                  ) : (
                    <span>{invoice.bankName}</span>
                  )}
                </div>
                <div>
                  A/C:
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.bankAccount}
                      onChange={(e) => setInvoice({ ...invoice, bankAccount: e.target.value })}
                      className="border border-dashed border-gray-300 px-1 text-[9px] font-mono w-full"
                    />
                  ) : (
                    <span className="font-mono">{invoice.bankAccount}</span>
                  )}
                </div>
                <div>
                  IFSC:
                  {canEdit ? (
                    <input
                      type="text"
                      value={invoice.bankIfsc}
                      onChange={(e) => setInvoice({ ...invoice, bankIfsc: e.target.value })}
                      className="border border-dashed border-gray-300 px-1 text-[9px] font-mono w-full"
                    />
                  ) : (
                    <span className="font-mono">{invoice.bankIfsc}</span>
                  )}
                </div>
              </div>

              {/* Right Box: Authorised Signatory */}
              <div className="col-span-3 p-2 flex flex-col justify-between text-right">
                <div className="font-bold text-[9.5px] sm:text-[10px] uppercase tracking-wide">
                  FOR {invoice.instituteName}
                </div>
                <div className="pt-6 font-bold text-[10px] text-right">
                  Authorised.Signatory
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Fallback Global Print Styling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                height: 100% !important;
                background: #fff !important;
              }
              body > * {
                display: none !important;
              }
              #gst-fee-invoice-print-area,
              #gst-fee-invoice-print-area * {
                display: revert !important;
                visibility: visible !important;
              }
              #gst-fee-invoice-print-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 195mm !important;
                margin: 0 auto !important;
                padding: 0 !important;
                border: 2px solid #000 !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              @page {
                size: A4 portrait;
                margin: 4mm 6mm;
              }
            }
          `,
        }}
      />
    </div>
  );
}
