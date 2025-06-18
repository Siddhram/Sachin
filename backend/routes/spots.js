const express = require('express');
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');
const Spot = require('../models/Spot');
const User = require('../models/User');
const { authenticateToken, optionalAuth, checkOwnership } = require('../middleware/auth');
const { uploadImage, uploadMultipleImages, deleteMultipleImages, validateImage } = require('../utils/cloudinary');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Max 5 files
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
const validateSpot = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Spot name must be between 3 and 100 characters'),
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn(['Romantic', 'Serene', 'Creative'])
    .withMessage('Invalid category'),
  body('coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('story')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Story must be between 20 and 1000 characters'),
  body('tips')
    .optional()
    .isArray()
    .withMessage('Tips must be an array'),
  body('tips.*')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Each tip cannot exceed 200 characters')
];

// @route   GET /api/spots
// @desc    Get spots with filters and pagination
// @access  Public
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['Romantic', 'Serene', 'Creative']).withMessage('Invalid category'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sort').optional().isIn(['rating', 'newest', 'popular']).withMessage('Invalid sort option')
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

    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort = 'newest',
      longitude,
      latitude,
      maxDistance = 10
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    // Add category filter
    if (category) {
      filter.category = category;
    }

    // Add search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Add location filter
    if (longitude && latitude) {
      filter.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(maxDistance) * 1000 // Convert km to meters
        }
      };
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'rating':
        sortObj = { overallRating: -1, visitCount: -1 };
        break;
      case 'popular':
        sortObj = { visitCount: -1, overallRating: -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Execute query
    const spots = await Spot.find(filter)
      .populate('createdBy', 'username profilePicture')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Spot.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      spots,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get spots error:', error);
    res.status(500).json({
      error: 'Failed to get spots',
      message: 'Something went wrong'
    });
  }
});

// @route   GET /api/spots/nearby
// @desc    Get nearby spots based on user location
// @access  Public
router.get('/nearby', [
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('maxDistance').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Max distance must be between 0.1 and 50 km')
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

    const { longitude, latitude, maxDistance = 10, category } = req.query;

    const nearbySpots = await Spot.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      parseFloat(maxDistance)
    );

    // Filter by category if provided
    const filteredSpots = category 
      ? nearbySpots.filter(spot => spot.category === category)
      : nearbySpots;

    res.json({
      spots: filteredSpots,
      count: filteredSpots.length,
      userLocation: { longitude: parseFloat(longitude), latitude: parseFloat(latitude) }
    });

  } catch (error) {
    console.error('Get nearby spots error:', error);
    res.status(500).json({
      error: 'Failed to get nearby spots',
      message: 'Something went wrong'
    });
  }
});

// @route   GET /api/spots/top-rated
// @desc    Get top rated spots
// @access  Public
router.get('/top-rated', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topRatedSpots = await Spot.getTopRated(parseInt(limit));
    
    res.json({
      spots: topRatedSpots,
      count: topRatedSpots.length
    });

  } catch (error) {
    console.error('Get top rated spots error:', error);
    res.status(500).json({
      error: 'Failed to get top rated spots',
      message: 'Something went wrong'
    });
  }
});

// @route   GET /api/spots/:id
// @desc    Get spot by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id)
      .populate('createdBy', 'username profilePicture bio')
      .lean();

    if (!spot) {
      return res.status(404).json({
        error: 'Spot not found',
        message: 'The requested spot does not exist'
      });
    }

    // Increment visit count if user is authenticated
    if (req.user) {
      await Spot.findByIdAndUpdate(req.params.id, { $inc: { visitCount: 1 } });
    }

    res.json({ spot });

  } catch (error) {
    console.error('Get spot error:', error);
    res.status(500).json({
      error: 'Failed to get spot',
      message: 'Something went wrong'
    });
  }
});

