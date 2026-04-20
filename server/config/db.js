// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // mongoose.connect() returns a Promise
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Log the database name
        console.log(`📁 Database: ${conn.connection.name}`);
        
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;