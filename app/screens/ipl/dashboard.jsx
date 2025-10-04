import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
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
const BACKEND_URL = "https://16c663724b7c.ngrok-free.app";

const TREATMENT_AREAS = [
  { area: "Face", icon: "👤" },
  { area: "Underarms", icon: "💪" },
  { area: "Legs", icon: "🦵" },
  { area: "Bikini", icon: "👙" },
  { area: "Arms", icon: "💪" },
  { area: "Back", icon: "🫸" },
];

const IPLSessionTracker = () => {
  const [activeTab, setActiveTab] = useState("tracker");
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const { user, syncUserMetaData } = useAuthStore();

  // Add this state after your existing state declarations
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);

  // Add this function after formatTime function
  const formatPakistaniTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      timeZone: "Asia/Karachi",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // State for API data
  const [iplProfile, setIplProfile] = useState(null);
  const [productData, setProductData] = useState(null);
  const [monthCounts, setMonthCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [isStopped, setIsStopped] = useState(false);

  // Session management
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);

  // Add these new state variables after your existing state declarations
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [selectedAreaData, setSelectedAreaData] = useState(null);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [showTreatmentAreasModal, setShowTreatmentAreasModal] = useState(false);
  const [tempTreatmentAreas, setTempTreatmentAreas] = useState({});

  // New state for area-based data
  const [areaSessionData, setAreaSessionData] = useState({});
  const [nextSessionDue, setNextSessionDue] = useState(null);

  const params = useLocalSearchParams();
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileResponse = await fetchIPLProfile(authenticatedFetch);
      console.log("Fetched IPL Profile:", profileResponse);
      if (profileResponse?.iplProfile) {
        setIplProfile(profileResponse.iplProfile);
        setMonthCounts(profileResponse.monthCounts || []);

        // Calculate next session due
        const latestSession = profileResponse.iplProfile.sessions
          ? profileResponse.iplProfile.sessions[
              profileResponse.iplProfile.sessions.length - 1
            ]
          : null;
        if (latestSession) {
          const latestSessionDate = new Date(latestSession.date);
          const currentDate = new Date();
          const diffInTime =
            currentDate.getTime() - latestSessionDate.getTime();
          const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
          let nextSessionInDays;

          const phase =
            profileResponse.iplProfile.currentPhase?.toLowerCase() || "weekly";

          switch (phase) {
            case "biweekly":
              nextSessionInDays = Math.max(0, 14 - diffInDays);
              break;
            case "monthly":
              nextSessionInDays = Math.max(0, 30 - diffInDays);
              break;
            default: // weekly
              nextSessionInDays = Math.max(0, 7 - diffInDays);
              break;
          }
          setNextSessionDue(nextSessionInDays);
        } else {
          setNextSessionDue(0); // First session due now
        }
        setSessionHistory(profileResponse.iplProfile.sessions || []);
        // With:
        const treatmentAreas = Object.keys(
          profileResponse.iplProfile.treatmentAreas || {}
        ).filter((area) => profileResponse.iplProfile.treatmentAreas[area]);
        processAreaSessionData(
          profileResponse.iplProfile.sessions || [],
          treatmentAreas
        );
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
            console.log("Fetched Product Data:", productResponse.product);
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
  // Fetch IPL profile and product data
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Process sessions by treatment area
  // Process sessions by treatment area
  const processAreaSessionData = (sessions, treatmentAreas = null) => {
    const areaData = {};
    // Use passed treatmentAreas or derive from iplProfile
    const areas =
      treatmentAreas ||
      (iplProfile?.treatmentAreas
        ? Object.keys(iplProfile.treatmentAreas).filter(
            (area) => iplProfile.treatmentAreas[area]
          )
        : []);

    // Initialize all treatment areas
    areas.forEach((area) => {
      areaData[area] = {
        totalSessions: 0,
        lastSession: null,
        monthlyData: {},
      };
    });

    // Process each session
    sessions.forEach((session) => {
      const area =
        session.bodyArea.toLowerCase() || session.area?.toLowerCase();
      const sessionDate = new Date(session.createdAt || session.date);
      const monthKey = sessionDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (areaData[area]) {
        areaData[area].totalSessions += 1;
        areaData[area].lastSession = sessionDate;

        if (!areaData[area].monthlyData[monthKey]) {
          areaData[area].monthlyData[monthKey] = 0;
        }
        areaData[area].monthlyData[monthKey] += 1;
      }
    });

    setAreaSessionData(areaData);
  };

  // Session timer effect
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

  const getAreaNextSessionMessage = (area) => {
    const areaData = areaSessionData[area];
    if (!areaData || !areaData.lastSession) return "Due now";

    const lastSessionDate = areaData.lastSession;
    const currentDate = new Date();
    const diffInTime = currentDate.getTime() - lastSessionDate.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

    const phase = iplProfile?.currentPhase?.toLowerCase() || "weekly";
    let nextSessionInDays;

    switch (phase) {
      case "biweekly":
        nextSessionInDays = Math.max(0, 14 - diffInDays);
        break;
      case "monthly":
        nextSessionInDays = Math.max(0, 30 - diffInDays);
        break;
      default: // weekly
        nextSessionInDays = Math.max(0, 7 - diffInDays);
        break;
    }

    if (nextSessionInDays === 0) return "Due today";
    if (nextSessionInDays === 1) return "Due tomorrow";
    return `Due in ${nextSessionInDays} days`;
  };


  const handleUpdateTreatmentAreas = async () => {
  try {
    setIsStopped(true);

    const response = await authenticatedFetch(
      `${BACKEND_URL}/ipl/update-treatment-areas`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          iplProfileId: iplProfile.id,
          treatmentAreas: tempTreatmentAreas,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update treatment areas");
    }

    // Update local state
    setIplProfile({ ...iplProfile, treatmentAreas: tempTreatmentAreas });
    
    // Re-process area session data with new areas
    const newAreas = Object.keys(tempTreatmentAreas).filter(
      (area) => tempTreatmentAreas[area]
    );
    processAreaSessionData(sessionHistory, newAreas);
    
    setShowTreatmentAreasModal(false);
    setIsStopped(false);
  } catch (error) {
    console.error("Error updating treatment areas:", error);
    setIsStopped(false);
  }
};

  const stopSession = async () => {
    setSelectedArea(null);
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

      processAreaSessionData(
        [newSession, ...sessionHistory],
        getTreatmentAreas()
      );

      const sessionMonth = new Date().toLocaleDateString("en-US", {
        month: "short",
      });
      const updatedMonthCounts = [...monthCounts];
      const monthIndex = updatedMonthCounts.findIndex(
        (m) => m.month === sessionMonth
      );
      if (monthIndex !== -1) {
        updatedMonthCounts[monthIndex].sessions += 1;
      } else {
        // If month not found, add it (handles year change)
        updatedMonthCounts.push({ month: sessionMonth, sessions: 1 });
      }
      setMonthCounts(updatedMonthCounts);
    }
  };

  const getTreatmentAreas = () => {
    if (!iplProfile?.treatmentAreas) return [];
    return Object.keys(iplProfile.treatmentAreas).filter(
      (area) => iplProfile.treatmentAreas[area]
    );
  };

  const getNextSessionMessage = () => {
    if (nextSessionDue === null) return "Calculating...";
    if (nextSessionDue === 0) return "Due today";
    if (nextSessionDue === 1) return "Due tomorrow";
    return `Due in ${nextSessionDue} days`;
  };

  // Replace openAddSessionModal function
  const openAreaModal = (area) => {
    const areaData = areaSessionData[area] || {
      totalSessions: 0,
      lastSession: null,
      monthlyData: {},
    };
    setSelectedAreaData({ area, ...areaData });
    setShowAreaModal(true);
  };

  // Add this function before renderAreaCard
  const removeTreatmentArea = async (areaToRemove) => {
    const updatedAreas = { ...iplProfile.treatmentAreas };
    updatedAreas[areaToRemove.toLowerCase()] = false;

    // Update local state
    setIplProfile({ ...iplProfile, treatmentAreas: updatedAreas });

    // Optionally call API to update backend
    // await updateIPLProfile(authenticatedFetch, { treatmentAreas: updatedAreas });
  };


  const renderTreatmentAreasModal = () => {
  if (!showTreatmentAreasModal) return null;

  const selectedCount = Object.values(tempTreatmentAreas).filter(Boolean).length;

  return (
    <View style={styles.customModalOverlay}>
      <View style={styles.customModalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Treatment Areas</Text>
          <TouchableOpacity onPress={() => setShowTreatmentAreasModal(false)}>
            <Text style={styles.modalCloseButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.modalSubtitle}>
          Select the areas you want to treat ({selectedCount} selected)
        </Text>

        <ScrollView style={styles.treatmentAreasModalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.treatmentAreasGrid}>
            {TREATMENT_AREAS.map((treatment) => {
              const areaKey = treatment.area.toLowerCase();
              const isSelected = tempTreatmentAreas[areaKey] || false;
              const areaData = areaSessionData[areaKey] || { totalSessions: 0 };

              return (
                <TouchableOpacity
                  key={treatment.area}
                  style={[
                    styles.treatmentAreaModalCard,
                    isSelected && styles.treatmentAreaModalCardSelected,
                  ]}
                  onPress={() => {
                    setTempTreatmentAreas({
                      ...tempTreatmentAreas,
                      [areaKey]: !isSelected,
                    });
                  }}
                >
                  <Text style={styles.treatmentAreaModalIcon}>{treatment.icon}</Text>
                  <Text style={styles.treatmentAreaModalText}>{treatment.area}</Text>
                  {areaData.totalSessions > 0 && (
                    <Text style={styles.treatmentAreaSessionCount}>
                      {areaData.totalSessions} sessions
                    </Text>
                  )}
                  <View style={styles.treatmentAreaCheckContainer}>
                    {isSelected && (
                      <Text style={styles.treatmentAreaCheck}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.navButton, styles.backNavButton, { flex: 0.4 }]}
            onPress={() => setShowTreatmentAreasModal(false)}
          >
            <Text style={styles.navButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.continueNavButton,
              { flex: 0.6 },
              selectedCount === 0 && { opacity: 0.5 },
            ]}
            disabled={selectedCount === 0 || isStopped}
            onPress={handleUpdateTreatmentAreas}
          >
            <Text style={styles.continueButtonText}>
              Update Areas
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

  // Add this function before renderTrackerPage
  const renderLoadingSkeleton = () => (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonTextLarge} />
        <View style={styles.skeletonTextSmall} />
      </View>

      {/* Profile Card Skeleton */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTextMedium} />
          <View style={styles.skeletonTextSmall} />
          <View style={styles.skeletonTextSmall} />
        </View>
      </View>

      {/* Areas Grid Skeleton */}
      <View style={styles.skeletonSection}>
        <View style={styles.skeletonTextMedium} />
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonAreaCard} />
          ))}
        </View>
      </View>
    </View>
  );
  // Modify renderAreaCard to include a delete button
  const renderAreaCard = (area) => {
    const areaData = areaSessionData[area] || {
      totalSessions: 0,
      lastSession: null,
    };
    const capitalizedArea = area.charAt(0).toUpperCase() + area.slice(1);

    return (
      <View key={area} style={styles.compactAreaCard}>
        <TouchableOpacity
          style={styles.areaCardContent}
          // Update the TouchableOpacity onPress in renderAreaCard
          onPress={() => openAreaModal(area)}
        >
          <View style={styles.compactAreaHeader}>
            <Text style={styles.compactAreaTitle}>{capitalizedArea}</Text>
            <View style={styles.compactSessionBadge}>
              <Text style={styles.compactSessionBadgeText}>
                {areaData.totalSessions}
              </Text>
            </View>
          </View>

          <View style={styles.compactAreaInfo}>
            <Text style={styles.compactAreaLabel}>Last session</Text>
            <Text style={styles.compactAreaValue}>
              {areaData.lastSession
                ? areaData.lastSession.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "Never"}
            </Text>
          </View>

          <View style={styles.compactAreaInfo}>
            <Text style={styles.compactAreaLabel}>Next due</Text>
            <Text style={[styles.compactAreaValue, { fontSize: 11 }]}>
              {getAreaNextSessionMessage(area)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChartsSection = () => {
    const treatmentAreas = getTreatmentAreas();
    const totalSessions = sessionHistory.length;

    // Prepare chart data - last 6 months
    const chartData = monthCounts.slice(-6).map((month) => ({
      month: month.month,
      sessions: month.sessions,
    }));

    const maxSessions = Math.max(...chartData.map((d) => d.sessions), 1);

    return (
      <View style={styles.chartsSection}>
        {/* Overall Stats */}
        <View style={styles.overallStatsCard}>
          <Text style={styles.chartTitle}>Overall Statistics</Text>
          <View style={styles.overallStats}>
            <View style={styles.overallStat}>
              <Text style={styles.overallStatNumber}>{totalSessions}</Text>
              <Text style={styles.overallStatLabel}>Total Sessions</Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={styles.overallStatNumber}>
                {treatmentAreas.length}
              </Text>
              <Text style={styles.overallStatLabel}>Treatment Areas</Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={styles.overallStatNumber}>
                {iplProfile?.currentPhase?.charAt(0).toUpperCase() +
                  iplProfile?.currentPhase?.slice(1) || "Weekly"}
              </Text>
              <Text style={styles.overallStatLabel}>Current Phase</Text>
            </View>
          </View>

          {/* Custom Bar Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartSubtitle}>Sessions (Last 6 Months)</Text>
            <View style={styles.barChart}>
              {chartData.map((data, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height:
                            maxSessions > 0
                              ? (data.sessions / maxSessions) * 60
                              : 0,
                          backgroundColor:
                            data.sessions > 0 ? "#2c2a6b" : "#E5E7EB",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{data.month}</Text>
                  <Text style={styles.barValue}>{data.sessions}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };
  // Add these modals before the return statement, after the renderTrackerPage function

  // Area Detail Modal
  // Replace the entire renderAreaModal function
  const renderAreaModal = () => {
    if (!showAreaModal || !selectedAreaData) return null;

    const capitalizedArea =
      selectedAreaData.area.charAt(0).toUpperCase() +
      selectedAreaData.area.slice(1);
    const areaSessions = sessionHistory.filter(
      (session) =>
        session.bodyArea.toLowerCase() === selectedAreaData.area.toLowerCase()
    );

    // Area-specific information
    const getAreaInfo = (area) => {
      const areaInfoMap = {
        arms: {
          description:
            "Arms are ideal for IPL treatment due to their accessibility and hair density.",
          tips: [
            "Start with lower intensity",
            "Treat both upper and lower arms",
            "Allow 48-72 hours between sessions",
          ],
          effectiveness: "High - IPL works excellently on arm hair",
        },
        legs: {
          description:
            "Legs have the largest treatment area and typically show great results with IPL.",
          tips: [
            "Divide into sections (thigh, shin, calf)",
            "Shave 24 hours before treatment",
            "Moisturize after sessions",
          ],
          effectiveness: "Excellent - Large area with consistent results",
        },
        face: {
          description:
            "Facial hair requires careful treatment with appropriate intensity levels.",
          tips: [
            "Use lowest intensity initially",
            "Avoid eye area",
            "Test on small area first",
          ],
          effectiveness: "Good - Requires patience and consistency",
        },
        underarms: {
          description:
            "Underarms respond well to IPL due to coarse, dark hair in the area.",
          tips: [
            "Clean area thoroughly",
            "Use moderate intensity",
            "Apply cooling gel if needed",
          ],
          effectiveness: "Very High - Quick and effective results",
        },
        bikini: {
          description:
            "Bikini area requires gentle treatment due to sensitive skin.",
          tips: [
            "Start with low intensity",
            "Take breaks between areas",
            "Keep skin taut during treatment",
          ],
          effectiveness: "High - Sensitive area, gradual improvement",
        },
        back: {
          description:
            "Back treatment may require assistance for complete coverage.",
          tips: [
            "Use systematic approach",
            "Consider professional help",
            "Mark treated areas",
          ],
          effectiveness: "Good - May need assistance for full coverage",
        },
      };
      return (
        areaInfoMap[area.toLowerCase()] || {
          description: "This treatment area responds well to IPL therapy.",
          tips: [
            "Follow device instructions",
            "Start with lower intensity",
            "Be consistent with sessions",
          ],
          effectiveness: "Results vary by individual",
        }
      );
    };

    const areaInfo = getAreaInfo(selectedAreaData.area);

    return (
      <View style={styles.customModalOverlay}>
        <View style={styles.customModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{capitalizedArea} Treatment</Text>
            <TouchableOpacity onPress={() => setShowAreaModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Area Info */}
          <View style={styles.areaInfoSection}>
            <Text style={styles.areaInfoTitle}>About This Area</Text>
            <Text style={styles.areaInfoDescription}>
              {areaInfo.description}
            </Text>
            <Text style={styles.areaInfoEffectiveness}>
              {areaInfo.effectiveness}
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>Treatment Tips</Text>
            {areaInfo.tips.map((tip, index) => (
              <Text key={index} style={styles.tipItem}>
                • {tip}
              </Text>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.modalStats}>
            <View style={styles.modalStat}>
              <Text style={styles.modalStatNumber}>
                {selectedAreaData.totalSessions}
              </Text>
              <Text style={styles.modalStatLabel}>Sessions</Text>
            </View>
            <View style={styles.modalStat}>
              <Text style={styles.modalStatNumber}>
                {selectedAreaData.lastSession
                  ? selectedAreaData.lastSession.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Never"}
              </Text>
              <Text style={styles.modalStatLabel}>Last Session</Text>
            </View>
            <View style={styles.modalStat}>
              <Text style={styles.modalStatNumber}>
                {getAreaNextSessionMessage(selectedAreaData.area)}
              </Text>
              <Text style={styles.modalStatLabel}>Next Due</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalLogButton}
              onPress={() => {
                setShowAreaModal(false);
                setActiveTab("add-session");
                console.log("Logging session for area:", selectedAreaData.area);
                setSelectedArea(selectedAreaData.area);
              }}
            >
              <Text style={styles.modalLogButtonText}>Log Session</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.modalRemoveButton}
              onPress={() => {
                removeTreatmentArea(selectedAreaData.area);
                setShowAreaModal(false);
              }}
            >
              <Text style={styles.modalRemoveButtonText}>Remove Area</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    );
  };

  // Settings Modal
  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;

    return (
      <View style={styles.customModalOverlay}>
        <View style={styles.customModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingsOptions}>
            <TouchableOpacity
              style={styles.settingsOption}
              onPress={() => {
                setShowSettingsModal(false);
                router.push(
                  "/screens/ipl/onboard?mode=changeDevice&iplProfileId=" +
                    iplProfile.id
                );
              }}
            >
              <Text style={styles.settingsOptionText}>Change Device</Text>
              <Text style={styles.settingsOptionArrow}>›</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.settingsOption}
              onPress={() => {
                setShowSettingsModal(false);
                // Initialize temp areas with current selection
                const currentAreas = {};
                TREATMENT_AREAS.forEach(({ area }) => {
                  currentAreas[area.toLowerCase()] =
                    iplProfile?.treatmentAreas?.[area.toLowerCase()] || false;
                });
                setTempTreatmentAreas(currentAreas);
                setShowTreatmentAreasModal(true);
              }}
            >
              <Text style={styles.settingsOptionText}>
                Update Treatment Areas
              </Text>
              <Text style={styles.settingsOptionArrow}>›</Text>
            </TouchableOpacity> */}

            {/* <TouchableOpacity style={styles.settingsOption}>
            <Text style={styles.settingsOptionText}>Change Frequency</Text>
            <Text style={styles.settingsOptionArrow}>›</Text>
          </TouchableOpacity> */}

            <TouchableOpacity
              style={[styles.settingsOption, styles.dangerOption]}
            >
              <Text style={[styles.settingsOptionText, styles.dangerText]}>
                Reset All Sessions
              </Text>
              <Text style={styles.settingsOptionArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  const renderTrackerPage = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            Hi {user?.firstName || "there"} 👋
          </Text>
          <Text style={styles.headerSubtext}>Track your IPL progress</Text>
        </View>

        <TouchableOpacity
          style={styles.headerSettingsButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Text style={styles.headerSettingsText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Next Session Alert & Log Session Button */}
      {/* Profile Info & Log Session Button */}
      <View style={styles.sessionActionSection}>
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                productData?.images?.[0]?.url ||
                "https://via.placeholder.com/80",
            }}
            style={styles.profileDeviceImage}
          />
          <View style={styles.profileContent}>
            <Text style={styles.profileTitle}>
              {productData?.title || "Unknown Device"}
            </Text>
            <View style={styles.profileStats}>
              <Text style={styles.profileStatText}>
                Skin: {iplProfile?.skinTone || "Not set"}
              </Text>
              <Text style={styles.profileStatText}>
                Hair: {iplProfile?.hairType || "Not set"}
              </Text>
              <Text style={styles.profileStatText}>
                Phase:{" "}
                {iplProfile?.currentPhase?.charAt(0).toUpperCase() +
                  iplProfile?.currentPhase?.slice(1) || "Weekly"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logSessionButton}
          onPress={() => setActiveTab("add-session")}
        >
          <Text style={styles.logSessionButtonText}>Log Session</Text>
        </TouchableOpacity>
      </View>

      {/* Treatment Areas Grid */}
      <View style={styles.areasSection}>
        <Text style={styles.sectionTitle}>Treatment Areas</Text>
        <View style={styles.areasGrid}>
          {getTreatmentAreas().map((area) => renderAreaCard(area))}
        </View>
      </View>

      {/* Charts Section */}
      {renderChartsSection()}

      {/* Recent Sessions */}
      {/* Recent Sessions */}
      <View style={styles.recentSection}>
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowAllSessions(!showAllSessions)}
          >
            <Text style={styles.toggleButtonText}>
              {showAllSessions ? "Hide" : `View All (${sessionHistory.length})`}
            </Text>
          </TouchableOpacity>
        </View>
        {sessionHistory.length > 0 ? (
          (showAllSessions ? sessionHistory : sessionHistory.slice(0, 3)).map(
            (session, index) => (
              <View key={session.id || index} style={styles.recentItem}>
                <View style={styles.recentDate}>
                  <Text style={styles.recentDateText}>
                    {new Date(session.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.recentTimeText}>
                    {formatPakistaniTime(session.date)}
                  </Text>
                </View>
                <View style={styles.recentDetails}>
                  <Text style={styles.recentArea}>{session.bodyArea}</Text>
                  <Text style={styles.recentIntensity}>
                    Intensity: {session.intensityLevel}
                  </Text>
                </View>
                <View style={styles.recentDuration}>
                  <Text style={styles.recentDurationText}>Completed</Text>
                </View>
              </View>
            )
          )
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sessions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start your IPL journey by logging your first session
            </Text>
          </View>
        )}
      </View>

      {/* Settings */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push("/ipl-settings")}
      >
        <Text style={styles.settingsButtonText}>Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Loading / Error states
  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text style={styles.loadingText}>Loading your IPL profile...</Text>
  //     </View>
  //   );
  // }

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

  // if (!iplProfile) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text style={styles.loadingText}>Redirecting to onboarding...</Text>
  //     </View>
  //   );
  // }

return loading ? (
  renderLoadingSkeleton()
) : activeTab === "tracker" ? (
  <>
    {renderTrackerPage()}
    {renderAreaModal()}
    {renderSettingsModal()}
    {renderTreatmentAreasModal()}
  </>
) :(
    <AddSessionSection
      selectedArea={selectedArea}
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
    paddingTop: 50,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#333",
  },
  headerSubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  deviceInfo: {
    alignItems: "center",
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  sessionActionSection: {
    marginBottom: 30,
  },
  nextSessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextSessionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  nextSessionEmoji: {
    fontSize: 24,
  },
  nextSessionContent: {
    flex: 1,
  },
  nextSessionTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: 4,
  },
  nextSessionText: {
    fontSize: 14,
    color: "#666",
  },
  logSessionButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#2c2a6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logSessionButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Outfit-SemiBold",
  },
  areasSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    color: "#333",
    marginBottom: 16,
  },
  areasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  compactAreaCard: {
    width: (width - 54) / 2, // Account for padding and gap
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 0.9,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  compactAreaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  compactAreaTitle: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    color: "#333",
    flex: 1,
  },
  compactSessionBadge: {
    backgroundColor: "#F8F9FE",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E8EAFF",
  },
  compactSessionBadgeText: {
    color: "#2c2a6b",
    fontSize: 14,
    fontFamily: "Outfit-Bold",
  },
  compactAreaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  compactAreaLabel: {
    fontSize: 12,
    color: "#666",
  },
  compactAreaValue: {
    fontSize: 12,
    color: "#333",
    fontFamily: "Outfit-Medium",
  },
  chartsSection: {
    marginBottom: 30,
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: "#333",
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: "center",
  },
  overallStatsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overallStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  overallStat: {
    alignItems: "center",
  },
  overallStatNumber: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#2c2a6b",
    marginBottom: 4,
  },
  overallStatLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  recentSection: {
    marginBottom: 30,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0.92,
  },
  recentDate: {
    width: 50,
    marginRight: 16,
  },
  recentDateText: {
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
    color: "#2c2a6b",
  },
  recentDetails: {
    flex: 1,
  },
  recentArea: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: 2,
  },
  recentIntensity: {
    fontSize: 12,
    color: "#666",
  },
  recentDuration: {
    alignItems: "flex-end",
  },
  recentDurationText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Outfit-Medium",
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
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    alignItems: "center",
  },
  settingsButtonText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Outfit-Medium",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9, // Increased from 0.8
    minHeight: height * 0.6, // Add minimum height
    paddingTop: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1.14,
  },
  profileDeviceImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: "#333",
    marginBottom: 8,
  },
  profileStats: {
    gap: 4,
  },
  profileStatText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Outfit-Medium",
  },
  // Add to existing styles
  areaCardContent: {
    flex: 1,
  },
  chartSubtitle: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: "#666",
    marginTop: 16,
    marginBottom: 12,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 100,
    paddingHorizontal: 10,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
  },
  barContainer: {
    height: 60,
    justifyContent: "flex-end",
    alignItems: "center",
    width: 20,
  },
  bar: {
    width: 16,
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    fontFamily: "Outfit-Medium",
  },
  barValue: {
    fontSize: 10,
    color: "#333",
    marginTop: 2,
    fontFamily: "Outfit-SemiBold",
  }, // Add these new styles to your StyleSheet
  recentSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Outfit-Medium",
  },
  headerSettingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerSettingsText: {
    fontSize: 20,
  },
  customModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  customModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: height * 0.8,
    width: width - 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    color: "#333",
  },
  modalCloseButton: {
    fontSize: 24,
    color: "#666",
    padding: 4,
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  modalStat: {
    alignItems: "center",
  },
  modalStatNumber: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: "#2c2a6b",
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  modalActions: {
    gap: 12,
  },
  modalLogButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  modalLogButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
  },
  modalRemoveButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  modalRemoveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
  },
  settingsOptions: {
    gap: 1,
  },
  settingsOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingsOptionText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Outfit-Medium",
  },
  settingsOptionArrow: {
    fontSize: 18,
    color: "#999",
  },
  dangerOption: {
    borderBottomColor: "#FEE2E2",
  },
  dangerText: {
    color: "#DC2626",
  },
  // Add these styles to your StyleSheet
  recentTimeText: {
    fontSize: 10,
    color: "#999",
    fontFamily: "Outfit-Medium",
    marginTop: 2,
  },
  skeletonHeader: {
    marginBottom: 20,
  },
  skeletonTextLarge: {
    height: 28,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
    width: "60%",
  },
  skeletonTextMedium: {
    height: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
    width: "80%",
  },
  skeletonTextSmall: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 4,
    width: "40%",
  },
  skeletonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonImage: {
    width: 80,
    height: 80,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonSection: {
    marginBottom: 30,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  skeletonAreaCard: {
    width: (width - 54) / 2,
    height: 120,
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
  },
  areaInfoSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  areaInfoTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: 8,
  },
  areaInfoDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  areaInfoEffectiveness: {
    fontSize: 12,
    color: "#2c2a6b",
    fontFamily: "Outfit-Medium",
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalLogButton: {
    flex: 1,
    backgroundColor: "#2c2a6b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalRemoveButton: {
    paddingHorizontal: 16,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalSubtitle: {
  fontSize: 14,
  color: "#666",
  marginBottom: 20,
  textAlign: "center",
},
treatmentAreasModalContent: {
  maxHeight: height * 0.5,
  marginBottom: 20,
},
treatmentAreasGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 12,
},
treatmentAreaModalCard: {
  width: (width - 80) / 2,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 16,
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#E5E7EB",
  position: "relative",
  minHeight: 110,
},
treatmentAreaModalCardSelected: {
  borderColor: "#e99ebf",
  backgroundColor: "#F8F4FF",
},
treatmentAreaModalIcon: {
  fontSize: 28,
  marginBottom: 8,
},
treatmentAreaModalText: {
  fontSize: 14,
  fontFamily: "Outfit-SemiBold",
  color: "#333",
  textAlign: "center",
  marginBottom: 4,
},
treatmentAreaSessionCount: {
  fontSize: 11,
  color: "#666",
  fontFamily: "Outfit-Medium",
},
treatmentAreaCheckContainer: {
  position: "absolute",
  top: 8,
  right: 8,
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: "#e99ebf",
  alignItems: "center",
  justifyContent: "center",
},
treatmentAreaCheck: {
  fontSize: 12,
  color: "#FFFFFF",
  fontFamily: "Outfit-Bold",
},
});

export default IPLSessionTracker;
