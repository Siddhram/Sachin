import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SpotMarker = ({ category, rating, color, icon }) => {
  const { colors, typography } = useTheme();

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return colors.success;
    if (rating >= 4.0) return colors.warning;
    if (rating >= 3.0) return colors.info;
    return colors.gray;
  };

  return (
    <View style={styles.container}>
      {/* Main Marker */}
      <View style={[styles.marker, { backgroundColor: color }]}>
        <Ionicons name={icon} size={16} color={colors.white} />
      </View>
      
      {/* Rating Badge */}
      {rating > 0 && (
        <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(rating) }]}>
          <Text style={[styles.ratingText, { color: colors.white }]}>
            {rating.toFixed(1)}
          </Text>
        </View>
      )}
      
      {/* Pulse Animation */}
      <View style={[styles.pulse, { borderColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  ratingBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    opacity: 0.3,
  },
});

export default SpotMarker; 