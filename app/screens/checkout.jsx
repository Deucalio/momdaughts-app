"use client";

import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,

  TextInput,
  View,
} from "react-native";
import NavigationSpaceContainer from "../../components/NavigationSpaceContainer";
import Text from "../../components/Text";
import { createOrder } from "../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";
// Configure these for your app
const CART_API = "https://d4bcaa3b5f1b.ngrok-free.app/cart";
const ADDRESSES_API = "https://d4bcaa3b5f1b.ngrok-free.app/addresses";
const CURRENCY_SYMBOL = "PKR ";
// Subtle, elegant color palette
const COLORS = {
  primary: "#6B46C1", // Deep purple
  primaryLight: "#8B5CF6", // Medium purple
  secondary: "#EC4899", // Muted pink
  accent: "#4F46E5", // Indigo
  text: "#111827", // Almost black
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  deepBlue: "#2c2a6b",
  textLight: "#4B5563", // Dark gray
  textMuted: "#6B7280", // Medium gray
  border: "#D1D5DB", // Light gray border
  borderLight: "#E5E7EB", // Very light border
  background: "#FFFFFF", // Pure white
  backgroundSoft: "#F9FAFB", // Off white
  backgroundCard: "#FEFEFE", // Card background
  success: "#059669", // Forest green
  error: "#DC2626", // Deep red
  warning: "#D97706", // Amber
  outOfStock: "#9CA3AF", // Gray for out of stock
};

function fmt(n) {
  return `${CURRENCY_SYMBOL}${Number(n || 0).toLocaleString()}`;
}

