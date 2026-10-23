export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  enrollmentNo: string;
  rollNo: string;
  batch: string;
  courseTitle: string;
  semester: string;
  avatarUrl: string;
  bloodGroup: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  admissionDate: string;
  validUntil: string;
  stream?: string;
  purchasedKits?: any[];
  profile?: any;
}

export interface ActiveCourse {
  id: string;
  code: string;
  title: string;
  faculty: string;
  progress: number;
  totalLectures: number;
  attendedLectures: number;
  isEnrolled: boolean;
  validUntil: string;
  category: string;
  accentColor: string;
  status: 'Active' | 'Locked' | 'Completed';
}

export interface TimetableClass {
  id: string;
  subject: string;
  code: string;
  faculty: string;
  time: string;
  day: string;
  room: string;
  type: 'Lecture' | 'Moot Court' | 'Tutorial' | 'Test Series';
  isLiveNow?: boolean;
  joinLink?: string;
}

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'academic' | 'exam' | 'fee' | 'urgent';
  read: boolean;
}

export interface RecordedVideo {
  id: string;
  title: string;
  subject: string;
  faculty: string;
  duration: string;
  uploadDate: string;
  videoUrl: string;
  thumbnail: string;
  isLocked?: boolean;
  topics: string[];
}

export interface NotePDF {
  id: string;
  title: string;
  subject: string;
  faculty: string;
  fileSize: string;
  uploadDate: string;
  downloadUrl: string;
  category: 'Class Notes' | 'Bare Act' | 'Summary' | 'Case Compendium' | 'Book Reference';
  pages: number;
  isLocked?: boolean;
}

export interface PYQItem {
  id: string;
  examName: string;
  year: number;
  subject: string;
  hasSolutions: boolean;
  totalQuestions: number;
  paperType: 'Prelims' | 'Mains';
  downloadUrl: string;
  isLocked?: boolean;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  assignedDate: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  maxMarks: number;
  scoredMarks?: number;
  facultyRemarks?: string;
  submittedFile?: string;
}

export interface AttendanceSubject {
  subject: string;
  code: string;
  total: number;
  attended: number;
  percentage: number;
  faculty: string;
}

export interface AttendanceLogEntry {
  id: string;
  date: string;
  day: string;
  subject: string;
  time: string;
  status: 'Present' | 'Absent' | 'Excused';
  markedBy: string;
}

export interface TestItem {
  id: string;
  title: string;
  subject: string;
  type: 'Timed' | 'Formal' | 'Mock';
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  scheduledDate: string;
  status: 'Available' | 'Completed' | 'Upcoming';
  scoredMarks?: number;
  percentile?: number;
  rank?: string;
  isLocked?: boolean;
}

export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
}

export interface FeeBreakdownItem {
  category: string;
  amount: number;
  status: 'Paid' | 'Pending';
  dueDate?: string;
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  date: string;
  amount: number;
  mode: 'UPI' | 'Net Banking' | 'Debit Card' | 'Bank Transfer';
  status: 'Successful' | 'Pending';
  remarks: string;
}

// --------------------------------------------------------------------------
// Sample Student Profiles
// --------------------------------------------------------------------------

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'msi-stu-001',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@msi-institutes.edu.in',
  phone: '+91 98765 43210',
  dob: '2004-08-14',
  age: 21,
  gender: 'Male',
  enrollmentNo: 'MSI/CLAT/2026/042',
  rollNo: '26-CLAT-042',
  batch: 'CLAT UG Foundation Batch, 2026–27 (Section A)',
  courseTitle: 'CLAT UG & Judiciary Entrance Foundation Programme',
  semester: 'Academic Year 2026–27',
  avatarUrl: '/images/avatars/avatar-1.webp',
  bloodGroup: 'B+',
  address: 'H.No. 402, Judicial Officers Enclave, Sector 71, Mohali, Punjab - 160071',
  guardianName: 'Sh. Rajesh Sharma (Senior Advocate)',
  guardianContact: '+91 98140 11223',
  admissionDate: '01 July 2025',
  validUntil: '31 July 2027',
};

