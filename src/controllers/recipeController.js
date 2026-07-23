const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;

async function generateRecipes(req, res, next) {
  try {
    const { ingredients, preferences = {} } = req.body;

    // 재료 검증
    if (!Array.isArray(ingredients) || ingredients.length < 2) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INGREDIENTS',
        message: '최소 2개 이상의 재료가 필요합니다.',
        details: {
          ingredientsProvided: ingredients?.length || 0,
          minRequired: 2,
        },
      });
    }

    // API 키 확인
    if (!API_KEY) {
      throw new Error('OPENROUTER_API_KEY가 설정되지 않았습니다.');
    }

    // 사용자 선호도 기본값 설정
    const {
      dietaryRestrictions = [],
      allergens = [],
      cookingTimeLimit = 60,
      cuisineType = [],
      recipeCount = 3,
    } = preferences;

    // 재료 텍스트 생성
    const ingredientsList = ingredients
      .map(
        (ing) =>
          `- ${ing.name || ing.englishName} ${ing.quantity}${ing.unit || ''}`
      )
      .join('\n');

    // 선호도 텍스트 생성
    let preferencesText = '';
    if (dietaryRestrictions.length > 0) {
      preferencesText += `\n- 식단 제약사항: ${dietaryRestrictions.join(', ')}`;
    }
    if (allergens.length > 0) {
      preferencesText += `\n- 피해야 할 알레르기: ${allergens.join(', ')}`;
    }
    if (cookingTimeLimit) {
      preferencesText += `\n- 조리시간 제한: ${cookingTimeLimit}분 이내`;
    }
    if (cuisineType.length > 0) {
      preferencesText += `\n- 요리 종류: ${cuisineType.join(', ')}`;
    }

    console.log(`🍳 레시피 생성 시작 (재료: ${ingredients.length}개, 요청 수: ${recipeCount}개)`);
    const startTime = Date.now();

    // OpenRouter API 호출
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'nvidia/nemotron-nano-12b-v2-vl:free',
        messages: [
          {
            role: 'user',
            content: `당신은 전문 요리사입니다. 다음 재료로 만들 수 있는 ${recipeCount}개의 맛있는 레시피를 제시해주세요.

📦 보유한 재료:
${ingredientsList}
${preferencesText}

요청하는 형식:
다음 정보를 포함한 JSON 형식으로만 답변해주세요:
{
  "recipes": [
    {
      "name": "레시피명 (한글)",
      "nameEn": "recipe name (English)",
      "description": "한두 줄 설명",
      "cookingTime": 15,
      "prepTime": 5,
      "servings": 2,
      "difficulty": "easy|medium|hard",
      "cuisineType": "korean|asian|western|italian|etc",
      "ingredients": [
        {
          "name": "재료명",
          "quantity": "3",
          "unit": "개",
          "required": true,
          "notes": "선택사항"
        }
      ],
      "instructions": [
        {
          "step": 1,
          "title": "단계제목",
          "description": "상세 설명",
          "duration": 5,
          "tips": ["팁1", "팁2"]
        }
      ],
      "nutrition": {
        "calories": 250,
        "protein": "15",
        "carbs": "30",
        "fat": "10"
      },
      "vegetarian": true,
      "vegan": false,
      "glutenFree": true,
      "allergens": ["egg"],
      "tips": ["팁1", "팁2"]
    }
  ]
}

주의사항:
- 실제로 보유한 재료로 만들 수 있는 레시피를 우선으로
- 각 레시피는 최소 5단계 이상의 조리법 포함
- 조리시간은 현실적으로
- JSON만 반환하고 다른 텍스트는 없어야 함
- 마크다운 코드 블록 사용 금지`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
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

    // API 에러 응답 확인
    if (response.data.error) {
      throw new Error(
        `OpenRouter API Error: ${response.data.error.message || JSON.stringify(response.data.error)}`
      );
    }

    // 응답 파싱
    const apiContent = response.data.choices[0]?.message?.content;
    if (!apiContent) {
      throw new Error('API 응답에서 콘텐츠를 찾을 수 없습니다.');
    }

    // JSON 추출
    let jsonString = apiContent.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let recipesData;
    try {
      recipesData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', apiContent.substring(0, 200));
      throw new Error('API 응답을 JSON으로 파싱할 수 없습니다.');
    }

    // 레시피 정규화
    const normalizedRecipes = normalizeRecipes(
      recipesData.recipes || [],
      ingredients
    );

    // 결과 구성
    const result = {
      status: 'success',
      generationId: generateGenerationId(),
      recipes: normalizedRecipes,
      summary: {
        totalRecipes: normalizedRecipes.length,
        generatedAt: new Date().toISOString(),
        processingTime: apiTime,
        recipes: normalizedRecipes.map((r) => ({
          name: r.name,
          difficulty: r.difficulty,
          cookingTime: r.cookingTime,
        })),
      },
    };

    console.log(
      `📊 레시피 생성 완료: ${normalizedRecipes.length}개 레시피 생성`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    next(error);
  }
}

function normalizeRecipes(recipes, availableIngredients) {
  if (!Array.isArray(recipes)) {
    return [];
  }

  return recipes.map((recipe, index) => {
    const recipeIngredients = recipe.ingredients || [];
    const availableCount = recipeIngredients.filter((ing) => {
      const available = availableIngredients.some(
        (avail) =>
          avail.name?.toLowerCase() === ing.name?.toLowerCase() ||
          avail.englishName?.toLowerCase() === ing.name?.toLowerCase()
      );
      return available;
    }).length;

    const ingredientsCoverage =
      recipeIngredients.length > 0
        ? parseFloat((availableCount / recipeIngredients.length).toFixed(2))
        : 0;

    return {
      id: `recipe_${String(index + 1).padStart(3, '0')}`,
      name: recipe.name || 'Unnamed Recipe',
      nameEn: recipe.nameEn || 'unnamed',
      description: recipe.description || '',
      cookingTime: recipe.cookingTime || 30,
      prepTime: recipe.prepTime || 10,
      totalTime: (recipe.cookingTime || 30) + (recipe.prepTime || 10),
      servings: recipe.servings || 2,
      difficulty: recipe.difficulty || 'medium',
      cuisineType: recipe.cuisineType || 'other',
      ingredients: recipeIngredients.map((ing) => ({
        name: ing.name || '',
        quantity: String(ing.quantity || 1),
        unit: ing.unit || '개',
        required: ing.required !== false,
        available: availableIngredients.some(
          (avail) =>
            avail.name?.toLowerCase() === ing.name?.toLowerCase() ||
            avail.englishName?.toLowerCase() === ing.name?.toLowerCase()
        ),
      })),
      instructions: (recipe.instructions || []).map((instr) => ({
        step: instr.step || 0,
        title: instr.title || '',
        description: instr.description || '',
        duration: instr.duration || 5,
        tips: Array.isArray(instr.tips) ? instr.tips : [],
      })),
      nutrition: {
        calories: recipe.nutrition?.calories || 0,
        caloriesUnit: 'kcal',
        protein: String(recipe.nutrition?.protein || 0),
        proteinUnit: 'g',
        carbs: String(recipe.nutrition?.carbs || 0),
        carbsUnit: 'g',
        fat: String(recipe.nutrition?.fat || 0),
        fatUnit: 'g',
      },
      vegetarian: recipe.vegetarian || false,
      vegan: recipe.vegan || false,
      glutenFree: recipe.glutenFree || false,
      allergens: recipe.allergens || [],
      ingredientsCoverage: ingredientsCoverage,
      coveragePercentage: `${Math.round(ingredientsCoverage * 100)}%`,
      tips: recipe.tips || [],
    };
  });
}

function generateGenerationId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `gen_${timestamp}_${random}`;
}

module.exports = {
  generateRecipes,
};
