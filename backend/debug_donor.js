const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';

async function checkSpecificDonor() {
    try {
        await mongoose.connect(MONGO_URI);
        const donor = await mongoose.connection.db.collection('donors').findOne({ name: /sathyanarayan/i });
        if (donor) {
            console.log('Donor ID:', donor._id.toString());
            console.log('Donor userId:', donor.userId?.toString());
            
            if (donor.userId) {
                const user = await mongoose.connection.db.collection('users').findOne({ _id: donor.userId });
                if (user) {
                    console.log('Linked User ID:', user._id.toString());
                } else {
                    console.log('Linked User NOT FOUND for ID:', donor.userId.toString());
                }
            } else {
                console.log('Donor HAS NO userId field!');
            }
        } else {
            console.log('Donor "sathyanarayan" NOT FOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSpecificDonor();
