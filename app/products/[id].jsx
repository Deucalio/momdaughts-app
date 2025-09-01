"use client";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import CartToast from "../../components/CartToast";
import WishlistToast from "../../components/WishlistToast";
import {
  addToCart,
  addToWishlist,
  fetchCartItemsCount,
  removeFromWishlist,
} from "../utils/actions";
import { useAuthenticatedFetch } from "../utils/authStore";
const { width, height } = Dimensions.get("window");
const BACKEND_URL = "http://192.168.77.137:3000";
const CONTAINER_WIDTH = width - 32;

// Product Detail Page Skeleton
const ProductDetailSkeleton = () => (
  <SafeAreaView style={styles.container}>
    {/* Header Skeleton */}
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={[styles.skeletonCircle, { width: 40, height: 40 }]} />
        <View style={[styles.skeletonText, { width: 120, height: 18 }]} />
        <View style={[styles.skeletonCircle, { width: 40, height: 40 }]} />
      </View>
    </View>

    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Image Section Skeleton */}
      <View style={styles.imageSection}>
        <View style={styles.mainImageContainer}>
          <View
            style={[
              styles.skeletonImage,
              {
                width: CONTAINER_WIDTH - 20,
                height: 280,
                borderRadius: 12,
              },
            ]}
          />
        </View>
        {/* Thumbnails Skeleton */}
        <View
          style={[
            styles.thumbnailList,
            { flexDirection: "row", marginTop: 16 },
          ]}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.skeletonImage,
                {
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  marginRight: 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Product Info Skeleton */}
      <View style={styles.productInfo}>
        {/* Title and Heart */}
        <View style={styles.productHeader}>
          <View style={[styles.skeletonText, { width: "70%", height: 20 }]} />
          <View style={[styles.skeletonCircle, { width: 40, height: 40 }]} />
        </View>

        {/* Price */}
        <View
          style={[
            styles.skeletonText,
            { width: 100, height: 24, marginBottom: 12 },
          ]}
        />

        {/* Rating */}
        <View
          style={[
            styles.skeletonText,
            { width: 150, height: 16, marginBottom: 20 },
          ]}
        />

        {/* Options */}
        <View style={styles.optionContainer}>
          <View
            style={[
              styles.skeletonText,
              { width: 80, height: 16, marginBottom: 12 },
            ]}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.skeletonText,
                  {
                    width: 60,
                    height: 36,
                    borderRadius: 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.quantityContainer}>
          <View
            style={[
              styles.skeletonText,
              { width: 60, height: 16, marginBottom: 12 },
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              { width: 120, height: 44, borderRadius: 8 },
            ]}
          />
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <View
            style={[
              styles.skeletonText,
              { width: 80, height: 18, marginBottom: 8 },
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              { width: "100%", height: 16, marginBottom: 4 },
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              { width: "80%", height: 16, marginBottom: 4 },
            ]}
          />
          <View style={[styles.skeletonText, { width: "90%", height: 16 }]} />
        </View>
      </View>
    </ScrollView>

    {/* Bottom Buttons Skeleton */}
    <View style={styles.bottomContainer}>
      <View style={styles.actionButtons}>
        <View
          style={[
            styles.skeletonImage,
            { width: 48, height: 48, borderRadius: 12 },
          ]}
        />
        <View
          style={[
            styles.skeletonImage,
            { flex: 1, height: 48, borderRadius: 12 },
          ]}
        />
        <View
          style={[
            styles.skeletonImage,
            { flex: 1, height: 48, borderRadius: 12 },
          ]}
        />
      </View>
    </View>
  </SafeAreaView>
);

