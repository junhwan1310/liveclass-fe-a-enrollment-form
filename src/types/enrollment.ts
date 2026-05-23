/*
  이 파일은 타입 정의 파일이다.

  TypeScript를 쓰는 이유:
  개인 신청과 단체 신청의 데이터 구조가 다르기 때문에,
  타입으로 구조를 명확히 나누기 위해서다.
*/

// 강의 카테고리 타입.
// 정해진 문자열만 카테고리로 사용할 수 있다.
export type CourseCategory = "development" | "design" | "marketing" | "business";

// 강의 하나의 데이터 구조.
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

// 강의 목록 조회 응답 구조.
export interface CourseListResponse {
  courses: Course[];
  categories: CourseCategory[];
}

// 신청 유형.
// personal = 개인 신청
// group = 단체 신청
export type EnrollmentType = "personal" | "group";

// 신청자 공통 정보.
// 개인 신청과 단체 신청 모두 applicant 정보를 가진다.
export interface Applicant {
  name: string;
  email: string;
  phone: string;
  motivation?: string;
}

// 단체 신청 참가자 1명의 정보.
export interface Participant {
  name: string;
  email: string;
}

// 단체 신청 정보.
// 단체명, 신청 인원수, 참가자 명단, 담당자 연락처가 포함된다.
export interface GroupInfo {
  organizationName: string;
  headCount: number;
  participants: Participant[];
  contactPerson: string;
}

// 개인 신청 제출 요청 구조.
// group 정보가 없다.
export interface PersonalEnrollmentRequest {
  courseId: string;
  type: "personal";
  applicant: Applicant;
  agreedToTerms: boolean;
}

// 단체 신청 제출 요청 구조.
// group 정보가 추가된다.
export interface GroupEnrollmentRequest {
  courseId: string;
  type: "group";
  applicant: Applicant;
  group: GroupInfo;
  agreedToTerms: boolean;
}

/*
  [핵심 타입]
  제출 요청은 개인 신청 또는 단체 신청 둘 중 하나다.

  type 값이 "personal"이면 PersonalEnrollmentRequest,
  type 값이 "group"이면 GroupEnrollmentRequest로 구분된다.
*/
export type EnrollmentRequest = PersonalEnrollmentRequest | GroupEnrollmentRequest;

// 제출 성공 응답 구조.
export interface EnrollmentResponse {
  enrollmentId: string;
  status: "confirmed" | "pending";
  enrolledAt: string;
}

// 제출 실패 응답 구조.
export interface ErrorResponse {
  code: "COURSE_FULL" | "DUPLICATE_ENROLLMENT" | "INVALID_INPUT" | "NETWORK_ERROR";
  message: string;
  details?: Record<string, string>;
}

/*
  [폼 상태 구조]
  App.tsx에서 관리하는 전체 입력값 구조다.

  실제 제출 요청과 거의 비슷하지만,
  화면에서 개인/단체 전환을 쉽게 처리하기 위해 group 정보도 항상 가지고 있다.

  단, 실제 제출할 때는 createEnrollmentRequest에서
  개인 신청이면 group 정보를 빼고 제출한다.
*/
export interface EnrollmentFormValues {
  courseId: string;
  type: EnrollmentType;
  applicant: Applicant;
  group: GroupInfo;
  agreedToTerms: boolean;
}