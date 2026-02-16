// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, Share } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const ReferAndEarnScreen = () => {
//   const referralCode = 'RIDODROP 123';

//   const handleShare = async () => {
//     try {
//       const result = await Share.share({
//         message: `Use my referral code ${referralCode} to get rewards! 🚚💰 Download the app now.`,
//       });
//       if (result.action === Share.sharedAction) {
//         if (result.activityType) {
//           // Shared with activity type
//         } else {
//           // Shared
//         }
//       } else if (result.action === Share.dismissedAction) {
//         // Dismissed
//       }
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require('../assets/Rafer.png')} // Replace with your local image or remove if not available
//         style={styles.banner}
//         resizeMode="contain"
//       />
//       <Text style={styles.title}>Refer and Earn</Text>
//       <Text style={styles.subtitle}>Share your code and earn exciting rewards!</Text>

//       <View style={styles.referralBox}>
//         <Text style={styles.code}>{referralCode}</Text>
//         <TouchableOpacity style={styles.copyButton} onPress={handleShare}>
//           <Ionicons name="share-social-outline" size={20} color="white" />
//           <Text style={styles.copyText}>Share</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.howItWorks}>
//         <Text style={styles.howTitle}>How it works</Text>
//         <Text style={styles.howItem}>• Share your referral code</Text>
//         <Text style={styles.howItem}>• Friends get discounts on first booking</Text>
//         <Text style={styles.howItem}>• You earn coins for every referral</Text>
//       </View>
//     </View>
//   );
// };

// export default ReferAndEarnScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   banner: {
//     width: '100%',
//     height: 200,
//     marginBottom: 10,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 10,
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 16,
//     textAlign: 'center',
//     color: 'gray',
//     marginBottom: 20,
//   },
//   referralBox: {
//     backgroundColor: '#f2f2f2',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   code: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     letterSpacing: 2,
//     color: '#000',
//   },
//   copyButton: {
//     flexDirection: 'row',
//     backgroundColor: 'red',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     alignItems: 'center',
//   },
//   copyText: {
//     color: '#fff',
//     marginLeft: 8,
//     fontWeight: 'bold',
//   },
//   howItWorks: {
//     paddingHorizontal: 10,
//   },
//   howTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   howItem: {
//     fontSize: 15,
//     marginBottom: 6,
//     color: '#444',
//   },
// });


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Share,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient'; // ensure expo-linear-gradient is installed

// const { width } = Dimensions.get('window');

// const ReferAndEarnScreen = () => {
//   const referralCode = 'RIDODROP123';
//   const [referralCount, setReferralCount] = useState(12); // static for now, can be dynamic via API

//   const handleShare = async () => {
//     try {
//       const result = await Share.share({
//         message: `Use my referral code ${referralCode} to get rewards! 🚚💰 Download the app now.`,
//       });

//       if (result.action === Share.sharedAction) {
//         if (!result.activityType) {
//           setReferralCount(referralCount + 1); // increase share count
//         }
//       }
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require('../assets/Rafer.png')}
//         style={styles.banner}
//         resizeMode="contain"
//       />

//       <Text style={styles.title}>Refer and Earn</Text>
//       <Text style={styles.subtitle}>Invite friends and earn rewards for every referral!</Text>

//       <View style={styles.referralCard}>
//         <Text style={styles.codeLabel}>Your Referral Code</Text>
//         <Text style={styles.code}>{referralCode}</Text>

//         <TouchableOpacity onPress={handleShare}>
//           <LinearGradient
//             colors={['#ff512f', '#dd2476']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={styles.shareButton}
//           >
//             <Ionicons name="share-social-outline" size={20} color="white" />
//             <Text style={styles.shareText}>Share Code</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.statsBox}>
//         <Ionicons name="people" size={22} color="#333" />
//         <Text style={styles.statsText}>{referralCount} people used your code</Text>
//       </View>

//       <View style={styles.howItWorks}>
//         <Text style={styles.howTitle}>How It Works</Text>
//         <Text style={styles.howItem}>• Share your referral code</Text>
//         <Text style={styles.howItem}>• Friends get discounts on their first booking</Text>
       
//       </View>
//     </View>
//   );
// };

// export default ReferAndEarnScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fefefe',
//     paddingHorizontal: 20,
//     paddingTop: 10,
//   },
//   banner: {
//     width: '100%',
//     height: 180,
//     marginBottom: 10,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '800',
//     textAlign: 'center',
//     color: '#222',
//   },
//   subtitle: {
//     fontSize: 16,
//     textAlign: 'center',
//     color: '#666',
//     marginVertical: 10,
//   },
//   referralCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 10,
//     elevation: 3,
//     marginVertical: 20,
//   },
//   codeLabel: {
//     fontSize: 14,
//     color: '#999',
//     marginBottom: 5,
//   },
//   code: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     letterSpacing: 2,
//     marginBottom: 20,
//     color: '#222',
//   },
//   shareButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 30,
//   },
//   shareText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   statsBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#e6f3ff',
//     padding: 14,
//     borderRadius: 12,
//     marginBottom: 25,
//   },
//   statsText: {
//     marginLeft: 10,
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   howItWorks: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   howTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 10,
//     color: '#222',
//   },
//   howItem: {
//     fontSize: 15,
//     color: '#555',
//     marginBottom: 8,
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import { getReferralStats } from '../utils/AuthApi';

