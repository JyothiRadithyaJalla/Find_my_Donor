require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Start Server
const server = app.listen(PORT, () => {
    console.log(`
    ========================================
    Find My Donor Server
    Running on port: ${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    ========================================
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
