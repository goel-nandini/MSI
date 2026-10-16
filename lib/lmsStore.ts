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
  courseId: string;
  enrolledAt: string;
  progressPercentage: number;
  completedLectureIds: string[];
  assignedBy: 'self' | 'super-admin' | 'teacher';
  assignedByName?: string;
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
            title: '01. Basics of Legal Reasoning: Principle-Fact Application & Deductive vs Inductive Logic',
            duration: '45:10',
            durationSeconds: 2710,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            preview: true,
            summary: 'Understanding the mechanics of applying legal principles to factual matrixes without outside bias.',
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

  // Course 2: General Knowledge & Current Affairs (MSI/GKCA/01)
  {
    id: 'crs-msi-gkca',
    slug: 'general-knowledge-current-affairs-clat',
    title: 'General Knowledge & Current Affairs: 180-Session Comprehensive Mastercourse (MSI/GKCA/01)',
    headline: 'Complete Merged Edition: Units I–IX Live Current Affairs & Units X–XIX Static GK Addendum',
    description: 'The official merged 180-session course handout for CLAT UG Foundation Batch 2026–27. Covers constitutional updates, international relations, macroeconomic policy, science, climate accords, and the comprehensive static GK foundation across Indian History, Polity, and Geography.',
    category: 'Law Entrance',
    department: 'law',
    badge: 'Highest Rated',
    rating: 4.9,
    reviewCount: 3120,
    totalDuration: '180 total hours',
    totalLectures: 45,
    level: 'All Levels',
    thumbnail: '/images/courses/gkca.jpg',
    price: 2999,
    originalPrice: 9999,
    isFreeForMsiStudents: true,
    instructorId: 'fac-law-anurag',
    instructorName: 'Mr. Anurag Dwivedi',
    instructorTitle: 'Faculty – General Knowledge & Current Affairs, MSI Group of Institutes',
    instructorAvatar: '/images/avatars/avatar-1.webp',
    updatedDate: 'Academic Session 2026–27',
    language: 'English & Hindi (Bilingual)',
    isPublished: true,
    whatYouWillLearn: [
      'Constitutional & Governance Current Affairs: SC Constitution-Bench Rulings, Delimitation & Reservation bills',
      'Geopolitics & Bilateral Ties: G20 outcomes, BRICS expansion, SCO & Quad summits, Red Sea maritime security',
      'Macroeconomic Policy & Union Budget: Inflation metrics (CPI, WPI, IIP), RBI monetary stance, Digital Rupee & UPI',
      'Science, Space & Climate: ISRO missions, Semiconductor push, AI governance, COP summits & Net-Zero targets',
      'Static GK Track (Units X–XIX): Indus Valley to Modern Freedom Struggle, 12 Schedules of Constitution, River Systems, Static Science & LPG Reforms',
      'Passage-based reading comprehension technique for 450-word editorial and institutional reports'
    ],
    requirements: [
      'Daily reading habit of national dailies (The Hindu, The Indian Express, The Tribune)',
      'Basic awareness of Indian political structure and world geography fundamentals'
    ],
    sections: [
      {
        id: 'sec-gk-1',
        title: 'Units I–II: Constitutional Governance & Geopolitics (Sessions 1–40)',
        duration: '18 hours 30 mins',
        lectures: [
          {
            id: 'lec-gk-1-1',
            title: '01. Recent Supreme Court Constitution-Bench Verdicts & Centre-State Jurisprudence',
            duration: '48:20',
            durationSeconds: 2900,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            preview: true,
            summary: 'Detailed reasoning behind major 5-judge and 7-judge benches, Governor-State friction, and legislative assent.',
            resources: [
              { title: 'SC_Constitution_Bench_Digest_2026.pdf', type: 'pdf', size: '3.4 MB', downloadUrl: '#' },
              { title: 'Governor_Powers_Dispute_Summary.pdf', type: 'notes', size: '1.2 MB', downloadUrl: '#' }
            ]
          },
          {
            id: 'lec-gk-1-2',
            title: '02. G20 Outcomes, Global South Initiatives & BRICS Expansion Dynamics',
            duration: '46:15',
            durationSeconds: 2775,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            preview: true,
            summary: 'Shifting multilateral currencies, New Delhi Declaration implementations, and trade corridor pacts.'
          },
          {
            id: 'lec-gk-1-3',
            title: '03. Red Sea Maritime Security, West Asia Tensions & Strategic Maritime Chokepoints',
            duration: '44:40',
            durationSeconds: 2680,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            preview: false,
            summary: 'Strait of Hormuz, Bab-el-Mandeb, Malacca Strait, and energy security ramifications for India.'
          }
        ]
      },
      {
        id: 'sec-gk-2',
        title: 'Units III–IV: Economy, Infrastructure, Science & Climate (Sessions 41–80)',
        duration: '22 hours 10 mins',
        lectures: [
          {
            id: 'lec-gk-2-1',
            title: '04. Union Budget Allocations, Deficit Targets, RBI MPC Rate Stance & Inflation Metrics',
            duration: '52:10',
            durationSeconds: 3130,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            preview: false,
            summary: 'Fiscal deficit vs Revenue deficit, CPI vs WPI inflation baskets, and monetary policy transmission.'
          },
          {
            id: 'lec-gk-2-2',
            title: '05. ISRO Deep Space Missions, Semiconductor Fabrication Push & AI Governance',
            duration: '49:30',
            durationSeconds: 2970,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            preview: false,
            summary: 'Gaganyaan, Chandrayaan science return, India Semiconductor Mission (ISM), and global AI accords.'
          },
          {
            id: 'lec-gk-2-3',
            title: '06. India’s Net-Zero Roadmap 2070, Green Hydrogen & Protected Wetland Notifications',
            duration: '47:00',
            durationSeconds: 2820,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            preview: false,
            summary: 'Ramsar sites, national emissions targets, carbon border adjustment mechanisms, and COP outcomes.'
          }
        ]
      },
      {
        id: 'sec-gk-3',
        title: 'Units X–XIX: Static General Knowledge Addendum (Sessions 127–180)',
        duration: '28 hours 40 mins',
        lectures: [
          {
            id: 'lec-gk-3-1',
            title: '07. Ancient & Medieval India: Indus Valley Sites, Mauryan Edicts & Mughal Administrative Structure',
            duration: '55:30',
            durationSeconds: 3330,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            preview: true,
            summary: 'High-yield timeline of ancient urbanization, Ashokan inscriptions, Delhi Sultanate, and Vijayanagara kingdom.'
          },
          {
            id: 'lec-gk-3-2',
            title: '08. Modern Indian Freedom Struggle: 1857 Revolt to Constituent Assembly Formation',
            duration: '53:15',
            durationSeconds: 3195,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            preview: false,
            summary: 'Moderate vs Extremist phases, Gandhian mass movements, INA trials, and the Indian Independence Act 1947.'
          },
          {
            id: 'lec-gk-3-3',
            title: '09. Indian & World Geography: Himalayan & Peninsular Rivers, Climate & Natural Resources',
            duration: '50:40',
            durationSeconds: 3040,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            preview: false,
            summary: 'Physiographic divisions of India, monsoon mechanism, mineral belts, and international borders.'
          }
        ]
      }
    ]
  },

  // Course 3: Logical Reasoning (CLAT & AILET) (MSI/LR/01)
  {
    id: 'crs-msi-lr',
    slug: 'logical-reasoning-for-clat-ailet',
    title: 'Logical Reasoning for CLAT & AILET: Critical Reasoning & Analytical Puzzles (MSI/LR/01)',
    headline: '126-Session Comprehensive Syllabus: Argument Analysis, Syllogisms, Seating Arrangements & Mixed Reasoning',
    description: 'Structured directly from the official MSI Logical Reasoning Handout. Develops speed, precision, and argument breakdown technique across Critical Reasoning, Analytical Puzzles, Syllogisms, Coding-Decoding, and Passage-Based Comprehension Drills.',
    category: 'Law Entrance',
    department: 'law',
    badge: 'Recommended',
    rating: 4.8,
    reviewCount: 1940,
    totalDuration: '126 total hours',
    totalLectures: 36,
    level: 'All Levels',
    thumbnail: '/images/courses/lr.jpg',
    price: 2299,
    originalPrice: 7999,
    isFreeForMsiStudents: true,
    instructorId: 'fac-law-riya',
    instructorName: 'Ms. Riya Hooda',
    instructorTitle: 'Faculty – Logical Reasoning, MSI Group of Institutes',
    instructorAvatar: '/images/avatars/avatar-4.webp',
    updatedDate: 'Academic Session 2026–27',
    language: 'English',
    isPublished: true,
    whatYouWillLearn: [
      'Critical reasoning fundamentals: Premises, conclusions, implicit assumptions, and strong vs weak inferences',
      'Advanced argument evaluation: Strengthening, weakening, paradox resolution, and assumption-negation techniques',
      'Analytical puzzle mastery: Linear, circular, facing-center/outward, floor, and multi-parameter puzzle solving',
      'Syllogisms and Venn diagrams with 100% accuracy using Euler diagrams and formal categorical logic',
      'Deciphering complex passage-based editorial arguments and identifying unstated author biases',
      'Speed-accuracy optimization and personal error-log construction for CLAT & AILET entrance exams'
    ],
    requirements: [
      'Elementary familiarity with number/letter series and comfort with everyday logical arguments',
      'Enrolled in CLAT UG Foundation Batch 2026–27 Section A/B'
    ],
    sections: [
      {
        id: 'sec-lr-1',
        title: 'Unit I: Critical Reasoning Fundamentals (Sessions 1–20)',
        duration: '14 hours 20 mins',
        lectures: [
          {
            id: 'lec-lr-1-1',
            title: '01. Anatomy of Arguments: Premises, Conclusions & Core Logical Claims',
            duration: '44:15',
            durationSeconds: 2655,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
            preview: true,
            summary: 'How to separate supporting facts and background context from the author’s primary thesis.',
            resources: [
              { title: 'Argument_Structure_Breakdown_Template.pdf', type: 'pdf', size: '2.1 MB', downloadUrl: '#' }
            ]
          },
          {
            id: 'lec-lr-1-2',
            title: '02. Assumptions: Implicit vs Explicit & The Assumption-Negation Rule',
            duration: '46:00',
            durationSeconds: 2760,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            preview: true,
            summary: 'Spotting the unstated bridge between premise and conclusion using rigorous negation testing.'
          },
          {
            id: 'lec-lr-1-3',
            title: '03. Common Fallacies: Correlation vs Causation, Circular Reasoning & Straw Man',
            duration: '42:50',
            durationSeconds: 2570,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            preview: false,
            summary: 'Identifying traps set by examiners to lure students into false deductive leaps.'
          }
        ]
      },
      {
        id: 'sec-lr-2',
        title: 'Unit II: Analytical & Puzzle-Based Reasoning (Sessions 21–40)',
        duration: '16 hours 10 mins',
        lectures: [
          {
            id: 'lec-lr-2-1',
            title: '04. Seating Arrangements: Linear & Circular (Facing Inward vs Outward)',
            duration: '51:10',
            durationSeconds: 3070,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            preview: false,
            summary: 'Grid mapping, definite clues, and eliminating redundant cases in double-row arrangements.'
          },
          {
            id: 'lec-lr-2-2',
            title: '05. Blood Relations & Direction Sense Multi-Step Puzzles',
            duration: '48:30',
            durationSeconds: 2910,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            preview: false,
            summary: 'Tree diagrams, gender notation, Pythagorean displacement, and angular rotation shortcuts.'
          }
        ]
      },
      {
        id: 'sec-lr-3',
        title: 'Unit III–IV: Passage-Based Editorial Reasoning & Timed Mocks (Sessions 41–126)',
        duration: '20 hours 00 mins',
        lectures: [
          {
            id: 'lec-lr-3-1',
            title: '06. Dissecting Opinion-Editorial Passages for Central Argument & Tone',
            duration: '47:40',
            durationSeconds: 2860,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            preview: true,
            summary: 'Reading editorial excerpts from The Hindu and Indian Express with question-first vs passage-first tactics.'
          },
          {
            id: 'lec-lr-3-2',
            title: '07. Resolving Paradoxes & Identifying Unstated Assumptions in Complex Scenarios',
            duration: '49:15',
            durationSeconds: 2955,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            preview: false,
            summary: 'Handling conflicting statistical claims and finding the harmonizing statement in timed condition.'
          }
        ]
      }
    ]
  },

  // Course 4: English for CLAT (MSI/ENGCLAT-/01)
  {
    id: 'crs-msi-engclat',
    slug: 'english-for-clat',
    title: 'English for CLAT: Reading Comprehension, Grammar & Legal Vocabulary (MSI/ENGCLAT-/01)',
    headline: '44-Session Intensive Handout: Editorial Passage Mapping, Literary Devices, Cloze Tests & Grammar Drills',
    description: 'Structured from the official MSI English Handout. Takes students from grammar fundamentals and Latin word power to advanced passage comprehension, literary device identification, and timed error-detection drills designed for the CLAT English Language paper.',
    category: 'Law Entrance',
    department: 'law',
    badge: 'Recommended',
    rating: 4.8,
    reviewCount: 1650,
    totalDuration: '44 total hours',
    totalLectures: 28,
    level: 'Beginner',
    thumbnail: '/images/courses/english.jpg',
    price: 2199,
    originalPrice: 6999,
    isFreeForMsiStudents: true,
    instructorId: 'fac-law-shikha',
    instructorName: 'Ms. Shikha Singh',
    instructorTitle: 'English Faculty, MSI Group of Institutes',
    instructorAvatar: '/images/avatars/avatar-5.webp',
    updatedDate: 'Academic Session 2026–27',
    language: 'English',
    isPublished: true,
    whatYouWillLearn: [
      'Advanced Reading Comprehension: Main idea deduction, author’s tone, and differentiating direct facts from inferences',
      'Contextual Vocabulary: Word Power Made Easy root words, Latin prefixes, idioms, phrasal verbs, and collocations',
      'Grammar & Error Spotting: Subject-verb agreement, modifiers, parallelism, conditional clauses, and tense sequences',
      'Figures of Speech: Simile, metaphor, hyperbole, oxymoron, irony, synecdoche, litotes, and rhetorical anaphora',
      'Sentence Skills: Para-jumbles sequencing, cloze tests, sentence rearrangement, and punctuation subtleties',
      'Legal & Contemporary Reading: Constitutional terminology and editorial analysis of contemporary social issues'
    ],
    requirements: [
      'Basic working knowledge of English grammar and sentence construction at Class X–XII level',
      'Commitment to daily vocabulary journal and editorial summary submissions'
    ],
    sections: [
      {
        id: 'sec-eng-1',
        title: 'Unit I: Advanced Reading Comprehension (Sessions 1–5)',
        duration: '8 hours 30 mins',
        lectures: [
          {
            id: 'lec-eng-1-1',
            title: '01. Central Theme, Title Selection & Differentiating Fact from Author Opinion',
            duration: '46:30',
            durationSeconds: 2790,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            preview: true,
            summary: 'Strategies to pinpoint the author’s primary purpose without getting trapped in illustrative examples.',
            resources: [
              { title: 'CLAT_RC_Master_Techniques.pdf', type: 'pdf', size: '2.5 MB', downloadUrl: '#' }
            ]
          },
          {
            id: 'lec-eng-1-2',
            title: '02. Passage Mapping for Literary, Editorial & Social Issue-Based Passages',
            duration: '42:15',
            durationSeconds: 2535,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            preview: true,
            summary: 'Speed-reading methods that preserve comprehension and outline argument progression in paragraph margins.'
          }
        ]
      },
      {
        id: 'sec-eng-2',
        title: 'Unit II & V: Vocabulary, Roots & Figures of Speech (Sessions 6–9, 20–25)',
        duration: '11 hours 20 mins',
        lectures: [
          {
            id: 'lec-eng-2-1',
            title: '03. Etymology & Root Words: Unlocking 500+ High-Frequency Exam Words',
            duration: '48:00',
            durationSeconds: 2880,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            preview: false,
            summary: 'Latin and Greek roots from Norman Lewis Word Power Made Easy with contextual sentence application.'
          },
          {
            id: 'lec-eng-2-2',
            title: '04. Figures of Speech: Metaphor, Irony, Litotes, Metonymy & Synecdoche in Passages',
            duration: '44:45',
            durationSeconds: 2685,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            preview: false,
            summary: 'Recognizing subtle rhetorical devices and figurative language examined in recent CLAT editions.'
          }
        ]
      },
      {
        id: 'sec-eng-3',
        title: 'Unit IV, VI & VIII: Sentence Structure, Error Spotting & Legal Texts (Sessions 14–19, 26–38)',
        duration: '14 hours 40 mins',
        lectures: [
          {
            id: 'lec-eng-3-1',
            title: '05. High-Yield Error Spotting: Subject-Verb Agreement, Dangling Modifiers & Parallelism',
            duration: '50:20',
            durationSeconds: 3020,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
            preview: true,
            summary: 'Mastering the 15 most frequent grammatical traps found in sentence correction and cloze tests.'
          },
          {
            id: 'lec-eng-3-2',
            title: '06. Legal Vocabulary & Contemporary Policy Editorial Comprehension',
            duration: '47:10',
            durationSeconds: 2830,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            preview: false,
            summary: 'Analyzing human rights, constitutional jurisprudence, and public policy articles with precision.'
          }
        ]
      }
    ]
  },

  // Course 5: PCS J Comprehensive Foundation & Procedural Law (MSI/PCSJ/01)
  {
    id: 'crs-udemy-pcsj',
    slug: 'pcs-j-comprehensive-masterclass',
    title: 'PCS J Comprehensive Foundation: Civil Judge & Judicial Magistrate Exam Masterclass (MSI/PCSJ/01)',
    headline: 'Master Constitutional Law, Procedural Laws (CPC, CrPC, BNSS 2023, Evidence) & High Court Judgment Drafting',
    description: 'Designed exclusively by senior judicial scholars and retired judges, this comprehensive flagship curriculum prepares law aspirants for Punjab, Haryana, Himachal Pradesh, and Delhi Judicial Services. Includes rigorous case law breakdowns, high court judgment drafting, and speed drills.',
    category: 'Judiciary',
    department: 'law',
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 2840,
    totalDuration: '140 total hours',
    totalLectures: 38,
    level: 'All Levels',
    thumbnail: '/images/courses/pcsj.jpg',
    price: 3499,
    originalPrice: 9999,
    isFreeForMsiStudents: true,
    instructorId: 'fac-law-vikram',
    instructorName: 'Dr. Vikramaditya Sharma',
    instructorTitle: 'Senior Professor of Procedural Law & Judicial Studies',
    instructorAvatar: '/images/faculty/faculty-1.webp',
    updatedDate: 'Academic Session 2026–27',
    language: 'English & Hindi (Bilingual)',
    isPublished: true,
    whatYouWillLearn: [
      'Comprehensive command over CrPC 1973, BNSS 2023, CPC 1908, and Indian Evidence Act frameworks',
      'Civil Court and Criminal Magistrate Judgment writing techniques with real case files and issues framing',
      'Landmark Supreme Court and High Court verdicts with ratio decidendi analysis',
      'Techniques to conquer Prelims negative marking and structural Mains answers',
      'Bare Act section mapping and cross-referencing tricks for lightning recall',
      'Viva-voce / Personality interview simulation strategies for Judicial Boards'
    ],
    requirements: [
      'Pursuing or completed LL.B (3-year or 5-year degree) from any recognized university',
      'Basic understanding of Indian legal structure and bare act reading habits'
    ],
    sections: [
      {
        id: 'sec-pcsj-1',
        title: 'Module 1: Constitutional Foundations & Judicial Review',
        duration: '11 hours 20 mins',
        lectures: [
          {
            id: 'lec-pcsj-1-1',
            title: '01. Preamble Jurisprudence & Basic Structure Doctrine Masterclass',
            duration: '42:15',
            durationSeconds: 2535,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            preview: true,
            summary: 'Evolution of Basic Structure doctrine from Shankari Prasad, Golaknath to Kesavananda Bharati and Minerva Mills.',
            resources: [
              { title: 'Constitutional_Basic_Structure_Digest.pdf', type: 'pdf', size: '2.4 MB', downloadUrl: '#' },
              { title: 'Kesavananda_Bharati_Ratio_Analysis.pdf', type: 'notes', size: '1.1 MB', downloadUrl: '#' }
            ]
          },
          {
            id: 'lec-pcsj-1-2',
            title: '02. Article 21 Evolution: Right to Privacy, Dignity & Speedy Trial',
            duration: '38:40',
            durationSeconds: 2320,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            preview: true,
            summary: 'In-depth review of Maneka Gandhi v. UOI, Puttaswamy judgment and expanding frontiers of personal liberty.',
            resources: [
              { title: 'Article_21_Landmark_Compendium.pdf', type: 'pdf', size: '3.1 MB', downloadUrl: '#' }
            ]
          }
        ]
      },
      {
        id: 'sec-pcsj-2',
        title: 'Module 2: Code of Civil Procedure (CPC 1908) Essentials',
        duration: '14 hours 45 mins',
        lectures: [
          {
            id: 'lec-pcsj-2-1',
            title: '03. Res Judicata & Constructive Res Judicata (Section 11 Analysis)',
            duration: '46:18',
            durationSeconds: 2778,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            preview: true,
            summary: 'Explanations I through VIII of Section 11 dissected with real trial court illustrations and mock problems.'
          },
          {
            id: 'lec-pcsj-2-2',
            title: '04. Order VII Rule 11: Rejection of Plaint Grounds & Procedure',
            duration: '33:25',
            durationSeconds: 2005,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            preview: false,
            summary: 'Procedural application of Order 7 Rule 11, barred by law, cause of action test, and limitation aspects.'
          }
        ]
      },
      {
        id: 'sec-pcsj-3',
        title: 'Module 3: Criminal Procedure & High Court Judgment Writing',
        duration: '12 hours 10 mins',
        lectures: [
          {
            id: 'lec-pcsj-3-1',
            title: '05. Framing of Issues in Civil Suits: Order XIV Practice Workshop',
            duration: '52:00',
            durationSeconds: 3120,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            preview: true,
            summary: 'Issues of law vs issues of fact. Hands-on drafting exercise with Punjab & Haryana High Court model answers.'
          },
          {
            id: 'lec-pcsj-3-2',
            title: '06. BNSS 2023 vs CrPC 1973: Charge Framing & Magistrate Cognizance Protocol',
            duration: '48:30',
            durationSeconds: 2910,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
            preview: false,
            summary: 'Step-by-step charge drafting and comparative procedural transitions under the new criminal laws.'
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
  // 4. Ms. Shikha Singh (English for CLAT)
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
    studentsCount: 1290
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
    studentId: 'msi-stu-001', // Aarav Sharma
    courseId: 'crs-msi-gkca',
    enrolledAt: '15 July 2025',
    progressPercentage: 68,
    completedLectureIds: ['lec-gk-1-1', 'lec-gk-1-2', 'lec-gk-2-1'],
    assignedBy: 'self',
    certificateIssued: false,
    lastActiveLectureId: 'lec-gk-1-2'
  },
  {
    studentId: 'msi-stu-001', // Aarav Sharma
    courseId: 'crs-msi-lr',
    enrolledAt: '20 July 2025',
    progressPercentage: 74,
    completedLectureIds: ['lec-lr-1-1', 'lec-lr-1-2', 'lec-lr-2-1'],
    assignedBy: 'teacher',
    assignedByName: 'Ms. Riya Hooda (Logical Reasoning)',
    assignedNote: 'Critical Reasoning & Puzzle mastery sequence.',
    certificateIssued: false,
    lastActiveLectureId: 'lec-lr-1-2'
  },
  {
    studentId: 'msi-stu-001', // Aarav Sharma
    courseId: 'crs-msi-engclat',
    enrolledAt: '25 July 2025',
    progressPercentage: 60,
    completedLectureIds: ['lec-eng-1-1', 'lec-eng-2-1'],
    assignedBy: 'teacher',
    assignedByName: 'Ms. Shikha Singh (English Faculty)',
    assignedNote: 'RC and Legal Vocabulary journal tracking.',
    certificateIssued: false,
    lastActiveLectureId: 'lec-eng-1-1'
  },
  {
    studentId: 'msi-stu-001', // Aarav Sharma
    courseId: 'crs-udemy-pcsj',
    enrolledAt: '10 August 2025',
    progressPercentage: 45,
    completedLectureIds: ['lec-pcsj-1-1'],
    assignedBy: 'self',
    certificateIssued: false,
    lastActiveLectureId: 'lec-pcsj-1-1'
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
export const LMS_SYNC_EVENT = 'msi_lms_store_updated';

// Trigger event when store changes
export function notifyLmsStoreChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LMS_SYNC_EVENT));
  }
}

// ----------------------------------------------------------------------------
// Store Accessor Functions
// ----------------------------------------------------------------------------

// Courses
export function getStoredCourses(): UdemyCourse[] {
  if (typeof window === 'undefined') return INITIAL_UDEMY_COURSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(INITIAL_UDEMY_COURSES));
      return INITIAL_UDEMY_COURSES;
    }
    const courses: UdemyCourse[] = JSON.parse(raw);
    let changed = false;
    const updated = courses.map((course) => {
      const seed = INITIAL_UDEMY_COURSES.find((s) => s.id === course.id);
      if (seed && (!course.thumbnail || course.thumbnail.trim() === '')) {
        changed = true;
        return { ...course, thumbnail: seed.thumbnail };
      }
      return course;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return INITIAL_UDEMY_COURSES;
  }
}

