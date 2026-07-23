#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3000';

async function testHealthCheck() {
  console.log('\n═════════════════════════════════════════════════════');
  console.log('🏥 Test 1: 서버 헬스 체크');
  console.log('═════════════════════════════════════════════════════\n');

  try {
    const response = await makeRequest('GET', '/health');
    console.log('✅ 서버 상태: OK');
    console.log(`📍 응답: ${JSON.stringify(response, null, 2)}\n`);
    return true;
  } catch (error) {
    console.error('❌ 헬스 체크 실패:', error.message);
    return false;
  }
}

async function testFridgeAnalysisWithSampleImage() {
  console.log('\n═════════════════════════════════════════════════════');
  console.log('🖼️  Test 2: 냉장고 이미지 분석 (온라인 샘플 이미지)');
  console.log('═════════════════════════════════════════════════════\n');

  try {
    // 온라인 이미지 다운로드
    const imageUrl =
      'https://www.gstatic.com/webp/gallery/1.png';
    const tempImagePath = path.join(__dirname, 'temp_test_image.png');

    console.log(`📥 샘플 이미지 다운로드 중: ${imageUrl}`);
    await downloadImage(imageUrl, tempImagePath);
    console.log(`✅ 다운로드 완료: ${tempImagePath}\n`);

    // Base64로 변환
    console.log('🔄 Base64 인코딩 중...');
    const imageBuffer = fs.readFileSync(tempImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    console.log(`   이미지 크기: ${(imageBuffer.length / 1024).toFixed(2)} KB\n`);

    // API 호출
    console.log('🔄 API 요청 중 (POST /api/v1/fridge/analyze-base64)...\n');
    const startTime = Date.now();

    const response = await makeBase64Request(
      'POST',
      '/api/v1/fridge/analyze-base64',
      imageBase64,
      'image/png'
    );

    const responseTime = Date.now() - startTime;
    console.log(`✅ API 응답 완료 (${responseTime}ms)\n`);

    // 결과 분석
    console.log('📊 분석 결과:');
    console.log(`   - 상태: ${response.status}`);
    console.log(`   - Analysis ID: ${response.analysisId}`);
    console.log(`   - 인식된 항목 수: ${response.ingredients?.length || 0}`);

    if (response.ingredients && response.ingredients.length > 0) {
      console.log(`\n   🥬 인식된 재료 목록:`);
      response.ingredients.forEach((ing, idx) => {
        console.log(
          `      ${idx + 1}. ${ing.name} (${ing.quantity}${ing.unit}) - ${ing.category} [신뢰도: ${(ing.confidence * 100).toFixed(0)}%]`
        );
      });
    }

    console.log(`\n   📈 카테고리별 분포:`);
    Object.entries(response.summary?.categories || {}).forEach(([cat, count]) => {
      if (count > 0) {
        console.log(`      - ${cat}: ${count}개`);
      }
    });

    console.log(`\n   📊 평균 신뢰도: ${(response.summary?.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   ⏱️  분석 시간: ${response.analysisTime}ms\n`);

    // 파일 정리
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
      console.log('🧹 임시 파일 정리 완료\n');
    }

    return true;
  } catch (error) {
    console.error('❌ 이미지 분석 실패:', error.message);
    return false;
  }
}

