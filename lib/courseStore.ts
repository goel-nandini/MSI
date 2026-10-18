import fs from 'fs';
import path from 'path';
import { UdemyCourse, INITIAL_UDEMY_COURSES } from './lmsStore';

const DATA_DIR = path.join(process.cwd(), 'data');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');

/**
 * Reads all courses from data/courses.json, with fallback to initial seed courses.
 */
export function readCoursesFromDisk(): UdemyCourse[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(COURSES_FILE)) {
      const raw = fs.readFileSync(COURSES_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    // File missing or empty: initialize with default verified handbook courses
    fs.writeFileSync(COURSES_FILE, JSON.stringify(INITIAL_UDEMY_COURSES, null, 2), 'utf-8');
    return INITIAL_UDEMY_COURSES;
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
  const current = readCoursesFromDisk();
  // Check if existing
  const existingIdx = current.findIndex((c) => c.id === newCourse.id || c.slug === newCourse.slug);
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
 * Deletes a course from data/courses.json.
 */
export function deleteCourseFromDisk(id: string): UdemyCourse[] {
  const current = readCoursesFromDisk();
  const updated = current.filter((c) => c.id !== id);
  writeCoursesToDisk(updated);
  return updated;
}
