import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ActivityIndicator, Image } from "react-native";


// Screens
import HomeScreen from "../screens/HomeScreen";
import CoinsScreen from "../screens/WalletScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import AccountScreen from "../screens/AccountScreen";
import TruckServiceScreen from "../screens/TruckServiceScreen";
import LocationSelectorScreen from "../screens/LocationSelectorScreen";
import LanguageSelectorScreen from "../screens/LanguageSelectorScreen";
import MobileNumberScreen from "../screens/MobileNumberScreen";
import OtpScreen from "../screens/OtpScreen";
import DropoffSearchScreen from "../screens/DropoffSearchScreen";
import SelectVehicleScreen from "../screens/SelectVehicleScreen";
import ReferAndEarnScreen from "../screens/ReferAndEarnScreen";
import HelpAndSupportScreen from "../screens/HelpAndSupportScreen";
import TermsAndConditionsScreen from "../screens/TermsAndConditionsScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
// import ChooseLanguageSidebarScreen from '../screens/ChooseLanguageSidebarScreen';
import LogoutScreen from "../screens/LogoutScreen";
// import ChooseLanguageSidebar from '../screens/ChooseLanguageSidebar';
import ReviewBookingScreen from "../screens/ReviewBookingScreen";
import BillingPayment from "../screens/BillingPayment";
// import ChooseLanguageSidebarScreen from '../screens/LanguageSidebar';
import LanguageSidebar from "../screens/LanguageSidebar";
import OnlinePaymentScreen from "../screens/OnlinePaymentScreen";

import RegisterScreen from "../screens/RegisterScreen";
// import CustomDrawerContent from './Customdrawercontent';
import WalletScreen from "../screens/WalletScreen";
import CustomDrawercontent from "./CustomDrawercontent";
import GoodsTypeScreen from "../screens/GoodsTypeScreen";
import BookingSearchingScreen from "../screens/BookingSearchingScreen";
import BookingConfirmScreen from "../screens/BookingConfirmScreen";
import DropLocationScreen from "../screens/DropLocationScreen";
import BookingDetailsScreen from "../screens/BookingDetailsScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ImageGalleryScreen from "../screens/ImageGalleryScreen";
import CancelReasonScreen from "../screens/CancelReasonScreen";
import SubmitReviewScreen from "../screens/SubmitReviewScreen";
import MapPickerScreen from "../screens/MapPickerScreen";
import DeliveryPhotosScreen from "../screens/DeliveryPhotosScreen";
import RaiseTicketScreen from "../screens/RaiseTicketScreen";
import MyTicketsScreen from "../screens/MyTicketsScreen";
import TicketDetailsScreen from "../screens/TicketDetailsScreen";
import InvoiceScreen from "../screens/InvoiceScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// 🟢 Bottom Tabs (inside Drawer)
const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const iconNames = {
          Home: "home",
          "my-booking": "calendar",
          Wallet: "wallet",
          Profile: "person",
        };
        return (
          <Ionicons 
            name={iconNames[route.name]} 
            size={size} 
            color={color} 
          />
        );
      },
      headerShown: false,
      tabBarActiveTintColor: "#EC4D4A",
      tabBarInactiveTintColor: "gray",
      tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen
      name="my-booking"
      component={OrdersScreen}
      options={{ tabBarLabel: "My Booking" }}
    />
    {/* <Tab.Screen name="Coins" component={CoinsScreen} /> */}
    <Tab.Screen name="Wallet" component={WalletScreen} />
    {/* <Tab.Screen name="SelectVehicle" component={SelectVehicleScreen} /> */}
    {/* <Tab.Screen name="Profile" component={AccountScreen} /> */}
    <Tab.Screen name="Profile" component={AccountScreen} />
  </Tab.Navigator>
);

