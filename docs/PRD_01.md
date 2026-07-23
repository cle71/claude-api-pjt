# PRD_01: 냉장고 이미지 인식 시스템

## Purpose (목적)
사용자가 냉장고 사진을 업로드하면 OpenAI의 GPT-4 Turbo Vision 모델을 사용하여 냉장고 내 재료를 자동으로 인식하고 추출하는 기능을 제공합니다.

## Scope (범위)

### 포함 항목
- 이미지 업로드 API 개발
- OpenRouter를 통한 GPT-4 Turbo Vision 모델 연동
- 인식된 재료 데이터 추출 및 정규화
- 기본적인 이미지 유효성 검사
- 인식 결과 JSON 포맷 정의

### 제외 항목
- 이미지 저장소 (temporary processing 만 수행)
- 사용자 인증 (별도 단계)
- 이미지 편집/필터링 기능
- OCR 또는 바코드 인식

## Functional Requirements (기능 요구사항)

### FR-1: 이미지 업로드
- 최대 10MB 이하의 이미지 파일 수락
- 지원 형식: JPG, PNG, WebP
- 이미지 해상도 검증 (최소 640x480)
- 파일 타입 MIME 검증

### FR-2: 이미지 인식 처리
- GPT-4 Turbo Vision 모델을 사용하여 냉장고 사진 분석
- 이미지에서 다음 정보 추출:
  - 재료명 (한글/영문)
  - 수량 및 단위
  - 신선도 상태 (fresh, ripe, expired, unknown)
  - 카테고리 분류
  - 추정 유통기한 (가능한 경우)

### FR-3: 결과 데이터 정규화
- 추출된 재료 정보를 구조화된 JSON으로 변환
- 중복 재료 제거
- 신뢰도 점수 포함

### FR-4: 에러 처리
- 유효하지 않은 이미지 형식 거부
- API 호출 실패 시 재시도 로직 (최대 3회)
- 명확한 에러 메시지 제공

## Input/Output (입력/출력)

### Input
```
POST /api/v1/fridge/analyze
Content-Type: multipart/form-data

{
  "image": <binary file (JPG/PNG/WebP, max 10MB)>,
  "sessionId": "optional_string"
}
```

### Output - Success (200 OK)
```json
{
  "status": "success",
  "analysisId": "analysis_abc123xyz",
  "ingredients": [
    {
      "id": "ing_001",
      "name": "양파",
      "quantity": "3",
      "unit": "개",
      "category": "vegetable",
      "koreanName": "양파",
      "englishName": "onion",
      "condition": "fresh",
      "estimatedExpiry": "2026-08-23",
      "confidence": 0.95,
      "notes": ""
    },
    {
      "id": "ing_002",
      "name": "계란",
      "quantity": "6",
      "unit": "개",
      "category": "dairy",
      "koreanName": "계란",
      "englishName": "egg",
      "condition": "fresh",
      "estimatedExpiry": "2026-08-15",
      "confidence": 0.98,
      "notes": ""
    },
    {
      "id": "ing_003",
      "name": "당근",
      "quantity": "2",
      "unit": "개",
      "category": "vegetable",
      "koreanName": "당근",
      "englishName": "carrot",
      "condition": "fresh",
      "estimatedExpiry": "2026-08-20",
      "confidence": 0.92,
      "notes": "약간 시들어 보임"
    }
  ],
  "summary": {
    "totalItems": 3,
    "categories": {
      "vegetable": 2,
      "dairy": 1,
      "meat": 0,
      "seafood": 0,
      "condiment": 0,
      "other": 0
    },
    "averageConfidence": 0.95
  },
  "analysisTime": 2300,
  "timestamp": "2026-07-23T10:30:00Z"
}
```

### Output - Error (400/500)
```json
{
  "status": "error",
  "code": "INVALID_IMAGE_FORMAT",
  "message": "지원되지 않는 이미지 형식입니다. JPG, PNG, WebP만 지원됩니다.",
  "details": {
    "receivedFormat": "GIF",
    "maxSize": "10MB",
    "minResolution": "640x480"
  }
}
```

## Tech Stack (기술 스택)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **API Integration**: OpenRouter API
- **AI Model**: openai/gpt-4-turbo (Vision enabled)

### Libraries
- `multer` - 파일 업로드 처리
- `sharp` - 이미지 메타데이터 검증
- `axios` - HTTP 요청 (OpenRouter API 호출)
- `dotenv` - 환경 변수 관리
- `joi` - 입력값 검증

### Environment
```
OPENROUTER_API_KEY=sk_or_v1_...
API_BASE_URL=https://openrouter.ai/api/v1
IMAGE_MAX_SIZE=10485760  # 10MB in bytes
SUPPORTED_IMAGE_FORMATS=jpg,jpeg,png,webp
API_TIMEOUT=30000  # 30 seconds
```

## API Flow (API 흐름)

