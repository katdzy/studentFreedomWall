const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Upload image to Cloudinary
const uploadImage = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'freedom-wall', // Organize images in a folder
      resource_type: 'auto', // Automatically detect file type
      quality: 'auto', // Automatic quality optimization
      fetch_format: 'auto', // Automatic format optimization
      ...options
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate optimized image URL with transformations
const getOptimizedUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    width: 800, // Max width for posts
    crop: 'scale'
  };
  
  return cloudinary.url(publicId, {
    ...defaultTransformations,
    ...transformations
  });
};

// Generate thumbnail URL
const getThumbnailUrl = (publicId) => {
  return cloudinary.url(publicId, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getOptimizedUrl,
  getThumbnailUrl
};
