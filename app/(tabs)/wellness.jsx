import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from 'expo-image';

const { width } = Dimensions.get("window");
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import ScreenWrapper from "../../components/ScreenWrapper";
import { useRouter } from "expo-router";
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
const WellnessScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const menstrualReliefExercises = [
    {
      id: 1,
      title: "Period pain \n relief",
      image: "https://i.ibb.co/kF3J0B7/image.png",
      gradientColors: [COLORS.lightPink, COLORS.mediumPink, COLORS.lavender],
      duration: "3 min",
      poses: [
        "Supported child's pose",
        "Supported pigeon pose",
        "Supported cat pose",
      ],
      images: ["", "", ""],
    },
    {
      id: 2,
      title: "Foot massage \n relieve",
      image: "https://i.ibb.co/CKVJp6gn/woman-relaxing-spa-min.jpg",
      gradientColors: ["#333333", "#dd1818"],
      duration: "3 min",
      poses: ["Left foot massage", "Right foot massage"],
      images: ["", "", ""],
    },
    // {
    //   id: 3,
    //   title: "Breathing exercises",
    //   image: require("../public/woman-doing-breathing-exercises-for-cramp-relief.png"),
    // },
  ];

  const programs = [
    {
      id: 1,
      title: "Kegel \nexercises",
      subtitle: "Day 1",
      image:
        "https://images.pexels.com/photos/2038556/pexels-photo-2038556.jpeg",
    },
  ];

  const soundscapes = [
    {
      id: 2,
      title: "Forest Rain",
      image: "https://images.pexels.com/photos/86543/pexels-photo-86543.jpeg",
      backgroundColor: "#2563eb",
    },
    // {
    //   id: 2,
    //   title: "Forest Adventure",
    //   image: "https://i.ibb.co/sdXj0P5y/16526.jpg",
    //   backgroundColor: "#10b981",
    // },

    // {
    //   id: 3,
    //   title: "Peaceful Night",
    //   image: "https://i.ibb.co/sdXj0P5y/16526.jpg",
    //   backgroundColor: "#8b5cf6",
    // },
  ];

  const PlayButton = ({ size = 48 }) => (
    <View style={[styles.playButton, { width: size, height: size }]}>
      <View style={styles.playTriangle} />
    </View>
  );

  return (
    <ScreenWrapper cartItemCount={0}>
      <ScrollView
        style={[
          styles.container,
          {
            paddingTop: insets.top + 5,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menstrual cramps relief</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {menstrualReliefExercises.map((exercise) => (
              <TouchableOpacity
                onPress={() => router.push("/screens/exercise")}
                key={exercise.id}
                style={styles.exerciseCard}
              >
                <LinearGradient
                  colors={exercise.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.exerciseOverlay}
                />

                <Image
                  source={{ uri: exercise.image }}
                  style={styles.exerciseImage}
                />
                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <PlayButton size={32} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programs for you</Text>
          {programs.map((program) => (
            <TouchableOpacity key={program.id} style={styles.programCard}>
              {/* Gradient background behind everything */}
              <LinearGradient
                colors={["#a855f7", "#8b5cf6", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.programGradient}
              />

              {/* Program image on top of gradient */}
              <Image
                source={{ uri: program.image }}
                style={styles.programImage}
              />

              <View style={styles.programContent}>
                <Text style={styles.programTitle}>{program.title}</Text>
                <TouchableOpacity style={styles.programButton}>
                  <View style={styles.playTriangleSmall} />
                  <Text style={styles.programButtonText}>
                    {program.subtitle}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={[
            styles.section,
            {
              marginBottom: 47,
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Soundscapes</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {soundscapes.map((soundscape) => (
              <TouchableOpacity
                key={soundscape.id}
                style={styles.soundscapeItem}
              >
                <View
                  style={[
                    styles.soundscapeCircle,
                    { backgroundColor: soundscape.backgroundColor },
                  ]}
                >
                  <Image
                    source={{ uri: soundscape.image }}
                    style={styles.soundscapeImage}
                  />
                  <View style={styles.soundscapePlayButton}>
                    <PlayButton size={40} />
                  </View>
                </View>
                <Text style={styles.soundscapeTitle}>{soundscape.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  proBadge: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  proIcon: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  proText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingBottom: 8,
  },
  exerciseCard: {
    width: 280,
    height: 192,
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    position: "relative",
  },
  exerciseOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },

  exerciseImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
    borderRadius: 16,
  },

  exerciseContent: {
    position: "absolute",
    bottom: 16,
    // top: 0,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  exerciseTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 16,
  },
  programCard: {
    width: "100%",
    height: 206,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  programGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  programImage: {
    position: "absolute",
    // right: 16,
    // top: 16,
    // width: 128,
    // height: 128,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
    zIndex: 1,
  },
  programOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(139, 92, 246, 0.9)",
  },
  programContent: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  programTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    maxWidth: 200,
  },
  programButton: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  programButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  soundscapeItem: {
    alignItems: "center",
    marginRight: 16,
    width: 120,
  },
  soundscapeCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
  },
  soundscapeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  soundscapePlayButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  soundscapeTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
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
  playTriangleSmall: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: "#374151",
    borderTopWidth: 4,
    borderTopColor: "transparent",
    borderBottomWidth: 4,
    borderBottomColor: "transparent",
  },
});

export default WellnessScreen;
