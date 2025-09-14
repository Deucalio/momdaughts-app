// https://www.behance.net/gallery/211430663/mobile-app-uiux-case-routine-tracker-app?tracking_source=search_projects|skincare+routine+mobile&l=0
"use client";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import ScreenWrapper from "../../components/ScreenWrapper";
import Text from "../../components/Text";
import {
    fetchCartItemsCount,
    fetchRecentOrders,
    fetchTotalWishlistItemsCount,
} from "../utils/actions";
import { logOut } from "../utils/auth";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";
const BACKEND_URL = "https://95d408fcc5df.ngrok-free.app";
const { width } = Dimensions.get("window");

// Color palette matching the cart design
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

// const orderHistory_ = [
//   {
//     id: 1,
//     orderNumber: "ORD12345",
//     itemsCount: 3,
//     total: 1200,
//     status: "delivered",
//   },
//   {
//     id: 2,
//     orderNumber: "ORD67890",
//     itemsCount: 2,
//     total: 800,
//     status: "processing",
//   },
//   {
//     id: 3,
//     orderNumber: "ORD11223",
//     itemsCount: 5,
//     total: 2500,
//     status: "delivered",
//   },
//   {
//     id: 4,
//     orderNumber: "ORD44556",
//     itemsCount: 1,
//     total: 350,
//     status: "delivered",
//   },
//   {
//     id: 5,
//     orderNumber: "ORD78901",
//     itemsCount: 4,
//     total: 1500,
//     status: "processing",
//   },
// ];

