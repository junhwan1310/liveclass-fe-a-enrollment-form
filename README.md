# LiveClass FE-A 다단계 수강 신청 폼

## 프로젝트 개요

온라인 교육 플랫폼의 수강 신청 흐름을 구현한 프론트엔드 과제입니다.

사용자는 강의를 선택하고, 개인 신청 또는 단체 신청 유형에 따라 신청 정보를 입력한 뒤, 최종 확인 화면에서 전체 내용을 검토하고 제출할 수 있습니다.

본 프로젝트는 FE-A 과제인 **다단계 수강 신청 폼**을 기준으로 구현했습니다.

주요 구현 범위는 다음과 같습니다.

- 1단계: 강의 선택
- 2단계: 신청자 정보 입력
- 3단계: 확인 및 제출
- 개인 신청 / 단체 신청 조건부 필드 처리
- 스텝별 유효성 검증
- 제출 성공 / 실패 처리
- Mock API 기반 강의 조회 및 신청 제출
- localStorage 기반 임시 저장
- 입력 중 새로고침 / 브라우저 이탈 방지
- Vitest 기반 주요 로직 테스트
- test, lint, build 기반 제출 전 검증

---

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Language | TypeScript |
| Framework | React |
| Build Tool | Vite |
| Validation | Zod |
| Test | Vitest |
| Styling | CSS |
| Mock API | 로컬 TypeScript 함수 기반 Mock API |
| 상태 관리 | React useState / useEffect 기반 App 단위 통합 formValues + 스텝별 검증 schema |
| 임시 저장 | localStorage |
| 코드 검사 | ESLint |

### 기술 선택 이유

- **React**
  - 단계별 화면 전환, 조건부 렌더링, 폼 상태 관리를 컴포넌트 단위로 구성하기 적합하다고 판단했습니다.

- **TypeScript**
  - 개인 신청과 단체 신청의 요청 구조가 다르기 때문에 타입으로 데이터 구조를 명확히 관리하기 위해 사용했습니다.

- **Zod**
  - 이름, 이메일, 전화번호, 단체 신청 정보 등 유효성 검증 로직을 UI 컴포넌트와 분리하기 위해 사용했습니다.

- **Vitest**
  - Vite 환경과 잘 맞고, 유효성 검증 로직과 Mock API 예외 처리를 빠르게 테스트할 수 있어 사용했습니다.

- **Vite**
  - React + TypeScript 프로젝트를 빠르게 구성하고 로컬 실행 및 빌드를 단순하게 관리하기 위해 사용했습니다.

- **localStorage**
  - 새로고침 후에도 작성 중인 입력값을 복구하기 위한 임시 저장 용도로 사용했습니다.

- **ESLint**
  - React/TypeScript 코드 작성 과정에서 규칙 위반을 확인하고, 컴포넌트 파일과 유틸 함수의 역할을 분리하기 위해 사용했습니다.

---

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

실행 후 브라우저에서 아래 주소로 접속합니다.

```txt
http://localhost:5173/
```

### 3. 테스트 실행

```bash
npm run test
```

주요 유효성 검증, Mock API 예외 처리, 제출 에러 메시지 변환 로직을 확인합니다.

### 4. lint 확인

```bash
npm run lint
```

ESLint 규칙 위반 여부를 확인합니다.

### 5. 빌드 확인

```bash
npm run build
```

빌드가 성공하면 `dist` 폴더에 배포용 파일이 생성됩니다.

---

## 프로젝트 구조 설명

```txt
src/
  api/
    courseApi.ts
    enrollmentApi.ts
    enrollmentApi.test.ts

  components/
    ApplicantInfoStep.tsx
    CourseSelectStep.tsx
    ReviewSubmitStep.tsx
    StepIndicator.tsx
    SuccessScreen.tsx

  constants/
    courses.ts

  types/
    enrollment.ts

  utils/
    storage.ts
    submitError.ts
    submitError.test.ts
    validation.ts
    validation.test.ts

  App.tsx
  App.css
  index.css
  main.tsx
```

### 주요 파일 설명

