import fs from 'fs';
import path from 'path';
import { TeacherApprovalRecord } from './lmsStore';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');

// Default seeded faculty accounts: authentic MSI handbooks
const SEED_TEACHERS: TeacherApprovalRecord[] = [
  {
    id: 'fac-law-ekta',
    name: 'Dr. Ekta Gahlawat',
    email: 'drektagahlawat@msi.edu.in',
    phone: '9792303434',
    avatarUrl: '/images/avatars/avatar-2.webp',
    department: 'School of Law & Legal Studies',
    designation: 'Faculty – Legal Studies, MSI Group of Institutes',
    qualifications: 'Ph.D. in Law, LL.M. (Constitutional Jurisprudence & Torts)',
    experienceYears: 14,
    stream: 'Law',
    bio: 'Faculty for Legal Reasoning (MSI/LEGSTUDIES-/01). Specializes in passage-based analytical reasoning, principle-fact deduction, Constitutional Law, Torts, Contracts, and Criminal Jurisprudence for CLAT UG.',
    specialization: 'Legal Reasoning, Constitutional Law, Law of Torts, Law of Contracts',
    sampleLectureTitle: 'Principle-Fact Deduction & Ratio Decidendi Extraction',
    sampleLectureDuration: '45 mins',
    status: 'approved',
    applicationDate: '10 Jan 2025',
    approvedAt: '12 Jan 2025',
    approvedBy: 'Governing Academic Directorate',
    assignedCourseIds: ['crs-msi-legstudies', 'crs-udemy-pcsj'],
    rating: 4.9,
    studentsCount: 1680,
    password: 'Faculty@MSI2026',
    temporaryPassword: 'Faculty@MSI2026',
    mustChangePassword: false,
  },
  {
    id: 'fac-law-anurag',
    name: 'Mr. Anurag Dwivedi',
    email: 'anurag.dwivedi@msigroup.edu.in',
    phone: '+91 98144 23002',
    avatarUrl: '/images/avatars/avatar-1.webp',
    department: 'General Knowledge & Current Affairs Directorate',
    designation: 'Faculty – General Knowledge & Current Affairs, MSI Group of Institutes',
    qualifications: 'M.A. International Relations (JNU), M.Phil. Public Policy',
    experienceYears: 12,
    stream: 'Law',
    bio: 'Lead faculty for GK & Current Affairs (MSI/GKCA/01, 180 Sessions). Leads daily editorial analysis, constitutional developments, multilateral geopolitics, macroeconomic policies, and the complete static GK addendum.',
    specialization: 'Constitutional Developments, Geopolitics, Union Budget, Static GK (History & Polity)',
    sampleLectureTitle: 'Supreme Court Constitution-Bench Reasoning & Global South Diplomacy',
    sampleLectureDuration: '48 mins',
    status: 'approved',
    applicationDate: '12 Jan 2025',
    approvedAt: '14 Jan 2025',
    approvedBy: 'Governing Academic Directorate',
    assignedCourseIds: ['crs-msi-gkca'],
    rating: 4.9,
    studentsCount: 2150,
    password: 'Faculty@MSI2026',
    temporaryPassword: 'Faculty@MSI2026',
    mustChangePassword: false,
  },
  {
    id: 'fac-law-riya',
    name: 'Ms. Riya Hooda',
    email: 'msifaculty009@gmail.com',
    phone: '+91 98144 23003',
    avatarUrl: '/images/avatars/avatar-4.webp',
    department: 'Aptitude & Critical Reasoning Division',
    designation: 'Faculty – Logical Reasoning, MSI Group of Institutes',
    qualifications: 'M.Sc. Mathematics, Certified Analytical Reasoning Specialist',
    experienceYears: 10,
    stream: 'Law',
    bio: 'Lead mentor for Logical Reasoning (MSI/LR/01, 126 Sessions). Pioneer of the assumption-negation method, multi-parameter puzzle solving, Euler diagram syllogisms, and speed-accuracy optimization for CLAT & AILET.',
    specialization: 'Critical Reasoning, Analytical Puzzles, Syllogisms, Coding-Decoding',
    sampleLectureTitle: 'Assumption-Negation Technique & Argument Structure Breakdown',
    sampleLectureDuration: '44 mins',
    status: 'approved',
    applicationDate: '15 Jan 2025',
    approvedAt: '16 Jan 2025',
    approvedBy: 'Governing Academic Directorate',
    assignedCourseIds: ['crs-msi-lr'],
    rating: 4.8,
    studentsCount: 1420,
    password: 'Faculty@MSI2026',
    temporaryPassword: 'Faculty@MSI2026',
    mustChangePassword: false,
  },
  {
    id: 'fac-law-shikha',
    name: 'Ms. Shikha Singh',
    email: 'Ss7487320@gmail.com',
    phone: '+91 98144 23004',
    avatarUrl: '/images/avatars/avatar-5.webp',
    department: 'English Language & Verbal Studies',
    designation: 'English Faculty, MSI Group of Institutes',
    qualifications: 'M.A. English Literature (Delhi University), UGC-NET Qualified',
    experienceYears: 9,
    stream: 'Law',
    bio: 'Faculty for English for CLAT (MSI/ENGCLAT-/01, 44 Sessions). Specializes in editorial passage mapping, etymology-based vocabulary building, literary devices, and grammar error-spotting drills.',
    specialization: 'Reading Comprehension, Contextual Vocabulary, Figures of Speech, Legal Vocabulary',
    sampleLectureTitle: 'Passage Mapping for Legal Editorials & Rhetorical Devices',
    sampleLectureDuration: '42 mins',
    status: 'approved',
    applicationDate: '18 Jan 2025',
    approvedAt: '20 Jan 2025',
    approvedBy: 'Governing Academic Directorate',
    assignedCourseIds: ['crs-msi-engclat'],
    rating: 4.8,
    studentsCount: 1290,
    password: 'Faculty@MSI2026',
    temporaryPassword: 'Faculty@MSI2026',
    mustChangePassword: false,
  },
  {
    id: 'fac-law-vikram',
    name: 'Dr. Vikramaditya Sharma',
    email: 'dr.vikramaditya@msi-institutes.edu.in',
    phone: '+91 98112 34567',
    avatarUrl: '/images/faculty/faculty-1.webp',
    department: 'School of Law & Judicial Services',
    designation: 'Senior Professor of Procedural Law & Judicial Studies',
    qualifications: 'Ph.D. in Constitutional Jurisprudence (Delhi University), LL.M (Gold Medalist)',
    experienceYears: 18,
    stream: 'Law',
    bio: 'Former judicial advisor with 18+ years experience guiding top rankers in PCS-J, Delhi Judicial Services, and CLAT UG/PG. Course director for PCS J Master Foundation (MSI/PCSJ/01).',
    specialization: 'Procedural Laws (CPC, CrPC, BNSS 2023), Judgment Writing, Constitutional Law',
    sampleLectureTitle: 'Framing of Issues in Civil Suits & Res Judicata Principles',
    sampleLectureDuration: '52 mins',
    status: 'approved',
    applicationDate: '12 Jan 2025',
    approvedAt: '15 Jan 2025',
    approvedBy: 'Governing Board / Super Admin',
    assignedCourseIds: ['crs-udemy-pcsj'],
    rating: 4.9,
    studentsCount: 1840,
    password: 'Faculty@MSI2026',
    temporaryPassword: 'Faculty@MSI2026',
    mustChangePassword: false,
  },
];

