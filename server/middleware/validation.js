const validateEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    if (!email || !validateEmail(email)) {
        errors.push('A valid email address is required');
    }
    if (!validatePassword(password)) {
        errors.push('Password must be at least 6 characters');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    
    next();
};

const validateTestCase = (req, res, next) => {
    const { testId, title, description, createdBy } = req.body;
    const errors = [];
    
    if (!testId || testId.trim().length === 0) errors.push('Test ID is required');
    if (!title || title.trim().length === 0) errors.push('Title is required');
    if (!description || description.trim().length === 0) errors.push('Description is required');
    if (!createdBy || createdBy.trim().length === 0) errors.push('Created by is required');
    
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    
    next();
};

module.exports = { validateRegister, validateTestCase };
