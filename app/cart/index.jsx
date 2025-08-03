import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Navigation from "../../components/Navigation";

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      name: "Organic Menstrual Cup - Size M",
      price: 1299,
      originalPrice: 1599,
      quantity: 1,
      image: "https://via.placeholder.com/100x100/f5b8d0/2b2b6b?text=Cup",
      variant: "Medium",
      inStock: true,
    },
    {
      id: "2",
      name: "Wellness Tea Blend",
      price: 599,
      quantity: 2,
      image: "https://via.placeholder.com/100x100/e2c6df/2b2b6b?text=Tea",
      variant: "Chamomile",
      inStock: true,
    },
    {
      id: "3",
      name: "Iron Supplement Tablets",
      price: 899,
      originalPrice: 1099,
      quantity: 1,
      image: "https://via.placeholder.com/100x100/eb9fc1/2b2b6b?text=Pills",
      variant: "60 Tablets",
      inStock: false,
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setCartItems((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateSavings = () => {
    return cartItems.reduce((total, item) => {
      if (item.originalPrice) {
        return total + (item.originalPrice - item.price) * item.quantity;
      }
      return total;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shipping;

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemVariant}>{item.variant}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>Rs. {item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>Rs. {item.originalPrice}</Text>
          )}
        </View>

        {!item.inStock && <Text style={styles.outOfStock}>Out of Stock</Text>}
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#eb9fc1" />
        </TouchableOpacity>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#ffffff" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={!item.inStock}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#f5b8d0", "#e2c6df"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2b2b6b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={styles.headerButton} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="bag-outline" size={64} color="#e2c6df" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add some products to get started
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push("/shop")}
            >
              <LinearGradient
                colors={["#2b2b6b", "#040707"]}
                style={styles.shopGradient}
              >
                <Text style={styles.shopButtonText}>Continue Shopping</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <View style={styles.cartSection}>
              <Text style={styles.sectionTitle}>
                Items in Cart ({cartItems.length})
              </Text>
              {cartItems.map(renderCartItem)}
            </View>

            {/* Promo Code */}
            <View style={styles.promoSection}>
              <Text style={styles.sectionTitle}>Promo Code</Text>
              <View style={styles.promoContainer}>
                <View style={styles.promoInput}>
                  <Ionicons name="pricetag-outline" size={20} color="#2b2b6b" />
                  <Text style={styles.promoPlaceholder}>Enter promo code</Text>
                </View>
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>Rs. {subtotal}</Text>
              </View>

              {savings > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>You Save</Text>
                  <Text style={styles.savingsValue}>-Rs. {savings}</Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  {shipping === 0 ? "Free" : `Rs. ${shipping}`}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>Rs. {total}</Text>
              </View>

              {subtotal < 1000 && (
                <Text style={styles.freeShippingNote}>
                  Add Rs. {1000 - subtotal} more for free shipping
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Checkout Button */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push("/checkout")}
          >
            <LinearGradient
              colors={["#2b2b6b", "#040707"]}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout • Rs. {total}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation */}
      <Navigation currentRoute="cart" cartCount={cartItems.length} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b2b6b",
  },
  scrollView: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#040707",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#2b2b6b",
    textAlign: "center",
    marginBottom: 32,
  },
  shopButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  shopGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  shopButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  cartSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#040707",
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#2b2b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f5b8d0",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f5b8d0",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#040707",
    lineHeight: 20,
  },
  itemVariant: {
    fontSize: 14,
    color: "#2b2b6b",
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b2b6b",
  },
  originalPrice: {
    fontSize: 14,
    color: "#e2c6df",
    textDecorationLine: "line-through",
  },
  outOfStock: {
    fontSize: 12,
    color: "#eb9fc1",
    fontWeight: "600",
    marginTop: 4,
  },
  itemActions: {
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  removeButton: {
    padding: 8,
    backgroundColor: "#f5b8d0",
    borderRadius: 8,
    opacity: 0.3,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5b8d0",
    borderRadius: 12,
    padding: 4,
    marginTop: 12,
    opacity: 0.3,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2b2b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b2b6b",
    paddingHorizontal: 12,
  },
  promoSection: {
    padding: 16,
    backgroundColor: "#f5b8d0",
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    opacity: 0.3,
  },
  promoContainer: {
    flexDirection: "row",
    gap: 12,
  },
  promoInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  promoPlaceholder: {
    fontSize: 14,
    color: "#2b2b6b",
  },
  promoButton: {
    backgroundColor: "#2b2b6b",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
  },
  promoButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  summarySection: {
    padding: 16,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#2b2b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2c6df",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#2b2b6b",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#040707",
  },
  savingsValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#eb9fc1",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e2c6df",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#040707",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b2b6b",
  },
  freeShippingNote: {
    fontSize: 12,
    color: "#eb9fc1",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  checkoutContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2c6df",
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  checkoutGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default CartPage;
