# PRD_02: AI 기반 레시피 생성 시스템

## Purpose (목적)
PRD_01에서 인식된 냉장고 재료 목록을 기반으로 OpenAI의 GPT-4 Turbo 모델을 사용하여 사용자가 만들 수 있는 맞춤형 레시피를 자동 생성합니다.

## Scope (범위)

### 포함 항목
- 재료 목록 기반 레시피 생성 API 개발
- OpenRouter를 통한 GPT-4 Turbo 모델 연동
- 사용자 선호도/제약사항 반영
- 조리시간, 난이도, 영양정보 포함
- 단계별 조리법 생성
- 레시피 필터링 및 정렬

### 제외 항목
- 레시피 데이터베이스 구축 (AI 생성 기반)
- 이미지 생성
- 동영상 튜토리얼
- 사용자 평점/리뷰 시스템 (PRD_03에서 처리)

## Functional Requirements (기능 요구사항)

### FR-1: 재료 기반 레시피 생성
- 입력받은 재료 목록을 기반으로 3~5개의 레시피 제시
- 현재 보유한 재료로만 만들 수 있는 레시피 우선 표시
- 추가 재료가 필요한 경우 명시

### FR-2: 개인화된 레시피 생성
- 사용자 식단 제약사항 반영 (채식, 글루텐 프리 등)
- 알레르기 정보 기반 필터링
- 선호 요리 종류 반영
- 조리시간 제한 적용

### FR-3: 레시피 정보 포함
- 레시피명 (한글/영문)
- 설명 (한두 줄)
- 조리시간 (분 단위)
- 준비시간
- 난이도 (easy/medium/hard)
- 음식 카테고리 (한식/중식/이탈리안 등)
- 재료 목록 (필수/선택)
- 단계별 조리법 (10~15단계)
- 영양정보 (칼로리, 단백질, 탄수화물, 지방)
- 조리 팁 및 주의사항

### FR-4: 레시피 필터링
- 조리시간으로 필터링
- 난이도로 필터링
- 식단 제약사항으로 필터링
- 카테고리별 정렬

### FR-5: 에러 처리
- 빈 재료 목록 거부
- API 호출 실패 시 재시도
- 생성 불가능한 레시피 조건 안내

## Input/Output (입력/출력)

### Input
```
POST /api/v1/recipes/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "analysisId": "analysis_abc123xyz",
  "ingredients": [
    {
      "id": "ing_001",
      "name": "양파",
      "quantity": "3",
      "unit": "개",
      "category": "vegetable"
    },
    {
      "id": "ing_002",
      "name": "계란",
      "quantity": "6",
      "unit": "개",
      "category": "dairy"
    },
    {
      "id": "ing_003",
      "name": "당근",
      "quantity": "2",
      "unit": "개",
      "category": "vegetable"
    }
  ],
  "preferences": {
    "dietaryRestrictions": [],
    "allergens": [],
    "cookingTimeLimit": 60,
    "difficultyLevel": "medium",
    "cuisineType": [],
    "recipeCount": 5
  }
}
```

