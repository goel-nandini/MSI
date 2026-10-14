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
    avatar: '/images/avatars/avatar-1.webp',
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

export const INITIAL_VISITORS: Visitor[] = [];

export const DEMO_VISITOR_PHOTO_FALLBACKS = [
  '/images/avatars/avatar-1.webp',
  '/images/avatars/avatar-2.webp',
  '/images/avatars/avatar-3.webp',
  '/images/avatars/avatar-4.webp',
  '/images/avatars/avatar-5.webp',
];
