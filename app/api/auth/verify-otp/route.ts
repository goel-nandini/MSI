import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/smsService';
import { verifyOtp } from '@/lib/otpStore';
import {
  registerStudentUser,
  getStudentByPhone,
  updateStudentAccount,
  getStudentProfile,
} from '@/lib/studentUserStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, otp, name, email, stream, password, purpose } = body;

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

    // OTP is valid!
    const effectivePurpose = purpose || verification.meta?.purpose || 'login';
    const effectivePassword = password || verification.meta?.password || 'Student@MSI2026';
    const resolvedName = name || verification.meta?.name || 'MSI Student';
    const resolvedEmail =
      email || verification.meta?.email || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`;
    const resolvedStream =
      stream || verification.meta?.stream || 'PCS-J Punjab Judicial Services';

    // Retrieve or auto-register student user
    let student = getStudentByPhone(cleanPhone);

    if (effectivePurpose === 'signup') {
      if (!student) {
        const regResult = registerStudentUser({
          phone: cleanPhone,
          name: resolvedName,
          stream: resolvedStream,
          password: effectivePassword,
          email: resolvedEmail,
        });
        if (regResult.student) {
          student = regResult.student;
        }
      }
    } else if (effectivePurpose === 'reset' && password) {
      updateStudentAccount(cleanPhone, { password: password.trim() });
      student = getStudentByPhone(cleanPhone);
    } else if (!student) {
      // Auto-register on first OTP login so their account is permanently tracked
      const regResult = registerStudentUser({
        phone: cleanPhone,
        name: resolvedName,
        stream: resolvedStream,
        password: effectivePassword,
        email: resolvedEmail,
      });
      if (regResult.student) {
        student = regResult.student;
      }
    }

    const profile = getStudentProfile(cleanPhone);

    return NextResponse.json({
      success: true,
      message: 'Mobile number verified successfully!',
      user: {
        id: student?.id || `msi-stu-${cleanPhone.slice(-4)}`,
        phone: profile?.phone || `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        cleanPhone,
        name: profile?.name || student?.name || resolvedName,
        email: profile?.email || student?.email || resolvedEmail,
        stream: profile?.courseTitle || profile?.batch || student?.stream || resolvedStream,
        role: 'student',
        profile,
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
