const mongoose = require('mongoose');
const Spot = require('../models/Spot');
const User = require('../models/User');
require('dotenv').config();

const spots = [
  {
    name: "Sunset Point at Gwalior Fort",
    description: "A hidden viewpoint offering breathtaking sunset views over the historic Gwalior Fort and the city below. Perfect for romantic evenings and photography.",
    category: "Romantic",
    coordinates: {
      type: "Point",
      coordinates: [78.1642, 26.2183] // Gwalior coordinates
    },
    address: {
      street: "Gwalior Fort",
      city: "Gwalior",
      state: "Madhya Pradesh",
      country: "India"
    },
    story: "Discovered this magical spot during a solo trip to Gwalior Fort. While most tourists head to the main viewpoints, this hidden corner offers the most spectacular sunset views. The golden hour light hitting the ancient fort walls creates an unforgettable atmosphere. Perfect for couples seeking a romantic escape or photographers looking for unique angles.",
    tips: [
      "Visit 30 minutes before sunset for the best lighting",
      "Bring a blanket to sit comfortably",
      "Best visited during winter months for clearer skies",
      "Weekdays are less crowded than weekends"
    ],
    bestTimeToVisit: {
      timeOfDay: "Evening",
      season: "Winter"
    },
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: true,
      publicTransport: true
    },
    tags: ["sunset", "fort", "romantic", "photography", "historic"],
    images: [{
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      publicId: "sunset-point-gwalior",
      caption: "Breathtaking sunset view from the hidden point"
    }]
  },
  {
    name: "Secret Garden at Jai Vilas Palace",
    description: "A tranquil garden hidden behind the grand Jai Vilas Palace, featuring rare flowers, peaceful walking paths, and a small meditation area.",
    category: "Serene",
    coordinates: {
      type: "Point",
      coordinates: [78.1589, 26.2156] // Near Jai Vilas Palace
    },
    address: {
      street: "Jai Vilas Palace Grounds",
      city: "Gwalior",
      state: "Madhya Pradesh",
      country: "India"
    },
    story: "This hidden garden is a true oasis of peace in the bustling city. Tucked away behind the magnificent Jai Vilas Palace, it's often overlooked by visitors. The garden features a beautiful collection of native and exotic plants, with winding stone paths and several quiet corners perfect for meditation or reading. The sound of birds and the gentle rustling of leaves create a perfect escape from city life.",
    tips: [
      "Visit early morning for the best bird watching",
      "Bring a book or meditation cushion",
      "Avoid weekends when palace tours are busy",
      "Spring is the best time to see flowers in bloom"
    ],
    bestTimeToVisit: {
      timeOfDay: "Morning",
      season: "Spring"
    },
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransport: true
    },
    tags: ["garden", "peaceful", "meditation", "nature", "palace"],
    images: [{
      url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop",
      publicId: "secret-garden-palace",
      caption: "Peaceful garden paths and meditation areas"
    }]
  },
  {
    name: "Artists' Corner at Lashkar Bazaar",
    description: "A vibrant alley in the old city where local artists gather to paint, sketch, and share their creative work. Colorful murals and street art everywhere.",
    category: "Creative",
    coordinates: {
      type: "Point",
      coordinates: [78.1620, 26.2200] // Lashkar area
    },
    address: {
      street: "Artists' Alley, Lashkar Bazaar",
      city: "Gwalior",
      state: "Madhya Pradesh",
      country: "India"
    },
    story: "This hidden gem in the heart of Lashkar Bazaar is where Gwalior's creative souls come together. The walls are covered in stunning murals, and local artists often set up their easels to capture the essence of the old city. It's a perfect spot for art lovers, photographers, and anyone seeking creative inspiration. The atmosphere is electric with artistic energy and cultural exchange.",
    tips: [
      "Visit on weekends when artists are most active",
      "Bring your own sketchbook or camera",
      "Respect the artists' space and ask before taking photos",
      "Best lighting for photography is late afternoon"
    ],
    bestTimeToVisit: {
      timeOfDay: "Afternoon",
      season: "Any"
    },
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: false,
      publicTransport: true
    },
    tags: ["art", "creative", "murals", "local artists", "culture"],
    images: [{
      url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
      publicId: "artists-corner-bazaar",
      caption: "Colorful murals and street art in the artists' corner"
    }]
  },
  {
    name: "Moonlit Terrace at Tansen Tomb",
    description: "A secluded terrace near Tansen's Tomb offering magical moonlit views of the city. Perfect for stargazing and peaceful contemplation.",
    category: "Serene",
    coordinates: {
      type: "Point",
      coordinates: [78.1650, 26.2170] // Near Tansen Tomb
    },
    address: {
      street: "Tansen Tomb Complex",
      city: "Gwalior",
      state: "Madhya Pradesh",
      country: "India"
    },
    story: "This hidden terrace near the historic Tansen Tomb offers one of the most peaceful experiences in Gwalior. Named after the legendary musician Tansen, this spot seems to carry the echoes of classical music in the air. On full moon nights, the terrace is bathed in silver light, creating an almost mystical atmosphere. It's perfect for stargazing, meditation, or simply enjoying the quiet beauty of the night sky.",
    tips: [
      "Visit during full moon for the most magical experience",
      "Bring a telescope for stargazing",
      "Dress warmly as it can get cool at night",
      "Weeknights are quieter than weekends"
    ],
    bestTimeToVisit: {
      timeOfDay: "Night",
      season: "Any"
    },
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: true,
      publicTransport: true
    },
    tags: ["moonlight", "stargazing", "peaceful", "historic", "music"],
    images: [{
      url: "https://images.unsplash.com/photo-1532978379173-523e16f371f9?w=800&h=600&fit=crop",
      publicId: "moonlit-terrace-tansen",
      caption: "Magical moonlit terrace with city views"
    }]
  }
];

async function seedSpots() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create a default user for the spots
    let defaultUser = await User.findOne({ email: 'admin@hiddenspots.com' });
    
    if (!defaultUser) {
      defaultUser = await User.create({
        username: 'HiddenSpotsAdmin',
        email: 'admin@hiddenspots.com',
        password: 'admin123456',
        bio: 'Hidden Spots Curator'
      });
      console.log('Created default user');
    }

    // Clear existing spots
    await Spot.deleteMany({});
    console.log('Cleared existing spots');

    // Create spots with the default user
    const spotsWithUser = spots.map(spot => ({
      ...spot,
      createdBy: defaultUser._id,
      isVerified: true,
      isActive: true
    }));

    const createdSpots = await Spot.create(spotsWithUser);
    console.log(`Created ${createdSpots.length} spots successfully`);

    // Log the created spots
    createdSpots.forEach(spot => {
      console.log(`✅ ${spot.name} - ${spot.category}`);
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedSpots(); 