import { NextRequest, NextResponse } from 'next/server';
import {
  sanitizeIndianPhone,
  isValidIndianPhone,
  generateNumericOTP,
  sendOtpToMobile,
} from '@/lib/smsService';
import { checkOtpCooldown, saveOtp, cleanupExpiredOtps } from '@/lib/otpStore';
import { isPhoneRegistered, registerStudentUser } from '@/lib/studentUserStore';

export async function POST(req: NextRequest) {
  try {
    cleanupExpiredOtps();

    const body = await req.json().catch(() => ({}));
    const { phone, purpose = 'login', name, email, stream, password } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeIndianPhone(phone);

    if (!isValidIndianPhone(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).',
        },
        { status: 400 }
      );
    }

    // Duplicate registration check: Do not send OTP if already registered
    if (purpose === 'signup' && isPhoneRegistered(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          isAlreadyRegistered: true,
          message:
            'This mobile number is already registered with MSI. Please sign in with your password instead.',
        },
        { status: 400 }
      );
    }

    // Check 30s resend cooldown
    const cooldown = checkOtpCooldown(cleanPhone);
    if (!cooldown.canSend) {
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${cooldown.remainingSeconds} seconds before requesting a new OTP.`,
          remainingSeconds: cooldown.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // Generate fresh 6-digit OTP
    const otp = generateNumericOTP();

    // Auto-record student on disk immediately so Super Admin and Reception CRM see the student record right away
    if (name?.trim() || purpose === 'student-portal-auth' || purpose === 'signup') {
      try {
        registerStudentUser({
          phone: cleanPhone,
          name: name?.trim() || `Student ${cleanPhone.slice(-4)}`,
          stream: stream?.trim() || 'PCS-J Punjab Judicial Services',
          email: email?.trim() || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`,
          password: password?.trim() || 'Student@MSI2026',
        });
      } catch (e) {
        console.warn('[SendOTP] Could not pre-register student:', e);
      }
    }

    // Save in store with metadata (including pending password for registration)
    saveOtp(cleanPhone, otp, {
      name: name?.trim(),
      email: email?.trim(),
      stream: stream?.trim(),
      password: password?.trim(),
      purpose: purpose as 'login' | 'signup' | 'verification',
    });

    // Send SMS / WhatsApp OTP via ApiTxt (or fallback)
    const result = await sendOtpToMobile(cleanPhone, otp, purpose);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      phone: cleanPhone,
      formattedPhone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
      provider: result.provider,
      missingKey: result.missingKey,
      isDev: result.isDev,
      devOtp: result.devOtp,
      cooldownSeconds: 30,
    });
  } catch (error: any) {
    console.error('[API Send OTP Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while dispatching OTP. Please try again.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
