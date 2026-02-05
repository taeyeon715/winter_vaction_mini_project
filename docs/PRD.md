**🛠️ [Final PRD] Volunteer Impact System: V-Hub

1. Project Overview**

• **서비스 명:** V-Hub (Volunteer Impact System)
• **한 줄 정의:** 봉사 활동의 가치를 실시간 데이터로 증명하고 시각화하는 임팩트 관리 플랫폼.
• **핵심 문제 및 솔루션:** * **Problem:** 파편화된 봉사 사진과 기록들, 데이터화되지 않는 봉사 시간.
    ◦ **Solution:** 활동 사진 업로드와 동시에 실시간 대시보드(Realtime)를 업데이트하여 봉사단의 성과를 시각적으로 증명.

**2. User Persona & User Flow**
• **주요 타겟 유저:** 1. **관리자(Admin):** 사회봉사단장 (프로그램 관리 및 성과 확인)
2. **단원(User):** 봉사 참여 대학생 (활동 인증 및 사진 공유)
**🟢 Phase 1 핵심 유저 시나리오**

1. **접속/로그인:** 로그인 기능 존재. 로그인 후 프로필(이름, 학번) 설정.
2. **프로그램 탐색:** 메인 페이지에서 현재 진행 중인 봉사 프로그램 확인.
3. **활동 인증:** '인증하기' 버튼 클릭 -> 사진 업로드 + 봉사 시간 입력 + 소감 작성.
4. **결과 확인:** 업로드 즉시 메인 대시보드의 '누적 봉사 시간'이 실시간 상승하는 것 확인.
5. **아카이브:** '공유 앨범' 탭에서 다른 단원들이 올린 활동 사진 실시간 피드 확인.

**3. Traffic Light Key Features
🟢 Phase 1 (Core: 당장 구현)**
• **Realtime Dashboard:** 누적 봉사 시간, 참여 인원 실시간 Count-up 대시보드. [🟢Phase 1]
• **Activity Logging:** 사진(Storage) + 시간 + 내용 DB 저장 기능. [🟢Phase 1]
• **Shared Gallery:** 전체 단원의 활동 내역을 카드 UI로 보여주는 피드. [🟢Phase 1]
• **Responsive UI:** 모바일 업로드를 고려한 반응형 사이드바 레이아웃. [🟢Phase 1]

- 메인 화면에서는 캘린더로 이번 달에 어떤 봉사가 있는지 표시. 캘린더 밑 혹은 옆에 한 눈에 볼 수 있도록 현재 진행중인 봉사 활동 내역 표시ex)초등학교 교육봉사 / 복지관 어르신 봉사 등.  [🟢Phase 1]
**🟡 Phase 2 (Advanced: 설계만 포함)**
• **Admin Approval:** 관리자가 활동 내역을 확인하고 승인/반려하는 로직. [🟡Phase 2]
• **AI Upscaling:** 잡지 제작을 위한 업로드 이미지 AI 고화질 변환 연동. [🟡Phase 2]
• **Category Filter:** 프로그램별, 월별 활동 필터링 시스템. [🟡Phase 2]

**- PDF Export: 봉사활동 확인서 및 결과 보고서 자동 생성/다운로드. [**🟡Phase 2**]

1. Tech Stack & Data Modeling

Tech Stack**
• **Framework:** Next.js (App Router), Tailwind CSS
• **Backend:** Supabase (Database, Auth, Storage, Realtime)
• **Animation:** Framer Motion (Count-up 효과)
• **UI Library:** Shadcn UI
**ERD 설계 (DBA-Strict)테이블명컬럼명타입설명profiles**`id(PK)`, `email`, `name`, `role(admin/user)`, `student_id`UUID, Text, Text, Enum, Text사용자 기본 정보 및 권한**programs**`id(PK)`, `title`, `description`, `thumbnail_url`, `is_active`UUID, Text, Text, Text, Boolean봉사 프로그램 정보**activities**`id(PK)`, `user_id(FK)`, `program_id(FK)`, `hours`, `image_url`, `content`, `status`UUID, UUID, UUID, Int, Text, Text, Text활동 내역 (Status 기본값 'approved')**magazine_assets**`id(PK)`, `activity_id(FK)`, `is_starred`UUID, UUID, Boolean잡지용 베스트 샷 관리 (Phase 2 확장용)

**5. Implementation Guide**
• **Rule 1 (Data):** 모든 DB 접근은 Supabase 클라이언트 라이브러리를 사용하며, RLS(Row Level Security)를 설정하여 본인의 데이터만 수정 가능하게 한다.
• **Rule 2 (UI):** 톤앤매너는 `#F87171`(코랄)을 포인트 컬러로 사용하고, 배경은 `#FAFAFA`(아이보리 계열)를 유지한다.
• **Rule 3 (Phase 1 Logic):** MVP 속도를 위해 활동 업로드 시 `status`는 별도의 승인 절차 없이 즉시 `approved`로 저장하여 대시보드에 반영한다.
• **Rule 4 (Realtime):** `activities` 테이블에 새로운 `INSERT`가 발생하면 대시보드 숫자가 리프레시 없이 Framer Motion으로 차오르도록 구현한다.

**6. Success Metrics**

1. **Vercel 배포:** 수요일까지 CI/CD 연결 및 도메인 접속 완료.
2. **실시간 연동:** 모바일에서 사진 업로드 시 데스크톱 대시보드 숫자가 3초 이내에 변하는가?
3. **데이터 무결성:** 이미지 파일이 Supabase Storage에 정확히 분류되어 저장되는가?

