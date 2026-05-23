import { MOCK_COURSES } from "../constants/courses";
import type {
  EnrollmentRequest,
  EnrollmentResponse,
  ErrorResponse,
  GroupEnrollmentRequest,
} from "../types/enrollment";

/*
  이 파일은 실제 서버 대신 사용하는 Mock API다.

  역할:
  1. 수강 신청 제출 처리
  2. 정원 초과 확인
  3. 남은 좌석보다 신청 인원이 많은지 확인
  4. 중복 신청 확인
  5. 단체 신청 참가자 이메일 중복 확인
  6. 성공 시 신청 번호 반환
*/

// 실제 API처럼 약간의 지연 시간을 주기 위한 함수다.
// 테스트 결과에서 enrollmentApi 테스트가 700ms 정도 걸린 이유가 이것 때문이다.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API에서 에러를 던질 때 사용한다.
function createApiError(error: ErrorResponse) {
  return error;
}

/*
  [기능]
  단체 신청 참가자 이메일이 중복되는지 확인한다.

  Set은 중복 값을 제거하는 자료구조다.
  원래 이메일 개수와 Set 개수가 다르면 중복이 있다는 뜻이다.
*/
function hasDuplicatedParticipantEmail(request: GroupEnrollmentRequest) {
  const emails = request.group.participants.map((participant) =>
    participant.email.trim().toLowerCase()
  );

  return new Set(emails).size !== emails.length;
}

/*
  [기능]
  수강 신청 제출 Mock API.

  실제 서버가 있다면 POST /api/enrollments 같은 API가 담당할 역할을
  여기서는 TypeScript 함수로 대신 구현했다.
*/
export async function submitEnrollment(
  request: EnrollmentRequest
): Promise<EnrollmentResponse> {
  // 실제 서버 통신처럼 보이도록 0.7초 대기한다.
  await wait(700);

  // 제출 요청의 courseId에 해당하는 강의를 찾는다.
  const course = MOCK_COURSES.find((item) => item.id === request.courseId);

  /*
    [에러 처리]
    선택한 강의를 찾을 수 없으면 INVALID_INPUT 에러를 발생시킨다.
  */
  if (!course) {
    throw createApiError({
      code: "INVALID_INPUT",
      message: "선택한 강의를 찾을 수 없습니다.",
      details: {
        courseId: "유효한 강의를 선택해 주세요.",
      },
    });
  }

  /*
    [에러 처리]
    현재 신청 인원이 최대 정원 이상이면 정원 마감 처리한다.

    에러 코드: COURSE_FULL
  */
  if (course.currentEnrollment >= course.maxCapacity) {
    throw createApiError({
      code: "COURSE_FULL",
      message: "선택한 강의의 정원이 마감되었습니다. 다른 강의를 선택해 주세요.",
    });
  }

  /*
    [핵심 기능]
    개인 신청은 1명, 단체 신청은 headCount만큼 좌석이 필요하다.

    예:
    남은 좌석이 1석인데 단체 신청 2명이면 제출을 막아야 한다.
  */
  const requestedSeats = request.type === "group" ? request.group.headCount : 1;
  const remainingSeats = course.maxCapacity - course.currentEnrollment;

  /*
    [에러 처리]
    신청 인원이 남은 좌석보다 많으면 정원 초과로 처리한다.

    "정원이 거의 찬 강의에 단체 신청을 할 때 남은 좌석보다 인원이 많으면
    COURSE_FULL로 막는다."
  */
  if (requestedSeats > remainingSeats) {
    throw createApiError({
      code: "COURSE_FULL",
      message: `남은 좌석은 ${remainingSeats}석입니다. 신청 인원을 줄이거나 다른 강의를 선택해 주세요.`,
    });
  }

  /*
    [에러 처리]
    중복 신청 테스트용 조건이다.

    실제 서비스라면 DB에서 이미 신청한 강의인지 확인해야 한다.
    Mock API이므로 이메일에 duplicate가 포함되면
    중복 신청으로 처리.
  */
  if (request.applicant.email.toLowerCase().includes("duplicate")) {
    throw createApiError({
      code: "DUPLICATE_ENROLLMENT",
      message: "이미 신청된 강의입니다. 신청 내역을 확인해 주세요.",
    });
  }

  /*
    [에러 처리]
    단체 신청이고 참가자 이메일이 중복되면 INVALID_INPUT 에러를 발생시킨다.
  */
  if (request.type === "group" && hasDuplicatedParticipantEmail(request)) {
    throw createApiError({
      code: "INVALID_INPUT",
      message: "참가자 이메일이 중복되었습니다.",
      details: {
        participants: "참가자 이메일은 서로 달라야 합니다.",
      },
    });
  }

  /*
    [성공 처리]
    제출이 성공하면 신청 번호, 상태, 신청 시간을 반환한다.
  */
  return {
    enrollmentId: `LC-${Date.now().toString().slice(-8)}`,
    status: "confirmed",
    enrolledAt: new Date().toISOString(),
  };
}