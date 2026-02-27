import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createRef,
} from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import {
  calculateDistance,
  getCurrentTimeSlot,
} from "../utils/PriceApi";
import {
  calculateDynamicPrice,
} from "../utils/AuthApi";
import { API_URL } from "../utils/api";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GOOGLE_API_KEY } from "../env/googleMapApi";

const { width, height } = Dimensions.get("window");


// Responsive scaling function
const scaleSize = (size) => {
  const scaleFactor = Math.min(width, height) / 375; // 375 is standard iPhone width
  return Math.round(size * scaleFactor);
};

// Locations are now loaded dynamically from route parameters and user data

const SelectVehicleScreen = () => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [locations, setLocations] = useState([]);
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(0);
  const [timeSlot, setTimeSlot] = useState("9 AM - 12 PM");

  // Mid stops state for Porter-style functionality
  const [midStops, setMidStops] = useState([]);
  const [midStopSuggestions, setMidStopSuggestions] = useState([]); // array of arrays
  const [activeInput, setActiveInput] = useState(null); // {type, index}
  const debounceTimeoutRef = useRef([]);
  const midStopInputRefs = useRef([]);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  
  // Extract vehicleType from route params
  const { vehicleType } = route.params || {};

  useEffect(() => {
    loadUserData();
    setTimeSlot(getCurrentTimeSlot());
  }, []);

  useEffect(() => {
    loadLocationData();
  }, [userName, userPhone, route.params]);

  useEffect(() => {
    if (locations.length >= 1) {
      calculateDistanceAndFetchPrices();
    }
  }, [locations]);

  const calculateDistanceAndFetchPrices = async () => {
    try {
      setLoading(true);

      console.log("\n🗺️ ===== MULTI-STOP DISTANCE CALCULATION =====");
      console.log(`📍 Total locations: ${locations.length}`);
      
      // Log all locations with coordinates
      locations.forEach((loc, idx) => {
        console.log(`${idx === 0 ? '🟢' : idx === locations.length - 1 ? '🔴' : '🟡'} Location ${idx + 1}:`, {
          name: loc.name,
          address: loc.address?.substring(0, 30) + '...',
          latitude: loc.latitude,
          longitude: loc.longitude,
          hasCoordinates: !!(loc.latitude && loc.longitude)
        });
      });

      // Calculate total distance from pickup to drop (including mid stops)
      let totalDistance = 0;
      if (locations.length > 1) {
        for (let i = 0; i < locations.length - 1; i++) {
          const loc1 = locations[i];
          const loc2 = locations[i + 1];

          if (
            loc1.latitude &&
            loc1.longitude &&
            loc2.latitude &&
            loc2.longitude
          ) {
            const dist = calculateDistance(
              loc1.latitude,
              loc1.longitude,
              loc2.latitude,
              loc2.longitude
            );
            console.log(`   Segment ${i + 1}: ${loc1.name?.substring(0, 20)} → ${loc2.name?.substring(0, 20)} = ${dist.toFixed(2)} km`);
            totalDistance += dist;
          } else {
            console.warn(`   ⚠️ Segment ${i + 1}: Missing coordinates!`, {
              loc1: { lat: loc1.latitude, lng: loc1.longitude },
              loc2: { lat: loc2.latitude, lng: loc2.longitude }
            });
          }
        }
      }

      console.log(`\n✅ TOTAL CUMULATIVE DISTANCE: ${totalDistance.toFixed(2)} km`);
      console.log("=".repeat(50) + "\n");
      setDistance(totalDistance);

      // Fetch prices from API
      await fetchVehiclesWithPricing(totalDistance);
    } catch (error) {
      console.error("Error calculating distance:", error);
      Alert.alert("Error", "Failed to calculate distance and fetch prices");
      setLoading(false);
    }
  };

  const fetchVehiclesWithPricing = async (calculatedDistance) => {
    try {
      const currentTimeSlot = getCurrentTimeSlot();
      console.log(
        "Fetching dynamic pricing for distance:",
        calculatedDistance.toFixed(2),
        "km"
      );
      console.log("Current time slot:", currentTimeSlot);
      console.log("Vehicle type filter:", vehicleType);
      console.log("🔵 API_URL being used:", API_URL);
      console.log("🔵 Full endpoint:", `${API_URL}/dynamic-pricing/booking/vehicle-types`);

      // Fetch vehicle types using new booking API
      const vehicleTypesResponse = await axios.get(`${API_URL}/dynamic-pricing/booking/vehicle-types`);
      
      if (!vehicleTypesResponse.data.success) {
        throw new Error("Failed to fetch vehicle types");
      }

      const allVehiclesByCategory = vehicleTypesResponse.data.data;
      console.log("Fetched vehicle categories:", Object.keys(allVehiclesByCategory));

      // Get vehicles for the selected category
      let categoryVehicles = [];
      if (vehicleType && allVehiclesByCategory[vehicleType]) {
        categoryVehicles = allVehiclesByCategory[vehicleType];
        console.log(`✅ Found ${categoryVehicles.length} vehicles in category ${vehicleType}:`);
        categoryVehicles.forEach(v => {
          console.log(`  - ${v.name} (${v.displayName}) - Base: ₹${v.baseFare}`);
        });
      } else if (vehicleType) {
        // Fallback: search in all categories for the specific type
        for (const [category, vehicles] of Object.entries(allVehiclesByCategory)) {
          const foundVehicle = vehicles.find(v => v.id === vehicleType);
          if (foundVehicle) {
            categoryVehicles = [foundVehicle];
            console.log(`✅ Found specific vehicle: ${foundVehicle.name} in category ${category}`);
            break;
          }
        }
      } else {
        // No filter: show all vehicles from all categories
        categoryVehicles = Object.values(allVehiclesByCategory).flat();
        console.log(`✅ Showing all ${categoryVehicles.length} vehicles from all categories`);
      }

      // Fetch detailed pricing for each vehicle type
      const vehiclesWithPricing = await Promise.all(
        categoryVehicles.map(async (vehicle) => {
          try {
            // Calculate number of stops for multi-stop pricing
            const numberOfStops = Math.max(0, locations.length - 1);
            
            // Calculate dynamic pricing for this specific vehicle
            const pricingResponse = await calculateDynamicPrice({
              vehicleType: vehicle.id, // Use the full vehicle ID (e.g., "2W-Scooter")
              distance: calculatedDistance,
              numberOfStops: numberOfStops, // Include stop count for multi-stop pricing
              timeSlot: currentTimeSlot,
              pickupLocation: {
                latitude: locations[0]?.latitude,
                longitude: locations[0]?.longitude,
              },
              dropLocation: {
                latitude: locations[locations.length - 1]?.latitude,
                longitude: locations[locations.length - 1]?.longitude,
              },
            });

            console.log(`💰 Pricing request for ${vehicle.name}:`, {
              vehicleType: vehicle.id,
              distance: calculatedDistance,
              numberOfStops: numberOfStops,
              locations: locations.length
            });

            if (pricingResponse.data.success) {
              const pricing = pricingResponse.data.breakdown;
              console.log(`💰 Pricing for ${vehicle.name}:`, {
                base: pricing.baseFare,
                distance: pricing.distanceCharges,
                total: pricing.customerPays,
              });

              // Map vehicle icon based on category
              let vehicleImage = require("../assets/truck1.png");
              if (vehicle.id.startsWith("2W")) {
                vehicleImage = require("../assets/bike3.png");
              } else if (vehicle.id.startsWith("3W")) {
                vehicleImage = require("../assets/Auto1.png");
              } else if (vehicle.id.startsWith("E-LOADER")) {
                vehicleImage = require("../assets/Auto1.png");
              }

              return {
                id: vehicle.id,
                type: vehicle.displayName || vehicle.name, // UI expects 'type'
                name: vehicle.name,
                displayName: vehicle.displayName,
                weight: `${vehicle.capacity?.maxWeight || 0} Kg`, // UI expects 'weight'
                time: `${Math.ceil(calculatedDistance * 3)} mins`, // UI expects 'time'
                price: `₹${pricing.customerPays}`, // UI expects 'price' with ₹ symbol
                image: vehicleImage, // UI expects 'image'
                icon: vehicle.icon,
                capacity: vehicle.capacity,
                baseFare: vehicle.baseFare,
                tag: "DYNAMIC",
                // Multi-stop pricing details
                numberOfStops: numberOfStops,
                stopCharge: pricing.components?.stopCharge || 0,
                // Pricing details
                totalPrice: pricing.customerPays,
                basePrice: pricing.baseFare,
                distanceCharge: pricing.distanceCharges,
                platformFee: pricing.platformFee,
                gst: pricing.gst,
                breakdown: pricing,
                available: true,
              };
            } else {
              console.warn(`Failed to get pricing for ${vehicle.name}`);
              // Map vehicle icon based on category
              let vehicleImage = require("../assets/truck1.png");
              if (vehicle.id.startsWith("2W")) {
                vehicleImage = require("../assets/bike3.png");
              } else if (vehicle.id.startsWith("3W")) {
                vehicleImage = require("../assets/Auto1.png");
              } else if (vehicle.id.startsWith("E-LOADER")) {
                vehicleImage = require("../assets/Auto1.png");
              }

              return {
                id: vehicle.id,
                type: vehicle.displayName || vehicle.name, // UI expects 'type'
                name: vehicle.name,
                displayName: vehicle.displayName,
                weight: `${vehicle.capacity?.maxWeight || 0} Kg`, // UI expects 'weight'
                time: `${Math.ceil(calculatedDistance * 3)} mins`, // UI expects 'time'
                price: `₹${vehicle.baseFare}`, // UI expects 'price' with ₹ symbol
                image: vehicleImage, // UI expects 'image'
                icon: vehicle.icon,
                capacity: vehicle.capacity,
                baseFare: vehicle.baseFare,
                numberOfStops: numberOfStops,
                stopCharge: 0,
                totalPrice: vehicle.baseFare,
                available: false,
              };
            }
          } catch (error) {
            console.error(`Error calculating price for ${vehicle.name}:`, error);
            // Map vehicle icon based on category
            let vehicleImage = require("../assets/truck1.png");
            if (vehicle.id.startsWith("2W")) {
              vehicleImage = require("../assets/bike3.png");
            } else if (vehicle.id.startsWith("3W")) {
              vehicleImage = require("../assets/Auto1.png");
            } else if (vehicle.id.startsWith("E-LOADER")) {
              vehicleImage = require("../assets/Auto1.png");
            }

            return {
              id: vehicle.id,
              type: vehicle.displayName || vehicle.name, // UI expects 'type'
              name: vehicle.name,
              displayName: vehicle.displayName,
              weight: `${vehicle.capacity?.maxWeight || 0} Kg`, // UI expects 'weight'
              time: `${Math.ceil(calculatedDistance * 3)} mins`, // UI expects 'time'
              price: `₹${vehicle.baseFare}`, // UI expects 'price' with ₹ symbol
              image: vehicleImage, // UI expects 'image'
              icon: vehicle.icon,
              capacity: vehicle.capacity,
              baseFare: vehicle.baseFare,
              numberOfStops: numberOfStops,
              stopCharge: 0,
              totalPrice: vehicle.baseFare,
              available: false,
            };
          }
        })
      );

      console.log("Final vehicles with pricing:", vehiclesWithPricing.length);
      setVehicles(vehiclesWithPricing);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vehicles with pricing:", error);
      Alert.alert("Error", "Failed to fetch vehicle options");
      setLoading(false);
    }
  };

 
  const loadLocationData = () => {
    try {
      // Get data from route params (from DropLocationScreen)
      const dropLocationData = route.params?.dropLocationData;

      if (dropLocationData) {
        console.log("Route params data:", dropLocationData);

        const dynamicLocations = [];

        // Add pickup location (first location)
        if (dropLocationData.pickupAddress && dropLocationData.pickupLocation) {
          dynamicLocations.push({
            id: 0,
            name: `${userName || "User"} • ${userPhone}`,
            address: dropLocationData.pickupAddress,
            latitude: dropLocationData.pickupLocation?.latitude || 0,
            longitude: dropLocationData.pickupLocation?.longitude || 0,
            coordinates: dropLocationData.pickupLocation,
            isFirst: true,
          });
        }

        // Add mid stops with enhanced coordinate handling and receiver details
        if (dropLocationData.midStopsWithCoords && Array.isArray(dropLocationData.midStopsWithCoords)) {
          // Use enhanced data with coordinates and receiver details
          dropLocationData.midStopsWithCoords.forEach((midStop, index) => {
            const receiverName = midStop.receiverDetails?.receiverName || `Stop ${index + 1}`;
            const receiverPhone = midStop.receiverDetails?.receiverNumber || '';
            const displayName = receiverPhone ? `${receiverName} • ${receiverPhone}` : receiverName;
            
            dynamicLocations.push({
              id: `midstop-enhanced-${index}-${Date.now()}`,
              name: displayName,
              address: midStop.address,
              latitude: midStop.coordinates?.latitude || 0,
              longitude: midStop.coordinates?.longitude || 0,
              coordinates: midStop.coordinates,
              receiverDetails: midStop.receiverDetails,
            });
          });
        } else if (dropLocationData.midStops && Array.isArray(dropLocationData.midStops)) {
          // Fallback to basic mid stops (backward compatibility)
          dropLocationData.midStops.forEach((midStop, index) => {
            let address = "";
            let latitude = 0;
            let longitude = 0;
            let coordinates = null;
            
            if (typeof midStop === "string" && midStop.trim()) {
              address = midStop;
            } else if (midStop && typeof midStop === "object") {
              address = midStop.address || midStop;
              latitude = midStop.coordinates?.latitude || midStop.latitude || 0;
              longitude = midStop.coordinates?.longitude || midStop.longitude || 0;
              coordinates = midStop.coordinates ||
                (midStop.latitude ? { latitude: midStop.latitude, longitude: midStop.longitude } : null);
            }
            
            // Try to get coordinates from stopsDetails if available
            if ((!latitude || !longitude) && dropLocationData.stopsDetails?.[index]?.geometry?.location) {
              const detailCoords = dropLocationData.stopsDetails[index].geometry.location;
              latitude = detailCoords.lat;
              longitude = detailCoords.lng;
              coordinates = { latitude: detailCoords.lat, longitude: detailCoords.lng };
            }
            
            dynamicLocations.push({
              id: `midstop-${index}-${Date.now()}`,
              name: `Stop ${index + 1}`,
              address,
              latitude,
              longitude,
              coordinates,
            });
          });
        }

        // Add final drop location (last location)
        if (dropLocationData.selectedAddress && dropLocationData.selectedLocation) {
          const finalReceiverName = dropLocationData.dropDetails?.receiverName || "Drop Location";
          const finalReceiverPhone = dropLocationData.dropDetails?.receiverNumber || '';
          const finalDisplayName = finalReceiverPhone ? `${finalReceiverName} • ${finalReceiverPhone}` : finalReceiverName;
          
          dynamicLocations.push({
            id: dynamicLocations.length,
            name: finalDisplayName,
            address: dropLocationData.selectedAddress,
            latitude: dropLocationData.selectedLocation?.latitude || 0,
            longitude: dropLocationData.selectedLocation?.longitude || 0,
            coordinates: dropLocationData.selectedLocation,
            receiverDetails: dropLocationData.dropDetails,
            isLast: true,
          });
        }

        console.log("Enhanced dynamic locations created:", dynamicLocations);
        setLocations(dynamicLocations);
      } else {
        // Fallback to default locations if no route params
        console.log("No route params, using default locations");
        setLocations([
          {
            id: 0,
            name: `${userName || "User"} • ${userPhone}`,
            address: "Police Quarters, RK Hegde Nagar, Bengaluru",
            latitude: 12.9716,
            longitude: 77.5946,
            isFirst: true,
          },
          {
            id: 1,
            name: "Drop Location",
            address: "Please select pickup and drop locations",
            latitude: 12.9716,
            longitude: 77.5946,
            isLast: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading location data:", error);
      // Set default locations on error
      setLocations([
        {
          id: 0,
          name: `${userName || "User"} • ${userPhone}`,
          address: "Location not available",
          isFirst: true,
        },
        {
          id: 1,
          name: "Drop Location",
          address: "Location not available",
          isLast: true,
        },
      ]);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const userPhoneNumber = await AsyncStorage.getItem("userPhone");

      if (userData) {
        const user = JSON.parse(userData);
        setUserName(
          user.name ? `${user.name} ${user.lname || ""}`.trim() : "User"
        );
        setUserPhone(user.phone || userPhoneNumber || "");
      } else if (userPhoneNumber) {
        setUserPhone(userPhoneNumber);
        setUserName("User");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUserName("User");
      setUserPhone("");
    }
  };

  const handleContinue = () => {
    const selectedVehicle = vehicles.find((v) => v.id === selected);
    const numberOfStops = Math.max(0, locations.length - 1);
    const bookingData = {
      ...route.params?.dropLocationData,
      selectedVehicle,
      locations,
      totalPrice: selectedVehicle?.price || "₹0",
      numberOfStops: numberOfStops,
      stopCharge: selectedVehicle?.dynamicPricing?.components?.stopCharge || 0,
      distance: distance,
    };

    navigation.replace("BillingPayment", {
      bookingData,
    });
    console.log(
      "Continue with vehicle:",
      selectedVehicle,
      "Booking data:",
      bookingData
    );
  };

  // Debounced Google Places Autocomplete for mid stops (per input)
  const fetchMidStopSuggestions = useCallback((input, index) => {
    if (debounceTimeoutRef.current[index]) {
      clearTimeout(debounceTimeoutRef.current[index]);
    }
    debounceTimeoutRef.current[index] = setTimeout(async () => {
      if (!input || input.trim().length < 3) {
        setMidStopSuggestions((prev) => {
          const arr = [...prev];
          arr[index] = [];
          return arr;
        });
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
              components: "country:in",
            },
          }
        );
        setMidStopSuggestions((prev) => {
          const arr = [...prev];
          arr[index] = resp.data.predictions || [];
          return arr;
        });
      } catch (err) {
        setMidStopSuggestions((prev) => {
          const arr = [...prev];
          arr[index] = [];
          return arr;
        });
      }
    }, 400);
  }, []);

  // Handle new location input change
  const handleNewLocationChange = (value) => {
    setNewLocationInput(value);
    fetchNewLocationSuggestions(value);
  };

  // Handle new location selection from suggestions
  const handleNewLocationSelect = async (item) => {
    const details = await fetchPlaceDetails(item.place_id);
    const address = details?.formatted_address || item.description;
    
    // Add the new location as a mid stop (before the final drop location)
    const updatedLocations = [...locations];
    const newLocation = {
      id: `newlocation-${Date.now()}`,
      name: `Stop ${locations.length - 1}`, // Number it appropriately
      address: address,
      latitude: details?.geometry?.location?.lat || 0,
      longitude: details?.geometry?.location?.lng || 0,
      coordinates: details?.geometry?.location ? {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      } : null,
    };
    
    // Insert before the last location (which is the drop location)
    updatedLocations.splice(-1, 0, newLocation);
    setLocations(updatedLocations);
    
    // Clear the input and hide it
    setNewLocationInput("");
    setNewLocationSuggestions([]);
    setShowAddLocationInput(false);
    
    // Recalculate distance with new location
    calculateDistanceAndFetchPrices();
  };

  // Toggle add location input
  const toggleAddLocationInput = () => {
    setShowAddLocationInput(!showAddLocationInput);
    if (!showAddLocationInput) {
      setNewLocationInput("");
      setNewLocationSuggestions([]);
    }
  };

  // Handle mid stop input change (debounced fetch, per input)
  const handleMidStopChange = (index, value) => {
    const newStops = [...midStops];
    newStops[index] = value;
    setMidStops(newStops);
    setActiveInput({ type: "midStop", index });
    fetchMidStopSuggestions(value, index);
  };

  // Handle mid stop selection from suggestions
  const handleMidStopSelect = async (index, item) => {
    const details = await fetchPlaceDetails(item.place_id);
    const address = details?.formatted_address || item.description;
    const newStops = [...midStops];
    newStops[index] = address;
    setMidStops(newStops);

    // Update locations array with the new mid stop
    let updatedLocations = [...locations];
    // Remove any previous mid stops (keep only pickup and drop)
    if (updatedLocations.length > 2) {
      updatedLocations = [
        updatedLocations[0],
        updatedLocations[updatedLocations.length - 1],
      ];
    }
    // Add all mid stops from midStops array
    midStops.forEach((stopAddr, i) => {
      const stopObj = {
        id: `midstop-${i}-${Date.now()}`,
        name: stopAddr,
        address: stopAddr,
        latitude: 0,
        longitude: 0,
        coordinates: null,
      };
      updatedLocations.splice(i + 1, 0, stopObj); // Insert after pickup
    });
    setLocations(updatedLocations);

    setMidStopSuggestions((prev) => {
      const arr = [...prev];
      arr[index] = [];
      return arr;
    });
    setActiveInput(null);
  };

  // Add a new mid stop - simple add input field
  const addMidStop = () => {
    if (midStops.length < 3) {
      // Simply add a new empty input field
      setMidStops((prev) => [...prev, ""]);
      setMidStopSuggestions((prev) => [...prev, []]);
    } else {
      Alert.alert("Limit Reached", "Maximum 3 stops allowed.");
    }
  };

  // Remove a mid stop
  const removeMidStop = (index) => {
    const newStops = [...midStops];
    newStops.splice(index, 1);
    setMidStops(newStops);
    setMidStopSuggestions((prev) => {
      const arr = [...prev];
      arr.splice(index, 1);
      return arr;
    });

    // Also remove from locations array
    const updatedLocations = [...locations];
    updatedLocations.splice(index + 1, 1); // +1 because first is pickup
    setLocations(updatedLocations);
  };

  const StopIndicator = ({ index, isFirst, isLast, totalLocations, hasIntermediateStops }) => (
    <View style={styles.stopDotWrapper}>
      {isFirst ? (
        <View style={styles.greenDot} />
      ) : isLast ? (
        <View style={styles.redDropDot}>
          <Text style={styles.stopNumber}>{totalLocations}</Text>
        </View>
      ) : (
        <View style={styles.numberedRedDot}>
          <Text style={styles.stopNumber}>{index}</Text>
        </View>
      )}
      {!isLast && (
        <View style={[
          styles.verticalLine,
          hasIntermediateStops && isFirst ? styles.verticalLineExtended : null
        ]} />
      )}
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <HeaderWithBackButton title="Select Vehicle" />
        {/* Location Card */}
        <View style={styles.locationCard}>
          {locations.length > 0 ? (
            <View style={styles.locationContainer}>
              {/* Helper function to get locations to display */}
              {(() => {
                const allLocations = locations;
                const pickupLocation = allLocations.find(loc => loc.isFirst);
                const dropLocation = allLocations.find(loc => loc.isLast);
                const intermediateStops = allLocations.filter(loc => !loc.isFirst && !loc.isLast);
                
                // Determine which locations to show
                let locationsToShow;
                if (isLocationExpanded) {
                  locationsToShow = allLocations;
                } else {
                  locationsToShow = [pickupLocation, dropLocation].filter(Boolean);
                }
                
                return (
                  <>
                    {locationsToShow.map((location, index) => {
                      const isFirst = location.isFirst;
                      const isLast = location.isLast;
                      const originalIndex = allLocations.findIndex(loc => loc.id === location.id);
                      const isLastInDisplayedArray = index === locationsToShow.length - 1;
                      
                      return (
                        <View key={location.id || originalIndex} style={styles.routeItemContainer}>
                          <View style={styles.routeIndicatorContainer}>
                            {/* Stop indicator dot (BookingSearchingScreen style) */}
                            <View style={styles.stopDotWrapper}>
                              <View style={[
                                styles.stopDot, 
                                isFirst ? styles.greenDot : styles.redDot
                              ]}>
                                {!isFirst && <Text style={styles.stopNumber}>{originalIndex}</Text>}
                                {isFirst && <Ionicons name="location" size={12} color="#fff" />}
                              </View>
                              {!isLastInDisplayedArray && <View style={styles.verticalLine} />}
                            </View>
                            
                            {/* Location text */}
                            <View style={styles.locationTextContainer}>
                              <Text style={styles.locationLabel}>
                                {isFirst ? "Pickup" : isLast ? "Drop" : `Stop ${originalIndex}`}
                              </Text>
                              <Text 
                                style={styles.locationAddress} 
                                numberOfLines={2}
                              >
                                {location.address || `Location ${originalIndex + 1}`}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    
                    {/* Show intermediate stops info and expand/collapse button */}
                    {intermediateStops.length > 0 && (
                      <View style={styles.expandCollapseContainer}>
                        {!isLocationExpanded && (
                          <View style={styles.hiddenStopsInfo}>
                            <Text style={styles.hiddenStopsText}>
                              +{intermediateStops.length} more stop{intermediateStops.length > 1 ? 's' : ''}
                            </Text>
                          </View>
                        )}
                        
                        <TouchableOpacity 
                          style={styles.expandButton}
                          onPress={() => setIsLocationExpanded(!isLocationExpanded)}
                        >
                          <Text style={styles.expandButtonText}>
                            {isLocationExpanded ? 'Show Less' : 'View Details'}
                          </Text>
                          <Ionicons 
                            name={isLocationExpanded ? "chevron-up" : "chevron-down"} 
                            size={14} 
                            color="#EC4D4A" 
                            style={styles.expandIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                );
              })()}
            </View>
          ) : (
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <StopIndicator index={0} isFirst={true} isLast={false} totalLocations={1} hasIntermediateStops={false} />
                <View style={styles.locationText}>
                  <Text style={styles.name}>Loading locations...</Text>
                  <Text numberOfLines={1} style={styles.address}>
                    Please wait
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Bottom Action Buttons */}
          <View style={styles.bottomActionButtons}>
            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={() => {
                try {
                  // Check if already at the 4 drop location limit
                  const dropLocationCount = locations.length - 1; // Subtract 1 for pickup location
                  
                  if (dropLocationCount >= 4) {
                    Alert.alert(
                      "Drop Points Limit Reached",
                      "You have already reached the maximum limit of 4 drop points.",
                      [{ text: "OK" }]
                    );
                    return;
                  }
                  
                  // Navigate directly to LocationSelectorScreen for adding locations
                  navigation.navigate("LocationSelectorScreen", {
                    vehicleType: vehicleType,
                    currentLocation: locations[0]?.coordinates || locations[0],
                    currentAddress: locations[0]?.address,
                    mode: "addLocation",
                    existingData: route.params,
                    returnToSelectVehicle: true
                  });
                } catch (error) {
                  console.error("Navigation error:", error);
                }
              }}
            >
              <Ionicons
                name="add"
                size={scaleSize(18)}
                color="#007AFF"
              />
              <Text style={styles.addLocationTextNew}>Add Location</Text>
            </TouchableOpacity>
            
            <View style={styles.buttonDivider} />
            
            <TouchableOpacity
              style={styles.editLocationButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="pencil-outline"
                size={scaleSize(18)}
                color="#007AFF"
              />
              <Text style={styles.editLocationTextNew}>Edit Locations</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicles */}
        <ScrollView contentContainerStyle={styles.vehicleList}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Vehicles</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EC4D4A" />
              <Text style={styles.loadingText}>
                Loading vehicles and pricing...
              </Text>
            </View>
          ) : vehicles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No vehicles available</Text>
              <Text style={styles.emptySubText}>Please try again later</Text>
            </View>
          ) : (
            vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                activeOpacity={0.8}
                style={[
                  styles.vehicleCard,
                  selected === vehicle.id && styles.vehicleCardSelected,
                ]}
                onPress={() => setSelected(vehicle.id)}
              >
                <View style={styles.vehicleRow}>
                  {vehicle.image ? (
                    <Image
                      source={vehicle.image}
                      style={[
                        styles.vehicleImage,
                        selected === vehicle.id && styles.vehicleImageSelected,
                      ]}
                    />
                  ) : (
                    <Ionicons
                      name={vehicle.iconName || "car-outline"}
                      size={40}
                      color={selected === vehicle.id ? "#EC4D4A" : "#666"}
                      style={[
                        styles.vehicleImage,
                        selected === vehicle.id && styles.vehicleImageSelected,
                      ]}
                    />
                  )}
                  <View style={styles.vehicleTextContainer}>
                    <Text style={styles.vehicleType}>{vehicle.type}</Text>
                    <Text style={styles.meta}>
                      <MaterialIcons
                        name="local-shipping"
                        size={scaleSize(14)}
                        color="#666"
                      />{" "}
                      {vehicle.weight} •{" "}
                      <MaterialIcons
                        name="access-time"
                        size={scaleSize(14)}
                        color="#666"
                      />{" "}
                      {vehicle.time}
                    </Text>
                    {vehicle.kmRange && (
                      <Text style={styles.kmRangeText}>
                        {/* Range: {vehicle.kmRange} km */}
                      </Text>
                    )}
                    {vehicle.offer && (
                      <View style={styles.offerBadge}>
                        <Text style={styles.offerText}>
                          SAVE ₹
                          {parseInt(vehicle.originalPrice.replace("₹", "")) -
                            parseInt(vehicle.price.replace("₹", ""))}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{vehicle.price}</Text>
                    {vehicle.originalPrice && (
                      <Text style={styles.strike}>{vehicle.originalPrice}</Text>
                    )}
                    {vehicle.tag && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{vehicle.tag}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Bottom Proceed Button */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + scaleSize(16) }]}>
          <View style={styles.priceSummary}>
            <Text style={styles.summaryText}>Total</Text>
            <Text style={styles.totalPrice}>
              {selected ? vehicles.find((v) => v.id === selected)?.price : "₹0"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.proceedBtn}
            disabled={!selected}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={["#EC4D4A", "#FF0000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.proceedText}>
                {selected
                  ? `Proceed With ${
                      vehicles.find((v) => v.id === selected)?.type
                    }`
                  : "Select a Vehicle"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stopsButtonRowCustom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stopsButtonLineCustom: {
    width: scaleSize(18),
    height: scaleSize(2),
    backgroundColor: "#e0e0e0",
    marginHorizontal: scaleSize(4),
  },
  stopsButtonPill: {
    backgroundColor: "#FFF0F0",
    borderRadius: scaleSize(16),
    paddingVertical: scaleSize(4),
    paddingHorizontal: scaleSize(16),
    alignItems: "center",
    justifyContent: "center",
    elevation: 0,
    marginHorizontal: scaleSize(2),
    borderWidth: 1,
    borderColor: "#FFD6D6",
  },
  stopsButtonPillText: {
    color: "#EC4D4A",
    fontWeight: "bold",
    fontSize: scaleSize(13),
    letterSpacing: 1,
  },
  stopsButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: scaleSize(4),
  },
  stopsButtonLine: {
    width: scaleSize(18),
    height: scaleSize(2),
    backgroundColor: "#e0e0e0",
    marginHorizontal: scaleSize(4),
  },
  stopsButton: {
    backgroundColor: "#EC4D4A",
    borderRadius: scaleSize(16),
    paddingVertical: scaleSize(4),
    paddingHorizontal: scaleSize(18),
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    marginHorizontal: scaleSize(2),
  },
  stopsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scaleSize(13),
    letterSpacing: 1,
  },
  midStopsRedButtonCenter: {
    backgroundColor: "#EC4D4A",
    borderRadius: scaleSize(32),
    width: scaleSize(64),
    height: scaleSize(64),
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    marginBottom: scaleSize(2),
    shadowColor: "#EC4D4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  midStopsRedButtonTextCenter: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scaleSize(24),
    textAlign: "center",
    marginBottom: scaleSize(2),
  },
  midStopsRedButtonLabel: {
    color: "#fff",
    fontSize: scaleSize(13),
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 1,
  },
  midStopsRedButton: {
    backgroundColor: "#EC4D4A",
    borderRadius: scaleSize(18),
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(24),
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    marginBottom: scaleSize(2),
  },
  midStopsRedButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scaleSize(15),
    letterSpacing: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scaleSize(10),
    paddingTop: scaleSize(10),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  title: {
    fontSize: scaleSize(18),
    fontWeight: "bold",
    color: "#333",
  },
  locationCard: {
    margin: scaleSize(12),
    marginBottom: scaleSize(6),
    borderRadius: scaleSize(16),
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(6),
    elevation: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  // BookingSearchingScreen-style route visual indicators
  routeItemContainer: {
    marginBottom: 2,
  },
  routeIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stopDotWrapper: {
    alignItems: 'center',
    marginRight: 10,
    minHeight: 40,
  },
  stopDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  greenDot: {
    backgroundColor: '#4CAF50',
  },
  redDot: {
    backgroundColor: '#EC4D4A',
  },
  numberedRedDot: {
    width: scaleSize(18),
    height: scaleSize(18),
    borderRadius: scaleSize(9),
    backgroundColor: "#EC4D4A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleSize(0),
  },
  redDropDot: {
    width: scaleSize(18),
    height: scaleSize(18),
    borderRadius: scaleSize(9),
    backgroundColor: "#EC4D4A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleSize(4),
  },
  stopNumber: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verticalLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginTop: 3,
  },
  verticalLineExtended: {
    height: scaleSize(40), // Reduced spacing between starting location and stops
  },
  locationContainer: {
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(12),
    paddingBottom: scaleSize(12),
  },
  locationTextContainer: {
    flex: 1,
    paddingTop: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 1,
  },
  locationAddress: {
    fontSize: 13,
    color: '#333',
    lineHeight: 16,
  },
  locationText: {
    flex: 1,
    paddingTop: scaleSize(2),
  },
  name: {
    fontWeight: "600",
    fontSize: scaleSize(14),
    color: "#333",
    marginBottom: scaleSize(2),
  },
  address: {
    fontSize: scaleSize(13),
    color: "#666",
    lineHeight: scaleSize(18),
  },
  // Expand/Collapse styles (from BookingSearchingScreen)
  expandCollapseContainer: {
    marginTop: 6,
    alignItems: 'center',
  },
  hiddenStopsInfo: {
    marginBottom: 6,
  },
  hiddenStopsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EC4D4A',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expandButtonText: {
    fontSize: 12,
    color: '#EC4D4A',
    fontWeight: '600',
    marginRight: 3,
  },
  expandIcon: {
    marginLeft: 1,
  },
  midStopInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleSize(16),
    paddingHorizontal: scaleSize(12),
  },
  addStopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(20),
    marginTop: scaleSize(12),
    borderRadius: scaleSize(8),
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  addStopText: {
    fontSize: scaleSize(14),
    fontWeight: "bold",
    color: "#0066ff",
    marginLeft: scaleSize(8),
  },
  editLocationButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: scaleSize(8),
  },
  editLocationText: {
    fontSize: scaleSize(14),
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: scaleSize(8),
  },
  bottomActionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(12),
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FAFAFA",
  },
  addStopButtonNew: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    flex: 1,
    justifyContent: "center",
  },
  addStopTextNew: {
    fontSize: scaleSize(14),
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: scaleSize(6),
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    flex: 1,
    justifyContent: "center",
  },
  addLocationTextNew: {
    fontSize: scaleSize(14),
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: scaleSize(6),
  },
  buttonDivider: {
    width: 1,
    height: scaleSize(30),
    backgroundColor: "#E5E5E5",
    marginHorizontal: scaleSize(10),
  },
  editLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    flex: 1,
    justifyContent: "center",
  },
  editLocationTextNew: {
    fontSize: scaleSize(14),
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: scaleSize(6),
  },
  stopInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    height: scaleSize(48),
    fontSize: scaleSize(14),
    color: "#333",
    backgroundColor: "#fff",
  },
  removeButton: {
    marginLeft: scaleSize(8),
    padding: scaleSize(4),
  },
  suggestionList: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(8),
    marginTop: scaleSize(4),
    marginHorizontal: scaleSize(12),
    marginBottom: scaleSize(12),
    maxHeight: scaleSize(200),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: scaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    flex: 1,
    fontSize: scaleSize(13),
    color: "#333",
    lineHeight: scaleSize(18),
  },
  vehicleList: {
    padding: scaleSize(16),
    paddingBottom: scaleSize(120),
  },
  sectionHeader: {
    marginBottom: scaleSize(16),
  },
  sectionTitle: {
    fontSize: scaleSize(16),
    fontWeight: "bold",
    color: "#333",
    marginBottom: scaleSize(4),
  },
  distanceInfo: {
    fontSize: scaleSize(12),
    color: "#666",
    fontStyle: "italic",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scaleSize(60),
  },
  loadingText: {
    marginTop: scaleSize(16),
    fontSize: scaleSize(14),
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scaleSize(60),
  },
  emptyText: {
    marginTop: scaleSize(16),
    fontSize: scaleSize(16),
    fontWeight: "600",
    color: "#333",
  },
  emptySubText: {
    marginTop: scaleSize(8),
    fontSize: scaleSize(14),
    color: "#666",
  },
  kmRangeText: {
    fontSize: scaleSize(11),
    color: "#888",
    marginTop: scaleSize(2),
  },
  vehicleCard: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    marginBottom: scaleSize(12),
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  vehicleCardSelected: {
    borderWidth: scaleSize(2),
    borderColor: "#EC4D4A",
    backgroundColor: "#FFF5F5",
    shadowColor: "#FF3C3C",
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleImage: {
    width: scaleSize(60),
    height: scaleSize(40),
    resizeMode: "contain",
    marginRight: scaleSize(16),
  },
  vehicleImageSelected: {
    width: scaleSize(70),
    height: scaleSize(50),
  },
  vehicleTextContainer: {
    flex: 1,
  },
  vehicleType: {
    fontSize: scaleSize(16),
    fontWeight: "bold",
    color: "#333",
    marginBottom: scaleSize(4),
  },
  meta: {
    fontSize: scaleSize(13),
    color: "#666",
    marginBottom: scaleSize(6),
  },
  offerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFEB3B",
    paddingHorizontal: scaleSize(6),
    paddingVertical: scaleSize(2),
    borderRadius: scaleSize(4),
    marginTop: scaleSize(4),
  },
  offerText: {
    fontSize: scaleSize(10),
    fontWeight: "bold",
    color: "#FF6F00",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: scaleSize(16),
    fontWeight: "bold",
    color: "#333",
  },
  strike: {
    textDecorationLine: "line-through",
    color: "#999",
    fontSize: scaleSize(12),
    marginTop: scaleSize(2),
  },
  tag: {
    backgroundColor: "#FF6F00",
    paddingHorizontal: scaleSize(6),
    paddingVertical: scaleSize(2),
    borderRadius: scaleSize(4),
    marginTop: scaleSize(6),
  },
  tagText: {
    color: "#fff",
    fontSize: scaleSize(10),
    fontWeight: "bold",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scaleSize(-2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 15,
    zIndex: 1000,
  },
  priceSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scaleSize(12),
  },
  summaryText: {
    fontSize: scaleSize(16),
    color: "#666",
  },
  totalPrice: {
    fontSize: scaleSize(18),
    fontWeight: "bold",
    color: "#333",
  },
  proceedBtn: {
    borderRadius: scaleSize(12),
    overflow: "hidden",
  },
  gradientBtn: {
    paddingVertical: scaleSize(16),
    alignItems: "center",
  },
  proceedText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scaleSize(16),
  },
});

export default SelectVehicleScreen;