export const DEMO_STUDENTS: StudentProfile[] = [
  INITIAL_STUDENT_PROFILE,
  {
    id: 'msi-stu-002',
    name: 'Meera Sen',
    email: 'meera.sen@msi-institutes.edu.in',
    phone: '+91 98123 99887',
    dob: '2005-11-22',
    age: 20,
    gender: 'Female',
    enrollmentNo: 'MSI/CLAT/2026/108',
    rollNo: '26-CLAT-018',
    batch: 'CLAT UG Target Batch, 2026–27 (Section B)',
    courseTitle: 'CLAT & AILET Integrated Law Entrance Coaching',
    semester: 'Academic Year 2026–27',
    avatarUrl: '/images/avatars/avatar-2.webp',
    bloodGroup: 'O+',
    address: 'Tower 4, Green Lotus Avenue, Kharar-Mohali Road, Punjab - 140301',
    guardianName: 'Dr. Sunita Sen',
    guardianContact: '+91 98722 33445',
    admissionDate: '15 June 2025',
    validUntil: '30 June 2027',
  },
];

// --------------------------------------------------------------------------
// Active & Locked Courses (Official MSI Handbooks)
// --------------------------------------------------------------------------

export const ACTIVE_COURSES: ActiveCourse[] = [];

// --------------------------------------------------------------------------
// Timetable & Upcoming Classes (From Official Handbooks)
// --------------------------------------------------------------------------

export const UPCOMING_CLASSES: TimetableClass[] = [
  {
    id: 'tt-01',
    subject: 'Legal Reasoning: Ratio Decidendi & Obiter Dicta in Landmark Verdicts',
    code: 'MSI/LEGSTUDIES-/01',
    faculty: 'Dr. Ekta Gahlawat',
    time: '10:00 AM – 11:15 AM',
    day: 'Today',
    room: 'Lecture Hall 1A (CLAT Wing)',
    type: 'Lecture',
    isLiveNow: true,
    joinLink: '/live-stream?title=Legal%20Reasoning%3A%20Ratio%20Decidendi%20vs%20Obiter%20Dicta',
  },
  {
    id: 'tt-02',
    subject: 'Current Affairs: Supreme Court Constitution-Bench Decisions & Delimitation',
    code: 'MSI/GKCA/01',
    faculty: 'Mr. Anurag Dwivedi',
    time: '11:30 AM – 01:00 PM',
    day: 'Today',
    room: 'Smart Amphitheatre Hall B',
    type: 'Lecture',
    isLiveNow: false,
    joinLink: '/live-stream?title=Current%20Affairs%3A%20Supreme%20Court%20Constitution-Bench%20Decisions',
  },
  {
    id: 'tt-03',
    subject: 'Logical Reasoning: Flaw Identification, Fallacies & Correlation vs Causation',
    code: 'MSI/LR/01',
    faculty: 'Ms. Riya Hooda',
    time: '02:00 PM – 03:30 PM',
    day: 'Today',
    room: 'Reasoning Lab 3',
    type: 'Tutorial',
    isLiveNow: false,
  },
  {
    id: 'tt-04',
    subject: 'English for CLAT: Reading Comprehension — Tone, Purpose & Fact vs Opinion',
    code: 'MSI/ENGCLAT-/01',
    faculty: 'Ms. Shikha Singh',
    time: '03:45 PM – 05:00 PM',
    day: 'Today',
    room: 'Seminar Hall 2',
    type: 'Lecture',
    isLiveNow: false,
  },
  {
    id: 'tt-05',
    subject: 'CLAT UG Full-Length Sectional Mock Drill #12 (All 5 Sections)',
    code: 'MSI/MOCK/12',
    faculty: 'MSI Central Evaluation Cell',
    time: '10:00 AM – 12:00 PM',
    day: 'Tomorrow',
    room: 'Online Testing Center / Hall A',
    type: 'Test Series',
  },
];

// --------------------------------------------------------------------------
// Notifications
// --------------------------------------------------------------------------

export const STUDENT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'notif-1',
    title: 'GK & Current Affairs: Month-End Compiled Digest Released',
    message: 'Mr. Anurag Dwivedi has uploaded the 180-Session Unit I & II Op-Ed Analysis compilation. Check Notes tab.',
    date: '1 hour ago',
    type: 'academic',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Legal Reasoning Assignment 1 Deadline Approaching',
    message: 'Dr. Ekta Gahlawat has scheduled submission for "Passage-Based Legal Critical Analysis" by 22 Sep.',
    date: '4 hours ago',
    type: 'exam',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'CLAT UG Foundation Batch Sectional Timed Mock #12 Live',
    message: 'Timed Mock covering Legal, Logical, GK, and English Language is now open for evaluation.',
    date: 'Yesterday',
    type: 'academic',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'Consultation Hours Notice: Dr. Ekta Gahlawat & Mr. Anurag Dwivedi',
    message: 'Faculty consultation hours are active between 10:00 am - 7:00 pm on all working days in Faculty Chambers.',
    date: '3 days ago',
    type: 'urgent',
    read: true,
  },
];

