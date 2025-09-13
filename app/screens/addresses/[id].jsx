"use client";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import Text from "../../../components/Text";
import { addShippingAddress, updateShippingAddress } from "../../utils/actions";
import { useAuthenticatedFetch } from "../../utils/authStore";
const COLORS = {
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  primary: "#2c2a6b",
  almostBlack: "#040707",
  white: "#ffffff",
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
  success: "#28a745",
  danger: "#dc3545",
  waveGreen: "#e8f5e8",
  pastel: "#f7aef8",
  lightSkyBlue: "#87CEEB",
  waveColor: "#ffafcc",
};

const WaveComponent = () => {
  return (
    <View style={styles.waveContainer}>
      <Svg height="80" width="100%" viewBox="0 0 400 80" style={styles.wave}>
        <Path
          d="M0,40 C100,10 300,70 400,40 L400,0 L0,0 Z"
          fill={COLORS.waveGreen}
        />
      </Svg>
    </View>
  );
};

// Loading skeleton component
const LoadingSkeleton = () => {
  return (
    <View style={styles.formSection}>
      {/* Name fields skeleton */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonInput} />
        </View>
        <View style={styles.halfField}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonInput} />
        </View>
      </View>

      {/* Phone and Province skeleton */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonInput} />
        </View>
        <View style={styles.halfField}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonInput} />
        </View>
      </View>

      {/* Address lines skeleton */}
      <View style={styles.field}>
        <View style={styles.skeletonLabel} />
        <View style={styles.skeletonInput} />
      </View>
      <View style={styles.field}>
        <View style={styles.skeletonLabel} />
        <View style={styles.skeletonInput} />
      </View>

      {/* City and Postal Code skeleton */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonInput} />
        </View>
        <View style={styles.halfField}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonInput} />
        </View>
      </View>
    </View>
  );
};

