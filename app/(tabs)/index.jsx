import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fetchProducts } from "../utils/actions";
import { useAuthenticatedFetch } from "../utils/authStore";
import { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";

const COLORS = {
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  almostBlack: "#040707",
  white: "#ffffff",
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
  success: "#28a745",
  danger: "#dc3545",
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

const ProductCard = ({
  title,
  subtitle,
  price,
  rating,
  isNew = false,
  imageUrl,
}) => {
  return (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        <TouchableOpacity style={styles.heartButton}>
          <Text style={styles.heartIcon}>♡</Text>
        </TouchableOpacity>
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New Launch</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{title}</Text>
        <Text style={styles.productSubtitle}>{subtitle}</Text>
        <StarRating rating={rating} />
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{price}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
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

const HorizontalProductCard = ({
  title,
  subtitle,
  price,
  rating,
  imageUrl,
}) => {
  return (
    <View style={styles.horizontalProductCard}>
      <View style={styles.horizontalProductImageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.horizontalProductImage}
        />
        <TouchableOpacity style={styles.heartButtonSmall}>
          <Text style={styles.heartIcon}>♡</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.horizontalProductInfo}>
        <Text style={styles.horizontalProductTitle}>{title}</Text>
        <Text style={styles.horizontalProductSubtitle}>{subtitle}</Text>
        <View style={styles.horizontalProductFooter}>
          <StarRating rating={rating} />
          <Text style={styles.horizontalProductPrice}>{price}</Text>
        </View>
      </View>
    </View>
  );
};

export default function App() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadProducts();
  }, []);
  return (
    <ScreenWrapper>
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
          <LinearGradient
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
                  <Text style={styles.trackerIconText}>↓</Text>
                </View>
                <View>
                  <Text style={styles.trackerLabel}>IPL Sessions</Text>
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
          </LinearGradient>

          {/* Daily Routine */}
          <View style={styles.routineSection}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineTitle}>Daily Routine</Text>
              <View style={styles.routineToggle}>
                <Text style={styles.routineToggleText}>Evening</Text>
              </View>
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
                <TouchableOpacity style={styles.continueButton}>
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

          {/* Featured Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.productsGrid}>
              <ProductCard
                title="Hydrating Serum"
                subtitle="Hyaluronic Acid Complex"
                price="$34.99"
                rating={4.5}
                isNew={true}
                imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yGC7Efy35Vu0JbQhY7hYO3uVRStrsl.png"
              />
              <View style={styles.productRow}>
                <ProductCard
                  title="Daily Moisturizer"
                  subtitle=""
                  price="$29.99"
                  rating={4.0}
                  imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yGC7Efy35Vu0JbQhY7hYO3uVRStrsl.png"
                />
                <ProductCard
                  title="Gentle Cleanser"
                  subtitle=""
                  price="$24.99"
                  rating={4.7}
                  imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yGC7Efy35Vu0JbQhY7hYO3uVRStrsl.png"
                />
              </View>
            </View>
          </View>

          {/* Trending Products Horizontal Banner */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>See More</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              <HorizontalProductCard
                title="Vitamin C Brightening Serum"
                subtitle="Radiance Boost"
                price="$42.99"
                rating={4.8}
                imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yGC7Efy35Vu0JbQhY7hYO3uVRStrsl.png"
              />
              <HorizontalProductCard
                title="Retinol Night Cream"
                subtitle="Anti-Aging Formula"
                price="$56.99"
                rating={4.6}
                imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yGC7Efy35Vu0JbQhY7hYO3uVRStrsl.png"
              />
              <HorizontalProductCard
                title="Niacinamide Toner"
                subtitle="Pore Minimizer"
                price="$28.99"
                rating={4.4}
                imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yGC7Efy35Vu0JbQhY7hYO3uVRStrsl.png"
              />
              <HorizontalProductCard
                title="SPF 50 Sunscreen"
                subtitle="Daily Protection"
                price="$32.99"
                rating={4.9}
                imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yGC7Efy35Vu0JbQhY7hYO3uVRStrsl.png"
              />
            </ScrollView>
          </View>

          {/* Discover Your Perfect Routine Section */}
          <LinearGradient
            colors={[COLORS.darkBlue, COLORS.mediumPink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.discoverSection, styles.quizSectionEnhanced]}
          >
            <View style={styles.quizIconContainer}>
              <Text style={styles.quizIcon}>✨</Text>
            </View>
            <Text style={styles.discoverTitle}>
              Discover Your Perfect Routine
            </Text>
            <Text style={styles.discoverSubtitle}>
              Take our 2-min skin quiz and get personalized product
              recommendations tailored just for you
            </Text>
            <TouchableOpacity style={styles.startQuizButton}>
              <Text style={styles.startQuizText}>Start Quiz</Text>
              <Text style={styles.quizArrow}>→</Text>
            </TouchableOpacity>
          </LinearGradient>

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
  discoverSection: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  discoverTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  discoverSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 22,
  },
  startQuizButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  startQuizText: {
    color: COLORS.darkBlue,
    fontWeight: "600",
    fontSize: 16,
  },
  quizArrow: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.darkBlue,
  },
  section: {
    marginBottom: 24,
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
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
  },
  productImageContainer: {
    position: "relative",
    backgroundColor: COLORS.lightPink,
    borderRadius: 8,
    height: 120,
    marginBottom: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  heartButtonSmall: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: COLORS.white,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: {
    fontSize: 16,
    color: COLORS.mediumGray,
  },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.lavender,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.darkBlue,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.almostBlack,
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  star: {
    color: "#FFD700",
    fontSize: 14,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.almostBlack,
  },
  addButton: {
    backgroundColor: COLORS.darkBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
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
    marginBottom: 24,
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
    backgroundColor: "rgba(255,255,255,0.2)",
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
    marginBottom: 24,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  continueButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
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
  horizontalScroll: {
    paddingLeft: 0,
  },
  horizontalProductCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    width: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontalProductImageContainer: {
    position: "relative",
    backgroundColor: COLORS.lightPink,
    borderRadius: 8,
    height: 100,
    marginBottom: 8,
  },
  horizontalProductImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  horizontalProductInfo: {
    flex: 1,
  },
  horizontalProductTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.almostBlack,
    marginBottom: 2,
    lineHeight: 18,
  },
  horizontalProductSubtitle: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: 8,
  },
  horizontalProductFooter: {
    marginTop: 4,
  },
  horizontalProductPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.almostBlack,
    marginTop: 4,
  },
  quizSectionEnhanced: {
    alignItems: "center",
    textAlign: "center",
  },
  quizIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  quizIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  bottomSpacing: {
    height: 40,
  },
});
