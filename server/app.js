// server/app.js - BugSquash CI API Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Passport & Session
const session = require('express-session');
const passport = require('./config/passport');

app.use(session({
    secret: process.env.SESSION_SECRET || 'bugsquash_secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));

// Compression & logging
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: '🚀 BugSquash CI API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            testcases: '/api/testcases'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/testcases', require('./routes/testCaseRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: true,
        credentials: true
    }
});

// Make io accessible to our router
app.set('io', io);

io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;