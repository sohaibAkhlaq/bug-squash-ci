const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }
            
            if (user.isAccountLocked && user.isAccountLocked()) {
                return res.status(403).json({ success: false, error: 'Account locked. Try again later.' });
            }
            
            if (!user.isActive) {
                return res.status(403).json({ success: false, error: 'Account deactivated. Contact admin.' });
            }
            
            req.user = user;
            next();
            
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ success: false, error: 'Invalid token' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
            }
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }
    }
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided. Authorization denied.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                error: `Role '${req.user.role}' is not authorized to access this resource` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