### Output - Success (200 OK)
```json
{
  "status": "success",
  "generationId": "gen_xyz789abc",
  "recipes": [
    {
      "id": "recipe_001",
      "name": "야채 계란볶음",
      "nameEn": "Vegetable Egg Stir-fry",
      "description": "신선한 야채와 계란으로 만든 간편하고 영양 많은 한끼 요리",
      "cookingTime": 15,
      "prepTime": 5,
      "totalTime": 20,
      "servings": 2,
      "difficulty": "easy",
      "cuisineType": "korean",
      "ingredients": [
        {
          "name": "계란",
          "quantity": "3",
          "unit": "개",
          "required": true,
          "available": true
        },
        {
          "name": "양파",
          "quantity": "0.5",
          "unit": "개",
          "required": true,
          "available": true
        },
        {
          "name": "당근",
          "quantity": "0.5",
          "unit": "개",
          "required": true,
          "available": true
        },
        {
          "name": "파",
          "quantity": "한줌",
          "unit": "g",
          "required": false,
          "available": false
        },
        {
          "name": "소금",
          "quantity": "1",
          "unit": "스푼",
          "required": true,
          "available": false
        }
      ],
      "instructions": [
        {
          "step": 1,
          "title": "준비",
          "description": "계란을 그릇에 풀어 간을 맞춘다. 양파와 당근을 깍둑썬다.",
          "duration": 3,
          "tips": ["신선한 계란을 사용할 것"]
        },
        {
          "step": 2,
          "title": "팬 준비",
          "description": "팬에 기름을 두르고 중불로 데운다.",
          "duration": 2,
          "tips": []
        },
        {
          "step": 3,
          "title": "야채 볶기",
          "description": "양파와 당근을 먼저 2분간 볶는다.",
          "duration": 2,
          "tips": ["야채가 투명해질 때까지"]
        },
        {
          "step": 4,
          "title": "계란 붓기",
          "description": "풀어놓은 계란을 팬에 붓고 골고루 섞어가며 볶는다.",
          "duration": 5,
          "tips": ["계란이 완전히 익을 때까지 계속 저으면서 볶을 것"]
        },
        {
          "step": 5,
          "title": "마무리",
          "description": "마지막에 파를 뿌리고 한 번 더 섞은 후 불을 끈다.",
          "duration": 3,
          "tips": ["파가 너무 오래 가열되지 않도록 주의"]
        }
      ],
      "nutrition": {
        "calories": 250,
        "caloriesUnit": "kcal",
        "protein": "15",
        "proteinUnit": "g",
        "carbs": "20",
        "carbsUnit": "g",
        "fat": "8",
        "fatUnit": "g",
        "fiber": "3",
        "fiberUnit": "g"
      },
      "tags": ["quick", "easy", "korean", "vegetarian", "healthy"],
      "vegetarian": true,
      "vegan": false,
      "glutenFree": true,
      "dairyFree": false,
      "allergens": ["egg"],
      "ingredientsCoverage": 0.80,
      "coveragePercentage": "80%",
      "tips": [
        "팬에 기름의 양을 조절하여 기름진 맛을 줄일 수 있습니다",
        "야채를 미리 준비해두면 조리가 더 빨라집니다"
      ]
    },
    {
      "id": "recipe_002",
      "name": "계란 계란밥",
      "nameEn": "Egg Fried Rice",
      "description": "계란과 야채로 만든 황금빛 계란밥",
      "cookingTime": 10,
      "prepTime": 5,
      "totalTime": 15,
      "servings": 2,
      "difficulty": "easy",
      "cuisineType": "asian",
      "ingredients": [
        {
          "name": "계란",
          "quantity": "2",
          "unit": "개",
          "required": true,
          "available": true
        },
        {
          "name": "밥",
          "quantity": "2",
          "unit": "공기",
          "required": true,
          "available": false
        },
        {
          "name": "당근",
          "quantity": "1",
          "unit": "개",
          "required": false,
          "available": true
        },
        {
          "name": "양파",
          "quantity": "0.5",
          "unit": "개",
          "required": false,
          "available": true
        }
      ],
      "instructions": [
        {
          "step": 1,
          "title": "계란 준비",
          "description": "계란을 풀어 소금으로 간을 맞춘다",
          "duration": 2,
          "tips": []
        },
        {
          "step": 2,
          "title": "야채 준비",
          "description": "당근과 양파를 깍둑썬다",
          "duration": 3,
          "tips": []
        },
        {
          "step": 3,
          "title": "계란 스크램블",
          "description": "팬에 기름을 두르고 계란을 붓아 반쯤 익힌 후 꺼낸다",
          "duration": 2,
          "tips": []
        },
        {
          "step": 4,
          "title": "밥 볶기",
          "description": "팬에 밥과 야채를 넣고 3분 정도 볶는다",
          "duration": 3,
          "tips": []
        }
      ],
      "nutrition": {
        "calories": 320,
        "caloriesUnit": "kcal",
        "protein": "10",
        "proteinUnit": "g",
        "carbs": "45",
        "carbsUnit": "g",
        "fat": "10",
        "fatUnit": "g"
      },
      "tags": ["quick", "easy", "asian", "vegetarian"],
      "vegetarian": true,
      "vegan": false,
      "glutenFree": true,
      "dairyFree": false,
      "allergens": ["egg"],
      "ingredientsCoverage": 0.60,
      "coveragePercentage": "60%"
    }
  ],
  "summary": {
    "totalRecipes": 5,
    "generatedAt": "2026-07-23T10:35:00Z",
    "processingTime": 8500,
    "averageIngredientsCoverage": 0.73,
    "recipes": [
      { "name": "야채 계란볶음", "coverage": 0.80 },
      { "name": "계란 계란밥", "coverage": 0.60 },
      { "name": "계란 토스트", "coverage": 0.70 },
      { "name": "양파수프", "coverage": 0.75 },
      { "name": "당근 계란볶음", "coverage": 0.78 }
    ]
  }
}
```

