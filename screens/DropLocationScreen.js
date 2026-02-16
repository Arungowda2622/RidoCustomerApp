// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// import { Checkbox } from 'react-native-paper';

// const { width, height } = Dimensions.get('window');

// const DropLocationScreen = () => {
//   const [receiverName, setReceiverName] = useState('Lokesh godewar');
//   const [receiverNumber, setReceiverNumber] = useState('9552567681');
//   const [checked, setChecked] = useState(true);

//   return (
//     <View style={styles.container}>
//       {/* Map Section */}
//       <View style={styles.mapContainer}>
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: 12.9847,
//             longitude: 77.6050,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <Marker
//             coordinate={{ latitude: 12.9847, longitude: 77.6050 }}
//             title="Drop Location"
//             description="Your goods will be dropped here"
//           >
//             <View style={styles.marker}>
//               <Text style={styles.markerText}>📍</Text>
//             </View>
//           </Marker>
//         </MapView>
//         <View style={styles.locationPopup}>
//           <Text style={styles.locationPopupText}>Your goods will be dropped here</Text>
//         </View>
//       </View>

//       {/* Bottom Sheet Section */}
//       <ScrollView contentContainerStyle={styles.bottomSheet}>
//         <View style={styles.locationRow}>
//           <MaterialIcons name="location-pin" size={24} color="#EC4D4A" />
//           <View style={{ flex: 1 }}>
//             <Text style={styles.locationTitle}>Shivaji Nagar</Text>
//             <Text style={styles.locationSubtitle}>Shivaji Nagar, Bengaluru, Karnatak...</Text>
//           </View>
//           <TouchableOpacity>
//             <Text style={styles.changeBtn}>Change</Text>
//           </TouchableOpacity>
//         </View>

//         <TextInput
//           style={styles.input}
//           placeholder="Receiver's Name"
//           value={receiverName}
//           onChangeText={setReceiverName}
//         />

//         <TextInput
//           style={styles.input}
//           placeholder="Receiver's Mobile number"
//           keyboardType="phone-pad"
//           value={receiverNumber}
//           onChangeText={setReceiverNumber}
//         />

//         <View style={styles.checkboxRow}>

//           <Checkbox
//   status={checked ? 'checked' : 'unchecked'}
//   onPress={() => setChecked(!checked)}
// />
//           <Text style={styles.checkboxLabel}>
//             Use my mobile number : 9552567681
//           </Text>
//         </View>

//         <Text style={styles.optionalText}>Save as (optional):</Text>
//         <View style={styles.tagRow}>
//           <TouchableOpacity style={styles.tag}><Ionicons name="home" size={16} color="#EC4D4A" /><Text style={styles.tagText}> Home</Text></TouchableOpacity>
//           <TouchableOpacity style={styles.tag}><MaterialIcons name="store" size={16} color="#EC4D4A" /><Text style={styles.tagText}> Shop</Text></TouchableOpacity>
//           <TouchableOpacity style={styles.tag}><Ionicons name="heart" size={16} color="#EC4D4A" /><Text style={styles.tagText}> Other</Text></TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.confirmButton}>
//           <Text style={styles.confirmButtonText}>Confirm And Proceed</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   mapContainer: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   marker: {
//     backgroundColor: '#EC4D4A',
//     padding: height * 0.005,
//     borderRadius: width * 0.05,
//   },
//   markerText: {
//     fontSize: width * 0.04,
//     color: 'white',
//   },
//   locationPopup: {
//     position: 'absolute',
//     top: height * 0.12,
//     left: width * 0.15,
//     backgroundColor: '#333',
//     padding: width * 0.03,
//     borderRadius: width * 0.02,
//   },
//   locationPopupText: {
//     color: 'white',
//     fontSize: width * 0.035,
//   },
//   bottomSheet: {
//     width: '100%',
//     backgroundColor: 'white',
//     paddingVertical: height * 0.02,
//     paddingHorizontal: width * 0.05,
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: height * 0.015,
//   },
//   locationTitle: {
//     fontWeight: 'bold',
//     fontSize: width * 0.045,
//   },
//   locationSubtitle: {
//     color: 'gray',
//     fontSize: width * 0.035,
//   },
//   changeBtn: {
//     color: '#EC4D4A',
//     fontWeight: 'bold',
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     paddingVertical: height * 0.015,
//     paddingHorizontal: width * 0.04,
//     marginVertical: height * 0.01,
//     fontSize: width * 0.04,
//   },
//   checkboxRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: height * 0.01,
//   },
//   checkboxLabel: {
//     marginLeft: 8,
//     fontSize: width * 0.035,
//   },
//   optionalText: {
//     fontSize: width * 0.035,
//     marginVertical: height * 0.01,
//   },
//   tagRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: height * 0.02,
//   },
//   tag: {
//     flexDirection: 'row',
//     borderColor: '#EC4D4A',
//     borderWidth: 1,
//     borderRadius: 20,
//     paddingVertical: height * 0.008,
//     paddingHorizontal: width * 0.05,
//     alignItems: 'center',
//   },
//   tagText: {
//     color: '#EC4D4A',
//     fontSize: width * 0.035,
//   },
//   confirmButton: {
//     backgroundColor: '#EC4D4A',
//     borderRadius: 10,
//     paddingVertical: height * 0.02,
//     alignItems: 'center',
//   },
//   confirmButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: width * 0.045,
//   },
// });

