import { NextRequest, NextResponse } from 'next/server';
import { verifyFacultyCredentials } from '@/lib/teacherUserStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both mobile number or Gmail ID and password.' },
        { status: 400 }
      );
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
