"use client";

import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Image } from "expo-image";

import {
  fetchProducts,
  addToCart,
  fetchCartItemsCount,
  fetchArticles,
  fetchCompletedSessions,
} from "../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import TrendingSection from "../../components/TrendingSection";
import BlogsSection from "../../components/BlogsSection";
import QuizSection from "../../components/QuizSection";
import WelnessSection from "../../components/WelnessSection";
import AboutSection from "../../components/AboutSection";
import IPLSessionsTrackerSection from "../../components/IPLSessionsTrackerSection";
import FeaturedProduct from "../../components/FeaturedProduct";

import Text from "../../components/Text";

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

const FEATURED_PRODUCTS =
  "gid://shopify/Product/7997785407780,gid://shopify/Product/7970555658532,gid://shopify/Product/9403161575716,gid://shopify/Product/10006500344100,gid://shopify/Product/10087709507876,gid://shopify/Product/9937795809572,gid://shopify/Product/8711623639332,gid://shopify/Product/7984806494500";

// Sample routine steps - you can move this to a separate data file

// Simulated blog API
const fetchBlogs = async (authenticatedFetch) => {
  const articles = await fetchArticles(authenticatedFetch);
  const updatedFormat = articles.map((blog) => {
    return {
      id: blog.id.split("/").pop(), // Extracting numeric ID from GID
      title: blog.title,
      excerpt: blog.cleanText.slice(0, 100) + "...",
      author: blog.author?.name || "Unknown Author",
      image:
        blog.image?.url ||
        "https://via.placeholder.com/300x300/f5b8d0/2b2b6b?text=Blog",
      category: "", // Assuming category is not provided in the API
      date: new Date(blog.createdAt).toISOString().split("T")[0], // Format date as YYYY-MM-DD
      readTime: blog.readTime || "5 min read", // Use readTime from API or default
    };
  });
  return updatedFormat;
};

