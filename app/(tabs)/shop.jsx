"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CartToast from "../../components/CartToast";
import ScreenWrapper from "../../components/ScreenWrapper";
import { fetchCartItemsCount } from "../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";

const BACKEND_URL = "http://192.168.18.5:3000";
const { width, height } = Dimensions.get("window");

// New purple gradient theme colors
const COLORS = {
  darkest: "#21152B",
  dark: "#2C103A",
  medium: "#382449",
  light: "#432B57",
  lightest: "#4E3366",
  white: "#ffffff",
  buttonColor: "#2c2a6b",
};

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [addToCartToast, setAddToCartToast] = useState({
    clickCount: 0,
    showToast: false,
    selectedProduct: {
      name: "",
      image: "",
    },
  });

  const { user } = useAuthStore();

  const storeCartItemsCount = async () => {
    const count = await fetchCartItemsCount(authenticatedFetch);
    if (count.success) {
      setCartItemCount(count.count);
      return;
    }
    throw new Error("Failed to fetch cart items count");
  };

  // Banner auto-slide
  const bannerScrollRef = useRef(null);
  const bannerTimer = useRef(null);

  const bannerData = [
    {
      id: 1,
      title: "First Purchase",
      subtitle: "Enjoy a Special Offer!",
      buttonText: "Shop Now",
      colors: [COLORS.medium, COLORS.lightest],
      discount: "$200",
      image:
        "https://momdaughts.com/cdn/shop/files/banne_2_mob.jpg?v=1748096411&width=400%20400w,%20//momdaughts.com/cdn/shop/files/banne_2_mob.jpg?v=1748096411&width=600%20600w,%20//momdaughts.com/cdn/shop/files/banne_2_mob.jpg?v=1748096411&width=800%20800w,%20//momdaughts.com/cdn/shop/files/banne_2_mob.jpg?v=1748096411&width=1000%201000w",
    },
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

  // Auto-slide banner
  useEffect(() => {
    bannerTimer.current = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % bannerData.length;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => {
      if (bannerTimer.current) {
        clearInterval(bannerTimer.current);
      }
    };
  }, []);

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

  const getUniqueCategories = (products) => {
    const categories = new Set();
    products.forEach((product) => {
      const category = inferCategoryFromTitle(product.title);
      categories.add(category);
    });
    return Array.from(categories).map((cat) => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: getCategoryIcon(cat),
    }));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      menstrual: "flower-outline",
      wellness: "leaf-outline",
      supplements: "medical-outline",
      skincare: "sparkles-outline",
    };
    return icons[category] || "grid-outline";
  };

  const hasDiscount = (variants) => {
    return variants?.some(
      (variant) =>
        variant.compareAtPrice &&
        Number.parseFloat(variant.compareAtPrice) >
          Number.parseFloat(variant.price)
    );
  };

  const getProductBadge = (product) => {
    if (hasDiscount(product.variants))
      return { text: "Sale", color: COLORS.light };
    if (product.tags?.includes("new"))
      return { text: "New", color: COLORS.medium };
    if (product.tags?.includes("bestseller"))
      return { text: "Best", color: COLORS.darkest };
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
    storeCartItemsCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      storeCartItemsCount();
      setAddToCartToast({
        clickCount: 0,
        showToast: false,
        selectedProduct: {
          name: "",
          image: "",
        },
      });
    }, [])
  );
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(true);
  };

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
      rating: 4.2 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 150) + 25,
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
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const uniqueCategories = getUniqueCategories(products);

  const renderBanner = ({ item }) => {
    if (item.image) {
      return (
        <TouchableOpacity
          style={{
            width: width - 40,
            height: height * 0.22, // Takes 22% of screen height (more than 20% as requested)
            borderRadius: 20,
            marginHorizontal: 20,
            overflow: "hidden", // Ensures image respects border radius
            elevation: 5, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
          onPress={() => {
            // Handle banner tap here
            console.log("Banner tapped");
          }}
        >
          <Image
            source={{
              uri: item.image,
            }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 20,
            }}
            resizeMode="cover" // Ensures image covers the entire area
          />
        </TouchableOpacity>
      );
    }
    <LinearGradient
      colors={item.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: width - 40,
        height: height * 0.22,
        borderRadius: 20,
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 20,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 6,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 16,
            marginBottom: 20,
          }}
        >
          {item.subtitle}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 20,
            paddingHorizontal: 20,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              color: COLORS.medium,
              fontSize: 14,
              fontWeight: "600",
              marginRight: 8,
            }}
          >
            {item.buttonText}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.medium} />
        </TouchableOpacity>
      </View>
      <View style={{ position: "relative" }}>
        <Image
          source={{
            uri: "https://via.placeholder.com/90x90/4E3366/white?text=Offer",
          }}
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
        <View
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            backgroundColor: "#4CAF50",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{ color: COLORS.white, fontSize: 12, fontWeight: "bold" }}
          >
            {item.discount}
          </Text>
        </View>
      </View>
    </LinearGradient>;
  };

  const renderProduct = ({ item, index }) => {

    const discountPercentage = item.originalPrice
      ? Math.round(
          ((Number.parseFloat(item.originalPrice.replace("Rs. ", "")) -
            Number.parseFloat(item.price.replace("Rs. ", ""))) /
            Number.parseFloat(item.originalPrice.replace("Rs. ", ""))) *
            100
        )
      : 0;

    return (
      <TouchableOpacity
        style={{
          width: (width - 48) / 2,
          marginRight: index % 2 === 0 ? 8 : 0,
          marginLeft: index % 2 === 1 ? 8 : 0,
          backgroundColor: COLORS.white,
          borderRadius: 16,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => router.push(`/products/${item.id}`)}
        activeOpacity={0.95}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{
              uri:
                item.image ||
                `https://via.placeholder.com/300x200/4E3366/white?text=Product`,
            }}
            style={{
              width: "100%",
              height: 120,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              backgroundColor: COLORS.lightest,
            }}
            resizeMode="cover"
          />

          {item.badge && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: item.badge.color,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.badge.text}
              </Text>
            </View>
          )}

          {discountPercentage > 0 && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "#4CAF50",
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                -{discountPercentage}%
              </Text>
            </View>
          )}
          {/* 
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 12,
              padding: 6,
            }}
            onPress={() => handleWishlistToggle(item.id)}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={16}
              color={isWishlisted ? COLORS.light : "#666"}
            />
          </TouchableOpacity> */}
        </View>

        <View style={{ padding: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: COLORS.darkest,
              marginBottom: 6,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="star" size={12} color={COLORS.light} />
            <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
              {item.rating.toFixed(1)} ({item.reviews})
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: COLORS.darkest,
              }}
            >
              {item.price}
            </Text>
            {item.originalPrice && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#999",
                  textDecorationLine: "line-through",
                  marginLeft: 8,
                }}
              >
                {item.originalPrice}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleAddToCart(item)}
            style={{
              backgroundColor: item.inStock ? COLORS.buttonColor : "#ccc",
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: "center",
            }}
            disabled={!item.inStock}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: item.inStock ? COLORS.white : "#666",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {item.inStock ? "Add to Cart" : "Out of Stock"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddToCart = async (item) => {
    // console.log("item:", item);

    //     model CartItem {
    //   id               String   @id @default(cuid())
    //   userId           String
    //   shopifyProductId String
    //   shopifyVariantId String
    //   productTitle     String
    //   price            Float
    //   quantity         Int      @default(1)
    //   addedAt          DateTime @default(now())
    //   updatedAt        DateTime @updatedAt

    //   user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    //   @@unique([userId, shopifyVariantId])
    //   @@map("cart_items")
    // }

    const cartItem = {
      userId: user.id,
      shopifyProductId: item.id,
      shopifyVariantId: item.variants[0].id.split("/").slice(-1)[0],
      productTitle: item.name,
      price: parseInt(item.price.replace("Rs.", "").trim()),
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
          name: item.name,
          image: item.image,
        },
      });
      const res = await authenticatedFetch(`${BACKEND_URL}/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartData: cartItem }),
      });
      const data = await res.json();
    } catch (e) {
      setCartItemCount(cartItemCount - 1);
      console.log("Error Occured: ", error);
    } finally {
      storeCartItemsCount();
    }
  };

  return (
    <ScreenWrapper cartItemCount={cartItemCount}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.light]}
            />
          }
        >
          {/* Header */}
          {/* <Header cartItemCount_={cartItemCount} /> */}

          {/* Auto-sliding Banner */}
          <View style={{ marginBottom: 24, marginTop: 12 }}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setCurrentBannerIndex(index);
              }}
            >
              {bannerData.map((banner) => (
                <View key={banner.id} style={{ width }}>
                  {renderBanner({ item: banner })}
                </View>
              ))}
            </ScrollView>

            {/* Banner Indicators */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              {bannerData.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      currentBannerIndex === index ? COLORS.light : "#ddd",
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          </View>

          {/* Categories Section */}
          {uniqueCategories.length > 0 && (
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: COLORS.darkest,
                  }}
                >
                  Categories
                </Text>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, color: COLORS.light }}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {uniqueCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      alignItems: "center",
                      marginRight: 20,
                      width: 70,
                    }}
                  >
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: "#ff8fab",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons
                        name={category.icon}
                        size={22}
                        color={COLORS.white}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.darkest,
                        textAlign: "center",
                      }}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Search Bar */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.white,
                borderRadius: 25,
                paddingHorizontal: 16,
                paddingVertical: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="search" size={18} color="#999" />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  color: COLORS.darkest,
                }}
                placeholder="Search products..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity>
                <Ionicons name="mic-outline" size={18} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Products Section */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: COLORS.darkest,
                }}
              >
                Products
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }}>
                {filteredProducts.length} items
              </Text>
            </View>

            {loading ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: (width - 48) / 2,
                      backgroundColor: COLORS.white,
                      borderRadius: 16,
                      marginBottom: 16,
                      padding: 12,
                    }}
                  >
                    <View
                      style={{
                        height: 120,
                        backgroundColor: COLORS.lightest,
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                    />
                    <View
                      style={{
                        height: 14,
                        backgroundColor: "#2c2a6b",
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    <View
                      style={{
                        height: 12,
                        backgroundColor: "#2c2a6b",
                        borderRadius: 4,
                        width: "60%",
                      }}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>
        {/* Toast Notification */}
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
      </View>
    </ScreenWrapper>
  );
}
