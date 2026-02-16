import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const { width, height } = Dimensions.get('window');

const MapPickerScreen = ({ navigation, route }) => {
  const { stopId, allStops = [] } = route.params || {};
  const [marker, setMarker] = useState(route.params?.initialCoords || { latitude: 12.9716, longitude: 77.5946 });
  const [address, setAddress] = useState('Fetching address…');
  const mapRef = useRef(null);

  // other stops markers (exclude current)
  const otherStops = allStops.filter(s => s.id !== stopId && s.address && s.latitude && s.longitude);

  // Auto-zoom to marker location with proper zoom level
  useEffect(() => {
    if (mapRef.current && marker) {
      // Immediate zoom without delay for initial mount
      mapRef.current.animateToRegion({
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.0005, // Super focused zoom - street level detail
        longitudeDelta: 0.0005,
      }, 100); // Very fast animation for immediate effect
    }
  }, [marker.latitude, marker.longitude]); // React to marker position changes

  // reverse‑geocode whenever marker moves
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [addr] = await Location.reverseGeocodeAsync(marker);
        if (mounted) setAddress(addr ? `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}` : `${marker.latitude}, ${marker.longitude}`);
      } catch {
        if (mounted) setAddress(`${marker.latitude}, ${marker.longitude}`);
      }
    })();
    return () => { mounted = false; };
  }, [marker]);

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Select Drop Location" />
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ ...marker, latitudeDelta: 0.0005, longitudeDelta: 0.0005 }}
          onPress={e => setMarker(e.nativeEvent.coordinate)}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {otherStops.map(s => (
            <Marker key={s.id} coordinate={{ latitude: s.latitude, longitude: s.longitude }} pinColor="#EC4D4A" title={s.idx === -1 ? 'Final Drop' : `Stop ${s.idx + 1}`}>
              <View style={styles.otherMarkerCircle}><Text style={styles.otherMarkerText}>{s.idx === -1 ? 'F' : s.idx + 1}</Text></View>
            </Marker>
          ))}
          <Marker coordinate={marker}><Image source={require('../assets/icons/dropLocationAnimation.gif')} style={styles.markerIcon} /></Marker>
        </MapView>
      </View>

      {/* address box & confirm */}
      <View style={styles.addressBox}>
        <Ionicons name="location-sharp" size={22} color="#EC4D4A" style={{ marginRight: 8 }} />
        <Text style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">{address}</Text>
      </View>
      <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85} onPress={() => {
        navigation.navigate({ name: route.params.returnScreen, params: { selectedLocation: marker, selectedAddress: address, stopId }, merge: true });
      }}>
        <Text style={styles.confirmText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  mapWrapper: {
    margin: 0,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#EC4D4A22',
    elevation: 2,
    backgroundColor: '#fff',
    // height: height * 0.68,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerIcon: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  addressBox: {
    position: 'absolute',
    left: width * 0.08,
    right: width * 0.08,
    bottom: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1.5,
    borderColor: '#EC4D4A33',
  },
  addressText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'left',
    flex: 1,
  },
  confirmBtn: {
    position: 'absolute',
    bottom: 40,
    left: width * 0.13,
    right: width * 0.13,
    backgroundColor: '#EC4D4A',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#EC4D4A',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.5 },
  otherMarkerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EC4D4A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  otherMarkerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MapPickerScreen; 