// export default DropLocationScreen;

// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import { Checkbox } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';

// const { width, height } = Dimensions.get('window');

// const DropLocationScreen = () => {
//   const [receiverName, setReceiverName] = useState('Lokesh godewar');
//   const [receiverNumber, setReceiverNumber] = useState('9552567681');
//   const [checked, setChecked] = useState(true);
//   const [selectedTag, setSelectedTag] = useState('home');
//   const [Address, setAddress] = useState('');

//   const navigation = useNavigation();

//  const handleContinue = () => {
//     navigation.replace('SelectVehicle');

//   };
//   // 'home', 'shop', or 'other'

//   return (
//     <View style={styles.container}>
//       {/* Map Section */}
//       <View style={styles.mapContainer}>
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: 12.9847,
//             longitude: 77.6050,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <Marker
//             coordinate={{ latitude: 12.9847, longitude: 77.6050 }}
//             title="Drop Location"
//             description="Your goods will be dropped here"
//           >
//             <View style={styles.marker}>
//               <Text style={styles.markerText}>📍</Text>
//             </View>
//           </Marker>
//         </MapView>
//         <View style={styles.locationPopup}>
//           <Text style={styles.locationPopupText}>Your goods will be dropped here</Text>
//         </View>
//       </View>

//       {/* Bottom Sheet Section */}
//       <ScrollView contentContainerStyle={styles.bottomSheet}>
//         <View style={styles.locationRow}>
//           <MaterialIcons name="location-pin" size={24} color="#EC4D4A" />
//           <View style={{ flex: 1 }}>
//             <Text style={styles.locationTitle}>Shivaji Nagar</Text>
//             <Text style={styles.locationSubtitle}>Shivaji Nagar, Bengaluru, Karnatak...</Text>
//           </View>
//           <TouchableOpacity>
//             <Text style={styles.changeBtn}>Change</Text>
//           </TouchableOpacity>
//         </View>
//          <TextInput
//           style={styles.input}
//           placeholder="Address 1"
//           value={Address}
//           onChangeText={setAddress}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Address 2"
//           value={Address}
//           onChangeText={setAddress}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Landmark"
//           value={Address}
//           onChangeText={setAddress}
//         />
//           <TextInput
//           style={styles.input}
//           placeholder="Pincode"
//           value={Address}
//           onChangeText={setAddress}
//         />

//         <TextInput
//           style={styles.input}
//           placeholder="Receiver's Name"
//           value={receiverName}
//           onChangeText={setReceiverName}
//         />

//         <TextInput
//           style={styles.input}
//           placeholder="Receiver's Mobile number"
//           keyboardType="phone-pad"
//           value={receiverNumber}
//           onChangeText={setReceiverNumber}
//         />

//         <View style={styles.checkboxRow}>
//           <Checkbox
//             status={checked ? 'checked' : 'unchecked'}
//             onPress={() => setChecked(!checked)}
//             color="#EC4D4A"
//           />
//           <Text style={styles.checkboxLabel}>
//             Use my mobile number : 9552567681
//           </Text>
//         </View>

