const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  const counts = {};
  for (const coll of collections) {
    counts[coll.name] = await mongoose.connection.db.collection(coll.name).countDocuments();
  }
  console.log('Counts:', counts);
  process.exit(0);
}

check();
