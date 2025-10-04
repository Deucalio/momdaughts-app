"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { fetchOrder, fetchProducts } from "../../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../../utils/authStore";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const FEATURED_PRODUCTS =
  "gid://shopify/Product/7997785407780,gid://shopify/Product/7970555658532,gid://shopify/Product/9403161575716,gid://shopify/Product/10006500344100,gid://shopify/Product/10087709507876,gid://shopify/Product/9937795809572,gid://shopify/Product/8711623639332,gid://shopify/Product/7984806494500";

// Skeleton Components
const ProductSkeleton = () => (
  <View style={styles.productSkeletonCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonTextContainer}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonPrice} />
    </View>
  </View>
);

const OrderItemSkeleton = () => (
  <View style={styles.itemCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.itemInfo}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSmallText} />
      <View style={styles.skeletonSmallText} />
    </View>
    <View style={styles.itemPriceContainer}>
      <View style={styles.skeletonPrice} />
    </View>
  </View>
);

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "#10b981";
    case "assigned":
    case "picked_up":
      return "#6366f1";
    case "in_transit":
      return "#f59e0b";
    case "at_station":
      return "#6366f1";
    default:
      return "#6b7280";
  }
};

export default function OrderScreen() {
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showTrackingEvents, setShowTrackingEvents] = useState(false);

  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const isTrackingExpired = (createdAt) => {
    if (!createdAt) return false;

    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate - createdDate) / (1000 * 60 * 60 * 24)
    );

    return daysDifference > 45;
  };
  const fetchOrderData = async () => {
    try {
      setOrderLoading(true);
      setOrderError(null);
      const data = await fetchOrder(authenticatedFetch, id);

      if (data.order) {
        setOrder(data.order);
        console.log("Order data:", data.order);
      } else {
        setOrderError("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      setOrderError("Failed to load order data");
    } finally {
      setOrderLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const products_ = await fetchProducts(
        authenticatedFetch,
        `product_ids=${FEATURED_PRODUCTS}`
      );
      setProducts(products_);
      console.log("[v0] Loaded products:", products_.length);
    } catch (error) {
      console.error("[v0] Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
    loadProducts();
  }, []);

  const fetchTrackingData = async () => {
    if (!order?.trackingInfo?.number) return;

    setIsLoadingTracking(true);
    try {
      const response = await fetch(
        "https://backend.trackmyorder.pk/api/tracking/track_order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tracking_number: order.trackingInfo.number,
            courier_code: order.trackingInfo.courierCode,
            shop_id: 78,
          }),
        }
      );

      const data = await response.json();
      console.log("Tracking data:", data);
      setTrackingData(data.tracking);
      setShowTracking(true);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    } finally {
      setIsLoadingTracking(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTrendingProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        router.push(`/products/${item.id.split("/").slice(-1)[0]}`);
      }}
    >
      <Image
        source={{ uri: item.images[0]?.originalSrc }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>
          PKR {parseFloat(item.variants[0]?.price || 0).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (orderLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Header Skeleton */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.backButton}>
              {/* <Text style={styles.backButtonText}>←</Text> */}
              <Ionicons name="arrow-back" size={24} color="#333" />
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSmallText} />
            </View>
            <View style={styles.skeletonStatusBadge} />
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Order Summary Skeleton */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonSmallText} />
              </View>
              <View style={styles.priceContainer}>
                <View style={styles.skeletonPrice} />
                <View style={styles.skeletonSmallText} />
              </View>
            </View>
            <View style={styles.divider} />
            <OrderItemSkeleton />
            <OrderItemSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (orderError || !order) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Order Not Found</Text>
            </View>
          </View>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📦</Text>
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorText}>
            {orderError ||
              "We couldn't find the order you're looking for. Please check the order ID and try again."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrderData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerSubtitle}>{order.orderNumber}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary - Improved Layout */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>Order Summary</Text>
              <Text style={styles.cardSubtitle}>
                Placed on {formatDate(order.createdAt)}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.totalPrice}>
                {order.pricing.currency} {order.pricing.total.toLocaleString()}
              </Text>
              <Text style={styles.paymentMethod}>{order.paymentGateway}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemsContainer}>
            {order.displayItems.map((item) => (
              <TouchableOpacity
                onPress={() => {
                  let url = `/products/${item.variant.productId
                    .split("/")
                    .pop()}?variantId=${item.variant.id.split("/").pop()}`;
                  router.push(url);
                }}
                key={item.id}
                style={styles.improvedItemCard}
              >
                <Image
                  source={{ uri: item.variant?.image?.url }}
                  style={[styles.itemImage]}
                  resizeMode="cover"
                />
                <View style={styles.improvedItemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    Quantity: {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {item.currency} {item.totalPrice.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Shipping & Billing Addresses */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📍</Text>
            <Text style={styles.sectionTitle}>Addresses</Text>
          </View>

          {/* Shipping Address */}
          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>Shipping Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.address1}
              </Text>
              {order.shippingAddress.address2 && (
                <Text style={styles.addressText}>
                  {order.shippingAddress.address2}
                </Text>
              )}
              <Text style={styles.addressText}>
                {order.shippingAddress.city}
              </Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.phoneIcon}>📞</Text>
                <Text style={styles.phoneText}>
                  {order.shippingAddress.phone}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.addressDivider} />

          {/* Billing Address */}
          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>Billing Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </Text>
              <Text style={styles.addressText}>
                {order.billingAddress.address1}
              </Text>
              {order.billingAddress.address2 && (
                <Text style={styles.addressText}>
                  {order.billingAddress.address2}
                </Text>
              )}
              <Text style={styles.addressText}>
                {order.billingAddress.city}
              </Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.phoneIcon}>📞</Text>
                <Text style={styles.phoneText}>
                  {order.billingAddress.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* If the fulfillment.createdAt is older than 45 days, hide the tracking info */}
        {order.trackingInfo &&
          order.fulfillments[0] &&
          !isTrackingExpired(order.fulfillments[0].createdAt) && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🚚</Text>
                <Text style={styles.sectionTitle}>Package Tracking</Text>
              </View>

              <View style={styles.trackingCard}>
                <View style={styles.courierInfo}>
                  <Image
                    source={{ uri: order.trackingInfo.logoUrl }}
                    style={[
                      styles.courierLogo,
                      {
                        
                        backgroundColor: order.trackingInfo.color,
                      },
                    ]}
                    resizeMode="contain"
                  />
                  <View style={styles.courierDetails}>
                    <Text style={styles.courierName}>
                      {order.trackingInfo.courierName}
                    </Text>
                    <Text style={styles.trackingNumber}>
                      {order.trackingInfo.number}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.trackButton,
                    isLoadingTracking && styles.trackButtonDisabled,
                  ]}
                  onPress={fetchTrackingData}
                  disabled={isLoadingTracking}
                >
                  {isLoadingTracking ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.trackButtonText}>Track Package</Text>
                  )}
                </TouchableOpacity>
              </View>

              {showTracking && trackingData && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.trackingStatusContainer}>
                    <View style={styles.trackingStatus}>
                      <View
                        style={[
                          styles.trackingStatusDot,
                          {
                            backgroundColor: getStatusColor(
                              trackingData.status
                            ),
                          },
                        ]}
                      />
                      <Text style={styles.trackingStatusText}>
                        Current Status: {trackingData.status}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.toggleEventsButton}
                      onPress={() => setShowTrackingEvents(!showTrackingEvents)}
                    >
                      <Text style={styles.toggleEventsText}>
                        {showTrackingEvents ? "Hide" : "Show"} Tracking Events
                      </Text>
                      <Text style={styles.toggleEventsIcon}>
                        {showTrackingEvents ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showTrackingEvents && (
                    <View style={styles.trackingHistory}>
                      <Text style={styles.historyTitle}>Tracking History</Text>
                      <View style={styles.timeline}>
                        {trackingData.history.map((event, index) => (
                          <View key={index} style={styles.timelineItem}>
                            <View
                              style={[
                                styles.timelineDot,
                                {
                                  backgroundColor: getStatusColor(event.status),
                                },
                              ]}
                            />
                            <View style={styles.timelineContent}>
                              <View style={styles.eventHeader}>
                                <View
                                  style={[
                                    styles.statusBadgeSmall,
                                    {
                                      backgroundColor: getStatusColor(
                                        event.status
                                      ),
                                    },
                                  ]}
                                >
                                  <Text style={styles.statusBadgeText}>
                                    {event.status.replace("_", " ")}
                                  </Text>
                                </View>
                                <Text style={styles.eventTime}>
                                  {event.datetime}
                                </Text>
                              </View>
                              <Text style={styles.eventDescription}>
                                {event.description}
                              </Text>
                              {event.receiver && (
                                <Text style={styles.eventReceiver}>
                                  Received by: {event.receiver}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

        {/* Order Timeline */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📅</Text>
            <Text style={styles.sectionTitle}>Order Timeline</Text>
          </View>
          <View style={styles.orderTimeline}>
            <View style={styles.timelineItem}>
              <View
                style={[styles.timelineDot, { backgroundColor: "#10b981" }]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Order Placed</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(order.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View
                style={[styles.timelineDot, { backgroundColor: "#6366f1" }]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Order Processed</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(order.processedAt)}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View
                style={[styles.timelineDot, { backgroundColor: "#f59e0b" }]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Last Updated</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(order.updatedAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trending Products Section */}
        <View
          style={[
            styles.card,
            {
              elevation: 0,
              marginBottom: 40,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>
              <Ionicons name="star" size={24} color="#f59e0b" />
            </Text>
            <Text style={styles.sectionTitle}>Explore More Products</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Discover other products you might love
          </Text>

          {productsLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={products}
              renderItem={renderTrendingProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            />
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "#475569",
    fontFamily: "Outfit-Medium",
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#1e293b",
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 20,
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Outfit-Medium",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 28,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  totalPrice: {
    fontSize: 26,
    fontFamily: "Outfit-Bold",
    color: "#1e293b",
    lineHeight: 32,
  },
  paymentMethod: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  itemsContainer: {
    gap: 16,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
  },
  // Improved item card layout
  improvedItemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  // Improved item info layout
  improvedItemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#1e293b",
    lineHeight: 22,
    marginBottom: 8,
  },
  itemDetails: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 18,
  },
  itemPriceContainer: {
    alignItems: "flex-end",
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    color: "#1e293b",
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: "#1e293b",
    lineHeight: 26,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    marginTop: -12,
    lineHeight: 20,
  },
  addressSection: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#374151",
    marginBottom: 12,
    lineHeight: 22,
  },
  addressCard: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addressName: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#1e293b",
    marginBottom: 10,
    lineHeight: 22,
  },
  addressText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 6,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  phoneText: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Outfit-Medium",
    lineHeight: 20,
  },
  addressDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 20,
  },
  trackingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  courierInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  courierLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  courierDetails: {
    marginLeft: 12,
    flex: 1,
  },
  courierName: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#1e293b",
    lineHeight: 22,
  },
  trackingNumber: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 18,
  },
  trackButton: {
    backgroundColor: "#2c2a6b",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    minWidth: 40,
    alignItems: "center",
  },
  trackButtonDisabled: {
    opacity: 0.6,
  },
  trackButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "Outfit-Medium",
    lineHeight: 20,
  },
  trackingStatusContainer: {
    paddingTop: 16,
  },
  trackingStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  trackingStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  trackingStatusText: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#1e293b",
    lineHeight: 22,
  },
  toggleEventsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  toggleEventsText: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: "#475569",
    marginRight: 8,
    lineHeight: 20,
  },
  toggleEventsIcon: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "Outfit-Medium",
  },
  trackingHistory: {
    marginTop: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#1e293b",
    marginBottom: 20,
    lineHeight: 22,
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -26,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Outfit-Bold",
    textTransform: "uppercase",
    lineHeight: 14,
  },
  eventTime: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
  eventDescription: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 20,
    marginBottom: 4,
  },
  eventReceiver: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 16,
  },
  orderTimeline: {
    paddingLeft: 20,
  },
  timelineLabel: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#1e293b",
    lineHeight: 22,
  },
  timelineDate: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },

  // Trending Products Section
  productsContainer: {
    paddingHorizontal: 0,
    gap: 12,
  },
  productCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // elevation: 1,
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f1f5f9",
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: "#1e293b",
    lineHeight: 20,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: "Outfit-Bold",
    color: "#000",
    lineHeight: 20,
  },

  // Skeleton Styles
  productSkeletonCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  skeletonImage: {
    width: "100%",
    height: 70,
    backgroundColor: "#e2e8f0",
  },
  skeletonTextContainer: {
    padding: 12,
  },
  skeletonTitle: {
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
    width: "80%",
  },
  skeletonPrice: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    width: "60%",
  },
  skeletonSmallText: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 6,
    width: "70%",
  },
  skeletonStatusBadge: {
    width: 80,
    height: 32,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
  },

  // Error States
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#475569",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    lineHeight: 22,
  },

  bottomSpacing: {
    height: 40,
  },
});
