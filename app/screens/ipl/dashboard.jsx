"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PixelRatio,
  Image,
} from "react-native";
import { useAuthenticatedFetch, useAuthStore } from "../../utils/authStore";
const { width, height } = Dimensions.get("window");
import { useRouter } from "expo-router";
import { fetchIPLProfile } from "../../utils/actions";

// Scaling functions
const scale = (size) => (width / 375) * size; // Base width: iPhone 11
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const mockSessionData = [
  { month: "Jan", sessions: 4 },
  { month: "Feb", sessions: 6 },
  { month: "Mar", sessions: 8 },
  { month: "Apr", sessions: 5 },
  { month: "May", sessions: 7 },
  { month: "Jun", sessions: 9 },
];

const mockSessionHistory = [
  {
    id: 1,
    date: "Aug 14",
    area: "Face",
    intensity: 3,
    duration: "12 min",
    notes: "Felt comfortable",
  },
  {
    id: 2,
    date: "Aug 7",
    area: "Legs",
    intensity: 2,
    duration: "18 min",
    notes: "",
  },
  {
    id: 3,
    date: "Jul 31",
    area: "Face",
    intensity: 3,
    duration: "10 min",
    notes: "Slight redness",
  },
  {
    id: 4,
    date: "Jul 24",
    area: "Arms",
    intensity: 2,
    duration: "15 min",
    notes: "",
  },
];

