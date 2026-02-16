import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyOtp, getUserProfile, sendOtp } from "../utils/AuthApi";
import { useRoute } from "@react-navigation/native";
import KeyboardAwareWrapper from "../components/KeyboardAwareWrapper";
import pushNotificationManager from "../utils/PushNotificationManager";
import { BASE_URL } from "../utils/api";

// Get dimensions once at module level to prevent recalculation
const { width, height } = Dimensions.get("window");
const scale = Math.min(width / 375, height / 812);

const OtpScreen = ({ navigation }) => {
  const route = useRoute();
  const number = route.params?.phoneNumber;
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  // Debounced auto-verification to prevent rapid calls
  const verifyOtpDebounced = useCallback(async (otpString) => {
    if (isVerifying || otpString.length !== 4) return;
    
    setIsVerifying(true);
    try {
      const res = await verifyOtp(number, otpString);

      console.log("OTP verification response:", res.data);
      
      if (res.status === 200) {
        if (res.data.isNewUser) {
          // New user - go to registration
          navigation.replace("Register", { number });
        } else {
          // Existing user - fetch complete profile and store it
          let userDataToStore = null;
          
          try {
            if (res.data.token) {
              console.log("📡 Fetching complete user profile...");
              const profileResponse = await getUserProfile(res.data.token);
              
              if (profileResponse.data) {
                console.log("✅ Complete user profile fetched:", profileResponse.data);
                userDataToStore = profileResponse.data;
              }
            }
          } catch (profileError) {
            console.warn("⚠️ Failed to fetch complete profile, storing basic user data:", profileError.message);
            // Fallback: store the basic user data from OTP response
            if (res.data.user) {
              userDataToStore = res.data.user;
            }
          }

          // Use multiSet for atomic storage
          if (res.data.token && userDataToStore) {
            const dataToStore = [
              ["token", res.data.token],
              ["userData", JSON.stringify(userDataToStore)],
              ["userPhone", number],
              ["userId", userDataToStore._id || userDataToStore.customerId || res.data.userId || ""]
            ];

            await AsyncStorage.multiSet(dataToStore);
            console.log("✅ All login data stored atomically");

            // Verify data was stored
            const [storedToken, storedUserData, storedPhone, storedUserId] = await AsyncStorage.multiGet([
              "token",
              "userData", 
              "userPhone",
              "userId"
            ]);

            console.log("🔍 Verification - Token exists:", !!storedToken[1]);
            console.log("🔍 Verification - UserData exists:", !!storedUserData[1]);
            console.log("🔍 Verification - UserPhone exists:", !!storedPhone[1]);
            console.log("🔍 Verification - UserId exists:", !!storedUserId[1]);

            if (!storedToken[1] || !storedUserData[1]) {
              throw new Error("Failed to verify stored data");
            }
          } else {
            throw new Error("Missing token or user data");
          }

          // ✅ REGISTER FOR PUSH NOTIFICATIONS
          try {
            console.log("📲 Registering for push notifications...");
            const pushToken = await pushNotificationManager.registerForPushNotifications();
            if (pushToken) {
              console.log("✅ Push token obtained, updating on backend...");
              await pushNotificationManager.updatePushTokenOnBackend(number, BASE_URL);
            }
          } catch (pushError) {
            console.warn("⚠️ Failed to register push notifications:", pushError.message);
            // Don't block login if push notification registration fails
          }

          // Navigate to MainTabs only after verification
          navigation.replace("MainTabs");
        }
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      Alert.alert(
        "Invalid OTP",
        err.response?.data?.message || "Please enter the correct OTP"
      );
      // Clear OTP on error
      setOtp(["", "", "", ""]);
      setFocusedIndex(0);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsVerifying(false);
    }
  }, [number, navigation, isVerifying]);

  // Auto verify when all 4 digits are entered
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 4) {
      verifyOtpDebounced(otpString);
    }
  }, [otp, verifyOtpDebounced]);

  // Keyboard visibility listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => timer && clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (text, index) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = numericText;
    setOtp(newOtp);

    // Auto focus to next input
    if (numericText && index < 3) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
          setFocusedIndex(index + 1);
        }
      }, 10);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        setTimeout(() => {
          if (inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
            setFocusedIndex(index - 1);
          }
        }, 10);
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      // Actually call the API to resend OTP
      const response = await sendOtp(number);
      
      if (response.status === 200) {
        setOtp(["", "", "", ""]);
        setFocusedIndex(0);
        setCountdown(60);
        setIsResendDisabled(true);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
        // OTP resent - user can see the countdown reset
      }
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      Alert.alert(
        "Resend Failed", 
        error.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    }
  };

  const handleEditNumber = () => {
    navigation.goBack();
  };

  const handleSelectionChange = (event, index) => {
    // Track focused input
    setFocusedIndex(index);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Static styles to prevent recalculation
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 20,
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 40,
    },
    progressDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#000",
    },
    progressDotActive: {
      backgroundColor: "#000",
    },
    progressDotInactive: {
      backgroundColor: "#D3D3D3",
    },
    progressLine: {
      width: 40,
      height: 2,
      backgroundColor: "#000",
      marginHorizontal: 8,
    },
    progressLineInactive: {
      backgroundColor: "#D3D3D3",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#000",
      marginBottom: 12,
    },
    subtitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 30,
    },
    subtitle: {
      fontSize: 16,
      color: "#999",
      marginRight: 8,
    },
    phoneNumber: {
      fontWeight: "700",
      color: "#000",
    },
    editButton: {
      padding: 4,
    },
    editIcon: {
      fontSize: 18,
      color: "#000",
    },
    imageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 20,
    },
    centerImage: {
      width: 200,
      height: 150,
      borderRadius: 12,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 10,
      paddingHorizontal: 10,
      gap: 12,
    },
    inputWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpInput: {
      width: 48,
      height: 56,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#E0E0E0",
      backgroundColor: "#FFFFFF",
      fontSize: 24,
      fontWeight: "600",
      textAlign: "center",
      color: "#000",
    },
    otpInputFilled: {
      borderColor: "#000",
      backgroundColor: "#FFFFFF",
    },
    otpInputFocused: {
      borderColor: "#000",
    },
    resendOptionsContainer: {
      marginTop: 10,
      marginBottom: 15,
      gap: 10,
      alignItems: "center",
    },
    resendOptionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderWidth: 1.5,
      borderColor: "#E0E0E0",
      borderRadius: 50,
      paddingVertical: 10,
      paddingHorizontal: 20,
      alignSelf: "flex-start",
    },
    resendOptionIcon: {
      fontSize: 18,
      marginRight: 10,
    },
    resendOptionText: {
      fontSize: 15,
      color: "#000",
      fontWeight: "700",
    },
    disabledText: {
      color: "#999",
    },
    resendContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    resendText: {
      fontSize: 15,
      color: "#999",
    },
    timerText: {
      fontSize: 15,
      color: "#EC4D4A",
      fontWeight: "600",
    },
    spacer: {
      flex: 1,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#4CAF50",
      backgroundColor: "#4CAF50",
      marginRight: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    checkmark: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: "#333",
      lineHeight: 20,
    },
    linkText: {
      color: "#000",
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    verifyButton: {
      backgroundColor: "#EC4D4A",
      paddingVertical: 16,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    disabledButton: {
      backgroundColor: "#E0E0E0",
    },
    verifyText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 1,
    },
  });

  return (
    <KeyboardAwareWrapper 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.content}>
              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressDot} />
                <View style={styles.progressLine} />
                <View style={[styles.progressDot, styles.progressDotActive]} />
                <View style={[styles.progressLine, styles.progressLineInactive]} />
                <View style={[styles.progressDot, styles.progressDotInactive]} />
              </View>

              {/* Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={require('../assets/icons/image-1763028878504.png')}
                  style={styles.centerImage}
                  resizeMode="contain"
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>Let's Verify Your Number</Text>

              {/* Subtitle with phone number and edit icon */}
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>
                  OTP has been sent to{" "}
                  <Text style={styles.phoneNumber}>+91 {number}</Text>
                </Text>
                <TouchableOpacity onPress={handleEditNumber} style={styles.editButton}>
                  <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
              </View>

              {/* OTP Input Boxes */}
              <View style={styles.otpContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <View key={index} style={styles.inputWrapper}>
                    <TextInput
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={[
                        styles.otpInput, 
                        otp[index] && styles.otpInputFilled,
                        focusedIndex === index && styles.otpInputFocused
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[index]}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onSelectionChange={(event) => handleSelectionChange(event, index)}
                      selectionColor="#EC4D4A"
                      caretHidden={false}
                      underlineColorAndroid="transparent"
                      autoCorrect={false}
                      autoCapitalize="none"
                      autoComplete="off"
                    />
                  </View>
                ))}
              </View>

              {/* Resend Options */}
              <View style={styles.resendOptionsContainer}>
                <TouchableOpacity 
                  style={styles.resendOptionButton}
                  onPress={handleResendOTP}
                  disabled={isResendDisabled}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendOptionIcon}>💬</Text>
                  <Text style={[styles.resendOptionText, isResendDisabled && styles.disabledText]}>
                    Send via SMS
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resendOptionButton}
                  onPress={handleResendOTP}
                  disabled={isResendDisabled}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendOptionIcon}>📱</Text>
                  <Text style={[styles.resendOptionText, isResendDisabled && styles.disabledText]}>
                    Resend via WhatsApp
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Didn't receive one? with timer */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't receive one?
                </Text>
                <Text style={styles.timerText}>
                  {formatTime(countdown)}
                </Text>
              </View>

              {/* Spacer to push button to bottom */}
              <View style={styles.spacer} />

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (otp.join("").length !== 4 || isVerifying) && styles.disabledButton,
                ]}
                activeOpacity={0.8}
                disabled={otp.join("").length !== 4 || isVerifying}
                onPress={() => {
                  // Manual verify if needed
                  const otpString = otp.join("");
                  if (otpString.length === 4) {
                    verifyOtpDebounced(otpString);
                  }
                }}
              >
                <Text style={styles.verifyText}>
                  {isVerifying ? "VERIFYING..." : "VERIFY"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAwareWrapper>
  );
};

export default OtpScreen;