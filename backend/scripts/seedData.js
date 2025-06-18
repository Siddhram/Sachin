const mongoose = require('mongoose');
const User = require('../models/User');
const Spot = require('../models/Spot');
require('dotenv').config();

// Sample data for Gwalior hidden spots
const sampleSpots = [
  {
    name: "Sunset Point at Gwalior Fort Backside",
    description: "A hidden viewpoint behind the majestic Gwalior Fort offering breathtaking sunset views over the city. This secluded spot is perfect for romantic evenings and peaceful contemplation.",
    category: "Romantic",
    coordinates: {
      type: "Point",
      coordinates: [78.1489, 26.2183] // Gwalior Fort area
    },
    address: {
      street: "Behind Gwalior Fort",
      city: "Gwalior",
      state: "Madhya Pradesh",
      country: "India",
      postalCode: "474008"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        publicId: "hidden-spots/sunset-point-1",
        caption: "Golden hour at the hidden sunset point"
      },
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
        publicId: "hidden-spots/sunset-point-2",
        caption: "Panoramic view of Gwalior city"
      }
    ],
    story: "I discovered this magical spot during my evening walks around the fort. The way the sun sets behind the ancient walls creates an ethereal atmosphere that's hard to describe. It's become my go-to place for romantic dates and quiet reflection. The best part? Most tourists don't know about it, so you often have the entire view to yourself.",
    tips: [
      "Visit during golden hour (5:30-6:30 PM) for the best lighting",
      "Bring a picnic blanket for comfortable seating",
      "Weekdays are less crowded than weekends",
      "Don't forget your camera - the views are Instagram-worthy"
    ],
    tags: ["sunset", "romantic", "fort", "viewpoint", "peaceful"],
    bestTimeToVisit: {
      timeOfDay: "Evening",
      season: "Any"
    },
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: true,
      publicTransport: true
    },
    ratings: {
      vibe: { average: 4.8, count: 12 },
      safety: { average: 4.5, count: 12 },
      uniqueness: { average: 4.7, count: 12 },
      crowdLevel: { average: 2.1, count: 12 }
    }
  },
  {
    name: "Hidden Garden near Jai Vilas Palace",
    description: "A serene garden tucked away behind the grand Jai Vilas Palace, featuring rare flowers, ancient trees, and peaceful walking paths. Perfect for nature lovers and those seeking tranquility.",
    category: "Serene",
    coordinates: {
      type: "Point",
      coordinates: [78.1648, 26.2041] // Near Jai Vilas Palace
    },
    address: {
      street: "Behind Jai Vilas Palace",
      city: "Gwalior",
      state: "Madhya Pradesh",
      country: "India",
      postalCode: "474002"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
        publicId: "hidden-spots/garden-1",
        caption: "Peaceful garden pathways"
      },
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
        publicId: "hidden-spots/garden-2",
        caption: "Ancient trees and rare flowers"
      }
    ],
    story: "This hidden gem was a chance discovery during my morning walks. The garden is maintained by the palace staff but is rarely visited by tourists. The variety of flowers and the peaceful atmosphere make it perfect for meditation, reading, or simply enjoying nature's beauty. The ancient trees provide perfect shade during hot afternoons.",
    tips: [
      "Best visited in the morning (6-9 AM) for bird watching",
      "Bring a book or meditation mat",
      "Respect the garden's tranquility - keep noise levels low",
      "Spring (March-April) is the best time for flowers"
    ],
    tags: ["garden", "nature", "peaceful", "meditation", "flowers"],
    bestTimeToVisit: {
      timeOfDay: "Morning",
      season: "Spring"
    },
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransport: true
    },
    ratings: {
      vibe: { average: 4.6, count: 8 },
      safety: { average: 4.8, count: 8 },
      uniqueness: { average: 4.3, count: 8 },
      crowdLevel: { average: 1.5, count: 8 }
    }
  },
  {
    name: "Street Art Corner in Old City",
    description: "A vibrant corner in Gwalior's old city featuring stunning street art and murals that tell the story of the city's culture and heritage. A paradise for photographers and art enthusiasts.",
    category: "Creative",
    coordinates: {
      type: "Point",
      coordinates: [78.1529, 26.2156] // Old City area
    },
    address: {
      street: "Old City Market Area",
      city: "Gwalior",
      state: "Madhya Pradesh",
      country: "India",
      postalCode: "474001"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
        publicId: "hidden-spots/street-art-1",
        caption: "Colorful street art murals"
      },
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        publicId: "hidden-spots/street-art-2",
        caption: "Cultural heritage through art"
      }
    ],
    story: "I stumbled upon this artistic corner while exploring the old city's narrow lanes. Local artists have transformed this once-dull wall into a canvas that celebrates Gwalior's rich cultural heritage. The murals change periodically, so each visit offers something new. It's become a favorite spot for my photography sessions and creative inspiration.",
    tips: [
      "Visit during golden hour for the best photography lighting",
      "Chat with local artists if you see them working",
      "The art changes every few months - worth revisiting",
      "Weekends are more vibrant with street performances"
    ],
    tags: ["street-art", "photography", "culture", "creative", "murals"],
    bestTimeToVisit: {
      timeOfDay: "Afternoon",
      season: "Any"
    },
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: false,
      publicTransport: true
    },
    ratings: {
      vibe: { average: 4.4, count: 15 },
      safety: { average: 4.2, count: 15 },
      uniqueness: { average: 4.8, count: 15 },
      crowdLevel: { average: 3.2, count: 15 }
    }
  },
  {
    name: "Riverside Meditation Spot",
    description: "A secluded spot along the banks of the Swarnarekha River, perfect for meditation, yoga, or simply enjoying the peaceful sound of flowing water. Away from the city's hustle and bustle.",
    category: "Serene",
    coordinates: {
      type: "Point",
      coordinates: [78.1756, 26.1989] // Riverside area
    },
    address: {
      street: "Swarnarekha River Bank",
      city: "Gwalior",
      state: "Madhya Pradesh",
      country: "India",
      postalCode: "474005"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        publicId: "hidden-spots/riverside-1",
        caption: "Peaceful riverside meditation spot"
      },
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
        publicId: "hidden-spots/riverside-2",
        caption: "Morning mist over the river"
      }
    ],
    story: "This riverside spot has been my sanctuary for over two years. The gentle sound of the flowing water, the morning mist, and the complete absence of city noise create the perfect environment for meditation and self-reflection. I've spent countless mornings here, watching the sunrise and practicing yoga. It's where I find my inner peace.",
    tips: [
      "Best visited early morning (5-7 AM) for meditation",
      "Bring a yoga mat or meditation cushion",
      "Avoid during monsoon season due to high water levels",
      "Perfect spot for sunrise photography"
    ],
    tags: ["meditation", "yoga", "river", "peaceful", "nature"],
    bestTimeToVisit: {
      timeOfDay: "Morning",
      season: "Any"
    },
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: true,
      publicTransport: false
    },
    ratings: {
      vibe: { average: 4.9, count: 10 },
      safety: { average: 4.6, count: 10 },
      uniqueness: { average: 4.5, count: 10 },
      crowdLevel: { average: 1.2, count: 10 }
    }
  }
];

