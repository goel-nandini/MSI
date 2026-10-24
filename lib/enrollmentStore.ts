import fs from 'fs';
import path from 'path';

export interface PersistentEnrollment {
  id: string;
  studentId: string;
  studentPhone: string;
  studentName: string;
  courseId: string;
  courseTitle?: string;
  enrolledAt: string;
  progressPercentage: number;
  completedLectureIds: string[];
  assignedBy: 'self' | 'super-admin' | 'teacher';
  assignedByName?: string;
  assignedByTeacherId?: string;
  assignedNote?: string;
  certificateIssued?: boolean;
  lastActiveLectureId?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ENROLLMENTS_FILE = path.join(DATA_DIR, 'enrollments.json');

const SEED_ENROLLMENTS: PersistentEnrollment[] = [
  {
    id: 'enr-init-01',
    studentId: 'msi-stu-3210',
    studentPhone: '9876543210',
    studentName: 'Priya Verma',
    courseId: 'crs-msi-legstudies',
    courseTitle: 'Legal Reasoning for CLAT: Foundational Principles & Passage-Based Deduction (MSI/LEGSTUDIES-/01)',
    enrolledAt: '18 Oct 2026',
    progressPercentage: 42,
    completedLectureIds: ['lec-leg-1-1'],
    assignedBy: 'super-admin',
    assignedByName: 'MSI Super Admin',
    assignedNote: 'Direct Admissions Merit Clearance',
    certificateIssued: false,
  },
  {
    id: 'enr-init-02',
    studentId: 'msi-stu-1234',
    studentPhone: '9876501234',
    studentName: 'Rohit Malhotra',
    courseId: 'crs-msi-775270',
    courseTitle: 'Supreme Court Constitutional Doctrines & Case Law 2026',
    enrolledAt: '23 Oct 2026',
    progressPercentage: 15,
    completedLectureIds: ['lec-1792755775270-1'],
    assignedBy: 'teacher',
    assignedByName: 'Dr. Ekta Gahlawat',
    assignedByTeacherId: 'fac-law-ekta',
    assignedNote: 'Judiciary Cohort Masterclass batch assignment',
    certificateIssued: false,
  },
];

/**
 * Reads all enrollments from data/enrollments.json
 */
export function readEnrollmentsFromDisk(): PersistentEnrollment[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ENROLLMENTS_FILE)) {
      const raw = fs.readFileSync(ENROLLMENTS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
    fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(SEED_ENROLLMENTS, null, 2), 'utf-8');
    return [...SEED_ENROLLMENTS];
  } catch (err) {
    console.warn('[EnrollmentStore] Error reading enrollments from disk:', err);
    return [...SEED_ENROLLMENTS];
  }
}

/**
 * Persists all enrollments to data/enrollments.json
 */
