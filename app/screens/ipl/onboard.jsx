"use client";

import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "../../../components/Text";
import { createIPLProfile, fetchDevices } from "../../utils/actions";
import { useAuthenticatedFetch, useAuthStore } from "../../utils/authStore";
import NavigationSpaceContainer from "../../../components/NavigationSpaceContainer";

const { width, height } = Dimensions.get("window");
const BACKEND_URL = "https://16c663724b7c.ngrok-free.app";

// Scaling functions
const scale = (size) => (width / 375) * size; // Base width: iPhone 11
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const IPLOnboarding = () => {
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    device: {},
    skinTone: "",
    hairType: "",
    treatmentAreas: [],
    frequency: "",
  });
  const [isChangeDeviceMode, setIsChangeDeviceMode] = useState(false);
  const [devices, setDevices] = useState([]);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const { user, syncUserMetaData } = useAuthStore();

  const isContinueDisabled =
    isStopped ||
    (onboardingStep === 0 && !onboardingData.device?.title) ||
    (!isChangeDeviceMode &&
      onboardingStep === 1 &&
      (!onboardingData.skinTone ||
        !onboardingData.hairType ||
        onboardingData.treatmentAreas.length === 0)) ||
    (!isChangeDeviceMode && onboardingStep === 2 && !onboardingData.frequency);
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
  useEffect(() => {
    fetchDevicesData();
  }, []);

  const params = useLocalSearchParams();

  useEffect(() => {
    // Check if we're in change device mode
    if (params.mode === "changeDevice") {
      setIsChangeDeviceMode(true);
    }

    fetchDevicesData();
  }, [params.mode]);

  const handleChangeDevice = async () => {
    try {
      setIsStopped(true);

      // Simulate PUT request to update device
      const response = await authenticatedFetch(
        `${BACKEND_URL}/ipl/update-device`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            iplProfileId: params.iplProfileId,
            newDeviceId: onboardingData.device.id,
            deviceTitle: onboardingData.device.title,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update device");
      }

      // Navigate back to dashboard
      router.back();
    } catch (error) {
      console.error("Error updating device:", error);
      setIsStopped(false);
    }
  };
  const handleCompleteOnboarding = async () => {
    try {
      setIsStopped(true);
      const newUserMetaData = {
        ...user.metaData,
        ipl_onboarding_completed: true,
      };

      const profileData = await createIPLProfile(authenticatedFetch, {
        onboardingData,
        newUserMetaData,
      });
      if (!profileData.success) {
        console.error("Failed to create IPL profile:", profileData.success);
        return;
      }
      try {
        await syncUserMetaData(user.id, newUserMetaData);
      } catch (e) {
        console.error("Failed to sync user meta data:", e);
        return 1;
      }

      // Navigate to tracker
      router.replace("/screens/ipl/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
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
        <Text style={styles.onboardingTitle}>Set Frequency</Text>
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
            onPress={() => {
              setOnboardingData({
                ...onboardingData,
                frequency: option.frequency,
              });
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
      {!isChangeDeviceMode && (
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
      )}

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.backNavButton]}
          onPress={() => {
            if (isChangeDeviceMode) {
              router.back();
            } else if (onboardingStep > 0) {
              setOnboardingStep(onboardingStep - 1);
            } else {
              router.back();
            }
          }}
        >
          <Text style={[styles.navButtonText]}>
            {isChangeDeviceMode ? "Cancel" : "Back"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.continueNavButton,
            isContinueDisabled && { opacity: 0.5, pointerEvents: "none" },
          ]}
          disabled={isContinueDisabled}
          onPress={() => {
            if (isChangeDeviceMode) {
              handleChangeDevice();
            } else if (onboardingStep < 2) {
              setOnboardingStep(onboardingStep + 1);
            } else {
              handleCompleteOnboarding();
            }
          }}
        >
          <Text style={styles.continueButtonText}>
            {isChangeDeviceMode
              ? "Update Device"
              : onboardingStep === 2
              ? "Get Started"
              : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

  return renderOnboardingStep();
};

const styles = StyleSheet.create({
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
    fontFamily: "Outfit-Bold",
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
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: verticalScale(4),
  },
  popularBadge: {
    fontSize: moderateScale(12),
    color: "#2c2a6b",
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-Bold",
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
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-Bold",
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
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    textAlign: "center",
  },
  hairCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    fontSize: 14,
    color: "#2c2a6b",
    fontFamily: "Outfit-Bold",
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
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    textAlign: "center",
  },
  treatmentCheckmark: {
    position: "absolute",
    top: 5,
    right: 5,
    fontSize: 12,
    color: "#2c2a6b",
    fontFamily: "Outfit-Bold",
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
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    flex: 1,
  },
  recommendedBadge: {
    fontSize: 12,
    color: "#2c2a6b",
    fontFamily: "Outfit-SemiBold",
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
    fontFamily: "Outfit-Bold",
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
    marginBottom: 16,
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
    fontFamily: "Outfit-SemiBold",
    color: "#666",
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#ffffff",
  },
});

export default IPLOnboarding;