| 파일 | 역할 |
| --- | --- |
| `src/App.tsx` | 전체 스텝 상태, 폼 상태, 제출 흐름 관리 |
| `src/api/courseApi.ts` | 강의 목록 조회 Mock API |
| `src/api/enrollmentApi.ts` | 수강 신청 제출 Mock API |
| `src/api/enrollmentApi.test.ts` | 수강 신청 제출 Mock API 테스트 |
| `src/constants/courses.ts` | Mock 강의 데이터 |
| `src/types/enrollment.ts` | 강의, 신청자, 개인/단체 신청 타입 정의 |
| `src/utils/validation.ts` | 스텝별 유효성 검증 schema |
| `src/utils/validation.test.ts` | 유효성 검증 schema 테스트 |
| `src/utils/storage.ts` | localStorage 임시 저장 / 복구 / 삭제 처리 |
| `src/utils/submitError.ts` | 제출 실패 시 에러 코드별 메시지 변환 |
| `src/utils/submitError.test.ts` | 제출 에러 메시지 변환 테스트 |
| `src/components/CourseSelectStep.tsx` | 1단계 강의 선택 화면 |
| `src/components/ApplicantInfoStep.tsx` | 2단계 신청자 정보 입력 화면 |
| `src/components/ReviewSubmitStep.tsx` | 3단계 확인 및 제출 화면 |
| `src/components/SuccessScreen.tsx` | 신청 완료 화면 |
| `src/components/StepIndicator.tsx` | 현재 진행 단계 표시 |

---

## 요구사항 해석 및 가정

### 1. 신청자 정보와 단체 신청 정보의 관계

과제 명세에서는 2단계 공통 필드로 이름, 이메일, 전화번호, 수강 동기를 요구하고, 단체 신청 시에는 단체명, 신청 인원수, 참가자 명단, 담당자 연락처를 추가로 요구합니다.

또한 API 스키마에서도 개인 신청과 단체 신청 모두 `applicant` 정보를 포함하고, 단체 신청은 별도의 `group.participants`를 포함합니다.

따라서 본 구현에서는 공통 신청자 정보는 개인/단체 신청 모두에서 요구되는 `applicant` 정보로 처리했습니다. 단체 신청의 실제 참가자 정보는 별도의 `참가자 명단`에서 입력하도록 해석했습니다.

### 2. 개인 신청과 단체 신청의 데이터 처리

개인 신청과 단체 신청은 입력 필드가 다릅니다.

- 개인 신청
  - 강의 정보
  - 신청자 정보
  - 약관 동의

- 단체 신청
  - 강의 정보
  - 신청자 정보
  - 단체명
  - 신청 인원수
  - 참가자 명단
  - 담당자 연락처
  - 약관 동의

단체 신청에서 개인 신청으로 전환할 때는 단체 관련 데이터가 더 이상 필요하지 않으므로 초기화하도록 처리했습니다.

단, 사용자가 실수로 입력값을 잃지 않도록 확인 대화상자를 띄웁니다.

### 3. 참가자 명단 처리

단체 신청의 신청 인원수는 2명 이상 10명 이하로 제한했습니다.

신청 인원수를 변경하면 참가자 입력칸 수가 해당 인원수에 맞게 변경됩니다.

- 인원수를 늘리면 기존 참가자 정보는 유지하고 빈 입력칸을 추가합니다.
- 인원수를 줄이면 앞쪽 참가자 정보만 유지합니다.

참가자 이메일은 중복될 수 없도록 검증했습니다.

### 4. 정원 처리

강의에는 `maxCapacity`와 `currentEnrollment`가 있습니다.

남은 좌석은 아래 기준으로 계산했습니다.

```ts
remainingSeats = maxCapacity - currentEnrollment
```

신청에 필요한 좌석 수는 다음과 같이 해석했습니다.

```txt
개인 신청: 1석
단체 신청: 신청 인원수만큼 좌석 필요
```

따라서 남은 좌석이 1석인 강의에 단체 신청 2명을 제출하면 신청을 차단합니다.

### 5. Mock API 처리

본 과제는 프론트엔드 과제이므로 실제 서버와 DB는 구현하지 않았습니다.

대신 TypeScript 함수로 Mock API를 구성했습니다.

- `getCourses()`
  - 강의 목록 조회
  - 카테고리 필터 처리

- `submitEnrollment()`
  - 신청 제출 처리
  - 정원 초과
  - 중복 신청
  - 참가자 이메일 중복
  - 성공 응답 생성

신청 번호는 실제 DB에서 발급되는 값이 아니라 Mock API에서 임시로 생성합니다.

```ts
enrollmentId: `LC-${Date.now().toString().slice(-8)}`
```

### 6. 중복 신청 처리

실제 서비스라면 서버에서 사용자 또는 이메일 기준으로 이미 신청된 강의인지 DB 조회를 해야 합니다.

