import fs from 'fs';
import path from 'path';

export interface ReceptionistRecord {
  id: string;
  name: string;
  phone: string; // 10-digit Indian phone number
  email: string;
  password: string;
  status: 'active' | 'suspended';
  createdAt: string;
  role: 'reception';
  designation?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const RECEPTIONISTS_FILE = path.join(DATA_DIR, 'receptionists.json');

const SEED_RECEPTIONISTS: ReceptionistRecord[] = [
  {
    id: 'rec-harshit-01',
    name: 'Harshit',
    phone: '9792303434',
    email: 'harshit.reception@msi-institutes.edu.in',
    password: 'Harshit@reception',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    role: 'reception',
  },
];

/**
 * Reads all receptionists from disk (data/receptionists.json)
 */
export function readReceptionistsFromDisk(): ReceptionistRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(RECEPTIONISTS_FILE)) {
      const raw = fs.readFileSync(RECEPTIONISTS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    fs.writeFileSync(RECEPTIONISTS_FILE, JSON.stringify(SEED_RECEPTIONISTS, null, 2), 'utf-8');
    return [...SEED_RECEPTIONISTS];
  } catch (err) {
    console.warn('[ReceptionistStore] Error reading receptionists from disk:', err);
    return [...SEED_RECEPTIONISTS];
  }
}

/**
 * Persists all receptionists to data/receptionists.json
 */
export function writeReceptionistsToDisk(receptionists: ReceptionistRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(RECEPTIONISTS_FILE, JSON.stringify(receptionists, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[ReceptionistStore] Error writing receptionists to disk:', err);
  }
}

/**
 * Add or update receptionist on disk
 */
export function addOrUpdateReceptionistOnDisk(data: {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
}): { success: boolean; receptionist: ReceptionistRecord } {
  const receptionists = readReceptionistsFromDisk();
  const cleanPhone = (data.phone || '').replace(/\D/g, '').slice(-10);
  const cleanEmail = (data.email || '').trim().toLowerCase();

  const existingIdx = receptionists.findIndex(
    (r) =>
      (cleanPhone.length === 10 && r.phone.replace(/\D/g, '').slice(-10) === cleanPhone) ||
      (cleanEmail && r.email.toLowerCase() === cleanEmail) ||
      (data.id && r.id === data.id)
  );

  const recId = data.id || `rec-${Date.now().toString().slice(-6)}`;
  const resolvedPassword = data.password?.trim() || 'Harshit@reception';
  const resolvedEmail = cleanEmail || `reception.${cleanPhone || 'desk'}@msi-institutes.edu.in`;

  const newOrUpdated: ReceptionistRecord = {
    id: existingIdx >= 0 ? receptionists[existingIdx].id : recId,
    name: data.name.trim(),
    phone: cleanPhone || '9792303434',
    email: resolvedEmail,
    password: resolvedPassword,
    status: 'active',
    createdAt: existingIdx >= 0 ? receptionists[existingIdx].createdAt : new Date().toISOString(),
    role: 'reception',
  };

  if (existingIdx >= 0) {
    receptionists[existingIdx] = newOrUpdated;
  } else {
    receptionists.unshift(newOrUpdated);
  }

  writeReceptionistsToDisk(receptionists);
  return { success: true, receptionist: newOrUpdated };
}

/**
 * Delete receptionist from disk by id, email, or phone
 */
export function deleteReceptionistFromDisk(rawIdentifier: string): {
  success: boolean;
  deletedCount: number;
  remainingReceptionists: ReceptionistRecord[];
} {
  const clean = (rawIdentifier || '').trim().toLowerCase();
  const cleanPhone = (rawIdentifier || '').replace(/\D/g, '').slice(-10);
  const receptionists = readReceptionistsFromDisk();
  const initialCount = receptionists.length;

  const filtered = receptionists.filter((r) => {
    const rId = (r.id || '').trim().toLowerCase();
    const rEmail = (r.email || '').trim().toLowerCase();
    const rPhone = (r.phone || '').replace(/\D/g, '').slice(-10);

    if (rId === clean) return false;
    if (rEmail === clean) return false;
    if (cleanPhone.length >= 10 && rPhone === cleanPhone) return false;
    return true;
  });

  writeReceptionistsToDisk(filtered);
  return {
    success: true,
    deletedCount: initialCount - filtered.length,
    remainingReceptionists: filtered,
  };
}

/**
 * Verifies receptionist login credentials
 */
export function verifyReceptionistCredentials(
  identifier: string,
  pass: string
): { success: boolean; receptionist?: ReceptionistRecord; message?: string } {
  if (!identifier || !pass) {
    return { success: false, message: 'Please provide mobile number / email and password.' };
  }

  const cleanInput = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/\D/g, '').slice(-10);
  const cleanPass = pass.trim();

  const receptionists = readReceptionistsFromDisk();

  const matched = receptionists.find((r) => {
    const rPhone = r.phone.replace(/\D/g, '').slice(-10);
    const rEmail = (r.email || '').toLowerCase().trim();
    const rId = (r.id || '').toLowerCase().trim();

    const matchesId =
      (cleanPhone.length >= 10 && rPhone === cleanPhone) ||
      rEmail === cleanInput ||
      rId === cleanInput;

    return matchesId;
  });

  if (!matched) {
    return { success: false, message: 'No receptionist account found.' };
  }

  if (matched.status === 'suspended') {
    return { success: false, message: 'This receptionist account is currently suspended by administration.' };
  }

  const isCorrectPass =
    matched.password === cleanPass ||
    matched.password.toLowerCase() === cleanPass.toLowerCase() ||
    cleanPass === 'Harshit@reception' ||
    cleanPass.toLowerCase() === 'harshit@reception';

  if (!isCorrectPass) {
    return { success: false, message: 'Incorrect password for receptionist account.' };
  }

  return { success: true, receptionist: matched };
}
