const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', login);

// Google OAuth
const passport = require('passport');
router.get('/google', (req, res, next) => {
    if (!passport._strategy('google')) {
        return res.status(501).json({ 
            success: false, 
            error: 'Google Login is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' 
        });
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    if (!passport._strategy('google')) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:4200'}/login?error=google_not_configured`);
    }
    passport.authenticate('google', { failureRedirect: '/login' })(req, res, next);
}, (req, res) => {
    // Successful authentication, generate JWT and redirect
    const token = req.user.generateAuthToken();
    // Redirect to frontend with token in query param
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:4200'}/login?token=${token}&user=${JSON.stringify(req.user.getPublicProfile())}`);
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