```
1. 클라이언트 → 이미지 파일 업로드 (multipart/form-data)
   ↓
2. Backend: 파일 유효성 검사
   - 파일 크기 확인
   - MIME 타입 확인
   - 이미지 메타데이터 검증
   ↓
3. Backend: 이미지를 Base64로 인코딩
   ↓
4. OpenRouter API 호출 (GPT-4 Turbo Vision)
   {
     "model": "openai/gpt-4-turbo",
     "messages": [
       {
         "role": "user",
         "content": [
           {
             "type": "text",
             "text": "냉장고 사진에 보이는 모든 재료와 식재료를 자세히 설명해줘. 각 항목에 대해 다음 정보를 포함해줘: 이름(한글), 이름(영문), 수량, 단위, 신선도(fresh/ripe/expired/unknown), 예상 유통기한, 카테고리(vegetable/fruit/dairy/meat/seafood/condiment/other). JSON 형식으로 답변해줘."
           },
           {
             "type": "image_url",
             "image_url": {
               "url": "data:image/jpeg;base64,..."
             }
           }
         ]
       }
     ]
   }
   ↓
5. OpenRouter 응답 처리
   - 응답 파싱
   - JSON 데이터 추출
   - 재료 정보 정규화
   ↓
6. 결과 데이터 정규화
   - 중복 제거
   - 신뢰도 점수 추가
   - 메타데이터 추가
   ↓
7. Backend → 클라이언트에 결과 반환 (JSON)
```

## Success Criteria (성공 기준)

### 기능 기준
- ✅ 이미지 업로드 API 정상 작동
- ✅ 지원되는 모든 이미지 형식(JPG, PNG, WebP) 처리 가능
- ✅ GPT-4 Turbo Vision 모델과의 연동 성공
- ✅ 인식된 재료 데이터를 올바른 JSON 형식으로 반환

### 성능 기준
- ✅ 평균 응답시간: 2~3초 이내
- ✅ 이미지 인식 정확도: 90% 이상 (사람 평가 기준)
- ✅ 동시 처리 가능 요청: 최소 10개
- ✅ API 가용성: 99.5% 이상

### 품질 기준
- ✅ 모든 예상 에러 케이스 처리 (400/500 에러)
- ✅ 재료 정보 필드 누락 없음
- ✅ 신뢰도 점수 포함 (0~1 범위)
- ✅ 중복 재료 제거 정상 작동

### 보안 기준
- ✅ 파일 타입 검증 (MIME type)
- ✅ 파일 크기 제한 준수
- ✅ API 키 환경 변수로 관리
- ✅ 입력값 Sanitization 적용

## Risks/Issues (리스크/이슈)

### 리스크 1: 이미지 인식 정확도 편차
- **설명**: 냉장고 상태(조명, 각도, 혼잡도)에 따라 인식 정확도가 크게 변동할 수 있음
- **영향도**: 높음 (사용자 만족도 직결)
- **대응 방안**:
  - 인식 신뢰도 점수를 클라이언트에 제공
  - 사용자에게 "다시 인식" 기능 제공
  - 최적의 촬영 가이드 제시

### 리스크 2: OpenRouter API 비용
- **설명**: GPT-4 Turbo Vision 모델 호출 시 비용 발생
- **영향도**: 중간 (요청량에 따라 변동)
- **대응 방안**:
  - 요청 캐싱 구현 (동일 이미지 재분석 방지)
  - 사용자별 일일 분석 한도 설정
  - 배치 처리로 API 호출 최적화

### 리스크 3: API 응답 지연
- **설명**: OpenRouter API 서버 지연으로 인한 타임아웃 가능성
- **영향도**: 중간 (사용자 경험 저하)
- **대응 방안**:
  - 재시도 로직 (exponential backoff)
  - 사용자에게 진행 상황 표시
  - 타임아웃 증가 (기본 30초)

### 리스크 4: 이미지 품질 저하
- **설명**: 압축된 이미지 또는 저해상도 이미지에서 인식 실패 가능
- **영향도**: 중간
- **대응 방안**:
  - 최소 해상도 요구사항 명시 (640x480)
  - 클라이언트에서 이미지 리사이징 안내
  - 에러 메시지에 권장사항 포함

### 이슈 1: 비표준 재료 이름
- **설명**: 지역 특산물이나 외국 식재료의 인식 실패 가능
- **해결책**: 사용자가 수동으로 재료 추가/수정 가능하도록 UI 제공

### 이슈 2: 임베딩 모델 미사용
- **참고**: `nvidia/nemotron-3-embed-1b:free`는 임베딩(벡터화) 전용 모델로 텍스트 생성 불가능
- **향후 활용**: PRD_02 진행 후 필요시 "레시피 검색/추천 유사도 매칭" 기능에서 별도 활용 가능
  - 사용자 선호도 학습 및 벡터화
  - 레시피 유사도 계산
  - 개인화 추천 시스템 구축

## 다음 단계
✅ PRD_01 완료 → PRD_02로 진행 (레시피 생성 시스템)
