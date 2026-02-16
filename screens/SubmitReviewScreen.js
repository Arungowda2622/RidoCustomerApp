import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import KeyboardAwareWrapper from '../components/KeyboardAwareWrapper';

const SubmitReviewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoadingReview, setIsLoadingReview] = useState(true);
  const [fullBookingData, setFullBookingData] = useState(null);
  
  // Get booking data from route params
  const bookingData = route.params?.bookingData || route.params?.booking || {};
  const bookingId = route.params?.bookingId || bookingData._id;
  
  // Get rider info from either full booking data or initial booking data
  const riderInfo = fullBookingData?.rider || bookingData.rider;
  
  // Try multiple possible field names for rider name
  const riderName = riderInfo?.name || 
                    riderInfo?.firstName || 
                    riderInfo?.fullName ||
                    (riderInfo?.firstName && riderInfo?.lastName ? `${riderInfo.firstName} ${riderInfo.lastName}` : null) ||
                    bookingData.riderName || 
                    'Rider';
                    
  // Rider model has images.profilePhoto structure
  const riderImage = riderInfo?.images?.profilePhoto || 
                     riderInfo?.profileImage || 
                     riderInfo?.image || 
                     riderInfo?.photo;
  const vehicleNumber = riderInfo?.vehicleNumber || bookingData.vehicleNumber;

  useEffect(() => {
    console.log("✅ SubmitReviewScreen mounted successfully");
    console.log("📋 Route params:", route.params);
    console.log("📋 Initial booking data:", bookingData);
    console.log("👤 Initial rider info:", bookingData.rider);
    fetchBookingDetails();
    fetchExistingReview();
  }, []);

  // Log when fullBookingData changes
  useEffect(() => {
    if (fullBookingData) {
      console.log("📦 Full booking data updated");
      console.log("👤 Rider from fullBookingData:", fullBookingData.rider);
      console.log("👤 Computed riderName:", riderName);
      console.log("👤 Computed riderInfo:", riderInfo);
      console.log("🖼️ Computed riderImage:", riderImage);
      console.log("🖼️ Rider images object:", riderInfo?.images);
    }
  }, [fullBookingData]);

  const fetchBookingDetails = async () => {
    try {
      console.log('🔍 Fetching full booking details for:', bookingId);
      
      const response = await axios.get(`${API_URL}/booking-with-rider/${bookingId}`, {
        timeout: 10000
      });

      console.log('📦 Booking API Response:', response.data);

      // Backend returns { booking, riderDetails } - not { success: true, booking }
      if (response.data && response.data.booking) {
        const booking = response.data.booking;
        const rider = response.data.riderDetails;
        
        console.log('✅ Full booking data fetched');
        console.log('👤 Rider details from API:', rider);
        
        // Merge rider details into booking
        const bookingWithRider = {
          ...booking,
          rider: rider || booking.rider
        };
        
        setFullBookingData(bookingWithRider);
        console.log('👤 Updated booking with rider:', bookingWithRider.rider);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch full booking details:', error.message);
      console.log('⚠️ Error details:', error.response?.data);
      // Continue with existing booking data
    }
  };

  const fetchExistingReview = async () => {
    if (!bookingId) {
      console.log('⚠️ No booking ID provided');
      setIsLoadingReview(false);
      return;
    }

    try {
      setIsLoadingReview(true);
      
      console.log('🔍 Fetching existing review for booking:', bookingId);
      console.log('🔍 Full booking data:', bookingData);
      
      const response = await axios.get(`${API_URL}/review/${bookingId}/both`, {
        timeout: 10000
      });

      console.log('📦 Review API Response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success) {
        // Backend returns reviews object with customerReview and riderReview
        const customerReview = response.data.reviews?.customerReview || response.data.customerReview;
        
        console.log('🔍 Customer review extracted:', customerReview);
        
        if (customerReview && customerReview.rating) {
          console.log('✅ Existing customer review found with rating:', customerReview.rating);
          setExistingReview(customerReview);
          
          // Pre-fill rating and feedback if review exists
          setRating(customerReview.rating);
          if (customerReview.feedback) {
            setFeedback(customerReview.feedback);
          }
          console.log('✅ Review state updated - Rating:', customerReview.rating, 'Feedback:', customerReview.feedback);
        } else {
          console.log('📭 No customer review with rating found in response');
          console.log('📭 customerReview object:', customerReview);
          setExistingReview(null);
        }
      } else {
        console.log('❌ API response not successful:', response.data);
        setExistingReview(null);
      }
    } catch (error) {
      console.error('❌ Error fetching review:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setExistingReview(null);
    } finally {
      setIsLoadingReview(false);
      console.log('🏁 Review fetch complete. existingReview:', existingReview);
    }
  };

  const handleSubmitReview = async () => {
    // Check if review already exists
    if (existingReview) {
      Alert.alert('Already Reviewed', 'You have already submitted a review for this booking.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting review:', {
        bookingId,
        rating,
        feedback
      });

      // Get customer ID from AsyncStorage - check userData first, then fallback to userId
      let customerId = null;
      
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          customerId = userData._id || userData.customerId;
        }
      } catch (e) {
        console.warn('Failed to parse userData:', e);
      }
      
      // Fallback to userId if userData parsing failed
      if (!customerId) {
        customerId = await AsyncStorage.getItem('userId');
      }
      
      if (!customerId) {
        Alert.alert('Error', 'Unable to identify customer. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // Submit customer review to backend
      const reviewData = {
        rating: rating,
        feedback: feedback,
        customerId: customerId
      };
      
      console.log('📤 Submitting review to API:', `${API_URL}/review/${bookingId}/customer`);
      console.log('📋 Review data:', reviewData);
      
      const response = await axios.post(`${API_URL}/review/${bookingId}/customer`, reviewData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('✅ Review submitted successfully:', response.data);

      // Navigate directly to Home without showing alert
      navigation.navigate('MainTabs', { screen: 'Home' });
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      
      let errorMessage = 'Failed to submit review. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        console.error('Server error:', error.response.data);
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Network error. Please check your connection.';
        console.error('Network error:', error.request);
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBackButton 
        title={existingReview ? "Your Review" : "Submit Review"}
        backgroundColor="#EC4D4A"
        backButtonColor="#fff"
        titleStyle={{ color: '#fff' }}
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Thanks Message */}
        <View style={styles.thankCard}>
          <Text style={styles.thankTitle}>
            {existingReview ? 'Your Review' : 'Thanks for ordering!'}
          </Text>
          <Text style={styles.thankSubtitle}>
            {existingReview ? 'Here\'s the review you submitted' : 'Order delivered just as you wished.'}
          </Text>
        </View>

        {/* Rider Details Card */}
        <View style={styles.riderCard}>
          <View style={styles.riderInfo}>
            {riderImage ? (
              <Image 
                source={{ uri: riderImage }} 
                style={styles.riderAvatarImage}
              />
            ) : (
              <View style={styles.riderAvatar}>
                <Ionicons name="person" size={24} color="#EC4D4A" />
              </View>
            )}
            <View style={styles.riderDetails}>
              <Text style={styles.riderName}>{riderName}</Text>
              <Text style={styles.vehicleInfo}>
                {(fullBookingData?.vehicleType || bookingData.vehicleType || '2W')} • {vehicleNumber || 'N/A'}
              </Text>
            </View>
            {!existingReview && riderInfo?.phoneNumber && (
              <TouchableOpacity 
                style={styles.callButton}
                onPress={() => {
                  const phoneNumber = `tel:${riderInfo.phoneNumber}`;
                  Linking.openURL(phoneNumber);
                }}
              >
                <Ionicons name="call" size={20} color="#EC4D4A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delivery Photos Card */}
        <View style={styles.deliveryPhotosCard}>
          <View style={styles.deliveryPhotosHeader}>
            <Ionicons name="camera" size={24} color="#EC4D4A" />
            <Text style={styles.deliveryPhotosTitle}>View Delivery Photos</Text>
          </View>
          <Text style={styles.deliveryPhotosSubtitle}>
            See how your package was handled during pickup and delivery
          </Text>
          <TouchableOpacity 
            style={styles.viewPhotosButton}
            onPress={() => navigation.navigate('DeliveryPhotos', { 
              bookingData: bookingData,
              bookingId: bookingId 
            })}
          >
            <Ionicons name="images" size={20} color="#EC4D4A" />
            <Text style={styles.viewPhotosButtonText}>View Photos</Text>
            <Ionicons name="chevron-forward" size={16} color="#EC4D4A" />
          </TouchableOpacity>
        </View>

        {/* Star Rating */}
        <Text style={styles.rateText}>
          {existingReview ? 'Your Rating' : `Rate your delivery by ${riderName}`}
        </Text>
        
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={star} 
              onPress={() => !existingReview && setRating(star)}
              disabled={existingReview !== null}
            >
              <Ionicons
                name="star"
                size={32}
                color={star <= rating ? '#FACC15' : '#ccc'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Review Date if exists */}
        {existingReview && existingReview.reviewedAt && (
          <Text style={styles.reviewDate}>
            Reviewed on {new Date(existingReview.reviewedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </Text>
        )}

        {/* Feedback Input */}
        <Text style={styles.feedbackLabel}>
          {existingReview ? 'Your Feedback' : 'Share your feedback'}
        </Text>
        <TextInput
          style={[styles.textInput, existingReview && styles.textInputDisabled]}
          placeholder="Tell us what you liked..."
          placeholderTextColor="#999"
          multiline
          value={feedback}
          onChangeText={setFeedback}
          editable={!existingReview}
        />

        {/* Review Images if exist */}
        {existingReview && existingReview.images && existingReview.images.length > 0 && (
          <View style={styles.reviewImagesContainer}>
            <Text style={styles.reviewImagesLabel}>Review Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.reviewImagesRow}>
                {existingReview.images.map((imageUrl, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => {
                      // Navigate to full screen image viewer
                      navigation.navigate('ImageGallery', { 
                        images: existingReview.images,
                        initialIndex: index 
                      });
                    }}
                  >
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.reviewImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Submit Button - only show if no existing review */}
        {!existingReview && (
          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
            onPress={handleSubmitReview}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Edit Review Button if review exists */}
        {existingReview && (
          <View style={styles.reviewActionsContainer}>
            <TouchableOpacity 
              style={styles.editReviewBtn}
              onPress={() => {
                Alert.alert(
                  'Edit Review',
                  'Do you want to edit your review?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Edit', 
                      onPress: () => {
                        setExistingReview(null);
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="create-outline" size={20} color="#EC4D4A" />
              <Text style={styles.editReviewBtnText}>Edit Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SubmitReviewScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  header: {
    backgroundColor: '#EC4D4A',
    paddingTop: 16, // Reduced from 50 since HeaderWithBackButton handles top spacing
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
   
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  thankCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 14,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thankTitle: {
    fontWeight: '700',
    color: '#D32F2F',
    fontSize: 16,
     textAlign:'center'
  },
  thankSubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign:'center'
  },
  riderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  riderAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryPhotosCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deliveryPhotosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryPhotosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  deliveryPhotosSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  viewPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EC4D4A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  viewPhotosButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4D4A',
    marginHorizontal: 8,
  },
  rateText: {
   

     marginTop: '5%',
  marginHorizontal: '5%',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
  },
  starsRow: {
     flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 8,
  gap: 4,
    
  },
  feedbackLabel: {
    marginHorizontal: 16,
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    margin: 16,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#000',
 borderColor: '#ccc',
     borderWidth: 1,

  },
  submitBtn: {
    backgroundColor: '#EC4D4A',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
  },
  textInputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  reviewDate: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  reviewImagesContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  reviewImagesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  reviewImagesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  reviewActionsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 30,
  },
  editReviewBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EC4D4A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  editReviewBtnText: {
    color: '#EC4D4A',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
