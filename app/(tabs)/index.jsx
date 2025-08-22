"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  fetchProducts,
  addToCart,
  fetchCartItemsCount,
  fetchArticles,
} from "../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import TrendingSection from "../../components/TrendingSection";
import BlogsSection from "../../components/BlogsSection";
import QuizSection from "../../components/QuizSection";
import AffiliateBanner from "../../components/AffiliateBanner";
import WelnessSection from "../../components/WelnessSection";
import RoutineModal_ from "../../components/RoutineModal";
import AboutSection from "../../components/AboutSection";
import IPLSessionsTrackerSection from "../../components/IPLSessionsTrackerSection";

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

const RoutineStep = ({ step, completed = false }) => {
  return (
    <View style={styles.routineStep}>
      <View
        style={[
          styles.stepIndicator,
          completed ? styles.stepCompleted : styles.stepIncomplete,
        ]}
      >
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text
        style={[
          styles.stepText,
          completed ? styles.stepTextCompleted : styles.stepTextIncomplete,
        ]}
      >
        {step}
      </Text>
    </View>
  );
};

const RoutineModal = ({
  visible,
  onClose,
  currentStep,
  onNextStep,
  onComplete,
}) => {
  const step = ROUTINE_STEPS[currentStep];
  const isLastStep = currentStep === ROUTINE_STEPS.length - 1;
  const progress = ((currentStep + 1) / ROUTINE_STEPS.length) * 100;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={styles.modalContainer}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>PM Routine</Text>
            <View style={styles.stepCounter}>
              <Text style={styles.stepCounterText}>{currentStep + 1}/4</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>

          {/* Step Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepContainer}>
              <View style={styles.stepIconContainer}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
              </View>

              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>

              <View style={styles.tipContainer}>
                <Text style={styles.tipLabel}>💡 Pro Tip</Text>
                <Text style={styles.tipText}>{step.tips}</Text>
              </View>

              {/* Step Indicators */}
              <View style={styles.stepIndicators}>
                {ROUTINE_STEPS.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index <= currentStep
                        ? styles.indicatorActive
                        : styles.indicatorInactive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={isLastStep ? onComplete : onNextStep}
            >
              <LinearGradient
                colors={["#ff6b9d", "#c44569"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? "Complete Routine" : "Next Step"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const { width: screenWidth } = Dimensions.get("window");

const ROUTINE_STEPS = [
  {
    id: 1,
    title: "Cleanse",
    description:
      "Start with a gentle cleanser to remove impurities and prepare your skin",
    icon: "🧼",
    tips: "Use lukewarm water and massage gently in circular motions",
  },
  {
    id: 2,
    title: "Tone",
    description:
      "Apply toner to balance your skin's pH and prep for the next steps",
    icon: "💧",
    tips: "Pat gently with cotton pad or press into skin with clean hands",
  },
  {
    id: 3,
    title: "Serum",
    description: "Apply targeted serum to address specific skin concerns",
    icon: "✨",
    tips: "Use 2-3 drops and gently press into skin, avoiding the eye area",
  },
  {
    id: 4,
    title: "Moisturize",
    description: "Lock in hydration with your favorite moisturizer",
    icon: "🌸",
    tips: "Apply in upward motions and don't forget your neck area",
  },
];

// const RoutineModal = ({
//   visible,
//   onClose,
//   currentStep,
//   onNextStep,
//   onComplete,
// }) => {
//   const step = ROUTINE_STEPS[currentStep];
//   const isLastStep = currentStep === ROUTINE_STEPS.length - 1;
//   const progress = ((currentStep + 1) / ROUTINE_STEPS.length) * 100;

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="fullScreen"
//       onRequestClose={onClose}
//     >
//       <LinearGradient
//         colors={["#1a1a2e", "#16213e", "#0f3460"]}
//         style={styles.modalContainer}
//       >
//         <SafeAreaView style={styles.modalSafeArea}>
//           {/* Header */}
//           <View style={styles.modalHeader}>
//             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//               <Text style={styles.closeButtonText}>✕</Text>
//             </TouchableOpacity>
//             <Text style={styles.modalTitle}>PM Routine</Text>
//             <View style={styles.stepCounter}>
//               <Text style={styles.stepCounterText}>{currentStep + 1}/4</Text>
//             </View>
//           </View>

//           {/* Progress Bar */}
//           <View style={styles.progressContainer}>
//             <View style={styles.progressBar}>
//               <Animated.View
//                 style={[styles.progressFill, { width: `${progress}%` }]}
//               />
//             </View>
//           </View>

//           {/* Step Content */}
//           <ScrollView
//             style={styles.modalContent}
//             showsVerticalScrollIndicator={false}
//           >
//             <View style={styles.stepContainer}>
//               <View style={styles.stepIconContainer}>
//                 <Text style={styles.stepIcon}>{step.icon}</Text>
//               </View>

//               <Text style={styles.stepTitle}>{step.title}</Text>
//               <Text style={styles.stepDescription}>{step.description}</Text>

//               <View style={styles.tipContainer}>
//                 <Text style={styles.tipLabel}>💡 Pro Tip</Text>
//                 <Text style={styles.tipText}>{step.tips}</Text>
//               </View>

//               {/* Step Indicators */}
//               <View style={styles.stepIndicators}>
//                 {ROUTINE_STEPS.map((_, index) => (
//                   <View
//                     key={index}
//                     style={[
//                       styles.indicator,
//                       index <= currentStep
//                         ? styles.indicatorActive
//                         : styles.indicatorInactive,
//                     ]}
//                   />
//                 ))}
//               </View>
//             </View>
//           </ScrollView>

//           {/* Bottom Action */}
//           <View style={styles.modalFooter}>
//             <TouchableOpacity
//               style={styles.nextButton}
//               onPress={isLastStep ? onComplete : onNextStep}
//             >
//               <LinearGradient
//                 colors={["#ff6b9d", "#c44569"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={styles.nextButtonGradient}
//               >
//                 <Text style={styles.nextButtonText}>
//                   {isLastStep ? "Complete Routine" : "Next Step"}
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </LinearGradient>
//     </Modal>
//   );
// };

export default function App() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [routineModalVisible, setRoutineModalVisible] = useState(false);
  const [currentRoutineStep, setCurrentRoutineStep] = useState(0);
  const router = useRouter();
  console.log("user.metaData:", user.metaData)

  useFocusEffect(
    useCallback(() => {
      loadCartCount();
    }, [])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products_ = await fetchProducts(authenticatedFetch);
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
    console.log("Open blog:", blog.title);
    // TODO: Navigate to blog detail page
  };

  const handleAddToWishlist = (product) => {
    console.log("Add to wishlist:", product.title);
    // TODO: Implement wishlist functionality
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

  const handleContinueRoutine = () => {
    setRoutineModalVisible(true);
    setCurrentRoutineStep(0);
  };

  const handleNextStep = () => {
    if (currentRoutineStep < ROUTINE_STEPS.length - 1) {
      setCurrentRoutineStep(currentRoutineStep + 1);
    }
  };

  const handleCompleteRoutine = () => {
    setRoutineModalVisible(false);
    setCurrentRoutineStep(0);
    // You can add completion logic here (e.g., update progress, show success message)
    console.log("[v0] Routine completed!");
  };

  const handleCloseModal = () => {
    setRoutineModalVisible(false);
  };

  useEffect(() => {
    loadProducts();
    loadBlogs();
    loadCartCount();
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

          {/* Your Trackers */}
          {/* <IPLProgressTrackerSection
            completedSessions={3}
            totalSessions={6}
            nextSessionInWeeks={2}
          /> */}

          <IPLSessionsTrackerSection
            completedSessions={3}
            totalSessions={6}
            onViewAllPress={() => console.log("hqhq")}
            onTrackerPress={() => router.push("/screens/ipl")}
          />

          {/* <LinearGradient
            colors={[COLORS.darkBlue, COLORS.mediumPink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.trackersSection}
          >
            <View style={styles.trackersHeader}>
              <Text style={styles.trackersTitle}>Your Trackers</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllTextWhite}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.trackersContent}>
              <View style={styles.trackerItem}>
                <View style={styles.trackerIcon}>
                  <Text style={styles.trackerIconText}>🔆</Text>
                </View>
                <View>
                  <Text onPress={() => router.push("/screens/ipl")} style={styles.trackerLabel}>IPL Sessions</Text>
                  <Text style={styles.trackerValue}>3 of 6 completed</Text>
                </View>
              </View>
              <View style={styles.trackerItem}>
                <View style={styles.trackerIcon}>
                  <Text style={styles.trackerIconText}>🌙</Text>
                </View>
                <View>
                  <Text style={styles.trackerLabel}>Cycle Day</Text>
                  <Text style={styles.trackerValue}>18</Text>
                  <Text style={styles.trackerSubValue}>Next in 10 days</Text>
                </View>
              </View>
            </View>
          </LinearGradient> */}

          {/* Affiliate Marketing Banner */}

          {/* Daily Routine */}
          <View style={styles.routineSection}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineTitle}>Daily Routine</Text>
              {/* <View style={styles.routineToggle}>
                <Text style={styles.routineToggleText}>Evening</Text>
              </View> */}
            </View>

            <View style={styles.routineCard}>
              <View style={styles.routineCardHeader}>
                <View style={styles.routineInfo}>
                  <View style={styles.routineIcon}>
                    <Text style={styles.routineIconText}>🌙</Text>
                  </View>
                  <View>
                    <Text style={styles.routineCardTitle}>PM Routine</Text>
                    <Text style={styles.routineProgress}>
                      2 of 4 steps completed
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinueRoutine}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.routineSteps}>
                <RoutineStep step="Cleanse" completed={true} />
                <RoutineStep step="Tone" completed={true} />
                <RoutineStep step="Serum" completed={false} />
                <RoutineStep step="Moisturize" completed={false} />
              </View>
            </View>
          </View>

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
          />

          {/* Discover Your Perfect Routine Section - Now using separate component */}
          <QuizSection onStartQuiz={handleStartQuiz} />

          <AboutSection
            onExploreStory={() => router.push("/screens/aboutus")}
          />

          {/* A Little About MomDaughts  Brands */}

          {/* <AffiliateBanner
            router={router}
            earnings={0}
            referrals={0}
            sales={0}
          /> */}

          {/* Bottom spacing for better scrolling experience */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        <RoutineModal
          visible={routineModalVisible}
          onClose={handleCloseModal}
          currentStep={currentRoutineStep}
          onNextStep={handleNextStep}
          onComplete={handleCompleteRoutine}
        />
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkBlue,
  },
  viewAllButton: {
    backgroundColor: COLORS.lightPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewAllText: {
    color: COLORS.darkBlue,
    fontWeight: "500",
    fontSize: 14,
  },
  viewAllTextWhite: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: 14,
  },
  productsGrid: {
    gap: 16,
  },
  productRow: {
    flexDirection: "row",
    gap: 16,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  productImageContainer: {
    position: "relative",
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    height: 140,
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 18,
    color: COLORS.mediumPink,
  },
  newBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: COLORS.lavender,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.darkBlue,
    letterSpacing: 0.5,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.almostBlack,
    marginBottom: 6,
    lineHeight: 24,
  },
  productSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 12,
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
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.almostBlack,
  },
  addButton: {
    backgroundColor: COLORS.darkBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  greetingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
  trackersSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  trackersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  trackersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  trackersContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trackerItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  trackerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  trackerIconText: {
    fontSize: 18,
    color: COLORS.white,
  },
  trackerLabel: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
  },
  trackerValue: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  trackerSubValue: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.6,
  },
  routineSection: {
    marginBottom: 32,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  routineTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkBlue,
  },
  routineToggle: {
    backgroundColor: COLORS.lightPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  routineToggleText: {
    color: COLORS.darkBlue,
    fontWeight: "500",
    fontSize: 14,
  },
  routineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routineCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  routineInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  routineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightPink,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  routineIconText: {
    fontSize: 18,
  },
  routineCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.almostBlack,
  },
  routineProgress: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: COLORS.darkBlue,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  continueButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 13,
  },
  routineSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  routineStep: {
    alignItems: "center",
    flex: 1,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: COLORS.success,
  },
  stepIncomplete: {
    backgroundColor: COLORS.border,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 12,
    textAlign: "center",
  },
  stepTextCompleted: {
    color: COLORS.almostBlack,
    fontWeight: "600",
  },
  stepTextIncomplete: {
    color: COLORS.mediumGray,
  },
  bottomSpacing: {
    height: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    backgroundColor: COLORS.cream,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    backgroundColor: COLORS.cream,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },

  // Featured Products Carousel Styles - Updated
  featuredCarouselSection: {
    backgroundColor: COLORS.cream,
    borderRadius: 24,
    padding: 32,
    marginBottom: 60,
    marginHorizontal: -20,
    marginLeft: -20,
    marginRight: -20,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  featuredCarouselHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  featuredCarouselTitleContainer: {
    flex: 1,
  },
  featuredCarouselBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.darkBlue,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 16,
  },
  featuredCarouselBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 1,
  },
  featuredCarouselTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.almostBlack,
    lineHeight: 42,
    marginBottom: 8,
  },
  featuredCarouselSubtitle: {
    fontSize: 18,
    color: COLORS.mediumGray,
    lineHeight: 24,
    fontWeight: "400",
  },
  featuredCarouselViewAll: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredCarouselViewAllText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.darkBlue,
    marginRight: 8,
  },
  featuredCarouselArrow: {
    fontSize: 16,
    color: COLORS.darkBlue,
    fontWeight: "700",
  },
  carouselLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  carouselLoadingText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  carouselEmptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  carouselEmptyText: {
    fontSize: 18,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  carouselContainer: {
    width: "100%",
  },
  carouselScrollView: {
    width: "100%",
  },
  carouselSlide: {
    width: screenWidth - 60,
    paddingHorizontal: 10,
  },
  carouselProductCard: {
    width: "100%",
  },
  carouselProductContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    flexDirection: "column",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(235, 159, 193, 0.06)",
  },
  carouselImageContainer: {
    position: "relative",
    width: "100%",
    height: 240,
    backgroundColor: COLORS.cream,
  },
  carouselProductImage: {
    width: "100%",
    height: "100%",
  },
  carouselBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: COLORS.darkBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  carouselBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  carouselProductInfo: {
    padding: 20,
    justifyContent: "space-between",
  },
  carouselProductTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.almostBlack,
    lineHeight: 24,
    marginBottom: 8,
  },
  carouselProductSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "400",
  },
  carouselRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  carouselStarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  carouselReviewCount: {
    fontSize: 12,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  carouselFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  carouselPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.darkBlue,
  },
  carouselShopButton: {
    backgroundColor: COLORS.deepBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.deepBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  carouselShopButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 13,
    marginRight: 6,
  },
  carouselShopArrow: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  paginationBox: {
    height: 8,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  paginationBoxActive: {
    backgroundColor: COLORS.darkBlue,
    width: 32,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationBoxInactive: {
    backgroundColor: COLORS.mediumGray,
    width: 16,
    opacity: 0.4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  stepCounter: {
    backgroundColor: "rgba(255, 107, 157, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stepCounterText: {
    color: "#ff6b9d",
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff6b9d",
    borderRadius: 2,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  stepIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  stepIcon: {
    fontSize: 50,
  },
  stepTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  stepDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  tipContainer: {
    backgroundColor: "rgba(255, 107, 157, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 157, 0.2)",
  },
  tipLabel: {
    color: "#ff6b9d",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  tipText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    lineHeight: 20,
  },
  stepIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorActive: {
    backgroundColor: "#ff6b9d",
  },
  indicatorInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  nextButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  nextButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Affiliate Banner Styles
  affiliateBanner: {
    borderRadius: 16,
    marginBottom: 32,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  affiliateBannerGradient: {
    padding: 20,
  },
  affiliateBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  affiliateBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  affiliateIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  affiliateIcon: {
    fontSize: 26,
  },
  affiliateTextContainer: {
    flex: 1,
  },
  affiliateBannerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  affiliateBannerSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    opacity: 0.9,
  },
  affiliateBannerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  affiliateEarningsContainer: {
    alignItems: "center",
  },
  affiliateEarningsText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  affiliateEarningsLabel: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    fontWeight: "500",
  },
  affiliateArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  affiliateArrowText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "700",
  },
  affiliateBannerStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.25)",
  },
  affiliateStatItem: {
    alignItems: "center",
    flex: 1,
  },
  affiliateStatNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  affiliateStatLabel: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    fontWeight: "500",
    marginTop: 2,
  },
  affiliateStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  affiliateStatHighlight: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
