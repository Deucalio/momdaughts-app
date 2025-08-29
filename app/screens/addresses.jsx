"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import HeaderWithoutCart from "../../components/HeaderWithoutCart";

import NavigationSpaceContainer from "../../components/NavigationSpaceContainer"

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
  cream: "#faf9f7",
  softGold: "#f4f1ea",
}

// Mock API data based on Prisma schema
const mockAddresses = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1 (555) 123-4567",
    address1: "123 Main Street",
    address2: "Apt 4B",
    city: "New York",
    province: "NY",
    postalCode: "10001",
    country: "United States",
    isDefault: true,
    type: "Home",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1 (555) 987-6543",
    address1: "456 Business Ave",
    address2: "Suite 200",
    city: "New York",
    province: "NY",
    postalCode: "10002",
    country: "United States",
    isDefault: false,
    type: "Work",
  },
  {
    id: "3",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1 (555) 456-7890",
    address1: "789 Oak Drive",
    address2: null,
    city: "Brooklyn",
    province: "NY",
    postalCode: "11201",
    country: "United States",
    isDefault: false,
    type: "Home",
  },
]

const AddressCard = ({
  address,
  onDelete,
  onSetDefault,
}) => {
  const fullName = [address.firstName, address.lastName].filter(Boolean).join(" ")
  const fullAddress = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <View style={styles.addressCard}>
      <View style={styles.cardHeader}>
        <View style={styles.nameSection}>
          <Ionicons name="location-outline" size={20} color={COLORS.mediumPink} />
          <Text style={styles.nameText}>{fullName || "No Name"}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Ionicons name="star" size={12} color={COLORS.white} />
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => onDelete(address.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.addressDetails}>
        <Text style={styles.addressText}>{fullAddress}</Text>
        {address.phone && (
          <View style={styles.phoneSection}>
            <Ionicons name="call-outline" size={16} color={COLORS.mediumGray} />
            <Text style={styles.phoneText}>{address.phone}</Text>
          </View>
        )}
        {address.type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{address.type}</Text>
          </View>
        )}
      </View>

      {!address.isDefault && (
        <TouchableOpacity style={styles.setDefaultButton} onPress={() => onSetDefault(address.id)}>
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAddresses(mockAddresses)
      setLoading(false)
    }, 1000)
  }, [])

  const handleDelete = (id) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setAddresses((prev) => prev.filter((addr) => addr.id !== id))
          Alert.alert("Success", "Address deleted successfully")
        },
      },
    ])
  }

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    )
    Alert.alert("Success", "Default address updated")
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.mediumPink} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithoutCart/>

      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Ionicons name="location" size={24} color={COLORS.mediumPink} />
            <Text style={styles.title}>Saved Addresses</Text>
          </View>
          <Text style={styles.subtitle}>Manage your shipping addresses for faster checkout</Text>
          <View style={styles.divider} />
        </View>

        {/* Addresses */}
        {addresses.length > 0 ? (
          <View style={styles.addressesContainer}>
            {addresses.map((address) => (
              <AddressCard key={address.id} address={address} onDelete={handleDelete} onSetDefault={handleSetDefault} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={COLORS.mediumGray} />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>Add your first shipping address to get started</Text>
          </View>
        )}

        {/* Add Address Button */}
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>
      <NavigationSpaceContainer/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.mediumGray,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.darkBlue,
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  addressesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addressCard: {
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  nameSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.darkBlue,
    marginLeft: 8,
    marginRight: 8,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.mediumPink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
  },
  addressDetails: {
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  phoneSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  phoneText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginLeft: 6,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  setDefaultButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lavender,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  setDefaultText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkBlue,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.darkBlue,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: "center",
    lineHeight: 22,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.mediumPink,
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: 8,
  },
})
