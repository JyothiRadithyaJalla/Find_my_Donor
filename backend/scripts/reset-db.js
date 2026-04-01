const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Connecting to Local DB...');
    const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/find_my_donor').asPromise();
    console.log('Connecting to Atlas DB...');
    const atlasConn = await mongoose.createConnection(process.env.MONGO_URI).asPromise();

    const collections = ['users', 'donors'];

    for (const colName of collections) {
      console.log(`Migrating collection: ${colName}...`);
      const localColl = localConn.db.collection(colName);
      const atlasColl = atlasConn.db.collection(colName);

      const data = await localColl.find({}).toArray();
      if (data.length > 0) {
        console.log(`Found ${data.length} records in ${colName}. Migrating...`);
        // Filter out existing data in Atlas to avoid duplicates if needed, but here we just insert
        try {
            await atlasColl.insertMany(data, { ordered: false });
            console.log(`Successfully migrated ${colName}.`);
        } catch (e) {
            console.log(`Some records in ${colName} might already exist or failed: ${e.message}`);
        }
      } else {
        console.log(`No records found in ${colName}.`);
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
