'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  CheckCircle2,
  Copy,
  RefreshCw,
  Sparkles,
  Table,
  FileText,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Lead } from '@/components/reception/data/leadsMockData';

export interface ExcelLeadRow {
  id: string;
  name: string;
  mobile: string;
  location: string;
  targetCourse: string;
  source: string;
  agent: string;
  notes: string;
}

interface ExcelLeadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsGenerated: (count: number) => void;
  showToast: (msg: string) => void;
  existingLeads?: Lead[];
}

const COURSES_OPTIONS = [
  'PCS-J Punjab Judicial Services',
  'CLAT 2027 (2-Yr Class)',
  'CLAT 2026 (1-Yr Target)',
  'Judiciary Mains Answer Writing',
  'PU Law 3-Yr Entrance',
  'CLAT 2028 Foundation',
  'UPSC Law Optional',
  'Judiciary Weekend',
];

const SOURCE_OPTIONS = [
  'Meta Ads (Facebook/Instagram)',
  'Google Ads',
  'Local Walk-in',
  'College Workshop',
  'Website Enquiry',
  'Website Form',
  'Alumni Referral',
  'Super Admin (#2410)',
];

const AGENT_OPTIONS = [
  'Auto Round-Robin Distribution',
  'Harshit (Reception Desk)',
  'Counselor Priya (Law Admissions Desk)',
  'Counselor Rohit (Judiciary Services Desk)',
  'Counselor Simran (CLAT & Entrance Desk)',
];

function createEmptyRow(idx?: number): ExcelLeadRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: '',
    mobile: '',
    location: 'Chandigarh / Mohali',
    targetCourse: COURSES_OPTIONS[0],
    source: SOURCE_OPTIONS[0],
    agent: AGENT_OPTIONS[0],
    notes: '',
  };
}

