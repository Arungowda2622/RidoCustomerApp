import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const languages = [
  { label: 'English', value: 'en' },
  { label: 'हिन्दी', value: 'hi' },
  { label: 'ಕನ್ನಡ', value: 'kn' },
  { label: 'తెలుగు', value: 'te' },
  { label: 'தమிழ்', value: 'ta' },
];

const LanguageSelectorScreen = () => {
  const [selected, setSelected] = useState('en');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    navigation.replace('MobileNumber');
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Choose Language" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Your language preference can be changed anytime in settings
        </Text>

        <View style={styles.languageContainer}>
          {Array.from({ length: Math.ceil(languages.length / 2) }, (_, i) => (
            <View key={i} style={styles.row}>
              {languages.slice(i * 2, i * 2 + 2).map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={[
                    styles.languageCard,
                    selected === lang.value && styles.selectedCard,
                  ]}
                  onPress={() => setSelected(lang.value)}
                >
                  <Text
                    style={[
                      styles.langLabel,
                      selected === lang.value && styles.selectedLabel,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LanguageSelectorScreen;

const CIRCLE_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding to prevent content from being hidden by fixed button
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    maxWidth: 280,
  },
  languageContainer: {
    marginTop: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    gap: 20,
  },
  languageCard: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    // backgroundColor: '#50B8E7',
    backgroundColor: 'white',
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  selectedCard: {
    // backgroundColor: '#0066FF',
     backgroundColor: '#EC4D4A',
     color:'white',
     
  },
  langLabel: {
    color: '2d2d2d',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    
    
  },
  selectedLabel: {
    color: 'white',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 15,
    zIndex: 1000,
  },
  continueButton: {
    backgroundColor: '#EC4D4A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 60,
    fontWeight: '600',
  },
});
