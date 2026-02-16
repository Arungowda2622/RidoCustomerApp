import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HeaderWithBackButton from "../components/HeaderWithBackButton";

const goodsTypes = [
  { label: "General", icon: "cube-outline" },
  { label: "Electronics", icon: "tv" },
  { label: "Food", icon: "fast-food-outline" },
  { label: "Medical", icon: "medkit-outline" },
  { label: "House Shifting", icon: "home-outline" },
  { label: "Logistics", icon: "bus-outline" },
  { label: "Furniture", icon: "bed-outline" },
  { label: "Fashion", icon: "shirt-outline" },
  { label: "Plywood", icon: "construct-outline" },
  { label: "Paint", icon: "color-palette-outline" },
  { label: "Metal Types", icon: "hammer-outline" },
  { label: "Scrap", icon: "trash-outline" },
  { label: "Stationary", icon: "create-outline" },
  { label: "Printing Material", icon: "print-outline" },
  { label: "Hardware", icon: "build-outline" },
  { label: "Plastic Rubber", icon: "flask-outline" },
];

const numColumns = 2;
const cardWidth = (Dimensions.get("window").width - 48) / 2;

const GoodsTypeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get existing booking data from previous screen (SelectVehicleScreen)
  const existingBookingData = route.params?.bookingData || {};
  
  // Debug: Log what data we received
  console.log("GoodsTypeScreen - Received route params:", route.params);
  console.log("GoodsTypeScreen - Existing booking data:", existingBookingData);
  
  // Initialize selectedItem with previously selected goods type, default to "Furniture"
  const [selectedItem, setSelectedItem] = useState(existingBookingData.selectedGoodsType || "Furniture");

  // Update selectedItem when route params change (when user comes back to change selection)
  useEffect(() => {
    if (existingBookingData.selectedGoodsType) {
      setSelectedItem(existingBookingData.selectedGoodsType);
      console.log("GoodsTypeScreen - Updated selection to:", existingBookingData.selectedGoodsType);
    } else {
      // Set default to "Furniture" if no previous selection
      setSelectedItem("Furniture");
      console.log("GoodsTypeScreen - Set default selection to: Furniture");
    }
  }, [existingBookingData.selectedGoodsType]);

  const handleSelect = (item) => {
    setSelectedItem(item.label);
    
    // Preserve all existing booking data and add selected goods type
    const updatedBookingData = {
      ...existingBookingData, // Preserve selectedVehicle, locations, totalPrice, etc.
      selectedGoodsType: item.label, // Add the selected goods type
    };
    
    console.log("GoodsTypeScreen - Navigating with updated booking data:", updatedBookingData);
    
    setTimeout(() => {
      navigation.navigate("BillingPayment", {
        bookingData: updatedBookingData, // Use the same bookingData structure
      });
    }, 200);
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedItem === item.label;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.85}
      >
        <View style={styles.iconTextWrapper}>
          <Ionicons
            name={item.icon}
            size={20}
            color={isSelected ? "#fff" : "#333"}
            style={styles.itemIcon}
          />
          <Text
            style={[styles.cardText, isSelected && styles.cardTextSelected]}
          >
            {item.label}
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#fff"
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Goods Type" />
      <FlatList
        data={goodsTypes}
        keyExtractor={(item) => item.label}
        renderItem={renderItem}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
  },
  list: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    // paddingVertical: 12,
    borderRadius: 25,

    backgroundColor: "#fff",
    // borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 14,
    // paddingHorizontal: 10,
    margin: 5,
    width: cardWidth,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    elevation: 3,
  },
  cardSelected: {
    backgroundColor: "#EC4D4A",
    borderColor: "#EC4D4A",
    elevation: 6,
  },
  iconTextWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    marginRight: 8,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  cardTextSelected: {
    color: "#fff",
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});

export default GoodsTypeScreen;
