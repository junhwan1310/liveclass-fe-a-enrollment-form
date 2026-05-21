import { useEffect, useState } from "react";
import "./App.css";
import { getCourses } from "./api/courseApi";
import { submitEnrollment } from "./api/enrollmentApi";
import { ApplicantInfoStep } from "./components/ApplicantInfoStep";
import { CourseSelectStep } from "./components/CourseSelectStep";
import {
  getSubmitErrorMessage,
  ReviewSubmitStep,
} from "./components/ReviewSubmitStep";
import { StepIndicator } from "./components/StepIndicator";
import { SuccessScreen } from "./components/SuccessScreen";
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
  if (values.type === "personal") {
    return {
      courseId: values.courseId,
      type: "personal",
      applicant: values.applicant,
      agreedToTerms: values.agreedToTerms,
    };
  }

  return {
    courseId: values.courseId,
    type: "group",
    applicant: values.applicant,
    group: values.group,
    agreedToTerms: values.agreedToTerms,
  };
}

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | "all">("all");

  // 새로고침 후에도 입력값이 남아있게 localStorage에서 임시 저장값을 먼저 읽어온다.
  // 저장된 값이 없으면 기본값으로 시작한다.
  const [formValues, setFormValues] = useState<EnrollmentFormValues>(() => {
    return loadEnrollmentDraft() ?? initialFormValues;
  });

  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentResponse, setEnrollmentResponse] = useState<EnrollmentResponse | null>(null);

  const selectedCourse = courses.find((course) => course.id === formValues.courseId);

  // 사용자가 뭔가 입력했는지 확인한다.
  // 입력 중인 내용이 있을 때만 새로고침/닫기 경고를 띄우기 위해 사용한다.
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

  // 카테고리가 바뀔 때마다 mock API에서 강의 목록을 다시 가져온다.
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

  // formValues가 바뀔 때마다 브라우저에 자동 임시 저장한다.
  // 그래서 새로고침해도 작성 중이던 내용이 복구된다.
  useEffect(() => {
    saveEnrollmentDraft(formValues);
  }, [formValues]);

  // 작성 중인 내용이 있을 때 브라우저 새로고침/닫기를 하면 확인창을 띄운다.
  // 신청 완료 화면에서는 더 이상 경고가 필요 없으므로 제외한다.
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

  const updateApplicant = (field: keyof Applicant, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [field]: value,
      },
    }));

    // 사용자가 해당 필드를 다시 수정하면 기존 에러를 지운다.
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`applicant.${field}`];
      return next;
    });
  };

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

  const handleHeadCountChange = (headCount: number) => {
    setFormValues((prev) => {
      const currentParticipants = prev.group.participants;

      // 인원수를 늘리면 기존 입력값은 유지하고 새 칸만 추가한다.
      // 인원수를 줄이면 앞쪽 참가자 정보만 남긴다.
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

  const handleEnrollmentTypeChange = (type: EnrollmentType) => {
    // 단체 신청에서 개인 신청으로 바꾸면 단체 정보가 더 이상 필요하지 않다.
    // 실수로 입력값이 사라지는 것을 막기 위해 확인창을 띄운다.
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

  const handleCourseStepNext = () => {
    // 1단계에서는 강의 선택 여부와 신청 유형만 검증한다.
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

  const handleApplicantStepNext = () => {
    // 2단계에서는 신청자 정보와 단체 신청 조건부 필드를 검증한다.
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

  const handleSubmit = async () => {
    // 최종 제출 전에는 전체 데이터를 한 번 더 검증한다.
    // 특히 약관 동의는 마지막 단계에서 확인한다.
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

      // 제출 성공 후에는 임시 저장된 작성 중 데이터를 삭제한다.
      clearEnrollmentDraft();
      setEnrollmentResponse(response);
    } catch (error) {
      // 서버 에러 코드를 사용자에게 이해하기 쉬운 문장으로 바꿔 보여준다.
      // 입력 데이터는 그대로 유지되므로 수정 후 다시 제출할 수 있다.
      setSubmitError(getSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <StepIndicator currentStep={currentStep} />

      {hasDraft && (
        <div className="draft-notice">
          입력 내용이 브라우저에 임시 저장되고 있습니다. 새로고침 후에도 작성 중인 내용을 이어서 입력할 수 있습니다.
        </div>
      )}

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