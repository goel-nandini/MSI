import fs from 'fs';
import path from 'path';
import { MSICourse, INITIAL_MSI_COURSES } from './lmsStore';
import { getDb, isMongoConfigured } from './mongodb';

const DATA_DIR = path.join(process.cwd(), 'data');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const DELETED_COURSES_FILE = path.join(DATA_DIR, 'deleted_courses.json');

/**
 * Reads deleted course IDs from disk.
 */
export function readDeletedCourseIds(): string[] {
  try {
    if (fs.existsSync(DELETED_COURSES_FILE)) {
      const raw = fs.readFileSync(DELETED_COURSES_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((id) => String(id).toLowerCase().trim());
        }
      }
    }
    return [];
  } catch (err) {
    console.warn('[CourseStore] Error reading deleted course IDs:', err);
    return [];
  }
}

/**
 * Marks a course ID as permanently deleted.
 */
export function markCourseDeletedOnDisk(idOrSlug: string): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = readDeletedCourseIds();
    const clean = idOrSlug.toLowerCase().trim();
    if (!current.includes(clean)) {
      current.push(clean);
      fs.writeFileSync(DELETED_COURSES_FILE, JSON.stringify(current, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[CourseStore] Error marking course deleted:', err);
  }
}

/**
 * Reads all courses from data/courses.json, excluding deleted ones.
 */
export function readCoursesFromDisk(): MSICourse[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const deletedIds = readDeletedCourseIds();

    if (fs.existsSync(COURSES_FILE)) {
      const raw = fs.readFileSync(COURSES_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out any permanently deleted courses
          return parsed.filter(
            (c) =>
              !deletedIds.includes(String(c.id).toLowerCase().trim()) &&
              (!c.slug || !deletedIds.includes(String(c.slug).toLowerCase().trim()))
          );
        }
      }
    }
    // File missing: initialize with default verified handbook courses excluding deleted
    const initialFiltered = INITIAL_MSI_COURSES.filter(
      (c) =>
        !deletedIds.includes(String(c.id).toLowerCase().trim()) &&
        (!c.slug || !deletedIds.includes(String(c.slug).toLowerCase().trim()))
    );
    fs.writeFileSync(COURSES_FILE, JSON.stringify(initialFiltered, null, 2), 'utf-8');
    return initialFiltered;
  } catch (err) {
    console.warn('[CourseStore] Error reading courses from disk:', err);
    return INITIAL_MSI_COURSES;
  }
}

/**
 * Writes courses array to data/courses.json.
 */
export function writeCoursesToDisk(courses: MSICourse[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[CourseStore] Error saving courses to disk:', err);
  }
}

/**
 * Adds a new course to the top of data/courses.json.
 */
export function addCourseToDisk(newCourse: MSICourse): MSICourse[] {
  // If this course or its slug was previously deleted, unmark it
  try {
    const deleted = readDeletedCourseIds();
    const cleanId = newCourse.id.toLowerCase().trim();
    const cleanSlug = (newCourse.slug || '').toLowerCase().trim();
    const filteredDeleted = deleted.filter((d) => d !== cleanId && d !== cleanSlug);
    if (filteredDeleted.length !== deleted.length) {
      fs.writeFileSync(DELETED_COURSES_FILE, JSON.stringify(filteredDeleted, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[CourseStore] Error unmarking deleted course:', err);
  }

  const current = readCoursesFromDisk();
  // Check if existing
  const existingIdx = current.findIndex(
    (c) =>
      c.id === newCourse.id ||
      (newCourse.slug && c.slug === newCourse.slug) ||
      c.id.toLowerCase() === newCourse.id.toLowerCase()
  );
  let updated: MSICourse[];
  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...newCourse };
    updated = current;
  } else {
    updated = [newCourse, ...current];
  }
  writeCoursesToDisk(updated);
  return updated;
}

/**
 * Permanently deletes a course from data/courses.json and adds to deleted registry.
 * Also cascades deletion to remove course from all faculty assignments and student enrollments.
 */
export function deleteCourseFromDisk(id: string): MSICourse[] {
  const clean = id.trim().toLowerCase();
  markCourseDeletedOnDisk(clean);

  const current = readCoursesFromDisk();
  const toDelete = current.find(
    (c) =>
      c.id === id ||
      c.id.toLowerCase() === clean ||
      (c.slug && c.slug.toLowerCase() === clean)
  );

  if (toDelete) {
    markCourseDeletedOnDisk(toDelete.id);
    if (toDelete.slug) markCourseDeletedOnDisk(toDelete.slug);
  }

  const updated = current.filter(
    (c) =>
      c.id !== id &&
      c.id.toLowerCase() !== clean &&
      (!c.slug || c.slug.toLowerCase() !== clean)
  );

  writeCoursesToDisk(updated);

  // 1. Cascade cleanup in teachers.json (remove deleted courseId from assignedCourseIds)
  try {
    const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');
    if (fs.existsSync(TEACHERS_FILE)) {
      const raw = fs.readFileSync(TEACHERS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const teachers = JSON.parse(raw);
        if (Array.isArray(teachers)) {
          const updatedTeachers = teachers.map((t: any) => {
            if (Array.isArray(t.assignedCourseIds)) {
              return {
                ...t,
                assignedCourseIds: t.assignedCourseIds.filter(
                  (cid: string) =>
                    cid !== id &&
                    cid.toLowerCase() !== clean &&
                    (!toDelete?.slug || cid.toLowerCase() !== toDelete.slug.toLowerCase())
                ),
              };
            }
            return t;
          });
          fs.writeFileSync(TEACHERS_FILE, JSON.stringify(updatedTeachers, null, 2), 'utf-8');
        }
      }
    }
  } catch (err) {
    console.warn('[CourseStore] Error cascading course deletion to teachers:', err);
  }

  // 2. Cascade cleanup in enrollments.json (remove all enrollments for this course)
  try {
    const ENROLLMENTS_FILE = path.join(DATA_DIR, 'enrollments.json');
    if (fs.existsSync(ENROLLMENTS_FILE)) {
      const raw = fs.readFileSync(ENROLLMENTS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const enrollments = JSON.parse(raw);
        if (Array.isArray(enrollments)) {
          const updatedEnrollments = enrollments.filter(
            (e: any) =>
              e.courseId !== id &&
              e.courseId.toLowerCase() !== clean &&
              (!toDelete?.slug || e.courseId.toLowerCase() !== toDelete.slug.toLowerCase())
          );
          fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(updatedEnrollments, null, 2), 'utf-8');
        }
      }
    }
  } catch (err) {
    console.warn('[CourseStore] Error cascading course deletion to enrollments:', err);
  }

  return updated;
}

