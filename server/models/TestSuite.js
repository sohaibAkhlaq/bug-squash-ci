const mongoose = require('mongoose');

const testSuiteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Suite name is required'],
        trim: true
    },
    description: String,
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    parentSuiteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestSuite'
    },
    testCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCase'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    executionOrder: [{
        testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
        order: Number
    }],
    tags: [String],
    estimatedTime: Number
}, { timestamps: true });

testSuiteSchema.index({ projectId: 1 });
testSuiteSchema.index({ parentSuiteId: 1 });
testSuiteSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('TestSuite', testSuiteSchema);
