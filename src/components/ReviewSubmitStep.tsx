import type {
  Course,
  EnrollmentFormValues,
} from "../types/enrollment";
import { CATEGORY_LABELS } from "../constants/courses";

/*
  3단계 확인 및 제출 화면이다.

  역할:
  1. 선택한 강의 정보 요약
  2. 신청자 정보 요약
  3. 단체 신청이면 단체 정보와 참가자 명단 요약
  4. 수정 버튼 제공
  5. 약관 동의 체크박스
  6. 제출 버튼
  7. 제출 실패 에러 메시지 표시
*/

interface ReviewSubmitStepProps {
  // 전체 폼 입력값
  formValues: EnrollmentFormValues;

  // 선택한 강의 정보
  selectedCourse?: Course;

  // 제출 실패 시 보여줄 에러 메시지
  errorMessage: string;

  // 제출 중 상태. 버튼 중복 클릭 방지에 사용한다.
  isSubmitting: boolean;

  // 약관 동의 여부 변경 함수
  onTermsChange: (checked: boolean) => void;

  // 수정 버튼을 눌렀을 때 해당 단계로 이동하는 함수
  onEditStep: (step: number) => void;

  // 이전 단계로 이동
  onPrev: () => void;

  // 최종 제출 함수
  onSubmit: () => void;
}

// 가격을 한국식 숫자 형식으로 보여준다.
function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

// 강의 시작일~종료일을 보기 좋은 날짜 형식으로 보여준다.
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

      {/* 선택한 강의 정보 요약 */}
      {selectedCourse && (
        <section className="review-section">
          <div className="review-title">
            <h3>강의 정보</h3>
            {/* 수정 버튼을 누르면 1단계로 돌아간다. */}
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

      {/* 신청자 정보 요약 */}
      <section className="review-section">
        <div className="review-title">
          <h3>수강생 정보</h3>
          {/* 수정 버튼을 누르면 2단계로 돌아간다. */}
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

      {/* 단체 신청일 때만 단체 신청 정보 요약을 보여준다. */}
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

      {/* 약관 동의 체크박스. 동의해야 제출 가능하다. */}
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

      {/* 제출 실패 시 사용자에게 보여줄 에러 메시지 */}
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

        {/*
          제출 중이면 버튼을 비활성화하고 "제출 중..."으로 표시한다.
          이것이 중복 제출 방지 처리다.
        */}
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