"use client"

import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"

const { width } = Dimensions.get("window")

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { id: "all", label: "All", colors: ["#6b7280", "#4b5563"] },
    { id: "pads", label: "Pads", colors: ["#ec4899", "#f43f5e"] },
    { id: "wellness", label: "Wellness", colors: ["#10b981", "#059669"] },
    { id: "supplements", label: "Supplements", colors: ["#8b5cf6", "#7c3aed"] },
    { id: "skincare", label: "Skincare", colors: ["#3b82f6", "#06b6d4"] },
  ]

  const products = [
    {
      id: 1,
      name: "Organic Cotton Pads - Regular",
      price: 12.99,
      originalPrice: 15.99,
      category: "pads",
      rating: 4.8,
      reviews: 124,
      badge: "Best Seller",
      inStock: true,
    },
    {
      id: 2,
      name: "Wellness Tea Blend",
      price: 18.99,
      category: "wellness",
      rating: 4.6,
      reviews: 89,
      badge: "New",
      inStock: true,
    },
    {
      id: 3,
      name: "Period Pain Relief Patches",
      price: 24.99,
      category: "wellness",
      rating: 4.9,
      reviews: 156,
      badge: "Trending",
      inStock: true,
    },
    {
      id: 4,
      name: "Vitamin D3 + Iron Supplement",
      price: 29.99,
      category: "supplements",
      rating: 4.7,
      reviews: 203,
      inStock: false,
    },
    {
      id: 5,
      name: "Gentle Intimate Wash",
      price: 16.99,
      category: "skincare",
      rating: 4.5,
      reviews: 67,
      inStock: true,
    },
    {
      id: 6,
      name: "Ultra-Thin Night Pads",
      price: 14.99,
      category: "pads",
      rating: 4.8,
      reviews: 178,
      inStock: true,
    },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/shop/product/${item.id}`)}>
      <View style={styles.productImage}>
        <LinearGradient colors={["#f9fafb", "#f3f4f6"]} style={styles.productImageGradient} />
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
            {item.rating} ({item.reviews})
          </Text>
        </View>

        <View style={styles.productPricing}>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>${item.price}</Text>
            {item.originalPrice && <Text style={styles.originalPrice}>${item.originalPrice}</Text>}
          </View>
          {!item.inStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, !item.inStock && styles.addToCartButtonDisabled]}
          disabled={!item.inStock}
        >
          <Text style={[styles.addToCartText, !item.inStock && styles.addToCartTextDisabled]}>
            {item.inStock ? "Add to Cart" : "Notify Me"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#ecfdf5", "#d1fae5", "#a7f3d0"]} style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Wellness Shop</Text>
          <Text style={styles.heroSubtitle}>
            Discover premium products designed for your wellness journey. From organic period care to health
            supplements.
          </Text>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
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
            >
              {selectedCategory === category.id ? (
                <LinearGradient colors={category.colors} style={styles.categoryButtonActive}>
                  <Text style={styles.categoryTextActive}>{category.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryButtonInactive}>
                  <Text style={styles.categoryTextInactive}>{category.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Banner */}
      <View style={styles.bannerSection}>
        <LinearGradient colors={["#fdf2f8", "#f3e8ff", "#eff6ff"]} style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>Spring Wellness Sale! 🌸</Text>
          <Text style={styles.bannerSubtitle}>Get 20% off on all wellness products this month</Text>
          <TouchableOpacity style={styles.bannerButton}>
            <LinearGradient colors={["#ec4899", "#8b5cf6"]} style={styles.bannerButtonGradient}>
              <Text style={styles.bannerButtonText}>Shop Sale Items</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Products Grid */}
      <View style={styles.productsSection}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search" size={32} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filter criteria.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsGrid}
          />
        )}
      </View>
    </SafeAreaView>
  )
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
  bannerSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bannerCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  bannerButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  bannerButtonText: {
    color: "white",
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
  productImageGradient: {
    flex: 1,
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
    color: "#ec4899",
  },
  originalPrice: {
    fontSize: 12,
    color: "#9ca3af",
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
    backgroundColor: "#ec4899",
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
})
