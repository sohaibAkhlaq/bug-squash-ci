const mongoose = require('mongoose');

// A Schema is a BLUEPRINT for how data should look
const testCaseSchema = new mongoose.Schema(
    {
        // Basic Information
        testId: {
            type: String,
            required: [true, 'Test ID is required'],
            unique: true,
            trim: true,
            uppercase: true
        },
        title: {
            type: String,
            required: [true, 'Test title is required'],
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Test description is required']
        },
        
        // Test Steps (Array of objects - MongoDB specific feature!)
        steps: [{
            stepNumber: Number,
            action: String,
            expectedResult: String
        }],
        
        // QA Classification
        type: {
            type: String,
            enum: ['Manual', 'Automated', 'Performance', 'Security'],
            default: 'Manual'
        },
        priority: {
            type: String,
            enum: ['Critical', 'High', 'Medium', 'Low'],
            default: 'Medium'
        },
        status: {
            type: String,
            enum: ['Draft', 'Active', 'Deprecated', 'Under Review'],
            default: 'Draft'
        },
        
        // Execution Tracking
        lastExecuted: Date,
        executionHistory: [{
            executedBy: String,
            executedAt: Date,
            result: {
                type: String,
                enum: ['Passed', 'Failed', 'Blocked', 'Skipped']
            },
            actualResult: String,
            executionTime: Number, // in milliseconds
            screenshot: String, // URL to screenshot
            logs: String
        }],
        
        // Automation Details (for Selenium/Katalon integration)
        automationScript: {
            scriptType: {
                type: String,
                enum: ['Selenium', 'Katalon', 'Playwright', 'None'],
                default: 'None'
            },
            scriptPath: String,
            parameters: mongoose.Schema.Types.Mixed // Flexible object
        },
        
        // Meta Information
        tags: [String],
        createdBy: {
            type: String,
            required: true
        },
        assignedTo: String,
        estimatedTime: Number, // in minutes
        
        // QA Metrics (Important for reporting!)
        defectCount: {
            type: Number,
            default: 0,
            min: 0
        },
        passRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    {
        // Automatically adds createdAt and updatedAt fields
        timestamps: true
    }
);

// LEARNING MOMENT: Indexing for Performance
// Create index on fields we search frequently
// This is how we achieve "40% faster queries" on resume!
testCaseSchema.index({ status: 1 });
testCaseSchema.index({ priority: 1 });
testCaseSchema.index({ tags: 1 });

// Compound index (multiple fields together)
testCaseSchema.index({ type: 1, status: 1 });

// Virtual Property (calculated field, not stored in DB)
testCaseSchema.virtual('totalExecutions').get(function() {
    return this.executionHistory.length;
});

// Method to calculate pass rate (Business Logic)
testCaseSchema.methods.calculatePassRate = function() {
    if (this.executionHistory.length === 0) return 0;
    
    const passedTests = this.executionHistory.filter(
        exec => exec.result === 'Passed'
    ).length;
    
    this.passRate = (passedTests / this.executionHistory.length) * 100;
    return this.passRate;
};

// Pre-save middleware (runs before saving to DB)
testCaseSchema.pre('save', function() {
    // Automatically calculate pass rate before saving
    if (this.executionHistory.length > 0) {
        this.calculatePassRate();
    }
});

const TestCase = mongoose.model('TestCase', testCaseSchema);

module.exports = TestCase;