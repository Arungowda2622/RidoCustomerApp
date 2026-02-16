import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const orders = [
  {
    id: 1,
    vehicle: 'Tata Ace',
    time: 'Today, 01:03 PM',
    price: '₹0',
    status: 'Cancelled',
    from: {
      name: 'Lokesh godewar',
      phone: '9552567681',
      address: '9th Cross Rd, Sitielid, RK Hegde Nagar, Nagaresw...',
    },
    to: {
      name: 'Lokesh godewar',
      phone: '9552567681',
      address: 'Shivaji Nagar, Bengaluru, Karnataka, India',
    },
  },
  {
    id: 2,
    vehicle: 'Tata Ace',
    time: 'Today, 12:29 PM',
    price: '₹0',
    status: 'Cancelled',
    from: {
      name: 'Lokesh godewar',
      phone: '9552567681',
      address: '9th Cross Rd, Sitielid, RK Hegde Nagar, Nagaresw...',
    },
    to: {
      name: 'Lokesh godewar',
      phone: '9552567681',
      address: 'Shivaji Nagar, Bengaluru, Karnataka, India',
    },
  },
];

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {/* Section Label */}
      <Text style={styles.sectionLabel}>Past</Text>

      {/* Order List */}
      <ScrollView style={styles.scrollView}>
        {orders.map((order) => (
          <View key={order.id} style={styles.card}>
            {/* Vehicle & Time Row */}
            <View style={styles.cardTopRow}>
              <Ionicons
                name="car"
                size={30}
                color="#EC4D4A"
                style={styles.vehicleImage}
              />
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleText}>{order.vehicle}</Text>
                <Text style={styles.timeText}>{order.time}</Text>
              </View>
              <Text style={styles.priceText}>{order.price}</Text>
            </View>

            {/* Address Section */}
            <View style={styles.addressBox}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="green" />
                <View>
                  <Text style={styles.addressName}>{order.from.name} · {order.from.phone}</Text>
                  <Text style={styles.addressText}>{order.from.address}</Text>
                </View>
              </View>
              <View style={styles.separatorLine} />
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="red" />
                <View>
                  <Text style={styles.addressName}>{order.to.name} · {order.to.phone}</Text>
                  <Text style={styles.addressText}>{order.to.address}</Text>
                </View>
              </View>
            </View>

            {/* Status and Action */}
            <View style={styles.footerRow}>
              <View style={styles.cancelledBox}>
                <Ionicons name="close-circle" size={16} color="red" />
                <Text style={styles.cancelledText}>Cancelled</Text>
              </View>
              <TouchableOpacity style={styles.bookAgainBtn}>
                <Text style={styles.bookAgainText}>Book Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

     
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 16,
    color: '#777',
    padding: 16,
    backgroundColor: '#f7f8f9',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderBottomWidth: 10,
    borderColor: '#f5f5f5',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleText: {
    fontWeight: '500',
    fontSize: 16,
  },
  timeText: {
    color: '#666',
    fontSize: 13,
  },
  priceText: {
    fontWeight: '600',
    fontSize: 16,
  },
  addressBox: {
    backgroundColor: '#f2f6f9',
    borderRadius: 8,
    padding: 12,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  addressName: {
    fontWeight: '600',
    fontSize: 14,
  },
  addressText: {
    color: '#666',
    fontSize: 13,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelledText: {
    color: 'red',
    fontWeight: '600',
  },
  bookAgainBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookAgainText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
});
