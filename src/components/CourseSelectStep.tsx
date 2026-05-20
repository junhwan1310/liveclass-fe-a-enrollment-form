import type { Course, CourseCategory, EnrollmentType } from "../types/enrollment";
import { CATEGORY_LABELS } from "../constants/courses";

interface CourseSelectStepProps {
  courses: Course[];
  categories: CourseCategory[];
  selectedCategory: CourseCategory | "all";
  selectedCourseId: string;
  enrollmentType: EnrollmentType;
  isLoading: boolean;
  errorMessage?: string;
  onCategoryChange: (category: CourseCategory | "all") => void;
  onCourseSelect: (courseId: string) => void;
  onEnrollmentTypeChange: (type: EnrollmentType) => void;
  onNext: () => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  });

  return `${formatter.format(new Date(startDate))} ~ ${formatter.format(
    new Date(endDate)
  )}`;
}

export function CourseSelectStep({
  courses,
  categories,
  selectedCategory,
  selectedCourseId,
  enrollmentType,
  isLoading,
  errorMessage,
  onCategoryChange,
  onCourseSelect,
  onEnrollmentTypeChange,
  onNext,
}: CourseSelectStepProps) {
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">STEP 1</p>
          <h2>수강할 강의를 선택해 주세요</h2>
        </div>
        <p className="section-description">
          카테고리별 강의를 확인하고 개인 또는 단체 신청 유형을 선택합니다.
        </p>
      </div>

      <div className="category-tabs" aria-label="강의 카테고리">
        <button
          type="button"
          className={selectedCategory === "all" ? "active" : ""}
          onClick={() => onCategoryChange("all")}
        >
          전체
        </button>

        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => onCategoryChange(category)}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="empty-box">강의 목록을 불러오는 중입니다.</div>
      ) : courses.length === 0 ? (
        <div className="empty-box">선택한 카테고리에 등록된 강의가 없습니다.</div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => {
            const isSelected = selectedCourseId === course.id;
            const remainingSeats = course.maxCapacity - course.currentEnrollment;
            const isFull = remainingSeats <= 0;
            const isAlmostFull = remainingSeats > 0 && remainingSeats <= 3;

            return (
              <button
                key={course.id}
                type="button"
                className={`course-card ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  if (!isFull) {
                    onCourseSelect(course.id);
                  }
                }}
                disabled={isFull}
              >
                <div className="course-card-top">
                  <span className="badge">{CATEGORY_LABELS[course.category]}</span>
                  <span className={isFull ? "status full" : "status"}>
                    {isFull ? "정원 마감" : `${remainingSeats}석 남음`}
                  </span>
                </div>

                <h3>{course.title}</h3>
                <p>{course.description}</p>

                <dl className="course-meta">
                  <div>
                    <dt>강사</dt>
                    <dd>{course.instructor}</dd>
                  </div>
                  <div>
                    <dt>일정</dt>
                    <dd>{formatDateRange(course.startDate, course.endDate)}</dd>
                  </div>
                  <div>
                    <dt>가격</dt>
                    <dd>{formatPrice(course.price)}원</dd>
                  </div>
                </dl>

                {isAlmostFull && (
                  <p className="warning-text">정원이 얼마 남지 않았습니다.</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedCourse && (
        <div className="selected-course-box">
          <h3>선택한 강의</h3>
          <p>
            <strong>{selectedCourse.title}</strong> ·{" "}
            {formatPrice(selectedCourse.price)}원 ·{" "}
            {formatDateRange(selectedCourse.startDate, selectedCourse.endDate)}
          </p>
        </div>
      )}

      <div className="form-block">
        <h3>신청 유형</h3>
        <div className="radio-grid">
          <label className={enrollmentType === "personal" ? "radio-card active" : "radio-card"}>
            <input
              type="radio"
              name="enrollmentType"
              value="personal"
              checked={enrollmentType === "personal"}
              onChange={() => onEnrollmentTypeChange("personal")}
            />
            <span>
              <strong>개인 신청</strong>
              <small>수강생 본인 1명이 신청합니다.</small>
            </span>
          </label>

          <label className={enrollmentType === "group" ? "radio-card active" : "radio-card"}>
            <input
              type="radio"
              name="enrollmentType"
              value="group"
              checked={enrollmentType === "group"}
              onChange={() => onEnrollmentTypeChange("group")}
            />
            <span>
              <strong>단체 신청</strong>
              <small>2~10명의 참가자 명단을 함께 입력합니다.</small>
            </span>
          </label>
        </div>
      </div>

      {errorMessage && <p className="field-error">{errorMessage}</p>}

      <div className="button-row">
        <button type="button" className="primary-button" onClick={onNext}>
          다음 단계로
        </button>
      </div>
    </section>
  );
}