//         <Text style={styles.optionalText}>Save as (optional):</Text>
//         {/* <View style={styles.tagRow}>
//           <TouchableOpacity
//             style={[
//               styles.tag,
//               selectedTag === 'home' && styles.selectedTag
//             ]}
//             onPress={() => setSelectedTag('home')}
//           >
//             <Ionicons
//               name="home"
//               size={16}
//               color={selectedTag === 'home' ? 'white' : 'black'}
//             />
//             <Text style={[
//               styles.tagText,
//               selectedTag === 'home' ? styles.selectedTagText : styles.unselectedTagText
//             ]}> Home</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.tag,
//               selectedTag === 'shop' && styles.selectedTag
//             ]}
//             onPress={() => setSelectedTag('shop')}
//           >
//             <MaterialIcons
//               name="store"
//               size={16}
//               color={selectedTag === 'shop' ? 'white' : 'black'}
//             />
//             <Text style={[
//               styles.tagText,
//               selectedTag === 'shop' ? styles.selectedTagText : styles.unselectedTagText
//             ]}> Shop</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.tag,
//               selectedTag === 'other' && styles.selectedTag
//             ]}
//             onPress={() => setSelectedTag('other')}
//           >
//             <Ionicons
//               name="heart"
//               size={16}
//               color={selectedTag === 'other' ? 'white' : 'black'}
//             />
//             <Text style={[
//               styles.tagText,
//               selectedTag === 'other' ? styles.selectedTagText : styles.unselectedTagText
//             ]}> Other</Text>
//           </TouchableOpacity>
//         </View> */}
//         <ScrollView
//   horizontal
//   showsHorizontalScrollIndicator={false}
//   contentContainerStyle={styles.tagContainer}
// >
//   <TouchableOpacity
//     style={[
//       styles.tag,
//       selectedTag === 'home' && styles.selectedTag
//     ]}
//     onPress={() => setSelectedTag('home')}
//   >
//     <Ionicons
//       name="home"
//       size={16}
//       color={selectedTag === 'home' ? 'white' : 'black'}
//     />
//     <Text style={[
//       styles.tagText,
//       selectedTag === 'home' ? styles.selectedTagText : styles.unselectedTagText
//     ]}> Home</Text>
//   </TouchableOpacity>

//   <TouchableOpacity
//     style={[
//       styles.tag,
//       selectedTag === 'business' && styles.selectedTag
//     ]}
//     onPress={() => setSelectedTag('business')}
//   >
//     <MaterialIcons
//       name="business"
//       size={16}
//       color={selectedTag === 'business' ? 'white' : 'black'}
//     />
//     <Text style={[
//       styles.tagText,
//       selectedTag === 'business' ? styles.selectedTagText : styles.unselectedTagText
//     ]}> Business</Text>
//   </TouchableOpacity>

//   <TouchableOpacity
//     style={[
//       styles.tag,
//       selectedTag === 'work' && styles.selectedTag
//     ]}
//     onPress={() => setSelectedTag('work')}
//   >
//     <MaterialIcons
//       name="work"
//       size={16}
//       color={selectedTag === 'work' ? 'white' : 'black'}
//     />
//     <Text style={[
//       styles.tagText,
//       selectedTag === 'work' ? styles.selectedTagText : styles.unselectedTagText
//     ]}> Work</Text>
//   </TouchableOpacity>

//   <TouchableOpacity
//     style={[
//       styles.tag,
//       selectedTag === 'shop' && styles.selectedTag
//     ]}
//     onPress={() => setSelectedTag('shop')}
//   >
//     <MaterialIcons
//       name="store"
//       size={16}
//       color={selectedTag === 'shop' ? 'white' : 'black'}
//     />
//     <Text style={[
//       styles.tagText,
//       selectedTag === 'shop' ? styles.selectedTagText : styles.unselectedTagText
//     ]}> Shop</Text>
//   </TouchableOpacity>

//   <TouchableOpacity
//     style={[
//       styles.tag,
//       selectedTag === 'other' && styles.selectedTag
//     ]}
//     onPress={() => setSelectedTag('other')}
//   >
//     <Ionicons
//       name="heart"
//       size={16}
//       color={selectedTag === 'other' ? 'white' : 'black'}
//     />
//     <Text style={[
//       styles.tagText,
//       selectedTag === 'other' ? styles.selectedTagText : styles.unselectedTagText
//     ]}> Other</Text>
//   </TouchableOpacity>
// </ScrollView>

