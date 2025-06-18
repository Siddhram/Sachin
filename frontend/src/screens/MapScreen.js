import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import { apiService } from '../services/api';
import { showMessage } from 'react-native-flash-message';
import SpotMarker from '../components/SpotMarker';
import SpotCard from '../components/SpotCard';
import FilterModal from '../components/FilterModal';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const { colors, spacing } = useTheme();
  const { userLocation, setUserLocation } = useLocation();
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: null,
    maxDistance: 10,
    minRating: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef(null);

  // Initial region (Gwalior, Madhya Pradesh)
  const initialRegion = {
    latitude: 26.2183,
    longitude: 78.1489,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    requestLocationPermission();
    loadSpots();
  }, []);

  useEffect(() => {
    if (filters) {
      loadSpots();
    }
  }, [filters]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        showMessage({
          message: 'Location Permission Required',
          description: 'Please enable location access to discover nearby spots.',
          type: 'warning',
        });
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      // Animate map to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      // Load nearby spots
      loadNearbySpots(latitude, longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
      showMessage({
        message: 'Location Error',
        description: 'Unable to get your current location.',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpots = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.spots.getSpots({
        page: 1,
        limit: 50,
        ...filters,
      });
      setSpots(response.data.spots || []);
    } catch (error) {
      console.error('Error loading spots:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to load spots. Please try again.',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNearbySpots = async (latitude, longitude) => {
    try {
      const response = await apiService.spots.getNearby({
        latitude,
        longitude,
        maxDistance: filters.maxDistance,
        category: filters.category,
      });
      setSpots(response.data.spots || []);
    } catch (error) {
      console.error('Error loading nearby spots:', error);
    }
  };

  const handleMarkerPress = (spot) => {
    setSelectedSpot(spot);
  };

  const handleSpotCardPress = () => {
    if (selectedSpot) {
      navigation.navigate('SpotDetails', { spotId: selectedSpot._id });
    }
  };

  const handleSpotCardClose = () => {
    setSelectedSpot(null);
  };

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

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor={colors.background}
      >
        {spots.map((spot) => (
          <Marker
            key={spot._id}
            coordinate={{
              latitude: spot.coordinates.coordinates[1],
              longitude: spot.coordinates.coordinates[0],
            }}
            onPress={() => handleMarkerPress(spot)}
          >
            <SpotMarker
              category={spot.category}
              rating={spot.overallRating}
              color={getCategoryColor(spot.category)}
              icon={getCategoryIcon(spot.category)}
            />
          </Marker>
        ))}
      </MapView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.white }]}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.white }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Selected Spot Card */}
      {selectedSpot && (
        <View style={styles.spotCardContainer}>
          <SpotCard
            spot={selectedSpot}
            onPress={handleSpotCardPress}
            onClose={handleSpotCardClose}
          />
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  controls: {
    position: 'absolute',
    top: 50,
    right: 16,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spotCardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
});

export default MapScreen; 