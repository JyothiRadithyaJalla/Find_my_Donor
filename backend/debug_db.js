const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';

async function checkDonors() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const donors = await mongoose.connection.db.collection('donors').find({}).toArray();
        console.log('Total donors:', donors.length);

        if (donors.length > 0) {
            console.log('First donor sample:', {
                _id: donors[0]._id,
                name: donors[0].name,
                userId: donors[0].userId
            });

            const missingUserId = donors.filter(d => !d.userId);
            console.log('Donors missing userId:', missingUserId.length);
        }

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('Total users:', users.length);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDonors();
