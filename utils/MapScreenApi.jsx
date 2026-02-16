import * as Location from "expo-location";

export const getCurrentLocation = async () => {
  // Request permissions
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission to access location was denied");
  }

  // Get current position
  let location = await Location.getCurrentPositionAsync({});
  return location;
};
