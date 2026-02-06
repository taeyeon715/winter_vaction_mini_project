# 로그인 에러 수정 가이드

**수정 일시**: 2026-02-04  
**문제**: "Invalid login credentials" 에러 발생

---

## 🔍 문제 분석

### 발생한 에러
```
Invalid login credentials
lib/auth-context.tsx (113:31) @ async login
```

### 원인
1. **데모 계정 문제**: `demo@vhub.kr` 계정이 실제 Supabase에 존재하지 않음
2. **에러 메시지 부족**: 구체적인 에러 정보가 사용자에게 전달되지 않음
3. **회원가입 필요**: 실제 사용하려면 먼저 회원가입이 필요함

---

## ✅ 수정 사항

### 1. Auth Context 개선
**파일**: `lib/auth-context.tsx`

**변경 사항**:
- ✅ `login()` 함수 반환 타입 변경: `Promise<boolean>` → `Promise<{ success: boolean; error?: string }>`
- ✅ `register()` 함수 반환 타입 변경: `Promise<boolean>` → `Promise<{ success: boolean; error?: string }>`
- ✅ 구체적인 에러 메시지 반환:
  - "Invalid login credentials" → "이메일 또는 비밀번호가 올바르지 않습니다. 계정이 없으시다면 회원가입을 먼저 진행해주세요."
  - "Email not confirmed" → "이메일 인증이 완료되지 않았습니다."
  - "User already registered" → "이미 등록된 이메일입니다."

**구현 예시**:
```typescript
const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage = "로그인에 실패했습니다.";
    if (error.message === "Invalid login credentials") {
      errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다. 계정이 없으시다면 회원가입을 먼저 진행해주세요.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.";
    } else {
      errorMessage = error.message || "로그인에 실패했습니다.";
    }
    
    return { success: false, error: errorMessage };
  }

  if (data.user) {
    await loadProfile(data.user.id);
    return { success: true };
  }

  return { success: false, error: "로그인에 실패했습니다." };
};
```

### 2. 로그인 페이지 개선
**파일**: `app/login/page.tsx`

**변경 사항**:
- ✅ `login()` 함수 호출 후 `result.success` 및 `result.error` 사용
- ✅ 구체적인 에러 메시지 표시
- ✅ 데모 계정 버튼 제거 (실제 Supabase에 존재하지 않음)

**구현 예시**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const result = await login(email, password);
  if (result.success) {
    toast.success("로그인 성공!");
    router.push("/");
  } else {
    toast.error(result.error || "이메일 또는 비밀번호가 올바르지 않습니다.");
  }
  setIsLoading(false);
};
```

### 3. 회원가입 페이지 개선
**파일**: `app/register/page.tsx`

**변경 사항**:
- ✅ `register()` 함수 호출 후 `result.success` 및 `result.error` 사용
- ✅ 구체적인 에러 메시지 표시

---

## 📋 사용 방법

### 1. 회원가입
1. `/register` 페이지로 이동
2. 이름, 이메일, 비밀번호 입력
3. 회원가입 버튼 클릭
4. 성공 시 자동으로 로그인되고 홈으로 이동

### 2. 로그인
1. `/login` 페이지로 이동
2. 회원가입한 이메일과 비밀번호 입력
3. 로그인 버튼 클릭
4. 성공 시 홈으로 이동

### 3. 에러 발생 시
- **"Invalid login credentials"**: 계정이 없거나 비밀번호가 틀림 → 회원가입 먼저 진행
- **"Email not confirmed"**: 이메일 인증 필요 → 이메일 확인
- **"User already registered"**: 이미 가입된 이메일 → 로그인 시도

---

## ⚠️ 주의사항

### Supabase 설정 필요
1. **이메일 인증 설정** (선택사항):
   - Supabase Dashboard → Authentication → Settings
   - "Enable email confirmations" 설정 확인
   - 개발 환경에서는 비활성화 권장

2. **프로필 자동 생성 트리거**:
   - `supabase/seed.sql`의 `handle_new_user()` 트리거가 실행되어야 함
   - 회원가입 시 자동으로 `profiles` 테이블에 프로필 생성

---

## 🧪 테스트 시나리오

### 시나리오 1: 회원가입 → 로그인
1. `/register` 페이지 접속
2. 이름, 이메일, 비밀번호 입력
3. 회원가입 버튼 클릭
4. **예상 결과**: 
   - 성공 시: "회원가입이 완료되었습니다!" 토스트
   - 자동 로그인 및 홈으로 이동
5. 로그아웃 후 다시 로그인 시도
6. **예상 결과**: 로그인 성공

### 시나리오 2: 존재하지 않는 계정 로그인
1. `/login` 페이지 접속
2. 존재하지 않는 이메일/비밀번호 입력
3. 로그인 버튼 클릭
4. **예상 결과**: 
   - "이메일 또는 비밀번호가 올바르지 않습니다. 계정이 없으시다면 회원가입을 먼저 진행해주세요." 토스트

### 시나리오 3: 잘못된 비밀번호
1. `/login` 페이지 접속
2. 등록된 이메일과 잘못된 비밀번호 입력
3. 로그인 버튼 클릭
4. **예상 결과**: 
   - "이메일 또는 비밀번호가 올바르지 않습니다." 토스트

---

## ✅ 수정 완료 항목

- [x] Auth Context 에러 메시지 개선
- [x] 로그인 페이지 에러 처리 개선
- [x] 회원가입 페이지 에러 처리 개선
- [x] 데모 계정 버튼 제거
- [x] 빌드 검증 완료

---

## 🎯 결론

**수정 상태**: ✅ **완료**

로그인 및 회원가입 에러 처리가 개선되었습니다. 이제 사용자에게 더 명확한 에러 메시지가 표시됩니다.

**다음 단계**: 
1. Supabase 스키마 적용 (필수)
2. 실제 회원가입 테스트
3. 로그인 테스트

---

**수정 완료일**: 2026-02-04
