"use client";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { removeAddress, updateShippingAddress } from "../../utils/actions";
import { useAuthenticatedFetch } from "../../utils/authStore";

import Text from "../../../components/Text";
const COLORS = {
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  deepBlue: "#2c2a6b",
  almostBlack: "#040707",
  white: "#ffffff",
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
  success: "#28a745",
  danger: "#dc3545",
  waveGreen: "#e8f5e8",
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

// Loading skeleton for addresses
const AddressSkeleton = () => {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.addressInfo}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonAddress} />
          <View style={styles.skeletonCity} />
        </View>
      </View>
    </View>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ visible, onCancel, onConfirm, addressName }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
            <Text style={styles.modalTitle}>Delete Address</Text>
          </View>
          
          <Text style={styles.modalMessage}>
            Are you sure you want to delete this {addressName} address? This action cannot be undone.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isDefault, settingDefaultId }) => {
return (
  <View style={[styles.addressCard, isDefault && styles.defaultAddressCard]}>
    <View style={styles.addressHeader}>
      <View style={[styles.locationIconContainer, isDefault && styles.defaultIconContainer]}>
        <Ionicons 
          name="location-outline" 
          size={20} 
          color={isDefault ? COLORS.deepBlue : COLORS.mediumGray} 
        />
      </View>
      
      <View style={styles.addressInfo}>
        <View style={styles.addressTitleContainer}>
          <Text style={styles.addressTitle}>
            {address.type === "home" || address.type === "Home" ? "Home" : "Work"}
          </Text>
          {isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.addressPersonName}>
          {address.firstName} {address.lastName}
        </Text>
        <Text style={styles.addressLine1}>{address.address1}</Text>
        {address.address2 && (
          <Text style={styles.addressLine2}>{address.address2}</Text>
        )}
        <Text style={styles.cityState}>
          {address.city}, {address.province} {address.postalCode}
        </Text>
        <Text style={styles.phoneText}>{address.phone}</Text>
      </View>

      <View style={styles.actionIcons}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => onEdit(address)}
        >
          <Ionicons name="pencil" size={18} color={COLORS.deepBlue} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => onDelete(address)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>

    {!isDefault && (
      <View style={styles.setDefaultButtonContainer}>
        <TouchableOpacity 
          style={[styles.setDefaultButton, settingDefaultId === address.id && styles.setDefaultButtonDisabled]}
          onPress={() => onSetDefault(address)}
          disabled={settingDefaultId === address.id}
        >
          {settingDefaultId === address.id ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.setDefaultButtonText}>Set as Default</Text>
          )}
        </TouchableOpacity>
      </View>
    )}
  </View>
);
};

const CurrentLocationCard = ({ currentLocation, onEdit }) => {
  return (
    <View style={styles.currentLocationCard}>
      <View style={styles.addressHeader}>
        <View style={styles.currentLocationIconContainer}>
          <Ionicons name="location" size={20} color={COLORS.success} />
        </View>
        
        <View style={styles.addressInfo}>
          <View style={styles.addressTitleContainer}>
            <Text style={styles.addressTitle}>Current Location</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
          
          <Text style={styles.addressLine1}>{currentLocation.address1}</Text>
          <Text style={styles.cityState}>
            {currentLocation.city}, {currentLocation.province} {currentLocation.postalCode}
          </Text>
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.preciseLocationText}>Use precise location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );


  

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch("https://d4bcaa3b5f1b.ngrok-free.app/addresses");
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      
      const data = await response.json();
      
      // Separate current location from saved addresses and sort by default
      const currentLoc = data.addresses.find(addr => addr.isCurrentLocation);
      const savedAddrs = data.addresses
        .filter(addr => !addr.isCurrentLocation)
        .sort((a, b) => b.isDefault - a.isDefault); // Default addresses first
      
      setCurrentLocation(currentLoc);
      setAddresses(savedAddrs);
    } catch (error) {
      Alert.alert("Error", "Failed to load addresses. Please try again.");
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    router.push(`/screens/addresses/${address.id}`);
  };

  const handleDeleteAddress = (address) => {
    setAddressToDelete(address);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    
    try {
      const response = await removeAddress(authenticatedFetch, addressToDelete.id);
   
      
      // Refresh addresses list
      fetchAddresses();
      setDeleteModalVisible(false);

      setAddressToDelete(null);
      Alert.alert("Success", "Address deleted successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to delete address. Please try again.");
      console.error("Error deleting address:", error);
    }
  };

