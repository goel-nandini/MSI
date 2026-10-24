'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import EnquiryModal from '@/components/modals/EnquiryModal';
import UdemyCourseModal from '@/components/courses/UdemyCourseModal';
import StudentEnrollLoginModal from '@/components/courses/StudentEnrollLoginModal';
import RazorpayCheckoutModal from '@/components/payments/RazorpayCheckoutModal';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import TiltCard from '@/components/ui/TiltCard';
import {
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Download,
  Scale,
  Award,
  ClipboardList,
  FileText,
  UserCheck,
  CreditCard,
  Landmark,
  Send,
  Sparkles,
  Phone,
  Star,
  PlayCircle,
  Search,
  BookCheck,
  Package,
  Layers,
  HelpCircle,
  FileCheck,
  Compass,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  UdemyCourse,
  getStoredCourses,
  getStoredEnrollments,
  syncCoursesFromServer,
  enrollStudentAction,
  LMS_SYNC_EVENT,
} from '@/lib/lmsStore';

interface ClassroomCourse {
  id: string;
  name: string;
  category: 'entrance' | 'judiciary' | 'academics';
  department: 'law';
  school: string;
  level: string;
  duration: string;
  intake: string;
  eligibility: string;
  highlights: string[];
  careerRoles: string[];
}

const admissionSteps = [
  { icon: FileText, step: '01', title: 'Check Eligibility', desc: 'Review program-specific academic requirements for CLAT UG, Judiciary (PCS J), or Higher Judicial Services.' },
  { icon: ClipboardList, step: '02', title: 'Admissions Enquiry', desc: 'Connect with MSI academic counselors to select your batch (Regular, Weekend, or Crash).' },
  { icon: UserCheck, step: '03', title: 'Document Verification', desc: 'Submit marksheets, Bar Council enrollment (for ADJ/AIBE), or 10+2 roll details.' },
  { icon: Landmark, step: '04', title: 'Faculty Consultation', desc: 'Attend a personalized 1-on-1 strategy & study plan briefing with course faculty.' },
  { icon: CreditCard, step: '05', title: 'Enrolment & Welcome Kit', desc: 'Complete registration and receive your complete MSI Master Books & Aspirant Kit.' },
];

// Deliverables from Page 2 of Course Handout
const studentDeliverables = [
  { title: 'Classroom / Live Classes', desc: 'Interactive structured topic delivery with recorded backup', icon: GraduationCap },
  { title: 'MSI Master Books Series', desc: 'Curated 6-book authoritative series across all core subjects', icon: BookOpen },
  { title: 'Topic-Wise Notes', desc: 'Concise, exam-oriented study handouts and Bare Act concordances', icon: FileText },
  { title: 'Current Affairs Modules', desc: 'Weekly digests, PIB archive tracking & monthly compilations', icon: Sparkles },
  { title: 'Previous-Year Questions (PYQs)', desc: '10–15 years sectional and full paper solutions with key', icon: ClipboardList },
  { title: 'Sectional Tests', desc: 'Timed principle-fact, critical reasoning & GK sectional tests', icon: FileCheck },
  { title: 'Full-Length Mock Tests', desc: 'Exact exam pattern simulated tests with negative marking', icon: Award },
  { title: 'OMR Sheet Practice', desc: 'Real exam hall conditions with timed bubble filling sheets', icon: CheckCircle2 },
  { title: 'Dedicated Doubt Classes', desc: 'Subject-wise doubt resolution sessions with faculty', icon: HelpCircle },
  { title: 'Performance Analysis', desc: 'In-depth accuracy logs, time-per-question metrics & rank tracking', icon: Compass },
  { title: '1-on-1 Mentorship', desc: 'Continuous academic monitoring and individual strategy', icon: UserCheck },
  { title: 'Exam Strategy Sessions', desc: 'Time-management, option-elimination & score maximization sprints', icon: Layers },
];