// --------------------------------------------------------------------------
// Learning: Recorded Videos (Real Handbook Curriculum)
// --------------------------------------------------------------------------

export const RECORDED_VIDEOS: RecordedVideo[] = [
  {
    id: 'vid-01',
    title: 'Legal Reasoning: Extracting Ratio Decidendi & Obiter Dicta (Sessions 1-3)',
    subject: 'Legal Reasoning for CLAT',
    faculty: 'Dr. Ekta Gahlawat',
    duration: '1h 15m',
    uploadDate: '18 Sep 2025',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: '/images/hero-1.webp',
    topics: ['Basics of Legal Reasoning', 'Principle-Fact Methodology', 'Deductive vs Inductive Logic'],
  },
  {
    id: 'vid-02',
    title: 'GK & Current Affairs: Recent Supreme Court Constitution-Bench Judgments (Session 1)',
    subject: 'General Knowledge & Current Affairs',
    faculty: 'Mr. Anurag Dwivedi',
    duration: '1h 25m',
    uploadDate: '16 Sep 2025',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: '/images/hero-2.webp',
    topics: ['Governor-State Friction', 'Anti-Defection & Speaker Powers', 'Uniform Civil Code Debates'],
  },
  {
    id: 'vid-03',
    title: 'Logical Reasoning: Critical Reasoning Fundamentals & Identifying Assumptions (Sessions 1-5)',
    subject: 'Logical Reasoning (CLAT & AILET)',
    faculty: 'Ms. Riya Hooda',
    duration: '1h 05m',
    uploadDate: '14 Sep 2025',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: '/images/hero-3.webp',
    topics: ['Premises and Conclusions', 'Implicit vs Explicit Assumptions', 'Strengthening & Weakening Arguments'],
  },
  {
    id: 'vid-04',
    title: 'English for CLAT: Reading Comprehension Mastery & Passage Mapping (Sessions 1-5)',
    subject: 'English for CLAT',
    faculty: 'Ms. Shikha Singh',
    duration: '58m',
    uploadDate: '12 Sep 2025',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: '/images/tour/tour-frame-1.webp',
    topics: ['Main Idea & Title Selection', "Author's Tone & Attitude", 'Fact vs Opinion Distinctions'],
  },
  {
    id: 'vid-05',
    title: 'Judicial Masterclass: Code of Criminal Procedure & BNSS 2023 Comparison',
    subject: 'PCS J Procedural Laws',
    faculty: 'Dr. Vikramaditya Sharma',
    duration: '2h 10m',
    uploadDate: '05 Sep 2025',
    videoUrl: '',
    thumbnail: '/images/tour/tour-frame-2.webp',
    isLocked: true, // Requires Judiciary Add-on
    topics: ['CrPC Section 154-173', 'Cognizable Offences', 'Trial Procedures Before Sessions Court'],
  },
];

// --------------------------------------------------------------------------
// Learning: Notes & PDFs (Real References from Handbook)
// --------------------------------------------------------------------------

