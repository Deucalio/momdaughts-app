import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
// Your color theme
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
const { width, height } = Dimensions.get("window");
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
];
export default function ExerciseScreen(
  {
    // exercise,
    // currentPoseIndex,
    // onComplete,
  }
) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isPlaying, setIsPlaying] = useState(true);
  const exercise = menstrualReliefExercises[0];
  const currentPoseIndex = 0;
  const onComplete = () => {
    console.log("hi");
  };

  useEffect(() => {
    let interval = null;

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeLeft, onComplete]);

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Format seconds as MM:SS
   * @param {number} seconds time in seconds
   * @returns {string} formatted string
   */
  /*******  164f1fc7-4cac-459e-9ad2-88eeeb677d5d  *******/
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <LinearGradient
      colors={["#fce7f3", "#e9d5ff"]} // from-pink-100 to-purple-100
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* Background pattern */}
      <View style={styles.backgroundPattern}>
        <Text style={[styles.patternText, styles.pattern1]}>
          period tracker
        </Text>
        <Text style={[styles.patternText, styles.pattern2]}>
          period tracker
        </Text>
        <Text style={[styles.patternText, styles.pattern3]}>
          period tracker
        </Text>
        <Text style={[styles.patternText, styles.pattern4]}>
          period tracker
        </Text>
      </View>

      {/* Status bar */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.progressText}>{currentPoseIndex + 1}/3</Text>
        <TouchableOpacity>
          <Ionicons name="musical-notes" size={24} color="#7c3aed" />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Yoga pose illustration */}
        <View style={styles.illustrationContainer}>
          <LinearGradient
            colors={["#a855f7", "#3b82f6"]} // from-purple-400 to-blue-500
            style={styles.illustrationCircle}
          >
            {/* Simplified yoga pose illustration */}
            <View style={styles.yogaPose}>
              <View style={styles.poseBody} />
              <View style={styles.poseHead} />
              <View style={styles.poseArm1} />
              <View style={styles.poseArm2} />
            </View>
          </LinearGradient>
        </View>

        {/* Pose name */}
        <Text style={styles.poseName}>{exercise.poses[currentPoseIndex]}</Text>

        {/* Timer */}
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={32}
              color="white"
              style={isPlaying ? undefined : { marginLeft: 4 }}
            />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={32} color="#9ca3af" />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  patternText: {
    position: "absolute",
    color: "#f9a8d4",
    fontWeight: "300",
  },
  pattern1: {
    top: 80,
    left: 40,
    fontSize: 48,
  },
  pattern2: {
    top: 160,
    right: 40,
    fontSize: 32,
  },
  pattern3: {
    bottom: 160,
    left: 20,
    fontSize: 40,
  },
  pattern4: {
    bottom: 80,
    right: 80,
    fontSize: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  progressText: {
    color: "#7c3aed",
    fontWeight: "600",
    fontSize: 18,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: 80,
  },
  illustrationContainer: {
    width: 320,
    height: 320,
    marginBottom: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationCircle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  yogaPose: {
    position: "relative",
    width: 128,
    height: 80,
  },
  poseBody: {
    width: 128,
    height: 80,
    backgroundColor: "#581c87",
    borderRadius: 40,
  },
  poseHead: {
    position: "absolute",
    top: -16,
    left: 32,
    width: 64,
    height: 64,
    backgroundColor: "#fed7aa",
    borderRadius: 32,
  },
  poseArm1: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 96,
    height: 32,
    backgroundColor: "#fed7aa",
    borderRadius: 16,
  },
  poseArm2: {
    position: "absolute",
    top: 32,
    right: 8,
    width: 80,
    height: 24,
    backgroundColor: "#fed7aa",
    borderRadius: 12,
  },
  poseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 32,
    textAlign: "center",
  },
  timer: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 48,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
  },
  playButton: {
    width: 64,
    height: 64,
    backgroundColor: "#f472b6",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
