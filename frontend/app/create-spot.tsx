import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import Colors from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { CONFIG } from '../constants/Config';

export default function CreateSpotScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Serene');
  const [story, setStory] = useState('');
  const [tips, setTips] = useState<string[]>(['']);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('Any');
  const [season, setSeason] = useState('Any');
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [publicTransport, setPublicTransport] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.textTertiary} />
          <Text style={[styles.authTitle, { color: colors.text }]}>Login Required</Text>
          <Text style={[styles.authMessage, { color: colors.textSecondary }]}>
            You need to be logged in to create a hidden spot
          </Text>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.authButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pickImage = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add images');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      if (images.length >= CONFIG.IMAGE.MAX_FILES) {
        Alert.alert('Too many images', `You can only upload up to ${CONFIG.IMAGE.MAX_FILES} images`);
        return;
      }
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addTip = () => {
    if (tips.length < 5) {
      setTips([...tips, '']);
    }
  };

  const removeTip = (index: number) => {
    if (tips.length > 1) {
      setTips(tips.filter((_, i) => i !== index));
    }
  };

  const updateTip = (index: number, value: string) => {
    const newTips = [...tips];
    newTips[index] = value;
    setTips(newTips);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a spot name');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!story.trim()) {
      Alert.alert('Error', 'Please share the story behind this spot');
      return false;
    }
    if (!street.trim() || !city.trim() || !state.trim()) {
      Alert.alert('Error', 'Please provide the complete address');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Upload images to Cloudinary first
      const uploadedImages = [];
      for (const imageUri of images) {
        try {
          // Create form data for Cloudinary upload
          const cloudinaryFormData = new FormData();
          cloudinaryFormData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'image.jpg',
          } as any);
          cloudinaryFormData.append('upload_preset', 'rnative'); // Replace with your upload preset
          cloudinaryFormData.append('cloud_name', 'drxliiejo'); // Replace with your cloud name

          const response = await fetch('https://api.cloudinary.com/v1_1/drxliiejo/image/upload', {
            method: 'POST',
            body: cloudinaryFormData,
          });

          const result = await response.json();
          if (result.secure_url) {
            uploadedImages.push({
              url: result.secure_url,
              publicId: result.public_id,
              caption: ''
            });
          }
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          Alert.alert('Error', 'Failed to upload one or more images. Please try again.');
          return;
        }
      }

      // Create JSON request body
      const requestBody = {
        name: name.trim(),
        description: description.trim(),
        category: category,
        coordinates: {
          longitude: 78.1642,
          latitude: 26.2183
        },
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim()
        },
        story: story.trim(),
        tips: tips.filter(tip => tip.trim()),
        tags: [],
        bestTimeToVisit: {
          timeOfDay: timeOfDay,
          season: season
        },
        accessibility: {
          wheelchairAccessible: wheelchairAccessible,
          parkingAvailable: parkingAvailable,
          publicTransport: publicTransport
        },
        images: uploadedImages
      };

      // Debug: Log request body
      console.log('📤 Sending JSON request:', requestBody);

      await apiService.createSpot(requestBody);
      
      Alert.alert(
        'Success!',
        'Your hidden spot has been created and is pending approval.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating spot:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error details:', error.response?.data?.details);
      const errorMessage = error.response?.data?.message || 'Failed to create spot. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Share a Hidden Spot</Text>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Add photos of your hidden spot (up to {CONFIG.IMAGE.MAX_FILES})
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
            {images.map((imageUri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity
                  style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < CONFIG.IMAGE.MAX_FILES && (
              <TouchableOpacity
                style={[styles.addImageButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={pickImage}
              >
                <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.addImageText, { color: colors.textSecondary }]}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Spot Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Give your spot a memorable name"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
            <View style={styles.categoryButtons}>
              {CONFIG.CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: category === cat.id ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={category === cat.id ? 'white' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: category === cat.id ? 'white' : colors.text },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of what makes this spot special"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Story */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>The Story *</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Share the personal story behind discovering this hidden gem
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={story}
            onChangeText={setStory}
            placeholder="Tell us how you discovered this spot and what makes it special..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pro Tips</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Share insider tips for the best experience (optional)
          </Text>
          
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipContainer}>
              <TextInput
                style={[styles.tipInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={tip}
                onChangeText={(value) => updateTip(index, value)}
                placeholder={`Tip ${index + 1}`}
                placeholderTextColor={colors.textTertiary}
              />
              {tips.length > 1 && (
                <TouchableOpacity
                  style={[styles.removeTipButton, { backgroundColor: colors.error }]}
                  onPress={() => removeTip(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          {tips.length < 5 && (
            <TouchableOpacity
              style={[styles.addTipButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={addTip}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={[styles.addTipText, { color: colors.primary }]}>Add Tip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location *</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Street Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={street}
              onChangeText={setStreet}
              placeholder="Street address or landmark"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 2 }]}>
              <Text style={[styles.label, { color: colors.text }]}>City</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
              <Text style={[styles.label, { color: colors.text }]}>State</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Postal Code</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Postal code (optional)"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Best Time to Visit */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Best Time to Visit</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Time of Day</Text>
              <View style={styles.pickerContainer}>
                {['Morning', 'Afternoon', 'Evening', 'Night', 'Any'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.pickerButton,
                      {
                        backgroundColor: timeOfDay === time ? colors.primary : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setTimeOfDay(time)}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        { color: timeOfDay === time ? 'white' : colors.text },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Season</Text>
            <View style={styles.pickerContainer}>
              {['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter', 'Any'].map((seasonOption) => (
                <TouchableOpacity
                  key={seasonOption}
                  style={[
                    styles.pickerButton,
                    {
                      backgroundColor: season === seasonOption ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSeason(seasonOption)}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      { color: season === seasonOption ? 'white' : colors.text },
                    ]}
                  >
                    {seasonOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Accessibility</Text>
          
          <TouchableOpacity
            style={[styles.checkboxContainer, { backgroundColor: colors.surface }]}
            onPress={() => setWheelchairAccessible(!wheelchairAccessible)}
          >
            <Ionicons
              name={wheelchairAccessible ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={wheelchairAccessible ? colors.success : colors.textSecondary}
            />
            <Text style={[styles.checkboxText, { color: colors.text }]}>
              Wheelchair Accessible
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkboxContainer, { backgroundColor: colors.surface }]}
            onPress={() => setParkingAvailable(!parkingAvailable)}
          >
            <Ionicons
              name={parkingAvailable ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={parkingAvailable ? colors.success : colors.textSecondary}
            />
            <Text style={[styles.checkboxText, { color: colors.text }]}>
              Parking Available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkboxContainer, { backgroundColor: colors.surface }]}
            onPress={() => setPublicTransport(!publicTransport)}
          >
            <Ionicons
              name={publicTransport ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={publicTransport ? colors.success : colors.textSecondary}
            />
            <Text style={[styles.checkboxText, { color: colors.text }]}>
              Public Transport Available
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isLoading ? colors.textTertiary : colors.primary,
            },
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.submitButtonText}>Create Hidden Spot</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  authMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
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
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  removeTipButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addTipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  addTipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pickerButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 