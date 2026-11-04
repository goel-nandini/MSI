'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  PhoneCall,
  BookOpen,
  Image as ImageIcon,
  Receipt,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Eye,
  Check,
  X,
  AlertCircle,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  Send,
  Upload,
  Lock,
  LogOut,
  Filter,
  ArrowUpRight,
  Download,
  RefreshCw,
  Video,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  BadgePercent,
  Play,
  Layers,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  FolderOpen,
  Copy,
  FileSpreadsheet,
  Share2,
  HelpCircle,
  Radio,
  Tv,
  Server,
  ArrowRight,
  Cpu,
  Key,
  Printer,
  Globe,
  ExternalLink,
  EyeOff,
  Pencil,
  Edit3,
} from 'lucide-react';
import {
  MSICourse,
  MSILecture,
  MSISection,
  TeacherApprovalRecord,
  CourseEnrollment,
  getStoredCourses,
  saveStoredCourses,
  deleteCourseAction,
  deleteTeacherAction,
  getStoredTeachers,
  saveStoredTeachers,
  getStoredEnrollments,
  syncEnrollmentsFromServer,
  enrollStudentAction,
  approveTeacherAction,
  rejectTeacherAction,
  assignCoursesToTeacherAction,
  assignCourseToFacultyAction,
  findTeacherByIdOrName,
  markCourseDeletedLocally,
  unmarkCourseDeletedLocally,
  markTeacherDeletedLocally,
  unmarkTeacherDeletedLocally,
  LMS_SYNC_EVENT,
} from '@/lib/lmsStore';
import { Lead } from '@/components/reception/data/leadsMockData';
import { ReceptionistRecord } from '@/lib/receptionistStore';
import { GalleryItem } from '../api/admin/gallery/route';
import { AdminTransaction } from '../api/admin/transactions/route';
import * as XLSX from 'xlsx';
import ExcelLeadManagerModal from '@/components/super-admin/ExcelLeadManagerModal';
import FeeReceiptModal, { numberToWords } from '@/components/student/FeeReceiptModal';


type AdminTab =
  | 'dashboard'
  | 'students'
  | 'leads'
  | 'teachers'
  | 'courses'
  | 'gallery'
  | 'transactions';

interface RegisteredStudent {
  id: string;
  phone: string;
  name: string;
  stream: string;
  email?: string;
  password?: string;
  registeredAt: string;
  role?: string;
  profile?: Record<string, any>;
  totalFee?: number;
  paidFee?: number;
  dueFee?: number;
  nextDueDate?: string;
}

