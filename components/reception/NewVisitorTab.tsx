'use client';

import React, { useState, useRef } from 'react';
import {
  UserPlus,
  Smartphone,
  Camera,
  ShieldCheck,
  Building2,
  User,
  Clock,
  Car,
  FileText,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Upload,
} from 'lucide-react';
import {
  Visitor,
  VisitorType,
  MSI_DEPARTMENTS,
  VISITOR_PURPOSES,
  GOVT_ID_TYPES,
  DEMO_VISITOR_PHOTO_FALLBACKS,
  INITIAL_VISITORS,
} from './data/receptionMockData';
import WebcamCaptureModal from './WebcamCaptureModal';
import MobileVerifyModal from './MobileVerifyModal';
import VisitorPassModal from './VisitorPassModal';

interface NewVisitorTabProps {
  onRegisterVisitor: (visitor: Visitor) => void;
  existingVisitors: Visitor[];
}

export default function NewVisitorTab({
  onRegisterVisitor,
  existingVisitors,
}: NewVisitorTabProps) {
  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [visitorType, setVisitorType] = useState<VisitorType>('Parent');
  const [purpose, setPurpose] = useState(VISITOR_PURPOSES[0]);
  const [customPurpose, setCustomPurpose] = useState('');
  const [department, setDepartment] = useState(MSI_DEPARTMENTS[0].department);
  const [hostPerson, setHostPerson] = useState(MSI_DEPARTMENTS[0].hosts[0].name);
  const [govtIdType, setGovtIdType] = useState(GOVT_ID_TYPES[0]);
  const [govtIdNumber, setGovtIdNumber] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [gateNumber, setGateNumber] = useState('Gate 1 (Main Gate)');
  const [remarks, setRemarks] = useState('');

  // Flow verification & media state
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const tabFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotoUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [generatedPassVisitor, setGeneratedPassVisitor] = useState<Visitor | null>(null);

  // Repeat visitor detection state
  const [repeatNotice, setRepeatNotice] = useState<{
    found: boolean;
    pastVisitor?: Visitor;
    visitCount: number;
  }>({ found: false, visitCount: 0 });

  // Get hosts for selected department
  const currentDeptObj = MSI_DEPARTMENTS.find((d) => d.department === department);
  const availableHosts = currentDeptObj ? currentDeptObj.hosts : [];

  // Update department and reset host
  const handleDepartmentChange = (deptName: string) => {
    setDepartment(deptName);
    const foundDept = MSI_DEPARTMENTS.find((d) => d.department === deptName);
    if (foundDept && foundDept.hosts.length > 0) {
      setHostPerson(foundDept.hosts[0].name);
    }
  };

  // Check for repeat visitor whenever mobile number changes (10 digits)
  const handleMobileChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setMobile(clean);
    setIsMobileVerified(false);

    if (clean.length === 10) {
      const match = existingVisitors.find((v) => v.mobile === clean);
      if (match) {
        setRepeatNotice({
          found: true,
          pastVisitor: match,
          visitCount: (match.visitCount || 1) + 1,
        });
      } else {
        setRepeatNotice({ found: false, visitCount: 0 });
      }
    } else {
      setRepeatNotice({ found: false, visitCount: 0 });
    }
  };

  // Auto-fill from repeat visitor
  const handleApplyRepeatData = () => {
    if (repeatNotice.pastVisitor) {
      const pv = repeatNotice.pastVisitor;
      setName(pv.name);
      setEmail(pv.email || '');
      setVisitorType(pv.visitorType);
      setGovtIdType(pv.govtIdType);
      if (pv.govtIdNumber) setGovtIdNumber(pv.govtIdNumber);
      if (pv.vehicleNo) setVehicleNo(pv.vehicleNo);
      if (pv.photoUrl) setPhotoUrl(pv.photoUrl);
      setIsMobileVerified(true);
    }
  };

  // Submit and generate pass
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !mobile.trim()) {
      alert('Please provide visitor name and mobile number.');
      return;
    }

    if (mobile.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    const newId = `MSI-VIS-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newVisitor: Visitor = {
      id: newId,
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      visitorType,
      purpose: purpose === 'Other' ? customPurpose || 'General Inquiry' : purpose,
      department,
      hostPerson,
      entryTime: nowTime,
      photoUrl: photoUrl || DEMO_VISITOR_PHOTO_FALLBACKS[0],
      status: 'Inside',
      govtIdType,
      govtIdNumber: govtIdNumber.trim() || 'VERIFIED-DESK',
      vehicleNo: vehicleNo.trim() || undefined,
      isMobileVerified: true,
      gateNumber,
      visitCount: repeatNotice.found ? repeatNotice.visitCount : 1,
      remarks: remarks.trim() || undefined,
    };

    // Save to state
    onRegisterVisitor(newVisitor);

    // Show printable pass modal immediately
    setGeneratedPassVisitor(newVisitor);

    // Reset form
    setName('');
    setMobile('');
    setEmail('');
    setGovtIdNumber('');
    setVehicleNo('');
    setRemarks('');
    setIsMobileVerified(false);
    setPhotoUrl(null);
    setRepeatNotice({ found: false, visitCount: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Step Guide Banner */}
      <div className="bg-gradient-to-r from-[#10233F] to-[#1C3A66] rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#EFC988] text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Standard Security Procedure</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              New Visitor Registration Desk
            </h2>
            <p className="text-xs text-white/80 mt-1 max-w-xl">
              Complete the visitor identity dossier, capture the badge photo via live webcam or file upload, and issue the official MSI pass.
            </p>
          </div>
        </div>

        {/* Multi-step breadcrumb indicators */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2 text-[#EFC988]">
            <span className="w-5 h-5 rounded-full bg-[#EFC988] text-[#10233F] font-bold flex items-center justify-center text-[10px]">
              1
            </span>
            <span className="font-semibold">Visitor Details</span>
          </div>
          <div className="flex items-center space-x-2 text-[#EFC988]">
            <span className="w-5 h-5 rounded-full bg-[#EFC988] text-[#10233F] font-bold flex items-center justify-center text-[10px]">
              2
            </span>
            <span className="font-semibold">Host &amp; Purpose</span>
          </div>
          <div className={`flex items-center space-x-2 ${photoUrl ? 'text-emerald-400' : 'text-white/60'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              photoUrl ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'
            }`}>
              3
            </span>
            <span>Badge Photo</span>
          </div>
          <div className="flex items-center space-x-2 text-white/60">
            <span className="w-5 h-5 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-[10px]">
              4
            </span>
            <span>Print Pass</span>
          </div>
        </div>
      </div>

      {/* Repeat Visitor Alert if detected */}
      {repeatNotice.found && repeatNotice.pastVisitor && (
        <div className="p-4 rounded-2xl bg-[#FFF3DD] border-2 border-[#EFC988] shadow-sm animate-fadeIn flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#89190E] text-white flex items-center justify-center font-bold">
              {repeatNotice.visitCount}x
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89190E]">
                Repeat Visitor Identified in MSI Archive
              </span>
              <h4 className="font-serif text-sm font-bold text-[#10233F]">
                {repeatNotice.pastVisitor.name} ({repeatNotice.pastVisitor.visitorType})
              </h4>
              <p className="text-[11px] text-[#526174]">
                Previously visited on {repeatNotice.pastVisitor.entryTime} for {repeatNotice.pastVisitor.purpose}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyRepeatData}
            className="px-4 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs flex-shrink-0 cursor-pointer"
          >
            Auto-Fill Past Dossier & Photo
          </button>
        </div>
      )}

      {/* Main Registration Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8DCCB] p-6 sm:p-8 shadow-sm">
        
        {/* Section 1: Personal & Contact */}
        <div>
          <div className="flex items-center space-x-2 text-[#89190E] pb-3 border-b border-[#E8DCCB] mb-5">
            <User className="w-4 h-4" />
            <h3 className="font-serif font-bold text-base text-[#10233F]">
              1. Visitor Identity &amp; Contact Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Visitor Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajinder Kumar Bansal"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E] font-medium"
              />
            </div>

            {/* Mobile Number without OTP Verification */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Primary Mobile (10-Digit) <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-xs font-bold text-[#526174]">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E] font-mono font-medium"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="visitor.name@domain.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] focus:ring-1 focus:ring-[#89190E]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Purpose & Host Department */}
        <div className="mt-8 pt-6 border-t border-[#E8DCCB]">
          <div className="flex items-center space-x-2 text-[#89190E] pb-3 border-b border-[#E8DCCB] mb-5">
            <Building2 className="w-4 h-4" />
            <h3 className="font-serif font-bold text-base text-[#10233F]">
              2. Visit Classification, Host Department & Purpose
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Visitor Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Visitor Classification <span className="text-rose-600">*</span>
              </label>
              <select
                value={visitorType}
                onChange={(e) => setVisitorType(e.target.value as VisitorType)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-medium"
              >
                <option value="Parent">Parent / Guardian</option>
                <option value="Guest Faculty">Guest Faculty / Speaker</option>
                <option value="Vendor / Supplier">Vendor / Contractor</option>
                <option value="Alumni">Alumni Member</option>
                <option value="Official / Inspector">Official / Bar Council / AICTE</option>
                <option value="Job Candidate">Job Interview Candidate</option>
                <option value="Student Inquiry">Prospective Student Inquiry</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Destination Department <span className="text-rose-600">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-medium"
              >
                {MSI_DEPARTMENTS.map((dept) => (
                  <option key={dept.department} value={dept.department}>
                    {dept.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Host Person */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Host Officer / Faculty Member <span className="text-rose-600">*</span>
              </label>
              <select
                value={hostPerson}
                onChange={(e) => setHostPerson(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-medium"
              >
                {availableHosts.map((host) => (
                  <option key={host.name} value={host.name}>
                    {host.name} ({host.designation})
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Purpose of Institute Visit <span className="text-rose-600">*</span>
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-medium"
              >
                {VISITOR_PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="Other">Other Specific Purpose</option>
              </select>
            </div>

            {/* Gate Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Entry Checkpoint / Gate
              </label>
              <select
                value={gateNumber}
                onChange={(e) => setGateNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E]"
              >
                <option value="Gate 1 (Main Gate)">Gate 1 (Main Entrance)</option>
                <option value="Gate 2 (Service Gate)">Gate 2 (Service / Logistics)</option>
                <option value="Admin Reception Desk">Admin Reception Desk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Photo Capture & Identification */}
        <div className="mt-8 pt-6 border-t border-[#E8DCCB]">
          <div className="flex items-center space-x-2 text-[#89190E] pb-3 border-b border-[#E8DCCB] mb-5">
            <Camera className="w-4 h-4" />
            <h3 className="font-serif font-bold text-base text-[#10233F]">
              3. Photo Capture & Physical Security Credentials
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Webcam / Photo Card */}
            <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB] flex items-center space-x-4">
              <div className="relative w-20 h-24 rounded-xl overflow-hidden border-2 border-[#10233F] bg-stone-200 flex-shrink-0">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#526174] p-1 text-center">
                    <Camera className="w-6 h-6 text-[#89190E] mb-1" />
                    <span className="text-[9px] font-mono leading-none">No Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#10233F] block">
                  Badge Photo Status
                </span>
                <span className="text-[11px] text-[#526174] block mb-2">
                  {photoUrl ? 'Photo captured & ready' : 'Webcam snap or file upload'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{photoUrl ? 'Retake' : 'Webcam'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => tabFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF9EF] border border-[#E8DCCB] text-[#10233F] text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#89190E]" />
                    <span>Upload</span>
                  </button>

                  <input
                    ref={tabFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDirectFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Govt ID Type & Last 4 digits */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Government ID Type
              </label>
              <select
                value={govtIdType}
                onChange={(e) => setGovtIdType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E]"
              >
                {GOVT_ID_TYPES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={govtIdNumber}
                onChange={(e) => setGovtIdNumber(e.target.value)}
                placeholder="ID Number / Last 4 Digits"
                className="w-full mt-2 px-4 py-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono"
              />
            </div>

            {/* Vehicle Number & Entry Timestamp */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#10233F] mb-1.5">
                Vehicle Plate Number (If Any)
              </label>
              <div className="relative">
                <Car className="w-4 h-4 text-[#526174] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  placeholder="e.g. PB-65-AK-4122"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/40 text-xs sm:text-sm text-[#10233F] focus:outline-none focus:border-[#89190E] font-mono uppercase"
                />
              </div>

              <div className="mt-2 text-[11px] text-[#526174] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#89190E]" />
                <span>Entry timestamp auto-logged upon submission</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="mt-8 pt-6 border-t border-[#E8DCCB] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#526174] flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Pass syncs with Gate 1 & Gate 2 physical security turnstiles</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#89190E] hover:bg-[#65130D] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#89190E]/30 btn-chamfered cursor-pointer"
          >
            <span>Save & Generate Visitor Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Webcam Modal */}
      {isCameraOpen && (
        <WebcamCaptureModal
          visitorName={name}
          onCapture={(img) => setPhotoUrl(img)}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Mobile OTP Modal */}
      {isOtpOpen && (
        <MobileVerifyModal
          mobile={mobile}
          visitorName={name}
          onVerified={() => {
            setIsMobileVerified(true);
            setIsOtpOpen(false);
          }}
          onClose={() => setIsOtpOpen(false)}
        />
      )}

      {/* Newly Issued Visitor Pass Modal */}
      {generatedPassVisitor && (
        <VisitorPassModal
          visitor={generatedPassVisitor}
          onClose={() => setGeneratedPassVisitor(null)}
        />
      )}
    </div>
  );
}
