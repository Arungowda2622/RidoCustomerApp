import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile } from "../utils/AuthApi";

export default function CustomDrawerContent(props) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Add focus listener to refresh data when drawer is opened
  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchUserData();
    });

    return unsubscribe;
  }, [props.navigation]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      
      if (token) {
        try {
          const response = await getUserProfile(token);
          setUserData(response.data);
          console.log('User data loaded from API:', response.data);
        } catch (apiError) {
          console.log('API call failed, trying to get data from local storage:', apiError.message);
          // Fallback to local storage if API fails
          const localUserData = await AsyncStorage.getItem("userData");
          if (localUserData) {
            const parsedData = JSON.parse(localUserData);
            setUserData(parsedData);
            console.log('User data loaded from local storage:', parsedData);
          }
        }
      } else {
        console.log('No token found, checking local storage for user data');
        // If no token, try to get user data from local storage
        const localUserData = await AsyncStorage.getItem("userData");
        if (localUserData) {
          const parsedData = JSON.parse(localUserData);
          setUserData(parsedData);
          console.log('User data loaded from local storage (no token):', parsedData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If error, we'll show fallback text
    } finally {
      setLoading(false);
    }
  };

  // Get display name from user data or fallback
  const getDisplayName = () => {
    if (loading) return "Loading...";
    if (userData?.name) {
      return userData.lname ? `${userData.name} ${userData.lname}` : userData.name;
    }
    return "Guest User";
  };

  // Hide Home and Profile from sidebar
  const filteredRoutes = props.state.routes.filter(
    (route) => route.name !== "Home" && route.name !== "Profile"
  );

  console.log(filteredRoutes, "dee");

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Header Section */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => props.navigation.navigate("Profile")}
      >
        <Text style={styles.welcome}>Welcome</Text>
        <View style={styles.userRow}>
          <Text style={styles.name}>{getDisplayName()}</Text>
          <Ionicons name="chevron-forward" size={24} color="#2d2d2d" />
        </View>
      </TouchableOpacity>

      {/* Drawer Items as Cards */}
      <View style={styles.cardContainer}>
        {filteredRoutes.map((route, index) => {
          const focused = index === props.state.index;
          const { name, key } = route;
          const options = props.descriptors[key].options;
          const label = options.drawerLabel ?? name;
          const Icon = options.drawerIcon;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.cardItem, focused && styles.cardItemFocused]}
              onPress={() => props.navigation.navigate(name)}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconLabelRow}>
                  {Icon && Icon({ color: "#000", size: 22 })}
                  <Text style={styles.label}>{label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#2d2d2d" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f8f8f8",
  },
  welcome: {
    fontSize: 16,
    color: "#666",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d2d2d",
  },
  cardContainer: {
    padding: 16,
    gap: 12,
  },
  cardItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  // cardItemFocused: {
  //   backgroundColor: '#e6f0ff',
  // },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    color: "#000",
    letterSpacing: 0.3,
  },
});
