'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import TiltCard from '@/components/ui/TiltCard';
import {
  ArrowRight,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  LayoutGrid,
  LayoutList,
  X,
  ExternalLink,
  BookOpen,
  Award,
  Scale,
  Gavel,
  ThumbsUp,
  Eye,
} from 'lucide-react';

export interface GazetteArticle {
  id: number;
  slug: string;
  title: string;
  category: 'judiciary' | 'jurisprudence' | 'clat' | 'all';
  categoryLabel: string;
  date: string;
  readTime: string;
  excerpt: string;
  author: string;
  authorRole: string;
  avatar: string;
  accentColor: string;
  badge?: string;
  initialClaps: number;
  keyTakeaways: string[];
  statutesCited: string[];
  fullSummary: string;
}

const GAZETTE_ARTICLES: GazetteArticle[] = [
  {
    id: 1,
    slug: 'cracking-pcs-judicial-services-strategy',
    title: 'Cracking PCS (Judicial Services): Strategy, Judgment Writing & High Court Precedents',
    category: 'judiciary',
    categoryLabel: 'Judicial Services',
    date: 'September 2026',
    readTime: '6 min read',
    excerpt:
      'A systematic roadmap for mastering Civil Procedure, Criminal Law, BNSS 2023, and scoring high in Mains judgment writing.',
    author: 'Adv. Rajesh Kumar',
    authorRole: 'Head — Judiciary & PCS J Division',
    avatar: '/images/avatars/avatar-3.webp',
    accentColor: '#89190E',
    badge: 'Trending #1 in Punjab PCS-J',
    initialClaps: 248,
    keyTakeaways: [
      'Master procedural transitions under the newly enacted Bharatiya Nagarik Suraksha Sanhita (BNSS 2023).',
      'Judicial framing of issues in Civil cases & framing of charges in Criminal trials with exact statutory citation.',
      'Three-tier evaluation framework for appraisal of witness testimony and electronic evidence (BSA Sec 63).',
    ],
    statutesCited: ['BNSS 2023 § 173', 'CPC 1908 Order XIV', 'BSA 2023 § 63', 'Constitution Art. 235'],
    fullSummary:
      'Success in State Judicial Services examinations demands far more than verbatim memorization of bare acts. In this comprehensive dispatch, Adv. Rajesh Kumar breaks down the analytical doctrine needed to clear the Punjab and Haryana High Court Judicial Mains examinations. Special emphasis is given to the statutory harmonization of Bharatiya Nyaya Sanhita (BNS) alongside classical judgment drafting templates.',
  },
  {
    id: 2,
    slug: 'national-moot-court-victory-msi-law-delegation',
    title: 'National Moot Court Victory: MSI Law Delegation Triumphs on Constitutional Rights',
    category: 'jurisprudence',
    categoryLabel: 'Legal Jurisprudence',
    date: 'August 2026',
    readTime: '6 min read',
    excerpt:
      'An inside look at our integrated law students formulating appellate arguments before a simulated 5-judge Supreme Court bench.',
    author: 'Dr. Ekta Gahlawat',
    authorRole: 'Faculty – Legal Studies, MSI',
    avatar: '/images/avatars/avatar-2.webp',
    accentColor: '#10233F',
    badge: 'National Champions 2026',
    initialClaps: 312,
    keyTakeaways: [
      'Framing appellate questions of law concerning data privacy vs. statutory surveillance doctrines.',
      'Adherence to Harvard Bluebook & Indian Law Institute (ILI) citation protocols in winning memorials.',
      'Bench management techniques during rigorous judicial questioning by sitting High Court judges.',
    ],
    statutesCited: ['Constitution Art. 21', 'Constitution Art. 32', 'DPDP Act 2023 § 4', 'Puttaswamy (2017) 10 SCC 1'],
    fullSummary:
      'The MSI Group of Institutes Law delegation recently clinched top honours at the 14th National Constitutional Law Moot Court Competition. Under the mentorship of Dr. Ekta Gahlawat, student counsels argued contentious constitutional issues involving emergent biometric surveillance technologies against the doctrine of proportional privacy.',
  },
  {
    id: 3,
    slug: 'mastering-clat-passage-based-reasoning-gk',
    title: 'Mastering CLAT & PU Law Entrance: Tackling Passage-Based Reasoning & Current Affairs',
    category: 'clat',
    categoryLabel: 'Law Entrance',
    date: 'August 2026',
    readTime: '5 min read',
    excerpt:
      'Proven test strategies for scoring high in Critical Reasoning, Passage Mapping, and Static GK for NLU and Panjab University admissions.',
    author: 'Ms. Riya Hooda',
    authorRole: 'Faculty – Logical Reasoning',
    avatar: '/images/avatars/avatar-5.webp',
    accentColor: '#89190E',
    badge: 'High-Yield Entrance Guide',
    initialClaps: 189,
    keyTakeaways: [
      'Rapid passage mapping to isolate premises, counter-premises, and conclusion in under 75 seconds.',
      'Eliminating seductive answer traps in Legal Reasoning without bringing outside factual bias.',
      'Systematic monthly revision matrix for Supreme Court constitutional bench rulings & legal current affairs.',
    ],
    statutesCited: ['Law of Torts', 'Indian Contract Act § 56', 'Doctrine of Basic Structure', 'NLU Cutoff Matrix'],
    fullSummary:
      'The modern CLAT paper rewards rapid analytical comprehension over rote memory. Ms. Riya Hooda shares the proprietary MSI reading method: separating extraneous rhetoric from core legal principles to achieve 90%+ accuracy in passage-based reasoning sets.',
  },
  {
    id: 4,
    slug: 'the-new-criminal-laws-bns-bnss-bsa-aspirants',
    title: 'The New Criminal Laws (BNS, BNSS, BSA 2023): Critical Shifts Judicial Aspirants Must Know',
    category: 'judiciary',
    categoryLabel: 'Judicial Services',
    date: 'July 2026',
    readTime: '7 min read',
    excerpt:
      'Examining key statutory shifts from IPC, CrPC, and Indian Evidence Act to the newly enacted Bharatiya Sanhitas.',
    author: 'Dr. Vikramaditya Sharma',
    authorRole: 'Senior Professor of Procedural Law',
    avatar: '/images/avatars/avatar-4.webp',
    accentColor: '#10233F',
    badge: 'Syllabus Core',
    initialClaps: 421,
    keyTakeaways: [
      'Detailed cross-reference comparative table mapping IPC provisions to Bharatiya Nyaya Sanhita (BNS).',
      'Electronic evidence admissibility mandatory timelines and hash-value integrity under BSA 2023.',
      'Community service sentencing guidelines and revised procedural safeguards for arrests.',
    ],
    statutesCited: ['BNS 2023 § 103', 'BNSS 2023 § 107', 'BSA 2023 § 63(4)', 'CrPC 1973 § 167 Comp.'],
    fullSummary:
      'The replacement of legacy British-era criminal codes by Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, and Bharatiya Sakshya Adhiniyam represents the biggest procedural transformation in modern Indian jurisprudence. Dr. Vikramaditya Sharma analyzes how these provisions are structured in current PCS(J) syllabus examinations.',
  },
  {
    id: 5,
    slug: 'pu-law-entrance-10-year-paper-breakdown',
    title: 'Panjab University (PU) Law Entrance: 10-Year Paper Breakdown & High-Yield Strategy',
    category: 'clat',
    categoryLabel: 'PU Law Entrance',
    date: 'July 2026',
    readTime: '5 min read',
    excerpt:
      'Detailed analysis of Panjab University 3-Year & 5-Year Law entrance exam patterns, cutoff trends, and high-frequency topics.',
    author: 'Mr. Anurag Dwivedi',
    authorRole: 'Faculty – GK & Current Affairs',
    avatar: '/images/avatars/avatar-1.webp',
    accentColor: '#89190E',
    badge: 'Cutoff Blueprint',
    initialClaps: 165,
    keyTakeaways: [
      'Comprehensive 10-year section-wise weightage breakdown for PU 3-Year LLB & 5-Year BA/B.Com LLB.',
      'High-frequency constitutional law articles regularly tested in the legal aptitude portion.',
      'Time-tested time management schedule: 100 questions in 90 minutes with zero negative penalty panic.',
    ],
    statutesCited: ['Constitution Part III', 'Legal Maxims (Res Ipsa Loquitur)', 'PU Entrance Archive 2015–2025'],
    fullSummary:
      'Panjab University Law department in Chandigarh remains one of North India’s premier destinations for legal education. Mr. Anurag Dwivedi provides candidates with a high-yield study planner, focusing on legal maxims, constitutional amendments, and landmark judicial citations.',
  },
];

