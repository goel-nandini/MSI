'use client';

// ============================================================================
// MSI LMS & Academic Experience Central Data Store
// Authentic Handbook Syllabus Synchronization:
// 1. Legal Reasoning for CLAT (MSI/LEGSTUDIES-/01) — Dr. Ekta Gahlawat
// 2. General Knowledge & Current Affairs (MSI/GKCA/01) — Mr. Anurag Dwivedi
// 3. Logical Reasoning for CLAT & AILET (MSI/LR/01) — Ms. Riya Hooda
// 4. English for CLAT (MSI/ENGCLAT-/01) — Ms. Shikha Singh
// 5. PCS J Comprehensive Foundation & Procedural Law (MSI/PCSJ/01) — Dr. Vikramaditya Sharma
// ============================================================================

export interface UdemyLecture {
  id: string;
  title: string;
  duration: string;
  durationSeconds: number;
  videoUrl: string;
  preview: boolean;
  summary: string;
  resources?: {
    title: string;
    type: 'pdf' | 'doc' | 'notes';
    size: string;
    downloadUrl: string;
  }[];
}

export interface UdemySection {
  id: string;
  title: string;
  duration: string;
  lectures: UdemyLecture[];
}

export interface UdemyCourse {
  id: string;
  slug: string;
  title: string;
  headline: string;
  description: string;
  category: 'Judiciary' | 'Law Entrance' | 'Criminal Law' | 'Constitutional Law' | 'Cyber Law' | 'Postgraduate';
  department: 'law';
  badge?: 'Bestseller' | 'Highest Rated' | 'Hot & New' | 'Recommended';
  rating: number;
  reviewCount: number;
  totalDuration: string;
  totalLectures: number;
  level: 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  price: number;
  originalPrice: number;
  isFreeForMsiStudents: boolean;
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  whatYouWillLearn: string[];
  requirements: string[];
  sections: UdemySection[];
  updatedDate: string;
  language: string;
  isPublished: boolean;
}

export interface TeacherApprovalRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  department: string;
  designation: string;
  qualifications: string;
  experienceYears: number;
  stream: 'Law' | 'JEE';
  bio: string;
  specialization: string;
  sampleLectureTitle: string;
  sampleLectureDuration: string;
  status: 'approved' | 'pending' | 'rejected' | 'suspended';
  applicationDate: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  assignedCourseIds: string[];
  rating: number;
  studentsCount: number;
  password?: string;
  temporaryPassword?: string;
  mustChangePassword?: boolean;
}

