import { MOCK_COURSES } from "../constants/courses";
import type {
  EnrollmentRequest,
  EnrollmentResponse,
  ErrorResponse,
  GroupEnrollmentRequest,
} from "../types/enrollment";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createApiError(error: ErrorResponse) {
  return error;
}

function hasDuplicatedParticipantEmail(request: GroupEnrollmentRequest) {
  const emails = request.group.participants.map((participant) =>
    participant.email.trim().toLowerCase()
  );

  return new Set(emails).size !== emails.length;
}

export async function submitEnrollment(
  request: EnrollmentRequest
): Promise<EnrollmentResponse> {
  await wait(700);

  const course = MOCK_COURSES.find((item) => item.id === request.courseId);

  if (!course) {
    throw createApiError({
      code: "INVALID_INPUT",
      message: "선택한 강의를 찾을 수 없습니다.",
      details: {
        courseId: "유효한 강의를 선택해 주세요.",
      },
    });
  }

  if (course.currentEnrollment >= course.maxCapacity) {
    throw createApiError({
      code: "COURSE_FULL",
      message: "선택한 강의의 정원이 마감되었습니다. 다른 강의를 선택해 주세요.",
    });
  }

  if (request.applicant.email.toLowerCase().includes("duplicate")) {
    throw createApiError({
      code: "DUPLICATE_ENROLLMENT",
      message: "이미 신청된 강의입니다. 신청 내역을 확인해 주세요.",
    });
  }

  if (request.type === "group" && hasDuplicatedParticipantEmail(request)) {
    throw createApiError({
      code: "INVALID_INPUT",
      message: "참가자 이메일이 중복되었습니다.",
      details: {
        participants: "참가자 이메일은 서로 달라야 합니다.",
      },
    });
  }

  return {
    enrollmentId: `LC-${Date.now().toString().slice(-8)}`,
    status: "confirmed",
    enrolledAt: new Date().toISOString(),
  };
}