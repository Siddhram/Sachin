# Hidden Spots API Testing Guide

## 🚀 Base URL

```
http://192.168.56.1:5001
```

## 🔐 Authentication Routes

### 1. User Registration

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!"
}
```

**Validation Rules:**

- Username: 3-30 characters, letters, numbers, underscores only
- Email: Valid email format
- Password: Min 6 chars, must contain lowercase, uppercase, and number

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "testuser",
    "email": "test@example.com",
    "profilePicture": null,
    "bio": null,
    "stats": {
      "totalSpots": 0,
      "totalComments": 0,
      "totalVisits": 0
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActive": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. User Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "test@example.com",
  "password": "Test123!"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "testuser",
    "email": "test@example.com",
    "profilePicture": null,
    "bio": null,
    "stats": {
      "totalSpots": 0,
      "totalComments": 0,
      "totalVisits": 0
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActive": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Get User Profile

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "testuser",
    "email": "test@example.com",
    "profilePicture": null,
    "bio": null,
    "stats": {
      "totalSpots": 0,
      "totalComments": 0,
      "totalVisits": 0
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActive": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update User Profile

**PUT** `/api/auth/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "username": "newusername",
  "bio": "This is my bio"
}
```

**Response (200):**

```json
{
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "newusername",
    "email": "test@example.com",
    "profilePicture": null,
    "bio": "This is my bio",
    "stats": {
      "totalSpots": 0,
      "totalComments": 0,
      "totalVisits": 0
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActive": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🗺️ Spots Routes

### 1. Get All Spots

**GET** `/api/spots`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `category` (optional): Filter by category (Romantic, Serene, Creative)
- `search` (optional): Search term
- `sort` (optional): Sort by (rating, newest, popular)

**Example:**

```
GET /api/spots?page=1&limit=10&category=Romantic&sort=rating
```

**Response (200):**

```json
{
  "spots": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Sunset Point",
      "description": "Beautiful sunset view",
      "category": "Romantic",
      "coordinates": {
        "latitude": 26.2183,
        "longitude": 78.1828
      },
      "story": "This is a magical place where couples come to watch the sunset...",
      "tips": ["Best time: 6-7 PM", "Bring camera"],
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "hidden-spots/...",
          "caption": "Sunset view"
        }
      ],
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "username": "testuser",
        "profilePicture": null
      },
      "overallRating": 4.5,
      "visitCount": 25,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

### 2. Get Nearby Spots

**GET** `/api/spots/nearby`

**Query Parameters:**

- `longitude` (required): Longitude coordinate
- `latitude` (required): Latitude coordinate
- `maxDistance` (optional): Max distance in km (default: 10, max: 50)
- `category` (optional): Filter by category

**Example:**

```
GET /api/spots/nearby?longitude=78.1828&latitude=26.2183&maxDistance=5&category=Romantic
```

**Response (200):**

```json
{
  "spots": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Sunset Point",
      "description": "Beautiful sunset view",
      "category": "Romantic",
      "coordinates": {
        "latitude": 26.2183,
        "longitude": 78.1828
      },
      "distance": 2.5,
      "overallRating": 4.5,
      "visitCount": 25
    }
  ]
}
```

### 3. Get Spot Details

**GET** `/api/spots/:id`

**Example:**

```
GET /api/spots/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response (200):**

