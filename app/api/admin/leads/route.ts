import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_LEADS, Lead } from '@/components/reception/data/leadsMockData';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

function readLeadsFromDisk(): Lead[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LEADS_FILE)) {
      const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    // Seed initial leads if file does not exist
    fs.writeFileSync(LEADS_FILE, JSON.stringify(INITIAL_LEADS, null, 2), 'utf-8');
    return INITIAL_LEADS;
  } catch (err) {
    console.error('[Leads Disk Error]', err);
    return INITIAL_LEADS;
  }
}

function writeLeadsToDisk(leads: Lead[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Leads Write Error]', err);
  }
}

export async function GET() {
  const leads = readLeadsFromDisk();
  return NextResponse.json({
    success: true,
    leads,
    count: leads.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, mobile, location, targetCourse, source, notes, agent } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Lead name is required.' },
        { status: 400 }
      );
    }

    if (!mobile || !mobile.trim()) {
      return NextResponse.json(
        { success: false, message: 'Valid mobile number is required.' },
        { status: 400 }
      );
    }

    const leads = readLeadsFromDisk();
    const cleanPhone = mobile.replace(/\D/g, '').slice(-10);

    const newLead: Lead = {
      id: `lead-sa-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      mobile: cleanPhone.length === 10 ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : mobile.trim(),
      location: location?.trim() || 'Chandigarh / Mohali (NCR)',
      targetCourse: targetCourse || 'PCS-J Comprehensive Foundation 2026-27',
      source: source || 'Super Admin (#2410)',
      receivedDate: 'Just now (Today)',
      status: 'New',
      latestRemark: notes?.trim() || 'Inbound lead entered via Super Admin Master Console.',
      fullRemark: notes?.trim() || 'Inbound inquiry routed directly to Reception & Telecalling desk.',
      agent: agent || 'Harshit (Reception Desk)',
      remarksHistory: [
        {
          id: `rem-${Date.now()}`,
          outcome: 'Connected — Interested',
          text: notes?.trim() || 'Generated via Super Admin Master Portal',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: 'Super Admin',
          leadStatus: 'New',
        },
      ],
    };

    const updated = [newLead, ...leads];
    writeLeadsToDisk(updated);

    return NextResponse.json({
      success: true,
      message: 'New lead successfully generated and dispatched to Reception Desk.',
      lead: newLead,
      leads: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to save lead' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Lead ID is required.' },
        { status: 400 }
      );
    }

    const leads = readLeadsFromDisk();
    const index = leads.findIndex((l) => l.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Lead not found.' },
        { status: 404 }
      );
    }

    leads[index] = { ...leads[index], ...updates };
    writeLeadsToDisk(leads);

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully.',
      lead: leads[index],
      leads,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update lead' },
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
        { success: false, message: 'Lead ID is required.' },
        { status: 400 }
      );
    }

    const leads = readLeadsFromDisk();
    const filtered = leads.filter((l) => l.id !== id);

    if (filtered.length === leads.length) {
      return NextResponse.json(
        { success: false, message: 'Lead not found.' },
        { status: 404 }
      );
    }

    writeLeadsToDisk(filtered);

    return NextResponse.json({
      success: true,
      message: 'Lead removed successfully.',
      leads: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
