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
import Navigation from "../../components/Navigation";
import { useAuthenticatedFetch } from "../utils/authStore";

const BACKEND_URL = "http://192.168.18.5:3000";
const { width } = Dimensions.get("window");

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(3); // Mock cart count
  const { authenticatedFetch } = useAuthenticatedFetch();

  const inferCategoryFromTitle = (title) => {
    const titleLower = title.toLowerCase();
    if (
      titleLower.includes("pad") ||
      titleLower.includes("menstrual") ||
      titleLower.includes("cup")
    )
      return "menstrual";
    if (
      titleLower.includes("wellness") ||
      titleLower.includes("tea") ||
      titleLower.includes("relief")
    )
      return "wellness";
    if (titleLower.includes("supplement") || titleLower.includes("vitamin"))
      return "supplements";
    if (
      titleLower.includes("wash") ||
      titleLower.includes("cream") ||
      titleLower.includes("skincare")
    )
      return "skincare";
    return "wellness";
  };

  const hasDiscount = (variants) => {
    return variants?.some(
      (variant) =>
        variant.compareAtPrice &&
        parseFloat(variant.compareAtPrice) > parseFloat(variant.price)
    );
  };

  const getProductBadge = (product) => {
    if (hasDiscount(product.variants)) return "Sale";
    if (product.tags?.includes("new")) return "New";
    if (product.tags?.includes("bestseller")) return "Best Seller";
    return null;
  };

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${BACKEND_URL}/products`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.products)) {
        throw new Error("Invalid response format");
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to load products");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(true);
  };

  const categories = [
    { id: "all", label: "All", colors: ["#2b2b6b", "#040707"] },
    {
      id: "menstrual",
      label: "Menstrual Care",
      colors: ["#eb9fc1", "#f5b8d0"],
    },
    { id: "wellness", label: "Wellness", colors: ["#e2c6df", "#f5b8d0"] },
    { id: "supplements", label: "Supplements", colors: ["#2b2b6b", "#e2c6df"] },
    { id: "skincare", label: "Skincare", colors: ["#eb9fc1", "#e2c6df"] },
  ];

  const transformedProducts = products.map((product) => {
    const firstVariant = product.variants?.[0];
    const price = firstVariant?.price || "0.00";
    const compareAtPrice = firstVariant?.compareAtPrice || null;

    return {
      id: product.id.split("/").pop(),
      name: product.title,
      price: `Rs. ${price}`,
      originalPrice:
        compareAtPrice && compareAtPrice > price
          ? `Rs. ${compareAtPrice}`
          : null,
      category: inferCategoryFromTitle(product.title),
      rating: 4.5,
      reviews: Math.floor(Math.random() * 200) + 50,
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
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{
            uri:
              item.image ||
              `https://via.placeholder.com/300x200/f5b8d0/2b2b6b?text=No+Image`,
          }}
          style={styles.productImage}
        />
        {item.badge && (
          <LinearGradient
            colors={["#eb9fc1", "#f5b8d0"]}
            style={styles.productBadge}
          >
            <Text style={styles.productBadgeText}>{item.badge}</Text>
          </LinearGradient>
        )}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={16} color="#2b2b6b" />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.productRating}>
          <Ionicons name="star" size={12} color="#eb9fc1" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviews})
          </Text>
        </View>

        <View style={styles.productPricing}>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{item.price}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>{item.originalPrice}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !item.inStock && styles.addToCartButtonDisabled,
          ]}
          disabled={!item.inStock}
        >
          <LinearGradient
            colors={
              item.inStock ? ["#2b2b6b", "#040707"] : ["#e2c6df", "#f5b8d0"]
            }
            style={styles.addToCartGradient}
          >
            <Text
              style={[
                styles.addToCartText,
                !item.inStock && styles.addToCartTextDisabled,
              ]}
            >
              {item.inStock ? "Add to Cart" : "Out of Stock"}
            </Text>
          </LinearGradient>
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

  const renderContent = () => {
    if (loading && !refreshing) return renderLoadingSkeleton();
    if (error && !refreshing) {
      return (
        <View style={styles.errorState}>
          <Ionicons name="alert-circle" size={48} color="#eb9fc1" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchProducts()}
          >
            <LinearGradient
              colors={["#2b2b6b", "#040707"]}
              style={styles.retryGradient}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredProducts.length === 0 && !loading) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color="#e2c6df" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filter criteria.
          </Text>
        </View>
      );
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
            colors={["#eb9fc1"]}
            tintColor="#eb9fc1"
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#f5b8d0", "#e2c6df"]}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Wellness Shop</Text>
          <Text style={styles.heroSubtitle}>
            Discover premium products designed for your wellness journey
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
              color="#2b2b6b"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#e2c6df"
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!loading}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} disabled={loading}>
            <Ionicons name="options" size={20} color="#2b2b6b" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/cart/cart")}
          >
            <Ionicons name="bag" size={20} color="#2b2b6b" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
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

      {/* Navigation */}
      <Navigation currentRoute="shop" cartCount={cartCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2b2b6b",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#040707",
    textAlign: "center",
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#f5b8d0",
    borderRadius: 12,
    paddingHorizontal: 12,
    opacity: 0.3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2b2b6b",
  },
  filterButton: {
    backgroundColor: "#f5b8d0",
    borderRadius: 12,
    padding: 12,
    opacity: 0.3,
  },
  cartButton: {
    backgroundColor: "#f5b8d0",
    borderRadius: 12,
    padding: 12,
    position: "relative",
    opacity: 0.3,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#eb9fc1",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  cartBadgeText: {
    color: "#ffffff",
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
    borderColor: "#e2c6df",
  },
  categoryTextActive: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextInactive: {
    color: "#2b2b6b",
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
    shadowColor: "#2b2b6b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f5b8d0",
  },
  productImageContainer: {
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  productBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 8,
  },
  productInfo: {
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#040707",
    lineHeight: 18,
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#2b2b6b",
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
    color: "#2b2b6b",
  },
  originalPrice: {
    fontSize: 12,
    color: "#e2c6df",
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  addToCartGradient: {
    paddingVertical: 8,
    alignItems: "center",
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  addToCartTextDisabled: {
    color: "#2b2b6b",
  },
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
    borderWidth: 1,
    borderColor: "#f5b8d0",
  },
  skeletonImage: {
    height: 120,
    backgroundColor: "#f5b8d0",
    borderRadius: 12,
    marginBottom: 12,
    opacity: 0.3,
  },
  skeletonText: {
    height: 16,
    backgroundColor: "#e2c6df",
    borderRadius: 4,
    marginBottom: 8,
    opacity: 0.3,
  },
  skeletonTextSmall: {
    height: 12,
    backgroundColor: "#e2c6df",
    borderRadius: 4,
    marginBottom: 8,
    width: "60%",
    opacity: 0.3,
  },
  skeletonButton: {
    height: 32,
    backgroundColor: "#e2c6df",
    borderRadius: 8,
    opacity: 0.3,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#040707",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#2b2b6b",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  retryGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#040707",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#2b2b6b",
    textAlign: "center",
  },
});
