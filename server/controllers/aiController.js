const aiService = require('../services/aiService');

const generateTestCase = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ success: false, error: 'Description is required' });
        }

        const testCase = await aiService.generateTestCase(description);
        res.status(200).json({ success: true, data: testCase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const analyzeFailure = async (req, res) => {
    try {
        const { testCase, failureDetails } = req.body;
        const analysis = await aiService.analyzeTestFailure(testCase, failureDetails);
        res.status(200).json({ success: true, data: analysis });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { generateTestCase, analyzeFailure };
