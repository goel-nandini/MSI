import fs from 'fs';
import path from 'path';
import { UdemyCourse, INITIAL_UDEMY_COURSES } from './lmsStore';

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
export function readCoursesFromDisk(): UdemyCourse[] {
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
    const initialFiltered = INITIAL_UDEMY_COURSES.filter(
      (c) =>
        !deletedIds.includes(String(c.id).toLowerCase().trim()) &&
        (!c.slug || !deletedIds.includes(String(c.slug).toLowerCase().trim()))
    );
    fs.writeFileSync(COURSES_FILE, JSON.stringify(initialFiltered, null, 2), 'utf-8');
    return initialFiltered;
  } catch (err) {
    console.warn('[CourseStore] Error reading courses from disk:', err);
    return INITIAL_UDEMY_COURSES;
  }
}

/**
 * Writes courses array to data/courses.json.
 */
export function writeCoursesToDisk(courses: UdemyCourse[]): void {
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
export function addCourseToDisk(newCourse: UdemyCourse): UdemyCourse[] {
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
  let updated: UdemyCourse[];
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
export function deleteCourseFromDisk(id: string): UdemyCourse[] {
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