/**
 * Cloud-synchronized fetch of courses supporting MongoDB Atlas with disk fallback.
 */
export async function getCoursesAsync(): Promise<{ courses: MSICourse[]; deletedIds: string[] }> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      if (db) {
        const coursesCol = db.collection<MSICourse>('courses');
        const deletedCol = db.collection<{ id: string }>('deleted_courses');

        const deletedDocs = await deletedCol.find({}).toArray();
        const deletedIds = deletedDocs.map((d) => String(d.id).toLowerCase().trim());

        const count = await coursesCol.countDocuments();
        if (count === 0) {
          // Seed from verified handbook courses
          const initial = readCoursesFromDisk();
          if (initial.length > 0) {
            await coursesCol.insertMany(initial as any);
          }
        }

        const rawCourses = await coursesCol.find({}).toArray();
        const courses = rawCourses
          .map((c: any) => {
            const { _id, ...rest } = c;
            return rest as MSICourse;
          })
          .filter(
            (c) =>
              !deletedIds.includes(String(c.id).toLowerCase().trim()) &&
              (!c.slug || !deletedIds.includes(String(c.slug).toLowerCase().trim()))
          );

        return { courses, deletedIds };
      }
    } catch (err) {
      console.warn('[CourseStore] MongoDB read error, falling back to disk:', err);
    }
  }

  return {
    courses: readCoursesFromDisk(),
    deletedIds: readDeletedCourseIds(),
  };
}

/**
 * Cloud-synchronized add/update of a course supporting MongoDB Atlas with disk fallback.
 */
export async function addCourseAsync(newCourse: MSICourse): Promise<MSICourse[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      if (db) {
        const coursesCol = db.collection('courses');
        const deletedCol = db.collection('deleted_courses');

        const cleanId = newCourse.id.toLowerCase().trim();
        const cleanSlug = (newCourse.slug || '').toLowerCase().trim();

        // Unmark from deleted
        await deletedCol.deleteMany({
          id: { $in: [cleanId, cleanSlug, newCourse.id] },
        });

        // Upsert course
        const { _id, ...courseData }: any = newCourse;
        await coursesCol.updateOne(
          {
            $or: [
              { id: newCourse.id },
              { id: cleanId },
              ...(cleanSlug ? [{ slug: cleanSlug }, { slug: newCourse.slug }] : []),
            ],
          },
          { $set: courseData },
          { upsert: true }
        );

        // Also write to local disk if writable
        try {
          addCourseToDisk(newCourse);
        } catch (_) {}

        const result = await getCoursesAsync();
        return result.courses;
      }
    } catch (err) {
      console.warn('[CourseStore] MongoDB write error, falling back to disk:', err);
    }
  }

  return addCourseToDisk(newCourse);
}

/**
 * Cloud-synchronized deletion of a course supporting MongoDB Atlas with disk fallback.
 */
export async function deleteCourseAsync(id: string): Promise<MSICourse[]> {
  const clean = id.trim().toLowerCase();

  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      if (db) {
        const coursesCol = db.collection('courses');
        const deletedCol = db.collection('deleted_courses');
        const teachersCol = db.collection('teachers');
        const enrollmentsCol = db.collection('enrollments');

        // 1. Mark in deleted_courses
        await deletedCol.updateOne(
          { id: clean },
          { $set: { id: clean, deletedAt: new Date().toISOString() } },
          { upsert: true }
        );

        // 2. Remove from courses collection
        await coursesCol.deleteMany({
          $or: [
            { id: id },
            { id: clean },
            { slug: id },
            { slug: clean },
          ],
        });

        // 3. Cascade cleanup in teachers collection
        await teachersCol.updateMany(
          {},
          { $pull: { assignedCourseIds: { $in: [id, clean] } } as any }
        );

        // 4. Cascade cleanup in enrollments collection
        await enrollmentsCol.deleteMany({
          courseId: { $in: [id, clean] },
        });

        // Also update local disk if writable
        try {
          deleteCourseFromDisk(id);
        } catch (_) {}

        const result = await getCoursesAsync();
        return result.courses;
      }
    } catch (err) {
      console.warn('[CourseStore] MongoDB delete error, falling back to disk:', err);
    }
  }

  return deleteCourseFromDisk(id);
}

