import { LinearGradient } from "expo-linear-gradient"
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Image
        source={{
          uri: "https://i.ibb.co/tP8gRMBP/image.png",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)"]} style={styles.backgroundOverlay} />

      <View style={styles.floatingCardContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.loyaltyCard}>
            {/* Membership Status */}
            <View style={styles.membershipHeader}>
              <View style={styles.membershipInfo}>
                <View style={styles.goldBadge}>
                  <Text style={styles.goldIcon}>🏆</Text>
                </View>
                <Text style={styles.membershipTitle}>Gold Member</Text>
              </View>
              <TouchableOpacity style={styles.benefitsButton}>
                <Text style={styles.benefitsText}>Check Benefits</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <Text style={styles.userName}>Hamad Ali</Text>

            {/* Points Section */}
            <View style={styles.pointsSection}>
              <Text style={styles.pointsValue}>2,490 pts</Text>
              <Text style={styles.pointsToNext}>250 points to Platinum Member</Text>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={["#FF6B35", "#FF9B7A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBar}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>How to Earn</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton}>
                <LinearGradient
                  colors={["#FF6B35", "#FF8A50"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Redeem Rewards</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Recent Points Section */}
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent points gained</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>

              {/* Coffee Purchase Item */}
              <View style={styles.recentItem}>
                <View style={styles.recentItemLeft}>
                  <View style={styles.coffeeIcon}>
                    <Text style={styles.coffeeEmoji}>☕</Text>
                  </View>
                  <View style={styles.recentItemInfo}>
                    <Text style={styles.recentItemTitle}>Coffee Purchase</Text>
                    <Text style={styles.recentItemDate}>Jul 3, 2025</Text>
                  </View>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsEarned}>+25 pts</Text>
                </View>
              </View>

              {/* Grocery Shopping Item */}
              <View style={styles.recentItem}>
                <View style={styles.recentItemLeft}>
                  <View style={styles.groceryIcon}>
                    <Text style={styles.groceryEmoji}>🛒</Text>
                  </View>
                  <View style={styles.recentItemInfo}>
                    <Text style={styles.recentItemTitle}>Grocery Shopping</Text>
                    <Text style={styles.recentItemDate}>Jul 3, 2025</Text>
                  </View>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsEarned}>+25 pts</Text>
                </View>
              </View>
            </View>

            {/* Promotions and Discounts Section */}
            <View style={styles.promotionsSection}>
              <Text style={styles.promotionsTitle}>Promotions and discounts</Text>

              {/* Special Offer Banner */}
              <TouchableOpacity style={styles.promotionBanner}>
                <LinearGradient
                  colors={["#FF6B35", "#FF8A50"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.promotionGradient}
                >
                  <View style={styles.promotionContent}>
                    <View style={styles.promotionLeft}>
                      <Text style={styles.promotionTitle}>Double Points Weekend</Text>
                      <Text style={styles.promotionSubtitle}>Earn 2x points on all purchases</Text>
                      <Text style={styles.promotionExpiry}>Expires: Jul 15, 2025</Text>
                    </View>
                    <View style={styles.promotionIcon}>
                      <Text style={styles.promotionEmoji}>⚡</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Free Coffee Offer */}
              <TouchableOpacity style={styles.promotionItem}>
                <View style={styles.promotionItemLeft}>
                  <View style={styles.freeOfferIcon}>
                    <Text style={styles.freeOfferEmoji}>🎁</Text>
                  </View>
                  <View style={styles.promotionItemInfo}>
                    <Text style={styles.promotionItemTitle}>Free Coffee Reward</Text>
                    <Text style={styles.promotionItemDesc}>Redeem with 500 points</Text>
                  </View>
                </View>
                <View style={styles.claimButton}>
                  <Text style={styles.claimButtonText}>Claim</Text>
                </View>
              </TouchableOpacity>

              {/* Discount Offer */}
              <TouchableOpacity style={styles.promotionItem}>
                <View style={styles.promotionItemLeft}>
                  <View style={styles.discountIcon}>
                    <Text style={styles.discountEmoji}>💰</Text>
                  </View>
                  <View style={styles.promotionItemInfo}>
                    <Text style={styles.promotionItemTitle}>20% Off Next Purchase</Text>
                    <Text style={styles.promotionItemDesc}>Valid until Jul 20, 2025</Text>
                  </View>
                </View>
                <View style={styles.claimButton}>
                  <Text style={styles.claimButtonText}>Use</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Changed from coral to white background
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "60%", // Reduced from 100% to 60% height
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%", // Overlay only covers the image area (60% height)
  },
  floatingCardContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    height: "60%", // Reduced height to show more background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  loyaltyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // Full rounded corners instead of just top
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8, // Increased shadow offset for more floating effect
    },
    shadowOpacity: 0.25, // Increased shadow opacity
    shadowRadius: 16, // Increased shadow radius
    elevation: 12, // Increased elevation for Android
    minHeight: "100%",
  },
  membershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  membershipInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  goldBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goldIcon: {
    fontSize: 18,
  },
  membershipTitle: {
    fontSize: 18, // Reduced from 20
    fontFamily: "Outfit-Bold",
    color: "#333333",
  },
  benefitsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitsText: {
    fontSize: 14, // Reduced from 16
    color: "#FF6B35",
    fontFamily: "Outfit-SemiBold",
    marginRight: 4,
  },
  arrow: {
    fontSize: 18,
    color: "#FF6B35",
    fontFamily: "Outfit-Bold",
  },
  userName: {
    fontSize: 24, // Reduced from 28
    fontFamily: "Outfit-Bold",
    color: "#333333",
    marginBottom: 12,
  },
  pointsSection: {
    marginBottom: 32,
  },
  pointsValue: {
    fontSize: 32, // Reduced from 36
    fontFamily: "Outfit-ExtraBold",
    color: "#333333",
    marginBottom: 6,
  },
  pointsToNext: {
    fontSize: 13, // Reduced from 15
    color: "#666666",
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#E5E5E5",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "85%",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    alignItems: "center",
  },
  outlineButtonText: {
    fontSize: 14, // Reduced from 16
    fontFamily: "Outfit-SemiBold",
    color: "#333333",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14, // Reduced from 16
    fontFamily: "Outfit-Bold",
    color: "#FFFFFF",
  },
  recentSection: {
    marginBottom: 16,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 18, // Reduced from 20
    fontFamily: "Outfit-Bold",
    color: "#333333",
  },
  seeAllText: {
    fontSize: 13, // Reduced from 15
    color: "#FF6B35",
    fontFamily: "Outfit-SemiBold",
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  recentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  coffeeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  coffeeEmoji: {
    fontSize: 22,
  },
  recentItemInfo: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 15, // Reduced from 17
    fontFamily: "Outfit-SemiBold",
    color: "#333333",
    marginBottom: 4,
  },
  recentItemDate: {
    fontSize: 12, // Reduced from 14
    color: "#666666",
  },
  pointsBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  pointsEarned: {
    fontSize: 13, // Reduced from 15
    fontFamily: "Outfit-Bold",
    color: "#FF6B35",
  },
  groceryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  groceryEmoji: {
    fontSize: 22,
  },
  promotionsSection: {
    marginTop: 24,
  },
  promotionsTitle: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: "#333333",
    marginBottom: 16,
  },
  promotionBanner: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  promotionGradient: {
    padding: 20,
  },
  promotionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promotionLeft: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  promotionSubtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 6,
  },
  promotionExpiry: {
    fontSize: 11,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  promotionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  promotionEmoji: {
    fontSize: 20,
  },
  promotionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  promotionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  freeOfferIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  freeOfferEmoji: {
    fontSize: 18,
  },
  discountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  discountEmoji: {
    fontSize: 18,
  },
  promotionItemInfo: {
    flex: 1,
  },
  promotionItemTitle: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: "#333333",
    marginBottom: 2,
  },
  promotionItemDesc: {
    fontSize: 12,
    color: "#666666",
  },
  claimButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  claimButtonText: {
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
    color: "#FFFFFF",
  },
})
