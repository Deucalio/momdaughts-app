import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  PressableOpacity,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthenticatedFetch } from "../utils/authStore";
import { useFocusEffect, useRouter } from "expo-router";

import { fetchWishlistItems } from "../utils/actions";
import { Touchable } from "react-native";

// Your color theme
const COLORS = {
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  deepBlue: "#2c2a6b",
  almostBlack: "#040707",
  white: "#ffffff",
  // Additional utility colors
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
  success: "#28a745",
  danger: "#dc3545",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

export default function WishlistScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(new Set());
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor("#F5F5F5");
      StatusBar.setBarStyle("dark-content");
    }, [])
  );

  // Simulate API call
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        // await new Promise(resolve => setTimeout(resolve, 1500));
        const wishlistItems = await fetchWishlistItems(authenticatedFetch);
        console.log("wishlistItems:", wishlistItems);
        setWishlistItems(wishlistItems.wishlist);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        Alert.alert("Error", "Failed to load your wishlist. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleRemoveFromWishlist = async (itemId) => {
    setRemovingItems((prev) => new Set([...prev, itemId]));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));

      // Show success feedback
      Alert.alert("Removed", "Variant removed from your wishlist.");
    } catch (error) {
      Alert.alert("Error", "Failed to remove variant. Please try again.");
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (item) => {
    if (item.isOutOfStock || item.variantInventoryQuantity <= 0) {
      Alert.alert("Out of Stock", "This variant is currently unavailable.");
      return;
    }

    setAddingToCart((prev) => new Set([...prev, item.id]));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        "Added to Cart",
        `${item.title} has been added to your cart.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => navigation.navigate("Cart") },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add variant to cart. Please try again.");
    } finally {
      setAddingToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const renderWishlistItem = ({ item }) => (
    <WishlistItem
      navigateToProduct={() => {
        console.log("\n\nitem:", item);
        router.push(
          `/products/${item.shopifyProductId}?variantId=${item.shopifyVariantId}`
        );
      }}
      item={item}
      onRemove={() => handleRemoveFromWishlist(item.id)}
      onAddToCart={() => handleAddToCart(item)}
      isRemoving={removingItems.has(item.id)}
      isAddingToCart={addingToCart.has(item.id)}
    />
  );

  const renderSkeletonItem = () => (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonVariant} />
        <View style={styles.skeletonPrice} />
        <View style={styles.skeletonStock} />
        <View style={styles.skeletonButton} />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={50} color={COLORS.mediumPink} />
      </View>
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Save your favorite product variants here to purchase them later
      </Text>
      <Pressable
        style={styles.shopNowButton}
        onPress={() => router.push("/shop")}
      >
        <Text style={styles.shopNowText}>Start Shopping</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={"#000000"} />
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading..." : `${wishlistItems.length} variants saved`}
          </Text>
        </View>

        <View style={styles.headerDecoration} />
      </View>

      {/* Content */}
      {loading ? (
        <FlatList
          data={Array(6).fill(null)}
          renderItem={renderSkeletonItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : wishlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function WishlistItem({
  item,
  onRemove,
  onAddToCart,
  isRemoving,
  isAddingToCart,
  navigateToProduct,
}) {
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleRemove = () => {
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onRemove();
  };

  const formatPrice = (price) => `PKR ${price?.toLocaleString() || "N/A"}`;

  const getStockStatus = () => {
    if (item.isOutOfStock || item.variantInventoryQuantity <= 0) {
      return { text: "Out of Stock", color: COLORS.danger };
    }
    if (item.variantInventoryQuantity <= 5) {
      return {
        text: `Only ${item.variantInventoryQuantity} left`,
        color: COLORS.mediumPink,
      };
    }
    return { text: "In Stock", color: COLORS.success };
  };

  const stockStatus = getStockStatus();
  const isAvailable = !item.isOutOfStock && item.variantInventoryQuantity > 0;

  return (
    <Animated.View style={[styles.itemContainer, { opacity: fadeAnim }]}>
      <View style={styles.itemCard}>
        {/* Remove Button */}
        <Pressable
          style={styles.removeButton}
          onPress={handleRemove}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="close" size={16} color={COLORS.white} />
          )}
        </Pressable>

        {/* Product Image */}
        <TouchableOpacity
          onPress={() => navigateToProduct()}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: item.variantImage }}
            style={styles.productImage}
            defaultSource={{
              uri: "https://via.placeholder.com/400x400/f8f9fa/6c757d?text=Product",
            }}
          />
          {!isAvailable && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.variantTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <View
              style={[
                styles.stockIndicator,
                { backgroundColor: stockStatus.color },
              ]}
            />
            <Text style={[styles.stockText, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>

          {/* Price */}
          {item.price && (
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>{formatPrice(item.price)}</Text>
              {/* {item.originalPrice && item.originalPrice > item.price && (
                <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
              )} */}
            </View>
          )}

          {/* Added Date */}
          <Text style={styles.addedDate}>
            Added {new Date(item.addedAt).toLocaleDateString()}
          </Text>

          {/* Add to Cart Button */}
          <Pressable
            style={[
              styles.addToCartButton,
              !isAvailable && styles.addToCartButtonDisabled,
            ]}
            onPress={onAddToCart}
            disabled={isAddingToCart || !isAvailable}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.addToCartText}>
                {isAvailable ? "Add to Cart" : "Out of Stock"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 8 : 35,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.almostBlack,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: COLORS.mediumPink,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.darkBlue,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  headerDecoration: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lavender,
    opacity: 0.3,
    zIndex: 1,
  },

  // List
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
  },

  // Wishlist Item
  itemContainer: {
    width: ITEM_WIDTH,
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: COLORS.almostBlack,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.mediumPink,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: COLORS.almostBlack,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Image
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  productImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  // Product Info
  productInfo: {
    gap: 8,
  },
  variantTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkBlue,
    lineHeight: 18,
  },

  // Stock Status
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Price
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.darkBlue,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.mediumGray,
    textDecorationLine: "line-through",
  },

  // Added Date
  addedDate: {
    fontSize: 10,
    color: COLORS.mediumGray,
    fontStyle: "italic",
  },

  // Add to Cart Button
  addToCartButton: {
    backgroundColor: COLORS.darkBlue,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  // Skeleton Loading
  skeletonItem: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: COLORS.almostBlack,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  skeletonImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    marginBottom: 12,
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: "80%",
  },
  skeletonVariant: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: "60%",
  },
  skeletonPrice: {
    height: 14,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: "60%",
  },
  skeletonStock: {
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: "50%",
  },
  skeletonButton: {
    height: 36,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginTop: 4,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.darkBlue,
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: COLORS.mediumPink,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: COLORS.mediumPink,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  shopNowText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
