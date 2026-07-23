const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const fridgeRoutes = require('./routes/fridgeRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/v1/fridge', fridgeRoutes);
app.use('/api/v1/recipes', recipeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: '해당 엔드포인트를 찾을 수 없습니다.',
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║      🧊 냉장고 AI 레시피 추천 시스템 - PRD_01 실행 중     ║
╚════════════════════════════════════════════════════════════╝

📍 서버가 http://localhost:${PORT} 에서 실행 중입니다.

📝 사용 가능한 엔드포인트:
  POST /api/v1/fridge/analyze    - 냉장고 사진 인식
  GET  /health                   - 서버 상태 확인

🔧 기술 스택:
  - OpenRouter API: openai/gpt-4-turbo (Vision)
  - 파일 업로드: Multer
  - 이미지 처리: Sharp

⚠️  ${process.env.OPENROUTER_API_KEY ? '✅' : '❌'} OpenRouter API Key: ${
    process.env.OPENROUTER_API_KEY ? '설정됨' : '설정 필요'
  }

📚 문서: /docs/PRD_01.md

💡 테스트 커맨드:
  curl -X POST http://localhost:${PORT}/api/v1/fridge/analyze \\
    -F "image=@/path/to/fridge/image.jpg"
  `);
});

module.exports = app;
