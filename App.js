import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from 'react';
import BottomTabs from './navigation/BottomTabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, Text, AppState } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome, FontAwesome5, AntDesign, Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import pushNotificationManager from './utils/PushNotificationManager';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...AntDesign.font,
    ...Feather.font,
  });
  
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  // Add timeout mechanism to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!fontsLoaded && !fontError) {
        console.warn('Font loading timeout - proceeding without custom fonts');
        setShowTimeoutMessage(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [fontsLoaded, fontError]);

  // Handle AppState changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[App] 📱 App has come to the foreground!');
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('[App] 📵 App has gone to the background!');
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('[App] AppState:', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Set up push notification listeners
  useEffect(() => {
    // Handler for notifications received while app is foregrounded
    const handleNotificationReceived = (notification) => {
      console.log('[App] 📥 Notification received in foreground:', notification);
      
      // Extract booking data from notification
      const data = notification.request.content.data;
      if (data.bookingId) {
        console.log('[App] 🚀 Order notification received:', data.type);
        // You can show in-app alert or update UI here
      }
    };

    // Handler for user tapping on notification
    const handleNotificationTapped = (response) => {
      console.log('[App] 👆 Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      
      if (data.bookingId) {
        console.log('[App] 🎯 Opening booking details:', data.bookingId);
        // TODO: Navigate to order details screen
        // navigationRef.current?.navigate('OrderDetails', { bookingId: data.bookingId });
      }
    };

    pushNotificationManager.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );

    return () => {
      pushNotificationManager.removeNotificationListeners();
    };
  }, []);

  // If fonts failed to load or timeout occurred, continue with app
  if (fontError || showTimeoutMessage) {
    console.warn('Font loading issue, proceeding with default fonts:', fontError);
    return (
      <SafeAreaProvider>
        <BottomTabs/>
      </SafeAreaProvider>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#EC4D4A" />
        <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <BottomTabs/>
    </SafeAreaProvider>
  );
}
