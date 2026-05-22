import { describe, expect, it } from "vitest";
import {
  applicantStepSchema,
  courseStepSchema,
  enrollmentFormSchema,
} from "./validation";

describe("validation schemas", () => {
  it("강의를 선택하지 않으면 1단계 검증에 실패한다", () => {
    const result = courseStepSchema.safeParse({
      courseId: "",
      type: "personal",
    });

    expect(result.success).toBe(false);
  });

  it("개인 신청은 단체 정보가 없어도 2단계 검증에 성공한다", () => {
    const result = applicantStepSchema.safeParse({
      type: "personal",
      applicant: {
        name: "박준환",
        email: "junhwan@test.com",
        phone: "01012345678",
        motivation: "수강 동기입니다.",
      },
    });

    expect(result.success).toBe(true);
  });

  it("단체 신청에서 참가자 이메일이 중복되면 검증에 실패한다", () => {
    const result = applicantStepSchema.safeParse({
      type: "group",
      applicant: {
        name: "박준환",
        email: "junhwan@test.com",
        phone: "01012345678",
        motivation: "",
      },
      group: {
        organizationName: "라이브클래스 스터디팀",
        headCount: 2,
        participants: [
          { name: "김학생", email: "same@test.com" },
          { name: "이학생", email: "same@test.com" },
        ],
        contactPerson: "01098765432",
      },
    });

    expect(result.success).toBe(false);
  });

  it("약관에 동의하지 않으면 최종 제출 검증에 실패한다", () => {
    const result = enrollmentFormSchema.safeParse({
      courseId: "course-dev-001",
      type: "personal",
      applicant: {
        name: "박준환",
        email: "junhwan@test.com",
        phone: "01012345678",
        motivation: "",
      },
      agreedToTerms: false,
    });

    expect(result.success).toBe(false);
  });
});