import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/smsService';
import { verifyOtp } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, otp, name, email, stream } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: 'Both mobile number and OTP code are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeIndianPhone(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid mobile number format.' },
        { status: 400 }
      );
    }

    const verification = verifyOtp(cleanPhone, otp.trim());

    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          message: verification.message,
        },
        { status: 400 }
      );
    }

    // OTP is valid! Construct student profile metadata
    const resolvedName = name || verification.meta?.name || 'MSI Student';
    const resolvedEmail =
      email || verification.meta?.email || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`;
    const resolvedStream =
      stream || verification.meta?.stream || 'PCS-J Punjab Judicial Services';

    return NextResponse.json({
      success: true,
      message: 'Mobile number verified successfully!',
      user: {
        id: `msi-stu-${cleanPhone.slice(-4)}`,
        phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        cleanPhone,
        name: resolvedName,
        email: resolvedEmail,
        stream: resolvedStream,
        role: 'student',
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Verify OTP Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while verifying OTP.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
