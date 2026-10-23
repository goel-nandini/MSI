import { NextRequest, NextResponse } from 'next/server';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/smsService';
import {
  getStudentProfile,
  saveStudentProfile,
  buildDefaultStudentProfile,
  isStudentDeleted,
} from '@/lib/studentUserStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Mobile number parameter is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeIndianPhone(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid 10-digit mobile number format.' },
        { status: 400 }
      );
    }

    if (isStudentDeleted(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          terminated: true,
          code: 'TERMINATED',
          message: 'Student account access has been cancelled or terminated by Administration.',
        },
        { status: 403 }
      );
    }

    let profile = getStudentProfile(cleanPhone);
    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          terminated: true,
          message: 'Student record not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('[API Student Profile GET Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve profile.', error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, profile, previousPhone } = body;

    if (!phone || !profile) {
      return NextResponse.json(
        { success: false, message: 'Both phone and profile payload are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeIndianPhone(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid 10-digit mobile number format.' },
        { status: 400 }
      );
    }

    const cleanPrevious = previousPhone ? sanitizeIndianPhone(previousPhone) : undefined;
    const saved = saveStudentProfile(cleanPhone, profile, cleanPrevious);

    return NextResponse.json({
      success: true,
      message: 'Student profile saved permanently.',
      profile: saved,
    });
  } catch (error: any) {
    console.error('[API Student Profile POST Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save profile.', error: error?.message },
      { status: 500 }
    );
  }
}