export interface CourseEnrollment {
  studentId: string;
  studentPhone?: string;
  studentName?: string;
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

// ----------------------------------------------------------------------------
// Authentic Handbook Seed Courses
// ----------------------------------------------------------------------------

export const INITIAL_UDEMY_COURSES: UdemyCourse[] = [
  // Course 1: Legal Reasoning for CLAT (MSI/LEGSTUDIES-/01)
  {
    id: 'crs-msi-legstudies',
    slug: 'legal-reasoning-for-clat',
    title: 'Legal Reasoning for CLAT: Foundational Principles & Passage-Based Deduction (MSI/LEGSTUDIES-/01)',
    headline: 'Master Ratio Decidendi, Tortious Liability, Contract Enforceability, Constitutional Doctrines & Criminal Jurisprudence',
    description: 'Directly structured according to the official MSI Legal Reasoning Course Handout. Emphasizes passage-based analytical reasoning, principle-fact application, and legal deduction across Constitutional Law, Torts, Contracts, and Contemporary Statutes without rote memorization.',
    category: 'Law Entrance',
    department: 'law',
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 2480,
    totalDuration: '52 total hours',
    totalLectures: 32,
    level: 'All Levels',
    thumbnail: '/images/courses/clat.jpg',
    price: 2499,
    originalPrice: 8999,
    isFreeForMsiStudents: true,
    instructorId: 'fac-law-ekta',
    instructorName: 'Dr. Ekta Gahlawat',
    instructorTitle: 'Faculty – Legal Studies, MSI Group of Institutes',
    instructorAvatar: '/images/avatars/avatar-2.webp',
    updatedDate: 'Academic Session 2026–27',
    language: 'English',
    isPublished: true,
    whatYouWillLearn: [
      'Extracting legal rules and distinguishing Ratio Decidendi from Obiter Dicta in judicial rulings',
      'Solving complex principle-fact scenarios strictly within boundary conditions without external assumptions',
      'Mastery over Constitutional Articles 12–32, Emergency Powers, Judicial Review & Basic Structure',
      'Law of Torts: Damnum Sine Injuria, General Defences, Strict vs Absolute Liability (Rylands v. Fletcher)',
      'Law of Contract: Formation, Consideration (Nudum Pactum), Capacity, Free Consent & Frustration',
      'Criminal Law: Mens Rea & Actus Reus, General Exceptions, Inchoate Offences & Cyber/IPR Statutes'
    ],
    requirements: [
      'Basic working knowledge of social sciences, public policy, and legal awareness at Class X–XII level',
      'Enrolled in CLAT Foundation or Target Batch 2026–2027 at MSI Group of Institutes'
    ],
    sections: [
      {
        id: 'sec-leg-1',
        title: 'Unit I: Introduction to Legal Reasoning & Methodology',
        duration: '10 hours 45 mins',
        lectures: [
          {
            id: 'lec-leg-1-1',
            title: '01. Basics of Legal Reasoning: Principle-Fact Application & Ratio Decidendi (Bunny Stream HD)',
            duration: '45:10',
            durationSeconds: 2710,
            videoUrl: 'https://player.mediadelivery.net/embed/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc',
            preview: true,
            summary: 'Official recorded lecture delivered over Bunny Stream High-Definition CDN.',
            resources: [
              { title: 'Principle_Fact_Methodology_Guide.pdf', type: 'pdf', size: '2.8 MB', downloadUrl: '#' },
              { title: 'Ratio_vs_Obiter_Compendium.pdf', type: 'notes', size: '1.4 MB', downloadUrl: '#' }
            ]
          },
          {
            id: 'lec-leg-1-2',
            title: '02. Legal Fallacies, Fact Sifting & The Extracurricular Knowledge Trap',
            duration: '40:30',
            durationSeconds: 2430,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            preview: true,
            summary: 'Techniques to avoid bringing personal outside facts and navigating examiner traps in CLAT passages.',
            resources: [
              { title: 'CLAT_Legal_Fallacies_Cheatsheet.pdf', type: 'pdf', size: '1.9 MB', downloadUrl: '#' }
            ]
          },
          {
            id: 'lec-leg-1-3',
            title: '03. Passage Mapping for Complex Judgments & Public Policy Documents',
            duration: '48:15',
            durationSeconds: 2895,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            preview: false,
            summary: 'Active annotation methods for reading 450-word editorial and judgment excerpts in under 2 minutes.'
          }
        ]
      },
      {
        id: 'sec-leg-2',
        title: 'Unit II & III: Constitutional Law Foundations & Landmark Doctrines',
        duration: '14 hours 20 mins',
        lectures: [
          {
            id: 'lec-leg-2-1',
            title: '04. Fundamental Rights: Articles 14–18 Equality & Reasonable Classification Doctrine',
            duration: '50:00',
            durationSeconds: 3000,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            preview: true,
            summary: 'Constitutional jurisprudence on right to equality, protective discrimination, and the test of arbitrariness.'
          },
          {
            id: 'lec-leg-2-2',
            title: '05. Article 21 Evolution: Privacy, Due Process of Law & Personal Liberty',
            duration: '52:45',
            durationSeconds: 3165,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            preview: false,
            summary: 'Comprehensive analysis from A.K. Gopalan, Maneka Gandhi to Puttaswamy privacy judgments.'
          },
          {
            id: 'lec-leg-2-3',
            title: '06. Supreme Court, Basic Structure Doctrine & Writs under Article 32',
            duration: '46:10',
            durationSeconds: 2770,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            preview: false,
            summary: 'Habeas Corpus, Mandamus, Certiorari, Prohibition, and Quo Warranto with judicial review limits.'
          }
        ]
      },
      {
        id: 'sec-leg-3',
        title: 'Unit IV: Law of Torts & Civil Wrongs',
        duration: '12 hours 15 mins',
        lectures: [
          {
            id: 'lec-leg-3-1',
            title: '07. Injuria Sine Damnum vs Damnum Sine Injuria & Volenti Non Fit Injuria',
            duration: '42:30',
            durationSeconds: 2550,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            preview: true,
            summary: 'Ashby v. White, Gloucester Grammar School, and general defences in tortious liability.'
          },
          {
            id: 'lec-leg-3-2',
            title: '08. Strict Liability vs Absolute Liability: Rylands v. Fletcher & M.C. Mehta Rule',
            duration: '44:20',
            durationSeconds: 2660,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            preview: false,
            summary: 'Non-natural user of land, escape of dangerous thing, and Indian environmental tort innovations.'
          }
        ]
      },
      {
        id: 'sec-leg-4',
        title: 'Unit V & VI: Law of Contracts, Criminal Law & Contemporary Acts',
        duration: '15 hours 00 mins',
        lectures: [
          {
            id: 'lec-leg-4-1',
            title: '09. Offer, Acceptance, Consideration & Doctrine of Frustration (Section 56)',
            duration: '54:10',
            durationSeconds: 3250,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
            preview: false,
            summary: 'Elements of valid contracts, Carlill v. Carbolic Smoke Ball, and unexpected commercial impossibility.'
          },
          {
            id: 'lec-leg-4-2',
            title: '10. Mens Rea, Private Defence & Contemporary Criminal Statutes (BNSS & BNS)',
            duration: '51:00',
            durationSeconds: 3060,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            preview: false,
            summary: 'Criminal intent, right of private defence, inchoate crimes, and the new criminal jurisprudence codes.'
          }
        ]
      }
    ]
  },

  // Course 2: Supreme Court Constitutional Doctrines & Case Law 2026 (MSI Flagship)
  {
    id: 'crs-msi-775270',
    slug: 'supreme-court-constitutional-doctrines-case-law-2026',
    title: 'Supreme Court Constitutional Doctrines & Case Law 2026',
    headline: 'Comprehensive Curriculum & Judicial Practice',
    description: 'Official curriculum accredited by MSI Group of Institutes.',
    category: 'Judiciary',
    department: 'law',
    badge: 'Hot & New',
    rating: 5,
    reviewCount: 1,
    totalDuration: '40 hours',
    totalLectures: 1,
    level: 'All Levels',
    thumbnail: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
    price: 5999,
    originalPrice: 14999,
    isFreeForMsiStudents: true,
    instructorId: 'fac-harshit-01',
    instructorName: 'Harshit Singh',
    instructorTitle: 'Professor of Law & Faculty Jurist',
    instructorAvatar: '/images/avatars/avatar-1.webp',
    updatedDate: 'Oct 2026',
    language: 'English & Bilingual Legal Notes',
    isPublished: true,
    whatYouWillLearn: [
      'Mastery over ratio decidendi and obiter dicta distinctions',
      'Timed answer drafting drills and Bare Act interpretations',
      'Live judicial mentoring and doubt clearing'
    ],
    requirements: [
      'Dedication to daily legal study drills',
      'No prior legal diploma required'
    ],
    sections: [
      {
        id: 'sec-1792755775270-1',
        title: 'Module 1: Foundational Jurisprudence & Overview',
        duration: '3 hours',
        lectures: [
          {
            id: 'lec-1792755775270-1',
            title: 'Orientation & Landmark Constitutional Doctrines',
            duration: '45 mins',
            durationSeconds: 2700,
            videoUrl: 'https://player.mediadelivery.net/embed/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc',
            preview: true,
            summary: 'Initial recorded foundational orientation lecture for registered scholars.',
            resources: [
              {
                title: 'Official Lecture Handout & Landmark Briefs',
                type: 'pdf',
                size: '2.4 MB',
                downloadUrl: '#'
              }
            ]
          }
        ]
      }
    ]
  }
];

// Alias mapping so legacy course links continue working seamlessly
export const LEGACY_COURSE_ID_MAP: Record<string, string> = {
  'crs-udemy-clat': 'crs-msi-legstudies',
  'crs-udemy-bnss': 'crs-udemy-pcsj',
  'crs-udemy-cyber': 'crs-msi-gkca'
};

// ----------------------------------------------------------------------------
// Authentic Faculty Directory (from MSI Handbooks)
// ----------------------------------------------------------------------------

export const INITIAL_TEACHERS: TeacherApprovalRecord[] = [
  // 1. Dr. Ekta Gahlawat (Legal Reasoning)
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
    assignedCourseIds: ['crs-msi-legstudies'],
    rating: 4.9,
    studentsCount: 1680,
    password: 'Faculty@MSI2026',
    temporaryPassword: 'Faculty@MSI2026',
    mustChangePassword: false,
  },
  // 2. Mr. Anurag Dwivedi (GK & Current Affairs)
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
    studentsCount: 2150
  },
  // 3. Ms. Riya Hooda (Logical Reasoning)
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
    studentsCount: 1420
  },
  // 5. Dr. Vikramaditya Sharma (PCS J & Procedural Law)
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
    studentsCount: 1840
  },
  // Legacy compatibility entry for fac-law-01
  {
    id: 'fac-law-01',
    name: 'Dr. Vikramaditya Sharma',
    email: 'dr.vikramaditya@msi-institutes.edu.in',
    phone: '+91 98112 34567',
    avatarUrl: '/images/faculty/faculty-1.webp',
    department: 'School of Law & Judicial Services',
    designation: 'Senior Professor of Procedural Law & Judicial Studies',
    qualifications: 'Ph.D. in Constitutional Jurisprudence (Delhi University), LL.M (Gold Medalist)',
    experienceYears: 18,
    stream: 'Law',
    bio: 'Former judicial advisor with 18+ years experience guiding top rankers in PCS-J, Delhi Judicial Services, and CLAT UG/PG.',
    specialization: 'Procedural Laws, CPC, Judgment Writing, Constitutional Law',
    sampleLectureTitle: 'Framing of Issues in Civil Suits & Res Judicata Principles',
    sampleLectureDuration: '42 mins',
    status: 'approved',
    applicationDate: '12 Jan 2025',
    approvedAt: '15 Jan 2025',
    approvedBy: 'Governing Board / Super Admin',
    assignedCourseIds: ['crs-udemy-pcsj', 'crs-msi-legstudies'],
    rating: 4.9,
    studentsCount: 1840
  }
];