// 🟢 Drawer Navigator wrapping Bottom Tabs
const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{ 
      headerShown: false,
      drawerLabelStyle: { 
        fontSize: 17, 
        fontWeight: '700',
        marginLeft: -16,
        letterSpacing: 0.3,
      },
      drawerItemStyle: {
        borderRadius: 8,
        marginVertical: 2,
        paddingVertical: 4,
      },
      drawerActiveTintColor: '#EC4D4A',
      drawerInactiveTintColor: '#2c2c2c',
    }}
    drawerContent={(props) => <CustomDrawercontent {...props} />}
  >
    <Drawer.Screen
      name="MainTabs"
      component={Tabs}
      options={{
        drawerIcon: ({ size }) => (
          <Image
            source={require("../assets/CS Home .png")} 
            style={{ width: size * 1.6, height: size * 1.6 }}
            resizeMode="contain"
          />
        ),
        drawerLabel: "Home",
      }}
    />
    <Drawer.Screen
      name="Profile"
      component={AccountScreen}
      options={{
        drawerItemStyle: { height: 0 },
        drawerIcon: () => null,
      }}
    />
    <Drawer.Screen
      name="Order"
      component={OrdersScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Image
            source={require("../assets/CS Orders.png")} 
            style={{ width: size * 1.6, height: size * 1.6 }}
            resizeMode="contain"
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Wallet"
      component={WalletScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Image
            source={require("../assets/CS Wallet.png")} 
            style={{ width: size * 1.6, height: size * 1.6 }}
            resizeMode="contain"
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Refer & Earn"
      component={ReferAndEarnScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Image
            source={require("../assets/CS Refer and earn.png")} 
            style={{ width: size * 1.6, height: size * 1.6 }}
            resizeMode="contain"
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Help & Support"
      component={HelpAndSupportScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Image
            source={require("../assets/CS Help and support.png")} 
            style={{ width: size * 1.6, height: size * 1.6 }}
            resizeMode="contain"
          />
        ),
      }}
    />

    {/* <Drawer.Screen
      name="booking"
      component={DropLocationScreen}
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={size}
            color={color}
          />
        ),
      }}
    /> */}

    <Drawer.Screen
      name="Change Language"
      component={LanguageSidebar}
      options={{
        drawerIcon: ({ size }) => (
          <Image
            source={require("../assets/CS Change language.png")} 
            style={{ width: size * 1.6, height: size * 1.6 }}
            resizeMode="contain"
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Terms & Conditions"
      component={TermsAndConditionsScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Image
            source={require("../assets/CS Termsandconditions.png")} 
            style={{ width: size * 1.6, height: size * 1.6 }}
            resizeMode="contain"
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Logout"
      component={LogoutScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Image
            source={require("../assets/CS logout.png")} 
            style={{ width: size * 1.6, height: size * 1.6 }}
            resizeMode="contain"
          />
        ),
      }}
    />
  </Drawer.Navigator>
);

// 🟢 Root Navigation (Authentication + App)
const BottomTabs = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication token on app startup
  useEffect(() => {
    checkAuthStatus();
    
    // Add timeout fallback in case AsyncStorage hangs
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth check timeout, proceeding with unauthenticated state');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }, 8000); // 8 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Add timeout to AsyncStorage operations
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 5000)
      );
      
      const tokenPromise = AsyncStorage.getItem("token");
      const userIdPromise = AsyncStorage.getItem("userId");
      
      const [token, userId] = await Promise.race([
        Promise.all([tokenPromise, userIdPromise]),
        timeoutPromise
      ]);
      
      if (token && userId) {
        // Optional: Validate token with backend
        // You can add API call here to verify token is still valid
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#EC4D4A" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Initializing app...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? "MainTabs" : "MobileNumber"}
      >
      {/* Authentication Flow */}
      <Stack.Screen name="LanguageSelectorScreen" component={LanguageSelectorScreen} />
      <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />

      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
      <Stack.Screen
        name="CustomDrawerContent"
        component={CustomDrawercontent}
      />

      <Stack.Screen name="Home" component={HomeScreen} />

      {/* App Flow */}
      <Stack.Screen name="MainTabs" component={DrawerNavigator} />
      <Stack.Screen name="MapPickerScreen" component={MapPickerScreen} />
      {/* Other Screens */}
      <Stack.Screen name="TruckService" component={TruckServiceScreen} />
      <Stack.Screen
        name="LocationSelectorScreen"
        component={LocationSelectorScreen}
      />
      <Stack.Screen name="Drop-off" component={DropLocationScreen} />
      <Stack.Screen name="OnlinePayment" component={OnlinePaymentScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="GoodTypeScreen" component={GoodsTypeScreen} />
      <Stack.Screen name="SelectVehicle" component={SelectVehicleScreen} />
      <Stack.Screen name="BillingPayment" component={BillingPayment} />
      <Stack.Screen name="WaitingDriver" component={BookingSearchingScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailsScreen} />
      <Stack.Screen name="ImageGallery" component={ImageGalleryScreen} />
      <Stack.Screen name="CancelReason" component={CancelReasonScreen} />
      <Stack.Screen name="SubmitReview" component={SubmitReviewScreen} />
      <Stack.Screen name="DeliveryPhotos" component={DeliveryPhotosScreen} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      
      {/* Ticket System Screens */}
      <Stack.Screen name="RaiseTicket" component={RaiseTicketScreen} />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
  );
};

export default BottomTabs;
