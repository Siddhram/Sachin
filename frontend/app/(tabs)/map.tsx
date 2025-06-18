import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, Spot } from '../../services/api';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { CONFIG } from '../../constants/Config';

const { width, height } = Dimensions.get('window');

// Gwalior coordinates
const GWALIOR_REGION = {
  latitude: 26.2183,
  longitude: 78.1642,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [region, setRegion] = useState(GWALIOR_REGION);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    requestLocationPermission();
    loadSpots();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(newLocation);
        
        // Update map region to include user location and Gwalior
        const newRegion = {
          latitude: (newLocation.latitude + GWALIOR_REGION.latitude) / 2,
          longitude: (newLocation.longitude + GWALIOR_REGION.longitude) / 2,
          latitudeDelta: Math.max(
            Math.abs(newLocation.latitude - GWALIOR_REGION.latitude) * 1.5,
            0.05
          ),
          longitudeDelta: Math.max(
            Math.abs(newLocation.longitude - GWALIOR_REGION.longitude) * 1.5,
            0.05
          ),
        };
        setRegion(newRegion);
      } else {
        Alert.alert(
          'Location Permission',
          'Location permission is required to show your position on the map.'
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadSpots = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSpots();
      setSpots(response.data || []);
    } catch (error) {
      console.error('Error loading spots:', error);
      Alert.alert('Error', 'Failed to load spots');
    } finally {
      setIsLoading(false);
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

  const handleMarkerPress = (spot: Spot) => {
    setSelectedSpot(spot);
  };

  const handleSpotPress = () => {
    if (selectedSpot) {
      router.push({
        pathname: '/spot/[id]',
        params: { id: selectedSpot._id }
      });
    }
  };

  const centerOnGwalior = () => {
    mapRef.current?.animateToRegion(GWALIOR_REGION, 1000);
  };

  const centerOnUser = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const filteredSpots = selectedCategory 
    ? spots.filter(spot => spot.category === selectedCategory)
    : spots;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading map...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={setRegion}
      >
        {/* Hidden Spots Markers */}
        {filteredSpots.map((spot) => (
          <Marker
            key={spot._id}
            coordinate={{
              latitude: spot.coordinates?.coordinates?.[1] || GWALIOR_REGION.latitude,
              longitude: spot.coordinates?.coordinates?.[0] || GWALIOR_REGION.longitude,
            }}
            onPress={() => handleMarkerPress(spot)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getCategoryColor(spot.category) }]}>
              <Ionicons name={getCategoryIcon(spot.category) as any} size={20} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Hidden Spots Map</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Discover secret gems around Gwalior
        </Text>
      </View>

      {/* Category Filter */}
      <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedCategory === null ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.filterButtonText,
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
                styles.filterButton,
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
                  styles.filterButtonText,
                  { color: selectedCategory === category.id ? 'white' : colors.text },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={centerOnGwalior}
        >
          <Ionicons name="location" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          onPress={centerOnUser}
        >
          <Ionicons name="navigate" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Selected Spot Info */}
      {selectedSpot && (
        <View style={[styles.spotInfo, { backgroundColor: colors.background }]}>
          <View style={styles.spotHeader}>
            <View style={styles.spotTitleContainer}>
              <Text style={[styles.spotTitle, { color: colors.text }]} numberOfLines={1}>
                {selectedSpot.name}
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedSpot.category) }]}>
                <Ionicons name={getCategoryIcon(selectedSpot.category) as any} size={12} color="white" />
                <Text style={styles.categoryText}>{selectedSpot.category}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
              onPress={() => setSelectedSpot(null)}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.spotDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {selectedSpot.description}
          </Text>
          
          <View style={styles.spotFooter}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={[styles.rating, { color: colors.textSecondary }]}>
                {selectedSpot.overallRating !== undefined && selectedSpot.overallRating !== null
                  ? Number(selectedSpot.overallRating).toFixed(1)
                  : 'N/A'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: colors.primary }]}
              onPress={handleSpotPress}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  filterContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  spotInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  spotTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  spotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  spotFooter: {
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
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
}); 