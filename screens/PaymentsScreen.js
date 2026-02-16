import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const PaymentsScreen = () => {
  const handleInfoPress = () => {
    // Handle info icon press - you can add navigation or modal here
    console.log('Info icon pressed');
  };

  const InfoIcon = () => (
    <TouchableOpacity onPress={handleInfoPress} style={styles.infoButton}>
      <Ionicons name="information-circle-outline" size={24} color="#0066FF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderWithBackButton 
        title="Payment" 
        rightComponent={<InfoIcon />}
      />

      <View style={styles.card}>
        {/* Info Icon in top right corner */}
        <TouchableOpacity 
          style={styles.cardInfoIcon}
          onPress={handleInfoPress}
        >
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color="#0066FF" 
          />
        </TouchableOpacity>
        
        <View>
          <Text style={styles.cardTitle}>Porter credits</Text>
          <Text style={styles.cardSubtitle}>Balance ₹1</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Money</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 0 // Removed extra marginTop since HeaderWithBackButton handles spacing
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'relative',
  },
  cardInfoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: 'gray',
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#f0f4ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#0066FF',
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
  },
});
