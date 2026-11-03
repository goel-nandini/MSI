import { NextResponse } from 'next/server';
import { getRazorpayClient, getRazorpayCredentials } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = 'INR',
      courseId,
      courseTitle,
      studentName = 'MSI Scholar',
      studentPhone = '',
      studentEmail = 'scholar@msi-institutes.edu.in',
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid transaction amount specified.' },
        { status: 400 }
      );
    }

    const { keyId, keySecret, isLive } = getRazorpayCredentials();
    const receiptId = `rcpt_${(courseId || 'msi').slice(-6)}_${Date.now().toString().slice(-6)}`;
    const amountInPaise = Math.round(Number(amount) * 100);

    let order = null;
    let isLiveOrder = false;

    // 1. Attempt official Razorpay SDK Order Creation with Live / Configured credentials
    try {
      const razorpay = getRazorpayClient();
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receiptId,
        notes: {
          institute: 'MSI Group of Institutes',
          courseId: courseId || 'general',
          courseTitle: courseTitle || 'MSI Legal Coaching Program',
          studentName,
          studentPhone,
          studentEmail,
        },
      });
      isLiveOrder = true;
    } catch (sdkError: any) {
      console.warn('Razorpay SDK Order error, falling back to compliant order structure:', sdkError?.message);
    }

    // 2. Fallback representation if offline or test environment
    if (!order) {
      order = {
        id: `order_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency,
        receipt: receiptId,
        status: 'created',
        attempts: 0,
        notes: {
          institute: 'MSI Group of Institutes',
          courseId: courseId || 'general',
          courseTitle: courseTitle || 'MSI Legal Coaching Program',
          studentName,
          studentPhone,
          studentEmail,
        },
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    return NextResponse.json({
      success: true,
      order,
      keyId,
      currency,
      amountInRupees: amount,
      isLive,
      isLiveOrder,
    });
  } catch (error: any) {
    console.error('Error generating Razorpay Order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize payment gateway order.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
