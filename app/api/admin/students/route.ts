import { NextRequest, NextResponse } from 'next/server';
import {
  readStudentsFromDisk,
  writeStudentsToDisk,
  deleteStudentFromDisk,
  unmarkStudentDeletedOnDisk,
  buildDefaultStudentProfile,
  RegisteredStudentUser,
} from '@/lib/studentUserStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const students = readStudentsFromDisk();
    return NextResponse.json({
      success: true,
      students,
      count: students.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to read students from disk' },
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

    // Unmark any prior deletion of this phone / email
    unmarkStudentDeletedOnDisk(cleanPhone, email?.trim());

    const students = readStudentsFromDisk();
    const existingIndex = students.findIndex((s) => s.phone === cleanPhone);

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
      id: `msi-stu-${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      name: name.trim(),
      stream: resolvedStream,
      password: resolvedPassword,
      email: resolvedEmail,
      registeredAt: new Date().toISOString(),
      role: 'student',
      profile: defaultProfile,
    };

    if (existingIndex >= 0) {
      students[existingIndex] = {
        ...students[existingIndex],
        ...newStudent,
        id: students[existingIndex].id,
      };
    } else {
      students.push(newStudent);
    }

    writeStudentsToDisk(students);

    return NextResponse.json({
      success: true,
      message: `Student ${name} successfully enrolled and saved to permanent database.`,
      student: newStudent,
      students,
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

    const target = phone || id;
    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Missing phone or id parameter.' },
        { status: 400 }
      );
    }

    const deleted = deleteStudentFromDisk(target, id && phone ? id : undefined);

    const updatedStudents = readStudentsFromDisk();

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

    const students = readStudentsFromDisk();
    const student = students.find((s) => s.phone === cleanPhone);

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student record not found.' },
        { status: 404 }
      );
    }

    Object.assign(student, updates);
    if (student.profile && updates.profile) {
      student.profile = { ...student.profile, ...updates.profile };
    }

    writeStudentsToDisk(students);

    return NextResponse.json({
      success: true,
      message: 'Student record updated successfully.',
      student,
      students,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update student' },
      { status: 500 }
    );
  }
}
