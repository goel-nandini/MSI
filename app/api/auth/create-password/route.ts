import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/smsService';
import {
  registerStudentUser,
  getStudentByPhone,
  updateStudentAccount,
  getStudentProfile,
} from '@/lib/studentUserStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, password, name, stream, email } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    if (!password || password.trim().length < 4) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid password (at least 4 characters).' },
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

    const cleanPass = password.trim();
    let student = getStudentByPhone(cleanPhone);

    const resolvedName = name?.trim() || student?.name || `Student ${cleanPhone.slice(-4)}`;
    const resolvedStream = stream?.trim() || student?.stream || 'PCS-J Punjab Judicial Services';
    const resolvedEmail =
      email?.trim() || student?.email || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`;

    if (student) {
      // Update existing student with their newly created password
      updateStudentAccount(cleanPhone, {
        password: cleanPass,
        name: resolvedName,
        stream: resolvedStream,
        email: resolvedEmail,
      });
      student = getStudentByPhone(cleanPhone);
    } else {
      // Register new student with their chosen password
      const regResult = registerStudentUser({
        phone: cleanPhone,
        name: resolvedName,
        stream: resolvedStream,
        password: cleanPass,
        email: resolvedEmail,
      });
      student = regResult.student;
    }

    const profile = getStudentProfile(cleanPhone);

    return NextResponse.json({
      success: true,
      message: 'Password created successfully! Logging you in...',
      user: {
        id: student?.id || `msi-stu-${cleanPhone.slice(-4)}`,
        phone: profile?.phone || `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        cleanPhone,
        name: profile?.name || student?.name || resolvedName,
        email: profile?.email || student?.email || resolvedEmail,
        stream: profile?.courseTitle || profile?.batch || student?.stream || resolvedStream,
        role: 'student',
        profile,
        redirectTo: '/student/dashboard',
      },
    });
  } catch (error: any) {
    console.error('[API Create Password Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save password. Please try again.', error: error?.message },
      { status: 500 }
    );
  }
}