// ----------------------------------------------------------------------------
// Initial Student Enrollments
// ----------------------------------------------------------------------------

export const INITIAL_ENROLLMENTS: CourseEnrollment[] = [
  {
    studentId: 'msi-stu-001', // Aarav Sharma
    courseId: 'crs-msi-legstudies',
    enrolledAt: '10 July 2025',
    progressPercentage: 82,
    completedLectureIds: ['lec-leg-1-1', 'lec-leg-1-2', 'lec-leg-2-1', 'lec-leg-3-1'],
    assignedBy: 'super-admin',
    assignedByName: 'Dr. Ekta Gahlawat (Legal Studies)',
    assignedNote: 'Assigned under CLAT Foundation Batch 2026–27 Section A.',
    certificateIssued: false,
    lastActiveLectureId: 'lec-leg-1-3'
  },
  {
    studentId: 'msi-stu-002', // Meera Sen
    courseId: 'crs-msi-legstudies',
    enrolledAt: '20 June 2025',
    progressPercentage: 92,
    completedLectureIds: ['lec-leg-1-1', 'lec-leg-1-2', 'lec-leg-2-1', 'lec-leg-2-2', 'lec-leg-3-1'],
    assignedBy: 'super-admin',
    assignedByName: 'Super Admin Office',
    assignedNote: 'Enrolled under MSI Merit Scholarship Cohort 2026–27.',
    certificateIssued: true,
    lastActiveLectureId: 'lec-leg-2-2'
  }
];



// ----------------------------------------------------------------------------
// LocalStorage Keys & Synchronization Event (v2 for fresh handbook data)
// ----------------------------------------------------------------------------

const STORAGE_KEY_COURSES = 'msi_udemy_courses_v2';
const STORAGE_KEY_TEACHERS = 'msi_udemy_teachers_v2';
const STORAGE_KEY_ENROLLMENTS = 'msi_udemy_enrollments_v2';
const STORAGE_KEY_DELETED_COURSES = 'msi_deleted_course_ids';
const STORAGE_KEY_DELETED_TEACHERS = 'msi_deleted_teacher_ids';
export const LMS_SYNC_EVENT = 'msi_lms_store_updated';

// Trigger event when store changes
export function notifyLmsStoreChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LMS_SYNC_EVENT));
  }
}

const BASE_DELETED_COURSE_IDS = [
  'crs-msi-gkca',
  'crs-msi-lr',
  'crs-msi-engclat',
  'crs-udemy-pcsj',
  'general-knowledge-current-affairs-clat',
  'logical-reasoning-for-clat-ailet',
  'english-language-comprehension-clat',
  'pcs-j-punjab-judicial-services-foundation'
];

export function getDeletedCourseIds(): string[] {
  if (typeof window === 'undefined') return [...BASE_DELETED_COURSE_IDS];
  try {
    const unmarkRaw = localStorage.getItem('msi_unmarked_courses');
    const unmarked: string[] = unmarkRaw ? JSON.parse(unmarkRaw) : [];
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_COURSES);
    const stored: string[] = raw ? JSON.parse(raw) : [...BASE_DELETED_COURSE_IDS];
    const combined = Array.from(new Set([...BASE_DELETED_COURSE_IDS, ...stored]));
    return combined.filter((id) => !unmarked.includes(id.toLowerCase().trim()));
  } catch {
    return [...BASE_DELETED_COURSE_IDS];
  }
}

export function markCourseDeletedLocally(courseId: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedCourseIds();
    const clean = courseId.trim().toLowerCase();
    if (!list.includes(clean)) {
      list.push(clean);
      localStorage.setItem(STORAGE_KEY_DELETED_COURSES, JSON.stringify(list));
    }
    // Remove from unmarked list
    const unmarkRaw = localStorage.getItem('msi_unmarked_courses');
    if (unmarkRaw) {
      const unmarked: string[] = JSON.parse(unmarkRaw);
      const filtered = unmarked.filter((id) => id !== clean);
      localStorage.setItem('msi_unmarked_courses', JSON.stringify(filtered));
    }
  } catch (_) {}
}

