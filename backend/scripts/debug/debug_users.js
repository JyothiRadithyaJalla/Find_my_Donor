const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('Users found:', users.length);
        users.forEach(u => console.log(`- ${u.name} (${u.role}) ID: ${u._id}`));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listUsers();