export default function ExcelLeadManagerModal({
  isOpen,
  onClose,
  onLeadsGenerated,
  showToast,
  existingLeads = [],
}: ExcelLeadManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'sheet' | 'upload' | 'paste'>('sheet');
  const [rows, setRows] = useState<ExcelLeadRow[]>([
    {
      id: 'row-sample-1',
      name: 'Priyanshu Verma',
      mobile: '9876543210',
      location: 'Chandigarh',
      targetCourse: 'PCS-J Punjab Judicial Services',
      source: 'Meta Ads (Facebook/Instagram)',
      agent: 'Harshit (Reception Desk)',
      notes: 'High intent candidate, requested scholarship details',
    },
    {
      id: 'row-sample-2',
      name: 'Rohan Khanna',
      mobile: '9812345678',
      location: 'Mohali',
      targetCourse: 'CLAT 2027 (2-Yr Class)',
      source: 'Google Ads',
      agent: 'Counselor Priya (Law Admissions Desk)',
      notes: 'Interested in weekend classroom batch',
    },
    {
      id: 'row-sample-3',
      name: 'Simran Kaur',
      mobile: '9898765432',
      location: 'Ludhiana',
      targetCourse: 'Judiciary Mains Answer Writing',
      source: 'College Workshop',
      agent: 'Auto Round-Robin Distribution',
      notes: 'Met at GNDU campus law seminar',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawPasteText, setRawPasteText] = useState('');
  const [filterInvalidOnly, setFilterInvalidOnly] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Validation helper
  const cleanMobile = (m: string) => m.replace(/\D/g, '').slice(-10);
  const isValidRow = (r: ExcelLeadRow) => r.name.trim().length > 0 && cleanMobile(r.mobile).length === 10;

  const validCount = rows.filter(isValidRow).length;
  const invalidCount = rows.length - validCount;

  const displayedRows = filterInvalidOnly ? rows.filter((r) => !isValidRow(r)) : rows;

  // Row update handlers
  const updateRow = (id: string, field: keyof ExcelLeadRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const deleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow(prev.length + 1)]);
  };

  const addMultipleRows = (count: number) => {
    const newItems = Array.from({ length: count }, (_, i) => createEmptyRow(rows.length + i + 1));
    setRows((prev) => [...prev, ...newItems]);
  };

  const clearAllRows = () => {
    if (confirm('Are you sure you want to clear all spreadsheet rows?')) {
      setRows([createEmptyRow()]);
    }
  };

  // Download Sample Excel (.xlsx) Template
  const handleDownloadExcelTemplate = () => {
    try {
      const templateData = [
        {
          'Candidate Name *': 'Aarav Sharma',
          'Mobile Number *': '9876543210',
          'Location / City': 'Chandigarh',
          'Target Course': 'PCS-J Punjab Judicial Services',
          'Lead Source': 'Meta Ads (Facebook/Instagram)',
          'Assigned Telecaller': 'Harshit (Reception Desk)',
          'Notes / Remarks': 'Inquired about Judiciary foundation batch',
        },
        {
          'Candidate Name *': 'Meera Sen',
          'Mobile Number *': '9812345678',
          'Location / City': 'Mohali',
          'Target Course': 'CLAT 2027 (2-Yr Class)',
          'Lead Source': 'Google Ads',
          'Assigned Telecaller': 'Counselor Priya (Law Admissions Desk)',
          'Notes / Remarks': 'Interested in weekend scholarship test',
        },
        {
          'Candidate Name *': 'Kabir Singh',
          'Mobile Number *': '9898765432',
          'Location / City': 'Panchkula',
          'Target Course': 'PU Law 3-Yr Entrance',
          'Lead Source': 'Local Walk-in',
          'Assigned Telecaller': 'Auto Round-Robin Distribution',
          'Notes / Remarks': 'Visited campus reception counter',
        },
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      ws['!cols'] = [
        { wch: 22 }, // Name
        { wch: 18 }, // Mobile
        { wch: 20 }, // Location
        { wch: 32 }, // Course
        { wch: 30 }, // Source
        { wch: 35 }, // Agent
        { wch: 45 }, // Notes
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads_Template');
      XLSX.writeFile(wb, 'MSI_SuperAdmin_Leads_Template.xlsx');
      showToast('Downloaded Excel Template (.xlsx)! Fill entries and re-upload.');
    } catch (err) {
      console.error(err);
      showToast('Error generating Excel template.');
    }
  };

  // Download CSV Template
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'Candidate Name *,Mobile Number *,Location / City,Target Course,Lead Source,Assigned Telecaller,Notes / Remarks\n' +
      'Aarav Sharma,9876543210,Chandigarh,PCS-J Punjab Judicial Services,Meta Ads (Facebook/Instagram),Harshit (Reception Desk),Inquired about Judiciary foundation batch\n' +
      'Meera Sen,9812345678,Mohali,CLAT 2027 (2-Yr Class),Google Ads,Counselor Priya (Law Admissions Desk),Interested in weekend scholarship test\n' +
      'Kabir Singh,9898765432,Panchkula,PU Law 3-Yr Entrance,Local Walk-in,Auto Round-Robin Distribution,Visited campus reception counter\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'MSI_Leads_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded CSV Template! Fill and re-upload anytime.');
  };

  // Parse uploaded Excel or CSV file
  const handleFileUpload = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!rawRows || rawRows.length === 0) {
        showToast('The uploaded file appears to be empty.');
        return;
      }

      // Detect header row
      let headerRowIndex = 0;
      let headers: string[] = [];

      for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
        const row = rawRows[i];
        if (Array.isArray(row)) {
          const rowStr = row.map((c) => String(c || '').toLowerCase()).join(' ');
          if (rowStr.includes('name') || rowStr.includes('mobile') || rowStr.includes('phone') || rowStr.includes('contact')) {
            headerRowIndex = i;
            headers = row.map((c) => String(c || '').trim());
            break;
          }
        }
      }

      const findColIdx = (aliases: string[]) => {
        return headers.findIndex((h) => aliases.some((a) => h.toLowerCase().includes(a)));
      };

      const nameIdx = findColIdx(['name', 'candidate', 'student', 'prospect']);
      const mobileIdx = findColIdx(['mobile', 'phone', 'contact', 'cell', 'number']);
      const locIdx = findColIdx(['location', 'city', 'state', 'address']);
      const courseIdx = findColIdx(['course', 'program', 'target', 'stream']);
      const sourceIdx = findColIdx(['source', 'channel', 'platform']);
      const agentIdx = findColIdx(['agent', 'telecaller', 'counselor', 'assignee', 'assigned']);
      const notesIdx = findColIdx(['note', 'remark', 'comment', 'message', 'inquiry']);

      const dataRows = rawRows.slice(headerRowIndex + 1).filter((r) => Array.isArray(r) && r.some((c) => c !== undefined && c !== null && String(c).trim() !== ''));

      const parsed: ExcelLeadRow[] = dataRows.map((r, i) => {
        const nameVal = nameIdx >= 0 ? String(r[nameIdx] || '').trim() : String(r[0] || '').trim();
        const mobileVal = mobileIdx >= 0 ? String(r[mobileIdx] || '').trim() : String(r[1] || '').trim();
        const locVal = locIdx >= 0 ? String(r[locIdx] || '').trim() : String(r[2] || '').trim() || 'Chandigarh / Mohali';
        const courseVal = courseIdx >= 0 ? String(r[courseIdx] || '').trim() : String(r[3] || '').trim() || COURSES_OPTIONS[0];
        const sourceVal = sourceIdx >= 0 ? String(r[sourceIdx] || '').trim() : String(r[4] || '').trim() || 'Bulk Excel Import';
        const agentVal = agentIdx >= 0 ? String(r[agentIdx] || '').trim() : String(r[5] || '').trim() || AGENT_OPTIONS[0];
        const notesVal = notesIdx >= 0 ? String(r[notesIdx] || '').trim() : String(r[6] || '').trim() || 'Uploaded from Excel spreadsheet';

        return {
          id: `file-${Date.now()}-${i + 1}`,
          name: nameVal || `Candidate #${i + 1}`,
          mobile: mobileVal,
          location: locVal || 'Chandigarh / Mohali',
          targetCourse: courseVal || COURSES_OPTIONS[0],
          source: sourceVal || 'Bulk Excel Import',
          agent: agentVal || AGENT_OPTIONS[0],
          notes: notesVal,
        };
      });

      if (parsed.length === 0) {
        showToast('No valid data rows found in the uploaded file.');
        return;
      }

      setRows(parsed);
      setActiveTab('sheet');
      showToast(`Successfully parsed ${parsed.length} rows from Excel! Review and generate leads.`);
    } catch (err: any) {
      console.error(err);
      showToast('Error reading Excel/CSV file. Please check file format.');
    }
  };

  // Parse Raw Clipboard / Pasted Text
  const handleParseClipboardText = () => {
    if (!rawPasteText.trim()) {
      showToast('Please paste data into the text box first.');
      return;
    }

    const lines = rawPasteText.trim().split('\n').filter((l) => l.trim().length > 0);
    const parsed: ExcelLeadRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('mobile') || line.toLowerCase().includes('phone'))) {
        continue;
      }

      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      const name = parts[0]?.trim() || `Candidate #${i + 1}`;
      const mobile = parts[1]?.trim() || '';
      const location = parts[2]?.trim() || 'Chandigarh / Mohali';
      const targetCourse = parts[3]?.trim() || COURSES_OPTIONS[0];
      const source = parts[4]?.trim() || 'Pasted Spreadsheet Import';
      const agent = parts[5]?.trim() || AGENT_OPTIONS[0];
      const notes = parts[6]?.trim() || 'Pasted from Excel dataset';

      parsed.push({
        id: `paste-${Date.now()}-${i}`,
        name,
        mobile,
        location,
        targetCourse,
        source,
        agent,
        notes,
      });
    }

    if (parsed.length === 0) {
      showToast('No valid entries could be parsed from text.');
      return;
    }

    setRows(parsed);
    setActiveTab('sheet');
    setRawPasteText('');
    showToast(`Loaded ${parsed.length} entries into spreadsheet editor!`);
  };

  // Submit & Generate All Leads
  const handleGenerateAllLeads = async () => {
    const validRows = rows.filter(isValidRow);
    if (validRows.length === 0) {
      showToast('Please ensure at least one row has a Candidate Name and a valid 10-digit Mobile Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const telecallersList = [
        'Harshit (Reception Desk)',
        'Counselor Priya (Law Admissions Desk)',
        'Counselor Rohit (Judiciary Services Desk)',
        'Counselor Simran (CLAT & Entrance Desk)',
      ];

      const payloadLeads = validRows.map((r, i) => {
        const assignedAgent =
          r.agent === 'Auto Round-Robin Distribution' || !r.agent.trim()
            ? telecallersList[i % telecallersList.length]
            : r.agent;

        return {
          name: r.name.trim(),
          mobile: cleanMobile(r.mobile),
          location: r.location.trim() || 'Chandigarh / Mohali',
          targetCourse: r.targetCourse.trim() || COURSES_OPTIONS[0],
          source: r.source.trim() || 'Excel Sheet Generation',
          agent: assignedAgent,
          notes: r.notes.trim() || `Generated via Super Admin Excel Sheet (${r.source})`,
        };
      });

      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulk: true,
          leads: payloadLeads,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Successfully generated and dispatched ${payloadLeads.length} leads to Reception Desk!`);
        onLeadsGenerated(payloadLeads.length);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('msi_leads_sync'));
          try {
            const bc = new BroadcastChannel('msi_sync_channel');
            bc.postMessage({ type: 'LEAD_CREATED', count: payloadLeads.length });
            bc.close();
          } catch (_) {}
        }

        onClose();
      } else {
        showToast(data.message || 'Error saving leads.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while generating leads.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-[#E8DCCB] flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8DCCB] bg-[#FFF9EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#89190E] text-white flex items-center justify-center shadow-sm shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#89190E]/10 text-[#89190E] font-mono font-bold text-[10px] uppercase">
                  Bulk Lead Generator
                </span>
                <span className="text-xs text-gray-500 font-medium">Excel (.xlsx) / CSV Ready</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#10233F]">
                Excel Sheet Lead Generator & Intake Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Download Templates Button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownloadExcelTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Download formatted sample Excel sheet (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Template (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Download CSV template"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>CSV</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Quick Action Bar */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('sheet')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sheet'
                  ? 'bg-[#89190E] text-white shadow-xs'
                  : 'bg-gray-100 text-[#10233F] hover:bg-gray-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Interactive Spreadsheet Grid ({rows.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#89190E] text-white shadow-xs'
                  : 'bg-gray-100 text-[#10233F] hover:bg-gray-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Excel / CSV File</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-[#89190E] text-white shadow-xs'
                  : 'bg-gray-100 text-[#10233F] hover:bg-gray-200'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Paste from Clipboard</span>
            </button>
          </div>

          {/* Validation Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{validCount} Ready to Generate</span>
            </span>
            {invalidCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterInvalidOnly(!filterInvalidOnly)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-colors ${
                  filterInvalidOnly
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
                title="Toggle filter to show only rows requiring attention"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{invalidCount} Need Fix</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Active View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/60">
          {/* TAB 1: INTERACTIVE SPREADSHEET GRID */}
          {activeTab === 'sheet' && (
            <div className="space-y-4">
              {/* Sheet Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addMultipleRows(5)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#10233F] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>+ 5 Rows</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addMultipleRows(10)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#10233F] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>+ 10 Rows</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {filterInvalidOnly && (
                    <button
                      type="button"
                      onClick={() => setFilterInvalidOnly(false)}
                      className="text-xs text-[#89190E] font-bold hover:underline cursor-pointer"
                    >
                      Show All Rows ({rows.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearAllRows}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {/* Spreadsheet Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#F0F3FF] border-b border-gray-200">
                      <tr className="uppercase font-bold text-[10px] text-[#526174] tracking-wider">
                        <th className="py-3 px-2 text-center w-10">#</th>
                        <th className="py-3 px-3 min-w-[160px]">
                          Candidate Name <span className="text-red-500">*</span>
                        </th>
                        <th className="py-3 px-3 min-w-[150px]">
                          Mobile Number <span className="text-red-500">*</span>
                        </th>
                        <th className="py-3 px-3 min-w-[140px]">City / Location</th>
                        <th className="py-3 px-3 min-w-[190px]">Target Course</th>
                        <th className="py-3 px-3 min-w-[180px]">Lead Source</th>
                        <th className="py-3 px-3 min-w-[190px]">Assigned Counselor</th>
                        <th className="py-3 px-3 min-w-[180px]">Notes / Remarks</th>
                        <th className="py-3 px-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-12 text-gray-400">
                            No rows to display.{' '}
                            <button
                              type="button"
                              onClick={addRow}
                              className="text-[#89190E] font-bold hover:underline"
                            >
                              Add a new row
                            </button>
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((r, idx) => {
                          const validPhone = cleanMobile(r.mobile).length === 10;
                          const validName = r.name.trim().length > 0;
                          const rowHasError = !validPhone || !validName;

                          return (
                            <tr
                              key={r.id}
                              className={`transition-colors ${
                                rowHasError ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-gray-50'
                              }`}
                            >
                              {/* Row number */}
                              <td className="py-2.5 px-2 text-center font-mono text-[11px] text-gray-400 font-bold">
                                {idx + 1}
                              </td>

                              {/* Candidate Name */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={r.name}
                                  onChange={(e) => updateRow(r.id, 'name', e.target.value)}
                                  placeholder="e.g. Aarav Sharma"
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                                    !validName
                                      ? 'border-red-300 bg-red-50/40 focus:border-red-500 text-red-900'
                                      : 'border-gray-200 focus:border-[#89190E] text-[#10233F]'
                                  }`}
                                />
                              </td>

                              {/* Mobile Number with 10-digit validation */}
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={r.mobile}
                                    onChange={(e) => updateRow(r.id, 'mobile', e.target.value)}
                                    placeholder="10-digit mobile"
                                    maxLength={14}
                                    className={`w-full px-2.5 py-1.5 pr-8 rounded-lg border text-xs font-mono font-bold focus:outline-none transition-colors ${
                                      !validPhone
                                        ? 'border-red-300 bg-red-50/40 focus:border-red-500 text-red-900'
                                        : 'border-gray-200 focus:border-[#89190E] text-[#10233F]'
                                    }`}
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    {validPhone ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <span
                                        className="text-[10px] text-red-500 font-mono font-bold"
                                        title="Needs 10 digits"
                                      >
                                        !
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Location */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={r.location}
                                  onChange={(e) => updateRow(r.id, 'location', e.target.value)}
                                  placeholder="City / State"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                                />
                              </td>

                              {/* Target Course */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={r.targetCourse}
                                  onChange={(e) => updateRow(r.id, 'targetCourse', e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E] bg-white"
                                >
                                  {COURSES_OPTIONS.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Lead Source */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={r.source}
                                  onChange={(e) => updateRow(r.id, 'source', e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E] bg-white"
                                >
                                  {SOURCE_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Assigned Telecaller */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={r.agent}
                                  onChange={(e) => updateRow(r.id, 'agent', e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E] bg-white"
                                >
                                  {AGENT_OPTIONS.map((a) => (
                                    <option key={a} value={a}>
                                      {a}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Notes */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={r.notes}
                                  onChange={(e) => updateRow(r.id, 'notes', e.target.value)}
                                  placeholder="Counselor remarks..."
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-[#10233F] focus:outline-none focus:border-[#89190E]"
                                />
                              </td>

                              {/* Delete Action */}
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => deleteRow(r.id)}
                                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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

          {/* TAB 2: UPLOAD FILE DRAG AND DROP */}
          {activeTab === 'upload' && (
            <div className="space-y-6 max-w-2xl mx-auto py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-[#89190E] bg-[#FFF9EF]'
                    : 'border-gray-300 hover:border-[#89190E] bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#10233F] mb-1">
                  Upload Excel (.xlsx, .xls) or CSV (.csv) File
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                  Drag and drop your spreadsheet here or click to browse. The system will auto-detect candidate names, mobile numbers, courses, and sources.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#89190E] text-white text-xs font-bold shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Choose File from Computer</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs text-gray-600 space-y-2">
                <span className="font-bold text-[#10233F] block text-xs uppercase tracking-wider">
                  Supported Column Formats in Excel:
                </span>
                <p className="text-[11px] leading-relaxed text-gray-500">
                  Your Excel file can have headers like: <strong>Name / Candidate Name</strong>, <strong>Mobile / Phone Number</strong>, <strong>City / Location</strong>, <strong>Target Course</strong>, <strong>Source</strong>, <strong>Assigned Counselor</strong>, <strong>Notes</strong>.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    className="inline-flex items-center gap-1.5 text-xs text-[#89190E] font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Pre-formatted Excel Template (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE FROM CLIPBOARD */}
          {activeTab === 'paste' && (
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#10233F]">
                      Paste Rows directly from Excel or Google Sheets
                    </h3>
                    <p className="text-xs text-gray-500">
                      Copy cells in Excel (Ctrl+C) and paste them directly into this box.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRawPasteText(
                        `Aarav Sharma\t9876543210\tChandigarh\tPCS-J Punjab Judicial Services\tMeta Ads\tHarshit\tInterested in foundation batch\n` +
                          `Meera Sen\t9812345678\tMohali\tCLAT 2027 (2-Yr Class)\tGoogle Ads\tPriya\tRequested scholarship details\n` +
                          `Kabir Singh\t9898765432\tPanchkula\tPU Law 3-Yr Entrance\tWalk-in\tRohit\tVisited campus desk`
                      );
                    }}
                    className="text-xs text-[#89190E] font-bold hover:underline"
                  >
                    Load Sample
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder="Paste rows here from Excel (Tab or Comma separated)...&#10;e.g.&#10;Aarav Sharma	9876543210	Chandigarh	PCS-J	Meta Ads	Harshit	Note..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs font-mono text-[#10233F] focus:outline-none focus:border-[#89190E]"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleParseClipboardText}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#89190E] text-white text-xs font-bold hover:bg-[#65130D] shadow-xs cursor-pointer"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Parse into Spreadsheet Grid</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Final Generate Action */}
        <div className="p-4 sm:p-5 border-t border-[#E8DCCB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            <span>Total rows: </span>
            <strong className="text-[#10233F] font-mono">{rows.length}</strong>
            <span className="mx-2">•</span>
            <span>Valid to insert: </span>
            <strong className="text-emerald-700 font-mono">{validCount}</strong>
            {invalidCount > 0 && (
              <>
                <span className="mx-2">•</span>
                <span className="text-amber-700">({invalidCount} row(s) missing name or 10-digit phone)</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleGenerateAllLeads}
              disabled={isSubmitting || validCount === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Leads...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate All Leads ({validCount} Leads)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

