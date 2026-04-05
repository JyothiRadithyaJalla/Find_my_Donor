const mongoose = require('mongoose');
const Donor = require('../models/Donor');
require('dotenv').config({ path: __dirname + '/../.env' });

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  const donor = await Donor.findOne({ location: { $exists: true } });
  console.log('Donor with location:', JSON.stringify(donor, null, 2));
  process.exit(0);
}

inspect();
