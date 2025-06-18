# Hidden Spots - Setup Guide

This guide will help you set up and run the Hidden Spots platform on your local machine.

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**

### External Services Setup

You'll need to set up the following free services:

#### 1. MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user with read/write permissions
5. Get your connection string
6. Add your IP address to the IP whitelist

#### 2. Cloudinary (Image Storage)
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret from the dashboard

#### 3. Google Maps API (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Maps SDK for Android and iOS
4. Create API credentials
5. Get your API key

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hidden-spots
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

Edit the `.env` file with your credentials:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/hidden-spots?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Maps API (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
echo "EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key" > .env
```

## 🗄️ Database Setup

### 1. Seed the Database

```bash
cd backend
npm run seed
```

This will create:
- 1 admin user (admin@hiddenspots.com / Admin123!)
- 4 preloaded hidden spots in Gwalior

### 2. Verify Database

Check your MongoDB Atlas dashboard to see the created collections:
- `users`
- `spots`
- `comments`

## 🚀 Running the Application

### 1. Start the Backend

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:5000`

### 2. Start the Frontend

```bash
cd frontend
npx expo start
```

This will open the Expo development server. You can:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your phone

## 📱 Testing the App

### 1. Login with Admin Account
- Email: `admin@hiddenspots.com`
- Password: `Admin123!`

### 2. Explore Features
- **Map View**: See the 4 preloaded spots in Gwalior
- **Spot Details**: Tap on markers to view spot details
- **Add New Spot**: Use the + button to add your own spots
- **Feed**: Browse personalized recommendations
- **Profile**: View and edit your profile

## 🔧 Development

### Backend Structure

```
backend/
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── middleware/      # Authentication & validation
├── utils/           # Helper functions
├── scripts/         # Database seeding
└── server.js        # Main server file
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/  # Reusable components
│   ├── screens/     # App screens
│   ├── context/     # React context
│   ├── services/    # API services
│   ├── theme/       # Styling & theming
│   └── utils/       # Helper functions
├── assets/          # Images & fonts
└── App.js           # Main app file
```

## 🧪 Testing

### Backend API Testing

```bash
cd backend

# Test health endpoint
curl http://localhost:5000/health

# Test spots endpoint
curl http://localhost:5000/api/spots
```

### Frontend Testing

1. Use Expo Go app on your phone
2. Test on iOS Simulator
3. Test on Android Emulator

## 🚀 Deployment

### Backend Deployment

#### Option 1: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-hidden-spots-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloudinary_name
heroku config:set CLOUDINARY_API_KEY=your_cloudinary_key
heroku config:set CLOUDINARY_API_SECRET=your_cloudinary_secret

# Deploy
git push heroku main
```

#### Option 2: Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Frontend Deployment

#### Option 1: Expo EAS Build
```bash
cd frontend

# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

#### Option 2: Expo Application Services
1. Connect your repository to EAS
2. Configure build settings
3. Build and submit to app stores

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Rotate API keys regularly

### API Security
- Rate limiting is enabled
- CORS is configured for production
- Input validation on all endpoints
- JWT token expiration (7 days)

### Data Protection
- Passwords are hashed with bcrypt
- Sensitive data is not logged
- HTTPS required in production

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: MongoDB connection error
```
**Solution**: Check your MongoDB URI and network access

#### 2. Cloudinary Upload Error
```
Error: Failed to upload image
```
**Solution**: Verify Cloudinary credentials and folder permissions

#### 3. Expo Build Error
```
Error: Google Maps API key not found
```
**Solution**: Add your Google Maps API key to app.json

#### 4. Location Permission Error
```
Error: Location permission denied
```
**Solution**: Enable location permissions in device settings

### Debug Mode

#### Backend Debug
```bash
cd backend
DEBUG=* npm run dev
```

#### Frontend Debug
```bash
cd frontend
EXPO_DEBUG=true npx expo start
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Spots Endpoints
- `GET /api/spots` - Get all spots with filters
- `GET /api/spots/nearby` - Get nearby spots
- `GET /api/spots/:id` - Get spot details
- `POST /api/spots` - Create new spot
- `PUT /api/spots/:id` - Update spot
- `DELETE /api/spots/:id` - Delete spot

### Comments Endpoints
- `GET /api/comments` - Get user comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Check that external services are properly configured

For additional help, please open an issue on the repository. 