

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ReviewBookingScreen() {

   const navigation = useNavigation();

  const handleChooseGoodsPress = () => {
    navigation.navigate('GoodsTypeScreen'); // replace with your actual screen name
  };
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Booking</Text>
      </View>

      {/* Vehicle Card */}
      <View style={styles.card}>
        <View style={styles.vehicleContainer}>
          <Image 
            source={{ uri: 'https://thumbs.dreamstime.com/b/tata-ace-ht-colombo-sri-lanka-september-blue-minitruck-city-street-341442401.jpg' }}
            style={styles.vehicleImage}
          />
          <View style={styles.vehicleDetails}>
            <Text style={styles.vehicle}>Tata Ace</Text>
            <TouchableOpacity>
              <Text style={styles.viewAddress}>View Address Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.etaContainer}>
            <Text style={styles.eta}>14 mins</Text>
            <Text style={styles.etaLabel}>away</Text>
          </View>
        </View>
        <View style={styles.loadingInfo}>
          <Ionicons name="time-outline" size={16} color="#0f9d58" />
          <Text style={styles.infoText}>Free 60 mins of loading-unloading time included.</Text>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
        </View>
      </View>

      {/* Add-On Service */}
      <Text style={styles.sectionTitle}>Add-On Services</Text>
      <View style={styles.card}>
        <Text style={styles.introducing}>INTRODUCING</Text>
        <View style={styles.serviceContent}>
          <Image 
            source={{ uri: 'https://thumbs.dreamstime.com/b/tata-ace-ht-colombo-sri-lanka-september-blue-minitruck-city-street-341442401.jpg' }}
            style={styles.serviceImage}
          />
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceTitle}>Loading-unloading service</Text>
            <Text style={styles.serviceDescription}>Add extra help for door-to-door loading and unloading</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={18} color="#007bff" />
          <Text style={styles.addButtonText}>Add service</Text>
        </TouchableOpacity>
        <View style={styles.pickupInfo}>
          <Text style={styles.pickupText}>Earliest pickup in <Text style={styles.pickupTime}>30 min</Text></Text>
        </View>
      </View>

      {/* Offers and Discounts */}
      <Text style={styles.sectionTitle}>Offers and Discounts</Text>
      <TouchableOpacity style={styles.offerCard}>
        <View style={styles.couponLeft}>
          <Ionicons name="pricetag" size={24} color="#2E7D32" />
          <Text style={styles.offerText}>Apply Coupon</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="gray" />
      </TouchableOpacity>

      {/* <View style={styles.coinCard}>
        <View style={styles.coinsInfo}>
          <Ionicons name="logo-bitcoin" size={24} color="#FFB300" />
          <Text style={styles.coinLine}>Minimum 25 coins required</Text>
        </View>
        <TouchableOpacity style={styles.useCoinsButton}>
          <Text style={styles.useCoinsText}>Use Coins</Text>
        </TouchableOpacity>
        <View style={styles.rewardBanner}>
          <Text style={styles.rewardText}>You'll get <Text style={styles.coinsAmount}>12 coins</Text> on this order ✨</Text>
        </View>
      </View> */}

      {/* Fare Summary */}
      <Text style={styles.sectionTitle}>Fare Summary</Text>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text>Trip Fare (incl. Toll)</Text>
          <Text>₹625.07</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text>Net Fare</Text>
          <Text>₹625</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text>Porter Credits Applied</Text>
          <Text style={{ color: 'green' }}>-₹1</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={{ fontWeight: 'bold' }}>Amount Payable (rounded)</Text>
          <Text style={{ fontWeight: 'bold' }}>₹624</Text>
        </View>
      </View>

      {/* Read Before Booking */}
      <Text style={styles.sectionTitle}>Read before Booking</Text>
      <View style={styles.card}>
        {[
          "Fare includes 60 mins free loading/unloading time.",
          "₹ 3.5/min for additional loading/unloading time.",
          "Fare may change if route or location changes.",
          "Parking charges to be paid by customer.",
          "Fare includes toll and permit charges, if any.",
          "We don't allow overloading.",
        ].map((item, index) => (
          <Text key={index} style={styles.bullet}>• {item}</Text>
        ))}
      </View>

      {/* Footer Button */}
      
        <TouchableOpacity style={styles.footerButton} onPress={handleChooseGoodsPress}>
        <Text style={styles.footerButtonText}>Choose Goods Type</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 16 , marginTop: 16},
  header: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16 },
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 10,
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  vehicleDetails: {
    flex: 1,
    marginLeft: 12,
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 12,
    color: '#666',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rowBetween: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  vehicle: { fontWeight: 'bold', fontSize: 16 },
  eta: { color: '#0f9d58', fontWeight: 'bold', fontSize: 16 },
  viewAddress: { color: '#007bff', marginVertical: 4, fontSize: 14 },
  loadingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: { color: '#555', marginLeft: 6, fontSize: 12, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  introducing: { color: '#666', fontSize: 12, fontWeight: '500', marginBottom: 8 },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  serviceDetails: {
    flex: 1,
    marginLeft: 16,
  },
  serviceTitle: { fontSize: 16, fontWeight: 'bold' },
  serviceDescription: { color: '#666', fontSize: 14, marginTop: 4 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 16,
    marginTop: 8,
  },
  addButtonText: { color: '#007bff', marginLeft: 6, fontWeight: '600' },
  pickupInfo: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  pickupText: { color: '#2E7D32', fontSize: 14, textAlign: 'center' },
  pickupTime: { fontWeight: '600' },
  offerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerText: { fontSize: 15, marginLeft: 12 },
  coinCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  coinsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coinLine: { color: '#666', marginLeft: 12, fontSize: 16 },
  useCoinsButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  useCoinsText: { color: '#666', fontWeight: '500' },
  rewardBanner: {
    backgroundColor: '#673AB7',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  rewardText: { color: 'white', fontSize: 16, textAlign: 'center' },
  coinsAmount: { fontWeight: '600' },
  bullet: { fontSize: 13, marginBottom: 4, color: '#555' },
  footerButton: {
    backgroundColor: '#007bff',
    marginTop: 20,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  footerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});