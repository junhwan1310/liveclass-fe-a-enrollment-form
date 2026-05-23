import { useEffect, useState } from "react";
import "./App.css";

import { getCourses } from "./api/courseApi";
import { submitEnrollment } from "./api/enrollmentApi";

import { ApplicantInfoStep } from "./components/ApplicantInfoStep";
import { CourseSelectStep } from "./components/CourseSelectStep";
import { ReviewSubmitStep } from "./components/ReviewSubmitStep";
import { StepIndicator } from "./components/StepIndicator";
import { SuccessScreen } from "./components/SuccessScreen";

import { getSubmitErrorMessage } from "./utils/submitError";

import {
  applicantStepSchema,
  courseStepSchema,
  enrollmentFormSchema,
} from "./utils/validation";

import {
  clearEnrollmentDraft,
  loadEnrollmentDraft,
  saveEnrollmentDraft,
} from "./utils/storage";

import type {
  Applicant,
  Course,
  CourseCategory,
  EnrollmentFormValues,
  EnrollmentRequest,
  EnrollmentResponse,
  EnrollmentType,
  GroupInfo,
  Participant,
} from "./types/enrollment";

/*
  이 파일은 전체 폼 흐름의 중심이다.

  여기서 관리하는 것:
  1. 현재 단계(currentStep)
  2. 전체 입력값(formValues)
  3. 강의 목록(courses)
  4. 제출 상태(isSubmitting)
  5. 에러 상태(fieldErrors, submitError, courseError)
  6. 제출 성공 결과(enrollmentResponse)

  Q3. 제출 실패 처리 질문
  → handleSubmit, submitError, getSubmitErrorMessage 부분을 보면 된다.

  Q5. 5단계 확장 질문
  → currentStep 조건부 렌더링 부분을 설정 객체로 분리하면 된다고 말하면 된다.
*/

// 단체 신청에서 인원수를 선택하면 그 수만큼 참가자 입력칸이 필요하다.
// 처음에는 최소 인원인 2명으로 시작한다.
const createParticipants = (count: number): Participant[] =>
  Array.from({ length: count }, () => ({
    name: "",
    email: "",
  }));

// 폼 전체의 기본값이다.
// 개인 신청과 단체 신청을 같은 상태 객체에서 관리해서 이전 단계로 돌아가도 값이 유지되게 했다.
const initialFormValues: EnrollmentFormValues = {
  courseId: "",
  type: "personal",
  applicant: {
    name: "",
    email: "",
    phone: "",
    motivation: "",
  },
  group: {
    organizationName: "",
    headCount: 2,
    participants: createParticipants(2),
    contactPerson: "",
  },
  agreedToTerms: false,
};

// zod 에러를 화면에서 쓰기 쉽게 "applicant.email" 같은 문자열 key로 바꾼다.
// 각 input 아래에 필드별 에러 메시지를 보여주기 위한 처리다.
function toFieldErrors(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  ) {
    return (error as { issues: Array<{ path: Array<string | number>; message: string }> })
      .issues
      .reduce<Record<string, string>>((acc, issue) => {
        const key = issue.path.join(".");
        acc[key] = issue.message;
        return acc;
      }, {});
  }

  return {};
}

// 화면에서 관리하는 formValues를 실제 제출 API 형식으로 바꾼다.
// 개인 신청과 단체 신청의 요청 body가 다르기 때문에 여기서 분기한다.
function createEnrollmentRequest(values: EnrollmentFormValues): EnrollmentRequest {
  // 개인 신청일 때는 group 정보가 필요 없다.
  if (values.type === "personal") {
    return {
      courseId: values.courseId,
      type: "personal",
      applicant: values.applicant,
      agreedToTerms: values.agreedToTerms,
    };
  }

  // 단체 신청일 때는 group 정보까지 포함해서 제출한다.
  return {
    courseId: values.courseId,
    type: "group",
    applicant: values.applicant,
    group: values.group,
    agreedToTerms: values.agreedToTerms,
  };
}

