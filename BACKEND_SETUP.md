# Backend Setup Guide

## 🚀 Quick Start for Hidden Spots Backend

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Create Environment File

Create a file named `.env` in the `backend` folder with the following content:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/hidden-spots

# Option 2: MongoDB Atlas (recommended for production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hidden-spots

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration (for image uploads)
# Get these from https://cloudinary.com/ (free account)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Set Up MongoDB

#### Option A: Local MongoDB

1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use the local URI in your .env file

#### Option B: MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace the MONGODB_URI in your .env file

### Step 4: Set Up Cloudinary (Optional for now)

1. Go to https://cloudinary.com/
2. Create a free account
3. Get your cloud name, API key, and API secret
4. Add them to your .env file

### Step 5: Start the Server

```bash
cd backend
npm start
```

You should see:

```
✅ Connected to MongoDB Atlas
🚀 Hidden Spots API running on port 5001
📱 Environment: development
🗺️  Health check: http://localhost:5001/health
```

### Step 6: Test the API

Open your browser and go to:

```
http://192.168.56.1:5001/health
```

You should see a JSON response like:

```json
{
  "status": "OK",
  "message": "Hidden Spots API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 7: Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**

   - Check if MongoDB is running
   - Verify your connection string
   - Make sure your IP is whitelisted (for Atlas)

2. **Port Already in Use**

   - Change the PORT in .env file
   - Kill the process using the port: `npx kill-port 5001`

3. **CORS Errors**

   - The server is configured to accept requests from your IP
   - Make sure the frontend URL matches the CORS configuration

4. **JWT Secret Missing**
   - Add JWT_SECRET to your .env file
   - Use a strong, random string

## 📱 Frontend Integration

Once your backend is running:

1. Your frontend should automatically connect to `http://192.168.56.1:5001`
2. Try registering a new user
3. Try logging in with existing credentials

## 🎯 Quick Test Commands

```bash
# Test health endpoint
curl http://192.168.56.1:5001/health

# Test registration
curl -X POST http://192.168.56.1:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'
```

## 📞 Need Help?

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set
3. Make sure MongoDB is running
4. Check if the port 5001 is available
