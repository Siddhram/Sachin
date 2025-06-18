import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SpotCard = ({ spot, onPress, onClose }) => {
  const { colors, spacing } = useTheme();

  const getCategoryColor = (category) => {
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

  const getCategoryIcon = (category) => {
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

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.white }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Close Button */}
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: colors.white }]}
        onPress={onClose}
      >
        <Ionicons name="close" size={20} color={colors.gray} />
      </TouchableOpacity>

      {/* Spot Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: spot.images?.[0] || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(spot.category) }]}>
          <Ionicons name={getCategoryIcon(spot.category)} size={16} color={colors.white} />
          <Text style={[styles.categoryText, { color: colors.white }]}>
            {spot.category}
          </Text>
        </View>
      </View>

      {/* Spot Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {spot.name}
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {spot.description}
        </Text>

        <View style={styles.metaContainer}>
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {spot.overallRating?.toFixed(1) || 'N/A'}
            </Text>
          </View>

          {/* Distance */}
          {spot.distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                {spot.distance.toFixed(1)} km
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SpotCard; 