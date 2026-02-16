// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

// export default function OnlinePaymentScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select UPI App</Text>
      
//       <TouchableOpacity style={styles.option}>
//         <Image source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAbFBMVEVnOrf///9iMrXKv+NeKrRmOLdYHrJkNbbw7vdgLbRbJbPGuuFhMLXc1e3IveNVF7G0o9n7+v329PqSeMng2u+7rdyYf8t9W8CAYMGnk9NtQ7l5Vr+3p9q/st6rmdXY0OuHasSMcMZHAKzRx+fRQ1l2AAACYElEQVRIia2W2ZqDIAyFBVlaKlJcaKebs7z/Ow6grUDQdpZz5Uf5K4knIQX6pYr/Bjdy118u/U5ufgDqnamUIFsrIlTV7vRLoGwVwbR4iGKiWvkU7A4MF0CYHbpVUBvFIebEldHLoKyqPOZUVXIJ7NUcGhFCkJikqs+Db2zeJBq7MLCYLNhbDgy5Yrt3Sx9pngLyAfbx3zMX0CZ9ZcH6FJQqCYi7JN62KalkDOqKJjvwu1vn6TKtdAQa+B2EC7MW6XJlQrBTgLPxOLOcgSFUF4CHnF9oYU/VgfzwwwzCX8dTfbgggHX9SUawzfjaSdjkNyBK3N5BHUZIWaBPm/z9p3sKs6v0BNaBKelpE8nZwOkUkKSewDAMfkZZhdnFZgLDen8FpHgEmyjEJTAKsvGgjPKGW9O6GLrWWLWDfRzsUpR3IT1YxwWLsTfboLAV27nkMRx/L5cdC/ZpCfhiHPw5iANLkm7oPXj5OXj5G/jro9Zg/Rk4JUemNn4KTp+jSavYg2OpiTIHTgYAjcV7EXHuSqXJgHfLgVqlY3XbZs6+UAZ8mBxkR/j9uiwblAMfZaXTIOkpMngKPgoZtg58XAHn1pFpVvg0dWwNwaBZoSNoj1Sc93W5P18ByMfTLDdkviVkK6ABooacuwK8oHPiKyDuO2sgrVAMZm+PDKi6BETX7DVAEq+yK0pBdMuR2Axfw2xJdkMQXCDt9JHjonHlqvIZuudFXVEeRB1eG5BwNJUls9zaSBbvBEPgUWWHwOP6EOhRA8dOk2ILg25p6DzoclO+NuiOamTpRutSNgsb/n2Yf6pvlrQgHh3FeJIAAAAASUVORK5CYII=' }} style={styles.icon} />
//         <Text style={styles.text}>PhonePe</Text>
//       </TouchableOpacity>
// {/* 
//       <TouchableOpacity style={styles.option}>
//         <Image source={{ uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAB4AOAMBIgACEQEDEQH/xAAaAAACAwEBAAAAAAAAAAAAAAAABAUGCAcD/8QANhAAAQMCAwIKCgMBAAAAAAAAAQIDBAURAAYhBxMSFDFBUVVhcYGRFhdCkpShsdHS8CIyYuH/xAAXAQADAQAAAAAAAAAAAAAAAAABAgMA/8QAHREAAwEAAgMBAAAAAAAAAAAAAAECEQMSITFRQf/aAAwDAQACEQMRAD8ApOzHZ5IzlLU68osU5kjeO25f8jpP05TzA9/pez7KtMjpZao8d2w1XITvCfPQeAGDZnTmaZkelNMJA3rIeUekq1+lh4YVnRZdXkVCZUKpIh0qJfgNxFFKiEi5Kun59mJ3ydaULy36RXi45vXdYl+kv6IZa6hpvwqPtg9EMtdQ034VH2wvlKpwXWuIRqpIqDyApzhvoUCE3AtcjmuMVefWd2quLRmaU1WI8t5MKnIUlzecH+iN1wSVAnTTzGLOLl5axkm4bfR6vpcPRDLXUNN+FR9sJVTZ9lWpx1Mu0eO1caLjp3ZT26aeYOGJOZjCkBudSprbKVIQ7KHA3aFKsLgcLhlIJAKgm3zx6ozLEXBiyUsv7yTM4mmPZO8S6FFKgRe38eConXkF9cKYzntO2eSMmy0vMqL9OeJ3TttU/wCT2/XlHOAY7/tNpzNTyPVWn0g7pkvJPQU6/S48cGMAjtjuYGK3k2KylY4zCSGnUX1A9k91tO9JxJzKVWYVQkSqJIYcZk6uRpV7JPZb/njjLuVMz1LK1STNpbxQrkWg6pWOcEc4/eUAjt9H22wn4aXKlSZCHLamOpKgfAkW8zhahV5FuOyzS+Zeo0mHJk1CpvNuzpACSGhZDaRzD5eWGqJTXKdx/eOJXxma5ITwR/UKtoe3TFH9dFB6vqXuN/lg9dFB6vqXuN/lilOq9miVCxEnUcly5Ts9KTS1JlS+MiY8wVSU/wAgd3fmAtYEHk0tz4bpVObfzvVJzKlGJFIAb9nja0AOKHc2Gx3qV24gfXRQer6l7jf5YRrG2yExDU5TaTIW5bQyFJSB4Am/mMAYsG2LMDFEybKZUscZmpLTSL6ke0e62neRgxnDNeZ6lmmpKm1R4rVyIQNEoHMAOj95STgwAn//2Q==' }} style={styles.icon} />
//         <Text style={styles.text}>Google Pay</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.option}>
//         <Image source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAICAMAAACbIsyBAAAA21BMVEX////sGEq6ursAtfAAAGKTlJUAAGCRkZO2uctZWl3k5OTI6/u85/r84+c6R4PqADDrADWKiowAAGan4PjrADxSyfTP0NCIjq5PUFPBwcLl5uzQ0t7GydfAw9Ps+v+I1/YAufDY8fz72N76z9b+9faxsrPu7+/w+PR1fKEAAFlozvT4w8zqACbyfZDtOF3Z2dpkZWf+k1g4onAVKnVKVYrxa4P3r7ulpqf/9u/6agBffCK72smWm7cAF24rOnxyc3X+zrXOeR1eZpTvW3b1oq/6nmzlcwgdjEb7gzjnVYzsAAABJUlEQVQYlY2R2XKCQBBFLw7qIMiqLAMGjIrGxGCUiCYqiVn//4vSwJNvOQ9d09Vz6nbNANdo+C+C8xAhjzAKBb+Jk7GqOmNNpUn/FphM6TCrL87QakAr3c8BbssdsejIXPf4ncaS5ZKxhDEV9w/G6tE0p8jWlddTUqtLWAp8PG0qMZWjNNoec28kI04wXGrshjl4HkgDSRrsUBR1YNFsGLRda394eSXxaFPq6ZifcxtOJaoMJO5MiTD6KLNKKDNLqfDdovV2eN+An+RzKAvdExfdbhIbER8UaHwi9eskP/WzXgUU8fX9MweX6YE63tYTi8u1iJVh7gB3HRBFmZXNrj0Fv+Qh0qnx8pyHej6CM0Qcj8muv2XSp+K2K7puEDSiO9vPyfsDvrMdw9pBtqMAAAAASUVORK5CYII=' }} style={styles.icon} />
//         <Text style={styles.text}>Paytm</Text>
//       </TouchableOpacity> */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 20,
//   },
//   option: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   icon: {
//     width: 40,
//     height: 40,
//     resizeMode: 'contain',
//     marginRight: 16,
//   },
//   text: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBooking } from '../utils/AuthApi';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

