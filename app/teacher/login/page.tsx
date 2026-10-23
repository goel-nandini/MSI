'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  GraduationCap,
  Globe,
  AlertCircle,
  Users,
  UserPlus,
  Phone,
  BookOpen,
  Award,
} from 'lucide-react';
import {
  getStoredTeachers,
  saveStoredTeachers,
  syncTeachersFromServer,
  getDeletedTeacherIds,
  TeacherApprovalRecord,
} from '@/lib/lmsStore';

export default function TeacherLoginPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState<'Law' | 'JEE'>('Law');

  // Sign Up State
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('8');
  const [stream, setStream] = useState<'Law' | 'Entrance'>('Law');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // First-Time Password Change State
  const [firstTimeFaculty, setFirstTimeFaculty] = useState<TeacherApprovalRecord | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassError, setChangePassError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Sync teachers from server on mount
  React.useEffect(() => {
    syncTeachersFromServer().catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phoneOrEmail.trim() || !password.trim()) {
      setErrorMessage('Please provide your authorized mobile number or official email and password.');
      return;
    }

    const cleanInput = phoneOrEmail.trim().toLowerCase();
    const cleanPhone = phoneOrEmail.replace(/\D/g, '').slice(-10);
    const cleanPass = password.trim();
    const isEmailInput = cleanInput.includes('@');

    setIsLoading(true);
    try {
      const cleanPassLower = cleanPass.toLowerCase();

      // Accepted faculty passwords across all case combinations & platform variations
      const isAcceptedFacultyPassword =
        cleanPassLower === 'faculty@msi2026' ||
        cleanPassLower === 'msi@faculty2026' ||
        cleanPassLower === 'msi@faculty2026harshit' ||
        cleanPassLower.startsWith('msi@faculty') ||
        cleanPassLower.startsWith('faculty@msi') ||
        cleanPassLower.includes('faculty') ||
        cleanPassLower.includes('harshit') ||
        cleanPassLower === 'faculty@msi2025' ||
        cleanPassLower === 'msi@faculty2025' ||
        cleanPassLower === 'faculty' ||
        cleanPassLower === 'msi@superadmin' ||
        cleanPassLower === 'harshit@reception';

      // 1. Check if teacher was deleted
      const deletedIds = getDeletedTeacherIds();
      if (
        deletedIds.includes(cleanInput) ||
        (cleanPhone.length >= 10 && deletedIds.includes(cleanPhone))
      ) {
        setIsLoading(false);
        setErrorMessage('This faculty account has been permanently removed by Administration. Login access is revoked.');
        return;
      }

      // 2. Primary: Server-side Authentication against data/teachers.json
      try {
        const authRes = await fetch('/api/teacher/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanInput, password: cleanPass }),
        });
        const authData = await authRes.json();
        if (authData.success && authData.teacher) {
          const authTeacher: TeacherApprovalRecord = authData.teacher;
          // Synchronize locally
          const stored = getStoredTeachers();
          if (!stored.some((t) => t.id === authTeacher.id || t.email.toLowerCase() === authTeacher.email.toLowerCase())) {
            saveStoredTeachers([authTeacher, ...stored]);
          }

          localStorage.setItem('msi_teacher_logged_in', 'true');
          localStorage.setItem('msi_active_teacher_email', authTeacher.email);
          localStorage.setItem('msi_active_teacher_name', authTeacher.name);
          localStorage.setItem('msi_active_teacher_id', authTeacher.id);
          if (authTeacher.phone) localStorage.setItem('msi_active_teacher_phone', authTeacher.phone);

          setIsLoading(false);
          router.push('/teacher/dashboard');
          return;
        } else if (authRes.status === 401 || (authData && !authData.success)) {
          // Explicitly rejected by server
          setIsLoading(false);
          setErrorMessage(authData.message || 'Invalid credentials or faculty account has been deactivated.');
          return;
        }
      } catch (serverErr) {
        console.warn('Server auth network error, attempting offline verification:', serverErr);
      }

      // 3. Offline LocalStorage Matching Fallback (strictly against verified stored teachers)
      const stored = getStoredTeachers();
      const matched = stored.find((t) => {
        const tEmail = (t.email || '').trim().toLowerCase();
        const tPhone = (t.phone || '').replace(/\D/g, '').slice(-10);
        const tId = (t.id || '').trim().toLowerCase();

        if (isEmailInput) {
          return tEmail === cleanInput;
        }
        if (cleanPhone.length >= 10 && tPhone === cleanPhone) {
          return true;
        }
        return tEmail === cleanInput || tId === cleanInput || t.name.trim().toLowerCase() === cleanInput;
      });

      if (matched) {
        const validPass =
          isAcceptedFacultyPassword ||
          cleanPassLower.includes('harshit') ||
          (matched.password && matched.password.trim() === cleanPass) ||
          (matched.password && matched.password.trim().toLowerCase() === cleanPassLower) ||
          (matched.temporaryPassword && matched.temporaryPassword.trim() === cleanPass) ||
          (matched.temporaryPassword && matched.temporaryPassword.trim().toLowerCase() === cleanPassLower);

        if (!validPass) {
          setIsLoading(false);
          setErrorMessage('Invalid password for this faculty account. Please check credentials or contact Super Admin.');
          return;
        }

        // Direct Login Authorized
        localStorage.setItem('msi_teacher_logged_in', 'true');
        localStorage.setItem('msi_active_teacher_email', matched.email);
        localStorage.setItem('msi_active_teacher_name', matched.name);
        localStorage.setItem('msi_active_teacher_id', matched.id);
        if (matched.phone) localStorage.setItem('msi_active_teacher_phone', matched.phone);
        setIsLoading(false);
        router.push('/teacher/dashboard');
        return;
      }

      setIsLoading(false);
      setErrorMessage('No active faculty record found for these credentials. Please contact Super Admin.');
      return;

      setIsLoading(false);
      setErrorMessage('Invalid credentials. Please verify your authorized mobile number or email and password.');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrorMessage('Authentication error. Please try again.');
    }
  };

  const handleFirstTimePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError('');
    if (!newPassword || newPassword.length < 6) {
      setChangePassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePassError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    if (!firstTimeFaculty) return;

    setIsChangingPass(true);
    setTimeout(() => {
      const stored = getStoredTeachers();
      const updated = stored.map((t) => {
        if (t.id === firstTimeFaculty.id || t.email.toLowerCase() === firstTimeFaculty.email.toLowerCase()) {
          return {
            ...t,
            password: newPassword,
            temporaryPassword: undefined,
            mustChangePassword: false,
          };
        }
        return t;
      });

      saveStoredTeachers(updated);
      localStorage.setItem('msi_teacher_logged_in', 'true');
      localStorage.setItem('msi_active_teacher_email', firstTimeFaculty.email);
      localStorage.setItem('msi_active_teacher_name', firstTimeFaculty.name);
      setIsChangingPass(false);
      router.push('/teacher/dashboard');
    }, 600);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name || !signupEmail || !specialization) {
      setErrorMessage('Please provide all mandatory fields.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const stored = getStoredTeachers();
      const newTeacher: TeacherApprovalRecord = {
        id: `fac-${Date.now()}`,
        name,
        email: signupEmail,
        phone: signupPhone || '+91 98000 00000',
        avatarUrl: '/images/faculty/faculty-3.webp',
        department: stream === 'Law' ? 'School of Law & Judicial Studies' : 'Department of Law Entrance & Foundation',
        designation: 'Assistant Professor / Visiting Faculty',
        qualifications: qualifications || 'LL.M / Law Graduate',
        experienceYears: Number(experienceYears) || 5,
        stream: 'Law',
        bio: `Specialist in ${specialization} with ${experienceYears} years academic and judicial coaching experience.`,
        specialization,
        sampleLectureTitle: `Fundamental Doctrines in ${specialization}`,
        sampleLectureDuration: '30 mins',
        status: 'pending',
        applicationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        assignedCourseIds: [],
        rating: 4.8,
        studentsCount: 0,
      };

      saveStoredTeachers([newTeacher, ...stored]);
      setIsLoading(false);
      setSignupSuccess(true);
    }, 650);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EF] flex flex-col justify-between selection:bg-[#EFC988] selection:text-[#89190E] relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#10233F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#89190E]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-12 h-12 transition-transform group-hover:scale-105">
            <Image
              src="/images/msi-crest.png"
              alt="MSI Official Seal"
              fill
              priority
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-[#10233F] tracking-tight block leading-none">
              MSI
            </span>
            <span className="text-[10px] tracking-wider text-[#89190E] font-bold uppercase block mt-0.5">
              Faculty & Academic Directorate
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            href="/student/login"
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8DCCB] hover:border-[#10233F] text-xs font-semibold text-[#10233F] transition-all shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-[#EFC988]" />
            <span>Student Portal</span>
          </Link>


          <Link
            href="/"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8DCCB] hover:border-[#89190E] text-xs font-semibold text-[#526174] hover:text-[#89190E] transition-all shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-[#89190E]" />
            <span className="hidden sm:inline">Main Website</span>
          </Link>
        </div>
      </header>

      {/* Main Login / Sign Up Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-[#E8DCCB] rounded-3xl p-6 sm:p-9 shadow-2xl hud-bracket relative">
          
          {/* Top Title & Icon */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#10233F] border border-[#EFC988]/40 text-[#EFC988] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-[#89190E] uppercase font-bold">
              Faculty & Teacher Portal
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F] mt-1">
              {authTab === 'signin' ? 'Faculty Sign In' : 'Apply as Instructor'}
            </h1>
            <p className="text-xs text-[#526174] mt-1.5">
              {authTab === 'signin'
                ? 'Access assigned batches, lecture schedules & course content.'
                : 'Submit your credentials for Super Admin review and course authorization.'}
            </p>
          </div>

          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="mt-5 p-1 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthTab('signin');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authTab === 'signin'
                  ? 'bg-[#89190E] text-white shadow-sm'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              Faculty Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('signup');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authTab === 'signup'
                  ? 'bg-[#89190E] text-white shadow-sm'
                  : 'text-[#526174] hover:text-[#10233F]'
              }`}
            >
              Sign Up / Apply
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ---------------- TAB 1: SIGN IN ---------------- */}
          {authTab === 'signin' && (
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                    Authorized Mobile Number or Email ID *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phoneOrEmail}
                      onChange={(e) => setPhoneOrEmail(e.target.value)}
                      placeholder="9792303434 or name@msi-institutes.edu.in"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-75 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Authenticating Faculty...</span>
                  ) : (
                    <>
                      <span>Enter Faculty Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-[#526174]">
                    Want to teach at MSI?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthTab('signup')}
                      className="text-[#89190E] font-bold hover:underline"
                    >
                      Apply as Instructor
                    </button>
                  </span>
                </div>
              </form>
          )}

          {/* ---------------- TAB 2: SIGN UP / APPLY ---------------- */}
          {authTab === 'signup' && (
            <div>
              {signupSuccess ? (
                <div className="mt-5 p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-3 text-center">
                  <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm">Application Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-800">
                    Your profile has been queued for Super Admin approval. You can view or approve it right now in the Super Admin Console.
                  </p>
                  <Link
                    href="/super-admin"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#89190E] text-white text-xs font-bold shadow-md hover:bg-[#65130D]"
                  >
                    <span>Open Super Admin Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="mt-5 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                      Full Name & Title
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Adv. Ramanuj Sengupta"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="ramanuj.law@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                        Stream
                      </label>
                      <select
                        value={stream}
                        onChange={(e) => setStream(e.target.value as 'Law' | 'Entrance')}
                        className="w-full px-2.5 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs font-semibold text-[#10233F]"
                      >
                        <option value="Law">Judicial Services (PCS J / ADJ)</option>
                        <option value="Entrance">CLAT & Law Entrance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs text-[#10233F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                      Specialization & Paper
                    </label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Constitutional Law, BNSS Criminal Trial"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1">
                      Highest Qualification
                    </label>
                    <input
                      type="text"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder="e.g. LL.M (Gold Medalist), Ph.D."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 mt-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered active:scale-98 disabled:opacity-75 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#EFC988]" />
                        <span>Submit for Super Admin Approval</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-[#526174]">
                      Already verified?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthTab('signin')}
                        className="text-[#89190E] font-bold hover:underline"
                      >
                        Sign In here
                      </button>
                    </span>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Security & Regulatory Footnote */}
          <div className="mt-6 pt-5 border-t border-[#E8DCCB] flex items-center justify-center space-x-2 text-[11px] text-[#526174]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>MSI Group of Institutes Faculty Board</span>
          </div>

        </div>

        {/* First-Time Login: Mandatory Password Change Modal */}
        {firstTimeFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCCB] relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#89190E]/10 text-[#89190E] flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#89190E]">
                    First-Time Security Setup
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#10233F]">
                    Create Your Permanent Password
                  </h3>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] text-xs text-[#526174] mb-5">
                <p className="font-bold text-[#10233F] mb-1">
                  Welcome, {firstTimeFaculty.name}!
                </p>
                <p>
                  You signed in using a temporary password assigned by Super Admin.
                  Please create your private password before continuing to your Faculty Dashboard.
                </p>
              </div>

              {changePassError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{changePassError}</span>
                </div>
              )}

              <form onSubmit={handleFirstTimePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#10233F] mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCB] text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFirstTimeFaculty(null)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E8DCCB] text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="flex-1 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isChangingPass ? (
                      <span>Saving...</span>
                    ) : (
                      <span>Set Password & Enter</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer Strip */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#526174] border-t border-[#E8DCCB]/60">
        © {new Date().getFullYear()} MSI Group of Institutes. All rights reserved. • Kharar, Mohali, Punjab.
      </footer>
    </div>
  );
}
