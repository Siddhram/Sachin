const express = require('express');
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Spot = require('../models/Spot');
const { authenticateToken, checkOwnership } = require('../middleware/auth');
const { uploadImage, uploadMultipleImages, deleteMultipleImages } = require('../utils/cloudinary');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3 // Max 3 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation middleware
const validateComment = [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment content must be between 1 and 500 characters'),
  body('isAnonymous')
    .optional()
    .isIn(['true', 'false', true, false])
    .withMessage('isAnonymous must be true or false'),
  body('rating')
    .optional()
    .isString()
    .withMessage('Rating must be a JSON string')
];

// @route   GET /api/comments
// @desc    Get user's comments
// @access  Private
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please check your query parameters',
        details: errors.array()
      });
    }

    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.getUserComments(req.user._id, parseInt(page), parseInt(limit));

    res.json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      error: 'Failed to get comments',
      message: 'Something went wrong'
    });
  }
});

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', authenticateToken, upload.array('images', 3), validateComment, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    console.log('Comment creation request body:', req.body);
    console.log('Files:', req.files);

    const {
      spotId,
      content,
      isAnonymous = 'false',
      rating
    } = req.body;

    // Convert string values to appropriate types
    const isAnonymousBool = isAnonymous === 'true' || isAnonymous === true;

    // Check if spot exists
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({
        error: 'Spot not found',
        message: 'The requested spot does not exist'
      });
    }

    let uploadedImages = [];

    // Upload images if provided
    if (req.files && req.files.length > 0) {
      try {
        uploadedImages = await uploadMultipleImages(req.files, 'hidden-spots/comments');
      } catch (uploadError) {
        return res.status(400).json({
          error: 'Image upload failed',
          message: uploadError.message
        });
      }
    }

    // Create comment
    let parsedRating;
    if (rating) {
      try {
        parsedRating = JSON.parse(rating);
        console.log('Parsed rating:', parsedRating);
      } catch (parseError) {
        console.error('Error parsing rating JSON:', parseError);
        return res.status(400).json({
          error: 'Invalid rating format',
          message: 'Rating must be a valid JSON string'
        });
      }
    }

    const comment = new Comment({
      spotId,
      userId: req.user._id,
      content,
      isAnonymous: isAnonymousBool,
      rating: parsedRating,
      images: uploadedImages.map(img => ({
        url: img.url,
        publicId: img.publicId,
        caption: ''
      }))
    });

    await comment.save();

    // Increment user stats
    try {
      await req.user.incrementStats('totalComments');
    } catch (statsError) {
      console.error('Error incrementing user stats:', statsError);
      // Don't fail the comment creation if stats update fails
    }

    // Populate user info for response
    await comment.populate('userId', 'username profilePicture');

    res.status(201).json({
      message: 'Comment created successfully',
      comment: comment
    });

  } catch (error) {
    console.error('Create comment error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      spotId: req.body.spotId,
      content: req.body.content,
      rating: req.body.rating
    });
    res.status(500).json({
      error: 'Failed to create comment',
      message: 'Something went wrong'
    });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private (Owner only)
router.put('/:id', authenticateToken, checkOwnership('Comment'), upload.array('images', 3), [
  body('content').optional().isLength({ min: 1, max: 500 }),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const comment = req.resource;
    const updateData = { ...req.body };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      try {
        const newImages = await uploadMultipleImages(req.files, 'hidden-spots/comments');
        const existingImages = comment.images || [];
        
        updateData.images = [
          ...existingImages,
          ...newImages.map(img => ({
            url: img.url,
            publicId: img.publicId,
            caption: ''
          }))
        ];
      } catch (uploadError) {
        return res.status(400).json({
          error: 'Image upload failed',
          message: uploadError.message
        });
      }
    }

    // Mark as edited
    updateData.isEdited = true;
    updateData.editedAt = new Date();

    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username profilePicture');

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment.publicSummary
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      error: 'Failed to update comment',
      message: 'Something went wrong'
    });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (Owner only)
router.delete('/:id', authenticateToken, checkOwnership('Comment'), async (req, res) => {
  try {
    const comment = req.resource;

    // Delete images from Cloudinary
    if (comment.images && comment.images.length > 0) {
      const publicIds = comment.images.map(img => img.publicId);
      await deleteMultipleImages(publicIds);
    }

    // Delete comment
    await Comment.findByIdAndDelete(req.params.id);

    // Decrement user stats
    await req.user.incrementStats('totalComments');

    res.json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      error: 'Failed to delete comment',
      message: 'Something went wrong'
    });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Toggle like on a comment
// @access  Private
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The requested comment does not exist'
      });
    }

    await comment.toggleLike(req.user._id);

    res.json({
      message: 'Like toggled successfully',
      likeCount: comment.likeCount,
      hasLiked: comment.hasLiked(req.user._id)
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      error: 'Failed to toggle like',
      message: 'Something went wrong'
    });
  }
});

// @route   POST /api/comments/:id/report
// @desc    Report a comment
// @access  Private
router.post('/:id/report', authenticateToken, [
  body('reason')
    .isIn(['Spam', 'Inappropriate', 'Offensive', 'Fake', 'Other'])
    .withMessage('Invalid report reason')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The requested comment does not exist'
      });
    }

    // Check if user is reporting their own comment
    if (comment.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Cannot report own comment',
        message: 'You cannot report your own comment'
      });
    }

    await comment.report(req.body.reason);

    res.json({
      message: 'Comment reported successfully'
    });

  } catch (error) {
    console.error('Report comment error:', error);
    res.status(500).json({
      error: 'Failed to report comment',
      message: 'Something went wrong'
    });
  }
});

// @route   GET /api/comments/:id/likes
// @desc    Get users who liked a comment
// @access  Public
router.get('/:id/likes', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const comment = await Comment.findById(req.params.id)
      .populate({
        path: 'likes',
        select: 'username profilePicture',
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit)
        }
      });

    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The requested comment does not exist'
      });
    }

    res.json({
      likes: comment.likes,
      totalLikes: comment.likeCount,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get comment likes error:', error);
    res.status(500).json({
      error: 'Failed to get likes',
      message: 'Something went wrong'
    });
  }
});

module.exports = router; 