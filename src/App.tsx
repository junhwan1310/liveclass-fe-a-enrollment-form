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

const createParticipants = (count: number): Participant[] =>
  Array.from({ length: count }, () => ({
    name: "",
    email: "",
  }));

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
  const [formValues, setFormValues] = useState<EnrollmentFormValues>(initialFormValues);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentResponse, setEnrollmentResponse] = useState<EnrollmentResponse | null>(null);

  const selectedCourse = courses.find((course) => course.id === formValues.courseId);

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
      setEnrollmentResponse(response);
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
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