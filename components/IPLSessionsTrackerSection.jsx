import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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

export default function IPLSessionsTracker({
  completedSessions = 3,
  totalSessions = 6,
  onViewAllPress,
  onTrackerPress,
}) {
  const progressPercentage = (completedSessions / totalSessions) * 100;

  return (
    <View style={styles.backgroundImage}>
      <LinearGradient
        colors={[COLORS.deepBlue, COLORS.mediumPink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      >
        {/* Enhanced decorative background pattern */}
        <View style={styles.decorativePattern}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
          <View style={[styles.decorativeWave, styles.wave1]} />
          <View style={[styles.decorativeWave, styles.wave2]} />
        </View>

        <View style={styles.trackersHeader}>
          <Text style={styles.trackersTitle}>Your Trackers</Text>
        </View>

        <View style={styles.trackersContent}>
          <TouchableOpacity
            style={styles.trackerItem}
            onPress={onTrackerPress}
            activeOpacity={0.8}
          >
            <View style={styles.trackerIcon}>
              <Text style={styles.trackerIconText}>🔆</Text>
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerLabel}>IPL Sessions</Text>
              <Text style={styles.trackerValue}>
                {completedSessions} of {totalSessions} completed
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    borderRadius: 20,
    marginHorizontal: 8,
    marginVertical: 8,
    overflow: "hidden",
    marginBottom: 32,
  },
  gradientOverlay: {
    borderRadius: 20,
    padding: 20,
    minHeight: 80,
    position: "relative",
  },
  decorativePattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  decorativeCircle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  circle1: {
    width: 80,
    height: 80,
    top: -30,
    right: -30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -20,
    left: -20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  circle3: {
    width: 40,
    height: 40,
    top: 20,
    right: 80,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  decorativeWave: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  wave1: {
    width: 120,
    height: 20,
    borderRadius: 10,
    top: 40,
    left: -40,
    transform: [{ rotate: "15deg" }],
  },
  wave2: {
    width: 100,
    height: 15,
    borderRadius: 7.5,
    bottom: 30,
    right: -30,
    transform: [{ rotate: "-10deg" }],
  },
  trackersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    zIndex: 1,
  },
  trackersTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  viewAllTextWhite: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },
  trackersContent: {
    flex: 1,
    zIndex: 1,
  },
  trackerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
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
  },
  trackerInfo: {
    flex: 1,
  },
  trackerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 1,
  },
  trackerValue: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 1,
  },
  progressBackground: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 1.5,
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
  `,
  },
});
