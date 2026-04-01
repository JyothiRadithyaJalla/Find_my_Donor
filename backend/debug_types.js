const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';

async function checkTypes() {
    try {
        await mongoose.connect(MONGO_URI);
        const donorsCol = mongoose.connection.db.collection('donors');
        const donor = await donorsCol.findOne({ name: /sathyanarayan/i });
        
        if (donor) {
            console.log('Donor userId type:', typeof donor.userId);
            console.log('Is donor.userId an instance of ObjectId?', donor.userId instanceof mongoose.Types.ObjectId);
            console.log('donor.userId value:', donor.userId);
        } else {
            console.log('Donor not found');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTypes();