// Sample admin user
const adminUser = {
  username: "hidden_spots_admin",
  email: "admin@hiddenspots.com",
  password: "Admin123!",
  bio: "Curator of Gwalior's hidden gems",
  isVerified: true,
  preferences: {
    favoriteCategories: ["Serene", "Romantic", "Creative"],
    maxDistance: 15,
    notifications: {
      newSpots: true,
      comments: true,
      ratings: true
    }
  },
  stats: {
    spotsAdded: 4,
    spotsVisited: 20,
    totalRatings: 15,
    totalComments: 8
  }
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Spot.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const user = new User(adminUser);
    await user.save();
    console.log('👤 Created admin user');

    // Create spots
    const spots = sampleSpots.map(spotData => ({
      ...spotData,
      createdBy: user._id,
      isVerified: true,
      isActive: true,
      visitCount: Math.floor(Math.random() * 50) + 10,
      lastVisited: new Date()
    }));

    await Spot.insertMany(spots);
    console.log('📍 Created sample spots');

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      'stats.spotsAdded': spots.length
    });

    console.log('🎉 Database seeded successfully!');
    console.log(`📊 Created ${spots.length} spots`);
    console.log(`👤 Created 1 admin user`);

    // Display sample data
    console.log('\n📋 Sample Data Summary:');
    spots.forEach((spot, index) => {
      console.log(`${index + 1}. ${spot.name} (${spot.category})`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleSpots, adminUser }; 