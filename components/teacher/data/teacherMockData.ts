export interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  avatarUrl: string;
  stream: 'Law' | 'JEE';
  cabin: string;
  assignedCourseCodes: string[];
  assignedSubjects: string[];
}

export interface TeacherCourse {
  id: string;
  code: string;
  title: string;
  stream: 'Law' | 'JEE';
  batch: string;
  totalStudents: number;
  progress: number;
  lecturesCompleted: number;
  totalLectures: number;
  nextLectureTime: string;
}

export interface TeacherContentItem {
  id: string;
  title: string;
  category: 'Video' | 'Notes' | 'PYQ' | 'Assignment' | 'Reference';
  courseCode: string;
  stream: 'Law' | 'JEE';
  uploadDate: string;
  isPublished: boolean;
  sizeOrDuration: string;
  downloadCount: number;
}

export interface AssessmentItem {
  id: string;
  title: string;
  courseCode: string;
  stream: 'Law' | 'JEE';
  type: 'Mock' | 'Formal';
  totalQuestions: number;
  marks: number;
  durationMinutes: number;
  negativeMarking: string;
  scheduledDate: string;
  status: 'Published' | 'Draft' | 'Completed';
  submissionsCount: number;
  averageScore?: number;
}

export interface StudentMonitoringRecord {
  id: string;
  name: string;
  rollNo: string;
  stream: 'Law' | 'JEE';
  batch: string;
  attendancePercentage: number;
  avgTestScore: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  riskLevel: 'Safe' | 'Attention' | 'Critical';
}

export interface TeacherClassSchedule {
  id: string;
  subject: string;
  courseCode: string;
  stream: 'Law' | 'JEE';
  batch: string;
  time: string;
  day: string;
  venue: string;
  meetLink?: string;
  type: 'Theory Lecture' | 'Practical / Moot' | 'Tutorial';
  isLiveNow?: boolean;
}

export interface CommunicationPost {
  id: string;
  title: string;
  message: string;
  courseCode: string;
  stream: 'Law' | 'JEE';
  author: string;
  date: string;
  type: 'Announcement' | 'Class Update' | 'Resource Note';
}

export interface OneToOneSession {
  id: string;
  studentName: string;
  studentRoll: string;
  stream: 'Law' | 'JEE';
  topic: string;
  date: string;
  time: string;
  meetLink: string;
  status: 'Scheduled' | 'Completed';
}

// --------------------------------------------------------------------------
// Faculty Profiles (Extracted from Authentic MSI Handbooks)
// --------------------------------------------------------------------------

