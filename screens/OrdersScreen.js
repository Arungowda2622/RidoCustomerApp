import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '../utils/api';
import { getUserBookings } from "../utils/AuthApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const OrdersScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("ongoing");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  
  // Cancel modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState("");
  const [showReasonOptions, setShowReasonOptions] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const tabs = [
    { id: "ongoing", label: "Ongoing", icon: "time-outline" },
    { id: "previous", label: "Previous", icon: "checkmark-circle-outline" },
    { id: "cancelled", label: "Cancelled", icon: "close-circle-outline" },
  ];

  const cancelReasons = [
    "Taking longer than expected.",
    "Found better price elsewhere.",
    "Change of plans.",
    "Wrong pickup location.",
    "Wrong drop location.",
    "Others"
  ];

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrder(null);
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

  // Load user data and fetch orders on screen focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserAndOrders();
    }, [])
  );

  const loadUserAndOrders = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("userData");  // Fixed: use "userData" key
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      
      console.log("🔍 Debug - Auth check:", {
        hasUserData: !!userData,
        hasToken: !!token,
        hasUserId: !!userId
      });
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        console.log("✅ User found:", parsedUser.name || parsedUser.phoneNumber);
        setUser(parsedUser);
        await fetchOrders(parsedUser._id || userId, token);
      } else if (token && userId) {
        // Fallback: if we have token and userId but no complete user data
        console.log("⚠️ Using fallback auth with userId:", userId);
        setUser({ _id: userId, phoneNumber: "User" }); // Minimal user object
        await fetchOrders(userId, token);
      } else {
        console.log("❌ No authentication data found");
        setUser(null);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (userId, token) => {
    try {
      console.log("🔄 Fetching orders for user:", userId);
      
      const response = await getUserBookings(userId, token);
      console.log("📦 Orders response:", response.data);
      
      if (response.data && response.data.bookings) {
        console.log("✅ Orders loaded:", response.data.bookings.length);
        setOrders(response.data.bookings);
      } else {
        console.log("📭 No orders found");
        setOrders([]);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      if (error.message.includes("session has expired")) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => navigation.navigate("MobileNumber") }
        ]);
      } else {
        // Don't show error alert for failed order fetch, just show empty state
        console.log("🔄 Setting empty orders due to fetch error");
        setOrders([]);
      }
    }
  };

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      await fetchOrders(user._id || userId, token);
      setRefreshing(false);
    } else {
      // If no user, reload everything
      setRefreshing(true);
      await loadUserAndOrders();
      setRefreshing(false);
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const status = order.status?.toLowerCase();
      
      switch (activeTab) {
        case "ongoing":
          // Backend uses: 'pending', 'accepted', 'in_progress'
          return ["pending", "accepted", "confirmed", "driver_assigned", "in_progress", "picked_up"].includes(status);
        case "previous":
          return ["completed", "delivered"].includes(status);
        case "cancelled":
          return ["cancelled", "canceled"].includes(status);
        default:
          return false;
      }
    });
  };

  const getOrderCountForTab = (tabId) => {
    return orders.filter(order => {
      const status = order.status?.toLowerCase();
      
      switch (tabId) {
        case "ongoing":
          // Backend uses: 'pending', 'accepted', 'in_progress'
          return ["pending", "accepted", "confirmed", "driver_assigned", "in_progress", "picked_up"].includes(status);
        case "previous":
          return ["completed", "delivered"].includes(status);
        case "cancelled":
          return ["cancelled", "canceled"].includes(status);
        default:
          return false;
      }
    }).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "completed":
      case "delivered":
        return "#4CAF50";
      case "cancelled":
      case "canceled":
        return "#F44336";
      case "pending":
        return "#FF9800";
      case "accepted":
      case "confirmed":
      case "driver_assigned":
        return "#2196F3";
      case "in_progress":
      case "picked_up":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  const getStatusText = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "completed":
      case "delivered":
        return "Completed";
      case "cancelled":
      case "canceled":
        return "Cancelled";
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "confirmed":
        return "Confirmed";
      case "driver_assigned":
        return "Driver Assigned";
      case "in_progress":
        return "In Progress";
      case "picked_up":
        return "Picked Up";
      default:
        return status || "Unknown";
    }
  };

  const getVehicleIcon = (vehicleType) => {
    const type = vehicleType?.toLowerCase();
    switch (type) {
      case "2w":
      case "2 wheeler":
        return "bicycle";
      case "3w":
      case "3 wheeler":
        return "car";
      case "truck":
        return "car-sport";
      default:
        return "car";
    }
  };

  const handleOrderPress = (order) => {
    const status = order.status?.toLowerCase();
    
    // Check if order is cancelled - no navigation needed
    if (["cancelled", "canceled"].includes(status)) {
      // Don't navigate anywhere for cancelled orders
      return;
    }
    
    // Check if order has been accepted by rider
    const isAcceptedByRider = ["accepted", "driver_assigned", "in_progress", "picked_up"].includes(status);
    
    if (isAcceptedByRider) {
      // Navigate to booking details screen when rider has accepted
      navigation.navigate("BookingDetail", { 
        bookingId: order._id || order.id,
        booking: order 
      });
    } else if (["pending", "confirmed"].includes(status)) {
      // Navigate to searching screen when still looking for rider
      navigation.navigate("BookingSearching", { 
        bookingData: order,
        bookingId: order._id || order.id,
        fromOrderTracking: true 
      });
    } else if (["completed", "delivered"].includes(status)) {
      // For completed orders, go to review screen
      navigation.navigate("SubmitReview", { 
        bookingData: order,
        bookingId: order._id || order.id,
        booking: order 
      });
    }
  };

  const handleTrackOrder = (order) => {
    const status = order.status?.toLowerCase();
    
    // Check if order has been accepted by rider
    const isAcceptedByRider = ["accepted", "driver_assigned", "in_progress", "picked_up"].includes(status);
    
    if (isAcceptedByRider) {
      // Navigate to booking details screen when rider has accepted
      navigation.navigate("BookingDetail", { 
        bookingId: order._id || order.id,
        booking: order,
        fromOrderTracking: true 
      });
    } else if (["pending", "confirmed"].includes(status)) {
      // Navigate to searching screen when still looking for rider
      navigation.navigate("BookingSearching", { 
        bookingData: order,
        bookingId: order._id || order.id,
        fromOrderTracking: true 
      });
    }
  };

  const handleReorder = (order) => {
    // Navigate to location selector with previous order data
    navigation.navigate("LocationSelectorScreen", {
      reorderData: {
        pickupLocation: order.fromAddress || order.pickupLocation,
        dropLocation: order.dropLocation?.[0] || order.dropLocation,
        vehicleType: order.vehicleType,
        goodsType: order.goodsType,
      }
    });
  };

  const handleRate = (order) => {
    // Navigate to submit review screen
    navigation.navigate("SubmitReview", { 
      bookingData: order,
      bookingId: order._id || order.id,
      booking: order 
    });
  };

  const handleDownloadInvoice = (order) => {
    Alert.alert(
      "Download Invoice",
      "Invoice download feature will be available soon!",
      [{ text: "OK" }]
    );
  };

  const handleContactSupport = (order) => {
    // Navigate to Raise Ticket page with order details
    navigation.navigate("RaiseTicket", {
      orderDetails: {
        bookingId: order.bookingId || order._id?.slice(-6),
        orderId: order._id || order.id,
        vehicleType: order.vehicleType,
        fromAddress: order.fromAddress?.address || order.pickupLocation?.address || "N/A",
        toAddress: order.dropLocation?.[0]?.address || order.dropLocation?.[0]?.Address || order.dropLocation?.address || "N/A",
        amount: order.price || order.amountPay || order.feeBreakdown?.finalAmount || order.totalAmount || order.estimatedPrice || 0,
        status: order.status,
        createdAt: order.createdAt,
        driverName: order.driverDetails?.name || order.driverName || "N/A",
        driverPhone: order.driverDetails?.phoneNumber || order.driverPhone || "N/A",
      }
    });
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
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
      
      const userId = await AsyncStorage.getItem('userId');
      const bookingId = selectedOrder._id || selectedOrder.id;
      
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
        
        handleCloseCancelModal();
        
        // Refresh directly without alert
        onRefresh();
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

  const showOrderOptions = (order) => {
    const options = [];
    
    if (activeTab === "previous") {
      options.push("View Review", "Reorder", "Download Invoice");
    } else if (activeTab === "ongoing") {
      options.push("Contact Support");
      if (["pending", "accepted", "confirmed"].includes(order.status?.toLowerCase())) {
        options.push("Cancel Order");
      }
    } else if (activeTab === "cancelled") {
      options.push("Reorder", "Contact Support");
    }
    
    options.push("Cancel");

    Alert.alert(
      "Order Options",
      `Order #${order.bookingId || order._id?.slice(-6)}`,
      options.map(option => ({
        text: option,
        style: option === "Cancel" ? "cancel" : "default",
        onPress: () => {
          switch (option) {
            case "View Review":
              handleRate(order);
              break;
            case "Reorder":
              handleReorder(order);
              break;
            case "Download Invoice":
              handleDownloadInvoice(order);
              break;
            case "Contact Support":
              handleContactSupport(order);
              break;
            case "Cancel Order":
              handleCancelOrder(order);
              break;
          }
        }
      }))
    );
  };

  const renderOrderCard = ({ item: order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(order)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdSection}>
          <Ionicons
            name={getVehicleIcon(order.vehicleType)}
            size={20}
            color="#EC4D4A"
          />
          <Text style={styles.orderId}>#{order.bookingId || order._id?.slice(-6)}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => showOrderOptions(order)}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.dateTimeRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateTime}>
            {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
          </Text>
        </View>
        
        <View style={styles.vehicleTypeRow}>
          <Ionicons name="car-outline" size={16} color="#666" />
          <Text style={styles.vehicleType}>{order.vehicleType}</Text>
        </View>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <View style={styles.addressDot} />
          <View style={styles.addressDetails}>
            <Text style={styles.addressLabel}>Pickup</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {order.fromAddress?.address || order.pickupLocation?.address || "Pickup location"}
            </Text>
          </View>
        </View>
        
        <View style={styles.addressConnector} />
        
        <View style={styles.addressRow}>
          <View style={[styles.addressDot, { backgroundColor: "#EC4D4A" }]} />
          <View style={styles.addressDetails}>
            <Text style={styles.addressLabel}>Drop-off</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {order.dropLocation?.[0]?.address || order.dropLocation?.[0]?.Address || order.dropLocation?.address || "Drop-off location"}
            </Text>
          </View>
        </View>
      </View>

      {activeTab === "cancelled" && order.cancellationReason && (
        <View style={styles.cancellationReasonSection}>
          <Ionicons name="information-circle-outline" size={16} color="#F44336" />
          <View style={styles.cancellationReasonContent}>
            <Text style={styles.cancellationReasonLabel}>Cancellation Reason:</Text>
            <Text style={styles.cancellationReasonText}>{order.cancellationReason}</Text>
          </View>
        </View>
      )}

      <View style={styles.orderFooter}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.priceAmount}>₹{order.price || order.amountPay || order.feeBreakdown?.finalAmount || order.totalAmount || order.estimatedPrice || 0}</Text>
        </View>
        
        {activeTab === "previous" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleReorder(order)}
            >
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => handleRate(order)}
            >
              <Ionicons name="star-outline" size={16} color="#EC4D4A" />
              <Text style={styles.reviewText}>Rate</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {activeTab === "ongoing" && (
          <View style={styles.ongoingActions}>
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => handleTrackOrder(order)}
            >
              <Text style={styles.trackText}>Track Order</Text>
            </TouchableOpacity>
            {["pending", "accepted", "confirmed"].includes(order.status?.toLowerCase()) && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(order)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {activeTab === "cancelled" && (
          <View style={styles.cancelledActions}>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => handleContactSupport(order)}
            >
              <Ionicons name="headset-outline" size={16} color="#666" />
              <Text style={styles.supportText}>Support</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (!user) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={60} color="#E0E0E0" />
          <Text style={styles.emptyStateTitle}>Login Required</Text>
          <Text style={styles.emptyStateSubtitle}>
            Please login to view your orders
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("MobileNumber")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name={
            activeTab === "ongoing" 
              ? "time-outline" 
              : activeTab === "previous" 
              ? "checkmark-circle-outline" 
              : "close-circle-outline"
          }
          size={60}
          color="#E0E0E0"
        />
        <Text style={styles.emptyStateTitle}>
          {activeTab === "ongoing" 
            ? "No Ongoing Orders" 
            : activeTab === "previous" 
            ? "No Previous Orders" 
            : "No Cancelled Orders"}
        </Text>
        <Text style={styles.emptyStateSubtitle}>
          {activeTab === "ongoing" 
            ? "Your active orders will appear here" 
            : activeTab === "previous" 
            ? "Your completed orders will appear here" 
            : "Your cancelled orders will appear here"}
        </Text>
        {activeTab !== "cancelled" && (
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={() => navigation.navigate("LocationSelectorScreen")}
          >
            <Text style={styles.bookNowText}>Book Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRightSpace} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const count = getOrderCountForTab(tab.id);
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <View style={styles.tabContent}>
                <View style={styles.tabIconRow}>
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={activeTab === tab.id ? "#EC4D4A" : "#666"}
                  />
                  {count > 0 && (
                    <View style={[
                      styles.countBadge,
                      activeTab === tab.id && styles.activeCountBadge
                    ]}>
                      <Text style={[
                        styles.countText,
                        activeTab === tab.id && styles.activeCountText
                      ]}>
                        {count > 99 ? '99+' : count}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4D4A" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
          {/* Debug info - remove this later */}
          {__DEV__ && (
            <Text style={styles.debugText}>
              User: {user ? "✅" : "❌"} | Orders: {orders.length}
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={getFilteredOrders()}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#EC4D4A"]}
              tintColor="#EC4D4A"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      {/* Cancel Bottom Sheet Modal */}
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
    </SafeAreaView>
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
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: width * 0.015,
  },
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#333",
  },
  headerRightSpace: {
    width: width * 0.1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.02,
    borderRadius: width * 0.02,
    marginHorizontal: width * 0.005,
  },
  activeTabButton: {
    backgroundColor: "#FFF5F5",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: width * 0.035,
    color: "#666",
    marginTop: width * 0.01,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#EC4D4A",
    fontWeight: "600",
  },
  countBadge: {
    position: "absolute",
    top: -8,
    right: -10,
    backgroundColor: "#666",
    borderRadius: width * 0.025,
    minWidth: width * 0.04,
    height: width * 0.04,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.01,
  },
  activeCountBadge: {
    backgroundColor: "#EC4D4A",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: width * 0.025,
    fontWeight: "bold",
  },
  activeCountText: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: width * 0.04,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: width * 0.03,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.015,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderIdSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderId: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
    marginLeft: width * 0.02,
  },
  statusBadge: {
    paddingHorizontal: width * 0.025,
    paddingVertical: width * 0.01,
    borderRadius: width * 0.015,
  },
  statusText: {
    fontSize: width * 0.03,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  orderInfo: {
    marginBottom: height * 0.015,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.008,
  },
  dateTime: {
    fontSize: width * 0.035,
    color: "#666",
    marginLeft: width * 0.02,
  },
  vehicleTypeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleType: {
    fontSize: width * 0.035,
    color: "#666",
    marginLeft: width * 0.02,
    textTransform: "capitalize",
  },
  addressSection: {
    marginBottom: height * 0.015,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressDot: {
    width: width * 0.025,
    height: width * 0.025,
    borderRadius: width * 0.0125,
    backgroundColor: "#4CAF50",
    marginTop: width * 0.01,
  },
  addressConnector: {
    width: 1,
    height: height * 0.025,
    backgroundColor: "#E0E0E0",
    marginLeft: width * 0.0125,
    marginVertical: width * 0.01,
  },
  addressDetails: {
    flex: 1,
    marginLeft: width * 0.03,
  },
  addressLabel: {
    fontSize: width * 0.032,
    color: "#666",
    fontWeight: "500",
  },
  addressText: {
    fontSize: width * 0.035,
    color: "#333",
    marginTop: width * 0.005,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: width * 0.032,
    color: "#666",
  },
  priceAmount: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#EC4D4A",
    marginTop: width * 0.005,
  },
  actionButtons: {
    flexDirection: "row",
  },
  reorderButton: {
    backgroundColor: "#EC4D4A",
    paddingHorizontal: width * 0.035,
    paddingVertical: width * 0.02,
    borderRadius: width * 0.015,
    marginRight: width * 0.02,
  },
  reorderText: {
    color: "#FFFFFF",
    fontSize: width * 0.032,
    fontWeight: "600",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    paddingHorizontal: width * 0.035,
    paddingVertical: width * 0.02,
    borderRadius: width * 0.015,
    borderWidth: 1,
    borderColor: "#EC4D4A",
  },
  reviewText: {
    color: "#EC4D4A",
    fontSize: width * 0.032,
    fontWeight: "600",
    marginLeft: width * 0.01,
  },
  trackButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.025,
    borderRadius: width * 0.015,
  },
  trackText: {
    color: "#FFFFFF",
    fontSize: width * 0.035,
    fontWeight: "600",
  },
  ongoingActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.02,
    borderRadius: width * 0.015,
    marginLeft: width * 0.02,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  cancelButtonText: {
    color: "#F44336",
    fontSize: width * 0.032,
    fontWeight: "600",
  },
  cancelledActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: width * 0.035,
    paddingVertical: width * 0.02,
    borderRadius: width * 0.015,
  },
  supportText: {
    color: "#666",
    fontSize: width * 0.032,
    fontWeight: "600",
    marginLeft: width * 0.01,
  },
  moreButton: {
    padding: width * 0.02,
    marginLeft: width * 0.02,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.1,
  },
  emptyStateTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#333",
    marginTop: height * 0.02,
  },
  emptyStateSubtitle: {
    fontSize: width * 0.038,
    color: "#666",
    textAlign: "center",
    marginTop: height * 0.01,
    marginHorizontal: width * 0.1,
  },
  bookNowButton: {
    backgroundColor: "#EC4D4A",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.015,
    borderRadius: width * 0.025,
    marginTop: height * 0.03,
  },
  bookNowText: {
    color: "#FFFFFF",
    fontSize: width * 0.04,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#EC4D4A",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.015,
    borderRadius: width * 0.025,
    marginTop: height * 0.03,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: width * 0.04,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: width * 0.04,
    color: "#666",
    marginTop: height * 0.02,
  },
  debugText: {
    fontSize: width * 0.03,
    color: "#999",
    marginTop: height * 0.01,
  },
  // Cancel Modal Styles
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
  cancellationReasonSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  cancellationReasonContent: {
    flex: 1,
    marginLeft: 8,
  },
  cancellationReasonLabel: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
    marginBottom: 4,
  },
  cancellationReasonText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
});

export default OrdersScreen;