/**
 * Reads all faculty members directly from data/teachers.json with fallback to seeds.
 */
export function readTeachersFromDisk(): TeacherApprovalRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(TEACHERS_FILE)) {
      const raw = fs.readFileSync(TEACHERS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    // File missing or empty: write seed teachers
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(SEED_TEACHERS, null, 2), 'utf-8');
    return [...SEED_TEACHERS];
  } catch (err) {
    console.warn('[TeacherStore] Error reading teachers from disk:', err);
    return [...SEED_TEACHERS];
  }
}

/**
 * Persists all teachers directly to data/teachers.json
 */
export function writeTeachersToDisk(teachers: TeacherApprovalRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(teachers, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[TeacherStore] File persistence skipped (read-only environment):', err);
  }
}

/**
 * Retrieves teacher by email (case-insensitive), phone, or ID
 */
export function getTeacherByIdentifier(rawIdentifier: string): TeacherApprovalRecord | undefined {
  if (!rawIdentifier) return undefined;
  const clean = rawIdentifier.trim().toLowerCase();
  const cleanPhone = rawIdentifier.replace(/\D/g, '').slice(-10);
  const teachers = readTeachersFromDisk();

  return teachers.find((t) => {
    const tEmail = (t.email || '').trim().toLowerCase();
    const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);
    const tId = (t.id || '').trim().toLowerCase();

    if (tEmail === clean || tId === clean) return true;
    if (cleanPhone.length >= 10 && tPhone === cleanPhone) return true;

    // Fuzzy matching for Dr. Ekta
    if (
      (clean.includes('ekta') || clean.includes('gehlot') || clean.includes('gahlawat')) &&
      (t.name.toLowerCase().includes('ekta') || t.email.toLowerCase().includes('ekta'))
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Add or update teacher on disk
 */
export function addOrUpdateTeacherOnDisk(
  data: Partial<TeacherApprovalRecord> & { name: string; email: string }
): { success: boolean; teacher: TeacherApprovalRecord } {
  const teachers = readTeachersFromDisk();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = (data.phone || '').replace(/\D/g, '').slice(-10);

  const existingIndex = teachers.findIndex(
    (t) =>
      t.email.trim().toLowerCase() === cleanEmail ||
      (cleanPhone.length >= 10 && t.phone && t.phone.replace(/\D/g, '').slice(-10) === cleanPhone)
  );

  const teacherId = data.id || `fac-${Date.now()}`;
  const resolvedPassword = data.password?.trim() || data.temporaryPassword?.trim() || 'Faculty@MSI2026';

  const newOrUpdated: TeacherApprovalRecord = {
    id: existingIndex >= 0 ? teachers[existingIndex].id : teacherId,
    name: data.name.trim(),
    email: cleanEmail,
    phone: data.phone?.trim() || (existingIndex >= 0 ? teachers[existingIndex].phone : '+91 98000 00000'),
    avatarUrl: data.avatarUrl || '/images/avatars/avatar-2.webp',
    department: data.department || 'School of Law & Judicial Studies',
    designation: data.designation || 'Professor of Law & Faculty Jurist',
    qualifications: data.qualifications || 'LL.M / Ph.D in Law',
    experienceYears: Number(data.experienceYears) || 8,
    stream: data.stream || 'Law',
    bio: data.bio || `Faculty specialist in ${data.specialization || 'Jurisprudence'}.`,
    specialization: data.specialization || 'Constitutional Law & Jurisprudence',
    sampleLectureTitle: data.sampleLectureTitle || `${data.specialization || 'Law'} — Landmark Case Briefs`,
    sampleLectureDuration: data.sampleLectureDuration || '45 mins',
    status: data.status || 'approved',
    applicationDate: data.applicationDate || new Date().toISOString(),
    approvedAt: data.approvedAt || new Date().toISOString(),
    approvedBy: data.approvedBy || 'MSI Super Admin',
    assignedCourseIds: data.assignedCourseIds || (existingIndex >= 0 ? teachers[existingIndex].assignedCourseIds : ['crs-udemy-pcsj']),
    rating: data.rating || 4.9,
    studentsCount: data.studentsCount || 120,
    password: resolvedPassword,
    temporaryPassword: resolvedPassword,
    mustChangePassword: false, // Direct login is authorized immediately
  };

  if (existingIndex >= 0) {
    teachers[existingIndex] = newOrUpdated;
  } else {
    teachers.unshift(newOrUpdated);
  }

  writeTeachersToDisk(teachers);
  return { success: true, teacher: newOrUpdated };
}

/**
 * Delete teacher from disk
 */
export function deleteTeacherFromDisk(id: string): { success: boolean } {
  const teachers = readTeachersFromDisk();
  const filtered = teachers.filter((t) => t.id !== id);
  writeTeachersToDisk(filtered);
  return { success: true };
}

/**
 * Universal credential verification for faculty
 */
export function verifyFacultyCredentials(
  identifier: string,
  pass: string
): { success: boolean; teacher?: TeacherApprovalRecord; message?: string } {
  if (!identifier || !pass) {
    return { success: false, message: 'Please provide both mobile number or Gmail ID and password.' };
  }

  const cleanInput = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/\D/g, '').slice(-10);
  const cleanPass = pass.trim();
  const cleanPassLower = cleanPass.toLowerCase();

  const isAcceptedFacultyPassword =
    cleanPassLower === 'faculty@msi2026' ||
    cleanPassLower === 'msi@faculty2026' ||
    cleanPassLower === 'faculty@msi2025' ||
    cleanPassLower === 'msi@faculty2025' ||
    cleanPassLower === 'faculty@msi' ||
    cleanPassLower === 'msi@faculty' ||
    cleanPassLower === 'faculty' ||
    cleanPassLower === 'msi@superadmin' ||
    cleanPassLower === 'harshit@reception';

  const teachers = readTeachersFromDisk();

  // Find matching teacher
  const matched = teachers.find((t) => {
    const tEmail = (t.email || '').trim().toLowerCase();
    const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);

    // Exact email match (e.g. gmail ID)
    if (cleanInput.includes('@') && tEmail === cleanInput) return true;

    // Exact 10-digit phone match
    if (cleanPhone.length >= 10 && tPhone === cleanPhone) return true;

    // Fuzzy matching for Ekta
    if (
      (cleanInput.includes('ekta') || cleanInput.includes('gehlot') || cleanInput.includes('gahlawat')) &&
      (t.name.toLowerCase().includes('ekta') || t.email.toLowerCase().includes('ekta'))
    ) {
      return true;
    }

    // Name match
    if (t.name.trim().toLowerCase() === cleanInput) return true;

    return false;
  });

  if (!matched) {
    // Check if it's master phone/email fallback
    if (
      (cleanPhone === '9792303434' || cleanInput.includes('9792303434') || cleanInput.includes('drektagahlawat')) &&
      isAcceptedFacultyPassword
    ) {
      const ekta = teachers.find((t) => t.id === 'fac-law-ekta') || SEED_TEACHERS[0];
      return { success: true, teacher: ekta };
    }

    return {
      success: false,
      message: 'No faculty record found for this mobile number or email ID. Please contact Super Admin.',
    };
  }

  // Verify password:
  // 1. Accepted universal faculty passwords
  // 2. Exact match on stored password
  // 3. Lowercase match on stored password
  // 4. Stored temporary password match
  const storedPass = (matched.password || '').trim();
  const storedTemp = (matched.temporaryPassword || '').trim();

  const isPasswordValid =
    isAcceptedFacultyPassword ||
    (storedPass && (storedPass === cleanPass || storedPass.toLowerCase() === cleanPassLower)) ||
    (storedTemp && (storedTemp === cleanPass || storedTemp.toLowerCase() === cleanPassLower));

  if (!isPasswordValid) {
    return {
      success: false,
      message: 'Incorrect password for this faculty account. Please check credentials or contact Super Admin.',
    };
  }

  return { success: true, teacher: matched };
}
