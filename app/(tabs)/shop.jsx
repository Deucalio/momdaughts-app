"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthenticatedFetch } from "../utils/authStore";

const { width } = Dimensions.get("window");

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { authenticatedFetch } = useAuthenticatedFetch();

  // Helper function to infer category from product title
  const inferCategoryFromTitle = (title) => {
    const titleLower = title.toLowerCase();
    if (
      titleLower.includes("pad") ||
      titleLower.includes("menstrual") ||
      titleLower.includes("cup")
    )
      return "menstrual cups";
    if (
      titleLower.includes("wellness") ||
      titleLower.includes("tea") ||
      titleLower.includes("relief") ||
      titleLower.includes("pain")
    )
      return "wellness";
    if (
      titleLower.includes("supplement") ||
      titleLower.includes("vitamin") ||
      titleLower.includes("iron") ||
      titleLower.includes("calcium")
    )
      return "supplements";
    if (
      titleLower.includes("wash") ||
      titleLower.includes("cream") ||
      titleLower.includes("skincare") ||
      titleLower.includes("intimate")
    )
      return "skincare";
    return "wellness"; // Default category
  };

  // Helper function to determine if product has discount
  const hasDiscount = (variants) => {
    return variants?.some(
      (variant) =>
        variant.compareAtPrice &&
        parseFloat(variant.compareAtPrice) > parseFloat(variant.price)
    );
  };

  // Helper function to get badge for product
  const getProductBadge = (product) => {
    if (hasDiscount(product.variants)) return "Sale";
    if (product.tags?.includes("new")) return "New";
    if (product.tags?.includes("bestseller")) return "Best Seller";
    if (product.tags?.includes("trending")) return "Trending";
    return null;
  };

  const fetchProducts = async (isRefresh = false) => {
    const startTime = performance.now();
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const response = await authenticatedFetch(
        "http://192.168.18.5:3000/products"
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.products)) {
        throw new Error("Invalid response format - expected products array");
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to load products");
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
      const endTime = performance.now();
      const timeInSeconds = (endTime - startTime) / 1000;
      console.log(`Fetch took ${timeInSeconds} seconds`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(true);
  };

  const handleRetry = () => {
    fetchProducts();
  };

  const categories = [
    { id: "all", label: "All", colors: ["#6b7280", "#4b5563"] },
    {
      id: "menstrualcups",
      label: "Menstrual Cups",
      colors: ["#ec4899", "#f43f5e"],
    },
    { id: "wellness", label: "Wellness", colors: ["#10b981", "#059669"] },
    { id: "supplements", label: "Supplements", colors: ["#8b5cf6", "#7c3aed"] },
    { id: "skincare", label: "Skincare", colors: ["#3b82f6", "#06b6d4"] },
  ];

  // Transform Shopify products to match our UI structure
  const transformedProducts = products.map((product) => {
    const firstVariant = product.variants?.[0];
    const price = firstVariant?.price || "0.00";
    const compareAtPrice = firstVariant?.compareAtPrice || null;

    return {
      id: product.id,
      name: product.title,
      price: price,
      originalPrice:
        compareAtPrice && compareAtPrice > price ? compareAtPrice : null,
      category: inferCategoryFromTitle(product.title),
      rating: 4.5, // Default rating - replace with actual metafield data if available
      reviews: Math.floor(Math.random() * 200) + 50, // Random reviews - replace with actual data
      badge: getProductBadge(product),
      inStock:
        product.variants?.some(
          (variant) => variant.availableForSale !== false
        ) ?? true,
      image: product.images?.[0]?.originalSrc || null,
      description: product.description,
      handle: product.handle,
      variants: product.variants,
      tags: product.tags || [],
    };
  });

  const filteredProducts = transformedProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/products/${1}`)}
    >
      <View style={styles.productImage}>
        <Image
          source={{
            uri:
              item.image ||
              `https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image`,
          }}
          style={styles.productImage}
          defaultSource={{
            uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          }}
          onError={() => {
            // Handle image load error
            console.log("Failed to load product image for:", item.name);
          }}
        />
        {item.badge && (
          <View style={styles.productBadge}>
            <Text style={styles.productBadgeText}>{item.badge}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.productRating}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviews} reviews)
          </Text>
        </View>

        <View style={styles.productPricing}>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{item.price}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>{item.originalPrice}</Text>
            )}
          </View>
          {!item.inStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !item.inStock && styles.addToCartButtonDisabled,
          ]}
          disabled={!item.inStock}
        >
          <Text
            style={[
              styles.addToCartText,
              !item.inStock && styles.addToCartTextDisabled,
            ]}
          >
            {item.inStock ? "Add to Cart" : "Notify Me"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonTextSmall} />
          <View style={styles.skeletonButton} />
        </View>
      ))}
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle" size={32} color="#ef4444" />
      </View>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="search" size={32} color="#9ca3af" />
      </View>
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search or filter criteria.
      </Text>
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return renderLoadingSkeleton();
    }

    if (error && !refreshing) {
      return renderErrorState();
    }

    if (filteredProducts.length === 0 && !loading) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsGrid}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#ec4899"]}
            tintColor="#ec4899"
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#ecfdf5", "#d1fae5", "#a7f3d0"]}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Wellness Shop</Text>
          <Text style={styles.heroSubtitle}>
            Discover premium products designed for your wellness journey. From
            organic period care to health supplements.
          </Text>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#6b7280"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!loading}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} disabled={loading}>
            <Ionicons name="options" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="bag" size={20} color="#6b7280" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={styles.categoryButton}
              disabled={loading}
            >
              {selectedCategory === category.id ? (
                <LinearGradient
                  colors={category.colors}
                  style={styles.categoryButtonActive}
                >
                  <Text style={styles.categoryTextActive}>
                    {category.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryButtonInactive}>
                  <Text style={styles.categoryTextInactive}>
                    {category.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Section */}
      <View style={styles.productsSection}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  filterButton: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cartButton: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ec4899",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryButton: {
    marginRight: 8,
  },
  categoryButtonActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryButtonInactive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryTextActive: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextInactive: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
  productsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsGrid: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
  },
  productBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ec4899",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 8,
  },
  productInfo: {
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: 18,
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
  },
  productPricing: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  originalPrice: {
    fontSize: 12,
    color: "#000000",
    textDecorationLine: "line-through",
  },
  outOfStockBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 10,
    color: "#6b7280",
  },
  addToCartButton: {
    backgroundColor: "#2c2a6b",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartButtonDisabled: {
    backgroundColor: "#f3f4f6",
  },
  addToCartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  addToCartTextDisabled: {
    color: "#9ca3af",
  },
  // Loading Skeleton Styles
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skeletonCard: {
    width: (width - 40) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonImage: {
    height: 120,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonText: {
    height: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTextSmall: {
    height: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginBottom: 8,
    width: "60%",
  },
  skeletonButton: {
    height: 32,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  // Error State Styles
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#fef2f2",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#f3f4f6",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
