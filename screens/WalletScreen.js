


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   Pressable,
//   Dimensions,
//   ScrollView,
//   Animated,
//   Easing
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const { width, height } = Dimensions.get('window');

// // Responsive sizing
// const CARD_PADDING = width * 0.05;
// const FONT_SIZE = width > 400 ? 16 : 14;
// const SMALL_FONT_SIZE = width > 400 ? 12 : 11;
// const TRANSACTION_CARD_HEIGHT = height * 0.08;

// const transactions = [
//   { 
//     id: '1', 
//     title: 'Ride Payment', 
//     amount: -120,
//     date: '20 May 2025',
//     time: '10:30 AM',
//     transactionId: 'TXN123456'
//   },
//   { 
//     id: '2', 
//     title: 'Top-up', 
//     amount: 500,
//     date: '19 May 2025',
//     time: '04:15 PM',
//     transactionId: 'TXN789012'
//   },
//   { 
//     id: '3', 
//     title: 'Referral Bonus', 
//     amount: 100,
//     date: '18 May 2025',
//     time: '11:45 AM',
//     transactionId: 'TXN345678'
//   },
// ];

// const WalletScreen = () => {
//   const [balance, setBalance] = useState(480);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
//   const [popupMessage, setPopupMessage] = useState('');
//   const popupAnim = useState(new Animated.Value(0))[0];

//   const showPopup = (message) => {
//     setPopupMessage(message);
//     setShowSuccessPopup(true);
    
//     Animated.sequence([
//       Animated.timing(popupAnim, {
//         toValue: 1,
//         duration: 300,
//         easing: Easing.out(Easing.quad),
//         useNativeDriver: true
//       }),
//       Animated.delay(1500),
//       Animated.timing(popupAnim, {
//         toValue: 0,
//         duration: 300,
//         easing: Easing.in(Easing.quad),
//         useNativeDriver: true
//       })
//     ]).start(() => setShowSuccessPopup(false));
//   };

//   const handleTopUp = (amount) => {
//     const newTransaction = {
//       id: (transactions.length + 1).toString(),
//       title: 'Top-up',
//       amount: amount,
//       date: new Date().toLocaleDateString('en-GB'),
//       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       transactionId: `TXN${Math.floor(100000 + Math.random() * 900000)}`
//     };
    
//     setBalance((prev) => prev + amount);
//     transactions.unshift(newTransaction);
//     setModalVisible(false);
//     showPopup(`₹${amount} added successfully!`);
//   };

//   const popupTranslateY = popupAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [100, 0]
//   });

//   return (
//     <ScrollView 
//       style={styles.container}
//       contentContainerStyle={styles.scrollContent}
//       showsVerticalScrollIndicator={false}
//     >
//       <Text style={styles.headerTitle}>Wallet</Text>

//       {/* Balance Card */}
//       <View style={styles.card}>
//         <Text style={styles.balanceLabel}>Available Balance</Text>
//         <Text style={styles.balance}>₹{balance}</Text>
//         <TouchableOpacity 
//           style={styles.topUpButton} 
//           onPress={() => setModalVisible(true)}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="add-circle-outline" size={FONT_SIZE} color="white" />
//           <Text style={styles.topUpText}>Top Up</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Transactions */}
//       <Text style={styles.transactionHeader}>Recent Transactions</Text>
//       <FlatList
//         data={transactions}
//         scrollEnabled={false}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity 
//             style={styles.transactionItem}
//             activeOpacity={0.8}
//           >
//             <Ionicons
//               name={item.amount > 0 ? 'arrow-down-circle' : 'arrow-up-circle'}
//               size={FONT_SIZE + 4}
//               color={item.amount > 0 ? 'green' : '#EC4D4A'}
//               style={styles.transactionIcon}
//             />
//             <View style={styles.transactionDetails}>
//               <View style={styles.transactionTitleRow}>
//                 <Text style={styles.transactionTitle} numberOfLines={1}>{item.title}</Text>
//                 <Text style={[
//                   styles.transactionAmount,
//                   { color: item.amount > 0 ? 'green' : '#EC4D4A' }
//                 ]}>
//                   {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount)}
//                 </Text>
//               </View>
              
