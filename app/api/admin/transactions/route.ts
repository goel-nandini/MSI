import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export interface AdminTransaction {
  id: string;
  orderId: string;
  studentName: string;
  studentPhone?: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  paymentMethod: string;
  status: 'Captured (Test Mode)' | 'Success' | 'Failed' | 'Refunded';
  timestamp: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  receiptNumber: string;
}

const INITIAL_TRANSACTIONS: AdminTransaction[] = [
  {
    id: '#TXN-88491',
    orderId: 'order_msi_init_01',
    studentName: 'Harshit',
    studentPhone: '+91 97923 03434',
    courseId: 'crs-msi-legstudies',
    courseTitle: 'Legal Reasoning for CLAT: Foundational Principles & Passage-Based Deduction',
    amount: 4999,
    paymentMethod: 'Razorpay UPI (Test Gateway)',
    status: 'Captured (Test Mode)',
    timestamp: 'Today, 02:45 PM',
    razorpayPaymentId: 'pay_test_892101',
    receiptNumber: 'INV-MSI-2026-084',
  },
  {
    id: '#TXN-88490',
    orderId: 'order_msi_init_02',
    studentName: 'Ananya Sharma',
    studentPhone: '+91 98765 43210',
    courseId: 'crs-udemy-pcsj',
    courseTitle: 'PCS J Comprehensive Foundation & Procedural Law',
    amount: 6999,
    paymentMethod: 'Razorpay Netbanking (HDFC Test)',
    status: 'Captured (Test Mode)',
    timestamp: 'Yesterday, 05:12 PM',
    razorpayPaymentId: 'pay_test_892095',
    receiptNumber: 'INV-MSI-2026-083',
  },
  {
    id: '#TXN-88489',
    orderId: 'order_msi_init_03',
    studentName: 'Priyanshu Kashyap',
    studentPhone: '+91 98111 22334',
    courseId: 'crs-udemy-clat',
    courseTitle: 'Judiciary Mains Answer Writing & Speed Drafting Drills',
    amount: 3499,
    paymentMethod: 'Razorpay Cards (Visa Test)',
    status: 'Captured (Test Mode)',
    timestamp: '14 Oct 2026, 11:30 AM',
    razorpayPaymentId: 'pay_test_892080',
    receiptNumber: 'INV-MSI-2026-082',
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TXN_FILE = path.join(DATA_DIR, 'transactions.json');

function readTransactionsFromDisk(): AdminTransaction[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(TXN_FILE)) {
      const raw = fs.readFileSync(TXN_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    fs.writeFileSync(TXN_FILE, JSON.stringify(INITIAL_TRANSACTIONS, null, 2), 'utf-8');
    return INITIAL_TRANSACTIONS;
  } catch (err) {
    console.error('[Transactions Read Error]', err);
    return INITIAL_TRANSACTIONS;
  }
}

function writeTransactionsToDisk(txns: AdminTransaction[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TXN_FILE, JSON.stringify(txns, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Transactions Write Error]', err);
  }
}

export async function GET() {
  const transactions = readTransactionsFromDisk();
  return NextResponse.json({
    success: true,
    transactions,
    count: transactions.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentName,
      studentPhone,
      courseId,
      courseTitle,
      amount,
      paymentMethod,
      orderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    const txns = readTransactionsFromDisk();
    const newTxn: AdminTransaction = {
      id: `#TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: orderId || `order_msi_${Date.now().toString().slice(-8)}`,
      studentName: studentName || 'Registered Student',
      studentPhone: studentPhone || '+91 98000 00000',
      courseId: courseId || 'course-default',
      courseTitle: courseTitle || 'Judicial Studies Program',
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod || 'Razorpay Test Simulation',
      status: 'Captured (Test Mode)',
      timestamp: 'Just now (Instant)',
      razorpayPaymentId: razorpayPaymentId || `pay_test_${Date.now().toString().slice(-8)}`,
      razorpaySignature: razorpaySignature || `sig_${Math.random().toString(36).substring(2, 12)}`,
      receiptNumber: `INV-MSI-2026-${Math.floor(100 + Math.random() * 900)}`,
    };

    const updated = [newTxn, ...txns];
    writeTransactionsToDisk(updated);

    return NextResponse.json({
      success: true,
      message: 'Razorpay test payment captured and reconciled in ledger.',
      transaction: newTxn,
      transactions: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to record transaction' },
      { status: 500 }
    );
  }
}
