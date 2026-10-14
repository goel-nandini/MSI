'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Edit3,
  Save,
  CheckCircle2,
  Award,
  BookOpen,
  Camera,
  Hash,
  Heart,
  Users,
} from 'lucide-react';
import { StudentProfile } from './data/studentMockData';

interface StudentProfileTabProps {
  student: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
}

export default function StudentProfileTab({
  student,
  onUpdateProfile,
}: StudentProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<StudentProfile>(student);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormState(student);
  }, [student]);

  const handleChange = (field: keyof StudentProfile, value: string | number) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formState);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with HUD brackets */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-linear-to-r from-[#10233F] to-[#1c355e] text-white overflow-hidden shadow-lg hud-bracket">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EFC988]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          {/* Avatar and Basic Header */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#FFF3DD] border-2 border-[#EFC988] flex items-center justify-center font-serif text-3xl font-bold text-[#89190E] shadow-xl overflow-hidden relative">
                {student.avatarUrl ? (
                  <Image
                    src={student.avatarUrl}
                    alt={student.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{student.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => alert('Photo update dialog: You may upload a passport-format photo for official Bar Council identity cards.')}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#89190E] text-white hover:bg-[#65130D] shadow-md transition-transform group-hover:scale-110"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5 text-[#EFC988]" />
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#EFC988] text-[#10233F]">
                  {student.enrollmentNo}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/90 border border-white/20">
                  Roll: {student.rollNo}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2">
                {student.name}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-lg">
                {student.courseTitle}
              </p>
              <div className="flex items-center justify-center sm:justify-start space-x-3 mt-2 text-xs text-[#EFC988]">
                <span>● {student.batch}</span>
                <span>•</span>
                <span>{student.semester}</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex-shrink-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all shadow-md active:scale-98"
              >
                <Edit3 className="w-4 h-4 text-[#EFC988]" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setFormState(student);
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Profile information updated successfully!</span>
          </div>
        )}
      </div>

      {/* Main Profile Fields Form / Cards */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Credentials & Demographics */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
          <div className="flex items-center space-x-2 pb-4 border-b border-[#E8DCCB]">
            <User className="w-5 h-5 text-[#89190E]" />
            <h3 className="font-serif text-lg font-bold text-[#10233F]">
              Personal Demographics & Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Full Name (Official Records)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F] font-semibold focus:outline-none focus:border-[#89190E]"
                />
              ) : (
                <p className="text-sm font-bold text-[#10233F]">{student.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F] font-mono focus:outline-none focus:border-[#89190E]"
                />
              ) : (
                <p className="text-sm font-mono text-[#10233F]">{student.email}</p>
              )}
            </div>

            {/* Date of Birth & Age */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Date of Birth / Age
              </label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={formState.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                    className="p-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-xs text-[#10233F]"
                  />
                  <input
                    type="number"
                    value={formState.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                    placeholder="Age"
                    className="p-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-xs text-[#10233F]"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#10233F]">
                  {student.dob} ({student.age} Years)
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Gender
              </label>
              {isEditing ? (
                <select
                  value={formState.gender}
                  onChange={(e) => handleChange('gender', e.target.value as 'Male' | 'Female' | 'Other')}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-sm font-semibold text-[#10233F]">{student.gender}</p>
              )}
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Blood Group
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formState.bloodGroup}
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F]"
                />
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {student.bloodGroup}
                </span>
              )}
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Admission Date
              </label>
              <p className="text-sm font-medium text-[#10233F]">{student.admissionDate}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Guardian Details */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
          <div className="flex items-center space-x-2 pb-4 border-b border-[#E8DCCB]">
            <Phone className="w-5 h-5 text-[#89190E]" />
            <h3 className="font-serif text-lg font-bold text-[#10233F]">
              Contact Details & Guardian Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {/* Student Mobile */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Student Mobile Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formState.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F] font-mono focus:outline-none focus:border-[#89190E]"
                />
              ) : (
                <p className="text-sm font-mono font-semibold text-[#10233F]">{student.phone}</p>
              )}
            </div>

            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Guardian / Parent Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formState.guardianName}
                  onChange={(e) => handleChange('guardianName', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F]"
                />
              ) : (
                <p className="text-sm font-semibold text-[#10233F]">{student.guardianName}</p>
              )}
            </div>

            {/* Guardian Contact */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Guardian Emergency Contact
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formState.guardianContact}
                  onChange={(e) => handleChange('guardianContact', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F] font-mono"
                />
              ) : (
                <p className="text-sm font-mono font-semibold text-[#89190E]">
                  {student.guardianContact}
                </p>
              )}
            </div>

            {/* Residential Address */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Permanent & Correspondence Address
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formState.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F]"
                />
              ) : (
                <p className="text-sm font-medium text-[#10233F] leading-relaxed">
                  {student.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Academic Credentials & Course Entitlement Validity */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DCCB] shadow-xs">
          <div className="flex items-center space-x-2 pb-4 border-b border-[#E8DCCB]">
            <Award className="w-5 h-5 text-[#89190E]" />
            <h3 className="font-serif text-lg font-bold text-[#10233F]">
              Academic Credentials & Enrolled Course Programme
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {/* Enrolled Subject / Course Programme */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Enrolled Course / Subject Programme
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    list="msi-courses-list"
                    value={formState.courseTitle}
                    onChange={(e) => handleChange('courseTitle', e.target.value)}
                    placeholder="Enter or select judicial course/subject"
                    className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F] font-semibold focus:outline-none focus:border-[#89190E]"
                  />
                  <datalist id="msi-courses-list">
                    <option value="PCS-J Punjab Judicial Services" />
                    <option value="Haryana ADA & Judiciary Examination" />
                    <option value="Himachal Pradesh Judicial Service" />
                    <option value="Delhi Judicial Services (DJS)" />
                    <option value="UPSC Law Optional Foundation" />
                    <option value="CLAT PG & LL.M Entrance Masterclass" />
                    <option value="CLAT UG & Judiciary Entrance Foundation Programme" />
                    <option value="Civil & Criminal Litigation Masterclass" />
                  </datalist>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB]">
                  <p className="text-sm font-bold text-[#89190E]">{student.courseTitle}</p>
                </div>
              )}
            </div>

            {/* Academic Session / Semester */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Academic Session / Semester
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formState.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  placeholder="e.g. Academic Year 2026–2027"
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F] font-semibold focus:outline-none focus:border-[#89190E]"
                />
              ) : (
                <div className="p-3 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB]">
                  <p className="text-sm font-semibold text-[#10233F]">{student.semester}</p>
                </div>
              )}
            </div>

            {/* Assigned Batch */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#526174] mb-1.5">
                Assigned Batch Cohort
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formState.batch}
                  onChange={(e) => handleChange('batch', e.target.value)}
                  placeholder="e.g. PCS-J Punjab Judicial Services, Morning Batch"
                  className="w-full p-2.5 rounded-xl border border-[#E8DCCB] bg-[#FFF9EF]/50 text-sm text-[#10233F] font-semibold focus:outline-none focus:border-[#89190E]"
                />
              ) : (
                <div className="p-3 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB]">
                  <p className="text-sm font-medium text-[#10233F]">{student.batch}</p>
                </div>
              )}
            </div>

            {/* Institutional Credentials: Read-Only Badges */}
            <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB]">
              <span className="text-[10px] uppercase font-bold text-[#526174] tracking-wider block">
                Enrollment ID
              </span>
              <span className="font-mono text-sm font-bold text-[#89190E] mt-1 block">
                {student.enrollmentNo}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#E8DCCB]">
              <span className="text-[10px] uppercase font-bold text-[#526174] tracking-wider block">
                Official Roll Number
              </span>
              <span className="font-mono text-sm font-bold text-[#10233F] mt-1 block">
                {student.rollNo}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Course Validity Date
              </span>
              <span className="font-mono text-sm font-bold text-emerald-900 mt-1 block">
                {student.validUntil}
              </span>
            </div>
          </div>
        </div>

        {/* Save Changes Floating Action Bar */}
        {isEditing && (
          <div className="p-4 rounded-2xl bg-[#10233F] text-white flex items-center justify-between shadow-lg animate-slideUp">
            <span className="text-xs font-medium text-white/90">
              You have unsaved changes in your profile details.
            </span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFormState(student);
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#89190E]/30"
              >
                <Save className="w-3.5 h-3.5 text-[#EFC988]" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
