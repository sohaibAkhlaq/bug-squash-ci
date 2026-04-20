const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    key: {
        type: String,
        required: [true, 'Project key is required'],
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [10, 'Key cannot exceed 10 characters']
    },
    description: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' }
    }],
    status: {
        type: String,
        enum: ['Active', 'Archived', 'Completed'],
        default: 'Active'
    },
    settings: {
        defaultAssignee: String,
        testIdPrefix: String,
        visibility: { type: String, enum: ['private', 'team', 'public'], default: 'team' }
    }
}, { timestamps: true });

projectSchema.index({ key: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
