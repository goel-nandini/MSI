import { NextRequest, NextResponse } from 'next/server';
import {
  getStudentsAsync,
  addStudentAsync,
  deleteStudentAsync,
  buildDefaultStudentProfile,
  RegisteredStudentUser,
} from '@/lib/studentUserStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const students = await getStudentsAsync();
    return NextResponse.json({
      success: true,
      students,
      count: students.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to read students' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, stream, email, password } = body;

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Student name is required.' },
        { status: 400 }
      );
    }

    const resolvedStream = stream || 'PCS-J Punjab Judicial Services';
    const resolvedEmail =
      email?.trim() || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`;
    const resolvedPassword = password?.trim() || 'Student@MSI2026';

    const defaultProfile = buildDefaultStudentProfile(
      cleanPhone,
      name.trim(),
      resolvedStream,
      resolvedEmail
    );

    const newStudent: RegisteredStudentUser = {
      id: `msi-stu-${cleanPhone}`,
      phone: cleanPhone,
      name: name.trim(),
      stream: resolvedStream,
      password: resolvedPassword,
      email: resolvedEmail,
      registeredAt: new Date().toISOString(),
      role: 'student',
      profile: defaultProfile,
    };

    const updatedStudents = await addStudentAsync(newStudent);

    return NextResponse.json({
      success: true,
      message: `Student ${name} successfully enrolled and saved to permanent database.`,
      student: newStudent,
      students: updatedStudents,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error saving student' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let phone = searchParams.get('phone');
    let id = searchParams.get('id');

    if (!phone && !id) {
      try {
        const body = await req.json().catch(() => ({}));
        phone = body?.phone;
        id = body?.id;
      } catch (_) {}
    }

    if (!phone && !id) {
      return NextResponse.json(
        { success: false, message: 'Missing phone or id parameter.' },
        { status: 400 }
      );
    }

    await deleteStudentAsync(phone || '', id || '');

    const updatedStudents = await getStudentsAsync();

    return NextResponse.json({
      success: true,
      message: 'Student account permanently deleted from records.',
      students: updatedStudents,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error deleting student' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, updates } = body;

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone) {
      return NextResponse.json(
        { success: false, message: 'Valid phone is required for update.' },
        { status: 400 }
      );
    }

    const students = await getStudentsAsync();
    const student = students.find((s) => s.phone === cleanPhone);

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student record not found.' },
        { status: 404 }
      );
    }

    const updatedStudent: RegisteredStudentUser = {
      ...student,
      ...updates,
      profile: student.profile && updates.profile ? { ...student.profile, ...updates.profile } : (student.profile || updates.profile),
    };

    const updatedStudents = await addStudentAsync(updatedStudent);

    return NextResponse.json({
      success: true,
      message: 'Student record updated successfully.',
      student: updatedStudent,
      students: updatedStudents,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update student' },
      { status: 500 }
    );
  }
}
