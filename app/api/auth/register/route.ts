import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/smsService';
import { registerStudentUser, getStudentProfile } from '@/lib/studentUserStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, phone, stream, email, password } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please enter your full name.' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeIndianPhone(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    const cleanPass = (password || 'Student@MSI2026').trim();
    if (cleanPass.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 4 characters.' },
        { status: 400 }
      );
    }

    const resolvedStream = stream?.trim() || 'PCS-J Punjab Judicial Services';
    const resolvedEmail =
      email?.trim() || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`;

    const regResult = registerStudentUser({
      phone: cleanPhone,
      name: name.trim(),
      stream: resolvedStream,
      email: resolvedEmail,
      password: cleanPass,
    });

    if (!regResult.success || !regResult.student) {
      return NextResponse.json(
        { success: false, message: regResult.message || 'Registration could not be completed.' },
        { status: 400 }
      );
    }

    const profile = getStudentProfile(cleanPhone);

    return NextResponse.json({
      success: true,
      message: `Welcome, ${regResult.student.name}! Your student account is active.`,
      student: regResult.student,
      role: 'student',
      redirectTo: '/student/dashboard',
      user: {
        id: regResult.student.id,
        phone: profile?.phone || `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        cleanPhone,
        name: regResult.student.name,
        email: regResult.student.email,
        stream: regResult.student.stream,
        role: 'student',
        profile,
      },
    });
  } catch (error: any) {
    console.error('[API Student Register Error]', error);
    return NextResponse.json(
      { success: false, message: 'Server error during registration.', error: error?.message },
      { status: 500 }
    );
  }
}
