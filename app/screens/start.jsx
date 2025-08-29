"use client"

import { useState, useEffect } from "react"
import { Image } from "expo-image"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Modal } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

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
}

const { width, height } = Dimensions.get("window")

const menstrualReliefExercises = [
  {
    id: 1,
    title: "Period pain \n relief",
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
]

export default function ExerciseScreen() {
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute per pose
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completedPoses, setCompletedPoses] = useState(0)

  const exercise = menstrualReliefExercises[0]

  useEffect(() => {
    let interval = null

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleNextPose()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePreviousPose = () => {
    if (currentPoseIndex > 0) {
      setCurrentPoseIndex(currentPoseIndex - 1)
      setTimeLeft(60)
      setIsPlaying(true)
    }
  }

  const handleNextPose = () => {
    if (currentPoseIndex < exercise.poses.length - 1) {
      setCurrentPoseIndex(currentPoseIndex + 1)
      setCompletedPoses(completedPoses + 1)
      setTimeLeft(60)
      setIsPlaying(true)
    } else {
      setCompletedPoses(completedPoses + 1)
      setShowCompletionModal(true)
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    setIsPlaying(false)
    setTimeLeft(60)
    setCurrentPoseIndex(0)
    setCompletedPoses(0)
  }

  const closeModal = () => {
    setShowCompletionModal(false)
    // Reset to beginning
    setCurrentPoseIndex(0)
    setTimeLeft(60)
    setCompletedPoses(0)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <LinearGradient colors={["#fce7f3", "#e9d5ff"]} style={styles.topSection}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
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
          <Image source={{ uri: exercise.images[currentPoseIndex] }} style={styles.illustrationImage} />
        </View>
      </LinearGradient>

      <View style={styles.bottomSection}>
        {/* Pose name and timer */}
        <Text style={styles.poseName}>{exercise.poses[currentPoseIndex]}</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePreviousPose}
            style={[styles.controlButton, currentPoseIndex === 0 && styles.disabledButton]}
            disabled={currentPoseIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color={currentPoseIndex === 0 ? "#9ca3af" : "#374151"} />
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

          <TouchableOpacity onPress={handleNextPose} style={styles.controlButton}>
            <Ionicons name="chevron-forward" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showCompletionModal} transparent={true} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="white" />
            </View>

            <Text style={styles.modalTitle}>1 Exercise Completed!</Text>
            <Text style={styles.modalSubtitle}>
              Great job! You've just completed your exercise. Here's a quick summary of your workout.
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>minutes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>45</Text>
                <Text style={styles.statLabel}>calories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1</Text>
                <Text style={styles.statLabel}>exercise</Text>
              </View>
            </View>

            <View style={styles.exerciseInfo}>
              <Text style={styles.dayText}>Day 1</Text>
              <Text style={styles.exerciseTitle}>Period Pain Relief</Text>
              <View style={styles.stars}>
                <Ionicons name="star" size={20} color="#fbbf24" />
                <Ionicons name="star" size={20} color="#fbbf24" />
                <Ionicons name="star" size={20} color="#fbbf24" />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={closeModal}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
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
    fontWeight: "600",
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
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginTop: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
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
    fontWeight: "600",
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
    fontWeight: "600",
    textAlign: "center",
  },
})
