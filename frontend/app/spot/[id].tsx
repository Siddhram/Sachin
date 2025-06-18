import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Share,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Spot, Comment } from '../../services/api';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

interface Rating {
  vibe: number;
  safety: number;
  uniqueness: number;
  crowdLevel: number;
}

export default function SpotDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userRating, setUserRating] = useState<Rating>({
    vibe: 0,
    safety: 0,
    uniqueness: 0,
    crowdLevel: 0,
  });
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (id) {
      loadSpotDetails();
    }
  }, [id]);

  const loadSpotDetails = async () => {
    try {
      setIsLoading(true);
      const [spotData, commentsData] = await Promise.all([
        apiService.getSpot(id as string),
        apiService.getSpotComments(id as string),
      ]);
      console.log('Spot data received:', JSON.stringify(spotData, null, 2));
      setSpot(spotData);
      setComments(commentsData.data || []);
    } catch (error) {
      console.error('Error loading spot details:', error);
      Alert.alert('Error', 'Failed to load spot details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to favorite spots');
      return;
    }

    try {
      if (isFavorited) {
        await apiService.unfavoriteSpot(spot!._id);
        setIsFavorited(false);
      } else {
        await apiService.favoriteSpot(spot!._id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleVisit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to mark spots as visited');
      return;
    }

    try {
      await apiService.visitSpot(spot!._id);
      setIsVisited(true);
      Alert.alert('Success', 'Spot marked as visited!');
    } catch (error) {
      console.error('Error marking as visited:', error);
      Alert.alert('Error', 'Failed to mark spot as visited');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing hidden spot: ${spot?.name || 'Hidden Spot'}\n\n${spot?.description || 'A special place to discover'}\n\nLocation: ${spot?.address?.city || 'Gwalior'}, ${spot?.address?.state || 'Madhya Pradesh'}`,
        title: spot?.name || 'Hidden Spot',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to rate spots');
      return;
    }

    // Check if at least one rating is provided
    const hasRating = userRating.vibe > 0 || userRating.safety > 0 || 
                     userRating.uniqueness > 0 || userRating.crowdLevel > 0;
    
    if (!hasRating) {
      Alert.alert('Error', 'Please provide at least one rating');
      return;
    }

    try {
      // Use the dedicated rating endpoint
      await apiService.rateSpot(spot!._id, userRating);
      setShowRatingModal(false);
      setUserRating({ vibe: 0, safety: 0, uniqueness: 0, crowdLevel: 0 });
      Alert.alert('Success', 'Rating submitted successfully!');
      loadSpotDetails(); // Reload to get updated ratings
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('spotId', spot!._id);
      formData.append('content', newComment.trim());
      formData.append('isAnonymous', isAnonymous.toString());

      await apiService.createComment(formData);
      setShowCommentModal(false);
      setNewComment('');
      Alert.alert('Success', 'Comment posted successfully!');
      loadSpotDetails(); // Reload to get new comment
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Romantic':
        return colors.romantic;
      case 'Serene':
        return colors.serene;
      case 'Creative':
        return colors.creative;
      default:
        return colors.primary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Romantic':
        return 'heart';
      case 'Serene':
        return 'leaf';
      case 'Creative':
        return 'brush';
      default:
        return 'location';
    }
  };

  const renderStars = (rating: number, onPress?: (value: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress?.(star)}
            disabled={!onPress}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={20}
              color={star <= rating ? colors.accent : colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderImageGallery = () => {
    if (!spot?.images || spot.images.length === 0) {
      return (
        <View style={[styles.placeholderImage, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="image-outline" size={80} color={colors.textTertiary} />
        </View>
      );
    }

    return (
      <View style={styles.imageGallery}>
        <TouchableOpacity
          style={styles.mainImage}
          onPress={() => setShowImageModal(true)}
        >
          <Image source={{ uri: spot.images[currentImageIndex].url }} style={styles.mainImageContent} />
          {spot.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {spot.images.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        {spot.images.length > 1 && (
          <FlatList
            data={spot.images}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailList}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.thumbnail,
                  currentImageIndex === index && { borderColor: colors.primary }
                ]}
                onPress={() => setCurrentImageIndex(index)}
              >
                <Image source={{ uri: item.url }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    );
  };

  const renderRatingSection = () => {
    const ratings = spot?.ratings;
    if (!ratings) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Ratings</Text>
        
        <View style={styles.ratingsGrid}>
          <View style={styles.ratingItem}>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Vibe</Text>
            {renderStars(ratings.vibe?.average || 0)}
            <Text style={[styles.ratingCount, { color: colors.textTertiary }]}>
              {ratings.vibe?.count || 0} ratings
            </Text>
          </View>
          
          <View style={styles.ratingItem}>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Safety</Text>
            {renderStars(ratings.safety?.average || 0)}
            <Text style={[styles.ratingCount, { color: colors.textTertiary }]}>
              {ratings.safety?.count || 0} ratings
            </Text>
          </View>
          
          <View style={styles.ratingItem}>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Uniqueness</Text>
            {renderStars(ratings.uniqueness?.average || 0)}
            <Text style={[styles.ratingCount, { color: colors.textTertiary }]}>
              {ratings.uniqueness?.count || 0} ratings
            </Text>
          </View>
          
          <View style={styles.ratingItem}>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Crowd Level</Text>
            {renderStars(ratings.crowdLevel?.average || 0)}
            <Text style={[styles.ratingCount, { color: colors.textTertiary }]}>
              {ratings.crowdLevel?.count || 0} ratings
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.rateButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowRatingModal(true)}
        >
          <Ionicons name="star-outline" size={20} color="white" />
          <Text style={styles.rateButtonText}>Rate This Spot</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderComments = () => (
    <View style={styles.section}>
      <View style={styles.commentsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Experiences</Text>
        <TouchableOpacity
          style={[styles.addCommentButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCommentModal(true)}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addCommentText}>Add Comment</Text>
        </TouchableOpacity>
      </View>

      {comments.length > 0 ? (
        comments.map((comment) => (
          <View key={comment._id} style={[styles.commentCard, { backgroundColor: colors.surface }]}>
            <View style={styles.commentHeader}>
              <Text style={[styles.commentAuthor, { color: colors.text }]}>
                {comment.isAnonymous ? 'Anonymous' : (comment.userId?.username || 'Unknown User')}
              </Text>
              <Text style={[styles.commentDate, { color: colors.textTertiary }]}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={[styles.commentContent, { color: colors.textSecondary }]}>
              {comment.content}
            </Text>

            {comment.rating && (
              <View style={styles.commentRating}>
                <Text style={[styles.commentRatingLabel, { color: colors.textTertiary }]}>
                  Their rating:
                </Text>
                <View style={styles.commentRatingStars}>
                  {renderStars(comment.rating.vibe)}
                  <Text style={[styles.commentRatingText, { color: colors.textTertiary }]}>
                    Vibe: {comment.rating.vibe}/5
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))
      ) : (
        <Text style={[styles.noComments, { color: colors.textSecondary }]}>
          No comments yet. Be the first to share your experience!
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading spot details...
        </Text>
      </View>
    );
  }

  if (!spot) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Spot not found</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.overlay }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.overlay }]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.overlay }]}
              onPress={handleFavorite}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorited ? colors.romantic : 'white'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(spot.category) }]}>
          <Ionicons name={getCategoryIcon(spot.category) as any} size={16} color="white" />
          <Text style={styles.categoryText}>{spot.category}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Rating */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{spot.name || 'Hidden Spot'}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.accent} />
              <Text style={[styles.rating, { color: colors.textSecondary }]}>
                {spot.overallRating !== undefined && spot.overallRating !== null
                  ? Number(spot.overallRating).toFixed(1)
                  : 'N/A'}
              </Text>
              <Text style={[styles.visitCount, { color: colors.textTertiary }]}>
                ({spot.visitCount || 0} visits)
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {spot.description || 'No description available'}
          </Text>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={styles.locationText}>
                <Text style={[styles.address, { color: colors.text }]}>
                  {spot.address?.street || 'Address not specified'}
                </Text>
                <Text style={[styles.city, { color: colors.textSecondary }]}>
                  {spot.address?.city || 'Gwalior'}, {spot.address?.state || 'Madhya Pradesh'}
                </Text>
              </View>
            </View>
          </View>

          {/* Story */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>The Story</Text>
            <Text style={[styles.story, { color: colors.textSecondary }]}>
              {spot.story || 'No story available'}
            </Text>
          </View>

          {/* Tips */}
          {spot.tips && spot.tips.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pro Tips</Text>
              {spot.tips.map((tip, index) => (
                <View key={index} style={styles.tipContainer}>
                  <Ionicons name="bulb-outline" size={16} color={colors.accent} />
                  <Text style={[styles.tip, { color: colors.textSecondary }]}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Best Time to Visit */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Best Time to Visit</Text>
            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  {spot.bestTimeToVisit?.timeOfDay || 'Any time'}
                </Text>
              </View>
              <View style={styles.timeItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  {spot.bestTimeToVisit?.season || 'Any season'}
                </Text>
              </View>
            </View>
          </View>

          {/* Accessibility */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Accessibility</Text>
            <View style={styles.accessibilityContainer}>
              <View style={styles.accessibilityItem}>
                <Ionicons 
                  name={spot.accessibility?.wheelchairAccessible ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={spot.accessibility?.wheelchairAccessible ? colors.success : colors.error} 
                />
                <Text style={[styles.accessibilityText, { color: colors.textSecondary }]}>
                  Wheelchair Accessible
                </Text>
              </View>
              <View style={styles.accessibilityItem}>
                <Ionicons 
                  name={spot.accessibility?.parkingAvailable ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={spot.accessibility?.parkingAvailable ? colors.success : colors.error} 
                />
                <Text style={[styles.accessibilityText, { color: colors.textSecondary }]}>
                  Parking Available
                </Text>
              </View>
              <View style={styles.accessibilityItem}>
                <Ionicons 
                  name={spot.accessibility?.publicTransport ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={spot.accessibility?.publicTransport ? colors.success : colors.error} 
                />
                <Text style={[styles.accessibilityText, { color: colors.textSecondary }]}>
                  Public Transport
                </Text>
              </View>
            </View>
          </View>

          {/* Community Ratings */}
          {renderRatingSection()}

          {/* Comments */}
          {renderComments()}

          {/* Author */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shared by</Text>
            <View style={styles.authorContainer}>
              <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={20} color="white" />
              </View>
              <View style={styles.authorInfo}>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {spot.createdBy?.username || 'Unknown User'}
                </Text>
                <Text style={[styles.authorDate, { color: colors.textTertiary }]}>
                  {new Date(spot.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Visit Button */}
          <TouchableOpacity
            style={[styles.visitButton, { backgroundColor: colors.primary }]}
            onPress={handleVisit}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text style={styles.visitButtonText}>
              {isVisited ? 'Visited!' : 'Mark as Visited'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Rate This Spot</Text>
            
            <View style={styles.ratingModalItem}>
              <Text style={[styles.ratingModalLabel, { color: colors.text }]}>Vibe</Text>
              {renderStars(userRating.vibe, (value) => 
                setUserRating(prev => ({ ...prev, vibe: value }))
              )}
            </View>
            
            <View style={styles.ratingModalItem}>
              <Text style={[styles.ratingModalLabel, { color: colors.text }]}>Safety</Text>
              {renderStars(userRating.safety, (value) => 
                setUserRating(prev => ({ ...prev, safety: value }))
              )}
            </View>
            
            <View style={styles.ratingModalItem}>
              <Text style={[styles.ratingModalLabel, { color: colors.text }]}>Uniqueness</Text>
              {renderStars(userRating.uniqueness, (value) => 
                setUserRating(prev => ({ ...prev, uniqueness: value }))
              )}
            </View>
            
            <View style={styles.ratingModalItem}>
              <Text style={[styles.ratingModalLabel, { color: colors.text }]}>Crowd Level</Text>
              {renderStars(userRating.crowdLevel, (value) => 
                setUserRating(prev => ({ ...prev, crowdLevel: value }))
              )}
            </View>

            <TouchableOpacity
              style={[styles.anonymousToggle, { backgroundColor: colors.surface }]}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <Ionicons
                name={isAnonymous ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={isAnonymous ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.anonymousText, { color: colors.text }]}>
                Submit anonymously
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textTertiary }]}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmitRating}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Share Your Experience</Text>
            
            <TextInput
              style={[styles.commentInput, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border, 
                color: colors.text 
              }]}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Tell us about your experience at this spot..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.anonymousToggle, { backgroundColor: colors.surface }]}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <Ionicons
                name={isAnonymous ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={isAnonymous ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.anonymousText, { color: colors.text }]}>
                Post anonymously
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textTertiary }]}
                onPress={() => setShowCommentModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmitComment}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Post Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: spot?.images[currentImageIndex]?.url }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  visitCount: {
    fontSize: 14,
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  city: {
    fontSize: 14,
  },
  story: {
    fontSize: 16,
    lineHeight: 24,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    marginLeft: 6,
  },
  accessibilityContainer: {
    gap: 8,
  },
  accessibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessibilityText: {
    fontSize: 14,
    marginLeft: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  authorDate: {
    fontSize: 12,
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  visitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageGallery: {
    height: 300,
    marginBottom: 20,
  },
  mainImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImageContent: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  thumbnailList: {
    height: 100,
    marginTop: 10,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  ratingItem: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 12,
    marginTop: 4,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  rateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addCommentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  commentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentRating: {
    marginTop: 8,
  },
  commentRatingLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  commentRatingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentRatingText: {
    fontSize: 12,
  },
  noComments: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalImage: {
    width: width * 0.9,
    height: height * 0.7,
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingModalItem: {
    marginBottom: 16,
  },
  ratingModalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  anonymousText: {
    fontSize: 14,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
}); 