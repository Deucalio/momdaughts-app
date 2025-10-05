"use client";
import { Image } from "expo-image";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CartToast from "../../components/CartToast";
import ScreenWrapper from "../../components/ScreenWrapper";
import Text from "../../components/Text";
import {
    addToCart,
    fetchCartItemsCount,
    fetchCollections,
} from "../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const COLORS = {
  darkest: "#21152B",
  dark: "#2C103A",
  medium: "#382449",
  light: "#432B57",
  lightest: "#4E3366",
  white: "#ffffff",
  buttonColor: "#2c2a6b",
  accent: "#6C5CE7",
  success: "#00B894",
  warning: "#FDCB6E",
  error: "#E17055",
  gray: "#636e72",
  lightGray: "#ddd",
};

const BACKEND_URL = "https://app-backend.momdaughts.com";

const categories = [
  {
    id: "426340712740",
    title: "Menstrual Collection",
    imageUrl: "https://i.ibb.co/DfJhZQr5/image.png",
    color: "#E5F5E5",
  },
  {
    id: "630364766500",
    title: "IPL Laser Hair Removal",
    imageUrl: "https://i.ibb.co/YBNh9319/image.png",
    color: "#F0E5FF",
  },
  {
    id: "449705443620",
    title: "Skin Serums",
    imageUrl: "https://i.ibb.co/QFvp5VXw/image.png",
    color: "#FFF5E5",
  },
  {
    id: "637913465124",
    title: "Skin Care",
    imageUrl: "https://i.ibb.co/jP5cS5J0/image.png",
    color: "#E5F5E5",
  },
];

const assignRandomCategory = () => {
  const categoryTitles = ["Best Selling"];
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
};

