# Hidden Spots - Gwalior Community Platform

A mobile-first location-based community platform for discovering and sharing emotional hidden places in Gwalior, Madhya Pradesh.

## 🌟 Features

- **GPS-based Interactive Map**: Discover hidden spots with custom markers
- **Spot Details**: Photo galleries, stories, and community ratings
- **Add New Spots**: Share your discoveries with the community
- **Smart Feed**: Personalized recommendations based on location and preferences
- **Advanced Filters**: Find exactly what you're looking for
- **Community Ratings**: Rate spots for vibe, safety, uniqueness, and crowd level

## 🏗️ Project Structure

```
hidden-spots/
├── frontend/          # React Native + Expo app
├── backend/           # Node.js + Express + MongoDB API
├── docs/             # Documentation
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI
- MongoDB Atlas account
- Google Maps API key
- Cloudinary account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file with your credentials:
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
PORT=5000
```

3. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

3. Start the Expo development server:
```bash
npx expo start
```

## 📱 App Features

### Map View
- Interactive map showing hidden spots in Gwalior
- Custom markers for different categories (Romantic, Serene, Creative)
- Real-time location tracking

### Spot Details
- Photo galleries with Cloudinary integration
- Community ratings (Vibe, Safety, Uniqueness, Crowd Level)
- User stories and tips
- Comment section with anonymous option

### Add New Spot
- GPS location capture
- Image upload to Cloudinary
- Category selection
- Personal story and tips

### Smart Feed
- Location-based recommendations
- Personalized content based on preferences
- Community-driven content discovery

## 🛠️ Tech Stack

### Frontend
- React Native with Expo
- React Navigation
- Expo Location
- React Native Maps
- Axios for API calls
- AsyncStorage for local storage

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Geospatial queries
- JWT authentication
- Cloudinary integration
- Multer for file uploads

### External Services
- MongoDB Atlas (Database)
- Cloudinary (Image storage)
- Google Maps API (Maps and geocoding)

## 📊 Database Schema

### Spot Model
```javascript
{
  name: String,
  coordinates: { type: "Point", coordinates: [lng, lat] },
  category: String, // Romantic, Serene, Creative
  images: [String], // Cloudinary URLs
  story: String,
  tips: [String],
  ratings: {
    vibe: { average: Number, count: Number },
    safety: { average: Number, count: Number },
    uniqueness: { average: Number, count: Number },
    crowdLevel: { average: Number, count: Number }
  },
  createdBy: ObjectId,
  createdAt: Date
}
```

### Comment Model
```javascript
{
  spotId: ObjectId,
  content: String,
  isAnonymous: Boolean,
  userId: ObjectId,
  createdAt: Date
}
```

## 🗺️ Preloaded Spots

The app comes with 4 preloaded hidden spots in Gwalior:
1. **Sunset Point at Gwalior Fort Backside** - Romantic
2. **Hidden Garden near Jai Vilas Palace** - Serene
3. **Street Art Corner in Old City** - Creative
4. **Riverside Meditation Spot** - Serene

## 🔧 API Endpoints

### Spots
- `GET /api/spots` - Get spots with filters
- `GET /api/spots/nearby` - Get nearby spots
- `GET /api/spots/:id` - Get spot details
- `POST /api/spots` - Add new spot
- `PUT /api/spots/:id/rate` - Rate a spot

### Comments
- `GET /api/spots/:id/comments` - Get spot comments
- `POST /api/spots/:id/comments` - Add comment

### Users
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

## 📱 Mobile App Screens

1. **Map Screen** - Interactive map with spot markers
2. **Spot Details Screen** - Detailed view with photos and ratings
3. **Add Spot Screen** - Form to add new spots
4. **Feed Screen** - Personalized recommendations
5. **Profile Screen** - User profile and preferences

## 🎨 UI/UX Features

- Mobile-first design
- Smooth animations and transitions
- Intuitive navigation
- Beautiful photo galleries
- Rating system with visual feedback
- Offline capability for basic features

## 🔒 Security Features

- JWT authentication
- Input validation and sanitization
- Secure file uploads
- Rate limiting
- CORS configuration

## 🚀 Deployment

### Backend
- Deploy to Heroku, Railway, or DigitalOcean
- Set up MongoDB Atlas cluster
- Configure environment variables

### Frontend
- Build with Expo EAS
- Deploy to App Store and Google Play
- Configure production API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Maps API for mapping services
- Cloudinary for image management
- MongoDB Atlas for database hosting
- Expo for React Native development platform 