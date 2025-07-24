import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function WellnessPage() {
  const wellnessMetrics = [
    {
      title: "Daily Steps",
      value: "8,432",
      goal: "10,000",
      progress: 84,
      icon: "walk",
      colors: ["#3b82f6", "#06b6d4"],
    },
    {
      title: "Heart Rate",
      value: "72 bpm",
      status: "Normal",
      icon: "heart",
      colors: ["#ef4444", "#ec4899"],
    },
    {
      title: "Sleep Quality",
      value: "7.5h",
      status: "Good",
      icon: "moon",
      colors: ["#6366f1", "#8b5cf6"],
    },
    {
      title: "Water Intake",
      value: "6/8",
      goal: "8 glasses",
      progress: 75,
      icon: "water",
      colors: ["#06b6d4", "#3b82f6"],
    },
  ]

  const wellnessPrograms = [
    {
      title: "Cycle Sync Workouts",
      description: "Workouts tailored to your menstrual cycle phase",
      duration: "15-30 min",
      difficulty: "Beginner",
      icon: "fitness",
      colors: ["#ec4899", "#f43f5e"],
    },
    {
      title: "Mindful Moments",
      description: "Daily meditation and mindfulness exercises",
      duration: "5-15 min",
      difficulty: "All Levels",
      icon: "leaf",
      colors: ["#8b5cf6", "#7c3aed"],
    },
    {
      title: "Nutrition Guidance",
      description: "Personalized meal plans for hormonal health",
      duration: "Daily",
      difficulty: "Easy",
      icon: "nutrition",
      colors: ["#10b981", "#059669"],
    },
  ]

  const healthInsights = [
    {
      title: "Cycle Phase Impact",
      description:
        "Your energy levels are naturally higher during the follicular phase. Perfect time for high-intensity workouts!",
      type: "Cycle Insight",
    },
    {
      title: "Sleep Pattern",
      description: "You've been getting consistent 7+ hours of sleep. Great job maintaining healthy sleep hygiene!",
      type: "Sleep Health",
    },
    {
      title: "Hydration Reminder",
      description: "You're 2 glasses away from your daily water goal. Stay hydrated for better energy levels!",
      type: "Hydration",
    },
  ]

  const quickActions = [
    { icon: "thermometer", label: "Log Temperature" },
    { icon: "heart", label: "Record Mood" },
    { icon: "water", label: "Add Water" },
    { icon: "moon", label: "Log Sleep" },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#ecfdf5", "#d1fae5", "#a7f3d0"]} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Wellness Hub</Text>
            <Text style={styles.heroSubtitle}>
              Your comprehensive health and wellness dashboard. Track your progress, discover insights, and build
              healthy habits.
            </Text>
          </View>
        </LinearGradient>

        {/* Today's Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Metrics</Text>
          <View style={styles.metricsGrid}>
            {wellnessMetrics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <LinearGradient colors={metric.colors} style={styles.metricIcon}>
                    <Ionicons name={metric.icon} size={20} color="white" />
                  </LinearGradient>
                  <View style={styles.metricInfo}>
                    <Text style={styles.metricTitle}>{metric.title}</Text>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                  </View>
                </View>

                {metric.progress && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Goal: {metric.goal}</Text>
                      <Text style={styles.progressPercent}>{metric.progress}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${metric.progress}%` }]} />
                    </View>
                  </View>
                )}

                {metric.status && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{metric.status}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Wellness Programs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Programs</Text>
          <View style={styles.programsList}>
            {wellnessPrograms.map((program, index) => (
              <View key={index} style={styles.programCard}>
                <View style={styles.programContent}>
                  <LinearGradient colors={program.colors} style={styles.programIcon}>
                    <Ionicons name={program.icon} size={24} color="white" />
                  </LinearGradient>
                  <View style={styles.programInfo}>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    <Text style={styles.programDescription}>{program.description}</Text>
                    <View style={styles.programTags}>
                      <View style={styles.programTag}>
                        <Text style={styles.programTagText}>{program.duration}</Text>
                      </View>
                      <View style={styles.programTag}>
                        <Text style={styles.programTagText}>{program.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.startButton}>
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Health Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <View style={styles.insightsList}>
            {healthInsights.map((insight, index) => (
              <LinearGradient key={index} colors={["#eff6ff", "#f3e8ff"]} style={styles.insightCard}>
                <View style={styles.insightContent}>
                  <View style={styles.insightDot} />
                  <View style={styles.insightText}>
                    <View style={styles.insightHeader}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <View style={styles.insightTypeBadge}>
                        <Text style={styles.insightTypeText}>{insight.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                  </View>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard}>
                <Ionicons name={action.icon} size={20} color="#6b7280" />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  progressPercent: {
    fontSize: 10,
    color: "#6b7280",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ec4899",
    borderRadius: 3,
  },
  statusBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
  },
  programsList: {
    gap: 12,
  },
  programCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  programInfo: {
    flex: 1,
    gap: 8,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  programDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  programTags: {
    flexDirection: "row",
    gap: 8,
  },
  programTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  programTagText: {
    fontSize: 10,
    color: "#6b7280",
  },
  startButton: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    borderRadius: 16,
    padding: 16,
  },
  insightContent: {
    flexDirection: "row",
    gap: 12,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8b5cf6",
    marginTop: 8,
  },
  insightText: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  insightTypeBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  insightTypeText: {
    fontSize: 10,
    color: "#6b7280",
  },
  insightDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    height: 80,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
})
