import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Spot } from '../../services/api';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface SpotCardProps {
  spot: Spot;
  onPress?: (spot: Spot) => void;
  onFavorite?: (spotId: string) => void;
  isFavorited?: boolean;
}

const { width } = Dimensions.get('window');

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  onPress,
  onFavorite,
  isFavorited = false,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(spot._id);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(spot);
    } else {
      // Default navigation to spot details
      router.push({
        pathname: '/spot/[id]',
        params: { id: spot._id }
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.spotCard,
          borderColor: colors.spotCardBorder,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {spot.images && spot.images.length > 0 ? (
          <Image
            source={{ uri: spot.images[0].url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="image-outline" size={40} color={colors.textTertiary} />
          </View>
        )}
        
        <View style={styles.overlay}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(spot.category) }]}>
            <Ionicons name={getCategoryIcon(spot.category) as any} size={12} color="white" />
            <Text style={styles.categoryText}>{spot.category}</Text>
          </View>
          
          {onFavorite && (
            <TouchableOpacity
              style={[styles.favoriteButton, { backgroundColor: colors.overlay }]}
              onPress={handleFavorite}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorited ? colors.romantic : 'white'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {spot.name}
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {spot.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={[styles.rating, { color: colors.textSecondary }]}>
              {spot.overallRating !== undefined && spot.overallRating !== null
                ? spot.overallRating.toFixed(1)
                : 'N/A'}
            </Text>
            <Text style={[styles.visitCount, { color: colors.textTertiary }]}>
              ({spot.visitCount} visits)
            </Text>
          </View>

          <View style={styles.authorContainer}>
            <Text style={[styles.author, { color: colors.textTertiary }]}>
              by {spot.createdBy?.username || 'Unknown User'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
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
  overlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  visitCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  authorContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  author: {
    fontSize: 12,
  },
}); 