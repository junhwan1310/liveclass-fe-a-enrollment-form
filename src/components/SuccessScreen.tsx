import type {
  Course,
  EnrollmentFormValues,
  EnrollmentResponse,
} from "../types/enrollment";

interface SuccessScreenProps {
  response: EnrollmentResponse;
  formValues: EnrollmentFormValues;
  selectedCourse?: Course;
  onReset: () => void;
}

export function SuccessScreen({
  response,
  formValues,
  selectedCourse,
  onReset,
}: SuccessScreenProps) {
  return (
    <section className="card success-card">
      <div className="success-icon">✓</div>

      <p className="eyebrow">Enrollment Completed</p>
      <h2>수강 신청이 완료되었습니다</h2>

      <p className="success-description">
        신청 번호와 신청 요약 정보를 확인해 주세요.
      </p>

      <dl className="review-list success-summary">
        <div>
          <dt>신청 번호</dt>
          <dd>{response.enrollmentId}</dd>
        </div>
        <div>
          <dt>신청 상태</dt>
          <dd>{response.status === "confirmed" ? "확정" : "대기"}</dd>
        </div>
        <div>
          <dt>신청 일시</dt>
          <dd>{new Date(response.enrolledAt).toLocaleString("ko-KR")}</dd>
        </div>
        <div>
          <dt>강의명</dt>
          <dd>{selectedCourse?.title ?? "선택 강의"}</dd>
        </div>
        <div>
          <dt>신청자</dt>
          <dd>{formValues.applicant.name}</dd>
        </div>
        <div>
          <dt>신청 유형</dt>
          <dd>{formValues.type === "personal" ? "개인 신청" : "단체 신청"}</dd>
        </div>
      </dl>

      <div className="button-row">
        <button type="button" className="primary-button" onClick={onReset}>
          새 신청 작성
        </button>
      </div>
    </section>
  );
}