export function unmarkCourseDeletedLocally(courseId: string) {
  if (typeof window === 'undefined') return;
  try {
    const clean = courseId.trim().toLowerCase();
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_COURSES);
    const stored: string[] = raw ? JSON.parse(raw) : [...BASE_DELETED_COURSE_IDS];
    const updated = stored.filter((id) => id.toLowerCase().trim() !== clean);
    localStorage.setItem(STORAGE_KEY_DELETED_COURSES, JSON.stringify(updated));

    const unmarkRaw = localStorage.getItem('msi_unmarked_courses');
    const unmarked: string[] = unmarkRaw ? JSON.parse(unmarkRaw) : [];
    if (!unmarked.includes(clean)) {
      unmarked.push(clean);
      localStorage.setItem('msi_unmarked_courses', JSON.stringify(unmarked));
    }
  } catch (_) {}
}

export function unmarkTeacherDeletedLocally(id?: string, email?: string, phone?: string) {
  if (typeof window === 'undefined') return;
  try {
    const toRemove = [
      (id || '').toLowerCase().trim(),
      (email || '').toLowerCase().trim(),
      (phone || '').replace(/\D/g, '').slice(-10),
    ].filter(Boolean);

    const raw = localStorage.getItem(STORAGE_KEY_DELETED_TEACHERS);
    const stored: string[] = raw ? JSON.parse(raw) : [...BASE_DELETED_TEACHER_IDS];
    const updated = stored.filter((item) => !toRemove.includes(item.toLowerCase().trim()));
    localStorage.setItem(STORAGE_KEY_DELETED_TEACHERS, JSON.stringify(updated));

    const unmarkRaw = localStorage.getItem('msi_unmarked_teachers');
    const unmarked: string[] = unmarkRaw ? JSON.parse(unmarkRaw) : [];
    for (const item of toRemove) {
      if (!unmarked.includes(item)) unmarked.push(item);
    }
    localStorage.setItem('msi_unmarked_teachers', JSON.stringify(unmarked));
  } catch (_) {}
}

const BASE_DELETED_TEACHER_IDS = [
  'fac-law-shikha',
  'ss7487320@gmail.com',
  '9814423004',
  '+91 98144 23004',
  'test-dummy',
  'fac-1792779313911',
  'deleteme@msi.edu.in'
];

export function getDeletedTeacherIds(): string[] {
  if (typeof window === 'undefined') return [...BASE_DELETED_TEACHER_IDS];
  try {
    const unmarkRaw = localStorage.getItem('msi_unmarked_teachers');
    const unmarked: string[] = unmarkRaw ? JSON.parse(unmarkRaw) : [];
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_TEACHERS);
    const stored: string[] = raw ? JSON.parse(raw) : [...BASE_DELETED_TEACHER_IDS];
    const combined = Array.from(new Set([...BASE_DELETED_TEACHER_IDS, ...stored]));
    return combined.filter((item) => !unmarked.includes(item.toLowerCase().trim()));
  } catch {
    return [...BASE_DELETED_TEACHER_IDS];
  }
}

export function markTeacherDeletedLocally(teacherId: string, email?: string, phone?: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedTeacherIds();
    const toAdd = [
      teacherId.trim().toLowerCase(),
      ...(email ? [email.trim().toLowerCase()] : []),
      ...(phone ? [phone.replace(/\D/g, '').slice(-10)] : []),
    ].filter(Boolean);

    let changed = false;
    for (const item of toAdd) {
      if (!list.includes(item)) {
        list.push(item);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEY_DELETED_TEACHERS, JSON.stringify(list));
    }

    // Remove from unmarked list
    const unmarkRaw = localStorage.getItem('msi_unmarked_teachers');
    if (unmarkRaw) {
      const unmarked: string[] = JSON.parse(unmarkRaw);
      const filtered = unmarked.filter((item) => !toAdd.includes(item));
      localStorage.setItem('msi_unmarked_teachers', JSON.stringify(filtered));
    }
  } catch (_) {}
}

// ----------------------------------------------------------------------------
// Store Accessor Functions
// ----------------------------------------------------------------------------

