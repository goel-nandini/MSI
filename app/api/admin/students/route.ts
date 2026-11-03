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
    const { name, phone, stream, email, password, totalFee, paidFee, dueFee, nextDueDate } = body;

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

    const totalFeeNum = typeof totalFee !== 'undefined' ? Number(totalFee) || 0 : 0;
    const paidFeeNum = typeof paidFee !== 'undefined' ? Number(paidFee) || 0 : 0;
    const dueFeeNum = typeof dueFee !== 'undefined' ? Number(dueFee) || 0 : Math.max(0, totalFeeNum - paidFeeNum);

    const defaultProfile = buildDefaultStudentProfile(
      cleanPhone,
      name.trim(),
      resolvedStream,
      resolvedEmail,
      { totalFee: totalFeeNum, paidFee: paidFeeNum, dueFee: dueFeeNum, nextDueDate: nextDueDate || '' }
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
      totalFee: totalFeeNum,
      paidFee: paidFeeNum,
      dueFee: dueFeeNum,
      nextDueDate: nextDueDate || '',
      profile: {
        ...defaultProfile,
        totalFee: totalFeeNum,
        paidFee: paidFeeNum,
        dueFee: dueFeeNum,
        nextDueDate: nextDueDate || '',
      },
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

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const cleanId = (id || '').trim();

    await deleteStudentAsync(cleanPhone || cleanId, cleanId || cleanPhone);

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
    const { phone, id, updates } = body;

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const targetId = (id || '').trim();

    if (!cleanPhone && !targetId) {
      return NextResponse.json(
        { success: false, message: 'Valid phone or ID is required for update.' },
        { status: 400 }
      );
    }

    const students = await getStudentsAsync();
    const student = students.find((s) => {
      const sPhone = (s.phone || '').replace(/\D/g, '').slice(-10);
      return (cleanPhone && sPhone === cleanPhone) || (targetId && s.id === targetId);
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student record not found.' },
        { status: 404 }
      );
    }

    const resolvedTotalFee = typeof updates.totalFee !== 'undefined' ? (Number(updates.totalFee) || 0) : (student.totalFee ?? 0);
    const resolvedPaidFee = typeof updates.paidFee !== 'undefined' ? (Number(updates.paidFee) || 0) : (student.paidFee ?? 0);
    const resolvedDueFee = typeof updates.dueFee !== 'undefined' ? (Number(updates.dueFee) || 0) : Math.max(0, resolvedTotalFee - resolvedPaidFee);
    const resolvedNextDueDate = updates.nextDueDate !== undefined ? updates.nextDueDate : (student.nextDueDate || '');

    const updatedStudent: RegisteredStudentUser = {
      ...student,
      ...updates,
      totalFee: resolvedTotalFee,
      paidFee: resolvedPaidFee,
      dueFee: resolvedDueFee,
      nextDueDate: resolvedNextDueDate,
      profile: {
        ...(student.profile || {}),
        ...(updates.profile || {}),
        name: updates.name ? updates.name.trim() : student.name,
        email: updates.email ? updates.email.trim() : student.email,
        courseTitle: updates.stream ? updates.stream.trim() : (student.stream || student.profile?.courseTitle),
        batch: updates.stream ? updates.stream.trim() : (student.profile?.batch || student.stream),
        totalFee: resolvedTotalFee,
        paidFee: resolvedPaidFee,
        dueFee: resolvedDueFee,
        nextDueDate: resolvedNextDueDate,
      },
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
