import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

const AffiliateBanner = ({ router, earnings = 0, referrals = 0, sales = 0 }) => {
  return (
    <TouchableOpacity
      style={styles.affiliateBanner}
      onPress={() => router.push("/screens/referral")}
      activeOpacity={0.95}
    >
      {/* Soft outer glow effect */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={["#fdf2f8", "#f0f9ff", "#f5f3ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.outerGlow}
        />
      </View>

      {/* Main gradient background - skincare themed */}
      <LinearGradient
        colors={["#ffffff", "#fef7ff", "#fff1f2", "#f0f9ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.affiliateBannerGradient}
      >
        {/* Soft background elements */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.floatingOrb, styles.orb1]} />
          <View style={[styles.floatingOrb, styles.orb2]} />
          <View style={[styles.floatingOrb, styles.orb3]} />
        </View>

        {/* Subtle accent overlay */}
        <LinearGradient
          colors={["rgba(236, 72, 153, 0.05)", "rgba(99, 102, 241, 0.05)", "rgba(139, 92, 246, 0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.accentOverlay}
        />

        {/* Main content */}
        <View style={styles.affiliateBannerContent}>
          {/* Header section */}
          <View style={styles.affiliateBannerHeader}>
            <View style={styles.leftSection}>
              <View style={styles.affiliateIconContainer}>
                <LinearGradient colors={["#ec4899", "#a855f7"]} style={styles.iconGradient}>
                  <Ionicons name="sparkles" size={24} color="#ffffff" />
                </LinearGradient>
                <View style={styles.iconGlow} />
              </View>

              <View style={styles.affiliateTextContainer}>
                <Text style={styles.affiliateBannerTitle}>Beauty Partner Program</Text>
                <View style={styles.subtitleContainer}>
                  <View style={styles.percentageBadge}>
                    <Text style={styles.percentageText}>25%</Text>
                  </View>
                  <Text style={styles.affiliateBannerSubtitle}>commission on skincare sales</Text>
                </View>
              </View>
            </View>

            <View style={styles.affiliateEarningsContainer}>
              <LinearGradient
                colors={["rgba(236, 72, 153, 0.1)", "rgba(168, 85, 247, 0.1)"]}
                style={styles.earningsBackground}
              >
                <Text style={styles.affiliateEarningsAmount}>${earnings.toLocaleString()}</Text>
                <Text style={styles.affiliateEarningsLabel}>Total Earned</Text>
                <View style={styles.trendIndicator}>
                  <Ionicons name="trending-up" size={12} color="#10b981" />
                  <Text style={styles.trendText}>+12%</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Enhanced stats section */}
          <View style={styles.affiliateStatsContainer}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.8)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.affiliateStatsRow}
            >
              <View style={styles.affiliateStatItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="heart" size={16} color="#a855f7" />
                </View>
                <Text style={styles.affiliateStatNumber}>{sales}</Text>
                <Text style={styles.affiliateStatLabel}>Sales</Text>
              </View>

              <View style={styles.affiliateStatDivider} />

              <View style={styles.affiliateStatItem}>
                <TouchableOpacity style={styles.startNowButton}>
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.startNowText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Bottom accent line */}
          <LinearGradient
            colors={["transparent", "#ec4899", "#a855f7", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bottomAccent}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  affiliateBanner: {
    marginHorizontal: 12,
    marginVertical: 8,
    position: "relative",
  },

  glowContainer: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    opacity: 0.3,
  },

  outerGlow: {
    flex: 1,
    borderRadius: 22,
    opacity: 0.5,
  },

  affiliateBannerGradient: {
    borderRadius: 20,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.1)",
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  floatingOrb: {
    position: "absolute",
    borderRadius: 50,
    opacity: 0.15,
  },

  orb1: {
    top: -15,
    right: -10,
    width: 60,
    height: 60,
    backgroundColor: "#ec4899",
  },

  orb2: {
    bottom: -20,
    left: -5,
    width: 50,
    height: 50,
    backgroundColor: "#a855f7",
  },

  orb3: {
    top: "60%",
    right: "30%",
    width: 35,
    height: 35,
    backgroundColor: "#6366f1",
  },

  accentOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },

  affiliateBannerContent: {
    position: "relative",
    zIndex: 3,
  },

  affiliateBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  affiliateIconContainer: {
    position: "relative",
    marginRight: 14,
  },

  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },

  iconGlow: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 25,
    backgroundColor: "rgba(236, 72, 153, 0.2)",
    opacity: 0.6,
    zIndex: -1,
  },

  affiliateTextContainer: {
    flex: 1,
  },

  affiliateBannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  percentageBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },

  percentageText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10b981",
  },

  affiliateBannerSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },

  affiliateEarningsContainer: {
    alignItems: "flex-end",
  },

  earningsBackground: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },

  affiliateEarningsAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 2,
  },

  affiliateEarningsLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 4,
  },

  trendIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  trendText: {
    fontSize: 10,
    color: "#10b981",
    fontWeight: "600",
  },

  affiliateStatsContainer: {
    marginBottom: 8,
  },

  affiliateStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },

  affiliateStatItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  statIconContainer: {
    marginBottom: 2,
  },

  affiliateStatNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
  },

  affiliateStatLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    textAlign: "center",
  },

  affiliateStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(236, 72, 153, 0.2)",
    marginHorizontal: 16,
  },

  startNowButton: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },

  startNowText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },

  bottomAccent: {
    height: 2,
    borderRadius: 1,
    marginTop: 6,
    opacity: 0.6,
  },
})

export default AffiliateBanner
