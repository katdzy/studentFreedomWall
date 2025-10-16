const mongoose = require('mongoose');
const Post = require('../models/Post');
const { uploadImage } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freedomwall', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function migratePosts() {
  try {
    console.log('🔄 Starting migration to Cloudinary...');
    
    // Find posts with local photo URLs
    const postsWithLocalPhotos = await Post.find({
      photoUrl: { $regex: '^/uploads/' },
      photoPublicId: { $exists: false }
    });
    
    console.log(`📊 Found ${postsWithLocalPhotos.length} posts with local photos to migrate`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const post of postsWithLocalPhotos) {
      try {
        const localPath = path.join(__dirname, '..', post.photoUrl);
        
        // Check if file exists
        if (!fs.existsSync(localPath)) {
          console.log(`⚠️  File not found: ${post.photoUrl}`);
          failed++;
          continue;
        }
        
        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(localPath);
        const base64 = fileBuffer.toString('base64');
        const dataURI = `data:image/${path.extname(post.photoUrl).slice(1)};base64,${base64}`;
        
        // Upload to Cloudinary
        const uploadResult = await uploadImage(dataURI, {
          public_id: `migrated-post-${post._id}-${Date.now()}`
        });
        
        if (uploadResult.success) {
          // Update post with Cloudinary data
          await Post.findByIdAndUpdate(post._id, {
            photoUrl: uploadResult.url,
            photoPublicId: uploadResult.public_id
          });
          
          console.log(`✅ Migrated post ${post._id}: ${post.photoUrl} -> ${uploadResult.url}`);
          migrated++;
          
          // Optionally delete local file (uncomment if you want to clean up)
          // fs.unlinkSync(localPath);
          // console.log(`🗑️  Deleted local file: ${post.photoUrl}`);
          
        } else {
          console.log(`❌ Failed to upload ${post.photoUrl}: ${uploadResult.error}`);
          failed++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing post ${post._id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n📈 Migration complete!`);
    console.log(`✅ Successfully migrated: ${migrated} posts`);
    console.log(`❌ Failed: ${failed} posts`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migratePosts();
