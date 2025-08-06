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

// Purple gradient theme colors
const COLORS = {
  darkest: "#21152B",
  dark: "#2C103A",
  medium: "#382449",
  light: "#432B57",
  lightest: "#4E3366",
  white: "#ffffff",
  buttonColor: "#2c2a6b",
};

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const {user} = useAuthStore();


  const fetchCartItems = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await authenticatedFetch(`${BACKEND_URL}/cart?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      console.log("Data:" , data)
      const data = await response.json();
      setCartItems(data.cartItems || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      Alert.alert("Error", "Failed to load cart items");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setUpdatingItem(itemId);
    try {
      const response = await authenticatedFetch(
        `${BACKEND_URL}/cart/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (!response.ok) throw new Error("Failed to update quantity");

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Failed to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await authenticatedFetch(
                `${BACKEND_URL}/cart/${itemId}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) throw new Error("Failed to remove item");

              setCartItems((prev) => prev.filter((item) => item.id !== itemId));
            } catch (error) {
              console.error("Error removing item:", error);
              Alert.alert("Error", "Failed to remove item");
            }
          },
        },
      ]
    );
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

  const renderCartItem = ({ item }) => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Product Image */}
        <Image
          source={{
            uri:
              item.productImage ||
              `https://via.placeholder.com/100x100/4E3366/white?text=Product`,
          }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            backgroundColor: COLORS.lightest,
          }}
          resizeMode="cover"
        />

        {/* Product Details */}
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: COLORS.darkest,
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {item.productTitle}
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: COLORS.medium,
              marginBottom: 8,
            }}
          >
            Rs. {item.price.toFixed(2)}
          </Text>

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
                backgroundColor: "#f5f5f5",
                borderRadius: 20,
                paddingHorizontal: 4,
              }}
            >
              <TouchableOpacity
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: COLORS.lightest,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={updatingItem === item.id}
              >
                <Ionicons name="remove" size={16} color={COLORS.white} />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: COLORS.darkest,
                  marginHorizontal: 16,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </Text>

              <TouchableOpacity
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: COLORS.lightest,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={updatingItem === item.id}
              >
                <Ionicons name="add" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 8,
              }}
              onPress={() => removeItem(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Item Total */}
      <View
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          alignItems: "flex-end",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: COLORS.darkest,
          }}
        >
          Subtotal: Rs. {(item.price * item.quantity).toFixed(2)}
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
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: COLORS.lightest,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Ionicons name="bag-outline" size={60} color={COLORS.white} />
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: COLORS.darkest,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Your cart is empty
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: "#666",
          textAlign: "center",
          marginBottom: 32,
          lineHeight: 24,
        }}
      >
        Looks like you haven't added any items to your cart yet. Start shopping
        to fill it up!
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: COLORS.buttonColor,
          borderRadius: 25,
          paddingHorizontal: 32,
          paddingVertical: 12,
        }}
        onPress={() => router.push("/shop")}
      >
        <Text
          style={{
            color: COLORS.white,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Start Shopping
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={{ paddingHorizontal: 20 }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            marginBottom: 16,
            padding: 16,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 12,
              backgroundColor: "#ffc4d6",
            }}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <View
              style={{
                height: 16,
                backgroundColor: "#f0f0f0",
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <View
              style={{
                height: 14,
                backgroundColor: "#f0f0f0",
                borderRadius: 4,
                width: "60%",
                marginBottom: 12,
              }}
            />
            <View
              style={{
                height: 32,
                backgroundColor: "#f0f0f0",
                borderRadius: 16,
                width: "40%",
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: COLORS.white,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkest} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text
            style={{ fontSize: 20, fontWeight: "600", color: COLORS.darkest }}
          >
            My Cart
          </Text>
          {cartItems.length > 0 && (
            <Text style={{ fontSize: 14, color: "#666" }}>
              {calculateItemsCount()} item
              {calculateItemsCount() !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ScrollView style={{ flex: 1, paddingTop: 20 }}>
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
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.light]}
              />
            }
          />

          {/* Bottom Summary */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: COLORS.white,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            {/* Order Summary */}
            <View
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: "#666" }}>
                  Subtotal ({calculateItemsCount()} items)
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: COLORS.darkest,
                  }}
                >
                  Rs. {calculateTotal().toFixed(2)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: "#666" }}>Shipping</Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#4CAF50" }}
                >
                  Free
                </Text>
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: "#e0e0e0",
                  marginVertical: 12,
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
                    fontSize: 18,
                    fontWeight: "bold",
                    color: COLORS.darkest,
                  }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: COLORS.darkest,
                  }}
                >
                  Rs. {calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.buttonColor,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                shadowColor: COLORS.buttonColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={() => router.push("/checkout")}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 18,
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
