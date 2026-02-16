import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import { API_URL } from '../utils/api';

const CUSTOMER_ISSUE_TYPES = [
  'Delayed Delivery',
  'Payment Issue',
  'Damaged Parcel',
  'Wrong Delivery Address',
  'Missing Items',
  'Driver Behavior',
  'App Technical Issue',
  'Cancellation Refund',
  'Other'
];

const RaiseTicketScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get booking details if passed (for booking-specific tickets)
  const bookingData = route.params?.bookingData;
  const bookingId = route.params?.bookingId;
  
  const [loading, setLoading] = useState(false);
  const [showIssueTypes, setShowIssueTypes] = useState(false);
  
  const [formData, setFormData] = useState({
    issueType: '',
    subject: '',
    description: ''
  });
  
  const [images, setImages] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const loadUserData = async () => {
    try {
      let userId = null;
      let name = 'Customer';
      let phone = '';
      let email = '';
      
      // Try to get data from userData object first (primary source)
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userId = userData._id || userData.customerId;
          name = userData.name || userData.userName || 'Customer';
          email = userData.email || '';
        } catch (e) {
          console.log('Error parsing userData:', e);
        }
      }
      
      // Fallback to userId if not found in userData
      if (!userId) {
        userId = await AsyncStorage.getItem('userId');
      }
      
      // Get phone from userPhone (standardized key)
      phone = await AsyncStorage.getItem('userPhone') || '';

      console.log('User data loaded:', { userId, name, phone, email });
      setUserData({ userId, name, phone, email });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      }
    }
  };

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit reached', 'You can upload maximum 3 images');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0]]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const validateForm = () => {
    if (!formData.issueType) {
      Alert.alert('Required', 'Please select an issue type');
      return false;
    }
    if (!formData.subject.trim()) {
      Alert.alert('Required', 'Please enter a subject');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Required', 'Please describe your issue');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!userData?.userId) {
      Alert.alert('Error', 'User information not found. Please login again.');
      return;
    }

    if (!userData?.phone) {
      Alert.alert('Error', 'Phone number is required. Please update your profile.');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('userType', 'customer');
      formDataToSend.append('userId', userData.userId);
      formDataToSend.append('userName', userData.name || 'Customer');
      formDataToSend.append('userPhone', userData.phone);
      if (userData.email) formDataToSend.append('userEmail', userData.email);
      
      formDataToSend.append('issueType', formData.issueType);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('description', formData.description);
      
      // Add booking info if available
      if (bookingId) {
        formDataToSend.append('bookingId', bookingId);
        formDataToSend.append('issueCategory', 'booking-specific');
      }

      // Add images
      images.forEach((image, index) => {
        const imageUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
        const imageFile = {
          uri: imageUri,
          type: 'image/jpeg',
          name: `ticket_image_${index}.jpg`
        };
        formDataToSend.append('attachments', imageFile);
      });

      console.log('Submitting ticket...');
      
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Navigate directly to MyTickets screen
        navigation.replace('MyTickets');
      } else {
        throw new Error(result.message || 'Failed to create ticket');
      }

    } catch (error) {
      console.error('Error submitting ticket:', error);
      Alert.alert('Error', error.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Raise a Ticket" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Info Banner (if available) */}
        {bookingData && (
          <View style={styles.bookingBanner}>
            <Ionicons name="document-text" size={20} color="#EC4D4A" />
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle}>Booking-Specific Issue</Text>
              <Text style={styles.bookingId}>Order #{bookingData.bookingId || bookingData._id?.slice(-6)}</Text>
            </View>
          </View>
        )}

        {/* Issue Type Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Issue Type *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowIssueTypes(!showIssueTypes)}
          >
            <Text style={[styles.dropdownText, !formData.issueType && styles.placeholder]}>
              {formData.issueType || 'Select issue type'}
            </Text>
            <Ionicons 
              name={showIssueTypes ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>

          {showIssueTypes && (
            <View style={styles.dropdownList}>
              {CUSTOMER_ISSUE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, issueType: type });
                    setShowIssueTypes(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                  {formData.issueType === type && (
                    <Ionicons name="checkmark" size={20} color="#EC4D4A" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief summary of your issue"
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
            maxLength={100}
          />
          <Text style={styles.charCount}>{formData.subject.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please describe your issue in detail..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{formData.description.length}/500</Text>
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Attachments (Optional)</Text>
          <Text style={styles.hint}>Upload up to 3 images</Text>
          
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#EC4D4A" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Ionicons name="camera" size={32} color="#999" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Ticket</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#0066FF" />
          <Text style={styles.infoText}>
            Our support team typically responds within 24 hours. You'll receive updates via SMS and in-app notifications.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bookingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4D4A',
  },
  bookingInfo: {
    marginLeft: 12,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bookingId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: -4,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  addImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#EC4D4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 8,
    lineHeight: 18,
  },
});

export default RaiseTicketScreen;
