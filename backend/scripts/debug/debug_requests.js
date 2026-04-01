const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';

async function checkRequests() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const requests = await mongoose.connection.db.collection('bloodrequests').find({}).sort({ createdAt: -1 }).limit(5).toArray();
        console.log('Recent requests:', JSON.stringify(requests, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkRequests();
