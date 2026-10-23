import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/smsService';
import { authenticateWithPassword, getStudentProfile } from '@/lib/studentUserStore';
import { verifyFacultyCredentials } from '@/lib/teacherUserStore';
import { verifyReceptionistCredentials } from '@/lib/receptionistStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = (body.phoneOrEmail || body.phone || body.email || body.identifier || '').trim();
    const password = (body.password || '').trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Please enter your registered mobile number or official email.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Please enter your password.' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeIndianPhone(identifier);

    // 1. Dedicated Authentication for Super Admin (9792303434)
    if (cleanPhone === '9792303434' || identifier.toLowerCase() === 'admin@msi-institutes.edu.in') {
      const isSuperAdminPassword =
        password === 'MSI@superadmin' ||
        password.toLowerCase() === 'msi@superadmin';

      if (isSuperAdminPassword) {
        return NextResponse.json({
          success: true,
          message: 'Welcome Administrator! Access granted to Super Admin Master Dashboard.',
          role: 'super-admin',
          redirectTo: '/super-admin',
          user: {
            id: 'super-admin-01',
            phone: '+91 97923 03434',
            cleanPhone: '9792303434',
            name: 'MSI Administrator',
            email: 'admin@msi-institutes.edu.in',
            stream: 'Institutional Governance & Master Administration',
            role: 'super-admin',
            redirectTo: '/super-admin',
          },
        });
      }
    }

    // 2. Check Receptionist Credentials (from data/receptionists.json)
    const recResult = verifyReceptionistCredentials(identifier, password);
    if (recResult.success && recResult.receptionist) {
      const rec = recResult.receptionist;
      return NextResponse.json({
        success: true,
        message: `Welcome ${rec.name}! Access granted to Reception Desk.`,
        role: 'reception',
        redirectTo: '/reception/dashboard',
        user: {
          id: rec.id,
          phone: `+91 ${rec.phone.slice(0, 5)} ${rec.phone.slice(5)}`,
          cleanPhone: rec.phone,
          name: rec.name,
          email: rec.email,
          stream: 'Reception Desk & Visitor Management',
          role: 'reception',
          redirectTo: '/reception/dashboard',
        },
      });
    }

    // 2. Check Faculty Credentials
    // As instructed: "फैकल्टी तो अपने से लॉगिन नहीं कर सकता, उसको जो असाइन करेगा सुपर एडमिन वही होगा... सुपर एडमिन में फैकल्टी ऐड किया, उनका पासवर्ड और क्रेडेंशियल दिया, तो उस क्रेडेंशियल का यूज़ करके लॉगिन पेज पे जाएंगे तो उनको फैकल्टी का डैशबोर्ड ओपन हो जाना चाहिए"
    const facultyResult = verifyFacultyCredentials(identifier, password);
    if (facultyResult.message?.includes('cancelled/terminated') || facultyResult.message?.includes('revoked')) {
      return NextResponse.json(
        {
          success: false,
          code: 'TERMINATED',
          message: facultyResult.message,
        },
        { status: 403 }
      );
    }

    if (facultyResult.success && facultyResult.teacher) {
      const teacher = facultyResult.teacher;
      return NextResponse.json({
        success: true,
        message: `Welcome ${teacher.name}! Access granted to Faculty Dashboard.`,
        role: 'teacher',
        redirectTo: '/teacher/dashboard',
        user: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          department: teacher.department,
          designation: teacher.designation,
          avatarUrl: teacher.avatarUrl,
          stream: teacher.stream,
          role: 'teacher',
          redirectTo: '/teacher/dashboard',
        },
      });
    }

    // 3. Check Student Credentials
    const authResult = authenticateWithPassword(identifier, password);
    if (authResult.code === 'TERMINATED') {
      return NextResponse.json(
        {
          success: false,
          code: 'TERMINATED',
          message: authResult.message,
        },
        { status: 403 }
      );
    }

    if (authResult.success && authResult.student) {
      const student = authResult.student;
      const profile = getStudentProfile(student.phone);
      const resolvedName = profile?.name || student.name;
      const resolvedStream = profile?.courseTitle || profile?.batch || student.stream;
      const resolvedEmail =
        profile?.email || student.email || `student.${student.phone.slice(-4)}@msi-institutes.edu.in`;

      return NextResponse.json({
        success: true,
        message: `Welcome ${resolvedName}! Access granted to Student Learning Portal.`,
        role: 'student',
        redirectTo: '/student/dashboard',
        user: {
          id: student.id,
          phone: profile?.phone || `+91 ${student.phone.slice(0, 5)} ${student.phone.slice(5)}`,
          cleanPhone: student.phone,
          name: resolvedName,
          email: resolvedEmail,
          stream: resolvedStream,
          role: 'student',
          profile,
          redirectTo: '/student/dashboard',
        },
      });
    }

    // 4. If neither matched, provide helpful feedback
    if (facultyResult.message?.toLowerCase().includes('password') || authResult.code === 'INVALID_PASSWORD') {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_PASSWORD',
          message: 'Incorrect password for this account. Please check your credentials or reset via OTP.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: 'NOT_FOUND',
        message: 'No account found with this mobile number or email. New students can register using OTP. Faculty accounts are provisioned exclusively by Super Admin.',
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('[API Unified Login Error]', error);
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