### Output - Error (400/500)
```json
{
  "status": "error",
  "code": "INVALID_INGREDIENTS",
  "message": "제공된 재료로는 적합한 레시피를 생성할 수 없습니다.",
  "details": {
    "reason": "최소 2개 이상의 재료가 필요합니다",
    "minIngredientsRequired": 2,
    "ingredientsProvided": 1
  }
}
```

## Tech Stack (기술 스택)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **AI Model**: openai/gpt-4-turbo (text generation)
- **API Integration**: OpenRouter API

### Libraries
- `axios` - HTTP 요청 (OpenRouter API 호출)
- `joi` - 입력값 검증
- `lodash` - 데이터 변환 및 유틸리티
- `dotenv` - 환경 변수 관리

### Environment
```
OPENROUTER_API_KEY=sk_or_v1_...
GPT4_MODEL=openai/gpt-4-turbo
RECIPE_GENERATION_TIMEOUT=30000  # 30초
MAX_RECIPES_PER_REQUEST=5
CACHE_TTL=3600  # 1시간 (동일 재료 조합 캐싱)
```

## API Flow (API 흐름)

```
1. 클라이언트 → 재료 목록 및 사용자 선호도 전송
   ↓
2. Backend: 입력값 검증
   - 재료 최소 개수 확인 (2개 이상)
   - 선호도 형식 검증
   - 캐시 확인 (동일 조건 기존 결과 있는지)
   ↓
3. 캐시 미스 → OpenRouter API 호출 (GPT-4 Turbo)
   
   요청 프롬프트:
   "다음 재료로 만들 수 있는 5개의 레시피를 생성해줘:
    - 양파 3개
    - 계란 6개
    - 당근 2개
    
    조건:
    - 조리시간 60분 이내
    - 난이도: 중간 수준
    - 채식 요리
    - 알레르기 없음
    
    각 레시피에 다음 정보를 포함해줘:
    1. 레시피명 (한글/영문)
    2. 설명
    3. 조리시간/준비시간
    4. 난이도
    5. 요리 카테고리
    6. 재료 목록 (필수/선택)
    7. 단계별 조리법 (최소 5단계)
    8. 영양정보
    9. 팁
    
    JSON 형식으로 답변해줘."
   ↓
4. OpenRouter 응답 수신 및 파싱
   ↓
5. 응답 데이터 정규화
   - JSON 데이터 추출
   - 재료 가용성 계산 (ingredientsCoverage)
   - 태그 추가
   - 영양정보 검증
   ↓
6. 결과 캐싱 (TTL: 1시간)
   ↓
7. Backend → 클라이언트에 결과 반환 (JSON)
```

## Success Criteria (성공 기준)

### 기능 기준
- ✅ 레시피 생성 API 정상 작동
- ✅ 입력받은 재료로 3~5개 레시피 생성
- ✅ 사용자 선호도/제약사항 반영 (채식, 알레르기 등)
- ✅ 조리시간 제한 준수
- ✅ 모든 필수 레시피 정보 포함 (재료, 조리법, 영양정보)
- ✅ 단계별 조리법이 명확하고 따라하기 쉬움

### 성능 기준
- ✅ 평균 응답시간: 5~10초 이내
- ✅ 동시 처리 가능 요청: 최소 5개
- ✅ 캐시 히트율: 30% 이상 (반복 요청에서)
- ✅ API 가용성: 99% 이상