async function testImageUploadValidation() {
  console.log('\n═════════════════════════════════════════════════════');
  console.log('🧪 Test 3: 데이터 정규화 검증');
  console.log('═════════════════════════════════════════════════════\n');

  try {
    // 온라인 이미지 다운로드
    const imageUrl = 'https://www.gstatic.com/webp/gallery/1.png';
    const tempImagePath = path.join(__dirname, 'temp_validation_image.png');

    console.log(`📥 샘플 이미지 다운로드 중: ${imageUrl}`);
    await downloadImage(imageUrl, tempImagePath);

    // Base64로 변환
    const imageBuffer = fs.readFileSync(tempImagePath);
    const imageBase64 = imageBuffer.toString('base64');

    console.log('🔄 데이터 정규화 테스트 시작...\n');

    const response = await makeBase64Request(
      'POST',
      '/api/v1/fridge/analyze-base64',
      imageBase64,
      'image/png'
    );

    // 응답 구조 검증
    const checks = [
      { name: 'status 필드', pass: response.status === 'success' },
      { name: 'analysisId 필드', pass: !!response.analysisId },
      { name: 'ingredients 배열', pass: Array.isArray(response.ingredients) },
      { name: 'summary 객체', pass: !!response.summary },
      { name: 'analysisTime 필드', pass: typeof response.analysisTime === 'number' },
      { name: 'timestamp 필드', pass: !!response.timestamp },
      { name: 'categories 필드', pass: !!response.summary?.categories },
      { name: 'averageConfidence 필드', pass: typeof response.summary?.averageConfidence === 'number' },
    ];

    let allPass = true;
    checks.forEach((check) => {
      const symbol = check.pass ? '✅' : '❌';
      console.log(`${symbol} ${check.name}`);
      if (!check.pass) allPass = false;
    });

    console.log();

    // 파일 정리
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }

    if (allPass) {
      console.log('✅ 데이터 정규화 검증 통과\n');
      return true;
    } else {
      console.log('❌ 데이터 정규화 검증 실패\n');
      return false;
    }
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    return false;
  }
}

