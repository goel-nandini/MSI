import { NextRequest, NextResponse } from 'next/server';
import {
  readReceptionistsFromDisk,
  addOrUpdateReceptionistOnDisk,
  deleteReceptionistFromDisk,
} from '@/lib/receptionistStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const receptionists = readReceptionistsFromDisk();
    return NextResponse.json({
      success: true,
      receptionists,
      count: receptionists.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to read receptionists from disk' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Receptionist name is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const result = addOrUpdateReceptionistOnDisk({
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim(),
      password: password?.trim() || 'Harshit@reception',
    });

    return NextResponse.json({
      success: true,
      receptionist: result.receptionist,
      message: `Receptionist ${result.receptionist.name} successfully registered with login clearance.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to save receptionist' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json().catch(() => ({}));
        id = body?.id || body?.email || body?.phone;
      } catch (_) {}
    }

    if (!id || !id.trim()) {
      return NextResponse.json(
        { success: false, message: 'Receptionist ID, mobile number, or email required for deletion.' },
        { status: 400 }
      );
    }

    const result = deleteReceptionistFromDisk(id.trim());
    return NextResponse.json({
      success: true,
      message: `Receptionist (${id}) deleted successfully.`,
      receptionists: result.remainingReceptionists,
      count: result.remainingReceptionists.length,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error deleting receptionist' },
      { status: 500 }
    );
  }
}
