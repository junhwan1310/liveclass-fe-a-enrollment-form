import type { ErrorResponse } from "../types/enrollment";

export function getSubmitErrorMessage(error: unknown) {
  const apiError = error as Partial<ErrorResponse>;

  if (apiError.code === "COURSE_FULL") {
    return (
      apiError.message ??
      "선택한 강의의 정원이 마감되었습니다. 강의 선택 단계에서 다른 강의를 선택해 주세요."
    );
  }


  if (apiError.code === "DUPLICATE_ENROLLMENT") {
    return apiError.message ?? "이미 신청된 강의입니다. 이메일 또는 신청 내역을 확인해 주세요.";
  }


  if (apiError.code === "INVALID_INPUT") {
    return apiError.message ?? "입력값을 다시 확인해 주세요.";
  }


  return "일시적인 오류로 신청을 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}