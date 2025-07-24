import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function InsightsPage() {
  const monthlyStats = [
    { label: "Avg Cycle Length", value: "28 days", trend: "+0.5", positive: true },
    { label: "Symptom-Free Days", value: "22 days", trend: "+3", positive: true },
    { label: "Sleep Quality", value: "7.8/10", trend: "+0.3", positive: true },
    { label: "Mood Score", value: "8.2/10", trend: "-0.1", positive: false },
  ]

  const insights = [
    {
      title: "Cycle Patterns",
      description:
        "Your cycles have been consistently 28-29 days over the past 6 months. This regularity indicates good hormonal balance.",
      icon: "calendar",
      colors: ["#ec4899", "#f43f5e"],
      confidence: 95,
    },
    {
      title: "Energy Levels",
      description:
        "You tend to have higher energy during days 7-14 of your cycle. Consider scheduling important tasks during this time.",
      icon: "flash",
      colors: ["#f59e0b", "#d97706"],
      confidence: 88,
    },
    {
      title: "Sleep & Mood Connection",
      description:
        "Your mood scores are 23% higher on days when you get 7+ hours of sleep. Prioritizing sleep could improve your wellbeing.",
      icon: "happy",
      colors: ["#8b5cf6", "#7c3aed"],
      confidence: 92,
    },
    {
      title: "Symptom Triggers",
      description:
        "Cramps tend to be more severe when you consume less than 6 glasses of water daily. Stay hydrated for better comfort.",
      icon: "heart",
      colors: ["#3b82f6", "#06b6d4"],
      confidence: 78,
    },
  ]

  const goals = [
    { title: "Track 30 consecutive days", progress: 87, current: 26, target: 30 },
    { title: "Log symptoms daily", progress: 93, current: 28, target: 30 },
    { title: "Maintain regular sleep", progress: 76, current: 23, target: 30 },
    { title: "Stay hydrated", progress: 82, current: 25, target: 30 },
  ]

  const recommendations = [
    {
      title: "Optimize Your Follicular Phase",
      description: "Try high-intensity workouts during days 7-14 when your energy is naturally higher.",
      colors: ["#ecfdf5", "#d1fae5"],
      iconColor: "#10b981",
    },
    {
      title: "Improve Sleep Consistency",
      description: "Set a bedtime reminder for 10 PM to help maintain your 7+ hour sleep goal.",
      colors: ["#eff6ff", "#dbeafe"],
      iconColor: "#3b82f6",
    },
    {
      title: "Hydration Strategy",
      description: "Set hourly water reminders to reach your 8-glass daily goal and reduce cramp severity.",
      colors: ["#f3e8ff", "#e9d5ff"],
      iconColor: "#8b5cf6",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#f5f3ff", "#ede9fe", "#fdf4ff"]} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Health Insights</Text>
            <Text style={styles.heroSubtitle}>
              Discover patterns in your health data and get personalized recommendations based on your tracking history.
            </Text>
          </View>
        </LinearGradient>

        {/* Monthly Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month's Overview</Text>
          <View style={styles.statsGrid}>
            {monthlyStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <View style={styles.trendContainer}>
                  <Ionicons
                    name={stat.positive ? "trending-up" : "trending-down"}
                    size={12}
                    color={stat.positive ? "#10b981" : "#ef4444"}
                  />
                  <Text style={[styles.trendText, { color: stat.positive ? "#10b981" : "#ef4444" }]}>{stat.trend}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI-Powered Insights</Text>
            <LinearGradient colors={["#8b5cf6", "#ec4899"]} style={styles.betaBadge}>
              <Text style={styles.betaBadgeText}>Beta</Text>
            </LinearGradient>
          </View>
          <View style={styles.insightsList}>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <View style={styles.insightContent}>
                  <LinearGradient colors={insight.colors} style={styles.insightIcon}>
                    <Ionicons name={insight.icon} size={24} color="white" />
                  </LinearGradient>
                  <View style={styles.insightText}>
                    <View style={styles.insightHeader}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <View style={styles.confidenceBadge}>
                        <Text style={styles.confidenceText}>{insight.confidence}% confidence</Text>
                      </View>
                    </View>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Goals Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Goals</Text>
          <View style={styles.goalsList}>
            {goals.map((goal, index) => (
              <View key={index} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalProgress}>
                    {goal.current}/{goal.target}
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressPercent}>{goal.progress}% complete</Text>
                    <Text style={styles.remainingDays}>{goal.target - goal.current} days remaining</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
          <View style={styles.recommendationsList}>
            {recommendations.map((rec, index) => (
              <LinearGradient key={index} colors={rec.colors} style={styles.recommendationCard}>
                <View style={styles.recommendationContent}>
                  <Ionicons name="target" size={20} color={rec.iconColor} style={styles.recommendationIcon} />
                  <View style={styles.recommendationText}>
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                    <Text style={styles.recommendationDescription}>{rec.description}</Text>
                  </View>
                </View>
              </LinearGradient>
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
    color: "#7c3aed",
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  betaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  betaBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  insightsList: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightContent: {
    flexDirection: "row",
    gap: 16,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  insightText: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  confidenceBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 10,
    color: "#6b7280",
  },
  insightDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  goalProgress: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ec4899",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressPercent: {
    fontSize: 12,
    color: "#6b7280",
  },
  remainingDays: {
    fontSize: 12,
    color: "#6b7280",
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationCard: {
    borderRadius: 16,
    padding: 16,
  },
  recommendationContent: {
    flexDirection: "row",
    gap: 12,
  },
  recommendationIcon: {
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
})
