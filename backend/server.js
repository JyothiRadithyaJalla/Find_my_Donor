require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const donorRoutes = require('./routes/donorRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Find My Donor API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';
mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
