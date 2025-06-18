export const CONFIG = {
  // Backend API Configuration
  API_BASE_URL: 'http://192.168.74.222:5001',
  API_ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      PROFILE: '/api/auth/me',
      UPDATE_PROFILE: '/api/auth/profile',
      LOGOUT: '/api/auth/logout',
    },
    // Spots endpoints
    SPOTS: {
      LIST: '/api/spots',
      NEARBY: '/api/spots/nearby',
      DETAIL: '/api/spots/:id',
      CREATE: '/api/spots',
      UPDATE: '/api/spots/:id',
      DELETE: '/api/spots/:id',
      VISIT: '/api/spots/:id/visit',
      FAVORITE: '/api/spots/:id/favorite',
      UNFAVORITE: '/api/spots/:id/unfavorite',
      FAVORITES: '/api/spots/favorites',
      MY_SPOTS: '/api/spots/my-spots',
    },
    // Comments endpoints
    COMMENTS: {
      LIST: '/api/comments',
      CREATE: '/api/comments',
      UPDATE: '/api/comments/:id',
      DELETE: '/api/comments/:id',
      SPOT_COMMENTS: '/api/spots/:spotId/comments',
    },
    // Health check
    HEALTH: '/health',
  },
  
  // App Configuration
  APP: {
    NAME: 'Hidden Spots',
    VERSION: '1.0.0',
    DESCRIPTION: 'Discover and share hidden gems around the world',
  },
  
  // Map Configuration
  MAP: {
    DEFAULT_LATITUDE: 40.7128,
    DEFAULT_LONGITUDE: -74.0060,
    DEFAULT_ZOOM: 13,
    MAX_DISTANCE: 50, // km
  },
  
  // Image Configuration
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 5,
    QUALITY: 0.8,
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
  },
  
  // Categories
  CATEGORIES: [
    { id: 'Romantic', label: 'Romantic', icon: 'heart' },
    { id: 'Serene', label: 'Serene', icon: 'leaf' },
    { id: 'Creative', label: 'Creative', icon: 'brush' },
  ],
  
  // Sort options
  SORT_OPTIONS: [
    { id: 'newest', label: 'Newest' },
    { id: 'rating', label: 'Top Rated' },
    { id: 'popular', label: 'Most Popular' },
  ],
};

export default CONFIG; 