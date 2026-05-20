import { useEffect, useState } from "react";
import "./App.css";
import { getCourses } from "./api/courseApi";
import { CourseSelectStep } from "./components/CourseSelectStep";
import { StepIndicator } from "./components/StepIndicator";
import type { Course, CourseCategory, EnrollmentType } from "./types/enrollment";

function App() {
  const [currentStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | "all">("all");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>("personal");
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState("");

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

  const handleNext = () => {
    if (!selectedCourseId) {
      setCourseError("다음 단계로 이동하려면 수강할 강의를 선택해 주세요.");
      return;
    }

    setCourseError("");
    alert("1단계 검증 성공. 다음 단계 화면을 이어서 구현합니다.");
  };

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

      <CourseSelectStep
        courses={courses}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedCourseId={selectedCourseId}
        enrollmentType={enrollmentType}
        isLoading={isLoadingCourses}
        errorMessage={courseError}
        onCategoryChange={(category) => {
          setSelectedCategory(category);
          setSelectedCourseId("");
          setCourseError("");
        }}
        onCourseSelect={(courseId) => {
          setSelectedCourseId(courseId);
          setCourseError("");
        }}
        onEnrollmentTypeChange={setEnrollmentType}
        onNext={handleNext}
      />
    </main>
  );
}

export default App;