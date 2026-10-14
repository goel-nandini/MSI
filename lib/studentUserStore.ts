import fs from 'fs';
import path from 'path';

export interface RegisteredStudentUser {
  id: string;
  phone: string; // 10-digit Indian phone number
  name: string;
  stream: string;
  password?: string; // Stored user password
  email?: string;
  registeredAt: string;
  lastLoginAt?: string;
  profile?: Record<string, any>; // Permanently persisted profile details
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
}

const studentsCache: Map<string, RegisteredStudentUser> = globalRef.__msi_students_cache;

/**
 * Initializes the student storage file and cache
 */
function initializeStore(): void {
  try {
    if (fs.existsSync(STUDENTS_FILE)) {
      const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
      const parsed: RegisteredStudentUser[] = JSON.parse(raw);
      parsed.forEach((s) => studentsCache.set(s.phone, s));
      return;
    }
  } catch (err) {
    console.warn('[StudentStore] Error reading students file, falling back to seed:', err);
  }

  // Populate seed students if cache empty
  SEED_STUDENTS.forEach((s) => studentsCache.set(s.phone, s));

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STUDENTS_FILE)) {
      fs.writeFileSync(STUDENTS_FILE, JSON.stringify(SEED_STUDENTS, null, 2), 'utf-8');
    }
  } catch (err) {
    // Read-only serverless environment fallback (e.g. Vercel)
  }
}

// Initialize on first module load
if (studentsCache.size === 0) {
  initializeStore();
}

/**
 * Flushes memory cache to persistent JSON file (safely handles read-only environments)
 */
function persistToFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const allStudents = Array.from(studentsCache.values());
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(allStudents, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[StudentStore] File persistence skipped (read-only environment):', err);
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

  newStudent.profile = buildDefaultStudentProfile(
    cleanPhone,
    newStudent.name,
    newStudent.stream,
    newStudent.email
  );

  studentsCache.set(cleanPhone, newStudent);
  persistToFile();

  return { success: true, student: newStudent };
}

/**
 * Builds a clean, personalised default StudentProfile for a specific phone number
 */
export function buildDefaultStudentProfile(
  phone: string,
  name?: string,
  stream?: string,
  email?: string
): Record<string, any> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const last4 = cleanPhone.slice(-4);

  return {
    id: `msi-stu-${last4}`,
    name: name?.trim() || 'MSI Student',
    email: email?.trim() || `student.${last4}@msi-institutes.edu.in`,
    phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
    dob: '2003-01-15',
    age: 22,
    gender: 'Male',
    enrollmentNo: `MSI/${currentYear}/${last4}`,
    rollNo: `${currentYear.toString().slice(-2)}-MSI-${last4}`,
    batch: `${stream || 'PCS-J Punjab Judicial Services'}, ${currentYear}–${nextYear}`,
    courseTitle: stream || 'PCS-J Punjab Judicial Services',
    semester: `Academic Year ${currentYear}–${nextYear}`,
    avatarUrl: '/images/avatars/avatar-1.webp',
    bloodGroup: 'B+',
    address: 'Kharar, Mohali, Punjab',
    guardianName: 'Guardian',
    guardianContact: `+91 ${cleanPhone.slice(0, 5)} 00000`,
    admissionDate: `01 July ${currentYear}`,
    validUntil: `30 June ${nextYear + 1}`,
  };
}

/**
 * Retrieves the permanently saved student profile for a given phone number
 */
export function getStudentProfile(rawPhone: string): Record<string, any> | null {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  let student = studentsCache.get(cleanPhone);

  if (!student) {
    return null;
  }

  if (student.profile && Object.keys(student.profile).length > 0) {
    return {
      ...buildDefaultStudentProfile(cleanPhone, student.name, student.stream, student.email),
      ...student.profile,
      phone: student.profile.phone || `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
    };
  }

  const defaultProfile = buildDefaultStudentProfile(
    cleanPhone,
    student.name,
    student.stream,
    student.email
  );
  student.profile = defaultProfile;
  persistToFile();
  return defaultProfile;
}

/**
 * Permanently saves or updates a student's profile by phone number into storage
 */
export function saveStudentProfile(
  rawPhone: string,
  profileUpdates: Record<string, any>
): Record<string, any> {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  let student = studentsCache.get(cleanPhone);

  if (!student) {
    // If student record does not exist yet, create one
    student = {
      id: `msi-stu-${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      name: profileUpdates.name?.trim() || 'MSI Student',
      stream: profileUpdates.courseTitle || profileUpdates.batch || 'PCS-J Punjab Judicial Services',
      password: 'Student@MSI2026',
      email: profileUpdates.email?.trim() || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`,
      registeredAt: new Date().toISOString(),
    };
    studentsCache.set(cleanPhone, student);
  }

  const existingProfile =
    student.profile ||
    buildDefaultStudentProfile(cleanPhone, student.name, student.stream, student.email);

  const updatedProfile = {
    ...existingProfile,
    ...profileUpdates,
    phone: profileUpdates.phone || existingProfile.phone || `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
  };

  // Sync core fields back to student account
  if (profileUpdates.name) student.name = profileUpdates.name.trim();
  if (profileUpdates.email) student.email = profileUpdates.email.trim();
  if (profileUpdates.courseTitle) student.stream = profileUpdates.courseTitle;
  student.profile = updatedProfile;

  persistToFile();
  return updatedProfile;
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
