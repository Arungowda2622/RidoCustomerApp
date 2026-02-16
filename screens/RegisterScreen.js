import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateProfile, validateReferralCode } from "../utils/AuthApi";
import { API_URL } from "../utils/api";
import KeyboardAwareWrapper from "../components/KeyboardAwareWrapper";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

// Fixed sizes for consistent display
const AVATAR_SIZE = Math.min(width * 0.3, 150); // Maximum 150 width
const AVATAR_RADIUS = AVATAR_SIZE / 2;

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [whatsappUpdates, setWhatsappUpdates] = useState(false);
  const [gender, setGender] = useState("male"); // Default to male
  const [city, setCity] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralValid, setReferralValid] = useState(null);
  const [referralError, setReferralError] = useState("");
  const [referralDiscount, setReferralDiscount] = useState(50); // Default 50, will be fetched from backend

  const route = useRoute();
  const [PhoneNumber, setPhoneNumber] = useState(route.params?.number || "");

  const cities = [
    "Bangalore",
    "Hyderabad",
    "Mumbai",
    "Delhi"
  ];

  // Fetch referral settings from backend
  React.useEffect(() => {
    const fetchReferralSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/customer-referral-settings`);
        const data = await response.json();
        if (data.success && data.data) {
          setReferralDiscount(data.data.referredDiscount || 50);
          console.log('✅ Referral discount loaded:', data.data.referredDiscount);
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch referral settings, using default:', error);
      }
    };
    fetchReferralSettings();
  }, []);

  // Load user data from AsyncStorage on mount
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        // Only load existing user data if we're in edit mode (passed via route params)
        const isEditMode = route.params?.editMode || false;
        
        const storedPhone = await AsyncStorage.getItem("userPhone");
        const whatsappPref = await AsyncStorage.getItem("whatsappUpdates");

        if (isEditMode) {
          // Edit mode: pre-fill with existing user data
          const userDataStr = await AsyncStorage.getItem("userData");
          if (userDataStr) {
            const user = JSON.parse(userDataStr);
            console.log("Loaded user data for editing:", user);
            setFirstName(user.name || user.firstName || "");
            setLastName(user.lname || user.lastName || "");
            setEmail(user.email || "");
            setGender(user.gender || "male");
            setImage(user.profilePhoto || "");
            setCity(user.city || "");
          }
        }

        // Set phone number from storage if not passed via params
        if (!PhoneNumber && storedPhone) {
          setPhoneNumber(storedPhone);
        }

        // Set referral code from route params if available
        if (route.params?.referralCode) {
          setReferralCode(route.params.referralCode);
        }

        if (whatsappPref !== null) {
          setWhatsappUpdates(whatsappPref === "true");
        }
      } catch (e) {
        console.error("Error loading user data:", e);
      }
    };
    loadUserData();
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Validate referral code with debounce
  const handleReferralCodeChange = async (code) => {
    setReferralCode(code);
    setReferralValid(null);
    setReferralError("");

    if (!code || code.trim().length === 0) {
      return;
    }

    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length < 5) {
      setReferralError("Code too short");
      return;
    }

    setValidatingReferral(true);
    try {
      const response = await validateReferralCode(trimmedCode);
      if (response.data && response.data.valid) {
        setReferralValid(true);
        setReferralError("");
      } else {
        setReferralValid(false);
        setReferralError("Invalid referral code");
      }
    } catch (error) {
      setReferralValid(false);
      setReferralError(error.response?.data?.message || "Invalid code");
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!firstName.trim() || !gender || !city.trim()) {
      Alert.alert("Error", "First Name, Gender, and City are required.");
      return;
    }

    if (!PhoneNumber) {
      Alert.alert("Error", "Phone number is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", firstName.trim());
      // Only include email if user actually entered something
      if (email && email.trim()) {
        formData.append("email", email.trim());
      }
      formData.append("gender", gender);
      formData.append("city", city.trim());
      formData.append("phone", PhoneNumber);
      formData.append("role", "customer");
      // Add referral code if provided and valid (FIXED: use usedReferralCode)
      if (referralCode && referralCode.trim() && referralValid) {
        formData.append("usedReferralCode", referralCode.trim().toUpperCase());
      }
      // Note: whatsappUpdates is stored locally for future use

      if (image) {
        // Improved image handling
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1].toLowerCase();

        // Validate file type
        const allowedTypes = ["jpg", "jpeg", "png", "gif"];
        if (!allowedTypes.includes(fileType)) {
          Alert.alert(
            "Error",
            "Please select a valid image file (JPG, PNG, or GIF)."
          );
          setLoading(false);
          return;
        }

        formData.append("profilePhoto", {
          uri: image,
          name: `profile_${Date.now()}.${fileType}`,
          type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        });
      }

      const res = await updateProfile(formData);

      console.log("Full registration response:", res);
      console.log("Registration response data:", res.data);

      if (res.data) {
        let userData = null;
        let token = null;

        // Extract token
        if (res.data.token) {
          token = res.data.token;
        }

        // Extract user data - handle different response structures
        if (res.data.user) {
          userData = res.data.user;
        } else if (res.data.data && res.data.data.user) {
          userData = res.data.data.user;
        } else if (res.data._id || res.data.phone) {
          // Response data itself is the user object
          userData = res.data;
        }

        // Prepare data for atomic save
        const dataToSave = [];
        
        if (token) {
          dataToSave.push(["token", token]);
        }
        
        if (userData) {
          dataToSave.push(["userData", JSON.stringify(userData)]);
          // Store userId separately for backward compatibility with screens that need it
          dataToSave.push(["userId", userData._id || userData.customerId || ""]);
          console.log("✅ User data prepared:", userData);
          console.log("✅ User ID from registration:", userData._id);
        } else {
          console.warn("⚠️ No user data found in response, using form data");
          const manualUserData = {
            name: firstName.trim(),
            email: email.trim() || "",
            gender: gender,
            city: city.trim(),
            phone: PhoneNumber,
            profilePhoto: image || "",
            role: "customer",
          };
          dataToSave.push(["userData", JSON.stringify(manualUserData)]);
          console.log("✅ Manual user data prepared:", manualUserData);
        }
        
        dataToSave.push(["userPhone", PhoneNumber]);
        dataToSave.push(["whatsappUpdates", whatsappUpdates.toString()]);

        // Use multiSet for atomic write operation
        await AsyncStorage.multiSet(dataToSave);
        console.log("✅ All data saved atomically to AsyncStorage");

        // Verify data was saved before navigation
        const savedUserData = await AsyncStorage.getItem("userData");
        const savedToken = await AsyncStorage.getItem("token");
        console.log("🔍 Verification before navigation:");
        console.log("  - Token exists:", !!savedToken);
        console.log("  - UserData exists:", !!savedUserData);
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          console.log("  - User ID exists:", !!parsed._id);
          console.log("  - User ID value:", parsed._id);
        }

        // Navigate directly to MainTabs without popup
        console.log("✅ Navigating to MainTabs after registration");
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Error", "No response data received from server.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to register. Please check your internet connection and try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAvatar = () => {
    if (gender === "male") {
      return require("../assets/man1.png");
    } else {
      return require("../assets/woman.png");
    }
  };

  return (
    <KeyboardAwareWrapper
      enableScrollView={true}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enableOnAndroid={true}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <HeaderWithBackButton title="Register with Ridodrop" />
      <View style={styles.card}>

        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>

        {/* Step Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/icons/image-1763028878504.png')}
            style={styles.stepImage}
            resizeMode="contain"
          />
        </View>

        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Mobile Number"
          value={PhoneNumber}
          style={[styles.input, styles.disabledInput]}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
          editable={false}
        />

        {/* Gender Selection */}
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "male" && styles.genderOptionSelected,
            ]}
            onPress={() => setGender("male")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "male" && styles.genderTextSelected,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "female" && styles.genderOptionSelected,
            ]}
            onPress={() => setGender("female")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "female" && styles.genderTextSelected,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>

        {/* City Dropdown */}
        <View style={styles.cityDropdownContainer}>
          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => setShowCityDropdown(!showCityDropdown)}
          >
            <Text style={[styles.citySelectorText, !city && styles.placeholder]}>
              {city || "Select City"}
            </Text>
            <Text style={[styles.dropdownIcon, showCityDropdown && styles.dropdownIconRotated]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {showCityDropdown && (
            <View style={styles.cityDropdown}>
              {cities.map((cityName, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.cityOption}
                  onPress={() => {
                    setCity(cityName);
                    setShowCityDropdown(false);
                  }}
                >
                  <Text style={styles.cityOptionText}>{cityName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TextInput
          placeholder="Email (optional)"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#999"
        />

        {/* Referral Code Section */}
        {!showReferralInput ? (
          <TouchableOpacity
            onPress={() => setShowReferralInput(true)}
            style={styles.referralPromptContainer}
          >
            <View style={styles.referralPromptContent}>
              <Ionicons name="gift-outline" size={20} color="#EC4D4A" />
              <Text style={styles.referralPromptText}>Have a referral code? Get ₹{referralDiscount} off!</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.referralInputContainer}>
            <View style={styles.referralInputWrapper}>
              <TextInput
                placeholder="Enter Referral Code"
                value={referralCode}
                onChangeText={handleReferralCodeChange}
                style={[
                  styles.referralInput,
                  referralValid === true && styles.referralInputValid,
                  referralValid === false && styles.referralInputInvalid,
                ]}
                placeholderTextColor="#999"
                autoCapitalize="characters"
                autoFocus={true}
                maxLength={20}
              />
              {validatingReferral && (
                <ActivityIndicator
                  size="small"
                  color="#EC4D4A"
                  style={styles.referralValidationIcon}
                />
              )}
              {!validatingReferral && referralValid === true && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#4CAF50"
                  style={styles.referralValidationIcon}
                />
              )}
              {!validatingReferral && referralValid === false && (
                <TouchableOpacity
                  onPress={() => {
                    setReferralCode("");
                    setReferralValid(null);
                    setReferralError("");
                  }}
                  style={styles.referralValidationIcon}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color="#f44336"
                  />
                </TouchableOpacity>
              )}
            </View>
            {referralValid === true && (
              <View style={styles.referralBenefitBox}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.referralBenefitText}>
                  Great! You'll get ₹{referralDiscount} off on your first booking
                </Text>
              </View>
            )}
            {referralValid === false && referralError && (
              <Text style={styles.referralErrorText}>{referralError}</Text>
            )}
          </View>
        )}
{/* 
        <View style={styles.switchContainer}>
          <Switch
            value={whatsappUpdates}
            onValueChange={setWhatsappUpdates}
            trackColor={{ false: "#767577", true: "#EC4D4A" }}
            thumbColor={whatsappUpdates ? "#fff" : "#f4f3f4"}
          />
          <Text style={styles.switchLabel}>Allow updates on WhatsApp</Text>
        </View> */}

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.loadingIndicator}
              />
              <Text style={styles.buttonText}>Registering...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAwareWrapper>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: height * 0.05,
  },
  card: {
    marginHorizontal: width * 0.05,
    marginTop: height * 0.02,
    backgroundColor: "#fff",
    padding: width * 0.06,
    paddingTop: width * 0.06,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  imagePicker: {
    backgroundColor: "#f0f0f0",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  defaultImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  defaultImage: {
    width: AVATAR_SIZE * 0.8,
    height: AVATAR_SIZE * 0.8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D3D3D3",
  },
  progressDotActive: {
    backgroundColor: "#EC4D4A",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#D3D3D3",
    marginHorizontal: 8,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepImage: {
    width: 120,
    height: 90,
    borderRadius: 12,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: height * 0.02,
    paddingHorizontal: 4,
  },
  genderOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 25,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  genderOptionSelected: {
    backgroundColor: "#EC4D4A",
    borderColor: "#EC4D4A",
  },
  genderText: {
    fontSize: width > 400 ? 16 : 14,
    color: "#444",
    fontWeight: "500",
  },
  genderTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  referralPromptContainer: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
    backgroundColor: "#FFF3F3",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EC4D4A",
    borderStyle: "dashed",
  },
  referralPromptContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  referralPromptText: {
    fontSize: width > 400 ? 15 : 13,
    color: "#EC4D4A",
    fontWeight: "600",
  },
  referralInputContainer: {
    marginBottom: height * 0.02,
  },
  referralInputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  referralInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 25,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.02,
    paddingRight: 50,
    fontSize: width > 400 ? 16 : 14,
    color: "#444",
    fontWeight: "500",
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  referralInputValid: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8F4",
  },
  referralInputInvalid: {
    borderColor: "#f44336",
    backgroundColor: "#FFF5F5",
  },
  referralValidationIcon: {
    position: "absolute",
    right: 15,
  },
  referralBenefitBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  referralBenefitText: {
    flex: 1,
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "500",
  },
  referralErrorText: {
    fontSize: 12,
    color: "#f44336",
    marginTop: 6,
    marginLeft: width * 0.06,
    fontWeight: "500",
  },
  cityDropdownContainer: {
    position: "relative",
    marginBottom: height * 0.02,
    zIndex: 1000,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 25,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.02,
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  citySelectorText: {
    fontSize: width > 400 ? 16 : 14,
    color: "#444",
    fontWeight: "500",
    flex: 1,
  },
  placeholder: {
    color: "#999",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#444",
    marginLeft: 10,
    transform: [{ rotate: "0deg" }],
  },
  dropdownIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  cityDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 15,
    marginTop: 5,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1001,
  },
  cityOption: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  cityOptionText: {
    fontSize: width > 400 ? 16 : 14,
    color: "#444",
    fontWeight: "500",
  },
  input: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 25,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.02,
    marginBottom: height * 0.02,
    fontSize: width > 400 ? 16 : 14,
    color: "#444",
    fontWeight: "500",
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#888",
    borderColor: "#ccc",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.03,
  },
  switchLabel: {
    marginLeft: width * 0.02,
    fontSize: width > 400 ? 14 : 13,
    color: "#444",
  },
  button: {
    backgroundColor: "#EC4D4A",
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#EC4D4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: width > 400 ? 16 : 15,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
