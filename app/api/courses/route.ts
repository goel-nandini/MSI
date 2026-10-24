import { NextRequest, NextResponse } from 'next/server';
import { readCoursesFromDisk, addCourseToDisk, deleteCourseFromDisk, readDeletedCourseIds } from '@/lib/courseStore';
import { UdemyCourse } from '@/lib/lmsStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = readCoursesFromDisk();
    const deletedIds = readDeletedCourseIds();
    return NextResponse.json({
      success: true,
      courses,
      deletedIds,
      count: courses.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to read courses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.title) {
      return NextResponse.json(
        { success: false, message: 'Course title is required.' },
        { status: 400 }
      );
    }

    const courseId = body.id || `crs-msi-${Date.now().toString().slice(-6)}`;
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newCourse: UdemyCourse = {
      id: courseId,
      slug,
      title: body.title.trim(),
      headline: body.headline?.trim() || 'Comprehensive Curriculum & Judicial Practice',
      description: body.description?.trim() || 'Official curriculum accredited by MSI Group of Institutes.',
      category: body.category || 'Judiciary',
      department: 'law',
      badge: body.badge || 'Hot & New',
      rating: body.rating || 5.0,
      reviewCount: body.reviewCount || 1,
      totalDuration: body.totalDuration || '40 hours',
      totalLectures: body.totalLectures || (body.sections ? body.sections.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0) : 1),
      level: body.level || 'All Levels',
      thumbnail: body.thumbnail || '/images/courses/clat.jpg',
      price: Number(body.price) || 4999,
      originalPrice: Number(body.originalPrice) || 14999,
      isFreeForMsiStudents: body.isFreeForMsiStudents ?? true,
      instructorId: body.instructorId || 'fac-harshit-01',
      instructorName: body.instructorName || 'Harshit Singh',
      instructorTitle: body.instructorTitle || 'Professor of Law & Faculty Jurist',
      instructorAvatar: body.instructorAvatar || '/images/avatars/avatar-1.webp',
      whatYouWillLearn: body.whatYouWillLearn || [
        'Mastery over ratio decidendi and obiter dicta distinctions',
        'Timed answer drafting drills and Bare Act interpretations',
        'Live judicial mentoring and doubt clearing',
      ],
      requirements: body.requirements || ['Dedication to daily legal study drills', 'No prior legal diploma required'],
      sections: body.sections || [
        {
          id: `sec-${Date.now()}-1`,
          title: 'Module 1: Foundational Jurisprudence & Overview',
          duration: '3 hours',
          lectures: [
            {
              id: `lec-${Date.now()}-1`,
              title: body.lectureTitle || 'Orientation & Landmark Case Briefs',
              duration: '45 mins',
              durationSeconds: 2700,
              videoUrl: body.lectureVideo || 'https://vz-389201.b-cdn.net/sample.mp4',
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
      language: body.language || 'English & Bilingual Legal Notes',
      isPublished: true,
    };

    const updated = addCourseToDisk(newCourse);

    return NextResponse.json({
      success: true,
      message: `Course "${newCourse.title}" successfully saved and published to Home Screen!`,
      course: newCourse,
      courses: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to save course' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Course ID is required.' }, { status: 400 });
    }
    const updated = deleteCourseFromDisk(id);
    return NextResponse.json({
      success: true,
      message: 'Course deleted from system.',
      courses: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Error deleting course' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
