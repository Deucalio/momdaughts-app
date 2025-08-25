import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

// Configure these for your app
const CART_API = "http://192.168.18.5:3000/cart";
const CURRENCY_SYMBOL = "PKR ";

import { createOrder } from "../utils/actions";
import { useAuthenticatedFetch } from "../utils/authStore";

// Subtle, elegant color palette
const COLORS = {
  primary: "#6B46C1", // Deep purple
  primaryLight: "#8B5CF6", // Medium purple
  secondary: "#EC4899", // Muted pink
  accent: "#4F46E5", // Indigo
  text: "#111827", // Almost black
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
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const { authenticatedFetch } = useAuthenticatedFetch();

  // Animation for accordion
  const animatedHeight = useState(new Animated.Value(0))[0];
  const animatedRotation = useState(new Animated.Value(0))[0];

  // Address states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  // Payment states
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolderName: "",
  });

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor("#F5F5F5");
      StatusBar.setBarStyle("dark-content");
    }, [])
  );

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

  const shipping = subtotal > 2000 ? 0 : 150; // Free shipping over PKR 2000
  const tax = Math.round(subtotal * 0.17); // 17% tax (Pakistan GST)
  const discountAmount = appliedDiscount
    ? Math.round(subtotal * (appliedDiscount.percentage / 100))
    : 0;
  const total = subtotal + shipping + tax - discountAmount;

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
        SAVE10: { code: "SAVE10", percentage: 10, description: "10% off" },
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
    const payment = paymentInfo;

    const addressValid = (addr) =>
      addr.fullName.trim() &&
      addr.phone.trim() &&
      addr.email.trim() &&
      addr.address.trim() &&
      addr.city.trim() &&
      addr.state.trim() &&
      addr.postalCode.trim() &&
      addr.country.trim();

    const paymentValid =
      selectedPaymentMethod === "cod" ||
      (payment.cardNumber.trim() &&
        payment.expiryDate.trim() &&
        payment.cvv.trim() &&
        payment.cardHolderName.trim());

    return (
      addressValid(shipping) &&
      addressValid(billing) &&
      paymentValid &&
      availableItems.length > 0 &&
      total > 0
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
      paymentInfo,
      items: validItems,
      subtotal,
      shipping,
      tax,
      discountAmount,
      total,
    };
    console.log("data:", orderData);
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
      Alert.alert("Payment Failed", "Please try again.");
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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header with proper spacing */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Text style={styles.headerSubtitle}>Complete your order</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 240 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Collapsible Order Summary at Top */}
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
                    outputRange: [0, 600],
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
                  <Text style={styles.summaryLabel}>Tax (17%)</Text>
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

          {/* Shipping Address */}
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
            <AddressForm
              address={shippingAddress}
              onUpdate={updateShippingAddress}
            />
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
            </View>

            <Pressable
              onPress={() => setSameAsBilling(!sameAsBilling)}
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

          {/* Payment Method */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>💰</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Payment Method</Text>
                <Text style={styles.cardSubtitle}>
                  How would you like to pay?
                </Text>
              </View>
            </View>

            <View style={styles.paymentMethods}>
              <Pressable
                onPress={() => setSelectedPaymentMethod("card")}
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === "card" &&
                    styles.paymentOptionSelected,
                ]}
              >
                <View style={styles.paymentOptionContent}>
                  <Text style={styles.paymentOptionIcon}>💳</Text>
                  <View style={styles.paymentOptionText}>
                    <Text style={styles.paymentOptionTitle}>
                      Credit/Debit Card
                    </Text>
                    <Text style={styles.paymentOptionSubtitle}>
                      Visa, Mastercard, JCB
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    selectedPaymentMethod === "card" &&
                      styles.radioButtonSelected,
                  ]}
                />
              </Pressable>

              <Pressable
                onPress={() => setSelectedPaymentMethod("cod")}
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === "cod" &&
                    styles.paymentOptionSelected,
                ]}
              >
                <View style={styles.paymentOptionContent}>
                  <Text style={styles.paymentOptionIcon}>🚚</Text>
                  <View style={styles.paymentOptionText}>
                    <Text style={styles.paymentOptionTitle}>
                      Cash on Delivery
                    </Text>
                    <Text style={styles.paymentOptionSubtitle}>
                      Pay when you receive
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    selectedPaymentMethod === "cod" &&
                      styles.radioButtonSelected,
                  ]}
                />
              </Pressable>
            </View>

            {selectedPaymentMethod === "card" && (
              <PaymentForm
                paymentInfo={paymentInfo}
                onUpdate={(field, value) =>
                  setPaymentInfo((prev) => ({ ...prev, [field]: value }))
                }
              />
            )}
          </View>
        </ScrollView>

        {/* Enhanced Fixed Bottom Container */}
        <View style={styles.bottomContainer}>
          <View style={styles.bottomGradient} />
          <View style={styles.bottomContent}>
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
                  (!isFormValid() || processingPayment) &&
                    styles.payButtonDisabled,
                ]}
              >
                {processingPayment ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.payButtonText}>
                    {selectedPaymentMethod === "cod"
                      ? "Place Order"
                      : "Pay Now"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
          label="Full Name"
          value={address.fullName}
          onChangeText={(value) => onUpdate("fullName", value)}
          placeholder="Enter your full name"
          autoCapitalize="words"
          containerStyle={{ flex: 1 }}
          required
        />
        <View style={{ width: 12 }} />
        <FormInput
          label="Phone Number"
          value={address.phone}
          onChangeText={(value) => onUpdate("phone", value)}
          placeholder="+92 300 1234567"
          keyboardType="phone-pad"
          containerStyle={{ flex: 1 }}
          required
        />
      </View>

      <FormInput
        label="Email Address"
        value={address.email}
        onChangeText={(value) => onUpdate("email", value)}
        placeholder="your@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      <FormInput
        label="Street Address"
        value={address.address}
        onChangeText={(value) => onUpdate("address", value)}
        placeholder="House no, Street name, Area"
        multiline
        required
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
          label="State/Province"
          value={address.state}
          onChangeText={(value) => onUpdate("state", value)}
          placeholder="State"
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

function PaymentForm({ paymentInfo, onUpdate }) {
  return (
    <View style={styles.formContainer}>
      <FormInput
        label="Card Holder Name"
        value={paymentInfo.cardHolderName}
        onChangeText={(value) => onUpdate("cardHolderName", value)}
        placeholder="Name as on card"
        autoCapitalize="words"
        required
      />

      <FormInput
        label="Card Number"
        value={paymentInfo.cardNumber}
        onChangeText={(value) => onUpdate("cardNumber", value)}
        placeholder="1234 5678 9012 3456"
        keyboardType="number-pad"
        maxLength={19}
        required
      />

      <View style={styles.inputRowDouble}>
        <FormInput
          label="Expiry Date"
          value={paymentInfo.expiryDate}
          onChangeText={(value) => onUpdate("expiryDate", value)}
          placeholder="MM/YY"
          keyboardType="number-pad"
          maxLength={5}
          containerStyle={{ flex: 1 }}
          required
        />
        <View style={{ width: 12 }} />
        <FormInput
          label="CVV"
          value={paymentInfo.cvv}
          onChangeText={(value) => onUpdate("cvv", value)}
          placeholder="123"
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
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
    backgroundColor: COLORS.backgroundSoft,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 8 : 20, // More space for Android status bar
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
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
    fontWeight: "500",
  },

  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
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
    fontWeight: "600",
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
    fontWeight: "600",
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
    fontWeight: "600",
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
    fontWeight: "600",
  },
  miniPrice: {
    fontSize: 13,
    fontWeight: "600",
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
    fontWeight: "600",
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
    backgroundColor: COLORS.primary,
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
    fontWeight: "600",
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
    fontWeight: "700",
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
    fontWeight: "bold",
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
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "600",
  },
  discountLabel: {
    color: COLORS.success,
  },
  discountValue: {
    color: COLORS.success,
  },
  freeText: {
    color: COLORS.success,
    fontWeight: "700",
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
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "800",
  },

  // Cards
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    padding: 12,
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 10,
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
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
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
    borderColor: COLORS.border,
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
    fontWeight: "600",
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
    fontWeight: "600",
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

  // Enhanced Bottom Container
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? 34 : 20, // Extra space for 3-button navigation
  },
  bottomGradient: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  bottomContent: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
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
    fontWeight: "800",
    color: COLORS.text,
  },
  bottomItems: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  outOfStockNote: {
    color: COLORS.error,
    fontWeight: "500",
  },

  // Pay Button
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minWidth: 120,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0,
  },
  payButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },

  // Error states
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
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
    fontWeight: "700",
    fontSize: 14,
  },
});
