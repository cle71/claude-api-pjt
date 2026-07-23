function errorHandler(err, req, res, next) {
  console.error('🚨 에러 발생:', err.message);
  console.error('   스택:', err.stack?.split('\n')[1]);

  // Multer 파일 업로드 에러
  if (err.name === 'MulterError') {
    console.error('   Multer 에러 코드:', err.code);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        code: 'FILE_TOO_LARGE',
        message: '파일이 너무 큽니다. 최대 10MB까지 허용됩니다.',
        details: {
          maxSize: '10MB',
          receivedSize: `${(err.limit / 1024 / 1024).toFixed(2)}MB`,
        },
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_FORM_DATA',
        message: 'multipart/form-data 형식이 올바르지 않습니다.',
      });
    }
    // 기타 Multer 에러 (형식 오류 등)
    return res.status(400).json({
      status: 'error',
      code: 'MULTER_ERROR',
      message: '파일 업로드 처리 중 오류가 발생했습니다.',
      details: {
        error: err.message,
        code: err.code,
      },
    });
  }

  // 파일 형식 에러
  if (err.message && err.message.includes('지원되지 않는 파일 형식')) {
    return res.status(400).json({
      status: 'error',
      code: 'UNSUPPORTED_IMAGE_FORMAT',
      message: err.message,
      details: {
        supportedFormats: ['JPG', 'PNG', 'WebP'],
        maxSize: '10MB',
      },
    });
  }

  // OpenRouter API 에러
  if (err.response?.status === 401) {
    return res.status(401).json({
      status: 'error',
      code: 'API_KEY_INVALID',
      message: 'OpenRouter API 키가 유효하지 않습니다.',
    });
  }

  if (err.response?.status === 429) {
    return res.status(429).json({
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    });
  }

  if (err.response?.status >= 500) {
    return res.status(503).json({
      status: 'error',
      code: 'EXTERNAL_SERVICE_ERROR',
      message: 'OpenRouter 서비스에 일시적 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }

  // 일반 에러
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다.',
    details: process.env.NODE_ENV === 'development' ? { error: err.message } : undefined,
  });
}

module.exports = { errorHandler };
