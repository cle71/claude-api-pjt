# CLAUDE.md

## Project Overview

**claude-api-pjt** is an AI-powered smart refrigerator management system (MVP Stage).

### 📊 Current Status: Phase 1 Complete ✅
- **Phase 1 (PRD_01)**: Image recognition system - COMPLETE ✅
- **Phase 2 (PRD_02)**: Recipe generation - PLANNED
- **Phase 3 (PRD_03)**: User profile & recipe saving - PLANNED

The system uses AI vision models to automatically recognize refrigerator contents from photos and suggest recipes based on available ingredients.

## Common Commands

### Development
```bash
npm install          # Install dependencies
npm start            # Start production server (port 3000)
npm run dev          # Start development server (same as npm start)
```

### Testing
```bash
node test-fridge-api.js        # Run comprehensive API tests (4 scenarios)
node test-base64.js            # Test Base64 image analysis endpoint
node test-openrouter.js        # Test OpenRouter API connectivity
```

### Manual Testing
```bash
# Browser UI Test (http://localhost:3000)
# Provides visual interface for image upload and analysis

# cURL Test
curl -X POST http://localhost:3000/api/v1/fridge/analyze-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "<base64_encoded_image>",
    "mimeType": "image/png"
  }'
```

## Architecture Overview

### Current Implementation (MVP - Phase 1)

#### Backend API (`/src`)
```
src/
├── server.js                 # Express server + static file serving
├── routes/
│   └── fridgeRoutes.js       # API route definitions
├── controllers/
│   └── fridgeController.js   # Business logic for image analysis
├── middleware/
│   ├── uploadMiddleware.js   # Multer configuration (not actively used)
│   └── errorHandler.js       # Comprehensive error handling
└── utils/
    └── imageValidator.js     # Image file validation
```

#### Frontend (`/public`)
- `index.html` - Web UI for image upload and analysis
  - Drag-and-drop image upload
  - Real-time preview
  - Interactive result display
  - Responsive design (mobile/tablet/desktop)

#### Documentation (`/docs`)
```
docs/
├── PRD_01.md                 # Phase 1: Image Recognition (COMPLETE)
├── PRD_02.md                 # Phase 2: Recipe Generation (PLANNED)
└── PRD_03.md                 # Phase 3: User System (PLANNED)
```

### Technology Stack

**Backend**
- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18+
- **HTTP Client**: Axios v1.6+
- **File Processing**: Sharp v0.32+ (image metadata)
- **Upload**: Multer v2.2+ (infrastructure)
- **Validation**: Joi v17+
- **Middleware**: CORS, Morgan (logging)
- **Environment**: dotenv v16+

**AI/ML Integration**
- **API**: OpenRouter (openrouter.ai)
- **Model**: `nvidia/nemotron-nano-12b-v2-vl:free` (Vision model)
- **Response Time**: ~5-6 seconds (free tier)
- **Accuracy**: Varies by image quality

**Frontend**
- **HTML5** with vanilla JavaScript (no framework)
- **CSS3** with responsive grid layout
- **File API** for image handling
- **Fetch API** for server communication

**No Database** (MVP Stage)
- No user authentication
- No data persistence
- No recipe storage
- Planned for Phase 3

## API Endpoints

### Implemented (Phase 1) ✅

```
POST /api/v1/fridge/analyze-base64
├── Input: Base64 image + MIME type
├── Process: OpenRouter Vision API analysis
└── Output: Normalized ingredient data

GET /health
├── Check server status
└── Returns: { status: "ok", timestamp }

GET /
└── Serves: index.html (web UI)
```

### Request/Response Format

**Request:**
```json
{
  "imageBase64": "iVBORw0KGgo...",
  "mimeType": "image/png"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "analysisId": "analysis_1784771847692_2n234h",
  "ingredients": [
    {
      "id": "ing_001",
      "name": "양파",
      "englishName": "onion",
      "quantity": 3,
      "unit": "개",
      "category": "vegetable",
      "condition": "fresh",
      "estimatedExpiry": "2026-08-23",
      "confidence": 0.95,
      "notes": ""
    }
  ],
  "summary": {
    "totalItems": 1,
    "categories": {
      "vegetable": 1,
      "fruit": 0,
      "dairy": 0,
      "meat": 0,
      "seafood": 0,
      "condiment": 0,
      "other": 0
    },
    "averageConfidence": 0.95
  },
  "analysisTime": 5009,
  "timestamp": "2026-07-23T01:57:48.531Z"
}
```

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenRouter API
```bash
cp .env.example .env
```

Edit `.env`:
```
OPENROUTER_API_KEY=your_openrouter_key_here
NODE_ENV=development
API_PORT=3000
```

**Get API Key:**
1. Visit https://openrouter.ai
2. Sign up / Login
3. Navigate to Keys section
4. Create new API key
5. Add to `.env`

