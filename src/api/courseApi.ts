import { COURSE_CATEGORIES, MOCK_COURSES } from "../constants/courses";
import type { CourseCategory, CourseListResponse } from "../types/enrollment";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCourses(category?: CourseCategory | "all"): Promise<CourseListResponse> {
  await wait(400);

  const courses =
    !category || category === "all"
      ? MOCK_COURSES
      : MOCK_COURSES.filter((course) => course.category === category);

  return {
    courses,
    categories: COURSE_CATEGORIES,
  };
}