export const TEACHER_PROFILES: TeacherProfile[] = [
  {
    id: 'fac-law-01',
    name: 'Dr. Ekta Gahlawat',
    title: 'Faculty – Legal Studies, MSI Group of Institutes',
    department: 'School of Law & Legal Studies',
    email: 'drektagahlawat@msi.edu.in',
    phone: '+91 98144 23001',
    avatarUrl: '/images/avatars/avatar-2.webp',
    stream: 'Law',
    cabin: 'Chamber 102, Legal Studies Block (Office Hours: 10 AM – 8 PM)',
    assignedCourseCodes: ['MSI/LEGSTUDIES-/01', 'MSI/PCSJ/01'],
    assignedSubjects: [
      'Legal Reasoning for CLAT: Principle-Fact Methodology',
      'Constitutional Law, Law of Torts & Contracts',
    ],
  },
  {
    id: 'fac-law-anurag',
    name: 'Mr. Anurag Dwivedi',
    title: 'Faculty – General Knowledge & Current Affairs',
    department: 'General Knowledge & Current Affairs Directorate',
    email: 'anurag.dwivedi@msigroup.edu.in',
    phone: '+91 98144 23002',
    avatarUrl: '/images/avatars/avatar-1.webp',
    stream: 'Law',
    cabin: 'Chamber 104, Directorate Wing (Office Hours: 10 AM – 8 PM)',
    assignedCourseCodes: ['MSI/GKCA/01'],
    assignedSubjects: [
      'Constitutional & Governance Current Affairs',
      'Geopolitics & Static GK Addendum (180 Sessions)',
    ],
  },
  {
    id: 'fac-law-riya',
    name: 'Ms. Riya Hooda',
    title: 'Faculty – Logical Reasoning (CLAT & AILET)',
    department: 'Aptitude & Analytical Reasoning Division',
    email: 'msifaculty009@gmail.com',
    phone: '+91 98144 23003',
    avatarUrl: '/images/avatars/avatar-4.webp',
    stream: 'Law',
    cabin: 'Chamber 105, Aptitude Wing (Teaching Hours: 10 AM – 7 PM)',
    assignedCourseCodes: ['MSI/LR/01'],
    assignedSubjects: [
      'Critical Reasoning & Argument Analysis',
      'Analytical Puzzles & Syllogisms (126 Sessions)',
    ],
  },
  {
    id: 'fac-law-shikha',
    name: 'Ms. Shikha Singh',
    title: 'English Faculty, MSI Group of Institutes',
    department: 'English Language & Verbal Studies',
    email: 'Ss7487320@gmail.com',
    phone: '+91 98144 23004',
    avatarUrl: '/images/avatars/avatar-5.webp',
    stream: 'Law',
    cabin: 'Chamber 108, Humanities Block (Office Hours: 10 AM – 8 PM)',
    assignedCourseCodes: ['MSI/ENGCLAT-/01'],
    assignedSubjects: [
      'English for CLAT: Reading Comprehension',
      'Contextual Vocabulary & Legal Terminology',
    ],
  },
  {
    id: 'fac-law-vikram',
    name: 'Dr. Vikramaditya Sharma',
    title: 'Senior Professor of Procedural Law & Judicial Studies',
    department: 'School of Law & Judicial Services',
    email: 'dr.vikramaditya@msi-institutes.edu.in',
    phone: '+91 98112 34567',
    avatarUrl: '/images/faculty/faculty-1.webp',
    stream: 'Law',
    cabin: 'Chamber 204, Judicial Block A',
    assignedCourseCodes: ['MSI/PCSJ/01'],
    assignedSubjects: [
      'Code of Criminal Procedure & BNSS 2023',
      'Code of Civil Procedure (CPC 1908) & Judgment Writing',
    ],
  },
  {
    id: 'fac-jee-02',
    name: 'Er. Rajesh Verma',
    title: 'Associate Professor of Quantitative Techniques & Logic',
    department: 'Department of Applied Mathematics & Logic',
    email: 'rajesh.verma@msi-institutes.edu.in',
    phone: '+91 98765 11223',
    avatarUrl: '/images/avatars/avatar-3.webp',
    stream: 'JEE',
    cabin: 'Lab 4, Ramanujan Tech Block',
    assignedCourseCodes: ['MSI/QT/01'],
    assignedSubjects: [
      'Quantitative Aptitude for Law Entrances',
      'Data Interpretation & Statistical Graph Analysis',
    ],
  },
];

// --------------------------------------------------------------------------
// Courses (Filtered by Stream)
// --------------------------------------------------------------------------

