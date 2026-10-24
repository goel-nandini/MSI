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
const DELETED_STUDENTS_FILE = path.join(DATA_DIR, 'deleted_students.json');

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

export interface DeletedStudentRecord {
  id?: string;
  phone?: string;
  email?: string;
  name?: string;
  deletedAt: string;
}

/**
 * Reads all permanently deleted student accounts from data/deleted_students.json
 */
export function readDeletedStudentsFromDisk(): DeletedStudentRecord[] {
  try {
    if (fs.existsSync(DELETED_STUDENTS_FILE)) {
      const raw = fs.readFileSync(DELETED_STUDENTS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
    return [];
  } catch (err) {
    console.warn('[StudentStore] Error reading deleted students list:', err);
    return [];
  }
}

/**
 * Marks a student permanently deleted on disk so they never reappear
 */
export function markStudentDeletedOnDisk(record: {
  id?: string;
  phone?: string;
  email?: string;
  name?: string;
}): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = readDeletedStudentsFromDisk();
    const cleanId = (record.id || '').trim().toLowerCase();
    const cleanEmail = (record.email || '').trim().toLowerCase();
    const cleanPhone = (record.phone || '').replace(/\D/g, '').slice(-10);

    const exists = current.some((d) => {
      const dId = (d.id || '').trim().toLowerCase();
      const dEmail = (d.email || '').trim().toLowerCase();
      const dPhone = (d.phone || '').replace(/\D/g, '').slice(-10);
      return (
        (cleanId && dId === cleanId) ||
        (cleanEmail && dEmail === cleanEmail) ||
        (cleanPhone.length >= 10 && dPhone === cleanPhone)
      );
    });

    if (!exists) {
      current.push({
        id: record.id,
        phone: record.phone,
        email: record.email,
        name: record.name,
        deletedAt: new Date().toISOString(),
      });
      fs.writeFileSync(DELETED_STUDENTS_FILE, JSON.stringify(current, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[StudentStore] Error writing deleted student record:', err);
  }
}

/**
 * Checks whether an identifier (phone, email, ID) belongs to a deleted student
 */
export function isStudentDeleted(identifier: string): boolean {
  if (!identifier) return false;
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/\D/g, '').slice(-10);
  const deleted = readDeletedStudentsFromDisk();

  return deleted.some((d) => {
    const dId = (d.id || '').trim().toLowerCase();
    const dEmail = (d.email || '').trim().toLowerCase();
    const dPhone = (d.phone || '').replace(/\D/g, '').slice(-10);
    const dName = (d.name || '').trim().toLowerCase();

    if (clean && (dId === clean || dEmail === clean || dName === clean)) return true;
    if (cleanPhone.length >= 10 && dPhone === cleanPhone) return true;
    return false;
  });
}

/**
 * Unmarks a student from deleted_students.json when re-enrolled or re-created
 */
export function unmarkStudentDeletedOnDisk(phoneOrId: string, email?: string): void {
  try {
    if (!fs.existsSync(DELETED_STUDENTS_FILE)) return;
    const deletedList = readDeletedStudentsFromDisk();
    const cleanPhone = phoneOrId.replace(/\D/g, '').slice(-10);
    const cleanId = phoneOrId.trim().toLowerCase();
    const cleanEmail = (email || '').trim().toLowerCase();

    const filtered = deletedList.filter((d) => {
      const dPhone = (d.phone || '').replace(/\D/g, '').slice(-10);
      const dId = (d.id || '').trim().toLowerCase();
      const dEmail = (d.email || '').trim().toLowerCase();
      if (cleanPhone.length >= 10 && dPhone === cleanPhone) return false;
      if (cleanId && dId === cleanId) return false;
      if (cleanEmail && dEmail === cleanEmail) return false;
      return true;
    });

    if (filtered.length !== deletedList.length) {
      fs.writeFileSync(DELETED_STUDENTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[StudentStore] Error unmarking deleted student:', err);
  }
}

/**
 * Reads all students directly from data/students.json, strictly filtering out any deleted students.
 */
export function readStudentsFromDisk(): RegisteredStudentUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const deletedList = readDeletedStudentsFromDisk();
    const isDeleted = (s: RegisteredStudentUser) => {
      const sId = (s.id || '').toLowerCase().trim();
      const sEmail = (s.email || '').toLowerCase().trim();
      const sPhone = (s.phone || '').replace(/\D/g, '').slice(-10);
      return deletedList.some((d) => {
        const dId = (d.id || '').toLowerCase().trim();
        const dEmail = (d.email || '').toLowerCase().trim();
        const dPhone = (d.phone || '').replace(/\D/g, '').slice(-10);
        return (
          (sId && dId && sId === dId) ||
          (sEmail && dEmail && sEmail === dEmail) ||
          (sPhone.length >= 10 && dPhone.length >= 10 && sPhone === dPhone)
        );
      });
    };

    if (fs.existsSync(STUDENTS_FILE)) {
      const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((s) => !isDeleted(s));
        }
      }
    }
    // File missing or empty: write seed students excluding deleted
    const initialFiltered = SEED_STUDENTS.filter((s) => !isDeleted(s));
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(initialFiltered, null, 2), 'utf-8');
    return initialFiltered;
  } catch (err) {
    console.warn('[StudentStore] Error reading students from disk:', err);
    return [];
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

  // If this student was previously deleted, remove them from deleted_students.json
  try {
    const deletedList = readDeletedStudentsFromDisk();
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const filteredDeleted = deletedList.filter((d) => {
      const dPhone = (d.phone || '').replace(/\D/g, '').slice(-10);
      const dEmail = (d.email || '').trim().toLowerCase();
      if (dPhone === cleanPhone) return false;
      if (cleanEmail && dEmail === cleanEmail) return false;
      return true;
    });
    if (filteredDeleted.length !== deletedList.length) {
      fs.writeFileSync(DELETED_STUDENTS_FILE, JSON.stringify(filteredDeleted, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[StudentStore] Error unmarking deleted student:', err);
  }

  const students = readStudentsFromDisk();
  const existingIndex = students.findIndex((s) => s.phone === cleanPhone);

  if (existingIndex >= 0) {
    const existing = students[existingIndex];
    if (data.name && data.name.trim()) existing.name = data.name.trim();
    if (data.stream) existing.stream = data.stream;
    if (data.email && data.email.trim()) existing.email = data.email.trim();
    if (data.password && data.password.trim()) existing.password = data.password.trim();
    if (!existing.role) existing.role = 'student';

    // Refresh profile name & stream
    if (!existing.profile) {
      existing.profile = buildDefaultStudentProfile(
        cleanPhone,
        existing.name,
        existing.stream,
        existing.email
      );
    } else {
      if (data.name && data.name.trim()) existing.profile.name = data.name.trim();
      if (data.stream) existing.profile.courseTitle = data.stream;
    }

    students[existingIndex] = existing;
    writeStudentsToDisk(students);
    return {
      success: true,
      student: existing,
      message: 'Student account updated successfully.',
    };
  }

  const newStudent: RegisteredStudentUser = {
    id: `msi-stu-${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    name: data.name.trim() || 'MSI Student',
    stream: data.stream || 'PCS-J Punjab Judicial Services',
    password: (data.password || 'Student@MSI2026').trim(),
    email: data.email?.trim() || `student.${cleanPhone.slice(-4)}@msi-institutes.edu.in`,
    registeredAt: new Date().toISOString(),
    role: 'student',
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
 * Ensures a student is registered or updated on disk safely.
 */
export function ensureStudentExists(data: {
  phone: string;
  name?: string;
  stream?: string;
  email?: string;
  password?: string;
}): RegisteredStudentUser | null {
  const cleanPhone = (data.phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) return null;

  const result = registerStudentUser({
    phone: cleanPhone,
    name: data.name?.trim() || `Student ${cleanPhone.slice(-4)}`,
    stream: data.stream || 'PCS-J Punjab Judicial Services',
    password: data.password?.trim() || 'Student@MSI2026',
    email: data.email?.trim(),
  });

  return result.student || null;
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
export function getStudentProfile(rawPhone: string): Record<string, any> | null {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

  // If student is permanently deleted, do NOT resurrect or return profile
  if (isStudentDeleted(cleanPhone)) {
    return null;
  }

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

  // If student record does not exist yet on disk, return null rather than silently writing a phantom account
  return null;
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
  code?: 'NOT_FOUND' | 'INVALID_PASSWORD' | 'SUCCESS' | 'TERMINATED';
  message: string;
} {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const cleanInput = rawPhone.trim().toLowerCase();

  // If student was deleted by administration, strictly reject with termination message
  if (isStudentDeleted(cleanPhone) || isStudentDeleted(cleanInput)) {
    return {
      success: false,
      code: 'TERMINATED',
      message: 'We are sorry, unable to login. Your student account access has been cancelled/terminated by Administration.',
    };
  }

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
 * Deletes a student account by phone number or ID directly from disk and registers in deleted registry
 */
export function deleteStudentFromDisk(rawPhoneOrId: string, additionalId?: string): boolean {
  const cleanPhone = rawPhoneOrId.replace(/\D/g, '').slice(-10);
  const cleanId = rawPhoneOrId.trim().toLowerCase();
  const addId = (additionalId || '').trim().toLowerCase();

  const students = readStudentsFromDisk();

  // Find target before filtering to register full record in deleted_students.json
  const target = students.find((s) => {
    const sPhone = (s.phone || '').replace(/\D/g, '').slice(-10);
    const sId = (s.id || '').trim().toLowerCase();
    return (
      (cleanPhone.length >= 10 && sPhone === cleanPhone) ||
      sId === cleanId ||
      (addId && sId === addId)
    );
  });

  if (target) {
    markStudentDeletedOnDisk({
      id: target.id,
      phone: target.phone,
      email: target.email,
      name: target.name,
    });
  } else {
    markStudentDeletedOnDisk({
      id: rawPhoneOrId,
      phone: cleanPhone.length >= 10 ? cleanPhone : undefined,
    });
  }

  const filtered = students.filter((s) => {
    const sPhone = (s.phone || '').replace(/\D/g, '').slice(-10);
    const sId = (s.id || '').trim().toLowerCase();
    const matchPhone = cleanPhone.length >= 10 && sPhone === cleanPhone;
    const matchId = sId === cleanId || (addId && sId === addId);
    return !matchPhone && !matchId;
  });

  writeStudentsToDisk(filtered);

  // Cascade cleanup in enrollments.json (remove all enrollments for this student)
  try {
    const ENROLLMENTS_FILE = path.join(DATA_DIR, 'enrollments.json');
    if (fs.existsSync(ENROLLMENTS_FILE)) {
      const raw = fs.readFileSync(ENROLLMENTS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const enrollments = JSON.parse(raw);
        if (Array.isArray(enrollments)) {
          const updatedEnrollments = enrollments.filter((e: any) => {
            const ePhone = (e.studentPhone || '').replace(/\D/g, '').slice(-10);
            const eId = (e.studentId || '').trim().toLowerCase();
            if (cleanPhone.length >= 10 && ePhone === cleanPhone) return false;
            if (eId === cleanId || (addId && eId === addId)) return false;
            return true;
          });
          fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(updatedEnrollments, null, 2), 'utf-8');
        }
      }
    }
  } catch (err) {
    console.warn('[StudentStore] Error cascading student deletion to enrollments:', err);
  }

  return true;
}
