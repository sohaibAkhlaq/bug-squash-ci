const TestCase = require('../models/TestCase');
const emailService = require('../services/emailService');

// @desc    Get all test cases with filtering, sorting, pagination
// @route   GET /api/testcases
// @access  Private
const getTestCases = async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludeFields.forEach(field => delete queryObj[field]);
        
        // Advanced filtering (gte, gt, lte, lt, in)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);
        
        let query = TestCase.find(JSON.parse(queryStr));
        
        // Search by title or testId
        if (req.query.search) {
            query = query.find({
                $or: [
                    { title: { $regex: req.query.search, $options: 'i' } },
                    { testId: { $regex: req.query.search, $options: 'i' } },
                    { description: { $regex: req.query.search, $options: 'i' } }
                ]
            });
        }
        
        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
        
        // Field selection
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        query = query.skip(skip).limit(limit);
        
        const testCases = await query;
        const total = await TestCase.countDocuments(JSON.parse(queryStr));
        
        res.status(200).json({
            success: true,
            count: testCases.length,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            data: testCases
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single test case
// @route   GET /api/testcases/:id
// @access  Private
const getTestCase = async (req, res) => {
    try {
        const testCase = await TestCase.findById(req.params.id);
        if (!testCase) {
            return res.status(404).json({ success: false, error: 'Test case not found' });
        }
        res.status(200).json({ success: true, data: testCase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create test case
// @route   POST /api/testcases
// @access  Private (Admin, QA Engineer)
const createTestCase = async (req, res) => {
    try {
        // Check for duplicate testId
        const existing = await TestCase.findOne({ testId: req.body.testId });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Test ID already exists' });
        }
        
        const testCase = await TestCase.create(req.body);
        
        // Real-time update
        const io = req.app.get('io');
        io.emit('testCaseCreated', testCase);
        io.emit('statsUpdated');
        
        res.status(201).json({ success: true, data: testCase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update test case
// @route   PUT /api/testcases/:id
// @access  Private (Admin, QA Engineer)
const updateTestCase = async (req, res) => {
    try {
        const testCase = await TestCase.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!testCase) {
            return res.status(404).json({ success: false, error: 'Test case not found' });
        }
        
        // Real-time update
        const io = req.app.get('io');
        io.emit('testCaseUpdated', testCase);
        io.emit('statsUpdated');
        
        // Email notification (Industry level feature)
        if (req.user && req.user.email) {
            emailService.sendTestNotification(req.user.email, testCase);
        }
        
        res.status(200).json({ success: true, data: testCase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete test case
// @route   DELETE /api/testcases/:id
// @access  Private (Admin only)
const deleteTestCase = async (req, res) => {
    try {
        const testCase = await TestCase.findById(req.params.id);
        if (!testCase) {
            return res.status(404).json({ success: false, error: 'Test case not found' });
        }
        await testCase.deleteOne();
        
        // Real-time update
        const io = req.app.get('io');
        io.emit('testCaseDeleted', req.params.id);
        io.emit('statsUpdated');
        
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add execution record to test case
// @route   POST /api/testcases/:id/execute
// @access  Private (Admin, QA Engineer, Developer)
const addExecutionRecord = async (req, res) => {
    try {
        const testCase = await TestCase.findById(req.params.id);
        if (!testCase) {
            return res.status(404).json({ success: false, error: 'Test case not found' });
        }
        
        testCase.executionHistory.push({
            ...req.body,
            executedAt: new Date()
        });
        testCase.lastExecuted = new Date();
        testCase.calculatePassRate();
        await testCase.save();
        
        res.status(200).json({ success: true, data: testCase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get QA metrics summary
// @route   GET /api/testcases/metrics/summary
// @access  Private
const getMetrics = async (req, res) => {
    try {
        // Overall summary
        const metrics = await TestCase.aggregate([
            {
                $group: {
                    _id: null,
                    totalTests: { $sum: 1 },
                    avgPassRate: { $avg: '$passRate' },
                    totalDefects: { $sum: '$defectCount' },
                    automatedCount: { $sum: { $cond: [{ $eq: ['$type', 'Automated'] }, 1, 0] } },
                    manualCount: { $sum: { $cond: [{ $eq: ['$type', 'Manual'] }, 1, 0] } },
                    performanceCount: { $sum: { $cond: [{ $eq: ['$type', 'Performance'] }, 1, 0] } },
                    securityCount: { $sum: { $cond: [{ $eq: ['$type', 'Security'] }, 1, 0] } }
                }
            }
        ]);
        
        // Status breakdown
        const statusBreakdown = await TestCase.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Priority breakdown
        const priorityBreakdown = await TestCase.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        // Recent executions
        const recentExecutions = await TestCase.aggregate([
            { $unwind: '$executionHistory' },
            { $sort: { 'executionHistory.executedAt': -1 } },
            { $limit: 10 },
            {
                $project: {
                    testId: 1,
                    title: 1,
                    result: '$executionHistory.result',
                    executedAt: '$executionHistory.executedAt',
                    executedBy: '$executionHistory.executedBy'
                }
            }
        ]);
        
        // Execution results distribution
        const executionResults = await TestCase.aggregate([
            { $unwind: '$executionHistory' },
            { $group: { _id: '$executionHistory.result', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                summary: metrics[0] || { 
                    totalTests: 0, avgPassRate: 0, totalDefects: 0, 
                    automatedCount: 0, manualCount: 0, performanceCount: 0, securityCount: 0 
                },
                byStatus: statusBreakdown,
                byPriority: priorityBreakdown,
                recentExecutions,
                executionResults
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getTestCases, getTestCase, createTestCase,
    updateTestCase, deleteTestCase, addExecutionRecord, getMetrics
};
