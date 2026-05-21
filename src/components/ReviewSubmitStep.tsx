import type {
  Course,
  EnrollmentFormValues,
  ErrorResponse,
} from "../types/enrollment";
import { CATEGORY_LABELS } from "../constants/courses";

interface ReviewSubmitStepProps {
  formValues: EnrollmentFormValues;
  selectedCourse?: Course;
  errorMessage: string;
  isSubmitting: boolean;
  onTermsChange: (checked: boolean) => void;
  onEditStep: (step: number) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${formatter.format(new Date(startDate))} ~ ${formatter.format(
    new Date(endDate)
  )}`;
}

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

export function ReviewSubmitStep({
  formValues,
  selectedCourse,
  errorMessage,
  isSubmitting,
  onTermsChange,
  onEditStep,
  onPrev,
  onSubmit,
}: ReviewSubmitStepProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">STEP 3</p>
          <h2>신청 내용을 확인해 주세요</h2>
        </div>
        <p className="section-description">
          제출 전 선택한 강의와 신청 정보를 확인합니다. 수정이 필요한 경우 각 섹션의 수정 버튼을 사용할 수 있습니다.
        </p>
      </div>

      {selectedCourse && (
        <section className="review-section">
          <div className="review-title">
            <h3>강의 정보</h3>
            <button type="button" onClick={() => onEditStep(1)}>
              수정
            </button>
          </div>

          <dl className="review-list">
            <div>
              <dt>강의명</dt>
              <dd>{selectedCourse.title}</dd>
            </div>
            <div>
              <dt>카테고리</dt>
              <dd>{CATEGORY_LABELS[selectedCourse.category]}</dd>
            </div>
            <div>
              <dt>강사</dt>
              <dd>{selectedCourse.instructor}</dd>
            </div>
            <div>
              <dt>일정</dt>
              <dd>{formatDateRange(selectedCourse.startDate, selectedCourse.endDate)}</dd>
            </div>
            <div>
              <dt>가격</dt>
              <dd>{formatPrice(selectedCourse.price)}원</dd>
            </div>
            <div>
              <dt>신청 유형</dt>
              <dd>{formValues.type === "personal" ? "개인 신청" : "단체 신청"}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="review-section">
        <div className="review-title">
          <h3>수강생 정보</h3>
          <button type="button" onClick={() => onEditStep(2)}>
            수정
          </button>
        </div>

        <dl className="review-list">
          <div>
            <dt>이름</dt>
            <dd>{formValues.applicant.name}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{formValues.applicant.email}</dd>
          </div>
          <div>
            <dt>전화번호</dt>
            <dd>{formValues.applicant.phone}</dd>
          </div>
          <div className="full">
            <dt>수강 동기</dt>
            <dd>{formValues.applicant.motivation || "입력하지 않음"}</dd>
          </div>
        </dl>
      </section>

      {formValues.type === "group" && (
        <section className="review-section">
          <div className="review-title">
            <h3>단체 신청 정보</h3>
            <button type="button" onClick={() => onEditStep(2)}>
              수정
            </button>
          </div>

          <dl className="review-list">
            <div>
              <dt>단체명</dt>
              <dd>{formValues.group.organizationName}</dd>
            </div>
            <div>
              <dt>신청 인원수</dt>
              <dd>{formValues.group.headCount}명</dd>
            </div>
            <div>
              <dt>담당자 연락처</dt>
              <dd>{formValues.group.contactPerson}</dd>
            </div>
          </dl>

          <div className="participant-summary">
            <h4>참가자 명단</h4>
            <ul>
              {formValues.group.participants.map((participant, index) => (
                <li key={`${participant.email}-${index}`}>
                  <strong>{index + 1}. {participant.name}</strong>
                  <span>{participant.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <label className="terms-box">
        <input
          type="checkbox"
          checked={formValues.agreedToTerms}
          onChange={(event) => onTermsChange(event.target.checked)}
        />
        <span>
          <strong>이용약관에 동의합니다.</strong>
          <small>입력한 정보로 수강 신청을 제출하는 것에 동의합니다.</small>
        </span>
      </label>

      {errorMessage && <p className="submit-error">{errorMessage}</p>}

      <div className="button-row between">
        <button
          type="button"
          className="secondary-button"
          onClick={onPrev}
          disabled={isSubmitting}
        >
          이전 단계로
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "제출 중..." : "수강 신청 제출"}
        </button>
      </div>
    </section>
  );
}