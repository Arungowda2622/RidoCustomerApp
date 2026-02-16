import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HeaderWithBackButton = ({ 
  title, 
  onBackPress, 
  rightComponent,
  style,
  titleStyle,
  backButtonColor = "#000",
  backgroundColor = "#fff"
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor, paddingTop: insets.top + 10 }, style]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <Ionicons name="arrow-back" size={width * 0.06} color={backButtonColor} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {rightComponent || <View style={{ width: width * 0.06 }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
});

export default HeaderWithBackButton;