export const ALL_TEACHER_COURSES: TeacherCourse[] = [
  // Handbook Law Courses
  {
    id: 'crs-t-01',
    code: 'MSI/LEGSTUDIES-/01',
    title: 'Legal Reasoning for CLAT: Principle-Fact Methodology',
    stream: 'Law',
    batch: 'CLAT Foundation & Target Batch 2026–27',
    totalStudents: 68,
    progress: 78,
    lecturesCompleted: 34,
    totalLectures: 44,
    nextLectureTime: 'Today, 10:00 AM',
  },
  {
    id: 'crs-t-02',
    code: 'MSI/GKCA/01',
    title: 'General Knowledge & Current Affairs (Merged 180 Sessions)',
    stream: 'Law',
    batch: 'CLAT UG Foundation Batch 2026–27 (Section A/B)',
    totalStudents: 92,
    progress: 62,
    lecturesCompleted: 112,
    totalLectures: 180,
    nextLectureTime: 'Today, 11:45 AM',
  },
  {
    id: 'crs-t-03',
    code: 'MSI/LR/01',
    title: 'Logical Reasoning for CLAT & AILET: Critical & Puzzles',
    stream: 'Law',
    batch: 'CLAT UG Foundation Batch 2026–27',
    totalStudents: 74,
    progress: 68,
    lecturesCompleted: 86,
    totalLectures: 126,
    nextLectureTime: 'Today, 02:00 PM',
  },
  {
    id: 'crs-t-04',
    code: 'MSI/ENGCLAT-/01',
    title: 'English for CLAT: Reading Comprehension & Word Power',
    stream: 'Law',
    batch: 'CLAT Foundation & Target Batch 2026–27',
    totalStudents: 65,
    progress: 70,
    lecturesCompleted: 31,
    totalLectures: 44,
    nextLectureTime: 'Today, 03:45 PM',
  },
  {
    id: 'crs-t-05',
    code: 'MSI/PCSJ/01',
    title: 'PCS J Comprehensive Foundation: Civil Judge & Procedural Laws',
    stream: 'Law',
    batch: 'Judiciary Honors Stream 2025–26',
    totalStudents: 58,
    progress: 84,
    lecturesCompleted: 118,
    totalLectures: 140,
    nextLectureTime: 'Today, 05:15 PM',
  },
  // Quantitative Techniques / Applied Logic
  {
    id: 'crs-t-06',
    code: 'MSI/QT/01',
    title: 'Quantitative Techniques: Data Interpretation & Caselets',
    stream: 'JEE',
    batch: 'CLAT Quant Focus Batch 2026',
    totalStudents: 60,
    progress: 64,
    lecturesCompleted: 26,
    totalLectures: 40,
    nextLectureTime: 'Tomorrow, 02:00 PM',
  },
];

// --------------------------------------------------------------------------
// Content Items (Publish / Unpublish toggle)
// --------------------------------------------------------------------------

export const ALL_TEACHER_CONTENT: TeacherContentItem[] = [
  // Legal Reasoning Content (Dr. Ekta Gahlawat)
  {
    id: 'cnt-01',
    title: 'Principle-Fact Methodology: Extracting Ratio Decidendi & Obiter Dicta (MSI/LEGSTUDIES-/01)',
    category: 'Notes',
    courseCode: 'MSI/LEGSTUDIES-/01',
    stream: 'Law',
    uploadDate: '18 Sep 2026',
    isPublished: true,
    sizeOrDuration: '3.6 MB (PDF)',
    downloadCount: 248,
  },
  {
    id: 'cnt-02',
    title: 'Essential Latin Legal Maxims Masterlist (Torts, Contracts & Constitutional Law)',
    category: 'Reference',
    courseCode: 'MSI/LEGSTUDIES-/01',
    stream: 'Law',
    uploadDate: '20 Sep 2026',
    isPublished: true,
    sizeOrDuration: '2.4 MB (PDF)',
    downloadCount: 310,
  },
  {
    id: 'cnt-03',
    title: 'Lecture Video: Strict Liability vs Absolute Liability (Rylands v Fletcher & MC Mehta)',
    category: 'Video',
    courseCode: 'MSI/LEGSTUDIES-/01',
    stream: 'Law',
    uploadDate: '22 Sep 2026',
    isPublished: true,
    sizeOrDuration: '48 mins',
    downloadCount: 185,
  },
  // GK & Current Affairs Content (Mr. Anurag Dwivedi)
  {
    id: 'cnt-04',
    title: 'Supreme Court Constitution-Bench Verdicts & Governor-State Assent Compendium (Sessions 1–10)',
    category: 'Notes',
    courseCode: 'MSI/GKCA/01',
    stream: 'Law',
    uploadDate: '21 Sep 2026',
    isPublished: true,
    sizeOrDuration: '4.8 MB (PDF)',
    downloadCount: 420,
  },
  {
    id: 'cnt-05',
    title: 'Static GK Addendum Track: Twelve Schedules of the Constitution & River Systems',
    category: 'Notes',
    courseCode: 'MSI/GKCA/01',
    stream: 'Law',
    uploadDate: '24 Sep 2026',
    isPublished: true,
    sizeOrDuration: '5.2 MB (PDF)',
    downloadCount: 380,
  },
  // Logical Reasoning Content (Ms. Riya Hooda)
  {
    id: 'cnt-06',
    title: 'Critical Reasoning: Assumption-Negation Rule & Fallacy Identification Worksheet',
    category: 'Assignment',
    courseCode: 'MSI/LR/01',
    stream: 'Law',
    uploadDate: '23 Sep 2026',
    isPublished: true,
    sizeOrDuration: '35 Questions',
    downloadCount: 290,
  },
  {
    id: 'cnt-07',
    title: 'Analytical Seating Arrangements: Facing Inward vs Outward Puzzle Grids',
    category: 'PYQ',
    courseCode: 'MSI/LR/01',
    stream: 'Law',
    uploadDate: '25 Sep 2026',
    isPublished: true,
    sizeOrDuration: '2.8 MB (PDF)',
    downloadCount: 320,
  },
  // English Content (Ms. Shikha Singh)
  {
    id: 'cnt-08',
    title: 'Passage Mapping Guide for Editorial Passages: The Hindu & The Indian Express',
    category: 'Reference',
    courseCode: 'MSI/ENGCLAT-/01',
    stream: 'Law',
    uploadDate: '22 Sep 2026',
    isPublished: true,
    sizeOrDuration: '2.1 MB (PDF)',
    downloadCount: 260,
  },
  // Judiciary Content (Dr. Vikramaditya Sharma)
  {
    id: 'cnt-09',
    title: 'Comparative Procedural Code: CrPC 1973 vs BNSS 2023 Section-by-Section Concordance',
    category: 'Notes',
    courseCode: 'MSI/PCSJ/01',
    stream: 'Law',
    uploadDate: '15 Sep 2026',
    isPublished: true,
    sizeOrDuration: '6.4 MB (PDF)',
    downloadCount: 395,
  },
  // Quantitative Content
  {
    id: 'cnt-10',
    title: 'Data Interpretation: Percentage Shifts & Bar Graph Caselets for Law Entrances',
    category: 'Notes',
    courseCode: 'MSI/QT/01',
    stream: 'JEE',
    uploadDate: '16 Sep 2026',
    isPublished: true,
    sizeOrDuration: '1.9 MB (PDF)',
    downloadCount: 140,
  },
];

// --------------------------------------------------------------------------
// Assessments
// --------------------------------------------------------------------------