export default function CheckoutScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [summaryExpanded, setSummaryExpanded] = useState(true); // Always expanded by default
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod"); // Default to COD
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const { user } = useAuthStore();

  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const router = useRouter();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [addressSelectorType, setAddressSelectorType] = useState("shipping");

  const { authenticatedFetch } = useAuthenticatedFetch();

  const handleSaveAddress = async (address) => {
    setSavingAddress(true);
    try {
      // Simulate API call to save address
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update the savedAddresses array
      setSavedAddresses((prev) =>
        prev.map((addr) =>
          addr.id === address.id ? { ...addr, ...address } : addr
        )
      );

      Alert.alert("Success", "Address updated successfully!");
      setEditingAddress(null);
    } catch (error) {
      Alert.alert("Error", "Failed to save address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  // Animation for accordion
  const animatedHeight = useState(new Animated.Value(1))[0]; // Start expanded
  const animatedRotation = useState(new Animated.Value(1))[0]; // Start rotated

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor("#F5F5F5");
      StatusBar.setBarStyle("dark-content");

      // Fetch addresses when screen comes into focus
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await authenticatedFetch(ADDRESSES_API);
      if (!res.ok) throw new Error(`Failed to fetch addresses: ${res.status}`);
      const data = await res.json();

      // Map API response to component format
      const mappedAddresses = data.addresses.map((address) => ({
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: "Pakistan",
        isDefault: address.isDefault,
        type: address.type === "home" ? "Home" : "Work", // Capitalize for display
        email: user.email,
      }));

      setSavedAddresses(mappedAddresses);
    } catch (e) {
      console.error("Failed to fetch addresses:", e);
      // Don't show error alert for addresses as it's not critical for checkout
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    const defaultAddress = savedAddresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedShippingAddress(defaultAddress);
      const mappedAddress = {
        id: defaultAddress.id,
        firstName: defaultAddress.firstName,
        lastName: defaultAddress.lastName,
        phone: defaultAddress.phone,
        email: user.email, // Will need to be filled
        address1: defaultAddress.address1,
        address2: defaultAddress.address2,
        city: defaultAddress.city,
        province: defaultAddress.province,
        postalCode: defaultAddress.postalCode,
        country: "Pakistan",
      };
      setShippingAddress(mappedAddress);
      if (sameAsBilling) {
        setBillingAddress(mappedAddress);
      }
    }
  }, [savedAddresses]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await authenticatedFetch(CART_API);
        if (!res.ok) throw new Error(`Failed to fetch cart: ${res.status}`);
        const data = await res.json();
        const lines = data.cart;
        if (mounted) setItems(lines);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load cart");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Animate accordion
  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: summaryExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRotation, {
        toValue: summaryExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [summaryExpanded]);

  const availableItems = useMemo(
    () => items.filter((item) => item.quantity > 0),
    [items]
  );
  const outOfStockItems = useMemo(
    () => items.filter((item) => item.quantity === 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      availableItems.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      ),
    [availableItems]
  );

  const totalWeight = useMemo(() => {
    return availableItems.reduce((sum, item) => {
      const weight = item.weight?.value || 0;
      return sum + weight * item.quantity;
    }, 0);
  }, [availableItems]);

  const shippingMethods = useMemo(() => {
    const methods = [
      {
        id: "express",
        name: "Express Shipping",
        description: "2-4 Days",
        price: 99,
      },
      {
        id: "free-express",
        name: "Free Express Shipping",
        description: "2-4 Days",
        price: 0,
      },
    ];
    // Auto-select based on weight
    const defaultMethod = totalWeight > 0.1 ? methods[1] : methods[0];
    if (!selectedShippingMethod) {
      setSelectedShippingMethod(defaultMethod);
    }

    return methods;
  }, [totalWeight, selectedShippingMethod, setSelectedShippingMethod]);

  useEffect(() => {
    const defaultMethod =
      totalWeight > 0.1 ? shippingMethods[1] : shippingMethods[0];
    setSelectedShippingMethod(defaultMethod);
  }, [totalWeight]);

  const shipping = selectedShippingMethod?.price || 0;

  // const tax = Math.round(subtotal * 0.17); // 17% tax (Pakistan GST)
  // 2% Tax (Pakistan GST)
  // const tax = Math.round(subtotal * 0.02);

  // 0% Tax (Pakistan GST)
  const tax = 0;

  
  const discountAmount = appliedDiscount
    ? Math.round(subtotal * (appliedDiscount.percentage / 100))
    : 0;
  const total = subtotal + shipping + tax - discountAmount;
  const isAddressSelected = (address, type) => {
    const currentAddress =
      type === "shipping" ? shippingAddress : billingAddress;
    return (
      currentAddress.id === address.id &&
      currentAddress.firstName === address.firstName &&
      currentAddress.lastName === address.lastName &&
      currentAddress.address1 === address.address1 &&
      currentAddress.city === address.city &&
      currentAddress.postalCode === address.postalCode
    );
  };


  useEffect(() => {
  if (sameAsBilling) {
    setBillingAddress(shippingAddress);
  }
}, [sameAsBilling, shippingAddress]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      Alert.alert("Invalid Code", "Please enter a discount code.");
      return;
    }

    setApplyingDiscount(true);
    try {
      // Simulate API call to validate discount code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock discount validation
      const mockDiscounts = {
        NEWORDER10: { code: "NEWORDER10", percentage: 10, description: "10% off" },
        WELCOME15: {
          code: "WELCOME15",
          percentage: 15,
          description: "15% off for new customers",
        },
        SKINCARE20: {
          code: "SKINCARE20",
          percentage: 20,
          description: "20% off skincare products",
        },
      };

      const discount = mockDiscounts[discountCode.toUpperCase()];
      if (discount) {
        setAppliedDiscount(discount);
        Alert.alert(
          "Discount Applied!",
          `${discount.description} has been applied to your order.`
        );
      } else {
        Alert.alert(
          "Invalid Code",
          "The discount code you entered is not valid."
        );
      }
    } catch (e) {
      Alert.alert("Error", "Failed to apply discount code. Please try again.");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  const isFormValid = () => {
    const shipping = shippingAddress;
    const billing = sameAsBilling ? shipping : billingAddress;

    const addressValid = (addr) =>
      addr.firstName.trim() &&
      addr.lastName.trim() &&
      addr.phone.trim() &&
      addr.email.trim() &&
      addr.address1.trim() &&
      addr.city.trim() &&
      addr.province.trim() &&
      addr.postalCode.trim();
    // addr.country.trim();

    return (
      addressValid(shipping) &&
      addressValid(billing) &&
      availableItems.length > 0 &&
      selectedShippingMethod &&
      total > 0
    );
  };

  const isAddressComplete = (address) => {
    return (
      address.firstName?.trim() &&
      address.lastName?.trim() &&
      address.phone?.trim() &&
      address.address1?.trim() &&
      address.city?.trim() &&
      address.province?.trim() &&
      address.postalCode?.trim() &&
      address.country?.trim()
    );
  };

  const handlePay = async () => {
    if (!isFormValid()) {
      Alert.alert(
        "Incomplete Information",
        "Please fill in all required fields."
      );
      return;
    }
    const validItems = availableItems.filter(
      (item) => item.quantity > 0 && !item.outOfStock
    );
    const orderData = {
      shippingAddress,
      billingAddress,
      paymentMethod: "cod",
      shippingMethod: selectedShippingMethod,
      items: validItems,
      subtotal,
      shipping,
      tax,
      discountAmount,
      total,
      totalWeight,
    };
    setProcessingPayment(true);
    try {
      const orderRes = await createOrder(authenticatedFetch, orderData);
      if (!orderRes.success) {
        Alert.alert("Failed to place order", orderRes.error);
        return;
      }
      console.log("orderRes:", orderRes);

      Alert.alert("Order Placed!", "Your order has been successfully placed.");
    } catch (e) {
      Alert.alert("Order Failed", "Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const updateShippingAddress = (field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    if (sameAsBilling) {
      setBillingAddress((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSelectAddress = (address, type) => {
    if (type === "shipping") {
      setSelectedShippingAddress(address);
      // Map to the form format for validation
      const mappedAddress = {
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        email: shippingAddress.email,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
        country: address.country ? address.country : "Parkistan",
      };
      setShippingAddress(mappedAddress);
  
      if (sameAsBilling) {
        setBillingAddress(mappedAddress);
     
      }
    } else {
      // Handle billing address selection
      const mappedAddress = {
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        email: billingAddress.email,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: address.country,
      };
      setBillingAddress(mappedAddress);
    }
    setShowAddressSelector(false);
  };

  const handleEditAddress = (address) => {
    router.push(`/screens/addresses/${address.id}`);
    setShowAddressSelector(false);
  };

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <View style={styles.center}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your cart…</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Couldn't load your cart</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => {
              setLoading(true);
              setError(null);
              // Reload logic here
            }}
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const AddressSkeletonContent = () => (
    <View style={styles.addressSelectorCard}>
      <View style={styles.skeletonContainer}>
        <View style={[styles.skeletonLine, { width: "30%", height: 16 }]} />
        <View
          style={[
            styles.skeletonLine,
            { width: "60%", height: 14, marginTop: 8 },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            { width: "80%", height: 14, marginTop: 4 },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            { width: "40%", height: 14, marginTop: 4 },
          ]}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Text style={styles.headerSubtitle}>Complete your order</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 20 }} // Reduced padding for better mobile nav compatibility
          showsVerticalScrollIndicator={false}
        >
          {/* Shipping Address */}
          {/* Shipping Address Selector */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📦</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Shipping Information</Text>
                <Text style={styles.cardSubtitle}>
                  Where should we deliver your products?
                </Text>
              </View>
            </View>

            {loadingAddresses ? (
              <AddressSkeletonContent />
            ) : (
              <Pressable
                onPress={() => {
                  setAddressSelectorType("shipping");
                  setShowAddressSelector(true);
                }}
                style={[
                  styles.addressSelectorCard,
                  selectedShippingAddress &&
                    !isAddressComplete(shippingAddress) &&
                    styles.incompleteAddressCard,
                ]}
              >
                {selectedShippingAddress ? (
                  <View style={styles.selectedAddressContainer}>
                    <View style={styles.selectedAddressHeader}>
                      <View style={styles.addressTypeIndicator}>
                        <Text style={styles.addressTypeIcon}>
                          {selectedShippingAddress.type === "Home"
                            ? "🏠"
                            : "🏢"}
                        </Text>
                        <Text style={styles.addressTypeText}>
                          {selectedShippingAddress.type}
                        </Text>

                        {!isAddressComplete(shippingAddress) && (
                          <View style={styles.incompleteAddressBadge}>
                            <Text style={styles.incompleteAddressBadgeText}>
                              Incomplete
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.changeText}>Change</Text>
                    </View>
                    <Text style={styles.selectedAddressName}>
                      {selectedShippingAddress.firstName}{" "}
                      {selectedShippingAddress.lastName}
                    </Text>
                    <Text style={styles.selectedAddressDetails}>
                      {selectedShippingAddress.address1}
                      {selectedShippingAddress.address2 &&
                        `, ${selectedShippingAddress.address2}`}
                    </Text>
                    <Text style={styles.selectedAddressDetails}>
                      {selectedShippingAddress.city},{" "}
                      {selectedShippingAddress.province}{" "}
                      {selectedShippingAddress.postalCode}
                    </Text>
                    <Text style={styles.selectedAddressPhone}>
                      {selectedShippingAddress.phone}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noAddressContainer}>
                    <View style={styles.noAddressIcon}>
                      <Text style={styles.noAddressIconText}>+</Text>
                    </View>
                    <View style={styles.noAddressText}>
                      <Text style={styles.noAddressTitle}>
                        Select Shipping Address
                      </Text>
                      <Text style={styles.noAddressSubtitle}>
                        Choose from saved addresses or add new
                      </Text>
                    </View>
                    <Text style={styles.selectArrow}>→</Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>

          {/* Billing Address */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>💳</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Billing Address</Text>
                <Text style={styles.cardSubtitle}>
                  For payment verification
                </Text>
              </View>
              {!sameAsBilling && (
                <Pressable
                  onPress={() => {
                    setAddressSelectorType("billing");
                    setShowAddressSelector(true);
                  }}
                  style={styles.savedAddressBtn}
                >
                  <Text style={styles.savedAddressBtnText}>📋</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={() => {
                const newSameAsBilling = !sameAsBilling;
                setSameAsBilling(newSameAsBilling);
                if (newSameAsBilling) {
                  setBillingAddress(shippingAddress);
              
                }
              }}
              style={styles.checkboxRow}
            >
              <View
                style={[
                  styles.checkbox,
                  sameAsBilling && styles.checkboxChecked,
                ]}
              >
                {sameAsBilling && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Same as shipping address</Text>
            </Pressable>

            {!sameAsBilling && (
              <AddressForm
                address={billingAddress}
                onUpdate={(field, value) =>
                  setBillingAddress((prev) => ({ ...prev, [field]: value }))
                }
              />
            )}
          </View>

          {/* Shipping Method */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🚛</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Shipping Method</Text>
                {/* <Text style={styles.cardSubtitle}>
                  Total weight: {totalWeight.toFixed(1)}kg
                </Text> */}
              </View>
            </View>

            <View style={styles.paymentMethods}>
              {shippingMethods.map((method) => (
                <Pressable
                  // If the weight is 0.1 then free-express is disabled, but if the weight is 0.2 then free-express is enabled
                  disabled={method.price === 0 && totalWeight < 0.2}
                  key={method.id}
                  onPress={() => setSelectedShippingMethod(method)}
                  style={[
                    method.price === 0 &&
                      totalWeight < 0.2 && {
                        opacity: 0.5,
                      },
                    styles.paymentOption,
                    selectedShippingMethod?.id === method.id &&
                      styles.paymentOptionSelected,
                  ]}
                >
                  <View style={styles.paymentOptionContent}>
                    <Text style={styles.paymentOptionIcon}>
                      {method.price === 0 ? "🆓" : "⚡"}
                    </Text>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>
                        {method.name}
                      </Text>
                      <Text style={styles.paymentOptionSubtitle}>
                        {method.description} •{" "}
                        {method.price === 0 ? "FREE" : fmt(method.price)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      selectedShippingMethod?.id === method.id &&
                        styles.radioButtonSelected,
                    ]}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>💰</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Payment Method</Text>
                <Text style={styles.cardSubtitle}>Cash on Delivery</Text>
              </View>
            </View>

            <View style={styles.paymentMethods}>
              <View
                style={[styles.paymentOption, styles.paymentOptionSelected]}
              >
                <View style={styles.paymentOptionContent}>
                  <Text style={styles.paymentOptionIcon}>🚚</Text>
                  <View style={styles.paymentOptionText}>
                    <Text style={styles.paymentOptionTitle}>
                      Cash on Delivery
                    </Text>
                    <Text style={styles.paymentOptionSubtitle}>
                      Pay when you receive your order
                    </Text>
                  </View>
                </View>
                <View
                  style={[styles.radioButton, styles.radioButtonSelected]}
                />
              </View>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Pressable
              onPress={() => setSummaryExpanded(!summaryExpanded)}
              style={styles.summaryHeader}
            >
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <Text style={styles.summarySubtitle}>
                  {availableItems.length} available items • {fmt(total)}
                </Text>
              </View>
              <Animated.View
                style={{ transform: [{ rotate: rotateInterpolate }] }}
              >
                <Text style={styles.chevron}>▼</Text>
              </Animated.View>
            </Pressable>

            <Animated.View
              style={[
                styles.summaryContent,
                {
                  maxHeight: animatedHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 800], // Increased max height
                  }),
                  opacity: animatedHeight,
                },
              ]}
            >
              <View style={styles.summaryDivider} />

              {/* Available Items */}
              {availableItems.length > 0 && (
                <FlatList
                  data={availableItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <MiniLineItem item={item} />}
                  ItemSeparatorComponent={() => (
                    <View style={styles.miniDivider} />
                  )}
                  scrollEnabled={false}
                />
              )}

              {/* Out of Stock Items */}
              {outOfStockItems.length > 0 && (
                <>
                  <View style={styles.outOfStockHeader}>
                    <Text style={styles.outOfStockTitle}>
                      Out of Stock Items
                    </Text>
                  </View>
                  <FlatList
                    data={outOfStockItems}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <MiniLineItem item={item} outOfStock />
                    )}
                    ItemSeparatorComponent={() => (
                      <View style={styles.miniDivider} />
                    )}
                    scrollEnabled={false}
                  />
                </>
              )}

              {/* Discount Code Section */}
              <View style={styles.discountSection}>
                <Text style={styles.discountTitle}>Discount Code</Text>
                {appliedDiscount ? (
                  <View style={styles.appliedDiscountContainer}>
                    <View style={styles.appliedDiscountInfo}>
                      <Text style={styles.appliedDiscountCode}>
                        {appliedDiscount.code}
                      </Text>
                      <Text style={styles.appliedDiscountDesc}>
                        {appliedDiscount.description}
                      </Text>
                    </View>
                    <Pressable
                      onPress={removeDiscount}
                      style={styles.removeDiscountBtn}
                    >
                      <Text style={styles.removeDiscountText}>✕</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.discountInputContainer}>
                    <TextInput
                      style={styles.discountInput}
                      value={discountCode}
                      onChangeText={setDiscountCode}
                      placeholder="Enter discount code"
                      placeholderTextColor={COLORS.textMuted}
                      
                      autoCapitalize="characters"
                    />
                    <Pressable
                      onPress={handleApplyDiscount}
                      disabled={applyingDiscount || !discountCode.trim()}
                      style={[
                        styles.applyDiscountBtn,
                        (!discountCode.trim() || applyingDiscount) &&
                          styles.applyDiscountBtnDisabled,
                      ]}
                    >
                      {applyingDiscount ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.applyDiscountText}>Apply</Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>

              <View style={styles.summaryTotals}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
                </View>
                {appliedDiscount && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, styles.discountLabel]}>
                      Discount ({appliedDiscount.code})
                    </Text>
                    <Text style={[styles.summaryValue, styles.discountValue]}>
                      -{fmt(discountAmount)}
                    </Text>
                  </View>
                )}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (2%)</Text>
                  <Text style={styles.summaryValue}>{fmt(tax)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      shipping === 0 && styles.freeText,
                    ]}
                  >
                    {shipping === 0 ? "FREE" : fmt(shipping)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{fmt(total)}</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.bottomSummaryRow}>
              <View style={styles.bottomLeft}>
                <Text style={styles.bottomTotal}>{fmt(total)}</Text>
                <Text style={styles.bottomItems}>
                  {availableItems.length} item
                  {availableItems.length !== 1 ? "s" : ""}
                  {outOfStockItems.length > 0 && (
                    <Text style={styles.outOfStockNote}>
                      {" "}
                      • {outOfStockItems.length} out of stock
                    </Text>
                  )}
                </Text>
              </View>
              <Pressable
                onPress={handlePay}
                disabled={!isFormValid() || processingPayment}
                style={[
                  styles.payButton,
                  !isFormValid() && styles.payButtonDisabled,
                ]}
              >
                {processingPayment ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.payButtonText}>Place Order</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {showAddressSelector && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Select{" "}
                    {addressSelectorType === "shipping"
                      ? "Shipping"
                      : "Billing"}{" "}
                    Address
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Choose from your saved addresses
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowAddressSelector(false)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <Pressable
                  onPress={() => {
                    setShowAddressSelector(false);
                    router.push("/screens/addresses/new");
                  }}
                  style={styles.addNewAddressOption}
                >
                  <View style={styles.addNewAddressContent}>
                    <View style={styles.addNewAddressIcon}>
                      <Text style={styles.addNewAddressPlus}>+</Text>
                    </View>
                    <View style={styles.addNewAddressText}>
                      <Text style={styles.addNewAddressTitle}>
                        Add New Address
                      </Text>
                      <Text style={styles.addNewAddressSubtitle}>
                        Create a new shipping address
                      </Text>
                    </View>
                  </View>
                </Pressable>
                {savedAddresses
                  .sort((a, b) => {
                    // existing sort logic
                    // First, prioritize selected address
                    const aSelected = isAddressSelected(a, addressSelectorType);
                    const bSelected = isAddressSelected(b, addressSelectorType);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;

                    // Then, prioritize default address
                    if (a.isDefault && !b.isDefault) return -1;
                    if (!a.isDefault && b.isDefault) return 1;

                    return 0;
                  })
                  .map((address) => {
                    const isSelected = isAddressSelected(
                      address,
                      addressSelectorType
                    );
                    const isIncomplete = !isAddressComplete({
                      firstName: address.firstName,
                      lastName: address.lastName,
                      phone: address.phone,
                      address1: address.address1,
                      city: address.city,
                      province: address.province,
                      postalCode: address.postalCode,
                      country: "Pakistan",
                    });

                    return (
                      <View
                        key={address.id}
                        style={styles.addressOptionWrapper}
                      >
                        <Pressable
                          onPress={() =>
                            handleSelectAddress(address, addressSelectorType)
                          }
                          style={[
                            styles.addressOption,
                            // Error styles take priority
                            isSelected &&
                              isIncomplete &&
                              styles.incompleteAddressCard,
                            // Selected styles if no error
                            isSelected &&
                              !isIncomplete &&
                              styles.addressOptionSelected,
                          ]}
                        >
                          {/* Selected tickmark - only show if selected and not incomplete */}
                          {isSelected && !isIncomplete && (
                            <View style={styles.selectedTickmark}>
                              <Text style={styles.selectedTickmarkText}>✓</Text>
                            </View>
                          )}

                          <View style={styles.addressOptionContent}>
                            <View style={styles.addressOptionHeader}>
                              <View style={styles.addressTypeContainer}>
                                <Text style={styles.addressTypeIcon}>
                                  {address.type === "Home" ? "🏠" : "🏢"}
                                </Text>
                                <Text style={styles.addressType}>
                                  {address.type}
                                </Text>
                              </View>
                              <View style={styles.badgeContainer}>
                                {/* Default badge */}
                                {address.isDefault && (
                                  <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultBadgeText}>
                                      Default
                                    </Text>
                                  </View>
                                )}

                                {/* Incomplete badge - only for selected addresses */}
                                {isSelected && isIncomplete && (
                                  <View style={styles.incompleteAddressBadge}>
                                    <Text
                                      style={styles.incompleteAddressBadgeText}
                                    >
                                      Incomplete
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>

                            {/* Rest of address content remains the same */}
                            <Text style={styles.addressName}>
                              {address.firstName} {address.lastName}
                            </Text>
                            <Text style={styles.addressDetails}>
                              {address.address1}
                              {address.address2 && `, ${address.address2}`}
                            </Text>
                            <Text style={styles.addressDetails}>
                              {address.city}, {address.province}{" "}
                              {address.postalCode}
                            </Text>
                            <Text style={styles.addressPhone}>
                              {address.phone}
                            </Text>
                          </View>
                        </Pressable>
                        <Pressable
                          onPress={() => handleEditAddress(address)}
                          style={styles.editAddressBtn}
                        >
                          <Text style={styles.editAddressBtnText}>Edit</Text>
                        </Pressable>
                      </View>
                    );
                  })}
              </ScrollView>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
      <NavigationSpaceContainer />
    </View>
  );
}

function MiniLineItem({ item, outOfStock = false }) {
  const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
  const isOutOfStock = outOfStock || item.quantity === 0;

  return (
    <View style={[styles.miniLine, isOutOfStock && styles.miniLineOutOfStock]}>
      <Image
        source={{ uri: item.variantImage }}
        style={[styles.miniThumb, isOutOfStock && styles.miniThumbOutOfStock]}
        resizeMode="cover"
      />
      <View style={styles.miniContent}>
        <Text
          style={[styles.miniTitle, isOutOfStock && styles.miniTitleOutOfStock]}
          numberOfLines={1}
        >
          {item.productTitle}
        </Text>
        <Text
          style={[
            styles.miniVariant,
            isOutOfStock && styles.miniVariantOutOfStock,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.miniQty, isOutOfStock && styles.miniQtyOutOfStock]}
        >
          {isOutOfStock ? "Out of Stock" : `Qty ${item.quantity}`}
        </Text>
      </View>
      <Text
        style={[styles.miniPrice, isOutOfStock && styles.miniPriceOutOfStock]}
      >
        {isOutOfStock ? "N/A" : fmt(lineTotal)}
      </Text>
    </View>
  );
}

function AddressForm({ address, onUpdate }) {
  return (
    <View style={styles.formContainer}>
      <View style={styles.inputRowDouble}>
        <FormInput
          label="First Name"
          value={address.firstName}
          onChangeText={(value) => onUpdate("firstName", value)}
          placeholder="Enter first name"
          autoCapitalize="words"
          containerStyle={{ flex: 1 }}
          required
        />
        <View style={{ width: 12 }} />
        <FormInput
          label="Last Name"
          value={address.lastName}
          onChangeText={(value) => onUpdate("lastName", value)}
          placeholder="Enter last name"
          autoCapitalize="words"
          containerStyle={{ flex: 1 }}
          required
        />
      </View>

      <View style={styles.inputRowDouble}>
        <FormInput
          label="Phone Number"
          value={address.phone}
          onChangeText={(value) => onUpdate("phone", value)}
          placeholder="+92 300 1234567"
          keyboardType="phone-pad"
          placeholderTextColor="#9ca3af"
          containerStyle={{ flex: 1 }}
          required
        />
        <View style={{ width: 12 }} />
        <FormInput
          label="Email Address"
          value={address.email}
          onChangeText={(value) => onUpdate("email", value)}
          placeholder="your@email.com"
          keyboardType="email-address"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          containerStyle={{ flex: 1 }}
          required
        />
      </View>

      <FormInput
        label="Street Address"
        value={address.address1}
        onChangeText={(value) => onUpdate("address1", value)}
        placeholder="House no, Street name, Area"
        required
      />

      <FormInput
        label="Apartment, Suite, etc."
        value={address.address2}
        onChangeText={(value) => onUpdate("address2", value)}
        placeholder="Apartment, suite, unit, building, floor, etc."
      />

      <View style={styles.inputRowDouble}>
        <FormInput
          label="City"
          value={address.city}
          onChangeText={(value) => onUpdate("city", value)}
          placeholder="City"
          containerStyle={{ flex: 1 }}
          required
        />
        <View style={{ width: 12 }} />
        <FormInput
          label="Province"
          value={address.province}
          onChangeText={(value) => onUpdate("province", value)}
          placeholder="Province"
          containerStyle={{ flex: 1 }}
          required
        />
      </View>

      <View style={styles.inputRowDouble}>
        <FormInput
          label="Postal Code"
          value={address.postalCode}
          onChangeText={(value) => onUpdate("postalCode", value)}
          placeholder="12345"
          keyboardType="number-pad"
          placeholderTextColor="#9ca3af"
          containerStyle={{ flex: 1 }}
          required
        />
        <View style={{ width: 12 }} />
        <FormInput
          label="Country"
          value={address.country}
          onChangeText={(value) => onUpdate("country", value)}
          placeholder="Pakistan"
          containerStyle={{ flex: 1 }}
          required
        />
      </View>
    </View>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
  maxLength,
  secureTextEntry = false,
  containerStyle,
  required = false,
}) {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 8 : StatusBar.currentHeight + 10,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: "Outfit-Medium",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: "Outfit-Medium",
  },

  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Skeleton styles
  skeletonContainer: {
    paddingVertical: 8,
  },
  skeletonLine: {
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 4,
  },

  // Collapsible Summary
  summaryCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  chevron: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  summaryContent: {
    overflow: "hidden",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 16,
  },

  // Out of stock section
  outOfStockHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.backgroundSoft,
  },
  outOfStockTitle: {
    fontSize: 13,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.textMuted,
  },

  // Mini line items
  miniLine: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  miniLineOutOfStock: {
    opacity: 0.5,
  },
  miniThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.borderLight,
  },
  miniThumbOutOfStock: {
    opacity: 0.6,
  },
  miniContent: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    fontSize: 13,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
  },
  miniTitleOutOfStock: {
    color: COLORS.outOfStock,
  },
  miniVariant: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  miniVariantOutOfStock: {
    color: COLORS.outOfStock,
  },
  miniQty: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  miniQtyOutOfStock: {
    color: COLORS.error,
    fontFamily: "Outfit-SemiBold",
  },
  miniPrice: {
    fontSize: 13,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
  },
  miniPriceOutOfStock: {
    color: COLORS.outOfStock,
  },
  miniDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 16,
  },

  // Discount section
  discountSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  discountTitle: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
    marginBottom: 12,
  },
  discountInputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  discountInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  applyDiscountBtn: {
    backgroundColor: COLORS.deepBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  applyDiscountBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  applyDiscountText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
  },
  appliedDiscountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.backgroundSoft,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  appliedDiscountInfo: {
    flex: 1,
  },
  appliedDiscountCode: {
    fontSize: 14,
    fontFamily: "Outfit-Bold",
    color: COLORS.success,
  },
  appliedDiscountDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  removeDiscountBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },
  removeDiscountText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Outfit-Bold",
  },

  // Summary totals
  summaryTotals: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: "Outfit-Medium",
  },
  summaryValue: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: "Outfit-SemiBold",
  },
  discountLabel: {
    color: COLORS.success,
  },
  discountValue: {
    color: COLORS.success,
  },
  freeText: {
    color: COLORS.success,
    fontFamily: "Outfit-Bold",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontFamily: "Outfit-Bold",
  },
  totalValue: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Outfit-ExtraBold",
  },

  // Cards
  card: {
    backgroundColor: COLORS.backgroundCard,
    // backgroundColor: "#e5e5e5",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    // shadowColor: "#000",
    // shadowOpacity: 0.06,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  addressSelectorCard: {
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    borderStyle: "dashed",
  },
  selectedAddressContainer: {
    flex: 1,
  },

  selectedAddressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressTypeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  addressTypeText: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.primary,
  },
  changeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "Outfit-SemiBold",
  },

  selectedAddressName: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
    marginBottom: 4,
  },

  selectedAddressDetails: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },

  selectedAddressPhone: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  noAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  noAddressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  noAddressIconText: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontFamily: "Outfit-SemiBold",
  },

  noAddressText: {
    flex: 1,
  },

  noAddressTitle: {
    fontSize: 15,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
    marginBottom: 2,
  },

  noAddressSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },

  selectArrow: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: "Outfit-SemiBold",
  },

  savedAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edf2f4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "black" + 50,
    borderRadius: 8,
    shadowColor: "#edf2f4",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  savedAddressIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  savedAddressText: {
    color: "black",
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
  },

  // Checkbox
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    padding: 12,
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 10,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: "white",
    fontSize: 10,
    fontFamily: "Outfit-Bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: "Outfit-Medium",
  },

  // Payment Methods
  paymentMethods: {
    marginBottom: 18,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border + "50",
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundSoft,
  },
  paymentOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentOptionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
    marginBottom: 2,
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  // Form
  formContainer: {
    gap: 14,
  },
  inputRowDouble: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
    marginBottom: 6,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  inputMultiline: {
    height: 76,
    textAlignVertical: "top",
  },

  bottomContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    // padding: 16,
    marginBottom: 50,
    // marginTop: 8,
    // shadowColor: "#000",
    // shadowOpacity: 0.06,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 2,
  },

  bottomSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomLeft: {
    flex: 1,
    marginRight: 16,
  },
  bottomTotal: {
    fontSize: 18,
    fontFamily: "Outfit-ExtraBold",
    color: COLORS.text,
  },
  bottomItems: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  outOfStockNote: {
    color: COLORS.error,
    fontFamily: "Outfit-Medium",
  },

  // Pay Button
  payButton: {
    backgroundColor: COLORS.deepBlue,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    // shadowColor: COLORS.primary,
    // shadowOpacity: 0.25,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 4 },
    // elevation: 4,
    minWidth: 160,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0,
  },
  payButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: "Outfit-Bold",
  },

  // Error states
  errorTitle: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: COLORS.text,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 8,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryText: {
    color: "white",
    fontFamily: "Outfit-Bold",
    fontSize: 14,
  },

  savedAddressBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  savedAddressBtnText: {
    fontSize: 14,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    margin: 20,
    maxHeight: "85%",
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: "Outfit-Medium",
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: "Outfit-SemiBold",
  },
  modalBody: {
    maxHeight: 400,
    paddingBottom: 8,
  },

  // Address option wrapper for edit button
  addressOptionWrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 4,
    overflow: "hidden",
  },

  addressOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    // backgroundColor: COLORS.backgroundSoft,
    backgroundColor: "#f8f9fa",
    // borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 0.25,
  },
  addressOptionContent: {
    flex: 1,
  },

  addressOptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressType: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.primary,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 6,
  },
  selectedBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  selectedBadgeText: {
    fontSize: 11,
    color: "white",
    fontFamily: "Outfit-SemiBold",
  },
  defaultBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 30,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: "white",
    fontFamily: "Outfit-SemiBold",
  },
  selectIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // Edit button for addresses
  editAddressBtn: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editAddressBtnText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
  },

  addNewAddressOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },

  addressName: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.text,
    marginBottom: 2,
  },
  addressDetails: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  addNewAddressContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  addNewAddressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addNewAddressPlus: {
    color: "white",
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
  },
  addNewAddressText: {
    flex: 1,
  },
  addNewAddressTitle: {
    fontSize: 15,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.primary,
    marginBottom: 2,
  },
  addNewAddressSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },

  // Add these to your styles object
  incompleteAddressBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 5,
  },
  incompleteAddressBadgeText: {
    fontSize: 11,
    color: "white",
    fontFamily: "Outfit-SemiBold",
  },
  incompleteAddressCard: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },

  // Add these to your styles object
  addressOptionSelected: {
    borderColor: "#29bf12", // Light sky blue
    backgroundColor: "transparent", // Alice blue (very light)
    borderWidth: 1.5,
  },
  selectedTickmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#29bf12", // Royal blue
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  selectedTickmarkText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Outfit-Bold",
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 24,
  },
  defaultBadgeIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: "green",
    fontFamily: "Outfit-SemiBold",
  },
});