export default function App() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    address2: "",
    province: "",
    city: "",
    postalCode: "",
    useCurrentLocation: true,
    addressCategory: "Home",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const router = useRouter();
  const {authenticatedFetch} = useAuthenticatedFetch();


    const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.address1.trim() !== "" &&
      formData.province.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.postalCode.trim() !== ""
    );
  };


  // Get ID from route parameters
  const { id } = useLocalSearchParams();
  const isEditMode = id && id !== "new";
  const pageTitle = isEditMode ? "Edit address" : "Add new address";

  // Fetch address data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchAddressData();
    }
  }, [id]);

  const handleUpdateAddress = async () => {
    const isValid = isFormValid();
    console.log("isValid:", isValid);
    if (!isValid) {
      return;
    }
    const updatedAddress = { ...formData, id: id };
    console.log("updatedAddress:", updatedAddress);
    try {
      setLoading(true);
      await updateShippingAddress(authenticatedFetch, updatedAddress);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update address. Please try again.");
      console.error("Error updating address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    const isValid = isFormValid();
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      await addShippingAddress(authenticatedFetch, formData);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save address. Please try again.");
      console.error("Error saving address:", error);
    } finally {
      setLoading(false);
    }

  };  

  const fetchAddressData = async () => {
    setFetchingAddress(true);
    try {
      // Replace with your actual API endpoint
      const response = await authenticatedFetch(`https://d4bcaa3b5f1b.ngrok-free.app/address/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      const address = data.address;
      
      // Map API response to form data
      setFormData({
        firstName: address.firstName || "",
        lastName: address.lastName || "",
        phone: address.phone || "",
        address1: address.address1 || "",
        address2: address.address2 || "",
        province: address.province || "",
        city: address.city || "",
        postalCode: address.postalCode || "",
        useCurrentLocation: address.isDefault || false,
        addressCategory: address.type === "home" ? "Home" : "Work",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load address data. Please try again.");
      console.error("Error fetching address:", error);
    } finally {
      setFetchingAddress(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const simulateApiCall = async () => {
    setLoading(true);
    try {
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address1: formData.address1,
        address2: formData.address2 || null,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        isDefault: formData.useCurrentLocation,
        type: formData.addressCategory.toLowerCase(),
      };

      let response;
      if (isEditMode) {
        // Update existing address
        response = await fetch(`/api/address/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });
      } else {
        // Create new address
        response = await fetch('/api/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      Alert.alert(
        "Success", 
        `Address ${isEditMode ? 'updated' : 'saved'} successfully!`
      );
      
      // Navigate back or to addresses list
      router.back();
    } catch (error) {
      Alert.alert("Error", `Failed to ${isEditMode ? 'update' : 'save'} address. Please try again.`);
      console.error("Error saving address:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if all required fields are filled

  const handleSubmit = () => {
    if (!isFormValid()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    simulateApiCall();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Wave with centered title and left back button */}
      <View style={styles.headerSection}>
        <WaveComponent />

        {/* Back button - positioned over the wave at left */}
        <TouchableOpacity
          style={styles.backButtonAbsolute}
          onPress={() => {
            router.back();
          }}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.almostBlack} />
        </TouchableOpacity>

        {/* Title - centered over the wave */}
        <Text style={styles.headerTitleAbsolute}>{pageTitle}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {fetchingAddress ? (
          <LoadingSkeleton />
        ) : (
          <View style={styles.formSection}>
            {/* First Name and Last Name Row */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>First Name *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "firstName" && styles.inputContainerFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => updateField("firstName", text)}
                    placeholder="Enter first name"
                    placeholderTextColor={COLORS.mediumGray}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Last Name *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "lastName" && styles.inputContainerFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => updateField("lastName", text)}
                    placeholder="Enter last name"
                    placeholderTextColor={COLORS.mediumGray}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>

            {/* Phone Number and Province Row */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Phone Number *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "phone" && styles.inputContainerFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => updateField("phone", text)}
                    placeholder="Enter phone number"
                    placeholderTextColor={COLORS.mediumGray}
                    keyboardType="phone-pad"
                    
                    
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Province *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "province" && styles.inputContainerFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={formData.province}
                    onChangeText={(text) => updateField("province", text)}
                    placeholder="Select province"
                    placeholderTextColor={COLORS.mediumGray}
                    onFocus={() => setFocusedField("province")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Address Line 1 *</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "address1" && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={formData.address1}
                  onChangeText={(text) => updateField("address1", text)}
                  placeholder="123 Main Street"
                  placeholderTextColor={COLORS.mediumGray}
                  onFocus={() => setFocusedField("address1")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Address Line 2 (Optional)</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "address2" && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={formData.address2}
                  onChangeText={(text) => updateField("address2", text)}
                  placeholder="789 Business Plaza, Floor 15"
                  placeholderTextColor={COLORS.mediumGray}
                  onFocus={() => setFocusedField("address2")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* City and Zip Code Row */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>City *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "city" && styles.inputContainerFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(text) => updateField("city", text)}
                    placeholder="Enter city"
                    placeholderTextColor={COLORS.mediumGray}
                    onFocus={() => setFocusedField("city")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Zip Code *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "postalCode" && styles.inputContainerFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={formData.postalCode}
                    onChangeText={(text) => updateField("postalCode", text)}
                    placeholder="12345"
                    placeholderTextColor={COLORS.mediumGray}
                    keyboardType="numeric"
                    onFocus={() => setFocusedField("postalCode")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>

            {/* Address Category - inline like Current Location */}
            <View style={styles.fieldRow}>
              <Text style={styles.labelSmall}>Address Category</Text>
              <View style={styles.categoryContainerRow}>
                <TouchableOpacity
                  style={[
                    styles.categoryButtonSmall,
                    formData.addressCategory === "Home" &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() => updateField("addressCategory", "Home")}
                >
                  <Text
                    style={[
                      styles.categoryTextSmall,
                      formData.addressCategory === "Home" &&
                        styles.categoryTextActive,
                    ]}
                  >
                    Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButtonSmall,
                    formData.addressCategory === "Work" &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() => updateField("addressCategory", "Work")}
                >
                  <Text
                    style={[
                      styles.categoryTextSmall,
                      formData.addressCategory === "Work" &&
                        styles.categoryTextActive,
                    ]}
                  >
                    Work
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Current Location Yes/No placed inline with label */}
            <View style={styles.fieldRow}>
              <Text style={styles.labelSmall}>Current Location</Text>
              <View style={styles.categoryContainerRow}>
                <TouchableOpacity
                  style={[
                    styles.categoryButtonSmall,
                    formData.useCurrentLocation && styles.categoryButtonActive,
                  ]}
                  onPress={() => updateField("useCurrentLocation", true)}
                >
                  <Text
                    style={[
                      styles.categoryTextSmall,
                      formData.useCurrentLocation && styles.categoryTextActive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButtonSmall,
                    !formData.useCurrentLocation && styles.categoryButtonActive,
                  ]}
                  onPress={() => updateField("useCurrentLocation", false)}
                >
                  <Text
                    style={[
                      styles.categoryTextSmall,
                      !formData.useCurrentLocation && styles.categoryTextActive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
        onPress={() => {
          console.log("isEditMode:", isEditMode);
          if (isEditMode) {
            handleUpdateAddress();
            return;
          } else {
            handleSaveAndContinue();
          }
        }}
          style={[
            styles.submitButton,
            (loading || fetchingAddress || !isFormValid()) && styles.submitButtonDisabled,
          ]}
          disabled={loading || fetchingAddress || !isFormValid()}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Address' : 'Save & Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  headerSection: {
    backgroundColor: COLORS.white,
    // make room for absolute positioned title & back button
    paddingTop: 32,
    marginBottom: 32,
    height: 80,
    justifyContent: "flex-start",
  },
  waveContainer: {
    height: 80,
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
    top: 0,
  },
  backButtonAbsolute: {
    position: "absolute",
    left: 12,
    top: 30,
    padding: 6,
    zIndex: 500,
  },
  headerTitleAbsolute: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Outfit-Medium",
    color: COLORS.almostBlack,
    zIndex: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -24, // pull content up slightly to overlap wave
  },
  formSection: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  field: {
    marginBottom: 14,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  halfField: {
    flex: 0.48,
  },
  zipField: {
    flex: 0.4, // Make zip code field smaller
  },
  label: {
    fontSize: 12,
    fontFamily: "Outfit-Medium",
    color: COLORS.almostBlack,
    marginBottom: 6,
  },
  labelSmall: {
    fontSize: 12,
    fontFamily: "Outfit-Medium",
    color: COLORS.almostBlack,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.almostBlack,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: COLORS.lightSkyBlue,
    borderWidth: 2,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.almostBlack,
  },
  categoryContainerRow: {
    flexDirection: "row",
    gap: 8,
    width: "55%",
    justifyContent: "flex-end",
  },
  categoryEmojiSmall: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 12,
  },
  categoryButtonSmall: {
    flex: 0,
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.darkBlue,
    borderColor: COLORS.darkBlue,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryTextSmall: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: COLORS.mediumGray,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: COLORS.mediumGray,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 34,
  },
  submitButton: {
    backgroundColor: "#2c2a6b",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: "Outfit-SemiBold",
  },
  // Skeleton loading styles
  skeletonLabel: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 6,
    width: '60%',
  },
  skeletonInput: {
    height: 44,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    opacity: 0.7,
  },
});