const bannerData = [
  {
    id: 2,
    title: "Wellness Sale",
    subtitle: "Up to 50% Off!",
    buttonText: "Explore",
    colors: [COLORS.dark, COLORS.light],
    discount: "50%",
    image:
      "https://momdaughts.com/cdn/shop/files/banner_3_mob.jpg?v=1748096411&width=400%20400w,%20//momdaughts.com/cdn/shop/files/banner_3_mob.jpg?v=1748096411&width=600%20600w,%20//momdaughts.com/cdn/shop/files/banner_3_mob.jpg?v=1748096411&width=800%20800w,%20//momdaughts.com/cdn/shop/files/banner_3_mob.jpg?v=1748096411&width=1000%201000w",
  },
  {
    id: 1,
    title: "First Purchase",
    subtitle: "Enjoy a Special Offer!",
    buttonText: "Shop Now",
    colors: [COLORS.medium, COLORS.lightest],
    discount: "$200",
    image:
      "https://momdaughts.com/cdn/shop/files/banne_2_mob.jpg?v=1748096411&width=800",
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Fresh Products Daily",
    buttonText: "Discover",
    colors: [COLORS.darkest, COLORS.medium],
    discount: "NEW",
    image:
      "https://momdaughts.com/cdn/shop/files/banner_1_mob.jpg?v=1748096411&width=400%20400w,%20//momdaughts.com/cdn/shop/files/banner_1_mob.jpg?v=1748096411&width=600%20600w,%20//momdaughts.com/cdn/shop/files/banner_1_mob.jpg?v=1748096411&width=800%20800w,%20//momdaughts.com/cdn/shop/files/banner_1_mob.jpg?v=1748096411&width=1000%201000w",
  },
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const insets = useSafeAreaInsets();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [addToCartToast, setAddToCartToast] = useState({
    clickCount: 0,
    showToast: false,
    selectedProduct: {
      name: "",
      image: "",
    },
  });
  const router = useRouter();
  const { user } = useAuthStore();
  const [apiCollections, setApiCollections] = useState([]);

  const loadCartItemsCount = async () => {
    try {
      const result = await fetchCartItemsCount(authenticatedFetch);
      if (result.success) {
        setCartItemCount(result.count);
      }
    } catch (error) {
      console.error("[v0] Failed to load cart count:", error);
    }
  };

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const response = await authenticatedFetch(
        `${BACKEND_URL}/products?numberOfProducts=100`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.products)) {
        throw new Error("Invalid response format");
      }
      const productsWithCategories = (data.products || []).map((product) => ({
        ...product,
        assignedCategory: assignRandomCategory(),
      }));
      setProducts(productsWithCategories);
      setFilteredProducts(productsWithCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to load products");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const loadCollections = async () => {
    const ids = "426340712740,630364766500,449705443620,637913465124";
    const collections = await fetchCollections(authenticatedFetch, ids);
    setApiCollections(collections);
  };

  const handleProductSearch = (query) => {
    setProductSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    fetchProducts();
    // loadCartItemsCount();
    loadCollections();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Use requestAnimationFrame to defer state updates
      requestAnimationFrame(() => {
        loadCartItemsCount();
        setAddToCartToast({
          clickCount: 0,
          showToast: false,
          selectedProduct: {
            name: "",
            image: "",
          },
        });
      });
    }, [])
  );
  const handleAddToCart = async (item) => {
    const cartItem = {
      userId: user.id,
      shopifyProductId: item.id.split("/").slice(-1)[0],
      shopifyVariantId: item.variants[0].id.split("/").slice(-1)[0],
      productTitle: item.title,
      price: parseInt(item.variants[0].price.replace("Rs.", "").trim()),
      quantity: 1,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      setCartItemCount(cartItemCount + 1);
      setAddToCartToast({
        clickCount: addToCartToast.clickCount + 1,
        showToast: true,
        selectedProduct: {
          name: item.title,
          image: item.images[0]?.originalSrc || "",
        },
      });
      // const res = await authenticatedFetch(`${BACKEND_URL}/add-to-cart`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ cartData: cartItem }),
      // });
      // const data = await res.json();
      const addToCartAction = await addToCart(authenticatedFetch, cartItem);
    } catch (e) {
      setCartItemCount(cartItemCount - 1);
      console.log("Error Occured: ", error);
    } finally {
      loadCartItemsCount();
    }
  };

  const navigateToProduct = (id) => {
    const formattedId = id.split("/").pop();
    router.push(`/products/${formattedId}`);
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryItemContainer}>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          const collection_ = apiCollections.find(
            (collection) => collection.id.split("/").slice(-1)[0] === item.id
          );
          if (!collection_) {
            router.push(`/screens/collections/${item.id}`);
            return1;
          }
          router.push(
            `/screens/collections/${
              collection_.id.split("/").slice(-1)[0]
            }?imageUrl=${collection_.image?.url}&title=${
              collection_.title
            }&description=${collection_.description}`
          );
        }}
        style={[styles.categoryCard, { backgroundColor: item.color }]}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
      </TouchableOpacity>
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigateToProduct(item.id)}
      style={styles.productCard}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{
            uri:
              item.images?.[0]?.originalSrc ||
              "/placeholder.svg?height=200&width=200",
          }}
          style={styles.productImage}
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>4.8 (104)</Text>
        </View>
        <Text style={styles.productPrice}>
          Rs. {item.variants?.[0]?.price || "0.00"}
        </Text>
        <TouchableOpacity
          onPress={() => handleAddToCart(item)}
          style={styles.addToCartButton}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderGridProductItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigateToProduct(item.id)}
      style={styles.gridProductCard}
    >
      <View style={styles.gridProductImageContainer}>
        <Image
          source={{
            uri:
              item.images?.[0]?.originalSrc ||
              "/placeholder.svg?height=200&width=200",
          }}
          style={styles.gridProductImage}
        />
      </View>
      <View style={styles.gridProductInfo}>
        <Text style={styles.gridProductName} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.gridRatingText}>4.8 (104)</Text>
        </View>
        <Text style={styles.gridProductPrice}>
          Rs. {item.variants?.[0]?.price || "0.00"}
        </Text>
        <TouchableOpacity
          onPress={() => handleAddToCart(item)}
          style={styles.gridAddToCartButton}
        >
          <Text style={styles.gridAddToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerCard}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
      {/* <View style={styles.bannerOverlay}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>{item.buttonText}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>{item.discount}</Text>
        </View>
      </View> */}
    </View>
  );

  return (
    <ScreenWrapper cartItemCount={cartItemCount}>
      <SafeAreaView
        style={[
          styles.container,
          {
            paddingTop: insets.top + 2,
          },
        ]}
      >
        {/* <StatusBar style="dark" /> */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Search */}

          {/* Banners */}
          <View style={styles.bannerSection}>
            <FlatList
              data={bannerData}
              renderItem={renderBannerItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bannerContainer}
            />
          </View>

          {/* Categories Grid */}
          <View style={styles.section}>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          </View>

          {/* Best Selling */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best Selling</Text>
            <FlatList
              data={products.filter(
                (p) => p.assignedCategory === "Best Selling"
              )}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            />
          </View>

          {/* All Products Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Products</Text>

            {/* Search Bar for Products */}
            <View style={styles.productSearchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#999"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.productSearchInput}
                placeholder="Search all products"
                placeholderTextColor="#999"
                value={productSearchQuery}
                onChangeText={handleProductSearch}
              />
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="options" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Products Grid */}
            <FlatList
              data={filteredProducts}
              renderItem={renderGridProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      <CartToast
        isVisible={addToCartToast.showToast}
        onClose={() => {
          setAddToCartToast((prev) => ({
            ...prev,
            showToast: false,
          }));
        }}
        productName={addToCartToast.selectedProduct.name}
        productImage={addToCartToast.selectedProduct.image}
        clickCount={addToCartToast.clickCount}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    // paddingTop: 10,
  },
  bannerSection: {
    height: screenHeight * 0.3,
    marginTop: 7,
    marginBottom: 20,
  },
  bannerContainer: {
    paddingHorizontal: 20,
  },
  bannerCard: {
    width: screenWidth - 40,
    height: screenHeight * 0.3,
    marginRight: 37,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#fff",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 16,
    opacity: 0.9,
  },
  bannerButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#333",
    fontFamily: "Outfit-SemiBold",
    fontSize: 14,
  },
  bannerBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bannerBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Outfit-Bold",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Outfit-Bold",
    color: "#333",
    marginBottom: 15,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryItemContainer: {
    alignItems: "center",
    marginRight: 6,
  },
  categoryCard: {
    width: 90,
    height: 90,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  categoryTitle: {
    fontSize: 11,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    textAlign: "center",
    maxWidth: 100,
  },
  productsContainer: {
    paddingRight: 20,
  },
  productCard: {
    width: 180,
    backgroundColor: "#fff",
    marginRight: 15,
  },
  productImageContainer: {
    width: "100%",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "90%",
    height: "90%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Outfit-Bold",
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: "#2c2a6b",
    paddingVertical: 8,
    width: "90%",
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Outfit-SemiBold",
  },
  // New styles for All Products section
  productSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 20,
  },
  productSearchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  gridContainer: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridProductCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
  },
  gridProductImageContainer: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridProductImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  gridProductInfo: {
    padding: 12,
  },
  gridProductName: {
    fontSize: 13,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: 6,
    lineHeight: 16,
    minHeight: 32,
  },
  gridRatingText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  gridProductPrice: {
    fontSize: 15,
    color: "#333",
    fontFamily: "Outfit-Bold",
    marginBottom: 10,
  },
  gridAddToCartButton: {
    backgroundColor: "#2c2a6b",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  gridAddToCartText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
  },
});
