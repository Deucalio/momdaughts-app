"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useAuthenticatedFetch } from "../utils/authStore";
import { createCartOperations } from "../utils/cartOperations";

const COLORS = {
  white: "#ffffff",
  background: "#f8f9fa",
  text: "#1a1a1a",
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  deepBlue: "#2c2a6b",
  almostBlack: "#040707",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  border: "#e5e7eb",
  primary: "#16a085",
  black: "#000000",
  error: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
};

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { authenticatedFetch } = useAuthenticatedFetch();

  // Use useRef to maintain the same instance across renders
  const cartOpsRef = useRef(null);

  // Initialize cart operations only once
  if (!cartOpsRef.current) {
    cartOpsRef.current = createCartOperations(authenticatedFetch);
  }

  const cartOps = cartOpsRef.current;

  const fetchCartItems = useCallback(
    async (isRefresh = false) => {
      await cartOps.fetchCartItems(setCartItems, setLoading, isRefresh);
    },
    [cartOps]
  );

  const updateQuantity = useCallback(
    (itemId, newQuantity) => {
      cartOps.updateQuantity(itemId, newQuantity, setCartItems, removeItem);
    },
    [cartOps]
  );

  const removeItem = useCallback(
    async (itemId) => {
      await cartOps.removeItem(itemId, setCartItems);
    },
    [cartOps]
  );

  const handleRefresh = useCallback(async () => {
    await cartOps.handleRefresh(setCartItems, setLoading, setRefreshing);
  }, [cartOps]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [])
  );

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
  };

  const navigateToProduct = (item) => {
    router.push(
      `/products/${item.shopifyProductId}?variantId=${item.shopifyVariantId}`
    );
  };

  const renderStatusBadge = (item) => {
    // Check if user requested more than available
    if (
      item.quantityUserInput &&
      item.quantityUserInput > item.variantInventoryQuantity
    ) {
      return (
        <View style={styles.statusBadge}>
          <Ionicons name="warning" size={12} color={COLORS.warning} />
          <Text style={[styles.statusText, { color: COLORS.warning }]}>
            Requested {item.quantityUserInput} quantity not available
          </Text>
        </View>
      );
    }

    if (item.isOutOfStock) {
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#fef2f2" }]}>
          <Ionicons name="close-circle" size={12} color={COLORS.error} />
          <Text style={[styles.statusText, { color: COLORS.error }]}>
            Out of Stock
          </Text>
        </View>
      );
    }

    if (item.isPriceUpdated) {
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#dbeafe" }]}>
          <Ionicons name="information-circle" size={12} color="#3b82f6" />
          <Text style={[styles.statusText, { color: "#3b82f6" }]}>
            Price updated
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.imageContainer}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => navigateToProduct(item)}>
          <Image
            source={{
              uri:
                item.variantImage ||
                `https://via.placeholder.com/80x80/4E3366/white?text=Product`,
            }}
            style={styles.productImage}
            contentFit="cover"
          />
        </TouchableOpacity>

        {item.isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>OUT OF{"\n"}STOCK</Text>
          </View>
        )}
      </View>

      <View style={styles.productDetails}>
        <TouchableOpacity
          onPress={() => navigateToProduct(item)}
          activeOpacity={0.5}
          numberOfLines={2}
        >
          <Text style={styles.productTitle}>{item.productTitle}</Text>
        </TouchableOpacity>

        {item.title && (
          <View style={styles.productInfo}>
            <Text style={styles.productInfo}>{item.title}</Text>
          </View>
        )}

        <Text style={styles.productPrice}>
          Rs. {(item.price || 0).toLocaleString()}
        </Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              { opacity: item.isOutOfStock ? 0.5 : 1 },
            ]}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.isOutOfStock}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              { opacity: item.isOutOfStock ? 0.5 : 1 },
            ]}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.isOutOfStock}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Status Badges */}
        {renderStatusBadge(item)}
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, { opacity: item.isPending ? 0.5 : 1 }]}
        onPress={() => removeItem(item.id)}
        disabled={item.isPending}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <View style={styles.emptyCartIcon}>
        <Ionicons name="bag-outline" size={50} color={COLORS.gray} />
      </View>

      <Text style={styles.emptyCartTitle}>Your cart is empty</Text>

      <Text style={styles.emptyCartText}>
        Looks like you haven't added any items to your cart yet. Start shopping
        to fill it up!
      </Text>

      <TouchableOpacity
        style={styles.startShoppingButton}
        onPress={() => router.push("/shop")}
      >
        <Text style={styles.startShoppingText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonDetails}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonInfo} />
            <View style={styles.skeletonPrice} />
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.black} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Cart</Text>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              {/* <Text style={styles.logoText}>LOGO</Text> */}
              <Image
                source={{ uri: "https://i.ibb.co/391FfHYS/Layer-1.png" }}
                style={styles.logo}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderLoadingSkeleton()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.black} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Cart</Text>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Image
                source={{ uri: "https://i.ibb.co/391FfHYS/Layer-1.png" }}
                style={styles.logo}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
          </View>
        </View>

        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.itemCount}>{getTotalItems()} items</Text>
        </View>

        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image
              source={{ uri: "https://i.ibb.co/391FfHYS/Layer-1.png" }}
              style={styles.logo}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Cart Items */}
        {cartItems.map(renderCartItem)}
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomSummary}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalAmount}>
            Rs. {getTotalPrice().toLocaleString()}
          </Text>
        </View>

        <View style={styles.finalTotalRow}>
          <Text style={styles.finalTotalLabel}>Total Amount</Text>
          <Text style={styles.finalTotalAmount}>
            Rs. {getTotalPrice().toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.checkoutButton}
          onPress={() => router.push("/screens/checkout")}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  itemCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  logoContainer: {
    width: 40,
    alignItems: "flex-end",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 8,
    fontWeight: "600",
    color: COLORS.gray,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: "flex-start",
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  productInfo: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginHorizontal: 16,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
    flex: 1,
  },
  promoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  promoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  promoText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
  },
  loyaltySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  loyaltyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  loyaltyText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
  },
  bottomSummary: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  totalAmount: {
    fontSize: 14,
    color: COLORS.text + 80,
  },
  finalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  finalTotalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  checkoutButton: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",

      shadowColor: COLORS.deepBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    
  },
  // Empty cart styles
  emptyCartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyCartIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyCartText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  startShoppingButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  startShoppingText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  // Loading skeleton styles
  skeletonItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    flexDirection: "row",
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  skeletonDetails: {
    flex: 1,
    marginLeft: 10,
  },
  skeletonTitle: {
    height: 13,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonInfo: {
    height: 11,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: "60%",
    marginBottom: 6,
  },
  skeletonPrice: {
    height: 24,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    width: "40%",
  },
});
