"use client";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";

const BACKEND_URL = "http://192.168.18.5:3000";
const { width, height } = Dimensions.get("window");

// Updated color palette - more modern and clean
const COLORS = {
  darkest: "#21152B",
  dark: "#2C103A",
  medium: "#382449",
  light: "#432B57",
  lightest: "#4E3366",
  white: "#ffffff",
  background: "#f8f9fa",
  buttonColor: "#2c2a6b",
  accent: "#eb9fc1",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  border: "#e5e7eb",
};

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuthStore();

  const fetchCartItems = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await authenticatedFetch(`${BACKEND_URL}/cart`);
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      const data = await response.json();
      setCartItems(data.cart || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      Alert.alert("Error", "Failed to load cart items");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const pendingUpdates = new Map(); // Track pending updates
  const activeRequests = new Map(); // Track active API requests
  const updateQueue = new Map(); // Queue updates during active requests

  const debouncedUpdateToServer = debounce(async (itemId) => {
    // Get the latest quantity for this item
    const quantity = pendingUpdates.get(itemId);
    if (quantity === undefined) return;

    // Check if there's already an active request for this item
    if (activeRequests.has(itemId)) {
      // Queue this update to be processed after current request completes
      updateQueue.set(itemId, quantity);
      return;
    }

    try {
      // Mark request as active
      activeRequests.set(itemId, true);


      const response = await authenticatedFetch(
        `${BACKEND_URL}/cart/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }


      // Clear the pending update since it was successful
      pendingUpdates.delete(itemId);

      // Update the UI to reflect server state (remove the temporary flag)
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantityUserInput: undefined } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);

      // Show user-friendly error message
      const errorMessage = error.message.includes("Failed to fetch")
        ? "Network error. Please check your connection and try again."
        : "Failed to update quantity on server";

      Alert.alert("Error", errorMessage);

      // Rollback UI on failure - restore original quantity
      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            // Find what the original quantity was before user input
            const originalQuantity =
              item.quantityUserInput !== undefined
                ? item.quantity - item.quantityUserInput + item.quantity
                : item.quantity;
            return {
              ...item,
              quantity: originalQuantity,
              quantityUserInput: undefined,
            };
          }
          return item;
        })
      );

      // Keep the failed update in pending so user can retry
      // pendingUpdates keeps the failed quantity
    } finally {
      // Mark request as complete
      activeRequests.delete(itemId);

      // Process any queued updates
      if (updateQueue.has(itemId)) {
        const queuedQuantity = updateQueue.get(itemId);
        updateQueue.delete(itemId);
        pendingUpdates.set(itemId, queuedQuantity);

        // Trigger another debounced update for queued changes
        debouncedUpdateToServer(itemId);
      }
    }
  }, 500); // Increased delay to reduce server load

  // Rate limiting for spam clicks
  const lastUpdateTime = new Map();
  const RATE_LIMIT_MS = 100; // Minimum time between updates for same item

  const updateQuantity = (itemId, newQuantity) => {
    // Rate limiting check
    const now = Date.now();
    const lastTime = lastUpdateTime.get(itemId) || 0;

    if (now - lastTime < RATE_LIMIT_MS) {
      console.log(`Rate limiting update for item ${itemId}`);
      return; // Ignore rapid successive clicks
    }

    lastUpdateTime.set(itemId, now);

    // Handle removal case
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }


    // Instant local update with optimistic UI
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            quantityUserInput: newQuantity,
            // Add a flag to show this is pending sync
            isPending: true,
          };
        }
        return item;
      })
    );

    // Track the latest update for this item
    pendingUpdates.set(itemId, newQuantity);

    // Debounce the server request
    debouncedUpdateToServer(itemId);
  };

  // Simplified remove function without animation
  const removeItem = async (itemId) => {
    try {
      const response = await authenticatedFetch(
        `${BACKEND_URL}/cart/${itemId}`,
        {
          method: "DELETE",
          body: JSON.stringify({}), // Send dummy body
        }
      );

      if (!response.ok) throw new Error("Failed to remove item");

      // Remove from state immediately
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCartItems(true);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const renderStatusBadge = (item) => {
    // Check if user requested more than available
    if (item.quantityUserInput && item.quantityUserInput > item.quantity) {
      return (
        <View
          style={{
            backgroundColor: "#fef3c7",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="warning" size={12} color={COLORS.warning} />
          <Text
            style={{
              fontSize: 10,
              color: COLORS.warning,
              fontWeight: "500",
              marginLeft: 4,
              flex: 1,
            }}
          >
            Requested {item.quantityUserInput}, only {item.quantity} available
          </Text>
        </View>
      );
    }

    if (item.isOutOfStock) {
      return (
        <View
          style={{
            backgroundColor: "#fef2f2",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="close-circle" size={12} color={COLORS.error} />
          <Text
            style={{
              fontSize: 10,
              color: COLORS.error,
              fontWeight: "600",
              marginLeft: 4,
            }}
          >
            Out of Stock
          </Text>
        </View>
      );
    }

    if (item.isQuantityAdjusted) {
      return (
        <View
          style={{
            backgroundColor: "#fef3c7",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="warning" size={12} color={COLORS.warning} />
          <Text
            style={{
              fontSize: 10,
              color: COLORS.warning,
              fontWeight: "500",
              marginLeft: 4,
            }}
          >
            Quantity adjusted
          </Text>
        </View>
      );
    }

    if (item.isPriceUpdated) {
      return (
        <View
          style={{
            backgroundColor: "#dbeafe",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginTop: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="information-circle" size={12} color="#3b82f6" />
          <Text
            style={{
              fontSize: 10,
              color: "#3b82f6",
              fontWeight: "500",
              marginLeft: 4,
            }}
          >
            Price updated
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderCartItem = ({ item }) => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Product Image */}
        <View
          style={{
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: COLORS.lightGray,
            position: "relative",
          }}
        >
          <Image
            source={{
              uri:
                item.variantImage ||
                `https://via.placeholder.com/70x70/4E3366/white?text=Product`,
            }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
          {item.isOutOfStock && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 8,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                OUT OF{"\n"}STOCK
              </Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.darkest,
              marginBottom: 2,
              lineHeight: 16,
            }}
            numberOfLines={2}
          >
            {item.productTitle}
          </Text>

          {item.title && (
            <Text
              style={{
                fontSize: 11,
                color: COLORS.gray,
                marginBottom: 4,
              }}
            >
              {item.title}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: COLORS.darkest,
              }}
            >
              Rs. {item.price.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.gray,
                marginLeft: 6,
                backgroundColor: COLORS.lightGray,
                paddingHorizontal: 4,
                paddingVertical: 1,
                borderRadius: 6,
              }}
            >
              {item.variantInventoryQuantity} left
            </Text>
          </View>

          {/* Quantity Controls */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.lightGray,
                borderRadius: 16,
                paddingHorizontal: 3,
                paddingVertical: 3,
              }}
            >
              <TouchableOpacity
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: COLORS.buttonColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={updatingItem === item.id || item.isOutOfStock}
              >
                <Ionicons name="remove" size={22} color={COLORS.white} />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.darkest,
                  marginHorizontal: 12,
                  minWidth: 16,
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </Text>

              <TouchableOpacity
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: COLORS.buttonColor,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: item.isOutOfStock ? 0.5 : item.quantity >= item.variantInventoryQuantity ? 0.5 : 1,
                }}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={
                  updatingItem === item.id ||
                  item.isOutOfStock ||
                  item.quantity >= item.variantInventoryQuantity
                }
              >
              
                <Ionicons
                  name="add"
            
                  size={12}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              style={{
                padding: 6,
                borderRadius: 6,
                backgroundColor: "#fef2f2",
              }}
              onPress={() => removeItem(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          {/* Status Badges */}
          {renderStatusBadge(item)}
        </View>
      </View>

      {/* Item Total */}
      <View
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 11,
            color: COLORS.gray,
          }}
        >
          Item Total
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "bold",
            color: COLORS.darkest,
          }}
        >
          Rs. {(item.price * item.quantity).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingVertical: 60,
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: COLORS.lightGray,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Ionicons name="bag-outline" size={50} color={COLORS.gray} />
      </View>

      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: COLORS.darkest,
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        Your cart is empty
      </Text>

      <Text
        style={{
          fontSize: 13,
          color: COLORS.gray,
          textAlign: "center",
          marginBottom: 24,
          lineHeight: 18,
        }}
      >
        Looks like you haven't added any items to your cart yet. Start shopping
        to fill it up!
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: COLORS.buttonColor,
          borderRadius: 20,
          paddingHorizontal: 24,
          paddingVertical: 10,
        }}
        onPress={() => router.push("/shop")}
      >
        <Text
          style={{
            color: COLORS.white,
            fontSize: 13,
            fontWeight: "600",
          }}
        >
          Start Shopping
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 12,
            marginBottom: 8,
            padding: 12,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 8,
              backgroundColor: COLORS.lightGray,
            }}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View
              style={{
                height: 13,
                backgroundColor: COLORS.lightGray,
                borderRadius: 4,
                marginBottom: 4,
              }}
            />
            <View
              style={{
                height: 11,
                backgroundColor: COLORS.lightGray,
                borderRadius: 4,
                width: "60%",
                marginBottom: 6,
              }}
            />
            <View
              style={{
                height: 24,
                backgroundColor: COLORS.lightGray,
                borderRadius: 12,
                width: "40%",
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Compact Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: COLORS.white,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 6,
            borderRadius: 6,
            backgroundColor: COLORS.lightGray,
          }}
        >
          <Ionicons name="chevron-back" size={18} color={COLORS.darkest} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: COLORS.darkest,
            }}
          >
            My Cart
          </Text>
          {cartItems.length > 0 && (
            <Text style={{ fontSize: 11, color: COLORS.gray }}>
              {calculateItemsCount()} item
              {calculateItemsCount() !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <ScrollView style={{ flex: 1, paddingTop: 12 }}>
          {renderLoadingSkeleton()}
        </ScrollView>
      ) : cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <View style={{ flex: 1 }}>
          {/* Cart Items */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: 160, // Reduced from 200 to 160
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.buttonColor]}
                tintColor={COLORS.buttonColor}
              />
            }
          />

          {/* Compact Bottom Summary */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: COLORS.white,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 6,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            {/* Compact Order Summary */}
            <View
              style={{
                backgroundColor: COLORS.lightGray,
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 12, color: COLORS.gray }}>
                  Subtotal ({calculateItemsCount()} items)
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: COLORS.darkest,
                  }}
                >
                  Rs. {calculateTotal().toLocaleString()}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: COLORS.gray }}>
                  Shipping
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: COLORS.success,
                  }}
                >
                  Free
                </Text>
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: COLORS.border,
                  marginVertical: 8,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: COLORS.darkest,
                  }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: COLORS.buttonColor,
                  }}
                >
                  Rs. {calculateTotal().toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Compact Checkout Button */}
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.buttonColor,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                shadowColor: COLORS.buttonColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={() => router.push("/screens/checkout")}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
