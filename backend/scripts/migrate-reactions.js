const mongoose = require('mongoose');
const Reaction = require('../models/Reaction');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/freedomwall', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function migrateReactions() {
  try {
    console.log('🔄 Starting reaction migration...');
    
    // Find all reactions with null postId or missing post field
    const problematicReactions = await Reaction.find({
      $or: [
        { postId: null },
        { post: null },
        { postId: { $exists: false } },
        { post: { $exists: false } }
      ]
    });
    
    console.log(`📊 Found ${problematicReactions.length} problematic reactions`);
    
    if (problematicReactions.length > 0) {
      console.log('🗑️ Removing problematic reactions...');
      await Reaction.deleteMany({
        $or: [
          { postId: null },
          { post: null },
          { postId: { $exists: false } },
          { post: { $exists: false } }
        ]
      });
      console.log('✅ Problematic reactions removed');
    }
    
    // Find reactions that have postId but not post
    const reactionsToUpdate = await Reaction.find({
      postId: { $exists: true, $ne: null },
      $or: [
        { post: { $exists: false } },
        { post: null }
      ]
    });
    
    console.log(`🔄 Updating ${reactionsToUpdate.length} reactions with missing post field...`);
    
    for (const reaction of reactionsToUpdate) {
      reaction.post = reaction.postId;
      await reaction.save();
    }
    
    // Find reactions that have post but not postId
    const reactionsToUpdate2 = await Reaction.find({
      post: { $exists: true, $ne: null },
      $or: [
        { postId: { $exists: false } },
        { postId: null }
      ]
    });
    
    console.log(`🔄 Updating ${reactionsToUpdate2.length} reactions with missing postId field...`);
    
    for (const reaction of reactionsToUpdate2) {
      reaction.postId = reaction.post;
      await reaction.save();
    }
    
    // Find reactions that have type but not reactionType
    const reactionsToUpdate3 = await Reaction.find({
      type: { $exists: true, $ne: null },
      $or: [
        { reactionType: { $exists: false } },
        { reactionType: null }
      ]
    });
    
    console.log(`🔄 Updating ${reactionsToUpdate3.length} reactions with missing reactionType field...`);
    
    for (const reaction of reactionsToUpdate3) {
      reaction.reactionType = reaction.type;
      await reaction.save();
    }
    
    // Find reactions that have reactionType but not type
    const reactionsToUpdate4 = await Reaction.find({
      reactionType: { $exists: true, $ne: null },
      $or: [
        { type: { $exists: false } },
        { type: null }
      ]
    });
    
    console.log(`🔄 Updating ${reactionsToUpdate4.length} reactions with missing type field...`);
    
    for (const reaction of reactionsToUpdate4) {
      reaction.type = reaction.reactionType;
      await reaction.save();
    }
    
    // Check for duplicate reactions and remove them
    console.log('🔍 Checking for duplicate reactions...');
    const duplicates = await Reaction.aggregate([
      {
        $group: {
          _id: {
            post: '$post',
            postId: '$postId',
            userFingerprint: '$userFingerprint'
          },
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (duplicates.length > 0) {
      console.log(`🗑️ Found ${duplicates.length} duplicate reaction groups, removing duplicates...`);
      
      for (const duplicate of duplicates) {
        // Keep the first one, remove the rest
        const docsToRemove = duplicate.docs.slice(1);
        await Reaction.deleteMany({ _id: { $in: docsToRemove } });
      }
      
      console.log('✅ Duplicates removed');
    }
    
    // Final verification
    const finalCount = await Reaction.countDocuments();
    console.log(`✅ Migration complete! Total reactions: ${finalCount}`);
    
    // Show sample of updated reactions
    const sampleReactions = await Reaction.find({}).limit(3).lean();
    console.log('📋 Sample reactions after migration:');
    sampleReactions.forEach((reaction, index) => {
      console.log(`  ${index + 1}. Post: ${reaction.post}, PostId: ${reaction.postId}, Type: ${reaction.reactionType || reaction.type}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateReactions();