// @route   POST /api/spots
// @desc    Create a new spot
// @access  Private
router.post('/', authenticateToken, upload.array('images', 5), validateSpot, async (req, res) => {
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

    const {
      name,
      description,
      category,
      coordinates,
      story,
      tips = [],
      tags = [],
      bestTimeToVisit,
      accessibility
    } = req.body;

    let uploadedImages = [];

    // Upload images if provided
    if (req.files && req.files.length > 0) {
      try {
        uploadedImages = await uploadMultipleImages(req.files, 'hidden-spots/spots');
      } catch (uploadError) {
        return res.status(400).json({
          error: 'Image upload failed',
          message: uploadError.message
        });
      }
    }

    // Create spot
    const spot = new Spot({
      name,
      description,
      category,
      coordinates: {
        type: 'Point',
        coordinates: [parseFloat(coordinates.longitude), parseFloat(coordinates.latitude)]
      },
      images: uploadedImages.map(img => ({
        url: img.url,
        publicId: img.publicId,
        caption: ''
      })),
      story,
      tips: Array.isArray(tips) ? tips : [tips].filter(Boolean),
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      bestTimeToVisit: bestTimeToVisit ? JSON.parse(bestTimeToVisit) : undefined,
      accessibility: accessibility ? JSON.parse(accessibility) : undefined,
      createdBy: req.user._id
    });

    await spot.save();

    // Increment user stats
    await req.user.incrementStats('spotsAdded');

    // Populate creator info
    await spot.populate('createdBy', 'username profilePicture');

    res.status(201).json({
      message: 'Spot created successfully',
      spot
    });

  } catch (error) {
    console.error('Create spot error:', error);
    res.status(500).json({
      error: 'Failed to create spot',
      message: 'Something went wrong'
    });
  }
});

// @route   PUT /api/spots/:id
// @desc    Update a spot
// @access  Private (Owner only)
router.put('/:id', authenticateToken, checkOwnership('Spot'), upload.array('images', 5), [
  body('name').optional().isLength({ min: 3, max: 100 }),
  body('description').optional().isLength({ min: 10, max: 500 }),
  body('category').optional().isIn(['Romantic', 'Serene', 'Creative']),
  body('story').optional().isLength({ min: 20, max: 1000 })
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

    const spot = req.resource;
    const updateData = { ...req.body };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      try {
        const newImages = await uploadMultipleImages(req.files, 'hidden-spots/spots');
        const existingImages = spot.images || [];
        
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

    // Update spot
    const updatedSpot = await Spot.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username profilePicture');

    res.json({
      message: 'Spot updated successfully',
      spot: updatedSpot
    });

  } catch (error) {
    console.error('Update spot error:', error);
    res.status(500).json({
      error: 'Failed to update spot',
      message: 'Something went wrong'
    });
  }
});

// @route   DELETE /api/spots/:id
// @desc    Delete a spot
// @access  Private (Owner only)
router.delete('/:id', authenticateToken, checkOwnership('Spot'), async (req, res) => {
  try {
    const spot = req.resource;

    // Delete images from Cloudinary
    if (spot.images && spot.images.length > 0) {
      const publicIds = spot.images.map(img => img.publicId);
      await deleteMultipleImages(publicIds);
    }

    // Delete spot
    await Spot.findByIdAndDelete(req.params.id);

    // Decrement user stats
    await req.user.incrementStats('spotsAdded');

    res.json({
      message: 'Spot deleted successfully'
    });

  } catch (error) {
    console.error('Delete spot error:', error);
    res.status(500).json({
      error: 'Failed to delete spot',
      message: 'Something went wrong'
    });
  }
});

// @route   POST /api/spots/:id/rate
// @desc    Rate a spot
// @access  Private
router.post('/:id/rate', authenticateToken, [
  body('vibe').optional().isInt({ min: 1, max: 5 }),
  body('safety').optional().isInt({ min: 1, max: 5 }),
  body('uniqueness').optional().isInt({ min: 1, max: 5 }),
  body('crowdLevel').optional().isInt({ min: 1, max: 5 })
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

    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({
        error: 'Spot not found',
        message: 'The requested spot does not exist'
      });
    }

    const { vibe, safety, uniqueness, crowdLevel } = req.body;
    const ratings = { vibe, safety, uniqueness, crowdLevel };

    // Update ratings
    for (const [ratingType, ratingValue] of Object.entries(ratings)) {
      if (ratingValue) {
        await spot.updateRating(ratingType, ratingValue);
      }
    }

    // Increment user stats
    await req.user.incrementStats('totalRatings');

    res.json({
      message: 'Spot rated successfully',
      ratings: spot.ratings,
      overallRating: spot.overallRating
    });

  } catch (error) {
    console.error('Rate spot error:', error);
    res.status(500).json({
      error: 'Failed to rate spot',
      message: 'Something went wrong'
    });
  }
});

// @route   GET /api/spots/:id/comments
// @desc    Get comments for a spot
// @access  Public
router.get('/:id/comments', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Check if spot exists
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({
        error: 'Spot not found',
        message: 'The requested spot does not exist'
      });
    }

    const Comment = require('../models/Comment');
    const comments = await Comment.getSpotComments(req.params.id, parseInt(page), parseInt(limit));

    res.json({
      comments,
      spotId: req.params.id
    });

  } catch (error) {
    console.error('Get spot comments error:', error);
    res.status(500).json({
      error: 'Failed to get comments',
      message: 'Something went wrong'
    });
  }
});

module.exports = router; 