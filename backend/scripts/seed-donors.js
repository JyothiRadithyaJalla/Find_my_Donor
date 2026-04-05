const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Donor = require('../models/Donor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/find_my_donor';

const AREA_COORDS = {
  "Ameerpet": [78.4485, 17.4375],
  "Banjara Hills": [78.4447, 17.4150],
  "Jubilee Hills": [78.4111, 17.4299],
  "Madhapur": [78.3831, 17.4483],
  "Gachibowli": [78.3489, 17.4401],
  "Kukatpally": [78.3996, 17.4834],
  "Secunderabad": [78.4983, 17.4399],
  "Kondapur": [78.3615, 17.4623],
  "Begumpet": [78.4619, 17.4448],
  "Hitec City": [78.3758, 17.4435],
  "Uppal": [78.5581, 17.3984],
  "Dilshuknagar": [78.5247, 17.3685],
  "Miyapur": [78.3512, 17.4948],
  "LB Nagar": [78.5485, 17.3457],
  "Manikonda": [78.3820, 17.3995]
};

const AREAS = Object.keys(AREA_COORDS);
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

async function seedDonors() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    let count = 0;

    for (const area of AREAS) {
      for (const bg of BLOOD_GROUPS) {
        const name = `${area} ${bg} Donor`;
        const email = `${area.toLowerCase().replace(/\s/g, '')}.${bg.toLowerCase().replace(/[+-]/g, (m) => m === '+' ? 'plus' : 'minus')}@example.com`;
        const phone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
        const coords = AREA_COORDS[area];

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
            location: {
              type: 'Point',
              coordinates: coords
            },
            phoneNumber: phone
          });
          await donor.save();
          count++;
        } else {
          // Force update location and coordinates
          donor.location = {
            type: 'Point',
            coordinates: coords
          };
          // Also set city while we are at it
          donor.city = 'Hyderabad';
          await donor.save();
          count++;
        }
      }
      console.log(`Finished seeding area: ${area}`);
    }

    console.log(`Successfully added/updated ${count} donors across all areas and blood groups.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDonors();