### 품질 기준
- ✅ 생성된 레시피가 실현 가능함 (요리사가 검증)
- ✅ 단계별 조리법이 5단계 이상
- ✅ 조리시간 추정이 합리적 (±5분)
- ✅ 재료 가용성(coverage) 정확히 계산
- ✅ 알레르기 정보 정확히 반영

### 보안/안정성 기준
- ✅ 입력값 유효성 검증
- ✅ API 호출 실패 시 재시도 로직 작동
- ✅ 타임아웃 처리 정상 작동
- ✅ 에러 메시지 명확하고 사용자 친화적

## Risks/Issues (리스크/이슈)

### 리스크 1: API 응답 품질 불안정성
- **설명**: GPT-4 Turbo 생성 결과가 항상 구조화된 JSON이 아닐 수 있음
- **영향도**: 높음 (사용자 경험 저하)
- **대응 방안**:
  - 프롬프트 최적화 (명확한 지시사항)
  - JSON 파싱 재시도 로직 (최대 2회)
  - 파싱 실패 시 예쁜 에러 메시지 제공
  - 생성된 JSON 스키마 검증

### 리스크 2: 생성된 레시피 신뢰도
- **설명**: AI가 생성한 레시피가 항상 실제로 만들 수 있는지 보장 불가
- **영향도**: 높음 (사용자 만족도 직결)
- **대응 방안**:
  - 신뢰도 점수 추가 (AI 생성 신뢰도)
  - 사용자 피드백 수집 (실제 조리 가능 여부)
  - 자주 실패하는 레시피 필터링
  - 추후 사람이 검증한 레시피 데이터베이스 도입

### 리스크 3: 알레르기 정보 누락
- **설명**: AI가 모든 알레르기 성분을 놓칠 수 있음
- **영향도**: 매우 높음 (사용자 안전 관련)
- **대응 방안**:
  - 알레르기 관련 경고 메시지 명시
  - 사용자 입력 알레르기 목록 2회 검증
  - "음식 알레르기 있으신가요?" 체크포인트 추가
  - 법적 고지사항 추가 (AI 생성 정보, 전문가 상담 권장)

### 리스크 4: OpenRouter API 비용 증가
- **설명**: 높은 요청 볼륨에서 API 호출 비용 급증
- **영향도**: 중간 (사업 지속가능성)
- **대응 방안**:
  - 캐싱 전략 (동일 조건 결과 재사용)
  - 사용자별 일일 생성 한도 설정
  - 배치 처리로 비용 절감
  - 추후 캐시된 레시피 기반 검색 시스템으로 전환

### 리스크 5: 조리시간 추정 오차
- **설명**: AI의 조리시간 추정이 실제와 다를 수 있음
- **영향도**: 낮음~중간
- **대응 방안**:
  - 사용자에게 예상 시간임을 명시
  - "실제 조리시간" 필드에서 사용자 입력 수집
  - 통계 기반으로 시간 보정

### 이슈 1: 임베딩 모델(nvidia/nemotron-3-embed-1b:free) 미사용
- **참고**: 초기 단계에서는 GPT-4 Turbo만 사용하여 레시피 생성
- **임베딩 모델 미포함 이유**: 이 모델은 텍스트 생성 불가능, 벡터 임베딩 전용
- **향후 활용 계획**:
  - 사용자 선호도 및 요리 이력을 벡터로 임베딩
  - "유사한 레시피 추천" 기능에서 코사인 유사도 계산
  - 개인화된 레시피 재정렬 및 필터링
  - 레시피 데이터베이스 구축 후 벡터 검색으로 초기 후보 선정

### 이슈 2: 레시피 데이터베이스 부재
- **설명**: 현재는 AI가 매번 새로 생성하므로 검증된 레시피 보관 불가
- **해결책**: 사용자 피드백과 함께 우수 레시피 저장
- **추후 개선**: 벡터 유사도 기반으로 기존 레시피 활용

## 다음 단계
✅ PRD_02 완료 → PRD_03으로 진행 (사용자 프로필 및 레시피 저장)
