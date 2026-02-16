// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
// import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

// const BookingDetailsScreen = () => {
//   return (
//     <ScrollView style={styles.container}>
//       {/* Header Card */}
//       <View style={styles.card}>
//         <Text style={styles.label}>2 Wheeler • Rahul</Text>
//         <Text style={styles.plate}>KA-50-AB-1234</Text>
//         <TouchableOpacity style={styles.callButton}>
//           <FontAwesome name="phone" size={20} color="#EC4D4A" />
//         </TouchableOpacity>
//       </View>

//       {/* Address Info */}
//       <View style={styles.addressCard}>
//         <AddressRow 
//           name="Rahul Kumar" 
//           phone="8556487589"
//           address="2nd cross Shivaji nagar" 
//           isPickup 
//         />
//         <AddressRow 
//           name="Rahul Kumar" 
//           phone="8556487589"
//           address="6th cross majestic" 
//         />
//         <View style={styles.addressActions}>
//           <TouchableOpacity>
//             <Text style={styles.addStop}>+ Add Stops</Text>
//           </TouchableOpacity>
//           <TouchableOpacity>
//             <Text style={styles.viewDetails}>View Details</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Payment Method */}
//       <View style={styles.paymentCard}>
//         <View style={styles.paymentRow}>
//           <FontAwesome name="money" size={20} color="#4CAF50" />
//           <Text style={styles.paymentLabel}>Cash</Text>
//           <Text style={styles.paymentAmount}>₹150</Text>
//         </View>
//         <TouchableOpacity>
//           <Text style={styles.viewBreakup}>View Breakup</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Consignment Note */}
//       <View style={styles.consignment}>
//         <Text style={styles.consignmentText}>Consignment Note</Text>
//         <TouchableOpacity>
//           <Text style={styles.downloadText}>Download</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Support */}
//       <View style={styles.supportBox}>
//         <Text>Facing issue in this order?</Text>
//         <TouchableOpacity onPress={() => Linking.openURL('tel:1234567890')}>
//           <Text style={styles.contactSupport}>Contact Support</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Cancel Trip */}
//       <TouchableOpacity style={styles.cancelBtn}>
//         <Text style={styles.cancelText}>Cancel Trip</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const AddressRow = ({ name, phone, address, isPickup }) => (
//   <View style={styles.addressRow}>
//     <View style={styles.addressIconWrapper}>
//       <View style={[styles.dot, { backgroundColor: isPickup ? 'green' : '#EC4D4A' }]} />
//       <View style={styles.verticalLine} />
//     </View>
//     <View style={{ flex: 1 }}>
//       <Text>{name} • {phone}</Text>
//       <Text>{address}</Text>
//     </View>
//     <TouchableOpacity>
//       <Text style={styles.editBtn}>Edit</Text>
//     </TouchableOpacity>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   card: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 0.5,
//     borderColor: '#ddd',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   label: { fontSize: 14, color: '#888' },
//   plate: { fontSize: 16, fontWeight: 'bold' },
//   callButton: {
//     padding: 8,
//   },
//   addressCard: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginVertical: 8,
//   },
//   addressRow: {
//     flexDirection: 'row',
//     marginBottom: 12,
//   },
//   addressIconWrapper: {
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//   },
//   verticalLine: {
//     width: 2,
//     height: 30,
//     backgroundColor: '#ccc',
//     marginTop: 4,
//   },
//   editBtn: {
//     color: '#EC4D4A',
//     fontWeight: 'bold',
//   },
//   addressActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   addStop: {
//     color: '#EC4D4A',
//     fontWeight: 'bold',
//   },
//   viewDetails: {
//     color: '#EC4D4A',
//     fontWeight: 'bold',
//   },
//   paymentCard: {
//     padding: 16,
//     borderTopWidth: 0.5,
//     borderColor: '#eee',
//   },
//   paymentRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   paymentLabel: {
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   paymentAmount: {
//     marginLeft: 'auto',
//     fontWeight: 'bold',
//   },
//   viewBreakup: {
//     color: '#EC4D4A',
//     marginTop: 8,
//   },
//   consignment: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//   },
//   consignmentText: {
//     fontSize: 16,
//   },
//   downloadText: {
//     color: '#EC4D4A',
//     fontWeight: 'bold',
//   },
//   supportBox: {
//     backgroundColor: '#f8f8f8',
//     padding: 16,
//     alignItems: 'center',
//   },
//   contactSupport: {
//     color: '#EC4D4A',
//     fontWeight: 'bold',
//     marginTop: 4,
//   },
//   cancelBtn: {
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   cancelText: {
//     color: '#EC4D4A',
//     fontWeight: 'bold',
//   },
// });

// export default BookingDetailsScreen;

// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Dimensions, SafeAreaView } from 'react-native';
// import { Ionicons, FontAwesome5, FontAwesome, MaterialIcons } from '@expo/vector-icons';
// import MapView, { Marker, Polyline } from 'react-native-maps';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width, height } = Dimensions.get('window');

// const scaleSize = (size) => {
//   const scaleFactor = Math.min(width, height) / 375;
//   return Math.round(size * scaleFactor);
// };

// const BookingDetailsScreen = () => {
//   const locations = [
//     {
//       id: 0,
//       name: 'Lokesh godewar • 9552567681',
//       address: 'Police Quarters, RK Hegde Nagar, Bengaluru',
//       isFirst: true,
//     },
//     {
//       id: 1,
//       name: 'Mid Stop 1',
//       address: '5th Cross, Koramangala, Bengaluru',
//     },
//     {
//       id: 2,
//       name: 'Mid Stop 2',
//       address: '10th Main, Indiranagar, Bengaluru',
//     },
//     {
//       id: 3,
//       name: 'Mid Stop 3',
//       address: '6th cross Whitefield, Bengaluru',
//     },
//     {
//       id: 4,
//       name: 'Lokesh • 9552567681',
//       address: '8th cross Majestic, Bengaluru',
//       isLast: true,
//     },
//   ];

//   const StopIndicator = ({ index, isFirst, isLast }) => (
//     <View style={styles.stopDotWrapper}>
//       {isFirst ? (
//         <View style={styles.greenDot} />
//       ) : (
//         <View style={styles.numberedRedDot}>
//           <Text style={styles.stopNumber}>{index}</Text>
//         </View>
//       )}
//       {!isLast && <View style={styles.verticalLine} />}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Header */}
//         {/* <LinearGradient
//           colors={['#EC4D4A', '#FF6B6B']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={styles.header}
//         >
//           <TouchableOpacity style={styles.backButton}>
//             <Ionicons name="arrow-back" size={scaleSize(24)} color="white" />
//           </TouchableOpacity>
//           <View style={styles.headerTextContainer}>
//             <Text style={styles.headerTitle}>Booking Details</Text>
//           </View>
//           <View style={styles.headerIcons}>
//             <TouchableOpacity style={styles.headerIconButton}>
//               <Ionicons name="notifications-outline" size={scaleSize(20)} color="white" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.headerIconButton}>
//               <Ionicons name="share-social-outline" size={scaleSize(20)} color="white" />
//             </TouchableOpacity>
//           </View>
//         </LinearGradient> */}

//         {/* Map */}
//         <View style={styles.mapContainer}>
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: 12.9545,
//               longitude: 77.5645,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }}
//           >
//             <Marker 
//               coordinate={{ latitude: 12.9545, longitude: 77.5645 }}
//               pinColor="#EC4D4A"
//             />
//             <Polyline
//               coordinates={[
//                 { latitude: 12.9545, longitude: 77.5645 },
//                 { latitude: 12.9611, longitude: 77.6006 },
//               ]}
//               strokeColor="#EC4D4A"
//               strokeWidth={4}
//             />
//           </MapView>
//           <View style={styles.distanceBadge}>
//             <Text style={styles.distanceText}>1.5 km away</Text>
//           </View>
//         </View>

//         {/* Content */}
//         <ScrollView style={styles.contentContainer}>
//           {/* Driver Info Card */}
//           <View style={styles.driverCard}>
//             <View style={styles.driverInfo}>
//               <FontAwesome5 name="motorcycle" size={scaleSize(24)} color="#EC4D4A" />
//               <View style={styles.driverText}>
//                 <Text style={styles.vehicleText}>2 Wheeler • Lokesh</Text>
//                 <Text style={styles.vehicleNumber}>KA-50-AB-1234</Text>
//               </View>
//             </View>
//             <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL('tel:+919552567681')}>
//               <FontAwesome name="phone" size={scaleSize(20)} color="white" />
//               <Text style={styles.callButtonText}>Call</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Location Card */}
//           <View style={styles.locationCard}>
//             <ScrollView>
//               {locations.map((loc, index) => (
//                 <View key={loc.id} style={styles.locationRow}>
//                   <StopIndicator
//                     index={index}
//                     isFirst={loc.isFirst}
//                     isLast={loc.isLast}
//                   />
//                   <View style={styles.locationText}>
//                     <Text style={styles.name}>{loc.name}</Text>
//                     <Text numberOfLines={1} style={styles.address}>
//                       {loc.address}
//                     </Text>
//                   </View>
//                 </View>
//               ))}
//             </ScrollView>
//             <View style={styles.locationActions}>
//               <TouchableOpacity style={styles.locationActionButton}>
//                 <Text style={styles.actionText}>Edit Stops</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.locationActionButton}>
//                 <Text style={styles.actionText}>View Details</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Payment Card */}
//           <View style={styles.paymentCard}>
//             <View style={styles.paymentInfo}>
//               <FontAwesome name="money" size={scaleSize(20)} color="#4CAF50" />
//               <Text style={styles.paymentMethod}>Cash Payment</Text>
//               <Text style={styles.amount}>₹150</Text>
//             </View>
//             <TouchableOpacity>
//               <Text style={styles.viewBreakup}>View Breakup</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Consignment Card */}
//           <View style={styles.consignmentCard}>
//             <Text style={styles.consignmentTitle}>Consignment Note</Text>
//             <TouchableOpacity style={styles.downloadButton}>
//               <Text style={styles.downloadText}>Download</Text>
//               <MaterialIcons name="file-download" size={scaleSize(20)} color="#EC4D4A" />
//             </TouchableOpacity>
//           </View>

//           {/* Support Card */}
//           <View style={styles.supportCard}>
//             <Text style={styles.supportText}>Facing issue in this order?</Text>
//             <TouchableOpacity 
//               style={styles.supportButton}
//               onPress={() => Linking.openURL('tel:1234567890')}
//             >
//               <Text style={styles.supportButtonText}>Contact Support</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Cancel Button */}
//           <TouchableOpacity style={styles.cancelButton}>
//             <Text style={styles.cancelButtonText}>Cancel Trip</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     paddingTop: height * 0.04,
//     paddingHorizontal: width * 0.04,
//     paddingBottom: height * 0.02,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//     zIndex: 10,
//   },
//   backButton: {
//     padding: width * 0.02,
//   },
//   headerTextContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     color: 'white',
//     fontSize: scaleSize(18),
//     fontWeight: 'bold',
//   },
//   headerIcons: {
//     flexDirection: 'row',
//     gap: width * 0.04,
//   },
//   headerIconButton: {
//     padding: width * 0.01,
//   },
//   mapContainer: {
//     height: height * 0.3,
//     width: '100%',
//     position: 'relative',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   distanceBadge: {
//     position: 'absolute',
//     top: height * 0.02,
//     left: width * 0.04,
//     backgroundColor: 'white',
//     paddingHorizontal: width * 0.04,
//     paddingVertical: height * 0.01,
//     borderRadius: scaleSize(20),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   distanceText: {
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: width * 0.04,
//     paddingTop: height * 0.02,
//     paddingBottom: height * 0.1,
//   },
//   driverCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: height * 0.02,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   driverInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: width * 0.04,
//   },
//   driverText: {
//     gap: height * 0.005,
//   },
//   vehicleText: {
//     fontSize: scaleSize(16),
//     color: '#333',
//   },
//   vehicleNumber: {
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   callButton: {
//     backgroundColor: '#EC4D4A',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: width * 0.02,
//     paddingHorizontal: width * 0.04,
//     paddingVertical: height * 0.01,
//     borderRadius: scaleSize(20),
//   },
//   callButtonText: {
//     color: 'white',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//   },
//   locationCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     marginBottom: height * 0.02,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: scaleSize(12),
//   },
//   stopDotWrapper: {
//     alignItems: 'center',
//     width: scaleSize(32),
//     marginRight: scaleSize(8),
//   },
//   greenDot: {
//     width: scaleSize(12),
//     height: scaleSize(12),
//     borderRadius: scaleSize(6),
//     backgroundColor: '#4CAF50',
//     marginVertical: scaleSize(6),
//   },
//   numberedRedDot: {
//     width: scaleSize(18),
//     height: scaleSize(18),
//     borderRadius: scaleSize(9),
//     backgroundColor: '#EC4D4A',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: scaleSize(4),
//   },
//   stopNumber: {
//     color: '#fff',
//     fontSize: scaleSize(12),
//     fontWeight: 'bold',
//   },
//   verticalLine: {
//     width: scaleSize(2),
//     height: scaleSize(28),
//     backgroundColor: '#e0e0e0',
//     marginVertical: scaleSize(2),
//   },
//   locationText: {
//     flex: 1,
//     paddingTop: scaleSize(2),
//   },
//   name: {
//     fontWeight: '600',
//     fontSize: scaleSize(14),
//     color: '#333',
//     marginBottom: scaleSize(2),
//   },
//   address: {
//     fontSize: scaleSize(13),
//     color: '#666',
//     lineHeight: scaleSize(18),
//   },
//   locationActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: height * 0.02,
//   },
//   locationActionButton: {
//     paddingVertical: height * 0.01,
//   },
//   actionText: {
//     color: '#EC4D4A',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//   },
//   paymentCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     marginBottom: height * 0.02,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   paymentInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: width * 0.04,
//     marginBottom: height * 0.01,
//   },
//   paymentMethod: {
//     flex: 1,
//     fontSize: scaleSize(16),
//     color: '#333',
//   },
//   amount: {
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   viewBreakup: {
//     color: '#EC4D4A',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//   },
//   consignmentCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     marginBottom: height * 0.02,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   consignmentTitle: {
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: height * 0.01,
//   },
//   downloadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: width * 0.02,
//   },
//   downloadText: {
//     color: '#EC4D4A',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//   },
//   supportCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     marginBottom: height * 0.02,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   supportText: {
//     fontSize: scaleSize(14),
//     color: '#666',
//     marginBottom: height * 0.01,
//   },
//   supportButton: {
//     alignSelf: 'flex-start',
//   },
//   supportButtonText: {
//     color: '#EC4D4A',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//   },
//   cancelButton: {
//     backgroundColor: '#EC4D4A',
//     borderWidth: 1,
//     borderColor: '#EC4D4A',
//     borderRadius: scaleSize(12   ),
//     paddingVertical: height * 0.015,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     marginBottom:height * 0.2,
//   },
//   cancelButtonText: {
//     color: 'white',
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//   },
// });

// export default BookingDetailsScreen;

// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Dimensions, SafeAreaView, Image } from 'react-native';
// import { Ionicons, FontAwesome5, FontAwesome, MaterialIcons } from '@expo/vector-icons';
// import MapView, { Marker, Polyline } from 'react-native-maps';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width, height } = Dimensions.get('window');

// const scaleSize = (size) => {
//   const scaleFactor = Math.min(width, height) / 375;
//   return Math.round(size * scaleFactor);
// };

// const BookingDetailsScreen = () => {
//   const locations = [
//     {
//       id: 0,
//       name: 'Lokesh godewar • 9552567681',
//       address: 'Police Quarters, RK Hegde Nagar, Bengaluru',
//       isFirst: true,
//     },
//     {
//       id: 1,
//       name: 'Mid Stop 1',
//       address: '5th Cross, Koramangala, Bengaluru',
//     },
//     {
//       id: 2,
//       name: 'Mid Stop 2',
//       address: '10th Main, Indiranagar, Bengaluru',
//     },
//     {
//       id: 3,
//       name: 'Mid Stop 3',
//       address: '6th cross Whitefield, Bengaluru',
//     },
//     {
//       id: 4,
//       name: 'Lokesh • 9552567681',
//       address: '8th cross Majestic, Bengaluru',
//       isLast: true,
//     },
//   ];

//   const StopIndicator = ({ index, isFirst, isLast }) => (
//     <View style={styles.stopDotWrapper}>
//       {isFirst ? (
//         <View style={styles.greenDot} />
//       ) : (
//         <View style={styles.numberedRedDot}>
//           <Text style={styles.stopNumber}>{index}</Text>
//         </View>
//       )}
//       {!isLast && <View style={styles.verticalLine} />}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Map */}
//         <View style={styles.mapContainer}>
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: 12.9545,
//               longitude: 77.5645,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }}
//           >
//             <Marker 
//               coordinate={{ latitude: 12.9545, longitude: 77.5645 }}
//               pinColor="#EC4D4A"
//             />
//             <Polyline
//               coordinates={[
//                 { latitude: 12.9545, longitude: 77.5645 },
//                 { latitude: 12.9611, longitude: 77.6006 },
//               ]}
//               strokeColor="#EC4D4A"
//               strokeWidth={4}
//             />
//           </MapView>
//         </View>

   

//         {/* Content */}
//         <ScrollView style={styles.contentContainer}>
//           {/* Driver Info Card */}

          
         
   
// <View style={styles.unifiedCard}>
//   {/* Top row: Date & Time | Order ID + Share */}
//   <View style={styles.bookingRow}>
//     <View style={{ flex: 1 }}>
//       <Text style={styles.dateText}>12 June 2023</Text>
//       <Text style={styles.timeText}>10:30 AM</Text>
//     </View>
//     <View style={{ alignItems: 'flex-end' }}>
//       <Text style={styles.orderIdText}>Order ID: #123456</Text>
//       <TouchableOpacity style={styles.shareButton}>
//         <Text style={styles.shareText}>Share Trip</Text>
//         <Ionicons name="share-social" size={scaleSize(16)} color="#EC4D4A" />
//       </TouchableOpacity>
//     </View>
//   </View>

  

//   {/* Driver Row */}
//   <View style={styles.driverRow}>
//     <Image 
//       source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
//       style={styles.driverPhoto}
//     />
//     <View style={{ flex: 1, marginLeft: scaleSize(12) }}>
//       <Text style={styles.driverName}>Nihaz Wg Varjralli</Text>
//       <Text style={styles.driverVehicle}>KA-50-AB-1234 • 2 Wheeler</Text>
//       <TouchableOpacity 
//         style={styles.callDriverButton}
//         onPress={() => Linking.openURL('tel:+911234567890')}
//       >
//         <FontAwesome name="phone" size={scaleSize(16)} color="white" />
//         <Text style={styles.callButtonText}>Call Driver</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// </View>


//           {/* Location Card */}
//           <View style={styles.locationCard}>
//             <ScrollView>
//               {locations.map((loc, index) => (
//                 <View key={loc.id} style={styles.locationRow}>
//                   <StopIndicator
//                     index={index}
//                     isFirst={loc.isFirst}
//                     isLast={loc.isLast}
//                   />
//                   <View style={styles.locationText}>
//                     <Text style={styles.name}>{loc.name}</Text>
//                     <Text numberOfLines={1} style={styles.address}>
//                       {loc.address}
//                     </Text>
//                   </View>
//                 </View>
//               ))}
//             </ScrollView>
//             <View style={styles.locationActions}>
//               <TouchableOpacity style={styles.locationActionButton}>
//                 <Text style={styles.actionText}>Edit Stop</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.locationActionButton}>
//                 <Text style={styles.actionText}>View Details</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Payment Card */}
//           <View style={styles.paymentCard}>
//             <View style={styles.paymentHeader}>
//               <Text style={styles.paymentTitle}>Payment</Text>
//               <Text style={styles.paymentAmount}>₹150</Text>
//             </View>
//             <View style={styles.paymentMethodContainer}>
//               <FontAwesome name="money" size={scaleSize(20)} color="#4CAF50" />
//               <Text style={styles.paymentMethod}>Cash</Text>
//             </View>
//             <View style={styles.paymentNote}>
//               <Text style={styles.paymentNoteText}>Payment at pick UP point</Text>
//             </View>
//           </View>

//           {/* Invoice Card */}
//           <View style={styles.invoiceCard}>
//             <Text style={styles.invoiceTitle}>Download Invoice</Text>
//             <TouchableOpacity style={styles.downloadButton}>
//               <MaterialIcons name="file-download" size={scaleSize(20)} color="#EC4D4A" />
//             </TouchableOpacity>
//           </View>

//           {/* Support Card */}
//           <View style={styles.supportCard}>
//             <Text style={styles.supportText}>Need help with your trip?</Text>
//             <TouchableOpacity 
//               style={styles.supportButton}
//               onPress={() => Linking.openURL('tel:1234567890')}
//             >
//               <Text style={styles.supportButtonText}>Call Customer Support</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Cancel Button */}
//           <TouchableOpacity style={styles.cancelButton}>
//             <Text style={styles.cancelButtonText}>Cancel Trip</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   mapContainer: {
//     height: height * 0.3,
//     width: '100%',
//     // position: 'relative',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   bookingInfoCard: {
//     backgroundColor: 'white',
//   borderRadius: scaleSize(12),
//   padding: scaleSize(16),
//   marginBottom: scaleSize(16),
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 2 },
//   shadowOpacity: 0.1,
//   shadowRadius: 4,
//   elevation: 2,
//   },
//   bookingInfoLeft: {
//     flex: 1,
//   },
//   orderIdText: {
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: scaleSize(8),
//   },
//   shareButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   shareText: {
//     color: '#EC4D4A',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//     marginRight: scaleSize(4),
//   },
//   bookingInfoRight: {
//     alignItems: 'flex-end',
//   },
//   dateText: {
//     fontSize: scaleSize(14),
//     color: '#666',
//     marginBottom: scaleSize(4),
//   },
//   timeText: {
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   contentContainer: {
//   flex: 1,
//   paddingHorizontal: scaleSize(16),
//   paddingTop: scaleSize(16), // Updated from height * 0.35
//   paddingBottom: height * 0.1,
//   },
//   driverCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: scaleSize(16),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   driverPhotoContainer: {
//     marginRight: scaleSize(12),
//   },
//   driverPhoto: {
//     width: scaleSize(50),
//     height: scaleSize(50),
//     borderRadius: scaleSize(25),
//     marginBottom: scaleSize(35)
//   },
//   driverDetails: {
//     flex: 1,
//   },
//   driverName: {
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: scaleSize(4),
//   },
//   driverVehicle: {
//     fontSize: scaleSize(14),
//     color: '#666',
//   },
//   callDriverContainer: {
//      marginLeft: scaleSize(12),
    
//   },
//   callDriverButton: {
   
//     backgroundColor: '#EC4D4A',
//   flexDirection: 'row',
//   alignItems: 'center',
//   justifyContent: 'center',
//   paddingHorizontal: scaleSize(16),
//   paddingVertical: scaleSize(10),
//   borderRadius: scaleSize(20),
//   marginTop: scaleSize(12),
//   },
//   callButtonText: {
//     color: 'white',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//     marginLeft: scaleSize(4),
//   },
//   locationCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     marginBottom: scaleSize(16),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: scaleSize(12),
//   },
//   stopDotWrapper: {
//     alignItems: 'center',
//     width: scaleSize(32),
//     marginRight: scaleSize(8),
//   },
//   greenDot: {
//     width: scaleSize(12),
//     height: scaleSize(12),
//     borderRadius: scaleSize(6),
//     backgroundColor: '#4CAF50',
//     marginVertical: scaleSize(6),
//   },
//   numberedRedDot: {
//     width: scaleSize(18),
//     height: scaleSize(18),
//     borderRadius: scaleSize(9),
//     backgroundColor: '#EC4D4A',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: scaleSize(4),
//   },
//   stopNumber: {
//     color: '#fff',
//     fontSize: scaleSize(12),
//     fontWeight: 'bold',
//   },
//   verticalLine: {
//     width: scaleSize(2),
//     height: scaleSize(28),
//     backgroundColor: '#e0e0e0',
//     marginVertical: scaleSize(2),
//   },
//   locationText: {
//     flex: 1,
//     paddingTop: scaleSize(2),
//   },
//   name: {
//     fontWeight: '600',
//     fontSize: scaleSize(14),
//     color: '#333',
//     marginBottom: scaleSize(2),
//   },
//   address: {
//     fontSize: scaleSize(13),
//     color: '#666',
//     lineHeight: scaleSize(18),
//   },
//   locationActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: scaleSize(16),
//   },
//   locationActionButton: {
//     paddingVertical: scaleSize(8),
//   },
//   actionText: {
//     color: '#EC4D4A',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//   },
//   paymentCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     marginBottom: scaleSize(16),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   paymentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: scaleSize(12),
//   },
//   paymentTitle: {
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   paymentAmount: {
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: scaleSize(4), 
//   },
//   paymentMethodContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: scaleSize(12),
//   },
//   paymentMethod: {
//     fontSize: scaleSize(16),
//     color: '#333',
//     marginLeft: scaleSize(8),
//   },
//   paymentNote: {
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     paddingTop: scaleSize(12),
//   },
//   paymentNoteText: {
//     fontSize: scaleSize(14),
//     color: '#666',
//   },
//   invoiceCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     marginBottom: scaleSize(16),
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   invoiceTitle: {
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   downloadButton: {
//     padding: scaleSize(8),
//   },
//   supportCard: {
//     backgroundColor: 'white',
//     borderRadius: scaleSize(12),
//     padding: scaleSize(16),
//     marginBottom: scaleSize(16),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   supportText: {
//     fontSize: scaleSize(14),
//     color: '#666',
//     marginBottom: scaleSize(12),
//   },
//   supportButton: {
//     alignSelf: 'flex-start',
//   },
//   supportButtonText: {
//     color: '#EC4D4A',
//     fontSize: scaleSize(14),
//     fontWeight: 'bold',
//   },
//   cancelButton: {
//     backgroundColor: '#EC4D4A',
//     borderWidth: 1,
//     borderColor: '#EC4D4A',
//     borderRadius: scaleSize(14),
//     paddingVertical: scaleSize(14),
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//      marginBottom: scaleSize(30), 
//   },
//   cancelButtonText: {
//     color: 'white',
//     fontSize: scaleSize(16),
//     fontWeight: 'bold',
//   },

//   unifiedCard: {
//   backgroundColor: 'white',
//   borderRadius: scaleSize(12),
//   padding: scaleSize(16),
//   marginBottom: scaleSize(16),
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 2 },
//   shadowOpacity: 0.1,
//   shadowRadius: 4,
//   elevation: 2,
// },
// bookingRow: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   marginBottom: scaleSize(12),
// },
// driverRow: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   marginTop: scaleSize(10),
// },

// });

// export default BookingDetailsScreen;


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Dimensions, SafeAreaView, Image, Modal, ActivityIndicator, TextInput, Alert, Platform, Share } from 'react-native';
import { Ionicons, FontAwesome5, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_URL, BASE_URL, WS_BASE_URL } from '../utils/api';

const { width, height } = Dimensions.get('window');

// Google API key for route directions
const GOOGLE_API_KEY = "AIzaSyDboH1OPn2tZixD8iFGiH9EJPvzsd4CL2Q";

const scaleSize = (size) => {
  const scaleFactor = Math.min(width, height) / 375;
  return Math.round(size * scaleFactor);
};

const BookingDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  
  // State for booking and driver data
  const [bookingData, setBookingData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  
  // WebSocket and rider location tracking
  const [riderLocation, setRiderLocation] = useState(null);
  const [isRiderLocationLive, setIsRiderLocationLive] = useState(false);
  const [riderHeading, setRiderHeading] = useState(0); // Rotation angle for rider icon
  const previousRiderLocationRef = useRef(null); // Store previous location for bearing calculation
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  // Cancel booking states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState("");
  const [showReasonOptions, setShowReasonOptions] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Get booking ID from route params
  const bookingId = route.params?.bookingId;
  
  // Cancel reasons
  const cancelReasons = [
    "Taking longer than expected.",
    "Found better price elsewhere.",
    "Change of plans.",
    "Wrong pickup location.",
    "Wrong drop location.",
    "Others"
  ];

  // Share trip handling function
  const handleShareTrip = async () => {
    try {
      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId || !bookingId) {
        Alert.alert('Error', 'Unable to generate share link. Missing user or booking information.');
        return;
      }
      
      // Call backend API to generate share token
      console.log(`📡 Calling API: ${API_URL}/trip-sharing/generate-share-token/${bookingId}`);
      console.log(`📋 Request body:`, { userId, bookingId });
      
      // Get authentication token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      console.log(`🔑 Auth token available:`, !!token);
      
      const response = await fetch(`${API_URL}/trip-sharing/generate-share-token/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
        timeout: 10000 // 10 second timeout
      });

      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error (${response.status}):`, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ API Response:`, result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate share link');
      }

      // Create share message with booking details
      const driverName = driverData?.driverName || driverData?.name || 'Driver';
      const vehicleNumber = driverData?.vehicleregisterNumber || 'Vehicle';
      const orderId = bookingData?._id?.slice(-6) || '123456';
      const pickupAddress = bookingData?.fromAddress?.address || 'Pickup Location';
      const dropAddress = bookingData?.dropLocation?.[0]?.address || 'Drop Location';
      
      const shareMessage = `🚚 Track my delivery in real-time!\n\nOrder #${orderId}\nDriver: ${driverName} (${vehicleNumber})\nFrom: ${pickupAddress}\nTo: ${dropAddress}\n\n📍 Live Tracking: ${result.shareUrl}\n\nPowered by Ridodrop`;

      // Share the link
      const shareResult = await Share.share({
        message: shareMessage,
        url: result.shareUrl,
        title: 'Track My Trip - Ridodrop'
      });

      if (shareResult.action === Share.sharedAction) {
        console.log('Trip shared successfully');
      }
      
    } catch (error) {
      console.error('❌ Share trip error:', error);
      
      let errorMessage = 'Failed to share trip. Please try again.';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 3000 and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Share Trip Failed', errorMessage);
    }
  };

  // Handle invoice download
  const handleInvoiceDownload = async () => {
    try {
      if (!bookingId) {
        Alert.alert('Error', 'Booking ID not available');
        return;
      }

      console.log('📄 Downloading invoice for booking:', bookingId);
      
      // Show loading indicator
      Alert.alert('Downloading', 'Please wait while we download your invoice...');
      
      // Construct invoice download URL
      console.log('📡 Fetching invoice from:', `${API_URL}/invoice/${bookingId}`);
      
      const response = await fetch(`${API_URL}/invoice/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const invoiceData = await response.json();
      console.log('📄 Invoice data received:', {
        success: invoiceData.success,
        hasInvoiceUrl: !!invoiceData.invoiceUrl,
        hasPdfUrl: !!invoiceData.invoicePdfUrl,
        invoiceNumber: invoiceData.invoiceNumber,
        message: invoiceData.message
      });
      
      if (!invoiceData.success) {
        throw new Error(invoiceData.message || 'Invoice not available');
      }
      
      const pdfUrl = invoiceData.invoicePdfUrl || invoiceData.invoiceUrl;
      
      if (!pdfUrl) {
        throw new Error('Invoice PDF URL not available in response');
      }
      
      console.log('📥 Downloading PDF from:', pdfUrl);
      
      // Download the PDF from Cloudinary
      const pdfUri = `${FileSystem.documentDirectory}invoice_${bookingId}.pdf`;
      const downloadResult = await FileSystem.downloadAsync(pdfUrl, pdfUri);
      
      console.log('✅ Invoice PDF downloaded to:', downloadResult.uri);
      console.log('📊 Download status:', downloadResult.status);
      
      if (downloadResult.status !== 200) {
        throw new Error('Failed to download PDF file');
      }
      
      // Share the downloaded PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Invoice',
          UTI: 'com.adobe.pdf'
        });
        console.log('✅ Invoice shared successfully');
      } else {
        Alert.alert('Success', 'Invoice PDF saved to device!');
      }
      
    } catch (error) {
      console.error('❌ Invoice download error:', error);
      console.error('❌ Error stack:', error.stack);
      
      let errorMessage = 'Failed to download invoice. Please try again.';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('Invoice not available')) {
        errorMessage = 'Invoice not yet generated. It will be available after the order is accepted by a rider.';
      } else if (error.message.includes('Server error')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Download Failed', errorMessage);
    }
  };

  // Cancel handling functions
  const handleCancelRequest = () => {
    // 🚫 BLOCK CANCELLATION AFTER PICKUP
    if (bookingData?.currentStep && parseInt(bookingData.currentStep) >= 1) {
      Alert.alert(
        "Cannot Cancel Order",
        "This order cannot be cancelled as the goods have already been picked up. Please contact support if you need assistance.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
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
      
      if (!userId || !bookingId) {
        Alert.alert("Error", "Unable to cancel booking. Missing user or booking information.");
        setIsCancelling(false);
        return;
      }
      
      console.log("Cancelling booking:", { bookingId, userId, reason: finalReason });
      
      // Call backend API to cancel booking
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
        navigation.navigate("Home");
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
  
  // Calculate bearing (heading) between two coordinates
  const calculateBearing = (start, end) => {
    const startLat = start.latitude * Math.PI / 180;
    const startLng = start.longitude * Math.PI / 180;
    const endLat = end.latitude * Math.PI / 180;
    const endLng = end.longitude * Math.PI / 180;
    
    const dLng = endLng - startLng;
    
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    // Normalize to 0-360
    bearing = (bearing + 360) % 360;
    
    return bearing;
  };
  
  // API call to fetch booking with rider details
  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching booking details for ID:', bookingId);
      
      const response = await axios.get(
        `${API_URL}/booking-with-rider/${bookingId}`,
        { timeout: 10000 }
      );
      
      console.log('Booking details response:', response.data);
      console.log('💰 WALLET DATA CHECK:', {
        walletUsed: response.data.booking?.walletUsed,
        walletAmountUsed: response.data.booking?.walletAmountUsed,
        remainingAmountToPay: response.data.booking?.remainingAmountToPay,
        walletDeduction: response.data.booking?.pricing?.walletDeduction,
        finalAmount: response.data.booking?.pricing?.finalAmount,
        paymentMethod: response.data.booking?.paymentMethod,
        price: response.data.booking?.price
      });
      setBookingData(response.data.booking);
      setDriverData(response.data.riderDetails);
      
      // Set initial rider location from database if available
      if (response.data.riderDetails?.currentLocation?.coordinates) {
        const coords = response.data.riderDetails.currentLocation.coordinates;
        const newLocation = {
          latitude: coords[1],
          longitude: coords[0],
          timestamp: Date.now()
        };
        setRiderLocation(newLocation);
        previousRiderLocationRef.current = newLocation;
        console.log('📍 Initial rider location from DB:', coords);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(`Failed to fetch booking details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // WebSocket connection for live location tracking
  const connectToWebSocket = (riderId) => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Connect to WebSocket for real-time updates
      const WS_URL = `${WS_BASE_URL}?riderId=${riderId}&role=customer`;
      
      console.log('🔌 Connecting to WebSocket:', WS_URL);
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected for rider tracking');
        setIsRiderLocationLive(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message.type);
          
          switch (message.type) {
            case 'connection_established':
              console.log('🟢 Connection established:', message.message);
              break;
              
            case 'rider_location_update':
              console.log('📍 Rider location update:', message.location);
              const newLocation = {
                latitude: message.location.latitude,
                longitude: message.location.longitude,
                timestamp: Date.now()
              };
              
              // Calculate heading if we have a previous location
              if (previousRiderLocationRef.current) {
                const bearing = calculateBearing(previousRiderLocationRef.current, newLocation);
                setRiderHeading(bearing);
                console.log('🧭 Rider heading:', bearing.toFixed(2), '°');
              }
              
              setRiderLocation(newLocation);
              previousRiderLocationRef.current = newLocation;
              setIsRiderLocationLive(true);
              break;
              
            case 'rider_arrived_at_pickup':
              console.log('🎯 Rider arrived at pickup');
              // Status update shown in UI, no alert needed
              break;
              
            case 'trip_started':
              console.log('🚀 Trip started');
              // Status update shown in UI, no alert needed
              break;
              
            case 'rider_arrived_at_drop':
              console.log('🎯 Rider arrived at drop');
              // Status update shown in UI, no alert needed
              break;
              
            case 'delivery_completed':
              console.log('✅ Delivery completed');
              // Status update shown in UI, no alert needed
              break;
              
            case 'pong':
              // Heartbeat response
              break;
              
            default:
              console.log('📨 Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsRiderLocationLive(false);
      };
      
      ws.onclose = (event) => {
        console.log('🔴 WebSocket disconnected:', event.code, event.reason);
        setIsRiderLocationLive(false);
        
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect WebSocket...');
          connectToWebSocket(riderId);
        }, 5000);
      };
      
      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
      
      // Store interval for cleanup
      ws.pingInterval = pingInterval;
      
    } catch (error) {
      console.error('❌ Error connecting to WebSocket:', error);
      setIsRiderLocationLive(false);
    }
  };
  
  // Cleanup WebSocket on unmount
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      if (wsRef.current.pingInterval) {
        clearInterval(wsRef.current.pingInterval);
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsRiderLocationLive(false);
  };
  
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
    const locs = getLocationsFromBooking();
    if (!locs || locs.length === 0) return;
    console.log("🗺️ Starting route update for BookingDetailsScreen...");
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
        const destination = `${coordinates[coordinates.length - 1].latitude},${
          coordinates[coordinates.length - 1].longitude
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

        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypoints}&key=${GOOGLE_API_KEY}&avoid=tolls`;

        console.log("🌐 Fetching route from Google Directions API...");
        const response = await axios.get(directionsUrl);

        if (response.data.status === "OK" && response.data.routes.length > 0) {
          const route = response.data.routes[0];
          const points = route.overview_polyline?.points
            ? decodePolyline(route.overview_polyline.points)
            : [];
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
          setRouteCoordinates(coordinates);
        }
      } catch (error) {
        console.error("❌ Error fetching directions:", error);
        setRouteCoordinates(coordinates);
      }
    } else {
      console.log("📍 Not enough coordinates for route (need at least 2)");
      setRouteCoordinates(coordinates);
    }
  };

  // Calculate initial region to fit all markers in view with improved coordinate handling
  const getInitialRegion = () => {
    const locs = getLocationsFromBooking();
    
    if (!locs || locs.length === 0) {
      console.log("📍 Using default region - no locations from getLocationsFromBooking");
      return {
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    console.log(`📊 Calculating region for ${locs.length} locations`);
    
    // Extract all valid coordinates (including from coordinates object)
    const coordinates = [];
    
    locs.forEach((loc, idx) => {
      let lat = parseFloat(loc.latitude || loc.lat || (loc.coordinates?.latitude) || (loc.coordinates?.lat) || 0);
      let lng = parseFloat(loc.longitude || loc.lng || (loc.coordinates?.longitude) || (loc.coordinates?.lng) || 0);
      
      if (lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)) {
        coordinates.push({ latitude: lat, longitude: lng });
        console.log(`✅ Valid coord ${idx}: (${lat}, ${lng})`);
      } else {
        console.log(`❌ Invalid coord ${idx}: (${lat}, ${lng})`);
      }
    });
    
    // Handle case with pickup and drop for interpolation
    const pickup = locs.find(l => l.isFirst);
    const drop = locs.find(l => l.isLast);
    
    if (coordinates.length < 2 && pickup && drop) {
      console.log("🔄 Attempting to use pickup/drop for region calculation");
      
      let pickupLat = parseFloat(pickup.latitude || pickup.lat || (pickup.coordinates?.latitude) || (pickup.coordinates?.lat) || 0);
      let pickupLng = parseFloat(pickup.longitude || pickup.lng || (pickup.coordinates?.longitude) || (pickup.coordinates?.lng) || 0);
      let dropLat = parseFloat(drop.latitude || drop.lat || (drop.coordinates?.latitude) || (drop.coordinates?.lat) || 0);
      let dropLng = parseFloat(drop.longitude || drop.lng || (drop.coordinates?.longitude) || (drop.coordinates?.lng) || 0);
      
      if (pickupLat !== 0 && pickupLng !== 0 && !isNaN(pickupLat) && !isNaN(pickupLng)) {
        coordinates.push({ latitude: pickupLat, longitude: pickupLng });
      }
      if (dropLat !== 0 && dropLng !== 0 && !isNaN(dropLat) && !isNaN(dropLng)) {
        coordinates.push({ latitude: dropLat, longitude: dropLng });
      }
    }
    
    if (coordinates.length === 0) {
      console.log("❌ No valid coordinates found - using default region");
      return {
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    if (coordinates.length === 1) {
      console.log("📍 Single coordinate - using tight zoom");
      return {
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }

    // Calculate bounds for multiple coordinates
    let minLat = Math.min(...coordinates.map(c => c.latitude));
    let maxLat = Math.max(...coordinates.map(c => c.latitude));
    let minLng = Math.min(...coordinates.map(c => c.longitude));
    let maxLng = Math.max(...coordinates.map(c => c.longitude));
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate deltas with proper padding to show all markers
    const latSpread = maxLat - minLat;
    const lngSpread = maxLng - minLng;
    
    // Add 50% padding around the markers to ensure they fit nicely
    const latDelta = Math.max(latSpread * 1.5, 0.005); // Minimum zoom
    const lngDelta = Math.max(lngSpread * 1.5, 0.005); // Minimum zoom

    const region = {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
    
    console.log(`📍 Calculated region:`, region);
    console.log(`   - Center: (${centerLat.toFixed(6)}, ${centerLng.toFixed(6)})`);
    console.log(`   - Delta: (${region.latitudeDelta.toFixed(6)}, ${region.longitudeDelta.toFixed(6)})`);
    
    return region;
  };

  // Render markers for all locations with improved coordinate handling
  const renderMarkers = () => {
    const locs = getLocationsFromBooking();
    
    if (!locs || locs.length === 0) {
      console.log("❌ No locations found from getLocationsFromBooking");
      return null;
    }
    
    console.log("🗺️ Rendering markers for locations:", locs.length);
    console.log("📍 Full location data:", JSON.stringify(locs, null, 2));
    
    if (locs.length === 0) {
      console.log("❌ No locations to render markers for");
      return null;
    }
    
    // Pre-process coordinates to ensure we have valid data
    const processedLocations = locs.map((loc, idx) => {
      let latitude = parseFloat(loc.latitude || loc.lat || (loc.coordinates?.latitude) || (loc.coordinates?.lat) || 0);
      let longitude = parseFloat(loc.longitude || loc.lng || (loc.coordinates?.longitude) || (loc.coordinates?.lng) || 0);
      
      return {
        ...loc,
        originalIndex: idx,
        processedLat: latitude,
        processedLng: longitude,
        hasValidCoords: latitude !== 0 && longitude !== 0 && !isNaN(latitude) && !isNaN(longitude)
      };
    });
    
    console.log("📊 Processed locations with coordinates:");
    processedLocations.forEach((loc, idx) => {
      console.log(`   ${idx}: ${loc.isFirst ? 'PICKUP' : loc.isLast ? 'DROP' : 'STOP'} - Lat: ${loc.processedLat}, Lng: ${loc.processedLng}, Valid: ${loc.hasValidCoords}`);
    });
    
    // Handle interpolation for stops without coordinates
    const pickup = processedLocations.find(l => l.isFirst && l.hasValidCoords);
    const drop = processedLocations.find(l => l.isLast && l.hasValidCoords);
    
    if (pickup && drop) {
      console.log(`🎯 Found valid pickup (${pickup.processedLat}, ${pickup.processedLng}) and drop (${drop.processedLat}, ${drop.processedLng})`);
      
      processedLocations.forEach((loc, idx) => {
        if (!loc.hasValidCoords && !loc.isFirst && !loc.isLast) {
          // Interpolate coordinates for intermediate stops
          const intermediateStops = processedLocations.filter(l => !l.isFirst && !l.isLast);
          const stopIndex = intermediateStops.findIndex(s => s.id === loc.id || s.originalIndex === loc.originalIndex);
          const totalStops = intermediateStops.length;
          
          if (totalStops > 0) {
            const ratio = totalStops === 1 ? 0.5 : (stopIndex + 1) / (totalStops + 1);
            
            loc.processedLat = pickup.processedLat + (drop.processedLat - pickup.processedLat) * ratio;
            loc.processedLng = pickup.processedLng + (drop.processedLng - pickup.processedLng) * ratio;
            
            // Add small offset to prevent marker overlap
            const offset = 0.0008;
            loc.processedLat += (stopIndex % 2 === 0 ? offset : -offset);
            loc.processedLng += (stopIndex % 2 === 0 ? offset : -offset);
            
            loc.hasValidCoords = true;
            console.log(`✅ Interpolated stop ${stopIndex + 1}: (${loc.processedLat}, ${loc.processedLng})`);
          }
        }
      });
    }
    
    // Create markers for all valid locations
    // Calculate drop number for each non-pickup location
    let dropCounter = 0;
    const markers = processedLocations
      .filter(loc => loc.hasValidCoords)
      .map((loc, renderIdx) => {
        const isPickup = loc.isFirst;
        const isDropoff = loc.isLast;
        
        // Increment drop counter for non-pickup locations
        const dropNumber = isPickup ? 0 : ++dropCounter;
        
        const markerTitle = isPickup ? "Pickup Location" : isDropoff ? "Drop Location" : `Stop ${renderIdx}`;
        
        console.log(`🎯 Creating marker for ${markerTitle}: (${loc.processedLat}, ${loc.processedLng}) - Drop #${dropNumber}`);
        
        return (
          <Marker
            key={`marker-${loc.id || loc.originalIndex}-${renderIdx}`}
            coordinate={{
              latitude: loc.processedLat,
              longitude: loc.processedLng,
            }}
            title={markerTitle}
            description={loc.address || loc.name || "Location"}
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
            ) : (
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
            )}
          </Marker>
        );
      });
    
    console.log(`✅ Successfully created ${markers.length} markers`);
    return markers;
  };

  // Fetch booking details on component mount
  useEffect(() => {
    console.log('BookingDetailsScreen mounted with bookingId:', bookingId);
    console.log('Route params:', route.params);
    
    if (bookingId) {
      fetchBookingDetails();
    } else {
      console.log('No bookingId provided, showing test data');
      setError('No booking ID provided. Using test data.');
      setLoading(false);
    }
    
    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [bookingId]);
  
  // Connect to WebSocket when booking data is available
  useEffect(() => {
    if (bookingData && bookingData.rider) {
      const riderId = bookingData.rider;
      console.log('📡 Setting up WebSocket for rider:', riderId);
      connectToWebSocket(riderId);
    }
    
    return () => {
      // Cleanup handled in main useEffect
    };
  }, [bookingData?.rider]);

  // Trigger route update when locations are available
  useEffect(() => {
    if (bookingData) {
      const locs = getLocationsFromBooking();
      if (locs && locs.length >= 2) {
        setTimeout(() => {
          updateRoutePolyline();
        }, 1000);
      }
    }
  }, [bookingData]);

  // Poll booking status to detect ride completion
  useEffect(() => {
    if (!bookingId) {
      console.log("❌ No booking ID for status polling");
      return;
    }

    console.log("🔄 Starting status polling for booking:", bookingId);

    const checkBookingStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/booking/${bookingId}`, {
          timeout: 8000
        });
        
        const booking = response.data;
        
        if (booking) {
          console.log("📊 Booking status check:");
          console.log("   - Status:", booking.status);
          console.log("   - Booking ID:", booking._id);
          
          // Check if ride is completed
          if (booking.status === "completed") {
            console.log("✅ Ride completed! Navigating to review screen...");
            
            // Clear polling interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            
            // Navigate to review screen with a slight delay
            setTimeout(() => {
              console.log("🚀 Navigating to SubmitReview screen");
              navigation.replace("SubmitReview", {
                bookingId: bookingId,
                bookingData: booking,
              });
            }, 500);
          }
        }
      } catch (error) {
        console.error("❌ Error checking booking status:", error.message);
        // Continue polling even on error
      }
    };

    // Start polling immediately
    checkBookingStatus();
    
    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(checkBookingStatus, 5000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log("🛑 Stopped booking status polling");
      }
    };
  }, [bookingId, navigation]);

  // Dynamic locations based on booking data with proper coordinate extraction
  const getLocationsFromBooking = () => {
    console.log('🔍 getLocationsFromBooking called with bookingData:', bookingData);
    
    if (!bookingData) {
      console.log('❌ No booking data, using fallback');
      // Fallback to static data when no booking data
      return [
        {
          id: 0,
          name: 'Lokesh godewar • 9552567681',
          address: 'Police Quarters, RK Hegde Nagar, Bengaluru',
          isFirst: true,
          latitude: 12.9716,
          longitude: 77.5946,
        },
        {
          id: 1,
          name: 'Lokesh • 9552567681',
          address: '8th cross Majestic, Bengaluru',
          isLast: true,
          latitude: 12.9611,
          longitude: 77.6006,
        },
      ];
    }

    const locations = [];
    
    // Add pickup location from fromAddress
    if (bookingData.fromAddress) {
      console.log('✅ Adding pickup from fromAddress:', bookingData.fromAddress);
      
      // Try different possible property names for receiver info
      const receiverName = bookingData.fromAddress.receiverName || 
                          bookingData.fromAddress.ReciversName || 
                          bookingData.fromAddress.name ||
                          bookingData.userData?.name ||
                          'Unknown';
      
      const receiverMobile = bookingData.fromAddress.receiverMobile || 
                            bookingData.fromAddress.ReciversMobileNum ||
                            bookingData.fromAddress.phone ||
                            bookingData.userData?.phone ||
                            '';
      
      locations.push({
        id: 0,
        name: 'Pickup Location',
        receiverName: receiverName,
        receiverMobile: receiverMobile,
        address: bookingData.fromAddress.address || 'Pickup Location',
        latitude: bookingData.fromAddress.latitude,
        longitude: bookingData.fromAddress.longitude,
        coordinates: {
          latitude: bookingData.fromAddress.latitude,
          longitude: bookingData.fromAddress.longitude,
        },
        isFirst: true,
      });
    }

    // Skip stops array - all locations are in dropLocation array
    // The stops array contains string addresses that duplicate dropLocation entries
    // We only use dropLocation which has proper coordinates and receiver details

    // Add drop locations
    if (bookingData.dropLocation && bookingData.dropLocation.length > 0) {
      console.log('✅ Adding drop locations:', bookingData.dropLocation.length);
      console.log('📦 Raw dropLocation data:', JSON.stringify(bookingData.dropLocation, null, 2));
      
      bookingData.dropLocation.forEach((drop, index) => {
        const isLast = index === bookingData.dropLocation.length - 1;
        
        console.log(`\n🔍 Processing drop location ${index + 1}:`, {
          index,
          isLast,
          latitude: drop.latitude,
          longitude: drop.longitude,
          address: drop.address || drop.Address || drop.Address1,
          rawDrop: drop
        });
        
        // Try different possible property names for receiver info
        const receiverName = drop.receiverName || 
                            drop.ReciversName || 
                            drop.name ||
                            bookingData.userData?.name ||
                            'Unknown';
        
        const receiverMobile = drop.receiverMobile || 
                              drop.ReciversMobileNum ||
                              drop.phone ||
                              bookingData.userData?.phone ||
                              '';
        
        const locationObject = {
          id: locations.length,
          name: `Drop Location ${index + 1}`,
          receiverName: receiverName,
          receiverMobile: receiverMobile,
          address: drop.address || drop.Address || drop.Address1 || 'Drop Location',
          latitude: drop.latitude,
          longitude: drop.longitude,
          coordinates: {
            latitude: drop.latitude,
            longitude: drop.longitude,
          },
          isLast: isLast,
        };
        
        console.log(`✅ Created location object for drop ${index + 1}:`, locationObject);
        locations.push(locationObject);
      });
    }

    console.log('\n📍 Final processed locations array:');
    console.log(`   Total locations: ${locations.length}`);
    locations.forEach((loc, idx) => {
      console.log(`   [${idx}] ${loc.isFirst ? '🟢 PICKUP' : '🔴 DROP'} - ID: ${loc.id}, Lat: ${loc.latitude}, Lng: ${loc.longitude}, Address: ${loc.address}`);
    });
    
    return locations;
  };

  const locations = getLocationsFromBooking();

  const StopIndicator = ({ index, isFirst, isLast }) => (
    <View style={styles.stopDotWrapper}>
      {isFirst ? (
        <View style={styles.greenDot} />
      ) : (
        <View style={styles.numberedRedDot}>
          <Text style={styles.stopNumber}>{index}</Text>
        </View>
      )}
      {!isLast && <View style={styles.verticalLine} />}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centeredContainer]}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centeredContainer]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchBookingDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mapContainer}>
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
                  strokeColors={["#FFFFFF"]}
                  strokeWidth={8}
                  strokeOpacity={0.8}
                  zIndex={1}
                  lineCap="round"
                  lineJoin="round"
                />
                {/* Main route line */}
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#EC4D4A"
                  strokeColors={["#EC4D4A"]}
                  strokeWidth={4}
                  zIndex={2}
                  lineCap="round"
                  lineJoin="round"
                />
              </>
            )}
                                    {renderMarkers()}
            
            {/* Rider Live Location Marker */}
            {riderLocation && (
              <Marker
                coordinate={{
                  latitude: riderLocation.latitude,
                  longitude: riderLocation.longitude
                }}
                title={driverData?.driverName || driverData?.name || 'Rider'}
                description={`${driverData?.vehicleregisterNumber || 'Vehicle'} - Live Location`}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={1000}
              >
                <View style={styles.riderMarkerContainer}>
                  {/* Rider icon */}
                  <Image
                    source={require("../assets/rider.png")}
                    style={[
                      styles.riderMarkerIcon,
                      { transform: [{ rotate: `${riderHeading}deg` }] }
                    ]}
                    resizeMode="contain"
                  />
                  {/* Live indicator badge */}
                  {isRiderLocationLive && (
                    <View style={styles.liveIndicatorBadge}>
                      <View style={styles.liveIndicatorDot} />
                    </View>
                  )}
                </View>
              </Marker>
            )}
          </MapView>
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.unifiedCard}>
            <View style={styles.bookingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateText}>
                  {bookingData?.createdAt ? 
                    new Date(bookingData.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric'
                    }) : '12 June 2023'
                  }
                </Text>
                <Text style={styles.timeText}>
                  {bookingData?.riderAcceptTime ? 
                    new Date(bookingData.riderAcceptTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 
                    bookingData?.createdAt ? 
                    new Date(bookingData.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit', 
                      hour12: true
                    }) : '10:30 AM'
                  }
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.orderIdText}>
                  Order ID: #{bookingData?._id?.slice(-6) || '123456'}
                </Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShareTrip}>
                  <Text style={styles.shareText}>Share Trip</Text>
                  <Ionicons name="share-social" size={scaleSize(16)} color="#EC4D4A" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.driverRow}>
              <Image 
                source={{ 
                  uri: driverData?.images?.profilePhoto 
                    ? `${BASE_URL}/${driverData.images.profilePhoto}`
                    : 'https://randomuser.me/api/portraits/men/1.jpg' 
                }}
                style={styles.driverPhoto}
              />
              <View style={{ flex: 1, marginLeft: scaleSize(16), }}>
                <Text style={styles.driverName}>
                  {driverData?.driverName || driverData?.name || 'Nihaz Wg Varjralli'}
                </Text>
                <Text style={styles.driverVehicle}>
                  {driverData?.vehicleregisterNumber || 'KA-50-AB-1234'}
                </Text>
                <Text style={styles.driverVehicle}>
                  {driverData?.vehicleType || '2 Wheeler'}
                </Text>
                <TouchableOpacity 
                  style={styles.callDriverButton}
                  onPress={() => Linking.openURL(`tel:${driverData?.driverPhone || driverData?.phone || '+911234567890'}`)}
                >
                  <FontAwesome name="phone" size={scaleSize(16)} color="white" />
                  <Text style={styles.callButtonText}>Call Driver</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('DeliveryPhotos', { 
                bookingData: bookingData,
                bookingId: bookingId 
              })}>
    <Image
      source={require('../assets/box-icon.png')} // ← Replace with actual local path
      style={styles.iconButton}
    />
  </TouchableOpacity>
            </View>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.routeInfo}>
              {/* BookingSearchingScreen-style visual route indicators */}
              <View style={styles.routeVisualContainer}>
                {(() => {
                  const allLocations = locations;
                  const pickupLocation = allLocations.find(loc => loc.isFirst);
                  const dropLocations = allLocations.filter(loc => !loc.isFirst); // All non-pickup locations
                  const lastDropLocation = dropLocations[dropLocations.length - 1]; // Get the actual last drop
                  
                  console.log('\n🎨 UI RENDERING LOCATIONS:');
                  console.log(`   Total locations available: ${allLocations.length}`);
                  console.log(`   Pickup location:`, pickupLocation);
                  console.log(`   Drop locations count: ${dropLocations.length}`);
                  console.log(`   Drop locations:`, dropLocations.map(d => ({ id: d.id, address: d.address })));
                  console.log(`   Last drop location:`, lastDropLocation);
                  console.log(`   isLocationExpanded: ${isLocationExpanded}`);
                  
                  // Determine which locations to show
                  let locationsToShow;
                  if (isLocationExpanded) {
                    locationsToShow = allLocations;
                    console.log(`   ✅ EXPANDED: Showing all ${locationsToShow.length} locations`);
                  } else {
                    // When collapsed, show pickup and last drop only
                    locationsToShow = [pickupLocation, lastDropLocation].filter(Boolean);
                    console.log(`   ⚠️ COLLAPSED: Showing only pickup and last drop (${locationsToShow.length} locations)`);
                  }
                  
                  console.log(`   Locations to display:`, locationsToShow.map(l => ({ 
                    id: l.id, 
                    isFirst: l.isFirst, 
                    isLast: l.isLast,
                    address: l.address 
                  })));
                  
                  return locationsToShow.map((location, index) => {
                    const isFirst = location.isFirst;
                    const isLast = location.isLast;
                    const originalIndex = allLocations.findIndex(loc => loc.id === location.id);
                    const isLastInDisplayedArray = index === locationsToShow.length - 1;
                    
                    // Calculate drop number based on position in ALL locations (not just displayed ones)
                    // Count how many non-pickup locations come before this one in the full list
                    const dropNumber = isFirst ? 0 : allLocations.filter((loc, idx) => !loc.isFirst && idx <= originalIndex).length;
                    
                    console.log(`\n   📍 Rendering location ${index}:`, {
                      locationId: location.id,
                      originalIndex,
                      isFirst,
                      isLast,
                      dropNumber,
                      address: location.address,
                      receiverName: location.receiverName,
                      receiverMobile: location.receiverMobile
                    });
                    
                    return (
                      <View key={location.id || originalIndex} style={styles.routeItemContainer}>
                        <View style={styles.routeIndicatorContainer}>
                          {/* Stop indicator dot (BookingSearchingScreen style) */}
                          <View style={styles.stopDotWrapper}>
                            <View style={[
                              styles.stopDot, 
                              isFirst ? styles.greenDotNew : styles.redDotNew
                            ]}>
                              {!isFirst && <Text style={styles.stopNumberNew}>{dropNumber}</Text>}
                              {isFirst && <Ionicons name="location" size={12} color="#fff" />}
                            </View>
                            {!isLastInDisplayedArray && <View style={styles.verticalLineNew} />}
                          </View>
                          
                          {/* Location text */}
                          <View style={styles.locationTextContainer}>
                            <Text style={styles.locationLabel}>
                              {isFirst ? "Pickup" : `Drop Point ${dropNumber}`}
                            </Text>
                            <Text 
                              style={styles.locationAddressNew} 
                              numberOfLines={2}
                            >
                              {location.address || `Location ${originalIndex + 1}`}
                            </Text>
                            {/* Show receiver info if available */}
                            {(location.receiverName && location.receiverMobile) && (
                              <Text style={styles.receiverInfo}>
                                {location.receiverName} • {location.receiverMobile}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  });
                })()}
                
                {/* Show intermediate stops info and expand/collapse button */}
                {locations.filter(loc => !loc.isFirst).length > 1 && (
                  <View style={styles.expandCollapseContainer}>
                    {!isLocationExpanded && (
                      <View style={styles.hiddenStopsInfo}>
                        <Text style={styles.hiddenStopsText}>
                          +{locations.filter(loc => !loc.isFirst).length - 1} more stop{locations.filter(loc => !loc.isFirst).length - 1 > 1 ? 's' : ''}
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
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Payment Details</Text>
              <Text style={styles.paymentAmount}>
                ₹{(() => {
                  const price = Number(bookingData?.price || 0);
                  const quickFee = Number(bookingData?.quickFee || 0);
                  const gst = Number(bookingData?.feeBreakdown?.gstAmount || 0);
                  const total = price + quickFee + gst;
                  return total.toFixed(0);
                })()}
              </Text>
            </View>
            
            {/* Wallet Split Payment Breakdown - Only show if wallet was actually used */}
            {(() => {
              const walletUsed = Number(bookingData?.walletAmountUsed || 0);
              const remainingAmount = Number(bookingData?.remainingAmountToPay || 0);
              
              // Only show split breakdown if wallet was actually used
              const showSplit = walletUsed > 0 && remainingAmount > 0;
              
              if (!showSplit) return null;
              
              const totalAmount = walletUsed + remainingAmount;
              
              return (
                <View style={styles.walletSplitSection}>
                  <Text style={styles.splitPaymentTitle}>💳 Payment Breakdown</Text>
                  
                  {/* Wallet Amount */}
                  <View style={styles.splitRow}>
                    <View style={styles.splitLeft}>
                      <Ionicons name="wallet" size={16} color="#27ae60" />
                      <Text style={styles.splitLabelWallet}>Paid via Wallet</Text>
                    </View>
                    <Text style={styles.splitAmountWallet}>
                      ₹{walletUsed.toFixed(0)}
                    </Text>
                  </View>
                  
                  {/* Remaining Amount */}
                  <View style={styles.splitRow}>
                    <View style={styles.splitLeft}>
                      <Ionicons 
                        name={bookingData?.paymentMethod === 'cash' ? 'cash' : 'card'} 
                        size={16} 
                        color={bookingData?.status === 'completed' ? '#27ae60' : '#FF9800'}
                      />
                      <Text style={bookingData?.status === 'completed' ? styles.splitLabelWallet : styles.splitLabelCash}>
                        {bookingData?.paymentMethod === 'online' 
                          ? 'Paid Online' 
                          : bookingData?.status === 'completed'
                          ? (bookingData?.payFrom === 'Pay at Pickup' || bookingData?.cashPaymentOption === 'pickup'
                            ? 'Paid at Pickup'
                            : bookingData?.payFrom === 'Pay on Delivery' || bookingData?.cashPaymentOption === 'delivery'
                            ? 'Paid at Delivery'
                            : 'Cash Payment Collected')
                          : bookingData?.payFrom === 'Pay at Pickup'
                          ? 'To Pay at Pickup'
                          : bookingData?.payFrom === 'Pay on Delivery' || bookingData?.cashPaymentOption === 'delivery'
                          ? 'To Pay at Delivery'
                          : 'To Pay via Cash'}
                      </Text>
                    </View>
                    <Text style={bookingData?.status === 'completed' ? styles.splitAmountWallet : styles.splitAmountCash}>
                      ₹{remainingAmount.toFixed(0)}
                    </Text>
                  </View>
                  
                  {/* Total Row */}
                  <View style={[styles.splitRow, styles.splitTotalRow]}>
                    <Text style={styles.splitTotalLabel}>Total Booking Amount</Text>
                    <Text style={styles.splitTotalAmount}>
                      ₹{totalAmount.toFixed(0)}
                    </Text>
                  </View>
                  
                  {/* Payment Status Info */}
                  <View style={{ backgroundColor: '#E8F5E9', padding: 8, borderRadius: 6, marginTop: 8 }}>
                    <Text style={{ fontSize: 11, color: '#2E7D32', textAlign: 'center' }}>
                      ✓ ₹{walletUsed.toFixed(0)} deducted from wallet • ₹{remainingAmount.toFixed(0)} {bookingData?.status === 'completed' ? 'collected' : 'to collect'}
                    </Text>
                  </View>
                </View>
              );
            })()}
            
            {/* Fee Breakdown Section */}
            <View style={styles.feeBreakdownContainer}>
              <View style={styles.feeBreakdownRow}>
                <Text style={styles.feeLabel}>Base Fare</Text>
                <Text style={styles.feeAmount}>
                  ₹{Number(bookingData?.price || 0).toFixed(0)}
                </Text>
              </View>
              
              {/* Show Quick Fee if present */}
              {(bookingData?.quickFee > 0) && (
                <View style={styles.feeBreakdownRow}>
                  <Text style={styles.feeLabel}>Quick Fee</Text>
                  <Text style={styles.feeAmount}>
                    +₹{Number(bookingData.quickFee).toFixed(0)}
                  </Text>
                </View>
              )}
              
              {/* Show GST if breakdown available */}
              {bookingData?.feeBreakdown?.gstAmount > 0 && (
                <View style={styles.feeBreakdownRow}>
                  <Text style={styles.feeLabel}>
                    GST ({bookingData.feeBreakdown.gstPercentage || 0}%)
                  </Text>
                  <Text style={styles.feeAmount}>
                    +₹{Number(bookingData.feeBreakdown.gstAmount || 0).toFixed(0)}
                  </Text>
                </View>
              )}
              
              <View style={styles.dividerLine} />
              
              <View style={styles.feeBreakdownRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                  ₹{(() => {
                    const price = bookingData?.price || 0;
                    const quickFee = bookingData?.quickFee || 0;
                    const gst = bookingData?.feeBreakdown?.gstAmount || 0;
                    const total = Number(price) + Number(quickFee) + Number(gst);
                    return total.toFixed(0);
                  })()}
                </Text>
              </View>
            </View>
            
            {/* Payment Method */}
            <View style={styles.paymentMethodContainer}>
              <Text style={styles.paymentMethod}>
                {bookingData?.payFrom === 'online' || bookingData?.paymentMethod === 'online'
                  ? '💳 Online Payment' 
                  : bookingData?.payFrom === 'Wallet' || bookingData?.paymentMethod === 'wallet'
                  ? '💳 Wallet Payment'
                  : '💵 Cash Payment'}
              </Text>
            </View>
            
            {/* Payment Status Note */}
            <View style={styles.paymentNote}>
              <Text style={styles.paymentNoteText}>
                {(() => {
                  if (bookingData?.payFrom === 'online' || bookingData?.paymentMethod === 'online') {
                    return 'Payment completed online';
                  } else if (bookingData?.payFrom === 'Wallet' || bookingData?.paymentMethod === 'wallet') {
                    return 'Payment completed from wallet';
                  } else if (bookingData?.status === 'completed') {
                    // For completed orders, show past tense
                    if (bookingData?.payFrom === 'Pay at Pickup' || bookingData?.cashPaymentOption === 'pickup') {
                      return 'Cash payment collected at pickup';
                    } else if (bookingData?.payFrom === 'Pay on Delivery' || bookingData?.cashPaymentOption === 'delivery') {
                      return 'Cash payment collected at delivery';
                    } else {
                      return 'Cash payment collected';
                    }
                  } else {
                    // For pending orders, show future tense
                    if (bookingData?.payFrom === 'Pay at Pickup') {
                      return 'Payment at pickup point';
                    } else if (bookingData?.payFrom === 'Pay on Delivery') {
                      return 'Payment at delivery point';
                    } else {
                      return 'Cash payment required';
                    }
                  }
                })()}
              </Text>
            </View>
          </View>

          <View style={styles.invoiceCard}>
            <Text style={styles.invoiceTitle}>Download Invoice</Text>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handleInvoiceDownload}
            >
              <MaterialIcons name="file-download" size={scaleSize(20)} color="#EC4D4A" />
            </TouchableOpacity>
          </View>

          <View style={styles.supportCard}>
            <Text style={styles.supportText}>Need help with your trip?</Text>
            <View style={styles.supportButtonsRow}>
              <TouchableOpacity 
                style={styles.reportIssueButton}
                onPress={() => navigation.navigate('RaiseTicket', { 
                  bookingData: bookingData,
                  bookingId: bookingId 
                })}
              >
                <Ionicons name="alert-circle-outline" size={18} color="#EC4D4A" />
                <Text style={styles.reportIssueText}>Report Issue</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.callSupportButton}
                onPress={() => Linking.openURL('tel:1234567890')}
              >
                <Ionicons name="call-outline" size={18} color="#0066FF" />
                <Text style={styles.callSupportText}>Call Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.cancelRequestButton}
            onPress={handleCancelRequest}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={20} color="#EC4D4A" />
            <Text style={styles.cancelRequestText}>Cancel Request</Text>
          </TouchableOpacity>
        </ScrollView>



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
                  <View style={styles.modalHeaderCancel}>
                    <Text style={styles.modalTitleCancel}>You will miss :</Text>
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
                    <ActivityIndicator color="#fff" size="small" style={styles.cancelIconModal} />
                    <Text style={styles.confirmCancelText}>CANCELLING...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="close-circle" size={20} color="#fff" style={styles.cancelIconModal} />
                    <Text style={styles.confirmCancelText}>CANCEL</Text>
                  </>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default BookingDetailsScreen;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  mapContainer: {
    height: height * 0.3,
    width: '100%'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(16),
    paddingBottom: height * 0.1
  },
  unifiedCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleSize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(12)
  },
  dateText: {
    fontSize: scaleSize(14),
    color: '#666',
    marginBottom: scaleSize(4)
  },
  timeText: {
    fontSize: scaleSize(16),
    fontWeight: 'bold',
    color: '#333'
  },
  orderIdText: {
    fontSize: scaleSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scaleSize(8)
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  shareText: {
    color: '#EC4D4A',
    fontSize: scaleSize(14),
    fontWeight: 'bold',
    marginRight: scaleSize(4)
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleSize(10)
  },
  driverPhoto: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: scaleSize(25),
    marginBottom: scaleSize(35)
  },
  driverName: {
    fontSize: scaleSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scaleSize(4)
  },
  driverVehicle: {
    fontSize: scaleSize(14),
    color: '#666'
  },
  callDriverButton: {
   

      backgroundColor: '#EC4D4A',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: scaleSize(10),   // reduce horizontal padding
  paddingVertical: scaleSize(6),
  borderRadius: scaleSize(14),
  marginTop: scaleSize(12),
  alignSelf: 'flex-start',            // ensures it doesn’t stretch
  minWidth: scaleSize(120),
  },
  callButtonText: {
    color: 'white',
    fontSize: scaleSize(14),
    fontWeight: 'bold',
    marginLeft: scaleSize(4)
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleSize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,

    
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scaleSize(12)
  },
  stopDotWrapper: {
    alignItems: 'center',
    width: scaleSize(32),
    marginRight: scaleSize(8)
  },
  greenDot: {
    width: scaleSize(12),
    height: scaleSize(12),
    borderRadius: scaleSize(6),
    backgroundColor: '#4CAF50',
    marginVertical: scaleSize(6)
  },
  numberedRedDot: {
    width: scaleSize(18),
    height: scaleSize(18),
    borderRadius: scaleSize(9),
    backgroundColor: '#EC4D4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleSize(4)
  },
  stopNumber: {
    color: '#fff',
    fontSize: scaleSize(12),
    fontWeight: 'bold'
  },
  verticalLine: {
    width: scaleSize(2),
    height: scaleSize(28),
    backgroundColor: '#e0e0e0',
    marginVertical: scaleSize(2)
  },
  locationText: {
    flex: 1,
    paddingTop: scaleSize(2)
  },
  name: {
    fontWeight: '600',
    fontSize: scaleSize(14),
    color: '#333',
    marginBottom: scaleSize(2)
  },
  address: {
    fontSize: scaleSize(13),
    color: '#666',
    lineHeight: scaleSize(18)
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scaleSize(16)
  },
  locationActionButton: {
    paddingVertical: scaleSize(8)
  },
  actionText: {
    color: '#EC4D4A',
    fontSize: scaleSize(14),
    fontWeight: 'bold'
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleSize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  walletSplitSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: scaleSize(10),
    padding: scaleSize(14),
    marginBottom: scaleSize(16),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  splitPaymentTitle: {
    fontSize: scaleSize(14),
    fontWeight: '700',
    color: '#333',
    marginBottom: scaleSize(12),
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(10),
  },
  splitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitLabelWallet: {
    fontSize: scaleSize(13),
    color: '#27ae60',
    marginLeft: scaleSize(6),
    fontWeight: '500',
  },
  splitLabelCash: {
    fontSize: scaleSize(13),
    color: '#FF9800',
    marginLeft: scaleSize(6),
    fontWeight: '500',
  },
  splitAmountWallet: {
    fontSize: scaleSize(15),
    fontWeight: '700',
    color: '#27ae60',
  },
  splitAmountCash: {
    fontSize: scaleSize(15),
    fontWeight: '700',
    color: '#FF9800',
  },
  splitTotalRow: {
    marginTop: scaleSize(12),
    paddingTop: scaleSize(12),
    borderTopWidth: 2,
    borderTopColor: '#333',
    marginBottom: 0,
  },
  splitTotalLabel: {
    fontSize: scaleSize(14),
    fontWeight: '700',
    color: '#333',
  },
  splitTotalAmount: {
    fontSize: scaleSize(17),
    fontWeight: '800',
    color: '#333',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleSize(12)
  },
  paymentTitle: {
    fontSize: scaleSize(16),
    fontWeight: 'bold',
    color: '#333'
  },
  paymentAmount: {
    fontSize: scaleSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginTop: scaleSize(4)
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(12)
  },
  paymentMethod: {
    fontSize: scaleSize(16),
    color: '#333',
    marginLeft: scaleSize(8)
  },
  paymentNote: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: scaleSize(12)
  },
  paymentNoteText: {
    fontSize: scaleSize(14),
    color: '#666'
  },
  feeBreakdownContainer: {
    marginVertical: scaleSize(12),
    paddingVertical: scaleSize(8),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  feeBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(8)
  },
  feeLabel: {
    fontSize: scaleSize(14),
    color: '#666',
    flex: 1
  },
  feeAmount: {
    fontSize: scaleSize(14),
    color: '#333',
    fontWeight: '500'
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: scaleSize(8)
  },
  riderEarningsLabel: {
    fontSize: scaleSize(14),
    color: '#27ae60',
    fontWeight: '600',
    flex: 1
  },
  riderEarningsAmount: {
    fontSize: scaleSize(16),
    color: '#27ae60',
    fontWeight: 'bold'
  },
  totalLabel: {
    fontSize: scaleSize(16),
    color: '#333',
    fontWeight: 'bold',
    flex: 1
  },
  totalAmount: {
    fontSize: scaleSize(18),
    color: '#EC4D4A',
    fontWeight: 'bold'
  },
  deliveryPhotosCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleSize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryPhotosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(8),
  },
  deliveryPhotosTitle: {
    fontSize: scaleSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: scaleSize(8),
  },
  deliveryPhotosSubtitle: {
    fontSize: scaleSize(14),
    color: '#666',
    marginBottom: scaleSize(12),
    lineHeight: scaleSize(20),
  },
  viewPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EC4D4A',
    borderRadius: scaleSize(8),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(16),
  },
  viewPhotosButtonText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#EC4D4A',
    marginHorizontal: scaleSize(8),
  },
  invoiceCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleSize(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    
  },
  invoiceTitle: {
    fontSize: scaleSize(16),
    fontWeight: 'bold',
    color: '#333',
    textAlign:'center'
  },
  downloadButton: {
    padding: scaleSize(8)
  },
  supportCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleSize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  supportText: {
    fontSize: scaleSize(14),
    color: '#666',
    marginBottom: scaleSize(12),
    textAlign: 'center'
  },
  supportButtonsRow: {
    flexDirection: 'row',
    gap: scaleSize(12),
  },
  reportIssueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: '#EC4D4A',
    gap: scaleSize(6),
  },
  reportIssueText: {
    color: '#EC4D4A',
    fontSize: scaleSize(14),
    fontWeight: '600'
  },
  callSupportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: '#0066FF',
    gap: scaleSize(6),
  },
  callSupportText: {
    color: '#0066FF',
    fontSize: scaleSize(14),
    fontWeight: '600'
  },
  supportButton: {
    alignSelf: 'flex-start'
  },
  supportButtonText: {
    color: '#EC4D4A',
    fontSize: scaleSize(14),
    fontWeight: 'bold'
  },
  // Cancel Request Button (Same as BookingSearchingScreen)
  cancelRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#EC4D4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: scaleSize(30),
  },
  cancelRequestText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EC4D4A',
    marginLeft: 8,
  },
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '85%',
  },
  modalHeaderCancel: {
    marginBottom: 16,
  },
  modalTitleCancel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitItem: {
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  selectReasonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'left',
    letterSpacing: -0.3,
  },
  reasonInputContainer: {
    marginBottom: 16,
  },
  reasonInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    minHeight: 56,
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
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
    fontWeight: '400',
  },
  reasonOptionsContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reasonOption: {
    padding: 18,
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
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#EC4D4A',
    borderWidth: 2,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EC4D4A',
  },
  reasonOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedReasonOptionText: {
    color: '#EC4D4A',
    fontWeight: '600',
  },
  customInputContainer: {
    marginBottom: 16,
  },
  customReasonInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    borderWidth: 1.5,
    borderColor: '#EC4D4A',
    minHeight: 120,
    maxHeight: 180,
    shadowColor: '#EC4D4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmCancelButton: {
    width: '100%',
    backgroundColor: '#EC4D4A',
    borderRadius: 8,
    paddingVertical: 16,
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
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cancelIconModal: {
    marginRight: 6,
  },

  iconButton: {
    width: scaleSize(60),
    height: scaleSize(60),
    marginRight: scaleSize(10),
    borderRadius: scaleSize(6),
  },
  // Loading and error state styles
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scaleSize(16),
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: scaleSize(16),
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: scaleSize(20),
  },
  retryButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(8),
  },
  retryButtonText: {
    color: 'white',
    fontSize: scaleSize(16),
    fontWeight: 'bold',
  },
  // Map marker styles
  dropMarkerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  dropLocationIcon: {
    width: 40,
    height: 40,
  },
  dropNumberBadge: {
    position: 'absolute',
    top: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  dropNumberText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // BookingSearchingScreen-style route visual styles
  routeInfo: {
    marginTop: scaleSize(6),
  },
  routeVisualContainer: {
    marginTop: scaleSize(6),
  },
  routeItemContainer: {
    marginBottom: scaleSize(2),
  },
  routeIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stopDot: {
    width: scaleSize(20),
    height: scaleSize(20),
    borderRadius: scaleSize(10),
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
  greenDotNew: {
    backgroundColor: '#4CAF50',
  },
  redDotNew: {
    backgroundColor: '#EC4D4A',
  },
  stopNumberNew: {
    color: '#fff',
    fontSize: scaleSize(10),
    fontWeight: 'bold',
  },
  verticalLineNew: {
    width: scaleSize(2),
    height: scaleSize(20),
    backgroundColor: '#E0E0E0',
    marginTop: scaleSize(3),
  },
  locationTextContainer: {
    flex: 1,
    paddingTop: scaleSize(1),
  },
  locationLabel: {
    fontSize: scaleSize(11),
    fontWeight: '600',
    color: '#666',
    marginBottom: scaleSize(1),
  },
  locationAddressNew: {
    fontSize: scaleSize(13),
    color: '#333',
    lineHeight: scaleSize(16),
  },
  receiverInfo: {
    fontSize: scaleSize(11),
    color: '#888',
    marginTop: scaleSize(2),
    fontStyle: 'italic',
  },
  expandCollapseContainer: {
    marginTop: scaleSize(6),
    alignItems: 'center',
  },
  hiddenStopsInfo: {
    marginBottom: scaleSize(6),
  },
  hiddenStopsText: {
    fontSize: scaleSize(12),
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(6),
    paddingHorizontal: scaleSize(10),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EC4D4A',
    borderRadius: scaleSize(16),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expandButtonText: {
    fontSize: scaleSize(12),
    color: '#EC4D4A',
    fontWeight: '600',
    marginRight: scaleSize(3),
  },
  expandIcon: {
    marginLeft: scaleSize(1),
  },
  // Rider live location marker styles
  riderMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 45,
  },
  riderMarkerPulse: {
    position: 'absolute',
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(30),
    backgroundColor: '#EC4D4A',
    opacity: 0.3,
  },
  riderMarkerIcon: {
    width: 45,
    height: 45,
  },
  liveIndicatorBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: scaleSize(8),
    width: scaleSize(16),
    height: scaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  liveIndicatorDot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: 'white',
  },
});