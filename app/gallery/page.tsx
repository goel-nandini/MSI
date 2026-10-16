'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import EnquiryModal from '@/components/modals/EnquiryModal';
import VideoModal from '@/components/modals/VideoModal';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { Play, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  category: 'institute' | 'labs' | 'library' | 'events';
  image: string;
  tagline: string;
  desc: string;
  span?: 'wide' | 'normal';
}

export default function GalleryPage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'institute' | 'labs' | 'library' | 'events'>('all');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
    { id: 1, title: 'Main Reception & Golden Crest', category: 'institute', image: '/images/tour/tour-frame-1.webp', tagline: 'Official MSI Institute Seal', desc: 'Monga City Centre entrance with carved wooden wall and golden MSI Group of Institutes seal.', span: 'wide' },
    { id: 2, title: 'Judicial Chamber & Legal Research Sanctum', category: 'labs', image: '/images/tour/tour-frame-2.webp', tagline: 'Executive Judicial Chamber', desc: 'Study sanctum equipped with Lady Justice statue, Indian national flags, Bare Act concordances, and AIR digests.' },
    { id: 3, title: 'Central Academic Library', category: 'library', image: '/images/hero-3.webp', tagline: 'Scholarly Sanctuary', desc: 'Sprawling reading halls and digital legal databases accommodating over 500 scholars.' },
    { id: 4, title: 'Student Discussion & Mentorship Chambers', category: 'institute', image: '/images/tour/tour-frame-4.webp', tagline: 'Student Life & Dialogue', desc: 'Peer discussions, faculty consultations, and mock debate groups at Monga City Centre institute.' },
    { id: 5, title: 'Judicial Exam Hall & Speed-Test Center', category: 'labs', image: '/images/hero-2.webp', tagline: 'Real Exam Simulation', desc: 'Timed OMR test simulations, answer drafting drills, and performance evaluation.', span: 'wide' },
    { id: 6, title: 'National Moot Court Preparation', category: 'events', image: '/images/hero-3.webp', tagline: 'Advocacy & Jurisprudence', desc: 'Law students conducting mock appellate court arguments with faculty jurists.' },
  ];

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/admin/gallery', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        setGalleryItems(data.items);
        try {
          localStorage.setItem('msi_gallery_items_cache', JSON.stringify(data.items));
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Using default gallery fallback:', err);
      try {
        const cached = localStorage.getItem('msi_gallery_items_cache');
        if (cached) {
          setGalleryItems(JSON.parse(cached));
        }
      } catch (_) {}
    }
  };

  useEffect(() => {
    fetchGallery();
    const handleSync = () => fetchGallery();
    window.addEventListener('msi_gallery_sync', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('msi_gallery_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const filteredItems =
    activeCategory === 'all' ? galleryItems : galleryItems.filter((item) => item.category === activeCategory);

  const openLightbox = (item: GalleryItem, index: number) => {
    setLightboxImage(item);
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxImage(null);
  }, []);

  const prevLightbox = useCallback(() => {
    const newIdx = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    setLightboxIndex(newIdx);
    setLightboxImage(filteredItems[newIdx]);
  }, [lightboxIndex, filteredItems]);

  const nextLightbox = useCallback(() => {
    const newIdx = (lightboxIndex + 1) % filteredItems.length;
    setLightboxIndex(newIdx);
    setLightboxImage(filteredItems[newIdx]);
  }, [lightboxIndex, filteredItems]);

  // ESC key closes lightbox, Arrow keys navigate
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxImage, closeLightbox, prevLightbox, nextLightbox]);

  // Lock scroll when lightbox open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxImage]);

  const filters = [
    { key: 'all', label: 'All Spaces' },
    { key: 'institute', label: 'Institute Spaces' },
    { key: 'labs', label: 'Legal Research & Test Labs' },
    { key: 'library', label: 'Central Library' },
    { key: 'events', label: 'Moot Courts & Events' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FFF9EF] text-[#10233F] flex flex-col selection:bg-[#EFC988] selection:text-[#89190E]">
      <Navbar onOpenEnquiry={() => setIsEnquiryOpen(true)} />

      <main className="flex-grow">
        {/* Page Hero */}
        <PageHero
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Institute Life Gallery' },
          ]}
          eyebrow="Visual Journey"
          title="Life at MSI Group of Institutes"
          subtitle="Explore world-class institute infrastructure, legal research labs, moot court simulation halls, and our vibrant student community."
          bgImage="/images/hero-2.webp"
          className="pt-24 sm:pt-28"
        >
          <button
            onClick={() => setIsVideoOpen(true)}
            className="h-12 px-6 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-sm flex items-center space-x-2.5 border border-white/30 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Watch 360° Video Tour</span>
          </button>
        </PageHero>

        <div className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20">

          {/* Filter Pills */}
          <Reveal direction="up" className="mb-10">
            <div className="flex items-center flex-wrap gap-2 bg-white p-2 rounded-2xl border border-[#E8DCCB] shadow-xs w-max max-w-full overflow-x-auto">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === key
                      ? 'bg-[#89190E] text-white shadow-sm'
                      : 'text-[#526174] hover:text-[#10233F]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Masonry-style Gallery Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 mb-20">
            {filteredItems.map((item, idx) => (
              <Reveal key={item.id} direction="up" delay={idx * 60} className="break-inside-avoid">
                <div
                  onClick={() => openLightbox(item, idx)}
                  className={`group relative rounded-3xl overflow-hidden shadow-md border border-[#E8DCCB] cursor-pointer bg-white transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl ${
                    item.span === 'wide' ? 'aspect-[16/9]' : 'aspect-[4/3]'
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10233F]/90 via-[#10233F]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                  {/* View icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105">
                    <Maximize2 className="w-4 h-4" />
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-xs font-bold tracking-widest uppercase text-[#EFC988] block mb-1">{item.tagline}</span>
                    <h3 className="font-serif text-xl font-bold leading-tight mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </main>

      {/* Lightbox Modal with keyboard nav */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing: ${lightboxImage.title}`}
        >
          <div
            className="relative max-w-4xl w-full bg-[#10233F] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#89190E] transition-colors"
              aria-label="Close lightbox (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            <button
              onClick={prevLightbox}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#89190E] transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next */}
            <button
              onClick={nextLightbox}
              className="absolute right-16 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#89190E] transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="relative h-[400px] sm:h-[500px] w-full">
              <Image
                src={lightboxImage.image}
                alt={lightboxImage.title}
                fill
                unoptimized
                className="object-cover"
                sizes="100vw"
              />
            </div>


            {/* Caption bar */}
            <div className="p-6 bg-[#10233F] text-white">
              <span className="text-xs uppercase font-bold tracking-widest text-[#EFC988]">{lightboxImage.tagline}</span>
              <h3 className="font-serif text-2xl font-bold mt-1">{lightboxImage.title}</h3>
              <p className="text-sm text-gray-300 mt-2">{lightboxImage.desc}</p>
              <div className="mt-3 text-xs text-white/40">
                {lightboxIndex + 1} / {filteredItems.length} · Press ← → to navigate · Esc to close
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </div>
  );
}
