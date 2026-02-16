// screens/TruckServiceScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const services = [
  {
    title: 'Local',
    iconName: 'car', // Using Ionicons instead of PNG
  },
  // {
  //   title: 'Outstation',
  //   iconName: 'car',
  // },
  // {
  //   title: 'Hourly Packages',
  //   iconName: 'car',
  // },
];

const TruckServiceScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBackButton title="Choose your service" />
      <ScrollView style={styles.container}>
        {services.map((service, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
         onPress={() => navigation.navigate('LocationSelectorScreen', { vehicleType: 'Truck' })}
        >
          <View style={styles.cardContent}>
            <Ionicons name={service.iconName} size={40} color="#EC4D4A" style={styles.icon} />
            <Text style={styles.title}>{service.title}</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#f1f8fb',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },
});

export default TruckServiceScreen;
