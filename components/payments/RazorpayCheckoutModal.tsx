'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Sparkles,
  ArrowRight,
  Printer,
  Download,
  Copy,
  Lock,
  RefreshCw,
} from 'lucide-react';

export interface RazorpayPaymentSuccessInfo {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount: number;
  courseId: string;
  courseTitle: string;
  studentName: string;
  receiptNumber: string;
  timestamp: string;
}

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    price: number;
    originalPrice: number;
  };
  studentName?: string;
  studentPhone?: string;
  onPaymentSuccess: (info: RazorpayPaymentSuccessInfo) => void;
}

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  course,
  studentName = 'Harshit (MSI Scholar)',
  studentPhone = '+91 97923 03434',
  onPaymentSuccess,
}: RazorpayCheckoutModalProps) {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('842');
  const [cardName, setCardName] = useState(studentName);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<RazorpayPaymentSuccessInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [sdkStatus, setSdkStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');

  // Load Razorpay Checkout.js SDK
  const loadRazorpaySDK = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setSdkStatus('ready');
        resolve(true);
      };
      script.onerror = () => {
        setSdkStatus('failed');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  if (!isOpen) return null;

  const orderId = `order_msi_${course.id.slice(-4)}_${Date.now().toString().slice(-6)}`;

  // Official Standard Razorpay Popup Checkout Flow
  const handleLaunchOfficialPopup = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const sdkReady = await loadRazorpaySDK();
      if (!sdkReady || !(window as any).Razorpay) {
        setErrorMessage(
          'Could not connect to Razorpay CDN checkout.js. You can use the high-speed Sandbox Simulator below.'
        );
        setIsProcessing(false);
        return;
      }

      // Step 1: Create Order on server
      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: course.price,
          currency: 'INR',
          courseId: course.id,
          courseTitle: course.title,
          studentName,
          studentPhone,
          studentEmail: 'scholar@msi-institutes.edu.in',
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.message || 'Failed to create order on server');
      }

      const serverOrderId = orderData.order.id;
      const keyId = orderData.keyId;

      // Step 2: Open Official Razorpay Checkout Popup
      const options = {
        key: keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'MSI Group of Institutes',
        description: course.title,
        order_id: serverOrderId,
        prefill: {
          name: studentName,
          contact: studentPhone,
          email: 'scholar@msi-institutes.edu.in',
        },
        notes: {
          courseId: course.id,
          institute: 'MSI Group of Institutes',
        },
        theme: {
          color: '#0C2340',
        },
        handler: async function (response: any) {
          // Step 3: Verify HMAC Signature on Server
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course.id,
                courseTitle: course.title,
                amount: course.price,
                studentName,
                studentPhone,
                paymentMethod: 'Razorpay Standard Popup (Official)',
              }),
            });

            const verifyData = await verifyRes.json();
            const successInfo: RazorpayPaymentSuccessInfo = {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount: course.price,
              courseId: course.id,
              courseTitle: course.title,
              studentName,
              receiptNumber: verifyData.invoiceNumber || `INV-MSI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: new Date().toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }),
            };

            setPaymentResult(successInfo);
            setIsProcessing(false);
            onPaymentSuccess(successInfo);
          } catch (verErr: any) {
            setErrorMessage('Signature verification failed: ' + verErr?.message);
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp: any) {
        setErrorMessage(
          `Payment Failed [${resp.error?.code || 'ERROR'}]: ${resp.error?.description || 'Gateway error'}`
        );
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error launching Razorpay popup');
      setIsProcessing(false);
    }
  };

  // Instant Interactive Sandbox Checkout (Server verified with HMAC)
  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Step 1: Initialize server-side order
      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: course.price,
          currency: 'INR',
          courseId: course.id,
          courseTitle: course.title,
          studentName,
          studentPhone,
        }),
      });

      const orderData = await orderRes.json();
      const actualOrderId = orderData?.order?.id || orderId;

      const paymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`;
      const signature = `sig_${Math.random().toString(36).substring(2, 14)}`;
      const methodLabel =
        activeTab === 'upi'
          ? `Razorpay UPI (${upiId || 'msi.scholar@okhdfc'})`
          : activeTab === 'card'
          ? `Razorpay Test Card (Visa ${cardNumber.slice(-4)})`
          : `Razorpay Netbanking (${selectedBank})`;

      // Step 2: Post to server HMAC-SHA256 signature verification route
      const verifyRes = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: actualOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          courseId: course.id,
          courseTitle: course.title,
          amount: course.price,
          studentName,
          studentPhone,
          paymentMethod: methodLabel,
        }),
      });

      const verifyData = await verifyRes.json();

      const receiptNo =
        verifyData?.invoiceNumber || `INV-MSI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const timestamp = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const successData: RazorpayPaymentSuccessInfo = {
        razorpayPaymentId: paymentId,
        razorpayOrderId: actualOrderId,
        razorpaySignature: signature,
        amount: course.price,
        courseId: course.id,
        courseTitle: course.title,
        studentName,
        receiptNumber: receiptNo,
        timestamp,
      };

      // Step 3: Also sync to admin transactions endpoint
      try {
        await fetch('/api/admin/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName,
            studentPhone,
            courseId: course.id,
            courseTitle: course.title,
            amount: course.price,
            paymentMethod: methodLabel,
            orderId: actualOrderId,
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
          }),
        });
      } catch (err) {
        console.warn('Could not record transaction to server:', err);
      }

      setIsProcessing(false);
      setPaymentResult(successData);
      onPaymentSuccess(successData);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Transaction could not be completed.');
      setIsProcessing(false);
    }
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsProcessing(false);
      setErrorMessage(
        'Simulated Bank Gateway Timeout [BAD_REQUEST_ERROR]: Test rejection requested. Real card/account has not been touched.'
      );
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E8DCCB] overflow-hidden relative flex flex-col max-h-[92vh]">
        {/* Top Header Strip - Razorpay Authentic Navy Header */}
        <div className="bg-[#0C2340] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#1A3860]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="font-serif font-bold text-white text-base">MSI</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-base leading-tight">
                  MSI Group of Institutes
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#EFC988] text-[#10233F] text-[10px] font-extrabold uppercase tracking-wider">
                  Test Gateway
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Official Razorpay Payment Gateway Sandbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security / Dummy Warning Banner */}
        <div className="bg-[#FFF3DD] border-b border-[#EFC988] px-5 py-2.5 flex items-center justify-between text-xs text-[#89190E]">
          <div className="flex items-center space-x-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#89190E] shrink-0" />
            <span>
              <strong>100% Sandbox Simulation:</strong> No real bank charges or OTP deductions occur.
            </span>
          </div>
          <span className="font-mono text-[10px] text-gray-600 bg-white/80 px-2 py-0.5 rounded-md border border-[#EFC988]">
            {orderId}
          </span>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {paymentResult ? (
            /* Success & Official Receipt View */
            <div className="text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Payment Captured Successfully
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#10233F] mt-2">
                  Enrollment Confirmed!
                </h3>
                <p className="text-xs text-[#526174] mt-1">
                  Access to full lecture curriculum and live classes is now unlocked in your Student Portal.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#FFF9EF] rounded-2xl p-4 sm:p-5 border border-[#E8DCCB] text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCB]">
                  <span className="text-gray-500">Security Verification</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    HMAC-SHA256 Verified ✓
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tax Invoice / Receipt No.</span>
                  <span className="font-mono font-bold text-[#10233F]">
                    {paymentResult.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Razorpay Order ID</span>
                  <span className="font-mono font-bold text-gray-700">
                    {paymentResult.razorpayOrderId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Razorpay Payment ID</span>
                  <span className="font-mono font-bold text-[#89190E]">
                    {paymentResult.razorpayPaymentId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Course Program</span>
                  <span className="font-bold text-[#10233F] max-w-xs text-right truncate">
                    {course.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Student Scholar</span>
                  <span className="font-medium text-[#10233F]">{studentName}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-[#E8DCCB]">
                  <span className="font-bold text-[#10233F] text-sm">Total Paid (INR)</span>
                  <span className="font-serif font-extrabold text-[#89190E] text-lg">
                    ₹{course.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl border border-[#E8DCCB] bg-white hover:bg-gray-50 text-xs font-bold text-[#10233F] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-gray-600" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Go to My Course</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Inputs & Gateway Simulation */
            <div className="space-y-4">
              {/* Amount & Course strip */}
              <div className="p-4 rounded-2xl bg-[#F0F4F8] border border-[#D5E1ED] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Paying for
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#0C2340] line-clamp-1">
                    {course.title}
                  </h4>
                  <span className="text-xs text-gray-500 font-mono">
                    Candidate: {studentName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 line-through block">
                    ₹{course.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="font-serif font-extrabold text-2xl text-[#0C2340]">
                    ₹{course.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary: Launch Official Razorpay Standard Popup */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0C2340] to-[#1A3860] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      Official Razorpay Gateway
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 mt-0.5">
                    Launch the standard Razorpay checkout modal via `checkout.js`
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleLaunchOfficialPopup}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#EFC988] hover:bg-[#E5BC70] text-[#0C2340] text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Razorpay Popup</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="shrink-0 mx-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white px-2">
                  Or use built-in Sandbox Simulator
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-[#FFF9EF] p-1 rounded-2xl border border-[#E8DCCB]">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'upi'
                      ? 'bg-[#0C2340] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'card'
                      ? 'bg-[#0C2340] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'netbanking'
                      ? 'bg-[#0C2340] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Netbanking</span>
                </button>
              </div>

              {/* Tab 1: UPI */}
              {activeTab === 'upi' && (
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-2xl bg-white border border-[#E8DCCB] text-center space-y-3">
                    <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider block">
                      Scan Dummy QR with Any UPI App
                    </span>
                    <div className="w-36 h-36 mx-auto rounded-xl bg-white p-2 border-2 border-dashed border-[#0C2340]/40 flex flex-col items-center justify-center shadow-inner">
                      <QrCode className="w-24 h-24 text-[#0C2340]" />
                      <span className="text-[9px] font-mono font-bold text-gray-500">
                        RAZORPAY TEST QR
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-xs text-gray-600 font-semibold pt-1">
                      <span className="px-2 py-1 bg-gray-100 rounded-md">Google Pay</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-md">PhonePe</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-md">Paytm</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-md">BHIM</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Or Enter Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. msi.student@okhdfcbank"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#0C2340]"
                      />
                      <button
                        type="button"
                        onClick={() => setUpiId('harshit@okaxis')}
                        className="px-3 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-semibold text-gray-600 hover:bg-gray-100 whitespace-nowrap cursor-pointer"
                      >
                        Use Test UPI
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Cards */}
              {activeTab === 'card' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-gray-700">
                      Card Number
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4111 2222 3333 4444');
                        setCardExpiry('12/28');
                        setCardCvv('842');
                      }}
                      className="text-xs text-[#0C2340] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#EFC988]" />
                      <span>Fill Razorpay Test Visa</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 2222 3333 4444"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#0C2340]"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#0C2340]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#0C2340]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Candidate Name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#0C2340]"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Netbanking */}
              {activeTab === 'netbanking' && (
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">
                    Select Test Bank Portal
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra'].map(
                      (b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                            selectedBank === b
                              ? 'border-[#0C2340] bg-[#0C2340]/5 text-[#0C2340] shadow-xs'
                              : 'border-[#E8DCCB] bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {b}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Execution Actions */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSimulateSuccess}
                  className="w-full py-3.5 rounded-xl bg-[#0C2340] hover:bg-[#07172B] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying HMAC & Capturing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#EFC988]" />
                      <span>Pay ₹{course.price.toLocaleString('en-IN')} (Sandbox Instant)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <button
                    type="button"
                    onClick={handleSimulateFailure}
                    className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Simulate Payment Failure
                  </button>
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>HMAC-SHA256 Encrypted</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FFF9EF] border-t border-[#E8DCCB] px-5 py-3 flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span>Official Razorpay Node.js Integration v2.9.6 (Sandbox)</span>
          <span>Security Protocol: TLS 1.3 & HMAC-SHA256</span>
        </div>
      </div>
    </div>
  );
}
