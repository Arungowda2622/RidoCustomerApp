import "react-native-get-random-values";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  Animated,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Image } from "react-native";
import axios from "axios";
import { API_URL } from '../utils/api';
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import KeyboardAwareWrapper from "../components/KeyboardAwareWrapper";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GOOGLE_API_KEY } from "../env/googleMapApi";

const { width, height } = Dimensions.get("window");


const LocationSelectorScreen = () => {
  const insets = useSafeAreaInsets();

  // Modal state for Select on Map and Saved Address
  const [showMapModal, setShowMapModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Location Confirmation Modal State
  const [showLocationConfirmModal, setShowLocationConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({
    address: '',
    coordinates: null,
    stopIndex: null,
  });
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [useMyNumber, setUseMyNumber] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [pincode, setPincode] = useState('');

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [mapSelectCoords, setMapSelectCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("Loading...");

  // Confirmation modal map ref and state
  const confirmMapRef = useRef(null);
  const [initialConfirmLocation, setInitialConfirmLocation] = useState(null);
  const [hasMovedConfirmMap, setHasMovedConfirmMap] = useState(false);

  // Load saved addresses from backend
  useEffect(() => {
    loadSavedAddressesFromBackend();
  }, []);

  const loadSavedAddressesFromBackend = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user._id || user.user?._id;

      if (!userId) return;

      const response = await axios.get(`${API_URL}/saved-addresses/user/${userId}`);

      if (response.data.success) {
        // Transform backend data to match frontend format
        const transformedAddresses = response.data.savedAddresses.map(addr => ({
          label: addr.tag,
          address: addr.address,
          coords: {
            latitude: addr.latitude,
            longitude: addr.longitude,
          },
          receiverInfo: {
            name: addr.receiverName || '',
            phone: addr.receiverMobile || '',
            pincode: '',
            tag: addr.tag.toLowerCase(),
          },
          _id: addr._id,
        }));
        setSavedAddresses(transformedAddresses);
        console.log('✅ Loaded saved addresses from backend:', transformedAddresses.length);
      }
    } catch (error) {
      console.error('Error loading saved addresses from backend:', error);
      setSavedAddresses([]);
    }
  };

  // Track which stop input is active for map selection
  const [activeStopIndex, setActiveStopIndex] = useState(null);

  // When user clicks Select on Map, set activeStopIndex
  const openMapForStop = async (idx) => {
    setActiveStopIndex(idx);

    try {
      // Always try to get current location for consistent starting point
      let currentLocation = location;
      if (!currentLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const userLocation = await Location.getCurrentPositionAsync({});
          currentLocation = {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          };
        }
      }

      // Use current location or fallback, but ensure consistent coordinates
      const initialCoords = currentLocation
        ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
        : { latitude: 37.7749, longitude: -122.4194 }; // San Francisco as fallback instead of India

      setMapCenter(initialCoords);
      setMapSelectCoords(initialCoords);
      setSelectedAddress("Loading...");
      setShowMapModal(true);

      // Fetch initial address for the coordinates
      setTimeout(async () => {
        try {
          const geocode = await Location.reverseGeocodeAsync(initialCoords);
          const addr = geocode[0];
          const formatted = addr ? `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}` : 'Unknown location';
          setSelectedAddress(formatted);
        } catch (error) {
          setSelectedAddress(`${initialCoords.latitude.toFixed(6)}, ${initialCoords.longitude.toFixed(6)}`);
        }
      }, 500);
    } catch (error) {
      // Fallback if location services fail
      const fallbackCoords = { latitude: 37.7749, longitude: -122.4194 };
      setMapCenter(fallbackCoords);
      setMapSelectCoords(fallbackCoords);
      setSelectedAddress("Location unavailable");
      setShowMapModal(true);
    }
  };  // Handle map region change (when user drags the map)
  const handleMapRegionChange = async (region) => {
    const newCoords = {
      latitude: region.latitude,
      longitude: region.longitude
    };
    setMapCenter(newCoords);
    setMapSelectCoords(newCoords);

    // Update address in real-time
    try {
      const geocode = await Location.reverseGeocodeAsync(newCoords);
      const addr = geocode[0];
      const formatted = addr ? `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}` : 'Unknown location';
      setSelectedAddress(formatted);
    } catch (error) {
      setSelectedAddress(`${newCoords.latitude.toFixed(6)}, ${newCoords.longitude.toFixed(6)}`);
    }
  };

  // (updateRoutePolylineRef is assigned after it's defined below)

  // Confirm selection: update the correct stop input
  const handleMapSelectConfirm = async () => {
    if (!mapSelectCoords) {
      Alert.alert(
        "Select Location",
        "Please wait for location to load."
      );
      return;
    }
    if (activeStopIndex === null) {
      Alert.alert("Error", "No stop selected for map input.");
      return;
    }

    try {
      const formatted = selectedAddress;

      // Close map modal and open confirmation modal
      setShowMapModal(false);

      const initialCoords = {
        latitude: mapSelectCoords.latitude,
        longitude: mapSelectCoords.longitude,
      };

      setConfirmModalData({
        address: formatted,
        coordinates: initialCoords,
        stopIndex: activeStopIndex,
        placeDetails: {
          formatted_address: formatted,
          geometry: {
            location: {
              lat: mapSelectCoords.latitude,
              lng: mapSelectCoords.longitude,
            },
          },
        },
      });

      // Store initial location for reset button
      setInitialConfirmLocation(initialCoords);
      setHasMovedConfirmMap(false);

      // Pre-fill with existing data if editing
      if (activeStopIndex === -1) {
        // Editing pickup location - pre-fill with pickup data
        setReceiverName(userName || '');
        setReceiverPhone(userPhone || '');
        setPincode('');
        setSelectedTag('');
      } else if (stopsDetails[activeStopIndex]?.receiverInfo) {
        // Editing drop location with existing data
        const existing = stopsDetails[activeStopIndex].receiverInfo;
        setReceiverName(existing.name || '');
        setReceiverPhone(existing.phone || '');
        setPincode(existing.pincode || '');
        setSelectedTag(existing.tag || '');
      } else {
        // Reset fields for new entry and try to extract pincode
        setReceiverName('');
        setReceiverPhone('');
        setSelectedTag('');

        // Try to extract pincode from coordinates using reverse geocoding
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: mapSelectCoords.latitude,
            longitude: mapSelectCoords.longitude,
          });
          const addr = geocode[0];
          setPincode(addr?.postalCode || '');
        } catch (error) {
          setPincode('');
        }
      }

      setShowLocationConfirmModal(true);
      setActiveStopIndex(null);
      setActiveInput(null); // Clear active input
    } catch {
      Alert.alert("Error", "Unable to fetch address for selected location");
    }
  };

  // Handler for selecting saved address
  const handleSavedSelect = (item) => {
    // Open confirmation modal with saved address data
    const coordinates = item.coords || null;

    setConfirmModalData({
      address: item.address,
      coordinates: coordinates,
      stopIndex: activeStopIndex !== null ? activeStopIndex : 0, // Use active stop or default to first
      placeDetails: {
        formatted_address: item.address,
        geometry: {
          location: coordinates
            ? {
              lat: coordinates.latitude,
              lng: coordinates.longitude,
            }
            : null,
        },
      },
    });

    // Pre-fill form with saved address data if available
    if (item.receiverInfo) {
      setReceiverName(item.receiverInfo.name || '');
      setReceiverPhone(item.receiverInfo.phone || '');
      setPincode(item.receiverInfo.pincode || '');
      setSelectedTag(item.label?.toLowerCase() || '');
    } else {
      setReceiverName('');
      setReceiverPhone('');
      setPincode('');
      setSelectedTag(item.label?.toLowerCase() || '');
    }

    setShowSavedModal(false);
    setActiveInput(null); // Clear active input
    setShowLocationConfirmModal(true);
  };

  // Handle confirmation modal map region change
  const handleConfirmModalMapChange = async (region) => {
    const newCoords = {
      latitude: region.latitude,
      longitude: region.longitude
    };

    // Mark that user has moved the map
    setHasMovedConfirmMap(true);

    setConfirmModalData(prev => ({
      ...prev,
      coordinates: newCoords,
    }));

    // Update address in real-time
    try {
      const geocode = await Location.reverseGeocodeAsync(newCoords);
      const addr = geocode[0];
      const formatted = addr ? `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}` : 'Unknown location';
      setConfirmModalData(prev => ({
        ...prev,
        address: formatted,
      }));

      // Auto-populate pincode if available
      if (addr?.postalCode) {
        setPincode(addr.postalCode);
      }
    } catch (error) {
      setConfirmModalData(prev => ({
        ...prev,
        address: `${newCoords.latitude.toFixed(6)}, ${newCoords.longitude.toFixed(6)}`,
      }));
    }
  };

  // Handle final confirmation and save location
  const handleLocationConfirmAndSave = async () => {
    // Validate required fields
    if (!receiverName.trim()) {
      Alert.alert("Required", "Please enter receiver's name");
      return;
    }

    if (!receiverPhone.trim() && !useMyNumber) {
      Alert.alert("Required", "Please enter receiver's phone number");
      return;
    }

    const { address, coordinates, stopIndex, placeDetails } = confirmModalData;

    // Check if editing pickup location (stopIndex === -1)
    if (stopIndex === -1) {
      // Update pickup location
      if (coordinates) {
        setLocation({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });
      }
      setAddress(address);
      setUserName(receiverName.trim() || userName);
      setUserPhone(useMyNumber ? userPhone : receiverPhone.trim() || userPhone);

      setShowLocationConfirmModal(false);

      // Reset form
      setReceiverName('');
      setReceiverPhone('');
      setPincode('');
      setSelectedTag('');
      setUseMyNumber(false);
      setHasMovedConfirmMap(false);
      setInitialConfirmLocation(null);

      return;
    }

    // Build receiver info
    const receiverInfo = {
      name: receiverName.trim(),
      phone: useMyNumber ? userPhone : receiverPhone.trim(),
      pincode: pincode.trim(),
      tag: selectedTag,
    };

    // Save to backend database if user selected a tag
    if (selectedTag && selectedTag.trim() !== '') {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          console.log('⚠️ No user data found');
        } else {
          const user = JSON.parse(userData);
          const userId = user._id || user.user?._id;

          if (!userId) {
            console.log('⚠️ No userId found');
          } else {
            const savedAddressData = {
              userId: userId,
              tag: selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1), // Home, Shop, Office, Other
              address: address,
              latitude: coordinates?.latitude || 0,
              longitude: coordinates?.longitude || 0,
              receiverName: receiverName.trim(),
              receiverMobile: useMyNumber ? userPhone : receiverPhone.trim(),
              isDefault: false,
            };

            console.log('📡 Saving address to backend:', savedAddressData);

            const response = await axios.post(
              `${API_URL}/saved-addresses/create`,
              savedAddressData
            );

            if (response.data.success) {
              console.log('✅ Address saved to backend successfully');
              // Reload saved addresses from backend
              await loadSavedAddressesFromBackend();
            }
          }
        }
      } catch (error) {
        if (error.response?.status === 409) {
          console.log('⚠️ Address already saved with this tag');
        } else {
          console.error('Error saving address to backend:', error.response?.data || error.message);
        }
      }
    }

    // Update stops and stopsDetails with receiver info
    const newStops = [...stops];
    const newDetails = [...stopsDetails];

    newStops[stopIndex] = address;
    newDetails[stopIndex] = {
      ...(placeDetails || {
        formatted_address: address,
        geometry: {
          location: coordinates
            ? {
              lat: coordinates.latitude,
              lng: coordinates.longitude,
            }
            : null,
        },
      }),
      receiverInfo: receiverInfo,
    };

    setStops(newStops);
    setStopsDetails(newDetails);
    setShowLocationConfirmModal(false);

    // Reset form and map state
    setReceiverName('');
    setReceiverPhone('');
    setPincode('');
    setSelectedTag('');
    setUseMyNumber(false);
    setHasMovedConfirmMap(false);
    setInitialConfirmLocation(null);

    // Force immediate map zoom adjustment
    console.log(`✅ Location ${stopIndex + 1} added, triggering immediate map update`);

    // Update map immediately with new coordinates
    setTimeout(() => {
      const coords = [];

      // Add pickup location
      if (location) {
        coords.push({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      // Add all valid stop coordinates from the newly updated details
      newDetails.forEach((details, index) => {
        if (details?.geometry?.location) {
          coords.push({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
          });
          console.log(`📍 Added stop ${index + 1} to map view`);
        }
      });

      console.log(`🗺️ Total points to display: ${coords.length}`);

      // Immediately fit map to show all points
      if (mapRef.current && coords.length > 0) {
        if (coords.length === 1) {
          // Single point - zoom to it
          mapRef.current.animateToRegion({
            latitude: coords[0].latitude,
            longitude: coords[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 500);
        } else {
          // Multiple points - fit all with good visibility
          const latitudes = coords.map(c => c.latitude);
          const longitudes = coords.map(c => c.longitude);

          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);

          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;

          const latSpread = maxLat - minLat;
          const lngSpread = maxLng - minLng;

          // Dynamic padding: 2.5x for 2 points, 2.0x for 3+ points
          const paddingFactor = coords.length === 2 ? 2.5 : 2.0;

          let latDelta = Math.max(latSpread * paddingFactor, 0.015);
          let lngDelta = Math.max(lngSpread * paddingFactor, 0.015);

          latDelta = Math.min(latDelta, 0.5);
          lngDelta = Math.min(lngDelta, 0.5);

          console.log(`🎯 Zooming to show ${coords.length} points with delta: ${latDelta.toFixed(4)}, ${lngDelta.toFixed(4)}`);

          mapRef.current.animateToRegion({
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
          }, 800);
        }
      }

      // Update route polyline after map zoom
      scheduleUpdateRoutePolyline(200);
    }, 150);
  };
  const navigation = useNavigation();
  const route = useRoute();

  // Get data from route params (passed from HomeScreen or SelectVehicleScreen)
  const { vehicleType, currentLocation, currentAddress, mode, existingData, returnToSelectVehicle } = route.params || {};

  const [location, setLocation] = useState(currentLocation || null);
  const [address, setAddress] = useState(currentAddress || "Fetching location...");
  const [stops, setStops] = useState([""]); // Start with 1 empty stop
  const [stopsDetails, setStopsDetails] = useState([null]);

  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(stops.length > 0 ? "stop-0" : null); // Track which input is active for suggestions

  const [userName, setUserName] = useState("User");
  const [userPhone, setUserPhone] = useState("");

  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const [searchLoading, setSearchLoading] = useState(false);


  const mapRef = useRef(null);

  // Memoize totalStops to prevent unnecessary recalculations on every render
  const totalStops = React.useMemo(() => stops.length, [stops.length]);

  // Animation values for blinking markers (always in sync with stops)
  const markerAnimationsRef = useRef([new Animated.Value(1)]); // pickup marker
  // Ensure markerAnimations always matches stopsDetails.length + 1 (pickup + stops)
  useEffect(() => {
    const needed = stopsDetails.length + 1;
    while (markerAnimationsRef.current.length < needed) {
      markerAnimationsRef.current.push(new Animated.Value(1));
    }
    while (markerAnimationsRef.current.length > needed) {
      markerAnimationsRef.current.pop();
    }
  }, [stopsDetails.length]);
  const markerAnimations = markerAnimationsRef.current;

  // Debounced route updater to avoid rapid map re-centering / marker flicker
  const routeUpdateTimerRef = useRef(null);
  const updateRoutePolylineRef = useRef(null);
  const debounceTimeoutRef = useRef({});

  const scheduleUpdateRoutePolyline = (delay = 350) => {
    if (routeUpdateTimerRef.current) {
      clearTimeout(routeUpdateTimerRef.current);
    }
    routeUpdateTimerRef.current = setTimeout(() => {
      try {
        if (updateRoutePolylineRef.current) {
          updateRoutePolylineRef.current();
        }
      } catch (e) {
        console.log('Scheduled route update failed', e);
      }
      routeUpdateTimerRef.current = null;
    }, delay);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (routeUpdateTimerRef.current) {
        clearTimeout(routeUpdateTimerRef.current);
        routeUpdateTimerRef.current = null;
      }
      // Clear any pending debounce timers
      Object.values(debounceTimeoutRef.current || {}).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  useEffect(() => {
    console.log("LocationSelectorScreen mounted with params:", { mode, existingData: !!existingData, returnToSelectVehicle });

    // Only fetch location if not provided from HomeScreen
    if (!currentLocation) {
      getCurrentLocation();
    }
    loadUserData();

    // If coming from SelectVehicleScreen with addLocation mode, handle existing data
    if (mode === "addLocation" && existingData) {
      console.log("Loading existing locations for add mode");
      // Load existing locations from existingData and add a new empty stop
      loadExistingLocationsForAdd();
    }
  }, []);

  // Trigger enhanced map fitting when locations change - Dynamic auto-zoom
  useEffect(() => {
    console.log('🔄 ========== LOCATION CHANGE DETECTED ==========');
    console.log('📍 Pickup location exists:', !!location);
    console.log('📦 Total stops in stopsDetails:', stopsDetails.length);
    console.log('📊 Stops with valid geometry:', stopsDetails.filter(detail => detail?.geometry?.location).length);

    if (location || stopsDetails.some(detail => detail?.geometry?.location)) {
      console.log('✅ At least one location exists - starting auto-zoom process');

      // Small delay to ensure map has rendered and state is updated
      setTimeout(() => {
        const coordinates = [];

        // Add pickup location
        if (location) {
          coordinates.push({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          console.log(`✅ Added pickup: (${location.latitude}, ${location.longitude})`);
        }

        // Add all stops with valid coordinates
        stopsDetails.forEach((details, index) => {
          if (details?.geometry?.location) {
            coordinates.push({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            });
            console.log(`✅ Added stop ${index + 1}: (${details.geometry.location.lat}, ${details.geometry.location.lng})`);
          } else {
            console.log(`⚠️ Stop ${index + 1} has no valid geometry`);
          }
        });

        console.log(`📌 Total coordinates collected: ${coordinates.length}`);

        // Auto-zoom to show entire route when coordinates change
        if (coordinates.length >= 2) {
          console.log(`🎯 CALLING fitMapToShowAllPoints with ${coordinates.length} points`);
          fitMapToShowAllPoints(coordinates);
          console.log(`🎯 Dynamic auto-zoom triggered - showing ${coordinates.length} points (${coordinates.length - 1} drop points)`);

          // Update route polyline to connect all points in sequence
          scheduleUpdateRoutePolyline(350);
          console.log('🛣️ Route polyline update scheduled');
        } else if (coordinates.length === 1) {
          // Just pickup location, center on it
          console.log(`📍 CALLING fitMapToShowAllPoints with 1 point (pickup only)`);
          fitMapToShowAllPoints(coordinates);
          console.log(`📍 Centered on pickup location`);
        } else {
          console.log('❌ No valid coordinates to display on map');
        }
        console.log('🔄 ========== AUTO-ZOOM PROCESS COMPLETE ==========\n');
      }, 400); // Longer delay to ensure all state updates are complete
    } else {
      console.log('❌ No locations available - skipping auto-zoom');
      console.log('🔄 ========== SKIPPED AUTO-ZOOM ==========\n');
    }
  }, [location, stopsDetails]); // This will trigger every time stopsDetails changes

  // Remove blinking animation - keep markers static
  // useEffect(() => {
  //   markerAnimations.forEach((anim) => {
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(anim, {
  //           toValue: 0.2,
  //           duration: 400,
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(anim, {
  //           toValue: 1.2,
  //           duration: 400,
  //           useNativeDriver: true,
  //         }),
  //       ])
  //     ).start();
  //   });
  // }, [markerAnimations.length]);

  // ---------- Get Location ----------
  const getCurrentLocation = async () => {
    // If we already have location from HomeScreen, don't fetch again
    if (currentLocation && currentAddress) {
      setLocation(currentLocation);
      setAddress(currentAddress);
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        // Set a default location so map still works
        setLocation({ latitude: 37.7749, longitude: -122.4194 });
        setAddress("Location permission required");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Faster location fetch
        timeout: 10000, // 10 second timeout
      });
      setLocation(loc.coords);

      // Fetch address in background - don't block the location setting
      setTimeout(async () => {
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });

          const addr = geocode[0];
          const formatted = `${addr.name}, ${addr.street}, ${addr.city}`;
          setAddress(formatted);
        } catch (error) {
          console.log("Geocoding error:", error);
          setAddress(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        }
      }, 100);

    } catch (error) {
      console.log("Location error:", error);
      // Fallback to default location so map still works
      setLocation({ latitude: 37.7749, longitude: -122.4194 });
      setAddress("Location unavailable");
    }
  };

  // ---------- Load User Data ----------
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const userPhoneNumber = await AsyncStorage.getItem("userPhone");
      if (userData) {
        const user = JSON.parse(userData);
        const fullName = user.user
          ? `${user.user.name || ""} ${user.user.lname || ""}`.trim()
          : `${user.name || ""} ${user.lname || ""}`.trim();
        setUserName(fullName || "User");
        setUserPhone(user.user?.phone || user.phone || userPhoneNumber || "");
      } else if (userPhoneNumber) {
        setUserPhone(userPhoneNumber);
        setUserName("User");
      }
    } catch {
      setUserName("User");
      setUserPhone("");
    }
  };

  // ---------- Load Existing Locations For Add Mode (when coming from SelectVehicleScreen) ----------
  const loadExistingLocationsForAdd = () => {
    try {
      if (existingData && existingData.dropLocationData) {
        const data = existingData.dropLocationData;

        // Reconstruct the stops array from existing mid stops and drop location
        const existingStops = [];
        const existingDetails = [];

        // Add mid stops first
        if (data.midStops && Array.isArray(data.midStops)) {
          data.midStops.forEach((stop, index) => {
            if (stop && stop.trim()) {
              existingStops.push(stop);
              // Try to find coordinates for this stop from stopsDetails if available
              const detailsFromData = data.stopsDetails?.[index];
              existingDetails.push(detailsFromData || null);
            }
          });
        }

        // Add the final drop location
        if (data.selectedAddress && data.selectedAddress.trim()) {
          existingStops.push(data.selectedAddress);
          // Add drop location coordinates
          const dropDetails = data.selectedLocation ? {
            formatted_address: data.selectedAddress,
            geometry: {
              location: {
                lat: data.selectedLocation.latitude,
                lng: data.selectedLocation.longitude,
              },
            },
          } : null;
          existingDetails.push(dropDetails);
        }

        // FOR ADD MODE: Always add ONE new empty stop at the end
        existingStops.push("");
        existingDetails.push(null);

        console.log("Loading existing stops for ADD mode:", existingStops);
        console.log("Loading existing details for ADD mode:", existingDetails);

        setStops(existingStops);
        setStopsDetails(existingDetails);
      } else {
        // No existing data, start with one empty stop
        setStops([""]);
        setStopsDetails([null]);
      }
    } catch (error) {
      console.error("Error loading existing locations for add mode:", error);
      // Fallback to default state
      setStops([""]);
      setStopsDetails([null]);
    }
  };

  // ---------- Google Places Autocomplete ----------
  const fetchSuggestions = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    try {
      const resp = await axios.get(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
        {
          params: {
            input,
            key: GOOGLE_API_KEY,
            language: "en",
            components: "country:in" // Restrict to India only
          },
        }
      );
      setSuggestions(resp.data.predictions || []);
    } catch (err) {
      console.log("Suggestion fetch error:", err);
      setSuggestions([]);
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    try {
      const resp = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: { place_id: placeId, key: GOOGLE_API_KEY, language: "en" },
        }
      );
      return resp.data.result;
    } catch {
      return null;
    }
  };

  const fetchPlaceSuggestions = async (text) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setSearchLoading(true);

      const url =
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(text)}` +
        `&key=${GOOGLE_API_KEY}&components=country:in`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.predictions) {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (e) {
      console.log("Autocomplete error:", e);
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };


  // ---------- Stop Handlers (Porter Style) ----------
  const handleStopChange = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
    setActiveInput(`stop-${index}`);
    fetchSuggestions(value);
    fetchPlaceSuggestions(value);
  };

  const handleStopSelect = async (index, item) => {
    const details = await fetchPlaceDetails(item.place_id);

    const initialCoords = details?.geometry?.location
      ? {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      }
      : null;

    // Instead of directly adding, open confirmation modal
    setConfirmModalData({
      address: details?.formatted_address || item.description,
      coordinates: initialCoords,
      stopIndex: index,
      placeDetails: details,
    });

    // Store initial location for reset button
    setInitialConfirmLocation(initialCoords);
    setHasMovedConfirmMap(false);

    // Pre-fill with existing data if editing
    if (stopsDetails[index]?.receiverInfo) {
      const existing = stopsDetails[index].receiverInfo;
      setReceiverName(existing.name || '');
      setReceiverPhone(existing.phone || '');
      setPincode(existing.pincode || '');
      setSelectedTag(existing.tag || '');
    } else {
      // Reset fields for new entry and extract pincode from place details
      setReceiverName('');
      setReceiverPhone('');

      // Extract pincode from address_components
      let extractedPincode = '';
      if (details?.address_components) {
        const postalCodeComponent = details.address_components.find(
          component => component.types.includes('postal_code')
        );
        extractedPincode = postalCodeComponent?.long_name || '';
      }
      setPincode(extractedPincode);
      setSelectedTag('');
    }

    setSuggestions([]);
    setActiveInput(null);
    setShowLocationConfirmModal(true);
  };

  // Helper function to navigate to drop location
  const navigateToDropLocation = (currentStops, currentStopsDetails) => {
    const filledStops = currentStops.filter((stop) => stop.trim().length > 0);

    if (filledStops.length === 0) {
      return;
    }

    // Last filled stop is the final drop
    const finalDropIndex = currentStops.length - 1;
    const finalDropLocation = currentStops[finalDropIndex];

    // All stops before the last one are mid stops
    const midStopsList = currentStops
      .slice(0, -1)
      .filter((stop) => stop.trim().length > 0);

    // Prepare data in the format expected by DropLocationScreen
    const navigationData = {
      // For drop location (last stop)
      selectedAddress: finalDropLocation,
      drop: finalDropLocation,
      selectedLocation: currentStopsDetails[finalDropIndex]?.geometry?.location
        ? {
          latitude: currentStopsDetails[finalDropIndex].geometry.location.lat,
          longitude:
            currentStopsDetails[finalDropIndex].geometry.location.lng,
        }
        : { latitude: 12.9847, longitude: 77.605 },

      // For pickup location
      pickupAddress: address,
      pickup: {
        name: userName,
        phone: userPhone,
        address: address,
      },
      pickupLocation: location
        ? {
          latitude: location.latitude,
          longitude: location.longitude,
        }
        : null,

      // Mid stops data (all stops except the last one)
      midStops: midStopsList,
      finalDrop: finalDropLocation,
      allStops: currentStops,
      stopsDetails: currentStopsDetails,
      vehicleType: vehicleType, // Forward vehicleType to next screen
    };

    console.log("Auto-navigating to Drop-off with data:", navigationData);
    navigation.navigate("Drop-off", navigationData);
  };

  const addStop = () => {
    console.log('➕ ========== ADD STOP CLICKED ==========');
    console.log('   Current stops count:', stops.length);

    if (stops.length < 4) {
      // Max 3 mid stops + 1 final drop = 4 total
      setStops((prev) => [...prev, ""]);
      setStopsDetails((prev) => {
        const updated = [...prev, null];
        console.log('✅ Added new stop - Total stops now:', updated.length);
        console.log('   Valid stops with geometry:', updated.filter(d => d?.geometry?.location).length);
        return updated;
      });
    } else {
      console.log('⚠️ Cannot add stop - limit reached (max 4)');
      Alert.alert("Limit Reached", "Maximum 3 stops + 1 final drop allowed.");
    }
  };

  const removeStop = (index) => {
    console.log(`🗑️ ========== REMOVE STOP ${index} CLICKED ==========`);
    console.log('   Current stops count:', stops.length);

    if (stops.length > 1) {
      // Multiple stops: remove the stop completely
      const newStops = [...stops];
      const newDetails = [...stopsDetails];
      newStops.splice(index, 1);
      newDetails.splice(index, 1);
      setStops(newStops);
      setStopsDetails(newDetails);
      console.log('✅ Removed stop - Total stops now:', newStops.length);
      console.log('   Valid stops with geometry:', newDetails.filter(d => d?.geometry?.location).length);
      // Debounced update to reduce map re-centering flicker
      scheduleUpdateRoutePolyline(350);
    } else {
      // Only one stop: clear it and convert back to empty input field
      const newStops = [...stops];
      const newDetails = [...stopsDetails];
      newStops[index] = ""; // Clear the address text
      newDetails[index] = null; // Clear the location details
      setStops(newStops);
      setStopsDetails(newDetails);
      console.log('✅ Cleared stop - Stop remains but is now empty');
      // Debounced update to reduce map re-centering flicker
      scheduleUpdateRoutePolyline(350);
    }
  };

  // ---------- Swap Pickup and Drop Location ----------
  const swapLocations = () => {
    // Only swap if there's exactly one drop location with receiver info
    if (stops.length !== 1 || !stopsDetails[0]?.receiverInfo) {
      return;
    }

    // Swap address
    const tempAddress = address;
    const newAddress = stops[0];
    setAddress(newAddress);

    const newStops = [tempAddress];
    setStops(newStops);

    // Swap location coordinates
    const tempLocation = location;
    const newLocation = {
      latitude: stopsDetails[0].geometry.location.lat,
      longitude: stopsDetails[0].geometry.location.lng,
    };
    setLocation(newLocation);

    // Swap receiver info
    const tempUserName = userName;
    const tempUserPhone = userPhone;

    const dropReceiverInfo = stopsDetails[0].receiverInfo;
    setUserName(dropReceiverInfo.name);
    setUserPhone(dropReceiverInfo.phone);

    // Update drop location with pickup info
    const newStopsDetails = [{
      ...stopsDetails[0],
      formatted_address: tempAddress,
      geometry: {
        location: {
          lat: tempLocation.latitude,
          lng: tempLocation.longitude,
        },
      },
      receiverInfo: {
        name: tempUserName,
        phone: tempUserPhone,
        pincode: '',
        tag: '',
      },
    }];
    setStopsDetails(newStopsDetails);

    // Update route polyline
    scheduleUpdateRoutePolyline(350);
  };

  // ---------- Enhanced Porter-Style Route Polyline with Google Directions API ----------
  const updateRoutePolyline = async () => {
    const pickup = location || currentLocation;
    if (!pickup) return;

    // ✅ keep only valid stops
    const validStops = stopsDetails.filter(
      s => s?.geometry?.location
    );

    if (validStops.length === 0) {
      setRouteCoordinates([]);
      return;
    }

    try {
      const origin = `${pickup.latitude},${pickup.longitude}`;

      const destination =
        `${validStops[validStops.length - 1].geometry.location.lat},` +
        `${validStops[validStops.length - 1].geometry.location.lng}`;

      const waypointCoords = validStops
        .slice(0, -1)
        .map(
          s =>
            `${s.geometry.location.lat},${s.geometry.location.lng}`
        );

      const waypoints =
        waypointCoords.length > 0
          ? `&waypoints=${waypointCoords.join("|")}`
          : "";

      const url =
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origin}&destination=${destination}` +
        `${waypoints}&mode=driving&key=${GOOGLE_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      console.log("DIRECTIONS STATUS:", data.status);

      if (!data.routes || data.routes.length === 0) {
        Alert.alert("Route Error", "No driving route found.");
        setRouteCoordinates([]);
        return;
      }

      const route = data.routes[0];
      const points = decodePolyline(
        route.overview_polyline.points
      );

      setRouteCoordinates(points);

      // ✅ Fit map to route
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 80, right: 50, bottom: 80, left: 50 },
        animated: true,
      });
    } catch (err) {
      console.error("Directions error:", err);
      Alert.alert("Network Error", "Failed to fetch route.");
      setRouteCoordinates([]);
    }
  };

  useEffect(() => {
    updateRoutePolyline();
  }, [location, currentLocation, stopsDetails]);

  const selectSuggestion = async (item) => {
    try {
      const detailsUrl =
        `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${item.place_id}&fields=geometry,formatted_address,name` +
        `&key=${GOOGLE_API_KEY}`;

      const res = await fetch(detailsUrl);
      const data = await res.json();

      if (!data.result) return;

      const geometry = data.result.geometry;

      const index = parseInt(activeInput.split("-")[1]);

      const newStops = [...stops];
      newStops[index] = data.result.formatted_address;
      setStops(newStops);

      const newDetails = [...stopsDetails];
      newDetails[index] = { geometry };
      setStopsDetails(newDetails);

      setSuggestions([]);
    } catch (e) {
      console.log("Place details error:", e);
    }
  };




  // ensure the scheduler can call the latest implementation
  updateRoutePolylineRef.current = updateRoutePolyline;

  // Force immediate map zoom adjustment - called after adding locations
  const forceMapZoom = () => {
    if (!mapRef.current) return;

    const coords = [];

    // Add pickup location
    if (location) {
      coords.push({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }

    // Add all valid stop coordinates
    stopsDetails.forEach((details) => {
      if (details?.geometry?.location) {
        coords.push({
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        });
      }
    });

    if (coords.length === 0) return;

    if (coords.length === 1) {
      // Single point - zoom to it
      mapRef.current.animateToRegion({
        latitude: coords[0].latitude,
        longitude: coords[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);
    } else {
      // Multiple points - fit all
      const latitudes = coords.map(c => c.latitude);
      const longitudes = coords.map(c => c.longitude);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      const latSpread = maxLat - minLat;
      const lngSpread = maxLng - minLng;

      // Dynamic padding based on number of points
      const paddingFactor = coords.length === 2 ? 3.0 : 2.2;

      let latDelta = Math.max(latSpread * paddingFactor, 0.015);
      let lngDelta = Math.max(lngSpread * paddingFactor, 0.015);

      latDelta = Math.min(latDelta, 0.5);
      lngDelta = Math.min(lngDelta, 0.5);

      console.log(`🎯 Force zoom: ${coords.length} points, Delta: ${latDelta.toFixed(4)}, ${lngDelta.toFixed(4)}`);

      mapRef.current.animateToRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }, 800);
    }
  };

  // Calculate initial region based on all locations to fit them in view with proper tight zoom
  const getInitialRegion = () => {
    const coordinates = [];

    // Add pickup location
    const pickupLocation = location || currentLocation;
    if (pickupLocation) {
      coordinates.push({
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
      });
    }

    // Add all drop locations
    stopsDetails.forEach((details) => {
      if (details?.geometry?.location) {
        coordinates.push({
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        });
      }
    });

    // Default region if no coordinates
    if (coordinates.length === 0) {
      return {
        latitude: location?.latitude || currentLocation?.latitude || 12.9716,
        longitude: location?.longitude || currentLocation?.longitude || 77.5946,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }

    // If only one location, center on it
    if (coordinates.length === 1) {
      return {
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }

    // Calculate bounds for multiple locations
    const latitudes = coordinates.map(c => c.latitude);
    const longitudes = coordinates.map(c => c.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    // Calculate center and deltas
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate deltas with proper padding to show all markers
    const latSpread = maxLat - minLat;
    const lngSpread = maxLng - minLng;

    // Add 50% padding around the markers to ensure they fit nicely
    const latDelta = Math.max(latSpread * 1.5, 0.005); // Minimum zoom
    const lngDelta = Math.max(lngSpread * 1.5, 0.005); // Minimum zoom

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  // Enhanced tight zoom fitting function to show all points properly
  const fitMapToShowAllPoints = (coordinates) => {
    console.log('🗺️ ========== fitMapToShowAllPoints CALLED ==========');
    console.log('📍 Coordinates received:', coordinates.length);
    console.log('🗺️ MapRef exists:', !!mapRef.current);

    if (!mapRef.current) {
      console.log('⚠️ MapRef is null - retrying after delay...');
      // Retry after a short delay as map might be re-rendering
      setTimeout(() => {
        console.log('🔄 Retry attempt - MapRef exists now:', !!mapRef.current);
        if (mapRef.current) {
          console.log('✅ MapRef found on retry - calling function again');
          fitMapToShowAllPoints(coordinates);
        } else {
          console.log('❌ MapRef still null after retry');
          console.log('🗺️ ========== FAILED - NO MAP REF ==========\n');
        }
      }, 500);
      return;
    }

    if (coordinates.length === 0) {
      console.log('❌ No coordinates provided - cannot fit map');
      console.log('🗺️ ========== FAILED - NO COORDINATES ==========\n');
      return;
    }

    if (coordinates.length === 1) {
      console.log('📍 Single coordinate - centering with tight zoom');
      console.log(`   Center: (${coordinates[0].latitude}, ${coordinates[0].longitude})`);
      console.log('   Delta: 0.005 x 0.005');

      // Single point: consistent zoom level
      mapRef.current.animateToRegion({
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
      console.log('✅ Map animation started for single point');
      console.log('🗺️ ========== COMPLETE - SINGLE POINT ==========\n');
    } else {
      console.log(`📊 Multiple coordinates (${coordinates.length}) - calculating bounds`);

      // Multiple points: calculate bounds to show ALL points with tight zoom
      const latitudes = coordinates.map(c => c.latitude);
      const longitudes = coordinates.map(c => c.longitude);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      console.log(`   Lat range: ${minLat.toFixed(6)} to ${maxLat.toFixed(6)}`);
      console.log(`   Lng range: ${minLng.toFixed(6)} to ${maxLng.toFixed(6)}`);

      // Calculate center point
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      // Calculate the spread between points
      const latSpread = maxLat - minLat;
      const lngSpread = maxLng - minLng;

      console.log(`   Spread: lat=${latSpread.toFixed(6)}, lng=${lngSpread.toFixed(6)}`);

      // Add 50% padding around the markers to ensure they fit nicely
      const latDelta = Math.max(latSpread * 1.5, 0.005); // Minimum zoom
      const lngDelta = Math.max(lngSpread * 1.5, 0.005); // Minimum zoom

      console.log(`🗺️ Calculated region:`);
      console.log(`   Center: (${centerLat.toFixed(6)}, ${centerLng.toFixed(6)})`);
      console.log(`   Delta: (${latDelta.toFixed(6)}, ${lngDelta.toFixed(6)})`);

      // Apply the zoom region
      console.log('⏱️ Scheduling map animation in 300ms...');
      setTimeout(() => {
        const region = {
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        };
        console.log('🎬 Calling mapRef.current.animateToRegion NOW');
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 1000);
          console.log('✅ Map animation started for multiple points');
          console.log('🗺️ ========== COMPLETE - MULTIPLE POINTS ==========\n');
        } else {
          console.log('❌ MapRef became null during timeout');
          console.log('🗺️ ========== FAILED - MAP REF NULL IN TIMEOUT ==========\n');
        }
      }, 300);
    }
  };

  // Decode Google's encoded polyline format
  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5,
      });
    }
    return points;
  };


  const StopIndicator = React.memo(({ index, isLast, isFirst, totalStops }) => {
    // Show numbers only when there are multiple drop input fields (not based on filled values)
    const showNumbers = !isFirst && totalStops > 1;

    return (
      <View style={styles.stopDotWrapper}>
        {isFirst ? (
          <Image
            source={require("../assets/pickup.png")}
            style={{
              width: 30,
              height: 30,
            }}
            resizeMode="contain"
          />
        ) : showNumbers ? (
          <View style={styles.stopIndicatorWrapper}>
            <Image
              source={require("../assets/drop.png")}
              style={{
                width: 30,
                height: 30,
              }}
              resizeMode="contain"
            />
            <Text style={styles.stopIndicatorNumber}>{index}</Text>
          </View>
        ) : (
          <Image
            source={require("../assets/drop.png")}
            style={{
              width: 30,
              height: 30,
            }}
            resizeMode="contain"
          />
        )}
        {!isLast && <View style={styles.verticalLine} />}
      </View>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison: only re-render if these specific props change
    return prevProps.index === nextProps.index &&
      prevProps.isLast === nextProps.isLast &&
      prevProps.isFirst === nextProps.isFirst &&
      prevProps.totalStops === nextProps.totalStops;
  });

  // ---------- Continue to Next Screen ----------
  const handleContinue = () => {
    const filledStops = stops.filter((stop) => stop.trim().length > 0);

    if (filledStops.length === 0) {
      Alert.alert("Missing Info", "Please enter at least one stop location.");
      return;
    }

    // Prepare enriched stops data with coordinates
    const enrichedMidStops = [];
    const enrichedStopsDetails = [];

    // Process all stops except the last one as mid stops
    for (let i = 0; i < stops.length - 1; i++) {
      if (stops[i] && stops[i].trim().length > 0) {
        enrichedMidStops.push({
          address: stops[i],
          coordinates: stopsDetails[i]?.geometry?.location ? {
            latitude: stopsDetails[i].geometry.location.lat,
            longitude: stopsDetails[i].geometry.location.lng,
          } : null,
          details: stopsDetails[i],
          // Extract receiver info and pass as receiverDetails for compatibility
          receiverDetails: stopsDetails[i]?.receiverInfo ? {
            receiverName: stopsDetails[i].receiverInfo.name,
            receiverNumber: stopsDetails[i].receiverInfo.phone,
            pincode: stopsDetails[i].receiverInfo.pincode,
            saveAs: stopsDetails[i].receiverInfo.tag,
            landmark: stopsDetails[i].receiverInfo.landmark || '',
          } : null,
        });
        enrichedStopsDetails.push(stopsDetails[i]);
      }
    }

    // Last stop is the final drop location
    const finalDropIndex = stops.length - 1;
    const finalDropLocation = stops[finalDropIndex];
    const finalDropDetails = stopsDetails[finalDropIndex];

    // Prepare data in the format expected by DropLocationScreen
    const navigationData = {
      // For drop location (last stop)
      selectedAddress: finalDropLocation,
      drop: finalDropLocation,
      selectedLocation: finalDropDetails?.geometry?.location
        ? {
          latitude: finalDropDetails.geometry.location.lat,
          longitude: finalDropDetails.geometry.location.lng,
        }
        : { latitude: 12.9847, longitude: 77.605 },

      // Add receiver details for final drop location
      dropDetails: finalDropDetails?.receiverInfo ? {
        receiverName: finalDropDetails.receiverInfo.name,
        receiverNumber: finalDropDetails.receiverInfo.phone,
        pincode: finalDropDetails.receiverInfo.pincode,
        saveAs: finalDropDetails.receiverInfo.tag,
        landmark: finalDropDetails.receiverInfo.landmark || '',
      } : null,

      // For pickup location
      pickupAddress: address,
      pickup: {
        name: userName,
        phone: userPhone,
        address: address,
      },
      pickupLocation: location
        ? {
          latitude: location.latitude,
          longitude: location.longitude,
        }
        : null,

      // Enhanced mid stops data with coordinates
      midStops: enrichedMidStops.map(stop => stop.address), // Keep backward compatibility
      midStopsWithCoords: enrichedMidStops, // New enriched format
      finalDrop: finalDropLocation,
      allStops: stops,
      stopsDetails: stopsDetails,
      vehicleType: vehicleType, // Forward vehicleType to next screen
    };

    // Debug: Log receiver details for verification
    console.log('🔍 RECEIVER DETAILS DEBUG:');
    enrichedMidStops.forEach((stop, idx) => {
      console.log(`  Mid Stop ${idx + 1}:`, {
        address: stop.address,
        receiver: stop.receiverDetails?.receiverName,
        phone: stop.receiverDetails?.receiverNumber,
      });
    });
    console.log('  Final Drop:', {
      address: finalDropLocation,
      receiver: navigationData.dropDetails?.receiverName,
      phone: navigationData.dropDetails?.receiverNumber,
    });

    // If returning to SelectVehicleScreen (from Add Location), go back with updated data
    if (returnToSelectVehicle) {
      try {
        console.log("Returning to SelectVehicle with enhanced data:", navigationData);
        navigation.navigate("SelectVehicle", {
          vehicleType: vehicleType,
          dropLocationData: navigationData,
        });
      } catch (error) {
        console.error("Navigation error:", error);
        navigation.goBack();
      }
    } else {
      // Normal flow - go to SelectVehicle screen with vehicleType
      console.log("Navigating to SelectVehicle with enhanced data and vehicleType:", vehicleType);
      try {
        navigation.navigate("SelectVehicle", {
          vehicleType: vehicleType, // Pass the vehicle type from HomeScreen
          dropLocationData: navigationData,
        });
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAwareWrapper
        enableScrollView={true}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enableOnAndroid={true}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Select on Map Modal */}
          <Modal visible={showMapModal} animationType="slide" transparent={false}>
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
              {/* Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 10,
                paddingBottom: 12,
                paddingHorizontal: 16,
                backgroundColor: '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
                justifyContent: 'space-between',
              }}>
                <TouchableOpacity
                  style={{ padding: 4 }}
                  onPress={() => setShowMapModal(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={{
                  fontWeight: '600',
                  fontSize: 18,
                  color: '#333',
                  textAlign: 'center',
                  flex: 1,
                }}>
                  Select Location on Map
                </Text>
                <View style={{ width: 32 }} />
              </View>

              {/* Map Container */}
              <View style={{ flex: 1, position: 'relative' }}>
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={
                    mapCenter ? {
                      latitude: mapCenter.latitude,
                      longitude: mapCenter.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    } : {
                      latitude: 20.5937,
                      longitude: 78.9629,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }
                  }
                  onRegionChangeComplete={handleMapRegionChange}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                  onMapReady={() => {
                    // Force zoom to current location when map is ready
                    if (mapCenter) {
                      setTimeout(() => {
                        // Ensure consistent zoom level
                        mapRef.current?.animateToRegion({
                          latitude: mapCenter.latitude,
                          longitude: mapCenter.longitude,
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        }, 500);
                      }, 100);
                    }
                  }}
                  ref={(ref) => { mapRef.current = ref; }}
                />

                {/* Fixed Center Pointer (Porter Style) - Positioned to match user location dot */}
                <View style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginLeft: -70,
                  marginTop: -70,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}>
                  <Image
                    source={require("../assets/icons/dropLocationAnimation.gif")}
                    style={{
                      width: 140,
                      height: 140,
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
                      {selectedAddress}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom Buttons */}
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 12,
                gap: 12,
              }}>
                <TouchableOpacity
                  style={[styles.modalBtn, {
                    backgroundColor: '#f5f5f5',
                    flex: 0.4,
                    paddingVertical: 12,
                    borderRadius: 10,
                  }]}
                  onPress={() => setShowMapModal(false)}
                >
                  <Text style={[styles.modalBtnText, { color: '#666', fontSize: 14 }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, {
                    backgroundColor: '#EC4D4A',
                    flex: 0.6,
                    paddingVertical: 12,
                    borderRadius: 10,
                  }]}
                  onPress={handleMapSelectConfirm}
                >
                  <Text style={[styles.modalBtnText, { color: '#fff', fontWeight: 'bold', fontSize: 14 }]} numberOfLines={1}>
                    Confirm Location
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Saved Address Modal */}
          <Modal
            visible={showSavedModal}
            animationType="slide"
            transparent={false}
          >
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
              <Text style={{ fontWeight: "bold", fontSize: 16, margin: 16 }}>
                Saved Addresses
              </Text>
              <ScrollView style={{ flex: 1 }}>
                {savedAddresses.length === 0 && (
                  <Text style={{ margin: 16, color: "#666" }}>
                    No saved addresses found.
                  </Text>
                )}
                {savedAddresses.map((item, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.savedItem}
                    onPress={() => handleSavedSelect(item)}
                  >
                    <Ionicons
                      name="location-sharp"
                      size={20}
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold", color: "#333" }}>
                        {item.label || `Address ${idx + 1}`}
                      </Text>
                      <Text style={{ color: "#666" }}>{item.address}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  margin: 16,
                }}
              >
                <Pressable
                  style={styles.modalBtn}
                  onPress={() => setShowSavedModal(false)}
                >
                  <Text style={styles.modalBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Location Confirmation Modal - Bottom Sheet Style */}
          <Modal
            visible={showLocationConfirmModal}
            animationType="slide"
            transparent={false}
            onRequestClose={() => {
              setShowLocationConfirmModal(false);
              setHasMovedConfirmMap(false);
              setInitialConfirmLocation(null);
            }}
          >
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
              {/* Map Section */}
              <View style={{ height: height * 0.40, position: 'relative' }}>
                <MapView
                  ref={confirmMapRef}
                  style={{ flex: 1 }}
                  initialRegion={
                    confirmModalData.coordinates ? {
                      latitude: confirmModalData.coordinates.latitude,
                      longitude: confirmModalData.coordinates.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    } : {
                      latitude: 20.5937,
                      longitude: 78.9629,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }
                  }
                  onRegionChangeComplete={handleConfirmModalMapChange}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                  onMapReady={() => {
                    // Zoom to the exact location when map is ready
                    if (confirmModalData.coordinates) {
                      setTimeout(() => {
                        confirmMapRef.current?.animateToRegion({
                          latitude: confirmModalData.coordinates.latitude,
                          longitude: confirmModalData.coordinates.longitude,
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        }, 500);
                      }, 300);
                    }
                  }}
                />

                {/* Fixed Center Pointer - Positioned to match user location dot */}
                <View style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginLeft: -70,
                  marginTop: -70,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}>
                  <Image
                    source={require("../assets/icons/dropLocationAnimation.gif")}
                    style={{
                      width: 140,
                      height: 140,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    }}
                    resizeMode="contain"
                  />
                </View>

                {/* Address Display Popup */}
                <View style={{
                  position: 'absolute',
                  top: Platform.OS === 'ios' ? 60 : 40,
                  left: 20,
                  right: 20,
                  backgroundColor: '#333',
                  borderRadius: 8,
                  padding: 12,
                  elevation: 4,
                }}>
                  <Text style={{ color: 'white', fontSize: 13 }} numberOfLines={2}>
                    {confirmModalData.address || 'Your goods will be dropped here'}
                  </Text>
                </View>

                {/* Reset to Initial Location Button - Only show if user has moved the map */}
                {hasMovedConfirmMap && initialConfirmLocation && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 15,
                      width: 32,
                      height: 32,
                      justifyContent: 'center',
                      alignItems: 'center',
                      elevation: 3,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                    }}
                    onPress={() => {
                      if (confirmMapRef.current && initialConfirmLocation) {
                        confirmMapRef.current.animateToRegion({
                          latitude: initialConfirmLocation.latitude,
                          longitude: initialConfirmLocation.longitude,
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        }, 500);

                        // Update the coordinates back to initial
                        setConfirmModalData(prev => ({
                          ...prev,
                          coordinates: initialConfirmLocation,
                        }));
                      }
                    }}
                  >
                    <Ionicons name="locate" size={18} color="#EC4D4A" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Bottom Sheet Section */}
              <ScrollView
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
                contentContainerStyle={{
                  paddingTop: 20,
                  paddingHorizontal: 20,
                  paddingBottom: 10,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Location Info Row */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}>
                  <MaterialIcons name="location-pin" size={24} color="#EC4D4A" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{
                      fontWeight: 'bold',
                      fontSize: 15,
                      color: '#333',
                    }} numberOfLines={2}>
                      {confirmModalData.address}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={async () => {
                    // Set the active stop index before opening map
                    const stopIdx = confirmModalData.stopIndex !== null ? confirmModalData.stopIndex : 0;
                    setActiveStopIndex(stopIdx);

                    // Use existing coordinates or current location
                    const initialCoords = confirmModalData.coordinates || {
                      latitude: location?.latitude || 37.7749,
                      longitude: location?.longitude || -122.4194,
                    };

                    setMapCenter(initialCoords);
                    setMapSelectCoords(initialCoords);
                    setSelectedAddress(confirmModalData.address || "Loading...");

                    // Close confirmation modal and open map modal
                    setShowLocationConfirmModal(false);
                    setTimeout(() => {
                      setShowMapModal(true);
                    }, 300);
                  }}>
                    <Text style={{
                      color: '#EC4D4A',
                      fontWeight: 'bold',
                      fontSize: 14,
                    }}>Change</Text>
                  </TouchableOpacity>
                </View>

                {/* Pincode Field */}
                <TextInput
                  style={{
                    width: '100%',
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 10,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginBottom: 12,
                    fontSize: 14,
                    backgroundColor: '#fff',
                  }}
                  placeholder="Pincode"
                  keyboardType="number-pad"
                  value={pincode}
                  onChangeText={setPincode}
                />

                {/* Receiver Details - One Row */}
                <View style={{
                  flexDirection: 'row',
                  gap: 10,
                  marginBottom: 12,
                }}>
                  <TextInput
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      fontSize: 14,
                      backgroundColor: '#fff',
                    }}
                    placeholder="Receiver's Name *"
                    value={receiverName}
                    onChangeText={setReceiverName}
                    editable={!useMyNumber}
                  />

                  <TextInput
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      fontSize: 14,
                      backgroundColor: '#fff',
                    }}
                    placeholder="Receiver's Phone *"
                    keyboardType="phone-pad"
                    value={receiverPhone}
                    onChangeText={setReceiverPhone}
                    editable={!useMyNumber}
                  />
                </View>

                {/* Use My Number Checkbox */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}>
                  <TouchableOpacity
                    onPress={() => {
                      setUseMyNumber(!useMyNumber);
                      if (!useMyNumber) {
                        setReceiverName(userName);
                        setReceiverPhone(userPhone);
                      } else {
                        setReceiverName('');
                        setReceiverPhone('');
                      }
                    }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: useMyNumber ? '#EC4D4A' : '#999',
                      backgroundColor: useMyNumber ? '#EC4D4A' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}
                  >
                    {useMyNumber && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </TouchableOpacity>
                  <Text style={{
                    fontSize: 13,
                    color: '#666',
                  }}>
                    Use my mobile number: {userPhone}
                  </Text>
                </View>

                {/* Save As Tags */}
                <Text style={{
                  fontSize: 13,
                  marginBottom: 8,
                  color: '#666',
                }}>Save as (optional):</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 0 }}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      borderColor: selectedTag === 'home' ? '#EC4D4A' : '#ccc',
                      borderWidth: 1,
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      marginRight: 10,
                      backgroundColor: selectedTag === 'home' ? '#EC4D4A' : '#fff',
                    }}
                    onPress={() => setSelectedTag(selectedTag === 'home' ? '' : 'home')}
                  >
                    <Ionicons
                      name="home"
                      size={16}
                      color={selectedTag === 'home' ? 'white' : '#EC4D4A'}
                    />
                    <Text style={{
                      color: selectedTag === 'home' ? 'white' : '#333',
                      fontSize: 13,
                      marginLeft: 6,
                    }}> Home</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      borderColor: selectedTag === 'shop' ? '#EC4D4A' : '#ccc',
                      borderWidth: 1,
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      marginRight: 10,
                      backgroundColor: selectedTag === 'shop' ? '#EC4D4A' : '#fff',
                    }}
                    onPress={() => setSelectedTag(selectedTag === 'shop' ? '' : 'shop')}
                  >
                    <MaterialIcons
                      name="store"
                      size={16}
                      color={selectedTag === 'shop' ? 'white' : '#EC4D4A'}
                    />
                    <Text style={{
                      color: selectedTag === 'shop' ? 'white' : '#333',
                      fontSize: 13,
                      marginLeft: 6,
                    }}> Shop</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      borderColor: selectedTag === 'office' ? '#EC4D4A' : '#ccc',
                      borderWidth: 1,
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      marginRight: 10,
                      backgroundColor: selectedTag === 'office' ? '#EC4D4A' : '#fff',
                    }}
                    onPress={() => setSelectedTag(selectedTag === 'office' ? '' : 'office')}
                  >
                    <MaterialIcons
                      name="business"
                      size={16}
                      color={selectedTag === 'office' ? 'white' : '#EC4D4A'}
                    />
                    <Text style={{
                      color: selectedTag === 'office' ? 'white' : '#333',
                      fontSize: 13,
                      marginLeft: 6,
                    }}> Office</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      borderColor: selectedTag === 'other' ? '#EC4D4A' : '#ccc',
                      borderWidth: 1,
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      backgroundColor: selectedTag === 'other' ? '#EC4D4A' : '#fff',
                    }}
                    onPress={() => setSelectedTag(selectedTag === 'other' ? '' : 'other')}
                  >
                    <Ionicons
                      name="heart"
                      size={16}
                      color={selectedTag === 'other' ? 'white' : '#EC4D4A'}
                    />
                    <Text style={{
                      color: selectedTag === 'other' ? 'white' : '#333',
                      fontSize: 13,
                      marginLeft: 6,
                    }}> Other</Text>
                  </TouchableOpacity>
                </ScrollView>
              </ScrollView>

              {/* Fixed Bottom Button - Outside Scroll */}
              <View style={[styles.modalBottomContainer, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 16 : 12 }]}>
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleLocationConfirmAndSave}
                >
                  <Text style={styles.continueText}>Confirm & Proceed</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Header with back button */}
          <HeaderWithBackButton title={mode === "addLocation" ? "Add Location" : "Select Location"} />

          {/* Card */}
          <View style={styles.card}>
            {/* Pickup Location */}
            <View style={styles.locationRow}>
              <StopIndicator
                index={0}
                isLast={false}
                isFirst={true}
                totalStops={totalStops}
              />
              <TouchableOpacity style={{ flex: 1 }}>
                <Text style={styles.label}>
                  {userName}, {userPhone}
                </Text>
                <Text numberOfLines={1} style={styles.address}>
                  {address}
                </Text>
              </TouchableOpacity>

              {/* Edit button for pickup location */}
              <TouchableOpacity
                onPress={() => {
                  // Open confirmation modal with pickup location data
                  setConfirmModalData({
                    address: address,
                    coordinates: location
                      ? {
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }
                      : null,
                    stopIndex: -1, // Use -1 to indicate pickup location
                    placeDetails: {
                      formatted_address: address,
                      geometry: location ? {
                        location: {
                          lat: location.latitude,
                          lng: location.longitude,
                        },
                      } : null,
                    },
                  });

                  // Pre-fill form with pickup data
                  setReceiverName(userName || '');
                  setReceiverPhone(userPhone || '');
                  setPincode('');
                  setSelectedTag('');
                  setUseMyNumber(false);

                  setShowLocationConfirmModal(true);
                }}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="pencil" size={20} color="#999" />
              </TouchableOpacity>

              {/* Swap Button - Show only when there's exactly one drop location with receiver info */}
              {stops.length === 1 && stopsDetails[0]?.receiverInfo && (
                <TouchableOpacity
                  style={styles.swapButton}
                  onPress={swapLocations}
                >
                  <MaterialIcons name="swap-vert" size={18} color="#EC4D4A" />
                </TouchableOpacity>
              )}
            </View>

            {/* All Stops (Porter Style - No separate final drop) */}
            {stops.map((stop, idx) => {
              const isLastStop = idx === stops.length - 1;
              const hasReceiverInfo = stopsDetails[idx]?.receiverInfo;
              const receiverInfo = hasReceiverInfo ? stopsDetails[idx].receiverInfo : null;

              return (
                <View key={idx}>
                  <View style={styles.locationRow}>
                    <StopIndicator
                      index={idx + 1}
                      isLast={isLastStop}
                      isFirst={false}
                      totalStops={totalStops}
                    />
                    <View style={{ flex: 1 }}>
                      {/* If location is added with receiver info, show it like pickup */}
                      {stop && hasReceiverInfo ? (
                        <TouchableOpacity style={{ flex: 1 }}>
                          <Text style={styles.label}>
                            {receiverInfo.name}, {receiverInfo.phone}
                          </Text>
                          <Text numberOfLines={1} style={styles.address}>
                            {stop}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        /* Otherwise show input field */
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <TextInput
                            placeholder={`Input Your Location ${idx + 1}`}
                            style={[styles.textInput, { flex: 1 }]}
                            value={stop}
                            onChangeText={(val) => handleStopChange(idx, val)}
                            onFocus={() => setActiveInput(`stop-${idx}`)}
                          />
                          {/* {activeInput === `stop-${idx}` && suggestions.length > 0 && (
                            <View style={styles.suggestionBox}>
                              {suggestions.map((item) => (
                                <TouchableOpacity
                                  key={item.place_id}
                                  style={styles.suggestionItem}
                                  onPress={() => selectSuggestion(item)}
                                >
                                  <Text>{item.description}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )} */}

                        </View>
                      )}
                    </View>

                    {/* Edit button - only show if location has receiver info */}
                    {stop && hasReceiverInfo && (
                      <TouchableOpacity
                        onPress={() => {
                          // Open confirmation modal with existing data
                          setConfirmModalData({
                            address: stop,
                            coordinates: stopsDetails[idx]?.geometry?.location
                              ? {
                                latitude: stopsDetails[idx].geometry.location.lat,
                                longitude: stopsDetails[idx].geometry.location.lng,
                              }
                              : null,
                            stopIndex: idx,
                            placeDetails: stopsDetails[idx],
                          });

                          // Pre-fill form with existing data
                          setReceiverName(receiverInfo.name || '');
                          setReceiverPhone(receiverInfo.phone || '');
                          setPincode(receiverInfo.pincode || '');
                          setSelectedTag(receiverInfo.tag || '');
                          setUseMyNumber(false);

                          setShowLocationConfirmModal(true);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <Ionicons name="pencil" size={20} color="#999" />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => removeStop(idx)}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close-circle" size={24} color="#999" />
                    </TouchableOpacity>
                  </View>

                  {/* Suggestions Below */}
                  {activeInput === `stop-${idx}` && suggestions.length > 0 && (
                    <View style={{ marginLeft: 32, marginBottom: 8 }}>
                      <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.place_id}
                        style={styles.suggestionList}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => handleStopSelect(idx, item)}
                            style={styles.suggestionItem}
                          >
                            <Ionicons
                              name="location-outline"
                              size={16}
                              color="#666"
                              style={{ marginRight: 8 }}
                            />
                            <Text style={styles.suggestionText} numberOfLines={2}>
                              {item.description}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  )}
                </View>
              );
            })}

            {/* Add Stop Button - Only show if all stops have locations */}
            {(() => {
              // Check if all stops have receiver info (location confirmed)
              const allStopsFilled = stops.every((stop, idx) => {
                return stop && stopsDetails[idx]?.receiverInfo;
              });

              // Only show button if all stops are filled and under the limit
              return allStopsFilled && stops.length < 4;
            })() && (
                <TouchableOpacity style={styles.addStopButton} onPress={addStop}>
                  <Text style={styles.addStopText}>+ ADD STOP</Text>
                </TouchableOpacity>
              )}
          </View>

          {/* Buttons: Select on Map & Saved Address - Show only when input is focused and empty */}

          <View style={styles.topButtonRow}>
            <TouchableOpacity
              style={styles.topButton}
              onPress={() => {
                let idx = null;

                if (activeInput) {
                  idx = parseInt(activeInput.replace('stop-', ''), 10);
                } else {
                  // Auto-select first empty stop
                  idx = stops.findIndex((stop) => !stop || stop.trim() === '');

                  if (idx === -1) {
                    Alert.alert("No Empty Field", "Please add a new stop first.");
                    return;
                  }
                }

                if (!isNaN(idx)) {
                  openMapForStop(idx);
                }
              }}
            >
              <Image
                source={require("../assets/location.png")}
                style={{ width: 22, height: 22, marginRight: 6 }}
                resizeMode="contain"
              />
              <Text style={styles.topButtonText}>Select on Map</Text>
            </TouchableOpacity>
          </View>


          {/* Map with Polyline */}
          <View style={styles.mapCard}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.mapStyle}
              initialRegion={getInitialRegion()}
              showsUserLocation
            >
              {/* ✅ REAL DRIVING ROUTE */}
              {routeCoordinates.length > 0 && (
                <>
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeWidth={8}
                    strokeColor="#FFFFFF"
                  />
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeWidth={4}
                    strokeColor="#EC4D4A"
                  />
                </>
              )}

              {/* ✅ Pickup */}
              {/* ✅ Pickup Marker (Green Icon) */}
              {(location || currentLocation) && (
                <Marker
                  coordinate={location || currentLocation}
                  title="Pickup"
                >
                  <Image
                    source={require("../assets/pickup.png")}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                </Marker>
              )}

              {/* ✅ Drop Markers (Red Icon + Number Badge) */}
              {stopsDetails
                .filter(d => d?.geometry?.location)
                .map((d, i) => (
                  <Marker
                    key={i}
                    coordinate={{
                      latitude: d.geometry.location.lat,
                      longitude: d.geometry.location.lng,
                    }}
                    title={`Drop ${i + 1}`}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Image
                        source={require("../assets/drop.png")}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                      <View
                        style={{
                          position: "absolute",
                          top: 4,
                          backgroundColor: "#EC4D4A",
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                          {i + 1}
                        </Text>
                      </View>
                    </View>
                  </Marker>
                ))}
            </MapView>
          </View>


        </View>
      </KeyboardAwareWrapper>

      {/* Fixed Bottom Continue Button - Outside Scroll */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>
            {returnToSelectVehicle ? "Update Locations" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- styles ---
const styles = StyleSheet.create({
  topButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  topButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    elevation: 1,
  },
  topButtonText: {
    color: "#EC4D4A",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  savedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 0,
    paddingBottom: 90, // Add padding for fixed button
  },
  mapStyle: { flex: 1 },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  mapCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 7,
    paddingHorizontal: 12,
    height: 40,
  },
  label: { fontWeight: "600", fontSize: 14, color: "#333", marginBottom: 2 },
  address: { color: "#666", fontSize: 13 },
  addStopButton: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
  },
  addStopText: {
    color: "#0066FF",
    fontWeight: "bold",
    fontSize: 14,
  },
  stopDotWrapper: { alignItems: "center", width: 24, marginRight: 8 },
  stopDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  greenDot: { backgroundColor: "#4CAF50" },
  redDot: { backgroundColor: "#EC4D4A" },
  stopNumber: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  verticalLine: { width: 2, height: 20, backgroundColor: "#ccc" },
  suggestionList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 15,
    zIndex: 1000,
  },
  modalBottomContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 8 : 15,
  },
  continueBtn: {
    backgroundColor: "#EC4D4A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  continueText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  customMarker: {
    backgroundColor: "#EC4D4A",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerNumber: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  dropMarkerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  dropLocationIcon: {
    width: 40,
    height: 40,
  },
  dropNumberBadge: {
    position: "absolute",
    top: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  dropNumberText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  stopIndicatorWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    position: "relative",
  },
  stopIndicatorNumber: {
    position: "absolute",
    top: 3,
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mapControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  zoomOutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  zoomOutText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EC4D4A',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    marginLeft: 8,
    marginTop: 16,
  },
  suggestionBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    marginTop: 5,
    paddingVertical: 5,
  },
});

export default LocationSelectorScreen;