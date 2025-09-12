import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenWrapper from "../../components/ScreenWrapper";
import Text from "../../components/Text";
import { fetchCartItemsCount } from "../utils/actions";
import { useAuthenticatedFetch } from "../utils/authStore";
const { width } = Dimensions.get("window");

const COLORS = {
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  deepBlue: "#2c2a6b",
  almostBlack: "#040707",
  white: "#ffffff",
  // Additional utility colors
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
  success: "#28a745",
  danger: "#dc3545",
  softPurple: "#e8d5ff",
  mintGreen: "#d1fae5",
  peachOrange: "#fed7aa",
  lightishPink: "#f596bb",
};

const WellnessScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);
  const { authenticatedFetch } = useAuthenticatedFetch();

  const menstrualReliefExercises = [
    {
      id: 1,
      title: "Period pain relief",
      subtitle: "Gentle stretches & poses",
      image: "https://i.ibb.co/kF3J0B7/image.png",
      gradientColors: [
        COLORS.lightishPink,
        COLORS.mediumPink,
        COLORS.lightPink,
      ],
      duration: "10-15 min",
    },
    {
      id: 2,
      title: "Foot massage relief",
      subtitle: "Pressure point therapy",
      image: "https://i.ibb.co/CKVJp6gn/woman-relaxing-spa-min.jpg",
      gradientColors: ["#333333", "#dd1818"],
      duration: "5-10 min",
    },
  ];

  const personalizedTips = [
    {
      id: 1,
      title: "Stay hydrated",
      description:
        "Drink plenty of water to reduce bloating and support your body during menstruation",
      icon: "💧",
      backgroundColor: COLORS.softPurple,
    },
    {
      id: 2,
      title: "Gentle movement",
      description:
        "Light exercise like walking or yoga can help reduce cramps and improve mood",
      icon: "🚶‍♀️",
      backgroundColor: COLORS.mintGreen,
    },
    {
      id: 3,
      title: "Nutrition matters",
      description:
        "Eat iron-rich foods and reduce caffeine to help manage period symptoms",
      icon: "🥗",
      backgroundColor: COLORS.peachOrange,
    },
  ];

  const PlayButton = ({ size = 48 }) => (
    <View style={[styles.playButton, { width: size, height: size }]}>
      <View style={styles.playTriangle} />
    </View>
  );

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

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        loadCartItemsCount();
      });
    }, [])
  );

  return (
    <ScreenWrapper cartItemCount={cartItemCount}>
      <ScrollView
        style={[
          styles.container,
          {
            paddingTop: insets.top + 5,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Menstrual Relief Section - Now Vertical */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menstrual cramps relief</Text>
          {menstrualReliefExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              onPress={() =>
                router.push(`/screens/exercise?exercise_id=${exercise.id}`)
              }
              activeOpacity={0.8}
              style={styles.exerciseCardVertical}
            >
              <LinearGradient
                colors={exercise.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exerciseOverlay}
              />

              <Image
                source={{ uri: exercise.image }}
                style={styles.exerciseImageVertical}
              />

              <View style={styles.exerciseContentVertical}>
                <View style={styles.exerciseTextContainer}>
                  <Text style={styles.exerciseTitleVertical}>
                    {exercise.title}
                  </Text>
                  <Text style={styles.exerciseSubtitle}>
                    {exercise.subtitle}
                  </Text>
                  <Text style={styles.exerciseDuration}>
                    {exercise.duration}
                  </Text>
                </View>
                <PlayButton size={40} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Personalized Tips Section */}
        <View style={[styles.section, { marginBottom: 47 }]}>
          <Text style={styles.sectionTitle}>Personalized tips for you</Text>
          {personalizedTips.map((tip) => (
            <TouchableOpacity key={tip.id} style={styles.tipCard}>
              <View
                style={[
                  styles.tipIconContainer,
                  { backgroundColor: tip.backgroundColor },
                ]}
              >
                <Text style={styles.tipIcon}>{tip.icon}</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Quick Stats Card */}
          <View
            style={[
              styles.statsCard,
              {
                display: "none",
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.lightPink, COLORS.mediumPink, "#f596bb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
              <Text style={styles.statsTitle}>Your wellness journey</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>7</Text>
                  <Text style={styles.statLabel}>Days tracked</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>3</Text>
                  <Text style={styles.statLabel}>Exercises completed</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },

  // Vertical Exercise Cards
  exerciseCardVertical: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  exerciseOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    opacity: 0.7,
  },
  exerciseImageVertical: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
    borderRadius: 16,
  },
  exerciseContentVertical: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  exerciseTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  exerciseTitleVertical: {
    color: "white",
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    marginBottom: 4,
  },
  exerciseSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 2,
  },
  exerciseDuration: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontFamily: "Outfit-Medium",
  },

  // Tips Section
  tipCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#111827",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  // Stats Card - FIXED
  statsCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  statsGradient: {
    padding: 20, // Reduced from 60 to 20
    paddingVertical: 24, // Added specific vertical padding
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },

  // Play Button
  playButton: {
    backgroundColor: "white",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: "#374151",
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderBottomWidth: 6,
    borderBottomColor: "transparent",
    marginLeft: 2,
  },
});

export default WellnessScreen;
