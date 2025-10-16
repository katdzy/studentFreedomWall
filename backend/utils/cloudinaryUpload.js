const multer = require('multer');
const { uploadImage } = require('../config/cloudinary');

// Configure multer to store files in memory (for Cloudinary upload)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file per upload
  }
});

// Middleware to handle Cloudinary upload
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // No file to upload
    }

    // Convert buffer to base64 for Cloudinary
    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await uploadImage(dataURI, {
      public_id: `post-${Date.now()}-${Math.round(Math.random() * 1E9)}`
    });

    if (!uploadResult.success) {
      return res.status(400).json({
        message: 'Failed to upload image',
        error: uploadResult.error
      });
    }

    // Store Cloudinary data in request
    req.cloudinaryData = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    };

    next();
  } catch (error) {
    console.error('Cloudinary upload middleware error:', error);
    res.status(500).json({
      message: 'Error processing image upload',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadToCloudinary
};