export default function App() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [completedIPLSessions, setCompletedIPLSessions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(6);
  const router = useRouter();
  console.log("user:\n", user, "\n\n\n\n\n s");

  const loadCompletedIPLSessions = async () => {
    try {
      const sessions = await fetchCompletedSessions(authenticatedFetch);
      setCompletedIPLSessions(sessions.completedSessions || 0);
      setTotalSessions(sessions.total || 6);
      console.log("Loaded completed IPL sessions:", sessions);
      return sessions;
    } catch (e) {
      console.error("Failed to load completed IPL sessions:", e);
      setCompletedIPLSessions(0);
      setTotalSessions(6);
      return 0;
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCartCount();
      loadCompletedIPLSessions();
    }, [])
  );

  const { isLoggedIn, hasCompletedOnboarding } = useAuthStore();

  const isEmailVerified = user?.metaData?.is_verified === true;

  // useEffect(() => {
  //   console.log('\n=== INDEX ROUTER ===');
  //   console.log('isLoggedIn:', isLoggedIn);
  //   console.log('hasCompletedOnboarding:', hasCompletedOnboarding);
  //   console.log('isEmailVerified:', isEmailVerified);
  //   console.log('user:', user);

  //   // Add a small delay to ensure auth store is fully loaded
  //   const timer = setTimeout(() => {
  //     if (!isLoggedIn) {
  //       console.log('🔄 Redirecting to: /auth/login');
  //       router.replace('/auth/login');
  //     } else if (!isEmailVerified) {
  //       console.log('🔄 Redirecting to: /auth/otp');
  //       router.replace('/auth/otp');
  //     } else if (!hasCompletedOnboarding) {
  //       console.log('🔄 Redirecting to: /onboarding');
  //       router.replace('/onboarding');
  //     } else {
  //       console.log('🔄 Redirecting to: /(tabs)');
  //       router.replace('/(tabs)');
  //     }
  //   }, 500); // Increased delay for development builds

  //   return () => clearTimeout(timer);
  // }, [isLoggedIn, hasCompletedOnboarding, isEmailVerified]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products_ = await fetchProducts(
        authenticatedFetch,
        `product_ids=${FEATURED_PRODUCTS}`
      );
      setProducts(products_);
      console.log("[v0] Loaded products:", products_.length);
      return products_;
    } catch (error) {
      console.error("[v0] Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = async () => {
    try {
      setBlogsLoading(true);
      const blogs_ = await fetchBlogs(authenticatedFetch);
      setBlogs(blogs_);
      console.log("[v0] Loaded blogs:", blogs_.length);
    } catch (error) {
      console.error("[v0] Failed to load blogs:", error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const result = await fetchCartItemsCount(authenticatedFetch);
      if (result.success) {
        setCartCount(result.count);
      }
    } catch (error) {
      console.error("[v0] Failed to load cart count:", error);
    }
  };

  const handleProductPress = (product) => {
    // Extract product ID from Shopify GID
    const productId = product.id.split("/").pop();
    router.push(`/products/${productId}`);
  };

  const handleBlogPress = (blog) => {
    console.log("Open blog:", blog.id);
    router.push(`/articles/${blog.id}`);
    // TODO: Navigate to blog detail page
  };

  const handleAllArticles = () => {
    console.log("Open all articles");
    router.push("/articles");
    // TODO: Navigate to all articles page
  };

  const handleAddToCart = async (product) => {
    const firstVariant = product.variants?.[0];
    if (!firstVariant) {
      console.error("No variant available for product:", product.title);
      return;
    }

    const productId = product.id.split("/").pop();
    const variantId = firstVariant.id.split("/").pop();

    setAddingToCart((prev) => new Set([...prev, product.id]));

    try {
      const cartItem = {
        shopifyProductId: productId,
        shopifyVariantId: variantId,
        productTitle: product.title,
        price: Number.parseInt(firstVariant.price),
        quantity: 1,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await addToCart(authenticatedFetch, cartItem);

      if (result.success) {
        setCartCount((prev) => prev + 1);
        console.log("Added to cart:", product.title);
      } else {
        console.error("Failed to add to cart:", result.error);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const handleViewAllProducts = () => {
    router.push("/shop");
  };

  const handleStartQuiz = () => {
    console.log("Start quiz pressed");
    router.push("/screens/quiz");
    // TODO: Navigate to quiz page
  };

  useEffect(() => {
    // loadCartCount();
    loadProducts();
    loadBlogs();
    // LoadIPLProfileStats();
  }, []);

  return (
    <ScreenWrapper cartItemCount={cartCount}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        {/* Header Space - Left empty as requested */}
        <View style={styles.headerSpace} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Hello Beautiful Section */}
          <View style={styles.section}>
            <View style={styles.greetingHeader}>
              <View>
                <Text style={styles.greetingTitle}>Hello, Beautiful!</Text>
                <Text style={styles.greetingSubtitle}>
                  Your skin journey continues today
                </Text>
              </View>
              <Image
                source={{
                  uri: "https://i.ibb.co/TqRgNddL/freepik-the-style-is-candid-image-photography-with-natural-65105.png",
                }}
                style={styles.profileImage}
              />
            </View>
          </View>

          <IPLSessionsTrackerSection
            completedSessions={completedIPLSessions}
            totalSessions={totalSessions}
            onViewAllPress={() => console.log("hqhq")}
            onTrackerPress={() => {
              if (user.metaData.ipl_onboarding_completed) {
                router.push(
                  `/screens/ipl/dashboard?completedSessions=${completedIPLSessions}&totalSessions=${totalSessions}`
                );
              } else {
                router.push("/screens/ipl/onboard");
              }
            }}
          />

          <WelnessSection />

          {/* Trending Products Section - Now using separate component */}
          <TrendingSection
            products={products}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            addingToCart={addingToCart}
          />

          {/* Mom's Journal Blog Section - Now using separate component */}
          <BlogsSection
            blogs={blogs}
            blogsLoading={blogsLoading}
            onBlogPress={handleBlogPress}
            handleAllArticles={handleAllArticles}
          />

          {/* Discover Your Perfect Routine Section - Now using separate component */}
          <QuizSection onStartQuiz={handleStartQuiz} />

          <AboutSection
            onExploreStory={() => router.push("/screens/aboutus")}
          />

          {/* Bottom spacing for better scrolling experience */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerSpace: {
    height: 60,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  greetingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: COLORS.darkBlue,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    marginTop: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  bottomSpacing: {
    height: 40,
  },
});
