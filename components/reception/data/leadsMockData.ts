export type LeadStatus = 'New' | 'Follow-up' | 'Converted' | 'Dead';

export type LeadSource =
  | 'Super Admin (#2410)'
  | 'Website Enquiry'
  | 'Website Form'
  | 'Walk-in Desk'
  | 'Walk-in (Counter)'
  | 'Google Ads'
  | 'Social Ads'
  | 'Phone Enquiry'
  | 'Alumni Referral';

export type CallOutcome =
  | 'Connected — Interested'
  | 'Needs More Info'
  | 'Callback Requested'
  | 'No Answer / Switched Off'
  | 'Number Busy'
  | 'Wrong Number'
  | 'Not Interested';

export interface RemarkEntry {
  id: string;
  outcome: CallOutcome;
  text: string;
  timestamp: string;
  author: string;
  leadStatus: LeadStatus;
  nextFollowupDate?: string;
  nextFollowupTime?: string;
}

export interface Lead {
  id: string;
  name: string;
  location: string;
  mobile: string;
  targetCourse: string;
  source: LeadSource;
  receivedDate: string;
  status: LeadStatus;
  latestRemark: string;
  fullRemark?: string;
  nextFollowupDate?: string;
  nextFollowupTime?: string;
  isOverdue?: boolean;
  overdueText?: string;
  dueText?: string;
  agent: string;
  remarksHistory: RemarkEntry[];
}

export const INITIAL_LEADS: Lead[] = [];

export const COURSES_LIST = [
  'All Courses',
  'CLAT 2027 (2-Yr Class)',
  "Judiciary Foundation '26",
  'UPSC Law Optional',
  'PU Law 3-Yr Entrance',
  'CLAT 1-Yr Crash Course',
  'CLAT 2028 Foundation',
  'Judiciary Weekend',
];

export const SOURCES_LIST = [
  'All Sources',
  'Super Admin (#2410)',
  'Website Enquiry',
  'Walk-in Desk',
  'Walk-in (Counter)',
  'Google Ads',
  'Social Ads',
  'Phone Enquiry',
  'Alumni Referral',
];

export const COUNSELORS_LIST = [
  'All Counselors',
  'My Leads (Harshit)',
  'Super Admin',
  'System / Unassigned',
];
