# 🚀 Vercel Deployment Guide

이 문서는 claude-api-pjt를 Vercel 서버리스 환경에 배포하는 방법을 설명합니다.

---

## 📋 Prerequisites

- [Vercel 계정](https://vercel.com/signup) (무료)
- GitHub 계정과 이 저장소의 fork 또는 copy
- OpenRouter API Key

---

## 🔧 설정 구조

Vercel 배포를 위해 다음 파일들이 추가되었습니다:

```
claude-api-pjt/
├── api/
│   └── index.js          # Vercel 서버리스 handler
├── src/
│   └── server.js         # Express app (수정됨)
├── vercel.json           # Vercel 설정 파일
├── package.json          # npm scripts 추가됨
└── README.md             # 배포 가이드 추가됨
```

### 파일별 설명

**vercel.json**
- 빌드 설정
- 라우팅 규칙
- 환경 변수 관리
- 함수 메모리 및 시간초과 설정

**api/index.js**
- Vercel 서버리스 함수 진입점
- Express app을 모듈로 export

**src/server.js (수정)**
- `app.listen()` → 조건부 실행 (개발 환경만)
- `module.exports = app` 유지

---

## 📤 배포 방법

### 방법 1: GitHub + Vercel 자동 배포 (추천)

**가장 간단하고 추천되는 방법입니다.**

1. **GitHub 저장소 확인**
   ```bash
   git remote -v
   # origin https://github.com/cle71/claude-api-pjt.git (fetch)
   ```

2. **Vercel에서 프로젝트 생성**
   - https://vercel.com/new 방문
   - "Import Git Repository"
   - GitHub 저장소 검색 및 선택
   - 프로젝트 이름 확인 (기본값: `claude-api-pjt`)

3. **환경 변수 설정**
   - **Environment Variables** 섹션에서:
     ```
     OPENROUTER_API_KEY = sk-or-v1-xxxxxxxxxxxxx
     NODE_ENV = production
     ```
   - "Add" 클릭

4. **배포**
   - "Deploy" 클릭
   - 배포 완료 대기 (약 1-2분)

5. **결과**
   - 배포 URL 확인: `https://claude-api-pjt-xxxxx.vercel.app`

---

### 방법 2: Vercel CLI를 사용한 배포

로컬에서 Vercel CLI를 사용하여 배포할 수 있습니다.

1. **Vercel CLI 설치**
   ```bash
   npm install -g vercel
   ```

2. **로그인**
   ```bash
   vercel login
   ```

3. **배포**
   ```bash
   cd claude-api-pjt
   vercel --prod
   ```

4. **환경 변수 설정**
   - CLI 프롬프트에서 설정하거나
   - Vercel 대시보드에서 수동 설정

---

## 🔐 환경 변수 관리

### Vercel 대시보드에서 설정

1. Vercel 대시보드 방문
2. 프로젝트 선택 → Settings
3. Environment Variables
4. 필요한 변수 추가:
   ```
   OPENROUTER_API_KEY = your_api_key_here
   NODE_ENV = production
   ```

### 변수 목록

| 변수 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API 키 | `sk-or-v1-...` |
| `NODE_ENV` | ❌ | 환경 (자동 production) | `production` |
| `API_PORT` | ❌ | 포트 (무시됨) | `3000` |

---

## ✅ 배포 후 확인

### 1. 헬스 체크
```bash
curl https://your-project.vercel.app/health

# 응답 예시:
# {"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}
```

### 2. 이미지 분석 테스트

Vercel 대시보드에서:
- Settings → Function Logs 확인
- 또는 로컬에서:
  ```bash
  curl -X POST https://your-project.vercel.app/api/v1/fridge/analyze-base64 \
    -H "Content-Type: application/json" \
    -d '{
      "imageBase64": "iVBORw0KGgo...",
      "mimeType": "image/png"
    }'
  ```

### 3. 웹 UI 확인
- https://your-project.vercel.app 방문
- 이미지 업로드 및 분석 테스트

---

## 🐛 트러블슈팅

### 배포 실패

**문제**: 빌드 실패
```
Error: Cannot find module 'express'
```

**해결책**:
```bash
# 로컬에서 확인
npm install
npm run vercel-build

# 또는 Vercel 대시보드에서 rebuild
```

---

### API 호출 실패

**문제**: 502 Bad Gateway
```
{"message":"502: Bad Gateway"}
```

**원인**: 
- OpenRouter API Key 설정 안 됨
- 함수 타임아웃 (60초)
- 메모리 부족

**해결책**:
1. 환경 변수 확인: Vercel Settings → Environment Variables
2. Logs 확인: Deployments → Logs
3. 로컬에서 테스트:
   ```bash
   npm start
   curl http://localhost:3000/health
   ```

---

### 느린 응답

**문제**: API 응답이 느림
```
Analysis took 45 seconds...
```

**원인**: 
- OpenRouter 무료 모델 느림
- 이미지 크기 큼
- 동시 요청 많음

**해결책**:
- 이미지 크기 줄이기 (< 5MB)
- 타임아웃 증가: `vercel.json`에서 `maxDuration` 변경
- 유료 모델로 업그레이드

---

### CORS 오류

**문제**: 브라우저에서 CORS 오류
```
Access to XMLHttpRequest blocked by CORS policy
```

**해결책**:
- vercel.json의 routes 확인
- src/server.js의 cors() 미들웨어 확인

---

## 📊 성능 최적화

### 1. 콜드 스타트 최소화
```json
// vercel.json
{
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### 2. 이미지 최적화
- 최대 크기: 10MB
- 권장 크기: 2-5MB
- 형식: PNG, JPEG, WebP

### 3. 타임아웃 관리
- 기본값: 60초
- OpenRouter: 5-6초
- 버퍼: 10초

---

## 🔄 CI/CD 파이프라인

### 자동 배포 설정

**GitHub에 Push → Vercel 자동 배포**

설정 방법:
1. Vercel 대시보드 → Settings
2. Git → Production Branch = `main`
3. Preview Deployments 활성화

이제 모든 push가 자동으로 배포됩니다:
- `main` 브랜치 → 프로덕션 배포
- 다른 브랜치 → Preview 배포

---

## 📈 모니터링

### Vercel 대시보드 확인 사항

1. **Deployments**
   - 배포 상태
   - 배포 시간
   - 로그

2. **Function Logs**
   - API 호출 로그
   - 에러 메시지
   - 응답 시간

3. **Analytics**
   - 요청 수
   - 에러율
   - 응답 시간

---

## 💰 비용

### Vercel 무료 플랜
- 월 100GB 대역폭
- 월 100만 함수 실행
- 자동 SSL
- 무제한 배포

### 필요시 유료 업그레이드
- Pro: 월 $20
- Enterprise: 맞춤 요금

---

## 🚀 다음 단계

1. **모니터링 추가**
   - Sentry 연동
   - LogRocket 통합

2. **캐싱 최적화**
   - 분석 결과 캐싱
   - Redis 연동

3. **스케일링**
   - 데이터베이스 추가
   - API 레이트 리미팅

4. **보안**
   - JWT 인증 (Phase 3)
   - API 키 로테이션

---

## 📚 추가 리소스

- [Vercel Docs](https://vercel.com/docs)
- [Node.js on Vercel](https://vercel.com/docs/platforms/nodejs)
- [Express on Vercel](https://github.com/vercel/examples/tree/main/nodejs/express)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ❓ FAQ

**Q: 왜 Vercel을 사용하나요?**
A: 무료이고, 배포가 쉽고, 자동 스케일링이 되며, Express와 호환됩니다.

**Q: 로컬에서는 어떻게 실행하나요?**
A: `npm start` - 로컬에서는 express server.js가 실행됩니다.

**Q: 데이터베이스를 추가할 수 있나요?**
A: 네, Phase 3에서 PostgreSQL 또는 Supabase를 추가할 예정입니다.

**Q: 커스텀 도메인을 사용할 수 있나요?**
A: 네, Vercel Settings에서 도메인을 추가할 수 있습니다.

---

**배포 성공을 기원합니다! 🎉**

질문이 있으면 GitHub Issues를 열어주세요.
