import fs from 'fs';
import path from 'path';

export interface RegisteredStudentUser {
  id: string;
  phone: string; // 10-digit Indian phone number
  name: string;
  stream: string;
  password: string; // Stored user password
  email?: string;
  registeredAt: string;
  lastLoginAt?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

// Default seeded student accounts
const SEED_STUDENTS: RegisteredStudentUser[] = [
  {
    id: 'msi-stu-001',
    phone: '9876543210',
    name: 'Aarav Sharma',
    stream: 'PCS-J Punjab Judicial Services',
    password: 'Judiciary@2025',
    email: 'aarav.sharma@msi-institutes.edu.in',
    registeredAt: '2026-01-10T10:00:00.000Z',
  },
];

// In-memory cache to ensure fast lookups and support hot reloading
const globalRef = global as unknown as {
  __msi_students_cache?: Map<string, RegisteredStudentUser>;
};

if (!globalRef.__msi_students_cache) {
  globalRef.__msi_students_cache = new Map<string, RegisteredStudentUser>();
  initializeStore();
}

const studentsCache: Map<string, RegisteredStudentUser> = globalRef.__msi_students_cache;

/**
 * Initializes the student storage file and cache
 */
function initializeStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STUDENTS_FILE)) {
      fs.writeFileSync(STUDENTS_FILE, JSON.stringify(SEED_STUDENTS, null, 2), 'utf-8');
      SEED_STUDENTS.forEach((s) => studentsCache.set(s.phone, s));
      return;
    }

    const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
    const parsed: RegisteredStudentUser[] = JSON.parse(raw);
    parsed.forEach((s) => studentsCache.set(s.phone, s));
  } catch (err) {
    console.warn('[StudentStore] File initialization fallback to memory:', err);
    SEED_STUDENTS.forEach((s) => studentsCache.set(s.phone, s));
  }
}

/**
 * Flushes memory cache to persistent JSON file
 */
function persistToFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const allStudents = Array.from(studentsCache.values());
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(allStudents, null, 2), 'utf-8');
  } catch (err) {
    console.error('[StudentStore] Failed to persist students to file:', err);
  }
}

/**
 * Checks whether a phone number is already registered
 */
export function isPhoneRegistered(rawPhone: string): boolean {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  return studentsCache.has(cleanPhone);
}

/**
 * Retrieves a registered student by mobile number
 */
export function getStudentByPhone(rawPhone: string): RegisteredStudentUser | undefined {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  return studentsCache.get(cleanPhone);
}

/**
 * Registers a new student with password
 */
export function registerStudentUser(data: {
  phone: string;
  name: string;
  stream: string;
  password: string;
  email?: string;
}): { success: boolean; student?: RegisteredStudentUser; message?: string } {
  const cleanPhone = data.phone.replace(/\D/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    return { success: false, message: 'Invalid 10-digit mobile number format.' };
  }

  if (studentsCache.has(cleanPhone)) {
    return {
      success: false,
      message: 'This mobile number is already registered. Please sign in with your password.',
    };
  }

  const newStudent: RegisteredStudentUser = {
    id: `msi-stu-${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    name: data.name.trim() || 'MSI Student',
    stream: data.stream || 'PCS-J Punjab Judicial Services',
    password: data.password.trim(),
    email: data.email?.trim() || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`,
    registeredAt: new Date().toISOString(),
  };

  studentsCache.set(cleanPhone, newStudent);
  persistToFile();

  return { success: true, student: newStudent };
}

/**
 * Authenticates a student via mobile number + password (No OTP required)
 */
export function authenticateWithPassword(
  rawPhone: string,
  rawPassword: string
): {
  success: boolean;
  student?: RegisteredStudentUser;
  code?: 'NOT_FOUND' | 'INVALID_PASSWORD' | 'SUCCESS';
  message: string;
} {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const student = studentsCache.get(cleanPhone);

  if (!student) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Mobile number not registered. Please register a new student account first.',
    };
  }

  if (student.password !== rawPassword.trim()) {
    return {
      success: false,
      code: 'INVALID_PASSWORD',
      message: 'Incorrect password. Please verify and try again.',
    };
  }

  // Update last login timestamp
  student.lastLoginAt = new Date().toISOString();
  persistToFile();

  return {
    success: true,
    code: 'SUCCESS',
    student,
    message: 'Authentication successful.',
  };
}

/**
 * Updates a student's profile or password
 */
export function updateStudentAccount(
  rawPhone: string,
  updates: Partial<Omit<RegisteredStudentUser, 'id' | 'phone'>>
): boolean {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const student = studentsCache.get(cleanPhone);
  if (!student) return false;

  Object.assign(student, updates);
  persistToFile();
  return true;
}
