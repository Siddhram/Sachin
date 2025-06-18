const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary with optimization
const uploadImage = async (file, folder = 'hidden-spots') => {
  try {
    const options = {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }, // Auto quality optimization
        { fetch_format: 'auto' } // Auto format selection
      ],
      eager: [
        { width: 400, height: 300, crop: 'fill', quality: 'auto:good' }, // Thumbnail
        { width: 800, height: 600, crop: 'limit', quality: 'auto:good' }  // Medium
      ],
      eager_async: true
    };

    const result = await cloudinary.uploader.upload(file, options);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
      medium: result.eager?.[1]?.secure_url || result.secure_url
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'hidden-spots') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw new Error('Failed to upload images');
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// Delete multiple images
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results.every(result => result === true);
  } catch (error) {
    console.error('Multiple image delete error:', error);
    throw new Error('Failed to delete images');
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto:good',
    fetch_format: 'auto'
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, {
    transformation: [finalOptions]
  });
};

// Generate responsive image URLs
const getResponsiveImageUrls = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 300, height: 200, crop: 'fill' }),
    small: getOptimizedImageUrl(publicId, { width: 600, height: 400, crop: 'limit' }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 600, crop: 'limit' }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 800, crop: 'limit' }),
    original: getOptimizedImageUrl(publicId, { width: 1920, height: 1080, crop: 'limit' })
  };
};

// Validate image file
const validateImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }

  return true;
};

// Process base64 image
const processBase64Image = async (base64String, folder = 'hidden-spots') => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const options = {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`, options);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Base64 image upload error:', error);
    throw new Error('Failed to process base64 image');
  }
};

// Get image analytics (if available)
const getImageAnalytics = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      fields: 'public_id,format,width,height,bytes,created_at,url'
    });
    
    return {
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      createdAt: result.created_at,
      url: result.url
    };
  } catch (error) {
    console.error('Image analytics error:', error);
    throw new Error('Failed to get image analytics');
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  validateImage,
  processBase64Image,
  getImageAnalytics
}; 