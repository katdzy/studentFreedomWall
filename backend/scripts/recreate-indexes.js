const mongoose = require('mongoose');
const Reaction = require('../models/Reaction');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/freedomwall', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function recreateIndexes() {
  try {
    console.log('🔄 Recreating reaction indexes...');
    
    // Drop all existing indexes
    await Reaction.collection.dropIndexes();
    console.log('✅ Dropped existing indexes');
    
    // Recreate the indexes
    await Reaction.ensureIndexes();
    console.log('✅ Recreated indexes');
    
    // List current indexes
    const indexes = await Reaction.collection.getIndexes();
    console.log('📋 Current indexes:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`  - ${indexName}: ${JSON.stringify(indexes[indexName].key)}`);
    });
    
  } catch (error) {
    console.error('❌ Index recreation failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run index recreation
recreateIndexes();
