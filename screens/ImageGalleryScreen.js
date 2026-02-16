// import React from 'react';
// import { View, Image, ScrollView, StyleSheet } from 'react-native';

// const imageSources = [
//   require('../assets/box-icon.png'),
//   require('../assets/pngwing.com.png'),
//   require('../assets/bike.png'),
// ];

// export default function ImageGalleryScreen() {
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//     {imageSources.map((img, index) => (
//   <Image
//     key={index}
//     source={img}
//     style={styles.image}
//     resizeMode="cover"
//   />
// ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     alignItems: 'center',
//   },
//   image: {
//     width: '100%',
//     height: 200,
//     marginBottom: 16,
//     borderRadius: 8,
//     marginTop:20
//   },
// });


import React from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const imageSources = [
  require('../assets/box-icon.png'),
  require('../assets/pngwing.com.png'),
  require('../assets/bike.png'),
];

export default function ImageGalleryScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Gallery" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 📸 Image Gallery */}
        {imageSources.map((img, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={img}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
  },
  imageWrapper: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
});
