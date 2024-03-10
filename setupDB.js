const MongoClient = require('mongodb').MongoClient;


const url = 'mongodb://localhost:27017';


const dbName = 'files_manager';


MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
  if (err) {
    console.error('error connecting to MongoDB: ', err);
    return;
  }

  console.log("Connected successfully");

  const db = client.db(dbName);

  // Check 'users' collection
  checkAndInsert(db, 'users', 4, { name: 'User' });

  // Check 'files' collection
  checkAndInsert(db, 'files', 30, { name: 'File' });
});

function checkAndInsert(db, collectionName, requiredCount) {
  const collection = db.collection(collectionName);
  collection.countDocuments((err, count) => {
    if (err) {
      console.error(`error counting documents in '${collectionName}': `, err);
      return;
    }

    if (count < requiredCount) {
      const documents = Array.from({ length: requiredCount - count }, (_, i) => {
        return { name: `${collectionName} ${i + count + 1}` };
      });

      collection.insertMany(documents, (err, result) => {
        if (err) {
          console.error(`error inserting documents into '${collectionName}': `, err);
        }
      });
    }
  });
}
