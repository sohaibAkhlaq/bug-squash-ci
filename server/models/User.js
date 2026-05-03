const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false  // CRITICAL: Never return password in queries!
        },
        role: {
            type: String,
            enum: ['admin', 'qa_engineer', 'developer', 'viewer'],
            default: 'viewer'
        },
        // Profile Information
        title: {
            type: String,
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        department: {
            type: String,
            enum: ['Engineering', 'QA', 'Product', 'DevOps', 'Other'],
            default: 'Other'
        },
        // Account Status
        isActive: {
            type: Boolean,
            default: true
        },
        lastLogin: Date,
        loginAttempts: {
            type: Number,
            default: 0,
            max: [5, 'Account locked due to too many failed attempts']
        },
        lockUntil: {
            type: Date
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        // Password Reset
        passwordResetToken: String,
        passwordResetExpires: Date,
        // Preferences
        preferences: {
            notifications: {
                type: Boolean,
                default: true
            },
            theme: {
                type: String,
                enum: ['light', 'dark', 'system'],
                default: 'system'
            }
        }
    },
    {
        timestamps: true
    }
);

// ============================================
// INDEXES (For Performance)
// ============================================
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================
userSchema.virtual('fullProfile').get(function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        department: this.department
    };
});

// ============================================
// MIDDLEWARE: Hash Password Before Save
// ============================================
userSchema.pre('save', async function() {
    // Only hash if password was modified
    if (!this.isModified('password')) {
        return;
    }
    
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ============================================
// INSTANCE METHODS
// ============================================

// Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isAccountLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
    // Reset attempts if lock has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
        this.loginAttempts = 1;
        this.lockUntil = undefined;
    } else {
        this.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (this.loginAttempts >= 5) {
            this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
        }
    }
    
    return await this.save();
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function() {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    this.lastLogin = new Date();
    return await this.save();
};

// Generate JWT Token
userSchema.methods.generateAuthToken = function() {
    const payload = {
        id: this._id,
        email: this.email,
        role: this.role,
        name: this.name
    };
    
    // Sign token with secret key
    const token = require('jsonwebtoken').sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    return token;
};

// Get public profile (safe to send to client)
userSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        title: this.title,
        department: this.department,
        preferences: this.preferences,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;