export const NOTES_PDFS: NotePDF[] = [
  {
    id: 'pdf-01',
    title: 'MSI Course Handout: General Knowledge & Current Affairs (Complete 180-Session Edition)',
    subject: 'General Knowledge & Current Affairs',
    faculty: 'Mr. Anurag Dwivedi',
    fileSize: '5.2 MB',
    uploadDate: '18 Sep 2025',
    downloadUrl: '#',
    category: 'Class Notes',
    pages: 11,
  },
  {
    id: 'pdf-02',
    title: 'Course Handout: Legal Reasoning for CLAT (Units I–VI & Landmark SC Judgments)',
    subject: 'Legal Reasoning for CLAT',
    faculty: 'Dr. Ekta Gahlawat',
    fileSize: '3.8 MB',
    uploadDate: '15 Sep 2025',
    downloadUrl: '#',
    category: 'Class Notes',
    pages: 5,
  },
  {
    id: 'pdf-03',
    title: 'Course Handout: Logical Reasoning (CLAT & AILET, 126-Session Comprehensive Guide)',
    subject: 'Logical Reasoning (CLAT & AILET)',
    faculty: 'Ms. Riya Hooda',
    fileSize: '4.4 MB',
    uploadDate: '12 Sep 2025',
    downloadUrl: '#',
    category: 'Class Notes',
    pages: 9,
  },
  {
    id: 'pdf-04',
    title: 'Course Handout: English for CLAT (Grammar, Vocabulary & Reading Comprehension)',
    subject: 'English for CLAT',
    faculty: 'Ms. Shikha Singh',
    fileSize: '3.6 MB',
    uploadDate: '10 Sep 2025',
    downloadUrl: '#',
    category: 'Class Notes',
    pages: 5,
  },
  {
    id: 'pdf-05',
    title: 'Essential Latin Legal Maxims & Statutory Definitions Compendium (Torts, Contracts & Constitution)',
    subject: 'Legal Studies & Vocabulary',
    faculty: 'Dr. Ekta Gahlawat & Ms. Shikha Singh',
    fileSize: '4.1 MB',
    uploadDate: '05 Sep 2025',
    downloadUrl: '#',
    category: 'Case Compendium',
    pages: 42,
  },
  {
    id: 'pdf-06',
    title: 'Judicial Services Advanced Judgment Writing & High Court Appeal Formulation',
    subject: 'PCS J Procedural Laws',
    faculty: 'Dr. Vikramaditya Sharma',
    fileSize: '7.8 MB',
    uploadDate: '01 Sep 2025',
    downloadUrl: '#',
    category: 'Summary',
    pages: 88,
    isLocked: true,
  },
  {
    id: 'pdf-mb-01',
    title: 'MSI Master Book 1 — General Knowledge & Current Affairs (Official Edition)',
    subject: 'General Knowledge & Current Affairs',
    faculty: 'Mr. Anurag Dwivedi',
    fileSize: '18.4 MB',
    uploadDate: '15 Sep 2026',
    downloadUrl: '#',
    category: 'Book Reference',
    pages: 340,
  },
  {
    id: 'pdf-mb-02',
    title: 'MSI Master Book 2 — Quantitative Aptitude & Mathematics (Shortcuts & Speed Drills)',
    subject: 'Quantitative Aptitude',
    faculty: 'Er. Rajesh Verma',
    fileSize: '14.2 MB',
    uploadDate: '15 Sep 2026',
    downloadUrl: '#',
    category: 'Book Reference',
    pages: 280,
  },
  {
    id: 'pdf-mb-03',
    title: 'MSI Master Book 3 — Legal Reasoning & Legal Studies (Constitution, Torts & Contracts)',
    subject: 'Legal Reasoning for CLAT',
    faculty: 'Dr. Ekta Gahlawat',
    fileSize: '22.1 MB',
    uploadDate: '15 Sep 2026',
    downloadUrl: '#',
    category: 'Book Reference',
    pages: 410,
  },
  {
    id: 'pdf-mb-04',
    title: 'MSI Master Book 4 — Quantitative Techniques (Data Interpretation & Caselets)',
    subject: 'Quantitative Techniques',
    faculty: 'Er. Rajesh Verma',
    fileSize: '12.8 MB',
    uploadDate: '15 Sep 2026',
    downloadUrl: '#',
    category: 'Book Reference',
    pages: 240,
  },
  {
    id: 'pdf-mb-05',
    title: 'MSI Master Book 5 — Logical & Critical Reasoning (Arguments, Syllogisms & Puzzles)',
    subject: 'Logical Reasoning (CLAT & AILET)',
    faculty: 'Ms. Riya Hooda',
    fileSize: '19.5 MB',
    uploadDate: '15 Sep 2026',
    downloadUrl: '#',
    category: 'Book Reference',
    pages: 360,
  },
  {
    id: 'pdf-mb-06',
    title: 'MSI Master Book 6 — English Language & Comprehension (Passages, Vocabulary & Grammar)',
    subject: 'English for CLAT',
    faculty: 'Ms. Shikha Singh',
    fileSize: '16.7 MB',
    uploadDate: '15 Sep 2026',
    downloadUrl: '#',
    category: 'Book Reference',
    pages: 310,
  },
];

// --------------------------------------------------------------------------
// Learning: PYQs (Previous Year Questions)
// --------------------------------------------------------------------------

