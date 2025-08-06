"use client";

import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
} from "react-native";
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * HomePage component displays an overview of a user's health and wellness journey.
 * It includes current cycle information, quick stats, wellness tools, and featured products.
 * Users can navigate to different sections of the app, such as the period tracker or wellness hub,
 * and view details about their current cycle and wellness tips.
 */

/*******  fb45f32e-bf05-446d-9d28-7247b9612e0e  *******/ import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../utils/authStore";
import { logOut } from "../utils/auth";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OldHeader from "../../components/OldHeader";
import ScreenWrapper from "../../components/ScreenWrapper";

const { width } = Dimensions.get("window");

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

   const insets = useSafeAreaInsets();
  
  // Calculate the header height (safe area top + padding + content height)
  const headerHeight = insets.top + 12 + 52 + 12; // top padding + top spacing + content height + bottom padding

  console.log("User:", user);
  const [currentCycle] = useState({
    dayOfCycle: 12,
    nextPeriod: "March 15, 2024",
    daysUntilNext: 16,
    phase: "Follicular",
  });

  const quickStats = [
    {
      label: "Cycle Day",
      value: currentCycle.dayOfCycle,
      colors: ["#ec4899", "#f43f5e"],
    },
    {
      label: "Days Until",
      value: currentCycle.daysUntilNext,
      colors: ["#8b5cf6", "#7c3aed"],
    },
    { label: "Avg Cycle", value: 28, colors: ["#3b82f6", "#06b6d4"] },
  ];

  const utilities = [
    {
      title: "Period Tracker",
      description: "Track your cycle and symptoms",
      icon: "calendar",
      colors: ["#ec4899", "#f43f5e"],
      route: "/tracker",
    },
    {
      title: "Wellness Hub",
      description: "Health tips and insights",
      icon: "fitness",
      colors: ["#10b981", "#059669"],
      route: "/wellness",
    },
    {
      title: "Mood Tracker",
      description: "Monitor your emotional wellbeing",
      icon: "heart",
      colors: ["#8b5cf6", "#7c3aed"],
      route: "/mood",
    },
    {
      title: "Sleep Tracker",
      description: "Track your sleep patterns",
      icon: "moon",
      colors: ["#6366f1", "#3b82f6"],
      route: "/sleep",
    },
    {
      title: "Nutrition Log",
      description: "Log your meals and nutrients",
      icon: "restaurant",
      colors: ["#f59e0b", "#d97706"],
      route: "/nutrition",
    },
    {
      title: "Hydration",
      description: "Track your daily water intake",
      icon: "water",
      colors: ["#06b6d4", "#0891b2"],
      route: "/hydration",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Organic Cotton Pads",
      price: 12.99,
      originalPrice: 15.99,
      rating: 4.8,
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Wellness Tea Blend",
      price: 18.99,
      rating: 4.6,
      badge: "New",
    },
  ];

  return (
    <ScreenWrapper>
     
    <View style={styles.container}>
   
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}

        {/* Hero Section */}
        <LinearGradient
          colors={["#fdf2f8", "#f3e8ff", "#eff6ff"]}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              <Text style={styles.heroTitleGradient}>Your {user.email}</Text>
              {"\n"}Journey Starts Here
            </Text>
            <Text style={styles.heroSubtitle}>
              Track your cycle, monitor your health, and discover products
              designed for your unique wellness needs.
            </Text>
            <Text className="text-red-500 text-2xl">Hello There</Text>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              {quickStats.map((stat, index) => (
                <LinearGradient
                  key={index}
                  colors={stat.colors}
                  style={styles.statCard}
                >
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              ))}
            </View>

            <TouchableOpacity style={styles.ctaButton}>
              <LinearGradient
                colors={["#ec4899", "#8b5cf6"]}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Current Cycle Status */}
        <View style={styles.section}>
          <LinearGradient
            colors={["#fdf2f8", "#f3e8ff"]}
            style={styles.cycleCard}
          >
            <View style={styles.cycleHeader}>
              <View>
                <Text style={styles.cycleTitle}>Current Cycle</Text>
                <Text style={styles.cycleSubtitle}>
                  Day {currentCycle.dayOfCycle} • {currentCycle.phase} Phase
                </Text>
              </View>
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>{currentCycle.phase}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Cycle Progress</Text>
                <Text style={styles.progressPercent}>
                  {Math.round((currentCycle.dayOfCycle / 28) * 100)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(currentCycle.dayOfCycle / 28) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.nextPeriod}>
                Next period expected: {currentCycle.nextPeriod}
              </Text>
            </View>

            <View style={styles.cycleActions}>
              <TouchableOpacity style={styles.cycleButton}>
                <Text style={styles.cycleButtonText}>Log Symptoms</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cycleButton, styles.cycleButtonOutline]}
              >
                <Text style={styles.cycleButtonOutlineText}>View Calendar</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Wellness Tools */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wellness Tools</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.utilitiesGrid}>
            {utilities.map((utility, index) => (
              <TouchableOpacity
                key={index}
                style={styles.utilityCard}
                onPress={() => router.push(utility.route)}
              >
                <LinearGradient
                  colors={utility.colors}
                  style={styles.utilityIcon}
                >
                  <Ionicons name={utility.icon} size={24} color="white" />
                </LinearGradient>
                <Text style={styles.utilityTitle}>{utility.title}</Text>
                <Text style={styles.utilityDescription}>
                  {utility.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push("/shop")}>
              <Text style={styles.viewAllText}>Shop All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                <View style={styles.productImage}>
                  <LinearGradient
                    colors={["#fdf2f8", "#f3e8ff"]}
                    style={styles.productImageGradient}
                  />
                  {product.badge && (
                    <View style={styles.productBadge}>
                      <Text style={styles.productBadgeText}>
                        {product.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productRating}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                  </View>
                  <View style={styles.productPricing}>
                    <Text style={styles.productPrice}>${product.price}</Text>
                    {product.originalPrice && (
                      <Text style={styles.originalPrice}>
                        ${product.originalPrice}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Wellness Tip */}
        <View style={styles.section}>
          <LinearGradient
            colors={["#ecfdf5", "#d1fae5"]}
            style={styles.tipCard}
          >
            <View style={styles.tipContent}>
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.tipIcon}
              >
                <Ionicons name="flash" size={20} color="white" />
              </LinearGradient>
              <View style={styles.tipText}>
                <Text style={styles.tipTitle}>Today's Wellness Tip</Text>
                <Text style={styles.tipDescription}>
                  During your follicular phase, your energy levels are naturally
                  higher. This is a great time to try new workouts or start new
                  healthy habits!
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
    </ScreenWrapper>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  
   
    // backgroundColor: "white",
  },
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#fce7f3",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ec4899",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ec4899",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#1f2937",
  },
  heroTitleGradient: {
    color: "#ec4899",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 80,
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: "white",
    fontSize: 12,
    opacity: 0.9,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  ctaText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cycleCard: {
    borderRadius: 16,
    padding: 20,
  },
  cycleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cycleTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  cycleSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  phaseBadge: {
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseBadgeText: {
    color: "#ec4899",
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressPercent: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(236, 72, 153, 0.2)",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ec4899",
    borderRadius: 4,
  },
  nextPeriod: {
    fontSize: 12,
    color: "#6b7280",
  },
  cycleActions: {
    flexDirection: "row",
    gap: 8,
  },
  cycleButton: {
    flex: 1,
    backgroundColor: "#ec4899",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cycleButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  cycleButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ec4899",
  },
  cycleButtonOutlineText: {
    color: "#ec4899",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  viewAllText: {
    color: "#ec4899",
    fontSize: 14,
    fontWeight: "600",
  },
  utilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  utilityCard: {
    width: (width - 44) / 2,
    backgroundColor: "rgba(248, 250, 252, 0.5)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  utilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  utilityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 4,
  },
  utilityDescription: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },
  productsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
  },
  productImageGradient: {
    flex: 1,
  },
  productBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ec4899",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: 18,
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
  },
  productPricing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ec4899",
  },
  originalPrice: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  tipCard: {
    borderRadius: 16,
    padding: 20,
  },
  tipContent: {
    flexDirection: "row",
    gap: 16,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tipText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
