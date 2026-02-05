1. User Journey (사용자 여정)

graph TD

    Start([앱 접속 및 로그인]) --> Profile{프로필 설정 여부}

    Profile -- 미설정 --> SetProfile[이름/학번 입력 및 저장]

    Profile -- 설정완료 --> Main[메인 대시보드 & 캘린더]

    

    Main --> Explore[진행 중인 봉사 프로그램 확인]

    Explore --> Auth[활동 인증하기 버튼 클릭]

    

    subgraph "Activity Logging (Phase 1)"

    Auth --> Upload[사진 선택 및 소감 작성]

    Upload --> Submit[저장 버튼 클릭]

    end

    

    Submit --> DB_Insert[Supabase DB 저장 & Storage 업로드]

    DB_Insert --> Realtime_Update[실시간 대시보드 수치 상승 확인]

    Realtime_Update --> Gallery[공유 앨범 피드에서 내 게시물 확인]

    

    style Realtime_Update fill:#F87171,stroke:#333,stroke-width:2px

1. System Architecture Flow (데이터 흐름)

sequenceDiagram

    participant User as 사용자 (App)

    participant Next as Next.js (Client)

    participant SB_Auth as Supabase Auth

    participant SB_Storage as Supabase Storage

    participant SB_DB as Supabase Database

    Note over User, Next: 활동 인증 과정

    User->>Next: 사진 업로드 및 시간 입력

    Next->>SB_Auth: RLS 권한 확인

    Next->>SB_Storage: 이미지 업로드 (URL 반환)

    Next->>SB_DB: 활동 데이터 INSERT (status: 'approved')

    

    Note over SB_DB, Next: Realtime 리스너 작동

    SB_DB-->>Next: Broadcast: 새로운 활동 감지 (Insert Event)

    Next->>Next: Framer Motion으로 대시보드 숫자 업데이트

    Next->>User: 실시간 업데이트된 대시보드 화면 표시