export function writeEnrollmentsToDisk(enrollments: PersistentEnrollment[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(enrollments, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[EnrollmentStore] Error writing enrollments to disk:', err);
  }
}

/**
 * Adds or updates an enrollment on disk
 */
export function addOrUpdateEnrollmentOnDisk(data: {
  id?: string;
  studentId?: string;
  studentPhone: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  assignedBy?: 'self' | 'super-admin' | 'teacher';
  assignedByName?: string;
  assignedByTeacherId?: string;
  assignedNote?: string;
  progressPercentage?: number;
  completedLectureIds?: string[];
}): PersistentEnrollment {
  const enrollments = readEnrollmentsFromDisk();
  const cleanPhone = data.studentPhone.replace(/\D/g, '').slice(-10);
  const cleanCourseId = data.courseId.trim();

  const existingIdx = enrollments.findIndex((e) => {
    const ePhone = (e.studentPhone || '').replace(/\D/g, '').slice(-10);
    return ePhone === cleanPhone && e.courseId === cleanCourseId;
  });

  const enrollmentId = data.id || `enr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const dateFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const newOrUpdated: PersistentEnrollment = {
    id: existingIdx >= 0 ? enrollments[existingIdx].id : enrollmentId,
    studentId: data.studentId || (existingIdx >= 0 ? enrollments[existingIdx].studentId : `msi-stu-${cleanPhone.slice(-4)}`),
    studentPhone: cleanPhone,
    studentName: data.studentName?.trim() || (existingIdx >= 0 ? enrollments[existingIdx].studentName : `Student ${cleanPhone.slice(-4)}`),
    courseId: cleanCourseId,
    courseTitle: data.courseTitle?.trim() || (existingIdx >= 0 ? enrollments[existingIdx].courseTitle : undefined),
    enrolledAt: existingIdx >= 0 ? enrollments[existingIdx].enrolledAt : dateFormatted,
    progressPercentage: data.progressPercentage ?? (existingIdx >= 0 ? enrollments[existingIdx].progressPercentage : 0),
    completedLectureIds: data.completedLectureIds || (existingIdx >= 0 ? enrollments[existingIdx].completedLectureIds : []),
    assignedBy: data.assignedBy || (existingIdx >= 0 ? enrollments[existingIdx].assignedBy : 'self'),
    assignedByName: data.assignedByName || (existingIdx >= 0 ? enrollments[existingIdx].assignedByName : undefined),
    assignedByTeacherId: data.assignedByTeacherId || (existingIdx >= 0 ? enrollments[existingIdx].assignedByTeacherId : undefined),
    assignedNote: data.assignedNote || (existingIdx >= 0 ? enrollments[existingIdx].assignedNote : undefined),
    certificateIssued: existingIdx >= 0 ? enrollments[existingIdx].certificateIssued : false,
  };

  if (existingIdx >= 0) {
    enrollments[existingIdx] = newOrUpdated;
  } else {
    enrollments.unshift(newOrUpdated);
  }

  writeEnrollmentsToDisk(enrollments);
  return newOrUpdated;
}

/**
 * Removes all enrollments for a deleted course
 */
export function deleteEnrollmentsForCourseOnDisk(courseId: string): void {
  const cleanId = courseId.trim().toLowerCase();
  const enrollments = readEnrollmentsFromDisk();
  const filtered = enrollments.filter(
    (e) => e.courseId !== courseId && e.courseId.toLowerCase() !== cleanId
  );
  if (filtered.length !== enrollments.length) {
    writeEnrollmentsToDisk(filtered);
  }
}

/**
 * Removes all enrollments for a deleted student
 */
export function deleteEnrollmentsForStudentOnDisk(studentPhoneOrId: string): void {
  const cleanPhone = studentPhoneOrId.replace(/\D/g, '').slice(-10);
  const cleanId = studentPhoneOrId.trim().toLowerCase();
  const enrollments = readEnrollmentsFromDisk();

  const filtered = enrollments.filter((e) => {
    const ePhone = (e.studentPhone || '').replace(/\D/g, '').slice(-10);
    const eId = (e.studentId || '').trim().toLowerCase();
    if (cleanPhone.length >= 10 && ePhone === cleanPhone) return false;
    if (eId === cleanId) return false;
    return true;
  });

  if (filtered.length !== enrollments.length) {
    writeEnrollmentsToDisk(filtered);
  }
}

/**
 * Gets enrollments for a specific student
 */
export function getEnrollmentsForStudentOnDisk(studentPhoneOrId: string): PersistentEnrollment[] {
  const cleanPhone = studentPhoneOrId.replace(/\D/g, '').slice(-10);
  const cleanId = studentPhoneOrId.trim().toLowerCase();
  const enrollments = readEnrollmentsFromDisk();

  return enrollments.filter((e) => {
    const ePhone = (e.studentPhone || '').replace(/\D/g, '').slice(-10);
    const eId = (e.studentId || '').trim().toLowerCase();
    return (cleanPhone.length >= 10 && ePhone === cleanPhone) || eId === cleanId;
  });
}
