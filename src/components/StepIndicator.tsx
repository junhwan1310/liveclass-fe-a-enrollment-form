interface StepIndicatorProps {
  currentStep: number;
}

const steps = ["강의 선택", "수강생 정보", "확인 및 제출"];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <ol className="step-indicator" aria-label="수강 신청 진행 단계">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <li
            key={step}
            className={`step-item ${isActive ? "active" : ""} ${
              isCompleted ? "completed" : ""
            }`}
          >
            <span className="step-number">{stepNumber}</span>
            <span className="step-label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}