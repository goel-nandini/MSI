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
} from 'lucide-react';
import {
  UdemyCourse,
  UdemyLecture,
  UdemySection,
  TeacherApprovalRecord,
  CourseEnrollment,
  getStoredCourses,
  saveStoredCourses,
  getStoredTeachers,
  saveStoredTeachers,
  getStoredEnrollments,
  approveTeacherAction,
  rejectTeacherAction,
  assignCoursesToTeacherAction,
  LMS_SYNC_EVENT,
} from '@/lib/lmsStore';
import { Lead } from '@/components/reception/data/leadsMockData';
import { GalleryItem } from '../api/admin/gallery/route';
import { AdminTransaction } from '../api/admin/transactions/route';


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
  const [courses, setCourses] = useState<UdemyCourse[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3600);
  };

  // ── Modals State ────────────────────────────────────────────────────────────
  // 1. Add Student Modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentStream, setNewStudentStream] = useState('PCS-J Punjab Judicial Services');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('Student@MSI2026');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // 2. View Student Details Modal
  const [selectedStudentForView, setSelectedStudentForView] = useState<RegisteredStudent | null>(null);

  // 3. Delete Student Confirmation Modal
  const [studentToDelete, setStudentToDelete] = useState<RegisteredStudent | null>(null);

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

  // 6. Delete Gallery Item
  const [galleryToDelete, setGalleryToDelete] = useState<GalleryItem | null>(null);

  // 7. Teacher Assignment / Approval Modal
  const [assigningTeacher, setAssigningTeacher] = useState<TeacherApprovalRecord | null>(null);
  const [teacherSelectedCourseIds, setTeacherSelectedCourseIds] = useState<string[]>([]);

  // 8. Add Faculty Modal
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherSpecialization, setNewTeacherSpecialization] = useState('Constitutional Law & Jurisprudence');
  const [newTeacherExp, setNewTeacherExp] = useState('8');
  const [newTeacherPassword, setNewTeacherPassword] = useState('MSI@Faculty2026');
  const [createdFacultyCredentials, setCreatedFacultyCredentials] = useState<{
    name: string;
    email: string;
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
  const [newCourseLectureTitle, setNewCourseLectureTitle] = useState('Orientation & Landmark Constitutional Doctrines');
  const [newCourseLectureVideo, setNewCourseLectureVideo] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  // 10. Add Recorded Lecture Modal to existing Course
  const [selectedCourseForLecture, setSelectedCourseForLecture] = useState<UdemyCourse | null>(null);
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureVideoUrl, setNewLectureVideoUrl] = useState('');
  const [newLectureDuration, setNewLectureDuration] = useState('45 mins');
  const [newLectureSummary, setNewLectureSummary] = useState('');
  const [isSubmittingLecture, setIsSubmittingLecture] = useState(false);


  // ── Authentication Check ────────────────────────────────────────────────────
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('msi_superadmin_logged_in') === 'true';
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
    setIsAuthenticated(false);
    showToast('Logged out of Super Admin Master Portal.');
  };

  // ── Live Clock ─────────────────────────────────────────────────────────────
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

  // ── Master Data Fetchers ───────────────────────────────────────────────────
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

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchStudents(),
      fetchLeads(),
      fetchGallery(),
      fetchTransactions(),
      new Promise<void>((resolve) => {
        setTeachers(getStoredTeachers());
        setCourses(getStoredCourses());
        setEnrollments(getStoredEnrollments());
        resolve();
      }),
    ]);
    setIsRefreshing(false);
  }, [fetchStudents, fetchLeads, fetchGallery, fetchTransactions]);


  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();

      const handleSync = () => {
        refreshAllData();
      };

      window.addEventListener(LMS_SYNC_EVENT, handleSync);
      window.addEventListener('msi_leads_sync', handleSync);
      window.addEventListener('msi_gallery_sync', handleSync);
      window.addEventListener('storage', handleSync);

      return () => {
        window.removeEventListener(LMS_SYNC_EVENT, handleSync);
        window.removeEventListener('msi_leads_sync', handleSync);
        window.removeEventListener('msi_gallery_sync', handleSync);
        window.removeEventListener('storage', handleSync);
      };
    }
  }, [isAuthenticated, refreshAllData]);

  // ── Action Handlers ────────────────────────────────────────────────────────
  // 1. Add Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentPhone.trim()) {
      showToast('Please enter both student name and 10-digit mobile number.');
      return;
    }

    setIsSubmittingStudent(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName.trim(),
          phone: newStudentPhone.trim(),
          stream: newStudentStream,
          email: newStudentEmail.trim(),
          password: newStudentPassword.trim() || 'Student@MSI2026',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Student ${newStudentName} registered and saved to disk.`);
        setShowAddStudentModal(false);
        setNewStudentName('');
        setNewStudentPhone('');
        setNewStudentEmail('');
        fetchStudents();
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
    try {
      const res = await fetch(`/api/admin/students?phone=${studentToDelete.phone}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Student account (${studentToDelete.name}) permanently removed from disk.`);
        setStudentToDelete(null);
        fetchStudents();
        try {
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      } else {
        showToast(data.message || 'Failed to delete student.');
      }
    } catch (err) {
      showToast('Network error while deleting student.');
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

  // 3b. Bulk Import Leads (Excel / CSV)
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

  // 4. Add Gallery Media (Direct File Upload & Instant Sync)
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setNewGalleryImage(base64);
      }
    };
    reader.readAsDataURL(file);
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
        fetchGallery();
        try {
          window.dispatchEvent(new Event('msi_gallery_sync'));
          window.dispatchEvent(new Event('storage'));
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
        fetchGallery();
        try {
          window.dispatchEvent(new Event('msi_gallery_sync'));
          window.dispatchEvent(new Event('storage'));
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

  const handleSaveCourseAssignments = () => {
    if (!assigningTeacher) return;
    const updated = assignCoursesToTeacherAction(assigningTeacher.id, teacherSelectedCourseIds);
    setTeachers(updated);
    setAssigningTeacher(null);
    showToast(`Courses assigned to ${assigningTeacher.name} successfully.`);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) {
      showToast('Please provide faculty name and email.');
      return;
    }

    const tempPassword = newTeacherPassword.trim() || 'MSI@Faculty2026';
    const current = getStoredTeachers();
    const newFaculty: TeacherApprovalRecord = {
      id: `fac-${Date.now()}`,
      name: newTeacherName.trim(),
      email: newTeacherEmail.trim(),
      phone: '+91 98000 00000',
      avatarUrl: '/images/faculty/faculty-1.webp',
      department: 'School of Law & Judicial Studies',
      designation: 'Professor of Law / Senior Jurist',
      qualifications: 'LL.M / Ph.D in Law',
      experienceYears: Number(newTeacherExp) || 8,
      stream: 'Law',
      bio: `Distinguished faculty member specializing in ${newTeacherSpecialization}.`,
      specialization: newTeacherSpecialization,
      sampleLectureTitle: `${newTeacherSpecialization} — Landmark Case Briefs`,
      sampleLectureDuration: '45m',
      status: 'approved',
      assignedCourseIds: ['crs-udemy-pcsj', 'crs-udemy-clat'],
      applicationDate: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: 'MSI Super Admin',
      rating: 4.9,
      studentsCount: 120,
      password: tempPassword,
      temporaryPassword: tempPassword,
      mustChangePassword: true,
    };

    const updated = [newFaculty, ...current];
    saveStoredTeachers(updated);
    setTeachers(updated);
    setShowAddTeacherModal(false);
    setNewTeacherName('');
    setNewTeacherEmail('');
    setCreatedFacultyCredentials({
      name: newFaculty.name,
      email: newFaculty.email,
      pass: tempPassword,
    });
    showToast(`Faculty member ${newTeacherName} created! Temporary password assigned.`);
  };

  // 7. Create Course & Assign Faculty (LMS)
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      showToast('Please provide course program title.');
      return;
    }

    setIsSubmittingCourse(true);
    try {
      const currentCourses = getStoredCourses();
      const assignedFaculty =
        teachers.find((t) => t.id === newCourseTeacherId) || teachers[0] || {
          id: 'fac-01',
          name: 'Dr. Ekta Gahlawat',
          designation: 'Professor of Law & Constitutional Jurist',
          avatarUrl: '/images/faculty/faculty-1.webp',
        };

      const courseId = `crs-msi-${Date.now().toString().slice(-6)}`;
      const newCourse: UdemyCourse = {
        id: courseId,
        slug: newCourseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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
        thumbnail: '/images/courses/clat.jpg',
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

      const updatedCourses = [newCourse, ...currentCourses];
      saveStoredCourses(updatedCourses);
      setCourses(updatedCourses);

      // Auto-assign to faculty
      if (assignedFaculty) {
        const currentTeachers = getStoredTeachers();
        const updatedTeachers = currentTeachers.map((t) => {
          if (t.id === assignedFaculty.id) {
            return {
              ...t,
              assignedCourseIds: Array.from(new Set([...(t.assignedCourseIds || []), courseId])),
            };
          }
          return t;
        });
        saveStoredTeachers(updatedTeachers);
        setTeachers(updatedTeachers);
      }

      setShowAddCourseModal(false);
      setNewCourseTitle('');
      setNewCourseHeadline('');
      setNewCourseDesc('');
      showToast(`Course "${newCourse.title}" published and assigned to ${assignedFaculty.name}!`);
    } catch (err) {
      showToast('Error creating course program.');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  // 8. Add Lecture to existing Course
  const handleAddLectureToCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLecture || !newLectureTitle.trim()) {
      showToast('Please specify lecture title.');
      return;
    }

    setIsSubmittingLecture(true);
    try {
      const currentCourses = getStoredCourses();
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

          const newLec: UdemyLecture = {
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

          return {
            ...crs,
            sections,
            totalLectures: totalLecs,
            updatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          };
        }
        return crs;
      });

      saveStoredCourses(updatedCourses);
      setCourses(updatedCourses);
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


  // ── Filtered Search Results ────────────────────────────────────────────────
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

  // ── Render Gatekeeper if Unauthenticated ───────────────────────────────────
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

  // ── Render Authenticated Master Dashboard ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#071B37] antialiased flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10233F] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#EFC988]/50 flex items-center gap-3 text-xs sm:text-sm font-semibold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#EFC988] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Fixed Sidebar (Matching code.html design) ────────────────────────── */}
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

      {/* ── Main View Container ─────────────────────────────────────────────── */}
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

        {/* ── Tab Content ────────────────────────────────────────────────────── */}
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
                    Harshit, Ankit & Registered
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
                      ₹4.85L
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Razorpay Verified</span>
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
                          Razorpay Live Gateway Reconciliation
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
                          ₹4,85,000
                        </div>
                        <span className="text-[10px] text-gray-500">142 settled orders</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#F0F3FF]">
                        <span className="text-[10px] uppercase font-bold text-[#8C716C] block">
                          Avg Order Value
                        </span>
                        <div className="font-serif text-xl font-bold text-[#071B37] mt-0.5">
                          ₹34,154
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
                        ● 1 In Progress
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

              {/* Students Table */}
              <div className="bg-white rounded-2xl border border-[#E8EEFF] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F0F3FF] uppercase font-bold text-[10px] text-[#8C716C] tracking-wider border-b border-[#E8EEFF]">
                        <th className="py-3.5 px-4">Student Name</th>
                        <th className="py-3.5 px-4">Mobile Number</th>
                        <th className="py-3.5 px-4">Enrolled Stream / Batch</th>
                        <th className="py-3.5 px-4">Email ID</th>
                        <th className="py-3.5 px-4">Registration Date</th>
                        <th className="py-3.5 px-4">Portal Role</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEFF]">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-500">
                            No registered students found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((stu) => (
                          <tr key={stu.id || stu.phone} className="hover:bg-[#F0F3FF]/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#89190E]/10 text-[#89190E] flex items-center justify-center font-bold text-xs shrink-0">
                                  {stu.name.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-bold text-[#071B37]">{stu.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#10233F]">
                              +91 {stu.phone.slice(0, 5)} {stu.phone.slice(5)}
                            </td>
                            <td className="py-3.5 px-4 text-[#58413D] font-medium">
                              {stu.stream}
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                              {stu.email || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                              {stu.registeredAt
                                ? new Date(stu.registeredAt).toLocaleDateString('en-IN')
                                : 'Active'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  stu.role === 'reception'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {stu.role === 'reception' ? 'Reception Desk' : 'Verified Student'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedStudentForView(stu)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#89190E] hover:text-white text-gray-600 transition-colors cursor-pointer"
                                  title="View Complete Student Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
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
                        ))
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
                    onClick={() => setShowMetaWebhookModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] hover:bg-[#FFF9EF] text-[#10233F] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[#89190E]" />
                    <span>Meta & Google Webhook</span>
                  </button>

                  <button
                    onClick={() => setShowBulkLeadModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FFF9EF] hover:bg-[#FCEFD8] border border-[#EFC988] text-[#89190E] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>📥 Bulk Import (Excel / CSV)</span>
                  </button>

                  <button
                    onClick={() => setShowAddLeadModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Generate New Lead</span>
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
                        filteredLeads.map((ld) => (
                          <tr key={ld.id} className="hover:bg-[#F0F3FF]/50 transition-colors">
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
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  ld.status === 'Converted'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ld.status === 'Follow-up'
                                    ? 'bg-amber-100 text-amber-800'
                                    : ld.status === 'Dead'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {ld.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-700 font-medium">
                              {ld.agent}
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                              {ld.latestRemark}
                            </td>
                          </tr>
                        ))
                      )}
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
                          <strong>Instructor:</strong> {crs.instructorName}
                        </div>
                        <div>
                          <strong>Curriculum:</strong> {crs.sections?.length || 0} Modules • {crs.totalDuration}
                        </div>
                        <div>
                          <strong>Rating:</strong> ⭐ {crs.rating} ({crs.reviewCount} reviews)
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 mt-4 flex items-center justify-between text-xs gap-2">
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
                        <button
                          onClick={() => setGalleryToDelete(item)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TRANSACTIONS & RECEIPTS (FROM code.html) */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8EEFF] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#89190E] uppercase tracking-wider mb-1">
                    <Receipt className="w-4 h-4" />
                    <span>Admissions Financial Settlement</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#071B37]">
                    Recent Transactions & Receipts
                  </h2>
                  <p className="text-xs text-[#58413D] mt-0.5">
                    Live admissions fee receipts captured via institutional payment gateway.
                  </p>
                </div>
              </div>

              {/* Table matching code.html */}
              <div className="bg-white rounded-2xl border border-[#E8EEFF] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F0F3FF] uppercase font-bold text-[10px] text-[#8C716C] tracking-wider border-b border-[#E8EEFF]">
                        <th className="py-3.5 px-4">Transaction ID</th>
                        <th className="py-3.5 px-4">Student Name</th>
                        <th className="py-3.5 px-4">Course Enrolled</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Payment Method</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEFF]">
                      {transactions.length === 0 ? (
                        <tr className="hover:bg-[#F0F3FF]/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#89190E]">
                            #TXN-88491
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#071B37]">
                            Harshit
                          </td>
                          <td className="py-3.5 px-4 text-[#58413D]">
                            Legal Reasoning for CLAT
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#071B37]">
                            ₹4,999
                          </td>
                          <td className="py-3.5 px-4 text-[#58413D]">
                            Razorpay UPI (Test Gateway)
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Captured (Test Mode)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                            Today, 02:45 PM
                          </td>
                        </tr>
                      ) : (
                        transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-[#F0F3FF]/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#89190E]">
                              {txn.id}
                              <span className="block text-[9px] font-mono text-gray-400">
                                {txn.razorpayPaymentId}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#071B37]">
                              {txn.studentName}
                            </td>
                            <td className="py-3.5 px-4 text-[#58413D] max-w-xs truncate font-medium">
                              {txn.courseTitle}
                            </td>
                            <td className="py-3.5 px-4 font-serif font-extrabold text-[#071B37]">
                              ₹{txn.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 text-[#58413D]">
                              {txn.paymentMethod}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {txn.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                              {txn.timestamp}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>

                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
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
                  Password
                </label>
                <input
                  type="text"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="Student@MSI2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
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
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Enrolled Batch:</span>
                <span className="font-semibold text-[#89190E]">
                  {selectedStudentForView.profile?.batch || selectedStudentForView.stream}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="px-5 py-2 rounded-xl bg-[#10233F] text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
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
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Delete
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

      {/* 4b. Bulk Import Leads Modal (Excel / CSV) */}
      {showBulkLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowBulkLeadModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#10233F]">
                  Bulk Import Leads (Excel / CSV)
                </h3>
                <p className="text-xs text-gray-500">
                  Import multiple inbound leads from Meta, Google Ads, or campus workshop spreadsheets.
                </p>
              </div>
            </div>

            <form onSubmit={handleBulkImportLeads} className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#10233F] mb-1">
                    Default Source
                  </label>
                  <select
                    value={bulkDefaultSource}
                    onChange={(e) => setBulkDefaultSource(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F]"
                  >
                    <option value="Meta Ads (Facebook/Instagram)">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="College Workshop">College Workshop</option>
                    <option value="Local Walk-in">Local Walk-in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#10233F] mb-1">
                    Default Course
                  </label>
                  <select
                    value={bulkDefaultCourse}
                    onChange={(e) => setBulkDefaultCourse(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F]"
                  >
                    <option value="PCS-J Punjab Judicial Services">PCS-J Punjab</option>
                    <option value="CLAT 2027 (2-Yr Class)">CLAT 2027</option>
                    <option value="CLAT 2026 (1-Yr Target)">CLAT 2026</option>
                    <option value="Judiciary Mains Answer Writing">Judiciary Mains</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#10233F] mb-1">
                    Telecaller Assignee
                  </label>
                  <select
                    value={bulkDefaultAgent}
                    onChange={(e) => setBulkDefaultAgent(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F]"
                  >
                    <option value="Auto Round-Robin Distribution">Auto Round-Robin</option>
                    <option value="Harshit (Reception Desk)">Harshit</option>
                    <option value="Counselor Priya (Law Admissions Desk)">Counselor Priya</option>
                    <option value="Counselor Rohit (Judiciary Services Desk)">Counselor Rohit</option>
                    <option value="Counselor Simran (CLAT & Entrance Desk)">Counselor Simran</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-[#10233F]">
                    Paste CSV or Tab-Separated Excel Data
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkLeadsText(
                        `Priyanshu Verma, 9876543210, Chandigarh, PCS-J Punjab Judicial Services, Meta Ads, Harshit (Reception Desk), High intent lead\nRohan Khanna, 9812345678, Mohali, CLAT 2027 (2-Yr Class), Google Ads, Counselor Priya (Law Admissions Desk), Wants weekend demo batch\nSimran Kaur, 9898765432, Ludhiana, PCS-J Punjab Judicial Services, College Workshop, Counselor Rohit (Judiciary Services Desk), Met at campus law seminar`
                      );
                    }}
                    className="text-xs text-[#89190E] font-bold hover:underline cursor-pointer"
                  >
                    Load Sample Excel Data
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  value={bulkLeadsText}
                  onChange={(e) => setBulkLeadsText(e.target.value)}
                  placeholder="Format: Name, Mobile, City, Course, Source, Assigned Telecaller, Notes&#10;e.g. Rohit Sharma, 9876543210, Chandigarh, PCS-J, Meta Ads, Harshit, Demo requested"
                  className="w-full p-3 rounded-2xl border border-[#E8DCCB] text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  💡 You can copy rows directly from Excel or Google Sheets and paste here.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkLeadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImportingBulk}
                  className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isImportingBulk ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Import All Leads to CRM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  placeholder="e.g. rohit.mehra@msi-institutes.edu.in"
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

              {/* Temporary Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-[#10233F]">
                    Temporary Login Password *
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
                    ⚡ Auto-Generate
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
                  The faculty jurist will use this temporary password for their initial login. On first login, they will be required to change it to their private password.
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
              Share these credentials with <strong>{createdFacultyCredentials.name}</strong>. Upon first login, they will be prompted to set their private password.
            </p>

            <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] text-left space-y-3 mb-5 font-mono text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Portal URL:</span>
                <span className="text-[#10233F] font-bold select-all">/teacher/login</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Official Email:</span>
                <span className="text-[#10233F] font-bold select-all">{createdFacultyCredentials.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Temporary Password:</span>
                <span className="text-[#89190E] font-bold select-all bg-white px-2 py-1 rounded-md border border-[#E8DCCB] inline-block mt-0.5">
                  {createdFacultyCredentials.pass}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const msg = `MSI Faculty Login Credentials:\nPortal: ${typeof window !== 'undefined' ? window.location.origin : ''}/teacher/login\nEmail: ${createdFacultyCredentials.email}\nTemp Password: ${createdFacultyCredentials.pass}\nNote: Please set your new password on first login.`;
                  navigator.clipboard.writeText(msg);
                  showToast('Credentials copied to clipboard!');
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-[#10233F] hover:bg-[#FFF9EF] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[#89190E]" />
                <span>Copy Credentials</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedFacultyCredentials(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#0C2340] hover:bg-[#07172B] text-white text-xs font-bold cursor-pointer"
              >
                Done
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
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Video Stream / Cloud URL
                  </label>
                  <input
                    type="url"
                    value={newLectureVideoUrl}
                    onChange={(e) => setNewLectureVideoUrl(e.target.value)}
                    placeholder="https://..."
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
    </div>
  );
}