export function saveStoredCourses(courses: UdemyCourse[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    notifyLmsStoreChange();
  } catch (err) {
    console.error(err);
  }
}

// Teachers
export function getStoredTeachers(): TeacherApprovalRecord[] {
  if (typeof window === 'undefined') return INITIAL_TEACHERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    const teachers: TeacherApprovalRecord[] = JSON.parse(raw);
    let changed = false;
    const updated = teachers.map((t) => {
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

export function saveStoredTeachers(teachers: TeacherApprovalRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
    notifyLmsStoreChange();
  } catch (err) {
    console.error(err);
  }
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

export function saveStoredEnrollments(enrollments: CourseEnrollment[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(enrollments));
    notifyLmsStoreChange();
  } catch (err) {
    console.error(err);
  }
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
  }

  return updatedTeachers;
}

/**
 * Student Self-Enrolls in a Course (from Courses page)
 */
export function enrollStudentAction(
  studentId: string,
  courseId: string,
  assignedBy: 'self' | 'super-admin' | 'teacher' = 'self',
  assignedByName?: string,
  assignedNote?: string
): CourseEnrollment {
  const enrollments = getStoredEnrollments();
  const existing = enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
  if (existing) {
    return existing;
  }

  const newEnrollment: CourseEnrollment = {
    studentId,
    courseId,
    enrolledAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    progressPercentage: 0,
    completedLectureIds: [],
    assignedBy,
    assignedByName,
    assignedNote,
    certificateIssued: false
  };

  const updated = [...enrollments, newEnrollment];
  saveStoredEnrollments(updated);
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
