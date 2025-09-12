import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from "../components/Text";
const COLORS = {
  lightPink: "#f5b8d0",
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  deepBlue: "#2c2a6b",
  almostBlack: "#040707",
  white: "#ffffff",
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
  success: "#28a745",
  danger: "#dc3545",
  cream: "#faf9f7",
  softGold: "#f4f1ea",
};

const QuizSection = ({ onStartQuiz }) => {
  return (
    <LinearGradient
      colors={[COLORS.darkBlue, COLORS.mediumPink]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.discoverSection, styles.quizSectionEnhanced]}
    >
      <View style={styles.quizIconContainer}>
        <Text style={styles.quizIcon}>✨</Text>
      </View>
      <Text style={styles.discoverTitle}>
        Discover Your Perfect Routine
      </Text>
      <Text style={styles.discoverSubtitle}>
        Take our 2-min skin quiz and get personalized product
        recommendations tailored just for you
      </Text>
      <TouchableOpacity style={styles.startQuizButton} onPress={onStartQuiz}>
        <Text style={styles.startQuizText}>Start Quiz</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  discoverSection: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  discoverTitle: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  discoverSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 22,
  },
  startQuizButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  startQuizText: {
    color: COLORS.darkBlue,
    fontFamily: "Outfit-SemiBold",
    fontSize: 16,
  },
  quizArrow: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.darkBlue,
  },
  quizSectionEnhanced: {
    alignItems: "center",
    textAlign: "center",
  },
  quizIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  quizIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
});

export default QuizSection;