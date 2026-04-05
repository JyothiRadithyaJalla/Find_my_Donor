const mongoose = require('mongoose');
const Donor = require('../models/Donor');
require('dotenv').config();

async function checkIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const collection = mongoose.connection.collection('donors');
    const indexes = await collection.indexes();
    console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

    const hasGeoIndex = indexes.some(idx => idx.key && idx.key.location === '2dsphere');
    if (!hasGeoIndex) {
      console.log('Creating 2dsphere index...');
      await collection.createIndex({ location: '2dsphere' });
      console.log('Index created!');
    } else {
      console.log('Index already exists.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkIndex();
