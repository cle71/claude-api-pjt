# PRD_03: 사용자 프로필 및 레시피 저장 시스템

## Purpose (목적)
사용자 계정 관리 시스템을 구축하고, PRD_02에서 생성된 레시피를 사용자 프로필에 저장하여 개인화된 요리 포트폴리오를 제공합니다.

## Scope (범위)

### 포함 항목
- 사용자 인증 시스템 (회원가입, 로그인)
- 사용자 프로필 관리
- 레시피 저장/북마크 기능
- 저장된 레시피 조회
- 사용자 조리 이력 추적
- 개인 레시피 컬렉션 관리

### 제외 항목
- OAuth 소셜 로그인 (초기 단계)
- 사용자 간 공유 기능 (소셜 기능)
- 추천 알고리즘 (향후 개발)
- 사용자 통계 대시보드 (향후 개발)

## Functional Requirements (기능 요구사항)

### FR-1: 사용자 인증
- 이메일 기반 회원가입
- 비밀번호 기반 로그인/로그아웃
- JWT 토큰 기반 세션 관리
- 비밀번호 암호화 (bcrypt)
- 자동 로그인 유지 (토큰 갱신)

### FR-2: 사용자 프로필 관리
- 기본 정보: 이름, 이메일, 프로필 이미지
- 음식 선호도: 선호 요리 종류, 식단 제약사항
- 알레르기 정보 관리
- 프로필 수정 기능
- 계정 삭제 기능

### FR-3: 레시피 저장 기능
- 생성된 레시피 저장/북마크
- 저장된 레시피 목록 조회
- 저장된 레시피 상세 조회
- 저장된 레시피 삭제
- 레시피 평가 (별점 1~5점)
- 개인 노트 추가/수정

### FR-4: 레시피 컬렉션
- 커스텀 컬렉션 생성 (예: "주말 요리", "손님 대접")
- 레시피를 컬렉션에 추가/제거
- 컬렉션 수정/삭제
- 컬렉션별 레시피 조회

### FR-5: 조리 이력 관리
- "조리함" 표시 기능
- 조리 날짜 기록
- 조리 후기/평가 작성
- 조리 횟수 추적

### FR-6: 에러 처리
- 중복 이메일 거부
- 유효하지 않은 토큰 처리
- 비밀번호 불일치 처리
- 권한 없는 접근 거부

## Input/Output (입력/출력)

### 1. 회원가입 API

**Input**
```json
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Output - Success (201 Created)**
```json
{
  "status": "success",
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "user_abc123xyz",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-07-23T10:30:00Z"
  },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Output - Error (409)**
```json
{
  "status": "error",
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "이미 가입된 이메일입니다."
}
```

---

### 2. 로그인 API

