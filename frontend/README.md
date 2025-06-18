# Hidden Spots - Frontend

A React Native Expo app for discovering and sharing hidden gems around the world.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Spot Discovery**: Browse and filter hidden spots by category
- **Nearby Spots**: Find spots near your current location
- **Spot Details**: View detailed information about each spot
- **Favorites**: Save and manage your favorite spots
- **Comments & Ratings**: Share experiences and rate spots
- **Dark/Light Mode**: Beautiful theme support
- **Responsive Design**: Works on iOS, Android, and Web

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Axios** for API communication
- **AsyncStorage** for local data persistence
- **Expo Location** for GPS functionality
- **React Native Paper** for UI components

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Backend server running on `http://192.168.56.1:5001`

## Installation

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Configure backend URL**:
   The app is configured to connect to your backend at `http://192.168.56.1:5001`.
   If your backend is running on a different IP or port, update the `API_BASE_URL` in `constants/Config.ts`.

3. **Start the development server**:

   ```bash
   npm start
   ```

4. **Run on your device**:
   - **iOS**: Press `i` in the terminal or scan the QR code with the Expo Go app
   - **Android**: Press `a` in the terminal or scan the QR code with the Expo Go app
   - **Web**: Press `w` in the terminal

## Project Structure

```
frontend/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Main spots feed
│   │   └── explore.tsx    # Nearby spots
│   └── _layout.tsx        # Root layout with auth
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   └── spots/            # Spot-related components
│       └── SpotCard.tsx
├── constants/            # App constants and config
│   ├── Colors.ts         # Theme colors
│   └── Config.ts         # API configuration
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── hooks/                # Custom hooks
├── services/             # API services
│   └── api.ts           # API client and types
└── assets/              # Images, fonts, etc.
```

## API Integration

The frontend connects to your backend API with the following endpoints:

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Spots

- `GET /api/spots` - Get spots with filters and pagination
- `GET /api/spots/nearby` - Get nearby spots
- `GET /api/spots/:id` - Get spot details
- `POST /api/spots` - Create new spot
- `PUT /api/spots/:id` - Update spot
- `DELETE /api/spots/:id` - Delete spot

### Comments

- `GET /api/comments` - Get user comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Features in Detail

### Authentication Flow

- Automatic token management with AsyncStorage
- Protected routes requiring authentication
- JWT token refresh handling
- User profile management

### Spot Discovery

- Infinite scroll pagination
- Category filtering (Romantic, Serene, Creative)
- Sort options (Newest, Top Rated, Most Popular)
- Search functionality
- Pull-to-refresh

### Nearby Spots

- GPS location detection
- Configurable search radius (5km, 10km, 25km, 50km)
- Category filtering
- Distance-based sorting

### UI/UX Features

- Modern, clean design
- Dark and light theme support
- Smooth animations and transitions
- Responsive layout for different screen sizes
- Loading states and error handling
- Empty state illustrations

## Configuration

### Backend URL

Update the backend URL in `constants/Config.ts`:

```typescript
export const CONFIG = {
  API_BASE_URL: "http://192.168.56.1:5001",
  // ... other config
};
```

### Environment Variables

Create a `.env` file in the frontend directory for any environment-specific variables:

```env
EXPO_PUBLIC_API_URL=http://192.168.56.1:5001
```

## Development

### Adding New Features

1. Create components in the appropriate directory
2. Add API methods in `services/api.ts`
3. Update types as needed
4. Add navigation routes if required

### Styling

- Use the theme colors from `constants/Colors.ts`
- Follow the existing component patterns
- Use StyleSheet for performance

### Testing

- Test on both iOS and Android
- Test with different screen sizes
- Verify dark/light mode functionality
- Test offline scenarios

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**

   - Verify backend is running on the correct IP and port
   - Check network connectivity
   - Ensure CORS is properly configured on backend

2. **Location Permission Denied**

   - The app will use a default location (New York)
   - Users can manually enable location in device settings

3. **Build Errors**

   - Clear Metro cache: `npx expo start --clear`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Authentication Issues**
   - Check JWT token expiration
   - Verify backend authentication endpoints
   - Clear app storage if needed

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Test thoroughly on multiple devices
4. Update documentation as needed

## License

This project is part of the Hidden Spots application.
