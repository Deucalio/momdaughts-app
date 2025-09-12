import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,

    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import AddSessionSection from "../../../components/AddSessionSection";
import Text from "../../../components/Text";
import { createIPLSession, fetchIPLProfile } from "../../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../../utils/authStore";
const { width, height } = Dimensions.get("window");
const BACKEND_URL = "https://076d27aa8a97.ngrok-free.app";

const mockSessionData = [
  { month: "Jan", sessions: 4 },
  { month: "Feb", sessions: 6 },
  { month: "Mar", sessions: 8 },
  { month: "Apr", sessions: 5 },
  { month: "May", sessions: 7 },
  { month: "Jun", sessions: 9 },
];

const IPLSessionTracker = () => {
  const [activeTab, setActiveTab] = useState("tracker");
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const { user, syncUserMetaData } = useAuthStore();

  // New state for API data
  const [iplProfile, setIplProfile] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch IPL profile
        const profileResponse = await fetchIPLProfile(authenticatedFetch);
        if (profileResponse?.iplProfile) {
          setIplProfile(profileResponse.iplProfile);
          setSessionHistory(profileResponse.iplProfile.sessions || []);

          // Extract device ID from the profile to fetch product data
          const deviceId = profileResponse.iplProfile.device;
          if (deviceId) {
            const productId = deviceId.replace("gid://shopify/Product/", "");
            const response = await authenticatedFetch(
              `${BACKEND_URL}/products?productId=${productId}`
            );
            if (!response.ok) {
              throw new Error(
                `Failed to fetch product data: ${response.status} ${response.statusText}`
              );
            }
            const productResponse = await response.json();

            if (productResponse?.product) {
              setProductData(productResponse.product);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching IPL data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

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

  const stopSession = async () => {
    if (currentSession) {
      const newSession = {
        userId: user.id,
        date: new Date(),
        bodyArea: currentSession.area,
        intensityLevel: currentSession.intensity,
        metaData: {
          duration: formatTime(sessionTimer),
          notes: currentSession.notes || "",
        },
        profileId: iplProfile.id,
      };

      setSessionHistory([newSession, ...sessionHistory]);
      setIsSessionActive(false);
      setSessionTimer(0);
      setCurrentSession(null);
      setActiveTab("tracker");
      const newSes = await createIPLSession(authenticatedFetch, newSession);

      console.log("newSession Added:", newSession);
    }
  };

  const getTreatmentAreas = () => {
    if (!iplProfile?.treatmentAreas) return [];
    return Object.keys(iplProfile.treatmentAreas).filter(
      (area) => iplProfile.treatmentAreas[area]
    );
  };

  const formatTreatmentAreas = () => {
    const areas = getTreatmentAreas();
    return areas
      .map((area) => area.charAt(0).toUpperCase() + area.slice(1))
      .join(", ");
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
          Hi {user?.firstName || "there"} 👋, here's your IPL progress
        </Text>
        <View style={styles.deviceInfo}>
          <Image
            source={{
              uri:
                productData?.images?.[0]?.url ||
                "https://via.placeholder.com/50",
            }}
            style={styles.deviceIcon}
          />
          <Text style={styles.deviceText}>
            {productData?.title || "IPL Device"}
          </Text>
        </View>
      </View>

      {/* Enhanced Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>
            {sessionHistory.length || 0}
          </Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>
            {iplProfile?.currentPhase?.charAt(0).toUpperCase() +
              iplProfile?.currentPhase?.slice(1) || "Weekly"}
          </Text>
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
            {formatTreatmentAreas() || "Face, Legs"}
          </Text>
          <Text style={styles.statLabel}>Treatment Areas</Text>
        </View>
      </View>

      {/* Profile Info Card */}
      {iplProfile && (
        <View style={styles.profileInfoCard}>
          <Text style={styles.profileInfoTitle}>Your Profile</Text>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Skin Tone:</Text>
            <Text style={styles.profileInfoValue}>
              {iplProfile.skinTone.charAt(0).toUpperCase() +
                iplProfile.skinTone.slice(1)}
            </Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Hair Type:</Text>
            <Text style={styles.profileInfoValue}>
              {iplProfile.hairType.charAt(0).toUpperCase() +
                iplProfile.hairType.slice(1)}
            </Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Start Date:</Text>
            <Text style={styles.profileInfoValue}>
              {new Date(iplProfile.startDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

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

      {/* Session History */}
      {showHistory && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {sessionHistory.length > 0 ? (
            sessionHistory.map((session) => (
              <View key={session.id} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>
                    {new Date(session.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyArea}>
                    {session.bodyArea || session.area}
                  </Text>
                  <Text style={styles.historyIntensity}>
                    Intensity {session.intensityLevel || session.intensity}
                  </Text>
                  <Text style={styles.historyDuration}>{session.duration}</Text>
                  {session.notes && (
                    <Text style={styles.historyNotes}>{session.notes}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No sessions recorded yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Start logging your IPL sessions to track your progress
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push("/ipl-settings")}
      >
        <Text style={styles.settingsButtonText}>⚙️ Edit IPL Details</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Loading / Error / Redirecting UI
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your IPL profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error loading profile: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!iplProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirecting to onboarding...</Text>
      </View>
    );
  }

  return activeTab === "tracker" ? (
    renderTrackerPage()
  ) : (
    <AddSessionSection
      isSessionActive={isSessionActive}
      currentSession={currentSession}
      sessionTimer={sessionTimer}
      formatTime={formatTime}
      stopSession={stopSession}
      startSession={startSession}
      getTreatmentAreas={getTreatmentAreas}
      iplProfile={iplProfile}
      setActiveTab={setActiveTab}
    />
  );
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
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-Bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  profileInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileInfoTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: 15,
  },
  profileInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  profileInfoLabel: {
    fontSize: 14,
    color: "#666",
  },
  profileInfoValue: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Outfit-Medium",
  },
  progressSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-SemiBold",
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
    borderRadius: 4,
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
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-Medium",
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
    fontFamily: "Outfit-SemiBold",
    color: "#2c2a6b",
  },
  historyDetails: {
    flex: 1,
  },
  historyArea: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
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
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
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
});

export default IPLSessionTracker;
