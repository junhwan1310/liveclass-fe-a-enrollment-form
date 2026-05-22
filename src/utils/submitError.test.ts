import { describe, expect, it } from "vitest";
import { getSubmitErrorMessage } from "./submitError";

describe("getSubmitErrorMessage", () => {
  it("Mock API에서 전달한 COURSE_FULL 메시지를 우선 표시한다", () => {
    const message = getSubmitErrorMessage({
      code: "COURSE_FULL",
      message: "남은 좌석은 1석입니다. 신청 인원을 줄이거나 다른 강의를 선택해 주세요.",
    });

    expect(message).toBe(
      "남은 좌석은 1석입니다. 신청 인원을 줄이거나 다른 강의를 선택해 주세요."
    );
  });

  it("DUPLICATE_ENROLLMENT 에러 메시지를 표시한다", () => {
    const message = getSubmitErrorMessage({
      code: "DUPLICATE_ENROLLMENT",
      message: "이미 신청된 강의입니다. 신청 내역을 확인해 주세요.",
    });

    expect(message).toBe("이미 신청된 강의입니다. 신청 내역을 확인해 주세요.");
  });

  it("알 수 없는 에러는 기본 메시지를 표시한다", () => {
    const message = getSubmitErrorMessage({
      code: "UNKNOWN_ERROR",
    });

    expect(message).toBe(
      "일시적인 오류로 신청을 제출하지 못했습니다. 잠시 후 다시 시도해 주세요."
    );
  });
});