import { NextRequest, NextResponse } from 'next/server';
import {
  readTeachersFromDisk,
  addOrUpdateTeacherOnDisk,
  deleteTeacherFromDisk,
} from '@/lib/teacherUserStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teachers = readTeachersFromDisk();
    return NextResponse.json({
      success: true,
      teachers,
      count: teachers.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to read faculty from disk' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, specialization, experienceYears, password, temporaryPassword, department, designation } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Faculty name is required.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Official email or Gmail ID is required.' },
        { status: 400 }
      );
    }

    const result = addOrUpdateTeacherOnDisk({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '+91 98000 00000',
      specialization: specialization?.trim() || 'Constitutional Law & Jurisprudence',
      experienceYears: Number(experienceYears) || 8,
      password: (password || temporaryPassword || 'Faculty@MSI2026').trim(),
      temporaryPassword: (password || temporaryPassword || 'Faculty@MSI2026').trim(),
      department: department?.trim() || 'School of Law & Judicial Studies',
      designation: designation?.trim() || 'Professor of Law / Senior Jurist',
      status: 'approved',
      mustChangePassword: false,
    });

    return NextResponse.json({
      success: true,
      teacher: result.teacher,
      message: `Faculty member ${result.teacher.name} saved successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to save faculty' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Faculty ID is required for deletion.' },
        { status: 400 }
      );
    }

    deleteTeacherFromDisk(id);
    return NextResponse.json({
      success: true,
      message: 'Faculty member deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete faculty' },
      { status: 500 }
    );
  }
}
