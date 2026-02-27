import React, { useRef, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from '../utils/api';
import { GOOGLE_API_KEY } from "../env/googleMapApi";

const { width, height } = Dimensions.get("window");
// Responsive size helper
const scale = (size) => Math.round((width / 375) * size);

const BookingSearchingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);

  // Get booking data passed from BillingPayment or OnlinePayment
  const bookingData = route.params?.bookingData || {};
  const [currentQuickFee, setCurrentQuickFee] = useState(bookingData.quickFee || 0);

  // Debug: Log booking data structure
  console.log('🔍 BookingSearchingScreen - Full Booking Data:', JSON.stringify({
    amountPay: bookingData.amountPay,
    price: bookingData.price,
    paymentMethod: bookingData.paymentMethod,
    payFrom: bookingData.payFrom,
    quickFee: bookingData.quickFee,
    pricing: bookingData.pricing,
    feeBreakdown: bookingData.feeBreakdown
  }, null, 2));

  // Normalize booking data to extract locations from different structures
  const normalizeLocations = (booking) => {
    const locations = [];

    // Check if locations array already exists (new structure)
    if (booking.locations && Array.isArray(booking.locations) && booking.locations.length > 0) {
      console.log("✅ Using existing locations array");
      return booking.locations;
    }

    // Otherwise, build from fromAddress, stops, and dropLocation (old structure)
    console.log("🔄 Building locations from fromAddress/dropLocation structure");

    // Add pickup location (fromAddress)
    if (booking.fromAddress) {
      locations.push({
        id: 'pickup',
        isFirst: true,
        isLast: false,
        latitude: booking.fromAddress.latitude,
        longitude: booking.fromAddress.longitude,
        lat: booking.fromAddress.latitude,
        lng: booking.fromAddress.longitude,
        address: booking.fromAddress.address || '',
        name: booking.fromAddress.address || 'Pickup Location',
      });
      console.log("✅ Added pickup:", booking.fromAddress.latitude, booking.fromAddress.longitude);
    }

    // Add intermediate stops if any
    if (booking.stops && Array.isArray(booking.stops)) {
      booking.stops.forEach((stop, index) => {
        locations.push({
          id: `stop-${index}`,
          isFirst: false,
          isLast: false,
          latitude: stop.latitude,
          longitude: stop.longitude,
          lat: stop.latitude,
          lng: stop.longitude,
          address: stop.address || stop.Address || '',
          name: stop.address || `Stop ${index + 1}`,
        });
        console.log(`✅ Added stop ${index + 1}:`, stop.latitude, stop.longitude);
      });
    }

    // Add drop locations
    if (booking.dropLocation && Array.isArray(booking.dropLocation)) {
      booking.dropLocation.forEach((drop, index) => {
        const isLastDrop = index === booking.dropLocation.length - 1;
        locations.push({
          id: `drop-${index}`,
          isFirst: false,
          isLast: isLastDrop,
          latitude: drop.latitude,
          longitude: drop.longitude,
          lat: drop.latitude,
          lng: drop.longitude,
          address: drop.address || drop.Address || '',
          name: drop.address || `Drop ${index + 1}`,
        });
        console.log(`✅ Added drop ${index + 1}:`, drop.latitude, drop.longitude);
      });
    }

    console.log(`📍 Total locations built: ${locations.length}`);
    return locations;
  };

  // Get normalized locations
  const normalizedLocations = React.useMemo(
    () => normalizeLocations(bookingData),
    [bookingData]
  );
  const [liveBooking, setLiveBooking] = useState(bookingData);




  // Log booking data immediately when component mounts
  useEffect(() => {
    console.log("🔍 BookingSearchingScreen mounted with:");
    console.log("   - bookingData._id:", bookingData._id);
    console.log("   - bookingData.id:", bookingData.id);
    console.log("   - bookingData.bookingId:", bookingData.bookingId);
    console.log("   - route.params.bookingId:", route.params?.bookingId);
    console.log("   - Full bookingData keys:", Object.keys(bookingData));
    console.log("   - Normalized locations count:", normalizedLocations.length);
  }, []);

  // Handle cancel booking request
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState("");
  const [showReasonOptions, setShowReasonOptions] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRiderAccepted, setIsRiderAccepted] = useState(false); // Track if rider accepted

  // Prevent hardware back button and gesture navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Allow navigation if rider has accepted
      if (isRiderAccepted) {
        return; // Don't prevent navigation
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Show cancel modal instead
      setShowCancelModal(true);
    });

    return unsubscribe;
  }, [navigation, isRiderAccepted]);

  const cancelReasons = [
    "Taking longer than expected.",
    "Found better price elsewhere.",
    "Change of plans.",
    "Wrong pickup location.",
    "Wrong drop location.",
    "Others"
  ];

  const handleCancelRequest = () => {
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedCancelReason("");
    setShowReasonOptions(false);
    setShowCustomInput(false);
    setCustomReason("");
  };

  const handleReasonSelect = (reason) => {
    if (reason === "Others") {
      setSelectedCancelReason(reason);
      setShowCustomInput(true);
      setShowReasonOptions(false);
    } else {
      setSelectedCancelReason(reason);
      setShowCustomInput(false);
      setCustomReason("");
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedCancelReason) {
      Alert.alert("Please select a reason", "Please choose a reason for cancellation");
      return;
    }

    if (selectedCancelReason === "Others" && !customReason.trim()) {
      Alert.alert("Please enter a reason", "Please provide your reason for cancellation");
      return;
    }

    const finalReason = selectedCancelReason === "Others" ? customReason : selectedCancelReason;

    try {
      setIsCancelling(true);

      // Get userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      const bookingId = route.params?.bookingId || bookingData?._id || bookingData?.id || bookingData?.bookingId;

      if (!userId || !bookingId) {
        Alert.alert("Error", "Unable to cancel booking. Missing user or booking information.");
        setIsCancelling(false);
        return;
      }

      console.log("Cancelling booking:", { bookingId, userId, reason: finalReason });

      const response = await fetch(`${API_URL}/cancel-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          userId: userId,
          reason: finalReason
        })
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("❌ Non-JSON response:", text);
        throw new Error("Server returned invalid response. Please check if the backend is running correctly.");
      }

      if (response.ok && data.success) {
        console.log("✅ Booking cancelled successfully:", data);

        // Close modal and reset state
        setShowCancelModal(false);
        setSelectedCancelReason("");
        setShowReasonOptions(false);
        setShowCustomInput(false);
        setCustomReason("");

        // Navigate directly without alert
        navigation.navigate("MainTabs", { screen: "Home" });
      } else {
        console.error("❌ Failed to cancel booking:", data);
        Alert.alert(
          "Cancellation Failed",
          data.message || "Unable to cancel booking. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Error cancelling booking:", error);
      Alert.alert(
        "Error",
        "An error occurred while cancelling your booking. Please check your connection and try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle tip selection
  const handleTipSelect = (amount) => {
    if (amount === "custom") {
      setShowCustomAmount(true);
      setSelectedTipAmount(null);
    } else {
      setSelectedTipAmount(amount);
      setShowCustomAmount(false);
      setCustomAmount("");
    }
  };

  // Handle custom amount input
  const handleCustomAmountChange = (text) => {
    // Only allow numbers and limit to 100
    const numericValue = text.replace(/[^0-9]/g, "");
    const amount = parseInt(numericValue) || 0;

    if (amount <= 100) {
      setCustomAmount(numericValue);
    } else {
      Alert.alert("Maximum Amount", "Quick fee cannot exceed ₹100");
      // Keep the previous valid value
      setCustomAmount("100");
    }
  };

  // Handle custom amount confirmation
  const handleCustomAmountConfirm = () => {
    if (customAmount && parseInt(customAmount) > 0) {
      setSelectedTipAmount(parseInt(customAmount));
      setShowCustomAmount(false);
    } else {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
    }
  };

  // Handle Quick Fee update in real-time
  const handleQuickFeeUpdate = async (newQuickFee) => {
    if (newQuickFee < 0 || newQuickFee > 100) {
      Alert.alert("Invalid Amount", "Quick fee must be between ₹0 and ₹100");
      return;
    }

    setCurrentQuickFee(newQuickFee);
    setIsUpdatingQuickFee(true);

    try {
      const bookingId = bookingData._id || bookingData.bookingId;
      if (!bookingId) {
        console.error("No booking ID found");
        Alert.alert("Error", "Cannot update quick fee - booking ID not found");
        return;
      }



      // ALWAYS use base booking price (without quick fee)
      const baseAmount = Number(liveBooking.price || 0) || 0;
      const newTotal = baseAmount + newQuickFee;

      const newDriverEarnings =
        (liveBooking.pricing?.baseFare || baseAmount) + newQuickFee;
      const response = await axios.patch(`${API_URL}/booking/${bookingId}`, {
        quickFee: newQuickFee,
        totalDriverEarnings: newDriverEarnings,
        amountPay: newTotal.toString()
      });

      console.log("Quick fee updated successfully:", response.data);

      // Success - no popup needed, quick fee updated silently
    } catch (error) {
      console.error("Error updating quick fee:", error);

      // Check if it's insufficient wallet balance error
      if (error.response?.data?.error?.code === 'INSUFFICIENT_BALANCE') {
        const required = error.response.data.error.required;
        const available = error.response.data.error.available;
        Alert.alert(
          "Insufficient Wallet Balance",
          `You need ₹${required} more in your wallet to add this quick fee.\n\nCurrent balance: ₹${available}\nRequired: ₹${required}`
        );
      } else {
        Alert.alert(
          "Update Failed",
          error.response?.data?.message || "Failed to update quick fee. Please try again."
        );
      }

      // Revert to original value on error
      setCurrentQuickFee(bookingData.quickFee || 0);
    } finally {
      setIsUpdatingQuickFee(false);
    }
  };

  const [message, setMessage] = useState("Hold on... Please wait a moment");
  const [selectedTipAmount, setSelectedTipAmount] = useState(10);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Quick Fee state - initialize from bookingData
  const [isUpdatingQuickFee, setIsUpdatingQuickFee] = useState(false);

  // Polling state
  const pollingIntervalRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const opacity1 = useSharedValue(0.6);
  const opacity2 = useSharedValue(0.4);
  const opacity3 = useSharedValue(0.2);
  const progressWidth = useSharedValue(25);
  const shimmerTranslate = useSharedValue(-1);
  const glowOpacity = useSharedValue(0.5);

  // ⭐⭐⭐ PRO UNIVERSAL TOTAL CALCULATOR ⭐⭐⭐
  const bookingAmounts = React.useMemo(() => {
    const basePrice =
      Number(liveBooking?.price) ||
      Number(bookingData?.price) ||
      0;

    const quickFee =
      currentQuickFee !== undefined
        ? Number(currentQuickFee)
        : Number(liveBooking?.quickFee || 0);

    const totalPayable = basePrice + quickFee;

    console.log(basePrice, "thisBasePrice");
    console.log(quickFee, "thisIsQuickFee")

    return {
      basePrice,
      quickFee,
      totalPayable,
    };
  }, [liveBooking, currentQuickFee, bookingData]);

  useFocusEffect(
    React.useCallback(() => {
      // Reset all animation values to initial state
      scale1.value = 1;
      scale2.value = 1;
      scale3.value = 1;
      opacity1.value = 0.6;
      opacity2.value = 0.4;
      opacity3.value = 0.2;
      progressWidth.value = 0;
      shimmerTranslate.value = -1;
      glowOpacity.value = 0.5;

      // Start animations from zero
      const pulseAnimation = () => {
        scale1.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 0 }),
            withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.ease) })
          ),
          -1,
          false
        );

        opacity1.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 0 }),
            withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })
          ),
          -1,
          false
        );

        scale2.value = withDelay(
          600,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 0 }),
              withTiming(1.8, {
                duration: 2000,
                easing: Easing.out(Easing.ease),
              })
            ),
            -1,
            false
          )
        );

        opacity2.value = withDelay(
          600,
          withRepeat(
            withSequence(
              withTiming(0.4, { duration: 0 }),
              withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })
            ),
            -1,
            false
          )
        );

        scale3.value = withDelay(
          1200,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 0 }),
              withTiming(1.8, {
                duration: 2000,
                easing: Easing.out(Easing.ease),
              })
            ),
            -1,
            false
          )
        );

        opacity3.value = withDelay(
          1200,
          withRepeat(
            withSequence(
              withTiming(0.2, { duration: 0 }),
              withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })
            ),
            -1,
            false
          )
        );
      };

      const progressAnimation = () => {
        // Progress animation - 10 minutes (600 seconds) total duration
        progressWidth.value = withTiming(100, {
          duration: 600000, // 10 minutes (600 seconds)
          easing: Easing.linear,
        });
      };

      // Shimmer animation for progress bar
      const shimmerAnimation = () => {
        shimmerTranslate.value = withRepeat(
          withSequence(
            withTiming(1, {
              duration: 1500,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            withTiming(-1, { duration: 0 })
          ),
          -1,
          false
        );
      };

      // Glow pulse animation
      const glowAnimation = () => {
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(1, {
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(0.5, {
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          false
        );
      };

      pulseAnimation();
      progressAnimation();
      shimmerAnimation();
      glowAnimation();

      // Set 10-minute timeout
      searchTimeoutRef.current = setTimeout(() => {
        console.log("⏰ Search timeout reached (10 minutes)");
        setHasTimedOut(true);
        setMessage("No riders available at the moment");
      }, 600000); // 10 minutes

      // Cleanup timeout on unmount
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }
      };
    }, [])
  );

  const animatedCircle1 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale1.value }],
      opacity: opacity1.value,
    };
  });

  const animatedCircle2 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale2.value }],
      opacity: opacity2.value,
    };
  });

  const animatedCircle3 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale3.value }],
      opacity: opacity3.value,
    };
  });

  const animatedProgressBar = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const animatedShimmer = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: shimmerTranslate.value * (width - 40)
        }
      ],
    };
  });

  const animatedGlow = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  // useEffect(() => {
  //   const messageTimers = [
  //     // First message appears immediately (0 seconds)
  //     setTimeout(() => {
  //       setMessage("Hold on... Please wait a moment");
  //     }, 0),

  //     // Second message after 25 seconds
  //     setTimeout(() => {
  //       setMessage("Adding Quick Fee can help you get a Rider fast !");
  //     }, 25000),

  //     // Third message after 55 seconds
  //     setTimeout(() => {
  //       setMessage("Partners are a little busy now");
  //     }, 55000),

  //     // Final message after exactly 95 seconds
  //     setTimeout(() => {
  //       setMessage("Order Accepted");
  //     }, 95000)
  //   ];

  //   return () => {
  //     messageTimers.forEach(clearTimeout);
  //   };
  // }, []);

  useEffect(() => {
    // Message sequence with exact timings from component mount
    const messageTimers = [
      // First message at 0 seconds (immediately)
      setTimeout(() => {
        setMessage("Hold on... Please wait a moment");
      }, 0),

      // Second message at 25 seconds
      setTimeout(() => {
        setMessage("Adding Quick Fee can help you get a Rider fast!");
      }, 25000),

      // Third message at 55 seconds
      setTimeout(() => {
        setMessage("Partners are a little busy now");
      }, 55000),

      // REMOVED: Automatic "Order Accepted" message after 95 seconds
      // Order acceptance message will only show when rider actually accepts
    ];

    // Cleanup function to clear all timers
    return () => {
      messageTimers.forEach((timer) => clearTimeout(timer));
    };
  }, []); // Empty dependency array means this runs once on mount

  // Decode Google's encoded polyline format
  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
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
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  // Update route polyline using Google Directions API
  const updateRoutePolyline = async () => {
    const locs = normalizedLocations || [];
    console.log("🗺️ Starting route update for BookingSearchingScreen...");
    const coordinates = [];

    // Add pickup location (starting point)
    const pickup = locs.find(loc => loc.isFirst);
    if (pickup) {
      let lat = pickup.latitude || pickup.lat;
      let lng = pickup.longitude || pickup.lng;

      if (!lat && pickup.coordinates) {
        lat = pickup.coordinates.latitude || pickup.coordinates.lat;
        lng = pickup.coordinates.longitude || pickup.coordinates.lng;
      }

      if (lat && lng && lat !== 0 && lng !== 0) {
        coordinates.push({ latitude: lat, longitude: lng });
        console.log("✅ Added pickup location:", lat, lng);
      }
    }

    // Add all valid stop coordinates in sequence
    locs.forEach((loc, index) => {
      if (loc.isFirst) return; // Skip pickup, already added

      let lat = loc.latitude || loc.lat;
      let lng = loc.longitude || loc.lng;

      if (!lat && loc.coordinates) {
        lat = loc.coordinates.latitude || loc.coordinates.lat;
        lng = loc.coordinates.longitude || loc.coordinates.lng;
      }

      if (lat && lng && lat !== 0 && lng !== 0) {
        coordinates.push({ latitude: lat, longitude: lng });
        console.log(`✅ Added location ${index + 1}:`, lat, lng);
      }
    });

    console.log(`📍 Total coordinates for route: ${coordinates.length}`);

    // Fetch route from Google Directions API
    if (coordinates.length >= 2) {
      try {
        const origin = `${coordinates[0].latitude},${coordinates[0].longitude}`;
        const destination = `${coordinates[coordinates.length - 1].latitude},${coordinates[coordinates.length - 1].longitude
          }`;

        // Build optimized waypoints for all intermediate stops
        let waypoints = "";
        if (coordinates.length > 2) {
          const waypointCoords = coordinates
            .slice(1, -1)
            .map((coord) => `${coord.latitude},${coord.longitude}`);
          waypoints = `&waypoints=optimize:true|${waypointCoords.join("|")}`;
          console.log("🛣️ Waypoints:", waypointCoords.length);
        }



        const url =
          `https://maps.googleapis.com/maps/api/directions/json?` +
          `origin=${origin}&destination=${destination}` +
          `${waypoints}&mode=driving&key=${GOOGLE_API_KEY}`;


        console.log("🌐 Fetching route from Google Directions API...");
        const response = await axios.get(url);

        if (response.data.status === "OK" && response.data.routes.length > 0) {


          const route = response.data.routes[0];
          const points = decodePolyline(
            route.overview_polyline.points
          );

          setRouteCoordinates(points);

          const totalDistance = route.legs.reduce(
            (sum, leg) => sum + leg.distance.value,
            0
          );
          const totalDuration = route.legs.reduce(
            (sum, leg) => sum + leg.duration.value,
            0
          );

          console.log(
            `🎯 Route fetched - Distance: ${(totalDistance / 1000).toFixed(
              2
            )} km, Duration: ${Math.ceil(totalDuration / 60)} min`
          );
          console.log(`📈 Route polyline points: ${points.length}`);
        } else {
          console.log("⚠️ Google API failed, using straight lines");

        }
      } catch (error) {
        console.error("❌ Error fetching directions:", error);

      }
    } else {
      console.log("📍 Not enough coordinates for route (need at least 2)");

    }
  };

  // Trigger route update when locations are available
  useEffect(() => {
    if (normalizedLocations && normalizedLocations.length >= 2) {
      console.log("🗺️ Triggering route update with", normalizedLocations.length, "locations");
      setTimeout(() => {
        updateRoutePolyline();
      }, 1000); // Delay to ensure map is ready
    }
  }, [normalizedLocations]);

  // Real-time polling to check booking status
  useEffect(() => {
    const checkBookingStatus = async () => {
      try {
        const bookingId = bookingData._id || bookingData.id || bookingData.bookingId;
        if (!bookingId) {
          console.error("No booking ID found for status polling. bookingData keys:", Object.keys(bookingData));
          return;
        }
        const response = await axios.get(`${API_URL}/booking/${bookingId}`);

        const booking = response.data; // your API returns flat object
        setLiveBooking(booking);
        setCurrentQuickFee(booking.quickFee || 0);
        console.log("📡 Full response:", response.data);
        console.log("🔥 REAL STATUS =", booking?.status);

        if (booking) {
          console.log("📊 Current booking details:");
          console.log("   - Booking ID:", booking._id);
          console.log("   - Status:", booking.status);
          console.log("   - Rider ID:", booking.riderId);
          console.log("   - Rider Object:", booking.rider);
          console.log("   - Has rider assigned:", !!(booking.rider || booking.riderId));

          // Check if rider has been assigned (status changed from "pending" to "accepted" or "ongoing")
          if (booking.status === "cancelled") {
            console.log("❌ Booking was auto-cancelled");

            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            setMessage("No riders available for this trip");

            setTimeout(() => {
              navigation.replace("MainTabs", { screen: "Home" });
            }, 2000);

            return;
          }

          if (
            booking.status === "accepted" ||
            booking.status === "ongoing" ||
            booking.rider ||
            booking.riderId
          ) {
            console.log("✅ Rider accepted! Navigating to BookingDetail...");
            console.log("   - Triggering navigation with bookingId:", bookingId);

            // Set flag to allow navigation
            setIsRiderAccepted(true);

            // Update message to show order accepted
            setMessage("Order Accepted! Connecting you with rider...");

            // Clear polling interval and timeout
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            if (searchTimeoutRef.current) {
              clearTimeout(searchTimeoutRef.current);
              searchTimeoutRef.current = null;
            }

            // Small delay to show the message, then navigate
            setTimeout(() => {
              console.log("🚀 Attempting navigation to BookingDetail...");
              try {
                navigation.replace("BookingDetail", {
                  bookingId: bookingId,
                });
                console.log("✅ Navigation triggered successfully");
              } catch (navError) {
                console.error("❌ Navigation failed:", navError);
                // Try alternative navigation method
                navigation.navigate("BookingDetail", {
                  bookingId: bookingId,
                });
              }
            }, 1500);
          } else {
            console.log("⏳ Still waiting for rider acceptance...");
          }
        }
      } catch (error) {
        console.error("❌ Error checking booking status:", error);
        console.error("❌ Error details:", error.response?.data);
        // Continue polling even on error
      }
    };

    // Start polling immediately
    checkBookingStatus();

    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(checkBookingStatus, 3000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [bookingData._id]);



  // Handle timeout - automatically navigate to home
  useEffect(() => {
    if (hasTimedOut) {
      // Stop polling when timeout occurs
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Automatically navigate to home after timeout (no alert)
      // Small delay to show the timeout message, then redirect
      const timeoutRedirect = setTimeout(() => {
        console.log("⏰ Timeout - Redirecting to home screen...");
        navigation.replace("MainTabs", { screen: "Home" });
      }, 2000); // 2 second delay to show "No riders available" message

      return () => {
        if (timeoutRedirect) {
          clearTimeout(timeoutRedirect);
        }
      };
    }
  }, [hasTimedOut, navigation]);

  // Calculate initial region based on all locations to fit them in view
  const getInitialRegion = () => {
    const locs = normalizedLocations || [];

    // Filter locations with valid coordinates (including interpolated ones)
    const validLocs = locs.filter(loc => {
      let lat = loc.latitude || loc.lat;
      let lng = loc.longitude || loc.lng;

      // Try coordinates object if direct coordinates not found
      if (!lat && loc.coordinates) {
        lat = loc.coordinates.latitude || loc.coordinates.lat;
        lng = loc.coordinates.longitude || loc.coordinates.lng;
      }

      // For intermediate stops, we'll interpolate so consider them valid if pickup and drop exist
      if ((!lat || lat === 0) && !loc.isFirst && !loc.isLast) {
        const pickup = locs.find(l => l.isFirst);
        const drop = locs.find(l => l.isLast);
        return pickup && drop; // Valid if we can interpolate
      }

      return lat && lng && lat !== 0 && lng !== 0;
    });

    if (validLocs.length === 0) {
      return {
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }

    // If only one valid location, center on it
    if (validLocs.length === 1) {
      const location = validLocs[0];
      let lat = location.latitude || location.lat;
      let lng = location.longitude || location.lng;

      if (!lat && location.coordinates) {
        lat = location.coordinates.latitude || location.coordinates.lat;
        lng = location.coordinates.longitude || location.coordinates.lng;
      }

      return {
        latitude: lat || 12.9716,
        longitude: lng || 77.5946,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }

    // Calculate bounds for multiple valid locations
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    validLocs.forEach(loc => {
      let lat = loc.latitude || loc.lat;
      let lng = loc.longitude || loc.lng;

      if (!lat && loc.coordinates) {
        lat = loc.coordinates.latitude || loc.coordinates.lat;
        lng = loc.coordinates.longitude || loc.coordinates.lng;
      }

      if (lat && lng) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    });

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

  // Render markers for all locations (LocationSelectorScreen style)
  const renderMarkers = () => {
    const locs = normalizedLocations || [];
    console.log("Rendering markers for locations:", locs.length, locs);
    console.log("Full location data:", JSON.stringify(locs, null, 2));

    // Calculate total number of drop locations (excluding pickup)
    const totalDrops = locs.filter(loc => !loc.isFirst).length;
    const showNumbers = totalDrops > 1;
    console.log(`📊 Total drops: ${totalDrops}, Show numbers: ${showNumbers}`);

    let dropCounter = 0; // Counter for drop locations only

    return locs.map((loc, idx) => {
      let markerTitle = "";
      let isPickup = loc.isFirst;
      let isDropoff = loc.isLast;

      // Increment drop counter for non-pickup locations
      const dropNumber = isPickup ? 0 : ++dropCounter;

      if (isPickup) {
        markerTitle = "Pickup Location";
      } else if (isDropoff) {
        markerTitle = "Drop Location";
      } else {
        markerTitle = `Stop ${idx}`;
      }

      // Get coordinates from location or coordinates object
      let latitude = loc.latitude || loc.lat;
      let longitude = loc.longitude || loc.lng;

      console.log(`Processing marker ${idx} (${markerTitle}):`, {
        originalLat: latitude,
        originalLng: longitude,
        isPickup,
        isDropoff,
        hasCoordinatesObj: !!loc.coordinates
      });

      // If no direct coordinates, try from coordinates object
      if ((!latitude || latitude === 0) && loc.coordinates) {
        latitude = loc.coordinates.latitude || loc.coordinates.lat;
        longitude = loc.coordinates.longitude || loc.coordinates.lng;
        console.log(`Found coordinates in object for ${markerTitle}:`, latitude, longitude);
      }

      // For intermediate stops without coordinates, interpolate between pickup and drop
      if ((!latitude || !longitude || latitude === 0 || longitude === 0) && !isPickup && !isDropoff) {
        console.log(`Need to interpolate coordinates for stop ${idx}:`, loc.address);

        // Find pickup and drop coordinates more robustly
        const pickup = locs.find(l => l.isFirst === true);
        const drop = locs.find(l => l.isLast === true);

        console.log("Found pickup:", pickup ? "YES" : "NO");
        console.log("Found drop:", drop ? "YES" : "NO");

        if (pickup && drop) {
          let pickupLat = pickup.latitude || pickup.lat;
          let pickupLng = pickup.longitude || pickup.lng;
          let dropLat = drop.latitude || drop.lat;
          let dropLng = drop.longitude || drop.lng;

          // Try coordinates object for pickup/drop if needed
          if (!pickupLat && pickup.coordinates) {
            pickupLat = pickup.coordinates.latitude || pickup.coordinates.lat;
            pickupLng = pickup.coordinates.longitude || pickup.coordinates.lng;
          }
          if (!dropLat && drop.coordinates) {
            dropLat = drop.coordinates.latitude || drop.coordinates.lat;
            dropLng = drop.coordinates.longitude || drop.coordinates.lng;
          }

          console.log("Pickup coords:", pickupLat, pickupLng);
          console.log("Drop coords:", dropLat, dropLng);

          if (pickupLat && pickupLng && dropLat && dropLng &&
            pickupLat !== 0 && pickupLng !== 0 && dropLat !== 0 && dropLng !== 0) {

            // Calculate intermediate position (roughly halfway with slight offset)
            const intermediateStops = locs.filter(l => !l.isFirst && !l.isLast);
            const stopIndex = intermediateStops.findIndex(s => s.id === loc.id);
            const totalIntermediateStops = intermediateStops.length;

            console.log(`Interpolating: stopIndex=${stopIndex}, total=${totalIntermediateStops}`);

            // Distribute stops evenly between pickup and drop
            const ratio = totalIntermediateStops === 1 ? 0.5 : (stopIndex + 1) / (totalIntermediateStops + 1);

            latitude = pickupLat + (dropLat - pickupLat) * ratio;
            longitude = pickupLng + (dropLng - pickupLng) * ratio;

            // Add small offset to avoid overlapping markers
            const offset = 0.0005; // Smaller offset for better accuracy
            latitude += (stopIndex % 2 === 0 ? offset : -offset);
            longitude += (stopIndex % 2 === 0 ? offset : -offset);

            console.log(`✅ Interpolated coordinates for ${markerTitle}:`, latitude, longitude);
          } else {
            console.log(`❌ Cannot interpolate - invalid pickup/drop coordinates`);
          }
        } else {
          console.log(`❌ Cannot interpolate - missing pickup or drop`);
        }
      }

      // Force show all markers - even if coordinates are 0,0 use a fallback near the area
      if (!latitude || !longitude || latitude === 0 || longitude === 0) {
        if (!isPickup && !isDropoff) {
          // For intermediate stops, use a fallback position in Mountain View area
          latitude = 37.4219 + (idx * 0.001); // Near Google HQ with slight offset
          longitude = -122.084 + (idx * 0.001);
          console.log(`🔄 Using fallback coordinates for ${markerTitle}:`, latitude, longitude);
        } else {
          console.log(`❌ Skipping marker ${idx}: No valid coordinates and cannot fallback`, loc);
          return null;
        }
      }

      console.log(`✅ Final marker ${idx} (${markerTitle}):`, latitude, longitude);

      return (
        <Marker
          key={`marker-${loc.id || idx}-${latitude}-${longitude}-${Date.now()}`}
          coordinate={{
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          }}
          title={markerTitle}
          description={loc.address || loc.name || ""}
          anchor={{ x: 0.5, y: 1 }}
          centerOffset={{ x: 0, y: -20 }}
        >
          {isPickup ? (
            <Image
              source={require("../assets/pickup.png")}
              style={{
                width: 40,
                height: 40,
              }}
              resizeMode="contain"
            />
          ) : showNumbers ? (
            <View style={styles.dropMarkerWrapper}>
              <Image
                source={require("../assets/drop.png")}
                style={styles.dropLocationIcon}
                resizeMode="contain"
              />
              <View style={styles.dropNumberBadge}>
                <Text style={styles.dropNumberText}>{dropNumber}</Text>
              </View>
            </View>
          ) : (
            <Image
              source={require("../assets/drop.png")}
              style={{
                width: 40,
                height: 40,
              }}
              resizeMode="contain"
            />
          )}
        </Marker>
      );
    }).filter(marker => marker !== null); // Remove null markers
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Custom Header without Back Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finding Rider</Text>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        onMapReady={() => {
          console.log("Map is ready");
          // Zoom to show all locations after map loads
          setTimeout(() => {
            const region = getInitialRegion();
            console.log("Setting region:", region);
            if (mapRef.current) {
              mapRef.current.animateToRegion(region, 1000);
            }
          }, 500);
        }}
        onError={(error) => {
          console.log("Map error:", error);
        }}
        loadingEnabled={true}
        loadingIndicatorColor="#EC4D4A"
        loadingBackgroundColor="#f5f5f5"
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Route Polylines - connecting pickup to all drop locations in sequence */}
        {routeCoordinates.length > 1 && (
          <>
            {/* White shadow/outline for better visibility */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#FFFFFF"
              strokeWidth={8}
              strokeOpacity={0.8}
              zIndex={1}
              lineCap="round"
              lineJoin="round"
              tappable={false}
            />
            {/* Main route line */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#EC4D4A"
              strokeWidth={4}
              strokeOpacity={1.0}
              zIndex={2}
              lineCap="round"
              lineJoin="round"
              tappable={false}
              fillColor="#EC4D4A"
              geodesic={true}
              miterLimit={10}
            />
          </>
        )}
        {renderMarkers()}
      </MapView>

      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Finding Driver Section - Now at Top */}
        <View style={styles.cardContainer}>
          <View style={styles.bottomContent}>
            <Text style={styles.bottamTitile}>Finding Near By Partners</Text>
            <View style={styles.modernProgressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, animatedProgressBar]}>
                  {/* Gradient overlay effect */}
                  <View style={styles.gradientOverlay} />

                  {/* Shimmer effect */}
                  <Animated.View style={[styles.shimmerEffect, animatedShimmer]} />

                  {/* Glowing indicator dot */}
                  <Animated.View style={[styles.glowingDot, animatedGlow]} />
                </Animated.View>
              </View>
            </View>

            {/* <View style={styles.tipIconContainer}>
              <Image
                source={{ uri: 'https://api.a0.dev/assets/image?text=Hand%20holding%20a%20gold%20coin,%20light%20green%20background,%20cartoon%20style&aspect=1:1' }}
                style={styles.tipIcon}
              />
            </View> */}

            {/* <Text style={styles.tipText}>
              Choose to Add On - Entire amount goes to your driver
            </Text> */}

            <Text style={styles.waitTitle}>Confirming Your Order</Text>
            <Text style={styles.tipText}>{message}</Text>

            <View style={styles.tipAmountContainer}>
              {/* <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, animatedProgressBar]} />
                <View style={styles.progressIndicator} />
              </View> */}
              <View style={styles.tipIconContainer}>
                <Image
                  source={{
                    uri: "https://api.a0.dev/assets/image?text=Hand%20holding%20a%20gold%20coin,%20light%20green%20background,%20cartoon%20style&aspect=1:1",
                  }}
                  style={styles.tipIcon}
                />
              </View>

              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>
                  Add a Quick Fee to Find Rider Faster
                </Text>

                {/* Quick Amount Buttons with + Icon */}
                <View style={styles.tipOptionsContainer}>
                  {[25, 50, 75].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.tipOption,
                        currentQuickFee === amount && styles.selectedTip,
                        isUpdatingQuickFee && styles.tipOptionDisabled,
                      ]}
                      onPress={() => handleQuickFeeUpdate(amount)}
                      disabled={isUpdatingQuickFee}
                    >
                      <Text
                        style={[
                          styles.tipAmountText,
                          currentQuickFee === amount && styles.selectedTipAmount,
                        ]}
                      >
                        ₹{amount}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* Custom Amount + Icon Button */}
                  <TouchableOpacity
                    style={[
                      styles.tipOption,
                      styles.addCustomButton,
                      isUpdatingQuickFee && styles.tipOptionDisabled,
                    ]}
                    onPress={() => setShowCustomAmount(!showCustomAmount)}
                    disabled={isUpdatingQuickFee}
                  >
                    <Ionicons
                      name={showCustomAmount ? "close" : "add"}
                      size={20}
                      color="#EC4D4A"
                    />
                  </TouchableOpacity>
                </View>

                {/* Custom Amount Input - Collapsible */}
                {showCustomAmount && (
                  <View style={styles.customInputSection}>
                    <View style={styles.customInputRow}>
                      <Text style={styles.currencyLabel}>₹</Text>
                      <TextInput
                        style={styles.underlineInput}
                        placeholder="Enter amount"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={customAmount}
                        onChangeText={handleCustomAmountChange}
                        maxLength={3}
                        editable={!isUpdatingQuickFee}
                        autoFocus={true}
                      />
                      {customAmount && (
                        <TouchableOpacity
                          style={styles.applyButton}
                          onPress={() => {
                            const amount = parseInt(customAmount) || 0;
                            if (amount > 0) {
                              handleQuickFeeUpdate(amount);
                              setShowCustomAmount(false);
                              setCustomAmount("");
                            }
                          }}
                          disabled={isUpdatingQuickFee}
                        >
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.inputHint}>Max ₹100</Text>
                  </View>
                )}

                {isUpdatingQuickFee && (
                  <Text style={styles.updatingText}>Updating...</Text>
                )}

                <Text style={styles.tipOptionsNote}>
                  {currentQuickFee > 0 ?
                    `₹${currentQuickFee} quick fee added - helps find drivers faster` :
                    "Add a quick fee to speed up your booking"
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Summary Card - Now at Bottom */}
        <View style={styles.bookingSummaryCard}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>Booking Details</Text>
            <Text style={styles.paymentBadge}>
              {liveBooking.payFrom || liveBooking.paymentMethod || "Payment Info"}
            </Text>
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleText}>
              {bookingData.vehicleType || bookingData.selectedVehicle?.name || "Vehicle"} • ₹{bookingAmounts.totalPayable}
            </Text>
            <Text style={styles.vehicleSubtext}>Base booking amount (excludes quick fee)</Text>
          </View>

          {/* Total Amount Paid - Show for Wallet/Online Payments */}
          {true && (
            <View style={styles.totalPaidContainer}>
              {/* Wallet Split Payment Breakdown */}
              {bookingData.walletUsed && bookingData.pricing?.walletDeduction > 0 && (
                <View style={styles.walletSplitBreakdown}>
                  <Text style={styles.paymentBreakdownTitle}>💳 Payment Breakdown</Text>

                  {/* Wallet Portion */}
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownLeftSide}>
                      <Ionicons name="wallet" size={14} color="#27ae60" />
                      <Text style={styles.breakdownLabelWallet}>Paid via Wallet</Text>
                    </View>
                    <Text style={styles.breakdownAmountWallet}>
                      ₹{bookingData.pricing.walletDeduction.toFixed(0)}
                    </Text>
                  </View>

                  {/* Remaining Amount (if partial payment) */}
                  {bookingData.pricing.finalAmount > 0 && (
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLeftSide}>
                        <Ionicons
                          name={liveBooking.paymentMethod === 'cash' ? 'cash' : 'card'}
                          size={14}
                          color="#FF9800"
                        />
                        <Text style={styles.breakdownLabelCash}>
                          To Pay via {bookingData.cashPaymentOption === 'pickup' ? 'Cash (Pickup)' :
                            bookingData.cashPaymentOption === 'delivery' ? 'Cash (Delivery)' :
                              liveBooking.paymentMethod === 'online' ? 'Online' : 'Cash'}
                        </Text>
                      </View>
                      <Text style={styles.breakdownAmountCash}>
                        ₹{bookingData.pricing.finalAmount.toFixed(0)}
                      </Text>
                    </View>
                  )}

                  {/* Total Line */}
                  <View style={[styles.breakdownRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>
                      ₹{(
                        (bookingData.pricing.walletDeduction || 0) +
                        (bookingData.pricing.finalAmount || 0)
                      ).toFixed(0)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Standard Payment Display (non-split) */}
              {!bookingData.walletUsed || !bookingData.pricing?.walletDeduction && (
                <>
                  <View style={styles.totalPaidRow}>
                    <Text style={styles.totalPaidLabel}>
                      {liveBooking.paymentMethod === 'wallet' || liveBooking.payFrom?.toLowerCase().includes('wallet')
                        ? '💳 Total Paid from Wallet'
                        : '💳 Total Paid Online'}
                    </Text>
                    <Text style={styles.totalPaidAmount}>
                      ₹{bookingAmounts.totalPayable.toFixed(0)}
                    </Text>
                  </View>
                  {currentQuickFee > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownText}>
                        Base fare: ₹{bookingAmounts.basePrice} + Quick fee: ₹{bookingAmounts.quickFee}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {normalizedLocations?.length > 0 && (
            <View style={styles.routeInfo}>
              {/* LocationSelectorScreen-style visual route indicators */}
              <View style={styles.routeVisualContainer}>
                {/* Helper function to get locations to display */}
                {(() => {
                  const allLocations = normalizedLocations;
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

                  return locationsToShow.map((location, index) => {
                    const isFirst = location.isFirst;
                    const isLast = location.isLast;
                    const originalIndex = allLocations.findIndex(loc => loc.id === location.id);
                    const isLastInDisplayedArray = index === locationsToShow.length - 1;

                    return (
                      <View key={location.id || originalIndex} style={styles.routeItemContainer}>
                        <View style={styles.routeIndicatorContainer}>
                          {/* Stop indicator dot (LocationSelectorScreen style) */}
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
                  });
                })()}

                {/* Show intermediate stops info and expand/collapse button */}
                {normalizedLocations.filter(loc => !loc.isFirst && !loc.isLast).length > 0 && (
                  <View style={styles.expandCollapseContainer}>
                    {!isLocationExpanded && (
                      <View style={styles.hiddenStopsInfo}>
                        <Text style={styles.hiddenStopsText}>
                          +{normalizedLocations.filter(loc => !loc.isFirst && !loc.isLast).length} more stop{normalizedLocations.filter(loc => !loc.isFirst && !loc.isLast).length > 1 ? 's' : ''}
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
              </View>
            </View>
          )}

          {/* Cancel Request Button - Porter/Rapido Style */}
          <TouchableOpacity
            style={styles.cancelRequestButton}
            onPress={handleCancelRequest}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={20} color="#EC4D4A" />
            <Text style={styles.cancelRequestText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Cancel Bottom Sheet */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseCancelModal}
      >
        <TouchableOpacity
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={handleCloseCancelModal}
        >
          <TouchableOpacity
            style={styles.bottomSheetContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.selectReasonTitle}>Select your reason.</Text>

            {!showReasonOptions && (
              <TouchableOpacity
                style={styles.reasonInputContainer}
                onPress={() => setShowReasonOptions(true)}
                activeOpacity={0.7}
              >
                <View style={styles.reasonInput}>
                  <Text style={[styles.reasonInputText, !selectedCancelReason && styles.placeholderText]}>
                    {selectedCancelReason || "Select your reason."}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#666"
                  />
                </View>
              </TouchableOpacity>
            )}

            {showReasonOptions && (
              <View style={styles.reasonOptionsContainer}>
                {cancelReasons.map((reason, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.reasonOption,
                      selectedCancelReason === reason && styles.selectedReasonOption,
                      index === cancelReasons.length - 1 && styles.lastReasonOption
                    ]}
                    onPress={() => handleReasonSelect(reason)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.reasonOptionContent}>
                      <View style={[
                        styles.radioButton,
                        selectedCancelReason === reason && styles.radioButtonSelected
                      ]}>
                        {selectedCancelReason === reason && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.reasonOptionText,
                        selectedCancelReason === reason && styles.selectedReasonOptionText
                      ]}>
                        {reason}
                      </Text>
                    </View>
                    {selectedCancelReason === reason && (
                      <Ionicons name="checkmark" size={22} color="#EC4D4A" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customReasonInput}
                  placeholder="Enter your reason here..."
                  placeholderTextColor="#999"
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  autoFocus={true}
                />
              </View>
            )}

            {!showReasonOptions && !showCustomInput && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>You will miss :</Text>
                </View>

                <View style={styles.benefitsContainer}>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitText}>- Free Goods Insurance up to 2000</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitText}>- Proof of Delivery (POD)</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitText}>- Geofence secured Safe Delivery</Text>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.confirmCancelButton,
                (!selectedCancelReason || isCancelling) && styles.disabledCancelButton
              ]}
              onPress={handleConfirmCancel}
              disabled={!selectedCancelReason || isCancelling}
              activeOpacity={0.8}
            >
              {isCancelling ? (
                <>
                  <ActivityIndicator color="#fff" size="small" style={styles.cancelIcon} />
                  <Text style={styles.confirmCancelText}>CANCELLING...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="#fff" style={styles.cancelIcon} />
                  <Text style={styles.confirmCancelText}>CANCEL</Text>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  map: {
    width: "100%",
    height: height * 0.5,
  },
  contentScrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 24,
  },
  divider: {
    height: 3,
    width: "100%",
    backgroundColor: "#000000",
    marginTop: 8,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    marginBottom: 12,
  },
  bottomContent: {
    alignItems: "center",
  },
  bottamTitile: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    justifyContent: "center",
  },
  tipIconContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  tipIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  tipText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#555",
  },
  waitTitle: {
    marginTop: 8,
    fontSize: 18,
    textAlign: "center",
    color: "#000000",
  },
  tipAmountContainer: {
    marginTop: 12,
    width: "100%",
  },
  // Modern Progress Bar Styles
  modernProgressContainer: {
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
    paddingHorizontal: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#EC4D4A',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#EC4D4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  glowingDot: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    shadowColor: '#EC4D4A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#EC4D4A',
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: "#ddd",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#EC4D4A",
  },
  progressIndicator: {
    position: "absolute",
    right: 0,
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tipCard: {
    marginTop: 6,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  tipOptionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(2),
    marginBottom: scale(3),
    gap: scale(3),
  },
  tipOption: {
    paddingVertical: scale(6),
    paddingHorizontal: scale(8),
    borderRadius: scale(6),
    borderWidth: 0.5,
    borderColor: "#000000",
    backgroundColor: "#f9f9f9",
    marginHorizontal: scale(1),
    minWidth: scale(42),
    alignItems: "center",
  },
  addCustomButton: {
    backgroundColor: "#fff",
    borderColor: "#EC4D4A",
    borderWidth: 1.5,
    justifyContent: "center",
  },
  tipOptionsNote: {
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginBottom: 6,
  },
  selectedTip: {
    backgroundColor: "#EC4A4D",
    borderColor: "#EC4A4D",
  },
  tipAmountText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  selectedTipAmount: {
    color: "white",
    fontWeight: "bold",
  },
  tipOptionDisabled: {
    opacity: 0.6,
  },

  // Custom Tip Toggle & Input Styles
  customTipToggle: {
    marginTop: 8,
    alignItems: "center",
  },
  customTipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EC4D4A",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  customTipButtonText: {
    fontSize: 12,
    color: "#EC4D4A",
    fontWeight: "500",
    marginHorizontal: 6,
  },
  customInputSection: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  underlineInput: {
    fontSize: 18,
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: "#EC4D4A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
    textAlign: "center",
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: "#EC4D4A",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    elevation: 2,
    shadowColor: "#EC4D4A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  inputHint: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  updatingText: {
    textAlign: "center",
    fontSize: 14,
    color: "#EC4D4A",
    fontWeight: "600",
    marginTop: 8,
  },

  // Old Custom Amount Styles (keeping for compatibility)
  customAmountContainer: {
    marginTop: scale(12),
    padding: scale(12),
    backgroundColor: "#f8f9fa",
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#EC4D4A",
  },
  customAmountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: scale(12),
    marginBottom: scale(12),
  },
  currencySymbol: {
    fontSize: scale(16),
    fontWeight: "bold",
    color: "#333",
    marginRight: scale(8),
  },
  customAmountInput: {
    flex: 1,
    fontSize: scale(16),
    paddingVertical: scale(12),
    color: "#333",
  },
  customAmountButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(8),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: scale(10),
    backgroundColor: "#f8f9fa",
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: scale(14),
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: scale(10),
    backgroundColor: "#EC4D4A",
    borderRadius: scale(6),
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: scale(14),
    fontWeight: "600",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  // LocationSelectorScreen-style custom marker
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerNumber: {
    color: "#fff",
    fontSize: 14,
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
  bookingSummaryCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  paymentBadge: {
    backgroundColor: "#e8f5e8",
    color: "#2d5a2d",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "500",
  },
  vehicleInfo: {
    marginBottom: 4,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EC4D4A",
  },
  vehicleSubtext: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
    fontStyle: 'italic',
  },
  totalPaidContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  walletSplitBreakdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentBreakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  breakdownLeftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabelWallet: {
    fontSize: 13,
    color: '#27ae60',
    marginLeft: 6,
    fontWeight: '500',
  },
  breakdownLabelCash: {
    fontSize: 13,
    color: '#FF9800',
    marginLeft: 6,
    fontWeight: '500',
  },
  breakdownAmountWallet: {
    fontSize: 15,
    fontWeight: '700',
    color: '#27ae60',
  },
  breakdownAmountCash: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF9800',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
  totalPaidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPaidLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  totalPaidAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
  },
  breakdownRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  routeInfo: {
    marginTop: 4,
  },
  // LocationSelectorScreen-style route visual indicators
  routeVisualContainer: {
    marginTop: 4,
  },
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
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EC4D4A",
  },
  // Expand/Collapse styles
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
  // Cancel Request Button (Porter/Rapido Style)
  cancelRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#EC4D4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cancelRequestText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EC4D4A',
    marginLeft: 6,
  },
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '75%',
  },
  modalHeader: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitItem: {
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  selectReasonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'left',
    letterSpacing: -0.3,
  },
  reasonInputContainer: {
    marginBottom: 12,
  },
  reasonInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reasonInputText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
    fontWeight: '400',
  },
  reasonOptionsContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reasonOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  lastReasonOption: {
    borderBottomWidth: 0,
  },
  selectedReasonOption: {
    backgroundColor: '#FFF5F5',
  },
  reasonOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#EC4D4A',
    borderWidth: 2,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EC4D4A',
  },
  reasonOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  selectedReasonOptionText: {
    color: '#EC4D4A',
    fontWeight: '600',
  },
  customInputContainer: {
    marginBottom: 12,
  },
  customReasonInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1.5,
    borderColor: '#EC4D4A',
    minHeight: 100,
    maxHeight: 150,
    shadowColor: '#EC4D4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmCancelButton: {
    width: '100%',
    backgroundColor: '#EC4D4A',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#EC4D4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledCancelButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  confirmCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cancelIcon: {
    marginRight: 6,
  },
});

export default BookingSearchingScreen;
