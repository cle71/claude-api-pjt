const express = require('express');
const { generateRecipes } = require('../controllers/recipeController');

const router = express.Router();

router.post('/generate', generateRecipes);

module.exports = router;