//         <TouchableOpacity style={styles.confirmButton} onPress={handleContinue}>
//           <Text style={styles.confirmButtonText}>Confirm And Proceed</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   mapContainer: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   marker: {
//     backgroundColor: '#EC4D4A',
//     padding: height * 0.005,
//     borderRadius: width * 0.05,
//   },
//   markerText: {
//     fontSize: width * 0.04,
//     color: 'white',
//   },
//   locationPopup: {
//     position: 'absolute',
//     top: height * 0.12,
//     left: width * 0.15,
//     backgroundColor: '#333',
//     padding: width * 0.03,
//     borderRadius: width * 0.02,
//   },
//   locationPopupText: {
//     color: 'white',
//     fontSize: width * 0.035,
//   },
//   bottomSheet: {
//     width: '100%',
//     backgroundColor: 'white',
//     paddingVertical: height * 0.02,
//     paddingHorizontal: width * 0.05,
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: height * 0.015,
//   },
//   locationTitle: {
//     fontWeight: 'bold',
//     fontSize: width * 0.045,
//   },
//   locationSubtitle: {
//     color: 'gray',
//     fontSize: width * 0.035,
//   },
//   changeBtn: {
//     color: '#EC4D4A',
//     fontWeight: 'bold',
//   },
//   input: {
//     width: '100%',
//     borderWidth: 0.5,
//     borderColor: '#000',
//     borderRadius: 10,
//     paddingVertical: height * 0.015,
//     paddingHorizontal: width * 0.04,
//     marginVertical: height * 0.01,
//     fontSize: width * 0.04,
//   },
//   checkboxRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: height * 0.01,
//   },
//   checkboxLabel: {
//     marginLeft: 8,
//     fontSize: width * 0.035,
//   },
//   optionalText: {
//     fontSize: width * 0.035,
//     marginVertical: height * 0.01,
//   },
//   tagRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: height * 0.02,
//   },
//  tagContainer: {
//   paddingHorizontal: 15,
//   paddingVertical: 8,
// },
// tag: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   backgroundColor: '#f0f0f0',
//   borderRadius: 20,
//   paddingHorizontal: 15,
//   paddingVertical: 8,
//   marginRight: 10,
// },
//   selectedTag: {
//     backgroundColor: '#EC4D4A',
//   },
//   tagText: {
//     marginLeft: 5,
//   fontSize: 14,
//   },
//   selectedTagText: {
//     color: 'white',
//      borderColor: 'white',

//   },
//   unselectedTagText: {
//     color: 'black',
//   },
//   confirmButton: {
//     backgroundColor: '#EC4D4A',
//     borderRadius: 15,
//     paddingVertical: height * 0.016,
//     alignItems: 'center',
//   },
//   confirmButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: width * 0.045,
//   },
// });

// export default DropLocationScreen;

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  Image,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveDropLocation, isTokenExpired } from "../utils/AuthApi";
import * as Location from "expo-location";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get("window");

