import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// Mock API function to simulate fetching product data
const fetchProductData = async (productId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: "Organic Cotton Pads - Regular Flow",
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.8,
        reviews: 124,
        inStock: true,
        images: [
          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop",
        ],
        description:
          "Made from 100% organic cotton, these ultra-soft pads provide superior comfort and protection during your period. Hypoallergenic and free from chemicals, perfect for sensitive skin.",
        features: [
          "100% Organic Cotton",
          "Hypoallergenic",
          "Chemical-free",
          "Biodegradable",
          "Ultra-soft comfort",
          "Superior absorption",
        ],
        specifications: {
          Material: "100% Organic Cotton",
          "Pack Size": "20 pads",
          Flow: "Regular",
          Length: "240mm",
          Wings: "Yes",
        },
        reviews: [
          {
            id: 1,
            name: "Sarah M.",
            rating: 5,
            date: "2 weeks ago",
            comment:
              "These are amazing! So comfortable and I love that they're organic. Will definitely repurchase.",
          },
          {
            id: 2,
            name: "Emma L.",
            rating: 4,
            date: "1 month ago",
            comment:
              "Great quality pads. A bit pricey but worth it for the comfort and peace of mind.",
          },
        ],
      });
    }, 1500); // Simulate network delay
  });
};

const StarRating = ({ rating, size = 16, showRating = false }) => {
  return (
    <View style={styles.starContainer}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text
          key={i}
          style={[
            styles.star,
            { fontSize: size, color: i < rating ? "#FCD34D" : "#D1D5DB" },
          ]}
        >
          ★
        </Text>
      ))}
      {showRating && <Text style={styles.ratingText}>{rating}</Text>}
    </View>
  );
};

const Badge = ({ children, variant = "default", style }) => {
  const badgeStyle =
    variant === "secondary"
      ? [styles.badge, styles.badgeSecondary, style]
      : [styles.badge, style];

  return (
    <View style={badgeStyle}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
};

const IconButton = ({ onPress, icon, badge }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconButton}>
    <Text style={styles.icon}>{icon}</Text>
    {badge && (
      <View style={styles.iconBadge}>
        <Text style={styles.iconBadgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const FeatureItem = ({ text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureBullet} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const ReviewItem = ({ review }) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewHeader}>
      <Text style={styles.reviewName}>{review.name}</Text>
      <Text style={styles.reviewDate}>{review.date}</Text>
    </View>
    <StarRating rating={review.rating} size={12} />
    <Text style={styles.reviewComment}>{review.comment}</Text>
  </View>
);

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("features");

  // For Expo Router dynamic routes, use useLocalSearchParams
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const productId = id || 1;

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await fetchProductData(productId);
      setProduct(productData);
    } catch (error) {
      Alert.alert("Error", "Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    Alert.alert(
      "Added to Cart",
      `${quantity} x ${product.name} added to cart!`,
      [{ text: "OK" }]
    );
  };

  const handleBuyNow = () => {
    Alert.alert(
      "Buy Now",
      `Proceeding to checkout with ${quantity} x ${product.name}`,
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#FDF2F8", "#F3E8FF"]}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#EC4899" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </LinearGradient>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "features":
        return (
          <View style={styles.tabContent}>
            {product.features.map((feature, index) => (
              <FeatureItem key={index} text={feature} />
            ))}
          </View>
        );
      case "specs":
        return (
          <View style={styles.tabContent}>
            {Object.entries(product.specifications).map(([key, value]) => (
              <View key={key} style={styles.specItem}>
                <Text style={styles.specKey}>{key}:</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>
        );
      case "reviews":
        return (
          <View style={styles.tabContent}>
            {product.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={["#FDF2F8", "#F3E8FF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.icon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <IconButton
            icon="♡"
            onPress={() => Alert.alert("Added to Wishlist")}
          />
          <IconButton icon="🛒" badge="3" onPress={() => Alert.alert("Cart")} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 100 }}
      >
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: product.images[selectedImage] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.thumbnailContainer}>
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(index)}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.thumbnailActive,
                ]}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Badge style={styles.bestSellerBadge}>Best Seller</Badge>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            <StarRating rating={product.rating} showRating />
            <Text style={styles.reviewCount}>
              ({product.reviews.length} reviews)
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            )}
            <Badge variant="secondary" style={styles.saveBadge}>
              Save ${(product.originalPrice - product.price).toFixed(2)}
            </Badge>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartText}>
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyNowButton}
              onPress={handleBuyNow}
            >
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>

          {/* Shipping Info */}
          <View style={styles.shippingInfo}>
            <View style={styles.shippingItem}>
              <Text style={styles.shippingIcon}>🚚</Text>
              <Text style={styles.shippingText}>Free Shipping</Text>
            </View>
            <View style={styles.shippingItem}>
              <Text style={styles.shippingIcon}>🛡️</Text>
              <Text style={styles.shippingText}>Secure Payment</Text>
            </View>
            <View style={styles.shippingItem}>
              <Text style={styles.shippingIcon}>↩️</Text>
              <Text style={styles.shippingText}>Easy Returns</Text>
            </View>
          </View>
        </View>

        {/* Product Details Tabs */}
        <View style={styles.tabContainer}>
          <View style={styles.tabHeader}>
            <TabButton
              title="Features"
              active={activeTab === "features"}
              onPress={() => setActiveTab("features")}
            />
            <TabButton
              title="Specifications"
              active={activeTab === "specs"}
              onPress={() => setActiveTab("specs")}
            />
            <TabButton
              title="Reviews"
              active={activeTab === "reviews"}
              onPress={() => setActiveTab("reviews")}
            />
          </View>
          {renderTabContent()}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDF2F8",
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#EC4899",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    position: "relative",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 18,
    color: "#EC4899",
    fontWeight: "bold",
  },
  iconBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#EC4899",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  mainImageContainer: {
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#F1F5F9",
  },
  thumbnailActive: {
    borderColor: "#EC4899",
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  bestSellerBadge: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "#EC4899",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeSecondary: {
    backgroundColor: "#DCFCE7",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
    lineHeight: 30,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  reviewCount: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#EC4899",
  },
  originalPrice: {
    fontSize: 20,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginLeft: 12,
  },
  saveBadge: {
    marginLeft: 12,
    backgroundColor: "#DCFCE7",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 16,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCE4EC",
    borderRadius: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityValue: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    gap: 8,
    marginBottom: 16,
  },
  addToCartButton: {
    backgroundColor: "#EC4899",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buyNowButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buyNowText: {
    color: "#EC4899",
    fontSize: 18,
    fontWeight: "bold",
  },
  shippingInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#FCE4EC",
  },
  shippingItem: {
    alignItems: "center",
  },
  shippingIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  shippingText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  tabContainer: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tabHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    marginHorizontal: 4,
  },
  tabButtonActive: {
    borderBottomColor: "#EC4899",
  },
  tabButtonText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#EC4899",
    fontWeight: "bold",
  },
  tabContent: {
    minHeight: 100,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EC4899",
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
  },
  specItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  specKey: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  specValue: {
    fontSize: 14,
    color: "#1F2937",
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FCE4EC",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  reviewComment: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 18,
  },
});

export default ProductDetailPage;