// Courses
export function getStoredCourses(): UdemyCourse[] {
  if (typeof window === 'undefined') return INITIAL_UDEMY_COURSES;
  try {
    const deleted = getDeletedCourseIds();
    const isDeleted = (c: UdemyCourse) =>
      deleted.includes(c.id.toLowerCase().trim()) ||
      (c.slug && deleted.includes(c.slug.toLowerCase().trim()));

    const raw = localStorage.getItem(STORAGE_KEY_COURSES);
    if (!raw) {
      const initial = INITIAL_UDEMY_COURSES.filter((c) => !isDeleted(c));
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(initial));
      return initial;
    }
    const courses: UdemyCourse[] = JSON.parse(raw);
    let changed = false;
    const activeCourses = courses.filter((c) => !isDeleted(c));
    if (activeCourses.length !== courses.length) {
      changed = true;
    }

    const updated = activeCourses.map((course) => {
      const seed = INITIAL_UDEMY_COURSES.find((s) => s.id === course.id);
      let courseModified = false;
      let newSections = course.sections;

      if (course.sections && course.sections.length > 0) {
        newSections = course.sections.map((sec) => {
          const newLectures = sec.lectures.map((lec) => {
            if (
              (lec.id === 'lec-leg-1-1' || lec.id === 'lec-pcsj-1-1') &&
              (!lec.videoUrl || lec.videoUrl.includes('BigBuckBunny'))
            ) {
              changed = true;
              courseModified = true;
              return {
                ...lec,
                title: `${lec.title} (Bunny Stream HD)`,
                videoUrl: 'https://player.mediadelivery.net/embed/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc',
              };
            }
            return lec;
          });
          return { ...sec, lectures: newLectures };
        });
      }

      if (seed && (!course.thumbnail || course.thumbnail.trim() === '')) {
        changed = true;
        courseModified = true;
        return { ...course, thumbnail: seed.thumbnail, sections: newSections };
      }
      return courseModified ? { ...course, sections: newSections } : course;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return INITIAL_UDEMY_COURSES;
  }
}

export function saveStoredCourses(courses: UdemyCourse[], emitEvent = true) {
  if (typeof window === 'undefined') return;
  try {
    const deleted = getDeletedCourseIds();
    const isDeleted = (c: UdemyCourse) =>
      deleted.includes(c.id.toLowerCase().trim()) ||
      (c.slug && deleted.includes(c.slug.toLowerCase().trim()));
    const valid = courses.filter((c) => !isDeleted(c));
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(valid));
    if (emitEvent) {
      notifyLmsStoreChange();
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Synchronize local storage courses with server disk data/courses.json
 */
export async function syncCoursesFromServer(): Promise<UdemyCourse[]> {
  if (typeof window === 'undefined') return getStoredCourses();
  try {
    const res = await fetch('/api/courses', { cache: 'no-store' });
    const data = await res.json();
    if (data.success && Array.isArray(data.courses)) {
      if (Array.isArray(data.deletedIds)) {
        data.deletedIds.forEach((id: string) => markCourseDeletedLocally(id));
      }
      const deleted = getDeletedCourseIds();
      const isDeleted = (c: UdemyCourse) =>
        deleted.includes(c.id.toLowerCase().trim()) ||
        (c.slug && deleted.includes(c.slug.toLowerCase().trim()));
      const validCourses = data.courses.filter((c: UdemyCourse) => !isDeleted(c));
      saveStoredCourses(validCourses, false);
      return validCourses;
    }
  } catch (err) {
    console.warn('Could not sync courses from server:', err);
  }
  return getStoredCourses();
}

// Teachers
export function getStoredTeachers(): TeacherApprovalRecord[] {
  if (typeof window === 'undefined') return INITIAL_TEACHERS;
  try {
    const deleted = getDeletedTeacherIds();
    const isDeleted = (t: TeacherApprovalRecord) => {
      const tId = (t.id || '').toLowerCase().trim();
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);
      return (
        deleted.includes(tId) ||
        deleted.includes(tEmail) ||
        (tPhone.length >= 10 && deleted.includes(tPhone))
      );
    };

    const raw = localStorage.getItem(STORAGE_KEY_TEACHERS);
    if (!raw) {
      const initial = INITIAL_TEACHERS.filter((t) => !isDeleted(t));
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(initial));
      // Trigger background sync from server
      syncTeachersFromServer().catch(() => {});
      return initial;
    }
    const teachers: TeacherApprovalRecord[] = JSON.parse(raw);
    let changed = false;
    const active = teachers.filter((t) => !isDeleted(t));
    if (active.length !== teachers.length) {
      changed = true;
    }

    const updated = active.map((t) => {
      const isEkta = t.id === 'fac-law-ekta' || t.email.toLowerCase().includes('ekta');
      const needsPhone = isEkta && (!t.phone || !t.phone.includes('9792303434'));
      const needsPass = !t.password;
      if (needsPhone || needsPass) {
        changed = true;
        return {
          ...t,
          phone: isEkta ? '9792303434' : t.phone,
          password: t.password || 'Faculty@MSI2026',
          temporaryPassword: t.temporaryPassword || 'Faculty@MSI2026',
        };
      }
      return t;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return INITIAL_TEACHERS;
  }
}

export function saveStoredTeachers(teachers: TeacherApprovalRecord[], emitEvent = true) {
  if (typeof window === 'undefined') return;
  try {
    const deleted = getDeletedTeacherIds();
    const isDeleted = (t: TeacherApprovalRecord) => {
      const tId = (t.id || '').toLowerCase().trim();
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);
      return (
        deleted.includes(tId) ||
        deleted.includes(tEmail) ||
        (tPhone.length >= 10 && deleted.includes(tPhone))
      );
    };
    const valid = teachers.filter((t) => !isDeleted(t));
    localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(valid));
    if (emitEvent) {
      notifyLmsStoreChange();
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Synchronize local storage teachers with server data/teachers.json.
 * The server disk is the single source of truth; deleted records on server are permanently purged.
 */
export async function syncTeachersFromServer(): Promise<TeacherApprovalRecord[]> {
  if (typeof window === 'undefined') return INITIAL_TEACHERS;
  try {
    const res = await fetch('/api/admin/faculty', { cache: 'no-store' });
    const data = await res.json();
    if (data.success && Array.isArray(data.teachers)) {
      if (Array.isArray(data.deletedTeachers)) {
        data.deletedTeachers.forEach((dt: any) => {
          markTeacherDeletedLocally(dt.id, dt.email, dt.phone);
        });
      }
      const deleted = getDeletedTeacherIds();
      const isDeleted = (t: TeacherApprovalRecord) => {
        const tId = (t.id || '').toLowerCase().trim();
        const tEmail = (t.email || '').toLowerCase().trim();
        const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);
        return (
          deleted.includes(tId) ||
          deleted.includes(tEmail) ||
          (tPhone.length >= 10 && deleted.includes(tPhone))
        );
      };
      const authoritativeTeachers = data.teachers.filter((t: TeacherApprovalRecord) => !isDeleted(t));
      saveStoredTeachers(authoritativeTeachers, false);
      return authoritativeTeachers;
    }
  } catch (err) {
    console.warn('Could not sync teachers from server:', err);
  }
  return getStoredTeachers();
}

/**
 * Convert a stored TeacherApprovalRecord into a full TeacherProfile for dashboard rendering
 */
export function buildTeacherProfileFromRecord(rec: TeacherApprovalRecord) {
  return {
    id: rec.id,
    name: rec.name,
    title: rec.designation || 'Professor of Law & Faculty Jurist',
    department: rec.department || 'School of Law & Judicial Studies',
    email: rec.email,
    phone: rec.phone || '+91 98000 00000',
    avatarUrl: rec.avatarUrl || '/images/avatars/avatar-2.webp',
    stream: (rec.stream as 'Law' | 'JEE') || 'Law',
    cabin: 'Academic Block A, Jurists Chamber #104',
    assignedCourseCodes: rec.assignedCourseIds || [],
    assignedSubjects: [rec.specialization || 'Jurisprudence & Judicial Practice'],
  };
}

// Enrollments
export function getStoredEnrollments(): CourseEnrollment[] {
  if (typeof window === 'undefined') return INITIAL_ENROLLMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENROLLMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(INITIAL_ENROLLMENTS));
      return INITIAL_ENROLLMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ENROLLMENTS;
  }
}

export function saveStoredEnrollments(enrollments: CourseEnrollment[], emitEvent = true) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(enrollments));
    if (emitEvent) {
      notifyLmsStoreChange();
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Synchronize enrollments with server disk
 */
export async function syncEnrollmentsFromServer(): Promise<CourseEnrollment[]> {
  if (typeof window === 'undefined') return getStoredEnrollments();
  try {
    const res = await fetch('/api/admin/enrollments', { cache: 'no-store' });
    const data = await res.json();
    if (data.success && Array.isArray(data.enrollments)) {
      saveStoredEnrollments(data.enrollments, false);
      return data.enrollments;
    }
  } catch (err) {
    console.warn('Could not sync enrollments from server:', err);
  }
  return getStoredEnrollments();
}

// ----------------------------------------------------------------------------
// Core Business Logic Actions
// ----------------------------------------------------------------------------

/**
 * Super Admin Approves a Teacher Application
 */
export function approveTeacherAction(teacherId: string, approvedByName = 'Super Admin Officer') {
  const teachers = getStoredTeachers();
  const updated = teachers.map((t) => {
    if (t.id === teacherId) {
      return {
        ...t,
        status: 'approved' as const,
        approvedAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        approvedBy: approvedByName,
        rejectionReason: undefined
      };
    }
    return t;
  });
  saveStoredTeachers(updated);
  return updated;
}

/**
 * Super Admin Rejects a Teacher Application
 */
export function rejectTeacherAction(teacherId: string, reason: string) {
  const teachers = getStoredTeachers();
  const updated = teachers.map((t) => {
    if (t.id === teacherId) {
      return {
        ...t,
        status: 'rejected' as const,
        rejectionReason: reason || 'Application requires additional credential verification.'
      };
    }
    return t;
  });
  saveStoredTeachers(updated);
  return updated;
}

/**
 * Super Admin Assigns Courses to a Teacher
 */
export function assignCoursesToTeacherAction(teacherId: string, courseIds: string[]) {
  const teachers = getStoredTeachers();
  const updatedTeachers = teachers.map((t) => {
    if (t.id === teacherId) {
      return {
        ...t,
        assignedCourseIds: courseIds
      };
    }
    return t;
  });
  saveStoredTeachers(updatedTeachers);

  // Also update instructor on the course if relevant
  const teacher = teachers.find((t) => t.id === teacherId);
  if (teacher) {
    const courses = getStoredCourses();
    const updatedCourses = courses.map((c) => {
      if (courseIds.includes(c.id)) {
        return {
          ...c,
          instructorId: teacher.id,
          instructorName: teacher.name,
          instructorTitle: teacher.designation,
          instructorAvatar: teacher.avatarUrl
        };
      }
      return c;
    });
    saveStoredCourses(updatedCourses);

    // Auto-enroll registered students under this faculty's assigned courses
    const targetStudents = [
      { id: 'msi-stu-001', name: 'Aarav Sharma', phone: '9811234567' },
      { id: 'msi-stu-002', name: 'Meera Sen', phone: '9814423001' },
      { id: 'staff-harshit', name: 'Harshit', phone: '9792303434' },
      { id: 'msi-stu-ankit', name: 'Ankit Sir', phone: '9876543210' }
    ];

    if (typeof window !== 'undefined') {
      const activePhone = localStorage.getItem('msi_active_student_phone');
      const activeName = localStorage.getItem('msi_active_student_name');
      if (activePhone) {
        const clean = activePhone.replace(/\D/g, '').slice(-10);
        if (!targetStudents.some((s) => s.phone === clean)) {
          targetStudents.push({
            id: `msi-stu-${clean.slice(-4)}`,
            name: activeName || `Student ${clean.slice(-4)}`,
            phone: clean
          });
        }
      }
    }

    courseIds.forEach((cid) => {
      targetStudents.forEach((stu) => {
        enrollStudentAction(
          stu.id,
          cid,
          'super-admin',
          teacher.name,
          `Assigned under faculty ${teacher.name} curriculum.`,
          stu.phone,
          stu.name
        );
      });
    });
  }

  notifyLmsStoreChange();
  return updatedTeachers;
}

/**
 * Student Self-Enrolls or is Assigned to a Course (by Super Admin or Faculty)
 */
export function enrollStudentAction(
  studentIdOrParams:
    | string
    | {
        studentId?: string;
        studentPhone?: string;
        studentName?: string;
        courseId: string;
        courseTitle?: string;
        assignedBy?: 'self' | 'super-admin' | 'teacher';
        assignedByName?: string;
        assignedByTeacherId?: string;
        assignedNote?: string;
        progressPercentage?: number;
        completedLectureIds?: string[];
      },
  courseIdArg?: string,
  assignedByArg: 'self' | 'super-admin' | 'teacher' = 'self',
  assignedByNameArg?: string,
  assignedNoteArg?: string,
  studentPhoneArg?: string,
  studentNameArg?: string,
  assignedByTeacherIdArg?: string,
  courseTitleArg?: string
): CourseEnrollment {
  let studentId: string;
  let courseId: string;
  let assignedBy: 'self' | 'super-admin' | 'teacher';
  let assignedByName: string | undefined;
  let assignedNote: string | undefined;
  let studentPhone: string | undefined;
  let studentName: string | undefined;
  let assignedByTeacherId: string | undefined;
  let courseTitle: string | undefined;

  if (typeof studentIdOrParams === 'object') {
    studentPhone = studentIdOrParams.studentPhone;
    studentName = studentIdOrParams.studentName;
    studentId =
      studentIdOrParams.studentId ||
      (studentPhone ? `msi-stu-${studentPhone.replace(/\D/g, '').slice(-4)}` : 'msi-stu-001');
    courseId = studentIdOrParams.courseId;
    assignedBy = studentIdOrParams.assignedBy || 'self';
    assignedByName = studentIdOrParams.assignedByName;
    assignedNote = studentIdOrParams.assignedNote;
    assignedByTeacherId = studentIdOrParams.assignedByTeacherId;
    courseTitle = studentIdOrParams.courseTitle;
  } else {
    studentId = studentIdOrParams;
    courseId = courseIdArg || '';
    assignedBy = assignedByArg;
    assignedByName = assignedByNameArg;
    assignedNote = assignedNoteArg;
    studentPhone = studentPhoneArg;
    studentName = studentNameArg;
    assignedByTeacherId = assignedByTeacherIdArg;
    courseTitle = courseTitleArg;
  }

  const enrollments = getStoredEnrollments();
  const cleanPhone = (studentPhone || '').replace(/\D/g, '').slice(-10);
  const existing = enrollments.find(
    (e) =>
      (e.studentId === studentId || (cleanPhone && (e.studentPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone)) &&
      e.courseId === courseId
  );
  if (existing) {
    if (assignedBy !== 'self' && existing.assignedBy === 'self') {
      existing.assignedBy = assignedBy;
      existing.assignedByName = assignedByName;
      existing.assignedByTeacherId = assignedByTeacherId;
      existing.assignedNote = assignedNote;
      if (courseTitle) existing.courseTitle = courseTitle;
      saveStoredEnrollments(enrollments);
      try {
        fetch('/api/admin/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(existing),
        }).catch(() => {});
      } catch (_) {}
    }
    return existing;
  }

  const newEnrollment: CourseEnrollment = {
    studentId,
    studentPhone: cleanPhone || studentPhone,
    studentName,
    courseId,
    courseTitle,
    enrolledAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    progressPercentage: 0,
    completedLectureIds: [],
    assignedBy,
    assignedByName,
    assignedByTeacherId,
    assignedNote,
    certificateIssued: false,
  };

  const updated = [...enrollments, newEnrollment];
  saveStoredEnrollments(updated);

  try {
    fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEnrollment),
    }).catch(() => {});
  } catch (_) {}

  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('msi_sync_channel');
      bc.postMessage({
        type: 'STUDENT_ENROLLED',
        studentId,
        studentPhone: cleanPhone,
        courseId,
        assignedBy,
        assignedByName,
      });
      bc.close();
    }
  } catch (_) {}

  return newEnrollment;
}

