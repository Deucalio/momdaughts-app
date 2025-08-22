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
import { fetchDevices } from "../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../utils/authStore";
const { width, height } = Dimensions.get("window");
import { useRouter } from "expo-router";
import { createIPLProfile } from "../utils/actions";
import { updateUserMetaData } from "../utils/storage";

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
  const [activeTab, setActiveTab] = useState(
    user?.metaData?.ipl_onboarding_completed ? "tracker" : "onboarding"
  );
  console.log("activeTab:", activeTab);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    device: {},
    skinTone: "",
    hairType: "",
    treatmentAreas: [],
    frequency: "",
  });
  const [devices, setDevices] = useState([]);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const { user, syncUserMetaData } = useAuthStore();

  useEffect(() => {
    if (user?.metaData?.ipl_onboarding_completed) {
      console.log("user?.metaData?.ipl_onboarding_completed:", user?.metaData?.ipl_onboarding_completed);
      setActiveTab("tracker");
    }
  }, [user?.metaData?.ipl_onboarding_completed]);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState(mockSessionHistory);
  const [showHistory, setShowHistory] = useState(false);
  const isContinueDisabled =
    (onboardingStep === 0 && !onboardingData.device?.title) ||
    (onboardingStep === 1 &&
      (!onboardingData.skinTone ||
        !onboardingData.hairType ||
        onboardingData.treatmentAreas.length === 0)) ||
    (onboardingStep === 2 && !onboardingData.frequency);
  useEffect(() => {
    console.log("Onboarding data changed:", onboardingData);
  }, [onboardingData]);

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

  useEffect(() => {
    const fetchDevicesData = async () => {
      const devicesData = await fetchDevices(authenticatedFetch);

      // Move the  "id": "gid://shopify/Product/9937795809572", to top
      if (devicesData && devicesData.length > 0) {
        const sortedDevices = devicesData.sort((a, b) => {
          if (a.id === "gid://shopify/Product/9937795809572") return -1; // Move this device to the top
          return 0; // Keep the rest in original order
        });
        setDevices(sortedDevices);
      }
    };
    fetchDevicesData();
  }, []);

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

  const renderOnboardingStep = () => {
    switch (onboardingStep) {
      case 0:
        return renderDeviceSelection();
      case 1:
        return renderCustomizePlan();
      case 2:
        return renderSetReminders();
      default:
        return renderDeviceSelection();
    }
  };

  const renderDeviceSelection = () => (
    <View style={styles.onboardingContainer}>
      <View style={styles.onboardingHeader}>
        <Text style={styles.onboardingTitle}>Choose Your Device</Text>
        <Text style={styles.onboardingSubtitle}>
          Select your IPL device model for personalized settings
        </Text>
      </View>
      <ScrollView
        style={styles.deviceList}
        showsVerticalScrollIndicator={false}
      >
        {devices.map((device, index) => (
          <TouchableOpacity
            key={device.id}
            style={[
              styles.deviceCard,
              onboardingData.device === device.title &&
                styles.deviceCardSelected,
            ]}
            onPress={() =>
              setOnboardingData({ ...onboardingData, device: { ...device } })
            }
          >
            {/* Use the first image from the API data */}
            {device.images && device.images.length > 0 ? (
              <Image
                source={{ uri: device.images[0].originalSrc }}
                style={styles.deviceImagePlaceholder}
              />
            ) : (
              <View style={styles.deviceImagePlaceholder}>
                <Text style={styles.deviceImageText}>📱</Text>
              </View>
            )}

            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName} ellipsizeMode="tail">
                {device.title}
              </Text>
              {/* You can add logic here to determine popular devices */}
              {index === 0 && (
                <Text style={styles.popularBadge}>Most Popular</Text>
              )}
            </View>

            <View style={styles.deviceSelector}>
              {onboardingData.device.title === device.title && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {renderOnboardingNavigation()}
    </View>
  );

  const renderCustomizePlan = () => (
    <View style={styles.onboardingContainer}>
      <View style={styles.onboardingHeader}>
        <Text style={styles.onboardingTitle}>Customize Your Plan</Text>
        <Text style={styles.onboardingSubtitle}>
          Help us create a safe and effective treatment plan
        </Text>
      </View>

      <ScrollView
        style={styles.customizeContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Skin Tone Selection */}
        <View style={styles.selectionSection}>
          <Text style={styles.selectionTitle}>Select Your Skin Tone</Text>
          <View style={styles.skinToneGrid}>
            {[
              { tone: "Very Light", color: "#F7E7CE", safe: true },
              { tone: "Light", color: "#F0D5A8", safe: true },
              { tone: "Medium", color: "#E8C4A0", safe: true },
              { tone: "Olive", color: "#D4A574", safe: false },
              { tone: "Brown", color: "#C19A6B", safe: false },
              { tone: "Dark", color: "#8B4513", safe: false },
            ].map((skin, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.skinToneCard,
                  { backgroundColor: skin.color },
                  onboardingData.skinTone === skin.tone &&
                    styles.skinToneSelected,
                  !skin.safe && styles.skinToneUnsafe,
                ]}
                onPress={() =>
                  setOnboardingData({ ...onboardingData, skinTone: skin.tone })
                }
              >
                <Text style={styles.skinToneText}>{skin.tone}</Text>
                {!skin.safe && <Text style={styles.warningIcon}>⚠️</Text>}
                {onboardingData.skinTone === skin.tone && (
                  <Text style={styles.skinCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hair Type Selection */}
        <View style={styles.selectionSection}>
          <Text style={styles.selectionTitle}>Select Your Hair Type</Text>
          <View style={styles.hairTypeGrid}>
            {[
              { type: "Blonde", icon: "👱‍♀️", effective: false },
              { type: "Light Brown", icon: "👩‍🦳", effective: true },
              { type: "Dark Brown", icon: "👩‍🦱", effective: true },
              { type: "Black", icon: "👩‍🦲", effective: true },
            ].map((hair, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.hairTypeCard,
                  { backgroundColor: "#FFFFFF" },
                  onboardingData.hairType === hair.type &&
                    styles.hairTypeSelected,
                  !hair.effective && styles.hairTypeIneffective,
                ]}
                onPress={() => {
                  const area =
                    onboardingData.hairType === hair.type ? "" : hair.type;
                  setOnboardingData({ ...onboardingData, hairType: area });
                }}
              >
                <Text style={styles.hairIcon}>{hair.icon}</Text>
                <Text style={styles.hairTypeText}>{hair.type}</Text>
                {!hair.effective && <Text style={styles.warningIcon}>⚠️</Text>}
                {onboardingData.hairType === hair.type && (
                  <Text style={styles.hairCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Treatment Areas */}
        <View style={styles.selectionSection}>
          <Text style={styles.selectionTitle}>Select Treatment Areas</Text>
          <View style={styles.treatmentGrid}>
            {[
              { area: "Face", icon: "👤" },
              { area: "Underarms", icon: "💪" },
              { area: "Legs", icon: "🦵" },
              { area: "Bikini", icon: "👙" },
              { area: "Arms", icon: "💪" },
              { area: "Back", icon: "🫸" },
            ].map((treatment, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.treatmentCard,
                  { backgroundColor: "#FFFFFF" },
                  onboardingData.treatmentAreas.includes(treatment.area) &&
                    styles.treatmentSelected,
                ]}
                onPress={() => {
                  const areas = onboardingData.treatmentAreas.includes(
                    treatment.area
                  )
                    ? onboardingData.treatmentAreas.filter(
                        (a) => a !== treatment.area
                      )
                    : [...onboardingData.treatmentAreas, treatment.area];
                  setOnboardingData({
                    ...onboardingData,
                    treatmentAreas: areas,
                  });
                }}
              >
                <Text style={styles.treatmentIcon}>{treatment.icon}</Text>
                <Text style={styles.treatmentText}>{treatment.area}</Text>
                {onboardingData.treatmentAreas.includes(treatment.area) && (
                  <Text style={styles.treatmentCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {renderOnboardingNavigation()}
    </View>
  );

  const renderSetReminders = () => (
    <View style={styles.onboardingContainer}>
      <View style={styles.onboardingHeader}>
        <Text style={styles.onboardingTitle}>Set Reminders</Text>
        <Text style={styles.onboardingSubtitle}>
          Choose your session frequency for optimal results
        </Text>
      </View>

      <View style={styles.frequencyContent}>
        {[
          {
            frequency: "1 Week",
            description: "Intensive treatment for faster results",
            recommended: false,
            icon: "⚡",
          },
          {
            frequency: "2 Weeks",
            description: "Recommended frequency for most skin types",
            recommended: true,
            icon: "⭐",
          },
        ].map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.frequencyCard,
              { backgroundColor: "#FFFFFF" },
              onboardingData.frequency === option.frequency &&
                styles.frequencySelected,
              option.recommended && styles.frequencyRecommended,
            ]}
            onPress={async () => {
              setOnboardingData({
                ...onboardingData,
                frequency: option.frequency,
              });
              const newUserMetaData = {
                ...user.metaData,
                ipl_onboarding_completed: true,
              };
              const profileData = await createIPLProfile(authenticatedFetch, {
                onboardingData,
                newUserMetaData,
              });
              await syncUserMetaData(user.id, newUserMetaData);
            }}
          >
            <View style={styles.frequencyHeader}>
              <Text style={styles.frequencyIcon}>{option.icon}</Text>
              <Text style={styles.frequencyTitle}>{option.frequency}</Text>
              {option.recommended && (
                <Text style={styles.recommendedBadge}>Recommended</Text>
              )}
            </View>
            <Text style={styles.frequencyDescription}>
              {option.description}
            </Text>
            {onboardingData.frequency === option.frequency && (
              <Text style={styles.frequencyCheckmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {renderOnboardingNavigation()}
    </View>
  );

  const renderOnboardingNavigation = () => (
    <View style={styles.onboardingNavigation}>
      <View style={styles.progressDots}>
        {[0, 1, 2].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              step === onboardingStep && styles.progressDotActive,
              step < onboardingStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.backNavButton]}
          onPress={() => {
            if (onboardingStep > 0) {
              setOnboardingStep(onboardingStep - 1);
            } else {
              router.back();
            }
          }}
        >
          <Text style={[styles.navButtonText]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.continueNavButton,
            isContinueDisabled && { opacity: 0.5, pointerEvents: "none" },
          ]}
          disabled={isContinueDisabled}
          onPress={() => {
            if (onboardingStep < 2) {
              setOnboardingStep(onboardingStep + 1);
            } else {
              setActiveTab("tracker");
            }
          }}
        >
          <Text style={styles.continueButtonText}>
            {onboardingStep === 2 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTrackerPage = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Personalized Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>
          Hi Aryan 👋, here's your IPL progress
        </Text>
        <View style={styles.deviceInfo}>
          <Image
            source={{
              uri:
                onboardingData.device.images?.[0]?.originalSrc ||
                "https://via.placeholder.com/50",
            }}
            style={styles.deviceIcon}
          />
          <Text style={styles.deviceText}>{onboardingData.device.title}</Text>
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
          <Text style={styles.statValue}>Face, Legs</Text>
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
      <TouchableOpacity style={styles.settingsButton}>
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

  if (activeTab === "onboarding") {
    return renderOnboardingStep();
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
  menuButtonText: {
    fontSize: 18,
    color: "#333",
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
  addButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 30,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  inputPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  inputArrow: {
    fontSize: 16,
    color: "#666",
  },
  notesField: {
    height: 80,
    alignItems: "flex-start",
  },
  sliderContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  slider: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 10,
    position: "relative",
  },
  sliderTrack: {
    height: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
  },
  sliderFill: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#2c2a6b",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: "#2c2a6b",
    borderRadius: 10,
    top: -7,
    marginLeft: -10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderValue: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
  },
  onboardingHeader: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  deviceList: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  deviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(15),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  deviceCardSelected: {
    borderColor: "#e99ebf",
    backgroundColor: "#ffffff",
  },
  deviceImagePlaceholder: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: "#F0F0F0",
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginRight: moderateScale(15),
  },
  deviceImageText: {
    fontSize: moderateScale(24),
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(4),
  },
  deviceModel: {
    fontSize: moderateScale(14),
    color: "#666",
    marginBottom: verticalScale(4),
  },
  popularBadge: {
    fontSize: moderateScale(12),
    color: "#2c2a6b",
    fontWeight: "600",
  },
  deviceSelector: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: moderateScale(16),
    color: "#2c2a6b",
    fontWeight: "700",
  },
  customizeContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  selectionSection: {
    marginBottom: 30,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  skinToneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skinToneCard: {
    width: (width - 60) / 3,
    height: 80,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  skinToneSelected: {
    borderColor: "#e99ebf",
  },
  skinToneUnsafe: {
    opacity: 0.6,
  },
  skinToneText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  warningIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    fontSize: 12,
  },
  skinCheckmark: {
    position: "absolute",
    top: 5,
    right: 5,
    fontSize: 14,
    color: "#2c2a6b",
    fontWeight: "700",
  },
  hairTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  hairTypeCard: {
    width: (width - 60) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  hairTypeSelected: {
    borderColor: "#e99ebf",
    backgroundColor: "#F8F4FF",
  },
  hairTypeIneffective: {
    opacity: 0.6,
  },
  hairIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  hairTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  hairCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    fontSize: 14,
    color: "#2c2a6b",
    fontWeight: "700",
  },
  treatmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  treatmentCard: {
    width: (width - 60) / 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  treatmentSelected: {
    borderColor: "#e99ebf",
    backgroundColor: "#ffffff",
  },
  treatmentIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  treatmentCheckmark: {
    position: "absolute",
    top: 5,
    right: 5,
    fontSize: 12,
    color: "#2c2a6b",
    fontWeight: "700",
  },
  frequencyContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  frequencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  frequencySelected: {
    borderColor: "#e99ebf",
    backgroundColor: "#F8F4FF",
  },
  frequencyRecommended: {},
  frequencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  frequencyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  frequencyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  recommendedBadge: {
    fontSize: 12,
    color: "#2c2a6b",
    fontWeight: "600",
    backgroundColor: "#F8F4FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  frequencyDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  frequencyCheckmark: {
    position: "absolute",
    top: 15,
    right: 15,
    fontSize: 18,
    color: "#2c2a6b",
    fontWeight: "700",
  },
  onboardingNavigation: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: "#2c2a6b",
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: "#2c2a6b",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 8,
  },
  backNavButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  continueNavButton: {
    backgroundColor: "#2c2a6b",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  navButtonTextDisabled: {
    color: "#CCC",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
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
    flex: 1,
    flexDirection: "column",
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
