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
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Spot } from '../../services/api';
import { SpotCard } from '../../components/spots/SpotCard';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { CONFIG } from '../../constants/Config';

export default function TabOneScreen() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyHidden, setShowOnlyHidden] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadSpots();
  }, [selectedCategory, sortBy, searchQuery, showOnlyHidden]);

  const loadSpots = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      }

      const params: any = {
        page,
        limit: CONFIG.PAGINATION.DEFAULT_LIMIT,
        sort: sortBy,
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (showOnlyHidden) {
        params.hiddenOnly = true;
      }

      const response = await apiService.getSpots(params);
      
      if (refresh || page === 1) {
        setSpots(response.data || []);
      } else {
        setSpots(prev => [...prev, ...(response.data || [])]);
      }

      setCurrentPage(page);
      setHasMore(response.pagination?.hasNextPage || false);
    } catch (error) {
      console.error('Error loading spots:', error);
      Alert.alert('Error', 'Failed to load spots. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadSpots(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadSpots(currentPage + 1);
    }
  };

  const handleSpotPress = (spot: Spot) => {
    // Navigate to spot detail screen
    console.log('Spot pressed:', spot.name);
  };

  const handleFavorite = async (spotId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to favorite spots.');
      return;
    }

    try {
      await apiService.favoriteSpot(spotId);
      // Update the spot in the list to show it's favorited
      setSpots(prev => 
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

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
      </ScrollView>
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort by:</Text>
      {CONFIG.SORT_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.sortButton,
            {
              backgroundColor: sortBy === option.id ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSortBy(option.id)}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === option.id ? 'white' : colors.text },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No spots found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {selectedCategory 
          ? `No ${selectedCategory.toLowerCase()} spots available`
          : 'Try adjusting your filters or check back later'
        }
      </Text>
    </View>
  );

  if (isLoading && spots.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading hidden gems...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Discover Hidden Spots</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Find amazing places shared by the community
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search hidden spots..."
            placeholderTextColor={colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle */}
        <View style={styles.filterToggleContainer}>
          <TouchableOpacity
            style={[styles.filterToggle, { backgroundColor: colors.surface }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={16} color={colors.primary} />
            <Text style={[styles.filterToggleText, { color: colors.text }]}>Filters</Text>
            <Ionicons 
              name={showFilters ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.hiddenToggle,
              {
                backgroundColor: showOnlyHidden ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowOnlyHidden(!showOnlyHidden)}
          >
            <Ionicons 
              name="eye-off" 
              size={16} 
              color={showOnlyHidden ? 'white' : colors.textSecondary} 
            />
            <Text
              style={[
                styles.hiddenToggleText,
                { color: showOnlyHidden ? 'white' : colors.text },
              ]}
            >
              Hidden Only
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <>
          {renderCategoryFilter()}
          {renderSortOptions()}
        </>
      )}

      <FlatList
        data={spots.slice().sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0))}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
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
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 4,
  },
  hiddenToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  hiddenToggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