이 프로젝트에서는 실제 DB가 없기 때문에 중복 신청 상황을 테스트할 수 있도록 다음 조건을 사용했습니다.

```txt
신청자 이메일에 duplicate 문자열이 포함되면 DUPLICATE_ENROLLMENT 에러 발생
```

예시:

```txt
duplicate@test.com
```

### 7. 제출 에러 메시지 처리

제출 실패 시 Mock API에서 받은 에러 코드를 사용자에게 보여줄 문구로 변환합니다.

이 로직은 `src/utils/submitError.ts`로 분리했습니다.

처음에는 3단계 화면 컴포넌트 안에서 에러 메시지 변환 함수를 함께 export했지만, ESLint의 React Fast Refresh 규칙에 맞지 않아 컴포넌트 파일에서는 컴포넌트만 export하도록 정리했습니다.

---

## 설계 결정과 이유

### 1. 스텝별 화면 분리

각 단계를 별도 컴포넌트로 분리했습니다.

```txt
CourseSelectStep
ApplicantInfoStep
ReviewSubmitStep
SuccessScreen
```

한 파일에 모든 UI와 로직을 작성하면 유지보수가 어려워지기 때문에, 단계별 책임을 분리했습니다.

### 2. 통합 폼 상태 관리

스텝별로 각각 독립적인 상태를 두지 않고, `App.tsx`에서 전체 폼 상태를 관리했습니다.

이유는 다음과 같습니다.

- 이전 단계로 돌아가도 입력값이 유지되어야 함
- 3단계 확인 화면에서 1~2단계 데이터를 모두 보여줘야 함
- 최종 제출 시 전체 데이터를 하나의 요청 객체로 변환해야 함
- localStorage에 전체 작성 상태를 저장하고 복구하기 쉬움

### 3. 스텝별 유효성 검증

유효성 검증은 `src/utils/validation.ts`에 분리했습니다.

- 1단계: 강의 선택 여부 검증
- 2단계: 신청자 정보 및 단체 신청 조건부 필드 검증
- 3단계: 약관 동의 및 최종 제출 검증

단체 신청일 때만 단체 정보가 검증되도록 처리했습니다.

개인 신청에서는 화면에 보이지 않는 단체 필드가 검증 대상이 되지 않도록 했습니다.

### 4. 조건부 필드 처리

신청 유형이 `group`일 때만 단체 신청 필드를 표시합니다.

단체 신청에서 개인 신청으로 변경할 때는 기존 단체 정보를 초기화합니다.

이는 개인 신청 요청에 불필요한 단체 데이터가 남아 데이터 정합성을 해치는 것을 막기 위한 처리입니다.

### 5. 제출 실패 시 데이터 유지

제출 실패가 발생해도 입력 데이터는 유지됩니다.

사용자는 에러 메시지를 확인한 뒤, 필요한 항목만 수정하고 다시 제출할 수 있습니다.

처리한 에러 코드는 다음과 같습니다.

| 에러 코드 | 처리 내용 |
| --- | --- |
| `COURSE_FULL` | 정원 마감 또는 남은 좌석 부족 안내 |
| `DUPLICATE_ENROLLMENT` | 이미 신청된 강의 안내 |
| `INVALID_INPUT` | 입력값 오류 안내 |

### 6. 중복 제출 방지

제출 중에는 `isSubmitting` 상태를 사용하여 제출 버튼을 비활성화합니다.

이를 통해 사용자가 제출 버튼을 여러 번 눌러 중복 요청을 보내는 상황을 방지했습니다.

### 7. 임시 저장

`localStorage`를 사용해 작성 중인 폼 데이터를 브라우저에 임시 저장합니다.

새로고침 후에도 작성 중이던 내용을 복구할 수 있습니다.

제출이 성공하거나 새 신청을 작성하면 임시 저장 데이터를 삭제합니다.

### 8. 테스트 범위 설정

화면 전체 E2E 테스트는 별도로 작성하지 않았습니다.

대신 과제의 핵심 로직인 유효성 검증, Mock API 예외 처리, 제출 에러 메시지 변환은 Vitest 기반 단위 테스트로 확인했습니다.

---

## 구현 기능

### 필수 구현

