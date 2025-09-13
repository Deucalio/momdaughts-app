import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthenticatedFetch } from "../../utils/authStore";
import { fetchOrder } from "../../utils/actions";

const { width } = Dimensions.get("window");

const SingleOrderPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    fetchOrderData();
  }, []);

  const fetchOrderData = async () => {
    setIsLoadingOrder(true);
    const apiRes = await fetchOrder(authenticatedFetch, id);
    setOrderData(apiRes.order);
    setIsLoadingOrder(false);
  };

  const fetchTrackingData = async () => {
    if (!orderData?.trackingInfo) {
      setTrackingError("No tracking information available for this order");
      return;
    }

    setIsLoadingTracking(true);
    setTrackingError(null);

    try {
      const response = await fetch('https://backend.trackmyorder.pk/api/tracking/track_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tracking_number: orderData.trackingInfo.number,
          courier_code: orderData.trackingInfo.courierCode,
          shop_id: 78
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }

      const trackingResponse = await response.json();
      setTrackingData(trackingResponse.tracking);
    } catch (error) {
      setTrackingError(
        "Unable to fetch tracking information at the moment. Please try again later."
      );
    } finally {
      setIsLoadingTracking(false);
    }
  };

  const handleTrackOrder = () => {
    setShowTracking(true);
    if (!trackingData) {
      fetchTrackingData();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrderData();
    setRefreshing(false);
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "fulfilled":
        return { bg: "#F0FDF4", text: "#059669", border: "#BBF7D0" };
      case "pending":
        return { bg: "#FFFBEB", text: "#D97706", border: "#FED7AA" };
      case "cancelled":
        return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
      default:
        return { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" };
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = getStatusColor(status);
    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: colors.bg, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.statusText, { color: colors.text }]}>
          {status}
        </Text>
      </View>
    );
  };

  const OrderItemSkeleton = () => (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { width: "80%" }]} />
        <View style={[styles.skeletonLine, { width: "60%", height: 12 }]} />
        <View style={[styles.skeletonLine, { width: "40%", height: 12 }]} />
      </View>
      <View style={styles.skeletonPrice}>
        <View style={[styles.skeletonLine, { width: 60 }]} />
        <View style={[styles.skeletonLine, { width: 40, height: 12 }]} />
      </View>
    </View>
  );

  if (isLoadingOrder) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Skeleton */}
          <View style={styles.card}>
            <View style={styles.skeletonHeader}>
              <View>
                <View style={[styles.skeletonLine, { width: 200, height: 28 }]} />
                <View style={[styles.skeletonLine, { width: 120, marginTop: 8 }]} />
                <View style={[styles.skeletonLine, { width: 180, marginTop: 8, height: 14 }]} />
              </View>
              <View style={[styles.skeletonLine, { width: 80, height: 32 }]} />
            </View>
          </View>

          {/* Items Skeleton */}
          <View style={styles.card}>
            <View style={[styles.skeletonLine, { width: 160, height: 20, marginBottom: 16 }]} />
            <OrderItemSkeleton />
            <OrderItemSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <View style={styles.card}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Order Details</Text>
              <Text style={styles.orderNumber}>{orderData.orderNumber}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={styles.dateText}>
                  {formatDate(orderData.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <StatusBadge status={orderData.status} />
            </View>
          </View>
        </View>

        {/* Tracking Card */}
        {orderData.trackingInfo && (
          <View style={styles.card}>
            <View style={styles.trackingCardHeader}>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingTitle}>Package Tracking</Text>
                <Text style={styles.trackingNumber}>
                  {orderData.trackingInfo.number}
                </Text>
                <Text style={styles.courierName}>
                  via {orderData.trackingInfo.courierName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.trackButton}
                onPress={handleTrackOrder}
                disabled={isLoadingTracking}
              >
                {isLoadingTracking ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.trackButtonText}>
                  {isLoadingTracking ? "Loading..." : "Track Package"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tracking Results */}
        {showTracking && (
          <View style={styles.card}>
            {isLoadingTracking ? (
              <View style={styles.trackingLoadingState}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.trackingLoadingText}>
                  Getting latest tracking updates...
                </Text>
              </View>
            ) : trackingError ? (
              <View style={styles.trackingErrorState}>
                <View style={styles.errorIcon}>
                  <Ionicons name="alert-circle" size={48} color="#EF4444" />
                </View>
                <Text style={styles.errorTitle}>Unable to Track</Text>
                <Text style={styles.errorMessage}>{trackingError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchTrackingData}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : trackingData ? (
              <View style={styles.trackingResults}>
                <View style={styles.trackingHeader}>
                  <Text style={styles.trackingStatusTitle}>Current Status</Text>
                  <Text style={styles.trackingStatus}>{trackingData.status}</Text>
                </View>
                
                <Text style={styles.trackingEventsTitle}>Tracking History</Text>
                <View style={styles.trackingEvents}>
                  {trackingData.events.map((event, index) => (
                    <View key={index} style={styles.trackingEvent}>
                      <View style={styles.eventIndicator}>
                        <View style={[
                          styles.eventDot,
                          index === 0 && styles.currentEventDot
                        ]} />
                        {index !== trackingData.events.length - 1 && (
                          <View style={styles.eventLine} />
                        )}
                      </View>
                      <View style={styles.eventContent}>
                        <View style={styles.eventHeader}>
                          <Text style={styles.eventStatus}>{event.status}</Text>
                          <Text style={styles.eventTime}>
                            {formatDate(event.timestamp)}
                          </Text>
                        </View>
                        <Text style={styles.eventDescription}>
                          {event.description}
                        </Text>
                        <View style={styles.eventLocation}>
                          <Ionicons name="location-outline" size={14} color="#64748B" />
                          <Text style={styles.eventLocationText}>
                            {event.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Items ({orderData.itemCount})
          </Text>
          {orderData.displayItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image
                source={{ uri: item.variant.image.url }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemSku}>SKU: {item.variant.sku}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <View style={styles.itemPricing}>
                <Text style={styles.itemTotal}>
                  {item.currency} {item.totalPrice.toLocaleString()}
                </Text>
                <Text style={styles.itemUnit}>
                  Unit: {item.currency} {item.unitPrice.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContent}>
            <Text style={styles.addressName}>
              {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
            </Text>
            <Text style={styles.addressText}>{orderData.shippingAddress.address1}</Text>
            {orderData.shippingAddress.address2 && (
              <Text style={styles.addressText}>{orderData.shippingAddress.address2}</Text>
            )}
            <Text style={styles.addressText}>{orderData.shippingAddress.city}</Text>
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={16} color="#64748B" />
              <Text style={styles.phoneText}>{orderData.shippingAddress.phone}</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>{orderData.paymentGateway}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Financial Status</Text>
              <StatusBadge status={orderData.financialStatus} />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                {orderData.pricing.currency} {orderData.pricing.total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.card, styles.lastCard]}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerRow}>
            <Ionicons name="mail-outline" size={16} color="#64748B" />
            <Text style={styles.customerEmail}>{orderData.email}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  lastCard: {
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: "#64748B",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  trackingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackingInfo: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3B82F6",
    marginBottom: 2,
  },
  courierName: {
    fontSize: 12,
    color: "#64748B",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  trackingLoadingState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  trackingLoadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  trackingErrorState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  errorIcon: {
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  errorMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  trackingResults: {
    gap: 16,
  },
  trackingHeader: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  trackingStatusTitle: {
    fontSize: 12,
    color: "#0369A1",
    fontWeight: "500",
    marginBottom: 2,
  },
  trackingStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0C4A6E",
  },
  trackingEventsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  trackingEvents: {
    paddingLeft: 8,
  },
  trackingEvent: {
    flexDirection: "row",
    marginBottom: 20,
  },
  eventIndicator: {
    alignItems: "center",
    marginRight: 16,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
  },
  currentEventDot: {
    backgroundColor: "#10B981",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eventLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 8,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  eventTime: {
    fontSize: 12,
    color: "#64748B",
  },
  eventDescription: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventLocationText: {
    fontSize: 12,
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 2,
  },
  itemSku: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#64748B",
  },
  itemPricing: {
    alignItems: "flex-end",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  itemUnit: {
    fontSize: 12,
    color: "#64748B",
  },
  addressContent: {
    gap: 4,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  addressText: {
    fontSize: 14,
    color: "#475569",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 14,
    color: "#64748B",
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#475569",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customerEmail: {
    fontSize: 14,
    color: "#475569",
  },
  // Skeleton styles
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonPrice: {
    alignItems: "flex-end",
  },
  skeletonLine: {
    height: 16,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
});

export default SingleOrderPage;