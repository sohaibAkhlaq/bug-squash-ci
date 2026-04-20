const express = require('express');
const router = express.Router();
const {
    getTestCases, getTestCase, createTestCase,
    updateTestCase, deleteTestCase, addExecutionRecord, getMetrics
} = require('../controllers/testCaseController');
const { protect, authorize } = require('../middleware/auth');
const { validateTestCase } = require('../middleware/validation');

// All test case routes are protected
router.use(protect);

// Metrics route (must be before /:id to avoid conflict)
router.get('/metrics/summary', getMetrics);

// CRUD routes
router.route('/')
    .get(getTestCases)
    .post(authorize('admin', 'qa_engineer'), validateTestCase, createTestCase);

router.route('/:id')
    .get(getTestCase)
    .put(authorize('admin', 'qa_engineer'), updateTestCase)
    .delete(authorize('admin'), deleteTestCase);

// Execution route
router.post('/:id/execute', authorize('admin', 'qa_engineer', 'developer'), addExecutionRecord);

module.exports = router;