const ProductDetailPage = () => {
  const params = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [wishlistedVariants, setWishlistedVariants] = useState(new Set()); // Track wishlisted variants
  const [cartCount, setCartCount] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [addToCartToast, setAddToCartToast] = useState({
    clickCount: 0,
    showToast: false,
    selectedProduct: {
      name: "",
      image: "",
    },
  });

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor("#F5F5F5");
      StatusBar.setBarStyle("dark-content");
    }, [])
  );

  useEffect(() => {
    setShowWishlistToast(false);
  }, [product, selectedVariant]);

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  // Wishlist animations
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartRotation = useRef(new Animated.Value(0)).current;
  const wishlistButtonScale = useRef(new Animated.Value(1)).current;
  // Add to cart animations - minimal
  const addToCartScale = useRef(new Animated.Value(1)).current;
  const addToCartTranslateY = useRef(new Animated.Value(0)).current;
  // Cart badge animation
  const cartBounce = useRef(new Animated.Value(0)).current;

  const storeCartItemsCount = async () => {
    const count = await fetchCartItemsCount(authenticatedFetch);
    if (count.success) {
      setCartCount(count.count);
      return;
    }
    throw new Error("Failed to fetch cart items count");
  };

  useEffect(() => {
    loadProduct();
    loadWishlistedVariants(); // Load user's wishlisted variants
    storeCartItemsCount();
  }, []);

  // Load user's wishlisted variants from API
  const loadWishlistedVariants = async () => {
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/wishlist`);
      if (response.ok) {
        const wishlistData = await response.json();
        // Extract variant IDs from wishlist - ensure they're strings
        const variantIds = new Set(
          wishlistData.wishlist?.map((item) => String(item.shopifyVariantId)) ||
            []
        );
        setWishlistedVariants(variantIds);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  };

  // Check if current variant is wishlisted
  const isCurrentVariantWishlisted = () => {
    return selectedVariant ? wishlistedVariants.has(selectedVariant.id) : false;
  };

  const buildImageArray = () => {
    const images = [];
    if (selectedVariant?.image?.url) {
      images.push({
        id: `variant-${selectedVariant.id}`,
        url: selectedVariant.image.url,
        altText: selectedVariant.image.altText || "Product variant image",
        isVariant: true,
      });
    }
    if (product?.images?.length > 0) {
      product.images.forEach((image, index) => {
        const isDuplicate = selectedVariant?.image?.url === image.url;
        if (!isDuplicate) {
          images.push({
            id: `product-${index}`,
            url: image.url,
            altText: image.altText || "Product image",
            isVariant: false,
          });
        }
      });
    }
    return images.length > 0
      ? images
      : [
          {
            id: "placeholder",
            url: "https://via.placeholder.com/300",
            altText: "Placeholder",
            isVariant: false,
          },
        ];
  };

  useEffect(() => {
    const newImages = buildImageArray();
    setAllImages(newImages);
    setCurrentImageIndex(0);
    slideAnim.setValue(0);
  }, [selectedVariant, product]);

  const animateToIndex = (index) => {
    const targetValue = -index * CONTAINER_WIDTH;
    Animated.timing(slideAnim, {
      toValue: targetValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleThumbnailPress = (index) => {
    if (index >= 0 && index < allImages.length && index !== currentImageIndex) {
      setCurrentImageIndex(index);
      animateToIndex(index);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10
      );
    },
    onPanResponderGrant: () => {
      slideAnim.stopAnimation();
    },
    onPanResponderMove: (evt, gestureState) => {
      const baseValue = -currentImageIndex * CONTAINER_WIDTH;
      const newValue = baseValue + gestureState.dx;
      slideAnim.setValue(newValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      const threshold = CONTAINER_WIDTH * 0.25;
      const velocity = Math.abs(vx) > 0.3;
      let newIndex = currentImageIndex;
      if ((dx > threshold || (velocity && dx > 0)) && currentImageIndex > 0) {
        newIndex = currentImageIndex - 1;
      } else if (
        (dx < -threshold || (velocity && dx < 0)) &&
        currentImageIndex < allImages.length - 1
      ) {
        newIndex = currentImageIndex + 1;
      }
      setCurrentImageIndex(newIndex);
      animateToIndex(newIndex);
    },
  });

  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) return;

    let variantToSet = null;

    // 1. Match by variantId
    if (params.variantId) {
      variantToSet = product.variants.find((v) => v.id === params.variantId);
    }

    // 2. Fallback
    if (!variantToSet) {
      variantToSet = product.variants[0];
    }

    setSelectedVariant(variantToSet);

    // 3. Extract selectedOptions from variant title
    if (variantToSet && variantToSet.title) {
      const optionValues = variantToSet.title.split(" / ");
      const newSelectedOptions = {};

      product.options.forEach((option, index) => {
        newSelectedOptions[option.name] = optionValues[index];
      });

      setSelectedOptions(newSelectedOptions);
    }
  }, [product, params.variantId]);

  useEffect(() => {
    if (
      !product ||
      !product.variants ||
      Object.keys(selectedOptions).length === 0
    )
      return;

    const selectedOptionString = Object.values(selectedOptions).join(" / ");
    const variant = product.variants.find(
      (v) =>
        v.title === selectedOptionString ||
        v.displayName === selectedOptionString
    );

    if (variant && variant.id !== selectedVariant?.id) {
      setSelectedVariant(variant);
    }
  }, [selectedOptions]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `${BACKEND_URL}/products?productId=${id}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch product data: ${response.status} ${response.statusText}`
        );
      }
      const productData = await response.json();
      setProduct(productData.product);
      if (
        productData.product.options &&
        productData.product.options.length > 0
      ) {
        const initialOptions = {};
        productData.product.options.forEach((option) => {
          if (option.values && option.values.length > 0) {
            initialOptions[option.name] = option.values[0];
          }
        });
        setSelectedOptions(initialOptions);
      }
      if (
        productData.product.variants &&
        productData.product.variants.length > 0
      ) {
        setSelectedVariant(productData.product.variants[0]);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      Alert.alert("Error", "Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  // Create floating hearts effect
  const createFloatingHearts = () => {
    const hearts = [];
    for (let i = 0; i < 6; i++) {
      hearts.push({
        id: Date.now() + i,
        translateY: new Animated.Value(0),
        translateX: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.5 + Math.random() * 0.4),
        rotation: new Animated.Value(0),
        startX: -15 + Math.random() * 30,
        startY: 0,
      });
    }
    setFloatingHearts((prev) => [...prev, ...hearts]);
    hearts.forEach((heart, index) => {
      const delay = index * 120;
      const duration = 1800 + Math.random() * 800;
      Animated.parallel([
        Animated.timing(heart.translateY, {
          toValue: -100 - Math.random() * 60,
          duration: duration,
          delay: delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(heart.translateX, {
          toValue: heart.startX + (Math.random() - 0.5) * 40,
          duration: duration,
          delay: delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(heart.opacity, {
          toValue: 0,
          duration: duration,
          delay: delay + 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(heart.rotation, {
          toValue: 180 + Math.random() * 180,
          duration: duration,
          delay: delay,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(heart.scale, {
            toValue: heart.scale._value * 1.3,
            duration: 250,
            delay: delay,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: false,
          }),
          Animated.timing(heart.scale, {
            toValue: 0,
            duration: duration - 250,
            easing: Easing.in(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      ]).start(() => {
        if (index === hearts.length - 1) {
          setTimeout(() => {
            setFloatingHearts((prev) =>
              prev.filter((h) => !hearts.find((heart) => heart.id === h.id))
            );
          }, 500);
        }
      });
    });
  };

  // Minimal add to cart animation
  const animateAddToCart = () => {
    // Very subtle button animation
    Animated.parallel([
      // Gentle scale down and up
      Animated.sequence([
        Animated.timing(addToCartScale, {
          toValue: 0.98,
          duration: 80,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(addToCartScale, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
      // Subtle upward movement
      Animated.sequence([
        Animated.timing(addToCartTranslateY, {
          toValue: -2,
          duration: 80,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(addToCartTranslateY, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
    ]).start();

    // Cart icon bounce
    Animated.sequence([
      Animated.timing(cartBounce, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(cartBounce, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  };

  const handleAddToCart = async () => {
    setCartCount((prev) => prev + quantity);

    const cartItem = {
      shopifyProductId: product.id,
      shopifyVariantId: selectedVariant.id.split("/").slice(-1)[0],
      productTitle: product.title,
      price: Number.parseInt(selectedVariant.price),
      quantity: quantity,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log("cartItem:", cartItem);

    const addToCartResponse = await addToCart(authenticatedFetch, cartItem);
    setCartCount(cartCount + quantity);
    animateAddToCart();
    setAddToCartToast({
      showToast: true,
    });
  };

  // Add/Remove variant from wishlist
  // Add this new state (assuming it's in the same component as showWishlistToast)
  const [toastIsRemoved, setToastIsRemoved] = useState(false);
  const [toastData, setToastData] = useState(null);

  // Updated handler
  const handleWishlistToggle = async () => {
    if (!selectedVariant) {
      Alert.alert("Error", "Please select a variant first");
      return;
    }

    try {
      const isCurrentlyWishlisted = isCurrentVariantWishlisted();
      const isRemoving = isCurrentlyWishlisted; // Capture the action type here
      setToastIsRemoved(isRemoving);
      setShowWishlistToast(true);

      // Optimistically update the UI
      setWishlistedVariants((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyWishlisted) {
          newSet.delete(selectedVariant.id);
        } else {
          newSet.add(selectedVariant.id);
        }
        return newSet;
      });

      let actionResult;

      if (isCurrentlyWishlisted) {
        // For removal, pass the variant ID in the request body or as a parameter
        const body = JSON.stringify({
          shopifyVariantId: selectedVariant.id,
        });
        actionResult = await removeFromWishlist(authenticatedFetch, body);
      } else {
        // For addition, pass both product and variant IDs
        const body = JSON.stringify({
          shopifyProductId: product.id,
          shopifyVariantId: selectedVariant.id,
        });
        actionResult = await addToWishlist(authenticatedFetch, body);
      }

      // Handle the result of the action
      if (!actionResult.success) {
        // Revert the optimistic update if the API call failed
        setWishlistedVariants((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyWishlisted) {
            newSet.add(selectedVariant.id);
          } else {
            newSet.delete(selectedVariant.id);
          }
          return newSet;
        });
        throw new Error(actionResult.error || "Failed to update wishlist");
      }

      // On success, show the toast for both add and remove
    } catch (error) {
      console.error("Error updating wishlist:", error);
      Alert.alert("Error", "Failed to update wishlist. Please try again.");
    } finally {
    }
  };

  const handleBuyNow = () => {
    Alert.alert(
      "Buy Now",
      `Proceeding to checkout with ${quantity} x ${
        selectedVariant?.displayName || product.title
      }`
    );
  };

  const getPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      const price = Number.parseFloat(selectedVariant.price);
      return `Rs. ${price.toFixed(2)}`;
    }
    return "";
  };

  const getRating = () => {
    const ratingMetafield = product?.metafields?.find(
      (m) => m.key === "rating"
    );
    if (ratingMetafield) {
      const ratingData = JSON.parse(ratingMetafield.value);
      return Number.parseFloat(ratingData.value);
    }
    return 4.7;
  };

  const getReviewCount = () => {
    const reviewCountMetafield = product?.metafields?.find(
      (m) => m.key === "rating_count"
    );
    return reviewCountMetafield
      ? Number.parseInt(reviewCountMetafield.value)
      : 69;
  };

  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const renderImageThumbnail = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailContainer,
        currentImageIndex === index && styles.activeThumbnail,
      ]}
      onPress={() => handleThumbnailPress(index)}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.thumbnail}
        contentFit="cover"
      />
    </TouchableOpacity>
  );

  // Custom Quantity Selector Component
  const QuantitySelector = () => (
    <View style={styles.quantityContainer}>
      <Text style={styles.quantityLabel}>Quantity</Text>
      <View style={styles.quantitySelector}>
        <TouchableOpacity
          style={[
            styles.quantityButton,
            quantity <= 1 && styles.quantityButtonDisabled,
          ]}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          <Ionicons
            name="remove"
            size={18}
            color={quantity <= 1 ? "#ccc" : "#2c2a6b"}
          />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(quantity + 1)}
        >
          <Ionicons name="add" size={18} color="#2c2a6b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const rating = getRating();
  const reviewCount = getReviewCount();
  const price = getPrice();
  const isWishlisted = isCurrentVariantWishlisted();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Detail</Text>
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.headerButton}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    scale: cartBounce.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.15],
                    }),
                  },
                ],
              }}
            >
              {/* <Ionicons name="bag-outline" size={24} color="#000" /> */}
              <Ionicons name="bag-outline" size={24} color="#ec4899" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageContainer} {...panResponder.panHandlers}>
            <Animated.View
              style={[
                styles.imageSlider,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {allImages.map((image, index) => (
                <View key={image.id} style={styles.imageSlide}>
                  <View style={styles.imageShadow} />
                  <Image
                    source={{ uri: image.url }}
                    style={styles.mainImage}
                    contentFit="cover"
                  />
                </View>
              ))}
            </Animated.View>
          </View>
          {/* Image Thumbnails */}
          <FlatList
            data={allImages}
            renderItem={renderImageThumbnail}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            style={styles.thumbnailScrollView}
          />
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productTitle}>{product.title}</Text>
            {/* Enhanced Animated Wishlist Button */}
            <View style={styles.wishlistButtonContainer}>
              <Animated.View
                style={[
                  styles.wishlistButtonAnimated,
                  {
                    transform: [{ scale: wishlistButtonScale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.favoriteButton,
                    isWishlisted && styles.favoriteButtonActive,
                  ]}
                  onPress={handleWishlistToggle}
                >
                  <Animated.View
                    style={{
                      transform: [
                        { scale: heartScale },
                        {
                          rotate: heartRotation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "12deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <Ionicons
                      name={isWishlisted ? "heart" : "heart-outline"}
                      size={24}
                      color={isWishlisted ? "#EF4444" : "#666"}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
              {/* Floating Hearts */}
              {floatingHearts.map((heart) => (
                <Animated.View
                  key={heart.id}
                  style={[
                    styles.floatingHeart,
                    {
                      left: heart.startX + 20,
                      top: 20,
                      opacity: heart.opacity,
                      transform: [
                        { translateY: heart.translateY },
                        { translateX: heart.translateX },
                        { scale: heart.scale },
                        {
                          rotate: heart.rotation.interpolate({
                            inputRange: [0, 360],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="heart" size={14} color="#FF69B4" />
                </Animated.View>
              ))}
            </View>
          </View>

          <Text style={styles.price}>{price}</Text>

          {/* Stock and Rating Info */}
          <View style={styles.infoRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>
                {rating} ({reviewCount} Reviews)
              </Text>
            </View>
          </View>

          {/* Size Selection */}
          {product.options &&
            product.options.map((option) => (
              <View key={option.id} style={styles.optionContainer}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionTitle}>Select {option.name}</Text>
                </View>
                <View style={styles.optionButtons}>
                  {option.values.map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.optionButton,
                        selectedOptions[option.name] === value &&
                          styles.optionButtonSelected,
                      ]}
                      onPress={() => handleOptionSelect(option.name, value)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          selectedOptions[option.name] === value &&
                            styles.optionButtonTextSelected,
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

          {/* Quantity Selector */}
          <QuantitySelector />

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Action Buttons - Safe Area Aware */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#2c2a6b" />
          </TouchableOpacity>
          {/* Minimalist Add to Cart Button */}
          <Animated.View
            style={[
              styles.addToCartButtonContainer,
              {
                transform: [
                  { scale: addToCartScale },
                  { translateY: addToCartTranslateY },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                selectedVariant?.inventoryQuantity <= 0 &&
                  styles.addToCartButtonDisabled,
              ]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
              disabled={selectedVariant?.inventoryQuantity <= 0}
            >
              <Ionicons name="bag-add-outline" size={18} color="#ffffff" />
              <Text style={styles.addToCartButtonText}>
                {selectedVariant?.inventoryQuantity <= 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            style={[
              styles.buyButton,
              selectedVariant?.inventoryQuantity <= 0 &&
                styles.buyButtonDisabled,
            ]}
            onPress={handleBuyNow}
            activeOpacity={0.8}
            disabled={selectedVariant?.inventoryQuantity <= 0}
          >
            <Text style={styles.buyButtonText}>
              {selectedVariant?.inventoryQuantity <= 0
                ? "Unavailable"
                : "Buy Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <WishlistToast
        visible={showWishlistToast}
        onHide={() => setShowWishlistToast(false)}
        product={product}
        selectedVariant={selectedVariant}
        isRemoved={toastIsRemoved}
      />

      <CartToast
        isVisible={addToCartToast.showToast}
        onClose={() => {
          setAddToCartToast((prev) => ({
            ...prev,
            showToast: false,
          }));
        }}
        productName={product.title}
        productImage={product.images[0].url}
        clickCount={addToCartToast.clickCount}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#F5F5F5",
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 11,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -5,
    backgroundColor: "#ec4899",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    backgroundColor: "#F5F5F5",
    paddingBottom: 16,
  },
  mainImageContainer: {
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginHorizontal: 16,
  },
  imageSlider: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  imageSlide: {
    width: CONTAINER_WIDTH,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  imageShadow: {
    position: "absolute",
    bottom: 30,
    width: 180,
    height: 15,
    backgroundColor: "#000",
    opacity: 0.1,
    borderRadius: 100,
    transform: [{ scaleX: 1.5 }],
  },
  mainImage: {
    width: CONTAINER_WIDTH - 20,
    height: 280,
    borderRadius: 12,
  },
  thumbnailScrollView: {
    marginTop: 16,
  },
  thumbnailList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnailContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#2c2a6b",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    backgroundColor: "white",
    marginTop: 8,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  wishlistButtonContainer: {
    position: "relative",
    width: 40,
    height: 40,
  },
  wishlistButtonAnimated: {
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  favoriteButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  favoriteButtonActive: {
    backgroundColor: "#FEF2F2",
  },
  floatingHeart: {
    position: "absolute",
  },
  variantInfo: {
    marginBottom: 8,
  },
  variantTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c2a6b",
  },
  variantSku: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  stockText: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "600",
  },
  outOfStockText: {
    color: "#EF4444",
  },
  soldText: {
    fontSize: 12,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  optionButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  optionButtonSelected: {
    backgroundColor: "#2c2a6b",
    borderColor: "#2c2a6b",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  optionButtonTextSelected: {
    color: "white",
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 4,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  quantityButtonDisabled: {
    backgroundColor: "#F0F0F0",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  addToCartButtonContainer: {
    flex: 1,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2c2a6b",
    borderWidth: 1,
    borderColor: "#2c2a6b",
    gap: 6,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#ccc",
    borderColor: "#ccc",
  },
  addToCartButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  buyButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2c2a6b",
  },
  buyButtonDisabled: {
    backgroundColor: "#ccc",
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },

  // Add these to your styles object
  skeletonImage: {
    backgroundColor: "#e0e0e0",
  },
  skeletonText: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  skeletonCircle: {
    backgroundColor: "#e0e0e0",
    borderRadius: 50,
  },
});

export default ProductDetailPage;
