import type { EnrollmentFormValues } from "../types/enrollment";

// 새로고침해도 작성 중인 신청 정보가 남아있도록 브라우저 localStorage에 저장한다.
// 실제 서버 저장은 아니고, 사용자의 브라우저에만 임시 저장되는 방식이다.
const STORAGE_KEY = "liveclass-fe-a-enrollment-draft";

export function saveEnrollmentDraft(values: EnrollmentFormValues) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // localStorage를 사용할 수 없는 환경이면 임시 저장만 생략한다.
  }
}

export function loadEnrollmentDraft(): EnrollmentFormValues | null {
  try {
    const savedDraft = localStorage.getItem(STORAGE_KEY);

    if (!savedDraft) {
      return null;
    }

    return JSON.parse(savedDraft) as EnrollmentFormValues;
  } catch {
    // 저장된 값이 깨졌거나 읽을 수 없으면 초기값을 쓰도록 null을 반환한다.
    return null;
  }
}

export function clearEnrollmentDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 삭제 실패가 전체 신청 흐름을 막으면 안 되므로 별도 처리하지 않는다.
  }
}