export default function CoursesPage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('CLAT UG – 5 Year Integrated Law');
  const [selectedBatchCategory, setSelectedBatchCategory] = useState<'all' | 'entrance' | 'judiciary' | 'academics'>('all');

  // Udemy LMS State
  const [udemyCourses, setUdemyCourses] = useState<UdemyCourse[]>(() => getStoredCourses());
  const [selectedUdemyCategory, setSelectedUdemyCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUdemyModalCourse, setActiveUdemyModalCourse] = useState<UdemyCourse | null>(null);
  const [directCheckoutCourse, setDirectCheckoutCourse] = useState<UdemyCourse | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loginModalCourse, setLoginModalCourse] = useState<UdemyCourse | null>(null);

  // Horizontal Slider Refs
  const batchesSliderRef = useRef<HTMLDivElement>(null);
  const deliverablesSliderRef = useRef<HTMLDivElement>(null);
  const booksSliderRef = useRef<HTMLDivElement>(null);
  const udemySliderRef = useRef<HTMLDivElement>(null);

  const loadLmsData = async () => {
    try {
      const serverCourses = await syncCoursesFromServer();
      setUdemyCourses(serverCourses);
    } catch (_) {
      const courses = getStoredCourses();
      setUdemyCourses(courses);
    }

    const isUserLoggedIn =
      typeof window !== 'undefined' &&
      localStorage.getItem('msi_student_logged_in') === 'true';
    const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_phone') || '' : '';
    const cleanPhone = storedPhone.replace(/\D/g, '').slice(-10);

    // If student is NOT actively logged in, unlogged public visitors must NEVER see courses marked as Enrolled
    if (!isUserLoggedIn || !cleanPhone) {
      setEnrolledCourseIds([]);
      return;
    }

    const enrollments = getStoredEnrollments();
    const enrolled = enrollments
      .filter((e) => {
        return (
          e.studentPhone === cleanPhone ||
          e.studentId.includes(cleanPhone) ||
          e.studentId === `msi-stu-${cleanPhone.slice(-4)}`
        );
      })
      .map((e) => e.courseId);
    setEnrolledCourseIds(enrolled);
  };

  const handleOrderBookOrKit = (item: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    type: 'book' | 'kit';
    description?: string;
  }) => {
    const virtualCourse: UdemyCourse = {
      id: item.id,
      slug: item.id,
      title: item.title,
      headline: item.description || 'Official MSI Publications Study Material Kit',
      description: item.description || 'Curated by MSI senior legal faculty with doorstep dispatch and digital PDF access.',
      category: 'Judiciary',
      department: 'law',
      rating: 5.0,
      reviewCount: 48,
      totalDuration: 'Complete Hardcopy & Digital Edition',
      totalLectures: 6,
      level: 'All Levels',
      thumbnail: '/images/courses/clat.jpg',
      price: item.price,
      originalPrice: item.originalPrice || item.price + 1000,
      isFreeForMsiStudents: false,
      instructorId: 'fac-harshit-01',
      instructorName: 'MSI Academic Editorial Board',
      instructorTitle: 'Senior Jurists & Editorial Directorate',
      instructorAvatar: '/images/avatars/avatar-1.webp',
      whatYouWillLearn: [
        'Doorstep physical delivery within 3-5 business days across India',
        'Official 2026 Updated Edition with new criminal codes (BNS, BNSS, BSA)',
        'Free digital companion access and past year solved papers',
      ],
      requirements: ['Valid delivery address across India', 'Active mobile number for delivery tracking'],
      sections: [],
      updatedDate: 'Oct 2026',
      language: 'English & Bilingual Legal Notes',
      isPublished: true,
    };

    if (!isStudentLoggedIn()) {
      setLoginModalCourse(virtualCourse);
      return;
    }

    setDirectCheckoutCourse(virtualCourse);
  };

  useEffect(() => {
    loadLmsData();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('msi_sync_channel');
        bc.onmessage = (event) => {
          if (
            event.data?.type === 'COURSE_CREATED' ||
            event.data?.type === 'COURSE_PUBLISHED' ||
            event.data?.type === 'COURSE_DELETED' ||
            event.data?.type === 'COURSE_ASSIGNED' ||
            event.data?.type === 'FACULTY_DELETED' ||
            event.data?.type === 'STUDENT_ENROLLED'
          ) {
            loadLmsData();
          }
        };
      }
    } catch (_) {}

    const handleSync = () => {
      loadLmsData();
    };

    window.addEventListener(LMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('msi_courses_sync', handleSync);
    window.addEventListener('msi_kits_sync', handleSync);

    const interval = setInterval(() => {
      loadLmsData();
    }, 3500);

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
      window.removeEventListener(LMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('msi_courses_sync', handleSync);
      window.removeEventListener('msi_kits_sync', handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollStep = ref.current.clientWidth * 0.82;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollStep : scrollStep,
        behavior: 'smooth',
      });
    }
  };

  const isStudentLoggedIn = () => {
    if (typeof window === 'undefined') return false;
    const loggedIn = localStorage.getItem('msi_student_logged_in') === 'true';
    const phone = localStorage.getItem('msi_active_student_phone');
    return loggedIn && !!phone;
  };

  const isCourseEnrolled = (courseId: string) => {
    if (!isStudentLoggedIn()) return false;
    const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_phone') || '' : '';
    const cleanPhone = storedPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) return false;
    const enrollments = getStoredEnrollments();
    return enrollments.some((e) => {
      if (e.courseId !== courseId) return false;
      return (
        e.studentPhone === cleanPhone ||
        e.studentId.includes(cleanPhone) ||
        e.studentId === `msi-stu-${cleanPhone.slice(-4)}`
      );
    });
  };

  const handleInstantEnroll = (course: UdemyCourse, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveUdemyModalCourse(course);
  };

  const handleLoginEnrollSuccess = (course: UdemyCourse, student: { name: string; phone: string }) => {
    setLoginModalCourse(null);
    loadLmsData();
    setDirectCheckoutCourse(course);
  };

  // Filter Udemy courses
  const filteredUdemyCourses = udemyCourses.filter((course) => {
    if (selectedUdemyCategory !== 'all' && course.category !== selectedUdemyCategory) {
      return false;
    }
    if (
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.headline.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const categories = [
    { id: 'all', label: 'All Handbooks & Courses' },
    { id: 'Law Entrance', label: 'CLAT & AILET Handbooks' },
    { id: 'Judiciary', label: 'Judiciary & PCS J' },
  ];

  // Complete 9 Courses directly from the official Product & Course Catalogue PDF
  const classroomCourses: ClassroomCourse[] = [
    {
      id: 'clat-ug',
      name: '1. CLAT UG – 5 Year Law',
      category: 'entrance',
      department: 'law',
      school: 'Law Entrance Division',
      level: '5-Year Integrated Law Entrance',
      duration: '6M / 1Y / 2Y / 3Y / Long-Term',
      intake: 'Class 10, 11, 12 & 12th-Pass',
      eligibility: 'Class 10, 11, 12 and 12th-pass students from any stream',
      highlights: [
        'Covers English, Current Affairs & GK, Legal Reasoning, Logical Reasoning, and Quantitative Techniques',
        'Rigorous passage-based reading comprehension, critical reasoning, and constitutional legal concepts',
        'Includes all 12 student deliverables: MSI Master Books, OMR practice sheets, doubt sessions & full mocks',
      ],
      careerRoles: ['24 National Law Universities (NLUs)', 'B.A. LL.B. (Hons)', 'B.B.A. LL.B.', 'Corporate Counsel'],
    },
    {
      id: 'clat-crash',
      name: '2. CLAT Crash Course',
      category: 'entrance',
      department: 'law',
      school: 'Fast-Track Entrance Wing',
      level: 'High-Impact Rapid Revision',
      duration: '1 – 3 Months Intensive',
      intake: 'Exam-Year Aspirants',
      eligibility: 'Class 12 & 12th-pass candidates appearing in upcoming CLAT',
      highlights: [
        'Complete syllabus revision with high-frequency topics, Legal GK, and quantitative shortcuts',
        'Intensive mock-test series, daily/weekly practice sheets, and time-management training',
        'Passage-first vs question-first exam strategy and previous-year paper breakdowns',
      ],
      careerRoles: ['CLAT Top Ranker', 'NLU Seat Allocation', 'Top Tier Law School Candidate'],
    },
    {
      id: 'ailet',
      name: '3. AILET Preparation',
      category: 'entrance',
      department: 'law',
      school: 'NLU Delhi Specialization Cell',
      level: 'National Entrance Preparation',
      duration: '6 Months / 1 Year Regular',
      intake: 'Selective Cohort',
      eligibility: '10+2 with minimum 45% marks (40% for reserved categories)',
      highlights: [
        'Targeted subject training: English Language, Current Affairs & GK, and Logical Reasoning',
        'AILET-specific classes, legal awareness drills, revision notes, and full-length simulated mocks',
        'Advanced pattern recognition, syllogism Venn methods, and puzzle speed optimization',
      ],
      careerRoles: ['National Law University Delhi', 'B.A. LL.B. (Hons)', 'Supreme Court Litigator'],
    },
    {
      id: 'pu-law',
      name: '4. PU Law Entrance',
      category: 'entrance',
      department: 'law',
      school: 'Panjab University Law Wing',
      level: '3-Year & 5-Year Law Entrance',
      duration: '3 Months / Crash Course',
      intake: 'University Law Aspirants',
      eligibility: 'Graduates for 3-Year LL.B. | 10+2 for 5-Year B.A./B.Com LL.B.',
      highlights: [
        'Curriculum: Legal Aptitude, Constitution of India, General Knowledge, Current Affairs, English & Mental Ability',
        'Includes PU Law Master Notes, previous 10-year papers with answers, and practice question sets',
        'Current Affairs monthly capsules and dedicated Legal GK booklets',
      ],
      careerRoles: ['Panjab University (UILS Chandigarh)', 'PU Regional Centres', 'PULAT Merit Scholar'],
    },
    {
      id: 'pcs-j',
      name: '5. PCS J / Judiciary',
      category: 'judiciary',
      department: 'law',
      school: 'Judicial Services Academy',
      level: 'State Judicial Services (Civil Judge)',
      duration: '1 Year / 2 Year Batches',
      intake: 'LL.B. Graduates & Final-Year Students',
      eligibility: 'LL.B. Degree (3-Year or 5-Year) from any Bar Council recognized university',
      highlights: [
        'Prelims: Constitution, CPC, CrPC / BNSS, IPC / BNS, Evidence, Contract, Torts, TPA, SRA, Family & Local Laws',
        'Mains: Bare Act deep-reading, case laws, legal answer writing, and High Court judgment writing',
        'Complete test series with individual answer-sheet correction and 1-on-1 personal mentorship',
      ],
      careerRoles: ['Civil Judge (Junior Division)', 'Judicial Magistrate First Class (JMFC)', 'Sub-Judge'],
    },
    {
      id: 'adj',
      name: '6. ADJ / Higher Judicial Services',
      category: 'judiciary',
      department: 'law',
      school: 'Higher Judicial Services Directorate',
      level: 'Direct District Judge Appointment',
      duration: '1 Year Regular & Weekend Batches',
      intake: 'Practising Advocates Cohort',
      eligibility: 'Law graduates and practising advocates with minimum 7 years active Bar standing',
      highlights: [
        'Advanced Modules: Civil Law, Criminal Law, Procedural Laws, Evidence, and State-Specific Enactments',
        'Recent Supreme Court landmark judgments, Mains answer writing & civil/criminal judgment drafting',
        'Interview preparation and mock interview panels with retired High Court judges and senior advocates',
      ],
      careerRoles: ['Additional District & Sessions Judge (ADJ)', 'District Judge', 'Special CBI Judge'],
    },
    {
      id: 'aibe',
      name: '7. AIBE (All India Bar Examination)',
      category: 'academics',
      department: 'law',
      school: 'Bar Certification Wing',
      level: 'Bar Council of India Certification',
      duration: '2 Months Fast-Track / Weekend',
      intake: 'Enrolled Advocates',
      eligibility: 'Law graduates provisionally enrolled with any State Bar Council in India',
      highlights: [
        'Bare Acts navigation, high-yield statutory provisions, and previous-year question sets',
        'MCQ practice drills, subject-wise revision, landmark case laws, and full simulated mock tests',
        '100% clearing record through structured Bare Act indexing and rapid-recall strategies',
      ],
      careerRoles: ['Certificate of Practice (COP)', 'Advocate on Record', 'High Court Practising Advocate'],
    },
    {
      id: 'ugc-net',
      name: '8. UGC NET – LAW',
      category: 'academics',
      department: 'law',
      school: 'Higher Legal Education & Research',
      level: 'National Eligibility Test & JRF',
      duration: '6 Months Crash / 1 Year Regular',
      intake: 'LL.M. Candidates & Scholars',
      eligibility: 'LL.M. degree with minimum 55% marks (50% for SC/ST/OBC/PWD)',
      highlights: [
        'Paper I: Teaching Aptitude, Research Aptitude, Communication, Reasoning, DI, ICT & Higher Education',
        'Paper II Law: Jurisprudence, Constitutional, Administrative, Family, Contracts, Torts, Crimes, IPR, Cyber & Taxation',
        'Complete Paper I & II notes, PYQs, topic-wise MCQs, mock tests, and revision booklets',
      ],
      careerRoles: ['Assistant Professor of Law', 'UGC Junior Research Fellow (JRF)', 'Ph.D. Legal Scholar'],
    },
    {
      id: 'upsc-law',
      name: '9. UPSC / State PCS – LAW OPTIONAL',
      category: 'academics',
      department: 'law',
      school: 'Civil Services Law Optional Wing',
      level: 'Civil Services Mains Optional',
      duration: '1 Year Foundation Batch',
      intake: 'Civil Services Aspirants',
      eligibility: 'Graduates preparing for UPSC Civil Services / State PCS choosing Law as Optional',
      highlights: [
        'Constitutional Law, Administrative Law, International Law, Contracts, Torts, Crimes, and Commercial Law',
        'Contemporary legal developments, case laws compendiums, and systematic Mains answer-writing drills',
        '15 years previous-year question trend mapping and individual evaluation by judicial scholars',
      ],
      careerRoles: ['Indian Administrative Service (IAS)', 'Indian Police Service (IPS)', 'State PCS Officer'],
    },
  ];

  // Filter classroom courses
  const filteredClassroomCourses = classroomCourses.filter((course) => {
    if (selectedBatchCategory === 'all') return true;
    return course.category === selectedBatchCategory;
  });

  return (
    <div className="min-h-screen bg-[#FFF9EF] text-[#10233F] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      <Navbar onOpenEnquiry={() => setIsEnquiryOpen(true)} />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#10233F] text-white border-2 border-[#EFC988] shadow-2xl flex items-center space-x-3 animate-fadeIn">
          <Sparkles className="w-5 h-5 text-[#EFC988] flex-shrink-0" />
          <div>
            <span className="text-xs sm:text-sm font-semibold block">{toastMessage}</span>
            <Link
              href="/student/dashboard"
              className="text-xs text-[#EFC988] underline font-bold mt-1 inline-block"
            >
              Open in Student Learning Hub →
            </Link>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {/* Full-Bleed Page Hero */}
        <PageHero
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Complete Product & Course Catalogue' },
          ]}
          eyebrow="MSI Group of Institutes — Course & Publication Suite"
          title="Complete Course & Product Catalogue"
          subtitle="Explore our 9 flagship programs, official 180-session CLAT & Judiciary video courses, MSI Master Books Series, and specialized Aspirant Kits in a compact, interactive view."
          bgImage="/images/hero-2.webp"
          className="pt-24 sm:pt-28"
        >
          {/* Quick Jump Bar */}
          <div className="flex items-center flex-wrap gap-2">
            <a
              href="#udemy-catalog"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EFC988] text-[#10233F] hover:bg-[#ffe0a3] transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-[#89190E]" />
              <span>Online Handbook Masterclasses</span>
            </a>

            <a
              href="#classroom-batches"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Landmark className="w-4 h-4 text-[#EFC988]" />
              <span>9 Flagship Batches</span>
            </a>

            <a
              href="#what-students-receive"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#EFC988]" />
              <span>What Students Receive (12 Items)</span>
            </a>

            <a
              href="#master-books-kits"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#EFC988]" />
              <span>MSI Master Books & Kits</span>
            </a>
          </div>
        </PageHero>

        {/* ------------------------------------------------------------------
            1. HANDBOOK-ALIGNED ONLINE VIDEO COURSES (UDEMY LMS)
            ------------------------------------------------------------------ */}
        <section id="udemy-catalog" className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold tracking-wider text-[#89190E] uppercase mb-1">
                <Sparkles className="w-4 h-4 text-[#89190E]" />
                <span>Handbook Syllabus Masterclasses</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#10233F]">
                Handbook-Aligned Online Video Courses
              </h2>
              <p className="text-xs sm:text-sm text-[#526174] mt-1 max-w-2xl">
                Directly synchronized with the official MSI Course Handouts by Dr. Ekta Gahlawat, Mr. Anurag Dwivedi, Ms. Riya Hooda, Ms. Shikha Singh, and Dr. Vikramaditya Sharma.
              </p>
            </div>

            <div className="flex items-center space-x-2 self-start md:self-end">
              <Link
                href="/student/dashboard"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#10233F] hover:bg-[#1a345c] text-white text-xs font-bold transition-all shadow-sm cursor-pointer mr-2"
              >
                <UserCheck className="w-4 h-4 text-[#EFC988]" />
                <span className="hidden sm:inline">My Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => scrollSlider(udemySliderRef, 'left')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[#10233F] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="Previous Online Courses"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollSlider(udemySliderRef, 'right')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[#10233F] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="Next Online Courses"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-4 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedUdemyCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedUdemyCategory === cat.id
                      ? 'bg-[#89190E] text-white shadow-sm'
                      : 'bg-[#FFF9EF] text-[#526174] hover:text-[#10233F] border border-[#E8DCCB]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search judicial topics, CPC, BNSS, CLAT..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
              />
            </div>
          </div>

          {/* Horizontal Sliding Row (1 Layer, 3-4 visible at once) */}
          <div
            ref={udemySliderRef}
            className="flex items-stretch gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredUdemyCourses.map((course) => (
              <div
                key={course.id}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0 snap-start"
              >
                <div
                  onClick={() => setActiveUdemyModalCourse(course)}
                  className="bg-white rounded-3xl border border-[#E8DCCB] overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer h-full"
                >
                  <div>
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                      <Image
                        src={course.thumbnail || '/images/courses/clat.jpg'}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target && !target.src.includes('clat.jpg')) {
                            target.srcset = '';
                            target.src = '/images/courses/clat.jpg';
                          }
                        }}
                      />
                      
                      {course.badge && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#EFC988] text-[#10233F] px-2.5 py-0.5 rounded-md shadow-xs">
                          {course.badge}
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/90 text-[#89190E] flex items-center justify-center shadow-lg">
                          <PlayCircle className="w-7 h-7 fill-[#89190E] text-white" />
                        </div>
                      </div>

                      <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold text-white bg-black/75 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {course.totalDuration}
                      </span>
                    </div>

                    {/* Course Card Body */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-[#526174]">
                        <span className="font-mono text-[#89190E] font-bold uppercase">
                          {course.category}
                        </span>
                        <span>{course.level}</span>
                      </div>

                      <h3 className="font-serif text-base font-bold text-[#10233F] line-clamp-2 group-hover:text-[#89190E] transition-colors leading-snug">
                        {course.title}
                      </h3>

                      <p className="text-xs text-[#526174] line-clamp-2 leading-relaxed">
                        {course.headline}
                      </p>

                      <div className="flex items-center space-x-2 pt-1 text-xs text-[#10233F]">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#E8DCCB] flex-shrink-0">
                          <Image
                            src={course.instructorAvatar}
                            alt={course.instructorName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium truncate">{course.instructorName}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs pt-1">
                        <div className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[#526174]">({course.reviewCount.toLocaleString()})</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[#526174]">{course.totalLectures} lectures</span>
                      </div>

                      <div className="flex items-baseline space-x-2 pt-1">
                        <span className="text-base font-bold text-[#10233F]">
                          ₹{course.price.toLocaleString()}
                        </span>
                        <span className="text-xs line-through text-[#526174]">
                          ₹{course.originalPrice.toLocaleString()}
                        </span>
                        {course.isFreeForMsiStudents && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Free for MSI Students
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-5 pt-0 border-t border-[#E8DCCB]/60 mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveUdemyModalCourse(course);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#FFF9EF] hover:bg-[#FFF3DD] text-[#10233F] border border-[#E8DCCB] text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      Curriculum
                    </button>

                    {isCourseEnrolled(course.id) ? (
                      <Link
                        href="/student/dashboard"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enrolled</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isStudentLoggedIn()) {
                            setLoginModalCourse(course);
                            return;
                          }
                          setDirectCheckoutCourse(course);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer active:scale-98"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Next/Prev Pagination Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCB]/60">
            <span className="text-xs text-[#526174]">
              {filteredUdemyCourses.length} video masterclasses in 1 horizontal sliding track
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => scrollSlider(udemySliderRef, 'left')}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-xs font-bold text-[#10233F] transition-all flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => scrollSlider(udemySliderRef, 'right')}
                className="px-3.5 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
              >
                <span>Next Masterclasses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </section>

        {/* ------------------------------------------------------------------
            2. OFFLINE & CLASSROOM 9 FLAGSHIP BATCHES (Horizontal Slider)
            ------------------------------------------------------------------ */}
        <section id="classroom-batches" className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12 border-t border-[#E8DCCB]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <SectionHeading
                eyebrow="Flagship Academic Programs"
                title="Complete Course Catalogue (9 Programs)"
                subtitle="Meticulously designed for CLAT UG, AILET, PU Law, PCS J, ADJ, AIBE, UGC NET, and UPSC Law Optional aspirants."
                align="left"
              />
            </div>

            {/* Carousel Navigation Buttons */}
            <div className="flex items-center space-x-2 self-start md:self-end">
              <span className="text-xs font-mono font-bold text-[#526174] mr-2">
                Slide to browse
              </span>
              <button
                type="button"
                onClick={() => scrollSlider(batchesSliderRef, 'left')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[#10233F] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="Previous Courses"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollSlider(batchesSliderRef, 'right')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[#10233F] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="Next Courses"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Batch Category Switcher */}
          <div className="flex items-center flex-wrap gap-2 mb-6">
            {[
              { id: 'all', label: 'All 9 Programs' },
              { id: 'entrance', label: 'Law Entrance (CLAT, AILET, PU Law)' },
              { id: 'judiciary', label: 'Judicial Services (PCS J, ADJ)' },
              { id: 'academics', label: 'Licensing & Optional (AIBE, UGC NET, UPSC)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedBatchCategory(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedBatchCategory === tab.id
                    ? 'bg-[#89190E] text-white shadow-sm'
                    : 'bg-white text-[#526174] hover:text-[#10233F] border border-[#E8DCCB]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Horizontal Sliding Row (1 Layer, 3-4 visible at once) */}
          <div
            ref={batchesSliderRef}
            className="flex items-stretch gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 pt-2 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredClassroomCourses.map((course) => (
              <div
                key={course.id}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0 snap-start"
              >
                <TiltCard className="rounded-3xl h-full" intensity={4} glare shine>
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DCCB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
                    <div>
                      {/* Top Chips */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#89190E] bg-[#FFF3DD] border border-[#F7E5BF] px-2.5 py-0.5 rounded-full">
                          {course.level}
                        </span>
                        <span className="text-[11px] font-semibold text-[#526174] flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-[#89190E]" />
                          {course.duration}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#10233F] mb-1.5 leading-snug">
                        {course.name}
                      </h3>
                      <span className="text-[11px] text-[#526174] block mb-3">
                        {course.school} • <strong className="text-[#10233F]">{course.intake}</strong>
                      </span>

                      {/* Eligibility Box */}
                      <div className="bg-[#FFF9EF] p-2.5 rounded-xl border border-[#E8DCCB] text-[11px] text-[#10233F] mb-4">
                        <span className="font-bold text-[#89190E] block text-[10px] uppercase">Eligibility:</span>
                        {course.eligibility}
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1.5 mb-5">
                        <span className="text-[10px] font-bold uppercase text-[#10233F] tracking-wider block">
                          Highlights:
                        </span>
                        {course.highlights.map((highlight, hIdx) => (
                          <div key={hIdx} className="flex items-start space-x-2 text-xs text-[#526174] leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#89190E] flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-[#E8DCCB] flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourse(course.name);
                          setIsEnquiryOpen(true);
                        }}
                        className="flex-1 h-10 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer active:scale-98"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enquire Batch</span>
                      </button>

                      <a
                        href={`https://wa.me/919634299858?text=${encodeURIComponent(
                          `Hello MSI Admissions Team, I want to enquire about ${course.name} batch details.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 px-3 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:bg-[#05463e] text-white font-bold text-xs flex items-center justify-center transition-all shadow-sm cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}

            {/* Final Slide: Have Doubts / Enquiry Card */}
            <div className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0 snap-start">
              <TiltCard className="rounded-3xl h-full" intensity={4} glare shine>
                <div className="bg-gradient-to-br from-[#10233F] via-[#162D4F] to-[#89190E] text-white rounded-3xl p-6 sm:p-7 border border-[#EFC988]/30 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#EFC988]/10 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#EFC988] bg-white/10 border border-[#EFC988]/30 px-3 py-1 rounded-full flex items-center space-x-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#EFC988]" />
                        <span>Academic Guidance</span>
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                        Advisors Online
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                      Have Doubts or Questions?
                    </h3>
                    <p className="text-xs text-white/80 leading-relaxed mb-4">
                      Not sure which legal batch matches your target exam? Speak with our senior faculty and admission counselors for direct 1-on-1 guidance.
                    </p>

                    <div className="space-y-2 mb-6 bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-white/90">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#EFC988] flex-shrink-0" />
                        <span>Syllabus & Eligibility Clarification</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#EFC988] flex-shrink-0" />
                        <span>Weekend vs. Regular Batch Selection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#EFC988] flex-shrink-0" />
                        <span>Fee Concessions & Demo Lecture Access</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/15 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse('General Course Enquiry & Academic Counseling');
                        setIsEnquiryOpen(true);
                      }}
                      className="w-full h-11 rounded-xl bg-[#EFC988] hover:bg-[#ffe3ab] text-[#10233F] font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer active:scale-98"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Batch Enquiry</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="tel:+917986313013"
                        className="h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                        title="Call Admissions Desk"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#EFC988]" />
                        <span>Call Desk</span>
                      </a>
                      <a
                        href="https://wa.me/919634299858?text=Hello%20MSI%20Admissions%20Team%2C%20I%20have%20doubts%20regarding%20course%20selection%20and%20enquiry."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:bg-[#05463e] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>

          {/* Bottom Next/Prev Pagination Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCB]/60">
            <span className="text-xs text-[#526174] font-medium">
              Showing {filteredClassroomCourses.length} programs in 1 horizontal continuous track
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => scrollSlider(batchesSliderRef, 'left')}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-xs font-bold text-[#10233F] transition-all flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => scrollSlider(batchesSliderRef, 'right')}
                className="px-3.5 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
              >
                <span>Next Programs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Enquiry & Doubt Resolution Banner */}
          <div className="mt-8 rounded-3xl bg-[#FFF9EF] border-2 border-[#E8DCCB] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-start sm:items-center space-x-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#89190E] text-[#EFC988] flex items-center justify-center flex-shrink-0 shadow-md">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#89190E]">
                    Have Any Doubts or Questions?
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Free Consultation
                  </span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#10233F] mt-1">
                  Confused about which program is right for you?
                </h4>
                <p className="text-xs sm:text-sm text-[#526174] mt-1 max-w-2xl leading-relaxed">
                  Speak directly with our senior law faculty and admissions team for personal guidance on batches, syllabus roadmap, fee structure, and demo classes.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto z-10">
              <button
                type="button"
                onClick={() => {
                  setSelectedCourse('General Course Enquiry & Academic Counseling');
                  setIsEnquiryOpen(true);
                }}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#89190E] hover:bg-[#6e140b] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#89190E]/20 hover:shadow-lg cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Enquire Now</span>
              </button>

              <a
                href="https://wa.me/919634299858?text=Hello%20MSI%20Admissions%20Team%2C%20I%20have%20doubts%20regarding%20course%20selection%20and%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-3.5 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:bg-[#05463e] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href="tel:+917986313013"
                className="flex-1 sm:flex-none px-4 py-3.5 rounded-xl bg-white hover:bg-[#FFF3DD] border border-[#E8DCCB] text-[#10233F] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#89190E]" />
                <span>+91 79863 13013</span>
              </a>
            </div>
          </div>

        </section>

        {/* ------------------------------------------------------------------
            2. WHAT STUDENTS RECEIVE (Max 2 Layers Horizontal Matrix)
            ------------------------------------------------------------------ */}
        <section id="what-students-receive" className="bg-white py-14 border-t border-b border-[#E8DCCB]">
          <div className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <SectionHeading
                  eyebrow="Complete Student Provision"
                  title="What MSI Students Receive (12 Deliverables)"
                  subtitle="Every enrolled aspirant receives our complete, integrated academic package in two compact horizontal layers."
                  align="left"
                />
              </div>

              {/* Slider Controls */}
              <div className="flex items-center space-x-2 self-start md:self-end">
                <button
                  type="button"
                  onClick={() => scrollSlider(deliverablesSliderRef, 'left')}
                  className="w-10 h-10 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[#10233F] flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous Deliverables"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider(deliverablesSliderRef, 'right')}
                  className="w-10 h-10 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[#10233F] flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next Deliverables"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Exactly 2 Rows/Layers Horizontal Scrolling Grid */}
            <div
              ref={deliverablesSliderRef}
              className="grid grid-rows-2 grid-flow-col auto-cols-[minmax(280px,340px)] gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {studentDeliverables.map((item, dIdx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={dIdx}
                    className="p-5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] hover:border-[#89190E] hover:shadow-md transition-all duration-300 group flex items-start space-x-3.5 snap-start h-full"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#FFF3DD] text-[#89190E] flex items-center justify-center group-hover:bg-[#89190E] group-hover:text-white transition-all flex-shrink-0 group-hover:scale-105">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors leading-tight mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#526174] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Next/Prev Pagination Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E8DCCB]/60">
              <span className="text-xs text-[#526174]">
                12 essential deliverables organized in 2 compact horizontal layers
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => scrollSlider(deliverablesSliderRef, 'left')}
                  className="px-3 py-1 rounded-xl bg-[#FFF9EF] hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-xs font-bold text-[#10233F] transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider(deliverablesSliderRef, 'right')}
                  className="px-3 py-1 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------
            3. MSI MASTER BOOK SERIES & ASPIRANT KITS (Horizontal Slider)
            ------------------------------------------------------------------ */}
        <section id="master-books-kits" className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 py-14">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <SectionHeading
                eyebrow="MSI Publications & Kits"
                title="Master Book Series & Aspirant Kits"
                subtitle="Authoritative textbooks, compendiums, and merchandise kits curated by MSI's senior legal faculty."
                align="left"
              />
            </div>

            {/* Slider Controls */}
            <div className="flex items-center space-x-2 self-start md:self-end">
              <button
                type="button"
                onClick={() => scrollSlider(booksSliderRef, 'left')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[#10233F] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="Previous Books"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollSlider(booksSliderRef, 'right')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-[#10233F] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                aria-label="Next Books"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 6-Book Master Series Showcase (1 Horizontal Layer) */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <span className="text-xs font-mono font-bold tracking-wider text-[#89190E] uppercase">
                MSI Master Book Series (6 Core Books)
              </span>
              <button
                type="button"
                onClick={() => {
                  handleOrderBookOrKit({
                    id: 'kit-6book-combo',
                    title: 'MSI Master Books 6-Book Complete Series Combo',
                    price: 4999,
                    originalPrice: 5999,
                    type: 'kit',
                    description: 'Complete 6-Volume Set with OMR Practice Sheets & Sectional Diagnostic Tests',
                  });
                }}
                className="p-2 px-3 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Package className="w-4 h-4 text-[#EFC988]" />
                <span>6-Book Combo: <strong className="text-[#EFC988]">₹4,999</strong> <span className="line-through text-white/70 font-normal text-[11px]">(MRP: ₹5,999)</span></span>
              </button>
            </div>

            <div
              ref={booksSliderRef}
              className="flex items-stretch gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-5 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { id: 'book-1', book: 'BOOK 1 — GK & CA', title: 'MSI Master Book – General Knowledge & Current Affairs', mrp: '₹999', contents: 'National/International Affairs, Government Schemes, Science & Tech, Economy, Defence, Reports & Indices, Legal Current Affairs & Constitutional developments.' },
                { id: 'book-2', book: 'BOOK 2 — MATHEMATICS', title: 'MSI Master Book – Quantitative Aptitude & Mathematics', mrp: '₹999', contents: 'Number System, Percentage, Ratio, Average, Profit & Loss, SI & CI, Time & Work, Time-Speed-Distance, Data Interpretation, Geometry, Mensuration & Shortcuts.' },
                { id: 'book-3', book: 'BOOK 3 — LEGAL STUDIES', title: 'MSI Master Book – Legal Reasoning & Legal Studies', mrp: '₹999', contents: 'Constitution, Fundamental Rights, DPSP, Parliament, Judiciary, Contract, Torts, Criminal Law, Legal Maxims, Landmark Judgments & Passage-based questions.' },
                { id: 'book-4', book: 'BOOK 4 — QUANTS', title: 'MSI Master Book – Quantitative Techniques', mrp: '₹999', contents: 'Arithmetic, Advanced Data Interpretation, Tables, Charts, Graphs, Percentage, Ratio, Average, Profit & Loss, Speed-Time-Distance & Advanced CLAT Practice.' },
                { id: 'book-5', book: 'BOOK 5 — REASONING', title: 'MSI Master Book – Logical & Critical Reasoning', mrp: '₹999', contents: 'Arguments, Assumptions, Conclusions, Inference, Strengthen/Weaken, Cause & Effect, Syllogisms, Blood Relations, Series, Puzzles & Passage-based reasoning.' },
                { id: 'book-6', book: 'BOOK 6 — ENGLISH', title: 'MSI Master Book – English Language & Comprehension', mrp: '₹999', contents: 'Reading Comprehension, Vocabulary, Synonyms, Antonyms, Idioms, Grammar, Sentence correction, Para jumbles, Tone, Inference, Main idea & Author viewpoint.' },
              ].map((b) => (
                <div
                  key={b.id}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0 snap-start bg-white rounded-3xl p-6 border border-[#E8DCCB] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#89190E] mb-2">
                      <span>{b.book}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF3DD] text-[#89190E]">MRP: {b.mrp}</span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#10233F] mb-2 leading-snug">
                      {b.title}
                    </h4>
                    <p className="text-xs text-[#526174] leading-relaxed mb-4">
                      {b.contents}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleOrderBookOrKit({
                        id: b.id,
                        title: b.title,
                        price: 999,
                        originalPrice: 1499,
                        type: 'book',
                        description: b.contents,
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all text-center cursor-pointer shadow-xs"
                  >
                    Order Book (₹999)
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom Next/Prev Pagination Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCB]/60">
              <span className="text-xs text-[#526174]">
                6 core Master Books in 1 horizontal sliding track
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => scrollSlider(booksSliderRef, 'left')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#89190E] hover:text-white border border-[#E8DCCB] text-xs font-bold text-[#10233F] transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider(booksSliderRef, 'right')}
                  className="px-3 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
                >
                  <span>Next Books</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Premium Aspirant Kits (Single Row of 3 Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            
            {/* Kit 1: CLAT Aspirant Kit */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#E8DCCB] hover:border-[#89190E] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#89190E] bg-[#FFF3DD] px-3 py-1 rounded-full">
                  All-in-One Law Kit
                </span>
                <h3 className="font-serif text-xl font-bold text-[#10233F] mt-3 mb-1">
                  MSI CLAT Aspirant Kit
                </h3>
                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="font-serif text-2xl font-bold text-[#89190E]">₹2,999</span>
                  <span className="text-xs text-[#526174] line-through">₹4,000+ Value</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#526174] mb-5">
                  {[
                    'All 6 MSI Master Books Series',
                    'Monthly Current Affairs Magazine',
                    'Full-Length Mock Test Series',
                    'OMR Sheets & Practice Sheets Pack',
                    'MSI Notebook, Pen & Study Planner',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => {
                  handleOrderBookOrKit({
                    id: 'kit-clat-aspirant',
                    title: 'MSI CLAT Aspirant Kit',
                    price: 2999,
                    originalPrice: 4000,
                    type: 'kit',
                    description: 'All 6 MSI Master Books Series, Monthly Magazine, Full-Length Mock Tests, OMR Sheets & Study Planner',
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Order CLAT Kit (₹2,999)
              </button>
            </div>

            {/* Kit 2: Judiciary Aspirant Kit */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#E8DCCB] hover:border-[#89190E] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#89190E] bg-[#FFF3DD] px-3 py-1 rounded-full font-bold">
                  Flagship Judicial Bundle
                </span>
                <h3 className="font-serif text-xl font-bold text-[#10233F] mt-3 mb-1">
                  MSI Judiciary Aspirant Kit
                </h3>
                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="font-serif text-2xl font-bold text-[#89190E]">₹3,999</span>
                  <span className="text-xs text-[#526174] line-through">₹5,500+ Value</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#526174] mb-5">
                  {[
                    'Judiciary Notes & Bare Act Notes',
                    'Landmark Case-Law Compilation',
                    'Prelims & Mains Practice Books',
                    'High Court Judgment-Writing Guide',
                    'Test Series, OMR Sheets, Diary & Bag',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => {
                  handleOrderBookOrKit({
                    id: 'kit-judiciary-aspirant',
                    title: 'MSI Judiciary Aspirant Kit',
                    price: 3999,
                    originalPrice: 5500,
                    type: 'kit',
                    description: 'Judiciary Notes & Bare Act Notes, Landmark Case-Law Compilation, Prelims & Mains Practice Books, Bag & Diary',
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Order Judiciary Kit (₹3,999)
              </button>
            </div>

            {/* Kit 3: Student Essentials Combo */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#E8DCCB] hover:border-[#89190E] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#89190E] bg-[#FFF3DD] px-3 py-1 rounded-full">
                  Institute Essentials
                </span>
                <h3 className="font-serif text-xl font-bold text-[#10233F] mt-3 mb-1">
                  MSI Merchandise Combo Kit
                </h3>
                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="font-serif text-2xl font-bold text-[#89190E]">₹1,499</span>
                  <span className="text-xs text-[#526174] line-through">MRP: ₹2,199</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#526174] mb-5">
                  {[
                    'MSI Ergonomic Institute Backpack',
                    'Official MSI Institute T-Shirt',
                    'MSI Executive Diary & Notebook',
                    'MSI Water Bottle / Insulated Sipper',
                    'MSI Signature Pen & Study Planner',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => {
                  handleOrderBookOrKit({
                    id: 'kit-merchandise-combo',
                    title: 'MSI Merchandise Combo Kit',
                    price: 1499,
                    originalPrice: 2199,
                    type: 'kit',
                    description: 'MSI Ergonomic Institute Backpack, Official MSI Institute T-Shirt, Executive Diary, Insulated Sipper & Pen',
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Order Merchandise Combo (₹1,499)
              </button>
            </div>

          </div>

          {/* Test Series & Current Affairs Products Strip (Compact 2-col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFF9EF] p-6 rounded-3xl border border-[#E8DCCB]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#89190E] block mb-1">
                Examination Testing
              </span>
              <h4 className="font-serif text-lg font-bold text-[#10233F] mb-3">
                MSI Mock Test Products
              </h4>
              <div className="space-y-2 text-xs text-[#10233F]">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>CLAT 20 Full-Length Mocks Series</span>
                  <span className="font-bold text-[#89190E]">₹1,999</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>CLAT 40 Full-Length Mocks Series</span>
                  <span className="font-bold text-[#89190E]">₹2,499</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>CLAT 60 Full-Length Comprehensive Mocks</span>
                  <span className="font-bold text-[#89190E]">₹3,999</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>AILET Full Test Series</span>
                  <span className="font-bold text-[#89190E]">₹2,999</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>PU Law Test Series</span>
                  <span className="font-bold text-[#89190E]">₹2,799</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9EF] p-6 rounded-3xl border border-[#E8DCCB]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#89190E] block mb-1">
                Publications & Magazines
              </span>
              <h4 className="font-serif text-lg font-bold text-[#10233F] mb-3">
                MSI Current Affairs Products
              </h4>
              <div className="space-y-2 text-xs text-[#10233F]">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>Monthly Current Affairs Magazine</span>
                  <span className="font-bold text-[#89190E]">₹249 / month</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>Quarterly Current Affairs Compilation</span>
                  <span className="font-bold text-[#89190E]">₹499</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>Annual Current Affairs Book</span>
                  <span className="font-bold text-[#89190E]">₹699</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>Legal Current Affairs Book</span>
                  <span className="font-bold text-[#89190E]">₹799</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB]">
                  <span>CLAT Last 365 Days Current Affairs + Legal GK Combo</span>
                  <span className="font-bold text-[#89190E]">₹1,799</span>
                </div>
              </div>
            </div>
          </div>

        </section>



        {/* ------------------------------------------------------------------
            5. ADMISSION PROCESS & HELPLINE STRIP
            ------------------------------------------------------------------ */}
        <section className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 pb-16">
          <div className="rounded-3xl bg-gradient-to-r from-[#10233F] via-[#162f55] to-[#10233F] p-7 sm:p-10 text-white border border-[#EFC988]/30 shadow-2xl relative overflow-hidden mb-12">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#EFC988]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#EFC988] bg-white/10 px-3 py-1 rounded-full mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#EFC988]" />
                  Direct Admissions Helpline
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
                  Need Help Selecting Your Law or Judiciary Batch?
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                  Talk directly to our senior academic counselors for one-on-one exam strategy, syllabus details, and batch start dates.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedCourse('Direct Course Admissions Enquiry');
                    setIsEnquiryOpen(true);
                  }}
                  className="h-12 px-6 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enquire Now</span>
                </button>

                <a
                  href="https://wa.me/919634299858?text=Hello%20MSI%20Admissions%20Team%2C%20I%20have%20questions%20about%20your%20courses."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-6 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:bg-[#05463e] text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Admission Process Steps (Single Compact Row) */}
          <SectionHeading
            eyebrow="How to Enroll"
            title="Admission Process"
            subtitle="Five straightforward steps to secure your place at MSI Group of Institutes."
            className="mb-10"
          />
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#89190E] z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
              {admissionSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="group bg-white border border-[#E8DCCB] rounded-3xl p-5 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#EFC988]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF3DD] text-[#89190E] flex items-center justify-center mb-3 mx-auto group-hover:bg-[#89190E] group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#EFC988] block mb-1">
                      STEP {step.step}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#10233F] mb-1.5 group-hover:text-[#89190E] transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-[#526174] leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </section>
      </main>

      <Footer />

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        initialCourse={selectedCourse}
      />

      {/* Udemy Course Details & Preview Modal */}
      <UdemyCourseModal
        course={activeUdemyModalCourse}
        isOpen={!!activeUdemyModalCourse}
        onClose={() => setActiveUdemyModalCourse(null)}
        activeStudentId={
          typeof window !== 'undefined' && localStorage.getItem('msi_active_student_phone')
            ? `msi-stu-${(localStorage.getItem('msi_active_student_phone') || '').replace(/\D/g, '').slice(-4)}`
            : undefined
        }
        onEnrollSuccess={(c) => {
          loadLmsData();
          showToast(`✓ Enrolled in ${c.title}!`);
        }}
        onRequireLogin={(c) => {
          setLoginModalCourse(c);
        }}
      />

      {/* Student Login Required to Enroll Modal */}
      <StudentEnrollLoginModal
        isOpen={!!loginModalCourse}
        course={loginModalCourse}
        onClose={() => setLoginModalCourse(null)}
        onLoginSuccess={handleLoginEnrollSuccess}
      />

      {/* Direct Razorpay Checkout Modal (Authentic Razorpay Standard Sheet) */}
      {directCheckoutCourse && (
        <RazorpayCheckoutModal
          isOpen={!!directCheckoutCourse}
          onClose={() => setDirectCheckoutCourse(null)}
          course={{
            id: directCheckoutCourse.id,
            title: directCheckoutCourse.title,
            price: directCheckoutCourse.price,
            originalPrice: directCheckoutCourse.originalPrice,
          }}
          studentName={
            typeof window !== 'undefined'
              ? localStorage.getItem('msi_active_student_name') || 'Student'
              : 'Student'
          }
          studentPhone={
            typeof window !== 'undefined'
              ? localStorage.getItem('msi_active_student_phone') || ''
              : ''
          }
          onPaymentSuccess={(info) => {
            const studentPhone = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_phone') || '' : '';
            const studentName = typeof window !== 'undefined' ? localStorage.getItem('msi_active_student_name') || 'Student' : 'Student';
            const cleanPhone = studentPhone.replace(/\D/g, '').slice(-10);
            const stuId = cleanPhone ? `msi-stu-${cleanPhone.slice(-4)}` : 'msi-stu-guest';

            if (directCheckoutCourse.id.startsWith('kit-') || directCheckoutCourse.id.startsWith('book-')) {
              // Record Book / Kit Purchase
              const purchasedKit = {
                id: `ord-${Date.now()}`,
                itemId: directCheckoutCourse.id,
                title: directCheckoutCourse.title,
                price: directCheckoutCourse.price,
                orderDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                receiptNumber: info.receiptNumber,
                paymentId: info.razorpayPaymentId,
                status: 'Dispatched from MSI Campus',
                trackingNumber: `MSI-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
              };

              try {
                const existingKits = JSON.parse(localStorage.getItem('msi_student_purchased_kits') || '[]');
                const updatedKits = [purchasedKit, ...existingKits];
                localStorage.setItem('msi_student_purchased_kits', JSON.stringify(updatedKits));

                // Save to student profile on server disk
                if (cleanPhone) {
                  fetch('/api/student/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      phone: cleanPhone,
                      profile: {
                        purchasedKits: updatedKits,
                      },
                    }),
                  }).catch((e) => console.warn('Profile kit save error:', e));
                }

                window.dispatchEvent(new Event('msi_kits_sync'));
                window.dispatchEvent(new Event('storage'));
              } catch (err) {
                console.warn('Kit save error:', err);
              }

              showToast(`🎉 Order confirmed for ${directCheckoutCourse.title}! Verified via ${info.receiptNumber}. View in Student Dashboard.`);
            } else {
              // Standard Course Enrollment
              enrollStudentAction(stuId, directCheckoutCourse.id, 'self', studentName, 'Purchased via Razorpay', cleanPhone, studentName);
              loadLmsData();
              showToast(`🎉 Enrolled in ${directCheckoutCourse.title}! Verified via ${info.receiptNumber}`);
            }

            setDirectCheckoutCourse(null);
          }}
        />
      )}
    </div>
  );
}