```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Sunset Point",
  "description": "Beautiful sunset view",
  "category": "Romantic",
  "coordinates": {
    "latitude": 26.2183,
    "longitude": 78.1828
  },
  "story": "This is a magical place where couples come to watch the sunset...",
  "tips": ["Best time: 6-7 PM", "Bring camera"],
  "images": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "hidden-spots/...",
      "caption": "Sunset view"
    }
  ],
  "createdBy": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "testuser",
    "profilePicture": null
  },
  "overallRating": 4.5,
  "visitCount": 25,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Create New Spot

**POST** `/api/spots`

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

```
name: "New Hidden Spot"
description: "A beautiful hidden spot"
category: "Romantic"
coordinates[longitude]: 78.1828
coordinates[latitude]: 26.2183
story: "This is the story of this amazing spot..."
tips[]: "Best time to visit"
tips[]: "Bring your camera"
images: [file1, file2, file3] (optional)
```

**Response (201):**

```json
{
  "spot": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "New Hidden Spot",
    "description": "A beautiful hidden spot",
    "category": "Romantic",
    "coordinates": {
      "latitude": 26.2183,
      "longitude": 78.1828
    },
    "story": "This is the story of this amazing spot...",
    "tips": ["Best time to visit", "Bring your camera"],
    "images": [],
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d0",
    "overallRating": 0,
    "visitCount": 0,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Visit a Spot

**POST** `/api/spots/:id/visit`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Spot visited successfully",
  "visitCount": 26
}
```

### 6. Favorite/Unfavorite Spot

**POST** `/api/spots/:id/favorite`
**DELETE** `/api/spots/:id/unfavorite`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Spot favorited successfully"
}
```

### 7. Get User's Favorites

**GET** `/api/spots/favorites`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "spots": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Sunset Point",
      "description": "Beautiful sunset view",
      "category": "Romantic",
      "overallRating": 4.5,
      "visitCount": 25
    }
  ]
}
```

## 💬 Comments Routes

### 1. Get User's Comments

**GET** `/api/comments`

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 20)

**Response (200):**

```json
{
  "comments": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "spotId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "content": "Amazing place!",
      "isAnonymous": false,
      "rating": {
        "vibe": 5,
        "safety": 4,
        "uniqueness": 5,
        "crowdLevel": 3
      },
      "images": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10
  }
}
```

### 2. Create Comment

**POST** `/api/comments`

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

```
spotId: "64f8a1b2c3d4e5f6a7b8c9d0"
content: "This is an amazing spot!"
isAnonymous: false
rating[vibe]: 5
rating[safety]: 4
rating[uniqueness]: 5
rating[crowdLevel]: 3
images: [file1, file2] (optional)
```

**Response (201):**

```json
{
  "message": "Comment created successfully",
  "comment": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "spotId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": "This is an amazing spot!",
    "isAnonymous": false,
    "rating": {
      "vibe": 5,
      "safety": 4,
      "uniqueness": 5,
      "crowdLevel": 3
    },
    "images": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update Comment

**PUT** `/api/comments/:id`

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

```
content: "Updated comment content"
isAnonymous: true
images: [file1] (optional)
```

**Response (200):**

```json
{
  "comment": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": "Updated comment content",
    "isAnonymous": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Delete Comment

**DELETE** `/api/comments/:id`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Comment deleted successfully"
}
```

## 🧪 Testing Tools

### Using cURL

**Register User:**

```bash
curl -X POST http://192.168.56.1:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Login:**

```bash
curl -X POST http://192.168.56.1:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Get Spots:**

```bash
curl -X GET "http://192.168.56.1:5001/api/spots?page=1&limit=10&category=Romantic"
```

**Get Profile (with token):**

```bash
curl -X GET http://192.168.56.1:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. **Import this collection:**

```json
{
  "info": {
    "name": "Hidden Spots API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://192.168.56.1:5001"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

## 🔍 Health Check

**GET** `/health`

**Response:**

```json
{
  "status": "OK",
  "message": "Hidden Spots API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## ⚠️ Error Responses

**Validation Error (400):**

```json
{
  "error": "Validation error",
  "message": "Please check your input",
  "details": [
    {
      "type": "field",
      "value": "test",
      "msg": "Username must be between 3 and 30 characters",
      "path": "username",
      "location": "body"
    }
  ]
}
```

**Unauthorized (401):**

```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

**Not Found (404):**

```json
{
  "error": "Route not found",
  "message": "The requested endpoint does not exist"
}
```

**Server Error (500):**

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```
