import axios from "axios";
import { API_URL } from "./api";

export const sendOtp = async (phoneNumber) => {
  console.log(phoneNumber, "get the ");

  try {
    console.log("Attempting to connect to:", `${API_URL}/send-otp`);
    const response = await axios.post(
      `${API_URL}/send-otp`,
      { number: phoneNumber },
      {
        timeout: 15000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("OTP API call successful:", response.status);
    return response;
  } catch (error) {
    console.error("OTP API call failed:", error.message);
    throw error;
  }
};

export const verifyOtp = async (number, otp) => {
  return axios.post(`${API_URL}/verify-otp`, { number, otp });
};

export const updateProfile = async (formData) => {
  console.log(formData);
  return axios.post(`${API_URL}/add`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Validate referral code
export const validateReferralCode = async (referralCode) => {
  try {
    console.log("🔍 Validating referral code:", referralCode);
    const response = await axios.post(
      `${API_URL}/validate-referral-code`,
      { referralCode },
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Referral code validation response:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Referral code validation failed:", error.message);
    throw error;
  }
};

// Helper function to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const saveDropLocation = async (dropLocationData, token) => {
  console.log("API URL:", `${API_URL}/drop-location`);
  console.log("Sending data:", dropLocationData);
  console.log(
    "Token:",
    token ? `Bearer ${token.substring(0, 20)}...` : "No token"
  );

  // Check if token is expired
  if (isTokenExpired(token)) {
    // Do not remove token or force logout, just show error when user tries to use a feature
    throw new Error(
      "Your session has expired. Please login again to continue."
    );
  }

  return axios.post(`${API_URL}/drop-location`, dropLocationData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    timeout: 10000, // 10 second timeout
  });
};

// Create booking without auth
export const createBooking = async (bookingData) => {
  console.log("Creating booking with API URL:", `${API_URL}/create`);
  console.log("Booking data:", bookingData);

  try {
    const response = await axios.post(`${API_URL}/create`, bookingData, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000, // 15 second timeout
    });

    console.log("Booking created successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Booking creation failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Customer Wallet API Functions
 * 
 * These functions handle wallet operations for CUSTOMERS.
 * For RIDER wallet operations, see Ridodrop-Partner-App/utils/WalletApi.js
 * 
 * Endpoints:
 * - GET  /api/v1/wallet/balance       - Get customer wallet balance
 * - POST /api/v1/wallet/add           - Add money to customer wallet
 * - GET  /api/v1/wallet/transactions  - Get customer transaction history
 */
export const getWalletBalance = async (token) => {
  if (isTokenExpired(token)) {
    throw new Error(
      "Your session has expired. Please login again to continue."
    );
  }

  return axios.get(`${API_URL}/wallet/balance`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addMoneyToWallet = async (amount, token) => {
  if (isTokenExpired(token)) {
    throw new Error(
      "Your session has expired. Please login again to continue."
    );
  }

  return axios.post(
    `${API_URL}/wallet/add`,
    { amount },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getWalletTransactions = async (token) => {
  if (isTokenExpired(token)) {
    throw new Error(
      "Your session has expired. Please login again to continue."
    );
  }

  return axios.get(`${API_URL}/wallet/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get user profile
export const getUserProfile = async (token) => {
  if (isTokenExpired(token)) {
    throw new Error(
      "Your session has expired. Please login again to continue."
    );
  }

  return axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get user bookings/orders
export const getUserBookings = async (userId, token) => {
  console.log("📡 getUserBookings called with:", { userId, hasToken: !!token });

  if (isTokenExpired(token)) {
    throw new Error(
      "Your session has expired. Please login again to continue."
    );
  }

  try {
    console.log("📡 Making request to:", `${API_URL}/order-history`);
    console.log("📡 Request params:", { userId });
    
    const response = await axios.get(`${API_URL}/order-history`, {
      params: { userId },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Bookings fetched successfully:", {
      status: response.status,
      count: response.data?.bookings?.length || 0,
    });

    return response;
  } catch (error) {
    console.error("❌ Error fetching user bookings:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    throw error;
  }
};

// Get fee breakdown calculation
export const getFeeBreakdown = async (amount, vehicleType) => {
  console.log("📊 getFeeBreakdown called with:", { amount, vehicleType });

  try {
    const response = await axios.post(`${API_URL}/settings/calculate-fees`, {
      amount: amount,
      vehicleType: vehicleType
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000
    });

    console.log("✅ Fee breakdown calculated:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error calculating fee breakdown:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get current platform settings
export const getPlatformSettings = async () => {
  console.log("⚙️ getPlatformSettings called");

  try {
    const response = await axios.get(`${API_URL}/settings`, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000
    });

    console.log("✅ Platform settings fetched:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error fetching platform settings:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get referral statistics for customer
export const getReferralStats = async (userId, token) => {
  console.log("🎁 getReferralStats called with userId:", userId);

  if (isTokenExpired(token)) {
    throw new Error(
      "Your session has expired. Please login again to continue."
    );
  }

  try {
    const response = await axios.get(`${API_URL}/referrals/stats/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000
    });

    console.log("✅ Referral stats fetched:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error fetching referral stats:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

/**
 * Dynamic Pricing API Functions
 * 
 * Calculate real-time pricing with 8 dynamic factors:
 * - Base fare, Distance, Traffic, Weather, Surge, Load, Waiting, Pickup Complexity
 */

// Calculate dynamic price for a trip
export const calculateDynamicPrice = async (priceData) => {
  try {
    console.log('🔵 Calling dynamic pricing API:', `${API_URL}/dynamic-pricing/calculate-price`);
    console.log('🔵 Request data:', JSON.stringify(priceData, null, 2));
    
    const response = await axios.post(
      `${API_URL}/dynamic-pricing/calculate-price`,
      priceData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ Dynamic pricing response:', response.status);
    return response;
  } catch (error) {
    console.error('❌ Dynamic pricing failed - Full error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      }
    });
    throw error;
  }
};

// Get vehicle pricing configuration
export const getVehiclePricing = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/dynamic-pricing/vehicle-pricing`,
      {
        timeout: 10000,
      }
    );
    return response;
  } catch (error) {
    console.error(
      "Failed to get vehicle pricing:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get pricing factors
export const getPricingFactors = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/dynamic-pricing/pricing-factors`,
      {
        timeout: 10000,
      }
    );
    return response;
  } catch (error) {
    console.error(
      "Failed to get pricing factors:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ============= SAVED ADDRESSES API FUNCTIONS =============

export const getSavedAddresses = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/saved-addresses/user/${userId}`
    );
    return response;
  } catch (error) {
    console.error('Failed to fetch saved addresses:', error.response?.data || error.message);
    throw error;
  }
};

export const getDefaultAddress = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/saved-addresses/user/${userId}/default`
    );
    return response;
  } catch (error) {
    console.error('Failed to fetch default address:', error.response?.data || error.message);
    throw error;
  }
};

export const createSavedAddress = async (addressData) => {
  try {
    const response = await axios.post(
      `${API_URL}/saved-addresses/create`,
      addressData
    );
    return response;
  } catch (error) {
    console.error('Failed to create saved address:', error.response?.data || error.message);
    throw error;
  }
};

export const quickSaveAddress = async (addressData) => {
  try {
    const response = await axios.post(
      `${API_URL}/saved-addresses/quick-save`,
      addressData
    );
    return response;
  } catch (error) {
    console.error('Failed to quick save address:', error.response?.data || error.message);
    throw error;
  }
};

export const updateSavedAddress = async (addressId, addressData) => {
  try {
    const response = await axios.put(
      `${API_URL}/saved-addresses/${addressId}`,
      addressData
    );
    return response;
  } catch (error) {
    console.error('Failed to update saved address:', error.response?.data || error.message);
    throw error;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/saved-addresses/${addressId}/set-default`
    );
    return response;
  } catch (error) {
    console.error('Failed to set default address:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteSavedAddress = async (addressId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/saved-addresses/${addressId}`
    );
    return response;
  } catch (error) {
    console.error('Failed to delete saved address:', error.response?.data || error.message);
    throw error;
  }
};
