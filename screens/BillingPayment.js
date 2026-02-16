import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createBooking, getFeeBreakdown, getWalletBalance } from "../utils/AuthApi";
import { API_URL } from "../utils/api";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import KeyboardAwareWrapper from "../components/KeyboardAwareWrapper";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");
const scale = (size) => Math.round((width / 375) * size);



const BillingPayment = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  // Route params
  const { bookingData } = route.params || {};
  const {
    selectedVehicle,
    locations,
    pricing,
    distance,
    duration,
    totalPrice,
    numberOfStops,
    stopCharge,
    selectedGoodsType: bookingSelectedGoodsType, // Extract selectedGoodsType from bookingData
  } = bookingData || {};

  // Debug logging
  console.log("BillingPayment - Full route.params:", route.params);
  console.log("BillingPayment - bookingData:", bookingData);
  console.log("BillingPayment - locations:", locations);
  console.log("BillingPayment - selectedVehicle:", selectedVehicle);
  console.log("BillingPayment - selectedGoodsType from booking:", bookingSelectedGoodsType);

  // State management - Use selectedGoodsType from bookingData if available, default to Furniture
  const [selectedGoodsType, setSelectedGoodsType] = useState(
    bookingSelectedGoodsType && bookingSelectedGoodsType.trim() !== "" 
      ? bookingSelectedGoodsType 
      : "Furniture" // Default to Furniture if no selection or empty string
  );
  
  // Debug: Log the selected goods type
  console.log("BillingPayment - Final selectedGoodsType:", selectedGoodsType);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedCashOption, setSelectedCashOption] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [showVehicleInfoModal, setShowVehicleInfoModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  // Wallet states
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletDeduction, setWalletDeduction] = useState(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  // Extract real price from backend data (e.g., "₹50" -> 50)
  const extractPrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.toString().replace(/[₹,]/g, "")) || 0;
  };

  // Get the FINAL total amount from backend (already includes platform fee and GST)
  // Backend sends: totalPrice: "₹50" OR selectedVehicle.price: "₹50"
  const realTotalPrice = extractPrice(
    totalPrice || selectedVehicle?.price || "0"
  );

  console.log("🎯 BILLING DATA DEBUG:");
  console.log("   totalPrice from route:", totalPrice);
  console.log("   selectedVehicle.price:", selectedVehicle?.price);
  console.log("   pricing object:", pricing);
  console.log("   Extracted Real Total Price (includes fees):", realTotalPrice);

  // State for fee breakdown
  const [feeBreakdown, setFeeBreakdown] = useState(null);
  const [isLoadingFees, setIsLoadingFees] = useState(true);
  
  // Calculate amounts - realTotalPrice already includes platform fee and GST from previous screen
  const [baseFare, setBaseFare] = useState(Math.round(realTotalPrice * 0.60)); // Adjust for fees already included
  const [distanceCharge, setDistanceCharge] = useState(Math.round(realTotalPrice * 0.15));
  const [serviceTax, setServiceTax] = useState(Math.round(realTotalPrice * 0.10));
  const [platformFee, setPlatformFee] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [riderEarnings, setRiderEarnings] = useState(Math.round(realTotalPrice * 0.85)); // Subtract platform fee
  const [baseAmount, setBaseAmount] = useState(realTotalPrice); // Will be calculated from breakdown
  
  const additionalCharges = distanceCharge + serviceTax;
  const subtotal = realTotalPrice; // Use realTotalPrice as it already includes all fees
  const [discount, setDiscount] = useState(0);
  const quickFee = 0; // Quick Fee disabled
  const [finalAmount, setFinalAmount] = useState(subtotal);

  console.log("💰 INITIAL AMOUNTS:");
  console.log("   Real Total Price (final): ₹" + realTotalPrice);
  console.log("   Base Amount (calculated): ₹" + baseAmount);
  console.log("   Base Fare: ₹" + baseFare);
  console.log("   Distance Charge: ₹" + distanceCharge);
  console.log("   Service Tax: ₹" + serviceTax);
  console.log("   Platform Fee: ₹" + platformFee);
  console.log("   GST Amount: ₹" + gstAmount);
  console.log("   Rider Earnings: ₹" + riderEarnings);

  // Fetch fee breakdown from backend to get the breakdown of realTotalPrice
  useEffect(() => {
    const fetchFeeBreakdown = async () => {
      if (realTotalPrice <= 0 || !selectedVehicle?.type) {
        setIsLoadingFees(false);
        return;
      }

      try {
        setIsLoadingFees(true);
        
        // Calculate platform fee directly from realTotalPrice
        const estimatedPlatformFeePercentage = getFallbackPlatformFee(selectedVehicle?.type);
        
        // Direct calculation: If total is ₹100 and fee is 8%, then platform fee = 100 * 0.08 = ₹8
        const directPlatformFee = Math.round(realTotalPrice * (estimatedPlatformFeePercentage / 100));
        const directGstAmount = 0; // GST is usually 0 or calculated separately
        const directBaseAmount = realTotalPrice - directGstAmount; // Total Price - GST only
        
        console.log("🔄 Fetching fee breakdown:", { 
          totalPrice: realTotalPrice,
          estimatedPlatformFeePercentage: estimatedPlatformFeePercentage,
          directPlatformFee: directPlatformFee,
          directBaseAmount: directBaseAmount,
          vehicleType: selectedVehicle.type
        });

        // Try to get detailed breakdown from backend using the base amount
        const response = await getFeeBreakdown(directBaseAmount, selectedVehicle.type);
        
        if (response.data && response.data.success) {
          const breakdown = response.data.breakdown;
          setFeeBreakdown(breakdown);
          
          // Use backend breakdown but ensure platform fee matches percentage of total
          const backendPlatformFee = Math.round(realTotalPrice * (breakdown.platformFeePercentage / 100));
          const backendGstAmount = breakdown.gstAmount || 0;
          const calculatedBaseAmount = realTotalPrice - backendGstAmount; // Total Price - GST only
          
          // Update display amounts
          setBaseAmount(calculatedBaseAmount);
          setBaseFare(breakdown.displayBreakdown.baseFare);
          setDistanceCharge(breakdown.displayBreakdown.distanceCharge);
          setServiceTax(breakdown.displayBreakdown.serviceTax);
          setPlatformFee(backendPlatformFee); // Use calculated platform fee
          setGstAmount(backendGstAmount);
          setRiderEarnings(breakdown.riderEarnings);
          
          console.log("✅ Fee breakdown updated:", {
            realTotalPrice: realTotalPrice,
            calculatedBaseAmount: calculatedBaseAmount,
            baseFare: breakdown.displayBreakdown.baseFare,
            distanceCharge: breakdown.displayBreakdown.distanceCharge,
            serviceTax: breakdown.displayBreakdown.serviceTax,
            platformFee: backendPlatformFee,
            platformFeePercentage: breakdown.platformFeePercentage,
            gstAmount: backendGstAmount,
            gstPercentage: breakdown.gstPercentage,
            riderEarnings: breakdown.riderEarnings,
            vehicleType: breakdown.vehicleType
          });
          
          console.log("🔄 Platform fee for", breakdown.vehicleType, ":", backendPlatformFee, "(", breakdown.platformFeePercentage, "%)" );
          console.log("💰 Base amount calculated:", calculatedBaseAmount);
        }
      } catch (error) {
        console.error("❌ Error fetching fee breakdown:", error);
        // Keep using frontend fallback calculation on error
        console.log("⚠️ Using fallback calculation due to API error");
        
        // Set fallback platform fee based on vehicle type - calculate from total price
        const fallbackPlatformFeePercentage = getFallbackPlatformFee(selectedVehicle?.type);
        const fallbackGstAmount = 0; // Default GST to 0
        
        // Calculate platform fee directly from total price (e.g., ₹100 * 8% = ₹8)
        const calculatedPlatformFee = Math.round(realTotalPrice * (fallbackPlatformFeePercentage / 100));
        const calculatedBaseAmount = realTotalPrice - fallbackGstAmount; // Total Price - GST only
        
        setPlatformFee(calculatedPlatformFee);
        setGstAmount(fallbackGstAmount);
        setBaseAmount(calculatedBaseAmount);
        
        console.log("🔄 Fallback calculation for", selectedVehicle?.type, ":", {
          realTotalPrice: realTotalPrice,
          calculatedBaseAmount: calculatedBaseAmount,
          platformFee: calculatedPlatformFee,
          platformFeePercentage: fallbackPlatformFeePercentage,
          gstAmount: fallbackGstAmount,
          vehicleType: selectedVehicle?.type,
          calculation: `${realTotalPrice} * ${fallbackPlatformFeePercentage}% = ${calculatedPlatformFee}`
        });
      } finally {
        setIsLoadingFees(false);
      }
    };

    fetchFeeBreakdown();
  }, [realTotalPrice, selectedVehicle?.type]);

  // Fallback platform fee calculation
  const getFallbackPlatformFee = (vehicleType) => {
    if (!vehicleType) return 10; // Default 10%
    const type = vehicleType.toLowerCase();
    if (type.includes('2w')) return 8;
    if (type.includes('3w')) return 10;
    if (type.includes('truck')) return 12;
    if (type.includes('e-loader')) return 11;
    return 10; // Default fallback
  };

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setIsLoadingWallet(true);
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await getWalletBalance(token);
          const balance = response.data.balance || 0;
          setWalletBalance(balance);
          console.log('💰 Wallet balance loaded:', balance);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setWalletBalance(0);
      } finally {
        setIsLoadingWallet(false);
      }
    };
    fetchWalletBalance();
  }, []);

  // Calculate final amount with wallet deduction
  useEffect(() => {
    let calculatedAmount = subtotal - discount + quickFee;
    
    if (useWallet && walletBalance > 0) {
      const deduction = Math.min(walletBalance, calculatedAmount);
      setWalletDeduction(deduction);
      calculatedAmount = Math.max(0, calculatedAmount - deduction);
      console.log('💳 Wallet deduction applied:', deduction);
    } else {
      setWalletDeduction(0);
    }
    
    setFinalAmount(calculatedAmount);
  }, [discount, subtotal, quickFee, useWallet, walletBalance]);

  // Fetch available coupons when modal opens (including user's personal referral coupon)
  useEffect(() => {
    const fetchCoupons = async () => {
      if (showCouponModal && availableCoupons.length === 0) {
        setIsLoadingCoupons(true);
        try {
          // Get user ID from storage
          const userDataStr = await AsyncStorage.getItem("userData");
          const userData = userDataStr ? JSON.parse(userDataStr) : null;
          const userId = userData?.user?._id || userData?._id || userData?.customerId || userData?.phone;

          if (userId) {
            // Fetch user-specific coupons (includes personal referral coupon)
            const response = await axios.get(
              `${API_URL}/coupons/user/${userId}`
            );
            
            if (response.data && response.data.coupons) {
              console.log('🎁 Fetched user-specific coupons:', response.data.coupons);
              setAvailableCoupons(response.data.coupons);
            }
          } else {
            // Fallback to public coupons only
            const response = await axios.get(
              `${API_URL}/coupons/all?status=Active&limit=50`
            );
            
            if (response.data && response.data.coupons) {
              console.log('📦 Fetched public coupons:', response.data.coupons);
              setAvailableCoupons(response.data.coupons);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching coupons:', error);
          // Fail silently - user can still enter coupon manually
        } finally {
          setIsLoadingCoupons(false);
        }
      }
    };

    fetchCoupons();
  }, [showCouponModal]);

  // Goods types with proper icons
  const goodsTypes = [
    { id: 1, name: "Furniture", icon: "home" },
    { id: 2, name: "Electronics", icon: "cog" },
    { id: 3, name: "Boxes", icon: "inbox" },
    { id: 4, name: "Other", icon: "plus-square" },
  ];

  // If selectedGoodsType is not in the predefined list, create a dynamic entry
  const isCustomGoodsType = selectedGoodsType && !goodsTypes.some(item => item.name === selectedGoodsType);
  const displayGoodsTypes = isCustomGoodsType 
    ? [
        { id: 99, name: selectedGoodsType, icon: "cube" }, // Add the selected custom type FIRST
        ...goodsTypes.slice(0, -1), // All except "Other"
        goodsTypes[goodsTypes.length - 1] // Add "Other" at the end
      ]
    : (() => {
        // Even for predefined goods types, move the selected one to the front
        const otherItems = goodsTypes.filter(item => item.name !== selectedGoodsType);
        const selectedItem = goodsTypes.find(item => item.name === selectedGoodsType);
        return selectedItem ? [selectedItem, ...otherItems] : goodsTypes;
      })();

  // Handle coupon application with backend validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await axios.get(
        `${API_URL}/coupons/code/${couponCode.trim()}`
      );

      if (response.data) {
        const coupon = response.data;

        // Validate coupon status
        if (!coupon.isActive) {
          Alert.alert("Invalid Coupon", "This coupon is no longer active");
          setIsApplyingCoupon(false);
          return;
        }

        // Check expiry
        if (coupon.validityEnd && new Date(coupon.validityEnd) < new Date()) {
          Alert.alert("Expired Coupon", "This coupon has expired");
          setIsApplyingCoupon(false);
          return;
        }

        // Check minimum order value
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          Alert.alert(
            "Minimum Order Not Met",
            `This coupon requires a minimum order of ₹${coupon.minOrderAmount}`
          );
          setIsApplyingCoupon(false);
          return;
        }

        // Calculate discount based on backend structure
        let calculatedDiscount = 0;
        if (coupon.discountType === "Percentage") {
          calculatedDiscount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
            calculatedDiscount = coupon.maxDiscountAmount;
          }
        } else if (coupon.discountType === "Flat Amount") {
          calculatedDiscount = coupon.value;
        }

        // Ensure discount doesn't exceed subtotal
        if (calculatedDiscount > subtotal) {
          calculatedDiscount = subtotal;
        }

        // Apply discount
        setDiscount(calculatedDiscount);
        setIsCouponApplied(true);
        setAppliedCouponData(coupon);
        // Success shown inline via green checkmark
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      Alert.alert(
        "Invalid Coupon",
        error.response?.data?.message || "This coupon code is invalid"
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setDiscount(0);
    setIsCouponApplied(false);
    setAppliedCouponData(null);
    setCouponCode("");
  };

  // Handle coupon application from modal (backend coupons)
  const handleApplyCouponFromModal = (coupon) => {
    // Check eligibility
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      Alert.alert(
        "Minimum Order Not Met",
        `This coupon requires a minimum order of ₹${coupon.minOrderAmount}`
      );
      return;
    }

    // Calculate discount based on backend structure
    let calculatedDiscount = 0;
    if (coupon.discountType === "Percentage") {
      calculatedDiscount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
        calculatedDiscount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === "Flat Amount") {
      calculatedDiscount = coupon.value;
    }

    // Ensure discount doesn't exceed subtotal
    if (calculatedDiscount > subtotal) {
      calculatedDiscount = subtotal;
    }

    // Apply discount
    setDiscount(calculatedDiscount);
    setIsCouponApplied(true);
    setAppliedCouponData(coupon);
    setCouponCode(coupon.couponCode);
    setShowCouponModal(false);
    // Success shown inline via green checkmark
  };

  // Handle payment selection
  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
    if (method === "online") {
      setSelectedCashOption("");
      setShowCashModal(false);
    } else if (method === "cash") {
      setShowCashModal(true);
    }
  };

  // Handle cash option selection
  const handleCashOptionSelect = (option) => {
    setSelectedCashOption(option);
    setShowCashModal(false);
  };

  // Handle wallet-only booking
  const handleWalletBooking = async () => {
    if (isCreatingBooking) {
      console.log("Booking creation already in progress, ignoring duplicate call");
      return;
    }

    setIsCreatingBooking(true);
    
    try {
      // Get user data
      const userDataStr = await AsyncStorage.getItem("userData");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;

      // Handle different user data structures
      const userId =
        userData?.user?._id || userData?._id || userData?.id || userData?.phone;

      console.log("User data:", userData);
      console.log("Extracted userId:", userId);

      if (!userId) {
        setIsCreatingBooking(false);
        Alert.alert("Error", "User not found. Please login again.");
        navigation.navigate("Login");
        return;
      }

      // Extract user name and phone from userData
      const userName = userData?.user?.name || userData?.name || "User";
      const userPhone = userData?.user?.phone || userData?.phone || "";

      // Helper: flatten coordinates to latitude/longitude
      const flattenCoords = (coords) => {
        if (!coords) return { latitude: 0, longitude: 0 };
        if (coords.latitude !== undefined && coords.longitude !== undefined) {
          return { latitude: coords.latitude, longitude: coords.longitude };
        }
        if (coords.lat !== undefined && coords.lng !== undefined) {
          return { latitude: coords.lat, longitude: coords.lng };
        }
        return { latitude: 0, longitude: 0 };
      };

      // Vehicle type enum (must match backend exactly)
      const getVehicleTypeEnum = (type) => {
        if (!type) return "2W"; // Default to 2W instead of Truck
        const t = type.toLowerCase();
        
        // Map vehicle names to categories
        if (t.includes("bike") || t.includes("scooter") || t.includes("electric scooter") || t.startsWith("2w")) {
          return "2W";
        }
        if (t.includes("auto") || t.includes("rickshaw") || t.startsWith("3w")) {
          return "3W";
        }
        if (t.includes("e-loader") || t.includes("electric auto")) {
          return "E-LOADER";
        }
        if (t.includes("truck") || t.includes("tata") || t.includes("feet")) {
          return "TRUCK";
        }
        
        return "2W"; // Default to 2W instead of Truck
      };

      // Build fromAddress
      const pickup = locations?.pickup || (locations && locations.length > 0 ? locations[0] : {}) || {};
      const pickupCoords = flattenCoords(pickup.coordinates);
      const fromAddress = {
        address: pickup.address || "",
        latitude: pickupCoords.latitude,
        longitude: pickupCoords.longitude,
        receiverName: pickup.receiverDetails?.receiverName || pickup.receiverName || userName || "",
        receiverMobile: pickup.receiverDetails?.receiverNumber || pickup.receiverMobile || pickup.phone || userPhone || "",
        landmark: pickup.receiverDetails?.landmark || pickup.landmark || "",
        tag: pickup.receiverDetails?.saveAs || pickup.tag || "",
      };

      // BUILD ALL DROP LOCATIONS WITH COORDINATES
      const allDropLocations = [];
      
      if (locations && Array.isArray(locations)) {
        console.log(`📍 Building drop locations from ${locations.length} total locations`);
        
        for (let i = 1; i < locations.length; i++) {
          const loc = locations[i];
          const coords = flattenCoords(loc.coordinates);
          
          // Extract receiver details from nested receiverDetails object
          const receiverName = loc.receiverDetails?.receiverName || loc.receiverName || "";
          const receiverNumber = loc.receiverDetails?.receiverNumber || loc.receiverMobile || loc.phone || "";
          const pincode = loc.receiverDetails?.pincode || loc.pincode || "";
          const tag = loc.receiverDetails?.saveAs || loc.tag || "";
          const landmark = loc.receiverDetails?.landmark || loc.landmark || "";
          
          const dropPoint = {
            address: loc.address || "",
            Address: loc.address || "",
            Address1: loc.address || "",
            Address2: "",
            latitude: coords.latitude,
            longitude: coords.longitude,
            ReciversName: receiverName,
            ReciversMobileNum: receiverNumber,
            landmark: landmark,
            pincode: pincode,
            professional: tag,
          };
          
          allDropLocations.push(dropPoint);
          console.log(`  Drop ${i}: ${dropPoint.address} | Receiver: ${receiverName} • ${receiverNumber} | Pincode: ${pincode}`);
        }
      } else {
        console.log("⚠️ Locations is not an array, using fallback");
        const drop = locations?.drop || {};
        const dropCoords = flattenCoords(drop.coordinates);
        allDropLocations.push({
          address: drop.address || "",
          Address: drop.address || "",
          Address1: drop.address || "",
          Address2: "",
          latitude: dropCoords.latitude,
          longitude: dropCoords.longitude,
          ReciversName: drop.receiverName || "",
          ReciversMobileNum: drop.receiverMobile || drop.phone || "",
          landmark: drop.landmark || "",
          pincode: drop.pincode || "",
          professional: drop.tag || "",
        });
      }
      
      console.log(`✅ Total drop locations to send: ${allDropLocations.length}`);

      // Build midStops
      const midStops = [];
      if (locations && Array.isArray(locations)) {
        for (let i = 1; i < locations.length - 1; i++) {
          const stop = locations[i];
          if (stop && typeof stop === "object") {
            midStops.push(stop.address || "");
          }
        }
      }

      const dbBookingData = {
        userId: userId,
        amountPay: finalAmount.toString(),
        payFrom: "Wallet Payment",
        fromAddress,
        dropLocation: allDropLocations,
        stops: midStops,
        vehicleType: getVehicleTypeEnum(
          selectedVehicle?.vehicleType || selectedVehicle?.type
        ),
        vehicleSubType: selectedVehicle?.id || null,
        vehicleName: selectedVehicle?.type || "Vehicle",
        goodsType: selectedGoodsType,
        distance: distance || "0 km",
        duration: duration || "0 mins",
        baseFare: baseFare.toString(),
        additionalCharges: additionalCharges.toString(),
        discount: discount.toString(),
        couponCode: isCouponApplied ? couponCode : "",
        price: subtotal,
        quickFee: quickFee,
        
        // Wallet information - now supports partial payments
        walletUsed: useWallet && walletDeduction > 0,
        walletAmount: walletDeduction,
        partialWalletPayment: useWallet && walletDeduction > 0 && finalAmount > 0,
        remainingAmount: finalAmount,
        
        // Include fee breakdown for backend processing
        feeBreakdownData: feeBreakdown ? {
          platformFee: platformFee,
          gstAmount: gstAmount,
          riderEarnings: riderEarnings,
          vehicleTypeUsed: feeBreakdown.vehicleType,
          settingsVersion: feeBreakdown.settingsVersion
        } : null,
      };

      console.log("Creating wallet booking with data:", dbBookingData);
      console.log("💳 Wallet Info:", {
        walletUsed: useWallet,
        walletAmount: walletDeduction,
        partialPayment: useWallet && walletDeduction > 0 && finalAmount > 0,
        remainingAmount: finalAmount,
        paymentMethod: finalAmount > 0 ? selectedPayment : 'wallet'
      });
      console.log("📦 Booking Pickup:", {
        address: fromAddress.address,
        receiverName: fromAddress.receiverName,
        receiverMobile: fromAddress.receiverMobile
      });
      console.log("📦 Booking Drop Locations:", allDropLocations.map((drop, idx) => ({
        index: idx + 1,
        address: drop.address,
        receiverName: drop.ReciversName,
        receiverMobile: drop.ReciversMobileNum,
        pincode: drop.pincode
      })));

      const response = await createBooking(dbBookingData);

      console.log("Booking API response:", response.data);

      if (response && response.data && response.data._id) {
        // NOTE: Wallet deduction now happens on backend when order is completed
        // No need to deduct here during booking creation
        console.log('ℹ️ Wallet payment selected - will be deducted when order is completed');
        if (walletDeduction > 0) {
          console.log(`💳 Wallet payment pending: ₹${walletDeduction} (will be deducted on completion)`);
        }

        // Store booking data
        const completeBookingData = {
          ...bookingData,
          selectedVehicle,
          locations,
          pricing: {
            baseFare,
            distanceCharge,
            serviceTax,
            discount,
            finalAmount,
            walletDeduction,
          },
          goodsType: selectedGoodsType,
          paymentMethod: "wallet",
          cashPaymentOption: null,
          couponCode: isCouponApplied ? couponCode : null,
          walletUsed: true,
          distance,
          duration,
          quickFee,
        };

        await AsyncStorage.setItem(
          "lastBookingData",
          JSON.stringify(completeBookingData)
        );
        await AsyncStorage.setItem(
          "currentBooking",
          JSON.stringify(response.data)
        );

        // Navigate to waiting screen
        const completeBookingDataForNav = {
          ...bookingData,
          selectedVehicle,
          locations,
          pricing: {
            baseFare,
            distanceCharge,
            serviceTax,
            discount,
            finalAmount,
            walletDeduction,
          },
          goodsType: selectedGoodsType,
          paymentMethod: "wallet",
          cashPaymentOption: null,
          couponCode: isCouponApplied ? couponCode : null,
          walletUsed: true,
          distance,
          duration,
          quickFee,
          price: response.data.price || finalAmount, // Add price from server response
          amountPay: response.data.amountPay,
          _id: response.data._id,
          serverResponse: response.data,
        };
        
        navigation.navigate("WaitingDriver", {
          bookingId: response.data._id,
          bookingData: completeBookingDataForNav,
        });
        
        setIsCreatingBooking(false);
      } else {
        setIsCreatingBooking(false);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      setIsCreatingBooking(false);
      console.error("Booking error:", error);
      
      let errorMessage = "Failed to create booking. Please try again.";
      
      if (error.code === 'ECONNABORTED' || error.message === 'timeout exceeded') {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  // Handle proceed button
  const handleProceed = async () => {
    // If wallet covers full amount, proceed with wallet payment
    if (useWallet && finalAmount === 0) {
      handleWalletBooking();
      return;
    }

    // Validate payment method - only required if there's remaining amount after wallet
    if (finalAmount > 0 && !selectedPayment) {
      Alert.alert(
        "Payment Method Required", 
        `Please select a payment method for the remaining ₹${finalAmount.toFixed(0)}`
      );
      return;
    }
    
    // If wallet covers full amount, ensure payment method is set to wallet
    if (finalAmount === 0 && useWallet) {
      // Auto-set payment to wallet for backend
      console.log('💳 Wallet covers full amount - no additional payment needed');
    }

    if (selectedPayment === "cash" && !selectedCashOption) {
      Alert.alert("Error", "Please select when to pay");
      return;
    }

    // If online payment is selected, navigate directly to online payment
    if (selectedPayment === "online") {
      try {
        // Get user data
        const userDataStr = await AsyncStorage.getItem("userData");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;

        // Handle different user data structures
        const userId =
          userData?.user?._id || userData?._id || userData?.id || userData?.phone;

        if (!userId) {
          Alert.alert("Error", "User not found. Please login again.");
          navigation.navigate("Login");
          return;
        }

        // Prepare booking data for online payment
        const completeBookingData = {
          ...bookingData,
          selectedVehicle,
          locations,
          pricing: {
            baseFare,
            distanceCharge,
            serviceTax,
            discount,
            finalAmount,
          },
          goodsType: selectedGoodsType,
          paymentMethod: selectedPayment,
          cashPaymentOption: selectedCashOption,
          couponCode: isCouponApplied ? couponCode : null,
          distance,
          duration,
          quickFee,
        };

        // Navigate to online payment
        navigation.navigate("OnlinePayment", {
          bookingData: completeBookingData,
          amount: finalAmount,
        });
      } catch (error) {
        console.error("Navigation error:", error);
        Alert.alert("Error", "Failed to proceed. Please try again.");
      }
      return;
    }

    // Cash payment - proceed directly without confirmation popup
    if (selectedPayment === "cash") {
      handleCashBooking();
    }
  };

  // Handle cash booking after confirmation
  const handleCashBooking = async () => {
    if (isCreatingBooking) {
      console.log("Booking creation already in progress, ignoring duplicate call");
      return;
    }

    setIsCreatingBooking(true);
    
    try {
      // Get user data
      const userDataStr = await AsyncStorage.getItem("userData");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;

      // Handle different user data structures
      const userId =
        userData?.user?._id || userData?._id || userData?.id || userData?.phone;

      console.log("User data:", userData);
      console.log("Extracted userId:", userId);

      if (!userId) {
        setIsCreatingBooking(false);
        Alert.alert("Error", "User not found. Please login again.");
        navigation.navigate("Login");
        return;
      }

      // Extract user name and phone from userData
      const userName = userData?.user?.name || userData?.name || "User";
      const userPhone = userData?.user?.phone || userData?.phone || "";

      // Cash payment - create booking directly
      // Helper: flatten coordinates to latitude/longitude
      const flattenCoords = (coords) => {
        if (!coords) return { latitude: 0, longitude: 0 };
        if (coords.latitude !== undefined && coords.longitude !== undefined) {
          return { latitude: coords.latitude, longitude: coords.longitude };
        }
        if (coords.lat !== undefined && coords.lng !== undefined) {
          return { latitude: coords.lat, longitude: coords.lng };
        }
        return { latitude: 0, longitude: 0 };
      };

      // Vehicle type enum (must match backend exactly)
      // You may need to adjust this list to match your backend schema
      const getVehicleTypeEnum = (type) => {
        if (!type) return "2W"; // Default to 2W instead of Truck
        const t = type.toLowerCase();
        
        // Map vehicle names to categories
        if (t.includes("bike") || t.includes("scooter") || t.includes("electric scooter") || t.startsWith("2w")) {
          return "2W";
        }
        if (t.includes("auto") || t.includes("rickshaw") || t.startsWith("3w")) {
          return "3W";
        }
        if (t.includes("e-loader") || t.includes("electric auto")) {
          return "E-LOADER";
        }
        if (t.includes("truck") || t.includes("tata") || t.includes("feet")) {
          return "TRUCK";
        }
        
        return "2W"; // Default to 2W instead of Truck
      };

      // Build fromAddress
      const pickup = locations?.pickup || (locations && locations.length > 0 ? locations[0] : {}) || {};
      const pickupCoords = flattenCoords(pickup.coordinates);
      const fromAddress = {
        address: pickup.address || "",
        latitude: pickupCoords.latitude,
        longitude: pickupCoords.longitude,
        receiverName: pickup.receiverDetails?.receiverName || pickup.receiverName || userName || "",
        receiverMobile: pickup.receiverDetails?.receiverNumber || pickup.receiverMobile || pickup.phone || userPhone || "",
        landmark: pickup.receiverDetails?.landmark || pickup.landmark || "",
        tag: pickup.receiverDetails?.saveAs || pickup.tag || "",
      };

      // ✅ BUILD ALL DROP LOCATIONS WITH COORDINATES
      // Include ALL locations except the first one (pickup)
      const allDropLocations = [];
      
      if (locations && Array.isArray(locations)) {
        console.log(`📍 Building drop locations from ${locations.length} total locations`);
        
        // Start from index 1 (skip pickup at index 0)
        for (let i = 1; i < locations.length; i++) {
          const loc = locations[i];
          const coords = flattenCoords(loc.coordinates);
          
          // Extract receiver details from nested receiverDetails object
          const receiverName = loc.receiverDetails?.receiverName || loc.receiverName || "";
          const receiverNumber = loc.receiverDetails?.receiverNumber || loc.receiverMobile || loc.phone || "";
          const pincode = loc.receiverDetails?.pincode || loc.pincode || "";
          const tag = loc.receiverDetails?.saveAs || loc.tag || "";
          const landmark = loc.receiverDetails?.landmark || loc.landmark || "";
          
          const dropPoint = {
            address: loc.address || "",
            Address: loc.address || "",
            Address1: loc.address || "",
            Address2: "",
            latitude: coords.latitude,
            longitude: coords.longitude,
            ReciversName: receiverName,
            ReciversMobileNum: receiverNumber,
            landmark: landmark,
            pincode: pincode,
            professional: tag,
          };
          
          allDropLocations.push(dropPoint);
          console.log(`  Drop ${i}: ${dropPoint.address} | Receiver: ${receiverName} • ${receiverNumber} | Pincode: ${pincode}`);
        }
      } else {
        // Fallback to old logic if locations is not an array
        console.log("⚠️ Locations is not an array, using fallback");
        const drop = locations?.drop || {};
        const dropCoords = flattenCoords(drop.coordinates);
        allDropLocations.push({
          address: drop.address || "",
          Address: drop.address || "",
          Address1: drop.address || "",
          Address2: "",
          latitude: dropCoords.latitude,
          longitude: dropCoords.longitude,
          ReciversName: drop.receiverName || "",
          ReciversMobileNum: drop.receiverMobile || drop.phone || "",
          landmark: drop.landmark || "",
          pincode: drop.pincode || "",
          professional: drop.tag || "",
        });
      }
      
      console.log(`✅ Total drop locations to send: ${allDropLocations.length}`);

      // Build midStops as array of address strings for backward compatibility
      const midStops = [];
      if (locations && Array.isArray(locations)) {
        for (let i = 1; i < locations.length - 1; i++) {
          const stop = locations[i];
          if (stop && typeof stop === "object") {
            midStops.push(stop.address || "");
          }
        }
      }

      const dbBookingData = {
        userId: userId,
        amountPay: finalAmount.toString(),
        payFrom:
          selectedCashOption === "pickup"
            ? "Pay on Pickup"
            : "Pay on Delivery",
        fromAddress,
        dropLocation: allDropLocations, // ✅ Send ALL drops with coordinates
        stops: midStops, // Rename midStops to stops
        vehicleType: getVehicleTypeEnum(
          selectedVehicle?.vehicleType || selectedVehicle?.type
        ),
        vehicleSubType: selectedVehicle?.id || null,
        vehicleName: selectedVehicle?.type || "Vehicle",
        goodsType: selectedGoodsType,
        distance: distance || "0 km",
        duration: duration || "0 mins",
        baseFare: baseFare.toString(),
        additionalCharges: additionalCharges.toString(),
        discount: discount.toString(),
        couponCode: isCouponApplied ? couponCode : "",
        price: subtotal,
        quickFee: quickFee,
        
        // Wallet information
        walletUsed: useWallet,
        walletAmount: walletDeduction,
        
        // Include fee breakdown for backend processing
        feeBreakdownData: feeBreakdown ? {
          platformFee: platformFee,
          gstAmount: gstAmount,
          riderEarnings: riderEarnings,
          vehicleTypeUsed: feeBreakdown.vehicleType,
          settingsVersion: feeBreakdown.settingsVersion
        } : null,
      };

      console.log("Creating booking with data:", dbBookingData);
      console.log("📦 Booking Pickup:", {
        address: fromAddress.address,
        receiverName: fromAddress.receiverName,
        receiverMobile: fromAddress.receiverMobile
      });
      console.log("📦 Booking Drop Locations:", allDropLocations.map((drop, idx) => ({
        index: idx + 1,
        address: drop.address,
        receiverName: drop.ReciversName,
        receiverMobile: drop.ReciversMobileNum,
        pincode: drop.pincode
      })));

      const response = await createBooking(dbBookingData);

      console.log("Booking API response:", response.data);

      if (response && response.data && response.data._id) {
        // Deduct wallet amount if wallet was used
        if (useWallet && walletDeduction > 0) {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.post(
              `${API_URL}/wallet/debit`,
              {
                userId: userId,
                amount: walletDeduction,
                bookingId: response.data._id,
                description: `Payment for booking #${response.data.bookingId || response.data._id.toString().slice(-6)}`
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            console.log('✅ Wallet deducted successfully:', walletDeduction);
          } catch (walletError) {
            console.error('⚠️ Wallet deduction failed:', walletError);
            // Booking is created, but wallet deduction failed - continue anyway
          }
        }

        // Store booking data
        const completeBookingData = {
          ...bookingData,
          selectedVehicle,
          locations,
          pricing: {
            baseFare,
            distanceCharge,
            serviceTax,
            discount,
            finalAmount,
            walletDeduction,
          },
          goodsType: selectedGoodsType,
          paymentMethod: selectedPayment,
          cashPaymentOption: selectedCashOption,
          couponCode: isCouponApplied ? couponCode : null,
          walletUsed: useWallet,
          distance,
          duration,
          quickFee,
        };

        await AsyncStorage.setItem(
          "lastBookingData",
          JSON.stringify(completeBookingData)
        );
        await AsyncStorage.setItem(
          "currentBooking",
          JSON.stringify(response.data)
        );

        // Navigate directly without success popup
        const completeBookingDataForNav = {
          ...bookingData, // Original booking data with locations
          selectedVehicle,
          locations,
          pricing: {
            baseFare,
            distanceCharge,
            serviceTax,
            discount,
            finalAmount,
            walletDeduction,
          },
          goodsType: selectedGoodsType,
          paymentMethod: selectedPayment,
          cashPaymentOption: selectedCashOption,
          couponCode: isCouponApplied ? couponCode : null,
          walletUsed: useWallet,
          distance,
          duration,
          quickFee,
          price: response.data.price || finalAmount, // Add price from server response
          amountPay: response.data.amountPay,
          _id: response.data._id, // Add booking ID from server
          serverResponse: response.data, // Keep server response for reference
        };
        
        navigation.navigate("WaitingDriver", {
          bookingId: response.data._id,
          bookingData: completeBookingDataForNav,
        });
        
        setIsCreatingBooking(false);
      } else {
        setIsCreatingBooking(false);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      setIsCreatingBooking(false);
      console.error("Booking error:", error);
      
      let errorMessage = "Failed to create booking. Please try again.";
      
      if (error.code === 'ECONNABORTED' || error.message === 'timeout exceeded') {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  // Handle info icon press
  const handleInfoPress = () => {
    setShowVehicleInfoModal(true);
  };

  // Get vehicle image source
  const getVehicleImageSource = () => {
    if (!selectedVehicle?.image) {
      return require("../assets/truck1.png");
    }

    const img = selectedVehicle.image;

    // Handle object with uri property
    if (typeof img === "object" && img.uri) {
      return img;
    }

    // Handle string URL
    if (typeof img === "string") {
      return { uri: img };
    }

    // Handle require() or other formats
    return img;
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Payment & Booking" />
      <KeyboardAwareWrapper
        enableScrollView={true}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enableOnAndroid={true}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Vehicle Card with Trip Summary */}
        <View style={styles.card}>
          {/* Info Icon in top right corner */}
          <TouchableOpacity 
            style={styles.vehicleInfoIcon}
            onPress={handleInfoPress}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color="#0066FF" 
            />
          </TouchableOpacity>

          <View style={styles.vehicleContainer}>
            <Image
              source={getVehicleImageSource()}
              style={styles.vehicleImage}
              resizeMode="contain"
            />
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleTitle} numberOfLines={1}>
                {selectedVehicle?.type || selectedVehicle?.subType || "Vehicle"}
              </Text>
              <Text style={styles.vehicleType} numberOfLines={1}>
                {selectedVehicle?.weight || selectedVehicle?.time || "N/A"}
              </Text>
            </View>
          </View>

          {/* Trip Summary */}
          <View style={styles.tripSummary}>
            <View style={styles.tripRow}>
              <Ionicons name="location" size={14} color="#27ae60" />
              <Text style={styles.tripText} numberOfLines={1}>
                {locations?.pickup?.address ||
                  (locations && locations.length > 0 ? locations[0]?.address : null) ||
                  "Pickup location"}
              </Text>
            </View>

            {locations && locations.length > 2 && (
              <View style={styles.tripRow}>
                <MaterialIcons name="more-horiz" size={14} color="#f39c12" />
                <Text style={styles.tripText}>
                  {locations.length - 2}{" "}
                  {locations.length - 2 === 1 ? "stop" : "stops"}
                </Text>
              </View>
            )}

            <View style={styles.tripRow}>
              <Ionicons name="location" size={14} color="#e74c3c" />
              <Text style={styles.tripText} numberOfLines={1}>
                {locations?.drop?.address ||
                  (locations && locations.length > 0 ? locations[locations.length - 1]?.address : null) ||
                  "Drop location"}
              </Text>
            </View>
            
            {/* Distance display commented out */}
            {/* {distance && distance > 0 && (
              <View style={styles.tripRow}>
                <MaterialIcons name="straighten" size={14} color="#0066FF" />
                <Text style={[styles.tripText, { fontWeight: '600', color: '#0066FF' }]}>
                  Total Distance: {typeof distance === 'string' ? distance : `${distance.toFixed(1)} km`}
                </Text>
              </View>
            )} */}
          </View>
        </View>

        {/* Coupon Section */}
        <View style={styles.couponCard}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>

          {!isCouponApplied ? (
            <TouchableOpacity 
              style={styles.couponClickableField}
              onPress={() => setShowCouponModal(true)}
            >
              <View style={styles.couponFieldContent}>
                <Ionicons name="pricetag-outline" size={20} color="#EC4D4A" />
                <Text style={styles.couponFieldText}>Enter coupon code</Text>
              </View>
              <View style={styles.couponFieldRight}>
                <Text style={styles.applyText}>Apply</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.appliedCouponRow}>
              <View style={styles.appliedCouponInfo}>
                <Ionicons name="pricetag" size={16} color="#27ae60" />
                <Text style={styles.appliedCouponText}>{couponCode}</Text>
                <Text style={styles.savingsText}>
                  Saved ₹{discount.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Ionicons name="close-circle" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bill Details */}
        <View style={styles.billingCard}>
          <View style={styles.billHeader}>
            <MaterialIcons name="receipt" size={16} color="#666" />
            <Text style={styles.billHeaderTitle}>Bill details</Text>
            {isLoadingFees && (
              <ActivityIndicator size="small" color="#0066FF" style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Fee Breakdown Section */}
          <View style={styles.feeBreakdownSection}>
            {/* Base Amount */}
            <View style={styles.chargeRow}>
              <View style={styles.chargeLeft}>
                <MaterialIcons name="receipt" size={14} color="#666" />
                <Text style={styles.chargeLabel}>Base Amount</Text>
              </View>
              <Text style={styles.chargeAmount}>
                ₹{baseAmount.toFixed(0)}
              </Text>
            </View>
            
            {/* Multi-Drop Charges */}
            {/* {numberOfStops > 0 && stopCharge > 0 && (
              <View style={styles.chargeRow}>
                <View style={styles.chargeLeft}>
                  <MaterialIcons name="location-on" size={14} color="#FF9800" />
                  <Text style={styles.chargeLabel}>
                    Multi-Drop ({numberOfStops} {numberOfStops === 1 ? 'location' : 'locations'})
                  </Text>
                </View>
                <Text style={[styles.chargeAmount, { color: "#FF9800" }]}>
                  +₹{stopCharge.toFixed(0)}
                </Text>
              </View>
            )} */}
            


            {/* GST */}
            {gstAmount > 0 ? (
              <View style={styles.chargeRow}>
                <View style={styles.chargeLeft}>
                  <MaterialIcons name="account-balance" size={14} color="#666" />
                  <Text style={styles.chargeLabel}>
                    GST ({feeBreakdown?.gstPercentage || 0}%)
                  </Text>
                </View>
                <Text style={styles.chargeAmount}>+₹{gstAmount.toFixed(0)}</Text>
              </View>
            ) : (
              <View style={styles.chargeRow}>
                <View style={styles.chargeLeft}>
                  <MaterialIcons name="account-balance" size={14} color="#27ae60" />
                  <Text style={styles.chargeLabel}>GST (0%)</Text>
                </View>
                <Text style={[styles.chargeAmount, { color: "#27ae60" }]}>₹0</Text>
              </View>
            )}

            {/* Subtotal (only when discount applied) */}
            {discount > 0 && (
              <View style={[styles.totalAmountRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0' }]}>
                <View style={styles.chargeLeft}>
                  <MaterialIcons name="calculate" size={14} color="#333" />
                  <Text style={[styles.chargeLabel, { fontWeight: "600", color: "#333" }]}>
                    Subtotal
                  </Text>
                </View>
                <Text style={[styles.chargeAmount, { fontWeight: "700", color: "#333", fontSize: 16 }]}>
                  ₹{realTotalPrice.toFixed(0)}
                </Text>
              </View>
            )}

            {/* Coupon Discount */}
            {discount > 0 && (
              <View style={styles.chargeRow}>
                <View style={styles.chargeLeft}>
                  <MaterialIcons name="local-offer" size={14} color="#27ae60" />
                  <Text style={[styles.chargeLabel, { color: "#27ae60", fontWeight: "600" }]}>
                    Coupon Discount ({couponCode})
                  </Text>
                </View>
                <Text style={[styles.chargeAmount, { color: "#27ae60", fontWeight: "700" }]}>-₹{discount.toFixed(0)}</Text>
              </View>
            )}

            {/* Wallet Deduction */}
            {useWallet && walletDeduction > 0 && (
              <View style={styles.chargeRow}>
                <View style={styles.chargeLeft}>
                  <Ionicons name="wallet" size={14} color="#27ae60" />
                  <Text style={[styles.chargeLabel, { color: "#27ae60", fontWeight: "600" }]}>
                    Wallet Payment
                  </Text>
                </View>
                <Text style={[styles.chargeAmount, { color: "#27ae60", fontWeight: "700" }]}>-₹{walletDeduction.toFixed(0)}</Text>
              </View>
            )}
            
            {/* Payment Breakdown Section for Partial Wallet */}
            {useWallet && walletDeduction > 0 && walletDeduction < (subtotal - discount) && (
              <View style={styles.paymentBreakdownSection}>
                <View style={styles.chargeRow}>
                  <Text style={[styles.chargeLabel, { fontWeight: "600", color: "#333" }]}>Payment Breakdown:</Text>
                </View>
                <View style={styles.chargeRow}>
                  <View style={styles.chargeLeft}>
                    <Ionicons name="wallet" size={14} color="#27ae60" />
                    <Text style={[styles.chargeLabel, { color: "#27ae60" }]}>Paid via Wallet</Text>
                  </View>
                  <Text style={[styles.chargeAmount, { color: "#27ae60", fontWeight: "600" }]}>₹{walletDeduction.toFixed(0)}</Text>
                </View>
                <View style={styles.chargeRow}>
                  <View style={styles.chargeLeft}>
                    <MaterialIcons name="payments" size={14} color="#FF9800" />
                    <Text style={[styles.chargeLabel, { color: "#FF9800", fontWeight: "600" }]}>
                      To Pay via {selectedPayment === 'cash' ? 'Cash' : selectedPayment === 'online' ? 'Online' : 'Selected Method'}
                    </Text>
                  </View>
                  <Text style={[styles.chargeAmount, { color: "#FF9800", fontWeight: "700", fontSize: 16 }]}>
                    ₹{finalAmount.toFixed(0)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Final Amount to Pay - Always show with prominent styling */}
          <View style={styles.grandTotalSection}>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Amount to Pay</Text>
              <Text style={styles.grandTotalAmount}>₹{finalAmount.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Wallet Payment Option */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletLeft}>
              <Ionicons name="wallet" size={18} color={walletBalance >= finalAmount ? "#27ae60" : "#FF9800"} />
              <Text style={styles.walletTitle}>Use Wallet Balance</Text>
            </View>
            <Text style={[styles.walletBalanceText, walletBalance < finalAmount && { color: "#FF9800" }]}>
              ₹{walletBalance.toFixed(0)}
            </Text>
          </View>
          
          {/* Show partial wallet usage info */}
          {walletBalance > 0 && walletBalance < finalAmount && (
            <View style={styles.walletPartialInfo}>
              <Ionicons name="information-circle" size={16} color="#0066FF" />
              <Text style={styles.walletPartialText}>
                ₹{walletBalance.toFixed(0)} will be used from wallet. Pay remaining ₹{(finalAmount - walletBalance).toFixed(0)} via your selected payment method.
              </Text>
            </View>
          )}
          
          {/* Show full wallet coverage message */}
          {walletBalance > 0 && walletBalance >= finalAmount && (
            <View style={styles.walletFullCoverageInfo}>
              <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
              <Text style={styles.walletFullCoverageText}>
                Your wallet balance covers the full amount. No additional payment needed.
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.walletCheckboxRow}
            onPress={() => {
              if (walletBalance > 0) {
                setUseWallet(!useWallet);
              } else {
                Alert.alert(
                  "No Balance",
                  `Your wallet balance is ₹0. Please add money to your wallet to use this payment method.`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Add Money", 
                      onPress: () => {
                        // Navigate to wallet/add money screen
                        navigation.navigate("Account", { screen: "Wallet" });
                      }
                    }
                  ]
                );
              }
            }}
            disabled={walletBalance <= 0}
          >
            <View style={[styles.checkbox, useWallet && styles.checkboxActive, walletBalance <= 0 && styles.checkboxDisabled]}>
              {useWallet && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[styles.checkboxLabel, walletBalance <= 0 && { color: "#999" }]}>
              {walletBalance >= finalAmount 
                ? "Use full wallet balance for this order"
                : walletBalance > 0
                ? `Use ₹${walletBalance.toFixed(0)} from wallet (partial payment)`
                : "No wallet balance available"
              }
            </Text>
          </TouchableOpacity>
          
          {useWallet && walletDeduction > 0 && (
            <View style={styles.walletDeductionInfo}>
              <Text style={styles.walletDeductionText}>
                ₹{walletDeduction.toFixed(0)} will be deducted from your wallet
              </Text>
            </View>
          )}
        </View>

        {/* Quick Fee Section - DISABLED */}
        {/* <View style={styles.quickFeeCard}>
          <View style={styles.quickFeeHeader}>
            <Text style={styles.sectionTitle}>Quick Fee (Optional)</Text>
            <Ionicons name="flash" size={18} color="#EC4D4A" />
          </View>
          <Text style={styles.quickFeeSubtitle}>
            Add a quick fee to incentivize drivers and find a ride faster
          </Text>
          
          <View style={styles.quickFeeOptions}>
            {[0, 25, 50, 75, 100].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickFeeButton,
                  quickFee === amount && styles.quickFeeButtonActive,
                ]}
                onPress={() => setQuickFee(amount)}
              >
                <Text
                  style={[
                    styles.quickFeeButtonText,
                    quickFee === amount && styles.quickFeeButtonTextActive,
                  ]}
                >
                  {amount === 0 ? "None" : `₹${amount}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {quickFee > 0 && (
            <View style={styles.quickFeeInfo}>
              <Ionicons name="information-circle" size={16} color="#27ae60" />
              <Text style={styles.quickFeeInfoText}>
                Driver will earn ₹{(baseFare + quickFee).toFixed(0)} (base fare + quick fee)
              </Text>
            </View>
          )}
        </View> */}

        {/* Goods Type Selection - Horizontal */}
        <View style={styles.goodsCard}>
          <Text style={styles.sectionTitle}>Goods Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.goodsRow}
          >
            {displayGoodsTypes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.goodsItem,
                  selectedGoodsType === item.name && styles.goodsItemActive,
                ]}
                onPress={() => {
                  setSelectedGoodsType(item.name);
                  if (item.name === "Other") {
                    navigation.navigate("GoodTypeScreen", {
                      bookingData: {
                        ...bookingData, // Pass all existing booking data
                        selectedGoodsType: selectedGoodsType // Include current selection
                      }
                    });
                  }
                }}
              >
                <FontAwesome
                  name={item.icon}
                  size={20}
                  color={selectedGoodsType === item.name ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.goodsText,
                    selectedGoodsType === item.name && styles.goodsTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {/* Side by Side Payment Options - Compact */}
          <View style={styles.paymentOptionsRow}>
            <TouchableOpacity
              style={[
                styles.paymentOptionCompact,
                selectedPayment === "cash" && styles.paymentOptionActiveCompact,
              ]}
              onPress={() => handlePaymentSelect("cash")}
            >
              <Ionicons
                name="cash"
                size={20}
                color={selectedPayment === "cash" ? "#EC4D4A" : "#666"}
              />
              <Text
                style={[
                  styles.paymentTextCompact,
                  selectedPayment === "cash" && styles.paymentTextActiveCompact,
                ]}
              >
                Cash Payment
              </Text>
              {selectedPayment === "cash" && selectedCashOption && (
                <Ionicons name="checkmark-circle" size={16} color="#27ae60" style={styles.checkmarkCompact} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOptionCompact,
                selectedPayment === "online" && styles.paymentOptionActiveCompact,
              ]}
              onPress={() => handlePaymentSelect("online")}
            >
              <Ionicons
                name="card"
                size={20}
                color={selectedPayment === "online" ? "#EC4D4A" : "#666"}
              />
              <Text
                style={[
                  styles.paymentTextCompact,
                  selectedPayment === "online" && styles.paymentTextActiveCompact,
                ]}
              >
                Online Payment
              </Text>
              {selectedPayment === "online" && (
                <Ionicons name="checkmark-circle" size={16} color="#27ae60" style={styles.checkmarkCompact} />
              )}
            </TouchableOpacity>
          </View>

          {/* Show selected cash option */}
          {selectedPayment === "cash" && selectedCashOption && (
            <View style={styles.selectedCashInfo}>
              <Text style={styles.selectedCashText}>
                Selected: {selectedCashOption === "pickup" ? "Pay on Pickup" : "Pay on Delivery"}
              </Text>
            </View>
          )}
        </View>

        {/* Spacing for bottom button */}
        <View style={{ height: 100 }} />
      </KeyboardAwareWrapper>

      {/* Cash Payment Modal */}
      <Modal
        visible={showCashModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCashModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Cash Payment Option</Text>
              <TouchableOpacity 
                onPress={() => setShowCashModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>When would you like to pay?</Text>

            {/* Cash Payment Options */}
            <View style={styles.cashOptionsModal}>
              <TouchableOpacity
                style={[
                  styles.cashOptionModal,
                  selectedCashOption === "pickup" && styles.cashOptionModalActive,
                ]}
                onPress={() => handleCashOptionSelect("pickup")}
              >
                <Ionicons 
                  name="location" 
                  size={18} 
                  color={selectedCashOption === "pickup" ? "#EC4D4A" : "#666"} 
                />
                <Text
                  style={[
                    styles.cashOptionModalText,
                    selectedCashOption === "pickup" && styles.cashOptionModalTextActive,
                  ]}
                >
                  Pay on Pickup
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cashOptionModal,
                  selectedCashOption === "delivery" && styles.cashOptionModalActive,
                ]}
                onPress={() => handleCashOptionSelect("delivery")}
              >
                <Ionicons 
                  name="checkmark-done" 
                  size={18} 
                  color={selectedCashOption === "delivery" ? "#EC4D4A" : "#666"} 
                />
                <Text
                  style={[
                    styles.cashOptionModalText,
                    selectedCashOption === "delivery" && styles.cashOptionModalTextActive,
                  ]}
                >
                  Pay on Delivery
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => {
                if (selectedCashOption) {
                  setShowCashModal(false);
                } else {
                  Alert.alert("Please select a payment option");
                }
              }}
            >
              <Text style={styles.confirmButtonText}>
                Confirm - Pay ₹{finalAmount.toFixed(0)} using Cash
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Coupon Selection Modal */}
      <Modal
        visible={showCouponModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCouponModal(false)}
      >
        <View style={styles.couponModalOverlay}>
          <KeyboardAwareWrapper
            enableScrollView={true}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enableOnAndroid={true}
            style={styles.couponModalWrapper}
            contentContainerStyle={styles.couponModalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.couponModalContainer}>
            <View style={styles.couponModalHeader}>
              <Text style={styles.couponModalTitle}>Coupons & Offers</Text>
              <TouchableOpacity 
                onPress={() => setShowCouponModal(false)}
                style={styles.couponModalClose}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Coupon Input Field */}
            <View style={styles.couponModalInputSection}>
              <TextInput
                style={styles.couponModalInput}
                placeholder="Enter coupon code"
                value={couponCode}
                onChangeText={setCouponCode}
                placeholderTextColor="#999"
                editable={!isApplyingCoupon}
              />
            </View>

            {/* Divider */}
            <View style={styles.couponModalDivider}>
              <Text style={styles.couponModalDividerText}>Select Coupon from below</Text>
            </View>

            {/* Dynamic Coupons from Backend */}
            <View style={styles.couponsList}>
              {isLoadingCoupons ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#EC4D4A" />
                  <Text style={{ marginTop: 10, color: '#666' }}>Loading coupons...</Text>
                </View>
              ) : availableCoupons.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>
                    No coupons available at the moment.{"\n"}
                    You can still enter a coupon code above.
                  </Text>
                </View>
              ) : (
                availableCoupons.map((coupon) => {
                  const isEligible = subtotal >= (coupon.minOrderAmount || 0);
                  const discountText = coupon.discountType === "Percentage" 
                    ? `${coupon.value}% off`
                    : `₹${coupon.value} off`;
                  const isReferralCoupon = coupon.isPersonal && coupon.tag === 'REFERRAL REWARD';
                  
                  return (
                    <TouchableOpacity
                      key={coupon._id}
                      style={[
                        styles.couponOption,
                        !isEligible && styles.couponOptionDisabled,
                        isReferralCoupon && styles.referralCouponHighlight
                      ]}
                      onPress={() => {
                        if (isEligible) {
                          setCouponCode(coupon.couponCode);
                          // Auto apply the selected coupon
                          handleApplyCouponFromModal(coupon);
                        }
                      }}
                      disabled={!isEligible}
                    >
                      <View style={styles.couponOptionContent}>
                        <View style={styles.couponOptionHeader}>
                          {isReferralCoupon && (
                            <View style={styles.referralBadge}>
                              <Ionicons name="gift" size={14} color="#fff" />
                              <Text style={styles.referralBadgeText}>REFERRAL REWARD</Text>
                            </View>
                          )}
                          <Text style={[
                            styles.couponCode,
                            !isEligible && styles.couponCodeDisabled,
                            isReferralCoupon && styles.referralCouponCode
                          ]}>
                            {coupon.couponCode}
                          </Text>
                          {!isEligible && (
                            <Text style={styles.notEligibleBadge}>Not Eligible</Text>
                          )}
                        </View>
                        <Text style={[
                          styles.couponTitle,
                          !isEligible && styles.couponTitleDisabled,
                          isReferralCoupon && styles.referralCouponTitle
                        ]}>
                          {discountText} - {coupon.description}
                        </Text>
                        {coupon.maxDiscountAmount && coupon.discountType === "Percentage" && (
                          <Text style={[
                            styles.couponDescription,
                            !isEligible && styles.couponDescriptionDisabled
                          ]}>
                            Max discount: ₹{coupon.maxDiscountAmount}
                          </Text>
                        )}
                        {coupon.minOrderAmount > 0 && (
                          <Text style={[
                            styles.couponMinOrder,
                            !isEligible && styles.couponMinOrderDisabled
                          ]}>
                            Min. order: ₹{coupon.minOrderAmount}
                          </Text>
                        )}
                        <Text style={[
                          styles.couponDescription,
                          !isEligible && styles.couponDescriptionDisabled,
                          { fontSize: 11, marginTop: 4 }
                        ]}>
                          Valid till: {new Date(coupon.validityEnd).toLocaleDateString('en-IN')}
                        </Text>
                      </View>
                      {isEligible && (
                        <View style={[
                          styles.couponApplyButton,
                          isReferralCoupon && styles.referralApplyButton
                        ]}>
                          <Text style={styles.couponApplyText}>APPLY</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Apply Manual Coupon Button */}
            {couponCode.trim() !== '' && (
              <View style={styles.manualCouponButtonContainer}>
                <TouchableOpacity
                  style={styles.manualCouponApplyButton}
                  onPress={() => {
                    handleApplyCoupon();
                  }}
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.manualCouponApplyText}>
                      Apply "{couponCode.trim()}"
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            </View>
          </KeyboardAwareWrapper>
        </View>
      </Modal>

      {/* Vehicle Info Modal */}
      <Modal
        visible={showVehicleInfoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVehicleInfoModal(false)}
      >
        <View style={styles.vehicleInfoModalOverlay}>
          <View style={styles.vehicleInfoModalContainer}>
            {/* Vehicle Header */}
            <View style={styles.vehicleInfoHeader}>
              <View style={styles.vehicleInfoImageContainer}>
                <Image
                  source={getVehicleImageSource()}
                  style={styles.vehicleInfoImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.vehicleInfoTitleContainer}>
                <Text style={styles.vehicleInfoTitle}>
                  {selectedVehicle?.type || "Bike"}
                </Text>
              </View>
            </View>

            {/* Vehicle Specifications */}
            <View style={styles.vehicleSpecsContainer}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Max Weight Allowed</Text>
                <Text style={styles.specValue}>
                  {selectedVehicle?.weight || "Upto 20 Kg"}
                </Text>
              </View>
              
              <View style={styles.specDivider} />
              
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Size ( L * W * H )</Text>
                <Text style={styles.specValue}>1.3 x 1.3 x 1.3 ft</Text>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <View style={styles.termItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.termText}>
                  Fare doesn't include labour charges for loading and unloading
                </Text>
              </View>

              <View style={styles.termItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.termText}>
                  Fare includes{" "}
                  <Text style={styles.highlightText}>
                    30 mins of free loading and unloading time
                  </Text>
                </Text>
              </View>

              <View style={styles.termItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.termText}>
                  2.0 Rs/min for additional loading and unloading time
                </Text>
              </View>

              <View style={styles.termItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.termText}>
                  Fare may change if route or location changes
                </Text>
              </View>

              <View style={styles.termItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.termText}>
                  Fare includes toll charges if any.
                </Text>
              </View>

              <View style={styles.termItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.termText}>
                  Parking charges to be paid by customer
                </Text>
              </View>

              <View style={styles.termItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.termText}>
                  Restricted items are not allowed. See T&C for more details
                </Text>
              </View>

              <View style={styles.termItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.termText}>
                  We don't allow overloading.No extra height more than the vehicle allows legally.
                </Text>
              </View>
            </View>

            {/* OKAY Button */}
            <TouchableOpacity 
              style={styles.vehicleInfoOkayButton}
              onPress={() => setShowVehicleInfoModal(false)}
            >
              <Text style={styles.vehicleInfoOkayText}>OKAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Fixed Button */}
      {!showCashModal && (
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + scale(16) }]}>
        <TouchableOpacity 
          style={[
            styles.proceedButton,
            (!(useWallet && finalAmount === 0) && (!selectedPayment || (selectedPayment === "cash" && !selectedCashOption)) || isCreatingBooking) && styles.proceedButtonDisabled
          ]} 
          onPress={handleProceed}
          disabled={(!(useWallet && finalAmount === 0) && (!selectedPayment || (selectedPayment === "cash" && !selectedCashOption))) || isCreatingBooking}
        >
          {isCreatingBooking ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[
              styles.proceedButtonText,
              (!(useWallet && finalAmount === 0) && (!selectedPayment || (selectedPayment === "cash" && !selectedCashOption))) && styles.proceedButtonTextDisabled
            ]}>
              {useWallet && finalAmount === 0
                ? "Proceed with Wallet Payment"
                : selectedPayment === "online"
                ? "Proceed to Online Payment"
                : selectedPayment === "cash"
                ? `Confirm Cash Payment (${selectedCashOption === "pickup" ? "Pay on Pickup" : selectedCashOption === "delivery" ? "Pay on Delivery" : "Select Payment Time"})`
                : "Select Payment Method"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scale(20),
  },

  // Header
  headerContainer: {
    alignItems: "center",
    padding: scale(16),
    paddingTop: scale(16), // Removed extra space since HeaderWithBackButton handles spacing
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(12),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: scale(60),
  },
  backButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#333",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    margin: scale(12),
    marginTop: scale(8),
    padding: scale(12),
    borderRadius: scale(12),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    position: "relative",
  },
  vehicleInfoIcon: {
    position: "absolute",
    top: scale(8),
    right: scale(8),
    zIndex: 1,
    padding: scale(4),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: scale(12),
  },

  // Vehicle
  vehicleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(8),
    backgroundColor: "#f0f0f0",
  },
  vehicleDetails: {
    flex: 1,
    marginLeft: scale(12),
  },
  vehicleTitle: {
    fontSize: scale(16),
    fontWeight: "bold",
    color: "#333",
  },
  vehicleType: {
    fontSize: scale(13),
    color: "#666",
    marginTop: scale(2),
  },

  // Trip Summary
  tripSummary: {
    marginTop: scale(12),
    paddingTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(6),
  },
  tripText: {
    fontSize: scale(12),
    color: "#666",
    marginLeft: scale(8),
    flex: 1,
  },

  // Section Title
  sectionTitle: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: scale(10),
  },

  // Coupon
  couponCard: {
    backgroundColor: "#fff",
    marginHorizontal: scale(12),
    marginBottom: scale(8),
    padding: scale(12),
    borderRadius: scale(12),
    elevation: 2,
  },
  couponClickableField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scale(8),
    padding: scale(12),
    backgroundColor: "#f9f9f9",
  },
  couponFieldContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  couponFieldText: {
    fontSize: scale(14),
    color: "#666",
    marginLeft: scale(8),
  },
  couponFieldRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  applyText: {
    fontSize: scale(14),
    color: "#EC4D4A",
    fontWeight: "600",
    marginRight: scale(4),
  },
  couponInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scale(8),
    padding: scale(10),
    fontSize: scale(14),
    color: "#333",
  },
  applyButton: {
    backgroundColor: "#EC4D4A",
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(8),
    marginLeft: scale(8),
    minWidth: scale(70),
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: scale(14),
    fontWeight: "600",
  },
  appliedCouponRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e8f5e9",
    padding: scale(10),
    borderRadius: scale(8),
  },
  appliedCouponInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appliedCouponText: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#27ae60",
    marginLeft: scale(8),
  },
  savingsText: {
    fontSize: scale(12),
    color: "#27ae60",
    marginLeft: scale(8),
  },

  // Billing - Minimalistic Design
  billingCard: {
    backgroundColor: "#fff",
    marginHorizontal: scale(12),
    marginBottom: scale(6),
    padding: scale(12),
    borderRadius: scale(8),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.05,
    shadowRadius: scale(1),
  },
  
  // Bill Header
  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(12),
  },
  billHeaderTitle: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#333",
    marginLeft: scale(6),
  },

  // Items Total Section
  itemsTotalSection: {
    marginBottom: scale(8),
  },
  itemsTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(6),
  },
  itemsTotalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemsTotalLabel: {
    fontSize: scale(13),
    fontWeight: "400",
    color: "#666",
    marginLeft: scale(6),
  },
  savedBadge: {
    color: "#4285f4",
    fontSize: scale(9),
    fontWeight: "500",
    marginLeft: scale(6),
  },
  itemsTotalRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  originalPrice: {
    fontSize: scale(12),
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: scale(6),
  },
  currentPrice: {
    fontSize: scale(14),
    fontWeight: "bold",
    color: "#333",
  },

  // Charges Section
  chargesSection: {
    marginBottom: scale(8),
  },
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(4),
  },
  chargeLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  chargeLabel: {
    fontSize: scale(12),
    color: "#666",
    fontWeight: "400",
    marginLeft: scale(4),
  },
  freeText: {
    fontSize: scale(12),
    fontWeight: "bold",
    color: "#27ae60",
  },
  chargeAmount: {
    fontSize: scale(12),
    fontWeight: "600",
    color: "#333",
  },

  // Combined Section
  combinedSection: {
    position: "relative",
    marginHorizontal: -scale(12),
    marginTop: scale(12),
    marginBottom: -scale(12),
  },
  savingsCurvedTop: {
    height: scale(15),
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: scale(15),
    borderTopRightRadius: scale(15),
    marginHorizontal: scale(12),
  },
  combinedContent: {
    backgroundColor: "#f8fafc",
  },

  // Grand Total Section
  grandTotalSection: {
    backgroundColor: "#333",
    marginHorizontal: -scale(12),
    paddingHorizontal: scale(12),
    paddingVertical: scale(12),
    marginTop: scale(12),
    marginBottom: -scale(12),
    borderBottomLeftRadius: scale(8),
    borderBottomRightRadius: scale(8),
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandTotalLabel: {
    fontSize: scale(15),
    fontWeight: "700",
    color: "#fff",
  },
  grandTotalAmount: {
    fontSize: scale(18),
    fontWeight: "700",
    color: "#fff",
  },

  // Total Order Styles
  totalOrderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: scale(8),
  },
  totalOrderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalOrderLabel: {
    fontSize: scale(16),
    fontWeight: "600",
    color: "#333",
    marginLeft: scale(8),
  },
  totalOrderAmount: {
    fontSize: scale(18),
    fontWeight: "700",
    color: "#333",
  },
  inclusiveNote: {
    alignItems: "center",
    marginBottom: scale(12),
  },
  inclusiveNoteText: {
    fontSize: scale(12),
    color: "#666",
    fontStyle: "italic",
  },
  feeBreakdownSection: {
    backgroundColor: "#f8f9fa",
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scale(12),
  },
  breakdownTitle: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: scale(8),
  },
  riderEarningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: scale(8),
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: scale(4),
  },
  totalAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: scale(8),
    borderTopWidth: 2,
    borderTopColor: "#333",
    marginTop: scale(8),
    backgroundColor: "#f0f8ff",
    paddingHorizontal: scale(8),
    paddingVertical: scale(8),
    borderRadius: scale(4),
  },

  // Savings Content (within combined)
  savingsContent: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(20),
  },
  savingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(6),
  },
  savingsLabel: {
    fontSize: scale(13),
    fontWeight: "500",
    color: "#4285f4",
  },
  savingsAmount: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#4285f4",
  },
  savingsSubtext: {
    fontSize: scale(11),
    color: "#777",
    fontWeight: "400",
  },

  // Legacy styles (keeping for backward compatibility)
  divider: {
    height: scale(1),
    backgroundColor: "#eee",
    marginVertical: scale(8),
  },

  // Goods Type
  goodsCard: {
    backgroundColor: "#fff",
    marginHorizontal: scale(12),
    marginBottom: scale(8),
    padding: scale(12),
    borderRadius: scale(12),
    elevation: 2,
  },
  goodsRow: {
    paddingRight: scale(12),
  },
  goodsItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
    marginRight: scale(8),
    borderWidth: 1,
    borderColor: "#ddd",
  },
  goodsItemActive: {
    backgroundColor: "#EC4D4A",
    borderColor: "#EC4D4A",
  },
  goodsText: {
    fontSize: scale(13),
    color: "#666",
    marginLeft: scale(6),
  },
  goodsTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Quick Fee Styles
  quickFeeCard: {
    backgroundColor: "#fff",
    marginHorizontal: scale(12),
    marginBottom: scale(8),
    padding: scale(12),
    borderRadius: scale(12),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
  },
  quickFeeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(4),
  },
  quickFeeSubtitle: {
    fontSize: scale(12),
    color: "#666",
    marginBottom: scale(12),
    lineHeight: scale(16),
  },
  quickFeeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(8),
    marginBottom: scale(8),
  },
  quickFeeButton: {
    flex: 1,
    paddingVertical: scale(10),
    paddingHorizontal: scale(8),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
  },
  quickFeeButtonActive: {
    backgroundColor: "#EC4D4A",
    borderColor: "#EC4D4A",
  },
  quickFeeButtonText: {
    fontSize: scale(13),
    color: "#666",
    fontWeight: "500",
  },
  quickFeeButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  quickFeeInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    padding: scale(8),
    borderRadius: scale(6),
    marginTop: scale(4),
  },
  quickFeeInfoText: {
    fontSize: scale(11),
    color: "#27ae60",
    marginLeft: scale(6),
    flex: 1,
    fontWeight: "500",
  },

  // Payment - Compact Version
  paymentCard: {
    backgroundColor: "#fff",
    marginHorizontal: scale(12),
    marginBottom: scale(8),
    padding: scale(12),
    borderRadius: scale(12),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
  },
  
  // Compact Payment Options
  paymentOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(8),
  },
  paymentOptionCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    position: "relative",
    minHeight: scale(50),
  },
  paymentOptionActiveCompact: {
    borderColor: "#EC4D4A",
    backgroundColor: "#fef7f7",
  },
  paymentTextCompact: {
    fontSize: scale(12),
    color: "#666",
    marginLeft: scale(6),
    fontWeight: "500",
    textAlign: "center",
  },
  paymentTextActiveCompact: {
    color: "#EC4D4A",
    fontWeight: "600",
  },
  checkmarkCompact: {
    position: "absolute",
    top: scale(4),
    right: scale(4),
  },
  
  // Selected Cash Info
  selectedCashInfo: {
    marginTop: scale(8),
    padding: scale(8),
    backgroundColor: "#e8f5e9",
    borderRadius: scale(6),
    alignItems: "center",
  },
  selectedCashText: {
    fontSize: scale(12),
    color: "#27ae60",
    fontWeight: "500",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 9999,
    elevation: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
    paddingBottom: scale(10),
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(20),
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: scale(4),
  },
  modalSubtitle: {
    fontSize: scale(14),
    color: "#666",
    marginBottom: scale(16),
    fontWeight: "500",
  },
  
  // Porter Credit Option
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: scale(12),
    backgroundColor: "#f9f9f9",
    opacity: 0.6,
  },
  modalOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  porterIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#4285f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  porterIconText: {
    color: "#fff",
    fontSize: scale(18),
    fontWeight: "bold",
  },
  modalOptionTitle: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: scale(4),
  },
  paymentLogos: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentLogosText: {
    fontSize: scale(11),
    color: "#666",
  },
  
  // Add Money Button
  addMoneyButton: {
    backgroundColor: "#4285f4",
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(6),
    alignSelf: "flex-start",
    marginBottom: scale(16),
    opacity: 0.6,
  },
  addMoneyText: {
    color: "#fff",
    fontSize: scale(12),
    fontWeight: "600",
  },
  
  // Divider
  dividerLine: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: scale(16),
  },
  
  // Cash Option in Modal
  modalCashOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: scale(16),
    backgroundColor: "#fff",
  },
  modalCashText: {
    fontSize: scale(16),
    fontWeight: "600",
    color: "#333",
    marginLeft: scale(12),
  },
  radioSelected: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Cash Options in Modal
  cashOptionsModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(20),
    gap: scale(8),
  },
  cashOptionModal: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  cashOptionModalActive: {
    borderColor: "#EC4D4A",
    backgroundColor: "#fef7f7",
  },
  cashOptionModalText: {
    fontSize: scale(12),
    color: "#666",
    marginLeft: scale(6),
    fontWeight: "500",
  },
  cashOptionModalTextActive: {
    color: "#EC4D4A",
    fontWeight: "600",
  },
  
  // Confirm Button
  confirmButton: {
    backgroundColor: "#EC4D4A",
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: "center",
    marginBottom: 0,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: scale(14),
    fontWeight: "600",
  },

  // Original Payment Styles (keeping for backward compatibility)
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: scale(8),
  },
  paymentOptionActive: {
    borderColor: "#EC4D4A",
    backgroundColor: "#f0f8ff",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: scale(14),
    color: "#666",
    marginLeft: scale(10),
  },
  paymentTextActive: {
    color: "#333",
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: scale(8),
    right: scale(8),
  },

  // Cash Dropdown
  cashDropdown: {
    marginTop: scale(8),
    paddingTop: scale(16),
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  dropdownLabel: {
    fontSize: scale(14),
    color: "#374151",
    marginBottom: scale(12),
    fontWeight: "600",
  },

  // Cash Options
  cashOptions: {
    flexDirection: "column",
    gap: scale(8),
  },
  cashOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.05,
    shadowRadius: scale(2),
    elevation: 1,
  },
  cashOptionActiveNew: {
    borderColor: "#EC4D4A",
    backgroundColor: "#fef7f7",
    elevation: 2,
  },
  
  // Cash Option Content
  cashOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  // Cash Icon Container
  cashIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: "#EC4D4A",
  },
  cashIconContainerActive: {
    backgroundColor: "#EC4D4A",
    borderColor: "#EC4D4A",
  },
  
  // Cash Text Container
  cashTextContainer: {
    flex: 1,
  },
  
  cashOptionText: {
    fontSize: scale(14),
    color: "#374151",
    fontWeight: "600",
    marginBottom: scale(2),
  },
  cashOptionTextActiveNew: {
    color: "#1f2937",
    fontWeight: "700",
  },
  
  // Cash Option Subtext
  cashOptionSubtext: {
    fontSize: scale(11),
    color: "#9ca3af",
    fontWeight: "400",
  },
  
  // Legacy Cash Option Styles (keeping for backward compatibility)
  cashOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Bottom Button
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: scale(12),
    paddingTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 15,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
  },
  proceedButton: {
    backgroundColor: "#EC4D4A",
    padding: scale(14),
    borderRadius: scale(12),
    alignItems: "center",
    marginBottom: 0,
  },
  proceedButtonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: scale(14),
    fontWeight: "bold",
  },
  proceedButtonTextDisabled: {
    color: "#999999",
  },

  // Vehicle Info Modal Styles
  vehicleInfoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  vehicleInfoModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    padding: scale(20),
    maxHeight: "90%",
  },
  vehicleInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(24),
    paddingBottom: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  vehicleInfoImageContainer: {
    width: scale(80),
    height: scale(80),
    backgroundColor: "#f8f9fa",
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  vehicleInfoImage: {
    width: scale(60),
    height: scale(60),
  },
  vehicleInfoTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vehicleInfoTitle: {
    fontSize: scale(24),
    fontWeight: "bold",
    color: "#333",
  },
  vehicleInfoBadge: {
    backgroundColor: "#0066FF",
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(6),
  },
  vehicleInfoBadgeText: {
    color: "#fff",
    fontSize: scale(16),
    fontWeight: "bold",
  },
  vehicleSpecsContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(24),
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(12),
  },
  specLabel: {
    fontSize: scale(16),
    color: "#666",
    fontWeight: "500",
  },
  specValue: {
    fontSize: scale(16),
    color: "#333",
    fontWeight: "600",
  },
  specDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: scale(4),
  },
  termsContainer: {
    marginBottom: scale(24),
  },
  termItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(16),
  },
  bulletPoint: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: "#333",
    marginTop: scale(7),
    marginRight: scale(12),
  },
  termText: {
    flex: 1,
    fontSize: scale(14),
    color: "#555",
    lineHeight: scale(20),
  },
  highlightText: {
    fontWeight: "600",
    color: "#333",
  },
  vehicleInfoOkayButton: {
    backgroundColor: "#EC4D4A",
    paddingVertical: scale(16),
    borderRadius: scale(12),
    alignItems: "center",
    marginTop: scale(8),
  },
  vehicleInfoOkayText: {
    color: "#fff",
    fontSize: scale(16),
    fontWeight: "bold",
    letterSpacing: 1,
  },

  // Coupon Modal Styles
  couponModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  couponModalWrapper: {
    maxHeight: "70%",
  },
  couponModalContent: {
    flexGrow: 1,
  },
  couponModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    minHeight: height * 0.45,
    maxHeight: height * 0.70,
    paddingBottom: scale(12),
  },
  couponModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  couponModalTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#333",
  },
  couponModalClose: {
    padding: scale(4),
  },
  couponModalInputSection: {
    padding: scale(16),
    paddingBottom: scale(12),
  },
  couponModalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scale(8),
    padding: scale(12),
    fontSize: scale(14),
    color: "#333",
    backgroundColor: "#f9f9f9",
    minHeight: scale(44),
  },
  couponModalDivider: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  couponModalDividerText: {
    fontSize: scale(13),
    color: "#666",
    fontWeight: "500",
    marginBottom: scale(6),
  },
  couponsList: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
  },
  couponOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: scale(8),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    maxWidth: '100%',
  },
  couponOptionDisabled: {
    opacity: 0.6,
    backgroundColor: "#f5f5f5",
  },
  couponOptionContent: {
    flex: 1,
    marginRight: scale(8),
    maxWidth: '75%',
  },
  couponOptionHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: scale(4),
  },
  couponCode: {
    fontSize: scale(14),
    fontWeight: "bold",
    color: "#EC4D4A",
    marginTop: scale(2),
    flexShrink: 1,
  },
  couponCodeDisabled: {
    color: "#999",
  },
  notEligibleBadge: {
    fontSize: scale(10),
    color: "#fff",
    backgroundColor: "#999",
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(4),
    fontWeight: "600",
  },
  couponTitle: {
    fontSize: scale(13),
    fontWeight: "600",
    color: "#333",
    marginBottom: scale(4),
    flexWrap: 'wrap',
  },
  couponTitleDisabled: {
    color: "#999",
  },
  couponDescription: {
    fontSize: scale(12),
    color: "#666",
    marginBottom: scale(4),
  },
  couponDescriptionDisabled: {
    color: "#999",
  },
  couponMinOrder: {
    fontSize: scale(11),
    color: "#888",
    fontStyle: "italic",
  },
  couponMinOrderDisabled: {
    color: "#999",
  },
  couponApplyButton: {
    backgroundColor: "#EC4D4A",
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(6),
    minWidth: scale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponApplyText: {
    color: "#fff",
    fontSize: scale(12),
    fontWeight: "600",
  },
  // Referral coupon highlight styles
  referralCouponHighlight: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "#F1F8F4",
  },
  referralBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: scale(6),
    paddingVertical: scale(3),
    borderRadius: scale(10),
    marginBottom: scale(4),
    alignSelf: "flex-start",
  },
  referralBadgeText: {
    fontSize: scale(9),
    color: "#fff",
    fontWeight: "700",
    marginLeft: scale(3),
    letterSpacing: 0.3,
  },
  referralCouponCode: {
    color: "#2E7D32",
  },
  referralCouponTitle: {
    color: "#2E7D32",
  },
  referralApplyButton: {
    backgroundColor: "#4CAF50",
  },
  manualCouponButtonContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    paddingBottom: Platform.OS === 'ios' ? scale(34) : scale(16),
    marginTop: scale(8),
  },
  manualCouponApplyButton: {
    backgroundColor: "#EC4D4A",
    paddingVertical: scale(16),
    borderRadius: scale(8),
    alignItems: "center",
  },
  manualCouponApplyText: {
    color: "#fff",
    fontSize: scale(14),
    fontWeight: "600",
  },
  // Wallet styles
  walletCard: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginHorizontal: scale(16),
    marginVertical: scale(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginLeft: scale(8),
  },
  walletBalanceText: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#27ae60',
  },
  walletCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(8),
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(4),
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  checkboxActive: {
    backgroundColor: '#EC4D4A',
    borderColor: '#EC4D4A',
  },
  checkboxDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    opacity: 0.5,
  },
  checkboxLabel: {
    fontSize: scale(14),
    color: '#666',
    flex: 1,
  },
  walletDeductionInfo: {
    backgroundColor: '#e8f5e9',
    borderRadius: scale(8),
    padding: scale(10),
    marginTop: scale(8),
  },
  walletDeductionText: {
    fontSize: scale(13),
    color: '#27ae60',
    textAlign: 'center',
    fontWeight: '500',
  },
  walletPartialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: scale(8),
    padding: scale(10),
    marginBottom: scale(8),
    borderLeftWidth: 3,
    borderLeftColor: '#0066FF',
  },
  walletPartialText: {
    fontSize: scale(12),
    color: '#0066FF',
    marginLeft: scale(8),
    flex: 1,
    fontWeight: '500',
  },
  walletFullCoverageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: scale(8),
    padding: scale(10),
    marginBottom: scale(8),
    borderLeftWidth: 3,
    borderLeftColor: '#27ae60',
  },
  walletFullCoverageText: {
    fontSize: scale(12),
    color: '#27ae60',
    marginLeft: scale(8),
    flex: 1,
    fontWeight: '500',
  },
  paymentBreakdownSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: scale(8),
    padding: scale(12),
    marginTop: scale(8),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  walletInsufficientWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: scale(8),
    padding: scale(10),
    marginBottom: scale(8),
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  walletInsufficientText: {
    fontSize: scale(12),
    color: '#F57C00',
    marginLeft: scale(8),
    flex: 1,
    fontWeight: '500',
  },
});

export default BillingPayment;
