import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'tn', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
];

export default function LanguageSidebar() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (code) => {
    setSelectedLanguage(code);
    // Add i18n language change logic here if needed
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Change Language" />
      <LinearGradient colors={['#f0f4ff', '#ffffff']} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {languages.map((lang) => {
          const selected = selectedLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.languageCard, selected && styles.selectedCard]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.8}
            >
              <Text style={[styles.languageText, selected && styles.selectedText]}>
                {lang.label}
              </Text>
              {selected && <Ionicons name="checkmark-circle" size={22} color="#EC4D4A" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  scroll: {
    paddingBottom: 20,
  },
  languageCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedCard: {
    backgroundColor: '#e6f0ff',
  },
  languageText: {
    fontSize: 18,
    color: '#333',
  },
  selectedText: {
    color: '#EC4D4A',
    fontWeight: 'bold',
  },
});