/**
 * Super Admin or Teacher Assigns a Course to a Student
 */
export function assignCourseToStudentAction(
  studentId: string,
  courseId: string,
  assignedBy: 'super-admin' | 'teacher',
  assignedByName: string,
  assignedNote: string
) {
  return enrollStudentAction(studentId, courseId, assignedBy, assignedByName, assignedNote);
}

/**
 * Update Student's Lecture Progress
 */
export function toggleLectureCompletionAction(
  studentId: string,
  courseId: string,
  lectureId: string
) {
  const enrollments = getStoredEnrollments();
  const courses = getStoredCourses();
  const course = courses.find((c) => c.id === courseId);

  const updated = enrollments.map((enr) => {
    if (enr.studentId === studentId && enr.courseId === courseId) {
      const alreadyCompleted = enr.completedLectureIds.includes(lectureId);
      const newCompleted = alreadyCompleted
        ? enr.completedLectureIds.filter((id) => id !== lectureId)
        : [...enr.completedLectureIds, lectureId];

      const totalLecs = course ? course.sections.reduce((acc, s) => acc + s.lectures.length, 0) : 1;
      const progress = Math.min(100, Math.round((newCompleted.length / Math.max(1, totalLecs)) * 100));

      return {
        ...enr,
        completedLectureIds: newCompleted,
        progressPercentage: progress,
        lastActiveLectureId: lectureId,
        certificateIssued: progress >= 100 ? true : enr.certificateIssued
      };
    }
    return enr;
  });

  saveStoredEnrollments(updated);
  return updated;
}

