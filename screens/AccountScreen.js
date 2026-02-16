import React, { useState, useContext } from "react";
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
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";
import { updateProfile, getUserProfile } from "../utils/AuthApi";
import { API_URL } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import KeyboardAwareWrapper from "../components/KeyboardAwareWrapper";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Fixed sizes for consistent display
const AVATAR_SIZE = Math.min(width * 0.3, 150); // Maximum 150 width
const AVATAR_RADIUS = AVATAR_SIZE / 2;

const AccountScreen = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState("");
  const [cloudinaryUrl, setCloudinaryUrl] = useState(""); // Store Cloudinary URL
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [usageType, setUsageType] = useState("");
  const [whatsappUpdates, setWhatsappUpdates] = useState(false);
  const [gender, setGender] = useState("male"); // Default to male
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); // Track image upload
  const [dataLoading, setDataLoading] = useState(true); // New loading state for data fetching

  const route = useRoute();
  const [PhoneNumber, setPhoneNumber] = useState(route.params?.number || "");

  // Load user data from AsyncStorage on mount
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem("userData");
        const storedPhone = await AsyncStorage.getItem("userPhone");
        const whatsappPref = await AsyncStorage.getItem("whatsappUpdates");

        console.log("AccountScreen - Loading user data...");
        console.log("AccountScreen - UserData from storage:", userDataStr);
        console.log("AccountScreen - Phone from storage:", storedPhone);

        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          console.log("AccountScreen - Loaded user data:", user);
          setFirstName(user.name || user.firstName || "");
          setLastName(user.lname || user.lastName || "");
          setEmail(user.email || "");
          setGender(user.gender || "male");
          setImage(user.profilePhoto || "");

          // Also load phone from user data if available
          if (user.phone && !PhoneNumber) {
            setPhoneNumber(user.phone);
          }
        } else {
          // If no userData found locally, try to fetch from server
          console.log("AccountScreen - No userData found locally, trying to fetch from server...");
          try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
              console.log("AccountScreen - Token found, fetching user profile...");
              const profileResponse = await getUserProfile(token);
              
              if (profileResponse.data) {
                const user = profileResponse.data;
                console.log("AccountScreen - Profile fetched from server:", user);
                
                // Store the fetched data for future use
                await AsyncStorage.setItem("userData", JSON.stringify(user));
                
                // Update state
                setFirstName(user.name || user.firstName || "");
                setLastName(user.lname || user.lastName || "");
                setEmail(user.email || "");
                setGender(user.gender || "male");
                setImage(user.profilePhoto || "");
                setCloudinaryUrl(user.profilePhoto || ""); // Set existing Cloudinary URL
                
                if (user.phone && !PhoneNumber) {
                  setPhoneNumber(user.phone);
                }
              }
            } else {
              console.log("AccountScreen - No token found, cannot fetch profile");
            }
          } catch (fetchError) {
            console.error("AccountScreen - Failed to fetch user profile:", fetchError);
            // Continue with stored phone if available
          }
        }

        // Set phone number from storage if not passed via params and not set from user data
        if (!PhoneNumber && storedPhone) {
          setPhoneNumber(storedPhone);
          console.log("AccountScreen - Loaded phone:", storedPhone);
        }

        if (whatsappPref !== null) {
          setWhatsappUpdates(whatsappPref === "true");
        }
      } catch (e) {
        console.error("AccountScreen - Error loading user data:", e);
      }
    };
    loadUserData();
  }, []);

  // Upload image to Cloudinary via Backend
  const uploadImageToCloudinary = async (imageUri, phoneNumber) => {
    setUploadingImage(true);
    try {
      console.log("📤 Uploading profile photo to Cloudinary:", { 
        imageUri: imageUri.substring(0, 50) + '...', 
        phoneNumber 
      });

      const formData = new FormData();
      
      // Get file extension
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      
      formData.append('image', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: `profile_${phoneNumber}_${Date.now()}.${fileType}`,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`
      });
      formData.append('phone', phoneNumber);
      formData.append('documentType', 'profilePhoto');

      const uploadResponse = await fetch(
        `${API_URL}/riders/upload-rider-document`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const uploadData = await uploadResponse.json();
      console.log("📦 Upload response:", uploadData);

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || `Upload failed: ${uploadResponse.status}`);
      }

      const cloudinaryUrl = uploadData.data?.imagePath || 
                           uploadData.imagePath || 
                           uploadData.url;

      if (uploadData.success !== false && cloudinaryUrl) {
        console.log("✅ Upload successful, Cloudinary URL:", cloudinaryUrl);
        setUploadingImage(false);
        return cloudinaryUrl;
      } else {
        throw new Error(uploadData.message || 'Upload failed - no URL returned');
      }
    } catch (error) {
      console.error("❌ Cloudinary upload error:", error);
      setUploadingImage(false);
      throw error;
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImage(selectedUri);
      
      // Upload to Cloudinary immediately
      try {
        if (!PhoneNumber) {
          Alert.alert("Error", "Phone number is required to upload photo");
          return;
        }
        
        const uploadedUrl = await uploadImageToCloudinary(selectedUri, PhoneNumber);
        setCloudinaryUrl(uploadedUrl);
        Alert.alert("Success", "Profile photo uploaded successfully!");
      } catch (error) {
        console.error("Image upload failed:", error);
        Alert.alert(
          "Upload Failed",
          "Failed to upload image. You can try again or continue without changing the photo."
        );
        // Reset image on failure
        setImage("");
      }
    }
  };

  // const handleSubmit = () => {
  //   // if (!firstName || !lastName || !usageType) {
  //   //   Alert.alert('Error', 'First Name, Last Name and Usage Type are required.');
  //   //   return;
  //   // }

  //   // const formData = {
  //   //   image,
  //   //   firstName,
  //   //   lastName,
  //   //   email,
  //   //   mobileNumber,
  //   //   address,
  //   //   usageType,
  //   //   whatsappUpdates,
  //   //   gender,
  //   // };

  //   // console.log('Profile Submitted:', formData);
  //   // Alert.alert('Success', 'Profile saved successfully!');
  //   navigation.replace('Home');

  // };

  // Email validation helper
  const isValidEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim() || !gender) {
      Alert.alert("Error", "First Name, Last Name, and Gender are required.");
      return;
    }

    if (!PhoneNumber) {
      Alert.alert("Error", "Phone number is required.");
      return;
    }

    // Check if image is being uploaded
    if (uploadingImage) {
      Alert.alert("Please wait", "Profile photo is still uploading. Please wait a moment.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", firstName.trim());
      formData.append("lname", lastName.trim());
      // Only include email if user actually entered something
      if (email && email.trim()) {
        formData.append("email", email.trim());
      }
      formData.append("gender", gender);
      formData.append("phone", PhoneNumber);
      formData.append("role", "customer");
      // Note: whatsappUpdates is stored locally for future use

      // Send Cloudinary URL instead of file
      if (cloudinaryUrl) {
        formData.append("profilePhoto", cloudinaryUrl);
        console.log("📸 Sending Cloudinary URL:", cloudinaryUrl);
      }

      const res = await updateProfile(formData);

      console.log("Profile update response:", res.data);
      if (res.data) {
        // Use multiSet for atomic write operation
        const dataToSave = [];
        
        if (res.data.token) {
          dataToSave.push(["token", res.data.token]);
        }

        if (res.data.user) {
          dataToSave.push(["userData", JSON.stringify(res.data.user)]);
          // Store userId separately for backward compatibility
          const userId = res.data.user._id || res.data.user.customerId || "";
          dataToSave.push(["userId", userId]);
        }

        dataToSave.push(["userPhone", PhoneNumber]);
        dataToSave.push(["whatsappUpdates", whatsappUpdates.toString()]);

        await AsyncStorage.multiSet(dataToSave);
        console.log("✅ Profile data saved atomically");

        // Navigate directly without alert
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Error", "No response data received from server.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update profile. Please check your internet connection and try again.";
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
    <View style={styles.container}>
      <HeaderWithBackButton title="My Profile" />
      <KeyboardAwareWrapper 
        enableScrollView={true}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enableOnAndroid={true}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>

          <View style={styles.imagePickerWrapper}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.defaultImageContainer}>
                  <Image
                    source={getDefaultAvatar()}
                    style={styles.defaultImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </TouchableOpacity>
            
            {/* Pencil Edit Button */}
            <TouchableOpacity 
              onPress={pickImage} 
              style={styles.editButton}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="pencil" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Gender Selection */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "male" && styles.genderButtonSelected,
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
                styles.genderButton,
                gender === "female" && styles.genderButtonSelected,
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

          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
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

          <TextInput
            placeholder="Email (optional)"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#999"
          />

          {/* <View style={styles.switchContainer}>
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
                <Text style={styles.buttonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAwareWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: height * 0.05,
    paddingTop: 0, // Removed extra top padding since HeaderWithBackButton handles spacing
  },
  card: {
    marginHorizontal: width * 0.05,
    backgroundColor: "#fff",
    padding: width * 0.06,
    paddingTop: width * 0.06,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width > 400 ? 24 : 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  imagePickerWrapper: {
    position: "relative",
    alignSelf: "center",
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: "#f0f0f0",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#EC4D4A",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  genderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  genderButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 10,
  },
  genderButtonSelected: {
    backgroundColor: "#EC4D4A",
    borderColor: "#EC4D4A",
  },
  genderText: {
    fontSize: 16,
    color: "#444",
  },
  genderTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 0.5,
    borderColor: "#000",
    borderRadius: 10,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    marginBottom: height * 0.02,
    fontSize: width > 400 ? 16 : 14,
    color: "#444",
    fontWeight: "500",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#888",
    borderColor: "#ccc",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: height * 0.02,
    overflow: "hidden",
  },
  picker: {
    height: height * 0.06,
    width: "100%",
    color: "#444",
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

export default AccountScreen;