### 3. Start Server
```bash
npm start
# Server runs on http://localhost:3000
# Access web UI at http://localhost:3000
```

## Development Notes

### API Design
- **Base64 over Multipart**: Handles large images more reliably than multipart/form-data
- **JSON Response**: All responses are JSON with consistent structure
- **Error Handling**: Comprehensive error messages with HTTP status codes

### Image Processing
- **Supported Formats**: JPG, PNG, WebP
- **Max Size**: 10MB (configurable in controller)
- **Base64 Size**: Up to 50MB POST body limit

### AI Model Selection
- **Model**: `nvidia/nemotron-nano-12b-v2-vl:free`
- **Why Free Model**: Cost optimization during MVP phase
- **Trade-off**: Slower response (~5s) vs GPT-4 Turbo (~2s) but zero cost
- **Future**: Switch to faster paid models in production

### Testing Strategy
- **Unit Tests**: None (MVP stage)
- **Integration Tests**: 4 scenarios in `test-fridge-api.js`
  1. Server health check
  2. Image analysis with Base64
  3. Data normalization verification
  4. Error handling (missing image)
- **Manual Testing**: Browser UI at http://localhost:3000

### Important Constraints
- **No Database**: All processing is stateless
- **No Authentication**: Public API (add JWT in Phase 3)
- **No Persistence**: Results not saved (implement in Phase 3)
- **Stateless Design**: Can scale horizontally without session storage

## File Structure

```
claude-api-pjt/
├── public/
│   └── index.html                    # Web UI (drag-drop image upload)
├── src/
│   ├── server.js                     # Express app entry point
│   ├── routes/
│   │   └── fridgeRoutes.js           # API route definitions
│   ├── controllers/
│   │   └── fridgeController.js       # Image analysis logic
│   ├── middleware/
│   │   ├── uploadMiddleware.js       # Multer setup (reserved for Phase 2)
│   │   └── errorHandler.js           # Error handling middleware
│   └── utils/
│       └── imageValidator.js         # File validation utilities
├── docs/
│   ├── PRD_01.md                     # Phase 1: Image Recognition ✅
│   ├── PRD_02.md                     # Phase 2: Recipe Generation (draft)
│   ├── PRD_03.md                     # Phase 3: User System (draft)
│   └── PRD_01_IMPLEMENTATION_REPORT.md
├── test-fridge-api.js                # Main test suite
├── test-base64.js                    # Base64 endpoint test
├── test-openrouter.js                # API connectivity test
├── .env.example                      # Environment template
├── .env                              # Secrets (not committed)
├── .gitignore
├── package.json
└── CLAUDE.md                         # This file
```

## Roadmap

### ✅ Phase 1: Image Recognition (COMPLETE)
- [x] Express API server
- [x] OpenRouter vision API integration
- [x] Image validation
- [x] Data normalization
- [x] Web UI
- [x] Error handling
- [x] API tests

### 📋 Phase 2: Recipe Generation (PLANNED)
- [ ] Implement `/api/v1/recipes/generate` endpoint
- [ ] Use GPT-4 Turbo for recipe generation
- [ ] Accept ingredient list from Phase 1
- [ ] Return step-by-step recipe with ingredients
- [ ] Update web UI with recipe display

### 📋 Phase 3: User System (PLANNED)
- [ ] PostgreSQL database setup
- [ ] JWT authentication
- [ ] User registration/login
- [ ] Recipe favorites/collections
- [ ] Cooking history tracking
- [ ] User preferences

## Best Practices

### Code Style
- Use meaningful variable/function names
- Keep functions small and focused
- Add comments only for non-obvious logic
- Handle errors at API boundaries

### API Design
- RESTful endpoints with clear resource paths
- Consistent JSON response structure
- Proper HTTP status codes
- Descriptive error messages

### Security
- Environment variables for secrets (never hardcode)
- Input validation for all requests
- CORS properly configured
- Error messages don't expose internal details

### Performance
- Stateless design for horizontal scaling
- Efficient image processing with Sharp
- Async/await for non-blocking I/O
- Proper error handling (don't crash on bad input)

## Known Limitations (MVP)

1. **No Authentication** → Anyone can call the API
2. **No Data Persistence** → Results not saved
3. **No User System** → Can't track preferences
4. **No Recipe Database** → Phase 2 feature
5. **Slow Response** → Free model (~5s), not production-ready
6. **Single-threaded** → One request at a time (improve with clustering)
7. **No Rate Limiting** → API has no quota/throttling

## Next Steps for Developers

1. **Understand Phase 1**: Review PRD_01.md and test the image analysis
2. **Test Locally**: Run `npm start` and upload image via http://localhost:3000
3. **Review Code**: Examine fridgeController.js for API logic
4. **Plan Phase 2**: Implement recipe generation API
5. **Add Tests**: Expand test coverage before Phase 2
