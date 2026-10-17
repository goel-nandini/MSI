import { NextRequest, NextResponse } from 'next/server';
import { verifyFacultyCredentials, addOrUpdateTeacherOnDisk } from '@/lib/teacherUserStore';
import { TeacherApprovalRecord } from '@/lib/lmsStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, localTeachers } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both mobile number or Gmail ID and password.' },
        { status: 400 }
      );
    }

    // 1. Sync any local teachers provided by client if they aren't on disk
    if (Array.isArray(localTeachers) && localTeachers.length > 0) {
      const cleanId = String(identifier).trim().toLowerCase();
      const matchedLocal = localTeachers.find((t: TeacherApprovalRecord) => {
        const tEmail = (t.email || '').trim().toLowerCase();
        const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);
        const tName = (t.name || '').trim().toLowerCase();
        return (
          tEmail === cleanId ||
          tPhone === cleanId ||
          tName === cleanId ||
          (cleanId.includes('@') && tEmail === cleanId) ||
          (cleanId.includes('@') && tEmail.split('@')[0] === cleanId.split('@')[0])
        );
      });

      if (matchedLocal) {
        try {
          addOrUpdateTeacherOnDisk(matchedLocal);
        } catch (_) {}
      }
    }

    const result = verifyFacultyCredentials(identifier, password);

    if (!result.success || !result.teacher) {
      return NextResponse.json(
        { success: false, message: result.message || 'Invalid faculty credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Faculty authenticated successfully.',
      teacher: result.teacher,
    });
  } catch (error: any) {
    console.error('Teacher Auth Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
