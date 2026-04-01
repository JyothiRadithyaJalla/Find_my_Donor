const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Donor = require('./models/Donor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';

const AREAS = [
  "Ameerpet", "Banjara Hills", "Jubilee Hills", "Madhapur",
  "Gachibowli", "Kukatpally", "Secunderabad", "Kondapur",
  "Begumpet", "Hitec City", "Uppal", "Dilshuknagar",
  "Miyapur", "LB Nagar", "Manikonda"
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

async function seedDonors() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing donors and their users to avoid duplicates
    // Actually, we skip clearing to avoid deleting user-created data.
    // Instead, we'll just add new ones.

    const hashedPassword = await bcrypt.hash('password123', 10);
    let count = 0;

    for (const area of AREAS) {
      for (const bg of BLOOD_GROUPS) {
        const name = `${area} ${bg} Donor`;
        const email = `${area.toLowerCase().replace(/\s/g, '')}.${bg.toLowerCase().replace(/[+-]/g, (m) => m === '+' ? 'plus' : 'minus')}@example.com`;
        const phone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'donor',
            phoneNumber: phone
          });
          await user.save();
        }

        // Check if donor already exists
        let donor = await Donor.findOne({ userId: user._id });
        if (!donor) {
          donor = new Donor({
            userId: user._id,
            name,
            bloodGroup: bg,
            area,
            phoneNumber: phone
          });
          await donor.save();
          count++;
        }
      }
      console.log(`Finished seeding area: ${area}`);
    }

    console.log(`Successfully added ${count} new donors across all areas and blood groups.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDonors();
