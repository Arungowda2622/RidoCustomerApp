import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const TermsAndConditionsScreen = () => {
  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Terms & Conditions" />
      <ScrollView style={styles.scrollContainer}>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.paragraph}>
        Welcome to our app. By accessing or using our services, you agree to be bound by these Terms and Conditions. 
        Please read them carefully.
      </Text>

      <Text style={styles.sectionTitle}>2. Use of the App</Text>
      <Text style={styles.paragraph}>
        You agree to use the app only for lawful purposes and in accordance with these terms. Misuse of the app may result in suspension or termination of your account.
      </Text>

      <Text style={styles.sectionTitle}>3. User Accounts</Text>
      <Text style={styles.paragraph}>
        You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account information.
      </Text>

      <Text style={styles.sectionTitle}>4. Payments</Text>
      <Text style={styles.paragraph}>
        All payments made through the app are secure and non-refundable unless explicitly stated.
      </Text>

      <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
      <Text style={styles.paragraph}>
        All content, trademarks, and data on this app are the property of the company and protected by applicable laws.
      </Text>

      <Text style={styles.sectionTitle}>6. Termination</Text>
      <Text style={styles.paragraph}>
        We may terminate or suspend access to our app immediately, without prior notice, for conduct that we believe violates these Terms.
      </Text>

      <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
      <Text style={styles.paragraph}>
        We reserve the right to update or modify these Terms at any time. Continued use of the app means you accept the new terms.
      </Text>

      <Text style={styles.sectionTitle}>8. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions about these Terms, please contact our support team.
      </Text>
    </ScrollView>
    </View>
  );
};

export default TermsAndConditionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    color: '#0066FF',
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});
