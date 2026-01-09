# 🧵 Threads Auto Poster

AI 기반 콘텐츠 생성 및 Threads 자동 게시 플랫폼

## 🏗️ 아키텍처

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Firebase        │────▶│   Cloud Run     │
│  (Frontend)     │     │  Hosting         │     │   (Backend API) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                      │                        │
         │              ┌───────┴───────┐               │
         │              │               │               │
         ▼              ▼               ▼               ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Firebase │   │ Firestore│   │ Firebase │   │ Threads  │
   │   Auth   │   │    DB    │   │ Storage  │   │   API    │
   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

## ✨ 기능

- 🔐 **Firebase Auth** - Google 로그인
- 📝 **AI 콘텐츠 생성** - GPT-4o / Gemini 지원
- 🌐 **자동 번역** - 영어/스페인어
- 🚀 **Threads 자동 게시** - 예약 게시
- 📊 **Firestore DB** - 콘텐츠 큐 관리
- 💾 **Firebase Storage** - 파일 저장
- ⚡ **Cloud Run** - 서버리스 백엔드

## 🚀 자동 배포

**GitHub Push → 자동 배포**

`main` 또는 `master` 브랜치에 push하면:
1. ✅ Next.js 빌드 → Firebase Hosting 배포
2. ✅ Docker 이미지 빌드 → Cloud Run 배포
3. ✅ Firestore Rules 배포
4. ✅ Storage Rules 배포

## 📋 GitHub Secrets 설정

Repository Settings → Secrets and variables → Actions에서 설정:

| Secret Name | 설명 |
|-------------|------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase 서비스 계정 JSON |
| `GCP_SERVICE_ACCOUNT_KEY` | GCP 서비스 계정 JSON |
| `FIREBASE_API_KEY` | Firebase Web API Key |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `FIREBASE_APP_ID` | Firebase App ID |
| `CLOUD_RUN_URL` | Cloud Run 서비스 URL |
| `OPENAI_API_KEY` | OpenAI API Key |
| `GOOGLE_API_KEY` | Google AI API Key |
| `LONG_LIVED_ACCESS_TOKEN` | Threads Access Token |
| `GCP_PROJECT_ID` | GCP Project ID |
| `GCP_PRIVATE_KEY` | GCP Private Key |
| `GCP_CLIENT_EMAIL` | GCP Client Email |

## 🛠️ 로컬 개발

### 1. 프론트엔드 (Next.js)

```bash
cd web
npm install
npm run dev
```

### 2. 백엔드 (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 3. Firebase 에뮬레이터

```bash
firebase emulators:start
```

## 📁 프로젝트 구조

```
thread_content_generation/
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml  # CI/CD 워크플로우
├── backend/                     # Cloud Run 백엔드
│   ├── Dockerfile
│   ├── main.py                 # FastAPI 서버
│   ├── content_generator.py    # AI 생성
│   ├── threads_api.py          # Threads API
│   └── requirements.txt
├── web/                        # Next.js 프론트엔드
│   ├── app/
│   ├── components/
│   ├── lib/                    # Firebase SDK
│   └── contexts/               # React Context
├── firebase.json               # Firebase 설정
├── firestore.rules             # Firestore 보안 규칙
├── storage.rules               # Storage 보안 규칙
└── .firebaserc                 # Firebase 프로젝트 설정
```

## 🔧 Firebase 프로젝트 설정

### Firebase Console에서:

1. **Authentication** 활성화
   - Google 로그인 공급자 활성화

2. **Firestore Database** 생성
   - 위치: asia-northeast3 (서울)
   - 보안 규칙: `firestore.rules` 파일 배포됨

3. **Storage** 생성
   - 위치: asia-northeast3
   - 보안 규칙: `storage.rules` 파일 배포됨

4. **Hosting** 설정
   - Firebase Hosting 활성화

### GCP Console에서:

1. **Cloud Run API** 활성화
2. **Artifact Registry** 생성
   - 이름: `cloud-run`
   - 형식: Docker
   - 위치: asia-northeast3

3. **서비스 계정** 생성
   - Cloud Run Admin
   - Artifact Registry Writer
   - Firebase Admin

## 📊 Firebase 프로젝트 정보

- **Project Name**: project
- **Project ID**: project-4d38b
- **Project Number**: 229679006764
- **Region**: asia-northeast3 (서울)

## 📝 라이선스

MIT License
