import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { API_URL } from '../utils/api';

const BookingConfirmScreen = () => {
  // Function to handle share trip
  const handleShareTrip = async () => {
    try {
      // This should come from props/navigation params
      // For demo purposes, using placeholder data
      const bookingId = 'CRN45320096170W'; // route.params?.bookingId
      const userId = 'user123'; // Get from AsyncStorage or context
      
      // Show loading
      Alert.alert('Generating Share Link...', 'Please wait while we create your shareable link.');
      
      // Call backend API to generate share token
      const response = await fetch(`${API_URL}/trip-sharing/generate-share-token/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}` // Implement this function
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate share link');
      }

      // Create share message with actual data
      const shareMessage = `🚚 Track my delivery in real-time!\n\nOrder #${bookingId}\nDriver: Lokesh (KA-50-HK-3875)\nFrom: 7th cross Majestic\nTo: 6th cross Hennur\n\n📍 Live Tracking: ${result.shareUrl}\n\nPowered by Ridodrop`;

      // Share the link
      const shareResult = await Share.share({
        message: shareMessage,
        url: result.shareUrl,
        title: 'Track My Trip - Ridodrop'
      });

      if (shareResult.action === Share.sharedAction) {
        console.log('Trip shared successfully');
      }
      
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', error.message || 'Failed to share trip. Please try again.');
    }
  };
  
  // Helper function to get auth token (implement based on your auth system)
  const getAuthToken = async () => {
    // This should get token from AsyncStorage or your auth context
    // For now returning placeholder
    return 'your-auth-token';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View>
          <Text style={styles.phoneText}>+91 9552567681</Text>
          <Text style={styles.timeText}>Yesterday, 4:00 pm</Text>
        </View>
      </View>

      {/* Map */}
      <MapView style={styles.map}>
        {/* Add Markers and Polyline here */}
        <Marker coordinate={{ latitude: 12.9545, longitude: 77.5645 }} />
        <Polyline
          coordinates={[
            { latitude: 12.9545, longitude: 77.5645 },
            { latitude: 12.9611, longitude: 77.6006 },
          ]}
          strokeColor="#EC4D4A"
          strokeWidth={4}
        />
      </MapView>

      {/* Floating Distance */}
      <View style={styles.distanceLabel}>
        <Text style={styles.distanceText}>1.4 km away</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.vehicleRow}>
          <FontAwesome5 name="motorcycle" size={20} color="#EC4D4A" />
          <Text style={styles.vehicleText}>2 Wheeler • Lokesh</Text>
          <Text style={styles.vehicleNumber}>KA-50-HK-3875</Text>
        </View>

        {/* Route Info */}
        <View style={styles.routeInfo}>
          <Text style={styles.label}>Rahul Kumar - 9878589654</Text>
          <Text style={styles.location}>7th cross Majestic</Text>
          <Text style={styles.label}>Rahul Kumar - 9878589654</Text>
          <Text style={styles.location}>6th cross Hennur</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity>
            <Text style={styles.addStops}>+ Add Stops</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShareTrip} style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={16} color="#EC4D4A" />
            <Text style={styles.shareText}>Share Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity>
        </View>

        {/* Payment */}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentMethod}>Cash</Text>
          <Text style={styles.amount}>₹150</Text>
        </View>
      </View>
    </View>
  );
};

export default BookingConfirmScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  phoneText: { fontSize: 16, fontWeight: 'bold' },
  timeText: { color: 'gray', fontSize: 12 },
  map: { flex: 1 },
  distanceLabel: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 8,
    elevation: 4,
  },
  distanceText: { fontWeight: 'bold' },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  vehicleText: { fontSize: 14, flex: 1 },
  vehicleNumber: { fontWeight: 'bold' },
  routeInfo: { marginVertical: 10 },
  label: { fontWeight: '600', fontSize: 14 },
  location: { color: '#555' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  addStops: { color: '#EC4D4A', fontWeight: 'bold' },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF5F5',
  },
  shareText: { 
    color: '#EC4D4A', 
    fontWeight: 'bold',
    fontSize: 13,
  },
  viewDetails: { color: '#EC4D4A', fontWeight: 'bold' },
  paymentRow: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    fontWeight: 'bold',
    color: '#000',
  },
  amount: {
    fontWeight: 'bold',
    color: '#000',
  },
});
