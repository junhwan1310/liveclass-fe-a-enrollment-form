import type { Applicant, EnrollmentType, GroupInfo, Participant } from "../types/enrollment";

interface ApplicantInfoStepProps {
  type: EnrollmentType;
  applicant: Applicant;
  group: GroupInfo;
  errors: Record<string, string>;
  onApplicantChange: (field: keyof Applicant, value: string) => void;
  onGroupChange: (field: keyof Omit<GroupInfo, "participants">, value: string | number) => void;
  onParticipantChange: (
    index: number,
    field: keyof Participant,
    value: string
  ) => void;
  onHeadCountChange: (headCount: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ApplicantInfoStep({
  type,
  applicant,
  group,
  errors,
  onApplicantChange,
  onGroupChange,
  onParticipantChange,
  onHeadCountChange,
  onPrev,
  onNext,
}: ApplicantInfoStepProps) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">STEP 2</p>
          <h2>수강생 정보를 입력해 주세요</h2>
        </div>
        <p className="section-description">
          입력한 정보는 이전 단계로 돌아가도 유지됩니다. 단체 신청은 인원수에 맞춰 참가자 명단을 입력합니다.
        </p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>이름 *</span>
          <input
            value={applicant.name}
            onChange={(event) => onApplicantChange("name", event.target.value)}
            placeholder="예: 박준환"
          />
          {errors["applicant.name"] && (
            <small className="field-error">{errors["applicant.name"]}</small>
          )}
        </label>

        <label className="field">
          <span>이메일 *</span>
          <input
            value={applicant.email}
            onChange={(event) => onApplicantChange("email", event.target.value)}
            placeholder="example@email.com"
          />
          {errors["applicant.email"] && (
            <small className="field-error">{errors["applicant.email"]}</small>
          )}
        </label>

        <label className="field">
          <span>전화번호 *</span>
          <input
            value={applicant.phone}
            onChange={(event) => onApplicantChange("phone", event.target.value)}
            placeholder="010-1234-5678"
          />
          {errors["applicant.phone"] && (
            <small className="field-error">{errors["applicant.phone"]}</small>
          )}
        </label>

        <label className="field full">
          <span>수강 동기</span>
          <textarea
            value={applicant.motivation ?? ""}
            onChange={(event) => onApplicantChange("motivation", event.target.value)}
            placeholder="수강 동기를 300자 이내로 입력해 주세요."
            maxLength={300}
          />
          <em>{(applicant.motivation ?? "").length}/300</em>
          {errors["applicant.motivation"] && (
            <small className="field-error">{errors["applicant.motivation"]}</small>
          )}
        </label>
      </div>

      {type === "group" && (
        <div className="group-section">
          <div className="group-title">
            <div>
              <h3>단체 신청 정보</h3>
              <p>단체 신청은 2명 이상 10명 이하까지 가능합니다.</p>
            </div>
            <span className="badge">조건부 필드</span>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>단체명 *</span>
              <input
                value={group.organizationName}
                onChange={(event) =>
                  onGroupChange("organizationName", event.target.value)
                }
                placeholder="예: 라이브클래스 스터디팀"
              />
              {errors["group.organizationName"] && (
                <small className="field-error">{errors["group.organizationName"]}</small>
              )}
            </label>

            <label className="field">
              <span>신청 인원수 *</span>
              <select
                value={group.headCount}
                onChange={(event) => onHeadCountChange(Number(event.target.value))}
              >
                {Array.from({ length: 9 }, (_, index) => index + 2).map((count) => (
                  <option key={count} value={count}>
                    {count}명
                  </option>
                ))}
              </select>
              {errors["group.headCount"] && (
                <small className="field-error">{errors["group.headCount"]}</small>
              )}
            </label>

            <label className="field full">
              <span>담당자 연락처 *</span>
              <input
                value={group.contactPerson}
                onChange={(event) => onGroupChange("contactPerson", event.target.value)}
                placeholder="010-1234-5678"
              />
              {errors["group.contactPerson"] && (
                <small className="field-error">{errors["group.contactPerson"]}</small>
              )}
            </label>
          </div>

          <div className="participants">
            <div className="participants-header">
              <h3>참가자 명단</h3>
              <p>신청 인원수와 동일한 수의 이름/이메일을 입력해야 합니다.</p>
            </div>

            {errors["group.participants"] && (
              <p className="field-error">{errors["group.participants"]}</p>
            )}

            <div className="participant-list">
              {group.participants.map((participant, index) => (
                <div className="participant-row" key={index}>
                  <strong>{index + 1}</strong>

                  <label className="field">
                    <span>참가자 이름 *</span>
                    <input
                      value={participant.name}
                      onChange={(event) =>
                        onParticipantChange(index, "name", event.target.value)
                      }
                      placeholder="이름"
                    />
                    {errors[`group.participants.${index}.name`] && (
                      <small className="field-error">
                        {errors[`group.participants.${index}.name`]}
                      </small>
                    )}
                  </label>

                  <label className="field">
                    <span>참가자 이메일 *</span>
                    <input
                      value={participant.email}
                      onChange={(event) =>
                        onParticipantChange(index, "email", event.target.value)
                      }
                      placeholder="email@example.com"
                    />
                    {errors[`group.participants.${index}.email`] && (
                      <small className="field-error">
                        {errors[`group.participants.${index}.email`]}
                      </small>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="button-row between">
        <button type="button" className="secondary-button" onClick={onPrev}>
          이전 단계로
        </button>
        <button type="button" className="primary-button" onClick={onNext}>
          확인 화면으로
        </button>
      </div>
    </section>
  );
}