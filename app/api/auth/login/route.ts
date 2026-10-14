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

    // Dedicated Reception Desk Authentication for 9792303434
    if (cleanPhone === '9792303434') {
      const isHarshitPassword =
        password.trim() === 'Harshit@reception' ||
        password.trim().toLowerCase() === 'harshit@reception';

      if (!isHarshitPassword) {
        return NextResponse.json(
          {
            success: false,
            code: 'INVALID_PASSWORD',
            message: 'Incorrect password for Reception Desk. Please enter Harshit@reception',
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Welcome Harshit! Access granted to Reception Desk.',
        role: 'reception',
        redirectTo: '/reception/dashboard',
        user: {
          id: 'staff-harshit',
          phone: '+91 97923 03434',
          cleanPhone: '9792303434',
          name: 'Harshit',
          email: 'harshit.reception@msi-institutes.edu.in',
          stream: 'Reception Desk & Visitor Management',
          role: 'reception',
          redirectTo: '/reception/dashboard',
        },
      });
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
    const resolvedName = profile?.name || student.name;
    const resolvedStream = profile?.courseTitle || profile?.batch || student.stream;
    const resolvedEmail =
      profile?.email || student.email || `student.${student.phone.slice(-4)}@msi-institutes.edu.in`;

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: student.id,
        phone: profile?.phone || `+91 ${student.phone.slice(0, 5)} ${student.phone.slice(5)}`,
        cleanPhone: student.phone,
        name: resolvedName,
        email: resolvedEmail,
        stream: resolvedStream,
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
