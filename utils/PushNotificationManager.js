import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PushNotificationManager {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Register device for push notifications
   * @returns {Promise<string|null>} - Expo push token or null
   */
  async registerForPushNotifications() {
    try {
      console.log('[PushNotification] 📱 Registering for push notifications...');

      // Check if running on physical device (Allow Expo Go for testing)
      if (!Device.isDevice) {
        console.log('[PushNotification] ⚠️ Running on simulator/Expo Go - will still attempt to register');
        // Don't return null - continue with registration for testing
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[PushNotification] ❌ Permission not granted for push notifications');
        Alert.alert(
          'Notifications Required',
          'Please enable notifications to receive order updates when app is in background.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '15a09c02-d98e-4201-abae-43be9e31acaf' // From app.json
      });

      this.expoPushToken = tokenData.data;
      console.log('[PushNotification] ✅ Push token obtained:', this.expoPushToken);

      // Save token to AsyncStorage
      await AsyncStorage.setItem('expoPushToken', this.expoPushToken);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Order Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#EC4D4A',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
        console.log('[PushNotification] 🤖 Android notification channel configured');
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('[PushNotification] ❌ Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Update push token on backend when user logs in
   * @param {string} phoneNumber - Customer's phone number
   * @param {string} baseUrl - API base URL
   * @returns {Promise<boolean>} - Success status
   */
  async updatePushTokenOnBackend(phoneNumber, baseUrl) {
    try {
      if (!this.expoPushToken) {
        console.log('[PushNotification] ⚠️ No push token to update');
        return false;
      }

      console.log('[PushNotification] 📤 Updating push token on backend...');

      const response = await fetch(`${baseUrl}/api/v1/customers/update-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          expoPushToken: this.expoPushToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[PushNotification] ✅ Push token updated on backend');
        return true;
      } else {
        console.log('[PushNotification] ⚠️ Failed to update push token:', data.message);
        return false;
      }
    } catch (error) {
      console.error('[PushNotification] ❌ Error updating push token on backend:', error.message);
      return false;
    }
  }

  /**
   * Set up notification listeners
   * @param {Function} onNotificationReceived - Callback when notification received (foreground)
   * @param {Function} onNotificationTapped - Callback when notification tapped
   */
  setupNotificationListeners(onNotificationReceived, onNotificationTapped) {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[PushNotification] 📥 Notification received (foreground):', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener for user tapping on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[PushNotification] 👆 Notification tapped:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });

    console.log('[PushNotification] 👂 Notification listeners set up');
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
    console.log('[PushNotification] 🔇 Notification listeners removed');
  }

  /**
   * Get current push token
   * @returns {string|null}
   */
  getPushToken() {
    return this.expoPushToken;
  }

  /**
   * Schedule a local notification (for testing)
   * @param {Object} content - Notification content
   */
  async scheduleLocalNotification(content) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title || 'Order Update',
          body: content.body || 'Your order has been updated',
          data: content.data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
      console.log('[PushNotification] 📬 Local notification scheduled');
    } catch (error) {
      console.error('[PushNotification] ❌ Error scheduling local notification:', error);
    }
  }
}

// Export singleton instance
const pushNotificationManager = new PushNotificationManager();
export default pushNotificationManager;
