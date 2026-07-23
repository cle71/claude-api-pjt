const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function validateImageFile(file) {
  // MIME 타입 검증
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    return {
      isValid: false,
      code: 'INVALID_IMAGE_FORMAT',
      message: '지원되지 않는 이미지 형식입니다. JPG, PNG, WebP만 지원됩니다.',
      details: {
        receivedFormat: file.mimetype,
        supportedFormats: allowedMimes,
      },
    };
  }

  // 파일 크기 검증
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      code: 'FILE_TOO_LARGE',
      message: '파일이 너무 큽니다. 최대 10MB까지 허용됩니다.',
      details: {
        maxSize: '10MB',
        receivedSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      },
    };
  }

  // 파일 존재 여부 검증
  if (!fs.existsSync(file.path)) {
    return {
      isValid: false,
      code: 'FILE_NOT_FOUND',
      message: '업로드된 파일을 찾을 수 없습니다.',
    };
  }

  return { isValid: true };
}

async function getImageMetadata(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      hasAlpha: metadata.hasAlpha,
      space: metadata.space,
    };
  } catch (error) {
    console.error('이미지 메타데이터 읽기 실패:', error.message);
    return null;
  }
}

module.exports = {
  validateImageFile,
  getImageMetadata,
};
