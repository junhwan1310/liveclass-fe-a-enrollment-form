import { describe, expect, it } from "vitest";
import { submitEnrollment } from "./enrollmentApi";
import type { EnrollmentRequest } from "../types/enrollment";

describe("submitEnrollment", () => {
  it("개인 신청이 정상적으로 제출되면 신청 번호를 반환한다", async () => {
    const request: EnrollmentRequest = {
      courseId: "course-dev-001",
      type: "personal",
      applicant: {
        name: "박준환",
        email: "junhwan@test.com",
        phone: "01012345678",
        motivation: "수강 동기입니다.",
      },
      agreedToTerms: true,
    };

    const response = await submitEnrollment(request);

    expect(response.status).toBe("confirmed");
    expect(response.enrollmentId).toMatch(/^LC-/);
  });

  it("이메일에 duplicate가 포함되면 중복 신청 에러를 반환한다", async () => {
    const request: EnrollmentRequest = {
      courseId: "course-dev-001",
      type: "personal",
      applicant: {
        name: "박준환",
        email: "duplicate@test.com",
        phone: "01012345678",
        motivation: "",
      },
      agreedToTerms: true,
    };

    await expect(submitEnrollment(request)).rejects.toMatchObject({
      code: "DUPLICATE_ENROLLMENT",
    });
  });

  it("남은 좌석보다 단체 신청 인원이 많으면 정원 초과 에러를 반환한다", async () => {
    const request: EnrollmentRequest = {
      courseId: "course-marketing-001",
      type: "group",
      applicant: {
        name: "박준환",
        email: "group@test.com",
        phone: "01012345678",
        motivation: "",
      },
      group: {
        organizationName: "라이브클래스 스터디팀",
        headCount: 2,
        participants: [
          { name: "김학생", email: "student1@test.com" },
          { name: "이학생", email: "student2@test.com" },
        ],
        contactPerson: "01098765432",
      },
      agreedToTerms: true,
    };

    await expect(submitEnrollment(request)).rejects.toMatchObject({
      code: "COURSE_FULL",
      message: "남은 좌석은 1석입니다. 신청 인원을 줄이거나 다른 강의를 선택해 주세요.",
    });
  });
});