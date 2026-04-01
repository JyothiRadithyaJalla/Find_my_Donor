const axios = require('axios');

async function testFullFlow() {
    try {
        // 1. Get a token (needs to login)
        // I'll look for an existing user in the DB first
        const mongoose = require('mongoose');
        require('dotenv').config();
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';
        await mongoose.connect(MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({ role: 'recipient' }).limit(1).toArray();
        if (users.length === 0) {
            console.log('No recipient user found in DB to test');
            return;
        }
        const user = users[0];
        console.log('Found recipient user:', user.email);

        // We can't easily login without knowing the password, but we can generate a test token
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
        console.log('Generated test token:', token);

        const api = axios.create({ baseURL: 'http://localhost:5005' });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 2. Search
        const searchRes = await api.get('/api/donors/search');
        console.log(`Found ${searchRes.data.length} donors`);
        if (searchRes.data.length > 0) {
            const donor = searchRes.data[0];
            console.log('Testing request to donor:', donor.name, '_id:', donor._id);

            // 3. Post request
            try {
                const reqRes = await api.post('/api/requests', {
                    donorId: donor._id,
                    hospitalName: 'Test Hospital',
                    patientName: 'Test Patient'
                });
                console.log('Request Sent Status:', reqRes.status);
                console.log('Request Sent Data:', reqRes.data);
            } catch (err) {
                console.error('POST /api/requests failed:', err.response?.data || err.message);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Flow failed:', err.message);
        process.exit(1);
    }
}

testFullFlow();
