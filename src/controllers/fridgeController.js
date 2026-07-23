const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { validateImageFile } = require('../utils/imageValidator');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;

async function analyzeFridgeImage(req, res, next) {
  try {
    // 파일 존재 여부 확인
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_IMAGE_PROVIDED',
        message: '이미지 파일이 제공되지 않았습니다.',
        details: {
          hint: 'multipart/form-data로 "image" 필드에 파일을 업로드해주세요.',
        },
      });
    }

    // 이미지 유효성 검사
    const validationResult = validateImageFile(req.file);
    if (!validationResult.isValid) {
      // 임시 파일 삭제
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: 'error',
        code: validationResult.code,
        message: validationResult.message,
        details: validationResult.details,
      });
    }

    console.log(`📸 이미지 분석 시작: ${req.file.filename}`);
    console.log(`   파일 크기: ${(req.file.size / 1024).toFixed(2)} KB`);

    // 이미지를 Base64로 변환
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    // API 호출 전 확인
    if (!API_KEY) {
      throw new Error('OPENROUTER_API_KEY가 설정되지 않았습니다.');
    }

    console.log('🔄 OpenRouter API 호출 중...');
    const startTime = Date.now();

    // OpenRouter API 호출
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'nvidia/nemotron-nano-12b-v2-vl:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `당신은 냉장고 사진 분석 전문가입니다. 이 냉장고 사진에 보이는 모든 재료와 식재료를 자세히 분석해주세요.

다음 정보를 JSON 형식으로 반환해주세요:
1. 각 항목의 이름 (한글)
2. 각 항목의 이름 (영문)
3. 수량 (숫자)
4. 단위 (개, g, ml, 컵 등)
5. 신선도 상태 (fresh, ripe, expired, unknown 중 하나)
6. 카테고리 (vegetable, fruit, dairy, meat, seafood, condiment, other 중 하나)
7. 추정 유통기한 (YYYY-MM-DD 형식, 추정 불가능하면 null)
8. 신뢰도 점수 (0~1 사이의 숫자)

응답 형식:
{
  "ingredients": [
    {
      "name": "한글명",
      "nameEn": "english_name",
      "quantity": 3,
      "unit": "개",
      "category": "vegetable",
      "condition": "fresh",
      "estimatedExpiry": "2026-08-23",
      "confidence": 0.95,
      "notes": "추가 설명"
    }
  ]
}

주의사항:
- 실제로 보이는 재료만 포함해주세요
- 불명확한 항목은 "unknown"으로 표시해주세요
- JSON만 반환하고 추가 텍스트는 없어야 합니다`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const apiTime = Date.now() - startTime;
    console.log(`✅ API 응답 완료 (${apiTime}ms)`);

    // 응답 파싱
    const apiContent = response.data.choices[0]?.message?.content;
    if (!apiContent) {
      throw new Error('API 응답에서 콘텐츠를 찾을 수 없습니다.');
    }

    // 마크다운 코드 블록 제거 (```json ... ```)
    let jsonString = apiContent.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let ingredientsData;
    try {
      ingredientsData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', apiContent.substring(0, 200));
      throw new Error('API 응답을 JSON으로 파싱할 수 없습니다.');
    }

    // 데이터 정규화
    const normalizedIngredients = normalizeIngredients(ingredientsData.ingredients);

    // 결과 구성
    const result = {
      status: 'success',
      analysisId: generateAnalysisId(),
      ingredients: normalizedIngredients,
      summary: {
        totalItems: normalizedIngredients.length,
        categories: calculateCategories(normalizedIngredients),
        averageConfidence: calculateAverageConfidence(normalizedIngredients),
      },
      analysisTime: apiTime,
      timestamp: new Date().toISOString(),
    };

    console.log(`📊 분석 완료: ${normalizedIngredients.length}개 항목 인식`);

    // 임시 파일 삭제
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);

    // 임시 파일 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    next(error);
  }
}

function normalizeIngredients(ingredients) {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients.map((ing, index) => ({
    id: `ing_${String(index + 1).padStart(3, '0')}`,
    name: ing.name || 'Unknown',
    quantity: ing.quantity || 0,
    unit: ing.unit || 'piece',
    category: ing.category || 'other',
    koreanName: ing.name || '',
    englishName: ing.nameEn || '',
    condition: ing.condition || 'unknown',
    estimatedExpiry: ing.estimatedExpiry || null,
    confidence: ing.confidence || 0.5,
    notes: ing.notes || '',
  }));
}

function calculateCategories(ingredients) {
  const categories = {
    vegetable: 0,
    fruit: 0,
    dairy: 0,
    meat: 0,
    seafood: 0,
    condiment: 0,
    other: 0,
  };

  ingredients.forEach((ing) => {
    if (categories.hasOwnProperty(ing.category)) {
      categories[ing.category]++;
    } else {
      categories.other++;
    }
  });

  return categories;
}

function calculateAverageConfidence(ingredients) {
  if (ingredients.length === 0) return 0;
  const sum = ingredients.reduce((acc, ing) => acc + (ing.confidence || 0), 0);
  return Number((sum / ingredients.length).toFixed(3));
}

function generateAnalysisId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `analysis_${timestamp}_${random}`;
}

async function analyzeFridgeImageBase64(req, res, next) {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;

    // base64 데이터 검증
    if (!imageBase64) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_IMAGE_PROVIDED',
        message: 'imageBase64 필드가 필요합니다.',
      });
    }

    // base64 크기 검증 (대략 10MB)
    const sizeInMB = Buffer.byteLength(imageBase64, 'base64') / (1024 * 1024);
    if (sizeInMB > 10) {
      return res.status(400).json({
        status: 'error',
        code: 'FILE_TOO_LARGE',
        message: '이미지가 너무 큽니다. 최대 10MB까지 허용됩니다.',
      });
    }

    console.log(`📸 이미지 분석 시작 (Base64)`);
    console.log(`   이미지 크기: ${sizeInMB.toFixed(2)} MB`);

    // API 호출 전 확인
    if (!API_KEY) {
      throw new Error('OPENROUTER_API_KEY가 설정되지 않았습니다.');
    }

    console.log('🔄 OpenRouter API 호출 중...');
    const startTime = Date.now();

    // OpenRouter API 호출
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'nvidia/nemotron-nano-12b-v2-vl:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `당신은 냉장고 사진 분석 전문가입니다. 이 냉장고 사진에 보이는 모든 재료와 식재료를 자세히 분석해주세요.