const ReferAndEarnScreen = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [completedReferrals, setCompletedReferrals] = useState(0);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert('Error', 'Please login to view referral details');
        return;
      }

      const response = await getReferralStats(userId, token);
      
      if (response.data.success) {
        const { data } = response.data;
        setReferralCode(data.referralCode || 'N/A');
        setReferralCount(data.totalReferrals || 0);
        setTotalEarnings(data.totalEarnings || 0);
        setPendingEarnings(data.pendingEarnings || 0);
        setCompletedReferrals(data.completedReferrals || 0);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load referral data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!referralCode || referralCode === 'N/A') {
      Alert.alert('Error', 'Referral code not available');
      return;
    }

    try {
      const result = await Share.share({
        message: `Join Ridodrop and get ₹50 off on your first booking! Use my referral code: ${referralCode} 🚚💰\n\nDownload the app now!`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Referral code shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton title="Refer & Earn" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff512f" />
          <Text style={styles.loadingText}>Loading referral details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Refer & Earn" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
      <Image
        source={require('../assets/Rafer.png')}
        style={styles.banner}
        resizeMode="contain"
      />

      <Text style={styles.title}>Refer and Earn</Text>
      <Text style={styles.subtitle}>Invite friends and earn ₹100 for every successful referral!</Text>

      <View style={styles.referralCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.code}>{referralCode}</Text>

        <TouchableOpacity onPress={handleShare}>
          <LinearGradient
            colors={['#ff512f', '#dd2476']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButton}
          >
            <Ionicons name="share-social-outline" size={20} color="white" />
            <Text style={styles.shareText}>Share Code</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Referral Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#ff512f" />
          <Text style={styles.statNumber}>{referralCount}</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{completedReferrals}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Earnings Summary */}
      <View style={styles.earningsCard}>
        <View style={styles.earningsRow}>
          <View style={styles.earningsItem}>
            <Text style={styles.earningsLabel}>Total Earned</Text>
            <Text style={styles.earningsAmount}>₹{totalEarnings}</Text>
          </View>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsItem}>
            <Text style={styles.earningsLabel}>Pending</Text>
            <Text style={[styles.earningsAmount, styles.pendingAmount]}>₹{pendingEarnings}</Text>
          </View>
        </View>
      </View>

      <View style={styles.howItWorks}>
        <Text style={styles.howTitle}>How It Works</Text>
        <Text style={styles.howItem}>• Share your referral code with friends</Text>
        <Text style={styles.howItem}>• Friends get ₹50 discount on their first booking</Text>
        <Text style={styles.howItem}>• You earn ₹100 when they complete their first ride</Text>
        <Text style={styles.howItem}>• Earnings are credited to your wallet automatically</Text>
      </View>
    </ScrollView>
    </View>
  );
};

export default ReferAndEarnScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fefefe',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fefefe',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 30,
  },
  banner: {
    width: '100%',
    height: 180, // Fixed height in pixels
    marginBottom: 10,
  },
  title: {
    fontSize: 28, // Fixed font size in pixels
    fontWeight: '800',
    textAlign: 'center',
    color: '#222',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16, // Fixed font size in pixels
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  referralCard: {
    backgroundColor: '#fff',
    borderRadius: 16, // Fixed border radius in pixels
    padding: 20, // Fixed padding in pixels
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10, // Fixed shadow radius in pixels
    elevation: 3,
    marginBottom: 20, // Fixed margin in pixels
  },
  codeLabel: {
    fontSize: 14, // Fixed font size in pixels
    color: '#999',
    marginBottom: 5,
  },
  code: {
    fontSize: 22, // Fixed font size in pixels
    fontWeight: 'bold',
    letterSpacing: 2, // Fixed letter spacing in pixels
    marginBottom: 20,
    color: '#222',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Fixed padding in pixels
    paddingHorizontal: 25, // Fixed padding in pixels
    borderRadius: 30, // Fixed border radius in pixels
  },
  shareText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16, // Fixed font size in pixels
    marginLeft: 8, // Fixed margin in pixels
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningsItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  earningsAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pendingAmount: {
    color: '#ff9800',
  },
  howItWorks: {
    backgroundColor: '#fff',
    borderRadius: 12, // Fixed border radius in pixels
    padding: 20, // Fixed padding in pixels
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8, // Fixed shadow radius in pixels
    elevation: 2,
  },
  howTitle: {
    fontSize: 18, // Fixed font size in pixels
    fontWeight: '700',
    marginBottom: 10, // Fixed margin in pixels
    color: '#222',
  },
  howItem: {
    fontSize: 15, // Fixed font size in pixels
    color: '#555',
    marginBottom: 8, // Fixed margin in pixels
  },
});