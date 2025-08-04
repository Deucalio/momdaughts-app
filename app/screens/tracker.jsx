"use client"
import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions, Modal } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function PeriodTrackerScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [symptoms, setSymptoms] = useState([])
  const [notes, setNotes] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showEditModal, setShowEditModal] = useState(false)
  const [flowLevel, setFlowLevel] = useState("")
  const [moodLevel, setMoodLevel] = useState("")

  // Enhanced symptom options with better icons and flow levels
  const symptomOptions = [
    { id: "cramps", label: "Cramps", icon: "flash", colors: ["#f87171", "#ef4444"] },
    { id: "bloating", label: "Bloating", icon: "ellipse", colors: ["#60a5fa", "#3b82f6"] },
    { id: "fatigue", label: "Fatigue", icon: "battery-dead", colors: ["#fbbf24", "#f59e0b"] },
    { id: "headache", label: "Headache", icon: "sad", colors: ["#a78bfa", "#8b5cf6"] },
    { id: "backache", label: "Back Pain", icon: "body", colors: ["#fb7185", "#f43f5e"] },
    { id: "tender", label: "Tender Breasts", icon: "heart", colors: ["#f472b6", "#ec4899"] },
  ]

  const moodOptions = [
    { id: "happy", label: "Happy", icon: "happy", color: "#10b981" },
    { id: "sad", label: "Sad", icon: "sad", color: "#6366f1" },
    { id: "angry", label: "Irritated", icon: "flame", color: "#ef4444" },
    { id: "anxious", label: "Anxious", icon: "alert-circle", color: "#f59e0b" },
    { id: "calm", label: "Calm", icon: "leaf", color: "#06b6d4" },
  ]

  const flowLevels = [
    { id: "light", label: "Light", dots: 1, color: "#fca5a5" },
    { id: "medium", label: "Medium", dots: 2, color: "#f87171" },
    { id: "heavy", label: "Heavy", dots: 3, color: "#ef4444" },
    { id: "very-heavy", label: "Very Heavy", dots: 4, color: "#dc2626" },
  ]

  const toggleSymptom = (symptomId) => {
    setSymptoms((prev) => (prev.includes(symptomId) ? prev.filter((s) => s !== symptomId) : [...prev, symptomId]))
  }

  // Enhanced calendar logic
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  // Mock data for demonstration
  const periodDays = [5, 6, 7, 8, 9] // Current period
  const predictedDays = [23, 24, 25, 26, 27] // Next predicted period
  const ovulationDays = [14, 15, 16] // Ovulation window
  const today = 12

  const getDayStyle = (day) => {
    if (!day) return styles.emptyDay
    
    if (periodDays.includes(day)) {
      return styles.periodDay
    }
    if (ovulationDays.includes(day)) {
      return styles.ovulationDay
    }
    if (predictedDays.includes(day)) {
      return styles.predictedDay
    }
    if (day === today) {
      return styles.todayDay
    }
    return styles.normalDay
  }

  const getDayTextStyle = (day) => {
    if (!day) return styles.emptyDayText
    
    if (periodDays.includes(day) || ovulationDays.includes(day) || day === today) {
      return styles.highlightedDayText
    }
    if (predictedDays.includes(day)) {
      return styles.predictedDayText
    }
    return styles.normalDayText
  }

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
  }

  const renderFlowDots = (level) => {
    const flowLevel = flowLevels.find(f => f.id === level)
    if (!flowLevel) return null

    return (
      <View style={styles.flowDots}>
        {Array.from({ length: 4 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.flowDot,
              {
                backgroundColor: i < flowLevel.dots ? flowLevel.color : '#f3f4f6',
              },
            ]}
          />
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#fdf2f8", "#fce7f3", "#f3e8ff"]} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Period Tracker</Text>
            <Text style={styles.heroSubtitle}>
              Track your cycle and understand your body better
            </Text>
          </View>
        </LinearGradient>

        {/* Summary Card */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <LinearGradient colors={["#fdf2f8", "#f3e8ff"]} style={styles.summaryGradient}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryMain}>
                  <Text style={styles.cycleDay}>Day 12</Text>
                  <Text style={styles.cyclePhase}>Follicular Phase</Text>
                </View>
                <View style={styles.nextPeriod}>
                  <Text style={styles.nextPeriodLabel}>Next Period</Text>
                  <Text style={styles.nextPeriodDate}>Mar 23</Text>
                </View>
              </View>
              
              <View style={styles.summaryStats}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>28</Text>
                  <Text style={styles.statLabel}>Cycle Length</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>5</Text>
                  <Text style={styles.statLabel}>Period Duration</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>11</Text>
                  <Text style={styles.statLabel}>Days Until</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.calendarHeader}>
              <Text style={styles.cardTitle}>
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Text>
              <View style={styles.calendarNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(-1)}>
                  <Ionicons name="chevron-back" size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth(1)}>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.weekDays}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                <Text key={index} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {generateCalendarDays().map((day, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.calendarDay, getDayStyle(day)]}
                  onPress={() => day && setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                >
                  <Text style={getDayTextStyle(day)}>
                    {day || ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
                <Text style={styles.legendText}>Period</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
                <Text style={styles.legendText}>Ovulation</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#f8b4cb" }]} />
                <Text style={styles.legendText}>Predicted</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Log Symptoms */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="add-circle" size={20} color="#ec4899" />
              <Text style={styles.cardTitle}>Log Today's Symptoms</Text>
            </View>

            {/* Flow Level */}
            <View style={styles.flowSection}>
              <Text style={styles.sectionTitle}>Flow Level</Text>
              <View style={styles.flowOptions}>
                {flowLevels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.flowOption,
                      flowLevel === level.id && styles.flowOptionSelected
                    ]}
                    onPress={() => setFlowLevel(level.id)}
                  >
                    {renderFlowDots(level.id)}
                    <Text style={styles.flowLabel}>{level.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mood */}
            <View style={styles.moodSection}>
              <Text style={styles.sectionTitle}>Mood</Text>
              <View style={styles.moodOptions}>
                {moodOptions.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodOption,
                      moodLevel === mood.id && styles.moodOptionSelected
                    ]}
                    onPress={() => setMoodLevel(mood.id)}
                  >
                    <Ionicons name={mood.icon} size={24} color={mood.color} />
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptoms */}
            <View style={styles.symptomsSection}>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              <View style={styles.symptomsGrid}>
                {symptomOptions.map((symptom) => {
                  const isSelected = symptoms.includes(symptom.id)
                  return (
                    <TouchableOpacity
                      key={symptom.id}
                      style={[styles.symptomCard, isSelected && styles.symptomCardSelected]}
                      onPress={() => toggleSymptom(symptom.id)}
                    >
                      <View style={[styles.symptomIcon, { backgroundColor: isSelected ? symptom.colors[0] : '#f3f4f6' }]}>
                        <Ionicons name={symptom.icon} size={20} color={isSelected ? "white" : "#6b7280"} />
                      </View>
                      <Text style={styles.symptomLabel}>{symptom.label}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="How are you feeling today?"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.saveButton}>
              <LinearGradient colors={["#ec4899", "#be185d"]} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowEditModal(true)}
      >
        <LinearGradient colors={["#ec4899", "#be185d"]} style={styles.fabGradient}>
          <Ionicons name="calendar" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Edit Period Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Period Date</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>Select your last period start date</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ec4899",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryMain: {
    flex: 1,
  },
  cycleDay: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 2,
  },
  cyclePhase: {
    fontSize: 14,
    color: "#6b7280",
  },
  nextPeriod: {
    alignItems: "flex-end",
  },
  nextPeriodLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  nextPeriodDate: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ec4899",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ec4899",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  calendarNav: {
    flexDirection: "row",
    gap: 4,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    width: (width - 72) / 7,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    marginBottom: 16,
  },
  calendarDay: {
    width: (width - 76) / 7,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  emptyDay: {
    backgroundColor: "transparent",
  },
  normalDay: {
    backgroundColor: "transparent",
  },
  periodDay: {
    backgroundColor: "#ef4444",
  },
  ovulationDay: {
    backgroundColor: "#10b981",
  },
  predictedDay: {
    backgroundColor: "#f8b4cb",
  },
  todayDay: {
    backgroundColor: "#8b5cf6",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  emptyDayText: {
    color: "transparent",
  },
  normalDayText: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  highlightedDayText: {
    fontSize: 14,
    color: "white",
    fontWeight: "700",
  },
  predictedDayText: {
    fontSize: 14,
    color: "#be185d",
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  flowSection: {
    marginBottom: 24,
  },
  flowOptions: {
    flexDirection: "row",
    gap: 12,
  },
  flowOption: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f3f4f6",
  },
  flowOptionSelected: {
    borderColor: "#ec4899",
    backgroundColor: "#fdf2f8",
  },
  flowDots: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  flowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flowLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  moodSection: {
    marginBottom: 24,
  },
  moodOptions: {
    flexDirection: "row",
    gap: 8,
  },
  moodOption: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f3f4f6",
  },
  moodOptionSelected: {
    borderColor: "#ec4899",
    backgroundColor: "#fdf2f8",
  },
  moodLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "500",
  },
  symptomsSection: {
    marginBottom: 24,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  symptomCard: {
    width: (width - 68) / 3,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f3f4f6",
  },
  symptomCardSelected: {
    borderColor: "#ec4899",
    backgroundColor: "#fdf2f8",
  },
  symptomIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  symptomLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1f2937",
    textAlign: "center",
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1f2937",
    minHeight: 80,
    backgroundColor: "#f9fafb",
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  modalText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalButtonPrimary: {
    backgroundColor: "#ec4899",
    borderColor: "#ec4899",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  modalButtonTextPrimary: {
    color: "white",
  },
})