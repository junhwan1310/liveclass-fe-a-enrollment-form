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

  // 개인 신청은 1명, 단체 신청은 headCount만큼 좌석이 필요하다.
  // 예: 남은 좌석이 1석인데 단체 신청 2명이면 제출을 막아야 한다.
  const requestedSeats = request.type === "group" ? request.group.headCount : 1;
  const remainingSeats = course.maxCapacity - course.currentEnrollment;

  // 신청 인원이 남은 좌석보다 많으면 정원 초과로 처리한다.
  // 이 처리가 없으면 1석 남은 강의에 단체 2명 신청이 되는 문제가 생긴다.
  if (requestedSeats > remainingSeats) {
    throw createApiError({
      code: "COURSE_FULL",
      message: `남은 좌석은 ${remainingSeats}석입니다. 신청 인원을 줄이거나 다른 강의를 선택해 주세요.`,
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