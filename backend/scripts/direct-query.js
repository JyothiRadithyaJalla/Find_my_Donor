const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

async function query() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db();
  const donor = await db.collection('donors').findOne({ location: { $exists: true } });
  console.log('Donor with location:', JSON.stringify(donor, null, 2));
  const count = await db.collection('donors').countDocuments();
  console.log('Total donors count:', count);
  await client.close();
  process.exit(0);
}

query();
