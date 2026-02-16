import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const DeliveryPhotosScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingData, bookingId } = route.params || {};

  const [pickupImages, setPickupImages] = useState([]);
  const [dropImages, setDropImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  // Get booking ID from props or bookingData
  const finalBookingId = bookingId || bookingData?._id || bookingData?.bookingId;

  // Fetch images when component loads
  useEffect(() => {
    if (finalBookingId) {
      fetchBookingImages();
    } else {
      setLoading(false);
      Alert.alert('Error', 'No booking information found');
    }
  }, [finalBookingId]);

  const fetchBookingImages = async () => {
    try {
      console.log('📸 Fetching delivery photos for booking:', finalBookingId);
      
      const response = await fetch(
        `${API_URL}/images/${finalBookingId}`
      );
      
      const data = await response.json();
      console.log('📸 Images response:', data);

      if (data.success) {
        setPickupImages(data.pickupImages || []);
        setDropImages(data.dropImages || []);
        console.log(`✅ Loaded ${data.counts?.pickup || 0} pickup images, ${data.counts?.drop || 0} drop images`);
      } else {
        Alert.alert('Error', 'Failed to load images');
      }
    } catch (error) {
      console.error('❌ Error fetching images:', error);
      Alert.alert('Error', 'Failed to load images. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookingImages();
  };

  const openImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
  };

  const renderImageGrid = (images, title, emptyMessage, iconName) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name={iconName} size={24} color="#EC4D4A" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.imageCount}>
          <Text style={styles.imageCountText}>{images.length}</Text>
        </View>
      </View>
      
      {images.length > 0 ? (
        <View style={styles.imageGrid}>
          {images.map((imageUrl, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imageItem}
              onPress={() => openImageViewer(imageUrl)}
            >
              <Image source={{ uri: imageUrl }} style={styles.gridImage} />
              <View style={styles.imageOverlay}>
                <Ionicons name="expand" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );

  const renderImageViewer = () => (
    <Modal
      visible={imageViewerVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setImageViewerVisible(false)}
    >
      <View style={styles.imageViewerContainer}>
        <TouchableOpacity
          style={styles.imageViewerBackground}
          onPress={() => setImageViewerVisible(false)}
        />
        
        <SafeAreaView style={styles.imageViewerContent}>
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageViewerVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Photos</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4D4A" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalImages = pickupImages.length + dropImages.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#EC4D4A', '#FF6B6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Photos</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="camera" size={24} color="#EC4D4A" />
            <Text style={styles.summaryTitle}>Photo Summary</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{pickupImages.length}</Text>
              <Text style={styles.summaryLabel}>Pickup Photos</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{dropImages.length}</Text>
              <Text style={styles.summaryLabel}>Drop Photos</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{totalImages}</Text>
              <Text style={styles.summaryLabel}>Total Photos</Text>
            </View>
          </View>
        </View>

        {/* Pickup Images Section */}
        {renderImageGrid(
          pickupImages,
          "Pickup Photos",
          "No pickup photos available yet.\nPhotos will appear here when the rider collects your package.",
          "cube-outline"
        )}

        {/* Drop Images Section */}
        {renderImageGrid(
          dropImages,
          "Delivery Photos", 
          "No delivery photos available yet.\nPhotos will appear here when your package is delivered.",
          "checkmark-circle-outline"
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#EC4D4A" />
            <Text style={styles.infoTitle}>About Delivery Photos</Text>
          </View>
          <View style={styles.infoContent}>
            <View style={styles.infoItem}>
              <Ionicons name="cube" size={16} color="#666" />
              <Text style={styles.infoText}>
                Pickup photos are taken when your package is collected from the sender
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#666" />
              <Text style={styles.infoText}>
                Delivery photos are taken as proof when your package is delivered
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={16} color="#666" />
              <Text style={styles.infoText}>
                All photos are securely stored and automatically optimized
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="refresh" size={16} color="#666" />
              <Text style={styles.infoText}>
                Pull down to refresh and see the latest photos
              </Text>
            </View>
          </View>
        </View>

        {/* Empty State for No Photos */}
        {totalImages === 0 && (
          <View style={styles.noPhotosCard}>
            <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
            <Text style={styles.noPhotosTitle}>No Photos Yet</Text>
            <Text style={styles.noPhotosMessage}>
              Photos will automatically appear here as your delivery progresses.
              The rider will take photos during pickup and delivery.
            </Text>
          </View>
        )}
      </ScrollView>

      {renderImageViewer()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  refreshButton: {
    padding: 8,
  },
  headerRight: {
    width: 40, // Balance the header
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EC4D4A',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  imageCount: {
    backgroundColor: '#EC4D4A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  imageItem: {
    width: (width - 64) / 3, // 3 columns with margins
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  imageOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  infoContent: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  noPhotosCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noPhotosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
  },
  noPhotosMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  // Image Viewer Modal
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imageViewerBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  imageViewerContent: {
    flex: 1,
  },
  imageViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  fullScreenImage: {
    flex: 1,
    width: '100%',
  },
});

export default DeliveryPhotosScreen;