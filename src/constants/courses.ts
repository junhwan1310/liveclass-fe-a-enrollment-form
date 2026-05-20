import type { Course, CourseCategory } from "../types/enrollment";

export const COURSE_CATEGORIES: CourseCategory[] = [
  "development",
  "design",
  "marketing",
  "business",
];

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

export const MOCK_COURSES: Course[] = [
  {
    id: "course-dev-001",
    title: "React 실무 입문",
    description: "컴포넌트, 상태 관리, 폼 처리까지 실무 중심으로 배우는 React 강의입니다.",
    category: "development",
    price: 180000,
    maxCapacity: 30,
    currentEnrollment: 18,
    startDate: "2026-06-03T10:00:00.000Z",
    endDate: "2026-06-24T12:00:00.000Z",
    instructor: "김도현",
  },
  {
    id: "course-dev-002",
    title: "TypeScript 기반 프론트엔드 설계",
    description: "타입 설계, 유효성 검증, API 응답 타입 관리 방법을 학습합니다.",
    category: "development",
    price: 220000,
    maxCapacity: 25,
    currentEnrollment: 25,
    startDate: "2026-06-08T10:00:00.000Z",
    endDate: "2026-06-29T12:00:00.000Z",
    instructor: "이서연",
  },
  {
    id: "course-design-001",
    title: "서비스 UX 설계 기초",
    description: "사용자 흐름, 정보 구조, 입력 폼 UX를 중심으로 학습합니다.",
    category: "design",
    price: 160000,
    maxCapacity: 20,
    currentEnrollment: 12,
    startDate: "2026-06-05T09:00:00.000Z",
    endDate: "2026-06-26T11:00:00.000Z",
    instructor: "박민지",
  },
  {
    id: "course-marketing-001",
    title: "CRM 마케팅 실전",
    description: "고객 세그먼트와 신청 전환율 개선 전략을 학습합니다.",
    category: "marketing",
    price: 150000,
    maxCapacity: 40,
    currentEnrollment: 39,
    startDate: "2026-06-10T13:00:00.000Z",
    endDate: "2026-07-01T15:00:00.000Z",
    instructor: "최현우",
  },
  {
    id: "course-business-001",
    title: "프로덕트 매니지먼트 기본기",
    description: "문제 정의, 요구사항 해석, 제품 의사결정 흐름을 다룹니다.",
    category: "business",
    price: 190000,
    maxCapacity: 35,
    currentEnrollment: 7,
    startDate: "2026-06-12T14:00:00.000Z",
    endDate: "2026-07-03T16:00:00.000Z",
    instructor: "정유진",
  },
];