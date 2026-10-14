import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export interface GalleryItem {
  id: number;
  title: string;
  category: 'institute' | 'labs' | 'library' | 'events';
  image: string;
  tagline: string;
  desc: string;
  span?: 'wide' | 'normal';
  uploadedAt?: string;
}

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 1,
    title: 'Main Reception & Golden Crest',
    category: 'institute',
    image: '/images/tour/tour-frame-1.webp',
    tagline: 'Official MSI Institute Seal',
    desc: 'Monga City Centre entrance with carved wooden wall and golden MSI Group of Institutes seal.',
    span: 'wide',
    uploadedAt: '2026-01-15',
  },
  {
    id: 2,
    title: 'Judicial Chamber & Legal Research Sanctum',
    category: 'labs',
    image: '/images/tour/tour-frame-2.webp',
    tagline: 'Executive Judicial Chamber',
    desc: 'Study sanctum equipped with Lady Justice statue, Indian national flags, Bare Act concordances, and AIR digests.',
    uploadedAt: '2026-02-10',
  },
  {
    id: 3,
    title: 'Central Academic Library',
    category: 'library',
    image: '/images/hero-3.webp',
    tagline: 'Scholarly Sanctuary',
    desc: 'Sprawling reading halls and digital legal databases accommodating over 500 scholars.',
    uploadedAt: '2026-02-20',
  },
  {
    id: 4,
    title: 'Student Discussion & Mentorship Chambers',
    category: 'institute',
    image: '/images/tour/tour-frame-4.webp',
    tagline: 'Student Life & Dialogue',
    desc: 'Peer discussions, faculty consultations, and mock debate groups at Monga City Centre institute.',
    uploadedAt: '2026-03-01',
  },
  {
    id: 5,
    title: 'Judicial Exam Hall & Speed-Test Center',
    category: 'labs',
    image: '/images/hero-2.webp',
    tagline: 'Real Exam Simulation',
    desc: 'Timed OMR test simulations, answer drafting drills, and performance evaluation.',
    span: 'wide',
    uploadedAt: '2026-03-15',
  },
  {
    id: 6,
    title: 'National Moot Court Preparation',
    category: 'events',
    image: '/images/hero-3.webp',
    tagline: 'Advocacy & Jurisprudence',
    desc: 'Law students conducting mock appellate court arguments with faculty jurists.',
    uploadedAt: '2026-03-25',
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

function readGalleryFromDisk(): GalleryItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(GALLERY_FILE)) {
      const raw = fs.readFileSync(GALLERY_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(INITIAL_GALLERY, null, 2), 'utf-8');
    return INITIAL_GALLERY;
  } catch (err) {
    console.error('[Gallery Read Error]', err);
    return INITIAL_GALLERY;
  }
}

function writeGalleryToDisk(items: GalleryItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Gallery Write Error]', err);
  }
}

export async function GET() {
  const items = readGalleryFromDisk();
  return NextResponse.json({
    success: true,
    items,
    count: items.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, image, tagline, desc, span } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Image title is required.' },
        { status: 400 }
      );
    }

    if (!image || !image.trim()) {
      return NextResponse.json(
        { success: false, message: 'Image URL or asset path is required.' },
        { status: 400 }
      );
    }

    const items = readGalleryFromDisk();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

    const newItem: GalleryItem = {
      id: nextId,
      title: title.trim(),
      category: category || 'institute',
      image: image.trim(),
      tagline: tagline?.trim() || 'MSI Campus Infrastructure',
      desc: desc?.trim() || 'Official photographic record of MSI Group of Institutes campus spaces.',
      span: span === 'wide' ? 'wide' : 'normal',
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newItem, ...items];
    writeGalleryToDisk(updated);

    return NextResponse.json({
      success: true,
      message: 'New media item uploaded and published to website gallery.',
      item: newItem,
      items: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to add gallery item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json(
        { success: false, message: 'Missing gallery item ID parameter.' },
        { status: 400 }
      );
    }

    const id = Number(idParam);
    const items = readGalleryFromDisk();
    const filtered = items.filter((i) => i.id !== id);

    if (filtered.length === items.length) {
      return NextResponse.json(
        { success: false, message: 'Gallery item not found.' },
        { status: 404 }
      );
    }

    writeGalleryToDisk(filtered);

    return NextResponse.json({
      success: true,
      message: 'Gallery item permanently deleted from website.',
      items: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
