import { NextRequest, NextResponse } from 'next/server';
import {
  readEnrollmentsFromDisk,
  addOrUpdateEnrollmentOnDisk,
  deleteEnrollmentsForCourseOnDisk,
  deleteEnrollmentsForStudentOnDisk,
} from '@/lib/enrollmentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const studentId = searchParams.get('studentId');
    const teacherId = searchParams.get('teacherId');
    const courseId = searchParams.get('courseId');

    const all = readEnrollmentsFromDisk();
    let filtered = all;

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      filtered = filtered.filter(
        (e) => (e.studentPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone
      );
    } else if (studentId) {
      const cleanId = studentId.trim().toLowerCase();
      filtered = filtered.filter(
        (e) => (e.studentId || '').trim().toLowerCase() === cleanId
      );
    }

    if (teacherId) {
      const cleanTeacher = teacherId.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.assignedByTeacherId && e.assignedByTeacherId.trim().toLowerCase() === cleanTeacher) ||
          (e.assignedByName && e.assignedByName.toLowerCase().includes(cleanTeacher))
      );
    }

    if (courseId) {
      const cleanCourse = courseId.trim().toLowerCase();
      filtered = filtered.filter((e) => e.courseId.trim().toLowerCase() === cleanCourse);
    }

    return NextResponse.json({
      success: true,
      enrollments: filtered,
      count: filtered.length,
      totalCount: all.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to read enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentPhone,
      studentName,
      studentId,
      courseId,
      courseTitle,
      assignedBy,
      assignedByName,
      assignedByTeacherId,
      assignedNote,
    } = body;

    if (!studentPhone && !studentId) {
      return NextResponse.json(
        { success: false, message: 'Student mobile number or ID is required.' },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = (studentPhone || '').replace(/\D/g, '').slice(-10) || '0000000000';

    const enrollment = addOrUpdateEnrollmentOnDisk({
      studentPhone: cleanPhone,
      studentName,
      studentId,
      courseId,
      courseTitle,
      assignedBy: assignedBy || 'super-admin',
      assignedByName: assignedByName || (assignedBy === 'teacher' ? 'Faculty Mentor' : 'MSI Super Admin'),
      assignedByTeacherId,
      assignedNote,
    });

    return NextResponse.json({
      success: true,
      message: `Course successfully assigned to student ${enrollment.studentName || cleanPhone}.`,
      enrollment,
      allEnrollments: readEnrollmentsFromDisk(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to save enrollment' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const studentPhone = searchParams.get('studentPhone');
    const studentId = searchParams.get('studentId');

    if (courseId) {
      deleteEnrollmentsForCourseOnDisk(courseId);
    }
    if (studentPhone || studentId) {
      deleteEnrollmentsForStudentOnDisk(studentPhone || studentId || '');
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment(s) deleted.',
      remaining: readEnrollmentsFromDisk(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error deleting enrollment' },
      { status: 500 }
    );
  }
}