const IPLSessionTracker = () => {
  const [activeTab, setActiveTab] = useState("tracker");
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const { user, syncUserMetaData } = useAuthStore();

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState(mockSessionHistory);
  const [showHistory, setShowHistory] = useState(false);

  // Check if user has completed onboarding, redirect if not
  // useEffect(() => {
  //   if (!user?.metaData?.ipl_onboarding_completed) {
  //     // Redirect to onboarding screen
  //     router.push('/ipl-onboarding');
  //   }
  // }, [user?.metaData?.ipl_onboarding_completed]);

  useEffect(() => {
    let interval = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTimer((timer) => timer + 1);
      }, 1000);
    } else if (!isSessionActive && sessionTimer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startSession = (sessionData) => {
    setCurrentSession(sessionData);
    setIsSessionActive(true);
    setSessionTimer(0);
  };

  const stopSession = () => {
    if (currentSession) {
      const newSession = {
        id: sessionHistory.length + 1,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        area: currentSession.area,
        intensity: currentSession.intensity,
        duration: formatTime(sessionTimer),
        notes: currentSession.notes || "",
      };
      setSessionHistory([newSession, ...sessionHistory]);
    }
    setIsSessionActive(false);
    setSessionTimer(0);
    setCurrentSession(null);
    setActiveTab("tracker");
  };

  const renderChart = () => {
    const maxSessions = Math.max(...mockSessionData.map((d) => d.sessions));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sessions Per Month</Text>
        <View style={styles.chart}>
          {mockSessionData.map((data, index) => (
            <View key={index} style={styles.chartBar}>
              <View
                style={[
                  styles.bar,
                  {
                    height: (data.sessions / maxSessions) * 100,
                    backgroundColor: "#2c2a6b",
                  },
                ]}
              />
              <Text style={styles.barLabel}>{data.month}</Text>
              <Text style={styles.barValue}>{data.sessions}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTrackerPage = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Personalized Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>
          Hi {user?.firstName || 'there'} 👋, here's your IPL progress
        </Text>
        <View style={styles.deviceInfo}>
          <Image
            source={{
              uri:
                user?.metaData?.ipl_device?.images?.[0]?.originalSrc ||
                "https://via.placeholder.com/50",
            }}
            style={styles.deviceIcon}
          />
          <Text style={styles.deviceText}>
            {user?.metaData?.ipl_device?.title || "IPL Device"}
          </Text>
        </View>
      </View>

      {/* Enhanced Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>Weekly</Text>
          <Text style={styles.statLabel}>Current Phase</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏰</Text>
          <Text style={styles.statValue}>5 Days</Text>
          <Text style={styles.statLabel}>Next Session Due</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statValue}>
            {user?.metaData?.ipl_treatment_areas?.join(', ') || "Face, Legs"}
          </Text>
          <Text style={styles.statLabel}>Treatment Areas</Text>
        </View>
      </View>

      {/* Next Session Block */}
      <View style={styles.nextSessionBlock}>
        <Text style={styles.nextSessionTitle}>Next Session</Text>
        <Text style={styles.nextSessionDate}>
          Your next IPL session is due on Aug 28
        </Text>
        <TouchableOpacity
          style={styles.logSessionButton}
          onPress={() => setActiveTab("add")}
        >
          <Text style={styles.logSessionButtonText}>Log New Session</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Visualization */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progress Timeline</Text>
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            You're in Week 5 of 12 initial sessions
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "42%" }]} />
            </View>
          </View>
          <Text style={styles.progressPercentage}>42% Complete</Text>
        </View>
      </View>

      {/* Chart */}
      {renderChart()}

      {/* Session History Toggle */}
      <TouchableOpacity
        style={styles.historyToggle}
        onPress={() => setShowHistory(!showHistory)}
      >
        <Text style={styles.historyToggleText}>
          {showHistory ? "Hide" : "Show"} Session History
        </Text>
        <Text style={styles.historyToggleIcon}>{showHistory ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Session History */}
      {showHistory && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {sessionHistory.map((session) => (
            <View key={session.id} style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDateText}>{session.date}</Text>
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyArea}>{session.area}</Text>
                <Text style={styles.historyIntensity}>
                  Intensity {session.intensity}
                </Text>
                <Text style={styles.historyDuration}>{session.duration}</Text>
                {session.notes && (
                  <Text style={styles.historyNotes}>{session.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Settings Button */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => router.push('/ipl-settings')}
      >
        <Text style={styles.settingsButtonText}>⚙️ Edit IPL Details</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAddSessionPage = () => {
    if (isSessionActive) {
      return (
        <View style={styles.sessionActiveContainer}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>Session in Progress</Text>
            <Text style={styles.sessionArea}>{currentSession?.area}</Text>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(sessionTimer)}</Text>
            <Text style={styles.timerLabel}>Session Duration</Text>
          </View>

          <View style={styles.sessionDetails}>
            <Text style={styles.sessionDetailText}>
              Intensity: Level {currentSession?.intensity}
            </Text>
            <Text style={styles.sessionDetailText}>
              Area: {currentSession?.area}
            </Text>
          </View>

          <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
            <Text style={styles.stopButtonText}>Stop Session</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setActiveTab("tracker")}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Session</Text>
          <View style={styles.menuButton} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              You've completed 6/12 recommended sessions
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "50%" }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Session Cards */}
        <View style={styles.sessionCardsSection}>
          <Text style={styles.sectionTitle}>Quick Start Sessions</Text>

          <TouchableOpacity
            style={styles.sessionCard}
            onPress={() =>
              startSession({ area: "Face", intensity: 3, notes: "" })
            }
          >
            <View style={styles.sessionCardContent}>
              <Text style={styles.sessionCardTitle}>Face Treatment</Text>
              <Text style={styles.sessionCardSubtitle}>
                Intensity Level 3 • 10-15 minutes
              </Text>
            </View>
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sessionCard}
            onPress={() =>
              startSession({ area: "Legs", intensity: 2, notes: "" })
            }
          >
            <View style={styles.sessionCardContent}>
              <Text style={styles.sessionCardTitle}>Legs Treatment</Text>
              <Text style={styles.sessionCardSubtitle}>
                Intensity Level 2 • 15-20 minutes
              </Text>
            </View>
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sessionCard}
            onPress={() =>
              startSession({ area: "Arms", intensity: 2, notes: "" })
            }
          >
            <View style={styles.sessionCardContent}>
              <Text style={styles.sessionCardTitle}>Arms Treatment</Text>
              <Text style={styles.sessionCardSubtitle}>
                Intensity Level 2 • 12-18 minutes
              </Text>
            </View>
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Custom Session Button */}
        <TouchableOpacity style={styles.customSessionButton}>
          <Text style={styles.customSessionButtonText}>
            + Create Custom Session
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Return early if user hasn't completed onboarding
  if (!user?.metaData?.ipl_onboarding_completed) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirecting to onboarding...</Text>
      </View>
    );
  }

  return activeTab === "tracker" ? renderTrackerPage() : renderAddSessionPage();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    marginTop: 45,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 18,
    color: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  progressSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2c2a6b",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  welcomeHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  deviceText: {
    fontSize: 14,
    color: "#666",
  },
  nextSessionBlock: {
    backgroundColor: "#2c2a6b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  nextSessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  nextSessionDate: {
    fontSize: 14,
    color: "#E2E8F0",
    marginBottom: 16,
  },
  logSessionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "flex-start",
  },
  logSessionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c2a6b",
  },
  historyToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  historyToggleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  historyToggleIcon: {
    fontSize: 16,
    color: "#666",
  },
  historySection: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyDate: {
    width: 60,
    marginRight: 16,
  },
  historyDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2c2a6b",
  },
  historyDetails: {
    flex: 1,
  },
  historyArea: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  historyIntensity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  historyDuration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  settingsButton: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    alignItems: "center",
  },
  settingsButtonText: {
    fontSize: 16,
    color: "#666",
  },
  sessionActiveContainer: {
    flex: 1,
    backgroundColor: "#2c2a6b",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  sessionHeader: {
    alignItems: "center",
    marginBottom: 60,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  sessionArea: {
    fontSize: 18,
    color: "#E2E8F0",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  timerText: {
    fontSize: 72,
    fontWeight: "300",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 16,
    color: "#E2E8F0",
  },
  sessionDetails: {
    alignItems: "center",
    marginBottom: 60,
  },
  sessionDetailText: {
    fontSize: 16,
    color: "#E2E8F0",
    marginBottom: 8,
  },
  stopButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c2a6b",
  },
  sessionCardsSection: {
    marginBottom: 20,
  },
  sessionCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionCardContent: {
    flex: 1,
  },
  sessionCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  sessionCardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2c2a6b",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
    marginLeft: 2,
  },
  customSessionButton: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  customSessionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c2a6b",
  },
});

export default IPLSessionTracker;