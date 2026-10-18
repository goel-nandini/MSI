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
  role?: string;
  profile?: Record<string, any>; // Permanently persisted profile details
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

// Default seeded staff accounts: Harshit (Reception Desk)
const SEED_STUDENTS: RegisteredStudentUser[] = [
  {
    id: 'staff-harshit',
    phone: '9792303434',
    name: 'Harshit',
    stream: 'Reception Desk & Visitor Management',
    password: 'Harshit@reception',
    email: 'harshit.reception@msi-institutes.edu.in',
    registeredAt: '2026-01-01T00:00:00.000Z',
    role: 'reception',
  },
];

/**
 * Reads all students directly from data/students.json with fallback to seeds.
 * Direct disk reads guarantee workers and multi-process server environments never get stale caches.
 */
export function readStudentsFromDisk(): RegisteredStudentUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STUDENTS_FILE)) {
      const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    // File missing or empty: write seed students
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(SEED_STUDENTS, null, 2), 'utf-8');
    return [...SEED_STUDENTS];
  } catch (err) {
    console.warn('[StudentStore] Error reading students from disk:', err);
    return [...SEED_STUDENTS];
  }
}

/**
 * Persists all students directly to data/students.json
 */
export function writeStudentsToDisk(students: RegisteredStudentUser[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[StudentStore] File persistence skipped (read-only environment):', err);
  }
}

/**
 * Checks whether a phone number is already registered
 */
export function isPhoneRegistered(rawPhone: string): boolean {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const students = readStudentsFromDisk();
  return students.some((s) => s.phone === cleanPhone);
}

/**
 * Retrieves a registered student by mobile number
 */
