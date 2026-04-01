const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth.routes');
const donorRoutes = require('./routes/donor.routes');
const requestRoutes = require('./routes/request.routes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Main entry point health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Find My Donor API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);

// Error Handling (optional but professional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

module.exports = app;
