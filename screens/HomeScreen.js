import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  FlatList,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getCurrentLocation } from "../utils/MapScreenApi";
import { getUserBookings } from "../utils/AuthApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import axios from "axios"; // For reverse geocoding
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
const { width, height } = Dimensions.get("window");

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const GOOGLE_API_KEY = "AIzaSyDboH1OPn2tZixD8iFGiH9EJPvzsd4CL2Q";

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Fetching location...");
  const [currentLocation, setCurrentLocation] = useState(null); // Store location coordinates
  const [activeBooking, setActiveBooking] = useState(null);
  const [showBookingBanner, setShowBookingBanner] = useState(false);
  const insets = useSafeAreaInsets();

  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        // Add timeout for location operations
        const locationTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), 10000)
        );

        const locationPromise = getCurrentLocation();

        const loc = await Promise.race([locationPromise, locationTimeout]);
        setCurrentLocation(loc.coords); // Store the coordinates

        // Reverse geocode to get address with timeout
        try {
          const geocodeTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Geocoding timeout')), 8000)
          );

          const geocodePromise = Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });

          const [address] = await Promise.race([geocodePromise, geocodeTimeout]);

          if (address && (address.name || address.street || address.city)) {
            // Build address parts array and filter out empty values
            const parts = [];

            // Area / locality (main thing Porter shows)
            if (address.district) parts.push(address.district);
            else if (address.subregion) parts.push(address.subregion);
            else if (address.city) parts.push(address.city);

            // State
            if (address.region) parts.push(address.region);

            // Pincode
            if (address.postalCode) parts.push(address.postalCode);

            // Country
            if (address.country) parts.push(address.country);

            const area =
              address.district ||
              address.city ||
              address.subregion ||
              address.region;

            const formatted = `${area}, ${address.region || ""} ${address.postalCode || ""}, ${address.country || ""}`;
            setCurrentAddress(formatted.replace(/\s+,/g, ","));

            if (formatted) {
              setCurrentAddress(formatted);
            } else {
              setCurrentAddress("Location selected");
            }
            if (formatted) {
              setCurrentAddress(formatted);
            } else {
              throw new Error("Incomplete address data");
            }
          } else {
            throw new Error("Incomplete address data");
          }
        } catch (geocodeError) {
          console.log("Expo geocoding failed, trying Google API:", geocodeError);
          // Fallback to Google Geocoding API (works better on Android)
          try {
            const googleTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Google API timeout')), 8000)
            );

            const googlePromise = axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.coords.latitude},${loc.coords.longitude}&key=${GOOGLE_API_KEY}`
            );

            const response = await Promise.race([googlePromise, googleTimeout]);

            if (response.data.results && response.data.results.length > 0) {
              setCurrentAddress(response.data.results[0].formatted_address);
            } else {
              setCurrentAddress("Location found, but address unavailable");
            }
          } catch (googleError) {
            console.log("Google geocoding also failed:", googleError);
            setCurrentAddress("Location found, but address unavailable");
          }
        }
      } catch (e) {
        console.log("Location error in HomeScreen:", e);
        // Don't set location or address - let LocationSelectorScreen handle it
        setCurrentLocation(null);
        setCurrentAddress("Location unavailable");
      }

      // Load user data from AsyncStorage with timeout
      try {
        const storageTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AsyncStorage timeout')), 5000)
        );

        const userDataPromise = AsyncStorage.getItem("userData");  // Fixed: use "userData" key
        const userData = await Promise.race([userDataPromise, storageTimeout]);

        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.log("AsyncStorage error:", e);
        setUser(null);
      }
    })();
  }, []);

  // Function to fetch active bookings
  const fetchActiveBooking = async () => {
    try {
      console.log("🔍 Fetching active bookings...");

      // Add timeout for AsyncStorage operations
      const storageTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Storage timeout')), 5000)
      );

      const userDataPromise = AsyncStorage.getItem("userData");  // Fixed: use "userData" key
      const tokenPromise = AsyncStorage.getItem("token");
      const userIdPromise = AsyncStorage.getItem("userId");

      const [userData, token, userId] = await Promise.race([
        Promise.all([userDataPromise, tokenPromise, userIdPromise]),
        storageTimeout
      ]);

      console.log("📱 Storage data:", {
        hasUserData: !!userData,
        hasToken: !!token,
        hasUserId: !!userId
      });

      if ((userData && token) || (token && userId)) {
        const parsedUser = userData ? JSON.parse(userData) : null;
        const userIdToUse = parsedUser?._id || userId;

        console.log("👤 Using userId:", userIdToUse);

        // Add timeout for API call
        const apiTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), 10000)
        );

        const apiPromise = getUserBookings(userIdToUse, token);
        const response = await Promise.race([apiPromise, apiTimeout]);

        console.log("📋 All bookings response:", {
          success: !!response.data,
          bookingsCount: response.data?.bookings?.length || 0,
          bookings: response.data?.bookings || []
        });

        if (response.data && response.data.bookings) {
          // Log all booking statuses for debugging
          response.data.bookings.forEach((booking, index) => {
            console.log(`📦 Booking ${index + 1}:`, {
              id: booking._id || booking.id,
              status: booking.status,
              bookingId: booking.bookingId
            });
          });

          // Find active booking (ongoing orders)
          const activeOrder = response.data.bookings.find(booking => {
            const status = booking.status?.toLowerCase();
            const isActive = ["pending", "confirmed", "accepted", "driver_assigned", "in_progress", "picked_up"].includes(status);
            console.log(`🔄 Checking booking ${booking._id}: status="${status}", isActive=${isActive}`);
            return isActive;
          });

          if (activeOrder) {
            console.log("✅ Found active booking:", activeOrder);
            setActiveBooking(activeOrder);
            setShowBookingBanner(true);
          } else {
            console.log("❌ No active bookings found");
            setActiveBooking(null);
            setShowBookingBanner(false);
          }
        } else {
          console.log("❌ No bookings data in response");
          setActiveBooking(null);
          setShowBookingBanner(false);
        }
      } else {
        console.log("❌ Missing authentication data");
      }
    } catch (error) {
      console.error("❌ Error fetching active booking:", error);
      console.error("Error details:", error.response?.data || error.message);
      setActiveBooking(null);
      setShowBookingBanner(false);
    }
  };

  // Check for active bookings when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchActiveBooking();
    }, [])
  );

  // Handle active booking banner press
  const handleActiveBookingPress = () => {
    if (!activeBooking) return;

    const status = activeBooking.status?.toLowerCase();
    const isAcceptedByRider = ["accepted", "driver_assigned", "in_progress", "picked_up"].includes(status);

    if (isAcceptedByRider) {
      // Navigate to booking details screen when rider has accepted
      navigation.navigate("BookingDetail", {
        bookingId: activeBooking._id || activeBooking.id,
        booking: activeBooking,
        fromHomeScreen: true
      });
    } else if (["pending", "confirmed"].includes(status)) {
      // Navigate to searching screen when still looking for rider
      navigation.navigate("WaitingDriver", {
        bookingData: activeBooking,
        bookingId: activeBooking._id || activeBooking.id,
        fromHomeScreen: true
      });
    }
  };

  // Get status display text and color
  const getBookingStatusInfo = () => {
    if (!activeBooking) return null;

    const status = activeBooking.status?.toLowerCase();

    switch (status) {
      case "pending":
      case "confirmed":
        return {
          text: "🔍 Searching for nearby riders...",
          subText: "We're finding the best rider for you",
          color: "#FF9800",
          bgColor: "#FFF3E0"
        };
      case "accepted":
        return {
          text: "✅ Order accepted - Preparing for pickup",
          subText: "Your order has been accepted by a rider",
          color: "#4CAF50",
          bgColor: "#E8F5E8"
        };
      case "driver_assigned":
        return {
          text: "🚗 Rider assigned - On the way",
          subText: "Your rider is coming to pickup location",
          color: "#2196F3",
          bgColor: "#E3F2FD"
        };
      case "in_progress":
        return {
          text: "🚀 Trip in progress",
          subText: "Your order is being delivered",
          color: "#9C27B0",
          bgColor: "#F3E5F5"
        };
      case "picked_up":
        return {
          text: "📦 Items picked up",
          subText: "On the way to destination",
          color: "#4CAF50",
          bgColor: "#E8F5E8"
        };
      default:
        return {
          text: "📋 Active booking",
          subText: "Tap to check status",
          color: "#666",
          bgColor: "#F5F5F5"
        };
    }
  };

  // Active booking banner component
  const renderActiveBookingBanner = () => {
    // Debug: Show test banner when no active booking
    if (!showBookingBanner || !activeBooking) {
      // Uncomment below to show test banner for UI verification
      /*
      return (
        <TouchableOpacity 
          style={styles.activeBookingBanner}
          onPress={() => console.log("Test banner clicked")}
          activeOpacity={0.9}
        >
          <View style={styles.bannerGradient}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerMainText}>
                🧪 Test Banner - No Active Orders
              </Text>
              <Text style={styles.bannerSubText}>
                This is a test banner to verify UI rendering
              </Text>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderIdText}>
                  Test #123456
                </Text>
                <View style={styles.tapHintContainer}>
                  <Text style={styles.tapHintText}>Test Mode</Text>
                  <Ionicons name="bug" size={16} color="#EC4D4A" />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
      */
      return null;
    }

    const statusInfo = getBookingStatusInfo();
    if (!statusInfo) return null;

    return (
      <TouchableOpacity
        style={styles.activeBookingBanner}
        onPress={handleActiveBookingPress}
        activeOpacity={0.9}
      >
        <View style={styles.bannerGradient}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerMainText}>
              {statusInfo.text}
            </Text>
            <Text style={styles.bannerSubText}>
              {statusInfo.subText}
            </Text>
            <View style={styles.orderInfoRow}>
              <Text style={styles.orderIdText}>
                Order #{activeBooking.bookingId || activeBooking._id?.slice(-6)}
              </Text>
              <View style={styles.tapHintContainer}>
                <Text style={styles.tapHintText}>Tap to track</Text>
                <Ionicons name="chevron-forward" size={16} color="#EC4D4A" />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Carousel data
  const carouselData = [
    { id: "1", image: require("../assets/newimage1.jpg") },
    { id: "2", image: require("../assets/newimage2.jpg") },
    { id: "3", image: require("../assets/newimage3.jpg") },
    { id: "4", image: require("../assets/newimage4.jpg") },
  ];

  // Vehicle cards data
  const vehicleCards = [
    {
      id: "1",
      title: "2 Wheeler",
      image: require("../assets/bike3.png"),
      available: true,
    },
    {
      id: "2",
      title: "3 Wheeler",
      image: require("../assets/Auto1.png"),
      available: true,
    },
    {
      id: "3",
      title: "Truck",
      image: require("../assets/truck1.png"),
      available: true,
    },
    {
      id: "4",
      title: "E-loader",
      image: require("../assets/E-riksha.png"),
      available: true, // Now available since we have it in backend
    },
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselData.length;
      carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleCardPress = (title, available) => {
    if (!available) return;

    setSelectedCard(title);

    // Map display names to backend category codes
    const categoryMapping = {
      "2 Wheeler": "2W",
      "3 Wheeler": "3W",
      "Truck": "TRUCK",
      "E-loader": "E-LOADER"
    };

    const categoryCode = categoryMapping[title];
    console.log(`🚗 Selected category: ${title} → ${categoryCode}`);

    if (categoryCode) {
      navigation.navigate("LocationSelectorScreen", {
        vehicleType: categoryCode,
        categoryName: title,
        currentLocation,
        currentAddress
      });
    } else {
      console.warn("Unknown vehicle category:", title);
    }
  };

  const renderCarouselItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.carouselItem, { transform: [{ scale }] }]}>
        <Image
          source={item.image}
          style={styles.carouselImage}
          resizeMode="cover"
        />
      </Animated.View>
    );
  };

  const renderVehicleCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.vehicleCard,
        selectedCard === item.title && styles.selectedCard,
        !item.available && styles.disabledCard,
      ]}
      onPress={() => handleCardPress(item.title, item.available)}
      activeOpacity={item.available ? 0.7 : 1}
    >
      <Text style={styles.vehicleCardText}>{item.title}</Text>
      <Image source={item.image} style={styles.vehicleIcon} />
      {item.available && (
        <Ionicons
          name="arrow-forward"
          size={width * 0.05}
          color="#EC4D4A"
          style={styles.arrowIcon}
        />
      )}
      {!item.available && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Image
            source={require("../assets/menu.png")}
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationCard}
          onPress={() => navigation.navigate("LocationSelectorScreen", {
            currentLocation,
            currentAddress
          })}
        >
          <View style={{ alignItems: "flex-start", width: "100%" }}>
            <Text
              style={[
                styles.locationText,
                { textAlign: "left", alignSelf: "flex-start" },
              ]}
            >
              {" "}
              Pick up Location
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              marginTop: 2,
            }}
          >
            <Ionicons
              name="location-sharp"
              size={width * 0.045}
              color="green"
              style={{ marginRight: width * 0.01 }}
            />
            <Text
              style={[
                styles.locationAddress,
                { textAlign: "left", alignSelf: "flex-start", flex: 1 },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {currentAddress || "Fetching location..."}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carousel - Using AnimatedFlatList */}
        <View style={styles.carouselContainer}>
          <AnimatedFlatList
            ref={carouselRef}
            data={carouselData}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / width
              );
              setCurrentIndex(newIndex);
            }}
            keyExtractor={(item) => item.id}
          />

          {/* Carousel Indicators */}
          <View style={styles.indicatorContainer}>
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Vehicle Cards */}
        <View style={styles.vehicleCardsContainer}>
          <FlatList
            data={vehicleCards}
            renderItem={renderVehicleCard}
            numColumns={2}
            columnWrapperStyle={styles.vehicleCardRow}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Image Section - starts immediately below vehicle cards */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/image copy 2.png")}
            style={styles.bottomImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>

      {/* Active Booking Banner */}
      {renderActiveBookingBanner()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    backgroundColor: "#FFFFFF",
    width: "100%",
    // Shadow for header (optional)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10, // Ensure header stays above other content
    // Remove default padding top since we're handling it dynamically
    paddingBottom: height * 0.02,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingTop: height * 0.01,
    paddingBottom: 0,
    marginBottom: 0,
  },
  menuButton: {
    padding: width * 0.015,
    marginRight: width * 0.02,
  },
  menuIcon: {
    width: width * 0.07,
    height: width * 0.07,
    resizeMode: "contain",
  },
  locationCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: width * 0.04,
    paddingVertical: height * 0.006,
    paddingHorizontal: width * 0.025,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    marginLeft: width * 0.01,
    minHeight: height * 0.07,
    justifyContent: "center",
  },
  locationRowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.002,
  },
  locationRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: width * 0.01,
  },
  locationText: {
    fontWeight: "bold",
    fontSize: width * 0.041,
    color: "#222",
  },
  locationAddress: {
    fontSize: width * 0.037,
    color: "#666",
    flex: 1,
  },
  carouselContainer: {
    height: width * 0.5,
    marginTop: height * 0.01,
    width: "100%",
  },
  carouselItem: {
    width: width - width * 0.08,
    height: "100%",
    marginHorizontal: width * 0.04,
    borderRadius: width * 0.03,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.015,
    width: "100%",
  },
  indicator: {
    width: width * 0.02,
    height: width * 0.02,
    borderRadius: width * 0.01,
    backgroundColor: "#CCCCCC",
    marginHorizontal: width * 0.01,
  },
  activeIndicator: {
    backgroundColor: "#EC4D4A",
    width: width * 0.04,
  },
  vehicleCardsContainer: {
    paddingHorizontal: width * 0.04,
    marginTop: height * 0.02,
    marginBottom: 0,
    width: "100%",
  },
  vehicleCardRow: {
    justifyContent: "space-between",
    marginBottom: height * 0.015,
  },
  vehicleCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: width * 0.03,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.025,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    aspectRatio: 1.1,
  },
  selectedCard: {
    borderColor: "#EC4D4A",
    borderWidth: 1.5,
  },
  disabledCard: {
    opacity: 0.7,
  },
  vehicleIcon: {
    width: width * 0.18,
    height: width * 0.14,
    resizeMode: "contain",
    marginVertical: height * 0.008,
  },
  vehicleCardText: {
    fontWeight: "600",
    fontSize: width * 0.035,
    color: "#333",
    textAlign: "center",
    marginBottom: height * 0.003,
  },
  comingSoonBadge: {
    position: "absolute",
    top: width * 0.02,
    right: width * 0.02,
    backgroundColor: "#EC4D4A",
    paddingHorizontal: width * 0.02,
    paddingVertical: width * 0.008,
    borderRadius: width * 0.025,
  },
  comingSoonText: {
    color: "#FFFFFF",
    fontSize: width * 0.028,
    fontWeight: "bold",
  },
  imageContainer: {
    marginTop: -height * 0.02,
    marginBottom: -height * 0.1,
    width: "100%",
    height: height * 0.7,
    overflow: "hidden",
    zIndex: -1,
  },
  bottomImage: {
    width: "100%",
    height: "120%",
    marginTop: "-45%",
  },
  activeBookingBanner: {
    position: "absolute",
    bottom: Platform.OS === 'ios' ? 85 : 65,
    left: width * 0.03,
    right: width * 0.03,
    borderRadius: width * 0.04,
    shadowColor: "#EC4D4A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1000,
  },
  bannerGradient: {
    backgroundColor: "#FFFFFF",
    borderRadius: width * 0.04,
    borderWidth: 1,
    borderColor: "#EC4D4A20",
    padding: width * 0.04,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerMainText: {
    fontSize: width * 0.042,
    fontWeight: "bold",
    color: "#333",
    marginBottom: width * 0.01,
  },
  bannerSubText: {
    fontSize: width * 0.036,
    color: "#666",
    marginBottom: width * 0.015,
    lineHeight: width * 0.05,
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdText: {
    fontSize: width * 0.034,
    color: "#EC4D4A",
    fontWeight: "600",
  },
  tapHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    paddingHorizontal: width * 0.025,
    paddingVertical: width * 0.015,
    borderRadius: width * 0.05,
    borderWidth: 1,
    borderColor: "#EC4D4A30",
  },
  tapHintText: {
    fontSize: width * 0.032,
    color: "#EC4D4A",
    fontWeight: "600",
    marginRight: width * 0.01,
  },
});

export default HomeScreen;
