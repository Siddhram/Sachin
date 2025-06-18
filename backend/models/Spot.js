const mongoose = require('mongoose');

const spotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Spot name is required'],
    trim: true,
    maxlength: [100, 'Spot name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Romantic', 'Serene', 'Creative'],
    default: 'Serene'
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
      }
    }
  },
  address: {
    street: String,
    city: {
      type: String,
      default: 'Gwalior'
    },
    state: {
      type: String,
      default: 'Madhya Pradesh'
    },
    country: {
      type: String,
      default: 'India'
    },
    postalCode: String
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  story: {
    type: String,
    required: [true, 'Personal story is required'],
    maxlength: [1000, 'Story cannot exceed 1000 characters']
  },
  tips: [{
    type: String,
    maxlength: [200, 'Each tip cannot exceed 200 characters']
  }],
  ratings: {
    vibe: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    safety: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    uniqueness: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    crowdLevel: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  bestTimeToVisit: {
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Any'],
      default: 'Any'
    },
    season: {
      type: String,
      enum: ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter', 'Any'],
      default: 'Any'
    }
  },
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    parkingAvailable: {
      type: Boolean,
      default: false
    },
    publicTransport: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  visitCount: {
    type: Number,
    default: 0
  },
  lastVisited: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overall rating
spotSchema.virtual('overallRating').get(function() {
  const ratings = this.ratings;
  const totalRatings = ratings.vibe.count + ratings.safety.count + 
                      ratings.uniqueness.count + ratings.crowdLevel.count;
  
  if (totalRatings === 0) return 0;
  
  const totalScore = (ratings.vibe.average * ratings.vibe.count) +
                    (ratings.safety.average * ratings.safety.count) +
                    (ratings.uniqueness.average * ratings.uniqueness.count) +
                    (ratings.crowdLevel.average * ratings.crowdLevel.count);
  
  return Math.round((totalScore / totalRatings) * 10) / 10;
});

// Virtual for spot summary
spotSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    name: this.name,
    category: this.category,
    coordinates: this.coordinates,
    overallRating: this.overallRating,
    imageCount: this.images.length,
    visitCount: this.visitCount,
    createdAt: this.createdAt
  };
});

// Geospatial index for location-based queries
spotSchema.index({ coordinates: '2dsphere' });

// Text index for search functionality
spotSchema.index({ 
  name: 'text', 
  description: 'text', 
  story: 'text', 
  tags: 'text' 
});

// Compound indexes for better query performance
spotSchema.index({ category: 1, isActive: 1 });
spotSchema.index({ createdBy: 1, createdAt: -1 });
spotSchema.index({ overallRating: -1, visitCount: -1 });

// Method to update rating
spotSchema.methods.updateRating = function(ratingType, newRating) {
  const rating = this.ratings[ratingType];
  if (!rating) {
    throw new Error(`Invalid rating type: ${ratingType}`);
  }
  
  const currentTotal = rating.average * rating.count;
  rating.count += 1;
  rating.average = (currentTotal + newRating) / rating.count;
  
  return this.save();
};

// Method to increment visit count
spotSchema.methods.incrementVisitCount = function() {
  this.visitCount += 1;
  this.lastVisited = new Date();
  return this.save();
};

// Static method to find nearby spots
spotSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    isActive: true
  })
    .populate('createdBy', 'username profilePicture')
    .lean({ virtuals: true });
};

// Static method to get top rated spots
spotSchema.statics.getTopRated = function(limit = 10) {
  return this.aggregate([
    {
      $addFields: {
        overallRating: {
          $cond: {
            if: { $eq: [{ $add: ['$ratings.vibe.count', '$ratings.safety.count', '$ratings.uniqueness.count', '$ratings.crowdLevel.count'] }, 0] },
            then: 0,
            else: {
              $divide: [
                {
                  $add: [
                    { $multiply: ['$ratings.vibe.average', '$ratings.vibe.count'] },
                    { $multiply: ['$ratings.safety.average', '$ratings.safety.count'] },
                    { $multiply: ['$ratings.uniqueness.average', '$ratings.uniqueness.count'] },
                    { $multiply: ['$ratings.crowdLevel.average', '$ratings.crowdLevel.count'] }
                  ]
                },
                { $add: ['$ratings.vibe.count', '$ratings.safety.count', '$ratings.uniqueness.count', '$ratings.crowdLevel.count'] }
              ]
            }
          }
        }
      }
    },
    { $match: { isActive: true } },
    { $sort: { overallRating: -1, visitCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'creator'
      }
    },
    { $unwind: '$creator' },
    {
      $project: {
        name: 1,
        category: 1,
        coordinates: 1,
        overallRating: 1,
        imageCount: { $size: '$images' },
        visitCount: 1,
        'creator.username': 1,
        'creator.profilePicture': 1
      }
    }
  ]);
};

module.exports = mongoose.model('Spot', spotSchema); 