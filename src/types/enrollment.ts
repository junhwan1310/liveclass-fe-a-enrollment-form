export type CourseCategory = "development" | "design" | "marketing" | "business";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  price: number;
  maxCapacity: number;
  currentEnrollment: number;
  startDate: string;
  endDate: string;
  instructor: string;
}

export interface CourseListResponse {
  courses: Course[];
  categories: CourseCategory[];
}

export type EnrollmentType = "personal" | "group";

export interface Applicant {
  name: string;
  email: string;
  phone: string;
  motivation?: string;
}

export interface Participant {
  name: string;
  email: string;
}

export interface GroupInfo {
  organizationName: string;
  headCount: number;
  participants: Participant[];
  contactPerson: string;
}

export interface PersonalEnrollmentRequest {
  courseId: string;
  type: "personal";
  applicant: Applicant;
  agreedToTerms: boolean;
}

export interface GroupEnrollmentRequest {
  courseId: string;
  type: "group";
  applicant: Applicant;
  group: GroupInfo;
  agreedToTerms: boolean;
}

export type EnrollmentRequest = PersonalEnrollmentRequest | GroupEnrollmentRequest;

export interface EnrollmentResponse {
  enrollmentId: string;
  status: "confirmed" | "pending";
  enrolledAt: string;
}

export interface ErrorResponse {
  code: "COURSE_FULL" | "DUPLICATE_ENROLLMENT" | "INVALID_INPUT" | "NETWORK_ERROR";
  message: string;
  details?: Record<string, string>;
}

export interface EnrollmentFormValues {
  courseId: string;
  type: EnrollmentType;
  applicant: Applicant;
  group: GroupInfo;
  agreedToTerms: boolean;
}