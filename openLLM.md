# MVP 개발 작업계획서 (셀프서비스 플랫폼)

## 📋 프로젝트 개요

**목표:** 사용자가 직접 회원가입하고 API 키를 발급받아 사용하는 셀프서비스 LLM API 플랫폼  
**개발 기간:** 12일 (2.5주)  
**타겟 사용자:** 100명 이상 대규모 셀프서비스  
**핵심 가치:** 완전 자동화 (운영자 개입 최소화)

----------

## 🛠️ 개발 스택

### Frontend

-   **프레임워크:** Next.js 16 (App Router)
-   **언어:** TypeScript
-   **스타일링:** Tailwind CSS
-   **컴포넌트:** shadcn/ui (Radix UI 기반)
-   **상태관리:** React Server Components + Client State
-   **차트:** Recharts

### Backend

-   **인증:** Supabase Auth (이메일/소셜 로그인) *이번에 제외 
-   **데이터베이스:** PostgreSQL (orb db-primary)
-   **API 게이트웨이:** New API (https://github.com/QuantumNous/new-api), 백앤드의 기능만 가져쓰는 방식으로
-   **캐시/속도제한:** Redis
-   **API 라우트:** Next.js API Routes (Server Actions)

### Infrastructure

-   **배포:** Dokploy (Mac Studio)
-   **컨테이너:** Docker + Docker Compose
-   **라우팅:** cloudflared tunnel
-   **도메인 구조:**
    -   `www.yourdomain.com` → Next.js 앱
    -   `api.yourdomain.com` → New API (LLM Gateway)

----------

## 🎯 핵심 기능

### 1. 사용자 인증 (Auth)

-   ✅ 이메일/비밀번호 회원가입
-   ✅ 소셜 로그인 (Google, GitHub) /  이번에 제외
-   ✅ 이메일 인증 / 이번에 제외
-   ✅ 비밀번호 재설정

### 2. API 키 관리

-   ✅ 사용자당 최대 3개 키 발급
-   ✅ 키당 기본 5,000 토큰 할당
-   ✅ 키 생성/삭제/활성화/비활성화
-   ✅ 키별 사용량 추적

### 3. 대시보드

-   ✅ 전체 사용량 차트 (일별/주별/월별)
-   ✅ 키별 사용 현황
-   ✅ 남은 할당량 표시
-   ✅ API 사용 가이드

### 4. 로컬 Ollama 연결 (차별화 기능)

-   ✅ 사용자가 자신의 Ollama URL 등록
-   ✅ 등록된 Ollama를 API로 노출
-   ✅ 자신의 GPU로 무제한 사용 가능

### 5. 사용 가이드

-   ✅ Quick Start (Python/JavaScript/cURL)
-   ✅ n8n 연동 가이드
-   ✅ 에러 해결 FAQ

----------

## 🏗️ 시스템 아키텍처

mermaid

```mermaid
graph TB
    subgraph "User Layer"
        U[👤 사용자]
        UC[💻 사용자 앱<br/>n8n/Python]
    end
    
    subgraph "Frontend - Next.js"
        WEB[🌐 Web App<br/>www.yourdomain.com]
        AUTH[🔐 Auth Pages]
        DASH[📊 Dashboard]
        API_ROUTES[⚙️ API Routes]
    end
    
    subgraph "Backend Services"
        SUPABASE[🗄️ Supabase<br/>Auth + PostgreSQL]
        NEWAPI[⚡ New API<br/>LLM Gateway]
        REDIS[💾 Redis<br/>Cache/Rate Limit]
    end
    
    subgraph "LLM Providers"
        LOCAL[🦙 Local Ollama<br/>Mac Studio]
        USER_OLLAMA[🖥️ User's Ollama<br/>localhost:11434]
        EXTERNAL[☁️ OpenAI/Anthropic]
    end
    
    U -->|1. 회원가입/로그인| WEB
    WEB --> AUTH
    WEB --> DASH
    WEB --> API_ROUTES
    
    AUTH -->|인증| SUPABASE (이번제외, 가입만)
    API_ROUTES -->|유저 데이터| SUPABASE 
    API_ROUTES -->|키 발급/관리| NEWAPI
    
    UC -->|2. API 호출<br/>Bearer sk-xxx| NEWAPI
    
    NEWAPI --> REDIS
    NEWAPI -->|라우팅| LOCAL
    NEWAPI -->|라우팅| USER_OLLAMA
    NEWAPI -->|라우팅| EXTERNAL
    
    DASH -.->|사용량 조회| API_ROUTES
```

----------

## 📅 단계별 작업 계획

### **Week 1: 기반 구축 (Day 1-5)**

#### PR-1: 프로젝트 초기화 및 인프라 설정 (Day 1)

**목표:** 개발 환경 구성 완료

**작업 내용:**

-   Next.js 16 프로젝트 생성 (App Router)
-   TypeScript, Tailwind CSS, ESLint 설정
-   shadcn/ui 초기화 (버튼, 카드, 폼 컴포넌트)
-   Supabase 프로젝트 생성 및 연결
-   로컬 docker-compose.yml 작성 (New API + Redis)

**산출물:**

-   `package.json` 의존성 완료
-   `.env.example` 템플릿
-   `docker-compose.dev.yml`
-   기본 폴더 구조 생성

----------

#### PR-2: Supabase Auth 구현 (Day 2)

**목표:** 회원가입/로그인 기능 완성

**작업 내용:**

-   Supabase Auth 설정 (이메일 인증 활성화)
-   로그인 페이지 UI (`/auth/login`)
-   회원가입 페이지 UI (`/auth/signup`)
-   Auth 콜백 라우트 (`/auth/callback`) *제외
-   Supabase 클라이언트 헬퍼 함수 작성
-   로그인 상태 확인 미들웨어

**산출물:**

-   `src/lib/supabase/client.ts`
-   `src/lib/supabase/server.ts`
-   `src/app/auth/login/page.tsx`
-   `src/app/auth/signup/page.tsx`
-   `src/components/auth/login-form.tsx`

**테스트:**

-   회원가입 → 이메일 인증 (제외) → 로그인 성공

----------

#### PR-3: DB 스키마 설계 및 생성 (Day 3)

**목표:** Supabase 테이블 구조 완성

**작업 내용:**

-   `user_profiles` 테이블 생성 (총 할당량, 사용량)
-   `user_api_keys` 테이블 생성 (New API token ID와 매핑)
-   `user_ollama_servers` 테이블 생성 (사용자 Ollama 등록)
-   Row Level Security (RLS) 정책 설정
-   회원가입 시 자동 프로필 생성 트리거
-   초기 데이터 시드

**산출물:**

-   `infra/supabase-setup.sql`
-   RLS 정책 문서

**테스트:**

-   회원가입 시 `user_profiles` 자동 생성 확인

----------

#### PR-4: New API 연동 및 키 발급 로직 (Day 4)

**목표:** Next.js에서 New API로 키 생성 가능

**작업 내용:**

-   New API 클라이언트 라이브러리 작성
-   API Route: `POST /api/keys/create` (키 발급)
-   API Route: `GET /api/keys/list` (내 키 목록)
-   New API 토큰 생성 시 Supabase `user_api_keys`에 매핑 저장
-   사용자당 최대 3개 제한 로직
-   에러 핸들링 (할당량 초과, 중복 생성 등)

**산출물:**

-   `src/lib/newapi/client.ts`
-   `src/app/api/keys/create/route.ts`
-   `src/app/api/keys/list/route.ts`

**테스트:**

-   Postman/cURL로 키 생성 API 호출
-   New API 관리자 UI에서 키 확인

----------

#### PR-5: 레이아웃 및 네비게이션 (Day 5)

**목표:** 공통 UI 프레임 완성

**작업 내용:**

-   헤더 컴포넌트 (로고, 로그아웃 버튼)
-   사이드바 네비게이션 (대시보드/키 관리/사용량/Ollama)
-   반응형 레이아웃 (모바일 메뉴)
-   로딩 스켈레톤
-   Toast 알림 시스템

**산출물:**

-   `src/components/layout/header.tsx`
-   `src/components/layout/sidebar.tsx`
-   `src/app/layout.tsx` 전역 레이아웃

----------

### **Week 2: 핵심 기능 구현 (Day 6-10)**

#### PR-6: 대시보드 메인 페이지 (Day 6)

**목표:** 사용자 첫 화면 완성

**작업 내용:**

-   전체 할당량/사용량 카드 표시
-   "새 키 발급" 버튼 (다이얼로그)
-   키 목록 테이블 (키 이름, 생성일, 상태)
-   키 복사 버튼 (클립보드)
-   키 삭제 기능

**산출물:**

-   `src/app/dashboard/page.tsx`
-   `src/components/dashboard/key-card.tsx`
-   `src/components/ui/dialog.tsx` (shadcn)

**테스트:**

-   키 발급 → 목록에 즉시 표시
-   키 복사 → Toast 알림

----------

#### PR-7: 사용량 조회 페이지 (Day 7-8)

**목표:** 차트로 사용량 시각화

**작업 내용:**

-   New API 로그 테이블에서 사용 내역 조회 API
-   API Route: `GET /api/usage` (일별/주별 집계)
-   Recharts로 라인 차트 구현
-   키별 사용량 필터링
-   CSV 내보내기 기능

**산출물:**

-   `src/app/dashboard/usage/page.tsx`
-   `src/components/dashboard/usage-chart.tsx`
-   `src/app/api/usage/route.ts`

**테스트:**

-   실제 API 호출 후 차트에 반영 확인

----------

#### PR-8: 로컬 Ollama 연결 기능 (Day 9)

**목표:** 사용자 Ollama를 API로 노출

**작업 내용:**

-   Ollama 등록 폼 (URL 입력)
-   API Route: `POST /api/ollama/register`
-   New API에 Custom Channel 추가 로직
-   Ollama 상태 체크 (health check)
-   등록된 Ollama 목록 표시

**산출물:**

-   `src/app/dashboard/ollama/page.tsx`
-   `src/components/dashboard/ollama-form.tsx`
-   `src/app/api/ollama/register/route.ts`

**테스트:**

-   `http://localhost:11434` 등록 → API로 호출 가능

----------

#### PR-9: 사용 가이드 페이지 (Day 10)

**목표:** 사용자 온보딩 완성

**작업 내용:**

-   Quick Start 섹션 (코드 예제)
-   Python/JavaScript/cURL 샘플
-   n8n 연동 가이드 (스크린샷 포함)
-   FAQ (에러 코드 설명)
-   모델 목록 테이블

**산출물:**

-   `src/app/docs/page.tsx`
-   Markdown 렌더링 컴포넌트

----------

### **Week 3: 테스트 및 배포 (Day 11-12)**

#### PR-10: 운영 환경 배포 (Day 11)

**목표:** Dokploy에 프로덕션 배포

**작업 내용:**

-   Dockerfile 작성 (Next.js)
-   Dokploy 서비스 생성 (Next.js, New API, Redis)
-   환경변수 설정 (프로덕션용)
-   cloudflared 라우팅 설정
-   HTTPS 인증서 확인
-   Supabase Auth Redirect URL 설정

**산출물:**

-   `Dockerfile`
-   `infra/DEPLOYMENT.md`
-   `.env.production` 템플릿

**테스트:**

-   `https://www.yourdomain.com` 접속
-   회원가입 → 키 발급 → API 호출 전체 플로우

----------

#### PR-11: 통합 테스트 및 버그 수정 (Day 12)

**목표:** 프로덕션 레디

**작업 내용:**

-   E2E 테스트 시나리오 실행
-   에러 핸들링 강화
-   로딩 상태 개선
-   모바일 반응형 확인
-   SEO 메타 태그 추가
-   성능 최적화 (이미지, 번들)

**체크리스트:**

-   회원가입/로그인 정상 작동
-   키 발급 후 즉시 사용 가능
-   할당량 소진 시 차단
-   사용량 차트 정확도
-   Ollama 등록 성공
-   모바일에서 UI 깨지지 않음

----------

## ✅ 최종 완성 기준

### 사용자 관점

1.  ✅ 웹사이트에서 5분 안에 회원가입 → 키 발급 완료
2.  ✅ 발급받은 키로 n8n/Python에서 LLM 호출 성공
3.  ✅ 대시보드에서 실시간 사용량 확인
4.  ✅ 내 Ollama 등록하여 무제한 사용

### 기술적 완성도

1.  ✅ Supabase Auth 완전 통합
2.  ✅ New API와 PostgreSQL (orb db-primary) 동기화
3.  ✅ RLS로 데이터 보안 보장
4.  ✅ Redis 캐싱으로 성능 최적화
5.  ✅ 에러 핸들링 및 로깅 완비

### 운영 준비

1.  ✅ Dokploy 자동 배포 파이프라인
2.  ✅ cloudflared로 안정적 라우팅
3.  ✅ 모니터링 대시보드 (New API 관리자 UI)
4.  ✅ 백업 및 복구 계획

----------

## 🚀 Claude Code 실행 가이드

bash

```bash
# Claude Code에 다음과 같이 지시
"Next.js 14 기반 셀프서비스 LLM API 플랫폼을 만들어줘.

구조:
- Frontend: Next.js + shadcn/ui
- Auth: Supabase
- Gateway: New API (기존 Docker)
- DB: Supabase PostgreSQL

핵심 기능:
1. 회원가입/로그인 (Supabase Auth)
2. 대시보드에서 API 키 발급 (최대 3개, 5000토큰/개)
3. 사용량 차트 (Recharts)
4. 사용자 로컬 Ollama 등록 기능

위 작업계획서(PR-1~11)를 순서대로 진행하되,
중간에 질문하지 말고 합리적으로 판단해서 완성해줘."
```
