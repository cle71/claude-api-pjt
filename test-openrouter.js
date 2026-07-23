#!/usr/bin/env node
require('dotenv').config();

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('❌ Error: OPENROUTER_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🔑 API Key loaded successfully');
console.log('📝 Starting OpenRouter API connection tests...\n');

// Test 1: Text Embedding with nvidia/nemotron-3-embed-1b:free
async function testTextEmbedding() {
  console.log('═══════════════════════════════════════════════');
  console.log('📊 Test 1: Text Embedding (nvidia/nemotron-3-embed-1b:free)');
  console.log('═══════════════════════════════════════════════\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-embed-1b:free',
        input: ['Hello, this is a test text for embedding.', 'Another test sentence.'],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error response from API:');
      console.error(JSON.stringify(data, null, 2));
      return false;
    }

    console.log('✅ Connection successful!');
    console.log(`📈 Embeddings received: ${data.data?.length || 0} vectors`);
    if (data.data && data.data[0]) {
      console.log(`📏 Embedding dimension: ${data.data[0].embedding?.length || 'N/A'}`);
    }
    console.log(`🔢 Usage: ${JSON.stringify(data.usage)}\n`);
    return true;
  } catch (error) {
    console.error('❌ Error during text embedding test:');
    console.error(error.message);
    console.error(error.stack, '\n');
    return false;
  }
}

// Test 2: Image Analysis with openai/gpt-4-turbo-vision
async function testImageRecognition() {
  console.log('═══════════════════════════════════════════════');
  console.log('🖼️  Test 2: Image Analysis (openai/gpt-4-turbo + Vision)');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Test with image URL using gpt-4-turbo
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'What is in this image? Describe it in 2-3 sentences.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: 'https://www.gstatic.com/webp/gallery/1.png',
                },
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error response from API:');
      console.error(JSON.stringify(data, null, 2));
      return false;
    }

    console.log('✅ Connection successful!');
    console.log(`📄 Response from model:`);
    console.log(`"${data.choices?.[0]?.message?.content || 'No content'}"`);
    console.log(`\n🔢 Usage: ${JSON.stringify(data.usage)}\n`);
    return true;
  } catch (error) {
    console.error('❌ Error during image recognition test:');
    console.error(error.message);
    console.error(error.stack, '\n');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const test1Result = await testTextEmbedding();
  const test2Result = await testImageRecognition();

  console.log('═══════════════════════════════════════════════');
  console.log('📋 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`✅ Text Embedding Test: ${test1Result ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Image Recognition Test: ${test2Result ? 'PASSED' : 'FAILED'}`);
  console.log(`\nOverall Result: ${test1Result && test2Result ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
}

runAllTests();