/**
 * Helper to match teacher by ID, email, or partial name (e.g. "Ekta Gehlot", "Ekta Gahlawat", "vikram", etc.)
 */
export function findTeacherByIdOrName(teachers: TeacherApprovalRecord[], query: string): TeacherApprovalRecord | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return teachers.find((t) => {
    const name = t.name.toLowerCase();
    const email = t.email.toLowerCase();
    const id = t.id.toLowerCase();
    if (id === q || email === q || name === q) return true;
    if (name.includes(q) || q.includes(name)) return true;
    // Specific aliases (e.g., user said "Ekta Gehlot" or "Ekta Gahlawat")
    if (
      (q.includes('ekta') || q.includes('gehlot') || q.includes('gahlawat')) &&
      (name.includes('ekta') || name.includes('gahlawat') || email.includes('ekta'))
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Super Admin assigns a specific course to a faculty by name or ID,
 * and auto-enrolls registered students so it immediately reflects in both portals.
 */
export function assignCourseToFacultyAction(
  courseId: string,
  facultyIdentifier: string,
  autoEnrollStudents: boolean = true
) {
  const teachers = getStoredTeachers();
  const teacher = findTeacherByIdOrName(teachers, facultyIdentifier);
  if (!teacher) {
    console.warn(`[LMS] Teacher not found for identifier: ${facultyIdentifier}`);
    return null;
  }

  // 1. Update teacher's assignedCourseIds
  const updatedTeachers = teachers.map((t) => {
    if (t.id === teacher.id) {
      const existing = t.assignedCourseIds || [];
      const assigned = existing.includes(courseId) ? existing : [...existing, courseId];
      return {
        ...t,
        assignedCourseIds: assigned
      };
    }
    return t;
  });
  saveStoredTeachers(updatedTeachers);

  // 2. Update course instructor details
  const courses = getStoredCourses();
  const updatedCourses = courses.map((c) => {
    if (c.id === courseId) {
      return {
        ...c,
        instructorId: teacher.id,
        instructorName: teacher.name,
        instructorTitle: teacher.designation || teacher.department,
        instructorAvatar: teacher.avatarUrl || '/images/avatars/avatar-2.webp'
      };
    }
    return c;
  });
  saveStoredCourses(updatedCourses);

  // 3. Auto-enroll registered students under this faculty
  if (autoEnrollStudents) {
    const targetStudents = [
      { id: 'msi-stu-001', name: 'Aarav Sharma', phone: '9811234567' },
      { id: 'msi-stu-002', name: 'Meera Sen', phone: '9814423001' },
      { id: 'staff-harshit', name: 'Harshit', phone: '9792303434' },
      { id: 'msi-stu-ankit', name: 'Ankit Sir', phone: '9876543210' }
    ];

    if (typeof window !== 'undefined') {
      const activePhone = localStorage.getItem('msi_active_student_phone');
      const activeName = localStorage.getItem('msi_active_student_name');
      if (activePhone) {
        const clean = activePhone.replace(/\D/g, '').slice(-10);
        if (!targetStudents.some((s) => s.phone === clean)) {
          targetStudents.push({
            id: `msi-stu-${clean.slice(-4)}`,
            name: activeName || `Student ${clean.slice(-4)}`,
            phone: clean
          });
        }
      }
    }

    targetStudents.forEach((stu) => {
      enrollStudentAction(
        stu.id,
        courseId,
        'super-admin',
        teacher.name,
        `Assigned under faculty ${teacher.name} curriculum.`,
        stu.phone,
        stu.name
      );
    });
  }

  notifyLmsStoreChange();
  return { teacher, updatedCourses };
}

/**
 * Add a lecture (Lecture 1, Lecture 2, etc.) to a course
 */
export function addLectureToCourseAction(
  courseId: string,
  lectureData: {
    title: string;
    duration?: string;
    videoUrl?: string;
    summary?: string;
    preview?: boolean;
    sectionTitle?: string;
    resources?: {
      title: string;
      type: 'pdf' | 'doc' | 'notes';
      size: string;
      downloadUrl: string;
    }[];
  }
) {
  const courses = getStoredCourses();
  let addedLecture: UdemyLecture | null = null;

  const updatedCourses = courses.map((course) => {
    if (course.id === courseId) {
      const sections = course.sections && course.sections.length > 0
        ? course.sections.map((s) => ({ ...s, lectures: [...s.lectures] }))
        : [
            {
              id: `sec-${Date.now()}-1`,
              title: lectureData.sectionTitle || 'Module 1: Core Curriculum & Lectures',
              duration: '1 hour',
              lectures: []
            }
          ];

      const targetSection = sections[0];
      const lectureIndex = targetSection.lectures.length + 1;

      // Ensure title has "Lecture X:" if not provided
      let finalTitle = lectureData.title.trim();
      if (!/^lecture\s*\d+/i.test(finalTitle)) {
        finalTitle = `Lecture ${lectureIndex}: ${finalTitle}`;
      }

      addedLecture = {
        id: `lec-${courseId}-${Date.now()}`,
        title: finalTitle,
        duration: lectureData.duration?.trim() || '45 mins',
        durationSeconds: 2700,
        videoUrl: lectureData.videoUrl?.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        preview: lectureData.preview ?? true,
        summary: lectureData.summary?.trim() || 'Classroom recording with landmark case law briefs.',
        resources: lectureData.resources && lectureData.resources.length > 0
          ? lectureData.resources
          : [
              {
                title: `${finalTitle} Handout & Bare Act Notes`,
                type: 'pdf' as const,
                size: '2.4 MB',
                downloadUrl: '#'
              }
            ]
      };

      targetSection.lectures.push(addedLecture);

      const totalLecs = sections.reduce((acc, s) => acc + s.lectures.length, 0);

      return {
        ...course,
        sections,
        totalLectures: totalLecs,
        updatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
    }
    return course;
  });

  saveStoredCourses(updatedCourses);
  notifyLmsStoreChange();
  return { updatedCourses, addedLecture };
}

/**
 * Delete a lecture from a course
 */
export function deleteLectureFromCourseAction(courseId: string, lectureId: string) {
  const courses = getStoredCourses();
  const updatedCourses = courses.map((course) => {
    if (course.id === courseId) {
      const sections = course.sections.map((sec) => ({
        ...sec,
        lectures: sec.lectures.filter((l) => l.id !== lectureId)
      }));
      const totalLecs = sections.reduce((acc, s) => acc + s.lectures.length, 0);
      return {
        ...course,
        sections,
        totalLectures: totalLecs,
        updatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
    }
    return course;
  });

  saveStoredCourses(updatedCourses);
  notifyLmsStoreChange();
}

/**
 * Permanently delete a course from local store
 */
export function deleteCourseAction(courseId: string) {
  markCourseDeletedLocally(courseId);
  const clean = courseId.trim().toLowerCase();
  const courses = getStoredCourses();
  const updatedCourses = courses.filter(
    (c) => c.id !== courseId && c.id.toLowerCase() !== clean && (!c.slug || c.slug.toLowerCase() !== clean)
  );
  saveStoredCourses(updatedCourses);

  // Also remove enrollments for this course
  const enrollments = getStoredEnrollments();
  const updatedEnrollments = enrollments.filter(
    (e) => e.courseId !== courseId && e.courseId.toLowerCase() !== clean
  );
  saveStoredEnrollments(updatedEnrollments);

  // Also unassign from teachers in local store
  const teachers = getStoredTeachers();
  const updatedTeachers = teachers.map((t) => ({
    ...t,
    assignedCourseIds: (t.assignedCourseIds || []).filter(
      (cid) => cid !== courseId && cid.toLowerCase() !== clean
    ),
  }));
  saveStoredTeachers(updatedTeachers);

  notifyLmsStoreChange();
  return updatedCourses;
}

/**
 * Permanently delete a teacher from local store and clear active session if matching
 */
export function deleteTeacherAction(teacherId: string, email?: string, phone?: string) {
  markTeacherDeletedLocally(teacherId, email, phone);
  const cleanId = teacherId.trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

  const teachers = getStoredTeachers();
  const updatedTeachers = teachers.filter((t) => {
    const tId = (t.id || '').toLowerCase().trim();
    const tEmail = (t.email || '').toLowerCase().trim();
    const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);
    return (
      tId !== cleanId &&
      (!cleanEmail || tEmail !== cleanEmail) &&
      (cleanPhone.length < 10 || tPhone !== cleanPhone)
    );
  });
  saveStoredTeachers(updatedTeachers);

  // If currently active teacher matches, clear session immediately
  if (typeof window !== 'undefined') {
    const storedId = (localStorage.getItem('msi_active_teacher_id') || '').toLowerCase().trim();
    const storedEmail = (localStorage.getItem('msi_active_teacher_email') || '').toLowerCase().trim();
    const storedPhone = (localStorage.getItem('msi_active_teacher_phone') || '').replace(/\D/g, '').slice(-10);
    if (
      (storedId && storedId === cleanId) ||
      (cleanEmail && storedEmail === cleanEmail) ||
      (cleanPhone.length >= 10 && storedPhone === cleanPhone)
    ) {
      localStorage.removeItem('msi_teacher_user');
      localStorage.removeItem('msi_teacher_logged_in');
      localStorage.removeItem('msi_active_teacher_id');
      localStorage.removeItem('msi_active_teacher_name');
      localStorage.removeItem('msi_active_teacher_email');
      localStorage.removeItem('msi_active_teacher_phone');
    }
  }

  notifyLmsStoreChange();
  return updatedTeachers;
}
