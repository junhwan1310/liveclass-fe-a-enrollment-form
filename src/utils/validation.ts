import { z } from "zod";

/*
  이 파일은 유효성 검증을 담당한다.

  왜 따로 분리했나?
  → 컴포넌트 안에 검증 로직을 넣으면 코드가 복잡해진다.
  → validation.ts로 분리하면 UI와 검증 책임을 나눌 수 있다.
  → 클라이언트 검증은 이 파일에서 담당한다.
*/

// 한국 전화번호 형식 검증용 정규식이다.
// 010-1234-5678 또는 01012345678 같은 형식을 허용한다.
const koreanPhoneRegex = /^(01[016789]-?\d{3,4}-?\d{4}|0\d{1,2}-?\d{3,4}-?\d{4})$/;

/*
  [기능]
  신청자 공통 정보 검증 schema.

  개인 신청과 단체 신청 모두에서 필요한 정보:
  - 이름
  - 이메일
  - 전화번호
  - 수강 동기
*/
export const applicantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "이름은 2자 이상 입력해 주세요.")
    .max(20, "이름은 20자 이하로 입력해 주세요."),
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해 주세요.")
    .email("올바른 이메일 형식으로 입력해 주세요."),
  phone: z
    .string()
    .trim()
    .min(1, "전화번호를 입력해 주세요.")
    .regex(koreanPhoneRegex, "올바른 한국 전화번호 형식으로 입력해 주세요."),
  motivation: z
    .string()
    .max(300, "수강 동기는 300자 이하로 입력해 주세요.")
    .optional()
    .or(z.literal("")),
});

/*
  [기능]
  단체 신청의 참가자 1명에 대한 검증 schema.

  참가자마다 이름과 이메일이 필요하다.
*/
export const participantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "참가자 이름은 2자 이상 입력해 주세요.")
    .max(20, "참가자 이름은 20자 이하로 입력해 주세요."),
  email: z
    .string()
    .trim()
    .min(1, "참가자 이메일을 입력해 주세요.")
    .email("올바른 이메일 형식으로 입력해 주세요."),
});

/*
  [기능]
  단체 신청 정보 검증 schema.

  검증 내용:
  1. 단체명 필수
  2. 신청 인원수 2~10명
  3. 참가자 명단 필수
  4. 담당자 연락처 필수
  5. 참가자 수와 신청 인원수가 같은지 확인
  6. 참가자 이메일이 중복되지 않는지 확인
*/
export const groupSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(1, "단체명을 입력해 주세요."),
    headCount: z
      .number({ error: "신청 인원수를 입력해 주세요." })
      .min(2, "단체 신청은 최소 2명부터 가능합니다.")
      .max(10, "단체 신청은 최대 10명까지 가능합니다."),
    participants: z.array(participantSchema),
    contactPerson: z
      .string()
      .trim()
      .min(1, "담당자 연락처를 입력해 주세요.")
      .regex(koreanPhoneRegex, "올바른 담당자 연락처를 입력해 주세요."),
  })
  .superRefine((group, ctx) => {
    /*
      [기능]
      참가자 명단 수가 신청 인원수와 같은지 확인한다.

      예:
      신청 인원수 3명인데 참가자 명단이 2명뿐이면 실패.
    */
    if (group.participants.length !== group.headCount) {
      ctx.addIssue({
        code: "custom",
        path: ["participants"],
        message: "참가자 명단은 신청 인원수와 같아야 합니다.",
      });
    }

    /*
      [기능]
      참가자 이메일 중복 검증.

      이메일을 소문자로 바꿔 비교하는 이유:
      TEST@test.com과 test@test.com을 같은 이메일로 보기 위해서다.
    */
    const emails = group.participants.map((participant) =>
      participant.email.trim().toLowerCase()
    );

    const duplicatedEmail = emails.find(
      (email, index) => email && emails.indexOf(email) !== index
    );

    if (duplicatedEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["participants"],
        message: "참가자 이메일은 중복될 수 없습니다.",
      });
    }
  });

/*
  [기능]
  1단계 검증 schema.

  강의를 선택했는지, 신청 유형이 personal/group 중 하나인지 확인한다.
*/
export const courseStepSchema = z.object({
  courseId: z.string().min(1, "수강할 강의를 선택해 주세요."),
  type: z.enum(["personal", "group"]),
});

/*
  [기능]
  2단계 검증 schema.

  공통 신청자 정보는 항상 검증한다.
  단체 신청일 때만 groupSchema를 추가로 검증한다.

  면접 핵심:
  "개인 신청에서는 단체 정보가 검증 대상이 되지 않도록 했습니다."
*/
export const applicantStepSchema = z
  .object({
    type: z.enum(["personal", "group"]),
    applicant: applicantSchema,
    group: z.unknown().optional(),
  })
  .superRefine((values, ctx) => {
    // 개인 신청이면 단체 정보를 검사하지 않는다.
    if (values.type !== "group") {
      return;
    }

    // 단체 신청일 때만 단체 정보 검증을 실행한다.
    const groupResult = groupSchema.safeParse(values.group);

    if (!groupResult.success) {
      groupResult.error.issues.forEach((issue) => {
        ctx.addIssue({
          ...issue,
          path: ["group", ...issue.path],
        });
      });
    }
  });

/*
  [기능]
  3단계 약관 동의 검증 schema.

  이용약관에 동의해야 제출할 수 있다.
*/
export const reviewStepSchema = z.object({
  agreedToTerms: z.literal(true, {
    error: "이용약관에 동의해야 제출할 수 있습니다.",
  }),
});

/*
  [기능]
  최종 제출 전체 검증 schema.

  최종 제출 직전에:
  - 강의 선택
  - 신청 유형
  - 신청자 정보
  - 약관 동의
  - 단체 신청이면 단체 정보
  를 한 번 더 검증한다.
*/
export const enrollmentFormSchema = z
  .object({
    courseId: z.string().min(1, "수강할 강의를 선택해 주세요."),
    type: z.enum(["personal", "group"]),
    applicant: applicantSchema,
    group: z.unknown().optional(),
    agreedToTerms: z.boolean(),
  })
  .superRefine((values, ctx) => {
    // 약관 동의 확인
    if (!values.agreedToTerms) {
      ctx.addIssue({
        code: "custom",
        path: ["agreedToTerms"],
        message: "이용약관에 동의해야 제출할 수 있습니다.",
      });
    }

    // 개인 신청은 단체 정보를 검사하지 않는다.
    // 단체 신청일 때만 groupSchema를 적용한다.
    if (values.type !== "group") {
      return;
    }

    const groupResult = groupSchema.safeParse(values.group);

    if (!groupResult.success) {
      groupResult.error.issues.forEach((issue) => {
        ctx.addIssue({
          ...issue,
          path: ["group", ...issue.path],
        });
      });
    }
  });

// enrollmentFormSchema를 기준으로 TypeScript 타입을 추론할 때 사용할 수 있다.
export type EnrollmentFormSchema = z.infer<typeof enrollmentFormSchema>;