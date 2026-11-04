import { NextRequest, NextResponse } from 'next/server';
import { deleteStudentAsync, getStudentsAsync } from '@/lib/studentUserStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, phones } = body;

    const combined = [
      ...(Array.isArray(ids) ? ids : []),
      ...(Array.isArray(phones) ? phones : []),
    ];
    const uniqueIdentifiers = Array.from(
      new Set(combined.map((x) => String(x || '').trim()).filter(Boolean))
    );

    if (uniqueIdentifiers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide an array of student IDs or phone numbers to delete.' },
        { status: 400 }
      );
    }

    // Perform deletion for all selected students in parallel across MongoDB Atlas & disk
    await Promise.all(
      uniqueIdentifiers.map(async (ident: string) => {
        await deleteStudentAsync(ident, ident);
      })
    );

    const updatedStudents = await getStudentsAsync();

    return NextResponse.json({
      success: true,
      message: `${uniqueIdentifiers.length} student account(s) permanently deleted from records.`,
      deletedCount: uniqueIdentifiers.length,
      students: updatedStudents,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error bulk deleting students' },
      { status: 500 }
    );
  }
}