export const ALL_ASSESSMENTS: AssessmentItem[] = [
  // Law Assessments
  {
    id: 'asmt-01',
    title: 'Legal Reasoning Sectional Diagnostic (30 Questions, Principle-Fact)',
    courseCode: 'MSI/LEGSTUDIES-/01',
    stream: 'Law',
    type: 'Mock',
    totalQuestions: 30,
    marks: 120,
    durationMinutes: 35,
    negativeMarking: '+1 / -0.25 Mark Penalty',
    scheduledDate: 'Available Live',
    status: 'Published',
    submissionsCount: 64,
    averageScore: 84.5,
  },
  {
    id: 'asmt-02',
    title: 'Baseline Assessment: 30-Question Diagnostic Sectional Test (Session 105)',
    courseCode: 'MSI/GKCA/01',
    stream: 'Law',
    type: 'Formal',
    totalQuestions: 30,
    marks: 120,
    durationMinutes: 30,
    negativeMarking: '+1 / -0.25 Mark Penalty',
    scheduledDate: '28 Sep 2026',
    status: 'Published',
    submissionsCount: 88,
    averageScore: 92.4,
  },
  {
    id: 'asmt-03',
    title: 'Critical Reasoning & Syllogism Speed Drill (Set #08)',
    courseCode: 'MSI/LR/01',
    stream: 'Law',
    type: 'Mock',
    totalQuestions: 25,
    marks: 100,
    durationMinutes: 25,
    negativeMarking: '+1 / -0.25 Mark Penalty',
    scheduledDate: '29 Sep 2026',
    status: 'Published',
    submissionsCount: 71,
    averageScore: 79.2,
  },
  {
    id: 'asmt-04',
    title: 'Full-Length Mock CLAT English Section Test & Discussion (Session 43)',
    courseCode: 'MSI/ENGCLAT-/01',
    stream: 'Law',
    type: 'Mock',
    totalQuestions: 24,
    marks: 96,
    durationMinutes: 25,
    negativeMarking: '+1 / -0.25 Mark Penalty',
    scheduledDate: '01 Oct 2026',
    status: 'Published',
    submissionsCount: 62,
    averageScore: 78.0,
  },
  {
    id: 'asmt-05',
    title: 'PCS J Prelims High-Yield Procedural Laws Mock (CPC + BNSS)',
    courseCode: 'MSI/PCSJ/01',
    stream: 'Law',
    type: 'Mock',
    totalQuestions: 50,
    marks: 200,
    durationMinutes: 60,
    negativeMarking: '+4 / -1 Mark Penalty',
    scheduledDate: '02 Oct 2026',
    status: 'Published',
    submissionsCount: 54,
    averageScore: 146.5,
  },
  // Quant Assessment
  {
    id: 'asmt-06',
    title: 'CLAT Quantitative Techniques Caselet Evaluation',
    courseCode: 'MSI/QT/01',
    stream: 'JEE',
    type: 'Formal',
    totalQuestions: 15,
    marks: 60,
    durationMinutes: 20,
    negativeMarking: '+1 / -0.25 Mark Penalty',
    scheduledDate: '03 Oct 2026',
    status: 'Draft',
    submissionsCount: 0,
  },
];

// --------------------------------------------------------------------------
// Students Enrolled in Teacher Batches (Stream Isolation Demonstration)
// --------------------------------------------------------------------------

export const ALL_STUDENT_MONITORING: StudentMonitoringRecord[] = [];

// --------------------------------------------------------------------------
// Class Schedules (Reflecting Official MSI Timetable)
// --------------------------------------------------------------------------