- [x] 강의 목록 표시
- [x] 카테고리별 강의 필터
- [x] 선택한 강의 정보 표시
- [x] 개인 신청 / 단체 신청 유형 선택
- [x] 신청자 이름 검증
- [x] 이메일 형식 검증
- [x] 한국 전화번호 형식 검증
- [x] 수강 동기 300자 제한
- [x] 단체 신청 조건부 필드 표시
- [x] 단체명 입력
- [x] 신청 인원수 2~10명 제한
- [x] 참가자 명단 인원수만큼 입력
- [x] 담당자 연락처 입력
- [x] 확인 화면에서 전체 입력 내용 요약
- [x] 각 섹션별 수정 버튼
- [x] 이용약관 동의 체크박스
- [x] 제출 성공 화면
- [x] 제출 실패 시 에러 메시지 표시
- [x] 제출 실패 시 입력 데이터 유지
- [x] 스텝별 유효성 검증
- [x] 스텝 인디케이터

### 선택 구현

- [x] localStorage 임시 저장
- [x] 새로고침 후 입력값 복구
- [x] 입력 중 브라우저 새로고침 / 닫기 시 확인 대화상자
- [x] 반응형 레이아웃 일부 적용

---

## Mock API 구성

### 강의 목록 조회

실제 HTTP 요청은 사용하지 않고, `src/api/courseApi.ts`의 `getCourses()` 함수로 Mock 데이터를 조회합니다.

```ts
getCourses(category)
```

카테고리가 `all`이면 전체 강의를 반환하고, 특정 카테고리를 선택하면 해당 카테고리 강의만 반환합니다.

Mock 데이터는 `src/constants/courses.ts`에 정의되어 있습니다.

### 수강 신청 제출

`src/api/enrollmentApi.ts`의 `submitEnrollment()` 함수가 제출 API 역할을 합니다.

```ts
submitEnrollment(request)
```

처리하는 상황은 다음과 같습니다.

- 선택한 강의가 없는 경우
- 강의 정원이 마감된 경우
- 남은 좌석보다 신청 인원이 많은 경우
- 중복 신청인 경우
- 단체 신청 참가자 이메일이 중복된 경우
- 정상 제출된 경우

---

## 테스트

Vitest를 사용해 주요 로직을 단위 테스트로 확인했습니다.

### 테스트 대상

| 파일 | 테스트 내용 |
| --- | --- |
| `src/utils/validation.test.ts` | 스텝별 유효성 검증 |
| `src/api/enrollmentApi.test.ts` | Mock API 제출 성공/실패 처리 |
| `src/utils/submitError.test.ts` | 제출 에러 메시지 변환 |

### 테스트 실행

```bash
npm run test
```

확인한 테스트 항목은 다음과 같습니다.

- 강의를 선택하지 않으면 1단계 검증 실패
- 개인 신청은 단체 정보가 없어도 2단계 검증 성공
- 단체 신청에서 참가자 이메일이 중복되면 검증 실패
- 약관 미동의 시 최종 제출 검증 실패
- 개인 신청 정상 제출 시 신청 번호 반환
- 신청자 이메일에 `duplicate`가 포함되면 중복 신청 에러 반환
- 남은 좌석보다 단체 신청 인원이 많으면 정원 초과 에러 반환
- `COURSE_FULL`의 상세 메시지를 사용자에게 표시
- `DUPLICATE_ENROLLMENT` 에러 메시지 표시
- 알 수 없는 에러는 기본 메시지 표시

---

## 수동 테스트 체크리스트

아래 항목을 로컬 환경에서 직접 확인했습니다.

- [x] 개인 신청 정상 제출
- [x] 단체 신청 정상 제출
- [x] 강의 미선택 시 다음 단계 이동 차단
- [x] 이름 2자 미만 입력 시 에러 표시
- [x] 잘못된 이메일 형식 입력 시 에러 표시
- [x] 잘못된 전화번호 형식 입력 시 에러 표시
- [x] 단체 신청 시 참가자 입력칸이 신청 인원수만큼 생성
- [x] 단체 신청 참가자 이메일 중복 시 에러 표시
- [x] 단체 신청에서 개인 신청으로 변경 시 확인 대화상자 표시
- [x] 정원 마감 강의 선택 불가
- [x] 남은 좌석보다 단체 신청 인원수가 많을 때 제출 차단
- [x] 약관 미동의 시 제출 차단
- [x] `duplicate@test.com` 입력 시 중복 신청 에러 표시
- [x] 제출 실패 후 입력 데이터 유지
- [x] 새로고침 후 입력값 복구
- [x] 신청 완료 후 새 신청 작성 시 입력값 초기화
- [x] `npm run test` 성공 확인
- [x] `npm run lint` 성공 확인
- [x] `npm run build` 성공 확인

