import { z } from "zod";

const koreanPhoneRegex = /^(01[016789]-?\d{3,4}-?\d{4}|0\d{1,2}-?\d{3,4}-?\d{4})$/;

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
    if (group.participants.length !== group.headCount) {
      ctx.addIssue({
        code: "custom",
        path: ["participants"],
        message: "참가자 명단은 신청 인원수와 같아야 합니다.",
      });
    }

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

export const courseStepSchema = z.object({
  courseId: z.string().min(1, "수강할 강의를 선택해 주세요."),
  type: z.enum(["personal", "group"]),
});

export const applicantStepSchema = z
  .object({
    type: z.enum(["personal", "group"]),
    applicant: applicantSchema,
    group: z.unknown().optional(),
  })
  .superRefine((values, ctx) => {
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

export const reviewStepSchema = z.object({
  agreedToTerms: z.literal(true, {
    error: "이용약관에 동의해야 제출할 수 있습니다.",
  }),
});

export const enrollmentFormSchema = z
  .object({
    courseId: z.string().min(1, "수강할 강의를 선택해 주세요."),
    type: z.enum(["personal", "group"]),
    applicant: applicantSchema,
    group: z.unknown().optional(),
    agreedToTerms: z.boolean(),
  })
  .superRefine((values, ctx) => {
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

export type EnrollmentFormSchema = z.infer<typeof enrollmentFormSchema>;