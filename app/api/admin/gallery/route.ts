import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDb, isMongoConfigured } from '@/lib/mongodb';

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
    title: 'Official Student Merit & Participation Felicitation',
    category: 'events',
    image: '/images/gallery/msi-certificate-felicitation.jpg',
    tagline: 'Merit Felicitation',
    desc: 'Awarding official MSI Certificate of Participation and academic honours to law aspirants in the presence of parents and leadership at Monga City Centre reception.',
    span: 'wide',
    uploadedAt: '2026-10-27',
  },
  {
    id: 2,
    title: 'Judicial Research Chambers & Study Desks',
    category: 'labs',
    image: '/images/gallery/msi-legal-research-study-cubicles.jpg',
    tagline: 'Legal Research Carrels',
    desc: 'Dedicated individual student study carrels equipped with Bare Act concordances, Supreme Court & High Court digests, and criminal procedure law volumes.',
    uploadedAt: '2026-10-27',
  },
  {
    id: 3,
    title: 'Quiet Reading Suites & LL.M Library Sanctum',
    category: 'library',
    image: '/images/gallery/msi-student-reading-hall.jpg',
    tagline: 'Scholarly Workstations',
    desc: 'Spacious study cubicles designed for focused CLAT PG, LL.M entrance, and judicial service preparation with personal book storage.',
    uploadedAt: '2026-10-27',
  },
  {
    id: 4,
    title: 'Punjab & Delhi Law Digests Reference Section',
    category: 'institute',
    image: '/images/gallery/msi-judicial-study-suites.jpg',
    tagline: 'Case Law & Digests',
    desc: 'Extensive shelf collection of Punjab and Delhi Law Digests, Constitutional treatises, and individual study desks for case law analysis.',
    uploadedAt: '2026-10-27',
  },
  {
    id: 5,
    title: 'All India Reporter (AIR) & State Acts Library',
    category: 'library',
    image: '/images/gallery/msi-law-library-air-manuals.jpg',
    tagline: 'Statutory Reference Stacks',
    desc: 'Multi-tier library stacks housing complete multi-volume AIR Manuals, Punjab Local Acts & Rules, and central statutes for deep legal research.',
    span: 'wide',
    uploadedAt: '2026-10-27',
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

function readGalleryFromDisk(): GalleryItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (_) {}
    }
    if (fs.existsSync(GALLERY_FILE)) {
      const raw = fs.readFileSync(GALLERY_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
    try {
      fs.writeFileSync(GALLERY_FILE, JSON.stringify(INITIAL_GALLERY, null, 2), 'utf-8');
    } catch (_) {}
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
    console.warn('[Gallery Write Error - Read Only FS on Vercel]:', err);
  }
}

async function getGalleryAsync(): Promise<GalleryItem[]> {
  try {
    const db = await getDb();
    if (db) {
      const col = db.collection<GalleryItem>('gallery');
      const docs = await col.find({}).sort({ id: -1 }).toArray();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => {
          const { _id, ...rest } = d;
          return rest as GalleryItem;
        });
      }
    }
  } catch (err) {
    console.warn('[Gallery MongoDB Error]:', err);
  }
  return readGalleryFromDisk();
}

export async function GET() {
  const items = await getGalleryAsync();
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

    const currentItems = await getGalleryAsync();
    const nextId =
      currentItems.length > 0 ? Math.max(...currentItems.map((i) => Number(i.id) || 0)) + 1 : 1;

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

    try {
      const db = await getDb();
      if (db) {
        await db.collection('gallery').insertOne(newItem as any);
      }
    } catch (err) {
      console.warn('[Gallery MongoDB Insert Error]:', err);
    }

    const updated = await getGalleryAsync();
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, category, image, tagline, desc, span } = body;

    if (id === undefined || id === null) {
      return NextResponse.json(
        { success: false, message: 'Gallery item ID is required for updating.' },
        { status: 400 }
      );
    }

    const numericId = Number(id);
    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (category !== undefined) updateFields.category = category;
    if (image !== undefined && image.trim()) updateFields.image = image.trim();
    if (tagline !== undefined) updateFields.tagline = tagline.trim();
    if (desc !== undefined) updateFields.desc = desc.trim();
    if (span !== undefined) updateFields.span = span === 'wide' ? 'wide' : 'normal';

    try {
      const db = await getDb();
      if (db) {
        await db.collection('gallery').updateOne(
          { $or: [{ id: numericId }, { id: id }, { id: String(id) }] },
          { $set: updateFields }
        );
      }
    } catch (err) {
      console.warn('[Gallery MongoDB Update Error]:', err);
    }

    const updatedItems = await getGalleryAsync();
    const updatedItem = updatedItems.find(
      (i) => i.id === numericId || String(i.id) === String(id)
    );
    writeGalleryToDisk(updatedItems);

    return NextResponse.json({
      success: true,
      message: 'Gallery item updated successfully.',
      item: updatedItem,
      items: updatedItems,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let idParam = searchParams.get('id');

    if (!idParam) {
      try {
        const body = await req.json().catch(() => ({}));
        idParam = body?.id;
      } catch (_) {}
    }

    if (!idParam) {
      return NextResponse.json(
        { success: false, message: 'Missing gallery item ID parameter.' },
        { status: 400 }
      );
    }

    const numericId = Number(idParam);

    try {
      const db = await getDb();
      if (db) {
        await db.collection('gallery').deleteMany({
          $or: [{ id: numericId }, { id: idParam }, { id: String(idParam) }],
        });
      }
    } catch (err) {
      console.warn('[Gallery MongoDB Delete Error]:', err);
    }

    const items = await getGalleryAsync();
    const filtered = items.filter((i) => i.id !== numericId && String(i.id) !== String(idParam));
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

