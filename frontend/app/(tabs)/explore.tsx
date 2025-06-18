import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Spot } from '../../services/api';
import { SpotCard } from '../../components/spots/SpotCard';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { CONFIG } from '../../constants/Config';

const { width } = Dimensions.get('window');

// Helper to calculate average rating across all categories (0-5 scale)
function getAverageRating(spot: Spot): number {
  const ratings = spot.ratings;
  const values = [
    ratings.vibe?.count ? ratings.vibe.average : null,
    ratings.safety?.count ? ratings.safety.average : null,
    ratings.uniqueness?.count ? ratings.uniqueness.average : null,
    ratings.crowdLevel?.count ? ratings.crowdLevel.average : null,
  ];
  const valid = values.filter((v) => typeof v === 'number');
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => (a as number) + (b as number), 0) / valid.length;
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  distanceContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  distanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  distanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  distanceButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  sortContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

const renderSortFilter = (selectedSort: string, setSelectedSort: (id: string) => void, colors: any) => (
  <View style={styles.sortContainer}>
    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Sort by:</Text>
    <View style={styles.sortButtons}>
      {CONFIG.SORT_OPTIONS.map((sortOption) => (
        <TouchableOpacity
          key={sortOption.id}
          style={[
            styles.sortButton,
            {
              backgroundColor: selectedSort === sortOption.id ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSelectedSort(sortOption.id)}
        >
          <Ionicons
            name={
              sortOption.id === 'rating' ? 'star' :
              sortOption.id === 'newest' ? 'time' :
              sortOption.id === 'popular' ? 'trending-up' : 'list'
            }
            size={16}
            color={selectedSort === sortOption.id ? 'white' : colors.textSecondary}
          />
          <Text
            style={[
              styles.sortButtonText,
              { color: selectedSort === sortOption.id ? 'white' : colors.text },
            ]}
          >
            {sortOption.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function ExploreScreen() {
  const [nearbySpots, setNearbySpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState(10);
  const [selectedSort, setSelectedSort] = useState<string>('rating'); // Default to rating sort
  
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadNearbySpots();
    }
  }, [userLocation, selectedCategory, maxDistance, selectedSort]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        // Use default location if permission denied
        setUserLocation({
          latitude: CONFIG.MAP.DEFAULT_LATITUDE,
          longitude: CONFIG.MAP.DEFAULT_LONGITUDE,
        });
        Alert.alert(
          'Location Permission',
          'Location permission is required to find nearby spots. Using default location.'
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Use default location
      setUserLocation({
        latitude: CONFIG.MAP.DEFAULT_LATITUDE,
        longitude: CONFIG.MAP.DEFAULT_LONGITUDE,
      });
    }
  };

  const loadNearbySpots = async (refresh = false) => {
    if (!userLocation) return;

    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const params: any = {
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
        maxDistance,
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const spots = await apiService.getNearbySpots(params);
      let sortedSpots = [...spots];
      // Always sort by average rating descending for 'rating' sort
      if (selectedSort === 'rating' || !selectedSort) {
        sortedSpots.sort((a, b) => getAverageRating(b) - getAverageRating(a));
      }
      // Optionally handle other sorts here (newest, popular, etc.)
      console.log('Sorted spots with average ratings:', sortedSpots.map(s => ({
        name: s.name,
        avg: getAverageRating(s),
        ratings: s.ratings
      })));
      setNearbySpots(sortedSpots);
    } catch (error) {
      console.error('Error loading nearby spots:', error);
      Alert.alert('Error', 'Failed to load nearby spots. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadNearbySpots(true);
  };

  const handleSpotPress = (spot: Spot) => {
    // Navigate to spot detail screen
    router.push({
      pathname: '/spot/[id]',
      params: { id: spot._id }
    });
  };

  const handleFavorite = async (spotId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to favorite spots.');
      return;
    }

    try {
      await apiService.favoriteSpot(spotId);
      // Update the spot in the list to show it's favorited
      setNearbySpots(prev => 
        prev.map(spot => 
          spot._id === spotId 
            ? { ...spot, isFavorited: true }
            : spot
        )
      );
    } catch (error) {
      console.error('Error favoriting spot:', error);
      Alert.alert('Error', 'Failed to favorite spot. Please try again.');
    }
  };

  const renderDistanceFilter = () => (
    <View style={styles.distanceContainer}>
      <Text style={[styles.distanceLabel, { color: colors.textSecondary }]}>
        Search radius: {maxDistance}km
      </Text>
      <View style={styles.distanceButtons}>
        {[5, 10, 25, 50].map((distance) => (
          <TouchableOpacity
            key={distance}
            style={[
              styles.distanceButton,
              {
                backgroundColor: maxDistance === distance ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setMaxDistance(distance)}
          >
            <Text
              style={[
                styles.distanceButtonText,
                { color: maxDistance === distance ? 'white' : colors.text },
              ]}
            >
              {distance}km
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
        Filter by category:
      </Text>
      <View style={styles.categoryButtons}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            {
              backgroundColor: selectedCategory === null ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              { color: selectedCategory === null ? 'white' : colors.text },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        {CONFIG.CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category.id ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={selectedCategory === category.id ? 'white' : colors.textSecondary}
            />
            <Text
              style={[
                styles.categoryButtonText,
                { color: selectedCategory === category.id ? 'white' : colors.text },
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No nearby spots</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {selectedCategory 
          ? `No ${selectedCategory.toLowerCase()} spots within ${maxDistance}km`
          : `No spots found within ${maxDistance}km of your location`
        }
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={handleRefresh}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && nearbySpots.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Finding spots near you...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Explore Nearby</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Discover hidden gems around you
        </Text>
      </View>

      {renderDistanceFilter()}
      {renderCategoryFilter()}
      {renderSortFilter(selectedSort, setSelectedSort, colors)}

      <FlatList
        data={nearbySpots}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SpotCard
            spot={item}
            onPress={handleSpotPress}
            onFavorite={handleFavorite}
            isFavorited={false}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState()}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/create-spot')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
