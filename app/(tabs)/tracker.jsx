"use client"

import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function TrackerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [symptoms, setSymptoms] = useState([])
  const [notes, setNotes] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const symptomOptions = [
    { id: "cramps", label: "Cramps", icon: "trending-down", colors: ["#ef4444", "#ec4899"] },
    { id: "bloating", label: "Bloating", icon: "water", colors: ["#3b82f6", "#06b6d4"] },
    { id: "fatigue", label: "Fatigue", icon: "flash-off", colors: ["#f59e0b", "#f97316"] },
    { id: "mood", label: "Mood Changes", icon: "sad", colors: ["#8b5cf6", "#7c3aed"] },
  ]

  const toggleSymptom = (symptomId) => {
    setSymptoms((prev) => (prev.includes(symptomId) ? prev.filter((s) => s !== symptomId) : [...prev, symptomId]))
  }

  // Mock calendar data
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
  const periodDays = [5, 6, 7, 8, 9]
  const predictedDays = [23, 24, 25, 26, 27]

  const getDayStyle = (day) => {
    if (periodDays.includes(day)) {
      return styles.periodDay
    }
    if (predictedDays.includes(day)) {
      return styles.predictedDay
    }
    if (day === 12) {
      return styles.todayDay
    }
    return styles.normalDay
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#fdf2f8", "#fce7f3", "#f3e8ff"]} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Period Tracker</Text>
            <Text style={styles.heroSubtitle}>
              Track your cycle, log symptoms, and discover patterns in your menstrual health.
            </Text>
          </View>
        </LinearGradient>

        {/* Current Cycle Info */}
        <View style={styles.section}>
          <LinearGradient colors={["#fdf2f8", "#f3e8ff", "#fce7f3"]} style={styles.cycleCard}>
            <View style={styles.cycleInfo}>
              <Text style={styles.cycleDay}>Day 12 of Cycle</Text>
              <Text style={styles.cyclePhase}>Follicular Phase • Next period: March 15, 2024</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>28</Text>
                <Text style={styles.statLabel}>Avg Cycle</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>16</Text>
                <Text style={styles.statLabel}>Days Until</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Last Period</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Calendar View */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.calendarHeader}>
              <Text style={styles.cardTitle}>
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Text>
              <View style={styles.calendarNav}>
                <TouchableOpacity style={styles.navButton}>
                  <Ionicons name="chevron-back" size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton}>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.weekDays}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <Text key={index} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day) => (
                <TouchableOpacity key={day} style={[styles.calendarDay, getDayStyle(day)]}>
                  <Text
                    style={[
                      styles.dayText,
                      periodDays.includes(day) && styles.periodDayText,
                      day === 12 && styles.todayDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#ec4899" }]} />
                <Text style={styles.legendText}>Period</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#fce7f3" }]} />
                <Text style={styles.legendText}>Predicted</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#8b5cf6" }]} />
                <Text style={styles.legendText}>Today</Text>
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

            <View style={styles.symptomsGrid}>
              {symptomOptions.map((symptom) => {
                const isSelected = symptoms.includes(symptom.id)
                return (
                  <TouchableOpacity
                    key={symptom.id}
                    style={[styles.symptomCard, isSelected && styles.symptomCardSelected]}
                    onPress={() => toggleSymptom(symptom.id)}
                  >
                    <LinearGradient colors={symptom.colors} style={styles.symptomIcon}>
                      <Ionicons name={symptom.icon} size={24} color="white" />
                    </LinearGradient>
                    <Text style={styles.symptomLabel}>{symptom.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Additional Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="How are you feeling today? Any other symptoms or notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.saveButton}>
              <LinearGradient colors={["#ec4899", "#8b5cf6"]} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Entries</Text>

            <View style={styles.entryItem}>
              <View style={styles.entryInfo}>
                <Text style={styles.entryDate}>March 11, 2024</Text>
                <View style={styles.entrySymptoms}>
                  <View style={styles.symptomBadge}>
                    <Text style={styles.symptomBadgeText}>Cramps</Text>
                  </View>
                  <View style={styles.symptomBadge}>
                    <Text style={styles.symptomBadgeText}>Fatigue</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.entryItem}>
              <View style={styles.entryInfo}>
                <Text style={styles.entryDate}>March 10, 2024</Text>
                <View style={styles.entrySymptoms}>
                  <View style={styles.symptomBadge}>
                    <Text style={styles.symptomBadgeText}>Bloating</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ec4899",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cycleCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  cycleInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  cycleDay: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  cyclePhase: {
    fontSize: 14,
    color: "#6b7280",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ec4899",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  calendarNav: {
    flexDirection: "row",
    gap: 4,
  },
  navButton: {
    padding: 8,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  weekDay: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    width: 32,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 16,
  },
  calendarDay: {
    width: (width - 72) / 7,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  normalDay: {
    backgroundColor: "transparent",
  },
  periodDay: {
    backgroundColor: "#ec4899",
  },
  predictedDay: {
    backgroundColor: "#fce7f3",
  },
  todayDay: {
    backgroundColor: "#8b5cf6",
  },
  dayText: {
    fontSize: 14,
    color: "#1f2937",
  },
  periodDayText: {
    color: "white",
  },
  todayDayText: {
    color: "white",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    marginBottom: 16,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  symptomCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f3f4f6",
    alignItems: "center",
    gap: 12,
  },
  symptomCardSelected: {
    borderColor: "#ec4899",
    backgroundColor: "#fdf2f8",
  },
  symptomIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  symptomLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1f2937",
    minHeight: 100,
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  entryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  entrySymptoms: {
    flexDirection: "row",
    gap: 8,
  },
  symptomBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  symptomBadgeText: {
    fontSize: 12,
    color: "#6b7280",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    color: "#ec4899",
    fontSize: 14,
    fontWeight: "600",
  },
})
