export type VisitorType =
  | 'Parent'
  | 'Guest Faculty'
  | 'Vendor / Supplier'
  | 'Alumni'
  | 'Official / Inspector'
  | 'Job Candidate'
  | 'Contractor'
  | 'Student Inquiry';

export interface PastVisitRecord {
  date: string;
  purpose: string;
  hostPerson: string;
  department: string;
}

export interface Visitor {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  visitorType: VisitorType;
  purpose: string;
  department: string;
  hostPerson: string;
  entryTime: string;
  exitTime?: string;
  photoUrl: string;
  status: 'Inside' | 'Exited';
  govtIdType: string;
  govtIdNumber?: string;
  vehicleNo?: string;
  isMobileVerified: boolean;
  gateNumber: string;
  visitCount: number;
  remarks?: string;
  pastVisits?: PastVisitRecord[];
}

export interface ReceptionStaff {
  id: string;
  name: string;
  role: 'Reception Desk' | 'Gate Security' | 'Super Admin';
  location: string;
  email: string;
  phone?: string;
  badgeId: string;
  avatar: string;
}

export interface DepartmentHost {
  department: string;
  hosts: { name: string; designation: string }[];
}

export const RECEPTION_STAFF_PROFILES: ReceptionStaff[] = [
  {
    id: 'staff-harshit',
    name: 'Harshit',
    role: 'Reception Desk',
    location: 'Main Administrative Block (Reception Desk)',
    email: 'harshit.reception@msi-institutes.edu.in',
    phone: '9792303434',
    badgeId: 'MSI-REC-01',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'staff-01',
    name: 'Priya Verma',
    role: 'Reception Desk',
    location: 'Main Administrative Block (Ground Floor)',
    email: 'priya.reception@msi-institutes.edu.in',
    phone: '9876501234',
    badgeId: 'MSI-REC-02',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'staff-02',
    name: 'Gurpreet Singh',
    role: 'Gate Security',
    location: 'Main Entrance - Gate No. 1',
    email: 'gurpreet.security@msi-institutes.edu.in',
    phone: '9876505678',
    badgeId: 'MSI-SEC-04',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'staff-03',
    name: 'Col. H. S. Dhillon (Retd.)',
    role: 'Super Admin',
    location: 'Directorate of Institute Security & Admin',
    email: 'cso.dhillon@msi-institutes.edu.in',
    phone: '9876509999',
    badgeId: 'MSI-ADM-00',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

export const MSI_DEPARTMENTS: DepartmentHost[] = [
  {
    department: "Director's Secretariat",
    hosts: [
      { name: 'Dr. Hardeep Singh Gill', designation: 'Director General' },
      { name: 'Mrs. Kanwaljit Kaur', designation: 'Executive Secretary' },
    ],
  },
  {
    department: 'Faculty of Law & Judiciary',
    hosts: [
      { name: 'Dr. Vikramaditya Sharma', designation: 'Dean & Professor of Law' },
      { name: 'Prof. Rajeshwar Nath', designation: 'Senior Faculty (CrPC & Evidence)' },
      { name: 'Adv. Manpreet Sandhu', designation: 'Moot Court Coordinator' },
    ],
  },
  {
    department: 'Admissions & Counseling Wing',
    hosts: [
      { name: 'Mr. Arvind Malhotra', designation: 'Chief Admissions Officer' },
      { name: 'Ms. Simranjeet Kaur', designation: 'Senior Counselor (PCS-J & CLAT)' },
    ],
  },
  {
    department: 'Accounts & Fee Section',
    hosts: [
      { name: 'Mr. Rakesh Bhandari', designation: 'Chief Accounts Officer' },
      { name: 'Mr. Deepak Sharma', designation: 'Cashier & Fee Auditor' },
    ],
  },
  {
    department: 'Examination & Records Cell',
    hosts: [
      { name: 'Dr. Sunil K. Batra', designation: 'Controller of Examinations' },
      { name: 'Mrs. Neha Khosla', designation: 'Superintendent (Judiciary Mock Tests)' },
    ],
  },
  {
    department: 'Training & Placement Cell',
    hosts: [
      { name: 'Mr. Tarun Chopra', designation: 'Head of Placements' },
      { name: 'Ms. Ananya Roy', designation: 'Corporate Relations Officer' },
    ],
  },
  {
    department: 'Estate & Infrastructure Office',
    hosts: [
      { name: 'Er. Balwinder Singh', designation: 'Chief Estate Officer' },
      { name: 'Mr. Jagdish Prasad', designation: 'Facility Supervisor' },
    ],
  },
];

export const VISITOR_PURPOSES = [
  'Admission Inquiry & Counseling',
  'Parent-Teacher Consultation',
  'Document Verification / Submission',
  'Fee Payment & Accounts Clearance',
  'Guest Lecture / Seminar Speaker',
  'Official Inspection (Govt / Bar Council)',
  'Vendor / IT Equipment Delivery',
  'Institute Tour & Facilities Inspection',
  'Job Interview / Faculty Recruitment',
  'Alumni Interaction',
  'Maintenance / Electrical Inspection',
];

export const GOVT_ID_TYPES = [
  'Aadhaar Card',
  'Driving License',
  "Voter ID / Election Card",
  'Passport',
  'PAN Card',
  'Official Employee ID',
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'MSI-VIS-2025-0141',
    name: 'Rajinder Kumar Bansal',
    mobile: '9876543210',
    email: 'rajinder.bansal@gmail.com',
    visitorType: 'Parent',
    purpose: 'Admission Inquiry & Counseling',
    department: 'Admissions & Counseling Wing',
    hostPerson: 'Mr. Arvind Malhotra',
    entryTime: '09:15 AM',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    status: 'Inside',
    govtIdType: 'Aadhaar Card',
    govtIdNumber: 'XXXX-XXXX-4819',
    vehicleNo: 'PB-65-AK-4122',
    isMobileVerified: true,
    gateNumber: 'Gate 1 (Main Gate)',
    visitCount: 3,
    remarks: 'Accompanied by son for CLAT 2-Year Integrated Foundation Batch.',
    pastVisits: [
      { date: '12 Aug 2025', purpose: 'Prospectus Collection', hostPerson: 'Ms. Simranjeet Kaur', department: 'Admissions & Counseling Wing' },
      { date: '28 Aug 2025', purpose: 'Institute Tour & Facility Check', hostPerson: 'Mr. Arvind Malhotra', department: 'Admissions & Counseling Wing' },
    ],
  },
  {
    id: 'MSI-VIS-2025-0142',
    name: 'Advocate Sneha Chawla',
    mobile: '9811223344',
    email: 'sneha.chawla@delhibar.org',
    visitorType: 'Guest Faculty',
    purpose: 'Guest Lecture / Seminar Speaker',
    department: 'Faculty of Law & Judiciary',
    hostPerson: 'Dr. Vikramaditya Sharma',
    entryTime: '10:00 AM',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    status: 'Inside',
    govtIdType: 'Official Employee ID',
    govtIdNumber: 'D-BAR-2018-994',
    vehicleNo: 'CH-01-BK-9009',
    isMobileVerified: true,
    gateNumber: 'Gate 1 (Main Gate)',
    visitCount: 1,
    remarks: 'Delivering keynote lecture on Bharatiya Nyaya Sanhita (BNS) Transition in Moot Court 1.',
  },
  {
    id: 'MSI-VIS-2025-0143',
    name: 'Vikramjit Singh Sandhu',
    mobile: '9888990011',
    email: 'vikram.sandhu@gmail.com',
    visitorType: 'Vendor / Supplier',
    purpose: 'Vendor / IT Equipment Delivery',
    department: 'Estate & Infrastructure Office',
    hostPerson: 'Er. Balwinder Singh',
    entryTime: '10:25 AM',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    status: 'Inside',
    govtIdType: 'Driving License',
    govtIdNumber: 'PB-65-201700912',
    vehicleNo: 'PB-10-CZ-5511',
    isMobileVerified: true,
    gateNumber: 'Gate 2 (Service Gate)',
    visitCount: 5,
    remarks: 'Delivery of 15 All-in-One Computer terminals for Judiciary Speed Drill Lab.',
    pastVisits: [
      { date: '01 Sep 2025', purpose: 'CCTV Spares Delivery', hostPerson: 'Er. Balwinder Singh', department: 'Estate & Infrastructure Office' },
      { date: '10 Sep 2025', purpose: 'Network Router Setup', hostPerson: 'Er. Balwinder Singh', department: 'Estate & Infrastructure Office' },
    ],
  },
  {
    id: 'MSI-VIS-2025-0144',
    name: 'Dr. Meenakshi Soni',
    mobile: '9777112233',
    email: 'meenakshi.soni@pbiuniv.ac.in',
    visitorType: 'Official / Inspector',
    purpose: 'Official Inspection (Govt / Bar Council)',
    department: "Director's Secretariat",
    hostPerson: 'Dr. Hardeep Singh Gill',
    entryTime: '10:45 AM',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    status: 'Inside',
    govtIdType: 'Official Employee ID',
    govtIdNumber: 'PBI-FAC-2015',
    vehicleNo: 'PB-11-AA-0005',
    isMobileVerified: true,
    gateNumber: 'Gate 1 (Main Gate)',
    visitCount: 2,
    remarks: 'External Academic Auditor for State Judicial Services Coaching Program review.',
  },
  {
    id: 'MSI-VIS-2025-0145',
    name: 'Karanvir Singh Gill',
    mobile: '9814455667',
    email: 'karan.gill@gmail.com',
    visitorType: 'Alumni',
    purpose: 'Alumni Interaction',
    department: 'Faculty of Law & Judiciary',
    hostPerson: 'Prof. Rajeshwar Nath',
    entryTime: '11:10 AM',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Inside',
    govtIdType: 'Aadhaar Card',
    govtIdNumber: 'XXXX-XXXX-9021',
    vehicleNo: 'HR-03-R-8822',
    isMobileVerified: true,
    gateNumber: 'Gate 1 (Main Gate)',
    visitCount: 1,
    remarks: 'MSI Alumni Batch 2022, currently selected as Assistant District Attorney (ADA).',
  },
  {
    id: 'MSI-VIS-2025-0138',
    name: 'Suresh Kumar Aggarwal',
    mobile: '9417234567',
    email: 'suresh.aggarwal@hotmail.com',
    visitorType: 'Parent',
    purpose: 'Fee Payment & Accounts Clearance',
    department: 'Accounts & Fee Section',
    hostPerson: 'Mr. Deepak Sharma',
    entryTime: '08:30 AM',
    exitTime: '09:45 AM',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    status: 'Exited',
    govtIdType: 'PAN Card',
    govtIdNumber: 'ABGPA8821K',
    vehicleNo: 'PB-65-H-1901',
    isMobileVerified: true,
    gateNumber: 'Gate 1 (Main Gate)',
    visitCount: 2,
    remarks: 'Installment receipt #MSI-REC-8991 collected.',
  },
  {
    id: 'MSI-VIS-2025-0139',
    name: 'Ritu Sharma',
    mobile: '9855123489',
    email: 'ritu.sharma@gmail.com',
    visitorType: 'Job Candidate',
    purpose: 'Job Interview / Faculty Recruitment',
    department: 'Faculty of Law & Judiciary',
    hostPerson: 'Dr. Vikramaditya Sharma',
    entryTime: '09:00 AM',
    exitTime: '10:30 AM',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Exited',
    govtIdType: 'Aadhaar Card',
    govtIdNumber: 'XXXX-XXXX-1120',
    vehicleNo: 'CH-04-T-3321',
    isMobileVerified: true,
    gateNumber: 'Gate 1 (Main Gate)',
    visitCount: 1,
    remarks: 'Interviewed for Assistant Professor in Constitutional Law.',
  },
];

export const DEMO_VISITOR_PHOTO_FALLBACKS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
];