//               <View style={styles.transactionInfoRow}>
//                 <Text style={styles.transactionId}>ID: {item.transactionId}</Text>
//                 <Text style={styles.transactionTime}>{item.date} • {item.time}</Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Top-Up Modal */}
//       <Modal visible={isModalVisible} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Choose Top-Up Amount</Text>
//             {[200, 300, 500].map((amount) => (
//               <Pressable
//                 key={amount}
//                 style={styles.amountButton}
//                 onPress={() => handleTopUp(amount)}
//                 android_ripple={{ color: '#f0f0f0' }}
//               >
//                 <Text style={styles.amountText}>₹{amount}</Text>
//               </Pressable>
//             ))}
//             <Pressable 
//               style={styles.closeButton} 
//               onPress={() => setModalVisible(false)}
//               android_ripple={{ color: '#f0f0f0' }}
//             >
//               <Text style={styles.closeText}>Cancel</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>

//       {/* Success Popup */}
//       {showSuccessPopup && (
//         <Animated.View style={[
//           styles.successPopup,
//           { transform: [{ translateY: popupTranslateY }] }
//         ]}>
//           <Ionicons name="checkmark-circle" size={24} color="white" />
//           <Text style={styles.popupText}>{popupMessage}</Text>
//         </Animated.View>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//   },
//   scrollContent: {
//     paddingHorizontal: width * 0.05,
//     paddingTop: height * 0.02,
//     paddingBottom: height * 0.05,
//   },
//   headerTitle: { 
//     fontSize: FONT_SIZE + 4,
//     fontWeight: '600',
//     marginBottom: height * 0.02,
//     color: '#222'
//   },
//   card: {
//     backgroundColor: '#ffffff',
//     padding: CARD_PADDING,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     elevation: 4,
//     marginBottom: height * 0.03,
//     alignItems: 'center',
//   },
//   balanceLabel: { 
//     fontSize: FONT_SIZE,
//     color: '#888'
//   },
//   balance: { 
//     fontSize: FONT_SIZE * 2,
//     fontWeight: 'bold',
//     marginVertical: height * 0.01,
//     color: '#333'
//   },
//   topUpButton: {
//     flexDirection: 'row',
//     backgroundColor: '#EC4D4A',
//     paddingVertical: height * 0.012,
//     paddingHorizontal: width * 0.06,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: height * 0.01,
//   },
//   topUpText: { 
//     color: '#fff',
//     fontSize: FONT_SIZE,
//     marginLeft: width * 0.02
//   },
//   transactionHeader: { 
//     fontSize: FONT_SIZE + 2,
//     fontWeight: '600',
//     marginBottom: height * 0.015,
//     color: '#444'
//   },
//   transactionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: CARD_PADDING,
//     marginBottom: height * 0.01,
//     shadowColor: '#000',
//     shadowOpacity: 0.03,
//     shadowRadius: 5,
//     elevation: 2,
//     height: TRANSACTION_CARD_HEIGHT,
//   },
//   transactionIcon: {
//     marginRight: width * 0.03,
//   },
//   transactionDetails: {
//     flex: 1,
//   },
//   transactionTitleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: height * 0.005,
//   },
//   transactionTitle: {
//     fontSize: FONT_SIZE,
//     fontWeight: '500',
//     color: '#333',
//     flex: 1,
//     marginRight: width * 0.02,
//   },
//   transactionAmount: {
//     fontSize: FONT_SIZE,
//     fontWeight: '600',
//   },
//   transactionInfoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   transactionId: {
//     fontSize: SMALL_FONT_SIZE,
//     color: '#999',
//   },
//   transactionTime: {
//     fontSize: SMALL_FONT_SIZE,
//     color: '#999',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     padding: CARD_PADDING,
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   modalTitle: {
//     fontSize: FONT_SIZE + 2,
//     fontWeight: '700',
//     marginBottom: height * 0.02,
//     textAlign: 'center',
//   },
//   amountButton: {
//     backgroundColor: '#f0f0f0',
//     paddingVertical: height * 0.015,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: height * 0.012,
//   },
//   amountText: { 
//     fontSize: FONT_SIZE + 2,
//     fontWeight: '600',
//     color: '#333'
//   },
//   closeButton: {
//     paddingVertical: height * 0.015,
//     alignItems: 'center',
//   },
//   closeText: { 
//     color: '#EC4D4A',
//     fontSize: FONT_SIZE
//   },
//   successPopup: {
//     position: 'absolute',
//     bottom: height * 0.05,
//     left: width * 0.1,
//     right: width * 0.1,
//     backgroundColor: '#4CAF50',
//     padding: CARD_PADDING,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//   },
//   popupText: {
//     color: 'white',
//     fontSize: FONT_SIZE,
//     fontWeight: '500',
//     marginLeft: width * 0.02,
//   }
// });

// export default WalletScreen;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import KeyboardAwareWrapper from '../components/KeyboardAwareWrapper';
import { API_URL } from '../utils/api';

const { width, height } = Dimensions.get('window');

// Responsive sizing for all screen sizes
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;

// Font sizes - minimal and responsive
const FONT_SIZES = {
  tiny: scale(10),
  small: scale(12),
  normal: scale(14),
  medium: scale(16),
  large: scale(18),
  xlarge: scale(24),
};

// Spacing
const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
};