export default function OnlinePaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get booking data passed from BillingPayment screen
  const bookingData = route.params?.bookingData || {};

  const handleContinue = async () => {
    try {
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      const parsedUserData = userData ? JSON.parse(userData) : {};
      const userId = parsedUserData.user?._id || parsedUserData._id || parsedUserData.phone;
      
      if (!userId) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }
      
      // Helper function to convert vehicle type to backend enum format
      const getVehicleTypeEnum = (type) => {
        if (!type) return "Truck";
        const t = type.toLowerCase();
        if (t.includes("2w") || t.includes("bike") || t.includes("2 wheeler")) return "2W";
        if (t.includes("3w") || t.includes("auto")) return "3W";
        if (t.includes("e-loader") || t.includes("eloader")) return "E-Loader";
        if (t.includes("truck")) return "Truck";
        return "Truck"; // Default fallback
      };
      
      // Prepare booking data for database
      const dbBookingData = {
        userId: userId,
        amountPay: bookingData.pricing?.finalAmount?.toString() || '0',
        payFrom: 'online', // Mark as online payment
        paymentMethod: 'online', // Add payment method field
        paymentStatus: 'completed', // Mark as completed since simulating successful payment
        paymentCompletedAt: new Date().toISOString(), // Timestamp
        vehicleType: getVehicleTypeEnum(bookingData.selectedVehicle?.type),
        vehicleSubType: bookingData.selectedVehicle?.id || null,
        price: bookingData.pricing?.finalAmount || 0,
        quickFee: bookingData.quickFee || 0,
        fromAddress: {
          address: bookingData.locations?.find(loc => loc.isFirst)?.address || 'Pickup Location',
          latitude: bookingData.locations?.find(loc => loc.isFirst)?.latitude || 0,
          longitude: bookingData.locations?.find(loc => loc.isFirst)?.longitude || 0,
          receiverName: bookingData.userData?.name || parsedUserData.user?.name || parsedUserData.name || 'Customer',
          receiverMobile: bookingData.userData?.phone || parsedUserData.user?.phone || parsedUserData.phone || '',
          tag: 'pickup'
        },
        dropLocation: (bookingData.locations || []).filter(loc => !loc.isFirst).map(loc => ({
          address: loc.address,
          latitude: loc.latitude,
          longitude: loc.longitude,
          receiverName: loc.receiverName || bookingData.userData?.name || 'Receiver',
          receiverMobile: loc.receiverMobile || bookingData.userData?.phone || '',
          tag: loc.isLast ? 'final' : 'stop'
        })),
        stops: [], // Mid stops can be added here if needed
        bookingStatus: 'pending',
        status: 'pending'
      };
      
      console.log('💳 Creating ONLINE booking in database:', JSON.stringify(dbBookingData, null, 2));
      
      // Create booking in database
      const response = await createBooking(dbBookingData);
      console.log('✅ API Response:', JSON.stringify(response, null, 2));
      console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
      console.log('🆔 Booking ID from response:', response.data?._id || response.data?.id);
      
      if (!response.data || (!response.data._id && !response.data.id)) {
        throw new Error('No booking ID received from server. Response: ' + JSON.stringify(response));
      }
      
      // Save completed booking data to AsyncStorage
      const completedBookingData = {
        ...bookingData,
        _id: response.data._id || response.data.id, // Add _id for consistency
        bookingId: response.data._id || response.data.id,
        paymentStatus: 'completed',
        paymentCompletedAt: new Date().toISOString(),
        databaseBooking: response.data
      };
      
      await AsyncStorage.setItem('lastBookingData', JSON.stringify(completedBookingData));
      console.log('✅ Online payment completed with booking ID:', completedBookingData.bookingId);
      
      // Navigate to WaitingDriver with booking data
      navigation.replace('WaitingDriver', { bookingData: completedBookingData });
    } catch (error) {
      console.error('❌ Error creating online booking:', error);
      console.error('❌ Error details:', JSON.stringify(error.response?.data || error.message, null, 2));
      Alert.alert(
        'Payment Error',
        `Payment successful but failed to create booking: ${error.response?.data?.message || error.message}`,
        [
          { text: 'Retry', onPress: handleContinue },
          { text: 'Cancel', onPress: () => navigation.goBack(), style: 'cancel' }
        ]
      );
    }
  }
  const paymentAmount = bookingData.pricing?.finalAmount || 0;

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithBackButton title="Select UPI App" />
      <View style={styles.content}>
        <Text style={styles.title}>Select UPI App</Text>
        
        {paymentAmount > 0 && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay:</Text>
            <Text style={styles.amountText}>₹{paymentAmount.toLocaleString()}</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.option}>
          <Image source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAbFBMVEVnOrf///9iMrXKv+NeKrRmOLdYHrJkNbbw7vdgLbRbJbPGuuFhMLXc1e3IveNVF7G0o9n7+v329PqSeMng2u+7rdyYf8t9W8CAYMGnk9NtQ7l5Vr+3p9q/st6rmdXY0OuHasSMcMZHAKzRx+fRQ1l2AAACYElEQVRIia2W2ZqDIAyFBVlaKlJcaKebs7z/Ow6grUDQdpZz5Uf5K4knIQX6pYr/Bjdy118u/U5ufgDqnamUIFsrIlTV7vRLoGwVwbR4iGKiWvkU7A4MF0CYHbpVUBvFIebEldHLoKyqPOZUVXIJ7NUcGhFCkJikqs+Db2zeJBq7MLCYLNhbDgy5Yrt3Sx9pngLyAfbx3zMX0CZ9ZcH6FJQqCYi7JN62KalkDOqKJjvwu1vn6TKtdAQa+B2EC7MW6XJlQrBTgLPxOLOcgSFUF4CHnF9oYU/VgfzwwwzCX8dTfbgggHX9SUawzfjaSdjkNyBK3N5BHUZIWaBPm/z9p3sKs6v0BNaBKelpE8nZwOkUkKSewDAMfkZZhdnFZgLDen8FpHgEmyjEJTAKsvGgjPKGW9O6GLrWWLWDfRzsUpR3IT1YxwWLsTfboLAV27nkMRx/L5cdC/ZpCfhiHPw5iANLkm7oPXj5OXj5G/jro9Zg/Rk4JUemNn4KTp+jSavYg2OpiTIHTgYAjcV7EXHuSqXJgHfLgVqlY3XbZs6+UAZ8mBxkR/j9uiwblAMfZaXTIOkpMngKPgoZtg58XAHn1pFpVvg0dWwNwaBZoSNoj1Sc93W5P18ByMfTLDdkviVkK6ABooacuwK8oHPiKyDuO2sgrVAMZm+PDKi6BETX7DVAEq+yK0pBdMuR2Axfw2xJdkMQXCDt9JHjonHlqvIZuudFXVEeRB1eG5BwNJUls9zaSBbvBEPgUWWHwOP6EOhRA8dOk2ILg25p6DzoclO+NuiOamTpRutSNgsb/n2Yf6pvlrQgHh3FeJIAAAAASUVORK5CYII=' }} style={styles.icon} />
          <Text style={styles.text}>PhonePe</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handleContinue}>
        <Text style={styles.payButtonText}>
          {paymentAmount > 0 ? `Pay ₹${paymentAmount.toLocaleString()}` : 'Proceed to Pay'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop:15
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  amountContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EC4D4A',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#EC4D4A',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});