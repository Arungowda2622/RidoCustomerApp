import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BackButton = ({ 
  onPress, 
  style, 
  color = '#333', 
  size = 24,
  position = 'absolute',
  backgroundColor = 'rgba(255, 255, 255, 0.9)'
}) => {
  const navigation = useNavigation();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.backButton, 
        { position, backgroundColor }, 
        style
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 15,
    left: 20,
    zIndex: 1000,
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackButton;