// OrdersPage.js
"use client";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAllOrders } from "../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";

const { width } = Dimensions.get("window");

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { user } = useAuthStore();
  const { authenticatedFetch } = useAuthenticatedFetch();
  // Simulate API call
  const fetchOrders = async () => {
    try {
      // Simulate network delay
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock API response based on your data
      const apiRes = await fetchAllOrders(authenticatedFetch);

      setOrders(apiRes.orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status, financialStatus) => {
    if (financialStatus.toLowerCase() === "voided") {
      return { bg: "#FEF2F2", text: "#DC2626", icon: "close-circle" };
    }

    if (status === "Fulfilled") {
      return { bg: "#dcfce7", text: "#16a34a", icon: "checkmark-circle" };
    } else if (status === "Unfulfilled") {
      return { bg: "#fef3c7", text: "#d97706", icon: "time" };
    } else if (status === "Cancelled") {
      return { bg: "#fee2e2", text: "#dc2626", icon: "close-circle" };
    } else {
      return { bg: "#dbeafe", text: "#2563eb", icon: "sync" };
    }
  };

  const getPaymentIcon = (paymentGateway) => {
    return paymentGateway === "Credit Card" ? "card" : "cash-outline";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount, currency = "PKR") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const filterOptions = [
    { key: "all", label: "All Orders", count: orders.length },
    {
      key: "fulfilled",
      label: "Fulfilled",
      count: orders.filter((o) => o.status === "Fulfilled").length,
    },
    {
      key: "unfulfilled",
      label: "Unfulfilled",
      count: orders.filter((o) => o.status === "Unfulfilled").length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: orders.filter((o) => o.status === "Cancelled").length,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "fulfilled") return order.status === "Fulfilled";
    if (selectedFilter === "unfulfilled") return order.status === "Unfulfilled";
    if (selectedFilter === "cancelled") return order.status === "Cancelled";
    return true;
  });

  const renderOrderItem = (order) => {
    const statusInfo = getStatusColor(order.status, order.financialStatus);

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() =>
          router.push(`/screens/orders/${order.id.split("/").pop()}`)
        }
        activeOpacity={0.7}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}
          >
            <Ionicons
              name={statusInfo.icon}
              size={14}
              color={statusInfo.text}
            />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {order.status}
            </Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemsScrollContainer}
          >
            {order.displayItems.slice(0, 3).map((item, index) => (
              <View key={item.id} style={styles.itemPreview}>
                <Image
                  source={{ uri: item.variant.image?.url }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
                <View style={styles.itemOverlay}>
                  <Text style={styles.itemQuantity}>×{item.quantity}</Text>
                </View>
              </View>
            ))}
            {order.displayItems.length > 3 && (
              <View style={styles.moreItemsIndicator}>
                <Text style={styles.moreItemsText}>
                  +{order.displayItems.length - 3}
                </Text>
                <Text style={styles.moreItemsSubtext}>more</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Ionicons name="cube" size={16} color="#718096" />
              <Text style={styles.summaryLabel}>
                {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
              </Text>
            </View>
            <Text style={styles.orderTotal}>
              {formatCurrency(
                Math.round(order.pricing.total),
                order.pricing.currency
              )}
            </Text>
          </View>

          {/* Payment Gateway Info */}
          <View style={styles.paymentRow}>
            <View style={styles.paymentInfo}>
              <Ionicons
                name={getPaymentIcon(order.paymentGateway)}
                size={16}
                color="#718096"
              />
              <Text style={styles.paymentText}>{order.paymentGateway}</Text>
            </View>
            {/* {order.financialStatus === "Pending" && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Payment Pending</Text>
              </View>
            )} */}
          </View>
        </View>

        {/* Action Arrow */}
        <View style={styles.actionArrow}>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e0" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#4a5568" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2c2a6b" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
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
          <Ionicons name="arrow-back" size={24} color="#4a5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={{
          opacity: 0
        }}>
          <Text>sad</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContainer}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                selectedFilter === option.key && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === option.key && styles.activeFilterTabText,
                ]}
              >
                {option.label}
              </Text>
              {option.count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    selectedFilter === option.key && styles.activeFilterBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      selectedFilter === option.key &&
                        styles.activeFilterBadgeText,
                    ]}
                  >
                    {option.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length > 0 ? (
          <>
            <View style={styles.ordersHeader}>
              <Text style={styles.ordersCount}>
                {filteredOrders.length} order
                {filteredOrders.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {filteredOrders.map(renderOrderItem)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="bag-handle" size={64} color="#cbd5e0" />
            </View>
            <Text style={styles.emptyStateTitle}>No orders found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {selectedFilter === "all"
                ? "You haven't placed any orders yet"
                : `No ${selectedFilter} orders found`}
            </Text>
            <TouchableOpacity
              style={styles.shopNowButton}
              onPress={() => router.push("/shop")}
            >
              <Text style={styles.shopNowButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  headerTitle: {
    fontSize: 18,
    // fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#718096",
    marginTop: 16,
  },
  filterContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterScrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeFilterTab: {
    backgroundColor: "#2c2a6b",
    borderColor: "#2c2a6b",
  },
  filterTabText: {
    fontSize: 14,
    color: "#718096",
    // fontWeight: "500",
    fontFamily: "Outfit-Medium",
  },
  activeFilterTabText: {
    color: "#ffffff",
  },
  filterBadge: {
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: "center",
  },
  activeFilterBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  filterBadgeText: {
    fontSize: 12,
    color: "#4a5568",
    // fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
  },
  activeFilterBadgeText: {
    color: "#ffffff",
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  ordersCount: {
    fontSize: 16,
    color: "#4a5568",
    // fontWeight: "500",
    fontFamily: "Outfit-Medium",
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    // fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: "#718096",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    // fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
    marginLeft: 4,
  },
  itemsPreview: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  itemsScrollContainer: {
    paddingRight: 20,
  },
  itemPreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemOverlay: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  itemQuantity: {
    fontSize: 10,
    color: "#ffffff",
    // fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
  },
  moreItemsIndicator: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  moreItemsText: {
    fontSize: 12,
    color: "#718096",
    // fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
  },
  moreItemsSubtext: {
    fontSize: 10,
    color: "#9ca3af",
  },
  orderSummary: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#718096",
    marginLeft: 8,
  },
  orderTotal: {
    fontSize: 18,
    // fontWeight: "700",

    fontFamily: "Outfit-Bold",
    color: "#2d3748",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 13,
    color: "#718096",
    marginLeft: 6,
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 11,
    color: "#d97706",
    // fontWeight: "500",
    fontFamily: "Outfit-Medium",
  },
  actionArrow: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 20,
    // fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: "#2c2a6b",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  shopNowButtonText: {
    color: "#ffffff",
    fontSize: 16,
    // fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
  },
});