function App() {
  /*
    currentStep은 현재 사용자가 몇 단계에 있는지를 나타낸다.

    1 = 강의 선택
    2 = 신청자 정보 입력
    3 = 확인 및 제출
  */
  const [currentStep, setCurrentStep] = useState(1);

  // 강의 목록과 카테고리 목록을 저장한다.
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | "all">("all");

  /*
    formValues.

    강의 선택값, 개인/단체 신청 유형, 신청자 정보,
    단체 정보, 약관 동의 여부를 한 객체에서 관리한다.

    이렇게 하면 이전 단계로 돌아가도 값이 유지되고,
    마지막 확인 화면에서 전체 데이터를 한 번에 보여줄 수 있다.
  */
  const [formValues, setFormValues] = useState<EnrollmentFormValues>(() => {
    // 새로고침 후에도 입력값이 남아있게 localStorage에서 임시 저장값을 먼저 읽어온다.
    // 저장된 값이 없으면 기본값으로 시작한다.
    return loadEnrollmentDraft() ?? initialFormValues;
  });

  // 강의 목록 로딩 상태
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // 1단계 강의 선택 관련 에러
  const [courseError, setCourseError] = useState("");

  // 2단계 입력 필드별 에러
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 3단계 제출 에러 메시지
  const [submitError, setSubmitError] = useState("");

  // 제출 중인지 여부. 제출 버튼 중복 클릭 방지에 사용한다.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 제출 성공 결과. 값이 생기면 성공 화면으로 전환된다.
  const [enrollmentResponse, setEnrollmentResponse] = useState<EnrollmentResponse | null>(null);

  // 현재 선택한 강의 정보를 찾는다.
  const selectedCourse = courses.find((course) => course.id === formValues.courseId);

  /*
    hasDraft는 사용자가 뭔가 입력했는지 확인하는 값이다.

    이것이 true이면:
    - localStorage에 임시 저장 중이라는 안내를 보여준다.
    - 새로고침/닫기 시 경고창을 띄운다.
  */
  const hasDraft =
    formValues.courseId ||
    formValues.applicant.name ||
    formValues.applicant.email ||
    formValues.applicant.phone ||
    formValues.applicant.motivation ||
    formValues.group.organizationName ||
    formValues.group.contactPerson ||
    formValues.group.participants.some(
      (participant) => participant.name || participant.email
    );

  /*
    [기능]
    카테고리가 바뀔 때마다 Mock API에서 강의 목록을 다시 가져온다.

    예:
    selectedCategory가 "development"이면 개발 카테고리 강의를 가져온다.
    selectedCategory가 "all"이면 전체 강의를 가져온다.
  */
  useEffect(() => {
    async function loadCourses() {
      setIsLoadingCourses(true);
      setCourseError("");

      try {
        const response = await getCourses(selectedCategory);
        setCourses(response.courses);
        setCategories(response.categories);
      } catch {
        setCourseError("강의 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
      } finally {
        setIsLoadingCourses(false);
      }
    }

    loadCourses();
  }, [selectedCategory]);

  /*
    [기능]
    formValues가 바뀔 때마다 브라우저 localStorage에 자동 저장한다.

    임시 저장은 saveEnrollmentDraft를 통해 formValues 변경 시마다 저장.
  */
  useEffect(() => {
    saveEnrollmentDraft(formValues);
  }, [formValues]);

  /*
    [기능]
    작성 중인 내용이 있을 때 브라우저 새로고침/닫기를 하면 확인창을 띄운다.

    "이탈 방지"
  */
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasDraft || enrollmentResponse) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasDraft, enrollmentResponse]);

  /*
    [기능]
    신청자 이름/이메일/전화번호/수강동기를 수정할 때 사용한다.
    입력값을 바꾸면 해당 필드의 기존 에러를 지운다.
  */
  const updateApplicant = (field: keyof Applicant, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [field]: value,
      },
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`applicant.${field}`];
      return next;
    });
  };

  /*
    [기능]
    단체명, 신청 인원수, 담당자 연락처 같은 단체 정보를 수정할 때 사용한다.
  */
  const updateGroup = (
    field: keyof Omit<GroupInfo, "participants">,
    value: string | number
  ) => {
    setFormValues((prev) => ({
      ...prev,
      group: {
        ...prev.group,
        [field]: value,
      },
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`group.${field}`];
      return next;
    });
  };

  /*
    [기능]
    참가자 명단에서 특정 참가자의 이름 또는 이메일을 수정할 때 사용한다.

    예:
    1번째 참가자 이메일 변경
    → index = 0, field = "email"
  */
  const updateParticipant = (
    index: number,
    field: keyof Participant,
    value: string
  ) => {
    setFormValues((prev) => {
      const nextParticipants = prev.group.participants.map((participant, currentIndex) =>
        currentIndex === index
          ? {
              ...participant,
              [field]: value,
            }
          : participant
      );

      return {
        ...prev,
        group: {
          ...prev.group,
          participants: nextParticipants,
        },
      };
    });

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`group.participants.${index}.${field}`];
      delete next["group.participants"];
      return next;
    });
  };

  /*
    [기능]
    단체 신청 인원수를 바꿀 때 참가자 입력칸 개수도 같이 바꾼다.

    "인원수를 늘리면 기존 참가자는 유지하고 빈 칸을 추가했고,
    줄이면 앞쪽 참가자 정보만 유지.".
  */
  const handleHeadCountChange = (headCount: number) => {
    setFormValues((prev) => {
      const currentParticipants = prev.group.participants;

      const nextParticipants = Array.from({ length: headCount }, (_, index) => {
        return currentParticipants[index] ?? { name: "", email: "" };
      });

      return {
        ...prev,
        group: {
          ...prev.group,
          headCount,
          participants: nextParticipants,
        },
      };
    });

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next["group.headCount"];
      delete next["group.participants"];
      return next;
    });
  };

  /*
    [기능]
    개인 신청 / 단체 신청 유형을 변경한다.

    중요한 포인트:
    단체 신청 → 개인 신청으로 바꿀 때는 단체 정보가 필요 없어지므로 초기화한다.
    단, 사용자가 실수로 입력값을 잃지 않도록 confirm으로 확인한다.

    "조건부 필드 전환"
  */
  const handleEnrollmentTypeChange = (type: EnrollmentType) => {
    if (formValues.type === "group" && type === "personal") {
      const shouldChange = window.confirm(
        "개인 신청으로 변경하면 입력한 단체 신청 정보가 초기화됩니다. 변경할까요?"
      );

      if (!shouldChange) {
        return;
      }

      setFormValues((prev) => ({
        ...prev,
        type,
        group: initialFormValues.group,
      }));
      setFieldErrors({});
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      type,
    }));
    setFieldErrors({});
  };

  /*
    [기능]
    1단계에서 다음으로 넘어갈 때 실행된다.

    courseStepSchema로 강의 선택 여부와 신청 유형을 검증한다.
  */
  const handleCourseStepNext = () => {
    const result = courseStepSchema.safeParse({
      courseId: formValues.courseId,
      type: formValues.type,
    });

    if (!result.success) {
      const errors = toFieldErrors(result.error);
      setCourseError(errors.courseId ?? "강의와 신청 유형을 확인해 주세요.");
      return;
    }

    setCourseError("");
    setCurrentStep(2);
  };

  /*
    [기능]
    2단계에서 확인 화면으로 넘어갈 때 실행된다.

    applicantStepSchema로 신청자 정보와 단체 신청 조건부 필드를 검증한다.
  */
  const handleApplicantStepNext = () => {
    const result = applicantStepSchema.safeParse({
      type: formValues.type,
      applicant: formValues.applicant,
      group: formValues.type === "group" ? formValues.group : undefined,
    });

    if (!result.success) {
      setFieldErrors(toFieldErrors(result.error));
      return;
    }

    setFieldErrors({});
    setSubmitError("");
    setCurrentStep(3);
  };

  /*
    [기능]
    최종 제출 버튼을 눌렀을 때 실행된다.

    흐름:
    1. 전체 폼 데이터 최종 검증
    2. 제출 중 상태로 변경
    3. formValues를 API 요청 형식으로 변환
    4. submitEnrollment 호출
    5. 성공하면 임시 저장 삭제 후 성공 화면으로 이동
    6. 실패하면 에러 메시지 표시
  */
  const handleSubmit = async () => {
    const result = enrollmentFormSchema.safeParse(formValues);

    if (!result.success) {
      const errors = toFieldErrors(result.error);

      if (errors.agreedToTerms) {
        setSubmitError(errors.agreedToTerms);
        return;
      }

      setSubmitError("입력값을 다시 확인해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const request = createEnrollmentRequest(formValues);
      const response = await submitEnrollment(request);

      clearEnrollmentDraft();
      setEnrollmentResponse(response);
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
    [기능]
    신청 완료 후 "새 신청 작성"을 누르면 전체 상태를 초기화한다.
  */
  const handleReset = () => {
    clearEnrollmentDraft();
    setCurrentStep(1);
    setSelectedCategory("all");
    setFormValues(initialFormValues);
    setFieldErrors({});
    setCourseError("");
    setSubmitError("");
    setEnrollmentResponse(null);
  };

  /*
    [기능]
    제출 성공 결과가 있으면 성공 화면을 보여준다.
  */
  if (enrollmentResponse) {
    return (
      <main className="app-shell">
        <SuccessScreen
          response={enrollmentResponse}
          formValues={formValues}
          selectedCourse={selectedCourse}
          onReset={handleReset}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">LiveClass Assignment FE-A</p>
        <h1>다단계 수강 신청 폼</h1>
        <p>
          강의 선택부터 수강생 정보 입력, 최종 확인 및 제출까지 이어지는
          수강 신청 흐름을 구현합니다.
        </p>
      </section>

      {/* 현재 진행 단계를 시각적으로 보여준다. */}
      <StepIndicator currentStep={currentStep} />

      {/* 작성 중인 내용이 있으면 임시 저장 안내를 보여준다. */}
      {hasDraft && (
        <div className="draft-notice">
          입력 내용이 브라우저에 임시 저장되고 있습니다. 새로고침 후에도 작성 중인 내용을 이어서 입력할 수 있습니다.
        </div>
      )}

      {/* 1단계: 강의 선택 화면 */}
      {currentStep === 1 && (
        <CourseSelectStep
          courses={courses}
          categories={categories}
          selectedCategory={selectedCategory}
          selectedCourseId={formValues.courseId}
          enrollmentType={formValues.type}
          isLoading={isLoadingCourses}
          errorMessage={courseError}
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            setFormValues((prev) => ({
              ...prev,
              courseId: "",
            }));
            setCourseError("");
          }}
          onCourseSelect={(courseId) => {
            setFormValues((prev) => ({
              ...prev,
              courseId,
            }));
            setCourseError("");
          }}
          onEnrollmentTypeChange={handleEnrollmentTypeChange}
          onNext={handleCourseStepNext}
        />
      )}

      {/* 2단계: 신청자 정보 입력 화면 */}
      {currentStep === 2 && (
        <ApplicantInfoStep
          type={formValues.type}
          applicant={formValues.applicant}
          group={formValues.group}
          errors={fieldErrors}
          onApplicantChange={updateApplicant}
          onGroupChange={updateGroup}
          onParticipantChange={updateParticipant}
          onHeadCountChange={handleHeadCountChange}
          onPrev={() => setCurrentStep(1)}
          onNext={handleApplicantStepNext}
        />
      )}

      {/* 3단계: 확인 및 제출 화면 */}
      {currentStep === 3 && (
        <ReviewSubmitStep
          formValues={formValues}
          selectedCourse={selectedCourse}
          errorMessage={submitError}
          isSubmitting={isSubmitting}
          onTermsChange={(checked) => {
            setFormValues((prev) => ({
              ...prev,
              agreedToTerms: checked,
            }));
            setSubmitError("");
          }}
          onEditStep={(step) => setCurrentStep(step)}
          onPrev={() => setCurrentStep(2)}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}

export default App;