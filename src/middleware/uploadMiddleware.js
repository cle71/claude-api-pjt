const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 생성 (Vercel serverless 환경에서는 스킵)
const uploadDir = path.join(__dirname, '../../uploads/temp');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ 업로드 디렉토리 생성 실패 (Vercel serverless 환경):', err.message);
}

// 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    cb(null, `image_${timestamp}_${random}${ext}`);
  },
});

// 파일 필터
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = allowedMimes.includes(file.mimetype);
  const isExtAllowed = allowedExts.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `지원되지 않는 파일 형식입니다. 허용 형식: ${allowedExts.join(', ')}`
      ),
      false
    );
  }
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = { uploadMiddleware };