export const PYQS_LIST: PYQItem[] = [
  {
    id: 'pyq-01',
    examName: 'CLAT UG Official Question Paper (Consortium of NLUs)',
    year: 2024,
    subject: 'Complete 120-Question Paper: Legal, Logical, GK, English, Quants',
    hasSolutions: true,
    totalQuestions: 120,
    paperType: 'Prelims',
    downloadUrl: '#',
  },
  {
    id: 'pyq-02',
    examName: 'AILET (All India Law Entrance Test — NLU Delhi)',
    year: 2024,
    subject: 'Logical Reasoning, English Language & General Knowledge',
    hasSolutions: true,
    totalQuestions: 150,
    paperType: 'Prelims',
    downloadUrl: '#',
  },
  {
    id: 'pyq-03',
    examName: 'CLAT UG Official Question Paper',
    year: 2023,
    subject: 'Passage-Based Legal Aptitude & Comprehensive Reasoning',
    hasSolutions: true,
    totalQuestions: 150,
    paperType: 'Prelims',
    downloadUrl: '#',
  },
  {
    id: 'pyq-04',
    examName: 'Punjab Civil Services (Judicial Branch) Prelims',
    year: 2024,
    subject: 'Civil Law, Criminal Law & Constitutional Law',
    hasSolutions: true,
    totalQuestions: 125,
    paperType: 'Prelims',
    downloadUrl: '#',
  },
  {
    id: 'pyq-05',
    examName: 'SLAT & LSAT-India Law Entrance Paper',
    year: 2024,
    subject: 'Analytical Reasoning, Legal Aptitude & Reading Comprehension',
    hasSolutions: true,
    totalQuestions: 92,
    paperType: 'Prelims',
    downloadUrl: '#',
    isLocked: true,
  },
];

// --------------------------------------------------------------------------
// Learning: Assignments (Real Handbook Tasks)
// --------------------------------------------------------------------------

export const ASSIGNMENTS_LIST: AssignmentItem[] = [];

// --------------------------------------------------------------------------
// Attendance: Subject Breakdown & Logs (Official MSI Handbooks)
// --------------------------------------------------------------------------

export const ATTENDANCE_SUBJECTS: AttendanceSubject[] = [];

export const ATTENDANCE_LOGS: AttendanceLogEntry[] = [];

// --------------------------------------------------------------------------
// Tests & Assessments Data
// --------------------------------------------------------------------------

export const TESTS_LIST: TestItem[] = [
  {
    id: 'test-01',
    title: 'CLAT UG High-Yield Sectional Diagnostic Mock (Test #12)',
    subject: 'Legal Reasoning & Constitutional Law Speed Drill',
    type: 'Timed',
    durationMinutes: 5,
    totalQuestions: 5,
    totalMarks: 20,
    scheduledDate: 'Available Now',
    status: 'Available',
  },
  {
    id: 'test-04',
    title: 'All-India Open CLAT UG Grand Mock #04 (National Law Universities)',
    subject: 'Full 5-Section CLAT Pattern (NLUs Format)',
    type: 'Timed',
    durationMinutes: 120,
    totalQuestions: 120,
    totalMarks: 120,
    scheduledDate: 'Upcoming: 28 Sep 2026',
    status: 'Upcoming',
  },
  {
    id: 'test-05',
    title: 'AILET Speed Mastery Simulation (NLU Delhi Specific Pattern)',
    subject: 'Advanced Critical Reasoning & Contemporary Legal Passages',
    type: 'Formal',
    durationMinutes: 120,
    totalQuestions: 150,
    totalMarks: 150,
    scheduledDate: '15 Oct 2026',
    status: 'Upcoming',
    isLocked: true,
  },
];