export default function AccountScreen() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [totalWishlistItemsCount, setTotalWishlistItemsCount] = useState(0);
  const router = useRouter();

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuthStore();

  const loadCartItemsCount = async () => {
    try {
      const result = await fetchCartItemsCount(authenticatedFetch);
      if (result.success) {
        setCartItemCount(result.count);
      }
    } catch (error) {
      // console.error("[v0] Failed to load cart count:", error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const result = await fetchRecentOrders(authenticatedFetch);
      if (result.success) {
        setOrderHistory(result.orders);
      }
    } catch (error) {
      // console.error("[v0] Failed to load recent orders:", error);
    }
  };

  const loadWishlistItemsCount = async () => {
    try {
      const result = await fetchTotalWishlistItemsCount(authenticatedFetch);
      setTotalWishlistItemsCount(result);
    } catch (error) {
      // console.error("[v0] Failed to load wishlist count:", error);
    }
  };

  const fetchUserProfile = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      // Fetch user profile
      const profileResponse = await authenticatedFetch(
        `${BACKEND_URL}/user/profile`
      );
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      // Fetch recent orders
      const ordersResponse = await authenticatedFetch(
        `${BACKEND_URL}/orders?limit=3`
      );
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrderHistory(ordersData.orders || []);
      }
    } catch (error) {
      // console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    console.log("Logging out...");
    const res = await logOut();
    if (res) {
      router.replace("/auth/login");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile(true);
  };

  useEffect(() => {
    fetchUserProfile();
    //  loadCartItemsCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Use requestAnimationFrame to defer state updates
      requestAnimationFrame(() => {
        if (!user) {
          router.replace("/auth/login");
        }
        loadCartItemsCount();
        loadWishlistItemsCount();
        loadRecentOrders();
      });
    }, [])
  );

  const menuItems = [
    {
      id: "orders",
      title: "My Orders",
      subtitle: "Track your orders",
      icon: "bag-outline",
      onPress: () => router.push("/screens/orders"),
      badge: orderHistory.length > 0 ? orderHistory.length.toString() : null,
    },
    {
      id: "wishlist",
      title: "Wishlist",
      subtitle: "Your saved items",
      icon: "heart-outline",
      onPress: () => router.push("/screens/wishlist"),
      badge:
        totalWishlistItemsCount > 0 ? totalWishlistItemsCount.toString() : null,
    },
    {
      id: "addresses",
      title: "Addresses",
      subtitle: "Manage delivery addresses",
      icon: "location-outline",
      onPress: () => router.push("/screens/addresses"),
    },
    {
      id: "support",
      title: "Help & Support",
      subtitle: "Get help when you need it",
      icon: "help-circle-outline",
      onPress: () => router.push("/screens/helpsupport"),
    },
    {
      id: "about",
      title: "About",
      subtitle: "App info & terms",
      icon: "information-circle-outline",
      onPress: () => router.push("/screens/aboutus"),
    },
 
  ];

  const renderProfileHeader = () => (
    <View
      style={{
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Profile Image */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 40,
            backgroundColor: COLORS.lightGray,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
            overflow: "hidden",
          }}
        >
          {userProfile?.avatar ? (
            <Image
              source={{ uri: userProfile.avatar }}
              style={{ width: 60, height: 60, borderRadius: 40 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={30} color={COLORS.gray} />
          )}
        </View>

        {/* Profile Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: COLORS.darkest,
              marginBottom: 4,
            }}
          >
            {/* {userProfile?.name || user?.name || 'User Name'} */}
            {user?.firstName
              ? `${user?.firstName} ${user?.lastName}`
              : "User Name"}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: COLORS.gray,
              marginBottom: 8,
            }}
          >
            {userProfile?.email || user?.email || "user@example.com"}
          </Text>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: COLORS.lightGray,
          }}
          onPress={() => router.push("/screens/edit-profile")}
        >
          <Ionicons name="pencil" size={18} color={COLORS.buttonColor} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: 16,
        gap: 12,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Ionicons name="bag-outline" size={24} color={COLORS.buttonColor} />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: COLORS.darkest,
            marginTop: 8,
          }}
        >
          {orderHistory.length}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: COLORS.gray,
            textAlign: "center",
          }}
        >
          Orders
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Ionicons name="heart-outline" size={24} color={COLORS.error} />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: COLORS.darkest,
            marginTop: 8,
          }}
        >
          {totalWishlistItemsCount || 0}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: COLORS.gray,
            textAlign: "center",
          }}
        >
          Wishlist
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Ionicons name="gift-outline" size={24} color={COLORS.success} />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: COLORS.darkest,
            marginTop: 8,
          }}
        >
          {userProfile?.couponsCount || 0}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: COLORS.gray,
            textAlign: "center",
          }}
        >
          Coupons
        </Text>
      </View>
    </View>
  );

  const renderRecentOrders = () => {
    if (orderHistory.length === 0) return null;

    return (
      <View
        style={{
          backgroundColor: COLORS.white,
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 12,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: COLORS.darkest,
            }}
          >
            Recent Orders
          </Text>
          <TouchableOpacity onPress={() => router.push("/screens/orders")}>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.buttonColor,
                fontFamily: "Outfit-SemiBold",
              }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {orderHistory.slice(0, 2).map((order, index) => (
          <TouchableOpacity
            key={order.id || index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: index < orderHistory.length - 1 ? 1 : 0,
              borderBottomColor: COLORS.border,
            }}
            onPress={() => router.push(`/screens/orders/${order.id}`)}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: COLORS.lightGray,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name="bag-outline"
                size={20}
                color={COLORS.buttonColor}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Outfit-SemiBold",
                  color: COLORS.darkest,
                  marginBottom: 2,
                }}
              >
                {order.orderNumber || `ORD${order.id}`}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.gray,
                }}
              >
                {order.itemsCount || 1} item
                {(order.itemsCount || 1) > 1 ? "s" : ""} • Rs.{" "}
                {order.total?.toLocaleString() || "0"}
              </Text>
            </View>

            <View
              style={{
                backgroundColor:
                  order.financialStatus === "Voided" ? "#dee2e6" : order.status === "Fulfilled" ? "#dcfce7" : "#fef3c7",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Outfit-SemiBold",
                  color:
                order.financialStatus === "Voided" ? COLORS.darkest : order.status === "Fulfilled"
                      ? COLORS.success
                      : COLORS.warning,
                  textTransform: "capitalize",
                }}
              >
                {/* {order.status || "Processing"} */}
                {
                  order.financialStatus === "Voided" ? "Cancelled" : order.status ||  "Processing"
                }
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSettings = () => (
    <View
      style={{
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: COLORS.darkest,
          marginBottom: 12,
        }}
      >
        Preferences
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={COLORS.gray}
          />
          <Text
            style={{
              fontSize: 14,
              color: COLORS.darkest,
              marginLeft: 12,
            }}
          >
            Push Notifications
          </Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: COLORS.lightGray, true: COLORS.buttonColor }}
          thumbColor={notifications ? COLORS.white : COLORS.gray}
        />
      </View>
    </View>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}
      onPress={item.onPress}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: COLORS.lightGray,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name={item.icon} size={20} color={COLORS.buttonColor} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Outfit-SemiBold",
            color: COLORS.darkest,
            marginBottom: 2,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: COLORS.gray,
          }}
        >
          {item.subtitle}
        </Text>
      </View>

      {item.badge && (
        <View
          style={{
            backgroundColor: COLORS.error,
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              color: COLORS.white,
            }}
          >
            {item.badge}
          </Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
    </TouchableOpacity>
  );

  const renderMenuSection = () => (
    <View
      style={{
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      {menuItems.map((item, index) => (
        <View key={item.id}>{renderMenuItem(item)}</View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: COLORS.white,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.darkest} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Outfit-Bold",
              color: COLORS.darkest,
            }}
          >
            Account
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: COLORS.gray }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScreenWrapper cartItemCount={cartItemCount}>
      <ScrollView style={{ flex: 1, backgroundColor: "white", paddingTop: 30 }}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        {/* Header */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.buttonColor]}
              tintColor={COLORS.buttonColor}
            />
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {renderProfileHeader()}
          {renderQuickStats()}
          {renderRecentOrders()}
          {renderSettings()}
          {renderMenuSection()}

          {/* Logout Button */}
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.white,
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Outfit-SemiBold",
                color: COLORS.error,
                marginLeft: 8,
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: COLORS.gray,
              marginTop: 20,
            }}
          >
            Version 1.0.0
          </Text>
        </ScrollView>
      </ScrollView>
    </ScreenWrapper>
  );
}
