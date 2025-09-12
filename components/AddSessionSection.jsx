// File: AddSessionSection.js
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../components/Text";
const AddSessionSection = ({
  isSessionActive,
  currentSession,
  sessionTimer,
  formatTime,
  stopSession,
  startSession,
  getTreatmentAreas,
  iplProfile,
  setActiveTab,
  updateSessionIntensity, // Added prop for updating intensity during session
}) => {
  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedIntensity, setSelectedIntensity] = useState(null)

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

        <View style={styles.intensitySection}>
          <Text style={styles.intensityLabel}>Intensity Level</Text>
          <View style={styles.intensitySelector}>
            {[currentSession.intensity].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.intensityButton, currentSession?.intensity === level && styles.intensityButtonActive]}
                onPress={() => updateSessionIntensity && updateSessionIntensity(level)}
              >
                <Text
                  style={[
                    styles.intensityButtonText,
                    currentSession?.intensity === level && styles.intensityButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.intensityDescription}>
            {currentSession?.intensity <= 3 && "Gentle - Perfect for sensitive areas"}
            {currentSession?.intensity >= 4 && currentSession?.intensity <= 6 && "Medium - Balanced effectiveness"}
            {currentSession?.intensity >= 7 && "Strong - Maximum effectiveness"}
          </Text>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.sessionDetailRow}>
            <Text style={styles.sessionDetailLabel}>Treatment Area</Text>
            <Text style={styles.sessionDetailValue}>{currentSession?.area}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
          <Text style={styles.stopButtonText}>Complete Session</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const treatmentAreas = getTreatmentAreas()
  const allAreas = treatmentAreas.length > 0 ? treatmentAreas : ["face", "legs", "arms", "underarms"]

  const handleStartSession = () => {
    if (selectedArea && selectedIntensity) {
      startSession({
        area: selectedArea.charAt(0).toUpperCase() + selectedArea.slice(1),
        intensity: selectedIntensity,
        notes: "",
      })
      // Reset selections after starting
      setSelectedArea(null)
      setSelectedIntensity(null)
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab("tracker")}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Session</Text>
        <View style={styles.menuButton} />
      </View>

      {/* Progress Bar (duplicated locally for the Add Session view) */}
      <View style={styles.progressSectionLocal}>
        <Text style={styles.sectionTitleLocal}>Progress</Text>
        <View style={styles.progressCardLocal}>
          <Text style={styles.progressTextLocal}>
            You've completed {iplProfile?.sessions?.length || 0}/12 recommended sessions
          </Text>
          <View style={styles.progressBarContainerLocal}>
            <View style={styles.progressBarLocal}>
              <View
                style={[
                  styles.progressFillLocal,
                  {
                    width: `${Math.min(((iplProfile?.sessions?.length || 0) / 12) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Treatment Area Selection */}
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitleLocal}>Select Treatment Area</Text>
        <View style={styles.areaGrid}>
          {allAreas.map((area) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.areaCard,
                selectedArea === area && styles.areaCardSelected
              ]}
              onPress={() => setSelectedArea(area)}
            >
              <Text style={[
                styles.areaCardText,
                selectedArea === area && styles.areaCardTextSelected
              ]}>
                {area.charAt(0).toUpperCase() + area.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Intensity Selection */}
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitleLocal}>Select Intensity Level</Text>
        <View style={styles.intensityGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.intensityCard,
                selectedIntensity === level && styles.intensityCardSelected
              ]}
              onPress={() => setSelectedIntensity(level)}
            >
              <Text style={[
                styles.intensityCardNumber,
                selectedIntensity === level && styles.intensityCardNumberSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {selectedIntensity && (
          <Text style={styles.intensityDescriptionStatic}>
            {selectedIntensity <= 3 && "Gentle - Perfect for sensitive areas"}
            {selectedIntensity >= 4 && selectedIntensity <= 6 && "Medium - Balanced effectiveness"}
            {selectedIntensity >= 7 && "Strong - Maximum effectiveness"}
          </Text>
        )}
      </View>

      {/* Start Session Button */}
      <TouchableOpacity 
        style={[
          styles.startSessionButton,
          (!selectedArea || !selectedIntensity) && styles.startSessionButtonDisabled
        ]}
        onPress={handleStartSession}
        disabled={!selectedArea || !selectedIntensity}
      >
        <Text style={[
          styles.startSessionButtonText,
          (!selectedArea || !selectedIntensity) && styles.startSessionButtonTextDisabled
        ]}>
          {!selectedArea ? "Select Treatment Area" : 
           !selectedIntensity ? "Select Intensity Level" : 
           `Start ${selectedArea.charAt(0).toUpperCase() + selectedArea.slice(1)} Session`}
        </Text>
      </TouchableOpacity>

      {/* Custom Session Button */}
      <TouchableOpacity style={styles.customSessionButton}>
        <Text style={styles.customSessionButtonText}>+ Create Custom Session</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default AddSessionSection

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
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
    fontFamily: "Outfit-SemiBold",
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

  /* Local progress styles (duplicated) */
  progressSectionLocal: {
    marginBottom: 30,
  },
  sectionTitleLocal: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
    marginBottom: 15,
  },
  progressCardLocal: {
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
  progressTextLocal: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  progressBarContainerLocal: {
    marginBottom: 10,
  },
  progressBarLocal: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFillLocal: {
    height: "100%",
    backgroundColor: "#2c2a6b",
    borderRadius: 4,
  },

  /* Selection sections */
  selectionSection: {
    marginBottom: 30,
  },
  
  /* Area selection styles */
  areaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  areaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: "45%",
    alignItems: "center",
  },
  areaCardSelected: {
    borderColor: "#2c2a6b",
    backgroundColor: "#F7FAFC",
  },
  areaCardText: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#333",
  },
  areaCardTextSelected: {
    color: "#2c2a6b",
    fontFamily: "Outfit-SemiBold",
  },

  /* Intensity selection styles */
  intensityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  intensityCard: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  intensityCardSelected: {
    borderColor: "#2c2a6b",
    backgroundColor: "#2c2a6b",
  },
  intensityCardNumber: {
    fontSize: 20,
    fontFamily: "Outfit-SemiBold",
    color: "#333",
  },
  intensityCardNumberSelected: {
    color: "#FFFFFF",
  },
  intensityDescriptionStatic: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 12,
  },

  /* Start session button */
  startSessionButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startSessionButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  startSessionButtonText: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#FFFFFF",
  },
  startSessionButtonTextDisabled: {
    color: "#9CA3AF",
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
    fontFamily: "Outfit-Medium",
    color: "#2c2a6b",
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
    marginBottom: 40, // Reduced margin for better spacing
  },
  sessionTitle: {
    fontSize: 24,
    fontFamily: "Outfit-SemiBold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  sessionArea: {
    fontSize: 18,
    color: "#E2E8F0",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 40, // Reduced margin for intensity section
  },
  timerText: {
    fontSize: 72,
    fontFamily: "Outfit-Light",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 16,
    color: "#E2E8F0",
  },

  intensitySection: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  intensityLabel: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  intensitySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  intensityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  intensityButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  intensityButtonText: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#FFFFFF",
  },
  intensityButtonTextActive: {
    color: "#2c2a6b",
  },
  intensityDescription: {
    fontSize: 14,
    color: "#E2E8F0",
    textAlign: "center",
    fontStyle: "italic",
  },

  sessionDetails: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  sessionDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    marginBottom: 8,
  },
  sessionDetailLabel: {
    fontSize: 16,
    color: "#E2E8F0",
  },
  sessionDetailValue: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#FFFFFF",
  },

  stopButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stopButtonText: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#2c2a6b",
  },
})