---

## 미구현 / 제약사항

- 실제 서버 API와 DB 저장은 구현하지 않았습니다.
  - 본 과제는 FE 과제이므로 TypeScript 함수 기반 Mock API로 대체했습니다.

- 실제 이메일 존재 여부는 검증하지 않습니다.
  - 현재는 이메일 문자열 형식만 검증합니다.

- 중복 신청 여부는 실제 DB 조회가 아닙니다.
  - Mock API에서 이메일에 `duplicate` 문자열이 포함된 경우 중복 신청으로 처리했습니다.

- 신청 번호는 실제 서버에서 발급되는 고유 번호가 아닙니다.
  - Mock API에서 `Date.now()` 기반으로 임시 생성합니다.

- 결제 연동 및 인증/인가는 구현하지 않았습니다.
  - 과제 요구사항에서 결제 연동 및 인증/인가는 불필요하다고 판단했습니다.

- localStorage 임시 저장은 브라우저 단위 저장입니다.
  - 다른 브라우저나 다른 기기에서는 복구되지 않습니다.

- 화면 전체 E2E 테스트는 별도로 작성하지 않았습니다.
  - 주요 유효성 검증과 Mock API 예외 처리는 Vitest 기반 단위 테스트로 확인했고, 실제 사용자 흐름은 수동 테스트 체크리스트로 검증했습니다.

- 반응형 레이아웃은 주요 화면이 작은 화면에서도 사용 가능하도록 일부 적용했습니다.
  - 다만 실제 서비스 수준의 다양한 디바이스별 세부 최적화는 추가 개선 여지가 있습니다.

---

## AI 활용 범위

본 과제에서는 AI 도구를 다음 범위에서 활용했습니다.

- 과제 요구사항 정리
- 폴더 구조 설계 보조
- TypeScript 타입 정의 초안 작성
- Mock API 흐름 설계 보조
- 컴포넌트 구현 초안 작성 보조
- 유효성 검증 schema 설계 보조
- localStorage 임시 저장 및 이탈 방지 흐름 검토
- 테스트 케이스 초안 작성 보조
- README 초안 작성 보조
- 에러 상황 점검 및 버그 수정 방향 검토

단, 최종 구현 범위와 동작 방식은 과제 요구사항을 기준으로 직접 검토했습니다.

특히 아래 항목은 로컬 환경에서 직접 실행하며 확인했습니다.

- 개인 신청 정상 제출
- 단체 신청 정상 제출
- 단체 신청 조건부 필드 표시
- 참가자 이메일 중복 검증
- 개인 신청에서 단체 필드가 검증되지 않도록 수정
- 남은 좌석보다 단체 신청 인원이 많을 때 제출 차단
- 제출 실패 시 입력 데이터 유지
- 새로고침 후 입력값 복구
- `npm run test` 성공 여부
- `npm run lint` 성공 여부
- `npm run build` 성공 여부

AI가 제안한 코드를 그대로 제출하지 않고, 실행 결과를 확인하면서 조건부 검증, 정원 처리, 에러 메시지 표시 방식, lint 오류 해결, 테스트 통과 여부를 직접 확인하고 수정했습니다.

---

## Git 작업 단위

주요 작업은 기능 구현, 버그 수정, 리팩토링, 테스트, 문서화, 의존성 정리 단위로 나누어 커밋했습니다.

초기 기능 구현 단계에서는 강의 선택, 신청자 정보 입력, 확인 및 제출 흐름을 순서대로 구현했고, 이후에는 개인/단체 신청 조건부 검증, 정원 초과 처리, 제출 에러 메시지 처리, 테스트 추가, README 보강, 학습용 주석 정리, 사용하지 않는 의존성 제거를 별도 커밋으로 나누었습니다.

주요 커밋 예시는 다음과 같습니다.

```txt
chore: initialize React TypeScript project
feat: define enrollment types and mock api
feat: add enrollment validation schemas
feat: implement course selection step
feat: implement applicant information step
feat: implement review submit flow
feat: add draft persistence and leave warning
fix: allow personal enrollment submit without group validation
fix: prevent group enrollment beyond remaining seats
fix: show remaining seat error message
refactor: move submit error helper to utils
test: add validation and mock api tests
docs: write assignment README
docs: clarify AI usage in README
docs: add learning comments to key files
docs: correct learning comments
chore: clean up unused dependencies and README wording
```