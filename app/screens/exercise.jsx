import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../../components/Text";
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

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
};

const menstrualReliefExercises = [
  {
    id: 1,
    title: "Period pain relief",
    image: "https://i.ibb.co/kF3J0B7/image.png",
    gradientColors: [COLORS.lightPink, COLORS.mediumPink, COLORS.lavender],
    containerColor: COLORS.lightPink,
    duration: "3 min",
    poses: ["Supported child's pose", "Camel Pose", "Supported cat pose"],
    images: [
      "https://cdn.shopify.com/s/files/1/0669/0773/4308/files/period-pain-relief-supported-childs-pose-min.png?v=1759933617",
      "https://cdn.shopify.com/s/files/1/0669/0773/4308/files/period-pain-relief-camel-pose-min.png?v=1759933617",
      "https://cdn.shopify.com/s/files/1/0669/0773/4308/files/period-pain-relief-supported-cat-pose-min.png?v=1759933616",
    ],
  },
  {
    id: 2,
    title: "Foot massage relieve",
    image: "https://i.ibb.co/CKVJp6gn/woman-relaxing-spa-min.jpg",
    gradientColors: ["#333333", "#dd1818"],
    containerColor: "#333333",
    duration: "3 min",
    poses: ["Left foot massage", "Right foot massage"],
    images: [
      "https://cdn.shopify.com/s/files/1/0669/0773/4308/files/foot-massage-relief-left-min.png?v=1759933617",
      "https://cdn.shopify.com/s/files/1/0669/0773/4308/files/foot-massage-relief-right-min.png?v=1759933617",
    ],
  },
];

const ExerciseDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const params = useLocalSearchParams();
  const exercise_id = parseInt(params.exercise_id);
  const exercise = menstrualReliefExercises[exercise_id - 1];

  // Handle case where exercise is not found
  if (!exercise) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { top: insets.top + 10 }]}
          >
            <Ionicons
              style={styles.backArrow}
              name="arrow-back"
              size={20}
              color="#000"
            />
          </TouchableOpacity>
          <Text style={styles.errorText}>Exercise not found</Text>
        </View>
      </View>
    );
  }

  // Create poses array from exercise data
  const poses = exercise.poses.map((poseName, index) => ({
    id: index + 1,
    name: poseName,
    image: exercise.images[index] || exercise.image, // fallback to main image if pose image not available
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle={`${exercise_id === 2 ? "light-content" : "dark-content"}`} />
      {/* Gradient Background */}
      <LinearGradient
        colors={exercise.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.gradientBackground}
      />

      {/* Absolute positioned back button */}
      <TouchableOpacity
        // onPress={onBack}
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
        <Ionicons
          style={styles.backArrow}
          name="arrow-back"
          size={20}
          color="#000"
        />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View 
          style={[
            styles.heroImageContainer,
            { backgroundColor: exercise.containerColor }
          ]}
        >
          <Image
            source={{ uri: exercise.image }}
            style={styles.heroImage}
            contentFit="cover"
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>{exercise.title.replace('\n', ' ')}</Text>
          <Text style={styles.subtitle}>
            Here are some easy poses to help you calm down and relieve the pain.
          </Text>

          <Text style={styles.duration}>
            {exercise.duration}, {exercise.poses.length} Poses
          </Text>

          {/* Poses List */}
          <View style={styles.posesList}>
            {poses.map((pose) => (
              <View key={pose.id} style={styles.poseItem}>
                <View style={styles.poseImageContainer}>
                  <Image
                    source={{ uri: pose.image }}
                    style={styles.poseImage}
                    contentFit="cover"
                  />
                </View>
                <Text style={styles.poseName}>{pose.name}</Text>
              </View>
            ))}
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={() => router.push(`/screens/start?exercise_id=${exercise_id}`)}
            style={styles.startButton}
          >
            <View style={styles.playIcon}>
              <View style={styles.playTriangle} />
            </View>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0, // Space for the absolute back button
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 35,
    height: 35,
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  backArrow: {
    color: "#fff",
    fontFamily: "Outfit-SemiBold",
    textAlign: "center",
  },
  heroImageContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    minHeight: 230,
    maxHeight: screenHeight * 0.5, // Adjust this value as needed
    resizeMode: "contain", // Shows full image
  },
  contentSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    marginTop: -20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Outfit-Bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 16,
  },
  duration: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#111827",
    marginBottom: 20,
  },
  posesList: {
    marginBottom: 10,
  },
  poseItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  poseImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "white",
    marginRight: 16,
    overflow: "hidden",
  },
  poseImage: {
    width: "100%",
    height: "100%",
  },
  poseName: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#111827",
    flex: 1,
  },
  startButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2c2a6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playIcon: {
    marginRight: 8,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderLeftColor: "#FFFFFF",
    borderTopWidth: 8,
    borderTopColor: "transparent",
    borderBottomWidth: 8,
    borderBottomColor: "transparent",
    marginLeft: 2,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#111827",
    textAlign: "center",
  },
});

export default ExerciseDetailScreen;