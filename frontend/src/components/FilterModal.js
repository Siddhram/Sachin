import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const FilterModal = ({ visible, filters, onApply, onClose }) => {
  const { colors, spacing } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = [
    { id: null, name: 'All Categories', icon: 'grid' },
    { id: 'Romantic', name: 'Romantic', icon: 'heart' },
    { id: 'Serene', name: 'Serene', icon: 'leaf' },
    { id: 'Creative', name: 'Creative', icon: 'brush' },
  ];

  const distanceOptions = [
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 20, label: '20 km' },
    { value: 50, label: '50 km' },
  ];

  const ratingOptions = [
    { value: 0, label: 'Any Rating' },
    { value: 3, label: '3+ Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 4.5, label: '4.5+ Stars' },
  ];

  const handleCategorySelect = (categoryId) => {
    setLocalFilters(prev => ({ ...prev, category: categoryId }));
  };

  const handleDistanceSelect = (distance) => {
    setLocalFilters(prev => ({ ...prev, maxDistance: distance }));
  };

  const handleRatingSelect = (rating) => {
    setLocalFilters(prev => ({ ...prev, minRating: rating }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: null,
      maxDistance: 10,
      minRating: 0,
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.white }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
              <View style={styles.optionsContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: localFilters.category === category.id 
                          ? getCategoryColor(category.id) 
                          : colors.lightGray,
                        borderColor: localFilters.category === category.id 
                          ? getCategoryColor(category.id) 
                          : colors.border,
                      }
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Ionicons 
                      name={category.icon} 
                      size={16} 
                      color={localFilters.category === category.id ? colors.white : colors.text} 
                    />
                    <Text 
                      style={[
                        styles.optionText,
                        { 
                          color: localFilters.category === category.id ? colors.white : colors.text 
                        }
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Max Distance</Text>
              <View style={styles.optionsContainer}>
                {distanceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: localFilters.maxDistance === option.value 
                          ? colors.primary 
                          : colors.lightGray,
                        borderColor: localFilters.maxDistance === option.value 
                          ? colors.primary 
                          : colors.border,
                      }
                    ]}
                    onPress={() => handleDistanceSelect(option.value)}
                  >
                    <Text 
                      style={[
                        styles.optionText,
                        { 
                          color: localFilters.maxDistance === option.value ? colors.white : colors.text 
                        }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Minimum Rating</Text>
              <View style={styles.optionsContainer}>
                {ratingOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: localFilters.minRating === option.value 
                          ? colors.warning 
                          : colors.lightGray,
                        borderColor: localFilters.minRating === option.value 
                          ? colors.warning 
                          : colors.border,
                      }
                    ]}
                    onPress={() => handleRatingSelect(option.value)}
                  >
                    <Ionicons 
                      name="star" 
                      size={16} 
                      color={localFilters.minRating === option.value ? colors.white : colors.text} 
                    />
                    <Text 
                      style={[
                        styles.optionText,
                        { 
                          color: localFilters.minRating === option.value ? colors.white : colors.text 
                        }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={[styles.applyButtonText, { color: colors.white }]}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal; 