import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ensureStudentExists } from '@/lib/studentUserStore';
import { verifyRazorpaySignature, getRazorpayCredentials } from '@/lib/razorpay';
import { getDb, isMongoConfigured } from '@/lib/mongodb';
import { getStudentsAsync, addStudentAsync } from '@/lib/studentUserStore';

const TRANSACTIONS_FILE = path.join(process.cwd(), 'data', 'transactions.json');

function ensureDataFile() {
  const dir = path.dirname(TRANSACTIONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      courseTitle,
      amount,
      studentName = 'MSI Scholar',
      studentPhone = '',
      paymentMethod = 'Razorpay Gateway (UPI / Cards / NetBanking)',
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, message: 'Missing Razorpay order or payment identifier.' },
        { status: 400 }
      );
    }

    const { isLive } = getRazorpayCredentials();

    // 1. Official HMAC SHA-256 Signature Verification
    const isVerified = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature || ''
    );

    if (!isVerified) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: 'Razorpay HMAC signature verification failed. Untrusted payment payload.',
        },
        { status: 400 }
      );
    }

    // 2. Persist Settlement Transaction to Disk for Super Admin Ledger
    ensureDataFile();
    let currentTransactions = [];
    try {
      const fileData = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
      currentTransactions = JSON.parse(fileData);
      if (!Array.isArray(currentTransactions)) currentTransactions = [];
    } catch {
      currentTransactions = [];
    }

    const invoiceNumber = `INV-MSI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newTransaction = {
      id: `#TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName,
      studentPhone,
      courseId: courseId || 'general',
      courseTitle: courseTitle || 'MSI Coaching Program',
      amount: Number(amount) || 4999,
      paymentMethod,
      status: 'captured' as const,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      receiptNumber: invoiceNumber,
      timestamp,
      createdAt: now.toISOString(),
      isSandbox: !isLive,
    };

    const updated = [newTransaction, ...currentTransactions];
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(updated, null, 2), 'utf-8');

    // Sync transaction to MongoDB Atlas
    if (isMongoConfigured()) {
      try {
        const db = await getDb();
        if (db) {
          const { _id, ...cleanTxn }: any = newTransaction;
          await db.collection('transactions').insertOne(cleanTxn);
        }
      } catch (err) {
        console.warn('[Razorpay Verify] MongoDB insert error:', err);
      }
    }

    // Update Student Fee Balance in database
    if (studentPhone) {
      try {
        const cleanPhone = studentPhone.replace(/\D/g, '').slice(-10);
        const students = await getStudentsAsync();
        const student = students.find((s) => s.phone === cleanPhone);
        if (student) {
          const currentTotal = student.totalFee || Number(amount) || 0;
          const currentPaid = (student.paidFee || 0) + (Number(amount) || 0);
          const currentDue = Math.max(0, currentTotal - currentPaid);
          const updatedStu = {
            ...student,
            paidFee: currentPaid,
            dueFee: currentDue,
            profile: {
              ...(student.profile || {}),
              paidFee: currentPaid,
              dueFee: currentDue,
            },
          };
          await addStudentAsync(updatedStu);
        }
      } catch (err) {
        console.warn('[Razorpay Verify] Could not update student fee ledger:', err);
      }
    }

    // Auto-record student in permanent students database
    if (studentPhone) {
      try {
        ensureStudentExists({
          phone: studentPhone,
          name: studentName,
          stream: courseTitle,
        });
      } catch (err) {
        console.warn('Could not auto-register student from payment:', err);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Razorpay payment verified & transaction settled successfully.',
      invoiceNumber,
      transaction: newTransaction,
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay signature:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal error during payment signature verification.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
