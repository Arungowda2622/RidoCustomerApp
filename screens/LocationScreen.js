import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import KeyboardAwareWrapper from '../components/KeyboardAwareWrapper';

const LocationScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching location...');
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [formData, setFormData] = useState({
    house: '',
    receiverName: '',
    receiverMobile: '',
    useMyNumber: false,
    selectedTag: null,
  });

  const myMobileNumber = '9552567682';

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const addr = geocode[0];
      const formatted = `${addr.name}, ${addr.street}, ${addr.city}`;
      setAddress(formatted);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to fetch location');
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted:', formData);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Set Location" />

      {/* Map View */}
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} title="You are here" />
        </MapView>
      )}

      {/* Location Selection Card */}
      <View style={styles.card}>
        <View style={styles.locationRow}>
          <View style={styles.dotContainer}>
            <View style={styles.greenDot} />
          </View>
          <TouchableOpacity 
            style={styles.addressBox}
            onPress={() => setShowDetailsForm(true)}
          >
            <Text style={styles.nameText}>Lokesh Godewar • {myMobileNumber}</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {address}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.dotContainer}>
            <View style={styles.redDot} />
          </View>
          <View style={styles.dropInput}>
            <TextInput
              placeholder="Where is your Drop ?"
              style={styles.textInput}
            />
            <Ionicons name="mic-outline" size={22} color="#aaa" />
          </View>
        </View>

        <TouchableOpacity style={styles.addStopButton}>
          <Text style={styles.addStopText}>+ ADD STOP</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton} onPress={getCurrentLocation}>
          <Ionicons name="locate-outline" size={20} color="#0066FF" />
          <Text style={styles.actionText}>Use current location</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="location-on" size={20} color="#0066FF" />
          <Text style={styles.actionText}>Locate on the Map</Text>
        </TouchableOpacity>
      </View>

      {/* Location Details Form Modal */}
      <Modal
        visible={showDetailsForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsForm(false)}
      >
        <View style={styles.modalContainer}>
          <KeyboardAwareWrapper
            enableScrollView={false}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enableOnAndroid={true}
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sheetContainer}>
            {/* Address Row */}
            <View style={styles.addressRow}>
              <Ionicons name="location-sharp" size={20} color="red" />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.boldText}>{address}</Text>
                <Text numberOfLines={1} style={styles.subText}>{address}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailsForm(false)}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <TextInput
              placeholder="House / Apartment / Shop (optional)"
              style={styles.input}
              value={formData.house}
              onChangeText={(text) => handleFormChange('house', text)}
            />
            <TextInput
              placeholder="Receiver's Name"
              style={styles.input}
              value={formData.receiverName}
              onChangeText={(text) => handleFormChange('receiverName', text)}
            />
            <TextInput
              placeholder="Receiver's Mobile number"
              style={styles.input}
              keyboardType="phone-pad"
              value={formData.receiverMobile}
              onChangeText={(text) => handleFormChange('receiverMobile', text)}
            />

            {/* Checkbox */}
            <View style={styles.checkboxContainer}>
              <Checkbox 
                value={formData.useMyNumber} 
                onValueChange={(value) => handleFormChange('useMyNumber', value)}
                color={formData.useMyNumber ? '#0066FF' : undefined}
                style={styles.checkbox}
              />
              <Text style={styles.checkboxText}>Use my mobile number: {myMobileNumber}</Text>
            </View>

            {/* Save As Tags */}
            <View style={styles.saveAsRow}>
              {['Home', 'Shop', 'Other'].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagButton,
                    formData.selectedTag === tag && styles.tagButtonSelected,
                  ]}
                  onPress={() => handleFormChange('selectedTag', tag)}
                >
                  <Text style={[
                    styles.tagText,
                    formData.selectedTag === tag && styles.tagTextSelected,
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.submitButton,
                { backgroundColor: formData.receiverName && (formData.receiverMobile || formData.useMyNumber) ? '#0066FF' : '#ccc' }
              ]}
              onPress={handleSubmit}
              disabled={!formData.receiverName || (!formData.receiverMobile && !formData.useMyNumber)}
            >
              <Text style={styles.submitText}>Save Address</Text>
            </TouchableOpacity>
          </View>
          </KeyboardAwareWrapper>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  map: {
    width: Dimensions.get('window').width,
    height: 200,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dotContainer: {
    width: 24,
    alignItems: 'center',
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  addressBox: {
    backgroundColor: '#fff',
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  nameText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  addressText: {
    color: '#555',
    fontSize: 13,
  },
  dropInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  addStopButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  addStopText: {
    color: '#0066FF',
    fontWeight: 'bold',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#0066FF',
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    height: 24,
    width: 1,
    backgroundColor: '#ccc',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  subText: {
    fontSize: 12,
    color: '#555',
  },
  changeText: {
    color: '#0066FF',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  saveAsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  tagButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  tagButtonSelected: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  tagTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LocationScreen;