**Input**
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Output - Success (200 OK)**
```json
{
  "status": "success",
  "message": "로그인 성공",
  "user": {
    "id": "user_abc123xyz",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileImage": null,
    "preferences": {
      "dietaryRestrictions": [],
      "allergens": [],
      "preferredCuisines": []
    }
  },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

---

### 3. 프로필 조회 API

**Input**
```
GET /api/v1/users/profile
Authorization: Bearer <accessToken>
```

**Output - Success (200 OK)**
```json
{
  "status": "success",
  "user": {
    "id": "user_abc123xyz",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileImage": "https://example.com/images/user_abc123xyz.jpg",
    "bio": "요리 애호가입니다",
    "preferences": {
      "dietaryRestrictions": ["vegetarian"],
      "allergens": ["shellfish", "peanuts"],
      "preferredCuisines": ["korean", "italian", "japanese"]
    },
    "statistics": {
      "totalSavedRecipes": 15,
      "totalCookedRecipes": 8,
      "totalCollections": 3,
      "favoriteRecipeId": "recipe_xyz789",
      "joinedDate": "2026-01-15T08:00:00Z"
    },
    "createdAt": "2026-01-15T08:00:00Z",
    "updatedAt": "2026-07-23T10:30:00Z"
  }
}
```

---

### 4. 프로필 수정 API

**Input**
```json
PUT /api/v1/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "음식과 요리를 사랑합니다",
  "preferences": {
    "dietaryRestrictions": ["vegetarian", "vegan"],
    "allergens": ["shellfish", "peanuts", "tree nuts"],
    "preferredCuisines": ["korean", "italian", "japanese", "thai"]
  }
}
```

**Output - Success (200 OK)**
```json
{
  "status": "success",
  "message": "프로필이 수정되었습니다.",
  "user": {
    "id": "user_abc123xyz",
    "firstName": "John",
    "lastName": "Smith",
    "bio": "음식과 요리를 사랑합니다",
    "preferences": {
      "dietaryRestrictions": ["vegetarian", "vegan"],
      "allergens": ["shellfish", "peanuts", "tree nuts"],
      "preferredCuisines": ["korean", "italian", "japanese", "thai"]
    },
    "updatedAt": "2026-07-23T10:35:00Z"
  }
}
```

---

### 5. 레시피 저장 API

**Input**
```json
POST /api/v1/users/recipes/save
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "recipeId": "recipe_001",
  "collectionId": "collection_abc123",
  "rating": 4.5,
  "notes": "가족이 정말 좋아했어요!"
}
```

**Output - Success (201 Created)**
```json
{
  "status": "success",
  "message": "레시피가 저장되었습니다.",
  "savedRecipe": {
    "id": "saved_rec_001",
    "userId": "user_abc123xyz",
    "recipeId": "recipe_001",
    "collectionId": "collection_abc123",
    "rating": 4.5,
    "notes": "가족이 정말 좋아했어요!",
    "savedAt": "2026-07-23T10:40:00Z",
    "cooked": false,
    "cookedCount": 0
  }
}
```

---

### 6. 저장된 레시피 목록 조회 API

**Input**
```
GET /api/v1/users/recipes/saved?collectionId=collection_abc123&page=1&limit=10
Authorization: Bearer <accessToken>
```

**Output - Success (200 OK)**
```json
{
  "status": "success",
  "recipes": [
    {
      "id": "saved_rec_001",
      "recipe": {
        "id": "recipe_001",
        "name": "야채 계란볶음",
        "nameEn": "Vegetable Egg Stir-fry",
        "cookingTime": 15,
        "difficulty": "easy",
        "cuisineType": "korean",
        "ingredients": [
          { "name": "계란", "quantity": "3", "unit": "개" },
          { "name": "양파", "quantity": "0.5", "unit": "개" }
        ],
        "nutrition": {
          "calories": 250,
          "protein": "15g",
          "carbs": "20g",
          "fat": "8g"
        }
      },
      "rating": 4.5,
      "notes": "가족이 정말 좋아했어요!",
      "savedAt": "2026-07-23T10:40:00Z",
      "cooked": false,
      "cookedCount": 0,
      "lastCookedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### 7. 컬렉션 생성 API

**Input**
```json
POST /api/v1/users/collections
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "주말 특별 요리",
  "description": "손님을 초대할 때 만들 레시피",
  "color": "#FF6B6B"
}
```

**Output - Success (201 Created)**
```json
{
  "status": "success",
  "message": "컬렉션이 생성되었습니다.",
  "collection": {
    "id": "collection_abc123",
    "userId": "user_abc123xyz",
    "name": "주말 특별 요리",
    "description": "손님을 초대할 때 만들 레시피",
    "color": "#FF6B6B",
    "recipeCount": 0,
    "createdAt": "2026-07-23T10:45:00Z"
  }
}
```

---

### 8. 조리 이력 기록 API

**Input**
```json
POST /api/v1/users/cooking-history
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "savedRecipeId": "saved_rec_001",
  "rating": 4.5,
  "notes": "맛있게 잘 만들어졌어요. 다음에는 파를 더 많이 넣으면 좋을 것 같아요.",
  "servings": 4,
  "actualCookingTime": 20
}
```

**Output - Success (201 Created)**
```json
{
  "status": "success",
  "message": "조리 이력이 기록되었습니다.",
  "history": {
    "id": "history_xyz789",
    "userId": "user_abc123xyz",
    "savedRecipeId": "saved_rec_001",
    "rating": 4.5,
    "notes": "맛있게 잘 만들어졌어요. 다음에는 파를 더 많이 넣으면 좋을 것 같아요.",
    "servings": 4,
    "actualCookingTime": 20,
    "cookedAt": "2026-07-23T19:00:00Z"
  }
}
```

## Tech Stack (기술 스택)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL / Supabase
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcryptjs

### Libraries
- `jsonwebtoken` (v9.0+) - JWT 토큰 생성/검증
- `bcryptjs` (v2.4+) - 비밀번호 해싱
- `joi` (v17.0+) - 입력 검증
- `pg` (v8.0+) - PostgreSQL 드라이버
- `dotenv` - 환경 변수 관리

### Database
- **RDBMS**: PostgreSQL 13+
- **ORM**: Raw SQL (또는 Sequelize/TypeORM)
- **Migrations**: Database migration tool

### Environment
```
DATABASE_URL=postgresql://user:password@localhost:5432/fridge_db
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_ACCESS_EXPIRY=86400  # 24 hours
JWT_REFRESH_EXPIRY=604800  # 7 days
BCRYPT_ROUNDS=10
```

## API Flow (API 흐름)

### 회원가입 & 레시피 저장 흐름
```
1. 사용자 회원가입 요청
   POST /api/v1/auth/signup
   {email, password, firstName, lastName}
   ↓
2. Backend: 이메일 중복 확인
   ↓
3. Backend: 비밀번호 bcrypt로 해싱
   ↓
4. Database: users 테이블에 사용자 저장
   ↓
5. JWT 토큰 생성 (accessToken, refreshToken)
   ↓
6. 클라이언트에 토큰 반환
   ↓
7. 사용자가 냉장고 사진 분석 (PRD_01)
   ↓
8. 레시피 생성 (PRD_02)
   ↓
9. 사용자가 마음에 드는 레시피 저장 요청
   POST /api/v1/users/recipes/save
   Authorization: Bearer <accessToken>
   {recipeId, collectionId, rating, notes}
   ↓
10. Backend: accessToken 검증
    ↓
11. Backend: 사용자 인증 확인
    ↓
12. Database: saved_recipes 테이블에 저장
    ↓
13. 클라이언트에 저장 완료 응답
    ↓
14. 사용자 프로필에서 저장된 레시피 조회 가능
    GET /api/v1/users/recipes/saved
```

### 토큰 갱신 흐름
```
1. accessToken 만료
   ↓
2. 클라이언트가 refreshToken 제출
   POST /api/v1/auth/refresh
   {refreshToken}
   ↓
3. Backend: refreshToken 검증
   ↓
4. 새로운 accessToken 발급
   ↓
5. 자동 로그인 유지
```

## Success Criteria (성공 기준)

### 기능 기준
- ✅ 회원가입/로그인 정상 작동
- ✅ JWT 기반 인증 완전 구현
- ✅ 레시피 저장/조회 기능 정상
- ✅ 컬렉션 생성/관리 기능 정상
- ✅ 조리 이력 기록 기능 정상
- ✅ 프로필 수정 기능 정상

### 보안 기준
- ✅ 비밀번호 bcrypt로 안전히 해싱 (rounds: 10)
- ✅ JWT 토큰 서명 검증
- ✅ 토큰 만료 시간 설정 (accessToken: 24h, refreshToken: 7d)
- ✅ HTTPS 사용 (프로덕션)
- ✅ CORS 설정 정확함
- ✅ SQL Injection 방지
- ✅ 권한 검증 (다른 사용자 데이터 접근 불가)

### 성능 기준
- ✅ 회원가입 응답시간: 1~2초 이내
- ✅ 로그인 응답시간: 0.5초 이내
- ✅ 레시피 저장 응답시간: 0.5초 이내
- ✅ 레시피 조회 응답시간: 0.5~1초 이내 (페이지네이션)
- ✅ 동시 사용자 처리: 최소 100명

### 품질 기준
- ✅ 모든 입력값 유효성 검증 (email, password 등)
- ✅ 에러 메시지 명확하고 사용자 친화적
- ✅ 데이터베이스 인덱싱으로 쿼리 최적화
- ✅ 트랜잭션 처리 (데이터 무결성)

## Risks/Issues (리스크/이슈)

### 리스크 1: 비밀번호 보안
- **설명**: 약한 비밀번호로 인한 계정 탈취 위험
- **영향도**: 높음
- **대응 방안**:
  - 비밀번호 강도 검증 (최소 8자, 대/소문자, 숫자, 특수문자)
  - "비밀번호 요구사항" 클라이언트에 명시
  - 로그인 실패 횟수 제한 (5회 이상 시 30분 잠금)

### 리스크 2: JWT 토큰 탈취
- **설명**: 토큰이 탈취되면 계정 접근 가능
- **영향도**: 높음
- **대응 방안**:
  - HTTPS 필수 (전송 중 암호화)
  - 토큰 HTTP-only 쿠키에 저장 (XSS 방지)
  - 짧은 accessToken 만료시간 (24시간)
  - 토큰 블랙리스트 (로그아웃 시)

### 리스크 3: 데이터 유출
- **설명**: 사용자 개인정보가 데이터베이스에서 유출될 수 있음
- **영향도**: 높음
- **대응 방안**:
  - 데이터베이스 암호화
  - 접근 제어 (최소 권한 원칙)
  - 정기적인 보안 감사
  - GDPR/개인정보보호법 준수

### 리스크 4: 동시성 문제
- **설명**: 동시에 같은 리소스를 수정할 경우 충돌 가능
- **영향도**: 중간
- **대응 방안**:
  - 트랜잭션 처리
  - 낙관적/비관적 락 구현
  - 버전 관리 (optimistic locking)

### 리스크 5: 데이터베이스 연결 풀 고갈
- **설명**: 많은 동시 요청으로 DB 연결 부족 가능
- **영향도**: 중간
- **대응 방안**:
  - 연결 풀 크기 최적화 (기본 20, 최대 50)
  - 쿼리 최적화
  - 캐싱 전략 (Redis)
  - 모니터링 및 알림

### 이슈 1: 이메일 검증 부재
- **설명**: 회원가입 시 이메일 소유권 검증 없음
- **해결책**: 이메일 인증 링크 발송 (추후 단계)
- **현재 단계**: 선택적 구현

### 이슈 2: 소셜 로그인 미지원
- **설명**: Google, GitHub 등 OAuth 로그인 불가
- **향후 지원**: 2단계 개발 후 추가
- **현재**: 이메일/비밀번호 로그인만 지원

### 이슈 3: 프로필 이미지 저장 미지원
- **설명**: 프로필 사진 업로드 기능 초기 단계에서 제외
- **향후 지원**: 클라우드 스토리지(S3) 연동 후 추가
- **현재**: 이미지 URL만 지원

## 데이터베이스 스키마

```sql
-- Users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_image VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- User Preferences 테이블
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  preferred_cuisines TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe Collections 테이블
CREATE TABLE recipe_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Recipes 테이블
CREATE TABLE saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id VARCHAR(255) NOT NULL,
  collection_id UUID REFERENCES recipe_collections(id) ON DELETE SET NULL,
  rating DECIMAL(2,1),
  notes TEXT,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cooking History 테이블
CREATE TABLE cooking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  saved_recipe_id UUID REFERENCES saved_recipes(id) ON DELETE CASCADE,
  rating DECIMAL(2,1),
  notes TEXT,
  servings INT,
  actual_cooking_time INT,
  cooked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX idx_saved_recipes_collection_id ON saved_recipes(collection_id);
CREATE INDEX idx_cooking_history_user_id ON cooking_history(user_id);
CREATE INDEX idx_recipe_collections_user_id ON recipe_collections(user_id);
```

## 다음 단계
✅ PRD_03 완료 → 전체 시스템 통합 및 개발 시작

---

## 전체 workflow 완성

```
┌─────────────────────────────────────────────────────────────────┐
│                    냉장고 AI 레시피 추천 시스템                     │
└─────────────────────────────────────────────────────────────────┘

1. 사용자 가입
   POST /api/v1/auth/signup
   ↓
2. 냉장고 사진 촬영 및 업로드 (PRD_01)
   POST /api/v1/fridge/analyze
   ↓
3. AI가 재료 자동 인식
   (openai/gpt-4-turbo Vision)
   ↓
4. 레시피 생성 (PRD_02)
   POST /api/v1/recipes/generate
   ↓
5. AI가 맞춤형 레시피 5개 생성
   (openai/gpt-4-turbo)
   ↓
6. 마음에 드는 레시피 저장 (PRD_03)
   POST /api/v1/users/recipes/save
   ↓
7. 프로필에서 저장된 레시피 관리
   GET /api/v1/users/recipes/saved
   ↓
8. 실제 요리 후 이력 기록
   POST /api/v1/users/cooking-history
   ↓
9. 개인 요리 포트폴리오 완성 ✅
```
