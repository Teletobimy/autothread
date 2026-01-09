# 🧵 Threads Auto Poster

AI 기반 콘텐츠 생성 및 Threads 자동 게시 플랫폼

## ✨ 기능

- 📝 **AI 콘텐츠 생성**: GPT-4o / Gemini로 고품질 콘텐츠 자동 생성
- 🌐 **자동 번역**: 영어/스페인어로 자동 번역
- 🚀 **자동 게시**: Threads에 예약 게시
- 📊 **Google Sheets 연동**: 생성된 콘텐츠 자동 관리

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - App Router
- **React 19** - Server & Client Components
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 모던한 UI

### Backend
- **Python** - AI 모델 & API 통합
- **OpenAI API** - GPT-4o
- **Google Gemini** - Gemini 2.5 Flash
- **Threads API** - 메타 Threads 게시
- **Google Sheets API** - 데이터 관리

## 🚀 시작하기

### 1. 의존성 설치

```bash
# Node.js 의존성
cd web
npm install

# Python 의존성
cd backend
pip install -r requirements.txt
```

### 2. 환경 변수 설정

프로젝트 루트(부모 폴더)에 `.env` 파일 생성:

```env
# AI API Keys
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...

# Threads API
LONG_LIVED_ACCESS_TOKEN=...

# Google Cloud Platform
GCP_TYPE=service_account
GCP_PROJECT_ID=your-project-id
GCP_PRIVATE_KEY_ID=...
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GCP_CLIENT_EMAIL=...@....iam.gserviceaccount.com
GCP_CLIENT_ID=...
```

### 3. 개발 서버 실행

```bash
cd web
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📖 API 키 발급 방법

### OpenAI API Key
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭

### Google API Key  
1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭

### Threads Access Token
1. https://developers.facebook.com/ 접속
2. Threads API 앱 생성
3. Long-Lived Token 발급

### Google Cloud Service Account
1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성
3. Google Sheets API & Drive API 활성화
4. 서비스 계정 생성 및 JSON 키 다운로드
5. JSON 내용을 환경 변수로 변환

## 📁 프로젝트 구조

```
thread_content_generation/
├── web/                    # Next.js 앱
│   ├── app/               # App Router
│   │   ├── api/          # API Routes
│   │   ├── page.tsx      # 메인 페이지
│   │   └── layout.tsx    # 레이아웃
│   ├── components/        # React 컴포넌트
│   └── backend/           # Python 백엔드
│       ├── google_sheets.py
│       ├── post_to_threads.py
│       └── requirements.txt
└── .env                   # 환경 변수
```

## 🎨 주요 기능 화면

### 1. 콘텐츠 생성
- AI 모델 선택 (GPT-4o / Gemini)
- 프롬프트 입력
- 생성 개수 설정

### 2. 자동 번역
- 다국어 지원 (영어, 스페인어)
- 일괄 번역

### 3. 자동 게시
- 예약 게시
- 게시 간격 설정
- 실시간 로그

### 4. 설정
- API 키 상태 확인
- 환경 설정 안내

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 PR 환영합니다!