// Sample Interactive Timed Test Questions (Matching Real Handbook Topics)
export const TIMED_MOCK_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: 'In Legal Reasoning, which part of a judicial decision constitutes the binding legal principle that creates precedent for lower courts?',
    options: [
      'Ratio Decidendi',
      'Obiter Dicta',
      'Res Sub-Judice',
      'Damnum Sine Injuria',
    ],
    correctIndex: 0,
    explanation: 'Ratio decidendi is the legal reasoning and rationale necessary for determining the issue before the court, which forms the binding precedent, unlike obiter dicta.',
    subject: 'Legal Reasoning',
  },
  {
    id: 2,
    question: 'Under the Law of Torts, the legal maxim "Injuria Sine Damno" signifies which of the following principles?',
    options: [
      'Actual financial damage suffered without violation of any legal right',
      'Infringement of an absolute legal right without causing actual damage or loss',
      'Harm caused by an inevitable act of God',
      'Voluntary assumption of risk barring a compensation claim',
    ],
    correctIndex: 1,
    explanation: 'Injuria Sine Damno (as exemplified in Ashby v. White) establishes that the violation of a person\'s legal right is actionable per se, even if no pecuniary loss has resulted.',
    subject: 'Law of Torts',
  },
  {
    id: 3,
    question: 'In Constitutional Law, which landmark 13-judge Supreme Court bench verdict established the "Basic Structure Doctrine" limiting the amending powers under Article 368?',
    options: [
      'Golaknath v. State of Punjab (1967)',
      'Kesavananda Bharati v. State of Kerala (1973)',
      'Minerva Mills v. Union of India (1980)',
      'Maneka Gandhi v. Union of India (1978)',
    ],
    correctIndex: 1,
    explanation: 'In Kesavananda Bharati (1973), the Supreme Court ruled that while Parliament has wide amending powers under Article 368, it cannot alter the Basic Structure of the Constitution.',
    subject: 'Constitutional Law',
  },
  {
    id: 4,
    question: 'In Critical Reasoning, what is the core difference between an "Assumption" and an "Inference"?',
    options: [
      'An assumption is stated explicitly in the passage, whereas an inference is always hidden.',
      'An assumption is an unstated premise required for the conclusion; an inference is a conclusion that can be logically deduced from the given facts.',
      'An assumption can be mathematically disproven; an inference is always opinion-based.',
      'There is no logical difference between an assumption and an inference in CLAT passages.',
    ],
    correctIndex: 1,
    explanation: 'An assumption is an unstated link the author must believe to reach the conclusion, while an inference is an unstated fact that must be true based on the explicit premises.',
    subject: 'Logical Reasoning',
  },
  {
    id: 5,
    question: 'Under the Indian Contract Act, 1872, what is the legal status of an agreement entered into with a minor (under Section 11)?',
    options: [
      'Voidable at the option of the minor upon attaining majority',
      'Valid if executed in writing and duly registered',
      'Void ab initio (void from the very beginning, as held in Mohori Bibee v. Dharmodas Ghose)',
      'Enforceable if approved by the guardian',
    ],
    correctIndex: 2,
    explanation: 'As settled by the Privy Council in Mohori Bibee v. Dharmodas Ghose (1903), an agreement made by a minor is void ab initio.',
    subject: 'Law of Contract',
  },
];

// --------------------------------------------------------------------------
// Fees & Accounts Data
// --------------------------------------------------------------------------

export const FEE_BREAKDOWN: FeeBreakdownItem[] = [
  {
    category: 'Admission & Institutional Registration',
    amount: 10000,
    status: 'Paid',
    dueDate: 'Cleared on Admission',
  },
  {
    category: 'Academic Tuition & Faculty Mentorship (Semester 1)',
    amount: 25000,
    status: 'Paid',
    dueDate: 'Cleared on Enrollment',
  },
  {
    category: 'Digital LMS, National Bare Acts Library & Handbook Kits',
    amount: 5000,
    status: 'Paid',
    dueDate: 'Cleared on Dispatch',
  },
  {
    category: 'Academic Tuition & Faculty Mentorship (Semester 2)',
    amount: 25000,
    status: 'Pending',
    dueDate: '15 Nov 2026',
  },
  {
    category: 'All-India Grand Mock Test Series & National Ranking Audit',
    amount: 5000,
    status: 'Pending',
    dueDate: '30 Nov 2026',
  },
];

export const FEE_TRANSACTIONS: FeeTransaction[] = [
  {
    id: 'TXN-MSI-8841',
    receiptNo: 'MSI/REC/2026/0891',
    date: '02 Aug 2026',
    amount: 40000,
    mode: 'UPI',
    status: 'Successful',
    remarks: 'Semester 1 Academic Tuition & Registration (Razorpay Instant Clearance)',
  },
];

export const FEE_SUMMARY = {
  totalFee: 70000,
  paidFee: 40000,
  pendingFee: 30000,
  nextDueDate: '15 Nov 2026',
  academicYear: '2026 – 2027',
  scholarshipApplied: 'Merit Entrance Waiver 10%',
  courseValidity: 'Active (Valid until 31 July 2027)',
};