async function testNoImageProvided() {
  console.log('\n═════════════════════════════════════════════════════');
  console.log('📭 Test 4: 이미지 미제공 에러');
  console.log('═════════════════════════════════════════════════════\n');

  try {
    console.log('🔄 이미지 없이 API 호출...\n');

    const response = await fetch(`${API_BASE_URL}/api/v1/fridge/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (response.status === 400 && data.code === 'NO_IMAGE_PROVIDED') {
      console.log('✅ 에러 처리 정상: 이미지 미제공 감지');
      console.log(`   에러 코드: ${data.code}`);
      console.log(`   메시지: ${data.message}\n`);
      return true;
    } else {
      console.log('❌ 예상과 다른 응답');
      return false;
    }
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    return false;
  }
}

async function testRecipeGeneration() {
  console.log('\n═════════════════════════════════════════════════════');
  console.log('👨‍🍳 Test 5: 레시피 생성');
  console.log('═════════════════════════════════════════════════════\n');

  try {
    // 먼저 이미지를 분석해서 재료를 얻음
    const imageUrl =
      'https://www.gstatic.com/webp/gallery/1.png';
    const tempImagePath = path.join(__dirname, 'temp_recipe_image.png');

    console.log(`📥 샘플 이미지 다운로드 중: ${imageUrl}`);
    await downloadImage(imageUrl, tempImagePath);
    console.log(`✅ 다운로드 완료\n`);

    // Base64로 변환
    console.log('🔄 Base64 인코딩 중...');
    const imageBuffer = fs.readFileSync(tempImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    console.log(`   이미지 크기: ${(imageBuffer.length / 1024).toFixed(2)} KB\n`);

    // 이미지 분석 (재료 추출)
    console.log('🔄 이미지 분석 중 (재료 추출)...\n');
    const analysisResponse = await makeBase64Request(
      'POST',
      '/api/v1/fridge/analyze-base64',
      imageBase64,
      'image/png'
    );

    if (!analysisResponse.ingredients || analysisResponse.ingredients.length === 0) {
      console.log('❌ 분석된 재료가 없어서 레시피 생성 불가\n');
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
      return false;
    }

    console.log(`✅ 분석 완료: ${analysisResponse.ingredients.length}개 재료 추출\n`);

    // 레시피 생성 요청
    console.log('🔄 레시피 생성 중 (POST /api/v1/recipes/generate)...\n');
    const startTime = Date.now();

    const recipeResponse = await makeRecipeRequest(
      'POST',
      '/api/v1/recipes/generate',
      {
        ingredients: analysisResponse.ingredients,
        preferences: {
          dietaryRestrictions: [],
          allergens: [],
          cookingTimeLimit: 60,
          difficultyLevel: 'medium',
          cuisineType: [],
          recipeCount: 2,
        },
      }
    );

    const responseTime = Date.now() - startTime;
    console.log(`✅ 레시피 생성 완료 (${responseTime}ms)\n`);

    // 결과 분석
    console.log('📊 생성된 레시피:');
    console.log(`   - 상태: ${recipeResponse.status}`);
    console.log(`   - 생성 ID: ${recipeResponse.generationId}`);
    console.log(`   - 레시피 수: ${recipeResponse.recipes?.length || 0}\n`);

    if (recipeResponse.recipes && recipeResponse.recipes.length > 0) {
      console.log(`🍳 생성된 레시피 목록:`);
      recipeResponse.recipes.forEach((recipe, idx) => {
        console.log(`   ${idx + 1}. ${recipe.name}`);
        console.log(`      - 영문: ${recipe.nameEn}`);
        console.log(`      - 조리시간: ${recipe.cookingTime}분`);
        console.log(`      - 난이도: ${recipe.difficulty}`);
        console.log(`      - 재료 보유율: ${recipe.coveragePercentage}`);
        console.log(`      - 재료 수: ${recipe.ingredients.length}개`);
        console.log(`      - 조리단계: ${recipe.instructions.length}단계\n`);
      });
    }

    // 응답 구조 검증
    const recipeChecks = [
      { name: 'status 필드', pass: recipeResponse.status === 'success' },
      { name: 'generationId 필드', pass: !!recipeResponse.generationId },
      { name: 'recipes 배열', pass: Array.isArray(recipeResponse.recipes) },
      { name: 'summary 객체', pass: !!recipeResponse.summary },
    ];

    let allPass = true;
    recipeChecks.forEach((check) => {
      const symbol = check.pass ? '✅' : '❌';
      console.log(`${symbol} ${check.name}`);
      if (!check.pass) allPass = false;
    });

    console.log();

    // 파일 정리
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }

    if (allPass) {
      console.log('✅ 레시피 생성 테스트 통과\n');
      return true;
    } else {
      console.log('❌ 레시피 생성 테스트 실패\n');
      return false;
    }
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    return false;
  }
}

// Helper 함수들
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function makeFileRequest(method, routePath, filePath) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2, 15);

    const body = [];
    body.push(`--${boundary}`);
    body.push(
      `Content-Disposition: form-data; name="image"; filename="${fileName}"`
    );
    body.push('Content-Type: application/octet-stream');
    body.push('');

    const bodyStr = body.join('\r\n');
    const footer = `\r\n--${boundary}--`;

    const url = new URL(API_BASE_URL + routePath);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length':
          Buffer.byteLength(bodyStr) + fileData.length + Buffer.byteLength(footer),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(result.message || 'API Error'));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.write(fileData);
    req.write(footer);
    req.end();
  });
}

function makeBase64Request(method, routePath, imageBase64, mimeType) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + routePath);
    const body = JSON.stringify({
      imageBase64: imageBase64,
      mimeType: mimeType,
    });

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(result.message || 'API Error'));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeRecipeRequest(method, routePath, requestBody) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + routePath);
    const body = JSON.stringify(requestBody);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(result.message || 'API Error'));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.destroy();
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    file.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// 테스트 실행
async function runAllTests() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧊 냉장고 AI 레시피 추천 시스템 - PRD_01 API 테스트       ║
╚════════════════════════════════════════════════════════════╝
  `);

  const tests = [
    { name: '헬스 체크', fn: testHealthCheck },
    { name: '이미지 분석', fn: testFridgeAnalysisWithSampleImage },
    { name: '파일 유효성', fn: testImageUploadValidation },
    { name: '이미지 미제공', fn: testNoImageProvided },
    { name: '레시피 생성', fn: testRecipeGeneration },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ ${test.name} 테스트 에러:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }

  // 최종 결과
  console.log('\n═════════════════════════════════════════════════════');
  console.log('📋 최종 테스트 결과');
  console.log('═════════════════════════════════════════════════════\n');

  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
  });

  const passCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  console.log(`\n📊 총 ${passCount}/${totalCount} 테스트 통과\n`);

  if (passCount === totalCount) {
    console.log('🎉 모든 테스트 성공!\n');
    process.exit(0);
  } else {
    console.log('⚠️  일부 테스트 실패\n');
    process.exit(1);
  }
}

// 메인 실행
runAllTests().catch((error) => {
  console.error('테스트 실행 중 오류:', error);
  process.exit(1);
});
