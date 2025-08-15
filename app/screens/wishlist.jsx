import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Your color theme
const COLORS = {
  lightPink: "#f5b8d0",
  lavender: "#e2c6df", 
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  almostBlack: "#040707",
  white: "#ffffff",
  // Additional utility colors
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

// Mock wishlist data
const MOCK_WISHLIST = [
  {
    id: "1",
    title: "Vitamin C Brightening Serum",
    price: 2499,
    originalPrice: 2999,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
  },
  {
    id: "2", 
    title: "Hyaluronic Acid Moisturizer",
    price: 1899,
    originalPrice: 2299,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
  },
  {
    id: "3",
    title: "Retinol Night Cream",
    price: 3299,
    originalPrice: 3799,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 156,
    inStock: false,
  },
  {
    id: "4",
    title: "Niacinamide Pore Minimizer",
    price: 1599,
    originalPrice: 1899,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 203,
    inStock: true,
  },
  {
    id: "5",
    title: "Gentle Cleansing Foam",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 67,
    inStock: true,
  },
  {
    id: "6",
    title: "Sunscreen SPF 50+",
    price: 1799,
    originalPrice: 2199,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 91,
    inStock: true,
  },
];

export default function WishlistScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(new Set());

  // Simulate API call
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setWishlistItems(MOCK_WISHLIST);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        Alert.alert("Error", "Failed to load your wishlist. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (itemId) => {
    setRemovingItems(prev => new Set([...prev, itemId]));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      
      // Show success feedback
      Alert.alert("Removed", "Item removed from your wishlist.");
    } catch (error) {
      Alert.alert("Error", "Failed to remove item. Please try again.");
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (item) => {
    if (!item.inStock) {
      Alert.alert("Out of Stock", "This item is currently unavailable.");
      return;
    }

    setAddingToCart(prev => new Set([...prev, item.id]));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        "Added to Cart", 
        `${item.title} has been added to your cart.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => navigation.navigate("Cart") }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const renderWishlistItem = ({ item }) => (
    <WishlistItem
      item={item}
      onRemove={() => handleRemoveFromWishlist(item.id)}
      onAddToCart={() => handleAddToCart(item)}
      isRemoving={removingItems.has(item.id)}
      isAddingToCart={addingToCart.has(item.id)}
    />
  );

  const renderSkeletonItem = () => (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonPrice} />
        <View style={styles.skeletonRating} />
        <View style={styles.skeletonButton} />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>💝</Text>
      </View>
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Save your favorite skincare products here to purchase them later
      </Text>
      <Pressable 
        style={styles.shopNowButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.shopNowText}>Start Shopping</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading..." : `${wishlistItems.length} items saved`}
          </Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      {/* Content */}
      {loading ? (
        <FlatList
          data={Array(6).fill(null)}
          renderItem={renderSkeletonItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : wishlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function WishlistItem({ item, onRemove, onAddToCart, isRemoving, isAddingToCart }) {
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleRemove = () => {
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onRemove();
  };

  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} style={styles.star}>★</Text>);
    }
    
    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.star}>⭐</Text>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Text key={`empty-${i}`} style={styles.emptyStar}>☆</Text>);
    }

    return stars;
  };

  return (
    <Animated.View style={[styles.itemContainer, { opacity: fadeAnim }]}>
      <View style={styles.itemCard}>
        {/* Remove Button */}
        <Pressable 
          style={styles.removeButton}
          onPress={handleRemove}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.removeIcon}>✕</Text>
          )}
        </Pressable>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          {!item.inStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(item.rating)}
            </View>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{formatPrice(item.price)}</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
            )}
          </View>

          {/* Add to Cart Button */}
          <Pressable
            style={[
              styles.addToCartButton,
              !item.inStock && styles.addToCartButtonDisabled
            ]}
            onPress={onAddToCart}
            disabled={isAddingToCart || !item.inStock}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.addToCartText}>
                {item.inStock ? "Add to Cart" : "Out of Stock"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 20,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  headerContent: {
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.darkBlue,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightPink,
    opacity: 0.3,
    zIndex: 1,
  },

  // List
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },

  // Wishlist Item
  itemContainer: {
    width: ITEM_WIDTH,
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: COLORS.almostBlack,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.mediumPink,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: COLORS.almostBlack,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  removeIcon: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Image
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Product Info
  productInfo: {
    gap: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkBlue,
    lineHeight: 18,
  },

  // Rating
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    color: COLORS.mediumPink,
    fontSize: 12,
  },
  emptyStar: {
    color: COLORS.border,
    fontSize: 12,
  },
  reviewCount: {
    fontSize: 11,
    color: COLORS.mediumGray,
  },

  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkBlue,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.mediumGray,
    textDecorationLine: 'line-through',
  },

  // Add to Cart Button
  addToCartButton: {
    backgroundColor: COLORS.darkBlue,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Skeleton Loading
  skeletonItem: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: COLORS.almostBlack,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  skeletonImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    marginBottom: 12,
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: '80%',
  },
  skeletonPrice: {
    height: 14,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: '60%',
  },
  skeletonRating: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    width: '70%',
  },
  skeletonButton: {
    height: 36,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginTop: 4,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkBlue,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: COLORS.mediumPink,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: COLORS.mediumPink,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  shopNowText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});