#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3000';

async function downloadImage(url, destPath) {
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

async function testImageAnalysisBase64() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧊 냉장고 AI 레시피 추천 시스템 - PRD_01 테스트            ║
║  (Base64 API 버전)                                         ║
╚════════════════════════════════════════════════════════════╝
  `);

  try {
    // 1. 이미지 다운로드
    const imageUrl = 'https://www.gstatic.com/webp/gallery/1.png';
    const tempImagePath = path.join(__dirname, 'test_image.png');

    console.log('📥 샘플 이미지 다운로드 중...');
    await downloadImage(imageUrl, tempImagePath);
    console.log('✅ 다운로드 완료\n');

    // 2. Base64 인코딩
    console.log('🔐 이미지를 Base64로 인코딩 중...');
    const imageBuffer = fs.readFileSync(tempImagePath);
    const base64Image = imageBuffer.toString('base64');
    console.log(`✅ 인코딩 완료 (${(base64Image.length / 1024).toFixed(2)} KB)\n`);

    // 3. 서버 헬스 체크
    console.log('🏥 서버 헬스 체크...');
    const healthRes = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log(`✅ 서버 상태: ${healthData.status}\n`);

    // 4. API 테스트 (Base64)
    console.log('🔄 냉장고 이미지 분석 API 호출 (Base64 방식)...\n');

    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/v1/fridge/analyze-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64Image,
        mimeType: 'image/png',
      }),
    });

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      console.log(`❌ API 응답 에러 (${response.status}):`);
      console.log(`   코드: ${data.code}`);
      console.log(`   메시지: ${data.message}`);
      if (data.details) {
        console.log(`   상세: ${JSON.stringify(data.details, null, 2)}`);
      }
    } else {
      console.log(`✅ API 응답 성공 (${responseTime}ms)\n`);

      console.log('📊 분석 결과:');
      console.log(`   - Analysis ID: ${data.analysisId}`);
      console.log(`   - 인식된 항목: ${data.ingredients?.length || 0}개`);

      if (data.ingredients && data.ingredients.length > 0) {
        console.log(`\n   🥬 인식된 재료:`);
        data.ingredients.slice(0, 5).forEach((ing, idx) => {
          console.log(
            `      ${idx + 1}. ${ing.name} (${ing.quantity}${ing.unit}) [신뢰도: ${(ing.confidence * 100).toFixed(0)}%]`
          );
        });
        if (data.ingredients.length > 5) {
          console.log(`      ... 외 ${data.ingredients.length - 5}개`);
        }
      }

      console.log(`\n   📈 카테고리별 분포:`);
      Object.entries(data.summary?.categories || {}).forEach(([cat, count]) => {
        if (count > 0) {
          console.log(`      - ${cat}: ${count}개`);
        }
      });

      console.log(`\n   📊 평균 신뢰도: ${(data.summary?.averageConfidence * 100).toFixed(1)}%`);
      console.log(`   ⏱️  분석 시간: ${data.analysisTime}ms`);
    }

    // 5. 파일 정리
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
      console.log('\n🧹 임시 파일 정리 완료');
    }

    console.log('\n✅ 테스트 완료!\n');
  } catch (error) {
    console.error('❌ 에러:', error.message);
    console.error(error.stack);
  }
}

testImageAnalysisBase64();
