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

const { width } = Dimensions.get("window");

const SingleOrderPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate API call for order data
  useEffect(() => {
    fetchOrderData();
  });

  const fetchOrderData = async () => {
    setIsLoadingOrder(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockOrderData = {
      order: {
        id: "gid://shopify/Order/10168229232932",
        orderNumber: "#MD18137",
        email: "iqra.khan4270@gmail.com",
        status: "Fulfilled",
        shippingAddress: {
          address1:
            "Abid Hussain Chandia Al-Ma'arif Science College Post Office Karam Dad Qureshi Tehsil and District Muzaffargarh",
          address2: "Tehsil and district",
          city: "Muzaffargarh",
          firstName: "Rashid",
          lastName: "Hussain",
          phone: "03029838543",
          province: null,
        },
        billingAddress: {
          address1:
            "عابد حسین چانڈیہ المعارف سائنس کالج ڈاکخانہ کرم داد قریشی تحصیل و ضلع مظفرگڑھ",
          address2: "Tehsil and district",
          city: "Muzaffargarh",
          firstName: "Rashid",
          lastName: "Hussain",
          phone: "03029838543",
          province: null,
        },
        trackingInfo: {
          number: "772214635769",
          company: "tcs",
          courierCode: "TCS",
          courierName: "TCS Express",
          logoUrl: "https://trackmyorder.pk/TCS.svg",
          color: "#FF0000",
        },
        financialStatus: "Pending",
        paymentGateway: "Cash on Delivery (COD)",
        createdAt: "2025-09-02T16:42:02Z",
        processedAt: "2025-09-02T16:42:00Z",
        updatedAt: "2025-09-03T12:00:54Z",
        pricing: {
          total: 3566.94,
          currency: "PKR",
        },
        fulfillments: [
          {
            id: "gid://shopify/Fulfillment/5845270954276",
            createdAt: "2025-09-03T12:00:54Z",
            updatedAt: "2025-09-03T12:00:54Z",
            status: "FULFILLED",
            fulfilledLineItemIds: [
              "gid://shopify/LineItem/32010073014564",
              "gid://shopify/LineItem/32010073047332",
            ],
          },
        ],
        displayItems: [
          {
            id: "gid://shopify/LineItem/32010073014564",
            name: "MomDaughts' Long Tailed Menstrual Cup - Large / Pink",
            quantity: 2,
            unitPrice: 1199,
            totalPrice: 2398,
            currency: "PKR",
            variant: {
              id: "gid://shopify/ProductVariant/43786339057956",
              title: "Large / Pink",
              sku: "LPL_MD",
              price: 1199,
              image: {
                id: "gid://shopify/ProductImage/52063441912100",
                url: "https://cdn.shopify.com/s/files/1/0669/0773/4308/files/momdaughts-long-tailed-menstrual-cup-479514_d18faff7-b35e-4e10-b951-c889c3e26da2.jpg?v=1751896951",
              },
              productId: "gid://shopify/Product/7997785407780",
            },
          },
          {
            id: "gid://shopify/LineItem/32010073047332",
            name: "MomDaughts' Long Tailed Menstrual Cup - Small / Pink",
            quantity: 1,
            unitPrice: 1099,
            totalPrice: 1099,
            currency: "PKR",
            variant: {
              id: "gid://shopify/ProductVariant/43786338992420",
              title: "Small / Pink",
              sku: "LPS_MD",
              price: 1099,
              image: {
                id: "gid://shopify/ProductImage/52063445483812",
                url: "https://cdn.shopify.com/s/files/1/0669/0773/4308/files/momdaughts-long-tailed-menstrual-cup-850718_c83d4dc9-5465-45b3-831d-adf0c28263fc.jpg?v=1751896924",
              },
              productId: "gid://shopify/Product/7997785407780",
            },
          },
        ],
        itemCount: 3,
        fulfilledItemCount: 3,
      },
    };

    setOrderData(mockOrderData.order);
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
      // Simulate API call to tracking service
      // In real implementation, you would use fetch:
      // const response = await fetch('https://backend.trackmyorder.pk/api/tracking/track_order', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     tracking_number: orderData.trackingInfo.number,
      //     courier_code: orderData.trackingInfo.courierCode,
      //     shop_id: 78
      //   })
      // });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock tracking data response
      const mockTrackingData = {
        tracking_number: orderData.trackingInfo.number,
        courier_code: orderData.trackingInfo.courierCode,
        status: "In Transit",
        events: [
          {
            timestamp: "2025-09-03T14:30:00Z",
            status: "Shipped",
            description: "Package has been shipped from warehouse",
            location: "Karachi Distribution Center",
          },
          {
            timestamp: "2025-09-03T18:45:00Z",
            status: "In Transit",
            description: "Package is on the way to destination",
            location: "Multan Transit Hub",
          },
          {
            timestamp: "2025-09-04T09:15:00Z",
            status: "Out for Delivery",
            description: "Package is out for delivery",
            location: "Muzaffargarh Local Office",
          },
        ],
      };

      setTrackingData(mockTrackingData);
    } catch (error) {
      setTrackingError(
        "Failed to fetch tracking information. Please try again."
      );
      Alert.alert(
        "Error",
        "Failed to fetch tracking information. Please try again."
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
        return { bg: "#DEF7EC", text: "#047857", border: "#A7F3D0" };
      case "pending":
        return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" };
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
      <LinearGradient
        colors={["#EBF4FF", "#FFFFFF", "#F3E8FF"]}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Skeleton */}
          <View style={styles.card}>
            <View style={styles.skeletonHeader}>
              <View>
                <View
                  style={[styles.skeletonLine, { width: 200, height: 28 }]}
                />
                <View
                  style={[styles.skeletonLine, { width: 120, marginTop: 8 }]}
                />
                <View
                  style={[
                    styles.skeletonLine,
                    { width: 180, marginTop: 8, height: 14 },
                  ]}
                />
              </View>
              <View style={[styles.skeletonLine, { width: 80, height: 32 }]} />
            </View>
          </View>

          {/* Items Skeleton */}
          <View style={styles.card}>
            <View
              style={[
                styles.skeletonLine,
                { width: 160, height: 20, marginBottom: 16 },
              ]}
            />
            <OrderItemSkeleton />
            <OrderItemSkeleton />
          </View>

          {/* Address Skeleton */}
          <View style={styles.card}>
            <View
              style={[
                styles.skeletonLine,
                { width: 120, height: 20, marginBottom: 16 },
              ]}
            />
            <View
              style={[styles.skeletonLine, { width: "100%", height: 120 }]}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#EBF4FF", "#FFFFFF", "#F3E8FF"]}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.card}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Order Details</Text>
              <Text style={styles.orderNumber}>{orderData.orderNumber}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.dateText}>
                  Placed on {formatDate(orderData.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <StatusBadge status={orderData.status} />
              {orderData.trackingInfo && (
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={handleTrackOrder}
                >
                  <Ionicons name="eye-outline" size={16} color="white" />
                  <Text style={styles.trackButtonText}>Track Order</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>
              Order Items ({orderData.itemCount})
            </Text>
          </View>
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
                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity}
                </Text>
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

        {/* Addresses */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Addresses</Text>
          </View>

          <View style={styles.addressContainer}>
            <View style={[styles.addressCard, styles.shippingAddress]}>
              <Text style={styles.addressTitle}>Shipping Address</Text>
              <Text style={styles.addressName}>
                {orderData.shippingAddress.firstName}{" "}
                {orderData.shippingAddress.lastName}
              </Text>
              <Text style={styles.addressText}>
                {orderData.shippingAddress.address1}
              </Text>
              {orderData.shippingAddress.address2 && (
                <Text style={styles.addressText}>
                  {orderData.shippingAddress.address2}
                </Text>
              )}
              <Text style={styles.addressText}>
                {orderData.shippingAddress.city}
              </Text>
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.phoneText}>
                  {orderData.shippingAddress.phone}
                </Text>
              </View>
            </View>

            <View style={[styles.addressCard, styles.billingAddress]}>
              <Text style={styles.addressTitle}>Billing Address</Text>
              <Text style={styles.addressName}>
                {orderData.billingAddress.firstName}{" "}
                {orderData.billingAddress.lastName}
              </Text>
              <Text style={styles.addressText}>
                {orderData.billingAddress.address1}
              </Text>
              {orderData.billingAddress.address2 && (
                <Text style={styles.addressText}>
                  {orderData.billingAddress.address2}
                </Text>
              )}
              <Text style={styles.addressText}>
                {orderData.billingAddress.city}
              </Text>
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.phoneText}>
                  {orderData.billingAddress.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentValue}>{orderData.paymentGateway}</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Financial Status</Text>
            <StatusBadge status={orderData.financialStatus} />
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{orderData.itemCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {orderData.pricing.currency}{" "}
              {orderData.pricing.total.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Tracking Information */}
        {showTracking && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="car-outline" size={24} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Tracking Information</Text>
            </View>

            {orderData.trackingInfo && (
              <View style={styles.trackingHeader}>
                <View style={styles.courierInfo}>
                  <Text style={styles.courierName}>
                    {orderData.trackingInfo.courierName}
                  </Text>
                  <Text style={styles.trackingNumber}>
                    Tracking: {orderData.trackingInfo.number}
                  </Text>
                </View>
              </View>
            )}

            {isLoadingTracking ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>
                  Fetching tracking information...
                </Text>
              </View>
            ) : trackingError ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="#DC2626"
                />
                <Text style={styles.errorText}>{trackingError}</Text>
              </View>
            ) : trackingData ? (
              <View style={styles.trackingEvents}>
                {trackingData.events.map((event, index) => (
                  <View key={index} style={styles.trackingEvent}>
                    <View style={styles.eventIndicator}>
                      <View style={styles.eventDot} />
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
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color="#6B7280"
                        />
                        <Text style={styles.eventLocationText}>
                          {event.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}

        {/* Customer Info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={24} color="#6366F1" />
            <Text style={styles.sectionTitle}>Customer Information</Text>
          </View>
          <View style={styles.customerRow}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
            <Text style={styles.customerEmail}>{orderData.email}</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  trackButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#6B7280",
  },
  itemPricing: {
    alignItems: "flex-end",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  itemUnit: {
    fontSize: 12,
    color: "#6B7280",
  },
  addressContainer: {
    gap: 16,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  shippingAddress: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  billingAddress: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#374151",
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#059669",
  },
  trackingHeader: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 16,
  },
  courierInfo: {
    gap: 4,
  },
  courierName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
  },
  trackingNumber: {
    fontSize: 14,
    color: "#D97706",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    flex: 1,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
  },
  eventLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#D1D5DB",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  eventTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  eventDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
});
