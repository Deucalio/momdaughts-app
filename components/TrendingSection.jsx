import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const COLORS = {
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  deepBlue: "#2c2a6b",
  almostBlack: "#040707",
  white: "#ffffff",
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
  success: "#28a745",
  danger: "#dc3545",
  cream: "#faf9f7",
  softGold: "#f4f1ea",
};

const StarRating = ({ rating }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={styles.star}>
          {star <= Math.floor(rating) ? "★" : star <= rating ? "☆" : "☆"}
        </Text>
      ))}
      <Text style={styles.ratingText}>{rating}</Text>
    </View>
  );
};

const HorizontalProductCard = ({
  product,
  onPress,
  onAddToCart,
  isAddingToCart = false,
}) => {
  // Safety check for product
  if (!product) return null;

  const firstImage = product.images?.[0]?.originalSrc;
  const firstVariant = product.variants?.[0];
  const price = firstVariant
    ? `Rs. ${Number.parseFloat(firstVariant.price).toLocaleString()}`
    : "Price N/A";
  const shortDescription =
    product.description?.split(" ").slice(0, 8).join(" ") + "...";

  return (
    <TouchableOpacity
      style={styles.horizontalProductCard}
      onPress={() => onPress(product)}
      activeOpacity={0.8}
    >
      <View style={styles.horizontalProductImageContainer}>
        <Image
          source={{
            uri:
              firstImage ||
              "https://via.placeholder.com/160x160/f5b8d0/2b2b6b?text=Product",
          }}
          style={styles.horizontalProductImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.addToCartButtonSmall}
          onPress={() => onAddToCart(product)}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.plusIcon}>+</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.horizontalProductInfo}>
        <Text style={styles.horizontalProductTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.horizontalProductSubtitle} numberOfLines={2}>
          {shortDescription}
        </Text>
        <View style={styles.horizontalProductFooter}>
          <StarRating rating={4.5} />
          <Text style={styles.horizontalProductPrice}>{price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TrendingSection = ({ products, onProductPress, onAddToCart, addingToCart }) => {
  return (
    <View style={styles.trendingSection}>
      <View style={styles.trendingHeader}>
        <View style={styles.trendingTitleContainer}>
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingBadgeText}>✨ TRENDING</Text>
          </View>
          <Text style={styles.trendingTitle}>What's Popular</Text>
          <Text style={styles.trendingSubtitle}>
            Loved by thousands of women worldwide
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.trendingScroll}
        contentContainerStyle={styles.trendingScrollContent}
      >
        {products
          .map(
            (product, index) =>
              product && (
                <HorizontalProductCard
                  key={product.id}
                  product={product}
                  onPress={onProductPress}
                  onAddToCart={onAddToCart}
                  isAddingToCart={addingToCart.has(product.id)}
                />
              )
          )}

        {/* If we have less than 4 products, show placeholders */}
        {products.length < 4 &&
          Array.from({ length: 4 - products.length }).map((_, index) => (
            <View
              key={`placeholder-${index}`}
              style={styles.placeholderCard}
            >
              <View style={styles.placeholderImage} />
              <View style={styles.placeholderContent}>
                <View style={styles.placeholderTitle} />
                <View style={styles.placeholderSubtitle} />
                <View style={styles.placeholderPrice} />
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Enhanced Trending Section
  trendingSection: {
    marginBottom: 50,
  },
  trendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  trendingTitleContainer: {
    flex: 1,
  },
  trendingBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.softGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  trendingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.darkBlue,
    letterSpacing: 0.8,
  },
  trendingTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.almostBlack,
    lineHeight: 32,
    marginBottom: 8,
  },
  trendingSubtitle: {
    fontSize: 15,
    color: COLORS.mediumGray,
    lineHeight: 20,
    fontWeight: "400",
  },
  trendingScroll: {
    marginHorizontal: -20,
  },
  trendingScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  horizontalProductCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginRight: 24,
    width: 200,
  },
  horizontalProductImageContainer: {
    position: "relative",
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    height: 140,
    marginBottom: 16,
  },
  horizontalProductImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  addToCartButtonSmall: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.darkBlue,
    width: 28,
    height: 28,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  plusIcon: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "600",
    lineHeight: 18,
  },
  horizontalProductInfo: {
    flex: 1,
  },
  horizontalProductTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.almostBlack,
    marginBottom: 6,
    lineHeight: 22,
  },
  horizontalProductSubtitle: {
    fontSize: 13,
    color: COLORS.mediumGray,
    marginBottom: 16,
    lineHeight: 18,
  },
  horizontalProductFooter: {
    marginTop: 2,
  },
  horizontalProductPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.almostBlack,
    marginTop: 1,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  star: {
    color: "#FFD700",
    fontSize: 16,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  // Placeholder cards for when we have less than 4 products
  placeholderCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 20,
    marginRight: 24,
    width: 200,
    opacity: 0.5,
  },
  placeholderImage: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    height: 140,
    marginBottom: 16,
  },
  placeholderContent: {
    flex: 1,
  },
  placeholderTitle: {
    backgroundColor: COLORS.border,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    backgroundColor: COLORS.border,
    height: 12,
    borderRadius: 6,
    marginBottom: 12,
    width: "70%",
  },
  placeholderPrice: {
    backgroundColor: COLORS.border,
    height: 14,
    borderRadius: 7,
    width: "50%",
  },
});

export default TrendingSection;