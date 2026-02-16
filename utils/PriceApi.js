import axios from "axios";
import { API_URL } from "./api";

// Get all vehicles with images
export const getAllVehicles = async (vehicleType = null) => {
  try {
    const params = {};
    if (vehicleType) params.vehicleType = vehicleType;
    params.isActive = true; // Only get active vehicles

    console.log("Fetching vehicles with params:", params);

    const response = await axios.get(`${API_URL}/vehicles/all`, { 
      params,
      timeout: 8000 // 8 second timeout
    });
    console.log("Vehicles API response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Get vehicles error:", error.response?.data || error.message);
    throw error;
  }
};

// Get vehicles by type
export const getVehiclesByType = async (vehicleType) => {
  try {
    console.log("Fetching vehicles by type:", vehicleType);

    const response = await axios.get(`${API_URL}/vehicles/type/${vehicleType}`, {
      timeout: 8000 // 8 second timeout
    });
    console.log("Vehicles by type API response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Get vehicles by type error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get all prices with filters
export const getAllPrices = async (vehicleType = null, subType = null) => {
  try {
    const params = {};
    if (vehicleType) params.vehicleType = vehicleType;
    if (subType) params.subType = subType;

    console.log("Fetching prices with params:", params);

    const response = await axios.get(`${API_URL}/prices/all`, { 
      params,
      timeout: 8000 // 8 second timeout
    });
    console.log("Prices API response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Get prices error:", error.response?.data || error.message);
    throw error;
  }
};

// Get price by specific criteria
export const getPriceByVehicle = async (
  vehicleType,
  subType,
  kmRange,
  timeSlot
) => {
  try {
    const response = await axios.get(`${API_URL}/prices/all`, {
      params: {
        vehicleType,
        subType,
      },
      timeout: 8000 // 8 second timeout
    });

    // Filter by kmRange and timeSlot from the returned data
    if (response.data && response.data.prices) {
      const matchingPrice = response.data.prices.find(
        (price) => price.kmRange === kmRange && price.timeSlot === timeSlot
      );
      return matchingPrice;
    }

    return null;
  } catch (error) {
    console.error(
      "Get price by vehicle error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Calculate price based on distance and vehicle
export const calculatePrice = async (
  vehicleType,
  subType,
  distance,
  timeSlot = "9 AM - 12 PM"
) => {
  try {
    // Fetch all prices for this vehicle type
    const response = await getAllPrices(vehicleType, subType);

    if (!response || !response.prices || response.prices.length === 0) {
      throw new Error("No pricing data available for this vehicle");
    }

    // Find appropriate price based on distance
    // Distance is in km, find the right km range
    let applicablePrice = null;

    for (const price of response.prices) {
      if (price.timeSlot === timeSlot || !timeSlot) {
        // Parse km range (e.g., "0-5", "5-10", "10-15", "15+")
        const range = price.kmRange;

        if (range.includes("+")) {
          // "15+" means 15 km and above
          const minKm = parseInt(range.replace("+", ""));
          if (distance >= minKm) {
            applicablePrice = price;
          }
        } else if (range.includes("-")) {
          // "0-5" means 0 to 5 km
          const [minKm, maxKm] = range.split("-").map((num) => parseInt(num));
          if (distance >= minKm && distance < maxKm) {
            applicablePrice = price;
            break; // Found exact match
          }
        }
      }
    }

    if (applicablePrice) {
      return {
        rate: applicablePrice.rate,
        kmRange: applicablePrice.kmRange,
        timeSlot: applicablePrice.timeSlot,
        totalPrice: applicablePrice.rate,
      };
    }

    // If no match found, return the highest range price
    const sortedPrices = response.prices.sort((a, b) => b.rate - a.rate);
    return {
      rate: sortedPrices[0]?.rate || 0,
      kmRange: sortedPrices[0]?.kmRange || "N/A",
      timeSlot: sortedPrices[0]?.timeSlot || timeSlot,
      totalPrice: sortedPrices[0]?.rate || 0,
    };
  } catch (error) {
    console.error("Calculate price error:", error);
    throw error;
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};

// Get current time slot
export const getCurrentTimeSlot = () => {
  const hour = new Date().getHours();

  if (hour >= 9 && hour < 12) return "9 AM - 12 PM";
  if (hour >= 12 && hour < 16) return "12 PM - 4 PM";
  if (hour >= 16 && hour < 20) return "4 PM - 8 PM";
  if (hour >= 20 || hour < 0) return "8 PM - 12 AM";
  if (hour >= 0 && hour < 9) return "12 AM - 9 AM";

  return "9 AM - 12 PM"; // Default
};

export default {
  getAllVehicles,
  getVehiclesByType,
  getAllPrices,
  getPriceByVehicle,
  calculatePrice,
  calculateDistance,
  getCurrentTimeSlot,
};
