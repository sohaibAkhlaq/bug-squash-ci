const express = require('express');
const router = express.Router();
const { generateTestCase, analyzeFailure } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateTestCase);
router.post('/analyze', protect, analyzeFailure);

module.exports = router;
