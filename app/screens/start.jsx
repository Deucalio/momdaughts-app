"use client";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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
};

const { width, height } = Dimensions.get("window");

const menstrualReliefExercises = [
  {
    id: 1,
    title: "Period pain relief",
    image: "https://i.ibb.co/kF3J0B7/image.png",
    gradientColors: [COLORS.lightPink, COLORS.mediumPink, COLORS.lavender],
    duration: "3 min",
    poses: ["Supported child's pose", "Camel Pose", "Supported cat pose"],
    images: [
      "https://i.ibb.co/4RPLw0gF/image-fotor-bg-remover-2025082819617.png",
      "https://i.ibb.co/C5z5wgG4/image-fotor-bg-remover-2025082819217.png",
      "https://i.ibb.co/k2XWmY1b/image-fotor-bg-remover-20250828194042.png",
    ],
  },
  {
    id: 2,
    title: "Foot massage relieve",
    image: "https://i.ibb.co/CKVJp6gn/woman-relaxing-spa-min.jpg",
    gradientColors: [COLORS.lightPink, COLORS.mediumPink, COLORS.lavender],
    duration: "3 min",
    poses: ["Left foot massage", "Right foot massage"],
    images: [
      "https://i.ibb.co/svBYMZkP/image-removebg-preview-1.png",
      "https://i.ibb.co/LhQnDKwM/image-removebg-preview-2.png",
    ],
  },
];

export default function ExerciseScreen() {
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute per pose
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedPoses, setCompletedPoses] = useState(0);
const [userRating, setUserRating] = useState(1);

const handleRating = (rating) => {
  setUserRating(rating);
};
  const router = useRouter();
  const params = useLocalSearchParams();
  const exercise_id = parseInt(params.exercise_id) || 1;
  const exercise = menstrualReliefExercises[exercise_id - 1];

  const onBack = () => {
    router.back();
  };

  // Handle case where exercise is not found
  if (!exercise) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <TouchableOpacity
            onPress={onBack || (() => router.back())}
            style={styles.errorBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.errorText}>Exercise not found</Text>
        </View>
      </View>
    );
  }

  useEffect(() => {
    let interval = null;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextPose();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeLeft, currentPoseIndex]);

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

  const handlePreviousPose = () => {
    if (currentPoseIndex > 0) {
      setCurrentPoseIndex(currentPoseIndex - 1);
      setTimeLeft(60);
      setIsPlaying(true);
    }
  };

  const handleNextPose = () => {
    if (currentPoseIndex < exercise.poses.length - 1) {
      setCurrentPoseIndex(currentPoseIndex + 1);
      setCompletedPoses(completedPoses + 1);
      setTimeLeft(60);
      setIsPlaying(true);
    } else {
      setCompletedPoses(completedPoses + 1);
      setShowCompletionModal(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setTimeLeft(60);
    setCurrentPoseIndex(0);
    setCompletedPoses(0);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const closeModal = () => {
    setShowCompletionModal(false);
    // Reset to beginning
    setCurrentPoseIndex(0);
    setTimeLeft(60);
    setCompletedPoses(0);
    // Navigate back to the wellness
    router.push("/wellness");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={exercise.gradientColors || ["#fce7f3", "#e9d5ff"]}
        style={styles.topSection}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.progressText}>
            {currentPoseIndex + 1}/{exercise.poses.length}
          </Text>
          <TouchableOpacity>
            <Ionicons name="musical-notes" size={24} color="#7c3aed" />
          </TouchableOpacity>
        </View>

        {/* Exercise illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={{ uri: exercise.images[currentPoseIndex] }}
            style={styles.illustrationImage}
            contentFit="cover"
          />
        </View>
      </LinearGradient>

      <View style={styles.bottomSection}>
        {/* Pose name and timer */}
        <Text style={styles.poseName}>{exercise.poses[currentPoseIndex]}</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePreviousPose}
            style={[
              styles.controlButton,
              currentPoseIndex === 0 && styles.disabledButton,
            ]}
            disabled={currentPoseIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentPoseIndex === 0 ? "#9ca3af" : "#374151"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={32}
              color="white"
              style={isPlaying ? undefined : { marginLeft: 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleStop} style={styles.controlButton}>
            <Ionicons name="stop" size={24} color="#dc3545" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextPose}
            style={styles.controlButton}
          >
            <Ionicons name="chevron-forward" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

     <Modal
  visible={showCompletionModal}
  transparent={true}
  animationType="fade"
  onRequestClose={closeModal}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={32} color="white" />
      </View>
      <Text style={styles.modalTitle}>Exercise Completed!</Text>
      <Text style={styles.modalSubtitle}>
        Great job! You've just completed your exercise. Here's a quick
        summary of your workout.
      </Text>
      
      {/* Stats - only 2 items */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {exercise.duration.replace(" min", "")}
          </Text>
          <Text style={styles.statLabel}>minutes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{exercise.poses.length}</Text>
          <Text style={styles.statLabel}>poses</Text>
        </View>
      </View>

      {/* Exercise Info */}
      <View style={styles.exerciseInfo}>
        <Text style={styles.dayText}>Day 1</Text>
        <Text style={styles.exerciseTitle}>{exercise.title}</Text>
      </View>

      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <Text style={styles.ratingText}>How was your experience?</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRating(star)}
              style={styles.starButton}
            >
              <Ionicons
                name={star <= userRating ? "star" : "star-outline"}
                size={24}
                color={star <= userRating ? "#fbbf24" : "#d1d5db"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={closeModal}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topSection: {
    height: height * 0.5,
    paddingTop: 48,
  },
  bottomSection: {
    height: height * 0.5,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressText: {
    color: "#7c3aed",
    fontFamily: "Outfit-SemiBold",
    fontSize: 18,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationImage: {
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  poseName: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#1f2937",
    textAlign: "center",
    marginTop: 16,
  },
  timer: {
    fontSize: 48,
    fontFamily: "Outfit-Bold",
    color: "#1f2937",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 32,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#22c55e",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontFamily: "Outfit-Bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  exerciseInfo: {
    alignItems: "center",
    marginBottom: 32,
  },
  dayText: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#1f2937",
    marginBottom: 4,
  },
  exerciseTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  ratingSection: {
  alignItems: "center",
  marginBottom: 32,
  width: "100%",
},
ratingText: {
  fontSize: 16,
  fontFamily: "Outfit-SemiBold",
  color: "#1f2937",
  marginBottom: 16,
},
starsContainer: {
  flexDirection: "row",
  gap: 8,
},
starButton: {
  padding: 4,
},
  submitButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 24,
    width: "100%",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorBackButton: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 48,
    height: 48,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#111827",
    textAlign: "center",
  },
});
