import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/Config';

// Types
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  preferences?: any;
  stats?: {
    totalSpots: number;
    totalComments: number;
    totalVisits: number;
  };
  createdAt: string;
  lastActive: string;
}

export interface Spot {
  _id: string;
  name: string;
  description: string;
  category: string;
  coordinates: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  story: string;
  tips?: string[];
  images: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  ratings: {
    vibe: {
      average: number;
      count: number;
    };
    safety: {
      average: number;
      count: number;
    };
    uniqueness: {
      average: number;
      count: number;
    };
    crowdLevel: {
      average: number;
      count: number;
    };
  };
  bestTimeToVisit: {
    timeOfDay: string;
    season: string;
  };
  accessibility: {
    wheelchairAccessible: boolean;
    parkingAvailable: boolean;
    publicTransport: boolean;
  };
  createdBy: User;
  overallRating: number;
  visitCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  spotId: string;
  userId: User;
  content: string;
  isAnonymous: boolean;
  rating?: {
    vibe: number;
    safety: number;
    uniqueness: number;
    crowdLevel: number;
  };
  images?: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// API Service Class
class ApiService {
  private api: any;
  private token: string | null = null;

  constructor() {
    console.log('🔧 Initializing API Service with base URL:', CONFIG.API_BASE_URL);
    
    this.api = axios.create({
      baseURL: CONFIG.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config: any) => {
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
        console.log('📡 Base URL:', CONFIG.API_BASE_URL);
        console.log('🔗 Full URL:', (config.baseURL || '') + (config.url || ''));
        
        if (!this.token) {
          this.token = await AsyncStorage.getItem('authToken');
        }
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error: any) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: any) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
      },
      async (error: any) => {
        console.error('❌ API Error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<any> {
    const response = await this.api.post(
      CONFIG.API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    await this.setToken(response.data.token);
    return response.data;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<any> {
    const response = await this.api.post(
      CONFIG.API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    await this.setToken(response.data.token);
    return response.data;
  }

  async getProfile(): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.AUTH.PROFILE
    );
    return response.data.user;
  }

  async updateProfile(profileData: {
    username?: string;
    bio?: string;
    preferences?: any;
  }): Promise<any> {
    const response = await this.api.put(
      CONFIG.API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      profileData
    );
    return response.data.user;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(CONFIG.API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await this.clearToken();
    }
  }

  // Spots Methods
  async getSpots(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    longitude?: number;
    latitude?: number;
    maxDistance?: number;
  }): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.SPOTS.LIST, { params });
    return {
      data: response.data.spots,
      pagination: response.data.pagination,
    };
  }

  async getNearbySpots(params: {
    longitude: number;
    latitude: number;
    maxDistance?: number;
    category?: string;
  }): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.SPOTS.NEARBY,
      { params }
    );
    return response.data.spots;
  }

  async getSpot(id: string): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.SPOTS.DETAIL.replace(':id', id)
    );
    return response.data.spot;
  }

  async createSpot(spotData: {
    name: string;
    description: string;
    category: string;
    coordinates: {
      longitude: number;
      latitude: number;
    };
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
    story: string;
    tips: string[];
    tags: string[];
    bestTimeToVisit: {
      timeOfDay: string;
      season: string;
    };
    accessibility: {
      wheelchairAccessible: boolean;
      parkingAvailable: boolean;
      publicTransport: boolean;
    };
    images: Array<{
      url: string;
      publicId: string;
      caption?: string;
    }>;
  }): Promise<any> {
    const response = await this.api.post(
      CONFIG.API_ENDPOINTS.SPOTS.CREATE,
      spotData
    );
    return response.data.spot;
  }

  async updateSpot(id: string, spotData: FormData): Promise<any> {
    const response = await this.api.put(
      CONFIG.API_ENDPOINTS.SPOTS.UPDATE.replace(':id', id),
      spotData
    );
    return response.data.spot;
  }

  async deleteSpot(id: string): Promise<any> {
    await this.api.delete(
      CONFIG.API_ENDPOINTS.SPOTS.DELETE.replace(':id', id)
    );
  }

  async visitSpot(id: string): Promise<any> {
    await this.api.post(
      CONFIG.API_ENDPOINTS.SPOTS.VISIT.replace(':id', id)
    );
  }

  async favoriteSpot(id: string): Promise<any> {
    await this.api.post(
      CONFIG.API_ENDPOINTS.SPOTS.FAVORITE.replace(':id', id)
    );
  }

  async unfavoriteSpot(id: string): Promise<any> {
    await this.api.post(
      CONFIG.API_ENDPOINTS.SPOTS.UNFAVORITE.replace(':id', id)
    );
  }

  async getFavorites(): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.SPOTS.FAVORITES
    );
    return response.data;
  }

  async getMySpots(): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.SPOTS.MY_SPOTS
    );
    return response.data;
  }

  async rateSpot(spotId: string, rating: {
    vibe?: number;
    safety?: number;
    uniqueness?: number;
    crowdLevel?: number;
  }): Promise<any> {
    await this.api.post(
      `${CONFIG.API_ENDPOINTS.SPOTS.DETAIL.replace(':id', spotId)}/rate`,
      rating
    );
  }

  // Comments Methods
  async getComments(params?: {
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.COMMENTS.LIST, { params }
    );
    return {
      data: response.data.comments,
      pagination: response.data.pagination,
    };
  }

  async getSpotComments(spotId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.COMMENTS.SPOT_COMMENTS.replace(':spotId', spotId),
      { params }
    );
    return {
      data: response.data.comments,
      pagination: response.data.pagination,
    };
  }

  async createComment(commentData: FormData): Promise<any> {
    const response = await this.api.post(
      CONFIG.API_ENDPOINTS.COMMENTS.CREATE,
      commentData
    );
    return response.data.comment;
  }

  async updateComment(id: string, commentData: FormData): Promise<any> {
    const response = await this.api.put(
      CONFIG.API_ENDPOINTS.COMMENTS.UPDATE.replace(':id', id),
      commentData
    );
    return response.data.comment;
  }

  async deleteComment(id: string): Promise<any> {
    await this.api.delete(
      CONFIG.API_ENDPOINTS.COMMENTS.DELETE.replace(':id', id)
    );
  }

  // Health Check
  async healthCheck(): Promise<any> {
    const response = await this.api.get(
      CONFIG.API_ENDPOINTS.HEALTH
    );
    return response.data;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  // Token Management
  private async setToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  private async clearToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 