const isSmallDevice = width < 350;
const isMediumDevice = width >= 350 && width < 400;
const isLargeDevice = width >= 400;

const WalletScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [popupMessage, setPopupMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [userId, setUserId] = useState(null);
  const popupAnim = useState(new Animated.Value(0))[0];

  // Fetch user details and wallet balance on mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Fetch user details from AsyncStorage and backend
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const phone = await AsyncStorage.getItem('userPhone');
      const token = await AsyncStorage.getItem('token');
      const storedUserId = await AsyncStorage.getItem('userId');
      
      console.log('=== WALLET DEBUG START ===');
      console.log('WalletScreen - Phone:', phone);
      console.log('WalletScreen - UserId:', storedUserId);
      console.log('WalletScreen - Token exists:', !!token);
      console.log('WalletScreen - Token preview:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('WalletScreen - API URL:', `${API_URL}/wallet/balance`);
      
      if (!token) {
        console.log('WalletScreen - No token found, navigating to login');
        // Navigate directly to login
        navigation.navigate('MobileNumber');
        setLoading(false);
        return;
      }

      // Fetch user data from backend
      console.log('WalletScreen - Fetching balance...');
      const response = await axios.get(`${API_URL}/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('WalletScreen - Balance response:', response.data);
      console.log('=== WALLET DEBUG SUCCESS ===');

      if (response.data) {
        setBalance(response.data.balance || 0);
        
        // Get userId from AsyncStorage or fetch from user endpoint
        if (storedUserId) {
          setUserId(storedUserId);
          await fetchTransactions(storedUserId);
        }
        
        // Save to AsyncStorage for offline access
        await AsyncStorage.setItem('walletBalance', String(response.data.balance || 0));
      }
    } catch (error) {
      console.log('=== WALLET DEBUG ERROR ===');
      console.error('Error fetching user details:', error.message);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        console.log('401 - Authentication failed, token might be invalid');
        // Navigate directly to login
        navigation.navigate('MobileNumber');
      } else if (error.response && error.response.status === 404) {
        console.log('404 - User not found in database');
        Alert.alert(
          'Account Not Found', 
          'Your account was not found. Please login again or contact support if the issue persists.',
          [
            {
              text: 'Logout & Login Again',
              onPress: async () => {
                // Clear all stored data
                await AsyncStorage.multiRemove(['token', 'userId', 'userPhone', 'userData']);
                navigation.navigate('MobileNumber');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        console.log('Other error - Loading offline data');
        // Load from AsyncStorage if backend fails
        await loadOfflineData();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load offline data from AsyncStorage
  const loadOfflineData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedBalance = await AsyncStorage.getItem('walletBalance');
      const storedTransactions = await AsyncStorage.getItem('walletTransactions');

      if (storedUserId) setUserId(storedUserId);
      if (storedBalance) setBalance(Number(storedBalance));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  // Fetch transaction history from backend
  const fetchTransactions = async (userIdParam) => {
    try {
      setLoadingTransactions(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        const formattedTransactions = response.data.map((txn) => ({
          id: txn._id,
          transactionId: `TXN${txn._id.slice(-8).toUpperCase()}`,
          amount: txn.amount,
          type: txn.type,
          date: new Date(txn.createdAt).toLocaleDateString(),
          time: new Date(txn.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: new Date(txn.createdAt).getTime(),
          description: txn.description || 'Wallet transaction',
          bookingId: txn.bookingId,
        }));

        setTransactions(formattedTransactions);
        // Save to AsyncStorage
        await AsyncStorage.setItem(
          'walletTransactions',
          JSON.stringify(formattedTransactions)
        );
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserDetails();
    setRefreshing(false);
  };

  const quickAdd = (value) => {
    setAmount((prev) => String(Number(prev || 0) + value));
  };

  const showPopup = (message) => {
    setPopupMessage(message);
    setShowSuccessPopup(true);

    Animated.sequence([
      Animated.timing(popupAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(popupAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => setShowSuccessPopup(false));
  };

  const generateTransactionId = () => {
    return 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleAddFunds = async () => {
    const fund = Number(amount);
    if (!fund || fund <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User information not found. Please try again.');
      return;
    }

    try {
      setLoading(true);

      // ==========================================
      // PAYMENT GATEWAY INTEGRATION (COMMENTED)
      // ==========================================
      // Uncomment and configure when ready to integrate payment gateway
      
      /*
      // Example: Razorpay Integration
      const razorpayOptions = {
        description: 'Wallet Top-up',
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: 'YOUR_RAZORPAY_KEY_ID', // Get from Razorpay Dashboard
        amount: fund * 100, // Amount in paise (multiply by 100)
        name: 'Ridodrop',
        prefill: {
          email: 'customer@example.com',
          contact: await AsyncStorage.getItem('userPhone'),
          name: 'Customer Name'
        },
        theme: { color: '#EC4D4A' }
      };

      RazorpayCheckout.open(razorpayOptions)
        .then(async (paymentData) => {
          // Payment successful
          console.log('Payment Success:', paymentData);
          
          // Verify payment on backend
          const verifyResponse = await axios.post(
            `${API_URL}/wallet/verify-payment`,
            {
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_order_id: paymentData.razorpay_order_id,
              razorpay_signature: paymentData.razorpay_signature,
              userId: userId,
              amount: fund
            },
            {
              headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` }
            }
          );

          if (verifyResponse.data.success) {
            // Credit wallet after successful payment verification
            await creditWalletAfterPayment(fund, paymentData.razorpay_payment_id);
          }
        })
        .catch((error) => {
          console.log('Payment Error:', error);
          Alert.alert('Payment Failed', error.description || 'Payment was not completed');
        });
      */

      /*
      // Example: Stripe Integration
      const { error, paymentIntent } = await stripe.confirmPayment({
        amount: fund * 100, // Amount in cents
        currency: 'inr',
        paymentMethodType: 'card',
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await creditWalletAfterPayment(fund, paymentIntent.id);
      }
      */

      /*
      // Example: PayPal Integration
      const paypalResponse = await PayPal.paymentRequest({
        amount: fund.toString(),
        currency: 'INR',
        description: 'Wallet Top-up'
      });

      if (paypalResponse.status === 'COMPLETED') {
        await creditWalletAfterPayment(fund, paypalResponse.id);
      }
      */

      // ==========================================
      // END OF PAYMENT GATEWAY INTEGRATION
      // ==========================================

      // FOR DEMO/TESTING: Direct wallet credit without payment gateway
      // Remove this section when payment gateway is integrated
      await creditWalletDirectly(fund);

    } catch (error) {
      console.error('Error adding funds:', error);
      Alert.alert('Error', 'Failed to add funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Credit wallet after successful payment (for payment gateway integration)
  const creditWalletAfterPayment = async (fund, paymentId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/wallet/add`,
        {
          amount: fund,
          description: `Wallet top-up - Payment ID: ${paymentId}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        const newBalance = response.data.balance || (balance + fund);
        setBalance(newBalance);
        await AsyncStorage.setItem('walletBalance', String(newBalance));

        // Refresh transactions
        await fetchTransactions(userId);
        
        showPopup(`₹${fund} added successfully!`);
        setAmount('');
      }
    } catch (error) {
      console.error('Error crediting wallet:', error);
      Alert.alert('Error', 'Payment successful but wallet update failed. Please contact support.');
    }
  };

  // Direct wallet credit (for demo/testing without payment gateway)
  const creditWalletDirectly = async (fund) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/wallet/add`,
        {
          amount: fund,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        const newBalance = response.data.balance || (balance + fund);
        setBalance(newBalance);
        await AsyncStorage.setItem('walletBalance', String(newBalance));

        // Refresh transactions
        if (userId) {
          await fetchTransactions(userId);
        }
        
        showPopup(`₹${fund} added successfully!`);
        setAmount('');
      }
    } catch (error) {
      console.error('Error crediting wallet:', error);
      throw error;
    }
  };

  const popupTranslateY = popupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const formatAmount = (amount) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const filterTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 604800000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    switch (activeFilter) {
      case 'today':
        return transactions.filter(txn => new Date(txn.timestamp) >= today);
      case 'weekly':
        return transactions.filter(txn => new Date(txn.timestamp) >= oneWeekAgo);
      case 'monthly':
        return transactions.filter(txn => new Date(txn.timestamp) >= oneMonthAgo);
      default:
        return transactions;
    }
  };

  const applyFilter = (filterType) => {
    setActiveFilter(filterType);
    setShowFilterModal(false);
  };

  const resetFilter = () => {
    setActiveFilter('all');
    setShowFilterModal(false);
  };

  return (
    <KeyboardAwareWrapper 
      enableScrollView={true}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.mainContainer}>
        <HeaderWithBackButton title="Wallet" />
        <ScrollView 
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#EC4D4A']}
              tintColor="#EC4D4A"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EC4D4A" />
              <Text style={styles.loadingText}>Loading wallet...</Text>
            </View>
          ) : (
            <>
              {/* Balance Card */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Icon name="info-outline" size={scale(16)} color="#888" />
                </View>
                <Text style={styles.balanceAmount}>₹{formatAmount(balance)}</Text>
              </View>

              {/* Input Amount */}
              <Text style={styles.label}>Add Amount</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#999"
                style={styles.input}
                editable={!loading}
              />

          {/* Quick Add */}
          <Text style={styles.quickAddLabel}>Quick Add</Text>
          <View style={styles.quickAddContainer}>
            {[200, 400, 600].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.quickAddButton, { marginHorizontal: width * 0.01 }]}
                onPress={() => quickAdd(val)}
                disabled={loading}
              >
                <Text style={styles.quickAddText}>₹{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add Button */}
          <TouchableOpacity 
            style={[styles.addButton, loading && styles.addButtonDisabled]} 
            onPress={handleAddFunds}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add funds</Text>
            )}
          </TouchableOpacity>

          {/* Transaction History Header with Filter Button */}
          <View style={styles.transactionHeader}>
            <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>Transaction History</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Icon name="filter-list" size={scale(18)} color="#EC4D4A" />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
          
          {loadingTransactions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#EC4D4A" />
            </View>
          ) : filterTransactions().length === 0 ? (
            <View style={styles.noTransactions}>
              <Icon name="receipt-long" size={scale(60)} color="#ccc" />
              <Text style={styles.noTransactionsText}>No transactions found</Text>
            </View>
          ) : (
            <View style={styles.transactionList}>
              {filterTransactions().map((txn) => (
                <View key={txn.id} style={styles.transactionCard}>
                  <View style={styles.transactionCardHeader}>
                    <View style={styles.transactionTypeContainer}>
                      <Icon 
                        name="account-balance-wallet" 
                        size={scale(18)} 
                        color={txn.type === 'credit' ? '#4BB543' : '#EC4D4A'} 
                        style={styles.walletIcon} 
                      />
                      <Text style={styles.transactionType} numberOfLines={2}>
                        {txn.description || (txn.type === 'credit' ? 'Money added to wallet' : 'Money debited from wallet')}
                      </Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: txn.type === 'credit' ? '#4BB543' : '#EC4D4A' }
                    ]}>
                      {txn.type === 'credit' ? '+' : '-'}₹{formatAmount(txn.amount)}
                    </Text>
                  </View>
                  <View style={styles.transactionCardBody}>
                    <Text style={styles.transactionId} numberOfLines={1}>Transaction ID: {txn.transactionId}</Text>
                    <Text style={styles.transactionDateTime}>
                      {txn.date} • {txn.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Success Popup */}
          {showSuccessPopup && (
            <Animated.View
              style={[
                styles.popup,
                { transform: [{ translateY: popupTranslateY }] },
              ]}
            >
              <Text style={styles.popupText}>{popupMessage}</Text>
            </Animated.View>
          )}
            </>
          )}
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowFilterModal(false)}
          >
            <Animated.View style={[styles.modalContent, {
              transform: [{
                translateY: showFilterModal ? 
                  new Animated.Value(0) : 
                  new Animated.Value(height * 0.5)
              }]
            }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Transactions</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Icon name="close" size={scale(24)} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterOptionsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.filterOptionCard,
                    activeFilter === 'today' && styles.activeFilterOption
                  ]}
                  onPress={() => applyFilter('today')}
                >
                  <Icon 
                    name="today" 
                    size={scale(22)} 
                    color={activeFilter === 'today' ? '#EC4D4A' : '#666'} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    activeFilter === 'today' && styles.activeFilterText
                  ]}>Today</Text>
                  {activeFilter === 'today' && (
                    <View style={styles.activeIndicator} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.filterOptionCard,
                    activeFilter === 'weekly' && styles.activeFilterOption
                  ]}
                  onPress={() => applyFilter('weekly')}
                >
                  <Icon 
                    name="date-range" 
                    size={scale(22)} 
                    color={activeFilter === 'weekly' ? '#EC4D4A' : '#666'} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    activeFilter === 'weekly' && styles.activeFilterText
                  ]}>This Week</Text>
                  {activeFilter === 'weekly' && (
                    <View style={styles.activeIndicator} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.filterOptionCard,
                    activeFilter === 'monthly' && styles.activeFilterOption
                  ]}
                  onPress={() => applyFilter('monthly')}
                >
                  <Icon 
                    name="calendar-today" 
                    size={scale(22)} 
                    color={activeFilter === 'monthly' ? '#EC4D4A' : '#666'} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    activeFilter === 'monthly' && styles.activeFilterText
                  ]}>This Month</Text>
                  {activeFilter === 'monthly' && (
                    <View style={styles.activeIndicator} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>
    </KeyboardAwareWrapper>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: '#fff4f0',
    borderRadius: scale(12),
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FONT_SIZES.small,
    color: '#666',
  },
  balanceAmount: {
    fontSize: isSmallDevice ? FONT_SIZES.xlarge : FONT_SIZES.xlarge + scale(4),
    fontWeight: 'bold',
    color: '#EC4D4A',
    marginTop: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.normal,
    color: '#444',
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EC4D4A',
    borderRadius: scale(8),
    paddingVertical: verticalScale(10),
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.normal,
    marginBottom: SPACING.md,
    height: verticalScale(44),
  },
  quickAddLabel: {
    fontSize: FONT_SIZES.normal,
    color: '#EC4D4A',
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  quickAddButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: verticalScale(10),
    borderRadius: scale(8),
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(40),
  },
  quickAddText: {
    fontSize: FONT_SIZES.normal,
    color: '#000',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#EC4D4A',
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: verticalScale(44),
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.normal,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.small,
    color: '#666',
  },
  popup: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#4BB543',
    borderRadius: scale(8),
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  popupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.normal,
  },
  noTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  noTransactionsText: {
    fontSize: FONT_SIZES.normal,
    color: '#888',
    marginTop: SPACING.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: scale(6),
    backgroundColor: '#fff4f0',
  },
  filterButtonText: {
    fontSize: FONT_SIZES.small,
    color: '#EC4D4A',
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  transactionList: {
    marginTop: SPACING.sm,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: scale(8),
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#4BB543',
  },
  transactionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  transactionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: SPACING.xs,
  },
  walletIcon: {
    marginRight: SPACING.xs,
    marginTop: scale(2),
  },
  transactionType: {
    fontSize: FONT_SIZES.small,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.normal,
    fontWeight: 'bold',
    color: '#4BB543',
  },
  transactionCardBody: {
    marginTop: SPACING.xs,
  },
  transactionId: {
    fontSize: FONT_SIZES.tiny,
    color: '#666',
    marginBottom: SPACING.xs / 2,
  },
  transactionDateTime: {
    fontSize: FONT_SIZES.tiny,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOptionsContainer: {
    marginBottom: SPACING.lg,
  },
  filterOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: SPACING.md,
    borderRadius: scale(8),
    backgroundColor: '#f9f9f9',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: verticalScale(48),
  },
  activeFilterOption: {
    backgroundColor: '#fff4f0',
    borderColor: '#EC4D4A',
  },
  filterOptionText: {
    fontSize: FONT_SIZES.normal,
    color: '#666',
    marginLeft: SPACING.md,
    flex: 1,
  },
  activeFilterText: {
    color: '#EC4D4A',
    fontWeight: '500',
  },
  activeIndicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#EC4D4A',
  },
  applyButton: {
    backgroundColor: '#EC4D4A',
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: verticalScale(44),
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.normal,
  },
});

export default WalletScreen;