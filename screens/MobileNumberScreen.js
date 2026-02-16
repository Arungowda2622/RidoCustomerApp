
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Keyboard,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { sendOtp } from "../utils/AuthApi";
const { width, height } = Dimensions.get("window");

const MobileNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyboardOffset] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        Animated.timing(keyboardOffset, {
          duration: event.duration || 250,
          toValue: event.endCoordinates.height,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        Animated.timing(keyboardOffset, {
          duration: event.duration || 250,
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Validation function for Indian mobile numbers
  const validateMobileNumber = (number) => {
    // Remove any spaces or special characters
    const cleanNumber = number.replace(/\s+/g, '');
    
    // Check if empty
    if (!cleanNumber) {
      return "Mobile number is required";
    }
    
    // Check if contains only numbers
    if (!/^\d+$/.test(cleanNumber)) {
      return "Mobile number should contain only digits";
    }
    
    // Check exact length (10 digits)
    if (cleanNumber.length !== 10) {
      return "Mobile number must be exactly 10 digits";
    }
    
    // Check Indian mobile number pattern (starts with 6, 7, 8, or 9)
    if (!/^[6-9]/.test(cleanNumber)) {
      return "Please enter a valid Indian mobile number";
    }
    
    return "";
  };

  // Handle phone number input with validation
  const handlePhoneNumberChange = (text) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericText);
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSendOtp = async () => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    
    // Validate mobile number
    const validationError = validateMobileNumber(phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await sendOtp(phoneNumber);
      if (res.status === 200) {
        navigation.navigate("Otp", { phoneNumber });
      }
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || "Failed to send OTP";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top-right logo (optional) */}
      <View style={styles.topRightLogoContainer}>
        {/* Uncomment and add logo if needed */}
        {/* <Image source={require('../assets/Ridodrop.png')} style={styles.topRightLogo} /> */}
      </View>

      {/* Main image/logo - positioned absolutely to cover full screen */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/Customermobile.png")}
          style={styles.image}
          // resizeMode="cover"
        />
      </View>

      {/* Bottom card with animated positioning for keyboard */}
      <Animated.View style={[styles.keyboardAvoidingContainer, { bottom: keyboardOffset }]}>
        <View style={styles.card}>
            <Text style={styles.logo}>
              India's #1 Fast{"\n"}Logistics App
            </Text>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Log in or sign up</Text>
              <View style={styles.line} />
            </View>

        {/* Phone input row - Updated to match image design */}
        <View style={styles.inputContainer}>
          {/* Country Code Selector */}
          <View style={styles.countryCodeBox}>
            <Text style={styles.flagText}>🇮🇳</Text>
            <Text style={styles.codeText}>+91</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </View>
          
          {/* Mobile Number Input */}
          <View style={[styles.mobileInputBox, error ? styles.inputError : null]}>
            <TextInput
              style={styles.mobileInput}
              placeholder="Mobile Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
            />
          </View>
        </View>
            {/* Error message */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Continue button */}
            <TouchableOpacity
              style={[
                styles.continueButton, 
                (phoneNumber.length !== 10 || loading) ? styles.continueButtonDisabled : null
              ]}
              onPress={handleSendOtp}
              activeOpacity={0.8}
              disabled={phoneNumber.length !== 10 || loading}
            >
              <Text style={styles.continueText}>
                {loading ? "Sending OTP..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topRightLogoContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 1,
  },
  topRightLogo: {
    width: 40,
    height: 40,
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 1, // Full screen height
    justifyContent: "center",
    alignItems: "center",
    paddingTop: height * 0.05, // 5% padding from top
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "fill",
  },
  keyboardAvoidingContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    fontSize: width > 400 ? 28 : 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginTop: 20,
    marginBottom: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "80%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: width > 400 ? 16 : 14,
    color: "#999",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginTop: 10,
    gap: 12,
  },
  countryCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  flagText: {
    fontSize: 22,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dropdownArrow: {
    fontSize: 10,
    color: "#666",
    marginLeft: 2,
  },
  mobileInputBox: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  mobileInput: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
    padding: 0,
    margin: 0,
  },
  continueButton: {
    backgroundColor: "#EC4D4A",
    paddingVertical: 15,
    borderRadius: 10,
    width: "80%",
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#EC4D4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  continueText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  continueButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default MobileNumberScreen;
