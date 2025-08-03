"use client"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Easing,
} from "react-native"
import { useAuthenticatedFetch } from "../utils/authStore"

const { width, height } = Dimensions.get("window")
const BACKEND_URL = "http://192.168.18.5:3000"
const CONTAINER_WIDTH = width - 32

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allImages, setAllImages] = useState([])
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [confettiParticles, setConfettiParticles] = useState([])
  const { authenticatedFetch } = useAuthenticatedFetch()
  const { id } = useLocalSearchParams()
  const router = useRouter()

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current
  const flatListRef = useRef(null)
  const heartScale = useRef(new Animated.Value(1)).current
  const cartBounce = useRef(new Animated.Value(0)).current
  const addToCartFeedback = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadProduct()
  }, [])

  const buildImageArray = () => {
    const images = []
    if (selectedVariant?.image?.url) {
      images.push({
        id: `variant-${selectedVariant.id}`,
        url: selectedVariant.image.url,
        altText: selectedVariant.image.altText || "Product variant image",
        isVariant: true,
      })
    }
    if (product?.images?.length > 0) {
      product.images.forEach((image, index) => {
        const isDuplicate = selectedVariant?.image?.url === image.url
        if (!isDuplicate) {
          images.push({
            id: `product-${index}`,
            url: image.url,
            altText: image.altText || "Product image",
            isVariant: false,
          })
        }
      })
    }
    return images.length > 0
      ? images
      : [{ id: "placeholder", url: "https://via.placeholder.com/300", altText: "Placeholder", isVariant: false }]
  }

  useEffect(() => {
    const newImages = buildImageArray()
    setAllImages(newImages)
    setCurrentImageIndex(0)
    slideAnim.setValue(0)
  }, [selectedVariant, product])

  const animateToIndex = (index) => {
    const targetValue = -index * CONTAINER_WIDTH
    Animated.timing(slideAnim, {
      toValue: targetValue,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const handleThumbnailPress = (index) => {
    if (index >= 0 && index < allImages.length && index !== currentImageIndex) {
      setCurrentImageIndex(index)
      animateToIndex(index)
    }
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10
    },
    onPanResponderGrant: () => {
      slideAnim.stopAnimation()
    },
    onPanResponderMove: (evt, gestureState) => {
      const baseValue = -currentImageIndex * CONTAINER_WIDTH
      const newValue = baseValue + gestureState.dx
      slideAnim.setValue(newValue)
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState
      const threshold = CONTAINER_WIDTH * 0.25
      const velocity = Math.abs(vx) > 0.3
      
      let newIndex = currentImageIndex
      if ((dx > threshold || (velocity && dx > 0)) && currentImageIndex > 0) {
        newIndex = currentImageIndex - 1
      } else if ((dx < -threshold || (velocity && dx < 0)) && currentImageIndex < allImages.length - 1) {
        newIndex = currentImageIndex + 1
      }
      setCurrentImageIndex(newIndex)
      animateToIndex(newIndex)
    },
  })

  useEffect(() => {
    if (product && product.variants && Object.keys(selectedOptions).length > 0) {
      const variant = product.variants.find((v) => {
        if (!v.title) return false
        const selectedOptionString = Object.values(selectedOptions).join(" / ")
        return v.title === selectedOptionString || v.displayName === selectedOptionString
      })
      const newVariant = variant || product.variants[0]
      setSelectedVariant(newVariant)
    }
  }, [selectedOptions, product])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await authenticatedFetch(`${BACKEND_URL}/products?productId=${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch product data: ${response.status} ${response.statusText}`)
      }
      const productData = await response.json()
      setProduct(productData.product)
      
      if (productData.product.options && productData.product.options.length > 0) {
        const initialOptions = {}
        productData.product.options.forEach((option) => {
          if (option.values && option.values.length > 0) {
            initialOptions[option.name] = option.values[0]
          }
        })
        setSelectedOptions(initialOptions)
      }
      
      if (productData.product.variants && productData.product.variants.length > 0) {
        setSelectedVariant(productData.product.variants[0])
      }
    } catch (error) {
      console.error("Error loading product:", error)
      Alert.alert("Error", "Failed to load product data")
    } finally {
      setLoading(false)
    }
  }

  const animateAddToCart = () => {
    // Create confetti particles
    const particles = []
    for (let i = 0; i < 15; i++) {
      particles.push({
        id: i,
        x: new Animated.Value(width / 2 - 50 + Math.random() * 100),
        y: new Animated.Value(height - 150),
        opacity: new Animated.Value(1),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 6)],
      })
    }
    setConfettiParticles(particles)

    // Animate confetti
    particles.forEach((particle, index) => {
      Animated.parallel([
        Animated.timing(particle.y, {
          toValue: height - 200 - Math.random() * 100,
          duration: 800 + Math.random() * 400,
          useNativeDriver: false,
        }),
        Animated.timing(particle.x, {
          toValue: particle.x._value + (Math.random() - 0.5) * 100,
          duration: 800 + Math.random() * 400,
          useNativeDriver: false,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 1000,
          delay: 200,
          useNativeDriver: false,
        }),
        Animated.timing(particle.rotation, {
          toValue: Math.random() * 360,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (index === particles.length - 1) {
          setConfettiParticles([])
        }
      })
    })

    // Button press feedback
    Animated.sequence([
      Animated.timing(addToCartFeedback, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(addToCartFeedback, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start()

    // Cart icon bounce
    Animated.sequence([
      Animated.timing(cartBounce, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(2)),
      }),
      Animated.timing(cartBounce, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start()
  }

  const handleAddToCart = () => {
    setCartCount(prev => prev + quantity)
    animateAddToCart()
  }

  const handleWishlistToggle = () => {
    setIsWishlisted(prev => !prev)
    
    // Heart animation
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(2)),
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start()
  }

  const handleBuyNow = () => {
    Alert.alert("Buy Now", `Proceeding to checkout with ${quantity} x ${product.title}`)
  }

  const getPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      const price = Number.parseFloat(selectedVariant.price)
      return `Rs. ${price.toFixed(2)}`
    }
    return ""
  }

  const getRating = () => {
    const ratingMetafield = product?.metafields?.find((m) => m.key === "rating")
    if (ratingMetafield) {
      const ratingData = JSON.parse(ratingMetafield.value)
      return Number.parseFloat(ratingData.value)
    }
    return 4.7
  }

  const getReviewCount = () => {
    const reviewCountMetafield = product?.metafields?.find((m) => m.key === "rating_count")
    return reviewCountMetafield ? Number.parseInt(reviewCountMetafield.value) : 69
  }

  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  const isVariantAvailable = () => {
    return selectedVariant ? selectedVariant.availableForSale : true
  }

  const renderImageThumbnail = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.thumbnailContainer, currentImageIndex === index && styles.activeThumbnail]}
      onPress={() => handleThumbnailPress(index)}
    >
      <Image source={{ uri: item.url }} style={styles.thumbnail} resizeMode="cover" />
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const rating = getRating()
  const reviewCount = getReviewCount()
  const price = getPrice()

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Detail</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Animated.View style={{
              transform: [{
                scale: cartBounce.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2]
                })
              }]
            }}>
              <Ionicons name="bag-outline" size={24} color="#000" />
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
        contentContainerStyle={styles.scrollContent}
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
                    resizeMode="cover"
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
            <TouchableOpacity style={styles.favoriteButton} onPress={handleWishlistToggle}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons 
                  name={isWishlisted ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isWishlisted ? "#EF4444" : "#666"} 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>{price}</Text>

          {/* Stock and Rating Info */}
          <View style={styles.infoRow}>
            <Text style={styles.stockText}>5 Pair Left</Text>
            <Text style={styles.soldText}>Sold 50</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{rating} ({reviewCount} Reviews)</Text>
            </View>
          </View>

          {/* Size Selection */}
          {product.options && product.options.map((option) => (
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
                      selectedOptions[option.name] === value && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleOptionSelect(option.name, value)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedOptions[option.name] === value && styles.optionButtonTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={styles.bottomContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#2c2a6b" />
          </TouchableOpacity>
          <Animated.View style={[
            styles.addToCartButtonContainer,
            {
              transform: [{
                scale: addToCartFeedback.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.95]
                })
              }]
            }
          ]}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Ionicons name="bag-add-outline" size={18} color="#ffffff" />
              <Text  style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleBuyNow}
            activeOpacity={0.8}
          >
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confetti Animation */}
      {confettiParticles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.confettiParticle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              backgroundColor: particle.color,
              transform: [
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: particle.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  )
}

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
    paddingTop: 10,
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
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
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
  favoriteButton: {
    padding: 4,
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
    color: "#666",
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
  sizeChart: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "500",
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
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  buyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
})

export default ProductDetailPage