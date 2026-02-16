// screens/CancelReasonScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const reasons = [
  'Driver delayed',
  'Changed my mind',
  'Booked by mistake',
  'Found alternate transport',
  'Too expensive',
  'Other',
];

const CancelReasonScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isCancelling, setIsCancelling] = useState(false);
  const bookingId = route.params?.bookingId;

  const handleReasonSelect = async (reason) => {
    try {
      setIsCancelling(true);
      
      // Get userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId || !bookingId) {
        Alert.alert("Error", "Unable to cancel booking. Missing user or booking information.");
        setIsCancelling(false);
        return;
      }
      
      console.log('Cancelling booking with reason:', { bookingId, userId, reason });
      
      // Call backend API to cancel booking
      const response = await fetch(`${API_URL}/bookings/cancel-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          userId: userId,
          reason: reason
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log("✅ Booking cancelled successfully:", data);
        
        // Show success message
        Alert.alert(
          "Booking Cancelled",
          "Your booking has been cancelled successfully.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("MainTabs", { screen: "Home" })
            }
          ]
        );
      } else {
        console.error("❌ Failed to cancel booking:", data);
        Alert.alert(
          "Cancellation Failed",
          data.message || "Unable to cancel booking. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Error cancelling booking:", error);
      Alert.alert(
        "Error",
        "An error occurred while cancelling your booking. Please check your connection and try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBackButton title="Why are you cancelling?" />
      <ScrollView contentContainerStyle={styles.container}>
        {isCancelling ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EC4D4A" />
            <Text style={styles.loadingText}>Cancelling booking...</Text>
          </View>
        ) : (
          reasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reasonButton}
              onPress={() => handleReasonSelect(reason)}
              disabled={isCancelling}
            >
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default CancelReasonScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  reasonButton: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
