# 🧊 Smart Refrigerator Management System

An AI-powered smart refrigerator management system that uses vision models to automatically recognize refrigerator contents and suggest recipes based on available ingredients.

**Status**: Phase 1 Complete ✅ | Phase 2 & 3 Planned 📋

---

## 🎯 Features

### Phase 1: Image Recognition ✅ (Complete)
- **AI Vision Analysis**: Uses OpenRouter's vision model to recognize fridge items
- **Smart Ingredient Detection**: Automatically identifies ingredients from fridge photos
- **Real-time Preview**: Instant image preview with analysis
- **Confidence Scoring**: Shows accuracy percentage for each detected item
- **Responsive UI**: Works seamlessly on desktop, tablet, and mobile devices

### Phase 2: Recipe Generation 📋 (Planned)
- Generate recipes based on detected ingredients
- Filter by cooking time, difficulty level, and dietary preferences
- Show step-by-step instructions with timing
- Display nutritional information

### Phase 3: User System 📋 (Planned)
- User authentication with JWT
- Save favorite recipes
- Track cooking history
- Store user preferences

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- OpenRouter API Key ([Get one here](https://openrouter.ai))

### Installation

```bash
# Clone the repository
git clone https://github.com/cle71/claude-api-pjt.git
cd claude-api-pjt

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OpenRouter API Key
```

### Running the Server

```bash
# Start the application
npm start

# The server will run on http://localhost:3000
```

Visit `http://localhost:3000` in your browser to use the UI.

---

## 📡 API Endpoints

### Image Analysis (Phase 1)

**Endpoint**: `POST /api/v1/fridge/analyze-base64`

**Request**:
```json
{
  "imageBase64": "iVBORw0KGgo...",
  "mimeType": "image/png"
}
```

**Response**:
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

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-07-23T01:57:48.531Z"
}
```

---

## 🧪 Testing

### Run API Tests
```bash
node test-fridge-api.js        # Comprehensive API tests
node test-base64.js            # Base64 endpoint test
node test-openrouter.js        # OpenRouter API connectivity
```

### Manual Testing
1. Open http://localhost:3000 in your browser
2. Drag & drop or click to upload a fridge image
3. Wait for AI analysis (5-6 seconds on free tier)
4. View recognized ingredients and their details

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/fridge/analyze-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "<base64_encoded_image>",
    "mimeType": "image/png"
  }'
```

---

## 📁 Project Structure

```
claude-api-pjt/
├── public/
│   └── index.html                    # Web UI
├── src/
│   ├── server.js                     # Express server
│   ├── routes/
│   │   └── fridgeRoutes.js           # API routes
│   ├── controllers/
│   │   └── fridgeController.js       # Business logic
│   ├── middleware/
│   │   ├── uploadMiddleware.js       # Multer configuration
│   │   └── errorHandler.js           # Error handling
│   └── utils/
│       └── imageValidator.js         # Validation utilities
├── docs/
│   ├── PRD_01.md                     # Phase 1 Requirements
│   ├── PRD_02.md                     # Phase 2 Requirements
│   └── PRD_03.md                     # Phase 3 Requirements
├── test-*.js                         # Test files
├── package.json
├── .env.example
├── README.md
└── CLAUDE.md                         # Internal documentation
```

---

## 🛠 Technology Stack

**Backend**
- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18+
- **HTTP Client**: Axios v1.6+
- **Image Processing**: Sharp v0.32+
- **File Upload**: Multer v2.2+
- **Validation**: Joi v17+
- **Middleware**: CORS, Morgan

**AI/ML**
- **API**: OpenRouter (openrouter.ai)
- **Vision Model**: `nvidia/nemotron-nano-12b-v2-vl:free`
- **Response Time**: ~5-6 seconds (free tier)

**Frontend**
- **HTML5** with vanilla JavaScript
- **CSS3** with responsive grid layout
- **Drag & drop** file upload
- **Real-time** image preview

---

## 🔐 Environment Variables

```env
# OpenRouter API Key (Required)
OPENROUTER_API_KEY=your_api_key_here

# Server Configuration
API_PORT=3000                    # Default: 3000
API_HOST=localhost               # Default: localhost
NODE_ENV=development             # development or production
```

Get your OpenRouter API key:
1. Visit https://openrouter.ai
2. Sign up / Login
3. Go to Keys section
4. Create new API key
5. Add to `.env`

---

## 📊 API Design Decisions

### Base64 over Multipart
- **Why**: More reliable for large images
- **Trade-off**: Larger request payloads (~33% larger than binary)
- **Benefit**: Simplified error handling and better compatibility

### Free Vision Model
- **Model**: `nvidia/nemotron-nano-12b-v2-vl:free`
- **Why**: Cost optimization during MVP phase
- **Trade-off**: Slower response (~5-6s) vs GPT-4 Turbo (~2s)
- **Future**: Will switch to faster paid models in production

---

## 🐛 Known Limitations

| Limitation | Impact | Planned Fix |
|-----------|--------|------------|
| No Authentication | Anyone can use API | Phase 3: JWT + user system |
| No Data Persistence | Results not saved | Phase 3: PostgreSQL database |
| No Recipe Database | Can't generate recipes | Phase 2: Recipe generation API |
| Slow Response | 5-6 seconds per image | Phase 2: Switch to faster model |
| Single-threaded | One request at a time | Production: Node clustering |
| No Rate Limiting | No quota/throttling | Production: Implement rate limiter |

---

## 📚 Documentation

- **[PRD_01.md](./docs/PRD_01.md)** - Phase 1: Image Recognition (Complete)
- **[PRD_02.md](./docs/PRD_02.md)** - Phase 2: Recipe Generation (Draft)
- **[PRD_03.md](./docs/PRD_03.md)** - Phase 3: User System (Draft)
- **[CLAUDE.md](./CLAUDE.md)** - Internal development guide

---

## 🚢 Deployment

### Local Development
```bash
npm start
# Server runs on http://localhost:3000
```

### Production Build (Local)
```bash
# Set environment to production
export NODE_ENV=production

# Ensure API key is set
export OPENROUTER_API_KEY=your_key_here

# Start the server
npm start
```

### 🚀 Vercel Deployment (Recommended)

The application is pre-configured for Vercel serverless deployment.

**Prerequisites:**
- Vercel account (free at https://vercel.com)
- GitHub repository connected to Vercel

**Deployment Steps:**

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure environment variables:
     ```
     OPENROUTER_API_KEY = your_api_key_here
     NODE_ENV = production
     ```
   - Click "Deploy"

3. **Verify Deployment**
   ```bash
   # Your app will be available at:
   https://your-project.vercel.app
   
   # Test the health endpoint:
   curl https://your-project.vercel.app/health
   ```

**Files Added for Vercel:**
- `vercel.json` - Serverless configuration
- `api/index.js` - Serverless handler
- Updated `src/server.js` - Production-ready server

**Key Features:**
- ✅ Automatic scaling
- ✅ Global CDN
- ✅ Zero-downtime deployments
- ✅ Environment variable management
- ✅ Free tier available

**Configuration Details:**
- API timeout: 60 seconds
- Memory: 1024 MB
- Node.js version: 18+ (auto-selected)

### Docker (Coming Soon)
```dockerfile
# Dockerfile will be added in Phase 2
```

---

## 📈 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Image Analysis Time | 5-6 seconds | Free tier, may vary |
| Max Image Size | 10 MB | Configurable in code |
| Request Timeout | 30 seconds | Default axios timeout |
| Server Memory | ~50-100 MB | Typical at idle |
| Concurrent Requests | 1 (MVP) | Will improve in Phase 2 |

---

## 🔄 Development Workflow

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement the feature
3. Test with provided test scripts
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

### Bug Fixes
1. Create bug fix branch: `git checkout -b fix/your-bug`
2. Fix the issue
3. Test thoroughly
4. Commit: `git commit -m "Fix: describe the fix"`
5. Push and create Pull Request

---

## 📞 Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/cle71/claude-api-pjt/issues)
- **Discussions**: Ask questions on [GitHub Discussions](https://github.com/cle71/claude-api-pjt/discussions)
- **Email**: edu_599@iceu.kr

---

## 📄 License

MIT License - Feel free to use this project for learning and personal purposes.

---

## 🙏 Acknowledgments

- **OpenRouter**: For providing the free vision model API
- **Express.js**: For the lightweight web framework
- **Node.js Community**: For the amazing ecosystem

---

## 🗺️ Roadmap

### Phase 1 (Complete ✅)
- [x] Express API server setup
- [x] OpenRouter integration
- [x] Image validation
- [x] Web UI with drag-and-drop
- [x] Ingredient recognition
- [x] Error handling
- [x] API tests

### Phase 2 (Planned 📋)
- [ ] Recipe generation API
- [ ] GPT-4 integration
- [ ] Recipe filtering (time, difficulty, diet)
- [ ] Step-by-step instructions
- [ ] Nutritional information
- [ ] Enhanced UI for recipes

### Phase 3 (Planned 📋)
- [ ] PostgreSQL database
- [ ] JWT authentication
- [ ] User registration/login
- [ ] Save favorite recipes
- [ ] Cooking history
- [ ] User preferences
- [ ] Mobile app (React Native)

---

**Made with ❤️ by the Smart Fridge Team**