export const ALL_TEACHER_SCHEDULES: TeacherClassSchedule[] = [
  // Law Schedule
  {
    id: 'sch-01',
    subject: 'Legal Reasoning: Principle-Fact Methodology & Ratio Extraction',
    courseCode: 'MSI/LEGSTUDIES-/01',
    stream: 'Law',
    batch: 'CLAT Foundation Batch 2026–27',
    time: '10:00 AM – 11:30 AM',
    day: 'Today',
    venue: 'Smart Lecture Hall 2 (Legal Studies Wing)',
    meetLink: 'https://meet.google.com/msi-legal-live',
    type: 'Theory Lecture',
    isLiveNow: true,
  },
  {
    id: 'sch-02',
    subject: 'Constitutional & Governance Current Affairs: SC Bench Judgments',
    courseCode: 'MSI/GKCA/01',
    stream: 'Law',
    batch: 'CLAT UG Foundation Batch (Sec A/B)',
    time: '11:45 AM – 01:15 PM',
    day: 'Today',
    venue: 'Hall 1 (Main Auditorium)',
    meetLink: 'https://meet.google.com/msi-gkca-live',
    type: 'Theory Lecture',
    isLiveNow: false,
  },
  {
    id: 'sch-03',
    subject: 'Critical Reasoning: Assumption-Negation & Fallacy Spotting',
    courseCode: 'MSI/LR/01',
    stream: 'Law',
    batch: 'CLAT UG Foundation Batch',
    time: '02:00 PM – 03:30 PM',
    day: 'Today',
    venue: 'Aptitude Seminar Room 4',
    meetLink: 'https://meet.google.com/msi-lr-live',
    type: 'Theory Lecture',
    isLiveNow: false,
  },
  {
    id: 'sch-04',
    subject: 'Reading Comprehension Passage Mapping & Legal Vocabulary Drills',
    courseCode: 'MSI/ENGCLAT-/01',
    stream: 'Law',
    batch: 'CLAT Foundation & Target Batch',
    time: '03:45 PM – 05:00 PM',
    day: 'Today',
    venue: 'Verbal Studies Lab 3',
    type: 'Tutorial',
    isLiveNow: false,
  },
  {
    id: 'sch-05',
    subject: 'High Court Judgment Writing: Framing of Issues under Order XIV',
    courseCode: 'MSI/PCSJ/01',
    stream: 'Law',
    batch: 'Judiciary Honors Stream',
    time: '05:15 PM – 06:45 PM',
    day: 'Tomorrow',
    venue: 'Smart Moot Court Hall A',
    meetLink: 'https://meet.google.com/msi-moot-live',
    type: 'Practical / Moot',
    isLiveNow: false,
  },

  // Quant Schedule
  {
    id: 'sch-06',
    subject: 'Quantitative Techniques: Ratio & Percentage Caselet Analysis',
    courseCode: 'MSI/QT/01',
    stream: 'JEE',
    batch: 'CLAT Quant Focus Batch 2026',
    time: '10:00 AM – 11:30 AM',
    day: 'Today',
    venue: 'Computing Lab 4',
    meetLink: 'https://meet.google.com/msi-qt-live',
    type: 'Theory Lecture',
    isLiveNow: true,
  },
];

// --------------------------------------------------------------------------
// Communication Announcements & 1-on-1 Sessions
// --------------------------------------------------------------------------

export const ALL_COMMUNICATIONS: CommunicationPost[] = [
  {
    id: 'comm-01',
    title: 'Assignment 1 Released: Passage-Based Legal Critical Analysis',
    message: 'Students enrolled in MSI/LEGSTUDIES-/01 must submit their principle-fact deduction of the assigned Supreme Court judgment by Thursday 5:00 PM. Adhere strictly to the rubric.',
    courseCode: 'MSI/LEGSTUDIES-/01',
    stream: 'Law',
    author: 'Dr. Ekta Gahlawat (Legal Studies)',
    date: 'Today at 08:30 AM',
    type: 'Announcement',
  },
  {
    id: 'comm-02',
    title: 'Monthly Current Affairs Digest & PIB Archive Uploaded',
    message: 'The comprehensive digest covering G20 outcomes, RBI monetary decisions, and the Static GK River Systems worksheet is now available in your portal.',
    courseCode: 'MSI/GKCA/01',
    stream: 'Law',
    author: 'Mr. Anurag Dwivedi (GK & CA)',
    date: 'Today at 09:15 AM',
    type: 'Resource Note',
  },
  {
    id: 'comm-03',
    title: 'Weekly Reasoning Practice Set #07 Ready for Download',
    message: 'Practice the circular seating arrangement problems before our session tomorrow. Note down your personal error logs for discussion.',
    courseCode: 'MSI/LR/01',
    stream: 'Law',
    author: 'Ms. Riya Hooda (Logical Reasoning)',
    date: 'Yesterday at 04:30 PM',
    type: 'Class Update',
  },
  {
    id: 'comm-04',
    title: 'Quant Data Interpretation Caselet Problem Sheet',
    message: 'Review the 10 speed caselets before tomorrow’s lab session. Bring your graph workbooks.',
    courseCode: 'MSI/QT/01',
    stream: 'JEE',
    author: 'Er. Rajesh Verma',
    date: '16 Sep 2026',
    type: 'Resource Note',
  },
];

export const ALL_ONE_TO_ONE_SESSIONS: OneToOneSession[] = [];
