const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    console.log(`[DEBUG] Registration attempt for email: ${req.body.email}`);
    try {
        const { name, email, password, role, title, department } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }
        
        // Create user
        const user = await User.create({
            name, email, password,
            role: role || 'viewer',
            title, department
        });
        
        // Generate token
        const token = user.generateAuthToken();
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        email = email.trim().toLowerCase();
        password = password.trim();
        
        // Find user with password field
        const user = await User.findOne({ email }).select('+password');
        
        console.log(`[DEBUG] Login attempt for: ${email}`);
        if (!user) {
            console.log(`[DEBUG] User not found for: ${email}`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        // Check if account is locked
        if (user.isAccountLocked && user.isAccountLocked()) {
            return res.status(403).json({ 
                success: false, 
                error: 'Account locked due to too many failed attempts. Try again in 30 minutes.' 
            });
        }
        
        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ success: false, error: 'Account deactivated. Contact administrator.' });
        }
        
        // Verify password
        const isPasswordCorrect = await user.comparePassword(password);
        console.log(`[DEBUG] Password correct for ${email}: ${isPasswordCorrect}`);
        
        if (!isPasswordCorrect) {
            await user.incrementLoginAttempts();
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        // Reset login attempts on successful login
        await user.resetLoginAttempts();
        
        // Generate token
        const token = user.generateAuthToken();
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        res.status(200).json({ success: true, data: req.user.getPublicProfile() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, title, department, preferences } = req.body;
        const updateFields = {};
        if (name) updateFields.name = name;
        if (title) updateFields.title = title;
        if (department) updateFields.department = department;
        if (preferences) updateFields.preferences = preferences;
        
        const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
            new: true, runValidators: true
        });
        
        res.status(200).json({ success: true, data: user.getPublicProfile() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Current and new password are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
        }
        
        const user = await User.findById(req.user.id).select('+password');
        
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, updateProfile, changePassword, logout };
