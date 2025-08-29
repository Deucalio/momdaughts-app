
import { Image } from 'expo-image';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router } from "expo-router";


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

const ExerciseDetailScreen = ({ onBack }) => {
  const insets = useSafeAreaInsets()

  const poses = [
    {
      id: 1,
      name: "Supported child's pose",
      image: "https://i.ibb.co/Y7Vk2FxD/image.png",
    },
    {
      id: 2,
      name: "Camel Pose",
      image: "https://i.ibb.co/wZnG2K2T/image.png",
    },
    {
      // https://i.ibb.co/R4Gn1009/image.png
      id: 3,
      name: "Supported reclining bound angle pose",
      image: "https://i.ibb.co/k2XWmY1b/image-fotor-bg-remover-20250828194042.png",
    },
  ]

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.lightPink, COLORS.mediumPink, COLORS.lavender]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.gradientBackground}
      />

      {/* Absolute positioned back button */}
      <TouchableOpacity onPress={onBack} style={[styles.backButton, { top: insets.top + 10 }]}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image 
          
          // https://momdaughts.com/cdn/shop/files/aunty_heating_pad.jpg?v=1750342577&width=1000
            source={{ uri: "https://i.ibb.co/kF3J0B7/image.png" }} 
            style={styles.heroImage} 
            resizeMode="cover"
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>Period pain relief</Text>
          <Text style={styles.subtitle}>Here are some easy poses to help you calm down and relieve the pain.</Text>

          <Text style={styles.duration}>3 min, 3 Poses</Text>

          {/* Poses List */}
          <View style={styles.posesList}>
            {poses.map((pose) => (
              <View key={pose.id} style={styles.poseItem}>
                <View style={styles.poseImageContainer}>
                  <Image source={{ uri: pose.image }} style={styles.poseImage} resizeMode="cover" />
                </View>
                <Text style={styles.poseName}>{pose.name}</Text>
              </View>
            ))}
          </View>

          {/* Start Button */}
          <TouchableOpacity onPress={() => router.push("/screens/start")} style={styles.startButton}>
            <View style={styles.playIcon}>
              <View style={styles.playTriangle} />
            </View>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

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
    width: 40,
    height: 40,
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  backArrow: {
    fontSize: 24,
    color: "#374151",
    fontWeight: "600",
    textAlign: "center",
  },
//   heroImageContainer: {
//     alignItems: "center",
//     marginBottom: 20,
//     paddingHorizontal: 16,
//   },
//   heroImage: {
//     width: width,
//     height: auto,
//     borderRadius: 16,
//   },
  heroImageContainer: {
    width: "100%",
    backgroundColor: "#f5b8d0",
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
    fontWeight: "bold",
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
    fontWeight: "600",
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
    fontWeight: "500",
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
    fontWeight: "600",
  },
})

export default ExerciseDetailScreen