type CategoryFilter = 'all' | 'judiciary' | 'jurisprudence' | 'clat';
type ViewMode = 'list' | 'grid';

export default function BlogPreview() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Expanded takeaways accordion per article ID
  const [expandedTakeaways, setExpandedTakeaways] = useState<{ [key: number]: boolean }>({});

  // Active playing audio simulation per article ID
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);

  // Claps State
  const [clapsState, setClapsState] = useState<{ [key: number]: number }>(() => {
    const initial: { [key: number]: number } = {};
    GAZETTE_ARTICLES.forEach((a) => {
      initial[a.id] = a.initialClaps;
    });
    return initial;
  });

  // Recent Clap Animation Trigger per article ID
  const [justClappedId, setJustClappedId] = useState<number | null>(null);

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<{ [key: number]: boolean }>({});

  // Copied Link Feedback
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Quick Reader Modal
  const [selectedArticleForModal, setSelectedArticleForModal] = useState<GazetteArticle | null>(null);

  // Sync bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('msi_gazette_bookmarks');
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleToggleBookmark = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('msi_gazette_bookmarks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClap = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setClapsState((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    setJustClappedId(id);
    setTimeout(() => {
      setJustClappedId(null);
    }, 800);
  };

  const handleToggleTakeaways = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedTakeaways((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleAudio = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setPlayingAudioId((prev) => (prev === id ? null : id));
  };

  const handleShare = (e: React.MouseEvent, article: GazetteArticle) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/blog#${article.slug}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        setCopiedId(article.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    }
  };

  // Filtered Articles based on Category and Search Query
  const filteredArticles = useMemo(() => {
    return GAZETTE_ARTICLES.filter((article) => {
      const matchesCategory =
        activeCategory === 'all' || article.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.statutesCited.some((s) => s.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Counts for tabs
  const categoryCounts = useMemo(() => {
    return {
      all: GAZETTE_ARTICLES.length,
      judiciary: GAZETTE_ARTICLES.filter((a) => a.category === 'judiciary').length,
      jurisprudence: GAZETTE_ARTICLES.filter((a) => a.category === 'jurisprudence').length,
      clat: GAZETTE_ARTICLES.filter((a) => a.category === 'clat').length,
    };
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-[#FFF9EF] relative overflow-hidden" aria-label="MSI Gazette">
      {/* Decorative Blueprint Background Grid */}
      <div className="absolute inset-0 blueprint-grid opacity-15 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#89190E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#EFC988]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1380px] mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
        
        {/* ========================================================== */}
        {/* SECTION HEADER                                            */}
        {/* ========================================================== */}
        <Reveal
          direction="up"
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFF3DD] border border-[#EFC988] text-[#89190E] text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <BookOpen className="w-3.5 h-3.5 text-[#89190E]" />
              <span>Scholarly Thought & Stories</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10233F] tracking-tight leading-tight">
              From the MSI Gazette
            </h2>
            <p className="text-sm sm:text-base text-[#526174] mt-2.5 max-w-xl">
              Research findings, competition victories, statutory analyses, and academic breakthroughs by MSI faculty & scholars.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-[#E8DCCB] hover:border-[#89190E] text-xs sm:text-sm font-bold text-[#89190E] hover:text-white hover:bg-[#89190E] transition-all shadow-xs group cursor-pointer"
            >
              <span>Explore All Gazette Dispatches</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {/* ========================================================== */}
        {/* INTERACTIVE CONTROLS: CATEGORIES + SEARCH + VIEW TOGGLE   */}
        {/* ========================================================== */}
        <Reveal direction="up" delay={60} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 sm:p-2.5 bg-white border border-[#E8DCCB] rounded-2xl shadow-xs">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1.5 ${
                  activeCategory === 'all'
                    ? 'bg-[#89190E] text-white shadow-xs'
                    : 'text-[#526174] hover:text-[#10233F] hover:bg-[#FFF9EF]'
                }`}
              >
                <span>All Stories</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === 'all' ? 'bg-[#FFF3DD] text-[#89190E]' : 'bg-[#E8DCCB]/60 text-[#526174]'
                  }`}
                >
                  {categoryCounts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('judiciary')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1.5 ${
                  activeCategory === 'judiciary'
                    ? 'bg-[#89190E] text-white shadow-xs'
                    : 'text-[#526174] hover:text-[#10233F] hover:bg-[#FFF9EF]'
                }`}
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Judicial Services (PCS-J)</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === 'judiciary' ? 'bg-[#FFF3DD] text-[#89190E]' : 'bg-[#E8DCCB]/60 text-[#526174]'
                  }`}
                >
                  {categoryCounts.judiciary}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('jurisprudence')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1.5 ${
                  activeCategory === 'jurisprudence'
                    ? 'bg-[#89190E] text-white shadow-xs'
                    : 'text-[#526174] hover:text-[#10233F] hover:bg-[#FFF9EF]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Legal Jurisprudence & Moots</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === 'jurisprudence' ? 'bg-[#FFF3DD] text-[#89190E]' : 'bg-[#E8DCCB]/60 text-[#526174]'
                  }`}
                >
                  {categoryCounts.jurisprudence}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('clat')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1.5 ${
                  activeCategory === 'clat'
                    ? 'bg-[#89190E] text-white shadow-xs'
                    : 'text-[#526174] hover:text-[#10233F] hover:bg-[#FFF9EF]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>CLAT & Entrance</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === 'clat' ? 'bg-[#FFF3DD] text-[#89190E]' : 'bg-[#E8DCCB]/60 text-[#526174]'
                  }`}
                >
                  {categoryCounts.clat}
                </span>
              </button>
            </div>

            {/* Right: Search Box + View Toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-[#526174] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by topic or act..."
                  className="w-full pl-8 pr-7 py-1.5 bg-[#FFF9EF]/60 border border-[#E8DCCB] rounded-xl text-xs text-[#10233F] placeholder-[#526174]/70 focus:outline-none focus:border-[#89190E] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#526174] hover:text-[#10233F]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle: List vs Grid */}
              <div className="flex items-center p-0.5 bg-[#FFF9EF] border border-[#E8DCCB] rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-[#89190E] shadow-2xs font-bold'
                      : 'text-[#526174] hover:text-[#10233F]'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Magazine Grid View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#89190E] shadow-2xs font-bold'
                      : 'text-[#526174] hover:text-[#10233F]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Hashtag Filters */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3 px-1 text-xs">
            <span className="text-[11px] font-mono text-[#526174] font-bold uppercase mr-1">
              Popular Tags:
            </span>
            {['#BNSS2023', '#JudiciaryMains', '#MootCourtVictory', '#Article21', '#CLATPrep'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag.replace('#', ''))}
                className="px-2.5 py-0.5 rounded-md bg-white border border-[#E8DCCB] hover:border-[#89190E] text-[11px] font-medium text-[#526174] hover:text-[#89190E] hover:bg-[#FFF9EF] transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-[#89190E] hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>
        </Reveal>

        {/* Empty Search Feedback */}
        {filteredArticles.length === 0 && (
          <div className="p-12 text-center bg-white border border-[#E8DCCB] rounded-3xl my-6">
            <BookOpen className="w-12 h-12 text-[#E8DCCB] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#10233F]">No Gazette Dispatches Found</h3>
            <p className="text-xs text-[#526174] mt-1 max-w-sm mx-auto">
              No articles matched your filter criteria &quot;{searchQuery}&quot;. Try selecting another category or clear the search.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#89190E] text-white text-xs font-bold hover:bg-[#65130D] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW MODE 1: EDITORIAL LIST (STACKED HORIZONTAL CARDS)    */}
        {/* ========================================================== */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-5">
            {filteredArticles.map((article, idx) => {
              const isActive = activeIdx === idx;
              const isTakeawayOpen = !!expandedTakeaways[article.id];
              const isBookmarked = !!bookmarkedIds[article.id];
              const isPlayingAudio = playingAudioId === article.id;
              const claps = clapsState[article.id] || article.initialClaps;
              const isJustClapped = justClappedId === article.id;

              return (
                <Reveal key={article.id} direction="up" delay={idx * 60}>
                  <TiltCard className="rounded-3xl" intensity={3} glare shine>
                    <article
                      className="relative bg-white rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer shadow-xs group"
                      style={{
                        borderColor: isActive ? article.accentColor + '50' : '#E8DCCB',
                        boxShadow: isActive
                          ? `0 20px 50px ${article.accentColor}12, 0 4px 16px rgba(0,0,0,0.04)`
                          : '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseLeave={() => setActiveIdx(null)}
                      onClick={() => setSelectedArticleForModal(article)}
                    >
                      {/* Top Animated Progress Bar */}
                      <div
                        className="absolute top-0 left-0 h-[3.5px] rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: article.accentColor,
                          width: isActive ? '100%' : '0%',
                          transition: 'width 500ms cubic-bezier(0.16,1,0.3,1)',
                        }}
                      />

                      {/* Radial Accent Spotlight */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-3xl"
                        style={{
                          background: `radial-gradient(ellipse at 4% 50%, ${article.accentColor}08 0%, transparent 60%)`,
                          opacity: isActive ? 1 : 0,
                          transition: 'opacity 350ms ease',
                        }}
                      />

                      {/* Main Card Content */}
                      <div className="relative z-10 p-5 sm:p-7">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          
                          {/* 1. Author Avatar on LEFT */}
                          <div className="flex-shrink-0 relative">
                            <div
                              className="relative transition-transform duration-300"
                              style={{
                                transform: isActive ? 'scale(1.06) rotate(2deg)' : 'scale(1) rotate(0deg)',
                              }}
                            >
                              <div
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden relative shadow-md"
                                style={{
                                  border: `2.5px solid ${isActive ? article.accentColor : '#EFC988'}`,
                                  transition: 'border-color 300ms ease',
                                }}
                              >
                                <Image
                                  src={article.avatar}
                                  alt={article.author}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              </div>

                              {/* Tiny Verified Seal Pill */}
                              <div
                                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm"
                                style={{ backgroundColor: article.accentColor }}
                                title="Verified Faculty Author"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            </div>
                          </div>

                          {/* 2. Middle Content Area */}
                          <div className="flex-1 min-w-0">
                            {/* Meta Badges */}
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <span
                                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border transition-all"
                                style={{
                                  color: article.accentColor,
                                  backgroundColor: isActive ? article.accentColor + '12' : '#FFF3DD',
                                  borderColor: isActive ? article.accentColor + '35' : '#F7E5BF',
                                }}
                              >
                                {article.categoryLabel}
                              </span>

                              {article.badge && (
                                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                                  <Sparkles className="w-3 h-3 text-amber-600" />
                                  <span>{article.badge}</span>
                                </span>
                              )}

                              <span className="text-[11px] text-[#526174] flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-[#89190E]" />
                                {article.readTime}
                              </span>

                              <span className="text-[11px] text-[#526174] flex items-center gap-1 font-mono">
                                <Calendar className="w-3 h-3" />
                                {article.date}
                              </span>
                            </div>

                            {/* Title */}
                            <h3
                              className="font-serif text-lg sm:text-xl font-bold leading-snug mb-2 transition-colors duration-200"
                              style={{ color: isActive ? article.accentColor : '#10233F' }}
                            >
                              {article.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-xs sm:text-sm text-[#526174] leading-relaxed line-clamp-2">
                              {article.excerpt}
                            </p>

                            {/* Author & Academic Role */}
                            <div className="mt-3 flex items-center flex-wrap gap-1.5 text-xs text-[#526174]">
                              <span className="font-bold text-[#10233F]">{article.author}</span>
                              <span>·</span>
                              <span>{article.authorRole}</span>
                            </div>
                          </div>

                          {/* 3. Action Buttons & Quick Read CTA */}
                          <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8DCCB]/60 gap-3">
                            {/* Read Arrow Circle Button */}
                            <button
                              type="button"
                              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer group-hover:scale-105"
                              style={{
                                backgroundColor: isActive ? article.accentColor : '#FFF3DD',
                                color: isActive ? '#fff' : article.accentColor,
                              }}
                              title="Read Full Story Preview"
                            >
                              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                            </button>

                            <span className="text-[10px] font-mono font-bold text-[#89190E] uppercase tracking-wider hidden sm:block">
                              Quick Read
                            </span>
                          </div>

                        </div>

                        {/* ==================================================== */}
                        {/* BOTTOM INTERACTIVE ACTION BAR                       */}
                        {/* ==================================================== */}
                        <div className="mt-4 pt-3.5 border-t border-[#E8DCCB]/70 flex items-center justify-between flex-wrap gap-2 text-xs">
                          
                          {/* Left: Claps + Bookmark + Audio + Share */}
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            {/* Clap / Applaud Button */}
                            <button
                              type="button"
                              onClick={(e) => handleClap(e, article.id)}
                              className={`relative px-2.5 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all cursor-pointer ${
                                isJustClapped
                                  ? 'bg-[#FFF3DD] border-[#EFC988] scale-105'
                                  : 'bg-white hover:bg-[#FFF9EF] border-[#E8DCCB] text-[#526174] hover:text-[#89190E]'
                              }`}
                              title="Applaud this scholarly analysis"
                            >
                              <span className="text-sm">👏</span>
                              <span className="font-mono text-[11px] font-bold text-[#10233F]">
                                {claps}
                              </span>

                              {/* Floating +1 Bubble */}
                              {isJustClapped && (
                                <span className="absolute -top-3.5 right-1 px-1.5 py-0.2 bg-[#89190E] text-white text-[9px] font-bold rounded-full animate-bounce">
                                  +1
                                </span>
                              )}
                            </button>

                            {/* Bookmark Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleBookmark(e, article.id)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isBookmarked
                                  ? 'bg-[#89190E] text-white border-[#89190E] shadow-2xs'
                                  : 'bg-white hover:bg-[#FFF9EF] border-[#E8DCCB] text-[#526174] hover:text-[#89190E]'
                              }`}
                              title={isBookmarked ? 'Bookmarked' : 'Save to reading list'}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>

                            {/* Audio Summary Listener (Simulated) */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleAudio(e, article.id)}
                              className={`px-2.5 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all cursor-pointer text-[11px] ${
                                isPlayingAudio
                                  ? 'bg-[#89190E] text-white border-[#89190E]'
                                  : 'bg-white hover:bg-[#FFF9EF] border-[#E8DCCB] text-[#526174] hover:text-[#89190E]'
                              }`}
                              title="Listen to 3-minute executive summary"
                            >
                              {isPlayingAudio ? (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#EFC988]" />
                                  <span className="font-semibold">Playing Narration...</span>
                                  {/* Waveform bars */}
                                  <span className="flex items-center space-x-0.5 ml-1">
                                    <span className="w-0.5 h-2 bg-[#EFC988] animate-ping" />
                                    <span className="w-0.5 h-3 bg-white" />
                                    <span className="w-0.5 h-1.5 bg-[#EFC988]" />
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-[#89190E]" />
                                  <span>Listen (3m)</span>
                                </>
                              )}
                            </button>

                            {/* Share Button */}
                            <button
                              type="button"
                              onClick={(e) => handleShare(e, article)}
                              className="p-1.5 rounded-lg border bg-white hover:bg-[#FFF9EF] border-[#E8DCCB] text-[#526174] hover:text-[#89190E] transition-all cursor-pointer relative"
                              title="Share article citation"
                            >
                              {copiedId === article.id ? (
                                <span className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold px-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied</span>
                                </span>
                              ) : (
                                <Share2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Right: Toggle Takeaways Accordion */}
                          <div>
                            <button
                              type="button"
                              onClick={(e) => handleToggleTakeaways(e, article.id)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FFF9EF] hover:bg-[#FFF3DD] text-[#89190E] text-[11px] font-bold border border-[#E8DCCB] transition-colors cursor-pointer"
                            >
                              <span>Key Takeaways (3)</span>
                              {isTakeawayOpen ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                        </div>

                        {/* ==================================================== */}
                        {/* EXPANDABLE INLINE TAKEAWAYS ACCORDION               */}
                        {/* ==================================================== */}
                        {isTakeawayOpen && (
                          <div className="mt-3.5 p-4 rounded-2xl bg-[#FFF9EF] border border-[#EFC988]/60 text-xs animate-fadeIn">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono uppercase font-bold text-[10px] tracking-wider text-[#89190E]">
                                Academic & Judicial Takeaways
                              </span>
                              <span className="text-[10px] text-[#526174]">
                                Evaluated by {article.author}
                              </span>
                            </div>

                            <ul className="space-y-1.5 pl-4 list-disc text-[#10233F]">
                              {article.keyTakeaways.map((point, kIdx) => (
                                <li key={kIdx} className="leading-relaxed">
                                  {point}
                                </li>
                              ))}
                            </ul>

                            {/* Statues Cited Pills */}
                            <div className="mt-3 pt-2.5 border-t border-[#E8DCCB] flex items-center flex-wrap gap-1.5">
                              <span className="text-[10px] font-mono text-[#526174] font-bold">
                                Statutes Cited:
                              </span>
                              {article.statutesCited.map((stat, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded-md bg-white border border-[#E8DCCB] text-[10px] font-mono font-bold text-[#89190E]"
                                >
                                  {stat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </article>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW MODE 2: MAGAZINE GRID VIEW (3 COLUMNS)              */}
      {/* ========================================================== */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, idx) => {
            const isBookmarked = !!bookmarkedIds[article.id];
            const claps = clapsState[article.id] || article.initialClaps;
            const isJustClapped = justClappedId === article.id;

            return (
              <Reveal key={article.id} direction="up" delay={idx * 60}>
                <div
                  className="bg-white rounded-3xl border border-[#E8DCCB] hover:border-[#89190E]/50 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full"
                  onClick={() => setSelectedArticleForModal(article)}
                >
                  {/* Card Header Strip */}
                  <div
                    className="p-5 pb-4 border-b border-[#E8DCCB]/60"
                    style={{ backgroundColor: `${article.accentColor}08` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                        style={{
                          color: article.accentColor,
                          backgroundColor: '#FFF3DD',
                          borderColor: '#F7E5BF',
                        }}
                      >
                        {article.categoryLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, article.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-[#89190E] text-white border-[#89190E]'
                            : 'bg-white border-[#E8DCCB] text-[#526174] hover:text-[#89190E]'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#10233F] group-hover:text-[#89190E] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#526174] leading-relaxed line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>

                    {/* Author Row */}
                    <div className="flex items-center space-x-3 pt-3 border-t border-[#E8DCCB]/50">
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-[#EFC988] flex-shrink-0">
                        <Image
                          src={article.avatar}
                          alt={article.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-[#10233F] truncate">
                          {article.author}
                        </span>
                        <span className="block text-[10.5px] text-[#526174] truncate">
                          {article.authorRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Strip */}
                  <div className="px-5 py-3 bg-[#FFF9EF] border-t border-[#E8DCCB] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => handleClap(e, article.id)}
                      className="flex items-center space-x-1.5 text-[#526174] hover:text-[#89190E] font-mono text-[11px] font-bold"
                    >
                      <span>👏</span>
                      <span>{claps}</span>
                      {isJustClapped && (
                        <span className="text-[9px] text-[#89190E] font-bold">+1</span>
                      )}
                    </button>

                    <div className="flex items-center space-x-1 text-[#89190E] font-bold text-xs group-hover:translate-x-1 transition-transform">
                      <span>Read Preview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ========================================================== */}
      {/* INTERACTIVE GAZETTE READER MODAL ("MSI SCHOLAR READER")   */}
      {/* ========================================================== */}
      {selectedArticleForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#10233F]/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedArticleForModal(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] bg-white border border-[#E8DCCB] rounded-3xl shadow-2xl overflow-y-auto hud-bracket p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedArticleForModal(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[#FFF9EF] hover:bg-[#FFF3DD] text-[#10233F] flex items-center justify-center transition-colors cursor-pointer border border-[#E8DCCB]"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Top Meta */}
            <div className="flex items-center space-x-2 mb-3">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border"
                style={{
                  color: selectedArticleForModal.accentColor,
                  backgroundColor: '#FFF3DD',
                  borderColor: '#F7E5BF',
                }}
              >
                {selectedArticleForModal.categoryLabel}
              </span>
              <span className="text-xs text-[#526174] font-mono">
                {selectedArticleForModal.date} · {selectedArticleForModal.readTime}
              </span>
            </div>

            {/* Article Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#10233F] leading-tight mb-4">
              {selectedArticleForModal.title}
            </h2>

            {/* Author Profile Strip */}
            <div className="flex items-center space-x-3.5 p-3.5 bg-[#FFF9EF] rounded-2xl border border-[#E8DCCB] mb-5">
              <div className="w-12 h-12 rounded-xl overflow-hidden relative border-2 border-[#EFC988] flex-shrink-0">
                <Image
                  src={selectedArticleForModal.avatar}
                  alt={selectedArticleForModal.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-[#10233F]">
                    {selectedArticleForModal.author}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#89190E] text-white text-[9px] font-bold rounded-full uppercase">
                    Faculty
                  </span>
                </div>
                <span className="text-xs text-[#526174] block truncate">
                  {selectedArticleForModal.authorRole}
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-3.5 text-sm text-[#10233F] leading-relaxed">
              <p className="font-serif text-base text-[#10233F]/90 leading-relaxed italic border-l-4 border-[#89190E] pl-3.5 my-2">
                &ldquo;{selectedArticleForModal.excerpt}&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-[#526174] leading-relaxed">
                {selectedArticleForModal.fullSummary}
              </p>
            </div>

            {/* Key Takeaways Box */}
            <div className="mt-5 p-4 rounded-2xl bg-[#FFF9EF] border border-[#EFC988] space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#89190E] block">
                Key Strategic Takeaways
              </span>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-[#10233F]">
                {selectedArticleForModal.keyTakeaways.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Statutes Cited */}
            <div className="mt-4 flex items-center flex-wrap gap-1.5">
              <span className="text-xs font-mono font-bold text-[#526174]">
                Statutory Citations:
              </span>
              {selectedArticleForModal.statutesCited.map((stat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white border border-[#E8DCCB] text-xs font-mono font-bold text-[#89190E]"
                >
                  {stat}
                </span>
              ))}
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-5 border-t border-[#E8DCCB] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => handleClap(e, selectedArticleForModal.id)}
                  className="px-3 py-2 rounded-xl bg-[#FFF9EF] hover:bg-[#FFF3DD] border border-[#E8DCCB] text-xs font-bold text-[#10233F] flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>👏</span>
                  <span className="font-mono">{clapsState[selectedArticleForModal.id]}</span>
                  <span>Applauds</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleToggleBookmark(e, selectedArticleForModal.id)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    bookmarkedIds[selectedArticleForModal.id]
                      ? 'bg-[#89190E] text-white border-[#89190E]'
                      : 'bg-white border-[#E8DCCB] text-[#526174]'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/blog"
                onClick={() => setSelectedArticleForModal(null)}
                className="px-4 py-2.5 rounded-xl bg-[#89190E] hover:bg-[#65130D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#89190E]/20 transition-all cursor-pointer"
              >
                <span>Read Full Manuscript in Blog</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}

      </div>
    </section>
  );
}