다음 정보를 JSON 형식으로 반환해주세요:
1. 각 항목의 이름 (한글)
2. 각 항목의 이름 (영문)
3. 수량 (숫자)
4. 단위 (개, g, ml, 컵 등)
5. 신선도 상태 (fresh, ripe, expired, unknown 중 하나)
6. 카테고리 (vegetable, fruit, dairy, meat, seafood, condiment, other 중 하나)
7. 추정 유통기한 (YYYY-MM-DD 형식, 추정 불가능하면 null)
8. 신뢰도 점수 (0~1 사이의 숫자)

응답 형식:
{
  "ingredients": [
    {
      "name": "한글명",
      "nameEn": "english_name",
      "quantity": 3,
      "unit": "개",
      "category": "vegetable",
      "condition": "fresh",
      "estimatedExpiry": "2026-08-23",
      "confidence": 0.95,
      "notes": "추가 설명"
    }
  ]
}

주의사항:
- 실제로 보이는 재료만 포함해주세요
- 불명확한 항목은 "unknown"으로 표시해주세요
- JSON만 반환하고 추가 텍스트는 없어야 합니다`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const apiTime = Date.now() - startTime;
    console.log(`✅ API 응답 완료 (${apiTime}ms)`);

    // 응답 구조 디버깅
    console.log('📋 API 응답 구조:');
    console.log(`   - response.status: ${response.status}`);
    console.log(`   - response.data keys: ${Object.keys(response.data).join(', ')}`);
    if (response.data.choices) {
      console.log(`   - choices[0] 첫 200자: ${JSON.stringify(response.data.choices[0]).substring(0, 200)}`);
    }

    // API 에러 응답 확인
    if (response.data.error) {
      throw new Error(`OpenRouter API Error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
    }

    // 응답 파싱
    const apiContent = response.data.choices[0]?.message?.content;
    if (!apiContent) {
      throw new Error('API 응답에서 콘텐츠를 찾을 수 없습니다.');
    }

    // 마크다운 코드 블록 제거 (```json ... ```)
    let jsonString = apiContent.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let ingredientsData;
    try {
      ingredientsData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', apiContent.substring(0, 200));
      throw new Error('API 응답을 JSON으로 파싱할 수 없습니다.');
    }

    // 데이터 정규화
    const normalizedIngredients = normalizeIngredients(ingredientsData.ingredients);

    // 결과 구성
    const result = {
      status: 'success',
      analysisId: generateAnalysisId(),
      ingredients: normalizedIngredients,
      summary: {
        totalItems: normalizedIngredients.length,
        categories: calculateCategories(normalizedIngredients),
        averageConfidence: calculateAverageConfidence(normalizedIngredients),
      },
      analysisTime: apiTime,
      timestamp: new Date().toISOString(),
    };

    console.log(`📊 분석 완료: ${normalizedIngredients.length}개 항목 인식`);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    next(error);
  }
}

module.exports = {
  analyzeFridgeImage,
  analyzeFridgeImageBase64,
};
