import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Updated to port 5001
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// API service object
export const apiService = {
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    verifyToken: () => api.get('/auth/verify'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
    changePassword: (passwordData) => api.put('/auth/password', passwordData),
  },
  
  spots: {
    getSpots: (params = {}) => api.get('/spots', { params }),
    getSpot: (id) => api.get(`/spots/${id}`),
    createSpot: (spotData) => api.post('/spots', spotData),
    updateSpot: (id, spotData) => api.put(`/spots/${id}`, spotData),
    deleteSpot: (id) => api.delete(`/spots/${id}`),
    getNearby: (params) => api.get('/spots/nearby', { params }),
    searchSpots: (query) => api.get('/spots/search', { params: { q: query } }),
    uploadImage: (imageData) => api.post('/spots/upload-image', imageData),
    rateSpot: (id, rating) => api.post(`/spots/${id}/rate`, { rating }),
    favoriteSpot: (id) => api.post(`/spots/${id}/favorite`),
    unfavoriteSpot: (id) => api.delete(`/spots/${id}/favorite`),
    getFavorites: () => api.get('/spots/favorites'),
  },
  
  comments: {
    getComments: (spotId, params = {}) => api.get(`/spots/${spotId}/comments`, { params }),
    createComment: (spotId, commentData) => api.post(`/spots/${spotId}/comments`, commentData),
    updateComment: (spotId, commentId, commentData) => 
      api.put(`/spots/${spotId}/comments/${commentId}`, commentData),
    deleteComment: (spotId, commentId) => 
      api.delete(`/spots/${spotId}/comments/${commentId}`),
    likeComment: (spotId, commentId) => 
      api.post(`/spots/${spotId}/comments/${commentId}/like`),
    unlikeComment: (spotId, commentId) => 
      api.delete(`/spots/${spotId}/comments/${commentId}/like`),
  },
  
  users: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.put('/users/profile', userData),
    getUser: (id) => api.get(`/users/${id}`),
    getUserSpots: (id, params = {}) => api.get(`/users/${id}/spots`, { params }),
    followUser: (id) => api.post(`/users/${id}/follow`),
    unfollowUser: (id) => api.delete(`/users/${id}/follow`),
    getFollowers: (id) => api.get(`/users/${id}/followers`),
    getFollowing: (id) => api.get(`/users/${id}/following`),
  },
  
  feed: {
    getFeed: (params = {}) => api.get('/feed', { params }),
    getTrending: (params = {}) => api.get('/feed/trending', { params }),
    getRecent: (params = {}) => api.get('/feed/recent', { params }),
  },
  
  upload: {
    uploadImage: (imageData, onProgress) => {
      const formData = new FormData();
      formData.append('image', imageData);
      
      return api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
    },
    
    uploadMultipleImages: (images, onProgress) => {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
      });
      
      return api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
    },
  },
  
  notifications: {
    getNotifications: (params = {}) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
  },
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      status,
      message: data.message || 'An error occurred',
      errors: data.errors || null,
    };
  } else if (error.request) {
    // Network error
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: null,
    };
  } else {
    // Other error
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
      errors: null,
    };
  }
};

export default api; 