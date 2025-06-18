const mongoose = require('mongoose');
const Comment = require('./models/Comment');
const Spot = require('./models/Spot');
const User = require('./models/User');
require('dotenv').config();

async function testCommentCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a test user and spot
    const user = await User.findOne();
    const spot = await Spot.findOne();

    if (!user || !spot) {
      console.log('❌ No user or spot found for testing');
      return;
    }

    console.log('📝 Testing comment creation...');
    console.log('User:', user.username);
    console.log('Spot:', spot.name);

    // Create a test comment
    const testComment = new Comment({
      spotId: spot._id,
      userId: user._id,
      content: 'This is a test comment from the backend test script',
      isAnonymous: false
    });

    await testComment.save();
    console.log('✅ Comment created successfully');

    // Populate user info
    await testComment.populate('userId', 'username profilePicture');
    console.log('✅ Comment populated with user info');

    console.log('📋 Comment details:');
    console.log('- ID:', testComment._id);
    console.log('- Content:', testComment.content);
    console.log('- User:', testComment.userId.username);
    console.log('- Anonymous:', testComment.isAnonymous);
    console.log('- Created:', testComment.createdAt);

    // Test the publicSummary virtual
    console.log('📋 Public summary:');
    console.log(JSON.stringify(testComment.publicSummary, null, 2));

    // Clean up - delete the test comment
    await Comment.findByIdAndDelete(testComment._id);
    console.log('🧹 Test comment cleaned up');

  } catch (error) {
    console.error('❌ Error testing comment creation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCommentCreation(); 