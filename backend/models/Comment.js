const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  spotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spot',
    required: [true, 'Spot ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  rating: {
    vibe: {
      type: Number,
      min: 1,
      max: 5
    },
    safety: {
      type: Number,
      min: 1,
      max: 5
    },
    uniqueness: {
      type: Number,
      min: 1,
      max: 5
    },
    crowdLevel: {
      type: Number,
      min: 1,
      max: 5
    }
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
    caption: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    enum: ['Spam', 'Inappropriate', 'Offensive', 'Fake', 'Other'],
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comment summary (for public display)
commentSchema.virtual('publicSummary').get(function() {
  return {
    id: this._id,
    content: this.content,
    isAnonymous: this.isAnonymous,
    rating: this.rating,
    imageCount: this.images.length,
    likeCount: this.likes.length,
    isEdited: this.isEdited,
    createdAt: this.createdAt
  };
});

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Indexes for better query performance
commentSchema.index({ spotId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ isAnonymous: 1 });
commentSchema.index({ isReported: 1 });

// Method to toggle like
commentSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    // Add like
    this.likes.push(userId);
  } else {
    // Remove like
    this.likes.splice(likeIndex, 1);
  }
  
  return this.save();
};

// Method to check if user has liked
commentSchema.methods.hasLiked = function(userId) {
  return this.likes.includes(userId);
};

// Method to mark as edited
commentSchema.methods.markAsEdited = function() {
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to report comment
commentSchema.methods.report = function(reason) {
  this.isReported = true;
  this.reportReason = reason;
  return this.save();
};

// Static method to get comments for a spot
commentSchema.statics.getSpotComments = function(spotId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ spotId, isReported: false })
    .populate('userId', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to get user comments
commentSchema.statics.getUserComments = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ userId })
    .populate('spotId', 'name category coordinates')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Pre-save middleware to update spot ratings when comment has ratings
commentSchema.pre('save', async function(next) {
  if (this.isNew && this.rating) {
    try {
      const Spot = mongoose.model('Spot');
      const spot = await Spot.findById(this.spotId);
      
      if (spot) {
        // Update spot ratings
        for (const [ratingType, ratingValue] of Object.entries(this.rating)) {
          if (ratingValue) {
            await spot.updateRating(ratingType, ratingValue);
          }
        }
      }
    } catch (error) {
      console.error('Error updating spot ratings:', error);
    }
  }
  next();
});

// Pre-remove middleware to update spot ratings when comment is deleted
commentSchema.pre('remove', async function(next) {
  if (this.rating) {
    try {
      const Spot = mongoose.model('Spot');
      const spot = await Spot.findById(this.spotId);
      
      if (spot) {
        // Recalculate spot ratings without this comment
        // This is a simplified approach - in production, you might want to store individual ratings
        // and recalculate averages more precisely
        const Comment = mongoose.model('Comment');
        const otherComments = await Comment.find({ 
          spotId: this.spotId, 
          _id: { $ne: this._id },
          rating: { $exists: true }
        });
        
        // Reset ratings and recalculate
        spot.ratings = {
          vibe: { average: 0, count: 0 },
          safety: { average: 0, count: 0 },
          uniqueness: { average: 0, count: 0 },
          crowdLevel: { average: 0, count: 0 }
        };
        
        for (const comment of otherComments) {
          if (comment.rating) {
            for (const [ratingType, ratingValue] of Object.entries(comment.rating)) {
              if (ratingValue) {
                await spot.updateRating(ratingType, ratingValue);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating spot ratings on comment removal:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema); 