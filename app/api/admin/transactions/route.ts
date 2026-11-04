import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDb, isMongoConfigured } from '@/lib/mongodb';

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
  razorpayOrderId?: string;
  invoiceData?: any;
  remarks?: string;
}

const INITIAL_TRANSACTIONS: AdminTransaction[] = [];

const DATA_DIR = path.join(process.cwd(), 'data');
const TXN_FILE = path.join(DATA_DIR, 'transactions.json');

function readTransactionsFromDisk(): AdminTransaction[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (_) {}
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
    try {
      fs.writeFileSync(TXN_FILE, JSON.stringify(INITIAL_TRANSACTIONS, null, 2), 'utf-8');
    } catch (_) {}
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
    console.warn('[Transactions Write Error - Read Only FS on Vercel]:', err);
  }
}

async function getTransactionsAsync(): Promise<AdminTransaction[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      if (db) {
        const col = db.collection<AdminTransaction>('transactions');
        const docs = await col.find({}).sort({ timestamp: -1 }).toArray();
        if (docs.length > 0) {
          return docs.map((d: any) => {
            const { _id, ...rest } = d;
            return rest as AdminTransaction;
          });
        }
      }
    } catch (err) {
      console.warn('[Transactions MongoDB Error]:', err);
    }
  }
  return readTransactionsFromDisk();
}

export async function GET() {
  const transactions = await getTransactionsAsync();
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
      id: customId,
      studentName,
      studentPhone,
      courseId,
      courseTitle,
      amount,
      paymentMethod,
      orderId,
      razorpayPaymentId,
      razorpaySignature,
      receiptNumber,
      status,
      timestamp,
      invoiceData,
      remarks,
    } = body;

    const txns = readTransactionsFromDisk();
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newTxn: AdminTransaction = {
      id: customId || `#TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: orderId || `order_msi_${Date.now().toString().slice(-8)}`,
      studentName: studentName || 'Registered Student',
      studentPhone: studentPhone || '',
      courseId: courseId || 'fee-settlement',
      courseTitle: courseTitle || 'Judicial Studies Program',
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod || 'Official Fee Receipt',
      status: status || 'Success',
      timestamp: timestamp || formattedDate,
      razorpayPaymentId: razorpayPaymentId || `REC-${Date.now().toString().slice(-8)}`,
      razorpaySignature: razorpaySignature || '',
      receiptNumber: receiptNumber || (invoiceData?.invoiceNo ? invoiceData.invoiceNo : `INV-MSI-2026-${Math.floor(1000 + Math.random() * 9000)}`),
      invoiceData: invoiceData || undefined,
      remarks: remarks || invoiceData?.remarks || '',
    };

    const updated = [newTxn, ...txns];
    writeTransactionsToDisk(updated);

    if (isMongoConfigured()) {
      try {
        const db = await getDb();
        if (db) {
          const { _id, ...cleanTxn }: any = newTxn;
          await db.collection('transactions').insertOne(cleanTxn);
        }
      } catch (err) {
        console.warn('[Transactions API] MongoDB insert error:', err);
      }
    }

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