export function getStudentByPhone(rawPhone: string): RegisteredStudentUser | undefined {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const students = readStudentsFromDisk();
  return students.find((s) => s.phone === cleanPhone);
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

  const students = readStudentsFromDisk();
  const existing = students.find((s) => s.phone === cleanPhone);

  if (existing) {
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

  students.push(newStudent);
  writeStudentsToDisk(students);

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
  const last4 = cleanPhone ? cleanPhone.slice(-4) : '0000';
  const resolvedStream = stream?.trim() || 'PCS-J Punjab Judicial Services';
  const resolvedName = name?.trim() || (cleanPhone ? `Student ${last4}` : 'MSI Student');
  const resolvedEmail =
    email?.trim() ||
    (cleanPhone ? `student.${last4}@msi-institutes.edu.in` : 'student@msi-institutes.edu.in');

  return {
    id: `msi-stu-${last4}`,
    name: resolvedName,
    email: resolvedEmail,
    phone: cleanPhone ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : '+91 98765 00000',
    dob: '2003-01-15',
    age: 22,
    gender: 'Male',
    enrollmentNo: `MSI/${currentYear}/${last4}`,
    rollNo: `${currentYear.toString().slice(-2)}-MSI-${last4}`,
    batch: `${resolvedStream}, ${currentYear}–${nextYear}`,
    courseTitle: resolvedStream,
    semester: `Academic Year ${currentYear}–${nextYear}`,
    avatarUrl: '/images/avatars/avatar-1.webp',
    bloodGroup: 'B+',
    address: 'Kharar, Mohali, Punjab',
    guardianName: 'Guardian',
    guardianContact: cleanPhone ? `+91 ${cleanPhone.slice(0, 5)} 00000` : '+91 98765 00000',
    admissionDate: `01 July ${currentYear}`,
    validUntil: `30 June ${nextYear + 1}`,
  };
}

/**
 * Retrieves the permanently saved student profile for a given phone number
 */
export function getStudentProfile(rawPhone: string): Record<string, any> {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const students = readStudentsFromDisk();
  let student = students.find((s) => s.phone === cleanPhone);

  if (student) {
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
    writeStudentsToDisk(students);
    return defaultProfile;
  }

  // If student record does not exist yet on disk, create one for this phone number
  const defaultProfile = buildDefaultStudentProfile(cleanPhone);
  const newStudent: RegisteredStudentUser = {
    id: `msi-stu-${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    name: defaultProfile.name,
    stream: defaultProfile.courseTitle,
    password: 'Student@MSI2026',
    email: defaultProfile.email,
    registeredAt: new Date().toISOString(),
    profile: defaultProfile,
  };
  students.push(newStudent);
  writeStudentsToDisk(students);
  return defaultProfile;
}

/**
 * Permanently saves or updates a student's profile by phone number into disk storage
 */
export function saveStudentProfile(
  rawPhone: string,
  profileUpdates: Record<string, any>,
  previousPhone?: string
): Record<string, any> {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const cleanPrev = previousPhone ? previousPhone.replace(/\D/g, '').slice(-10) : '';

  const students = readStudentsFromDisk();

  // Look for existing student by current cleanPhone or previousPhone
  let studentIndex = students.findIndex((s) => s.phone === cleanPhone);
  if (studentIndex === -1 && cleanPrev) {
    studentIndex = students.findIndex((s) => s.phone === cleanPrev);
  }

  let student: RegisteredStudentUser;

  if (studentIndex >= 0) {
    student = students[studentIndex];
    // If phone number was modified, migrate phone key
    if (cleanPhone && cleanPhone !== student.phone) {
      student.phone = cleanPhone;
    }
  } else {
    // Brand new student record
    student = {
      id: `msi-stu-${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      name: profileUpdates.name?.trim() || 'MSI Student',
      stream:
        profileUpdates.courseTitle || profileUpdates.batch || 'PCS-J Punjab Judicial Services',
      password: 'Student@MSI2026',
      email:
        profileUpdates.email?.trim() || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`,
      registeredAt: new Date().toISOString(),
    };
    students.push(student);
    studentIndex = students.length - 1;
  }

  const existingProfile =
    student.profile ||
    buildDefaultStudentProfile(cleanPhone, student.name, student.stream, student.email);

  const updatedProfile: Record<string, any> = {
    ...existingProfile,
    ...profileUpdates,
    phone:
      profileUpdates.phone ||
      existingProfile.phone ||
      `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
  };

  // Sync core fields back to student account
  if (profileUpdates.name && profileUpdates.name.trim()) {
    student.name = profileUpdates.name.trim();
    updatedProfile.name = student.name;
  }
  if (profileUpdates.email && profileUpdates.email.trim()) {
    student.email = profileUpdates.email.trim();
    updatedProfile.email = student.email;
  }
  if (profileUpdates.courseTitle && profileUpdates.courseTitle.trim()) {
    student.stream = profileUpdates.courseTitle.trim();
    updatedProfile.courseTitle = student.stream;
  }
  if (profileUpdates.batch && profileUpdates.batch.trim()) {
    updatedProfile.batch = profileUpdates.batch.trim();
  }

  student.profile = updatedProfile;
  students[studentIndex] = student;

  writeStudentsToDisk(students);
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
  const cleanInput = rawPhone.trim().toLowerCase();
  const students = readStudentsFromDisk();
  const student = students.find(
    (s) =>
      (cleanPhone.length >= 10 && s.phone === cleanPhone) ||
      (s.email && s.email.trim().toLowerCase() === cleanInput)
  );

  if (!student) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Mobile number not registered. Please register a new student account first.',
    };
  }

  const isPasswordMatch =
    student.password === rawPassword.trim() ||
    student.password?.toLowerCase() === rawPassword.trim().toLowerCase();

  if (!isPasswordMatch) {
    return {
      success: false,
      code: 'INVALID_PASSWORD',
      message: 'Incorrect password. Please verify and try again.',
    };
  }

  // Update last login timestamp
  student.lastLoginAt = new Date().toISOString();
  writeStudentsToDisk(students);

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
  const students = readStudentsFromDisk();
  const student = students.find((s) => s.phone === cleanPhone);
  if (!student) return false;

  Object.assign(student, updates);
  writeStudentsToDisk(students);
  return true;
}

/**
 * Deletes a student account by phone number or ID directly from disk
 */
export function deleteStudentFromDisk(rawPhoneOrId: string): boolean {
  const cleanPhone = rawPhoneOrId.replace(/\D/g, '').slice(-10);
  const students = readStudentsFromDisk();
  const initialLength = students.length;
  const filtered = students.filter(
    (s) => s.phone !== cleanPhone && s.id !== rawPhoneOrId
  );
  if (filtered.length !== initialLength) {
    writeStudentsToDisk(filtered);
    return true;
  }
  return false;
}
