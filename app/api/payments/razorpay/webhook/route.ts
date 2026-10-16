import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const TRANSACTIONS_FILE = path.join(process.cwd(), 'data', 'transactions.json');

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'msi_webhook_secret_2026';

    // Verify webhook signature if secret configured
    if (signature && webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature && webhookSecret !== 'msi_webhook_secret_2026') {
        return NextResponse.json(
          { success: false, message: 'Invalid webhook signature.' },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      if (payment) {
        try {
          let currentTransactions = [];
          if (fs.existsSync(TRANSACTIONS_FILE)) {
            const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
            currentTransactions = JSON.parse(data);
          }
          const exists = currentTransactions.some(
            (t: any) => t.razorpayPaymentId === payment.id
          );
          if (!exists) {
            const newTxn = {
              id: `#TXN-${Math.floor(10000 + Math.random() * 90000)}`,
              studentName: payment.notes?.studentName || payment.contact || 'Registered Scholar',
              studentPhone: payment.contact || '+91 97923 03434',
              courseId: payment.notes?.courseId || 'general',
              courseTitle: payment.notes?.courseTitle || 'MSI Legal Program',
              amount: payment.amount ? payment.amount / 100 : 4999,
              paymentMethod: `Razorpay (${payment.method?.toUpperCase() || 'ONLINE'})`,
              status: 'captured' as const,
              razorpayOrderId: payment.order_id,
              razorpayPaymentId: payment.id,
              receiptNumber: `INV-MSI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: new Date().toLocaleString('en-IN'),
              createdAt: new Date().toISOString(),
              isSandbox: payment.id.includes('test'),
            };
            currentTransactions.unshift(newTxn);
            fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(currentTransactions, null, 2), 'utf-8');
          }
        } catch (e) {
          console.error('Error recording webhook transaction:', e);
        }
      }
    }

    return NextResponse.json({ success: true, received: true, event });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message },
      { status: 500 }
    );
  }
}
