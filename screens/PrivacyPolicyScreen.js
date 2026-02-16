import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import HeaderWithBackButton from '../components/HeaderWithBackButton';

const PrivacyPolicyScreen = () => {
  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Privacy Policy" />
      <ScrollView style={styles.scrollContainer}>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.paragraph}>
        We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information.
      </Text>

      <Text style={styles.sectionTitle}>2. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We may collect personal information such as your name, email address, phone number, and location when you use our app or services.
      </Text>

      <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        We use your information to provide and improve our services, personalize your experience, and communicate with you about updates and offers.
      </Text>

      <Text style={styles.sectionTitle}>4. Sharing Your Information</Text>
      <Text style={styles.paragraph}>
        We do not sell your personal data. We may share it with trusted third parties to operate our services, comply with legal obligations, or protect our rights.
      </Text>

      <Text style={styles.sectionTitle}>5. Data Security</Text>
      <Text style={styles.paragraph}>
        We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
      </Text>

      <Text style={styles.sectionTitle}>6. Your Rights</Text>
      <Text style={styles.paragraph}>
        You have the right to access, correct, or delete your personal data. You may also withdraw your consent at any time.
      </Text>

      <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
      <Text style={styles.paragraph}>
        We may update this policy from time to time. We encourage you to review it periodically for any changes.
      </Text>

      <Text style={styles.sectionTitle}>8. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions or concerns about this Privacy Policy, please contact our support team.
      </Text>
    </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;

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
