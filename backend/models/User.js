const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters']
  },
  preferences: {
    favoriteCategories: [{
      type: String,
      enum: ['Romantic', 'Serene', 'Creative'],
      default: []
    }],
    maxDistance: {
      type: Number,
      default: 10, // in kilometers
      min: 1,
      max: 50
    },
    notifications: {
      newSpots: {
        type: Boolean,
        default: true
      },
      comments: {
        type: Boolean,
        default: true
      },
      ratings: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    spotsAdded: {
      type: Number,
      default: 0
    },
    spotsVisited: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    }
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spot'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    profilePicture: this.profilePicture,
    bio: this.bio,
    preferences: this.preferences,
    stats: this.stats,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Increment user stats
userSchema.methods.incrementStats = function(field) {
  if (this.stats[field] !== undefined) {
    this.stats[field] += 1;
    return this.save();
  }
  throw new Error(`Invalid stat field: ${field}`);
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ lastActive: -1 });

module.exports = mongoose.model('User', userSchema); 