const handleSetDefault = async (address) => {
  setSettingDefaultId(address.id);
  try {
    const updatedAddress = { ...address, isDefault: true, useCurrentLocation: true };
    await updateShippingAddress(authenticatedFetch, updatedAddress);
    
    // Refresh addresses list
    fetchAddresses();
    Alert.alert("Success", "Default address updated!");
  } catch (error) {
    Alert.alert("Error", "Failed to update default address. Please try again.");
    console.error("Error setting default address:", error);
  } finally {
    setSettingDefaultId(null);
  }
};
  const handleAddNewAddress = () => {
    router.push("/screens/addresses/new");
  };

  const handleEditCurrentLocation = () => {
    Alert.alert("Edit Location", "This would open location editing interface");
  };

  const defaultAddress = addresses.find(addr => addr.isDefault);
  const otherAddresses = addresses.filter(addr => !addr.isDefault);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Wave with centered title and left back button */}
      <View style={styles.headerSection}>
        <WaveComponent />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButtonAbsolute}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.almostBlack} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitleAbsolute}>Manage Addresses</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View>
            <AddressSkeleton />
            <AddressSkeleton />
            <AddressSkeleton />
          </View>
        ) : (
          <View style={styles.addressesSection}>
            {/* Add New Address Button - at top */}
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={handleAddNewAddress}
            >
              <Ionicons name="add" size={20} color={COLORS.deepBlue} />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </TouchableOpacity>

            {/* Current Location Section */}
            {currentLocation && (
              <CurrentLocationCard 
                currentLocation={currentLocation}
                onEdit={handleEditCurrentLocation}
              />
            )}

            {/* Default Address - shown above "Saved Addresses" */}
            {defaultAddress && (
              <View style={styles.defaultSection}>
                <AddressCard
                  address={defaultAddress}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                  isDefault={true}
                />
              </View>
            )}

            {/* Saved Addresses Section */}
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            
            {otherAddresses.map((address) => (
       <AddressCard
  key={address.id}
  address={address}
  onEdit={handleEditAddress}
  onDelete={handleDeleteAddress}
  onSetDefault={handleSetDefault}
  isDefault={false}
  settingDefaultId={settingDefaultId} // Add this line
/>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        visible={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setAddressToDelete(null);
        }}
        onConfirm={confirmDelete}
        addressName={addressToDelete ? (addressToDelete.type === "home" || addressToDelete.type === "Home" ? "Home" : "Work") : ""}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerSection: {
    backgroundColor: COLORS.white,
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
    marginTop: -24,
  },
  addressesSection: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.deepBlue,
  },
  addAddressText: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: COLORS.deepBlue,
    marginLeft: 8,
  },
  currentLocationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.success,
    shadowColor: COLORS.almostBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultSection: {
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.almostBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // elevation: 2,
  },
  defaultAddressCard: {
    borderColor: COLORS.darkBlue,
    borderWidth: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  defaultIconContainer: {
    backgroundColor: COLORS.lightPink,
  },
  currentLocationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  addressTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.almostBlack,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: COLORS.deepBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  defaultBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: "Outfit-Medium",
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  activeBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: "Outfit-Medium",
  },
  addressPersonName: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: COLORS.almostBlack,
    marginBottom: 2,
  },
  addressLine1: {
    fontSize: 14,
    color: COLORS.almostBlack,
    marginBottom: 2,
  },
  addressLine2: {
    fontSize: 14,
    color: COLORS.almostBlack,
    marginBottom: 2,
  },
  cityState: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    fontFamily: "Outfit-Medium",
  },
  preciseLocationText: {
    fontSize: 12,
    color: COLORS.deepBlue,
    fontFamily: "Outfit-Medium",
    marginTop: 4,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setDefaultButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  setDefaultText: {
    fontSize: 12,
    color: COLORS.deepBlue,
    fontFamily: "Outfit-Medium",
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.almostBlack,
    marginBottom: 16,
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    shadowColor: COLORS.almostBlack,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.almostBlack,
    marginLeft: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.mediumGray,
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: COLORS.almostBlack,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: COLORS.white,
  },
  // Skeleton loading styles
  skeletonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    marginRight: 12,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 4,
    width: '40%',
  },
  skeletonAddress: {
    height: 14,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginBottom: 2,
    width: '80%',
  },
  skeletonCity: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: '60%',
  },

  setDefaultButtonContainer: {
  marginTop: 12,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
},
setDefaultButton: {
  backgroundColor: COLORS.deepBlue,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 40,
},
setDefaultButtonDisabled: {
  opacity: 0.6,
},
setDefaultButtonText: {
  fontSize: 14,
  color: COLORS.white,
  fontFamily: "Outfit-SemiBold",
},

});