// Calculate responsive scaling factors
const scale = (size) => (width / 375) * size; // 375 is standard iPhone width
const verticalScale = (size) => (height / 812) * size; // 812 is standard iPhone height
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const DropLocationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Get location data from navigation params
  const {
    selectedAddress = "Drop Location",
    selectedLocation,
    pickupAddress,
    pickupLocation,
    midStops = [],
    finalDrop,
    drop,
    pickup,
    vehicleType, // Extract vehicleType from navigation params
  } = route.params || {};

  // Debug: Log received parameters
  console.log("DropLocationScreen received params:", route.params);
  console.log("selectedAddress:", selectedAddress);
  console.log("selectedLocation:", selectedLocation);
  console.log("pickupAddress:", pickupAddress);
  console.log("pickup:", pickup);
  console.log("midStops:", midStops);
  console.log("finalDrop:", finalDrop);

  // Handle different parameter formats and ensure we have valid coordinates
  const dropAddress = selectedAddress || drop || "Drop Location";
  const safeSelectedLocation =
    selectedLocation && selectedLocation.latitude && selectedLocation.longitude
      ? selectedLocation
      : { latitude: 12.9847, longitude: 77.605 }; // Default to Bangalore coordinates

  // Form field states - separate state for each field
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverNumber, setReceiverNumber] = useState("");
  const [checked, setChecked] = useState(false);
  const [selectedTag, setSelectedTag] = useState("home");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [userName, setUserName] = useState(""); // Store user's name separately
  const [loading, setLoading] = useState(false);

  // Map adjustment modal states
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(safeSelectedLocation);
  const [currentAddress, setCurrentAddress] = useState(dropAddress);
  const [mapCenter, setMapCenter] = useState(safeSelectedLocation);
  const [selectedLocationForModal, setSelectedLocationForModal] = useState("Loading...");
  const [selectedPostalCodeForModal, setSelectedPostalCodeForModal] = useState("");
  const [hasMapMoved, setHasMapMoved] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  
  // Store initial location for reset functionality
  const initialLocation = useRef(safeSelectedLocation);
  const initialAddress = useRef(dropAddress);

  // Map reference for zoom controls
  const mapRef = useRef(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const userPhone = await AsyncStorage.getItem("userPhone");

      console.log("Loading user data...");
      console.log("UserData from storage:", userData);
      console.log("UserPhone from storage:", userPhone);

      if (userData) {
        const user = JSON.parse(userData);
        const phoneNumber = user.phone || userPhone || "";
        const fullName = user.name ? `${user.name} ${user.lname || ""}`.trim() : "";
        
        setUserPhoneNumber(phoneNumber);
        setUserName(fullName); // Store the user's name separately
        console.log("Set phone number:", phoneNumber);
        console.log("Set user name:", fullName);
      } else if (userPhone) {
        setUserPhoneNumber(userPhone);
        console.log("Set phone number from userPhone:", userPhone);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = () => {
    setChecked(!checked);
    if (!checked && userPhoneNumber) {
      // When checkbox is checked, fill both name and phone number
      setReceiverNumber(userPhoneNumber);
      setReceiverName(userName); // Use the stored user name
      console.log("Auto-filled phone number:", userPhoneNumber);
      console.log("Auto-filled receiver name:", userName);
    } else {
      // When unchecked, clear both fields
      setReceiverNumber("");
      setReceiverName("");
    }
  };

  // Handle opening map adjustment modal
  const handleChangeLocation = () => {
    setMapCenter(currentLocation);
    setSelectedLocationForModal("Loading...");
    setShowMapModal(true);
  };

  // Handle map region change (when user drags the map)
  const handleMapRegionChange = async (region) => {
    const newCoords = {
      latitude: region.latitude,
      longitude: region.longitude
    };
    setMapCenter(newCoords);
    
    // Update address in real-time
    try {
      const geocode = await Location.reverseGeocodeAsync(newCoords);
      const addr = geocode && geocode[0];
      const formatted = addr ? `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}` : 'Unknown location';
      const postal = addr?.postalCode || addr?.postal_code || '';
      setSelectedLocationForModal(formatted);
      setSelectedPostalCodeForModal(postal);
    } catch (error) {
      setSelectedLocationForModal(`${newCoords.latitude.toFixed(6)}, ${newCoords.longitude.toFixed(6)}`);
    }
  };

  // Handle map region change for main map view
  const handleMainMapRegionChange = async (region) => {
    const newCoords = {
      latitude: region.latitude,
      longitude: region.longitude
    };
    
    // Check if map has significantly moved from initial position
    const distance = Math.sqrt(
      Math.pow(newCoords.latitude - safeSelectedLocation.latitude, 2) + 
      Math.pow(newCoords.longitude - safeSelectedLocation.longitude, 2)
    );
    
    if (distance > 0.001) { // Threshold for significant movement
      setHasMapMoved(true);
      setTempLocation(newCoords);
    }
    
    // Update address in real-time for main view
    try {
      const geocode = await Location.reverseGeocodeAsync(newCoords);
      const addr = geocode[0];
      const formatted = addr ? `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}` : 'Unknown location';
      // Don't update current address until confirmed
    } catch (error) {
      // Handle error silently
    }
  };

  // Confirm drop location from map movement
  const handleConfirmDropLocation = async () => {
    if (!tempLocation) return;
    
    try {
      const geocode = await Location.reverseGeocodeAsync(tempLocation);
      const addr = geocode && geocode[0];
      const formatted = addr ? `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}` : 'Unknown location';
      const postal = addr?.postalCode || addr?.postal_code || '';
      
      // Update current location, address and pincode
      setCurrentLocation(tempLocation);
      setCurrentAddress(formatted);
      if (postal) setPincode(postal);
      
      // Hide the confirm button
      setHasMapMoved(false);
      setTempLocation(null);
      // Location updated - visual feedback from map update is enough
      
    } catch (error) {
      Alert.alert("Error", "Unable to fetch address details for the selected location");
    }
  };

  // Reset to initial location
  const handleResetToInitialLocation = async () => {
    try {
      // Animate map back to initial location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: initialLocation.current.latitude,
          longitude: initialLocation.current.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }, 500);
      }
      
      // Reset states
      setCurrentLocation(initialLocation.current);
      setCurrentAddress(initialAddress.current);
      setHasMapMoved(false);
      setTempLocation(null);
      
      // Fetch and update pincode for initial location
      const geocode = await Location.reverseGeocodeAsync(initialLocation.current);
      const addr = geocode && geocode[0];
      const postal = addr?.postalCode || addr?.postal_code || '';
      if (postal) setPincode(postal);
    } catch (error) {
      console.error("Error resetting location:", error);
    }
  };

  // Confirm location selection from map modal
  const handleConfirmLocation = async () => {
    setCurrentLocation(mapCenter);
    setCurrentAddress(selectedLocationForModal);
    if (selectedPostalCodeForModal) setPincode(selectedPostalCodeForModal);
    
    setShowMapModal(false);
  };

  // Helper: get formatted address and postal code from coordinates
  const getAddressFromCoords = async (coords) => {
    try {
      const geocode = await Location.reverseGeocodeAsync(coords);
      const addr = geocode && geocode[0];
      const formatted = addr ? `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}` : 'Unknown location';
      const postal = addr?.postalCode || addr?.postal_code || '';
      return { formatted, postal };
    } catch (e) {
      return { formatted: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`, postal: '' };
    }
  };

  // On mount, populate address and pincode for the initial/current location
  useEffect(() => {
    (async () => {
      try {
        const { formatted, postal } = await getAddressFromCoords(currentLocation || safeSelectedLocation);
        setCurrentAddress(formatted || dropAddress);
        if (postal) setPincode(postal);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const handleContinue = async () => {
    // Validate required fields - only receiver name and number are mandatory
    if (!receiverName.trim()) {
      Alert.alert("Missing Information", "Please enter receiver name");
      return;
    }
    if (!receiverNumber.trim() || receiverNumber.length !== 10) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit mobile number"
      );
      return;
    }

    setLoading(true);

    try {
      // Prepare mid stops with coordinates from stopsDetails
      const midStopsWithCoords = midStops.map((stopAddress, index) => {
        const stopDetail = route.params?.stopsDetails?.[index];
        const coordinates = stopDetail?.geometry?.location
          ? {
              latitude: stopDetail.geometry.location.lat,
              longitude: stopDetail.geometry.location.lng,
            }
          : null;
        
        return {
          address: stopAddress,
          coordinates: coordinates,
          receiverDetails: {
            receiverName: `Stop ${index + 1}`,
            receiverNumber: '',
          },
        };
      }).filter(stop => stop.coordinates); // Only include stops with valid coordinates

      // Prepare drop location data
      const dropLocationData = {
        selectedAddress: dropAddress,
        selectedLocation: safeSelectedLocation,
        pickupAddress: pickupAddress || pickup,
        pickupLocation,
        midStops, // Keep for backward compatibility
        midStopsWithCoords, // New: enhanced stops with coordinates
        stopsDetails: route.params?.stopsDetails, // Keep original details
        dropDetails: {
          address: address.trim(),
            pincode: pincode ? pincode.trim() : "",
          receiverName: receiverName.trim(),
          receiverNumber: receiverNumber.trim(),
          useMyNumber: checked,
          saveAs: selectedTag,
          userPhoneNumber,
        },
      };

      console.log("Drop Location Data:", dropLocationData);

      // Store data locally
      await AsyncStorage.setItem(
        "dropLocationData",
        JSON.stringify(dropLocationData)
      );

      // Skip API call to prevent automatic booking creation
      // Only save data locally at this stage
      console.log("Skipping server API call to prevent automatic booking creation");
      console.log("Data saved locally only - will sync when booking is confirmed");
      setLoading(false);

      // Navigate to next screen regardless of API success/failure
      navigation.replace("SelectVehicle", {
        dropLocationData,
        vehicleType: vehicleType, // Forward vehicleType to SelectVehicleScreen
      });
    } catch (error) {
      console.error("Error saving drop location data:", error);
      Alert.alert("Error", "Error saving data. Please try again.");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
            <View style={{ flex: 1, position: 'relative' }}>
              {/* Back Button on Map */}
              <TouchableOpacity 
                style={[styles.mapBackButton, { top: insets.top + 10 }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.001, // Very tight zoom for consistency
                  longitudeDelta: 0.001,
                }}
                onRegionChangeComplete={handleMainMapRegionChange}
                showsUserLocation={true}
                showsMyLocationButton={false}
                minZoomLevel={15} // Prevent zoom out beyond this level
                maxZoomLevel={20} // Allow detailed zoom in
                onMapReady={() => {
                  // Force consistent zoom when map loads
                  setTimeout(() => {
                    mapRef.current?.animateToRegion({
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      latitudeDelta: 0.001,
                      longitudeDelta: 0.001,
                    }, 500);
                  }, 100);
                }}
                ref={(ref) => { mapRef.current = ref; }}
              />
          
          {/* Reset to Initial Location Button - Top Right - Only shows when map has moved */}
          {hasMapMoved && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: '#fff',
                borderRadius: 30,
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                zIndex: 1002,
              }}
              onPress={handleResetToInitialLocation}
            >
              <Ionicons name="locate" size={28} color="#EC4D4A" />
            </TouchableOpacity>
          )}

          {/* Fixed Center Pointer (Porter Style) - Always in center */}
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: -75,
            marginTop: -150,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <Image
              source={require("../assets/icons/dropLocationAnimation.gif")}
              style={{ 
                width: 150, 
                height: 150,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Confirm Drop Location Button - Appears when map is moved */}
          {hasMapMoved && (
            <View style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              zIndex: 1001,
            }}>
              {/* Confirm Drop Location Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#EC4D4A',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                }}
                onPress={handleConfirmDropLocation}
              >
                <Text style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}>
                  Confirm Location
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.locationPopup}>
          <Text style={styles.locationPopupText}>
            Your goods will be dropped here
          </Text>
        </View>
      </View>

      {/* Map Adjustment Modal */}
      <Modal visible={showMapModal} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 35 : 10,
            paddingBottom: 15,
            paddingHorizontal: 20,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0'
          }}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ 
              fontWeight: "bold", 
              fontSize: 18, 
              marginLeft: 15,
              color: '#333'
            }}>
              Adjust Drop Location
            </Text>
          </View>

          {/* Map Container */}
          <View style={{ flex: 1, position: 'relative' }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: mapCenter.latitude,
                longitude: mapCenter.longitude,
                latitudeDelta: 0.001, // Very tight zoom for consistency
                longitudeDelta: 0.001,
              }}
              onRegionChangeComplete={handleMapRegionChange}
              showsUserLocation={true}
              showsMyLocationButton={true}
              minZoomLevel={15} // Prevent zoom out beyond this level
              maxZoomLevel={20} // Allow detailed zoom in
              onMapReady={() => {
                // Force consistent zoom when map loads
                if (mapCenter) {
                  setTimeout(() => {
                    mapRef.current?.animateToRegion({
                      latitude: mapCenter.latitude,
                      longitude: mapCenter.longitude,
                      latitudeDelta: 0.001,
                      longitudeDelta: 0.001,
                    }, 500);
                  }, 100);
                }
              }}
              ref={(ref) => { mapRef.current = ref; }}
            />
            
            {/* Fixed Center Pointer (Porter Style) */}
            <View style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginLeft: -75,
              marginTop: -150,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <Image
                source={require("../assets/icons/dropLocationAnimation.gif")}
                style={{ 
                  width: 150, 
                  height: 150,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
                resizeMode="contain"
              />
            </View>

            {/* Address Display Card */}
            <View style={{
              position: 'absolute',
              bottom: 120,
              left: 20,
              right: 20,
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              borderWidth: 1,
              borderColor: '#f0f0f0',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-sharp" size={20} color="#EC4D4A" style={{ marginRight: 10 }} />
                <Text style={{ 
                  flex: 1, 
                  fontSize: 14, 
                  color: '#333',
                  fontWeight: '500'
                }} numberOfLines={2}>
                  {selectedLocationForModal}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            margin: 20,
            gap: 12,
          }}>
            <TouchableOpacity
              style={[styles.modalBtn, { 
                backgroundColor: '#f5f5f5',
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 12,
              }]}
              onPress={() => setShowMapModal(false)}
            >
              <Text style={[styles.modalBtnText, { 
                color: '#666',
                fontSize: 14,
                textAlign: 'center'
              }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { 
                backgroundColor: '#EC4D4A',
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 12,
              }]}
              onPress={handleConfirmLocation}
            >
              <Text style={[styles.modalBtnText, { 
                color: '#fff', 
                fontWeight: 'bold',
                fontSize: 14,
                textAlign: 'center'
              }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

          {/* Bottom Sheet Section */}
          <ScrollView
            style={styles.bottomSheet}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.locationRow}>
              <MaterialIcons
                name="location-pin"
                size={moderateScale(24)}
                color="#EC4D4A"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationTitle}>Drop Location</Text>
                <Text style={styles.locationSubtitle}>{currentAddress}</Text>
              </View>
          <TouchableOpacity onPress={handleChangeLocation}>
            <Text style={styles.changeBtn}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Address Fields */}
        <TextInput
          style={styles.input}
          placeholder="Enter Complete Address"
          placeholderTextColor="#999"
          underlineColorAndroid="transparent"
          value={address ?? ""}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          placeholderTextColor="#999"
          underlineColorAndroid="transparent"
          value={pincode ?? ""}
          onChangeText={setPincode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <View style={styles.rowContainer}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Receiver's Name"
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
            value={receiverName ?? ""}
            onChangeText={setReceiverName}
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Mobile number"
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
            value={receiverNumber ?? ""}
            onChangeText={setReceiverNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <TouchableOpacity 
          style={styles.checkboxRow}
          onPress={handleCheckboxToggle}
          activeOpacity={0.7}
        >
          <Checkbox
            value={checked}
            onValueChange={handleCheckboxToggle}
            color={checked ? "#EC4D4A" : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.checkboxLabel}>
            Use my mobile number : {userPhoneNumber || "Loading..."}
          </Text>
        </TouchableOpacity>

        <Text style={styles.optionalText}>Save as (optional):</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagContainer}
        >
          {[
            { id: "home", icon: "home", iconSet: Ionicons },
            { id: "business", icon: "business", iconSet: MaterialIcons },
            { id: "work", icon: "work", iconSet: MaterialIcons },
            { id: "shop", icon: "store", iconSet: MaterialIcons },
            { id: "other", icon: "heart", iconSet: Ionicons },
          ].map((tag) => {
            const Icon = tag.iconSet;
            return (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tag,
                  selectedTag === tag.id && styles.selectedTag,
                ]}
                onPress={() => setSelectedTag(tag.id)}
              >
                <Icon
                  name={tag.icon}
                  size={moderateScale(16)}
                  color={selectedTag === tag.id ? "white" : "black"}
                />
                <Text
                  style={[
                    styles.tagText,
                    selectedTag === tag.id
                      ? styles.selectedTagText
                      : styles.unselectedTagText,
                  ]}
                >
                  {" "}
                  {tag.id.charAt(0).toUpperCase() + tag.id.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Spacing for bottom button */}
        <View style={{ height: 100 + insets.bottom }} />
          </ScrollView>

      {/* Bottom Fixed Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + moderateScale(16) }]}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            loading && styles.confirmButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading ? "Saving..." : "Confirm And Proceed"}
          </Text>
        </TouchableOpacity>
      </View>
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapBackButton: {
    position: 'absolute',
    left: moderateScale(16),
    backgroundColor: '#fff',
    borderRadius: moderateScale(25),
    width: moderateScale(50),
    height: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1003,
  },
  mapContainer: {
    height: verticalScale(300), // Fixed height that scales with screen
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    backgroundColor: "#EC4D4A",
    padding: moderateScale(5),
    borderRadius: moderateScale(20),
  },
  markerText: {
    fontSize: moderateScale(20),
  },
  locationPopup: {
    position: "absolute",
    top: verticalScale(100),
    left: moderateScale(50),
    backgroundColor: "#333",
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
  },
  locationPopupText: {
    color: "white",
    fontSize: moderateScale(14),
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
  },
  scrollContent: {
    paddingVertical: verticalScale(20),
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(15),
  },
  locationTitle: {
    fontWeight: "bold",
    fontSize: moderateScale(16),
  },
  locationSubtitle: {
    color: "gray",
    fontSize: moderateScale(14),
  },
  changeBtn: {
    color: "#EC4D4A",
    fontWeight: "bold",
    fontSize: moderateScale(14),
    textAlign: "center",
    width: moderateScale(80),
    alignSelf: "center",
  },
  input: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#000",
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(15),
    marginVertical: verticalScale(6),
    fontSize: moderateScale(16),
    textAlignVertical: "top", // For multiline text input
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: moderateScale(10),
  },
  inputHalf: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(10),
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(5),
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  checkboxLabel: {
    marginLeft: moderateScale(8),
    fontSize: moderateScale(14),
  },
  optionalText: {
    fontSize: moderateScale(14),
    marginVertical: verticalScale(10),
  },
  tagContainer: {
    paddingVertical: verticalScale(8),
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(15),
    paddingVertical: verticalScale(8),
    marginRight: moderateScale(10),
  },
  selectedTag: {
    backgroundColor: "#EC4D4A",
  },
  tagText: {
    marginLeft: moderateScale(5),
    fontSize: moderateScale(14),
  },
  selectedTagText: {
    color: "white",
  },
  unselectedTagText: {
    color: "black",
  },
  // Bottom Button
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 15,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -moderateScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
  },
  confirmButton: {
    backgroundColor: "#EC4D4A",
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  confirmButtonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  modalBtn: {
    backgroundColor: "#EC4D4A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DropLocationScreen;
