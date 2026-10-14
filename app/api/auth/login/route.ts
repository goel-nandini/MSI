import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/smsService';
import { authenticateWithPassword, getStudentProfile } from '@/lib/studentUserStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, password } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Please enter your mobile number.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Please enter your password.' },
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

    const authResult = authenticateWithPassword(cleanPhone, password);

    if (!authResult.success || !authResult.student) {
      return NextResponse.json(
        {
          success: false,
          code: authResult.code,
          message: authResult.message,
        },
        { status: 401 }
      );
    }

    const student = authResult.student;
    const profile = getStudentProfile(cleanPhone);

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: student.id,
        phone: `+91 ${student.phone.slice(0, 5)} ${student.phone.slice(5)}`,
        cleanPhone: student.phone,
        name: student.name,
        email: student.email || `student.${student.phone.slice(-4)}@msi-institutes.edu.in`,
        stream: student.stream,
        role: 'student',
        profile,
      },
    });
  } catch (error: any) {
    console.error('[API Student Login Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during login. Please try again.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