export default function SuperAdminMasterDashboard() {
  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Primary Data States (Persistent via Disk APIs)
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherApprovalRecord[]>([]);
  const [courses, setCourses] = useState<MSICourse[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3600);
  };

  // â”€â”€ Modals State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 1. Add Student Modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentStream, setNewStudentStream] = useState('PCS-J Punjab Judicial Services');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('Student@MSI2026');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [newStudentTotalFee, setNewStudentTotalFee] = useState('50000');
  const [newStudentPaidFee, setNewStudentPaidFee] = useState('0');
  const [newStudentNextDueDate, setNewStudentNextDueDate] = useState('');

  const [editStudentTotalFee, setEditStudentTotalFee] = useState('0');
  const [editStudentPaidFee, setEditStudentPaidFee] = useState('0');
  const [editStudentDueFee, setEditStudentDueFee] = useState('0');
  const [editStudentNextDueDate, setEditStudentNextDueDate] = useState('');

  // Collect Fee Modal State
  const [studentForCollectFee, setStudentForCollectFee] = useState<RegisteredStudent | null>(null);
  const [collectFeeAmount, setCollectFeeAmount] = useState('');
  const [collectFeePaymentMethod, setCollectFeePaymentMethod] = useState('UPI');
  const [collectFeeRemarks, setCollectFeeRemarks] = useState('Academic Tuition Settlement');
  const [isSubmittingCollectFee, setIsSubmittingCollectFee] = useState(false);

  // 2. View Student Details Modal
  const [selectedStudentForView, setSelectedStudentForView] = useState<RegisteredStudent | null>(null);

  // 3. Delete Student Confirmation Modal
  const [studentToDelete, setStudentToDelete] = useState<RegisteredStudent | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [createdStudentCredentials, setCreatedStudentCredentials] = useState<{
    name: string;
    phone: string;
    email?: string;
    stream: string;
    pass: string;
  } | null>(null);
  const [showStudentPasswords, setShowStudentPasswords] = useState<Record<string, boolean>>({});
  const toggleStudentPasswordVisibility = (phone: string) => {
    setShowStudentPasswords((prev) => ({ ...prev, [phone]: !prev[phone] }));
  };

  // 3b. Assign Course Directly to Student Modal State
  const [selectedStudentForCourseAssign, setSelectedStudentForCourseAssign] = useState<RegisteredStudent | null>(null);
  const [assignCourseTargetCourseId, setAssignCourseTargetCourseId] = useState('');
  const [assignCourseNote, setAssignCourseNote] = useState('Authorized by MSI Super Admin Directorate');
  const [isSubmittingCourseAssign, setIsSubmittingCourseAssign] = useState(false);

  // 4. Add Lead Modal (Dispatches directly to Reception)
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadMobile, setNewLeadMobile] = useState('');
  const [newLeadLocation, setNewLeadLocation] = useState('Chandigarh / Mohali');
  const [newLeadCourse, setNewLeadCourse] = useState('PCS-J Punjab Judicial Services');
  const [newLeadSource, setNewLeadSource] = useState('Meta Ads (Facebook/Instagram)');
  const [newLeadAgent, setNewLeadAgent] = useState('Harshit (Reception Desk)');
  const [newLeadNotes, setNewLeadNotes] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // 4a. Receptionist Staff Management
  const [receptionists, setReceptionists] = useState<ReceptionistRecord[]>([]);
  const [receptionistsLoaded, setReceptionistsLoaded] = useState(false);

  const seniorDeskRecord = useMemo(() => {
    const found = receptionists.find(
      (r) =>
        r.id === 'rec-harshit-01' ||
        (r.phone && r.phone.replace(/\D/g, '').slice(-10) === '9792303434') ||
        (r.email && r.email.toLowerCase().includes('harshit')) ||
        (r.name && r.name.toLowerCase().includes('harshit'))
    );
    if (found) return found;
    if (receptionistsLoaded) return null;
    return {
      id: 'rec-harshit-01',
      name: 'Harshit (Senior Desk)',
      phone: '9792303434',
      email: 'harshit.reception@msi-institutes.edu.in',
      password: 'Harshit@reception',
      status: 'active' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
      role: 'reception' as const,
    };
  }, [receptionists, receptionistsLoaded]);

  const visibleReceptionists = useMemo(() => {
    return receptionists.filter(
      (rec) =>
        rec.id !== seniorDeskRecord?.id &&
        rec.phone.replace(/\D/g, '').slice(-10) !== (seniorDeskRecord?.phone || '').replace(/\D/g, '').slice(-10)
    );
  }, [receptionists, seniorDeskRecord]);

  const totalReceptionistCount = (seniorDeskRecord ? 1 : 0) + visibleReceptionists.length;

  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);
  const [showAddReceptionistModal, setShowAddReceptionistModal] = useState(false);
  const [newReceptionistName, setNewReceptionistName] = useState('');
  const [newReceptionistPhone, setNewReceptionistPhone] = useState('');
  const [newReceptionistEmail, setNewReceptionistEmail] = useState('');
  const [newReceptionistPassword, setNewReceptionistPassword] = useState('Reception@MSI2026');
  const [isSubmittingReceptionist, setIsSubmittingReceptionist] = useState(false);
  const [receptionistToDelete, setReceptionistToDelete] = useState<ReceptionistRecord | null>(null);
  const [isDeletingReceptionist, setIsDeletingReceptionist] = useState(false);
  const [createdReceptionistCredentials, setCreatedReceptionistCredentials] = useState<{
    name: string;
    phone: string;
    email?: string;
    pass: string;
  } | null>(null);

  // 4b. Bulk Lead Import Modal (Excel / CSV)
  const [showBulkLeadModal, setShowBulkLeadModal] = useState(false);
  const [bulkLeadsText, setBulkLeadsText] = useState('');
  const [bulkDefaultSource, setBulkDefaultSource] = useState('Meta Ads (Facebook/Instagram)');
  const [bulkDefaultAgent, setBulkDefaultAgent] = useState('Auto Round-Robin Distribution');
  const [bulkDefaultCourse, setBulkDefaultCourse] = useState('PCS-J Punjab Judicial Services');
  const [isImportingBulk, setIsImportingBulk] = useState(false);

  // 4c. Meta Webhook Modal (For Ankit)
  const [showMetaWebhookModal, setShowMetaWebhookModal] = useState(false);

  // 5. Add Gallery Media Modal
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState<'institute' | 'labs' | 'library' | 'events'>('institute');
  const [newGalleryImage, setNewGalleryImage] = useState('/images/hero-1.webp');
  const [newGalleryTagline, setNewGalleryTagline] = useState('Campus Excellence');
  const [newGalleryDesc, setNewGalleryDesc] = useState('');
  const [isSubmittingGallery, setIsSubmittingGallery] = useState(false);

  // 5b. Edit Gallery Item Modal
  const [galleryToEdit, setGalleryToEdit] = useState<GalleryItem | null>(null);
  const [editGalleryTitle, setEditGalleryTitle] = useState('');
  const [editGalleryCategory, setEditGalleryCategory] = useState<'institute' | 'labs' | 'library' | 'events'>('institute');
  const [editGalleryImage, setEditGalleryImage] = useState('');
  const [editGalleryTagline, setEditGalleryTagline] = useState('Campus Excellence');
  const [editGalleryDesc, setEditGalleryDesc] = useState('');
  const [editGallerySpan, setEditGallerySpan] = useState<'normal' | 'wide'>('normal');
  const [isUpdatingGallery, setIsUpdatingGallery] = useState(false);

  // 6. Delete Gallery Item
  const [galleryToDelete, setGalleryToDelete] = useState<GalleryItem | null>(null);

  // 7. Teacher Assignment / Approval Modal
  const [assigningTeacher, setAssigningTeacher] = useState<TeacherApprovalRecord | null>(null);
  const [teacherSelectedCourseIds, setTeacherSelectedCourseIds] = useState<string[]>([]);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherApprovalRecord | null>(null);
  const [isDeletingTeacher, setIsDeletingTeacher] = useState(false);

  // 8. Add Faculty Modal
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');
  const [newTeacherSpecialization, setNewTeacherSpecialization] = useState('Constitutional Law & Jurisprudence');
  const [newTeacherExp, setNewTeacherExp] = useState('8');
  const [newTeacherPassword, setNewTeacherPassword] = useState('MSI@Faculty2026');
  const [createdFacultyCredentials, setCreatedFacultyCredentials] = useState<{
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
    pass: string;
  } | null>(null);

  // 9. Course Creation Modal (Super Admin LMS)
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseHeadline, setNewCourseHeadline] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState<
    'Judiciary' | 'Law Entrance' | 'Criminal Law' | 'Constitutional Law' | 'Cyber Law' | 'Postgraduate'
  >('Judiciary');
  const [newCoursePrice, setNewCoursePrice] = useState('4999');
  const [newCourseOriginalPrice, setNewCourseOriginalPrice] = useState('14999');
  const [newCourseTeacherId, setNewCourseTeacherId] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState<'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced'>('All Levels');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseThumbnail, setNewCourseThumbnail] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80');
  const [newCourseThumbnailPreview, setNewCourseThumbnailPreview] = useState<string | null>(null);
  const [newCourseLectureTitle, setNewCourseLectureTitle] = useState('Orientation & Landmark Constitutional Doctrines');
  const [newCourseLectureVideo, setNewCourseLectureVideo] = useState('https://player.mediadelivery.net/embed/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc');
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  // 9a. Course Edit Modal State
  const [courseToEdit, setCourseToEdit] = useState<MSICourse | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseHeadline, setEditCourseHeadline] = useState('');
  const [editCourseCategory, setEditCourseCategory] = useState<'Judiciary' | 'Law Entrance' | 'Criminal Law' | 'Constitutional Law' | 'Cyber Law' | 'Postgraduate'>('Judiciary');
  const [editCourseLevel, setEditCourseLevel] = useState<'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced'>('All Levels');
  const [editCoursePrice, setEditCoursePrice] = useState('4999');
  const [editCourseOriginalPrice, setEditCourseOriginalPrice] = useState('14999');
  const [editCourseTeacherId, setEditCourseTeacherId] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');
  const [editCourseThumbnail, setEditCourseThumbnail] = useState('');
  const [editCourseBadge, setEditCourseBadge] = useState<string>('Hot & New');
  const [isSubmittingEditCourse, setIsSubmittingEditCourse] = useState(false);

  // 9b. Faculty Edit Modal State
  const [facultyToEdit, setFacultyToEdit] = useState<TeacherApprovalRecord | null>(null);
  const [editFacultyName, setEditFacultyName] = useState('');
  const [editFacultyEmail, setEditFacultyEmail] = useState('');
  const [editFacultyPhone, setEditFacultyPhone] = useState('');
  const [editFacultySpecialization, setEditFacultySpecialization] = useState('');
  const [editFacultyDesignation, setEditFacultyDesignation] = useState('');
  const [editFacultyDepartment, setEditFacultyDepartment] = useState('');
  const [editFacultyExp, setEditFacultyExp] = useState('8');
  const [editFacultyPassword, setEditFacultyPassword] = useState('');
  const [isSubmittingEditFaculty, setIsSubmittingEditFaculty] = useState(false);

  // 9c. Student Edit Modal State
  const [studentToEdit, setStudentToEdit] = useState<RegisteredStudent | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editStudentStream, setEditStudentStream] = useState('');
  const [editStudentEmail, setEditStudentEmail] = useState('');
  const [editStudentPassword, setEditStudentPassword] = useState('');
  const [isSubmittingEditStudent, setIsSubmittingEditStudent] = useState(false);

  // 9d. Receptionist Edit Modal State
  const [receptionistToEdit, setReceptionistToEdit] = useState<ReceptionistRecord | null>(null);
  const [editReceptionistName, setEditReceptionistName] = useState('');
  const [editReceptionistPhone, setEditReceptionistPhone] = useState('');
  const [editReceptionistEmail, setEditReceptionistEmail] = useState('');
  const [editReceptionistPassword, setEditReceptionistPassword] = useState('');
  const [isSubmittingEditReceptionist, setIsSubmittingEditReceptionist] = useState(false);

  // 9e. Delete Course Modal
  const [courseToDelete, setCourseToDelete] = useState<MSICourse | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  // 10. Add Recorded Lecture Modal to existing Course
  const [selectedCourseForLecture, setSelectedCourseForLecture] = useState<MSICourse | null>(null);
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureVideoUrl, setNewLectureVideoUrl] = useState('https://player.mediadelivery.net/play/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc');
  const [newLectureDuration, setNewLectureDuration] = useState('45 mins');
  const [newLectureSummary, setNewLectureSummary] = useState('');
  const [isSubmittingLecture, setIsSubmittingLecture] = useState(false);

  // 10b. Assign Faculty to Course Modal State
  const [selectedCourseForFacultyAssign, setSelectedCourseForFacultyAssign] = useState<MSICourse | null>(null);
  const [assignFacultyTargetTeacherId, setAssignFacultyTargetTeacherId] = useState('');
  const [assignFacultyCustomName, setAssignFacultyCustomName] = useState('');
  const [assignFacultyAutoEnroll, setAssignFacultyAutoEnroll] = useState(true);
  const [isSubmittingFacultyAssign, setIsSubmittingFacultyAssign] = useState(false);

  // 11. Transaction Receipts State
  const [selectedTxnForReceipt, setSelectedTxnForReceipt] = useState<AdminTransaction | null>(null);

  // ── Bulk Student Selection & Deletion State ──
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // ── Manual Invoice Creation State ──
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState<boolean>(false);
  const [invStudentMode, setInvStudentMode] = useState<'existing' | 'custom'>('existing');
  const [invStudentId, setInvStudentId] = useState<string>('');
  const [invStudentName, setInvStudentName] = useState<string>('');
  const [invStudentPhone, setInvStudentPhone] = useState<string>('');
  const [invStudentEmail, setInvStudentEmail] = useState<string>('');
  const [invStudentAddress, setInvStudentAddress] = useState<string>('#3007 GTB NAGAR, Kharar, Punjab - 140301');
  const [invStudentGuardian, setInvStudentGuardian] = useState<string>('');
  const [invCourseTitle, setInvCourseTitle] = useState<string>('PCS-J Punjab Judicial Services');
  const [invInvoiceNo, setInvInvoiceNo] = useState<string>('');
  const [invDate, setInvDate] = useState<string>('');
  const [invAmount, setInvAmount] = useState<string>('20000');
  const [invPaymentMode, setInvPaymentMode] = useState<string>('ONLINE / UPI');
  const [invDescription, setInvDescription] = useState<string>('Course Tuition & Academic Training Fee');
  const [invRemarks, setInvRemarks] = useState<string>('');
  const [invSyncStudentLedger, setInvSyncStudentLedger] = useState<boolean>(true);
  const [isSubmittingManualInvoice, setIsSubmittingManualInvoice] = useState<boolean>(false);

  // â”€â”€ Authentication Check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem('msi_superadmin_logged_in') === 'true' ||
      localStorage.getItem('msi_super_admin_authenticated') === 'true';
    if (isLoggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    const clean = authPhone.replace(/\D/g, '').slice(-10);
    const pass = authPassword.trim();

    setTimeout(() => {
      if (
        clean === '9792303434' &&
        (pass === 'MSI@superadmin' || pass.toLowerCase() === 'msi@superadmin')
      ) {
        localStorage.setItem('msi_superadmin_logged_in', 'true');
        localStorage.setItem('msi_super_admin_authenticated', 'true');
        localStorage.setItem('msi_active_admin_id', 'super-admin-01');
        localStorage.setItem('msi_active_admin_name', 'MSI Administrator');
        localStorage.setItem('msi_active_admin_phone', '9792303434');
        setIsAuthenticated(true);
        showToast('Super Admin Master Clearance Verified! Welcome, Administrator.');
      } else {
        setAuthError('Invalid credentials. Please enter authorized Super Admin credentials.');
      }
      setIsAuthLoading(false);
    }, 450);
  };

  const handleLogout = () => {
    localStorage.removeItem('msi_superadmin_logged_in');
    localStorage.removeItem('msi_super_admin_authenticated');
    setIsAuthenticated(false);
    showToast('Logged out of Super Admin Master Portal.');
  };

  // â”€â”€ Live Clock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentDateTime(`${dateStr} • ${timeStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // â”€â”€ Master Data Fetchers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/students', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err) {
      console.warn('Could not fetch students from disk:', err);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leads', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.warn('Could not fetch leads from disk:', err);
    }
  }, []);

  const fetchGallery = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/gallery', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setGalleryItems(data.items);
      }
    } catch (err) {
      console.warn('Could not fetch gallery from disk:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/transactions', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.warn('Could not fetch transactions:', err);
    }
  }, []);

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/faculty', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.teachers)) {
        setTeachers(data.teachers);
        saveStoredTeachers(data.teachers, false);
      }
    } catch (err) {
      console.warn('Could not fetch faculty from disk:', err);
    }
  }, []);

  const fetchReceptionists = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/receptionists', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.receptionists)) {
        setReceptionists(data.receptionists);
      }
    } catch (err) {
      console.warn('Could not fetch receptionists from disk:', err);
    } finally {
      setReceptionistsLoaded(true);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
        saveStoredCourses(data.courses, false);
      }
    } catch (err) {
      console.warn('Could not fetch courses from disk:', err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchStudents(),
      fetchLeads(),
      fetchReceptionists(),
      fetchGallery(),
      fetchTransactions(),
      fetchFaculty(),
      fetchCourses(),
      new Promise<void>((resolve) => {
        setEnrollments(getStoredEnrollments());
        resolve();
      }),
    ]);
    setIsRefreshing(false);
  }, [fetchStudents, fetchLeads, fetchReceptionists, fetchGallery, fetchTransactions, fetchFaculty, fetchCourses]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();

      const pollInterval = setInterval(() => {
        fetchStudents();
        fetchLeads();
        fetchReceptionists();
        fetchFaculty();
        fetchCourses();
        fetchTransactions();
      }, 5000);

      let bc: BroadcastChannel | null = null;
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          bc = new BroadcastChannel('msi_sync_channel');
          bc.onmessage = (event) => {
            const t = event.data?.type;
            if (t === 'STUDENT_ENROLLED' || t === 'COURSE_ASSIGNED') {
              fetchCourses();
              fetchStudents();
            } else if (t === 'LEAD_CREATED' || t === 'LEAD_UPDATED' || t === 'LEAD_STATUS_CHANGED') {
              fetchLeads();
            }
          };
        }
      } catch (_) {}

      const handleLeadsSyncEvent = () => {
        fetchLeads();
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('msi_leads_sync', handleLeadsSyncEvent);
      }

      return () => {
        clearInterval(pollInterval);
        if (bc) bc.close();
        if (typeof window !== 'undefined') {
          window.removeEventListener('msi_leads_sync', handleLeadsSyncEvent);
        }
      };
    }
  }, [isAuthenticated, refreshAllData, fetchStudents, fetchLeads, fetchReceptionists, fetchFaculty, fetchCourses, fetchTransactions]);

  // Immediate data fetch on tab switch
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'students') {
        fetchStudents();
      } else if (activeTab === 'leads') {
        fetchLeads();
        fetchReceptionists();
      } else if (activeTab === 'teachers') {
        fetchFaculty();
      } else if (activeTab === 'courses') {
        fetchCourses();
      } else if (activeTab === 'transactions') {
        fetchTransactions();
      }
    }
  }, [activeTab, isAuthenticated, fetchStudents, fetchLeads, fetchReceptionists, fetchFaculty, fetchCourses, fetchTransactions]);

  // â”€â”€ Action Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 1. Add Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentPhone.trim()) {
      showToast('Please enter both student name and 10-digit mobile number.');
      return;
    }

    setIsSubmittingStudent(true);
    try {
      const assignedPassword = newStudentPassword.trim() || 'Student@MSI2026';
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName.trim(),
          phone: newStudentPhone.trim(),
          stream: newStudentStream,
          email: newStudentEmail.trim(),
          password: assignedPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedStudentCredentials({
          name: newStudentName.trim(),
          phone: newStudentPhone.trim(),
          email: newStudentEmail.trim(),
          stream: newStudentStream,
          pass: assignedPassword,
        });
        showToast(`Student ${newStudentName} registered successfully and synced to database.`);
        setShowAddStudentModal(false);
        setNewStudentName('');
        setNewStudentPhone('');
        setNewStudentEmail('');
        if (Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          fetchStudents();
        }
        try {
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      } else {
        showToast(data.message || 'Error creating student.');
      }
    } catch (err: any) {
      showToast('Network error while saving student.');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // 2. Delete Student
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    const targetStudent = studentToDelete;
    const targetPhone = (targetStudent.phone || '').replace(/\D/g, '').slice(-10);
    const targetId = targetStudent.id;

    // Optimistically remove from state immediately
    setStudents((prev) =>
      prev.filter((s) => {
        const sPhone = (s.phone || '').replace(/\D/g, '').slice(-10);
        return s.id !== targetId && (!targetPhone || sPhone !== targetPhone);
      })
    );

    setIsDeletingStudent(true);
    try {
      const phoneParam = encodeURIComponent(targetPhone || targetStudent.phone || '');
      const idParam = encodeURIComponent(targetId || '');
      const res = await fetch(`/api/admin/students?phone=${phoneParam}&id=${idParam}`, {
        method: 'DELETE',
      });
      // Cascade delete enrollments
      fetch(`/api/admin/enrollments?studentPhone=${phoneParam}&studentId=${idParam}`, {
        method: 'DELETE',
      }).catch(() => {});

      const data = await res.json();
      if (data.success) {
        showToast(`Student account (${targetStudent.name}) permanently removed from system.`);

        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('msi_sync_channel');
          bc.postMessage({
            type: 'STUDENT_DELETED',
            studentId: targetId,
            studentPhone: targetPhone,
            studentName: targetStudent.name,
          });
          bc.close();
        }

        // Revoke active session if active student is the one deleted
        if (typeof window !== 'undefined') {
          const activePhone = (localStorage.getItem('msi_active_student_phone') || '').replace(/\D/g, '').slice(-10);
          if (activePhone && activePhone === targetPhone) {
            localStorage.removeItem('msi_student_logged_in');
            localStorage.removeItem('msi_active_student_phone');
            localStorage.removeItem('msi_active_student_name');
            localStorage.removeItem('msi_active_student_email');
            localStorage.removeItem('msi_active_student_stream');
            localStorage.removeItem('msi_active_student_profile');
          }
        }

        if (data.students && Array.isArray(data.students)) {
          setStudents(data.students);
        }
        setStudentToDelete(null);
        fetchStudents();
        try {
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      } else {
        showToast(data.message || 'Failed to delete student.');
        fetchStudents();
      }
    } catch (err) {
      showToast('Network error while deleting student.');
      fetchStudents();
    } finally {
      setIsDeletingStudent(false);
    }
  };

  // 2b. Direct Course Assignment to Student
  const handleAssignCourseToStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForCourseAssign || !assignCourseTargetCourseId) {
      showToast('Please select a course program.');
      return;
    }

    const targetCourse = courses.find((c) => c.id === assignCourseTargetCourseId);
    if (!targetCourse) {
      showToast('Course not found.');
      return;
    }

    setIsSubmittingCourseAssign(true);
    try {
      // 1. Record enrollment locally
      enrollStudentAction(
        selectedStudentForCourseAssign.id,
        targetCourse.id,
        'super-admin',
        'MSI Super Admin',
        assignCourseNote.trim() || 'Direct Admission Authorization',
        selectedStudentForCourseAssign.phone,
        selectedStudentForCourseAssign.name,
        undefined,
        targetCourse.title
      );

      // 2. Persist to disk via /api/admin/enrollments
      await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentForCourseAssign.id,
          studentPhone: selectedStudentForCourseAssign.phone,
          studentName: selectedStudentForCourseAssign.name,
          courseId: targetCourse.id,
          courseTitle: targetCourse.title,
          assignedBy: 'super-admin',
          assignedByName: 'MSI Super Admin',
          assignedNote: assignCourseNote.trim() || 'Direct Admission Authorization',
        }),
      });

      // 3. Broadcast to all open client sessions
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('msi_sync_channel');
        bc.postMessage({
          type: 'STUDENT_ENROLLED',
          studentId: selectedStudentForCourseAssign.id,
          studentPhone: selectedStudentForCourseAssign.phone,
          courseId: targetCourse.id,
          assignedBy: 'super-admin',
          assignedByName: 'MSI Super Admin',
        });
        bc.close();
      }

      window.dispatchEvent(new Event('msi_courses_sync'));
      window.dispatchEvent(new Event('storage'));

      showToast(
        `Course "${targetCourse.title}" successfully assigned to ${selectedStudentForCourseAssign.name}! Immediately visible on their student dashboard.`
      );
      setSelectedStudentForCourseAssign(null);
      setAssignCourseTargetCourseId('');
      setAssignCourseNote('Authorized by MSI Super Admin Directorate');
    } catch (err) {
      console.error(err);
      showToast('Error assigning course to student.');
    } finally {
      setIsSubmittingCourseAssign(false);
    }
  };

  // 3. Add Lead (Two-Way Sync with Reception Desk)
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadMobile.trim()) {
      showToast('Please enter both lead name and mobile number.');
      return;
    }

    setIsSubmittingLead(true);
    try {
      const selectedAgent =
        newLeadAgent === 'Auto Round-Robin Distribution'
          ? [
              'Harshit (Reception Desk)',
              'Counselor Priya (Law Admissions Desk)',
              'Counselor Rohit (Judiciary Services Desk)',
              'Counselor Simran (CLAT & Entrance Desk)',
            ][Math.floor(Math.random() * 4)]
          : newLeadAgent;

      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadName.trim(),
          mobile: newLeadMobile.trim(),
          location: newLeadLocation.trim(),
          targetCourse: newLeadCourse,
          notes: newLeadNotes.trim() || `Inbound lead from ${newLeadSource}`,
          source: newLeadSource,
          agent: selectedAgent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Lead created! Assigned to ${selectedAgent} with source "${newLeadSource}".`);
        setShowAddLeadModal(false);
        setNewLeadName('');
        setNewLeadMobile('');
        setNewLeadNotes('');
        fetchLeads();
        try {
          window.dispatchEvent(new Event('msi_leads_sync'));
        } catch (_) {}
      } else {
        showToast(data.message || 'Failed to dispatch lead.');
      }
    } catch (err) {
      showToast('Network error while creating lead.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // 3b. Quick Lead Status Switcher (Syncs with Reception Desk & Disk)
  const handleSuperAdminLeadStatus = async (leadId: string, newStatus: 'New' | 'Follow-up' | 'Converted' | 'Dead') => {
    try {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      showToast(`Lead status updated to ${newStatus}`);
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, updates: { status: newStatus } }),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('msi_leads_sync'));
        try {
          const bc = new BroadcastChannel('msi_sync_channel');
          bc.postMessage({ type: 'LEAD_STATUS_CHANGED', leadId, status: newStatus });
          bc.close();
        } catch (_) {}
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  // 3b-2. Export Leads to Excel (.xlsx)
  const handleExportLeadsToExcel = () => {
    try {
      if (filteredLeads.length === 0) {
        showToast('No leads available to export.');
        return;
      }
      const dataToExport = filteredLeads.map((l, idx) => ({
        '#': idx + 1,
        'Lead ID': l.id,
        'Candidate Name': l.name,
        'Mobile Number': l.mobile,
        'Location / City': l.location,
        'Target Course': l.targetCourse,
        'Lead Source': l.source,
        'Status': l.status,
        'Assigned Telecaller': l.agent,
        'Latest Remark': l.latestRemark,
        'Received Date': l.receivedDate,
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 22 },
        { wch: 18 },
        { wch: 20 },
        { wch: 32 },
        { wch: 28 },
        { wch: 14 },
        { wch: 30 },
        { wch: 45 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'MSI_Leads');
      const filename = `MSI_Leads_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      showToast(`Exported ${filteredLeads.length} leads to ${filename}!`);
    } catch (err) {
      console.error(err);
      showToast('Error exporting leads to Excel.');
    }
  };

  // 3c. Bulk Import Leads (Excel / CSV)
  const handleBulkImportLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkLeadsText.trim()) {
      showToast('Please enter or paste CSV/Excel lead data.');
      return;
    }

    setIsImportingBulk(true);
    try {
      const lines = bulkLeadsText.trim().split('\n').filter((l) => l.trim().length > 0);
      const telecallersList = [
        'Harshit (Reception Desk)',
        'Counselor Priya (Law Admissions Desk)',
        'Counselor Rohit (Judiciary Services Desk)',
        'Counselor Simran (CLAT & Entrance Desk)',
      ];

      const parsedLeads: any[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('mobile'))) {
          continue;
        }

        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        const name = parts[0]?.trim() || `Candidate #${i + 1}`;
        const mobile = parts[1]?.trim() || '9876543210';
        const location = parts[2]?.trim() || 'Chandigarh / Mohali';
        const course = parts[3]?.trim() || bulkDefaultCourse;
        const source = parts[4]?.trim() || bulkDefaultSource;
        const agent =
          bulkDefaultAgent === 'Auto Round-Robin Distribution' || !parts[5]?.trim()
            ? telecallersList[i % telecallersList.length]
            : parts[5].trim();
        const notes = parts[6]?.trim() || `Batch imported lead (${source})`;

        parsedLeads.push({
          name,
          mobile,
          location,
          targetCourse: course,
          source,
          agent,
          notes,
        });
      }

      if (parsedLeads.length === 0) {
        showToast('No valid candidate rows detected.');
        setIsImportingBulk(false);
        return;
      }

      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulk: true,
          leads: parsedLeads,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Imported ${parsedLeads.length} leads successfully! Distributed to counselors.`);
        setShowBulkLeadModal(false);
        setBulkLeadsText('');
        fetchLeads();
        try {
          window.dispatchEvent(new Event('msi_leads_sync'));
        } catch (_) {}
      } else {
        showToast(data.message || 'Bulk import failed.');
      }
    } catch (err) {
      showToast('Network error during bulk lead import.');
    } finally {
      setIsImportingBulk(false);
    }
  };

  // 3c. Receptionist Staff Management Handlers
  const handleCreateReceptionist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceptionistName.trim() || !newReceptionistPhone.trim()) {
      showToast('Please specify receptionist staff name and 10-digit mobile number.');
      return;
    }

    setIsSubmittingReceptionist(true);
    try {
      const assignedPass = newReceptionistPassword.trim() || 'Reception@MSI2026';
      const res = await fetch('/api/admin/receptionists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newReceptionistName.trim(),
          phone: newReceptionistPhone.trim(),
          email: newReceptionistEmail.trim(),
          password: assignedPass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedReceptionistCredentials({
          name: newReceptionistName.trim(),
          phone: newReceptionistPhone.trim(),
          email: newReceptionistEmail.trim(),
          pass: assignedPass,
        });
        showToast(`Receptionist ${newReceptionistName} account created!`);
        setShowAddReceptionistModal(false);
        setNewReceptionistName('');
        setNewReceptionistPhone('');
        setNewReceptionistEmail('');
        fetchReceptionists();
      } else {
        showToast(data.message || 'Failed to create receptionist.');
      }
    } catch (err) {
      showToast('Network error while saving receptionist.');
    } finally {
      setIsSubmittingReceptionist(false);
    }
  };

  const handleDeleteReceptionist = async () => {
    if (!receptionistToDelete) return;
    setIsDeletingReceptionist(true);
    try {
      const res = await fetch(`/api/admin/receptionists?id=${receptionistToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Receptionist ${receptionistToDelete.name} removed permanently from system.`);

        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('msi_sync_channel');
          bc.postMessage({
            type: 'RECEPTIONIST_DELETED',
            receptionistId: receptionistToDelete.id,
            receptionistPhone: receptionistToDelete.phone,
            receptionistEmail: receptionistToDelete.email,
            receptionistName: receptionistToDelete.name,
          });
          bc.close();
        }

        // Revoke active session if currently active receptionist is the one deleted
        if (typeof window !== 'undefined') {
          const activePhone = (localStorage.getItem('msi_active_staff_phone') || '').replace(/\D/g, '').slice(-10);
          const targetPhone = (receptionistToDelete.phone || '').replace(/\D/g, '').slice(-10);
          const activeId = localStorage.getItem('msi_active_staff_id');
          if ((activePhone && activePhone === targetPhone) || (activeId && activeId === receptionistToDelete.id)) {
            localStorage.removeItem('msi_reception_logged_in');
            localStorage.removeItem('msi_active_staff_id');
            localStorage.removeItem('msi_active_staff_name');
            localStorage.removeItem('msi_active_staff_phone');
            localStorage.removeItem('msi_active_staff_email');
          }
        }

        if (data.receptionists) {
          setReceptionists(data.receptionists);
        }
        setReceptionistToDelete(null);
        fetchReceptionists();
        try {
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      } else {
        showToast(data.message || 'Could not delete receptionist.');
      }
    } catch (err) {
      showToast('Network error while deleting receptionist.');
    } finally {
      setIsDeletingReceptionist(false);
    }
  };

  // Helper for image compression to keep base64 within Vercel body limits
  const compressImageFile = (file: File, maxWidth = 1600, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const raw = event.target?.result as string;
        if (!raw) return resolve('');
        if (typeof window === 'undefined') return resolve(raw);
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/webp', quality);
            resolve(dataUrl);
          } else {
            resolve(raw);
          }
        };
        img.onerror = () => resolve(raw);
        img.src = raw;
      };
      reader.readAsDataURL(file);
    });
  };

  // 4. Add Gallery Media (Direct File Upload & Instant Sync)
  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      const compressed = await compressImageFile(file);
      if (compressed) {
        setNewGalleryImage(compressed);
      }
    } catch (_) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setNewGalleryImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 4b. Edit Gallery Media File Change
  const handleEditGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      const compressed = await compressImageFile(file);
      if (compressed) {
        setEditGalleryImage(compressed);
      }
    } catch (_) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setEditGalleryImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditGallery = (item: GalleryItem) => {
    setGalleryToEdit(item);
    setEditGalleryTitle(item.title);
    setEditGalleryCategory(item.category);
    setEditGalleryImage(item.image);
    setEditGalleryTagline(item.tagline || 'Campus Excellence');
    setEditGalleryDesc(item.desc || '');
    setEditGallerySpan(item.span || 'normal');
  };

  const handleUpdateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryToEdit || !editGalleryTitle.trim() || !editGalleryImage.trim()) {
      showToast('Please specify title and provide an image.');
      return;
    }

    setIsUpdatingGallery(true);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: galleryToEdit.id,
          title: editGalleryTitle.trim(),
          category: editGalleryCategory,
          image: editGalleryImage.trim(),
          tagline: editGalleryTagline.trim(),
          desc: editGalleryDesc.trim(),
          span: editGallerySpan,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Gallery media updated successfully! Live on /gallery.');
        setGalleryToEdit(null);
        if (Array.isArray(data.items)) {
          setGalleryItems(data.items);
        } else {
          fetchGallery();
        }
        try {
          window.dispatchEvent(new Event('msi_gallery_sync'));
          window.dispatchEvent(new Event('storage'));
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'GALLERY_UPDATED' });
            bc.close();
          }
        } catch (_) {}
      } else {
        showToast(data.message || 'Failed to update gallery media.');
      }
    } catch (err) {
      showToast('Network error while updating gallery media.');
    } finally {
      setIsUpdatingGallery(false);
    }
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryTitle.trim() || !newGalleryImage.trim()) {
      showToast('Please specify title and select/provide an image.');
      return;
    }

    setIsSubmittingGallery(true);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGalleryTitle.trim(),
          category: newGalleryCategory,
          image: newGalleryImage.trim(),
          tagline: newGalleryTagline.trim(),
          desc: newGalleryDesc.trim() || 'MSI Campus photographic facility record.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Media published! Public /gallery website updated instantly.');
        setShowAddGalleryModal(false);
        setNewGalleryTitle('');
        setNewGalleryDesc('');
        if (Array.isArray(data.items)) {
          setGalleryItems(data.items);
        } else {
          fetchGallery();
        }
        try {
          window.dispatchEvent(new Event('msi_gallery_sync'));
          window.dispatchEvent(new Event('storage'));
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'GALLERY_UPDATED' });
            bc.close();
          }
        } catch (_) {}
      } else {
        showToast(data.message || 'Failed to upload gallery media.');
      }
    } catch (err) {
      showToast('Network error while saving gallery media.');
    } finally {
      setIsSubmittingGallery(false);
    }
  };

  // 5. Delete Gallery Media
  const handleDeleteGallery = async () => {
    if (!galleryToDelete) return;
    try {
      const res = await fetch(`/api/admin/gallery?id=${galleryToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Media removed from website gallery.');
        setGalleryToDelete(null);
        if (Array.isArray(data.items)) {
          setGalleryItems(data.items);
        } else {
          fetchGallery();
        }
        try {
          window.dispatchEvent(new Event('msi_gallery_sync'));
          window.dispatchEvent(new Event('storage'));
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'GALLERY_UPDATED' });
            bc.close();
          }
        } catch (_) {}
      } else {
        showToast(data.message || 'Failed to delete gallery item.');
      }
    } catch (err) {
      showToast('Network error while deleting gallery media.');
    }
  };

  // 6. Teacher Approval & Assignment
  const handleApproveTeacher = (teacherId: string) => {
    const updated = approveTeacherAction(teacherId);
    setTeachers(updated);
    showToast('Faculty member approved! Account is now active.');
  };

  const handleRejectTeacher = (teacherId: string) => {
    const updated = rejectTeacherAction(teacherId, 'Document verification pending by Dean of Academic Affairs.');
    setTeachers(updated);
    showToast('Faculty status marked as rejected.');
  };

  const handleSaveCourseAssignments = async () => {
    if (!assigningTeacher) return;
    const updated = assignCoursesToTeacherAction(assigningTeacher.id, teacherSelectedCourseIds);
    setTeachers(updated);
    const updatedCourses = getStoredCourses();
    setCourses(updatedCourses);

    const updatedTeacher = updated.find((t) => t.id === assigningTeacher.id);
    if (updatedTeacher) {
      try {
        await fetch('/api/admin/faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTeacher),
        });
      } catch (err) {
        console.warn('Failed to persist faculty course assignments to server disk:', err);
      }
    }

    // Also persist each updated course to disk so it has instructor assigned
    const assignedCoursesList = updatedCourses.filter((c) => teacherSelectedCourseIds.includes(c.id));
    for (const c of assignedCoursesList) {
      try {
        fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(c),
        }).catch(() => {});
      } catch (_) {}
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('msi_sync_channel');
      bc.postMessage({
        type: 'COURSE_ASSIGNED',
        teacherId: assigningTeacher.id,
        teacherEmail: assigningTeacher.email,
        teacherName: assigningTeacher.name,
        assignedCourseIds: teacherSelectedCourseIds,
      });
      bc.close();
    }
    window.dispatchEvent(new Event('msi_courses_sync'));
    window.dispatchEvent(new Event('storage'));

    setAssigningTeacher(null);
    showToast(`Courses assigned to ${assigningTeacher.name} successfully.`);
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) {
      showToast('Please provide faculty name and email.');
      return;
    }

    const tempPassword = newTeacherPassword.trim() || 'MSI@Faculty2026';
    const cleanEmail = newTeacherEmail.trim().toLowerCase();
    const cleanPhone = newTeacherPhone.trim() || '+91 98000 00000';

    setIsSubmittingTeacher(true);
    try {
      // 1. Persist to server disk data/teachers.json
      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeacherName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          specialization: newTeacherSpecialization.trim() || 'Constitutional Law & Jurisprudence',
          experienceYears: Number(newTeacherExp) || 8,
          password: tempPassword,
          temporaryPassword: tempPassword,
        }),
      });

      const data = await res.json();
      if (data.success && data.teacher) {
        unmarkTeacherDeletedLocally(data.teacher.id, data.teacher.email, data.teacher.phone);
        const current = getStoredTeachers();
        const updated = [
          data.teacher,
          ...current.filter((t) => t.id !== data.teacher.id && t.email.toLowerCase() !== cleanEmail),
        ];
        saveStoredTeachers(updated, false);
        setTeachers(updated);
        setShowAddTeacherModal(false);
        setNewTeacherName('');
        setNewTeacherEmail('');
        setNewTeacherPhone('');
        setCreatedFacultyCredentials({
          name: data.teacher.name,
          email: data.teacher.email,
          phone: data.teacher.phone,
          specialization: data.teacher.specialization,
          pass: tempPassword,
        });

        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('msi_sync_channel');
          bc.postMessage({ type: 'FACULTY_CREATED', teacherId: data.teacher.id });
          bc.close();
        }

        showToast(`Faculty member ${data.teacher.name} created! Authorized for immediate login.`);
      } else {
        showToast(data.message || 'Error saving faculty member.');
      }
    } catch (err) {
      showToast('Error saving faculty member.');
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    setIsDeletingTeacher(true);
    try {
      const idParam = encodeURIComponent(teacherToDelete.id || '');
      const emailParam = encodeURIComponent(teacherToDelete.email || '');
      const phoneParam = encodeURIComponent(teacherToDelete.phone || '');
      const res = await fetch(`/api/admin/faculty?id=${idParam}&email=${emailParam}&phone=${phoneParam}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        markTeacherDeletedLocally(teacherToDelete.id, teacherToDelete.email, teacherToDelete.phone);
        const remaining = deleteTeacherAction(teacherToDelete.id, teacherToDelete.email, teacherToDelete.phone);
        const finalList = data.teachers || remaining;
        setTeachers(finalList);
        saveStoredTeachers(finalList, false);

        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('msi_sync_channel');
          bc.postMessage({
            type: 'FACULTY_DELETED',
            teacherId: teacherToDelete.id,
            teacherEmail: teacherToDelete.email,
            teacherPhone: teacherToDelete.phone,
            teacherName: teacherToDelete.name,
          });
          bc.close();
        }

        showToast(`Faculty member (${teacherToDelete.name}) permanently removed from disk and session revoked.`);
        setTeacherToDelete(null);
      } else {
        showToast(data.message || 'Failed to delete faculty member.');
      }
    } catch (err) {
      showToast('Network error while deleting faculty member.');
    } finally {
      setIsDeletingTeacher(false);
    }
  };

  // 7. Create Course & Assign Faculty (LMS)
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      showToast('Please provide course program title.');
      return;
    }

    setIsSubmittingCourse(true);
    try {
      const assignedFaculty =
        teachers.find((t) => t.id === newCourseTeacherId) || teachers[0] || {
          id: 'fac-01',
          name: 'Dr. Ekta Gahlawat',
          designation: 'Professor of Law & Constitutional Jurist',
          avatarUrl: '/images/faculty/faculty-1.webp',
        };

      const courseId = `crs-msi-${Date.now().toString().slice(-6)}`;
      const slug = newCourseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newCourse: MSICourse = {
        id: courseId,
        slug,
        title: newCourseTitle.trim(),
        headline: newCourseHeadline.trim() || 'Comprehensive Curriculum & Judicial Practice',
        description: newCourseDesc.trim() || 'Official curriculum accredited by MSI Group of Institutes.',
        category: newCourseCategory,
        department: 'law',
        badge: 'Hot & New',
        rating: 5.0,
        reviewCount: 1,
        totalDuration: '40 hours',
        totalLectures: 1,
        level: newCourseLevel,
        thumbnail: newCourseThumbnail.trim() || '/images/courses/clat.jpg',
        price: Number(newCoursePrice) || 4999,
        originalPrice: Number(newCourseOriginalPrice) || 14999,
        isFreeForMsiStudents: true,
        instructorId: assignedFaculty.id,
        instructorName: assignedFaculty.name,
        instructorTitle: assignedFaculty.designation,
        instructorAvatar: assignedFaculty.avatarUrl,
        whatYouWillLearn: [
          'Mastery over ratio decidendi and obiter dicta distinctions',
          'Timed answer drafting drills and Bare Act interpretations',
          'Live judicial mentoring and doubt clearing',
        ],
        requirements: ['Dedication to daily legal study drills', 'No prior legal diploma required'],
        sections: [
          {
            id: `sec-${Date.now()}-1`,
            title: 'Module 1: Foundational Jurisprudence & Overview',
            duration: '3 hours',
            lectures: [
              {
                id: `lec-${Date.now()}-1`,
                title: newCourseLectureTitle.trim() || 'Orientation & Landmark Case Briefs',
                duration: '45 mins',
                durationSeconds: 2700,
                videoUrl: newCourseLectureVideo.trim() || 'https://vz-389201.b-cdn.net/sample.mp4',
                preview: true,
                summary: 'Initial recorded foundational orientation lecture for registered scholars.',
                resources: [
                  {
                    title: 'Official Lecture Handout & Landmark Briefs',
                    type: 'pdf',
                    size: '2.4 MB',
                    downloadUrl: '#',
                  },
                ],
              },
            ],
          },
        ],
        updatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        language: 'English & Bilingual Legal Notes',
        isPublished: true,
      };

      // Unmark local deletions for this id/slug
      unmarkCourseDeletedLocally(courseId);
      unmarkCourseDeletedLocally(slug);

      // 1. Persist to server disk data/courses.json
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      const data = await res.json();
      if (!data.success) {
        showToast(data.message || 'Error creating course on server disk.');
        return;
      }

      const serverCourses = data.courses || [newCourse, ...courses.filter((c) => c.id !== newCourse.id)];
      saveStoredCourses(serverCourses, false);
      setCourses(serverCourses);

      // 2. Auto-assign to faculty
      if (assignedFaculty) {
        const currentTeachers = getStoredTeachers();
        let targetUpdatedTeacher: TeacherApprovalRecord | null = null;
        const updatedTeachers = currentTeachers.map((t) => {
          if (t.id === assignedFaculty.id) {
            targetUpdatedTeacher = {
              ...t,
              assignedCourseIds: Array.from(new Set([...(t.assignedCourseIds || []), courseId])),
            };
            return targetUpdatedTeacher;
          }
          return t;
        });
        saveStoredTeachers(updatedTeachers, false);
        setTeachers(updatedTeachers);

        if (targetUpdatedTeacher) {
          try {
            await fetch('/api/admin/faculty', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(targetUpdatedTeacher),
            });
          } catch (err) {
            console.warn('Failed to sync faculty to server disk:', err);
          }
        }
      }

      setShowAddCourseModal(false);
      setNewCourseTitle('');
      setNewCourseHeadline('');
      setNewCourseDesc('');
      setNewCourseThumbnail('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80');
      setNewCourseThumbnailPreview(null);

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('msi_sync_channel');
        bc.postMessage({ type: 'COURSE_PUBLISHED', courseId: newCourse.id });
        bc.postMessage({ type: 'COURSE_CREATED', courseId: newCourse.id });
        bc.close();
      }
      try {
        window.dispatchEvent(new Event('msi_courses_sync'));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}

      showToast(`Course "${newCourse.title}" published and assigned to ${assignedFaculty.name}!`);
    } catch (err) {
      showToast('Error creating course program.');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  // 7b. Open Edit Course
  const handleOpenEditCourse = (crs: MSICourse) => {
    setCourseToEdit(crs);
    setEditCourseTitle(crs.title || '');
    setEditCourseHeadline(crs.headline || '');
    setEditCourseCategory(crs.category || 'Judiciary');
    setEditCourseLevel(crs.level || 'All Levels');
    setEditCoursePrice(String(crs.price || 4999));
    setEditCourseOriginalPrice(String(crs.originalPrice || 14999));
    setEditCourseTeacherId(crs.instructorId || (teachers[0]?.id || ''));
    setEditCourseDesc(crs.description || '');
    setEditCourseThumbnail(crs.thumbnail || '');
    setEditCourseBadge(crs.badge || 'Hot & New');
  };

  // 7c. Submit Course Update
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseToEdit || !editCourseTitle.trim()) {
      showToast('Course title is required.');
      return;
    }
    setIsSubmittingEditCourse(true);
    try {
      const assignedTeacher = teachers.find((t) => t.id === editCourseTeacherId) || {
        id: courseToEdit.instructorId,
        name: courseToEdit.instructorName,
        designation: courseToEdit.instructorTitle,
        avatarUrl: courseToEdit.instructorAvatar,
      };

      const updatedCourse: MSICourse = {
        ...courseToEdit,
        title: editCourseTitle.trim(),
        headline: editCourseHeadline.trim() || courseToEdit.headline,
        category: editCourseCategory,
        level: editCourseLevel,
        price: Number(editCoursePrice) || courseToEdit.price,
        originalPrice: Number(editCourseOriginalPrice) || courseToEdit.originalPrice,
        description: editCourseDesc.trim() || courseToEdit.description,
        thumbnail: editCourseThumbnail.trim() || courseToEdit.thumbnail,
        badge: (editCourseBadge as any) || undefined,
        instructorId: assignedTeacher.id,
        instructorName: assignedTeacher.name,
        instructorTitle: assignedTeacher.designation || 'Professor of Law',
        instructorAvatar: assignedTeacher.avatarUrl || '/images/avatars/avatar-1.webp',
        updatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };

      // 1. Persist to API
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourse),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || 'Error updating course.');
        return;
      }

      // 2. Update local storage & state
      const currentCourses = getStoredCourses();
      const updatedList = (data.courses || currentCourses).map((c: MSICourse) => (c.id === updatedCourse.id ? updatedCourse : c));
      saveStoredCourses(updatedList, false);
      setCourses(updatedList);

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('msi_sync_channel');
        bc.postMessage({ type: 'COURSE_PUBLISHED', courseId: updatedCourse.id });
        bc.close();
      }
      try {
        window.dispatchEvent(new Event('msi_courses_sync'));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}

      setCourseToEdit(null);
      showToast(`Course "${updatedCourse.title}" updated successfully.`);
    } catch (err) {
      showToast('Error updating course.');
    } finally {
      setIsSubmittingEditCourse(false);
    }
  };

  // 7d. Open Edit Faculty
  const handleOpenEditFaculty = (tc: TeacherApprovalRecord) => {
    setFacultyToEdit(tc);
    setEditFacultyName(tc.name || '');
    setEditFacultyEmail(tc.email || '');
    setEditFacultyPhone(tc.phone || '');
    setEditFacultySpecialization(tc.specialization || '');
    setEditFacultyDesignation(tc.designation || 'Professor of Law & Faculty Jurist');
    setEditFacultyDepartment(tc.department || 'School of Law & Judicial Studies');
    setEditFacultyExp(String(tc.experienceYears || 8));
    setEditFacultyPassword(tc.password || tc.temporaryPassword || 'Faculty@MSI2026');
  };

  // 7e. Submit Faculty Update
  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyToEdit || !editFacultyName.trim() || !editFacultyEmail.trim()) {
      showToast('Faculty name and email are required.');
      return;
    }
    setIsSubmittingEditFaculty(true);
    try {
      const updatedData = {
        ...facultyToEdit,
        name: editFacultyName.trim(),
        email: editFacultyEmail.trim().toLowerCase(),
        phone: editFacultyPhone.trim() || facultyToEdit.phone,
        specialization: editFacultySpecialization.trim() || facultyToEdit.specialization,
        designation: editFacultyDesignation.trim() || facultyToEdit.designation,
        department: editFacultyDepartment.trim() || facultyToEdit.department,
        experienceYears: Number(editFacultyExp) || facultyToEdit.experienceYears,
        password: editFacultyPassword.trim() || facultyToEdit.password,
        temporaryPassword: editFacultyPassword.trim() || facultyToEdit.temporaryPassword,
      };

      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success && data.teacher) {
        const currentTeachers = getStoredTeachers();
        const updatedList = currentTeachers.map((t) => (t.id === data.teacher.id ? data.teacher : t));
        saveStoredTeachers(updatedList, false);
        setTeachers(updatedList);
        setFacultyToEdit(null);
        showToast(`Faculty member "${data.teacher.name}" updated successfully.`);
        fetchFaculty();
      } else {
        showToast(data.message || 'Error updating faculty.');
      }
    } catch (err) {
      showToast('Error updating faculty member.');
    } finally {
      setIsSubmittingEditFaculty(false);
    }
  };

  // 7f. Open Edit Student
  const handleOpenEditStudent = (stu: RegisteredStudent) => {
    setStudentToEdit(stu);
    setEditStudentName(stu.name || '');
    setEditStudentPhone(stu.phone || '');
    setEditStudentStream(stu.stream || 'PCS-J Punjab Judicial Services');
    setEditStudentEmail(stu.email || '');
    setEditStudentPassword(stu.password || 'Student@MSI2026');
    const tFee = stu.totalFee ?? 0;
    const pFee = stu.paidFee ?? 0;
    const dFee = stu.dueFee ?? Math.max(0, tFee - pFee);
    setEditStudentTotalFee(String(tFee));
    setEditStudentPaidFee(String(pFee));
    setEditStudentDueFee(String(dFee));
    setEditStudentNextDueDate(stu.nextDueDate || '');
  };

  // 7g. Submit Student Update
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit || !editStudentName.trim() || !editStudentPhone.trim()) {
      showToast('Student name and mobile number are required.');
      return;
    }
    setIsSubmittingEditStudent(true);
    try {
      const totalNum = Number(editStudentTotalFee) || 0;
      const paidNum = Number(editStudentPaidFee) || 0;
      const dueNum = Number(editStudentDueFee) || Math.max(0, totalNum - paidNum);

      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: studentToEdit.id,
          phone: studentToEdit.phone,
          updates: {
            name: editStudentName.trim(),
            stream: editStudentStream.trim(),
            email: editStudentEmail.trim(),
            password: editStudentPassword.trim() || 'Student@MSI2026',
            totalFee: totalNum,
            paidFee: paidNum,
            dueFee: dueNum,
            nextDueDate: editStudentNextDueDate || '',
            profile: {
              name: editStudentName.trim(),
              courseTitle: editStudentStream.trim(),
              email: editStudentEmail.trim(),
              totalFee: totalNum,
              paidFee: paidNum,
              dueFee: dueNum,
              nextDueDate: editStudentNextDueDate || '',
            },
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Student "${editStudentName}" updated successfully.`);
        if (data.students && Array.isArray(data.students)) {
          setStudents(data.students);
        } else if (data.student) {
          setStudents((prev) =>
            prev.map((s) =>
              s.id === studentToEdit.id || (s.phone && s.phone.replace(/\D/g, '').slice(-10) === studentToEdit.phone.replace(/\D/g, '').slice(-10))
                ? { ...s, ...data.student }
                : s
            )
          );
        }
        setStudentToEdit(null);
        fetchStudents();
        try {
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      } else {
        showToast(data.message || 'Error updating student.');
      }
    } catch (err) {
      showToast('Network error while updating student.');
    } finally {
      setIsSubmittingEditStudent(false);
    }
  };

  // 7h. Open Edit Receptionist
  const handleOpenEditReceptionist = (rec: ReceptionistRecord) => {
    setReceptionistToEdit(rec);
    setEditReceptionistName(rec.name || '');
    setEditReceptionistPhone(rec.phone || '');
    setEditReceptionistEmail(rec.email || '');
    setEditReceptionistPassword(rec.password || 'Harshit@reception');
  };

  // 7i. Submit Receptionist Update
  const handleUpdateReceptionist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receptionistToEdit || !editReceptionistName.trim() || !editReceptionistPhone.trim()) {
      showToast('Receptionist name and mobile number are required.');
      return;
    }
    setIsSubmittingEditReceptionist(true);
    try {
      const res = await fetch('/api/admin/receptionists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: receptionistToEdit.id,
          name: editReceptionistName.trim(),
          phone: editReceptionistPhone.trim(),
          email: editReceptionistEmail.trim(),
          password: editReceptionistPassword.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Receptionist "${editReceptionistName}" updated successfully.`);
        setReceptionistToEdit(null);
        fetchReceptionists();
      } else {
        showToast(data.message || 'Error updating receptionist.');
      }
    } catch (err) {
      showToast('Network error while updating receptionist.');
    } finally {
      setIsSubmittingEditReceptionist(false);
    }
  };

  // ── Bulk Student Selection Handlers ──
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsBulkDeleting(true);

    const targetStudents = students.filter(
      (s) => selectedStudentIds.includes(s.id) || selectedStudentIds.includes(s.phone)
    );
    const countToDelete = targetStudents.length || selectedStudentIds.length;
    const idsToDelete = targetStudents.map((s) => s.id).filter(Boolean);
    const phonesToDelete = targetStudents.map((s) => (s.phone || '').replace(/\D/g, '').slice(-10)).filter(Boolean);

    // Fallback if targetStudents had no match
    const finalIds = idsToDelete.length > 0 ? idsToDelete : selectedStudentIds;

    // Optimistic UI update immediately
    setStudents((prev) =>
      prev.filter(
        (s) =>
          !selectedStudentIds.includes(s.id) &&
          !selectedStudentIds.includes(s.phone) &&
          !phonesToDelete.includes((s.phone || '').replace(/\D/g, '').slice(-10))
      )
    );

    try {
      const res = await fetch('/api/admin/students/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: finalIds, phones: phonesToDelete }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`${countToDelete} student account(s) permanently deleted.`);
        if (data.students && Array.isArray(data.students)) {
          setStudents(data.students);
        }
      } else {
        showToast(data.message || 'Error during bulk deletion.');
        fetchStudents();
      }
    } catch (err) {
      showToast('Network error while performing bulk deletion.');
      fetchStudents();
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
      setSelectedStudentIds([]);
    }
  };

  // ── Manual Invoice Creation Handlers ──
  const handleOpenCreateInvoiceModal = (targetStudent?: RegisteredStudent) => {
    const defaultInvNo = `INV-MSI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}/${month}/${year}`;

    setInvInvoiceNo(defaultInvNo);
    setInvDate(formattedToday);
    setInvPaymentMode('ONLINE / UPI');
    setInvRemarks('');
    setInvSyncStudentLedger(true);

    if (targetStudent) {
      setInvStudentMode('existing');
      setInvStudentId(targetStudent.id);
      setInvStudentName(targetStudent.name || '');
      setInvStudentPhone(targetStudent.phone || '');
      setInvStudentEmail(targetStudent.email || '');
      setInvCourseTitle(targetStudent.stream || 'PCS-J Punjab Judicial Services');
      setInvStudentAddress(targetStudent.profile?.address || '#3007 GTB NAGAR, Kharar, Punjab - 140301');
      setInvStudentGuardian(targetStudent.profile?.guardianName || '');
      setInvAmount(String(targetStudent.dueFee && targetStudent.dueFee > 0 ? targetStudent.dueFee : (targetStudent.totalFee || 20000)));
      setInvDescription(`${targetStudent.stream || 'Judicial Services'} Course Fee`);
    } else if (students.length > 0) {
      setInvStudentMode('existing');
      const firstStu = students[0];
      setInvStudentId(firstStu.id);
      setInvStudentName(firstStu.name || '');
      setInvStudentPhone(firstStu.phone || '');
      setInvStudentEmail(firstStu.email || '');
      setInvCourseTitle(firstStu.stream || 'PCS-J Punjab Judicial Services');
      setInvStudentAddress(firstStu.profile?.address || '#3007 GTB NAGAR, Kharar, Punjab - 140301');
      setInvStudentGuardian(firstStu.profile?.guardianName || '');
      setInvAmount(String(firstStu.dueFee && firstStu.dueFee > 0 ? firstStu.dueFee : (firstStu.totalFee || 20000)));
      setInvDescription(`${firstStu.stream || 'Judicial Services'} Course Fee`);
    } else {
      setInvStudentMode('custom');
      setInvStudentId('');
      setInvStudentName('');
      setInvStudentPhone('');
      setInvStudentEmail('');
      setInvCourseTitle('PCS-J Punjab Judicial Services');
      setInvStudentAddress('#3007 GTB NAGAR, Kharar, Punjab - 140301');
      setInvStudentGuardian('');
      setInvAmount('20000');
      setInvDescription('Course Tuition & Academic Training Fee');
    }

    setShowCreateInvoiceModal(true);
  };

  const handleSelectInvoiceStudent = (stuId: string) => {
    setInvStudentId(stuId);
    const found = students.find((s) => s.id === stuId);
    if (found) {
      setInvStudentName(found.name || '');
      setInvStudentPhone(found.phone || '');
      setInvStudentEmail(found.email || '');
      setInvCourseTitle(found.stream || 'PCS-J Punjab Judicial Services');
      setInvStudentAddress(found.profile?.address || '#3007 GTB NAGAR, Kharar, Punjab - 140301');
      setInvStudentGuardian(found.profile?.guardianName || '');
      setInvAmount(String(found.dueFee && found.dueFee > 0 ? found.dueFee : (found.totalFee || 20000)));
      setInvDescription(`${found.stream || 'Judicial Services'} Course Fee`);
    }
  };

  const handleCreateManualInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invStudentName.trim() || !invAmount || Number(invAmount) <= 0) {
      showToast('Student name and a valid amount are required.');
      return;
    }

    setIsSubmittingManualInvoice(true);
    try {
      const netAmountNum = Number(invAmount);
      const taxableNum = Number((netAmountNum / 1.18).toFixed(2));
      const gstTotal = Number((netAmountNum - taxableNum).toFixed(2));
      const halfGst = Number((gstTotal / 2).toFixed(2));
      const cleanPhone = (invStudentPhone || '').replace(/\D/g, '').slice(-10);

      let buyerDisplay = invStudentName.toUpperCase();
      if (invStudentGuardian) {
        buyerDisplay += ` D/O ${invStudentGuardian.toUpperCase()}`;
      }
      if (invCourseTitle) {
        buyerDisplay += ` ${invCourseTitle.toUpperCase()}`;
      }

      const invNumberResolved = invInvoiceNo.trim() || `INV-MSI-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const invoiceDataPayload = {
        gstin: '03AEQPE9376K2ZY',
        pan: 'AEQPE9376K',
        instituteName: 'MSI GROUP OF INSTITUTE',
        instituteAddress: 'MONGA CITY CENTRE, KHARAR LANDRAN ROAD, SEC-115, MOHALI, PUNJAB, 140301',
        contact: '7508420013,',
        invoiceNo: invNumberResolved,
        invoiceDate: invDate || new Date().toLocaleDateString('en-IN'),
        placeOfSupply: '03-PUNJAB',
        modeOfSupply: invPaymentMode,
        soldToName: buyerDisplay,
        addressLine1: invStudentAddress || '#3007 GTB NAGAR',
        addressLine2: 'Khrar , PUNJAB- 140301',
        buyerGst: '',
        buyerPhone: cleanPhone || '9463113195',
        remarks: invRemarks,
        items: [
          {
            id: '1',
            description: invDescription || invCourseTitle || 'Course Tuition Fee',
            hsn: '999293',
            qty: '1PCS',
            mrp: '0.00',
            ntRate: netAmountNum.toFixed(2),
            txRate: taxableNum.toFixed(2),
            disc: '',
            gstRate: '18%',
            amount: taxableNum.toFixed(2),
          },
        ],
        totalTaxable: taxableNum.toFixed(2),
        totalPcs: '1',
        totalAmount: taxableNum.toFixed(2),
        taxGstRate: '18',
        taxTaxable: taxableNum.toFixed(2),
        taxSgst: halfGst.toFixed(2),
        taxCgst: halfGst.toFixed(2),
        taxIgst: '0',
        taxCess: '0',
        tcs: '0.00',
        labour: '0.00',
        freight: '0.00',
        rndOff: '0.00',
        discount: '0.00',
        inWords: numberToWords(netAmountNum),
        netAmount: netAmountNum.toFixed(2),
        terms: [
          'ALL DISPUTES ARE SUBJECT TO CHANDIGARH JURISDICTION ONLY',
          'GOODS ONCE SOLD ARE NOT RETURNABLE .',
          'OUR RESPONSIBILTY CEASES THE MOMENT GOODS LEAVES OUR PREMISES.',
          '18% P.A. INTEREST WILL BE CHARGED IF BILL IS NOT PAID WITHIN 15 DAYS/DUE DATE.',
        ],
        bankName: 'AXIS BANK',
        bankAccount: '925020020559054',
        bankIfsc: 'UTIB00004866',
      };

      const now = new Date();
      const timeStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // 1. Post to Transactions API
      const txnRes = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `#INV-${invNumberResolved.replace(/\D/g, '').slice(-5) || Math.floor(10000 + Math.random() * 90000)}`,
          receiptNumber: invNumberResolved,
          studentName: invStudentName.trim(),
          studentPhone: cleanPhone ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : '',
          courseId: 'manual-invoice',
          courseTitle: invCourseTitle,
          amount: netAmountNum,
          paymentMethod: invPaymentMode,
          status: 'Success',
          timestamp: timeStr,
          remarks: invRemarks,
          invoiceData: invoiceDataPayload,
        }),
      });

      const txnData = await txnRes.json();

      // 2. If Ledger Sync is enabled, update student fee balance
      if (invSyncStudentLedger) {
        const targetStudent = students.find(
          (s) => s.id === invStudentId || (cleanPhone && s.phone.replace(/\D/g, '').slice(-10) === cleanPhone)
        );
        if (targetStudent) {
          const newPaid = (targetStudent.paidFee || 0) + netAmountNum;
          const currentTotal = targetStudent.totalFee || (targetStudent.paidFee || 0) + netAmountNum;
          const newDue = Math.max(0, currentTotal - newPaid);

          await fetch('/api/admin/students', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: targetStudent.id,
              phone: targetStudent.phone,
              updates: {
                paidFee: newPaid,
                dueFee: newDue,
              },
            }),
          }).catch(() => {});
        }
      }

      showToast(`Tax Invoice #${invNumberResolved} successfully created!`);
      setShowCreateInvoiceModal(false);
      fetchTransactions();
      fetchStudents();

      // Open receipt view with allowEdit=true
      const createdTxn = txnData.transaction || {
        id: `#INV-${invNumberResolved}`,
        receiptNumber: invNumberResolved,
        studentName: invStudentName.trim(),
        studentPhone: cleanPhone,
        courseTitle: invCourseTitle,
        amount: netAmountNum,
        paymentMethod: invPaymentMode,
        timestamp: timeStr,
        invoiceData: invoiceDataPayload,
      };
      setSelectedTxnForReceipt(createdTxn as any);
    } catch (err) {
      showToast('Network error while generating invoice.');
    } finally {
      setIsSubmittingManualInvoice(false);
    }
  };

  // 7j. Submit Collected Fee Payment
  const handleRecordFeePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForCollectFee || !collectFeeAmount || Number(collectFeeAmount) <= 0) {
      showToast('Please specify a valid payment amount.');
      return;
    }

    const payAmt = Number(collectFeeAmount);
    setIsSubmittingCollectFee(true);

    try {
      const cleanPhone = (studentForCollectFee.phone || '').replace(/\D/g, '').slice(-10);
      const currentTotal = studentForCollectFee.totalFee ?? payAmt;
      const currentPaid = (studentForCollectFee.paidFee ?? 0) + payAmt;
      const currentDue = Math.max(0, currentTotal - currentPaid);

      // 1. Update Student Ledger in database
      const stuRes = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          updates: {
            totalFee: currentTotal,
            paidFee: currentPaid,
            dueFee: currentDue,
          },
        }),
      });

      // 2. Record Transaction in Ledger
      const invoiceNo = `INV-MSI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const txnRes = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentForCollectFee.name,
          studentPhone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
          courseId: 'fee-settlement',
          courseTitle: studentForCollectFee.stream || 'Institutional Fee Settlement',
          amount: payAmt,
          paymentMethod: `Direct Cash / ${collectFeePaymentMethod}`,
          orderId: `rec_${Date.now().toString().slice(-8)}`,
          status: 'captured',
          receiptNumber: invoiceNo,
          timestamp: timeStr,
        }),
      });

      const txnData = await txnRes.json();
      showToast(`Fee payment of ₹${payAmt.toLocaleString('en-IN')} recorded for ${studentForCollectFee.name}!`);
      
      const newTxnObj = txnData.transaction || {
        id: `#TXN-${Date.now().toString().slice(-5)}`,
        studentName: studentForCollectFee.name,
        studentPhone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        courseTitle: studentForCollectFee.stream || 'Institutional Fee Settlement',
        amount: payAmt,
        paymentMethod: `Direct Cash / ${collectFeePaymentMethod}`,
        status: 'captured',
        receiptNumber: invoiceNo,
        timestamp: timeStr,
      };

      setStudentForCollectFee(null);
      setCollectFeeAmount('');
      fetchStudents();
      fetchTransactions();

      // Open authentic non-editable receipt immediately
      setSelectedTxnForReceipt(newTxnObj as any);
    } catch (err) {
      showToast('Network error while recording fee payment.');
    } finally {
      setIsSubmittingCollectFee(false);
    }
  };

  // 8. Add Lecture to existing Course
  const handleAddLectureToCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLecture || !newLectureTitle.trim()) {
      showToast('Please specify lecture title.');
      return;
    }

    setIsSubmittingLecture(true);
    try {
      const currentCourses = getStoredCourses();
      let updatedTargetCourse: MSICourse | null = null;
      const updatedCourses = currentCourses.map((crs) => {
        if (crs.id === selectedCourseForLecture.id) {
          const sections =
            crs.sections && crs.sections.length > 0
              ? [...crs.sections]
              : [
                  {
                    id: `sec-${Date.now()}`,
                    title: 'Module 1: Core Curriculum & Recorded Lectures',
                    duration: '2 hours',
                    lectures: [],
                  },
                ];

          const newLec: MSILecture = {
            id: `lec-${Date.now()}`,
            title: newLectureTitle.trim(),
            duration: newLectureDuration.trim() || '45 mins',
            durationSeconds: 2700,
            videoUrl: newLectureVideoUrl.trim() || 'https://vz-389201.b-cdn.net/sample.mp4',
            preview: false,
            summary: newLectureSummary.trim() || 'Classroom recording with case law analysis.',
            resources: [
              {
                title: `${newLectureTitle.trim()} Notes & Bare Act Handout`,
                type: 'pdf',
                size: '1.8 MB',
                downloadUrl: '#',
              },
            ],
          };

          sections[0].lectures.push(newLec);
          const totalLecs = sections.reduce((acc, s) => acc + s.lectures.length, 0);

          updatedTargetCourse = {
            ...crs,
            sections,
            totalLectures: totalLecs,
            updatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          };
          return updatedTargetCourse;
        }
        return crs;
      });

      if (updatedTargetCourse) {
        try {
          await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTargetCourse),
          });
        } catch (err) {
          console.warn('Failed to sync added lecture to server disk:', err);
        }
      }

      saveStoredCourses(updatedCourses, false);
      setCourses(updatedCourses);

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('msi_sync_channel');
        bc.postMessage({ type: 'COURSE_PUBLISHED', courseId: selectedCourseForLecture.id });
        bc.close();
      }
      try {
        window.dispatchEvent(new Event('msi_courses_sync'));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}

      setSelectedCourseForLecture(null);
      setNewLectureTitle('');
      setNewLectureVideoUrl('');
      setNewLectureSummary('');
      showToast(`Recorded lecture added to ${selectedCourseForLecture.title}!`);
    } catch (err) {
      showToast('Error adding recorded lecture.');
    } finally {
      setIsSubmittingLecture(false);
    }
  };

  // 8b. Assign Faculty to Course
  const handleAssignCourseToFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForFacultyAssign) return;

    const identifier = assignFacultyCustomName.trim() || assignFacultyTargetTeacherId;
    if (!identifier) {
      showToast('Please select or specify a faculty member.');
      return;
    }

    setIsSubmittingFacultyAssign(true);
    try {
      const res = assignCourseToFacultyAction(
        selectedCourseForFacultyAssign.id,
        identifier,
        assignFacultyAutoEnroll
      );

      if (res) {
        saveStoredCourses(getStoredCourses(), false);
        saveStoredTeachers(getStoredTeachers(), false);
        setCourses(getStoredCourses());
        setTeachers(getStoredTeachers());

        // Sync updated course & faculty to server disk
        const assignedCourse =
          res.updatedCourses.find((c) => c.id === selectedCourseForFacultyAssign.id) ||
          selectedCourseForFacultyAssign;

        try {
          await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignedCourse),
          });

          await fetch('/api/admin/faculty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(res.teacher),
          });

          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'COURSE_ASSIGNED', courseId: assignedCourse.id, teacherId: res.teacher.id });
            bc.close();
          }
          window.dispatchEvent(new Event('msi_courses_sync'));
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}

        showToast(
          `Course "${selectedCourseForFacultyAssign.title}" successfully assigned to ${res.teacher.name}! Enrolled students now have immediate access.`
        );
        setSelectedCourseForFacultyAssign(null);
        setAssignFacultyCustomName('');
      } else {
        showToast(`Faculty member "${identifier}" not found in roster.`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error assigning course to faculty.');
    } finally {
      setIsSubmittingFacultyAssign(false);
    }
  };

  // 8c. Delete Course Program
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeletingCourse(true);
    try {
      const res = await fetch(`/api/courses?id=${encodeURIComponent(courseToDelete.id)}`, {
        method: 'DELETE',
      });
      // Also cleanup enrollments for this course
      fetch(`/api/admin/enrollments?courseId=${encodeURIComponent(courseToDelete.id)}`, {
        method: 'DELETE',
      }).catch(() => {});

      const data = await res.json();
      if (data.success) {
        markCourseDeletedLocally(courseToDelete.id);
        if (courseToDelete.slug) markCourseDeletedLocally(courseToDelete.slug);
        const remaining = deleteCourseAction(courseToDelete.id);
        const finalCourses = data.courses || remaining;
        saveStoredCourses(finalCourses, false);
        setCourses(finalCourses);

        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('msi_sync_channel');
          bc.postMessage({
            type: 'COURSE_DELETED',
            courseId: courseToDelete.id,
            courseSlug: courseToDelete.slug,
          });
          bc.close();
        }
        try {
          window.dispatchEvent(new Event('msi_courses_sync'));
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}

        showToast(`Course "${courseToDelete.title}" removed permanently from public website and server disk.`);
        setCourseToDelete(null);
      } else {
        showToast(data.message || 'Failed to delete course.');
      }
    } catch (err) {
      showToast('Network error while deleting course.');
    } finally {
      setIsDeletingCourse(false);
    }
  };


  // â”€â”€ Filtered Search Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.stream.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.mobile.includes(q) ||
        l.targetCourse.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  // â”€â”€ Render Gatekeeper if Unauthenticated â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFF9EF] flex flex-col justify-between selection:bg-[#EFC988] selection:text-[#89190E] relative overflow-hidden">
        {/* Decorative architectural background */}
        <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#89190E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#EFC988]/20 rounded-full blur-3xl pointer-events-none" />

        <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 transition-transform group-hover:scale-105">
              <Image
                src="/images/msi-crest.png"
                alt="MSI Crest"
                fill
                sizes="44px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#10233F] block leading-none">
                MSI GROUP
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#89190E]">
                Super Admin Terminal
              </span>
            </div>
          </Link>
          <Link
            href="/student/login"
            className="text-xs font-semibold text-[#89190E] hover:underline flex items-center gap-1"
          >
            <span>Student & Reception Login</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-[#E8DCCB] shadow-[0_20px_50px_rgba(16,35,63,0.1)] p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#89190E] via-[#EFC988] to-[#10233F]" />

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF3DD] text-[#89190E] border border-[#EFC988]/60 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#89190E] font-bold block mb-1">
                Clearance Level 1
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#10233F]">
                Super Admin Master Portal
              </h1>
              <p className="text-xs text-[#526174] mt-1">
                Enter authorized credentials for full institutional governance
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                  Authorized Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="9792303434"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="MSI@superadmin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full mt-2 py-3 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Clearance...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Master Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#E8DCCB]/60 text-center text-[11px] text-[#526174]">
              Protected by SHA-256 session encryption • MSI Institutional Server
            </div>
          </div>
        </main>
      </div>
    );
  }

  // â”€â”€ Render Authenticated Master Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#071B37] antialiased flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10233F] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#EFC988]/50 flex items-center gap-3 text-xs sm:text-sm font-semibold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#EFC988] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* â”€â”€ Fixed Sidebar (Matching code.html design) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white z-50 flex flex-col border-r border-[#E8EEFF] shadow-[0_1px_8px_rgba(0,0,0,0.04)] select-none">
        {/* Brand header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#89190E] flex items-center justify-center shrink-0 shadow-sm text-white font-serif font-black text-sm tracking-wider">
            MSI
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif font-bold text-sm text-[#89190E] tracking-tight truncate leading-tight">
              MSI GROUP
            </div>
            <div className="text-[11px] text-[#58413D] uppercase font-semibold tracking-wider">
              Admin Portal
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#EFC988] shrink-0 animate-pulse" />
        </div>

        <div className="h-px bg-[#E8EEFF] mx-4 mb-2" />

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4 py-2 text-xs font-semibold">
          {/* Overview */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#8C716C] font-bold">
              Overview
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#E8EEFF] text-[#89190E] font-bold shadow-xs'
                  : 'text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="truncate">Executive Dashboard</span>
            </button>
          </div>

          {/* User Management */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#8C716C] font-bold">
              User Management
            </div>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-[#E8EEFF] text-[#89190E] font-bold shadow-xs'
                  : 'text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span className="truncate">Registered Students</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#89190E]/10 text-[#89190E] text-[10px] font-bold">
                {students.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'teachers'
                  ? 'bg-[#E8EEFF] text-[#89190E] font-bold shadow-xs'
                  : 'text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">Teachers & Faculty</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#10233F]/10 text-[#10233F] text-[10px] font-bold">
                {teachers.length}
              </span>
            </button>
          </div>

          {/* Lead CRM & Reception */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#8C716C] font-bold">
              Reception & Intake
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-[#E8EEFF] text-[#89190E] font-bold shadow-xs'
                  : 'text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <PhoneCall className="w-4 h-4 shrink-0" />
                <span className="truncate">Lead CRM Register</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {leads.length}
              </span>
            </button>
            <Link
              href="/reception/dashboard"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FolderOpen className="w-4 h-4 shrink-0 text-[#89190E]" />
                <span className="truncate">Live Reception Desk</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
            </Link>
          </div>

          {/* Academic Management */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#8C716C] font-bold">
              Academic Management
            </div>
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-[#E8EEFF] text-[#89190E] font-bold shadow-xs'
                  : 'text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="truncate">Courses & LMS</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {courses.length}
              </span>
            </button>
          </div>

          {/* Content & Website Portal */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#8C716C] font-bold">
              Website CMS
            </div>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#E8EEFF] text-[#89190E] font-bold shadow-xs'
                  : 'text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">Website Gallery Sync</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                {galleryItems.length}
              </span>
            </button>
            <Link
              href="/gallery"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ArrowUpRight className="w-4 h-4 shrink-0 text-[#89190E]" />
                <span className="truncate">Open Public /gallery</span>
              </div>
            </Link>
          </div>

          {/* Finance & Transactions */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#8C716C] font-bold">
              Finance
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-[#E8EEFF] text-[#89190E] font-bold shadow-xs'
                  : 'text-[#58413D] hover:bg-[#F0F3FF] hover:text-[#071B37]'
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span className="truncate">Transactions & Receipts</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 bg-[#F0F3FF]/70 border-t border-[#E8EEFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#89190E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#071B37] truncate">
                MSI Administrator
              </div>
              <div className="text-[10px] text-[#89190E] font-bold uppercase truncate">
                Super Admin
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
              title="Logout from Super Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* â”€â”€ Main View Container â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="pl-[260px] flex-1 flex flex-col min-w-0">
        {/* Fixed Top Header (Matching code.html design) */}
        <header className="sticky top-0 h-16 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6 border-b border-[#E8EEFF]">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="flex items-center gap-1.5 text-xs text-[#58413D]">
              <span className="hover:text-[#89190E] cursor-pointer">MSI</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#071B37] font-bold capitalize">{activeTab}</span>
            </div>

            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real students, leads, faculty, courses..."
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#F0F3FF] text-xs text-[#071B37] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#89190E]/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#58413D] font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#EFC988]" />
              <span>{currentDateTime}</span>
            </div>

            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-gray-600 hover:bg-[#F0F3FF] hover:text-[#071B37] transition-all cursor-pointer"
              title="Refresh all data directly from disk"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#89190E]' : ''}`} />
            </button>

            <div className="h-5 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Production Server Synced</span>
              </span>
            </div>
          </div>
        </header>

        {/* â”€â”€ Tab Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <main className="p-6 sm:p-8 space-y-6">
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 1. Welcome & Primary Command Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[#89190E] text-[11px] font-bold uppercase tracking-widest mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#89190E]" />
                    Administrative Clearance Level 1
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-[#071B37]">
                    Good Morning, Administrator
                  </h1>
                  <p className="text-xs text-[#58413D] mt-0.5">
                    Live operational overview for MSI Group of Institutes • All data synced with permanent storage
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Student</span>
                  </button>
                  <button
                    onClick={() => setShowAddLeadModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10233F] hover:bg-[#1a3860] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#EFC988]" />
                    <span>+ Generate Lead</span>
                  </button>
                  <button
                    onClick={() => setShowAddTeacherModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F0F3FF] text-[#071B37] border border-[#E8EEFF] text-xs font-bold transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#89190E]" />
                    <span>+ Create Teacher</span>
                  </button>
                </div>
              </div>

              {/* 2. Rapid Operational Dispatches (8 Action Strip from code.html) */}
              <section className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="uppercase tracking-wider font-bold text-[#8C716C] text-[10px]">
                    Rapid Operational Dispatches
                  </span>
                  <span className="text-[#58413D] text-[11px] font-semibold">
                    8 Authorized Actions
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#F0F3FF] hover:bg-[#E8EEFF] transition-all text-center cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#89190E] mb-1.5 shadow-2xs group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#071B37]">Add Student</span>
                  </button>

                  <button
                    onClick={() => setShowAddLeadModal(true)}
                    className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#F0F3FF] hover:bg-[#E8EEFF] transition-all text-center cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#89190E] mb-1.5 shadow-2xs group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#071B37]">Dispatch Lead</span>
                  </button>

                  <button
                    onClick={() => setShowAddTeacherModal(true)}
                    className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#F0F3FF] hover:bg-[#E8EEFF] transition-all text-center cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#89190E] mb-1.5 shadow-2xs group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#071B37]">Create Teacher</span>
                  </button>

                  <button
                    onClick={() => setShowAddGalleryModal(true)}
                    className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#F0F3FF] hover:bg-[#E8EEFF] transition-all text-center cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#89190E] mb-1.5 shadow-2xs group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#071B37]">Gallery Media</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('courses')}
                    className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#F0F3FF] hover:bg-[#E8EEFF] transition-all text-center cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#89190E] mb-1.5 shadow-2xs group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#071B37]">Courses & LMS</span>
                  </button>

                  <Link
                    href="/reception/dashboard"
                    target="_blank"
                    className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#F0F3FF] hover:bg-[#E8EEFF] transition-all text-center cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#89190E] mb-1.5 shadow-2xs group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#071B37]">Reception Desk</span>
                  </Link>

                  <Link
                    href="/live-stream"
                    target="_blank"
                    className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#F0F3FF] hover:bg-[#E8EEFF] transition-all text-center cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#89190E] mb-1.5 shadow-2xs group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <Video className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#071B37]">Live Class</span>
                  </Link>

                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#F0F3FF] hover:bg-[#E8EEFF] transition-all text-center cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#89190E] mb-1.5 shadow-2xs group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#071B37]">Reconcile Fees</span>
                  </button>
                </div>
              </section>

              {/* 3. Executive Overview: 6 Compact KPI Cards (from code.html) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Students KPI */}
                <div
                  onClick={() => setActiveTab('students')}
                  className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C716C]">
                      Real Students
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] flex items-center justify-center text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-bold text-[#071B37]">
                      {students.length}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>Verified Disk Accounts</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-[#58413D] truncate border-t border-gray-100 pt-1.5">
                    {students.length > 0 ? `${students.length} Verified Student Account${students.length > 1 ? "s" : ""}` : "No Students Enrolled"}
                  </div>
                </div>

                {/* Teachers KPI */}
                <div
                  onClick={() => setActiveTab('teachers')}
                  className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C716C]">
                      Faculty
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] flex items-center justify-center text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-bold text-[#071B37]">
                      {teachers.length}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold mt-0.5">
                      <Check className="w-3 h-3" />
                      <span>100% Certified Jurists</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-[#58413D] truncate border-t border-gray-100 pt-1.5">
                    Judicial Coaching Mentors
                  </div>
                </div>

                {/* Courses KPI */}
                <div
                  onClick={() => setActiveTab('courses')}
                  className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C716C]">
                      Courses
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] flex items-center justify-center text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-bold text-[#071B37]">
                      {courses.length}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#89190E] font-bold mt-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>CLAT • Judiciary • NET</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-[#58413D] truncate border-t border-gray-100 pt-1.5">
                    Syllabus published
                  </div>
                </div>

                {/* Leads KPI */}
                <div
                  onClick={() => setActiveTab('leads')}
                  className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C716C]">
                      CRM Leads
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] flex items-center justify-center text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-bold text-[#071B37]">
                      {leads.length}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Two-Way Desk Synced</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-[#58413D] truncate border-t border-gray-100 pt-1.5">
                    Reception Queue Active
                  </div>
                </div>

                {/* Revenue MTD KPI */}
                <div
                  onClick={() => setActiveTab('transactions')}
                  className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C716C]">
                      Revenue MTD
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] flex items-center justify-center text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-bold text-[#89190E]">
                      {totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(2)}L` : "₹0"}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Audited & Verified</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-[#58413D] truncate border-t border-gray-100 pt-1.5">
                    Admissions Fee Receipts
                  </div>
                </div>

                {/* Gallery Media KPI */}
                <div
                  onClick={() => setActiveTab('gallery')}
                  className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C716C]">
                      Website Media
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#E8EEFF] flex items-center justify-center text-[#89190E] group-hover:bg-[#89190E] group-hover:text-white transition-colors">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-bold text-[#071B37]">
                      {galleryItems.length}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-purple-600 font-bold mt-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Live on /gallery</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-[#58413D] truncate border-t border-gray-100 pt-1.5">
                    Campus photographs
                  </div>
                </div>
              </section>

              {/* 4. Analytics Grid: Enrollment Trends (SVG from code.html) & Razorpay Split */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Enrollment Trends Chart */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#071B37]">
                        Enrollment Trends & Intake Curve
                      </h2>
                      <p className="text-xs text-[#58413D]">
                        Admissions distribution (May - Oct 2026) across Judiciary & CLAT cohorts
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#F0F3FF] text-[11px] font-bold text-[#89190E]">
                      Monthly Cohorts
                    </span>
                  </div>

                  {/* SVG Chart from code.html */}
                  <div className="w-full h-52 relative flex items-end pt-4 pb-2">
                    <svg
                      className="w-full h-full overflow-visible"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 540 180"
                    >
                      <line x1="0" y1="180" x2="540" y2="180" stroke="#E8EEFF" strokeWidth="1" />
                      <line x1="0" y1="135" x2="540" y2="135" stroke="#E8EEFF" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="0" y1="90" x2="540" y2="90" stroke="#E8EEFF" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="0" y1="45" x2="540" y2="45" stroke="#E8EEFF" strokeDasharray="4 4" strokeWidth="1" />
                      {/* Area & Stroke (Crimson) */}
                      <path
                        d="M 30 150 C 90 140, 140 110, 210 95 C 280 80, 350 40, 420 30 C 470 24, 510 18, 510 18"
                        stroke="#89190E"
                        strokeWidth="3"
                        fill="none"
                      />
                      <polygon
                        points="30,150 210,95 420,30 510,18 510,180 30,180"
                        fill="rgba(137,25,14,0.08)"
                      />
                      {/* Judiciary (Gold) */}
                      <path
                        d="M 30 165 C 90 155, 140 135, 210 120 C 280 110, 350 75, 420 65 C 470 60, 510 52, 510 52"
                        stroke="#B8860B"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        fill="none"
                      />
                      <circle cx="30" cy="150" r="4" fill="#FFFFFF" stroke="#89190E" strokeWidth="2" />
                      <circle cx="210" cy="95" r="4" fill="#FFFFFF" stroke="#89190E" strokeWidth="2" />
                      <circle cx="420" cy="30" r="4" fill="#FFFFFF" stroke="#89190E" strokeWidth="2" />
                      <circle cx="510" cy="18" r="5" fill="#89190E" stroke="#FFFFFF" strokeWidth="2" />
                    </svg>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-[#8C716C] pt-2 border-t border-gray-100">
                    <span>MAY</span>
                    <span>JUN</span>
                    <span>JUL</span>
                    <span>AUG</span>
                    <span>SEP</span>
                    <span className="font-bold text-[#89190E]">OCT 2026 (PEAK)</span>
                  </div>

                  <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 bg-[#F0F3FF]/70 p-3 rounded-xl text-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-semibold text-[#071B37]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#89190E]" />
                        Judiciary Foundation (58%)
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-[#071B37]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />
                        CLAT 2-Year (29%)
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-[#58413D]">
                      Conversion Rate: <strong className="text-emerald-700">31.4%</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Revenue Breakdown & Razorpay Settlement */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#071B37]">
                          Revenue Overview
                        </h2>
                        <p className="text-xs text-[#58413D]">
                          Institutional Admissions Reconciliation
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                        98.4% Success
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3.5 rounded-xl bg-[#F0F3FF]">
                        <span className="text-[10px] uppercase font-bold text-[#8C716C] block">
                          Captured Fees
                        </span>
                        <div className="font-serif text-xl font-bold text-[#89190E] mt-0.5">
                          {totalRevenue > 0 ? `₹${totalRevenue.toLocaleString("en-IN")}` : "₹0"}
                        </div>
                        <span className="text-[10px] text-gray-500">{transactions.length} settled order{transactions.length === 1 ? "" : "s"}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#F0F3FF]">
                        <span className="text-[10px] uppercase font-bold text-[#8C716C] block">
                          Avg Order Value
                        </span>
                        <div className="font-serif text-xl font-bold text-[#071B37] mt-0.5">
                          {transactions.length > 0 ? `₹${Math.round(totalRevenue / transactions.length).toLocaleString("en-IN")}` : "₹0"}
                        </div>
                        <span className="text-[10px] text-gray-500">Across legal batches</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-[#071B37]">
                        <span>Payment Channels</span>
                        <span className="text-[#58413D] font-normal text-[11px]">Instant UPI</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-100 flex overflow-hidden">
                        <div className="bg-[#89190E] h-full" style={{ width: '60%' }} title="UPI: 60%" />
                        <div className="bg-[#B8860B] h-full" style={{ width: '25%' }} title="NetBanking: 25%" />
                        <div className="bg-[#10233F] h-full" style={{ width: '15%' }} title="Cards: 15%" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#58413D]">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#89190E]" /> UPI: 60%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#B8860B]" /> NetBanking: 25%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#10233F]" /> Cards: 15%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-gray-500">
                      Merchant: <code className="text-[#89190E]">RZP_MSI_LIVE_9021</code>
                    </span>
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="text-[#89190E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Receipts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>

              {/* 5. Today's Live Operations Cards (from code.html) */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Live Classes Monitor */}
                <div className="bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#89190E]" />
                        <h3 className="font-serif text-base font-bold text-[#071B37]">
                          Live Sessions Today
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#89190E] text-[10px] font-bold animate-pulse">
                        â— 1 In Progress
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-[#F0F3FF] flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#89190E] text-white text-[9px] font-bold">
                              LIVE
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">Room A</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#071B37] truncate">
                            Judiciary CrPC Procedural Law Masterclass
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Dr. Ekta Gahlawat • 48 Active Scholars
                          </p>
                        </div>
                        <Link
                          href="/live-stream"
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-[#89190E] text-white text-xs font-bold hover:bg-[#65130D] transition-colors shrink-0"
                        >
                          Monitor
                        </Link>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F0F3FF] flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#10233F] text-white text-[9px] font-bold">
                              02:30 PM
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">Room B</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#071B37] truncate">
                            CLAT Legal Reasoning & Case Briefing
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Mr. Anurag Dwivedi • Afternoon Cohort
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">Scheduled</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-3 flex justify-end">
                    <Link
                      href="/courses"
                      target="_blank"
                      className="text-xs font-bold text-[#89190E] hover:underline flex items-center gap-1"
                    >
                      <span>View Master Academic Schedule</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Reception Intake Summary */}
                <div className="bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-[#89190E]" />
                        <h3 className="font-serif text-base font-bold text-[#071B37]">
                          Reception Desk Synchronized Queue
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {leads.length} Leads in Queue
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-[#F0F3FF]">
                        <span className="text-[10px] uppercase font-bold text-[#8C716C] block">
                          New Unassigned
                        </span>
                        <div className="font-serif text-xl font-bold text-[#89190E] mt-0.5">
                          {leads.filter((l) => l.status === 'New').length}
                        </div>
                        <span className="text-[10px] text-gray-500">Awaiting callback</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F0F3FF]">
                        <span className="text-[10px] uppercase font-bold text-[#8C716C] block">
                          Active Follow-ups
                        </span>
                        <div className="font-serif text-xl font-bold text-amber-700 mt-0.5">
                          {leads.filter((l) => l.status === 'Follow-up').length}
                        </div>
                        <span className="text-[10px] text-gray-500">Counselor active</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#58413D] leading-relaxed">
                      Two-way link established with Receptionist Harshit. Leads created in this terminal instantly show up on the reception intake register.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-3 flex justify-end">
                    <button
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-bold text-[#89190E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Unified Lead CRM</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: REGISTERED STUDENTS MANAGEMENT (AUDIO 2 SPECIFIC: ONLY REAL STUDENTS) */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#89190E] uppercase tracking-wider mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>Real Registered Students Database</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#071B37]">
                    Active Student Accounts ({filteredStudents.length})
                  </h2>
                  <p className="text-xs text-[#58413D] mt-0.5">
                    Live disk-backed records. Hard-refresh safe • Deletions and additions sync with student portal.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Student</span>
                  </button>
                </div>
              </div>

              {/* Bulk Selection Notification Bar */}
              {selectedStudentIds.length > 0 && (
                <div className="bg-[#FFF4F2] border border-[#FCDAD7] p-3.5 px-5 rounded-2xl flex items-center justify-between animate-fadeIn shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#89190E] text-white flex items-center justify-center text-xs font-bold">
                      {selectedStudentIds.length}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#89190E] block">
                        {selectedStudentIds.length} student account{selectedStudentIds.length > 1 ? 's' : ''} selected
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Use bulk delete to remove all selected student records simultaneously.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds([])}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Deselect All
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedStudentIds.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Students Table */}
              <div className="bg-white rounded-2xl border border-[#E8EEFF] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F0F3FF] uppercase font-bold text-[10px] text-[#8C716C] tracking-wider border-b border-[#E8EEFF]">
                        <th className="py-3.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                            onChange={handleToggleSelectAllStudents}
                            className="w-4 h-4 rounded text-[#89190E] accent-[#89190E] focus:ring-[#89190E] border-gray-300 cursor-pointer"
                            title={selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                          />
                        </th>
                        <th className="py-3.5 px-4">Student Name</th>
                        <th className="py-3.5 px-4">Mobile Number</th>
                        <th className="py-3.5 px-4">Enrolled Stream / Batch</th>
                        <th className="py-3.5 px-4 font-mono">Total Fee</th>
                        <th className="py-3.5 px-4 font-mono">Paid</th>
                        <th className="py-3.5 px-4 font-mono">Fee Due</th>
                        <th className="py-3.5 px-4">Password</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEFF]">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-12 text-gray-500 font-sans">
                            No registered students found. Click "+ Add New Student" to enroll the first student.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((stu) => {
                          const stuKey = stu.id || stu.phone;
                          const isSelected = selectedStudentIds.includes(stu.id) || selectedStudentIds.includes(stu.phone);
                          return (
                          <tr key={stuKey} className={`hover:bg-[#F0F3FF]/50 transition-colors ${isSelected ? 'bg-[#FFF8F7]' : ''}`}>
                            <td className="py-3.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectStudent(stuKey)}
                                className="w-4 h-4 rounded text-[#89190E] accent-[#89190E] focus:ring-[#89190E] border-gray-300 cursor-pointer"
                              />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#89190E]/10 text-[#89190E] flex items-center justify-center font-bold text-xs shrink-0">
                                  {(stu.name || 'ST').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-[#071B37] block">{stu.name}</span>
                                  <span className="text-[10px] text-gray-500 font-mono">{stu.email || '—'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#10233F]">
                              +91 {stu.phone.slice(0, 5)} {stu.phone.slice(5)}
                            </td>
                            <td className="py-3.5 px-4 text-[#58413D] font-medium max-w-xs truncate">
                              {stu.stream}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#10233F]">
                              ₹{(stu.totalFee || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                              ₹{(stu.paidFee || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              {stu.dueFee && stu.dueFee > 0 ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  ₹{stu.dueFee.toLocaleString('en-IN')} Due
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Cleared ✓
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-bold text-[#89190E]">
                                  {showStudentPasswords[stu.phone]
                                    ? (stu.password || 'Student@MSI2026')
                                    : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleStudentPasswordVisibility(stu.phone)}
                                  className="text-gray-400 hover:text-[#89190E] cursor-pointer"
                                  title={showStudentPasswords[stu.phone] ? 'Hide Password' : 'Show Password'}
                                >
                                  {showStudentPasswords[stu.phone] ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(stu.password || 'Student@MSI2026');
                                    showToast(`Password for ${stu.name} copied!`);
                                  }}
                                  className="text-gray-400 hover:text-[#89190E] cursor-pointer"
                                  title="Copy Password"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStudentForCollectFee(stu);
                                    setCollectFeeAmount(String(stu.dueFee && stu.dueFee > 0 ? stu.dueFee : (stu.totalFee || 5000)));
                                  }}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 transition-colors cursor-pointer"
                                  title="Record / Collect Fee Payment & Generate Receipt"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStudentForCourseAssign(stu);
                                    setAssignCourseTargetCourseId(courses[0]?.id || '');
                                  }}
                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 transition-colors cursor-pointer"
                                  title="Assign Course Directly to Student"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setSelectedStudentForView(stu)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#89190E] hover:text-white text-gray-600 transition-colors cursor-pointer"
                                  title="View Complete Student Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditStudent(stu)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-colors cursor-pointer"
                                  title="Edit Student Profile, Stream & Fee Structure"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setStudentToDelete(stu)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors cursor-pointer"
                                  title="Permanently Delete Student"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEAD CRM & RECEPTION LINK (AUDIO 2 SPECIFIC: TWO-WAY SYNC) */}
          {activeTab === 'leads' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#89190E] uppercase tracking-wider mb-1">
                    <PhoneCall className="w-4 h-4" />
                    <span>Reception Telecalling Desk Synchronization</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#071B37]">
                    Unified Lead Register ({filteredLeads.length})
                  </h2>
                  <p className="text-xs text-[#58413D] mt-0.5">
                    Any lead entered here immediately displays on the Reception Desk portal and persists permanently on disk.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowMetaWebhookModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8DCCB] hover:bg-[#FFF9EF] text-[#10233F] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#89190E]" />
                    <span>Meta Webhook</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportLeadsToExcel}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="Export all current leads to an Excel spreadsheet (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export to Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBulkLeadModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFF9EF] hover:bg-[#FCEFD8] border border-[#EFC988] text-[#89190E] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="Open Excel Studio to directly form an Excel sheet or upload spreadsheet"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#89190E]" />
                    <span>ðŸ“Š Excel Sheet Studio (Upload / Form Sheet)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddLeadModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Generate Single Lead</span>
                  </button>
                </div>
              </div>


              {/* Leads Table */}
              <div className="bg-white rounded-2xl border border-[#E8EEFF] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F0F3FF] uppercase font-bold text-[10px] text-[#8C716C] tracking-wider border-b border-[#E8EEFF]">
                        <th className="py-3.5 px-4">Lead Name</th>
                        <th className="py-3.5 px-4">Contact Mobile</th>
                        <th className="py-3.5 px-4">Target Course</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Assigned Telecaller</th>
                        <th className="py-3.5 px-4">Latest Counselor Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEFF]">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-500">
                            No leads found in reception queue.
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((ld) => {
                          const rowClass =
                            ld.status === 'Dead'
                              ? 'border-l-[6px] border-l-red-600 bg-red-100/90 hover:bg-red-200/90 border-b border-red-300 text-red-950 font-medium'
                              : ld.status === 'Converted'
                              ? 'border-l-[6px] border-l-emerald-600 bg-emerald-100/90 hover:bg-emerald-200/90 border-b border-emerald-300 text-emerald-950 font-medium'
                              : ld.status === 'Follow-up'
                              ? 'border-l-[6px] border-l-amber-500 bg-amber-100/90 hover:bg-amber-200/90 border-b border-amber-300 text-amber-950 font-medium'
                              : 'border-l-[6px] border-l-blue-500 bg-blue-50/70 hover:bg-blue-100/70 border-b border-blue-200 text-[#10233F]';

                          return (
                            <tr key={ld.id} className={`transition-colors ${rowClass}`}>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-[#071B37] block">{ld.name}</span>
                                <span className="text-[10px] text-gray-500">{ld.source}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[#10233F]">
                                {ld.mobile}
                              </td>
                              <td className="py-3.5 px-4 text-[#58413D] font-medium">
                                {ld.targetCourse}
                              </td>
                              <td className="py-3.5 px-4 text-gray-600">{ld.location}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex flex-col gap-1.5">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                                      ld.status === 'Converted'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : ld.status === 'Follow-up'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : ld.status === 'Dead'
                                        ? 'bg-red-100 text-red-800 border border-red-300'
                                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                                    }`}
                                  >
                                    {ld.status}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {(['New', 'Follow-up', 'Converted', 'Dead'] as const).map((st) => (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => handleSuperAdminLeadStatus(ld.id, st)}
                                        title={`Switch to ${st}`}
                                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all ${
                                          ld.status === st
                                            ? st === 'Converted'
                                              ? 'bg-emerald-600 text-white shadow-2xs'
                                              : st === 'Follow-up'
                                              ? 'bg-amber-500 text-white shadow-2xs'
                                              : st === 'Dead'
                                              ? 'bg-red-600 text-white shadow-2xs'
                                              : 'bg-blue-600 text-white shadow-2xs'
                                            : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}
                                      >
                                        {st === 'Follow-up' ? 'Follow' : st === 'Converted' ? 'Convert' : st}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            <td className="py-3.5 px-4 text-gray-700 font-medium">
                              {ld.agent}
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                              {ld.latestRemark}
                            </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Receptionist Staff Accounts Card (User Audio Request) */}
              <div className="bg-white rounded-2xl border border-[#E8EEFF] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#E8EEFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-[#F0F3FF]/40">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#89190E] uppercase tracking-wider mb-1">
                      <Users className="w-4 h-4" />
                      <span>Front Desk Staff Credentials</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#071B37]">
                      Receptionist Accounts ({totalReceptionistCount})
                    </h3>
                    <p className="text-xs text-[#58413D] mt-0.5">
                      Front-desk team members authorized to log in at <code>/login</code> or <code>/reception/login</code> to receive inquiries and call leads.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href="/reception/login"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8EEFF] hover:border-[#89190E] text-[#89190E] text-xs font-bold transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Reception Portal</span>
                    </Link>

                    <button
                      onClick={() => setShowAddReceptionistModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Receptionist Staff</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F0F3FF] uppercase font-bold text-[10px] text-[#8C716C] tracking-wider border-b border-[#E8EEFF]">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Login Mobile</th>
                        <th className="py-3 px-4">Login Password</th>
                        <th className="py-3 px-4">Email ID</th>
                        <th className="py-3 px-4">Authorization</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEFF]">
                      {/* Senior Receptionist / Permanent Desk Row */}
                      {seniorDeskRecord && (
                        <tr className="hover:bg-[#F0F3FF]/40 transition-colors bg-[#FFFDF9]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#89190E] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                                {(seniorDeskRecord.name || 'H').slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-[#071B37] block">{seniorDeskRecord.name}</span>
                                <span className="text-[10px] text-gray-500">Fixed System Administrator</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#10233F]">
                            {seniorDeskRecord.phone}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-bold text-[#89190E]">
                                {seniorDeskRecord.password}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(seniorDeskRecord.password);
                                  showToast(`Password for ${seniorDeskRecord.name} copied!`);
                                }}
                                className="text-gray-400 hover:text-[#89190E] cursor-pointer"
                                title="Copy Password"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                            {seniorDeskRecord.email || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Active Senior Desk
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditReceptionist(seniorDeskRecord)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Edit Receptionist Account"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setReceptionistToDelete(seniorDeskRecord)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Receptionist Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Dynamic Receptionists */}
                      {visibleReceptionists.map((rec) => (
                        <tr key={rec.id} className="hover:bg-[#F0F3FF]/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                                {rec.name.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-[#071B37] block">{rec.name}</span>
                                <span className="text-[10px] text-gray-500 font-mono">ID: {rec.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#10233F]">
                            {rec.phone}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-bold text-[#89190E]">
                                {rec.password}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(rec.password);
                                  showToast(`Password for ${rec.name} copied!`);
                                }}
                                className="text-gray-400 hover:text-[#89190E] cursor-pointer"
                                title="Copy Password"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                            {rec.email || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditReceptionist(rec)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Edit Receptionist Account"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setReceptionistToDelete(rec)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Receptionist Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEACHERS & FACULTY (AUDIO 3 SPECIFIC) */}
          {activeTab === 'teachers' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#89190E] uppercase tracking-wider mb-1">
                    <UserCheck className="w-4 h-4" />
                    <span>Institutional Faculty Management</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#071B37]">
                    Certified Mentors & Instructors ({teachers.length})
                  </h2>
                  <p className="text-xs text-[#58413D] mt-0.5">
                    Faculty accounts for judicial and legal entrance coaching. Approvals and assignments reflect across faculty dashboards.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddTeacherModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Faculty Member</span>
                  </button>
                </div>
              </div>

              {/* Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {teachers.map((tc) => (
                  <div
                    key={tc.id}
                    className="bg-white rounded-2xl border border-[#E8EEFF] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#FFF3DD] text-[#89190E] font-serif font-bold text-base flex items-center justify-center border border-[#EFC988]/60 shrink-0">
                            {tc.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-[#071B37] leading-tight">
                              {tc.name}
                            </h3>
                            <span className="text-[11px] text-[#89190E] font-medium block">
                              {tc.designation}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {tc.email}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tc.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tc.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tc.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F0F3FF] text-xs space-y-1 mb-3">
                        <div className="text-[11px] text-[#58413D]">
                          <strong>Specialization:</strong> {tc.specialization || tc.department}
                        </div>
                        <div className="text-[11px] text-[#58413D]">
                          <strong>Experience:</strong> {tc.experienceYears} Years Academic / Judicial
                        </div>
                        <div className="text-[11px] text-[#58413D]">
                          <strong>Assigned Courses:</strong> {tc.assignedCourseIds?.length || 0} Batches
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8EEFF] flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setAssigningTeacher(tc);
                          setTeacherSelectedCourseIds(tc.assignedCourseIds || []);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-[#F0F3FF] hover:bg-[#E8EEFF] text-[#071B37] font-bold text-[11px] transition-colors cursor-pointer text-center"
                      >
                        Assign Courses
                      </button>

                      {tc.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveTeacher(tc.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectTeacher(tc.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleOpenEditFaculty(tc)}
                        className="py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title={`Edit ${tc.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setTeacherToDelete(tc)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors cursor-pointer"
                        title={`Delete ${tc.name}`}
                        aria-label={`Delete ${tc.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COURSES & LMS */}
          {activeTab === 'courses' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#89190E] uppercase tracking-wider mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Curriculum & Batch Administration</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#071B37]">
                    Published Law Coaching Programs ({courses.length})
                  </h2>
                  <p className="text-xs text-[#58413D] mt-0.5">
                    Judiciary, CLAT, AILET, and LL.M Foundation syllabi synchronized with student learning portal.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (teachers.length > 0 && !newCourseTeacherId) {
                        setNewCourseTeacherId(teachers[0].id);
                      }
                      setShowAddCourseModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create Course & Assign Faculty</span>
                  </button>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((crs) => (
                  <div
                    key={crs.id}
                    className="bg-white rounded-2xl border border-[#E8EEFF] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {crs.thumbnail && (
                        <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-gray-100">
                          <Image
                            src={crs.thumbnail}
                            alt={crs.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold uppercase backdrop-blur-xs">
                            {crs.category}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#89190E]/10 text-[#89190E] text-[10px] font-bold uppercase">
                          {crs.category}
                        </span>
                        <span className="font-bold text-xs text-[#071B37]">
                          ₹{crs.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#071B37] mb-1">
                        {crs.title}
                      </h3>
                      <p className="text-xs text-[#58413D] line-clamp-2 mb-3">
                        {crs.headline}
                      </p>
                      <div className="p-3 rounded-xl bg-[#F0F3FF] text-[11px] space-y-1 text-[#58413D]">
                        <div>
                          <strong>Assigned Faculty:</strong> <span className="text-[#89190E] font-bold">{crs.instructorName}</span>
                        </div>
                        <div>
                          <strong>Curriculum:</strong> {crs.sections?.length || 0} Modules • {crs.totalDuration} • {crs.totalLectures || 0} Lectures
                        </div>
                        <div>
                          <strong>Rating:</strong> â­ {crs.rating} ({crs.reviewCount} reviews)
                        </div>

                        {/* Recent Sequential Lectures Preview */}
                        {crs.sections && crs.sections[0]?.lectures?.length > 0 && (
                          <div className="pt-2 border-t border-[#E8EEFF]/80 mt-2 space-y-1">
                            <span className="text-[10px] font-mono font-bold uppercase text-[#071B37] block">
                              Lectures Published ({crs.sections[0].lectures.length}):
                            </span>
                            <div className="space-y-0.5">
                              {crs.sections[0].lectures.slice(0, 3).map((lec) => (
                                <div key={lec.id} className="flex items-center justify-between text-[10px] text-gray-600 truncate">
                                  <span className="truncate pr-1">
                                    • {lec.title}
                                  </span>
                                  <span className="font-mono text-[9px] text-gray-400 shrink-0">{lec.duration}</span>
                                </div>
                              ))}
                              {crs.sections[0].lectures.length > 3 && (
                                <span className="text-[9px] text-[#89190E] font-semibold block">
                                  +{crs.sections[0].lectures.length - 3} more lectures
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 mt-4 flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedCourseForFacultyAssign(crs);
                            setAssignFacultyTargetTeacherId(crs.instructorId || teachers[0]?.id || '');
                            setAssignFacultyCustomName('');
                            setAssignFacultyAutoEnroll(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F0F3FF] hover:bg-[#E8EEFF] text-[#071B37] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                          title="Assign this course to a specific faculty member by name"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-[#89190E]" />
                          <span>Assign Faculty</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCourseForLecture(crs);
                            setNewLectureTitle('');
                            setNewLectureVideoUrl('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FFF9EF] hover:bg-[#FCEFD8] border border-[#EFC988] text-[#89190E] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Lecture</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditCourse(crs)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit Course Details & Price"
                        >
                          <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCourseToDelete(crs)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                          title="Delete Course from Website"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/courses`}
                          target="_blank"
                          className="text-[#89190E] font-bold hover:underline flex items-center gap-1 shrink-0"
                        >
                          <span>View Public Page</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 6: WEBSITE GALLERY MANAGEMENT (AUDIO 3 SPECIFIC: DIRECT LINK TO /gallery) */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#89190E] uppercase tracking-wider mb-1">
                    <ImageIcon className="w-4 h-4" />
                    <span>Website Gallery Synchronization</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#071B37]">
                    Public Campus Media ({galleryItems.length})
                  </h2>
                  <p className="text-xs text-[#58413D] mt-0.5">
                    Images and videos uploaded here instantly reflect on the public{' '}
                    <Link href="/gallery" target="_blank" className="text-[#89190E] font-bold underline">
                      /gallery
                    </Link>{' '}
                    page. Hard refresh safe.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddGalleryModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Upload Media to /gallery</span>
                  </button>
                  <Link
                    href="/gallery"
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F0F3FF] text-[#071B37] border border-[#E8EEFF] text-xs font-bold transition-all"
                  >
                    <span>View /gallery</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#89190E]" />
                  </Link>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E8EEFF] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#10233F]/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#89190E] block mb-0.5">
                          {item.tagline}
                        </span>
                        <h3 className="font-serif font-bold text-sm text-[#071B37] mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#58413D] line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400">
                          ID: #{item.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditGallery(item)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Edit Gallery Media"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setGalleryToDelete(item)}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Delete Gallery Media"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: INSTITUTIONAL TRANSACTIONS & RECEIPTS */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Professional Financial Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#89190E] uppercase tracking-wider mb-1">
                    <Receipt className="w-4 h-4" />
                    <span>Institutional Finance & Accounts</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#071B37]">
                    Fee Collections & Admissions Transactions
                  </h2>
                  <p className="text-xs text-[#58413D] mt-0.5">
                    Live reconciled admissions revenue, student fee receipts, and institutional audit ledger.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenCreateInvoiceModal()}
                    className="px-4 py-2.5 rounded-xl bg-[#0C2340] hover:bg-[#07172B] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#EFC988]" />
                    <span>+ Create Invoice</span>
                  </button>

                  {students.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudentForCollectFee(students[0]);
                        setCollectFeeAmount(String(students[0].dueFee || ''));
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#6e130a] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Fee Payment</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      fetchTransactions();
                      showToast('Transactions ledger refreshed.');
                    }}
                    className="p-2.5 rounded-xl border border-[#D5E1ED] bg-white hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                    title="Refresh transactions ledger"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Financial Metrics Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Total Captured Revenue
                  </span>
                  <div className="font-serif font-bold text-2xl text-[#071B37] mt-1">
                    ₹
                    {(
                      transactions.reduce((acc, t) => acc + (t.amount || 0), 0)
                    ).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                    100% Settled in INR
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Completed Transactions
                  </span>
                  <div className="font-serif font-bold text-2xl text-[#071B37] mt-1">
                    {transactions.length}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                    Admission fee settlements
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Audit Settlement
                  </span>
                  <div className="font-serif font-bold text-2xl text-emerald-600 mt-1">
                    100.0%
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                    Fully Reconciled & Compliant
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E8EEFF] shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Payment Gateway
                  </span>
                  <div className="font-serif font-bold text-xl text-[#071B37] mt-1">
                    Institutional Active
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                    Secure UPI, Cards & NetBanking
                  </span>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="bg-white rounded-2xl border border-[#E8EEFF] shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#E8EEFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#071B37]">
                      Live Admissions Transactions Ledger
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      All official student fee collections, online settlements, and authentic institutional receipts.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                    {transactions.length} Record{transactions.length === 1 ? '' : 's'} Found
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F0F3FF] uppercase font-bold text-[10px] text-[#8C716C] tracking-wider border-b border-[#E8EEFF]">
                        <th className="py-3.5 px-4">Receipt / Trans ID</th>
                        <th className="py-3.5 px-4">Student Scholar</th>
                        <th className="py-3.5 px-4">Course Enrolled</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Payment Method</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Timestamp</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEFF]">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-xs text-gray-400 font-sans">
                            No payment transactions recorded yet. Real transactions will automatically appear here when student fees are settled via Razorpay or direct fee collection.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-[#F0F3FF]/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#89190E]">
                              {txn.id}
                              <span className="block text-[9px] font-mono text-gray-400">
                                {(txn.razorpayPaymentId || txn.orderId || txn.razorpayOrderId) ? `Ref: ${txn.razorpayPaymentId || txn.orderId || txn.razorpayOrderId}` : ''}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#071B37]">
                              {txn.studentName}
                              {txn.studentPhone && (
                                <span className="block text-[10px] text-gray-400 font-mono">
                                  {txn.studentPhone}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[#58413D] max-w-xs truncate font-medium">
                              {txn.courseTitle}
                            </td>
                            <td className="py-3.5 px-4 font-serif font-extrabold text-[#071B37]">
                              ₹{txn.amount?.toLocaleString('en-IN') || '0'}
                            </td>
                            <td className="py-3.5 px-4 text-[#58413D]">
                              {txn.paymentMethod || 'Online Gateway'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified & Settled ✓
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                              {txn.timestamp}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedTxnForReceipt(txn)}
                                className="px-2.5 py-1 rounded-lg border border-[#D5E1ED] text-[11px] font-bold text-[#071B37] hover:bg-gray-100 cursor-pointer"
                              >
                                Receipt
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

                    {/* ── MODAL: COLLECT / RECORD FEE PAYMENT ── */}
      {studentForCollectFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setStudentForCollectFee(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Accounts & Fee Reconciliation
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Record Fee Payment
                </h3>
                <p className="text-xs text-gray-500">
                  Record official fee collection & generate authentic receipt.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0F3FF] text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Student:</span>
                <strong className="text-[#10233F]">{studentForCollectFee.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mobile:</span>
                <span className="font-mono text-[#10233F]">+91 {studentForCollectFee.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Course / Stream:</span>
                <span className="font-semibold text-indigo-900">{studentForCollectFee.stream}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="text-gray-500">Current Balance Due:</span>
                <span className="font-mono font-bold text-[#89190E]">
                  ₹{(studentForCollectFee.dueFee ?? Math.max(0, (studentForCollectFee.totalFee || 0) - (studentForCollectFee.paidFee || 0))).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordFeePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Amount to Collect (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={collectFeeAmount}
                  onChange={(e) => setCollectFeeAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono font-bold text-[#89190E] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Payment Mode *
                </label>
                <select
                  value={collectFeePaymentMethod}
                  onChange={(e) => setCollectFeePaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash Counter">Cash Counter / Campus Desk</option>
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT / RTGS)</option>
                  <option value="Cheque / DD">Demand Draft / Cheque</option>
                  <option value="Card (POS Machine)">Debit / Credit Card (POS Machine)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Fee Category / Remarks
                </label>
                <input
                  type="text"
                  value={collectFeeRemarks}
                  onChange={(e) => setCollectFeeRemarks(e.target.value)}
                  placeholder="e.g. First Installment Tuition Clearance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStudentForCollectFee(null)}
                  disabled={isSubmittingCollectFee}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCollectFee || !collectFeeAmount}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingCollectFee ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Record & View Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


            </div>
          )}
        </main>
      </div>

      {/* â”€â”€ MODALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {/* ── MODAL: BULK DELETE STUDENTS CONFIRMATION ── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-100 relative">
            <button
              onClick={() => setShowBulkDeleteModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-lg font-bold text-[#10233F] mb-1">
              Delete {selectedStudentIds.length} Student Account{selectedStudentIds.length > 1 ? 's' : ''}?
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to permanently delete these <strong>{selectedStudentIds.length}</strong> selected student accounts? This will remove their records from MongoDB cloud database and disk, revoke their credentials, and cancel portal access.
            </p>

            <div className="max-h-36 overflow-y-auto bg-gray-50 rounded-xl p-3 border border-gray-200 mb-5 space-y-1.5 text-xs">
              {students
                .filter((s) => selectedStudentIds.includes(s.id) || selectedStudentIds.includes(s.phone))
                .map((s) => (
                  <div key={s.id || s.phone} className="flex justify-between items-center text-gray-700">
                    <span className="font-bold text-[#10233F] truncate">{s.name}</span>
                    <span className="font-mono text-gray-500 text-[11px] shrink-0">+{s.phone}</span>
                  </div>
                ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBulkDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Bulk Delete ({selectedStudentIds.length})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE MANUAL TAX INVOICE & RECEIPT ── */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative my-auto">
            <button
              onClick={() => setShowCreateInvoiceModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-11 h-11 rounded-2xl bg-[#0C2340] text-[#EFC988] flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#89190E]">
                  Official Billing & Accounting
                </span>
                <h3 className="font-serif text-xl font-bold text-[#10233F]">
                  Create Manual Tax Invoice / Fee Receipt
                </h3>
                <p className="text-xs text-gray-500">
                  Generate an official GST invoice using the institute's single-sheet format with auto-calculations.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateManualInvoice} className="space-y-4 text-xs">
              {/* Student Mode Selector */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInvStudentMode('existing')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors ${
                    invStudentMode === 'existing'
                      ? 'bg-white text-[#89190E] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Select Enrolled Student ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInvStudentMode('custom');
                    setInvStudentId('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors ${
                    invStudentMode === 'custom'
                      ? 'bg-white text-[#89190E] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  New / Walk-in Scholar
                </button>
              </div>

              {/* Student Dropdown or Custom Fields */}
              {invStudentMode === 'existing' && students.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Choose Registered Student *
                  </label>
                  <select
                    value={invStudentId}
                    onChange={(e) => handleSelectInvoiceStudent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E] bg-white font-medium"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone}) — {s.stream} (Due: ₹{(s.dueFee ?? 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Billed To Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={invStudentName}
                    onChange={(e) => setInvStudentName(e.target.value)}
                    placeholder="e.g. SUKHMAN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Parent / Guardian Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={invStudentGuardian}
                    onChange={(e) => setInvStudentGuardian(e.target.value)}
                    placeholder="e.g. GURPREET SINGH"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Mobile Number (Login Key)
                  </label>
                  <input
                    type="text"
                    value={invStudentPhone}
                    onChange={(e) => setInvStudentPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Course Program / Stream *
                  </label>
                  <input
                    type="text"
                    required
                    value={invCourseTitle}
                    onChange={(e) => setInvCourseTitle(e.target.value)}
                    placeholder="e.g. PCS-J Punjab Judicial Services"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Student Postal Address
                </label>
                <input
                  type="text"
                  value={invStudentAddress}
                  onChange={(e) => setInvStudentAddress(e.target.value)}
                  placeholder="e.g. #3007 GTB NAGAR, Kharar, Punjab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Invoice / Receipt No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={invInvoiceNo}
                    onChange={(e) => setInvInvoiceNo(e.target.value)}
                    placeholder="e.g. 65 or INV-MSI-2026-0065"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono font-bold text-[#89190E] focus:outline-none focus:border-[#89190E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Mode of Payment *
                  </label>
                  <select
                    value={invPaymentMode}
                    onChange={(e) => setInvPaymentMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E] bg-white font-semibold"
                  >
                    <option value="ONLINE / UPI">ONLINE / UPI</option>
                    <option value="CASH">CASH</option>
                    <option value="BANK TRANSFER / NEFT">BANK TRANSFER / NEFT</option>
                    <option value="CHEQUE">CHEQUE</option>
                    <option value="CREDIT / DEBIT CARD">CREDIT / DEBIT CARD</option>
                  </select>
                </div>
              </div>

              {/* Amount & Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Total Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-sm font-mono font-bold text-[#89190E] focus:outline-none focus:border-[#89190E]"
                  />
                  {Number(invAmount) > 0 && (
                    <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                      <span>Taxable: ₹{(Number(invAmount) / 1.18).toFixed(2)}</span>
                      <span>GST (18% incl): ₹{(Number(invAmount) - Number(invAmount) / 1.18).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Item Description / Particulars
                  </label>
                  <input
                    type="text"
                    value={invDescription}
                    onChange={(e) => setInvDescription(e.target.value)}
                    placeholder="e.g. CLAT (LLB) Course Tuition Fee"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Remarks / Special Settlement Notes (Optional)
                </label>
                <input
                  type="text"
                  value={invRemarks}
                  onChange={(e) => setInvRemarks(e.target.value)}
                  placeholder="e.g. Full Semester Settlement / Installment 1 of 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              {/* Sync Student Ledger Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sync-student-fee-check"
                  checked={invSyncStudentLedger}
                  onChange={(e) => setInvSyncStudentLedger(e.target.checked)}
                  className="w-4 h-4 rounded text-[#89190E] accent-[#89190E] cursor-pointer"
                />
                <label htmlFor="sync-student-fee-check" className="text-xs text-gray-700 cursor-pointer">
                  Sync with Student Ledger (add ₹{Number(invAmount) || 0} to student's <strong>Paid Fees</strong> & reduce <strong>Due Balance</strong>)
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  disabled={isSubmittingManualInvoice}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManualInvoice}
                  className="px-5 py-2.5 rounded-xl bg-[#0C2340] hover:bg-[#07172B] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingManualInvoice ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Invoice...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-3.5 h-3.5 text-[#EFC988]" />
                      <span>Generate & Issue Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official GST Tax Invoice & Fee Receipt Modal */}
      {selectedTxnForReceipt && (
        <FeeReceiptModal
          transaction={selectedTxnForReceipt}
          allowEdit={true}
          onClose={() => setSelectedTxnForReceipt(null)}
        />
      )}

      {/* 1. Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Add Real Student Account
                </h3>
                <p className="text-xs text-gray-500">
                  Persists directly to disk. Student can log in immediately.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rathore"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="e.g. 9812345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] font-mono focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Enrolled Stream / Batch
                </label>
                <select
                  value={newStudentStream}
                  onChange={(e) => setNewStudentStream(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                >
                  <option value="PCS-J Punjab Judicial Services">PCS-J Punjab Judicial Services</option>
                  <option value="Judiciary Comprehensive Foundation & Procedural Law">Judiciary Comprehensive Foundation</option>
                  <option value="CLAT 2-Year Integrated Foundation">CLAT 2-Year Integrated Foundation</option>
                  <option value="CLAT 1-Year Fast-Track Target Batch">CLAT 1-Year Fast-Track Target Batch</option>
                  <option value="UGC NET Law & Jurisprudence">UGC NET Law & Jurisprudence</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Email ID (Optional)
                </label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="student@msi-institutes.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Portal Login Password
                </label>
                <input
                  type="text"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="Student@MSI2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Total Course Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStudentTotalFee}
                    onChange={(e) => setNewStudentTotalFee(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono font-bold text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Initial Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStudentPaidFee}
                    onChange={(e) => setNewStudentPaidFee(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Next Due Date (Optional)
                </label>
                <input
                  type="text"
                  value={newStudentNextDueDate}
                  onChange={(e) => setNewStudentNextDueDate(e.target.value)}
                  placeholder="e.g. 15 Dec 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingStudent ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save to Permanent Disk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. View Student Details Modal */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setSelectedStudentForView(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#89190E] text-white flex items-center justify-center font-bold text-lg">
                {selectedStudentForView.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#10233F]">
                  {selectedStudentForView.name}
                </h3>
                <span className="text-xs text-[#89190E] font-semibold">
                  {selectedStudentForView.stream}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-[#F0F3FF] p-4 rounded-2xl text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Student ID:</span>
                <span className="font-mono font-bold text-[#10233F]">
                  {selectedStudentForView.id}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Mobile Number:</span>
                <span className="font-mono font-bold text-[#10233F]">
                  +91 {selectedStudentForView.phone}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Official Email:</span>
                <span className="font-mono text-[#10233F]">
                  {selectedStudentForView.email || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Registered On:</span>
                <span className="text-[#10233F]">
                  {selectedStudentForView.registeredAt
                    ? new Date(selectedStudentForView.registeredAt).toLocaleString('en-IN')
                    : 'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-gray-500">Portal Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#89190E] bg-white px-2 py-0.5 rounded border border-gray-200">
                    {selectedStudentForView.password || 'Student@MSI2026'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedStudentForView.password || 'Student@MSI2026');
                      showToast('Student password copied to clipboard!');
                    }}
                    className="p-1 text-gray-400 hover:text-[#89190E] cursor-pointer"
                    title="Copy Password"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Enrolled Batch:</span>
                <span className="font-semibold text-[#89190E]">
                  {selectedStudentForView.profile?.batch || selectedStudentForView.stream}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const stu = selectedStudentForView;
                  setSelectedStudentForView(null);
                  setSelectedStudentForCourseAssign(stu);
                  setAssignCourseTargetCourseId(courses[0]?.id || '');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>+ Assign Course</span>
              </button>
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="px-5 py-2 rounded-xl bg-[#10233F] text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2b. Assign Course Directly to Student Modal */}
      {selectedStudentForCourseAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setSelectedStudentForCourseAssign(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Assign Course Directly to Student
                </h3>
                <p className="text-xs text-gray-500">
                  Direct Super Admin clearance. Course appears immediately on student&apos;s dashboard.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] mb-4 text-xs">
              <span className="text-gray-500 block">Assigning to:</span>
              <strong className="text-sm text-[#10233F] block font-serif">
                {selectedStudentForCourseAssign.name} (+91 {selectedStudentForCourseAssign.phone})
              </strong>
              <span className="text-[11px] text-[#89190E] font-medium block mt-0.5">
                Current Batch: {selectedStudentForCourseAssign.stream}
              </span>
            </div>

            <form onSubmit={handleAssignCourseToStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Select Course Program *
                </label>
                <select
                  required
                  value={assignCourseTargetCourseId}
                  onChange={(e) => setAssignCourseTargetCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                >
                  <option value="">-- Choose a course program --</option>
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.title} ({crs.category} • {crs.instructorName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Directive / Dean Note (Visible on Student Dashboard)
                </label>
                <input
                  type="text"
                  value={assignCourseNote}
                  onChange={(e) => setAssignCourseNote(e.target.value)}
                  placeholder="e.g. Authorized by Super Admin Directorate for Academic Session 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForCourseAssign(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCourseAssign || !assignCourseTargetCourseId}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {isSubmittingCourseAssign ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Confirm Course Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#10233F] mb-1">
              Delete Student Account?
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to permanently delete <strong>{studentToDelete.name}</strong> ({studentToDelete.phone})? This will immediately remove their account from disk and block student portal access.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeletingStudent}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                disabled={isDeletingStudent}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingStudent ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3b. Student Credentials Success Dialog */}
      {createdStudentCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#10233F] mb-1">
              Student Account Created!
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Share these credentials with the student. They can log in immediately at the Student Portal.
            </p>
            <div className="p-4 rounded-2xl bg-[#F0F3FF] text-left text-xs space-y-2 mb-5 font-sans">
              <div className="flex justify-between">
                <span className="text-gray-500">Student Name:</span>
                <span className="font-bold text-[#10233F]">{createdStudentCredentials.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mobile / Login ID:</span>
                <span className="font-mono font-bold text-[#10233F]">{createdStudentCredentials.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Password:</span>
                <span className="font-mono font-bold text-[#89190E] bg-white px-2 py-0.5 rounded border border-gray-200">
                  {createdStudentCredentials.pass}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Enrolled Stream:</span>
                <span className="font-semibold text-emerald-800">{createdStudentCredentials.stream}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const text = `MSI Student Login Credentials:\nName: ${createdStudentCredentials.name}\nLogin Mobile: ${createdStudentCredentials.phone}\nPassword: ${createdStudentCredentials.pass}\nStream: ${createdStudentCredentials.stream}\nPortal: ${typeof window !== 'undefined' ? window.location.origin : ''}/student/login`;
                  navigator.clipboard.writeText(text);
                  showToast('Credentials copied to clipboard!');
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#10233F] hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#89190E]" />
                <span>Copy Credentials</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedStudentCredentials(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3c. Add Receptionist Staff Modal */}
      {showAddReceptionistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setShowAddReceptionistModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Add Receptionist Staff Member
                </h3>
                <p className="text-xs text-gray-500">
                  Creates front-desk login credentials to answer telecalls, view intake leads, and record remarks.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateReceptionist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Receptionist Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newReceptionistName}
                  onChange={(e) => setNewReceptionistName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  10-Digit Mobile Number (Login ID) *
                </label>
                <input
                  type="text"
                  required
                  value={newReceptionistPhone}
                  onChange={(e) => setNewReceptionistPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] font-mono focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Official Email ID (Optional)
                </label>
                <input
                  type="email"
                  value={newReceptionistEmail}
                  onChange={(e) => setNewReceptionistEmail(e.target.value)}
                  placeholder="e.g. priya.reception@msigroup.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] font-mono focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Portal Login Password *
                </label>
                <input
                  type="text"
                  required
                  value={newReceptionistPassword}
                  onChange={(e) => setNewReceptionistPassword(e.target.value)}
                  placeholder="Reception@MSI2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono font-bold text-[#89190E] focus:outline-none focus:border-[#89190E]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Receptionist will use this password to sign in at /login or /reception/login.
                </p>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddReceptionistModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReceptionist}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingReceptionist ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Create Receptionist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3d. Delete Receptionist Confirmation Modal */}
      {receptionistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#10233F] mb-1">
              Delete Receptionist Account?
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete receptionist <strong>{receptionistToDelete.name}</strong> ({receptionistToDelete.phone})? They will immediately lose access to the reception portal.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReceptionistToDelete(null)}
                disabled={isDeletingReceptionist}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReceptionist}
                disabled={isDeletingReceptionist}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingReceptionist ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3e. Receptionist Credentials Created Dialog */}
      {createdReceptionistCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#10233F] mb-1">
              Receptionist Account Created!
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Share these credentials with the front desk receptionist. They can log in directly at the reception desk.
            </p>
            <div className="p-4 rounded-2xl bg-[#F0F3FF] text-left text-xs space-y-2 mb-5 font-sans">
              <div className="flex justify-between">
                <span className="text-gray-500">Staff Name:</span>
                <span className="font-bold text-[#10233F]">{createdReceptionistCredentials.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mobile / Login ID:</span>
                <span className="font-mono font-bold text-[#10233F]">{createdReceptionistCredentials.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Password:</span>
                <span className="font-mono font-bold text-[#89190E] bg-white px-2 py-0.5 rounded border border-gray-200">
                  {createdReceptionistCredentials.pass}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const text = `MSI Receptionist Login:\nName: ${createdReceptionistCredentials.name}\nLogin Mobile: ${createdReceptionistCredentials.phone}\nPassword: ${createdReceptionistCredentials.pass}\nPortal: ${typeof window !== 'undefined' ? window.location.origin : ''}/reception/login`;
                  navigator.clipboard.writeText(text);
                  showToast('Reception credentials copied to clipboard!');
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#10233F] hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#89190E]" />
                <span>Copy Credentials</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedReceptionistCredentials(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3f. Delete Course Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#10233F] mb-1">
              Delete Course Program?
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to permanently delete <strong>{courseToDelete.title}</strong>? This will remove the course from the public website, student portal, and faculty assignments.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                disabled={isDeletingCourse}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={isDeletingCourse}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingCourse ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Lead Modal (Dispatches to Reception Desk) */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setShowAddLeadModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Generate Reception Lead
                </h3>
                <p className="text-xs text-gray-500">
                  Routes directly to Receptionist Harshit on the Reception Desk portal.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="e.g. Priyanshu Kashyap"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Candidate Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadMobile}
                  onChange={(e) => setNewLeadMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] font-mono focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={newLeadLocation}
                    onChange={(e) => setNewLeadLocation(e.target.value)}
                    placeholder="Chandigarh / Mohali"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Target Course
                  </label>
                  <select
                    value={newLeadCourse}
                    onChange={(e) => setNewLeadCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="PCS-J Punjab Judicial Services">PCS-J Punjab Judicial Services</option>
                    <option value="CLAT 2027 (2-Yr Class)">CLAT 2027 (2-Yr Class)</option>
                    <option value="CLAT 2026 (1-Yr Target)">CLAT 2026 (1-Yr Target)</option>
                    <option value="Judiciary Mains Answer Writing">Judiciary Mains Answer Writing</option>
                  </select>
                </div>
              </div>

              {/* Source & Telecaller Assignment Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Lead Source *
                  </label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="Meta Ads (Facebook/Instagram)">Meta Ads (Facebook/Instagram)</option>
                    <option value="Google Ads">Google Ads Search & Display</option>
                    <option value="Local Walk-in">Local Walk-in (Campus Desk)</option>
                    <option value="College Workshop">College Workshop & Judicial Seminar</option>
                    <option value="Website Enquiry">Website Inbound Form</option>
                    <option value="Alumni Referral">Alumni / Student Referral</option>
                    <option value="Super Admin (#2410)">Super Admin (#2410)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Assign To Telecaller *
                  </label>
                  <select
                    value={newLeadAgent}
                    onChange={(e) => setNewLeadAgent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="Harshit (Reception Desk)">Harshit (Reception Desk)</option>
                    <option value="Counselor Priya (Law Admissions Desk)">Counselor Priya (Law Admissions Desk)</option>
                    <option value="Counselor Rohit (Judiciary Services Desk)">Counselor Rohit (Judiciary Services Desk)</option>
                    <option value="Counselor Simran (CLAT & Entrance Desk)">Counselor Simran (CLAT & Entrance Desk)</option>
                    <option value="Auto Round-Robin Distribution">Auto Round-Robin (Equal Distribution)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Counselor Note / Instructions
                </label>
                <textarea
                  rows={2}
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  placeholder="e.g. Inquired about scholarship test and fee structure."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingLead ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Dispatch to Reception</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4b. Excel Sheet Studio & Bulk Lead Generator Modal */}
      <ExcelLeadManagerModal
        isOpen={showBulkLeadModal}
        onClose={() => setShowBulkLeadModal(false)}
        onLeadsGenerated={(count) => {
          fetchLeads();
          showToast(`Successfully generated and dispatched ${count} leads to Reception Desk!`);
        }}
        showToast={showToast}
        existingLeads={leads}
      />

      {/* 4c. Meta Ads Webhook Integration Guide (For Ankit) */}
      {showMetaWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowMetaWebhookModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#89190E]">
                  Integration Guide for Ankit
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Meta (Facebook/Instagram) & Google Ads CRM Sync
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#526174]">
              <div className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] space-y-2">
                <span className="font-bold text-[#10233F] block">
                  1. Real-Time Webhook Callback URL:
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB] font-mono text-[11px] text-[#89190E]">
                  <span className="truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/admin/leads?source=meta` : '/api/admin/leads?source=meta'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/api/admin/leads?source=meta`);
                        showToast('Webhook URL copied to clipboard!');
                      }
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-900 cursor-pointer"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <span className="font-bold text-[#10233F] block pt-1">
                  2. Verify Token (Paste in Meta App Setup):
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8DCCB] font-mono text-[11px] text-[#10233F]">
                  <span>msi_meta_leads_2026_secret</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('msi_meta_leads_2026_secret');
                      showToast('Verify Token copied!');
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-900 cursor-pointer"
                    title="Copy Token"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#10233F] block">
                  How Ankit can configure Meta Lead Ads:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                  <li>Go to <strong>Meta for Developers / Facebook Business Manager</strong> → Webhooks.</li>
                  <li>Subscribe to the <strong>Page</strong> object and check the <code>leadgen</code> topic.</li>
                  <li>Enter the Callback URL and Verify Token above. Verification is handled automatically.</li>
                  <li>Whenever an ad form is submitted on Instagram or Facebook, the lead is instantly parsed and routed to your telecallers!</li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowMetaWebhookModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#0C2340] hover:bg-[#07172B] text-white text-xs font-bold cursor-pointer"
                >
                  Done / Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Gallery Media Modal */}
      {showAddGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowAddGalleryModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Upload Media to Website /gallery
                </h3>
                <p className="text-xs text-gray-500">
                  Adds photo directly to the public website gallery. Reflects instantly on /gallery.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateGallery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Media Title *
                </label>
                <input
                  type="text"
                  required
                  value={newGalleryTitle}
                  onChange={(e) => setNewGalleryTitle(e.target.value)}
                  placeholder="e.g. Moot Court Hall & Appellate Bench"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Category
                  </label>
                  <select
                    value={newGalleryCategory}
                    onChange={(e) =>
                      setNewGalleryCategory(e.target.value as 'institute' | 'labs' | 'library' | 'events')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="institute">Institute Spaces</option>
                    <option value="labs">Legal Research & Test Labs</option>
                    <option value="library">Central Library</option>
                    <option value="events">Moot Courts & Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={newGalleryTagline}
                    onChange={(e) => setNewGalleryTagline(e.target.value)}
                    placeholder="e.g. Campus Excellence"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              {/* Real File Upload from Computer */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Choose Photo from Your Device (PNG, JPG, WEBP)
                </label>
                <div className="border-2 border-dashed border-[#E8DCCB] rounded-2xl p-4 text-center hover:border-[#89190E] transition-colors bg-[#FFF9EF]/50">
                  <input
                    type="file"
                    accept="image/*"
                    id="gallery-file-input"
                    onChange={handleGalleryFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="gallery-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                  >
                    <Upload className="w-6 h-6 text-[#89190E]" />
                    <span className="text-xs font-bold text-[#10233F]">
                      Click to Browse Photo from Computer
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Uploaded photo will be saved and displayed instantly on the public /gallery
                    </span>
                  </label>
                </div>
              </div>

              {/* Preview Thumbnail */}
              {newGalleryImage && (
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center space-x-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-300 bg-white shrink-0">
                    <img
                      src={newGalleryImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-emerald-700 block">
                      ✓ Image Ready to Publish
                    </span>
                    <p className="text-[10px] text-gray-500 truncate font-mono">
                      {newGalleryImage.slice(0, 45)}...
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newGalleryDesc}
                  onChange={(e) => setNewGalleryDesc(e.target.value)}
                  placeholder="Facility details, bare act libraries, and seating capacity."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddGalleryModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGallery}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingGallery ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Publish to /gallery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5b. Edit Gallery Media Modal */}
      {galleryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8EEFF] my-8">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#10233F]">
                    Edit Gallery Media #{galleryToEdit.id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Update title, category, description, or photo. Reflects live on /gallery.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGalleryToEdit(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateGallery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Media Title *
                </label>
                <input
                  type="text"
                  required
                  value={editGalleryTitle}
                  onChange={(e) => setEditGalleryTitle(e.target.value)}
                  placeholder="e.g. Moot Court Hall & Appellate Bench"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Category
                  </label>
                  <select
                    value={editGalleryCategory}
                    onChange={(e) =>
                      setEditGalleryCategory(e.target.value as 'institute' | 'labs' | 'library' | 'events')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="institute">Institute Spaces</option>
                    <option value="labs">Legal Research & Test Labs</option>
                    <option value="library">Central Library</option>
                    <option value="events">Moot Courts & Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Display Layout
                  </label>
                  <select
                    value={editGallerySpan}
                    onChange={(e) => setEditGallerySpan(e.target.value as 'normal' | 'wide')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="normal">Standard (4:3 ratio)</option>
                    <option value="wide">Wide Featured (16:9 ratio)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editGalleryTagline}
                  onChange={(e) => setEditGalleryTagline(e.target.value)}
                  placeholder="e.g. Campus Excellence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              {/* Replace Photo */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Change Photo (Optional - Browse new from device)
                </label>
                <div className="border-2 border-dashed border-[#E8DCCB] rounded-2xl p-3 text-center hover:border-blue-500 transition-colors bg-[#F8FAFC]">
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-gallery-file-input"
                    onChange={handleEditGalleryFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-gallery-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-1"
                  >
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold text-[#10233F]">
                      Click to Choose New Photo
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Auto-compressed & optimized for high-speed cloud loading
                    </span>
                  </label>
                </div>
              </div>

              {/* Current Preview */}
              {editGalleryImage && (
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center space-x-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-300 bg-white shrink-0">
                    <img
                      src={editGalleryImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-blue-700 block">
                      Active Photo Preview
                    </span>
                    <p className="text-[10px] text-gray-500 truncate font-mono">
                      {editGalleryImage.slice(0, 45)}...
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editGalleryDesc}
                  onChange={(e) => setEditGalleryDesc(e.target.value)}
                  placeholder="Facility details, bare act libraries, and seating capacity."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setGalleryToEdit(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingGallery}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isUpdatingGallery ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 6. Delete Gallery Confirmation Modal */}
      {galleryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#10233F] mb-1">
              Delete Gallery Media?
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete <strong>{galleryToDelete.title}</strong>? This media item will be removed from the public website gallery.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGalleryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGallery}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Assign Courses to Teacher Modal */}
      {assigningTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setAssigningTeacher(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Assign Courses to {assigningTeacher.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Select coaching programs this faculty member will lead.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 my-4">
              {courses.map((crs) => {
                const isSelected = teacherSelectedCourseIds.includes(crs.id);
                return (
                  <label
                    key={crs.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[#89190E] bg-[#89190E]/5 font-bold text-[#89190E]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="truncate pr-2">{crs.title}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTeacherSelectedCourseIds([...teacherSelectedCourseIds, crs.id]);
                        } else {
                          setTeacherSelectedCourseIds(
                            teacherSelectedCourseIds.filter((id) => id !== crs.id)
                          );
                        }
                      }}
                      className="rounded accent-[#89190E]"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAssigningTeacher(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourseAssignments}
                className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Course Assignments</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7c. Delete Faculty Member Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#10233F] mb-1">
              Delete Faculty Member?
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to permanently delete <strong>{teacherToDelete.name}</strong> ({teacherToDelete.email})? This will remove their record from server disk (<code>data/teachers.json</code>), terminate portal access, and unassign courses.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                disabled={isDeletingTeacher}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTeacher}
                disabled={isDeletingTeacher}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingTeacher ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7b. Assign Faculty to Course Modal */}
      {selectedCourseForFacultyAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setSelectedCourseForFacultyAssign(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Assign Course to Faculty Member
                </h3>
                <p className="text-xs text-gray-500">
                  Select faculty by name to lead this curriculum program.
                </p>
              </div>
            </div>

            <form onSubmit={handleAssignCourseToFaculty} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FFF9EF] border border-[#EFC988] text-[#89190E] space-y-1">
                <div className="font-bold text-xs">{selectedCourseForFacultyAssign.title}</div>
                <div className="text-[11px] text-[#526174]">
                  Current Instructor: <strong>{selectedCourseForFacultyAssign.instructorName}</strong>
                </div>
              </div>

              {/* Faculty Select Dropdown */}
              <div>
                <label className="block font-bold uppercase text-[10px] text-gray-600 mb-1">
                  Select Faculty Instructor *
                </label>
                <select
                  value={assignFacultyTargetTeacherId}
                  onChange={(e) => setAssignFacultyTargetTeacherId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-[#10233F] focus:outline-none focus:border-[#89190E]"
                >
                  <option value="">-- Choose from Approved Faculty --</option>
                  {teachers.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.name} ({tc.department || tc.stream})
                    </option>
                  ))}
                </select>
              </div>

              {/* Or Specify Faculty by Name */}
              <div>
                <label className="block font-bold uppercase text-[10px] text-gray-600 mb-1">
                  Or Type Faculty Name (e.g. Dr. Ekta Gehlot / Dr. Ekta Gahlawat)
                </label>
                <input
                  type="text"
                  value={assignFacultyCustomName}
                  onChange={(e) => setAssignFacultyCustomName(e.target.value)}
                  placeholder="e.g. Dr. Ekta Gahlawat"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              {/* Auto-enroll Registered Students */}
              <div className="p-3 rounded-xl bg-[#F0F3FF] border border-[#E8EEFF]">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignFacultyAutoEnroll}
                    onChange={(e) => setAssignFacultyAutoEnroll(e.target.checked)}
                    className="rounded accent-[#89190E] mt-0.5"
                  />
                  <div className="text-[11px] text-[#071B37]">
                    <strong className="block font-bold">Auto-enroll Registered Students</strong>
                    <span className="text-gray-500 text-[10px]">
                      Registered scholars (Harshit, Ankit, Aarav, Meera, etc.) under this faculty will immediately see this course and all uploaded video lectures.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForFacultyAssign(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFacultyAssign}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingFacultyAssign ? 'Assigning...' : 'Confirm Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Add Teacher / Faculty Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setShowAddTeacherModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Add Faculty Jurist / Professor
                </h3>
                <p className="text-xs text-gray-500">
                  Approved faculty will have access to lecture delivery and student assignments.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="e.g. Adv. Rohit Mehra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Official Email or Gmail ID *
                </label>
                <input
                  type="email"
                  required
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  placeholder="e.g. rohit.law@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Mobile / Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newTeacherPhone}
                  onChange={(e) => setNewTeacherPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={newTeacherSpecialization}
                    onChange={(e) => setNewTeacherSpecialization(e.target.value)}
                    placeholder="e.g. Criminal Procedure Code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={newTeacherExp}
                    onChange={(e) => setNewTeacherExp(e.target.value)}
                    placeholder="8"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              {/* Login Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-[#10233F]">
                    Faculty Login Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = `MSI@Faculty${Math.floor(1000 + Math.random() * 9000)}`;
                      setNewTeacherPassword(gen);
                      showToast(`Generated: ${gen}`);
                    }}
                    className="text-[10px] text-[#89190E] font-bold hover:underline cursor-pointer"
                  >
                    âš¡ Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newTeacherPassword}
                  onChange={(e) => setNewTeacherPassword(e.target.value)}
                  placeholder="MSI@Faculty2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  This faculty member can log in directly using this password and their Gmail ID at /teacher/login.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Create & Approve Faculty</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8b. Faculty Credentials Issued Modal */}
      {createdFacultyCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200 text-center relative">
            <button
              onClick={() => setCreatedFacultyCredentials(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Account Created & Approved
            </span>
            <h3 className="font-serif text-lg font-bold text-[#10233F] mb-1">
              Faculty Access Issued
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Faculty account for <strong>{createdFacultyCredentials.name}</strong> is live and authorized for immediate login.
            </p>

            <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] text-left space-y-3 mb-5 font-mono text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Portal URL:</span>
                <span className="text-[#10233F] font-bold select-all">/teacher/login</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Official Email / Gmail:</span>
                <span className="text-[#10233F] font-bold select-all">{createdFacultyCredentials.email}</span>
              </div>
              {createdFacultyCredentials.phone && (
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Mobile Phone:</span>
                  <span className="text-[#10233F] font-bold select-all">{createdFacultyCredentials.phone}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Password:</span>
                <span className="text-[#89190E] font-bold select-all bg-white px-2 py-1 rounded-md border border-[#E8DCCB] inline-block mt-0.5">
                  {createdFacultyCredentials.pass}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const msg = `MSI Faculty Login Credentials:\nPortal: ${typeof window !== 'undefined' ? window.location.origin : ''}/teacher/login\nEmail: ${createdFacultyCredentials.email}\nPassword: ${createdFacultyCredentials.pass}\nStatus: Active & Authorized`;
                    navigator.clipboard.writeText(msg);
                    showToast('Credentials copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#10233F] hover:bg-[#FFF9EF] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[#89190E]" />
                  <span>Copy Credentials</span>
                </button>
                <Link
                  href="/teacher/login"
                  target="_blank"
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open Login</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setCreatedFacultyCredentials(null)}
                className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Create Course & Assign Faculty Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowAddCourseModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#89190E]">
                  LMS Course Builder
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Create Course & Assign Faculty Jurist
                </h3>
                <p className="text-xs text-gray-500">
                  Super Admin configures curriculum, fees, and assigns certified faculty to lead lectures.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Course Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. PCS-J Comprehensive Judicial Services Foundation 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Headline / Catchphrase
                </label>
                <input
                  type="text"
                  value={newCourseHeadline}
                  onChange={(e) => setNewCourseHeadline(e.target.value)}
                  placeholder="e.g. Prelims + Mains Integrated Legal Answer Writing Mastery"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Academic Stream / Category
                  </label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="Judiciary">Judiciary (PCS-J / HJS)</option>
                    <option value="Law Entrance">Law Entrance (CLAT / AILET)</option>
                    <option value="Criminal Law">Criminal Law & CrPC / BNS</option>
                    <option value="Constitutional Law">Constitutional Law & Doctrines</option>
                    <option value="Cyber Law">Cyber Law & Digital Evidence</option>
                    <option value="Postgraduate">Postgraduate LL.M Specialization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Assign Faculty Instructor *
                  </label>
                  <select
                    value={newCourseTeacherId}
                    onChange={(e) => setNewCourseTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#89190E] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="">-- Choose Instructor --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.designation || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Enrolment Fee (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newCoursePrice}
                    onChange={(e) => setNewCoursePrice(e.target.value)}
                    placeholder="4999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Original Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newCourseOriginalPrice}
                    onChange={(e) => setNewCourseOriginalPrice(e.target.value)}
                    placeholder="14999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-gray-500 focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Level
                  </label>
                  <select
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced Judicial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Course Synopsis & Syllabus Notes
                </label>
                <textarea
                  rows={2}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="Overview of syllabus, bare act coverage, landmark judgments, and mock test schedules."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              {/* Course Thumbnail Image Upload (Audio 3 / User Request) */}
              <div className="p-3.5 rounded-2xl bg-[#F0F3FF] border border-[#E8EEFF] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#10233F]">
                      Course Thumbnail Image / Cover *
                    </label>
                    <span className="text-[10px] text-gray-500">
                      Upload from computer, enter URL, or choose an academic preset.
                    </span>
                  </div>
                  {newCourseThumbnail && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Thumbnail Selected
                    </span>
                  )}
                </div>

                {/* Upload Button + URL Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="course-thumbnail-upload"
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#89190E] bg-white hover:bg-[#89190E]/5 text-[#89190E] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image File (PNG / JPG / WEBP)</span>
                    </label>
                    <input
                      id="course-thumbnail-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          showToast('Please select a valid image file.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          if (result) {
                            setNewCourseThumbnail(result);
                            setNewCourseThumbnailPreview(result);
                            showToast('Course thumbnail uploaded successfully!');
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newCourseThumbnail.startsWith('data:') ? '' : newCourseThumbnail}
                      onChange={(e) => {
                        setNewCourseThumbnail(e.target.value);
                        setNewCourseThumbnailPreview(e.target.value);
                      }}
                      placeholder="Or paste image URL (e.g., https://...)"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E8DCCB] bg-white text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                    />
                  </div>
                </div>

                {/* Preset Options */}
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase">
                    Or Quick Select MSI Academic Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        name: 'Judiciary & Law Books',
                        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
                      },
                      {
                        name: 'Courtroom Gavel',
                        url: 'https://images.unsplash.com/photo-1453733197781-704fa5988075?auto=format&fit=crop&w=1200&q=80',
                      },
                      {
                        name: 'Lady Justice & Library',
                        url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setNewCourseThumbnail(preset.url);
                          setNewCourseThumbnailPreview(preset.url);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          newCourseThumbnail === preset.url
                            ? 'bg-[#89190E] text-white border-[#89190E]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#89190E]'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                {(newCourseThumbnailPreview || newCourseThumbnail) && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-200">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={newCourseThumbnailPreview || newCourseThumbnail}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] truncate">
                      <span className="font-bold text-[#10233F] block">Live Thumbnail Preview</span>
                      <span className="text-gray-400 font-mono text-[9px] truncate block max-w-xs">
                        {newCourseThumbnail.startsWith('data:')
                          ? 'Uploaded File (Base64 Data URI)'
                          : newCourseThumbnail}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Initial Recorded Lecture Module */}
              <div className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] space-y-3">
                <span className="text-[11px] font-bold text-[#10233F] block uppercase tracking-wider">
                  Initial Module 1 Recorded Lecture:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                      Lecture Title
                    </label>
                    <input
                      type="text"
                      value={newCourseLectureTitle}
                      onChange={(e) => setNewCourseLectureTitle(e.target.value)}
                      placeholder="Orientation & Landmark Doctrines"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8DCCB] text-xs bg-white text-[#10233F] focus:outline-none focus:border-[#89190E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                      Video Stream URL (MP4 / BunnyCDN / HLS)
                    </label>
                    <input
                      type="url"
                      value={newCourseLectureVideo}
                      onChange={(e) => setNewCourseLectureVideo(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8DCCB] text-xs bg-white text-[#10233F] focus:outline-none focus:border-[#89190E]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCourse}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingCourse ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  <span>Publish Course & Assign Faculty</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Add Recorded Lecture Modal to Existing Course */}
      {selectedCourseForLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
            <button
              onClick={() => setSelectedCourseForLecture(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#89190E]">
                  Course LMS
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Add Lecture to {selectedCourseForLecture.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Instructor: <strong>{selectedCourseForLecture.instructorName}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleAddLectureToCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  required
                  value={newLectureTitle}
                  onChange={(e) => setNewLectureTitle(e.target.value)}
                  placeholder="e.g. Lecture 4: Section 164 Statements & Police Diary"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newLectureDuration}
                    onChange={(e) => setNewLectureDuration(e.target.value)}
                    placeholder="45 mins"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-[#10233F]">
                      Video Stream / Cloud URL
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewLectureVideoUrl(
                          'https://player.mediadelivery.net/play/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc'
                        )
                      }
                      className="text-[10px] text-[#89190E] font-bold hover:underline cursor-pointer"
                    >
                      â­ Bunny Stream Preset
                    </button>
                  </div>
                  <input
                    type="url"
                    value={newLectureVideoUrl}
                    onChange={(e) => setNewLectureVideoUrl(e.target.value)}
                    placeholder="https://player.mediadelivery.net/play/782652/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Lecture Summary & Study Points
                </label>
                <textarea
                  rows={2}
                  value={newLectureSummary}
                  onChange={(e) => setNewLectureSummary(e.target.value)}
                  placeholder="Key concepts covered, relevant case laws, and bare act sections."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForLecture(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLecture}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingLecture ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Upload & Attach Lecture</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ MODAL 1: EDIT COURSE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {courseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setCourseToEdit(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Course Editor
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Update Course Program & Details
                </h3>
                <p className="text-xs text-gray-500">
                  Modify title, pricing, assigned faculty instructor, and curriculum specs.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Course Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Headline / Catchphrase
                </label>
                <input
                  type="text"
                  value={editCourseHeadline}
                  onChange={(e) => setEditCourseHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Academic Stream / Category
                  </label>
                  <select
                    value={editCourseCategory}
                    onChange={(e) => setEditCourseCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="Judiciary">Judiciary (PCS-J / HJS)</option>
                    <option value="Law Entrance">Law Entrance (CLAT / AILET)</option>
                    <option value="Criminal Law">Criminal Law & CrPC / BNS</option>
                    <option value="Constitutional Law">Constitutional Law & Doctrines</option>
                    <option value="Cyber Law">Cyber Law & Digital Evidence</option>
                    <option value="Postgraduate">Postgraduate LL.M Specialization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Assign Faculty Instructor *
                  </label>
                  <select
                    value={editCourseTeacherId}
                    onChange={(e) => setEditCourseTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#89190E] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="">-- Choose Instructor --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.designation || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editCoursePrice}
                    onChange={(e) => setEditCoursePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#89190E] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editCourseOriginalPrice}
                    onChange={(e) => setEditCourseOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-gray-500 focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Level
                  </label>
                  <select
                    value={editCourseLevel}
                    onChange={(e) => setEditCourseLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced Judicial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={editCourseThumbnail}
                  onChange={(e) => setEditCourseThumbnail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Course Synopsis & Description
                </label>
                <textarea
                  rows={3}
                  value={editCourseDesc}
                  onChange={(e) => setEditCourseDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCourseToEdit(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEditCourse}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingEditCourse ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Course Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ MODAL 2: EDIT FACULTY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {facultyToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setFacultyToEdit(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Faculty Administration
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Update Faculty Member Profile
                </h3>
                <p className="text-xs text-gray-500">
                  Edit name, login credentials, specialization, and department designation.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateFaculty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFacultyName}
                  onChange={(e) => setEditFacultyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Official / Gmail Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFacultyEmail}
                    onChange={(e) => setEditFacultyEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editFacultyPhone}
                    onChange={(e) => setEditFacultyPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Specialization / Core Subjects
                </label>
                <input
                  type="text"
                  value={editFacultySpecialization}
                  onChange={(e) => setEditFacultySpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editFacultyDesignation}
                    onChange={(e) => setEditFacultyDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={editFacultyExp}
                    onChange={(e) => setEditFacultyExp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Login Password
                </label>
                <input
                  type="text"
                  value={editFacultyPassword}
                  onChange={(e) => setEditFacultyPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#89190E] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setFacultyToEdit(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEditFaculty}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingEditFaculty ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Faculty Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ MODAL 3: EDIT STUDENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {studentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setStudentToEdit(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Student Database
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Update Student Record & Password
                </h3>
                <p className="text-xs text-gray-500">
                  Modify registered student details, batch, and portal login credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  10-Digit Mobile Number (Login ID)
                </label>
                <input
                  type="text"
                  disabled
                  value={editStudentPhone}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-xs font-mono font-bold text-gray-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Mobile number is the unique key.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Enrolled Stream / Course Batch *
                </label>
                <select
                  value={editStudentStream}
                  onChange={(e) => setEditStudentStream(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                >
                  <option value="PCS-J Punjab Judicial Services">PCS-J Punjab Judicial Services</option>
                  <option value="CLAT Foundation">CLAT Foundation (UG / PG)</option>
                  <option value="Delhi Judicial Services (DJS)">Delhi Judicial Services (DJS)</option>
                  <option value="Haryana Judicial Services (HCS-JB)">Haryana Judicial Services (HCS-JB)</option>
                  <option value="AILET & SLAT National Law Batch">AILET & SLAT National Law Batch</option>
                  <option value="LL.M Entrance & UGC-NET Law">LL.M Entrance & UGC-NET Law</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editStudentEmail}
                  onChange={(e) => setEditStudentEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Portal Login Password
                </label>
                <input
                  type="text"
                  value={editStudentPassword}
                  onChange={(e) => setEditStudentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#89190E] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Total Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStudentTotalFee}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditStudentTotalFee(val);
                      const t = Number(val) || 0;
                      const p = Number(editStudentPaidFee) || 0;
                      setEditStudentDueFee(String(Math.max(0, t - p)));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono font-bold text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStudentPaidFee}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditStudentPaidFee(val);
                      const t = Number(editStudentTotalFee) || 0;
                      const p = Number(val) || 0;
                      setEditStudentDueFee(String(Math.max(0, t - p)));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:border-[#89190E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Balance Due (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStudentDueFee}
                    onChange={(e) => setEditStudentDueFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono font-bold text-[#89190E] focus:outline-none focus:border-[#89190E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Next Due Date
                </label>
                <input
                  type="text"
                  value={editStudentNextDueDate}
                  onChange={(e) => setEditStudentNextDueDate(e.target.value)}
                  placeholder="e.g. 15 Dec 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStudentToEdit(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEditStudent}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingEditStudent ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Student Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ MODAL 4: EDIT RECEPTIONIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {receptionistToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setReceptionistToEdit(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Front Desk Staff
                </span>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Update Receptionist Credentials
                </h3>
                <p className="text-xs text-gray-500">
                  Update receptionist staff login credentials and contact details.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateReceptionist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Receptionist Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editReceptionistName}
                  onChange={(e) => setEditReceptionistName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  10-Digit Mobile Number (Login ID) *
                </label>
                <input
                  type="text"
                  required
                  value={editReceptionistPhone}
                  onChange={(e) => setEditReceptionistPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={editReceptionistEmail}
                  onChange={(e) => setEditReceptionistEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                  Login Password
                </label>
                <input
                  type="text"
                  value={editReceptionistPassword}
                  onChange={(e) => setEditReceptionistPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#89190E] focus:outline-none focus:border-[#89190E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReceptionistToEdit(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEditReceptionist}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingEditReceptionist ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Receptionist Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
