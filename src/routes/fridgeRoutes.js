const express = require('express');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');
const fridgeController = require('../controllers/fridgeController');

const router = express.Router();

// multipart/form-data 방식
router.post(
  '/analyze',
  uploadMiddleware.single('image'),
  fridgeController.analyzeFridgeImage
);

// base64 인코딩 방식 (호환성 개선)
router.post(
  '/analyze-base64',
  fridgeController.analyzeFridgeImageBase64
);

module.exports = router;
